export type ProjectStatus = "Perencanaan" | "Tender" | "Berjalan" | "Pemeliharaan" | "Selesai";

export interface Project {
  id: string;
  name: string;
  location: string;
  value: number;
  landArea: number;
  buildingArea: number;
  type: string;
  status: ProjectStatus;
  targetDate: string;
  progressPhysical: number;
  progressFinancial: number;
  description: string;
  createdAt: string;
}

export type TenderStatus = "Pengumuman" | "Aanwijzing" | "Penawaran" | "Evaluasi" | "Negosiasi" | "Selesai";
export type TenderType = "Terbuka" | "Terbatas" | "Langsung";

export interface Tender {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  hpsValue: number;
  tenderType: TenderType;
  schedule: string;
  documentUrl: string;
  status: TenderStatus;
  winnerContractorId?: string;
  winnerContractorName?: string;
  createdAt: string;
}

export interface TenderBid {
  id: string;
  tenderId: string;
  tenderTitle?: string;
  contractorId: string;
  contractorName: string;
  bidValue: number;
  proposalTechUrl: string;
  proposalPriceUrl: string;
  scoreAdmin: number;
  scoreTech: number;
  scorePrice: number;
  scoreTotal: number;
  status: "Draft" | "Diajukan" | "Evaluasi" | "Pemenang" | "Gugur";
  createdAt: string;
}

export type ContractStatus = "Draft" | "Review" | "Approved" | "Active" | "Closed";

export interface Contract {
  id: string;
  projectId: string;
  projectName: string;
  contractorName: string;
  value: number;
  retentionPercent: number;
  guaranteeExecution: number;
  guaranteeMaintenance: number;
  status: ContractStatus;
  createdAt: string;
}

export interface BOQItem {
  id: string;
  projectId: string;
  itemCode: string;
  itemName: string;
  category: "Struktur" | "Arsitektur" | "MEP" | "Infrastruktur";
  unit: string;
  volume: number;
  unitPriceBudget: number;
  unitPriceActual: number;
}

export interface WorkProgress {
  id: string;
  projectId: string;
  projectName?: string;
  contractorId: string;
  contractorName: string;
  periodType: "Daily" | "Weekly" | "Monthly";
  percentage: number;
  description: string;
  photoUrl: string;
  videoUrl: string;
  status: "Pending" | "Approved" | "Rejected" | "Revision";
  createdAt: string;
}

export interface DailyReport {
  id: string;
  projectId: string;
  projectName?: string;
  reporterName: string;
  manpower: string; // Detail tenaga kerja
  equipment: string; // Detail alat berat
  materialsEntered: string; // Material yang masuk
  weather: "Cerah" | "Hujan" | "Mendung" | "Gerimis";
  challenges: string;
  photoUrl: string;
  createdAt: string;
  gpsLocation?: string;
}

export interface QualityControl {
  id: string;
  projectId: string;
  projectName?: string;
  scope: "Struktur" | "Arsitektur" | "MEP" | "Infrastruktur";
  issue: string;
  status: "Open" | "In-Progress" | "Rectified" | "Closed";
  inspector: string;
  photoUrl: string;
  rectificationPhotoUrl?: string;
  remedyAction?: string;
}

export interface VariationOrder {
  id: string;
  projectId: string;
  projectName?: string;
  contractorId: string;
  contractorName: string;
  title: string;
  type: "Tambah" | "Kurang" | "Perubahan Spesifikasi";
  amount: number;
  status: "Draft" | "Submitted" | "Project Manager Approved" | "Direktur Approved" | "Rejected";
  createdAt: string;
}

export interface PaymentTerm {
  id: string;
  contractId?: string;
  projectId: string;
  projectName?: string;
  contractorName?: string;
  phaseName?: string; // e.g. DP 10%, Termin 1, Retensi
  name?: string; // e.g. termin name
  percentage?: number; 
  targetDate?: string;
  value: number;
  status: "Draft" | "Diajukan" | "Verifikasi" | "Disetujui" | "Dibayar";
  invoiceFile?: string;
  invoiceUrl?: string;
  createdAt?: string;
}

export interface MaterialStock {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minSafetyStock: number;
}

export interface MaterialLog {
  id: string;
  materialId: string;
  materialName: string;
  type: "IN" | "OUT";
  quantity: number;
  unit: string;
  picName: string;
  createdAt: string;
  notes: string;
}

export interface Invoice {
  id: string;
  paymentTermId: string;
  projectId: string;
  invoiceNo: string;
  invoiceUrl: string;
  fakturPajakUrl: string;
  bastUrl: string;
  suratJalanUrl: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  projectId: string;
  projectName?: string;
  itemName: string;
  skuCode: string;
  qtyStock: number;
  unit: string;
  warehouseName: string;
  lastUpdated: string;
}

export type ERPUserRole =
  | "Super Admin"
  | "Direktur"
  | "Project Director"
  | "Project Manager"
  | "Quantity Surveyor"
  | "Site Engineer"
  | "Pengawas Lapangan"
  | "Purchasing"
  | "Finance"
  | "Kontraktor"
  | "Subkontraktor"
  | "Konsultan Pengawas";

export interface SystemUser {
  uid: string;
  name: string;
  email: string;
  role: ERPUserRole;
  companyName: string;
}
