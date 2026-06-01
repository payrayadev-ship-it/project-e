import React, { useState } from "react";
import { 
  INITIAL_PROJECTS, 
  INITIAL_BOQ, 
  INITIAL_TENDERS, 
  INITIAL_BIDS, 
  INITIAL_PROGRESS, 
  INITIAL_DAILY_REPORTS, 
  INITIAL_MATERIAL_STOCKS, 
  INITIAL_MATERIAL_LOGS, 
  INITIAL_CHANGE_ORDERS, 
  INITIAL_PAYMENT_TERMS 
} from "./data";
import { 
  Project, 
  BOQItem, 
  Tender, 
  TenderBid, 
  WorkProgress, 
  DailyReport, 
  MaterialStock, 
  MaterialLog, 
  VariationOrder, 
  PaymentTerm, 
  ERPUserRole 
} from "./types";

// Component imports
import { DashboardDirektur } from "./components/DashboardDirektur";
import { MasterProyek } from "./components/MasterProyek";
import { TenderProcurement } from "./components/TenderProcurement";
import { BoqRab } from "./components/BoqRab";
import { WorkProgressDetails } from "./components/WorkProgressDetails";
import { SiteDailyReport } from "./components/SiteDailyReport";
import { QualityControlQC } from "./components/QualityControlQC";
import { ChangeOrders } from "./components/ChangeOrders";
import { BillingPayments } from "./components/BillingPayments";
import { InventoryMaterialTracker } from "./components/InventoryMaterialTracker";
import { GeminiAssistant } from "./components/GeminiAssistant";

// Lucide Icons for sidebar layout
import { 
  LayoutDashboard, 
  FolderGit, 
  Handshake, 
  Calculator, 
  TrendingUp, 
  CalendarDays, 
  FileCheck, 
  GitCompare, 
  Receipt, 
  Box, 
  Sparkles, 
  Brain, 
  Menu, 
  X, 
  Globe, 
  UserSquare 
} from "lucide-react";

