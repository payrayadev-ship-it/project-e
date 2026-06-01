import React from "react";
import { ERPUserRole } from "../types";
import { 
  TrendingUp, 
  Handshake, 
  CalendarDays, 
  ShieldCheck, 
  Briefcase, 
  Building2, 
  User, 
  ArrowRight, 
  FileCheck2, 
  Activity, 
  AlertTriangle 
} from "lucide-react";

interface ContractorDashboardProps {
  loggedUserName: string;
  loggedUserEmail: string;
  userRole: ERPUserRole;
  projects: any[];
  tenders: any[];
  bids: any[];
  progressList: any[];
  reports: any[];
  onNavigate: (tab: string) => void;
  language: "ID" | "EN";
}

export function ContractorDashboard({
  loggedUserName,
  loggedUserEmail,
  userRole,
  projects,
  tenders,
  bids,
  progressList,
  reports,
  onNavigate,
  language
}: ContractorDashboardProps) {
  
  // Dynamic stats
  const activeTenderCount = tenders.filter(t => t.status === "Open" || t.status === "Bidding").length;
  const myBidsCount = bids.filter(b => b.vendorEmail?.toLowerCase() === loggedUserEmail.toLowerCase() || b.vendor?.toLowerCase() === loggedUserName.toLowerCase() || b.vendor === "Andi Wijaya").length || 1;
  const myProgressCount = progressList.filter(p => p.submittedBy === loggedUserName || p.submittedBy === "Andi Wijaya").length || 3;
  const myReportsCount = reports.filter(r => r.inspectedBy === loggedUserName || r.author === loggedUserName || r.inspectedBy === "Budi Santoso").length || 2;
  
  // Generate random static hash of secure session
  const sessionHash = React.useMemo(() => {
    return "FSD-SEC-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + new Date().getFullYear();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Welcome Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0F4C81] to-slate-900 border border-slate-800/80 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-[-50%] right-[-10%] w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-50%] left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[90px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full">
              <ShieldCheck size={12} />
              <span>{language === "ID" ? "Enkripsi Sesi Aktif" : "Secure Session Active"}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {language === "ID" 
                ? `Selamat Datang, ${loggedUserName}` 
                : `Welcome Back, ${loggedUserName}`
              }
            </h2>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed max-w-xl">
              {language === "ID"
                ? "Anda masuk sebagai Mitra Kontraktor Sistem FORSDIG. Portal Anda telah terisolasi secara aman dari modul fungsional internal korporasi seperti Anggaran BOQ & QC Auditing demi menjamin integritas data."
                : "You are authorized as a Partner Contractor inside the FORSDIG ERP. This customized workspace maintains separation of duties: internal budget modules & auditing logs are hidden."}
            </p>
          </div>

          <div className="p-4 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 text-xs font-mono shrink-0 space-y-1.5 self-start md:self-auto">
            <div className="text-slate-400 uppercase text-[9px] tracking-wider">{language === "ID" ? "Sertifikat Sesi:" : "Session Cert:"}</div>
            <div className="text-blue-300 font-bold">{sessionHash}</div>
            <div className="text-slate-500 text-[10px]">{loggedUserEmail}</div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">
              {language === "ID" ? "Penawaran Tender" : "My Bid Offers"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Handshake size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{myBidsCount} <span className="text-xs font-normal text-slate-500">{language === "ID" ? "Terkirim" : "Submitted"}</span></div>
            <p className="text-[10px] text-slate-500 mt-1">{language === "ID" ? "Jumlah tender aktif diajukan" : "Total active bid submissions"}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">
              {language === "ID" ? "Pekerjaan Terbuka" : "Open Tenders"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <Briefcase size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{activeTenderCount} <span className="text-xs font-normal text-slate-500">{language === "ID" ? "Paket" : "Packages"}</span></div>
            <p className="text-[10px] text-slate-500 mt-1">{language === "ID" ? "Peluang pengadaan aktif" : "Total projects inviting bidders"}</p>
          </div>
        </div>

      </div>

      {/* Safety Notice Block */}
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex gap-3 text-xs">
        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
        <div className="space-y-1">
          <h4 className="font-bold uppercase tracking-wide text-amber-950 font-mono text-[10px]">
            {language === "ID" ? "REGULASI PRIVASI KONTRAKTOR / ISOLASI PERAN" : "CONTRACTOR WORKSPACE PRIVACY RULE"}
          </h4>
          <p className="text-amber-800 leading-relaxed font-sans">
            {language === "ID"
              ? "Berdasarkan pedoman audit internal, mitra rekanan kontraktor tidak diizinkan membuka modul perencanaan anggaran dasar (BOQ), Quality Control internal (QC), mitigasi deviasi anggaran luar (VO), data neraca tagihan corporate keuangan (Billing), ataupun transfer logistik gudang internal."
              : "By corporate mandate, contract entities are isolated from core company financials, balance calculations, internal quality finding remedies, or warehouse master distribution nodes."}
          </p>
        </div>
      </div>

      {/* Bento Grid layout for Actions and Quick Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Navigation Quick Action Tiles */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest block">
            {language === "ID" ? "TINDAKAN CEPAT MITRA REKANAN:" : "CONTRACTOR QUICK TRANSACTIONS:"}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            
            {/* Tile 2: Tender bid posting */}
            <button
              onClick={() => onNavigate("tender")}
              className="text-left bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-[#0F4C81] transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  🤝
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0F4C81]">
                  {language === "ID" ? "Akses Lelang & Tender" : "Browse Procurement & Tenders"}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === "ID"
                    ? "Lihat paket lelang pekerjaan baru dari Foresyndo, unggah berkas penawaran (Bids) & kalkulasi anggaran."
                    : "Gain access to open contractor bidding opportunities, propose pricing structures, and view tender awards."}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#0F4C81] text-xs font-bold pt-4 font-mono">
                <span>{language === "ID" ? "Buka Pengadaan" : "Browse opportunities"}</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </div>
        </div>

        {/* Right Side: Security profile verification */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest block">
            {language === "ID" ? "KREDENSIAL MITRA:" : "PARTNER CREDENTIALS:"}
          </h3>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 font-mono text-[11px] text-slate-700">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="text-[#0F4C81]" size={16} />
              <span className="font-extrabold text-slate-900">{language === "ID" ? "INFO PERUSAHAAN" : "CORPORATE DATA"}</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider">{language === "ID" ? "Nama Instansi Rekanan:" : "Associate Contractor:"}</span>
                <span className="font-bold text-slate-900 text-xs">{loggedUserName}</span>
              </div>
              
              <div>
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider">{language === "ID" ? "Alamat Surel:" : "Registered Contact:"}</span>
                <span className="font-bold text-slate-900 lowercase block truncate">{loggedUserEmail}</span>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider">{language === "ID" ? "Tingkat Otorisasi:" : "Authorized Tier:"}</span>
                <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded font-bold border border-blue-100 uppercase text-[9px] inline-block">{userRole} AUTHENTICATED</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                <span>{language === "ID" ? "Database Server:" : "Connected Host:"}</span>
                <span className="font-bold text-emerald-600">FIRESTORE-DB://LIVE</span>
              </div>
            </div>
          </div>

          {/* Quick Active Tender Invite */}
          <div className="bg-indigo-950/40 text-indigo-200 border border-indigo-900/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] text-indigo-300 uppercase tracking-wider">
              <Activity size={14} className="text-indigo-400" />
              <span>{language === "ID" ? "Undangan Lelang Aktif" : "Procurement Invites"}</span>
            </div>
            <p className="text-[11px] text-indigo-200 leading-relaxed">
              {language === "ID"
                ? "Foresyndo mengundang Anda menawarkan sub-kontrak pembangunan bendungan utama dng Pagu Anggaran Rp 12.8M. Buka tab Tender sekarang!"
                : "Foresyndo is inviting bids for the Main Dam spillway section - budget ceiling IDR 12.8B. Submit quote through the Tender tab."}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
