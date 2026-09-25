/* ============================================================================
 *  app.js  —  ตัวสร้างหน้าเว็บจากเนื้อหาใน content.js
 *  ปกติแล้วไม่ต้องแก้ไฟล์นี้
 * ========================================================================== */
(function () {
  "use strict";
  var C = window.SYNC || {};
  var $ = function (sel) { return document.querySelector(sel); };

  /* helper: escape ป้องกันอักขระพิเศษพัง HTML */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function has(v) { return v != null && String(v).trim() !== ""; }
  function attr(url) { return esc(url); }

  /* SVG ไอคอน */
  var ICON = {
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20c8 0 16-6 16-16 0 0-14-2-16 12"/><path d="M4 20c2-6 6-9 10-11"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-2 0-3 1-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    calplus: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M12 13v5M9.5 15.5h5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>'
  };

  /* ปฏิทิน: ชื่อเดือน/วันภาษาไทย + แปลง ค.ศ.→พ.ศ. */
  var TH_MONTHS = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  var TH_MON3 = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  var TH_DOW = ["อา","จ","อ","พ","พฤ","ศ","ส"];
  function beYear(y) { return y + 543; }
  function parseISO(s) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s || ""));
    return m ? { y: +m[1], mo: +m[2] - 1, d: +m[3] } : null;
  }
  function dval(e) { return e.y * 10000 + e.mo * 100 + e.d; }

  /* --- "เพิ่มลงปฏิทิน": สร้างลิงก์ Google Calendar + ไฟล์ .ics จากกิจกรรม --- */
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function parseTime(t) {
    t = String(t || "").trim(); if (!t) return null;           // ไม่มีเวลา = ทั้งวัน
    var parts = t.split(/[–—-]/).map(function (s) { return s.trim(); }).filter(Boolean);
    function hm(s) { var m = /(\d{1,2})[:.](\d{2})/.exec(s) || /(\d{1,2})/.exec(s); return m ? { h: +m[1], m: m[2] ? +m[2] : 0 } : null; }
    var s = hm(parts[0]); if (!s) return null;
    var e = parts[1] ? hm(parts[1]) : { h: (s.h + 1) % 24, m: s.m };
    return { s: s, e: e };
  }
  function ymd(e) { return "" + e.y + p2(e.mo + 1) + p2(e.d); }
  function nextYmd(e) { var d = new Date(e.y, e.mo, e.d + 1); return "" + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()); }
  function gcalUrl(e) {
    var tp = parseTime(e.time), dates;
    if (tp) dates = ymd(e) + "T" + p2(tp.s.h) + p2(tp.s.m) + "00/" + ymd(e) + "T" + p2(tp.e.h) + p2(tp.e.m) + "00";
    else dates = ymd(e) + "/" + nextYmd(e);
    var q = "action=TEMPLATE&text=" + encodeURIComponent(e.title || "") +
      "&dates=" + dates +
      (has(e.location) ? "&location=" + encodeURIComponent(e.location) : "") +
      "&ctz=Asia/Bangkok";
    return "https://calendar.google.com/calendar/render?" + q;
  }
  function icsEsc(s) { return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  function icsText(e) {
    var tp = parseTime(e.time), dtStart, dtEnd;
    if (tp) { dtStart = "DTSTART:" + ymd(e) + "T" + p2(tp.s.h) + p2(tp.s.m) + "00"; dtEnd = "DTEND:" + ymd(e) + "T" + p2(tp.e.h) + p2(tp.e.m) + "00"; }
    else { dtStart = "DTSTART;VALUE=DATE:" + ymd(e); dtEnd = "DTEND;VALUE=DATE:" + nextYmd(e); }
    return [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SynergyClimate//Events//TH", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT", "UID:" + ymd(e) + "-" + Math.abs((e.title || "").length * 7 + e.d) + "@synergyclimate.mahidol.ac.th",
      "DTSTAMP:" + ymd({ y: new Date().getFullYear(), mo: new Date().getMonth(), d: new Date().getDate() }) + "T000000Z",
      dtStart, dtEnd, "SUMMARY:" + icsEsc(e.title),
      (has(e.location) ? "LOCATION:" + icsEsc(e.location) : ""),
      "END:VEVENT", "END:VCALENDAR"
    ].filter(Boolean).join("\r\n");
  }
  /* ไฟล์ .ics สร้างตอนคลิก (ไม่ฝังไว้ใน DOM) */
  function downloadIcs(e) {
    var blob = new Blob([icsText(e)], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "event-" + ymd(e) + ".ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }
  function addToCalHtml(e, i) {
    return '<div class="ag-cal"><span class="lbl">' + ICON.calplus + ' เพิ่มลงปฏิทิน:</span>' +
      '<a href="' + gcalUrl(e) + '" target="_blank" rel="noopener">Google</a>' +
      '<a href="#" class="ics-dl" data-ei="' + i + '">Apple / Outlook (.ics)</a>' +
      '</div>';
  }

  function thumb(url) {
    if (has(url)) return '<div class="thumb" style="background-image:url(' + attr(url) + ')"></div>';
    return '<div class="thumb placeholder">' + ICON.leaf + '</div>';
  }
  function moreLink(url, label) {
    if (!has(url)) return "";
    return '<a class="more" href="' + attr(url) + '" target="_blank" rel="noopener">' +
      esc(label || "อ่านเพิ่มเติม") + ICON.arrow + '</a>';
  }
  function emptyNote(txt) { return '<div class="empty">' + esc(txt) + '</div>'; }

  /* ---- Top bar + header ------------------------------------------------- */
  function renderChrome() {
    var s = C.site || {}, m = C.memberArea || {};
    var memberLink = (m.enabled)
      ? '<a class="tb-member" href="' + attr(m.url || "#") + '"' + (has(m.url) ? ' target="_blank" rel="noopener"' : "") + '>' + ICON.lock + esc(m.label || "สำหรับสมาชิก") + '</a>'
      : "";
    $("#topbar-slot").innerHTML =
      (has(s.email) ? '<a href="mailto:' + attr(s.email) + '">' + ICON.mail + esc(s.email) + '</a>' : "") +
      (has(s.facebook) ? '<a href="' + attr(s.facebook) + '" target="_blank" rel="noopener">' + ICON.fb + 'Facebook: Synergy Climate</a>' : "") +
      '<span class="tb-right">' + memberLink +
        (has(s.phone) ? '<span class="tb-phone">โทร. ' + esc(s.phone) + '</span>' : "") +
      '</span>';

    $("#brand-slot").innerHTML =
      '<a class="brand" href="' + attr(s.mainSite || "#") + '" title="' + esc(s.brandTh || "SynergyClimate") + '">' +
      '<img src="assets/logo-wide.png" alt="' + esc(s.brandTh || "SynergyClimate") + ' — ' + esc(s.brandEn || "") + '">' +
      '</a>';

    $("#nav-slot").innerHTML =
      '<a href="#news">ข่าวสาร</a>' +
      '<a href="#calendar">ปฏิทิน</a>' +
      '<a href="#gallery">ภาพกิจกรรม</a>' +
      '<a href="#projects">งานของเรา</a>' +
      '<a href="#research">งานวิจัย</a>' +
      '<a href="#team">ทีมงาน</a>' +
      '<a class="cta" href="#donate">ร่วมบริจาค</a>';
  }

  /* ---- Hero ------------------------------------------------------------- */
  function renderHero() {
    var h = C.hero || {};
    $("#hero-slot").innerHTML =
      '<div class="wrap">' +
        (has(h.eyebrow) ? '<div class="eyebrow">' + esc(h.eyebrow) + '</div>' : "") +
        '<h1>' + esc(h.titleTh || "") + '</h1>' +
        (has(h.subtitle) ? '<p>' + esc(h.subtitle) + '</p>' : "") +
        '<div class="hero-btns">' +
          (has(h.primaryLabel) ? '<a class="btn btn-primary" href="' + attr(h.primaryHref || "#") + '">' + esc(h.primaryLabel) + '</a>' : "") +
          (has(h.secondaryLabel) ? '<a class="btn btn-ghost" href="' + attr(h.secondaryHref || "#") + '" target="_blank" rel="noopener">' + esc(h.secondaryLabel) + '</a>' : "") +
        '</div>' +
      '</div>';
  }

  function secHead(eyebrow, title, sub) {
    return '<div class="sec-head">' +
      '<div class="eyebrow">' + esc(eyebrow) + '</div>' +
      '<h2>' + esc(title) + '</h2>' +
      (has(sub) ? '<p>' + esc(sub) + '</p>' : "") + '</div>';
  }

  /* ---- News ------------------------------------------------------------- */
  function renderNews() {
    var list = C.news || [];
    var cards = list.map(function (n) {
      return '<article class="card">' + thumb(n.image) +
        '<div class="body">' +
          '<div class="meta">' +
            (has(n.tag) ? '<span class="tag">' + esc(n.tag) + '</span>' : "") +
            (has(n.date) ? '<span>' + esc(n.date) + '</span>' : "") +
          '</div>' +
          '<h3>' + esc(n.title) + '</h3>' +
          (has(n.summary) ? '<p class="sum">' + esc(n.summary) + '</p>' : "") +
          moreLink(n.link, "อ่านเพิ่มเติม") +
        '</div></article>';
    }).join("");
    $("#news-slot").innerHTML =
      '<div class="wrap">' + secHead("News & Activities", "ข่าวสารและกิจกรรม", "ติดตามความเคลื่อนไหวล่าสุดของเรา") +
      (list.length ? '<div class="grid g3">' + cards + '</div>' : emptyNote("ยังไม่มีข่าว — เพิ่มได้ที่ content.js")) +
      '</div>';
  }

  /* ---- Projects --------------------------------------------------------- */
  function renderProjects() {
    var list = C.projects || [];
    var cards = list.map(function (p) {
      return '<article class="card">' + thumb(p.image) +
        '<div class="body">' +
          '<div class="meta">' + (has(p.status) ? '<span class="tag">' + esc(p.status) + '</span>' : "") + '</div>' +
          '<h3>' + esc(p.title) + '</h3>' +
          (has(p.summary) ? '<p class="sum">' + esc(p.summary) + '</p>' : "") +
          moreLink(p.link, "รายละเอียด") +
        '</div></article>';
    }).join("");
    $("#projects-slot").innerHTML =
      '<div class="wrap">' + secHead("Our Work", "งานของเรา / โครงการ", "โครงการและแนวทางการทำงานหลักของเรา") +
      (list.length ? '<div class="grid g3">' + cards + '</div>' : emptyNote("ยังไม่มีโครงการ — เพิ่มได้ที่ content.js")) +
      '</div>';
  }

  /* ---- Mission (พันธกิจ) -------------------------------------------------- */
  function renderMission() {
    var m = C.mission || {};
    var pillars = m.pillars || [];
    var cards = pillars.map(function (p, i) {
      var n = (i + 1 < 10 ? "0" : "") + (i + 1);
      return '<article class="card pillar">' +
        '<div class="body">' +
          '<div class="num">' + n + '</div>' +
          '<h3>' + esc(p.title || "") + '</h3>' +
          (has(p.summary) ? '<p class="sum">' + esc(p.summary) + '</p>' : "") +
        '</div></article>';
    }).join("");
    $("#mission-slot").innerHTML =
      '<div class="wrap">' + secHead("Our Mission", "พันธกิจของเรา", m.intro || "") +
      (pillars.length ? '<div class="grid g3 pillars">' + cards + '</div>' : emptyNote("ยังไม่มีข้อมูลพันธกิจ — เพิ่มได้ที่ content.js")) +
      '</div>';
  }

  /* ---- Publications ----------------------------------------------------- */
  function renderPublications() {
    var list = C.publications || [];
    var res = C.research || {};
    var rows = list.map(function (r) {
      return '<div class="pub">' +
        '<div class="yr">' + esc(r.year || "") + '</div>' +
        '<div><h3>' + esc(r.title) + '</h3>' +
          (has(r.authors) ? '<div class="aut">' + esc(r.authors) + '</div>' : "") +
          (has(r.venue) ? '<span class="venue">' + esc(r.venue) + '</span>' : "") +
        '</div>' +
        (has(r.link) ? '<a class="dl" href="' + attr(r.link) + '" target="_blank" rel="noopener">ดาวน์โหลด ' + ICON.arrow + '</a>' : "") +
        '</div>';
    }).join("");
    var murexBtn = (res.murexEnabled && has(res.murexUrl))
      ? '<div class="murex-cta"><a class="btn btn-ghost" href="' + attr(res.murexUrl) + '" target="_blank" rel="noopener">' +
          esc(res.murexLabel || "ดูผลงานวิจัยทั้งหมดบน MUREX") + ' ' + ICON.arrow + '</a></div>'
      : "";
    $("#research-slot").innerHTML =
      '<div class="wrap">' + secHead("Research & Publications", "ผลงานวิจัยและเอกสารเผยแพร่", res.intro || "งานวิจัยและรายงานที่เผยแพร่") +
      (list.length ? '<div class="stack">' + rows + '</div>' : emptyNote("ยังไม่มีเอกสาร — เพิ่มได้ที่ content.js")) +
      murexBtn +
      '</div>';
  }

  /* ---- Team ------------------------------------------------------------- */
  function teamThumb(url, pos) {
    if (!has(url)) return '<div class="thumb placeholder">' + ICON.leaf + '</div>';
    var style = 'background-image:url(' + attr(url) + ')' + (has(pos) ? ';background-position:' + attr(pos) : '');
    return '<div class="thumb" style="' + style + '"></div>';
  }
  function renderTeam() {
    var list = C.team || [];
    var cards = list.map(function (m) {
      var inner = teamThumb(m.photo, m.photoPosition) +
        '<div class="body team-body">' +
          '<h3>' + esc(m.name) + '</h3>' +
          (has(m.role) ? '<div class="role">' + esc(m.role) + '</div>' : "") +
        '</div>';
      return has(m.link)
        ? '<a class="card team-card" href="' + attr(m.link) + '" target="_blank" rel="noopener">' + inner + '</a>'
        : '<div class="card team-card">' + inner + '</div>';
    }).join("");
    $("#team-slot").innerHTML =
      '<div class="wrap">' + secHead("Our Team", "ทีมงานและบุคลากร", "") +
      (list.length ? '<div class="grid g3">' + cards + '</div>' : emptyNote("ยังไม่มีข้อมูลทีม — เพิ่มได้ที่ content.js")) +
      '</div>';
  }

  /* ---- Calendar (ปฏิทินกิจกรรม) ---------------------------------------- */
  function renderCalendar() {
    var host = $("#calendar-slot");
    var evs = (C.events || []).map(function (e) {
      var p = parseISO(e.date); if (!p) return null;
      return { y: p.y, mo: p.mo, d: p.d, time: e.time, title: e.title, location: e.location, link: e.link };
    }).filter(Boolean).sort(function (a, b) { return dval(a) - dval(b); });

    host.innerHTML =
      '<div class="wrap">' + secHead("Events", "ปฏิทินกิจกรรม", "กำหนดการกิจกรรมที่กำลังจะมาถึง") +
      (evs.length
        ? '<div class="cal-wrap"><div class="cal" id="cal-box"></div><div class="agenda" id="cal-agenda"></div></div>'
        : emptyNote("ยังไม่มีกิจกรรม — เพิ่มได้ที่ content.js")) +
      '</div>';
    if (!evs.length) return;

    var today = new Date();
    var tv = today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate();
    // เลือกเดือนเริ่มต้น: เดือนปัจจุบันถ้ามีกิจกรรม, ไม่งั้นเดือนของกิจกรรมถัดไป, ไม่งั้นเดือนล่าสุด
    var view;
    var inCur = evs.filter(function (e) { return e.y === today.getFullYear() && e.mo === today.getMonth(); });
    var upcoming = evs.filter(function (e) { return dval(e) >= tv; });
    if (inCur.length) view = { y: today.getFullYear(), mo: today.getMonth() };
    else if (upcoming.length) view = { y: upcoming[0].y, mo: upcoming[0].mo };
    else view = { y: evs[evs.length - 1].y, mo: evs[evs.length - 1].mo };

    function draw() {
      var monthEvents = evs.filter(function (e) { return e.y === view.y && e.mo === view.mo; });
      var byDay = {}; monthEvents.forEach(function (e) { (byDay[e.d] = byDay[e.d] || []).push(e); });

      var firstDow = new Date(view.y, view.mo, 1).getDay();
      var daysIn = new Date(view.y, view.mo + 1, 0).getDate();
      var cells = "";
      for (var b = 0; b < firstDow; b++) cells += '<span class="cal-day blank"></span>';
      for (var d = 1; d <= daysIn; d++) {
        var isToday = (view.y === today.getFullYear() && view.mo === today.getMonth() && d === today.getDate());
        var ev = byDay[d];
        cells += '<button class="cal-day' + (ev ? " has-event" : "") + (isToday ? " today" : "") + '"' +
          (ev ? ' data-day="' + d + '"' : ' disabled') + '><span>' + d + '</span>' + (ev ? '<i class="dot"></i>' : "") + '</button>';
      }
      var grid =
        '<div class="cal-head">' +
          '<button class="cal-nav" data-dir="-1" aria-label="เดือนก่อนหน้า">‹</button>' +
          '<b>' + TH_MONTHS[view.mo] + " " + beYear(view.y) + '</b>' +
          '<button class="cal-nav" data-dir="1" aria-label="เดือนถัดไป">›</button>' +
        '</div>' +
        '<div class="cal-dow">' + TH_DOW.map(function (x) { return "<span>" + x + "</span>"; }).join("") + '</div>' +
        '<div class="cal-grid-days">' + cells + '</div>';

      var agenda = monthEvents.length
        ? monthEvents.map(function (e, i) {
            return '<div class="ag-item" data-day="' + e.d + '">' +
              '<div class="ag-date"><b>' + e.d + '</b><span>' + TH_MON3[e.mo] + '</span></div>' +
              '<div class="ag-body"><h4>' + esc(e.title) + '</h4>' +
                '<div class="ag-meta">' +
                  (has(e.time) ? ICON.clock + " " + esc(e.time) + "&nbsp;&nbsp;" : "") +
                  (has(e.location) ? ICON.pin + " " + esc(e.location) : "") +
                '</div>' +
                moreLink(e.link, "รายละเอียด") +
                addToCalHtml(e, i) +
              '</div></div>';
          }).join("")
        : emptyNote("ไม่มีกิจกรรมในเดือนนี้");

      $("#cal-box").innerHTML = grid;
      $("#cal-agenda").innerHTML = agenda;

      host.querySelectorAll(".cal-nav").forEach(function (btn) {
        btn.addEventListener("click", function () {
          view.mo += +btn.getAttribute("data-dir");
          if (view.mo < 0) { view.mo = 11; view.y--; }
          if (view.mo > 11) { view.mo = 0; view.y++; }
          draw();
        });
      });
      host.querySelectorAll(".cal-day.has-event").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var day = +btn.getAttribute("data-day");
          host.querySelectorAll(".cal-day").forEach(function (x) { x.classList.remove("sel"); });
          btn.classList.add("sel");
          var hit = null;
          host.querySelectorAll(".ag-item").forEach(function (x) {
            var on = +x.getAttribute("data-day") === day;
            x.classList.toggle("hi", on); if (on && !hit) hit = x;
          });
          if (hit) hit.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      });
      host.querySelectorAll(".ics-dl").forEach(function (a) {
        a.addEventListener("click", function (ev) {
          ev.preventDefault();
          downloadIcs(monthEvents[+a.getAttribute("data-ei")]);
        });
      });
    }
    draw();
  }

  /* ---- Gallery (ภาพกิจกรรม) + Lightbox --------------------------------- */
  function renderGallery() {
    var list = C.gallery || [];
    var cells = list.map(function (g, i) {
      var isImg = has(g.image);
      return '<button class="gphoto' + (isImg ? "" : " placeholder") + '"' +
        (isImg ? ' style="background-image:url(' + attr(g.image) + ')" data-i="' + i + '"' : ' disabled') +
        ' aria-label="' + esc(g.caption || "รูปกิจกรรม") + '">' +
        (isImg ? "" : ICON.leaf) +
        (has(g.caption) ? '<span class="gcap">' + esc(g.caption) + '</span>' : "") +
        '</button>';
    }).join("");
    $("#gallery-slot").innerHTML =
      '<div class="wrap">' + secHead("Gallery", "ภาพกิจกรรม", "บันทึกภาพกิจกรรมและการลงพื้นที่ของเรา") +
      (list.length ? '<div class="gallery-grid">' + cells + '</div>' : emptyNote("ยังไม่มีรูป — เพิ่มได้ที่ content.js")) +
      '</div>';
    wireLightbox(list);
  }

  function wireLightbox(list) {
    var photos = [];
    (list || []).forEach(function (g, i) { if (has(g.image)) photos.push({ image: g.image, caption: g.caption, orig: i }); });
    if (!photos.length) return;

    var lb = document.getElementById("lightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "lightbox"; lb.className = "lightbox";
      lb.innerHTML =
        '<button class="lb-close" aria-label="ปิด">&times;</button>' +
        '<button class="lb-nav lb-prev" aria-label="ก่อนหน้า">‹</button>' +
        '<figure class="lb-fig"><img alt=""><figcaption></figcaption></figure>' +
        '<button class="lb-nav lb-next" aria-label="ถัดไป">›</button>';
      document.body.appendChild(lb);
    }
    lb.classList.toggle("single", photos.length < 2);
    var imgEl = lb.querySelector("img"), capEl = lb.querySelector("figcaption");
    var cur = 0;
    function show(i) {
      cur = (i + photos.length) % photos.length;
      imgEl.src = photos[cur].image; imgEl.alt = photos[cur].caption || "";
      capEl.textContent = photos[cur].caption || "";
      lb.classList.add("open");
    }
    function close() { lb.classList.remove("open"); imgEl.src = ""; }

    lb.querySelector(".lb-close").onclick = close;
    lb.querySelector(".lb-prev").onclick = function () { show(cur - 1); };
    lb.querySelector(".lb-next").onclick = function () { show(cur + 1); };
    lb.onclick = function (e) { if (e.target === lb) close(); };
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(cur - 1);
      else if (e.key === "ArrowRight") show(cur + 1);
    });
    document.querySelectorAll("#gallery-slot .gphoto[data-i]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var oi = +btn.getAttribute("data-i");
        for (var k = 0; k < photos.length; k++) { if (photos[k].orig === oi) { show(k); break; } }
      });
    });
  }

  /* ---- Donate ----------------------------------------------------------- */
  function renderDonate() {
    var d = C.donate || {};
    var methods = (d.methods || []).map(function (m) {
      return '<div class="dmethod">' +
        '<div class="lbl">' + esc(m.label) + '</div>' +
        '<div class="val">' + esc(m.value) + '</div>' +
        (has(m.note) ? '<div class="nt">' + esc(m.note) + '</div>' : "") +
        '</div>';
    }).join("");
    var qr = has(d.qrImage)
      ? '<div class="qr" style="background-image:url(' + attr(d.qrImage) + ')"></div>'
      : '<div class="qr">พื้นที่สำหรับ QR พร้อมเพย์<br>(ใส่ลิงก์รูปใน content.js)</div>';
    $("#donate-slot").innerHTML =
      '<div class="wrap">' +
        '<div class="donate-wrap">' +
          '<div class="donate-info">' +
            '<h2>ร่วมสนับสนุนเรา</h2>' +
            (has(d.intro) ? '<p class="lead">' + esc(d.intro) + '</p>' : "") +
            methods +
          '</div>' +
          '<div class="donate-side">' + qr +
            (has(d.officialHref)
              ? '<a class="btn btn-primary" href="' + attr(d.officialHref) + '" target="_blank" rel="noopener">' + esc(d.officialLabel || "บริจาค") + '</a>'
              : (has(d.officialLabel) ? '<div style="color:var(--muted);font-size:14px">' + esc(d.officialLabel) + '</div>' : "")) +
          '</div>' +
        '</div>' +
        (has(d.note) ? '<div class="donate-note">' + esc(d.note) + '</div>' : "") +
      '</div>';
  }

  /* ---- Newsletter (สมัครรับข่าวสาร) ------------------------------------ */
  function renderNewsletter() {
    var n = C.newsletter || {};
    var host = $("#newsletter-slot");
    if (!host) return;
    if (!n.enabled) { host.parentNode.style.display = "none"; return; }
    host.innerHTML =
      '<div class="wrap"><div class="nl-card">' +
        '<div class="nl-text"><h2>' + esc(n.title || "รับข่าวสารจากเรา") + '</h2>' +
          (has(n.subtitle) ? '<p>' + esc(n.subtitle) + '</p>' : "") + '</div>' +
        '<form class="nl-form" id="nl-form"' +
          (has(n.actionUrl) ? ' action="' + attr(n.actionUrl) + '" method="post" target="_blank"' : "") + '>' +
          '<input type="email" name="' + esc(n.emailField || "email") + '" required placeholder="อีเมลของคุณ" aria-label="อีเมล">' +
          '<button type="submit">' + esc(n.buttonLabel || "สมัครรับข่าวสาร") + '</button>' +
        '</form>' +
        (has(n.note) ? '<div class="nl-note">' + esc(n.note) + '</div>' : "") +
        '<div class="nl-msg" id="nl-msg" role="status"></div>' +
      '</div></div>';

    var form = document.getElementById("nl-form"), msg = document.getElementById("nl-msg");
    form.addEventListener("submit", function (e) {
      if (!has(n.actionUrl)) {
        e.preventDefault();
        msg.textContent = "(ผู้ดูแล: ยังไม่ได้ตั้งค่า actionUrl ใน content.js — ดูวิธีใน README)";
        return;
      }
      msg.textContent = "ขอบคุณที่สมัคร! โปรดตรวจสอบอีเมลเพื่อยืนยันการสมัคร";
    });
  }

  /* ---- Footer ----------------------------------------------------------- */
  function renderFooter() {
    var s = C.site || {};
    var links = (C.footerLinks || []).map(function (l) {
      return '<a href="' + attr(l.href) + '">' + esc(l.label) + '</a>';
    }).join("");
    $("#footer-slot").innerHTML =
      '<div class="wrap"><div class="foot-grid">' +
        '<div>' +
          '<a class="brand" href="' + attr(s.mainSite || "#") + '">' +
          '<img src="assets/logo-wide.png" alt="SynergyClimate">' +
          '</a>' +
          '<div class="foot-contact">' + esc(s.brandEn || "") + '</div>' +
        '</div>' +
        '<div><h4>เมนู</h4>' + links + '</div>' +
        '<div><h4>ติดต่อ</h4><div class="foot-contact">' +
          (has(s.address) ? esc(s.address) + '<br>' : "") +
          (has(s.phone) ? 'โทร. ' + esc(s.phone) + '<br>' : "") +
          (has(s.email) ? '<a href="mailto:' + attr(s.email) + '" style="display:inline">' + esc(s.email) + '</a>' : "") +
        '</div></div>' +
      '</div>' +
      '<div class="foot-bottom">' +
        '<span>© ' + new Date().getFullYear() + ' SynergyClimate, Mahidol University</span>' +
        (has(s.updated) ? '<span>อัปเดตล่าสุด: ' + esc(s.updated) + '</span>' : "") +
      '</div></div>';
  }

  /* ---- Mobile nav toggle ------------------------------------------------ */
  function wireNav() {
    var btn = $("#nav-toggle"), nav = $("#nav-slot");
    if (btn && nav) {
      btn.addEventListener("click", function () { nav.classList.toggle("open"); });
      nav.addEventListener("click", function (e) {
        if (e.target.tagName === "A") nav.classList.remove("open");
      });
    }
  }

  /* ---- เพลงประกอบเว็บ -----------------------------------------------------
   * พยายามเล่นทันทีที่เข้าเว็บ (ค่อย ๆ ไล่เสียงจาก 0 ขึ้นไปที่ 0.4 แบบเบา ๆ)
   * หมายเหตุ: เบราว์เซอร์ (Chrome/Safari ฯลฯ) บล็อกเสียง autoplay ที่ยังไม่ได้
   * mute ไว้เสมอ ถ้าเป็นการเข้าเว็บครั้งแรกและยังไม่มีการโต้ตอบใด ๆ กับหน้าเว็บ
   * เพลงจะยังไม่ดังทันที แต่จะเริ่มเล่นทันทีที่ผู้ชม "แตะ/คลิก/กดปุ่มใดก็ได้"
   * เป็นครั้งแรก (ซึ่งมักเกิดขึ้นเร็วมากอยู่แล้ว) — ปุ่มโน้ตดนตรีมุมขวาล่าง
   * ยังใช้เปิด/ปิดเองได้เสมอ
   * -------------------------------------------------------------------- */
  function wireBgm() {
    var audio = $("#bgm-audio"), btn = $("#bgm-toggle");
    if (!audio || !btn) return;
    var TARGET_VOL = 0.4;
    var fadeTimer = null;
    audio.volume = 0;

    function fadeTo(vol, ms) {
      if (fadeTimer) clearInterval(fadeTimer);
      var steps = 20, i = 0, start = audio.volume, delta = vol - start;
      fadeTimer = setInterval(function () {
        i++;
        audio.volume = Math.max(0, Math.min(1, start + delta * (i / steps)));
        if (i >= steps) clearInterval(fadeTimer);
      }, ms / steps);
    }
    function setState(playing) {
      btn.classList.toggle("is-playing", playing);
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
      btn.title = playing ? "ปิดเพลงประกอบเว็บ" : "เปิดเพลงประกอบเว็บ";
    }
    function startPlayback() {
      if (!audio.paused) return;
      audio.play().then(function () {
        fadeTo(TARGET_VOL, 1800);
        setState(true);
      }).catch(function () {
        /* ถูกบล็อกโดยเบราว์เซอร์ — จะลองใหม่อัตโนมัติทันทีที่มีการโต้ตอบครั้งแรก */
      });
    }

    // 1) ลองเล่นทันทีที่หน้าเว็บโหลดเสร็จ
    startPlayback();

    // 2) ถ้าโดนบล็อก ให้ลองอีกครั้งทันทีที่ผู้ชมโต้ตอบกับหน้าเว็บเป็นครั้งแรก
    var kick = ["click", "touchstart", "keydown"];
    function onFirstInteract() {
      startPlayback();
      kick.forEach(function (ev) { document.removeEventListener(ev, onFirstInteract); });
    }
    kick.forEach(function (ev) { document.addEventListener(ev, onFirstInteract, { passive: true, once: true }); });

    // 3) ปุ่มมุมขวาล่าง ไว้ปิด/เปิดเองได้เสมอ
    btn.addEventListener("click", function () {
      if (audio.paused) {
        startPlayback();
      } else {
        fadeTo(0, 400);
        setTimeout(function () { audio.pause(); setState(false); }, 420);
      }
    });
  }

  /* ---- Boot ------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (!window.SYNC) { console.error("ไม่พบ content.js"); return; }
    renderChrome(); renderHero(); renderNews(); renderMission(); renderCalendar(); renderNewsletter();
    renderGallery(); renderProjects(); renderPublications(); renderTeam();
    renderDonate(); renderFooter(); wireNav(); wireBgm();
  });
})();
