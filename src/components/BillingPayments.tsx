import React, { useState } from "react";
import { PaymentTerm, Project, ERPUserRole } from "../types";
import { Plus, Check, FileText, Landmark, ShieldCheck, AlertTriangle, Coins } from "lucide-react";

interface BillingPaymentsProps {
  paymentTerms: PaymentTerm[];
  projects: Project[];
  onAddTerm: (term: PaymentTerm) => void;
  onUpdateTerm: (id: string, updated: Partial<PaymentTerm>) => void;
  userRole: ERPUserRole;
}

export const BillingPayments: React.FC<BillingPaymentsProps> = ({
  paymentTerms,
  projects,
  onAddTerm,
  onUpdateTerm,
  userRole
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");

  // Form State
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [value, setValue] = useState(0);
  const [targetDate, setTargetDate] = useState("2026-08-31");
  const [invoiceFile, setInvoiceFile] = useState("INV-Foresyndo-Term01.pdf");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || value <= 0) return;

    const matchedProject = projects.find(p => p.id === selectedProjectId);

    const newTerm: PaymentTerm = {
      id: `TRM-${Math.floor(100 + Math.random() * 900)}`,
      projectId: selectedProjectId,
      projectName: matchedProject?.name || "",
      name,
      percentage: Number(percentage),
      value: Number(value),
      targetDate,
      status: "Diajukan",
      invoiceUrl: "#",
      invoiceFile
    };

    onAddTerm(newTerm);
    setShowAddForm(false);
    setName("");
    setValue(0);
  };

  const handleCalculateValue = (pct: number) => {
    setPercentage(pct);
    const proj = projects.find(p => p.id === selectedProjectId);
    if (proj) {
      setValue(Math.round(proj.value * (pct / 100)));
    }
  };

  const currentTerms = paymentTerms.filter(t => !selectedProjectId || t.projectId === selectedProjectId);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Otorisasi Finansial & Termin Konstruksi</h2>
          <p className="text-xs text-slate-400">Verifikasi progres keuangan, pengajuan invoice kontraktor, dan e-sign approval termin direktur</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto font-sans">
          {["Kontraktor", "Super Admin", "Project Manager"].includes(userRole) && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition shadow-md w-full sm:w-auto"
            >
              <Plus size={16} /> Ajukan Tagihan Termin
            </button>
          )}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
          >
            <option value="">Semua Proyek</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Termin Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Daftar Pengajuan Invoice & Jadwal Pembayaran</h3>

        {currentTerms.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-xs italic">
            Belum ada termin tagihan diajukan untuk filter proyek terpilih.
          </div>
        ) : (
          <div className="space-y-4">
            {currentTerms.map(term => (
              <div key={term.id} className="bg-slate-950 border border-slate-850 rounded-xl p-5 hover:border-slate-800 transition flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                
                {/* Milestone Detail (Left) */}
                <div className="space-y-1.5 max-w-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">{term.id} ● {term.percentage}% PROGRESS VALUE</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      term.status === "Dibayar" ? "bg-emerald-950 text-emerald-300 border-emerald-900" :
                      term.status === "Disetujui" ? "bg-blue-950 text-blue-300 border-blue-900" :
                      term.status === "Verifikasi" ? "bg-amber-950 text-amber-400 border-amber-900" :
                      "bg-slate-950 text-slate-400 border-slate-850"
                    }`}>
                      {term.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white leading-tight">{term.name}</h4>
                  <p className="text-xs text-slate-400">Proyek: <strong className="text-slate-300">{term.projectName}</strong></p>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <FileText size={13} className="text-blue-400" />
                    <span>File Invoice: <strong className="text-slate-300 select-all">{term.invoiceFile || "lampiran.pdf"}</strong></span>
                  </div>
                </div>

                {/* Amount IDR (Center) */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 flex flex-col justify-center min-w-[200px]">
                  <span className="text-[9px] text-slate-500 font-mono uppercase font-semibold">Besaran Nilai Termin</span>
                  <span className="text-base font-mono text-emerald-400 font-bold tracking-tight">{formatCurrency(term.value)}</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">Jatuh Tempo: {term.targetDate}</span>
                </div>

                {/* E-Signature QR Section (For approved or paid states) */}
                {(term.status === "Disetujui" || term.status === "Dibayar") && (
                  <div className="bg-slate-900 border border-emerald-950/40 p-2.5 rounded-lg flex items-center gap-3 max-w-sm">
                    {/* Simulated QR block code */}
                    <div className="w-11 h-11 bg-white p-1 rounded shrink-0 flex flex-col justify-between border border-emerald-600/50">
                      <div className="grid grid-cols-3 gap-0.5 w-full h-full">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className={`w-full h-full ${i % 3 === 0 || i % 4 === 1 ? "bg-slate-900" : "bg-transparent"}`}></div>
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono leading-tight">
                      <span className="text-emerald-400 font-bold block">✓ FORESYNDO SECURE E-SIGN</span>
                      <p className="text-slate-400 mt-0.5">DISETUJUI OLEH RUPS / EXECUTIVE BOARD PT. FORESYNDO</p>
                      <span className="text-slate-500 uppercase">SIGN-ID: FORE-DISB-{term.id}</span>
                    </div>
                  </div>
                )}

                {/* Status verifications warnings */}
                {term.status === "Diajukan" && (
                  <div className="bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-lg text-amber-200 text-xs flex gap-2 max-w-xs">
                    <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={14} />
                    <span>Menunggu telaah kelengkapan legalitas dan korelasi progress fisik per bursa pengawas lapangan.</span>
                  </div>
                )}

                {/* Action controls (Right) */}
                <div className="flex flex-row lg:flex-col gap-2 justify-end">
                  {term.status === "Diajukan" && ["Super Admin", "Project Manager", "Site Engineer"].includes(userRole) && (
                    <button
                      onClick={() => onUpdateTerm(term.id, { status: "Verifikasi" })}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3 py-2 rounded-lg cursor-pointer transition shadow"
                    >
                      Verifikasi Lapangan & Finance
                    </button>
                  )}

                  {term.status === "Verifikasi" && ["Direktur", "Super Admin", "Project Director"].includes(userRole) && (
                    <button
                      onClick={() => onUpdateTerm(term.id, { status: "Disetujui" })}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition shadow flex items-center gap-1.5"
                    >
                      <ShieldCheck size={13} /> Otorisasi & E-Sign E-Stamp
                    </button>
                  )}

                  {term.status === "Disetujui" && ["Super Admin", "Financial Controller", "Direktur"].includes(userRole) && (
                    <button
                      onClick={() => onUpdateTerm(term.id, { status: "Dibayar" })}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition shadow"
                    >
                      Flag As Dibayar
                    </button>
                  )}

                  {term.status === "Dibayar" && (
                    <span className="text-emerald-400 font-bold font-mono text-xs flex items-center gap-1.5 bg-emerald-950 border border-emerald-950/80 px-3 py-2 rounded-lg shadow-inner">
                      🟢 LUNAS / DISBURSED
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add billing modal popup */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 text-slate-200 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-850 pb-2">Ajukan Permintaan Tagihan Invoice Termin</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Pilih Proyek Pekerjaan</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      setPercentage(0);
                      setValue(0);
                    }}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Nama / Milestone Termin *</label>
                  <input
                    type="text" required
                    placeholder="e.g. Termin II (Pekerjaan Atas)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Bobot Persentase (%) *</label>
                  <input
                    type="number" required min="1" max="100"
                    placeholder="e.g. 20"
                    value={percentage}
                    onChange={(e) => handleCalculateValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-mono text-emerald-400">Total Nominal Tagihan (Auto) *</label>
                  <input
                    type="number" required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nama Lampiran PDF Invoice</label>
                  <input
                    type="text"
                    value={invoiceFile}
                    onChange={(e) => setInvoiceFile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Estimasi Tanggal Jatuh Tempo</label>
                  <input
                    type="text"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
                <button type="button" onClick={() => setShowAddForm(false)} className="bg-slate-850 px-3 py-1.5 rounded text-slate-300">Batal</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-white font-bold">Kirim Tagihan</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
