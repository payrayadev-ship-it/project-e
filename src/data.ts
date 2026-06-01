import { Project, Tender, TenderBid, Contract, BOQItem, WorkProgress, DailyReport, QualityControl, VariationOrder, PaymentTerm, Invoice, InventoryItem, MaterialStock, MaterialLog } from "./types";

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "PROJ-001",
    name: "Apartemen Foresyndo Tower Mas",
    location: "Kuningan, Jakarta Selatan",
    value: 125000000000,
    landArea: 15200,
    buildingArea: 48500,
    type: "High-Rise Residential",
    status: "Berjalan",
    targetDate: "2027-12-31",
    progressPhysical: 35,
    progressFinancial: 40,
    description: "Proyek pembangunan apartemen premium 32 lantai dengan fasilitas ramah lingkungan, sistem filtrasi air mandiri, dan integrasi transit.",
    createdAt: "2025-01-15T08:00:00Z"
  },
  {
    id: "PROJ-002",
    name: "Perumahan Jatitujuh",
    location: "Majalengka, Jawa Barat",
    value: 68000000000,
    landArea: 45000,
    buildingArea: 22000,
    type: "Residential Housing",
    status: "Berjalan",
    targetDate: "2026-11-30",
    progressPhysical: 72,
    progressFinancial: 65,
    description: "Kawasan perumahan terpadu tipe 45 dan 60 dengan total 280 unit hunian, dilengkapi clubhouse, jalan beton cor, dan taman bermain.",
    createdAt: "2025-03-10T09:00:00Z"
  },
  {
    id: "PROJ-003",
    name: "Foresyndo Warehouse BizPark",
    location: "Cikarang, Bekasi",
    value: 85000000000,
    landArea: 35000,
    buildingArea: 28000,
    type: "Industrial Warehouse",
    status: "Tender",
    targetDate: "2026-08-15",
    progressPhysical: 0,
    progressFinancial: 10,
    description: "Kompleks pergudangan logistik modern ramah energi dengan spesifikasi beban lantai 5 ton/m2, dermaga pemuatan ganda, dan kantor 3 tingkat.",
    createdAt: "2025-05-20T10:00:00Z"
  },
  {
    id: "PROJ-004",
    name: "Foresyndo Eco Hotel & Resort",
    location: "Ubud, Bali",
    value: 110000000000,
    landArea: 18000,
    buildingArea: 12000,
    type: "Commercial Leisure",
    status: "Perencanaan",
    targetDate: "2028-03-24",
    progressPhysical: 0,
    progressFinancial: 0,
    description: "Desain resort mewah bintang 5 berbasis struktur bambu terintegrasi, villa kolam renang pribadi, dan lanskap sawah terasering alami.",
    createdAt: "2026-02-05T07:30:00Z"
  }
];

export const INITIAL_TENDERS: Tender[] = [
  {
    id: "TEN-001",
    projectId: "PROJ-003",
    projectName: "Foresyndo Warehouse BizPark",
    title: "Pekerjaan Struktur Utama & Atap Rangka Baja",
    hpsValue: 32000000000,
    tenderType: "Terbuka",
    schedule: "Aanwijzing: 10 Juni 2026, Penutupan: 25 Juni 2026",
    documentUrl: "#",
    status: "Evaluasi",
    createdAt: "2026-05-21T09:00:00Z"
  },
  {
    id: "TEN-002",
    projectId: "PROJ-001",
    projectName: "Apartemen Foresyndo Tower Mas",
    title: "Instalasi Sistem MEP (Mechanical, Electrical, Plumbing)",
    hpsValue: 24000000000,
    tenderType: "Terbatas",
    schedule: "Penyerahan Penawaran s/d 15 April 2026",
    documentUrl: "#",
    status: "Selesai",
    winnerContractorId: "CONT-001",
    winnerContractorName: "PT. Krakatau Karya Jaya",
    createdAt: "2026-03-01T10:30:00Z"
  }
];

