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
      items: [
        ["1",  "Adaptasi Tugasan: Kebolehan bertukar skop kerja dengan cepat.",           "Rekod Pertukaran Stesen / Task Log"],
        ["2",  "Fleksibiliti Masa: Kesediaan menyokong operasi luar waktu biasa.",         "Rekod Kedatangan / OT / Shift Support"],
        ["3",  "Multi-tugas: Mengendalikan lebih dari satu stesen/mesin serentak.",        "Skill Matrix / Laporan Output Multi-stesen"],
        ["4",  "Penyelesaian Masalah: Mencari jalan keluar kreatif bagi isu teknikal.",    "Rekod Troubleshooting / Kaizen Form"],
        ["5",  "Kemahiran Bersilang: Membantu bahagian lain di luar kepakaran teras.",     "Skill Matrix / Cross-training Record"],
        ["6",  "Keupayaan Digital: Penguasaan sistem ERP/Tablet/Aplikasi kerja.",          "Log Sistem / Rekod Input Data Digital"],
        ["7",  "Reskilling/Upskilling: Aktif belajar kemahiran baru (OJT/Kursus).",       "Sijil Kursus / OJT Sign-off Sheet"],
        ["8",  "Kesediaan Berubah: Sikap positif terhadap SOP atau teknologi baru.",       "Catatan Coaching / Rekod Implementasi SOP"],
        ["9",  "Ketahanan (Resilience): Kekal produktif di bawah tekanan tinggi.",         "Laporan Prestasi Peak Period"],
        ["10", "Mobiliti Kerja: Kesediaan dihantar ke cawangan/lokasi projek lain.",       "Rekod Outstation / Site Support"],
      ],
    },
    {
      id: "productivity",
      title: "SECTION 2: PRODUCTIVITY (PQCDSM)",
      icon: "📊",
      weight: 40,
      focus: "Operational Excellence and Kaizen Mindset.",
      items: [
        ["P", "Kuantiti & Kecekapan: Mencapai KPI output harian.",              "Daily Production Report / KPI Dashboard"],
        ["Q", "Kualiti Hasil: Kadar rework atau reject yang rendah.",            "Rekod Reject / Quality Inspection Log"],
        ["C", "Penjimatan Kos: Mengurangkan pembaziran bahan/utiliti.",          "Kaizen (Cost Saving) / Scrap Record"],
        ["D", "Pematuhan Masa: Menyiapkan tugasan mengikut Lead Time.",          "Project Schedule / SLA Compliance Log"],
        ["S", "Amalan Keselamatan: Mematuhi PPE dan prosedur HIRARC.",           "Safety Audit / PPE Checklist / Zero Accident"],
        ["M", "Semangat & Kaizen: Memberi cadangan penambahbaikan.",             "Borang Kaizen / Sebelum-Selepas (B&A)"],
      ],
    },
    {
      id: "moral",
      title: "SECTION 3: MORAL & PROFESIONALISME",
      icon: "🌟",
      weight: 20,
      focus: "Ethics, Discipline, and Teamwork.",
      items: [
        ["1", "Tingkah Laku Profesional: Menjaga imej syarikat & etika kerja.", "Supervisor Journal / Merit-Demerit"],
        ["2", "Komunikasi Beretika: Cara berinteraksi dengan rakan & atasan.",   "Peer Feedback / Minutes of Meeting"],
        ["3", "Integriti: Kejujuran dalam pelaporan kerja & tugas.",             "Rekod Audit Dalaman / Kepercayaan Tugas"],
        ["4", "Disiplin/Kehadiran: Ketepatan masa dan kehadiran konsisten.",     "Punch Card / Attendance Summary"],
        ["5", "Pematuhan Budaya Kerja: Mengamalkan nilai 5S / Core Values.",     "5S Audit Checklist / Performance Review"],
      ],
    },
  ],

  evidenceChecklist: [
    "Skill Matrix (Terkini)",
    "Rekod Kehadiran (3 Bulan Terakhir)",
    "Borang Kaizen atau Rekod Penambahbaikan (Jika ada)",
    "Laporan Kualiti / Output (Individu)",
    "Rekod Latihan / OJT Sign-off",
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
