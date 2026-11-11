/**
 * SynergyClimate — อัปโหลดรูปจากหน้า admin.html ไปเก็บใน Google Drive
 * ---------------------------------------------------------------------------
 * ไฟล์นี้อยู่ในโปรเจกต์ Apps Script เดียวกับ Code.gs (ใช้ Web App URL เดียวกัน)
 * admin.html ย่อรูปเป็น JPEG แล้วส่งมาที่ doPost (action=upload) พร้อม "รหัสอัปโหลด"
 * สคริปต์บันทึกไฟล์ลงโฟลเดอร์ใน Drive ตั้งสิทธิ์ "ทุกคนที่มีลิงก์ดูได้" แล้วตอบลิงก์รูปกลับไป
 *
 * ความปลอดภัย: Web App เปิดให้ "ทุกคน" เรียกได้ จึงต้องมีรหัสอัปโหลด (เก็บใน Script Properties
 * ไม่อยู่ในโค้ดและไม่อยู่ในเว็บ) ตั้งรหัสจากเมนู "📧 ข่าวสาร → 4) ตั้งรหัสอัปโหลดรูป" ใน Google Sheet
 */

const UPLOAD = {
  FOLDER_NAME: 'SynergyClimate-web-images',
  MAX_BYTES: 6 * 1024 * 1024,   // ขนาดไฟล์สูงสุดหลังย่อ
  MIN_KEY_LEN: 12,
  MAX_FAILS: 10,                // ใส่รหัสผิดเกินนี้ → ล็อกชั่วคราว (กันเดารหัส)
  FAIL_WINDOW_SEC: 600,
  IMG_WIDTH: 1600,
};

function upload_(p) {
  const props = PropertiesService.getScriptProperties();
  const key = props.getProperty('UPLOAD_KEY');
  if (!key) return { ok: false, error: 'not_configured' };

  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get('upfail') || 0);
  if (fails >= UPLOAD.MAX_FAILS) return { ok: false, error: 'locked' };
  if (String(p.key || '') !== key) {
    cache.put('upfail', String(fails + 1), UPLOAD.FAIL_WINDOW_SEC);
    return { ok: false, error: 'bad_key' };
  }

  const b64 = String(p.data || '');
  if (!b64) return { ok: false, error: 'bad_image' };
  if (b64.length > UPLOAD.MAX_BYTES * 4 / 3 + 8) return { ok: false, error: 'too_large' };

  let bytes;
  try { bytes = Utilities.base64Decode(b64); } catch (err) { return { ok: false, error: 'bad_image' }; }
  // รับเฉพาะ JPEG จริง (ตรวจ magic bytes FF D8 FF) — admin.html แปลงทุกรูปเป็น JPEG ก่อนส่ง
  if (bytes.length < 4 || (bytes[0] & 0xff) !== 0xFF || (bytes[1] & 0xff) !== 0xD8 || (bytes[2] & 0xff) !== 0xFF) {
    return { ok: false, error: 'bad_image' };
  }

  const file = uploadFolder_().createFile(Utilities.newBlob(bytes, 'image/jpeg', safeName_(p.name)));
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    // บัญชีองค์กรบางแห่งห้ามแชร์ออกนอกองค์กร → รูปจะไม่แสดงบนเว็บ จึงไม่เก็บไฟล์ไว้
    file.setTrashed(true);
    return { ok: false, error: 'sharing_blocked' };
  }
  const id = file.getId();
  return { ok: true, id: id, url: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w' + UPLOAD.IMG_WIDTH };
}

function uploadFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('UPLOAD_FOLDER_ID');
  if (id) {
    try {
      const f = DriveApp.getFolderById(id);
      if (!f.isTrashed()) return f;
    } catch (err) { /* โฟลเดอร์ถูกลบ → สร้างใหม่ */ }
  }
  const folder = DriveApp.createFolder(UPLOAD.FOLDER_NAME);
  props.setProperty('UPLOAD_FOLDER_ID', folder.getId());
  return folder;
}

function safeName_(name) {
  const base = String(name || 'image').replace(/\.[^.]*$/, '').replace(/[^\w฀-๿\- ]+/g, '').trim().slice(0, 60) || 'image';
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + base + '.jpg';
}

/* เมนูใน Google Sheet: ตั้ง/เปลี่ยนรหัสอัปโหลด (ทำงานได้เฉพาะเมื่อเปิดจาก Sheet) */
function setUploadKey() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('ตั้งรหัสอัปโหลดรูป',
    'พิมพ์รหัสอย่างน้อย ' + UPLOAD.MIN_KEY_LEN + ' ตัวอักษร (ควรเป็นวลียาว เดายาก)\nผู้ดูแลเว็บจะใช้รหัสนี้ในหน้า admin.html ตอนอัปโหลดรูป\nตั้งใหม่ = รหัสเก่าใช้ไม่ได้ทันที',
    ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const key = r.getResponseText().trim();
  if (key.length < UPLOAD.MIN_KEY_LEN) { ui.alert('รหัสสั้นเกินไป (ต้องอย่างน้อย ' + UPLOAD.MIN_KEY_LEN + ' ตัวอักษร)'); return; }
  PropertiesService.getScriptProperties().setProperty('UPLOAD_KEY', key);
  const folder = uploadFolder_();
  ui.alert('ตั้งรหัสแล้ว\nรูปที่อัปโหลดจะเก็บในโฟลเดอร์ Drive: ' + folder.getName() + '\n' + folder.getUrl());
}