export const INITIAL_BIDS: TenderBid[] = [
  {
    id: "BID-001",
    tenderId: "TEN-001",
    tenderTitle: "Pekerjaan Struktur Utama & Atap Rangka Baja",
    contractorId: "CONT-001",
    contractorName: "PT. Krakatau Karya Jaya",
    bidValue: 31200000000,
    proposalTechUrl: "#",
    proposalPriceUrl: "#",
    scoreAdmin: 92,
    scoreTech: 88,
    scorePrice: 91,
    scoreTotal: 90.1,
    status: "Diajukan",
    createdAt: "2026-05-24T14:00:00Z"
  },
  {
    id: "BID-002",
    tenderId: "TEN-001",
    tenderTitle: "Pekerjaan Struktur Utama & Atap Rangka Baja",
    contractorId: "CONT-002",
    contractorName: "PT. Jaya Makmur Mandiri",
    bidValue: 29800000000,
    proposalTechUrl: "#",
    proposalPriceUrl: "#",
    scoreAdmin: 90,
    scoreTech: 82,
    scorePrice: 96,
    scoreTotal: 88.8,
    status: "Diajukan",
    createdAt: "2026-05-25T11:00:00Z"
  },
  {
    id: "BID-003",
    tenderId: "TEN-001",
    tenderTitle: "Pekerjaan Struktur Utama & Atap Rangka Baja",
    contractorId: "CONT-003",
    contractorName: "PT. Cipta Graha Mandiri",
    bidValue: 33500000000,
    proposalTechUrl: "#",
    proposalPriceUrl: "#",
    scoreAdmin: 95,
    scoreTech: 91,
    scorePrice: 83,
    scoreTotal: 89.2,
    status: "Evaluasi",
    createdAt: "2026-05-25T15:30:00Z"
  }
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: "CONT-001",
    projectId: "PROJ-001",
    projectName: "Apartemen Foresyndo Tower Mas",
    contractorName: "PT. Krakatau Karya Jaya",
    value: 118000000000,
    retentionPercent: 5,
    guaranteeExecution: 5900000000,
    guaranteeMaintenance: 2950000000,
    status: "Active",
    createdAt: "2025-02-10"
  },
  {
    id: "CONT-002",
    projectId: "PROJ-002",
    projectName: "Perumahan Jatitujuh",
    contractorName: "PT. Jaya Makmur Mandiri",
    value: 65000000000,
    retentionPercent: 5,
    guaranteeExecution: 3250000000,
    guaranteeMaintenance: 1625000000,
    status: "Active",
    createdAt: "2025-04-01"
  }
];

export const INITIAL_BOQ: BOQItem[] = [
  // Apartemen Foresyndo Tower Mas (PROJ-001)
  { id: "BOQ-001", projectId: "PROJ-001", itemCode: "ST-01", itemName: "Pekerjaan Galian & Pondasi Bored Pile", category: "Struktur", unit: "m3", volume: 4200, unitPriceBudget: 1500000, unitPriceActual: 1480000 },
  { id: "BOQ-002", projectId: "PROJ-001", itemCode: "ST-02", itemName: "Beton Bertulang K-350 Struktur Kolom", category: "Struktur", unit: "m3", volume: 12500, unitPriceBudget: 2200000, unitPriceActual: 2250000 },
  { id: "BOQ-003", projectId: "PROJ-001", itemCode: "AR-01", itemName: "Pasangan Bata Ringan & Plester Aci", category: "Arsitektur", unit: "m2", volume: 38000, unitPriceBudget: 185000, unitPriceActual: 190000 },
  { id: "BOQ-004", projectId: "PROJ-001", itemCode: "ME-01", itemName: "Eskalator & Lift Penumpang Otomatis", category: "MEP", unit: "Unit", volume: 6, unitPriceBudget: 850000000, unitPriceActual: 830000000 },
  
  // Perumahan Jatitujuh (PROJ-002)
  { id: "BOQ-005", projectId: "PROJ-002", itemCode: "ST-21", itemName: "Pek Pondasi Batu Kali", category: "Struktur", unit: "m3", volume: 1800, unitPriceBudget: 850000, unitPriceActual: 820000 },
  { id: "BOQ-006", projectId: "PROJ-002", itemCode: "AR-21", itemName: "Kusen Alumunium & Pintu Panel Jati", category: "Arsitektur", unit: "Set", volume: 560, unitPriceBudget: 3500000, unitPriceActual: 3600000 },
  { id: "BOQ-007", projectId: "PROJ-002", itemCode: "IN-21", itemName: "Cor Jalan Kompleks Beton K-300 t=15cm", category: "Infrastruktur", unit: "m3", volume: 3200, unitPriceBudget: 1400000, unitPriceActual: 1450000 }
];

