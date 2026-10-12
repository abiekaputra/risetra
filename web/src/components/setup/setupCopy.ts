export type SetupCopy = {
  eyebrow: string;
  title: string;
  description: string;
  steps: string[];
  back: string;
  next: string;
  finish: string;
  cancel: string;
  saved: string;
  profile: {
    title: string;
    description: string;
    student: string;
    institution: string;
    discipline: string;
    degree: string;
    language: string;
  };
  context: {
    title: string;
    description: string;
    project: string;
    topic: string;
    problem: string;
    object: string;
    location: string;
    motivation: string;
    method: string;
  };
  materials: {
    title: string;
    description: string;
    guidelines: string;
    sourceFiles: string;
    choose: string;
    empty: string;
    sourceTitle: string;
    sourceUrl: string;
    sourceNote: string;
    addSource: string;
    remove: string;
  };
  constraints: {
    title: string;
    description: string;
    timeline: string;
    budget: string;
    participants: string;
    data: string;
    equipment: string;
    guidance: string;
  };
};

const id: SetupCopy = {
  eyebrow: "PERSIAPAN PENELITIAN",
  title: "Mari siapkan penelitian Anda",
  description:
    "Jawab dengan keadaan yang benar-benar Anda miliki. Semua jawaban dapat diperbarui nanti.",
  steps: ["Profil", "Konteks", "Bahan", "Batasan"],
  back: "Kembali",
  next: "Lanjut",
  finish: "Simpan dan mulai",
  cancel: "Kembali ke workspace",
  saved: "Persiapan penelitian tersimpan.",
  profile: {
    title: "Siapa dan dari mana penelitian ini dikerjakan?",
    description:
      "Informasi ini membantu Risetra menyesuaikan bahasa dan konteks akademik.",
    student: "Nama mahasiswa",
    institution: "Kampus atau institusi",
    discipline: "Program studi atau disiplin",
    degree: "Jenjang",
    language: "Bahasa kerja",
  },
  context: {
    title: "Apa yang ingin Anda pahami?",
    description:
      "Judul belum harus final. Mulailah dari masalah dan kondisi yang nyata.",
    project: "Judul sementara",
    topic: "Topik yang diminati",
    problem: "Masalah atau kondisi yang diamati",
    object: "Objek atau subjek penelitian",
    location: "Lokasi atau konteks",
    motivation: "Mengapa penelitian ini perlu dilakukan?",
    method: "Preferensi metode",
  },
  materials: {
    title: "Bahan apa yang sudah tersedia?",
    description:
      "Berkas dan tautan ini masih dianggap bahan awal sampai isinya diperiksa dan didaftarkan sebagai sumber.",
    guidelines: "Pedoman kampus",
    sourceFiles: "Jurnal, buku, laporan, atau dataset",
    choose: "Pilih berkas",
    empty: "Belum ada berkas.",
    sourceTitle: "Judul sumber",
    sourceUrl: "Tautan sumber",
    sourceNote: "Catatan kegunaan",
    addSource: "Tambah tautan",
    remove: "Hapus",
  },
  constraints: {
    title: "Apa batas nyata penelitian ini?",
    description:
      "Batasan membantu Risetra menyarankan penelitian yang benar-benar dapat dilakukan.",
    timeline: "Waktu yang tersedia",
    budget: "Anggaran",
    participants: "Akses responden atau partisipan",
    data: "Akses data",
    equipment: "Peralatan atau perangkat lunak",
    guidance: "Arahan atau revisi dosen",
  },
};

const en: SetupCopy = {
  ...id,
  eyebrow: "RESEARCH SETUP",
  title: "Set up your research",
  description:
    "Describe the resources and constraints you actually have. You can revise them later.",
  steps: ["Profile", "Context", "Materials", "Constraints"],
  back: "Back",
  next: "Continue",
  finish: "Save and begin",
  cancel: "Return to workspace",
  saved: "Research setup saved.",
  profile: {
    title: "Who is conducting this research?",
    description:
      "Risetra uses this information to adapt language and academic context.",
    student: "Student name",
    institution: "Institution",
    discipline: "Program or discipline",
    degree: "Degree level",
    language: "Working language",
  },
  context: {
    title: "What do you want to understand?",
    description:
      "The title can change. Begin with an observable condition and a real problem.",
    project: "Working title",
    topic: "Topic of interest",
    problem: "Observed problem or condition",
    object: "Research object or participants",
    location: "Location or context",
    motivation: "Why should this be studied?",
    method: "Method preference",
  },
  materials: {
    title: "What materials do you already have?",
    description:
      "Files and links remain leads until their contents are verified and registered.",
    guidelines: "Institution guidelines",
    sourceFiles: "Papers, books, reports, or datasets",
    choose: "Choose files",
    empty: "No files yet.",
    sourceTitle: "Source title",
    sourceUrl: "Source URL",
    sourceNote: "Why it may be useful",
    addSource: "Add URL",
    remove: "Remove",
  },
  constraints: {
    title: "What are the real constraints?",
    description:
      "Constraints help Risetra suggest research that can actually be completed.",
    timeline: "Available time",
    budget: "Budget",
    participants: "Participant access",
    data: "Data access",
    equipment: "Equipment or software",
    guidance: "Supervisor guidance or revisions",
  },
};

export function setupCopyFor(locale: string): SetupCopy {
  return locale.toLowerCase().startsWith("id") ? id : en;
}
