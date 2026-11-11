/**
 * SynergyClimate — ระบบสมัครรับข่าวสาร (Newsletter) บน Google Apps Script
 * ---------------------------------------------------------------------------
 * ทำอะไร:
 *   1) รับอีเมลจากฟอร์มหน้าเว็บ (doPost) → บันทึกลงแผ่นงาน "Subscribers" สถานะ pending
 *   2) ส่งอีเมลยืนยัน (double opt-in) → กดลิงก์แล้วสถานะเป็น active
 *   3) ทุกอีเมลมีลิงก์ยกเลิกรับข่าว (unsubscribe)
 *   4) เมนู "📧 ข่าวสาร" ใน Google Sheet สำหรับส่งข่าวถึงสมาชิกที่ active
 *   5) รับรูปที่อัปโหลดจาก admin.html ไปเก็บใน Google Drive (โค้ดอยู่ใน Upload.gs)
 *
 * วิธีติดตั้ง: ดู README-วิธีอัปเดต.md หัวข้อ 6
 * สคริปต์นี้ต้อง "ผูกกับ Google Sheet" (เปิดจาก Sheet → ส่วนขยาย → Apps Script)
 *
 * หมายเหตุความปลอดภัย: ฟังก์ชันที่ลงท้ายด้วย _ เป็นฟังก์ชันภายใน เรียกจากภายนอกไม่ได้
 * ฟังก์ชันเมนู (ส่งข่าว) เปิดกล่องยืนยันก่อนเสมอ จึงทำงานได้เฉพาะเมื่อเปิดจาก Sheet เท่านั้น
 */

const CONFIG = {
  SITE_NAME: 'SynergyClimate',
  SENDER_NAME: 'SynergyClimate',
  SHEET_SUBSCRIBERS: 'Subscribers',
  SHEET_COMPOSE: 'Compose',
  SHEET_LOG: 'SendLog',
  RESEND_COOLDOWN_MIN: 60,   // ส่งอีเมลยืนยันซ้ำให้อีเมลเดิมได้ไม่ถี่กว่านี้ (กันสแปม/กันโควตาหมด)
  QUOTA_RESERVE: 5,          // เหลือโควตาอีเมลไว้อย่างน้อยเท่านี้เสมอ
};

const COL = { TS: 1, EMAIL: 2, STATUS: 3, TOKEN: 4, CONSENT_AT: 5, CONFIRMED_AT: 6, UNSUB_AT: 7, LAST_MAIL_AT: 8, LAST_CAMPAIGN: 9 };
const HEADERS = ['timestamp', 'email', 'status', 'token', 'consentAt', 'confirmedAt', 'unsubscribedAt', 'lastMailAt', 'lastCampaign'];

/* ============================ Web App ==================================== */

function doPost(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'upload') return json_(upload_(p));   // อัปโหลดรูปจาก admin.html (ดู Upload.gs)

    // honeypot: ช่องซ่อนที่คนจริงไม่กรอก ถ้ามีค่า = บอต → ตอบเหมือนสำเร็จแต่ไม่บันทึก
    if (p.website) return json_({ ok: true });

    const email = String(p.email || '').trim().toLowerCase();
    if (!isEmail_(email)) return json_({ ok: false, error: 'invalid_email' });
    if (p.consent !== 'yes') return json_({ ok: false, error: 'consent_required' });

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      return json_(subscribe_(email));
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const token = String(p.token || '');
  try {
    if (p.action === 'confirm' && token) return confirmPage_(token);
    if (p.action === 'unsubscribe' && token) return unsubscribePage_(token, p.go === '1');
  } catch (err) {
    console.error(err);
    return page_('เกิดข้อผิดพลาด', 'ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งภายหลัง');
  }
  return page_(CONFIG.SITE_NAME, 'ระบบสมัครรับข่าวสารทำงานอยู่');
}

/* ============================ Core logic ================================= */

function subscribe_(email) {
  const sh = sheet_();
  const now = new Date();
  const row = findRow_(sh, COL.EMAIL, email);

  // คำตอบเหมือนกันทุกกรณี เพื่อไม่ให้ใครใช้ฟอร์มตรวจได้ว่าอีเมลไหนเป็นสมาชิกอยู่แล้ว
  const OK = { ok: true };

  if (row) {
    const v = sh.getRange(row, 1, 1, HEADERS.length).getValues()[0];
    const status = v[COL.STATUS - 1];
    if (status === 'active') return OK;

    const last = v[COL.LAST_MAIL_AT - 1];
    const cooling = last instanceof Date && (now - last) < CONFIG.RESEND_COOLDOWN_MIN * 60000;
    sh.getRange(row, COL.STATUS).setValue('pending');
    sh.getRange(row, COL.CONSENT_AT).setValue(now);
    if (cooling) return OK;
    if (!hasQuota_(1)) return { ok: false, error: 'mail_quota' };
    sendConfirmMail_(email, v[COL.TOKEN - 1]);
    sh.getRange(row, COL.LAST_MAIL_AT).setValue(now);
    return OK;
  }

  const token = newToken_();
  const canMail = hasQuota_(1);
  sh.appendRow([now, email, 'pending', token, now, '', '', canMail ? now : '', '']);
  if (!canMail) return { ok: false, error: 'mail_quota' };
  sendConfirmMail_(email, token);
  return OK;
}