export const INITIAL_PROGRESS: WorkProgress[] = [
  {
    id: "WP-001",
    projectId: "PROJ-001",
    contractorId: "CONT-001",
    contractorName: "PT. Krakatau Karya Jaya",
    periodType: "Weekly",
    percentage: 35,
    description: "Pengecoran pelat lantai 12 dan kolom lantai 13 selesai. Sedang mempersiapkan bekisting balok lantai 14.",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop",
    videoUrl: "",
    status: "Approved",
    createdAt: "2026-05-28T09:00:00Z"
  },
  {
    id: "WP-002",
    projectId: "PROJ-002",
    contractorId: "CONT-002",
    contractorName: "PT. Jaya Makmur Mandiri",
    periodType: "Monthly",
    percentage: 72,
    description: "Pemasangan genteng keramik tipe 45 sebanyak 85 unit selesai, pengaspalan jalan lingkungan primer blok A s/d D capai progres 90%.",
    photoUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop",
    videoUrl: "",
    status: "Pending",
    createdAt: "2026-05-31T15:00:00Z"
  }
];

export const INITIAL_DAILY_REPORTS: DailyReport[] = [
  {
    id: "REP-001",
    projectId: "PROJ-001",
    reporterName: "Ir. Doni Saputra (Site Supervisor Owner)",
    manpower: "Mandor: 4, Tukang Besi: 18, Tukang Kayu: 12, Pekerja Umum: 45, Operator Tower Crane: 1",
    equipment: "Tower Crane (Aktif), Concrete Pump (Standby), Excavator PC200 (1 unit)",
    materialsEntered: "Concreting ReadyMix K-350 Slump 12 s/d 14: 65 m3, Besi Beton Ulir D19: 140 batang",
    weather: "Cerah",
    challenges: "Lalu lintas masuk area Kuningan padat, sempat menunda kedatangan truk ReadyMix sekitar 45 menit.",
    photoUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?q=80&w=600&auto=format&fit=crop",
    createdAt: "2026-06-01T10:00:00Z"
  }
];

export const INITIAL_QC_CHECKLISTS: QualityControl[] = [
  {
    id: "QC-001",
    projectId: "PROJ-001",
    scope: "Struktur",
    issue: "Pembesian pembagi pelat lantai 14 renggang melebihi batas spek toleransi (22cm vs target 15cm)",
    status: "Rectified",
    inspector: "Hadi Wicaksono (Quality Auditor PT. Foresyndo)",
    photoUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
    rectificationPhotoUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?q=80&w=600&auto=format&fit=crop",
    remedyAction: "Kontraktor menambah bar besi pengisi sela dan merapikan kawat ikat beton (bendrat). Dipastikan kembali tepat 15cm."
  },
  {
    id: "QC-002",
    projectId: "PROJ-001",
    scope: "MEP",
    issue: "Kabel sasis panel MDP lantai 2 tidak grounded dengan sempurna. Resiko induksi sengatan listrik.",
    status: "Open",
    inspector: "Eko Prasetyotomo (MEP Inspector)",
    photoUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=600&auto=format&fit=crop"
  }
];

export const INITIAL_CHANGE_ORDERS: VariationOrder[] = [
  {
    id: "VO-001",
    projectId: "PROJ-001",
    contractorId: "CONT-001",
    contractorName: "PT. Krakatau Karya Jaya",
    title: "Tambah Pekerjaan Penebalan Dinding Basement 2",
    type: "Tambah",
    amount: 345000000,
    status: "Project Manager Approved",
    createdAt: "2026-05-18"
  },
  {
    id: "VO-002",
    projectId: "PROJ-002",
    contractorId: "CONT-002",
    contractorName: "PT. Jaya Makmur Mandiri",
    title: "Ubah Spesifikasi Merk Kusen Alumunium dari Lokal ke YKK Import",
    type: "Perubahan Spesifikasi",
    amount: 120000000,
    status: "Submitted",
    createdAt: "2026-05-27"
  }
];