export default function App() {
  // ERP Core States
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [boqList, setBoqList] = useState<BOQItem[]>(INITIAL_BOQ);
  const [tenders, setTenders] = useState<Tender[]>(INITIAL_TENDERS);
  const [bids, setBids] = useState<TenderBid[]>(INITIAL_BIDS);
  const [progressList, setProgressList] = useState<WorkProgress[]>(INITIAL_PROGRESS);
  const [reports, setReports] = useState<DailyReport[]>(INITIAL_DAILY_REPORTS);
  const [materials, setMaterials] = useState<MaterialStock[]>(INITIAL_MATERIAL_STOCKS);
  const [logs, setLogs] = useState<MaterialLog[]>(INITIAL_MATERIAL_LOGS);
  const [variationOrders, setVariationOrders] = useState<VariationOrder[]>(INITIAL_CHANGE_ORDERS);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>(INITIAL_PAYMENT_TERMS);

  // Initial Seed QC Items (to prevent empty state)
  const [qcList, setQcList] = useState<any[]>([
    {
      id: "QC-201",
      projectId: "PROJ-001",
      projectName: "Apartemen Grand Foresyndo Landmark",
      scope: "Struktur",
      issue: "Pemasangan re-bar kolom B3 kurang lurus 3cm dari toleransi beban maksimum.",
      status: "Open",
      inspector: "Bambang Tri (Konsultan Audit)",
      photoUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600"
    },
    {
      id: "QC-202",
      projectId: "PROJ-002",
      projectName: "Pergudangan Bandara Foresyndo LogisHub",
      scope: "MEP",
      issue: "Kabel grounding panel utama tersambung longgar, berpotensi sirkuit pendek harian.",
      status: "Rectified",
      issueResolved: "Kabel grounding telah di-tighten dengan klem tembaga ulir ganda.",
      inspector: "Teguh Santoso (Auditor MEP)",
      photoUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?q=80&w=600",
      remedyAction: "Cor grounding dibungkus semen tahan korosi khusus.",
      rectificationPhotoUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?q=80&w=600"
    }
  ]);

  // UI Utilities
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [userRole, setUserRole] = useState<ERPUserRole>("Super Admin");
  const [language, setLanguage] = useState<"ID" | "EN">("ID");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mutator Actions
  const handleAddProject = (newProj: Project) => {
    setProjects([newProj, ...projects]);
  };

  const handleUpdateProject = (projectId: string, updated: Partial<Project>) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updated } : p));
  };

  const handleAddTender = (newTender: Tender) => {
    setTenders([newTender, ...tenders]);
  };

  const handleAddBid = (newBid: TenderBid) => {
    setBids([newBid, ...bids]);
  };

  const handleUpdateTender = (id: string, updated: Partial<Tender>) => {
    setTenders(tenders.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const handleUpdateBid = (id: string, updated: Partial<TenderBid>) => {
    setBids(bids.map(b => b.id === id ? { ...b, ...updated } : b));
  };

  const handleAddBoqItem = (newItem: BOQItem) => {
    setBoqList([...boqList, newItem]);
  };

  const handleAddProgress = (newReport: WorkProgress) => {
    setProgressList([newReport, ...progressList]);
  };

  const handleApproveProgress = (reportId: string, projectId: string, scorePct: number) => {
    // 1. Update report status to Approved
    setProgressList(progressList.map(pr => pr.id === reportId ? { ...pr, status: "Approved" } : pr));
    // 2. Automatically sync back to Master Project physical completion %
    setProjects(projects.map(p => p.id === projectId ? { ...p, progressPhysical: scorePct } : p));
  };

  const handleRejectProgress = (id: string, status: "Rejected" | "Revision") => {
    setProgressList(progressList.map(pr => pr.id === id ? { ...pr, status } : pr));
  };

  const handleAddReport = (newLog: DailyReport) => {
    setReports([newLog, ...reports]);
  };

  const handleAddFinding = (finding: any) => {
    setQcList([finding, ...qcList]);
  };

  const handleUpdateFinding = (id: string, updated: Partial<any>) => {
    setQcList(qcList.map(q => q.id === id ? { ...q, ...updated } : q));
  };

  const handleAddVO = (newVO: VariationOrder) => {
    setVariationOrders([newVO, ...variationOrders]);
  };

  const handleUpdateVO = (id: string, updated: Partial<VariationOrder>) => {
    setVariationOrders(variationOrders.map(vo => {
      if (vo.id === id) {
        const merged = { ...vo, ...updated };
        // If VO is finalized by Director and is "Tambah" type, physically boost the Master Project Value contract!
        if (updated.status === "Direktur Approved") {
          const delta = vo.type === "Tambah" ? vo.amount : -vo.amount;
          setProjects(prevProjects => prevProjects.map(p => p.id === vo.projectId ? { ...p, value: p.value + delta } : p));
        }
        return merged;
      }
      return vo;
    }));
  };

  const handleAddTerm = (newTerm: PaymentTerm) => {
    setPaymentTerms([newTerm, ...paymentTerms]);
  };

  const handleUpdateTerm = (id: string, updated: Partial<PaymentTerm>) => {
    setPaymentTerms(paymentTerms.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const handleAddLog = (newLog: MaterialLog) => {
    setLogs([newLog, ...logs]);
    // Synchronize material stock balance!
    setMaterials(materials.map(m => {
      if (m.id === newLog.materialId) {
        const finalStock = newLog.type === "IN" 
          ? m.stock + newLog.quantity 
          : m.stock - newLog.quantity;
        return { ...m, stock: Math.max(0, finalStock) };
      }
      return m;
    }));
  };

  // Translations
  const t = {
    title: language === "ID" ? "FORSDIG Construction ERP" : "FORSDIG Construction ERP",
    tagline: language === "ID" ? "Digital Construction Management & Procurement System" : "Digital Enterprise Systems for Project Developers",
    ownerLabel: language === "ID" ? "DEVELOPER / OWNER PORTAL" : "LANDOWNER & DEVELOPER HUBS",
    dashboard: language === "ID" ? "Dashboard Eksekutif" : "Executive KPI Panel",
    master_proyek: language === "ID" ? "Master Proyek" : "Master Portfolios",
    tender: language === "ID" ? "Procurement & Tender" : "Procurement",
    boq: language === "ID" ? "RAB & Cost BOQ" : "RAB & BOQ",
    progress: language === "ID" ? "Progres Bulanan/Harian" : "Field Progress",
    site_report: language === "ID" ? "Buku Log Lapangan" : "Daily Logs",
    qc: language === "ID" ? "Quality Control (QC)" : "Quality & Safety",
    vo: language === "ID" ? "Change Orders (VO)" : "Change Orders",
    billing: language === "ID" ? "Invoice & Termin" : "Milestone Billings",
    materials: language === "ID" ? "Stok Bahan Logistik" : "Inventory Stock",
    assistant: language === "ID" ? "Gemini AI Asisten" : "Gemini AI Assistant"
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#0F4C81] selection:text-white">
      
      {/* Top Banner Staging */}
      <header className="bg-white border-b border-slate-200 shrink-0 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Brand Identity / Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F4C81] rounded-xl flex items-center justify-center border border-blue-400/20 shadow-md">
              <Brain className="text-white animate-pulse" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-[#0F4C81] tracking-tight font-sans">FORSDIG</h1>
                <span className="bg-[#0F4C81] text-[9px] uppercase tracking-wider text-white px-2.5 py-0.5 rounded font-mono font-bold">{t.ownerLabel}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-tight block">{t.tagline} ● PT. Foresyndo Global Indonesia</p>
            </div>
          </div>

          {/* Interactive Role & Language Swappers */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === "ID" ? "EN" : "ID")}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer font-medium text-slate-600 font-mono transition"
            >
              <Globe size={13} className="text-[#0F4C81]" />
              <span>{language === "ID" ? "Bahasa: ID" : "Language: EN"}</span>
            </button>

            {/* Simulated User Selector */}
            <div className="bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-lg flex items-center gap-2 text-slate-600 font-mono">
              <UserSquare size={13} className="text-[#0F4C81]" />
              <span>Role:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as ERPUserRole)}
                className="bg-transparent border-0 text-slate-800 font-bold cursor-pointer text-xs focus:outline-none focus:ring-0"
              >
                <option value="Super Admin" className="bg-white text-slate-800">Super Admin (All)</option>
                <option value="Direktur" className="bg-white text-slate-800">Direktur (Executive)</option>
                <option value="Project Director" className="bg-white text-slate-800">Project Director</option>
                <option value="Project Manager" className="bg-white text-slate-800">Project Manager</option>
                <option value="Pengawas Lapangan" className="bg-white text-slate-800">Pengawas Lapangan</option>
                <option value="Kontraktor" className="bg-white text-slate-800">Kontraktor Rec.</option>
                <option value="Quantity Surveyor" className="bg-white text-slate-800">Quantity Surveyor</option>
                <option value="Financial Controller" className="bg-white text-slate-800">Financial Controller</option>
              </select>
            </div>
          </div>

        </div>
      </header>

      {/* Main Area Workspace Layout */}
      <div className="flex-grow max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar Nav (3 cols of desktop grid) */}
        <nav className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm sticky top-20">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest block">Project Operations</span>
          <div className="space-y-1">
            {/* Tab 1 */}
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                activeTab === "dashboard" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
              }`}
            >
              <LayoutDashboard size={15} /> {t.dashboard}
            </button>

            {/* Tab 2 */}
            <button
              onClick={() => setActiveTab("master_proyek")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                activeTab === "master_proyek" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
              }`}
            >
              <FolderGit size={15} /> {t.master_proyek}
            </button>

            {/* Tab 3 */}
            <button
              onClick={() => setActiveTab("tender")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                activeTab === "tender" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
              }`}
            >
              <Handshake size={15} /> {t.tender}
            </button>

            {/* Tab 4 */}
            <button
              onClick={() => setActiveTab("boq")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                activeTab === "boq" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
              }`}
            >
              <Calculator size={15} /> {t.boq}
            </button>

            {/* Tab 5 */}
            <button
              onClick={() => setActiveTab("progress")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                activeTab === "progress" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
              }`}
            >
              <TrendingUp size={15} /> {t.progress}
            </button>

            {/* Tab 6 */}
            <button
              onClick={() => setActiveTab("site_report")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                activeTab === "site_report" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
              }`}
            >
              <CalendarDays size={15} /> {t.site_report}
            </button>

            {/* Tab 7 */}
            <button
              onClick={() => setActiveTab("qc")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                activeTab === "qc" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
              }`}
            >
              <FileCheck size={15} /> {t.qc}
            </button>

            {/* Tab 8 */}
            <button
              onClick={() => setActiveTab("vo")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                activeTab === "vo" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
              }`}
            >
              <GitCompare size={15} /> {t.vo}
            </button>

            {/* Tab 9 */}
            <button
              onClick={() => setActiveTab("billing")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                activeTab === "billing" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
              }`}
            >
              <Receipt size={15} /> {t.billing}
            </button>

            {/* Tab 10 */}
            <button
              onClick={() => setActiveTab("materials")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                activeTab === "materials" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
              }`}
            >
              <Box size={15} /> {t.materials}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest block">AI Co-Pilot</span>
            <button
              onClick={() => setActiveTab("assistant")}
              className={`w-full flex flex-col text-left p-4 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden shadow ${
                activeTab === "assistant" 
                  ? "bg-[#0F4C81]/10 text-[#0F4C81] border border-blue-200" 
                  : "bg-[#0F4C81] text-white hover:bg-[#0c3e6b] border border-transparent shadow-lg"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs">✨</span>
                <span className="text-xs font-extrabold tracking-wide uppercase">FORSDIG AI ASSISTANT</span>
              </div>
              <p className="text-[10px] leading-relaxed opacity-90 italic">
                "Klik untuk menganalisis anggaran BOQ, progres fisik, dan mitigasi semen."
              </p>
            </button>
          </div>
        </nav>

        {/* Content Viewer (9 cols of desktop grid) */}
        <main className="lg:col-span-9 space-y-6">
          {activeTab === "dashboard" && (
            <DashboardDirektur 
              projects={projects}
              contracts={[]}
              tenders={tenders}
              paymentTerms={paymentTerms}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "master_proyek" && (
            <MasterProyek 
              projects={projects}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              userRole={userRole}
            />
          )}

          {activeTab === "tender" && (
            <TenderProcurement 
              tenders={tenders}
              bids={bids}
              projects={projects}
              onAddTender={handleAddTender}
              onAddBid={handleAddBid}
              onUpdateTender={handleUpdateTender}
              onUpdateBid={handleUpdateBid}
              userRole={userRole}
            />
          )}

          {activeTab === "boq" && (
            <BoqRab 
              boqList={boqList}
              projects={projects}
              onAddBoqItem={handleAddBoqItem}
              userRole={userRole}
            />
          )}

          {activeTab === "progress" && (
            <WorkProgressDetails 
              progressList={progressList}
              projects={projects}
              onAddProgress={handleAddProgress}
              onApproveProgress={handleApproveProgress}
              onRejectProgress={handleRejectProgress}
              userRole={userRole}
            />
          )}

          {activeTab === "site_report" && (
            <SiteDailyReport 
              reports={reports}
              projects={projects}
              onAddReport={handleAddReport}
              userRole={userRole}
            />
          )}

          {activeTab === "qc" && (
            <QualityControlQC 
              qcList={qcList}
              projects={projects}
              onAddFinding={handleAddFinding}
              onUpdateFinding={handleUpdateFinding}
              userRole={userRole}
            />
          )}

          {activeTab === "vo" && (
            <ChangeOrders 
              variationOrders={variationOrders}
              projects={projects}
              onAddVO={handleAddVO}
              onUpdateVO={handleUpdateVO}
              userRole={userRole}
            />
          )}

          {activeTab === "billing" && (
            <BillingPayments 
              paymentTerms={paymentTerms}
              projects={projects}
              onAddTerm={handleAddTerm}
              onUpdateTerm={handleUpdateTerm}
              userRole={userRole}
            />
          )}

          {activeTab === "materials" && (
            <InventoryMaterialTracker 
              materials={materials}
              logs={logs}
              onAddLog={handleAddLog}
              userRole={userRole}
            />
          )}

          {activeTab === "assistant" && (
            <GeminiAssistant 
              projects={projects}
              boqList={boqList}
              bids={bids}
              progressList={progressList}
              reports={reports}
              materials={materials}
              variationOrders={variationOrders}
              paymentTerms={paymentTerms}
            />
          )}
        </main>

      </div>

      {/* Micro corporate footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-[11px] text-slate-500 font-mono tracking-wide shrink-0">
        <p>© 2026 PT. Foresyndo Global Indonesia. All secured enterprise rights reserved.</p>
        <span className="text-slate-400 block mt-1">FORSDIG Construction ERP v1.0.0 (SECURE E-STAMPING ACTIVATED)</span>
      </footer>

    </div>
  );
}