function confirmPage_(token) {
  const sh = sheet_();
  const row = findRow_(sh, COL.TOKEN, token);
  if (!row) return page_('ลิงก์ไม่ถูกต้อง', 'ไม่พบข้อมูลการสมัครนี้ อาจถูกยกเลิกไปแล้ว หรือลิงก์ไม่ครบถ้วน');
  const status = sh.getRange(row, COL.STATUS).getValue();
  if (status === 'unsubscribed') {
    return page_('ยกเลิกรับข่าวสารไปแล้ว', 'อีเมลนี้ยกเลิกรับข่าวสารไปแล้ว หากต้องการรับอีกครั้ง กรุณาสมัครใหม่ที่หน้าเว็บ');
  }
  if (status !== 'active') {
    sh.getRange(row, COL.STATUS).setValue('active');
    sh.getRange(row, COL.CONFIRMED_AT).setValue(new Date());
  }
  return page_('ยืนยันการสมัครเรียบร้อย ✓', 'ขอบคุณที่ติดตาม ' + CONFIG.SITE_NAME + ' — คุณจะได้รับข่าวสารและกิจกรรมสำคัญทางอีเมลนี้');
}

// ยกเลิกแบบ 2 ขั้น: เปิดลิงก์ → กดปุ่มยืนยัน
// (ระบบสแกนลิงก์ของผู้ให้บริการอีเมลมักเปิดลิงก์ล่วงหน้า ถ้ายกเลิกทันทีจะมีคนถูกยกเลิกโดยไม่ตั้งใจ)
function unsubscribePage_(token, go) {
  const sh = sheet_();
  const row = findRow_(sh, COL.TOKEN, token);
  if (!row) return page_('ลิงก์ไม่ถูกต้อง', 'ไม่พบข้อมูลการสมัครนี้');
  if (!go) {
    const url = webAppUrl_() + '?action=unsubscribe&go=1&token=' + encodeURIComponent(token);
    return page_('ยกเลิกรับข่าวสาร?', 'กดปุ่มด้านล่างเพื่อยืนยันการยกเลิกรับข่าวสารจาก ' + CONFIG.SITE_NAME, { label: 'ยืนยันการยกเลิก', url: url });
  }
  if (sh.getRange(row, COL.STATUS).getValue() !== 'unsubscribed') {
    sh.getRange(row, COL.STATUS).setValue('unsubscribed');
    sh.getRange(row, COL.UNSUB_AT).setValue(new Date());
  }
  return page_('ยกเลิกรับข่าวสารแล้ว', 'เราจะไม่ส่งอีเมลถึงคุณอีก ขอบคุณที่เคยติดตาม ' + CONFIG.SITE_NAME);
}

/* ============================ Email ====================================== */

function sendConfirmMail_(email, token) {
  const base = webAppUrl_();
  const confirmUrl = base + '?action=confirm&token=' + encodeURIComponent(token);
  const unsubUrl = base + '?action=unsubscribe&token=' + encodeURIComponent(token);
  const subject = 'ยืนยันการสมัครรับข่าวสาร ' + CONFIG.SITE_NAME;
  const text =
    'ขอบคุณที่สนใจรับข่าวสารจาก ' + CONFIG.SITE_NAME + '\n\n' +
    'กรุณากดลิงก์นี้เพื่อยืนยันการสมัคร:\n' + confirmUrl + '\n\n' +
    'หากคุณไม่ได้สมัคร ไม่ต้องทำอะไร เราจะไม่ส่งข่าวสารให้จนกว่าจะมีการยืนยัน\n' +
    'ยกเลิก: ' + unsubUrl;
  const html =
    '<div style="font-family:sans-serif;font-size:15px;line-height:1.7;color:#1c3b40;max-width:520px">' +
    '<p>ขอบคุณที่สนใจรับข่าวสารจาก <b>' + escHtml_(CONFIG.SITE_NAME) + '</b></p>' +
    '<p><a href="' + confirmUrl + '" style="display:inline-block;background:#0a7286;color:#fff;padding:11px 22px;border-radius:8px;text-decoration:none">ยืนยันการสมัครรับข่าวสาร</a></p>' +
    '<p style="font-size:13px;color:#667">หากคุณไม่ได้สมัคร ไม่ต้องทำอะไร เราจะไม่ส่งข่าวสารให้จนกว่าจะมีการยืนยัน · ' +
    '<a href="' + unsubUrl + '" style="color:#667">ยกเลิก</a></p></div>';
  MailApp.sendEmail({ to: email, subject: subject, body: text, htmlBody: html, name: CONFIG.SENDER_NAME });
}

