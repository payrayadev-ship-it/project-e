import React, { useState, useEffect } from "react";
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

// Firebase Imports
import { collection, doc, setDoc, onSnapshot, getDocs, getDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";

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
import { LoginScreen } from "./components/LoginScreen";
import { ContractorDashboard } from "./components/ContractorDashboard";

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
  UserSquare,
  LogOut
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("forsdig_is_logged_in") === "true";
  });
  const [userRole, setUserRole] = useState<ERPUserRole>(() => {
    return (localStorage.getItem("forsdig_user_role") as ERPUserRole) || "Super Admin";
  });
  const [loggedUserName, setLoggedUserName] = useState<string>(() => {
    return localStorage.getItem("forsdig_user_name") || "Administrator";
  });
  const [loggedUserEmail, setLoggedUserEmail] = useState<string>(() => {
    return localStorage.getItem("forsdig_user_email") || "admin@foresyndo.com";
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    const role = localStorage.getItem("forsdig_user_role") || "Super Admin";
    return role === "Kontraktor" ? "contractor_dashboard" : "dashboard";
  });
  const [language, setLanguage] = useState<"ID" | "EN">("ID");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Login handler
  const handleLogin = (role: ERPUserRole, name: string, email: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setLoggedUserName(name);
    setLoggedUserEmail(email);
    localStorage.setItem("forsdig_is_logged_in", "true");
    localStorage.setItem("forsdig_user_role", role);
    localStorage.setItem("forsdig_user_name", name);
    localStorage.setItem("forsdig_user_email", email);

    if (role === "Kontraktor") {
      setActiveTab("contractor_dashboard");
    } else {
      setActiveTab("dashboard");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("forsdig_is_logged_in");
    localStorage.removeItem("forsdig_user_role");
    localStorage.removeItem("forsdig_user_name");
    localStorage.removeItem("forsdig_user_email");
    setLoggedUserName("");
    setLoggedUserEmail("");
  };

  // Enforce contractor tab restriction recursively
  useEffect(() => {
    if (isLoggedIn && userRole === "Kontraktor" && !["contractor_dashboard", "progress", "site_report", "tender"].includes(activeTab)) {
      setActiveTab("contractor_dashboard");
    }
  }, [userRole, activeTab, isLoggedIn]);

  // Seeding helper to pre-fill Firestore if empty
  const seedCollectionIfEmpty = async (collName: string, initialData: any[]) => {
    try {
      const snapshot = await getDocs(collection(db, collName)).catch((err) => {
        handleFirestoreError(err, OperationType.GET, collName);
      });
      if (snapshot && snapshot.empty) {
        console.log(`Seeding Firestore collection '${collName}' with ${initialData.length} items.`);
        for (const item of initialData) {
          const docId = item.id || doc(collection(db, collName)).id;
          await setDoc(doc(db, collName, docId), item).catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, `${collName}/${docId}`);
          });
        }
      }
    } catch (err) {
      console.error(`Error seeding ${collName}:`, err);
    }
  };

  // Setup Firebase Real-time listeners and authentication on mount
  useEffect(() => {
    // 1. Authenticate anonymously in the background; catch and log warning if restricted by console settings
    signInAnonymously(auth)
      .then((cred) => {
        console.log("Authenticated with Firebase anonymously: ", cred.user.uid);
      })
      .catch((err) => {
        console.warn("Anonymous authentication is restricted or disabled in the Firebase console: ", err.message);
      });

    // 2. Set up Firestore initialization regardless of current auth credentials
    console.log("Initializing real-time Firestore synchronization...");

    // Asynchronously seed empty collections so the app starts with nice data
    seedCollectionIfEmpty("projects", INITIAL_PROJECTS);
    seedCollectionIfEmpty("boq", INITIAL_BOQ);
    seedCollectionIfEmpty("tenders", INITIAL_TENDERS);
    seedCollectionIfEmpty("tender_bids", INITIAL_BIDS);
    seedCollectionIfEmpty("work_progress", INITIAL_PROGRESS);
    seedCollectionIfEmpty("daily_reports", INITIAL_DAILY_REPORTS);
    seedCollectionIfEmpty("quality_control", [
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
    seedCollectionIfEmpty("variation_orders", INITIAL_CHANGE_ORDERS);
    seedCollectionIfEmpty("payment_terms", INITIAL_PAYMENT_TERMS);
    seedCollectionIfEmpty("material_stocks", INITIAL_MATERIAL_STOCKS);
    seedCollectionIfEmpty("material_logs", INITIAL_MATERIAL_LOGS);

    // Listeners setup
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      const list: Project[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Project);
      });
      setProjects(list);
    }, (err) => {
      console.warn("Firestore projects snapshot failed:", err.message);
    });

    const unsubBoq = onSnapshot(collection(db, "boq"), (snapshot) => {
      const list: BOQItem[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as BOQItem);
      });
      setBoqList(list);
    }, (err) => {
      console.warn("Firestore boq snapshot failed:", err.message);
    });

    const unsubTenders = onSnapshot(collection(db, "tenders"), (snapshot) => {
      const list: Tender[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Tender);
      });
      setTenders(list);
    }, (err) => {
      console.warn("Firestore tenders snapshot failed:", err.message);
    });

    const unsubBids = onSnapshot(collection(db, "tender_bids"), (snapshot) => {
      const list: TenderBid[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as TenderBid);
      });
      setBids(list);
    }, (err) => {
      console.warn("Firestore tender_bids snapshot failed:", err.message);
    });

    const unsubProgress = onSnapshot(collection(db, "work_progress"), (snapshot) => {
      const list: WorkProgress[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as WorkProgress);
      });
      setProgressList(list);
    }, (err) => {
      console.warn("Firestore work_progress snapshot failed:", err.message);
    });

    const unsubReports = onSnapshot(collection(db, "daily_reports"), (snapshot) => {
      const list: DailyReport[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as DailyReport);
      });
      setReports(list);
    }, (err) => {
      console.warn("Firestore daily_reports snapshot failed:", err.message);
    });

    const unsubQC = onSnapshot(collection(db, "quality_control"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
      });
      setQcList(list);
    }, (err) => {
      console.warn("Firestore quality_control snapshot failed:", err.message);
    });

    const unsubVO = onSnapshot(collection(db, "variation_orders"), (snapshot) => {
      const list: VariationOrder[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as VariationOrder);
      });
      setVariationOrders(list);
    }, (err) => {
      console.warn("Firestore variation_orders snapshot failed:", err.message);
    });

    const unsubPaymentTerms = onSnapshot(collection(db, "payment_terms"), (snapshot) => {
      const list: PaymentTerm[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as PaymentTerm);
      });
      setPaymentTerms(list);
    }, (err) => {
      console.warn("Firestore payment_terms snapshot failed:", err.message);
    });

    const unsubMaterials = onSnapshot(collection(db, "material_stocks"), (snapshot) => {
      const list: MaterialStock[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as MaterialStock);
      });
      setMaterials(list);
    }, (err) => {
      console.warn("Firestore material_stocks snapshot failed:", err.message);
    });

    const unsubLogs = onSnapshot(collection(db, "material_logs"), (snapshot) => {
      const list: MaterialLog[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as MaterialLog);
      });
      setLogs(list);
    }, (err) => {
      console.warn("Firestore material_logs snapshot failed:", err.message);
    });

    return () => {
      unsubProjects();
      unsubBoq();
      unsubTenders();
      unsubBids();
      unsubProgress();
      unsubReports();
      unsubQC();
      unsubVO();
      unsubPaymentTerms();
      unsubMaterials();
      unsubLogs();
    };
  }, []);

  // Mutator Actions back-seeded to Firestore
  const handleAddProject = async (newProj: Project) => {
    try {
      await setDoc(doc(db, "projects", newProj.id), newProj);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `projects/${newProj.id}`);
    }
  };

  const handleUpdateProject = async (projectId: string, updated: Partial<Project>) => {
    try {
      await setDoc(doc(db, "projects", projectId), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `projects/${projectId}`);
    }
  };

  const handleAddTender = async (newTender: Tender) => {
    try {
      await setDoc(doc(db, "tenders", newTender.id), newTender);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tenders/${newTender.id}`);
    }
  };

  const handleAddBid = async (newBid: TenderBid) => {
    try {
      await setDoc(doc(db, "tender_bids", newBid.id), newBid);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tender_bids/${newBid.id}`);
    }
  };

  const handleUpdateTender = async (id: string, updated: Partial<Tender>) => {
    try {
      await setDoc(doc(db, "tenders", id), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tenders/${id}`);
    }
  };

  const handleUpdateBid = async (id: string, updated: Partial<TenderBid>) => {
    try {
      await setDoc(doc(db, "tender_bids", id), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tender_bids/${id}`);
    }
  };

  const handleAddBoqItem = async (newItem: BOQItem) => {
    try {
      await setDoc(doc(db, "boq", newItem.id), newItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `boq/${newItem.id}`);
    }
  };

  const handleAddProgress = async (newReport: WorkProgress) => {
    try {
      await setDoc(doc(db, "work_progress", newReport.id), newReport);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `work_progress/${newReport.id}`);
    }
  };

  const handleApproveProgress = async (reportId: string, projectId: string, scorePct: number) => {
    try {
      await setDoc(doc(db, "work_progress", reportId), { status: "Approved" }, { merge: true });
      await setDoc(doc(db, "projects", projectId), { progressPhysical: scorePct }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `work_progress/${reportId}`);
    }
  };

  const handleRejectProgress = async (id: string, status: "Rejected" | "Revision") => {
    try {
      await setDoc(doc(db, "work_progress", id), { status }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `work_progress/${id}`);
    }
  };

  const handleAddReport = async (newLog: DailyReport) => {
    try {
      await setDoc(doc(db, "daily_reports", newLog.id), newLog);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `daily_reports/${newLog.id}`);
    }
  };

  const handleAddFinding = async (finding: any) => {
    try {
      await setDoc(doc(db, "quality_control", finding.id), finding);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quality_control/${finding.id}`);
    }
  };

  const handleUpdateFinding = async (id: string, updated: Partial<any>) => {
    try {
      await setDoc(doc(db, "quality_control", id), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quality_control/${id}`);
    }
  };

  const handleAddVO = async (newVO: VariationOrder) => {
    try {
      await setDoc(doc(db, "variation_orders", newVO.id), newVO);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `variation_orders/${newVO.id}`);
    }
  };

  const handleUpdateVO = async (id: string, updated: Partial<VariationOrder>) => {
    try {
      await setDoc(doc(db, "variation_orders", id), updated, { merge: true });
      if (updated.status === "Direktur Approved") {
        const docSnapVO = await getDoc(doc(db, "variation_orders", id));
        if (docSnapVO.exists()) {
          const vo = docSnapVO.data() as VariationOrder;
          const delta = vo.type === "Tambah" ? vo.amount : -vo.amount;
          const docSnapProj = await getDoc(doc(db, "projects", vo.projectId));
          if (docSnapProj.exists()) {
            const proj = docSnapProj.data() as Project;
            await setDoc(doc(db, "projects", vo.projectId), { value: proj.value + delta }, { merge: true });
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `variation_orders/${id}`);
    }
  };

  const handleAddTerm = async (newTerm: PaymentTerm) => {
    try {
      await setDoc(doc(db, "payment_terms", newTerm.id), newTerm);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `payment_terms/${newTerm.id}`);
    }
  };

  const handleUpdateTerm = async (id: string, updated: Partial<PaymentTerm>) => {
    try {
      await setDoc(doc(db, "payment_terms", id), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `payment_terms/${id}`);
    }
  };

  const handleAddLog = async (newLog: MaterialLog) => {
    try {
      await setDoc(doc(db, "material_logs", newLog.id), newLog);
      const docSnap = await getDoc(doc(db, "material_stocks", newLog.materialId));
      if (docSnap.exists()) {
        const m = docSnap.data() as MaterialStock;
        const finalStock = newLog.type === "IN" 
          ? m.stock + newLog.quantity 
          : m.stock - newLog.quantity;
        const updatedStock = Math.max(0, finalStock);
        await setDoc(doc(db, "material_stocks", m.id), { ...m, stock: updatedStock });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `material_logs/${newLog.id}`);
    }
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

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        language={language} 
        setLanguage={setLanguage} 
      />
    );
  }

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
                <span className="bg-[#0F4C81] text-[9px] uppercase tracking-wider text-white px-2.5 py-0.5 rounded font-mono font-bold">
                  {userRole === "Kontraktor" ? (language === "ID" ? "PORTAL REKANAN KONTRAKTOR" : "CONTRACTOR WORKSPACE") : t.ownerLabel}
                </span>
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

            {/* Authenticated User Session Panel */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 pl-3 pr-2.5 py-1.5 rounded-xl font-mono">
              <div className="flex flex-col text-right">
                <span className="text-[11px] font-extrabold text-[#0F4C81] leading-tight block">{loggedUserName}</span>
                <span className="text-[9px] text-slate-500 font-semibold leading-none uppercase mt-0.5 tracking-wider block">Role: {userRole}</span>
              </div>
              
              <div className="w-px h-6 bg-slate-200"></div>

              <button
                onClick={handleLogout}
                title={language === "ID" ? "Keluar Sistem" : "Sign Out Portal"}
                className="bg-red-50 hover:bg-red-100 hover:text-red-700 text-red-600 transition p-1.5 rounded-lg cursor-pointer flex items-center justify-center border border-red-100 animate-fade-in"
              >
                <LogOut size={13} />
              </button>
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
            {/* Contractor Dashboard - Only for Contractor */}
            {userRole === "Kontraktor" && (
              <button
                onClick={() => setActiveTab("contractor_dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                  activeTab === "contractor_dashboard" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
                }`}
              >
                <LayoutDashboard size={15} /> {language === "ID" ? "Dashboard Kontraktor" : "Contractor Dashboard"}
              </button>
            )}

            {/* Tab 1 */}
            {userRole !== "Kontraktor" && (
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                  activeTab === "dashboard" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
                }`}
              >
                <LayoutDashboard size={15} /> {t.dashboard}
              </button>
            )}

            {/* Tab 2 */}
            {userRole !== "Kontraktor" && (
              <button
                onClick={() => setActiveTab("master_proyek")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                  activeTab === "master_proyek" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
                }`}
              >
                <FolderGit size={15} /> {t.master_proyek}
              </button>
            )}

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
            {userRole !== "Kontraktor" && (
              <button
                onClick={() => setActiveTab("boq")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                  activeTab === "boq" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
                }`}
              >
                <Calculator size={15} /> {t.boq}
              </button>
            )}

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
            {userRole !== "Kontraktor" && (
              <button
                onClick={() => setActiveTab("qc")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                  activeTab === "qc" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
                }`}
              >
                <FileCheck size={15} /> {t.qc}
              </button>
            )}

            {/* Tab 8 */}
            {userRole !== "Kontraktor" && (
              <button
                onClick={() => setActiveTab("vo")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                  activeTab === "vo" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
                }`}
              >
                <GitCompare size={15} /> {t.vo}
              </button>
            )}

            {/* Tab 9 */}
            {userRole !== "Kontraktor" && (
              <button
                onClick={() => setActiveTab("billing")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                  activeTab === "billing" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
                }`}
              >
                <Receipt size={15} /> {t.billing}
              </button>
            )}

            {/* Tab 10 */}
            {userRole !== "Kontraktor" && (
              <button
                onClick={() => setActiveTab("materials")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
                  activeTab === "materials" ? "bg-slate-50 text-[#0F4C81] border border-slate-100 shadow-sm font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81]"
                }`}
              >
                <Box size={15} /> {t.materials}
              </button>
            )}
          </div>

          {userRole !== "Kontraktor" && (
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
          )}
        </nav>

        {/* Content Viewer (9 cols of desktop grid) */}
        <main className="lg:col-span-9 space-y-6">
          {activeTab === "contractor_dashboard" && (
            <ContractorDashboard 
              loggedUserName={loggedUserName}
              loggedUserEmail={loggedUserEmail}
              userRole={userRole}
              projects={projects}
              tenders={tenders}
              bids={bids}
              progressList={progressList}
              reports={reports}
              onNavigate={setActiveTab}
              language={language}
            />
          )}

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
              language={language}
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