export const INITIAL_PAYMENT_TERMS: PaymentTerm[] = [
  {
    id: "TERM-01",
    contractId: "CONT-001",
    projectId: "PROJ-001",
    contractorName: "PT. Krakatau Karya Jaya",
    phaseName: "Uang Muka (DP 20%)",
    value: 23600000000,
    status: "Dibayar",
    createdAt: "2025-02-15"
  },
  {
    id: "TERM-02",
    contractId: "CONT-001",
    projectId: "PROJ-001",
    contractorName: "PT. Krakatau Karya Jaya",
    phaseName: "Termin 1 (Fisik 30%)",
    value: 35400000000,
    status: "Dibayar",
    createdAt: "2025-11-20"
  },
  {
    id: "TERM-03",
    contractId: "CONT-001",
    projectId: "PROJ-001",
    contractorName: "PT. Krakatau Karya Jaya",
    phaseName: "Termin 2 (Fisik 50%)",
    value: 23600000000,
    status: "Verifikasi",
    createdAt: "2026-05-29"
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-001",
    paymentTermId: "TERM-03",
    projectId: "PROJ-001",
    invoiceNo: "INV/KKJ/FTM/0526-092",
    invoiceUrl: "#",
    fakturPajakUrl: "#",
    bastUrl: "#",
    suratJalanUrl: "#",
    createdAt: "2026-05-29"
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "INV-IT-01", projectId: "PROJ-001", itemName: "Semen Portland Tiga Roda (Gresik) 50kg", skuCode: "SEM-TR-50", qtyStock: 1240, unit: "Zak", warehouseName: "Gudang Area Utama Basement 1", lastUpdated: "2026-06-01" },
  { id: "INV-IT-02", projectId: "PROJ-001", itemName: "Besi Beton Ulir Dia-13 K-400 (SNI)", skuCode: "BSI-ULR-13", qtyStock: 850, unit: "Batang", warehouseName: "Lahan Penumpukan Terbuka Blok Utara", lastUpdated: "2026-05-31" },
  { id: "INV-IT-03", projectId: "PROJ-002", itemName: "Genteng Keramik Kanmuri Milenio Coated", skuCode: "GNT-KM-MIL", qtyStock: 4800, unit: "Pcs", warehouseName: "Gudang Kavling 12-14 Jatitujuh", lastUpdated: "2026-06-01" }
];

export const INITIAL_MATERIAL_STOCKS: MaterialStock[] = [
  { id: "M-1", name: "Semen Portland Tiga Roda (Zak)", stock: 850, unit: "Zak", minSafetyStock: 1000 },
  { id: "M-2", name: "Besi Beton Ulir D16 (Batang)", stock: 2400, unit: "Batang", minSafetyStock: 1200 },
  { id: "M-3", name: "Ready Mix Concrete K-350 (m3)", stock: 150, unit: "m3", minSafetyStock: 80 },
  { id: "M-4", name: "Timber Wood Bekisting (Pcs)", stock: 420, unit: "Pcs", minSafetyStock: 250 }
];

export const INITIAL_MATERIAL_LOGS: MaterialLog[] = [
  { id: "LOG-01", materialId: "M-1", materialName: "Semen Portland Tiga Roda (Zak)", type: "IN", quantity: 600, unit: "Zak", picName: "Sutrisno (Gudang)", createdAt: "2026-06-01 09:15", notes: "Semen Masuk PO-778" },
  { id: "LOG-02", materialId: "M-4", materialName: "Timber Wood Bekisting (Pcs)", type: "OUT", quantity: 180, unit: "Pcs", picName: "Ujang (Mandor Kolom)", createdAt: "2026-06-01 11:30", notes: "Pengecoran Kolom Lt. 14" }
];