/* ==================== เมนูใน Google Sheet: ส่งข่าว ======================= */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('📧 ข่าวสาร')
    .addItem('1) ตั้งค่าแผ่นงาน (ทำครั้งแรก)', 'setupSheets')
    .addItem('2) ส่งทดสอบถึงตัวเอง', 'sendTestToMe')
    .addItem('3) ส่งข่าวถึงสมาชิกทั้งหมด', 'sendNewsletterToAll')
    .addSeparator()
    .addItem('4) ตั้งรหัสอัปโหลดรูป (สำหรับ admin.html)', 'setUploadKey')
    .addToUi();
}

function setupSheets() {
  sheet_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let c = ss.getSheetByName(CONFIG.SHEET_COMPOSE);
  if (!c) {
    c = ss.insertSheet(CONFIG.SHEET_COMPOSE);
    c.getRange('A1:B2').setValues([['หัวข้ออีเมล', ''], ['เนื้อหา (พิมพ์ข้อความธรรมดา ขึ้นบรรทัดใหม่ได้ ลิงก์ https:// จะกดได้อัตโนมัติ)', '']]);
    c.setColumnWidth(1, 220); c.setColumnWidth(2, 640);
    c.getRange('A1:A2').setFontWeight('bold').setVerticalAlignment('top').setWrap(true);
    c.getRange('B2').setWrap(true).setVerticalAlignment('top');
    c.setRowHeight(2, 320);
  }
  if (!ss.getSheetByName(CONFIG.SHEET_LOG)) {
    ss.insertSheet(CONFIG.SHEET_LOG).appendRow(['sentAt', 'campaign', 'subject', 'sent', 'remainingAfter']);
  }
}

function sendTestToMe() {
  const ui = SpreadsheetApp.getUi();   // ใช้ได้เฉพาะเมื่อเปิดจาก Sheet
  const d = readDraft_();
  if (!d) return;
  const me = Session.getActiveUser().getEmail();
  sendCampaignMail_(me, d, webAppUrl_() + '?action=unsubscribe&token=TEST');
  ui.alert('ส่งอีเมลทดสอบไปที่ ' + me + ' แล้ว (ลิงก์ยกเลิกในฉบับทดสอบใช้งานไม่ได้)');
}

function sendNewsletterToAll() {
  const ui = SpreadsheetApp.getUi();   // ใช้ได้เฉพาะเมื่อเปิดจาก Sheet
  const d = readDraft_();
  if (!d) return;

  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) { ui.alert('ยังไม่มีสมาชิก'); return; }
  const rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  const campaign = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') + ' | ' + d.subject;

  // ส่งเฉพาะ active ที่ยังไม่ได้รับข่าวฉบับนี้ (ถ้ารันค้าง/หมดเวลา กดส่งซ้ำได้ ไม่ส่งซ้ำคนเดิม)
  const targets = [];
  rows.forEach(function (v, i) {
    if (v[COL.STATUS - 1] === 'active' && v[COL.LAST_CAMPAIGN - 1] !== campaign) targets.push({ row: i + 2, email: v[COL.EMAIL - 1], token: v[COL.TOKEN - 1] });
  });
  if (!targets.length) { ui.alert('ไม่มีผู้รับ (สมาชิกทุกคนได้รับข่าวฉบับนี้แล้ว หรือยังไม่มีสมาชิกที่ยืนยัน)'); return; }

  const quota = MailApp.getRemainingDailyQuota() - CONFIG.QUOTA_RESERVE;
  const n = Math.min(targets.length, Math.max(quota, 0));
  if (n <= 0) { ui.alert('โควตาอีเมลของวันนี้หมดแล้ว กรุณาลองใหม่พรุ่งนี้'); return; }

  const msg = 'หัวข้อ: ' + d.subject + '\nผู้รับ: ' + n + ' คน' +
    (n < targets.length ? '\n(โควตาวันนี้ไม่พอ เหลืออีก ' + (targets.length - n) + ' คน — กดส่งซ้ำพรุ่งนี้ ระบบจะส่งเฉพาะคนที่ยังไม่ได้รับ)' : '') +
    '\n\nยืนยันการส่ง? (ส่งแล้วเรียกคืนไม่ได้)';
  if (ui.alert('ส่งข่าวถึงสมาชิก', msg, ui.ButtonSet.OK_CANCEL) !== ui.Button.OK) return;

  const base = webAppUrl_();
  const started = Date.now();
  let sent = 0;
  for (let i = 0; i < n; i++) {
    if (Date.now() - started > 5 * 60 * 1000) break;   // กันชนขีดจำกัดเวลา 6 นาทีของ Apps Script
    const t = targets[i];
    try {
      sendCampaignMail_(t.email, d, base + '?action=unsubscribe&token=' + encodeURIComponent(t.token));
      sh.getRange(t.row, COL.LAST_CAMPAIGN).setValue(campaign);
      sh.getRange(t.row, COL.LAST_MAIL_AT).setValue(new Date());
      sent++;
    } catch (err) {
      console.error(t.email + ': ' + err);
    }
  }
  const log = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_LOG);
  if (log) log.appendRow([new Date(), campaign, d.subject, sent, MailApp.getRemainingDailyQuota()]);
  ui.alert('ส่งแล้ว ' + sent + ' จาก ' + targets.length + ' คน' + (sent < targets.length ? '\nกดเมนูส่งอีกครั้งเพื่อส่งให้คนที่เหลือ' : ''));
}

