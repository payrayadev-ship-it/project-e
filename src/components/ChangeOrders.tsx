import React, { useState } from "react";
import { VariationOrder, Project, ERPUserRole } from "../types";
import { Plus, Check, ArrowRight, UserCheck, AlertTriangle, Coins } from "lucide-react";

interface ChangeOrdersProps {
  variationOrders: VariationOrder[];
  projects: Project[];
  onAddVO: (vo: VariationOrder) => void;
  onUpdateVO: (id: string, updated: Partial<VariationOrder>) => void;
  userRole: ERPUserRole;
}

export const ChangeOrders: React.FC<ChangeOrdersProps> = ({
  variationOrders,
  projects,
  onAddVO,
  onUpdateVO,
  userRole
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"Tambah" | "Kurang" | "Perubahan Spesifikasi">("Tambah");
  const [amount, setAmount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    const matchedProject = projects.find(p => p.id === selectedProjectId);

    const newVO: VariationOrder = {
      id: `VO-${Math.floor(100 + Math.random() * 900)}`,
      projectId: selectedProjectId,
      projectName: matchedProject?.name || "",
      contractorId: "CONT-GUEST",
      contractorName: "PT. Krakatau Karya Jaya (Rekanan)",
      title,
      type,
      amount: Number(amount),
      status: "Submitted",
      createdAt: new Date().toLocaleDateString("id-ID")
    };

    onAddVO(newVO);
    setShowAddForm(false);
    setTitle("");
    setAmount(0);
  };

  const currentVOs = variationOrders.filter(v => !selectedProjectId || v.projectId === selectedProjectId);

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
          <h2 className="text-xl font-semibold text-white tracking-tight">Change Order & Variation Order (VO)</h2>
          <p className="text-xs text-slate-400">Kelola amandemen nilai kontrak berupa pekerjaan tambah/kurang atau revisi mutu spesifikasi material</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {["Kontraktor", "Super Admin", "Project Manager"].includes(userRole) && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition shadow-md w-full sm:w-auto"
            >
              <Plus size={16} /> Ajukan Amandemen (VO)
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

      {/* Variation Orders List */}
      <div className="space-y-4">
        {currentVOs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
            Belum ada permintaan Variation Order (VO) berkas amandemen terdaftar pada proyek ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {currentVOs.map(vo => {
              // Visual progress bar steps
              const steps = [
                { name: "Diajukan", active: ["Submitted", "Project Manager Approved", "Direktur Approved"].includes(vo.status) },
                { name: "Manager Approved", active: ["Project Manager Approved", "Direktur Approved"].includes(vo.status) },
                { name: "Direktur Approved (Aktif)", active: vo.status === "Direktur Approved" }
              ];

              return (
                <div key={vo.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition flex flex-col md:flex-row justify-between md:items-center gap-6">
                  
                  {/* VO Specs (Left) */}
                  <div className="space-y-2 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-indigo-400 font-mono font-bold">{vo.id}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        vo.type === "Tambah" ? "bg-emerald-950 text-emerald-400 border-emerald-900" :
                        vo.type === "Kurang" ? "bg-red-950 text-red-400 border-red-900" :
                        "bg-blue-950 text-blue-300 border-blue-900"
                      }`}>
                        Pekerjaan {vo.type}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{vo.title}</h3>
                    <p className="text-xs text-slate-400">Proyek: <strong className="text-slate-300">{vo.projectName}</strong> | Kontraktor: <strong className="text-slate-300">{vo.contractorName}</strong></p>
                    
                    <div className="flex items-center gap-2 text-sm font-mono text-emerald-400 font-bold bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-850 self-start w-fit">
                      <Coins size={14} className="text-emerald-500" />
                      <span>{formatCurrency(vo.amount)}</span>
                    </div>
                  </div>

                  {/* Stepper progress (Center) */}
                  <div className="flex items-center gap-3">
                    {steps.map((st, idx) => (
                      <React.Fragment key={idx}>
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border font-bold ${
                            st.active 
                              ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                              : "bg-slate-950 text-slate-500 border-slate-850"
                          }`}>
                            {idx + 1}
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono mt-1 text-center font-bold tracking-tight">{st.name}</span>
                        </div>
                        {idx < steps.length - 1 && (
                          <ArrowRight size={14} className={steps[idx+1].active ? "text-blue-500 animate-pulse" : "text-slate-700"} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Action buttons (Right) */}
                  <div className="flex flex-row md:flex-col gap-2 justify-end">
                    {vo.status === "Submitted" && ["Project Manager", "Super Admin"].includes(userRole) && (
                      <button
                        onClick={() => onUpdateVO(vo.id, { status: "Project Manager Approved" })}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition shadow"
                      >
                        Approve (PM)
                      </button>
                    )}

                    {vo.status === "Project Manager Approved" && ["Direktur", "Project Director", "Super Admin"].includes(userRole) && (
                      <button
                        onClick={() => onUpdateVO(vo.id, { status: "Direktur Approved" })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition shadow"
                      >
                        Approve (Direktur)
                      </button>
                    )}

                    {vo.status === "Direktur Approved" && (
                      <span className="text-emerald-400 font-bold font-mono text-xs flex items-center gap-1 bg-emerald-950 border border-emerald-900 px-3 py-1.5 rounded-lg">
                        🟢 AMANDEMEN AKTIF (SIGNED)
                      </span>
                    )}

                    {["Submitted", "Project Manager Approved"].includes(vo.status) && (
                      <button
                        onClick={() => onUpdateVO(vo.id, { status: "Rejected" })}
                        className="text-red-400 hover:text-white bg-red-950/20 hover:bg-red-900 text-xs px-3 py-1.5 rounded-lg font-bold cursor-pointer transition"
                      >
                        Tolak
                      </button>
                    )}

                    {vo.status === "Rejected" && (
                      <span className="text-red-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                        ❌ Batal/Ditolak
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add VO Dialogpopup form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 text-slate-200 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-850 pb-2">Ajukan Permintaan Amandemen Pekerjaan (VO)</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="text-slate-400 block mb-1 font-sans">Pilih Proyek Konstruksi</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Judul Amandemen / Modifikasi Proyek *</label>
                <input
                  type="text" required
                  placeholder="e.g. Tambah Pekerjaan Borepile Basement B3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-sans">
                <div>
                  <label className="text-slate-400 block mb-1">Tipe Penyesuaian</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white"
                  >
                    <option value="Tambah">Pekerjaan Tambah +</option>
                    <option value="Kurang">Pekerjaan Kurang -</option>
                    <option value="Perubahan Spesifikasi">Perubahan Spesifikasi (Re-Spec)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-mono text-emerald-400">Nilai Anggaran Amandemen (Rupiah) *</label>
                  <input
                    type="number" required
                    placeholder="Nilai Amandemen IDR"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
                <button type="button" onClick={() => setShowAddForm(false)} className="bg-slate-850 px-3 py-1.5 rounded text-slate-300">Batal</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-white font-bold">Kirim Ajuan VO</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
