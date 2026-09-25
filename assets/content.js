/* ============================================================================
 *  content.js  —  ไฟล์เนื้อหาของเว็บ SynergyClimate
 *  ไฟล์นี้สร้าง/อัปเดตโดยเครื่องมือ admin.html — แก้ต่อผ่านฟอร์มได้เสมอ
 *  (หรือจะแก้ในไฟล์นี้ตรง ๆ ก็ได้ตามคู่มือ README-วิธีอัปเดต.md)
 * ========================================================================== */

window.SYNC = {

  site: {
    brandTh: "SynergyClimate",
    brandEn: "Southeast Asia Innovation Hub",
    mainSite: "https://synergyclimate.mahidol.ac.th",
    email: "sync@mahidol.ac.th",
    facebook: "https://www.facebook.com/profile.php?id=61570212911586",
    phone: "034 585 058",
    address: "มหาวิทยาลัยมหิดล วิทยาเขตกาญจนบุรี 199 หมู่ 9 ตำบลลุ่มสุ่ม อำเภอไทรโยค จังหวัดกาญจนบุรี 71150",
    updated: "28 สิงหาคม 2569",
  },

  memberArea: {
    enabled: true,
    label: "สำหรับสมาชิก",
    url: "",
  },

  hero: {
    eyebrow: "SYNERGY CLIMATE · MAHIDOL UNIVERSITY",
    titleTh: "ศูนย์รวมข่าวสารและงานของเรา",
    subtitle: "ติดตามความเคลื่อนไหว โครงการวิจัย และกิจกรรมด้านการปรับตัวต่อการเปลี่ยนแปลงสภาพภูมิอากาศในภูมิภาคเอเชียตะวันออกเฉียงใต้",
    primaryLabel: "ร่วมสนับสนุนเรา",
    primaryHref: "#donate",
    secondaryLabel: "ติดตามบน Facebook",
    secondaryHref: "https://www.facebook.com/profile.php?id=61570212911586",
  },

  mission: {
    intro: "มุ่งมั่นที่จะคิดค้นแนวทางแก้ปัญหาที่สร้างสรรค์สำหรับความสามารถในการปรับตัวต่อสภาพอากาศและการพัฒนาอย่างยั่งยืน ผ่านการวิจัยร่วมกัน นวัตกรรม นโยบาย และการส่งเสริมศักยภาพชุมชน พันธกิจของเราประกอบด้วยเสาหลัก 5 ประการ",
    pillars: [
      {
        title: "การปลูกฝังเครือข่ายการวิจัยเชิงร่วมมือ",
        summary: "เรามุ่งมั่นที่จะสร้างคลัสเตอร์การวิจัยแบบไดนามิกที่รวบรวมความเชี่ยวชาญจากหลายสาขาวิชาเพื่อรับมือกับความท้าทายที่ซับซ้อนของการเปลี่ยนแปลงสภาพภูมิอากาศและความยั่งยืน โดยการส่งเสริมความร่วมมือระหว่างนักวิจัยจากสาขาวิชาต่าง ๆ เราจึงสร้างองค์ความรู้ที่นำไปปฏิบัติได้และผลิตนวัตกรรมที่บูรณาการหลากหลายศาสตร์",
      },
      {
        title: "จัดกระบวนการเพื่อตอบสนองการพัฒนานโยบายที่มีประสิทธิภาพ",
        summary: "เป้าหมายของเราคือการแปลข้อมูลเชิงลึกทางวิทยาศาสตร์ให้เป็นนโยบายที่มีประสิทธิภาพและเป็นธรรม โดยการมีส่วนร่วมกับผู้กำหนดนโยบาย ผู้มีส่วนได้ส่วนเสีย และชุมชนที่กว้างขึ้น เราสนับสนุนการพัฒนานโยบายที่อิงตามการวิจัยและหลักฐาน เราอำนวยความสะดวกให้กับกระบวนการปรึกษาหารือแบบเปิดที่ช่วยให้ผู้มีส่วนได้ส่วนเสียเรียนรู้จากกันในการทำความเข้าใจธรรมชาติของความท้าทายด้านสิ่งแวดล้อมและสังคม และระบุเส้นทางในอนาคตที่จะเปลี่ยนแปลงและยุติธรรม",
      },
      {
        title: "การเสริมพลังชุมชน",
        summary: "เรามุ่งมั่นที่จะใช้แนวทางการมีส่วนร่วมที่ส่งเสริมให้ชุมชนต่าง ๆ วิเคราะห์และจัดการกับความท้าทายของตนเอง และเป็นพลเมืองที่มีส่วนร่วมในการดำเนินการด้านสภาพภูมิอากาศและการพัฒนาอย่างยั่งยืน ผ่านโครงการด้านการศึกษาและการฝึกอบรมที่ครอบคลุม เรามุ่งมั่นที่จะสร้างศักยภาพในท้องถิ่น สนับสนุนความยุติธรรมทางสังคมและสิ่งแวดล้อม และสร้างแรงบันดาลใจให้เกิดการริเริ่มที่นำโดยชุมชน",
      },
      {
        title: "แนวทางตามระบบนิเวศและพื้นที่",
        summary: "เนื่องจากความท้าทายหรือปัญหาต่าง ๆ ด้านสิ่งแวดล้อมเกิดขึ้นข้ามขอบเขตการปกครอง และจะได้รับการแก้ไขได้ดีที่สุดในระดับระบบนิเวศ เช่น ลุ่มน้ำ เราใช้แนวคิดของการวางแผนตามระบบนิเวศและพื้นที่เพื่อส่งเสริมกรอบการทำงานที่ครอบคลุมและบูรณาการเชิงสถาบันมากขึ้น เพื่อนำภาคส่วนต่าง ๆ และผู้มีส่วนได้ส่วนเสียที่หลากหลายมารวมกัน",
      },
      {
        title: "การจัดการและรักษาระบบนิเวศการวิจัย",
        summary: "ด้วยการตระหนักถึงความสำคัญของสภาพแวดล้อมการวิจัยที่ดี เอื้ออาทร และมีพลวัต เราจึงมุ่งมั่นที่จะพัฒนาและจัดการระบบนิเวศการวิจัยอย่างต่อเนื่อง ซึ่งรวมถึงการส่งเสริมความร่วมมือระหว่างสาขาวิชาต่าง ๆ การเข้าถึงพันธมิตรด้านการวิจัยและหน่วยงานให้ทุนใหม่ ๆ การรับรองการเข้าถึงทรัพยากร และการลดความซับซ้อนในการจัดการงบประมาณการวิจัย เรามุ่งมั่นที่จะสร้างระบบนิเวศที่เป็นมิตรซึ่งสนับสนุนกิจกรรมการวิจัย ส่งเสริมการทำงานร่วมกันแบบสหสาขาวิชา และหล่อเลี้ยงนักวิจัยรุ่นใหม่",
      },
    ],
  },

  news: [
    {
      date: "1 สิงหาคม 2568",
      tag: "กิจกรรม",
      title: "เวทีเสวนาการปรับตัวต่อสภาพภูมิอากาศชุมชนลุ่มน้ำแม่กลอง",
      summary: "SynergyClimate ร่วมกับเครือข่ายชุมชนจัดเวทีแลกเปลี่ยนแนวทางการรับมือภัยแล้งและน้ำหลาก โดยใช้ฐานงานวิจัยเชิงพื้นที่",
      image: "",
      link: "",
    },
    {
      date: "15 กรกฎาคม 2568",
      tag: "ประกาศ",
      title: "เปิดรับสมัครนักวิจัยร่วมโครงการ Climate Resilience 2025",
      summary: "เชิญชวนนักวิจัยและนักศึกษาระดับบัณฑิตศึกษาร่วมพัฒนางานวิจัยด้านระบบนิเวศและการจัดการภูมิทัศน์",
      image: "",
      link: "",
    },
    {
      date: "30 มิถุนายน 2568",
      tag: "ข่าว",
      title: "ลงนามความร่วมมือกับหน่วยงานภาครัฐและภาคเอกชน",
      summary: "ขยายเครือข่ายการวิจัยเชิงร่วมมือเพื่อสนับสนุนการพัฒนานโยบายบนฐานหลักฐานเชิงประจักษ์",
      image: "",
      link: "",
    },
  ],

  events: [
    {
      date: "2026-08-20",
      time: "09:00–16:00",
      title: "เวทีเสวนาการปรับตัวต่อสภาพภูมิอากาศ",
      location: "ม.มหิดล วิทยาเขตกาญจนบุรี",
      link: "",
    },
    {
      date: "2026-09-05",
      time: "13:00–17:00",
      title: "อบรมเชิงปฏิบัติการด้านระบบนิเวศ",
      location: "ออนไลน์ (Zoom)",
      link: "",
    },
    {
      date: "2026-09-19",
      time: "",
      title: "กิจกรรมลงพื้นที่ชุมชนลุ่มน้ำแม่กลอง",
      location: "จ.กาญจนบุรี",
      link: "",
    },
    {
      date: "2026-10-10",
      time: "09:30",
      title: "ประชุมเครือข่ายนักวิจัย",
      location: "ห้องประชุม อาคารเรียนรวม",
      link: "",
    },
  ],

  gallery: [
    {
      image: "",
      caption: "เวทีเสวนาการปรับตัวต่อสภาพภูมิอากาศ · ส.ค. 2568",
    },
    {
      image: "",
      caption: "กิจกรรมลงพื้นที่ชุมชนลุ่มน้ำแม่กลอง",
    },
    {
      image: "",
      caption: "อบรมเชิงปฏิบัติการด้านระบบนิเวศ",
    },
    {
      image: "",
      caption: "ประชุมเครือข่ายนักวิจัย",
    },
    {
      image: "",
      caption: "กิจกรรมปลูกป่าและฟื้นฟูระบบนิเวศ",
    },
    {
      image: "",
      caption: "พิธีลงนามบันทึกความร่วมมือ (MOU)",
    },
  ],

  projects: [
    {
      title: "การศึกษาสำรวจพื้นที่ขยะด้วยแนวทางสหวิทยาการเพื่อการจัดการขยะของท้องถิ่น",
      status: "กำลังดำเนินการ",
      summary: "รายละเอียดโครงการเพิ่มเติมเร็ว ๆ นี้",
      image: "",
      link: "",
    },
    {
      title: "ปฏิบัติการนำร่องลดการเผาในที่โล่งเชิงรุกเพื่อสุขภาวะที่ดีในพื้นที่จังหวัดกาญจนบุรี",
      status: "กำลังดำเนินการ",
      summary: "รายละเอียดโครงการเพิ่มเติมเร็ว ๆ นี้",
      image: "",
      link: "",
    },
  ],

  research: {
    intro: "การทำงานร่วมกันด้านภูมิอากาศเน้นที่ภูมิภาคเอเชียตะวันออกเฉียงใต้และใช้แนวทางตามพื้นที่เพื่อแก้ไขปัญหาสำคัญที่เกี่ยวข้อง ผลงานปัจจุบันของเราครอบคลุมประเด็นการเปลี่ยนแปลงสภาพภูมิอากาศ การเปลี่ยนแปลงสิ่งแวดล้อม คุณภาพอากาศและสาธารณสุข การศึกษา การจัดการขยะ ทรัพยากรน้ำ การเข้าถึงชุมชน สิทธิมนุษยชน และอุตสาหกรรมเกษตร",
    murexEnabled: true,
    murexLabel: "ดูผลงานวิจัยทั้งหมดบน MUREX (Mahidol Research EXperts)",
    murexUrl: "https://murex.mahidol.ac.th/",
  },

  publications: [
    {
      year: "2025",
      title: "Climate Adaptation Pathways for Mekong Sub-region Communities",
      authors: "SynergyClimate Research Team",
      venue: "Working Paper",
      link: "",
    },
    {
      year: "2024",
      title: "Landscape-based Approaches to Ecosystem Resilience",
      authors: "SynergyClimate Research Team",
      venue: "Technical Report",
      link: "",
    },
  ],

  team: [
    {
      name: "ผู้ช่วยศาสตราจารย์ ดร.ธัชวีร์ ลีละวัฒน์",
      role: "",
      photo: "https://drive.google.com/thumbnail?id=1ZCsvUtj7g_CXlL_FxUPR6BwBtJwzVZ4W&sz=w1000",
      link: "",
    },
    {
      name: "ดร.จุฑามาศ สุคนธปฏิภาค",
      role: "",
      photo: "https://drive.google.com/thumbnail?id=13A8MUXZCt-xNm2aXBm44FgPLJoOfbEbe&sz=w1000",
      link: "https://murex.mahidol.ac.th/en/persons/chutamas-sukhontapatipk/publications/",
    },
    {
      name: "รองศาสตราจารย์ ดร.เอริกา พฤฒิกิตติ",
      role: "",
      photo: "https://drive.google.com/thumbnail?id=1t2AI0YinjNHTVXHMuEaXdv8pvU19L9Fj&sz=w1000",
      link: "https://murex.mahidol.ac.th/en/persons/arika-bridhikitti/",
    },
    {
      name: "ดร.เนติยา การะเกตุ",
      role: "",
      photo: "https://drive.google.com/thumbnail?id=1ohW4Zi_5E3zAqWN4iSP-h9OGpMhl9QOt&sz=w1000",
      link: "https://murex.mahidol.ac.th/en/persons/netiya-karaket/",
    },
    {
      name: "ดร.อาจารี แก้วเหล่ายูง",
      role: "",
      photo: "https://drive.google.com/thumbnail?id=1ASij8XZhcwklGMyTX3_NP01Tbu49whZf&sz=w1000",
      link: "https://murex.mahidol.ac.th/en/persons/acharee-kaewlaoyoong/",
    },
    {
      name: "ดร.นิธิมา สุทะพินธ์",
      role: "",
      photo: "https://drive.google.com/thumbnail?id=1UjddDzOa6bzqGYZyBfODE943TjlKjvy8&sz=w1000",
      link: "https://murex.mahidol.ac.th/en/persons/nitima-sutapin/",
    },
    {
      name: "Suphatchai Rujakhom, Ph.D.",
      role: "",
      photo: "https://drive.google.com/thumbnail?id=14ffXJ0iHyox6nTycXRXcrAg0b8SsKuxT&sz=w1000",
      link: "https://murex.mahidol.ac.th/en/persons/suphatchai-rujakom/",
    },
    {
      name: "ดร.ถกล วิทยาธนรัตนา",
      role: "",
      photo: "https://drive.google.com/thumbnail?id=1BIUfe5T7205YjxFo_9KLIe2ROesGDxkL&sz=w1000",
      link: "https://murex.mahidol.ac.th/en/persons/takon-wittayathanarattana/",
    },
    {
      name: "ดร.ภวินท์ธนา เจริญบุญ",
      role: "",
      photo: "",
      link: "",
    },
    {
      name: "ดร.อภิวุฒิ วีรวินันทนกุล",
      role: "",
      photo: "",
      link: "",
    },
    {
      name: "ดร.กฤษณะ หลักคงคา",
      role: "",
      photo: "",
      link: "",
    },
    {
      name: "ดร.จุฑามาส แก้วสุข",
      role: "",
      photo: "https://drive.google.com/thumbnail?id=19a10GmVosXbQbGVHGXymdaEIEhaTHDL2&sz=w1000",
      link: "",
    },
    {
      name: "วัชรพล วงศ์เลิศอารักษ์",
      role: "",
      photo: "https://drive.google.com/thumbnail?id=1MjXYsx15_rGE1whq1kuJ3F2jdAMhR_m7&sz=w1000",
      link: "",
    },
    {
      name: "ดร.ประไพพิศ สุวิทย์ชยานนท์",
      role: "",
      photo: "https://drive.google.com/thumbnail?id=1NPaPky6Ju5xkdLAnw6t0uOcUFHKsdzQN&sz=w1000",
      link: "",
    },
  ],

  donate: {
    intro: "การสนับสนุนของท่านช่วยขับเคลื่อนงานวิจัยและกิจกรรมเพื่อชุมชนด้านการปรับตัวต่อการเปลี่ยนแปลงสภาพภูมิอากาศ",
    methods: [
      {
        label: "ชื่อบัญชี",
        value: "[ระบุชื่อบัญชี/กองทุนอย่างเป็นทางการ]",
        note: "",
      },
      {
        label: "ธนาคาร / เลขที่บัญชี",
        value: "[ระบุธนาคารและเลขที่บัญชี]",
        note: "",
      },
      {
        label: "พร้อมเพย์ (PromptPay)",
        value: "[ระบุหมายเลขพร้อมเพย์]",
        note: "",
      },
    ],
    qrImage: "",
    officialLabel: "บริจาคผ่านช่องทางทางการของมหาวิทยาลัย",
    officialHref: "",
    note: "หมายเหตุ: กรุณาแทนที่ข้อความในวงเล็บ [ ... ] ด้วยข้อมูลบัญชีจริงก่อนเผยแพร่ และควรตรวจสอบกับหน่วยงานการเงินของคณะ/มหาวิทยาลัย",
  },

  newsletter: {
    enabled: true,
    title: "ไม่พลาดทุกข่าวสารและกิจกรรม",
    subtitle: "กรอกอีเมลเพื่อรับข่าวสาร กิจกรรม และงานวิจัยใหม่ ๆ ของ SynergyClimate",
    actionUrl: "",
    emailField: "email",
    buttonLabel: "สมัครรับข่าวสาร",
    note: "เราจะส่งเฉพาะข่าวสารสำคัญ และยกเลิกได้ทุกเมื่อ",
  },

  footerLinks: [
    {
      label: "หน้าหลัก",
      href: "https://synergyclimate.mahidol.ac.th",
    },
    {
      label: "พันธกิจ",
      href: "https://synergyclimate.mahidol.ac.th/mission/",
    },
    {
      label: "มหาวิทยาลัยมหิดล",
      href: "https://www.mahidol.ac.th",
    },
  ],
};