function readDraft_() {
  const ui = SpreadsheetApp.getUi();
  const c = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_COMPOSE);
  if (!c) { ui.alert('ยังไม่มีแผ่นงาน Compose — กดเมนู "ตั้งค่าแผ่นงาน" ก่อน'); return null; }
  const subject = String(c.getRange('B1').getValue()).trim();
  const body = String(c.getRange('B2').getValue()).trim();
  if (!subject || !body) { ui.alert('กรุณากรอกหัวข้อ (B1) และเนื้อหา (B2) ในแผ่นงาน Compose'); return null; }
  return { subject: subject, body: body };
}

function sendCampaignMail_(email, d, unsubUrl) {
  const bodyHtml = escHtml_(d.body)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .replace(/\n/g, '<br>');
  const html =
    '<div style="font-family:sans-serif;font-size:15px;line-height:1.7;color:#1c3b40;max-width:600px">' + bodyHtml +
    '<hr style="border:0;border-top:1px solid #dde;margin:26px 0 12px">' +
    '<p style="font-size:12.5px;color:#778">คุณได้รับอีเมลนี้เพราะสมัครรับข่าวสารจาก ' + escHtml_(CONFIG.SITE_NAME) +
    ' · <a href="' + unsubUrl + '" style="color:#778">ยกเลิกรับข่าวสาร</a></p></div>';
  const text = d.body + '\n\n—\nยกเลิกรับข่าวสาร: ' + unsubUrl;
  MailApp.sendEmail({ to: email, subject: d.subject, body: text, htmlBody: html, name: CONFIG.SENDER_NAME });
}

/* ============================ Helpers ==================================== */

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.SHEET_SUBSCRIBERS);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.SHEET_SUBSCRIBERS);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function findRow_(sh, col, value) {
  const last = sh.getLastRow();
  if (last < 2 || !value) return 0;
  const hit = sh.getRange(2, col, last - 1, 1).createTextFinder(String(value)).matchEntireCell(true).matchCase(true).findNext();
  return hit ? hit.getRow() : 0;
}

function isEmail_(s) {
  // ต้องขึ้นต้นด้วยตัวอักษร/ตัวเลข (กันค่าที่ Sheet ตีความเป็นสูตร เช่น =, +, -, @)
  return s.length <= 254 && /^[a-z0-9][a-z0-9._%+\-]*@[a-z0-9][a-z0-9.\-]*\.[a-z]{2,}$/.test(s);
}

function hasQuota_(n) { return MailApp.getRemainingDailyQuota() - CONFIG.QUOTA_RESERVE >= n; }
function newToken_() { return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ''); }
function webAppUrl_() { return ScriptApp.getService().getUrl(); }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function escHtml_(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function page_(title, message, button) {
  const html =
    '<div style="font-family:sans-serif;max-width:480px;margin:12vh auto;padding:0 20px;text-align:center;color:#1c3b40">' +
    '<h1 style="font-size:24px;color:#0a7286">' + escHtml_(title) + '</h1>' +
    '<p style="font-size:16px;line-height:1.7">' + escHtml_(message) + '</p>' +
    (button ? '<p><a target="_top" href="' + escHtml_(button.url) + '" style="display:inline-block;margin-top:10px;background:#0a7286;color:#fff;padding:11px 22px;border-radius:8px;text-decoration:none">' + escHtml_(button.label) + '</a></p>' : '') +
    '</div>';
  return HtmlService.createHtmlOutput(html).setTitle(title + ' — ' + CONFIG.SITE_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
