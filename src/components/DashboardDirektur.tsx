import React from "react";
import { Project, Contract, Tender, PaymentTerm } from "../types";
import { TrendingUp, AlertTriangle, Building, Briefcase, FileText, CheckCircle2, DollarSign } from "lucide-react";

interface DashboardDirekturProps {
  projects: Project[];
  contracts: Contract[];
  tenders: Tender[];
  paymentTerms: PaymentTerm[];
  onNavigate: (tab: string) => void;
}

export const DashboardDirektur: React.FC<DashboardDirekturProps> = ({
  projects,
  contracts,
  tenders,
  paymentTerms,
  onNavigate
}) => {
  // Calculations
  const totalValue = projects.reduce((acc, p) => acc + p.value, 0);
  const activeProjectsCount = projects.filter(p => p.status === "Berjalan").length;
  const activeTendersCount = tenders.filter(t => t.status !== "Selesai").length;
  
  // Calculate outstanding payments from verified terms
  const outstandingPaymentsValue = paymentTerms
    .filter(p => p.status === "Verifikasi" || p.status === "Disetujui")
    .reduce((acc, p) => acc + p.value, 0);

  // Format Large IDR Currency
  const formatIDR = (val: number) => {
    if (val >= 1e12) return `Rp ${(val / 1e12).toFixed(2)} T`;
    if (val >= 1e9) return `Rp ${(val / 1e9).toFixed(1)} Miliar`;
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  // S-Curve Coordinates data (Months: Jan s/d Dec)
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const rencanaS = [5, 12, 22, 35, 48, 60, 70, 78, 85, 90, 95, 100];
  const realisasiS = [4, 10, 19, 31, 44, 52]; // Up to Jun

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0F4C81] to-[#1a66a8] rounded-2xl p-6 text-white border-0 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Building size={160} />
        </div>
        <div className="relative z-10">
          <span className="bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border border-white/20 font-mono">
            DASHBOARD EKSEKUTIF DIREKTUR
          </span>
          <h1 className="text-2xl font-sans font-bold mt-2.5 tracking-tight">
            Selamat Datang, Direktur PT. Foresyndo Global Indonesia
          </h1>
          <p className="text-blue-100 text-xs mt-1 max-w-2xl font-light">
            Sistem FORSDIG Construction ERP menyajikan analitik pengadaan, anggaran BOQ, progres fisik, dan status finansial di semua portofolio konstruksi aktif secara real-time.
          </p>
        </div>
      </div>

      {/* KPI Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-[#0F4C81] transition">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-[10px] font-bold tracking-wider uppercase">TOTAL INVES/NILAI PROYEK</span>
            <Building className="text-[#0F4C81]" size={18} />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-mono font-extrabold text-[#0F4C81] tracking-tight">
              {formatIDR(totalValue)}
            </h3>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 size={12} className="text-emerald-500" /> {projects.length} Proyek Terdaftar
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-[#0F4C81] transition">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-[10px] font-bold tracking-wider uppercase">PROYEK PIN NEGOSIASI KPI</span>
            <TrendingUp className="text-emerald-500" size={18} />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-mono font-extrabold text-slate-800 tracking-tight">
              {activeProjectsCount} Proyek Aktif
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Fase konstruksi berjalan intensif
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-[#0F4C81] transition">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-[10px] font-bold tracking-wider uppercase">PAKET TENDER procurement</span>
            <Briefcase className="text-blue-500" size={18} />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-mono font-extrabold text-slate-800 tracking-tight">
              {activeTendersCount} Tender Aktif
            </h3>
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 font-medium">
              <AlertTriangle size={12} className="text-amber-500" /> Menunggu evaluasi penawaran
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-[#0F4C81] transition">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-[10px] font-bold tracking-wider uppercase">TERMIN JATUH TEMPO</span>
            <DollarSign className="text-amber-500" size={18} />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-mono font-extrabold text-amber-600 tracking-tight">
              {formatIDR(outstandingPaymentsValue)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Butuh verifikasi & otorisasi Finance
            </p>
          </div>
        </div>
      </div>

      {/* Main Section: S-Curve Graph & Portfolio Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* S-Curve Chart (Left - 2cols) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:col-span-2 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-800">S-Curve Konsolidasi Proyek</h2>
              <p className="text-xs text-slate-500">Perbandingan Kumulatif Rencana Kerja (Target) vs Realisasi Konstruksi (%)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 bg-[#0F4C81] rounded-full inline-block"></span> Rencana
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span> Realisasi
              </span>
            </div>
          </div>

          {/* Graphical S-Curve Generator */}
          <div className="h-64 bg-slate-50 rounded-xl p-4 border border-slate-100 relative flex flex-col justify-between">
            {/* Background grids */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
              {[100, 75, 50, 25, 0].map((v, idx) => (
                <div key={idx} className="flex items-center w-full border-t border-slate-200/50 pb-1">
                  <span className="text-[9px] text-slate-400 font-mono w-8">{v}%</span>
                </div>
              ))}
            </div>

            {/* Custom Interactive SVG Line Plotting */}
            <svg className="w-full h-full absolute inset-0 pt-4 px-12 pb-4 overflow-visible z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Plot Rencana (Blue Line) */}
              <polyline
                fill="none"
                stroke="#0F4C81"
                strokeWidth="2.5"
                strokeLinecap="round"
                points={rencanaS.map((y, idx) => `${(idx / (rencanaS.length - 1)) * 100},${100 - y}`).join(" ")}
              />
              {/* Points for Rencana */}
              {rencanaS.map((y, idx) => (
                <circle
                  key={`r-${idx}`}
                  cx={(idx / (rencanaS.length - 1)) * 100}
                  cy={100 - y}
                  r="1.5"
                  fill="#0F4C81"
                  stroke="#93c5fd"
                  strokeWidth="1"
                />
              ))}

              {/* Plot Realisasi (Red/Amber Line) */}
              <polyline
                fill="none"
                stroke="#ef4444"
                strokeWidth="3.2"
                strokeLinecap="round"
                points={realisasiS.map((y, idx) => `${(idx / (rencanaS.length - 1)) * 100},${100 - y}`).join(" ")}
              />
              {/* Points for Realisasi */}
              {realisasiS.map((y, idx) => (
                <circle
                  key={`re-${idx}`}
                  cx={(idx / (rencanaS.length - 1)) * 100}
                  cy={100 - y}
                  r="2"
                  fill="#b91c1c"
                  stroke="#fca5a5"
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between pl-8 pr-1 mt-auto pt-1 border-t border-slate-200 z-20">
              {months.map((m, idx) => (
                <span key={m} className={`text-[10px] uppercase font-mono ${idx < realisasiS.length ? 'text-rose-600 font-bold' : 'text-slate-400 font-medium'}`}>
                  {m}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-xs text-rose-950">
            <AlertTriangle className="text-rose-600 shrink-0" size={18} />
            <div>
              <span className="font-bold">Indikator Deviasi Progres Lapangan</span>
              <p className="mt-0.5 text-rose-800 font-medium font-sans">
                Data kumulatif di atas merekam deviasi kumulatif sekitar <strong>-8% (keterlambatan)</strong> per bursa Juni 2026. Prioritas mobilisasi alat berat dan tenaga kerja lembur direkomendasikan untuk mengejar keterlambatan struktur atas.
              </p>
            </div>
          </div>
        </div>

        {/* Quick View: Projects List (Right - 1col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-800">Monitoring Portofolio</h2>
              <button 
                onClick={() => onNavigate("master_proyek")}
                className="text-xs text-[#0F4C81] hover:underline font-bold"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-4">
              {projects.map(p => (
                <div key={p.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-semibold text-slate-700 line-clamp-1">{p.name}</h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold font-mono tracking-wider ${
                      p.status === "Berjalan" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      p.status === "Tender" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{p.location}</p>
                  
                  {/* Progress bars */}
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[9px] text-slate-500 mb-0.5">
                        <span>Fisik</span>
                        <span className="font-mono text-emerald-600 font-bold">{p.progressPhysical}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${p.progressPhysical}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-slate-500 mb-0.5">
                        <span>Finansial</span>
                        <span className="font-mono text-blue-600 font-bold">{p.progressFinancial}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${p.progressFinancial}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[9px] text-slate-400 font-mono uppercase block mb-1">E-Signature & Keamanan</span>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>QR Code Verification Key:</span>
              <span className="text-emerald-600 font-semibold uppercase">FDIG-SECURED●2026</span>
            </div>
          </div>

        </div>
      </div>

      {/* Audit/Recent Activity Board */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-4 bg-white">Audit Logs & Dokumen Masuk Terbaru</h2>
        <div className="space-y-2.5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 rounded-xl border border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#0F4C81] font-bold">[SYSTEM]</span>
              <span className="text-slate-600">Contractor bid submitted for TEN-001 by PT. Krakatau Karya Jaya</span>
            </div>
            <span className="text-slate-400 text-[10px]">2026-06-01 10:45 UTC</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 rounded-xl border border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">[APPROVE]</span>
              <span className="text-slate-600">Daily progress report approved by PM for Apartemen Foresyndo Tower Mas</span>
            </div>
            <span className="text-slate-400 text-[10px]">2026-06-01 09:12 UTC</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 rounded-xl border border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-rose-600 font-bold">[VULNERABILITY CHECK]</span>
              <span className="text-slate-600">E-Signature validation token checked; Status of QR verified</span>
            </div>
            <span className="text-slate-400 text-[10px]">2026-06-01 08:30 UTC</span>
          </div>
        </div>
      </div>

    </div>
  );
};
