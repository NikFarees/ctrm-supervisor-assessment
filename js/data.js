/**
 * Static assessment data — sections, criteria, checklist items, and recommendations.
 * Keeping data separate from behaviour makes it trivial to update content
 * without touching any logic.
 */
const AssessmentData = Object.freeze({
  scoreLabels: {
    1: "Lemah",
    2: "Memadai",
    3: "Baik",
    4: "Cemerlang",
  },

  scoreColors: {
    1: "score--1",
    2: "score--2",
    3: "score--3",
    4: "score--4",
  },

  sections: [
    {
      id: "flextivity",
      title: "SECTION 1: FLEXTIVITY",
      icon: "⚡",
      weight: 40,
      focus: "Versatility, Digital Readiness, and Adaptability.",
      // Each item: [label, description, evidence, columnKey]
      items: [
        ["1",  "Adaptasi Tugasan: Kebolehan bertukar skop kerja dengan cepat.",           "Rekod Pertukaran Stesen / Task Log",        "f01_adaptasi_tugasan"],
        ["2",  "Fleksibiliti Masa: Kesediaan menyokong operasi luar waktu biasa.",         "Rekod Kedatangan / OT / Shift Support",     "f02_fleksibiliti_masa"],
        ["3",  "Multi-tugas: Mengendalikan lebih dari satu stesen/mesin serentak.",        "Skill Matrix / Laporan Output Multi-stesen","f03_multi_tugas"],
        ["4",  "Penyelesaian Masalah: Mencari jalan keluar kreatif bagi isu teknikal.",    "Rekod Troubleshooting / Kaizen Form",       "f04_penyelesaian_masalah"],
        ["5",  "Kemahiran Bersilang: Membantu bahagian lain di luar kepakaran teras.",     "Skill Matrix / Cross-training Record",      "f05_kemahiran_bersilang"],
        ["6",  "Keupayaan Digital: Penguasaan sistem ERP/Tablet/Aplikasi kerja.",          "Log Sistem / Rekod Input Data Digital",     "f06_keupayaan_digital"],
        ["7",  "Reskilling/Upskilling: Aktif belajar kemahiran baru (OJT/Kursus).",       "Sijil Kursus / OJT Sign-off Sheet",         "f07_reskilling_upskilling"],
        ["8",  "Kesediaan Berubah: Sikap positif terhadap SOP atau teknologi baru.",       "Catatan Coaching / Rekod Implementasi SOP", "f08_kesediaan_berubah"],
        ["9",  "Ketahanan (Resilience): Kekal produktif di bawah tekanan tinggi.",         "Laporan Prestasi Peak Period",              "f09_ketahanan"],
        ["10", "Mobiliti Kerja: Kesediaan dihantar ke cawangan/lokasi projek lain.",       "Rekod Outstation / Site Support",           "f10_mobiliti_kerja"],
      ],
    },
    {
      id: "productivity",
      title: "SECTION 2: PRODUCTIVITY (PQCDSM)",
      icon: "📊",
      weight: 40,
      focus: "Operational Excellence and Kaizen Mindset.",
      items: [
        ["P", "Kuantiti & Kecekapan: Mencapai KPI output harian.",              "Daily Production Report / KPI Dashboard",        "p_kuantiti_kecekapan"],
        ["Q", "Kualiti Hasil: Kadar rework atau reject yang rendah.",            "Rekod Reject / Quality Inspection Log",           "q_kualiti_hasil"],
        ["C", "Penjimatan Kos: Mengurangkan pembaziran bahan/utiliti.",          "Kaizen (Cost Saving) / Scrap Record",             "c_penjimatan_kos"],
        ["D", "Pematuhan Masa: Menyiapkan tugasan mengikut Lead Time.",          "Project Schedule / SLA Compliance Log",           "d_pematuhan_masa"],
        ["S", "Amalan Keselamatan: Mematuhi PPE dan prosedur HIRARC.",           "Safety Audit / PPE Checklist / Zero Accident",    "s_amalan_keselamatan"],
        ["M", "Semangat & Kaizen: Memberi cadangan penambahbaikan.",             "Borang Kaizen / Sebelum-Selepas (B&A)",           "m_semangat_kaizen"],
      ],
    },
    {
      id: "moral",
      title: "SECTION 3: MORAL & PROFESIONALISME",
      icon: "🌟",
      weight: 20,
      focus: "Ethics, Discipline, and Teamwork.",
      items: [
        ["1", "Tingkah Laku Profesional: Menjaga imej syarikat & etika kerja.", "Supervisor Journal / Merit-Demerit",              "mo1_tingkah_laku_profesional"],
        ["2", "Komunikasi Beretika: Cara berinteraksi dengan rakan & atasan.",   "Peer Feedback / Minutes of Meeting",              "mo2_komunikasi_beretika"],
        ["3", "Integriti: Kejujuran dalam pelaporan kerja & tugas.",             "Rekod Audit Dalaman / Kepercayaan Tugas",         "mo3_integriti"],
        ["4", "Disiplin/Kehadiran: Ketepatan masa dan kehadiran konsisten.",     "Punch Card / Attendance Summary",                 "mo4_disiplin_kehadiran"],
        ["5", "Pematuhan Budaya Kerja: Mengamalkan nilai 5S / Core Values.",     "5S Audit Checklist / Performance Review",         "mo5_pematuhan_budaya_kerja"],
      ],
    },
  ],

  recommendations: [
    "LAYAK: Calon menunjukkan kompetensi tinggi dan layak diiktiraf.",
    "LAYAK DENGAN PEMANTAUAN: Calon layak tetapi memerlukan bimbingan dalam aspek tertentu.",
    "LATIHAN TAMBAHAN: Calon belum mencapai tahap minimum, perlu latihan semula.",
  ],

  /** Derived total — computed once at load time. */
  get totalItems() {
    return this.sections.reduce((sum, s) => sum + s.items.length, 0);
  },
});
