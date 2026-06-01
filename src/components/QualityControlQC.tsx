import React, { useState } from "react";
import { QualityControl, Project, ERPUserRole } from "../types";
import { Plus, CheckSquare, ShieldCheck, HeartCrack, ScanText, RefreshCw } from "lucide-react";

interface QualityControlQCProps {
  qcList: QualityControl[];
  projects: Project[];
  onAddFinding: (finding: QualityControl) => void;
  onUpdateFinding: (id: string, updated: Partial<QualityControl>) => void;
  userRole: ERPUserRole;
}

export const QualityControlQC: React.FC<QualityControlQCProps> = ({
  qcList,
  projects,
  onAddFinding,
  onUpdateFinding,
  userRole
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");

  // Form State
  const [scope, setScope] = useState<"Struktur" | "Arsitektur" | "MEP" | "Infrastruktur">("Struktur");
  const [issue, setIssue] = useState("");
  const [inspector, setInspector] = useState("Hadi Wicaksono (Senior Auditor QCPT Foresyndo)");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600");

  // Remedial action input state per item
  const [activeRemedyId, setActiveRemedyId] = useState<string | null>(null);
  const [remedyText, setRemedyText] = useState("");
  const [rectificationUrl, setRectificationUrl] = useState("https://images.unsplash.com/photo-1581094288338-2314dddb7eed?q=80&w=600");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue) return;

    const matchedProject = projects.find(p => p.id === selectedProjectId);

    const newFinding: QualityControl = {
      id: `QC-${Math.floor(100 + Math.random() * 900)}`,
      projectId: selectedProjectId,
      projectName: matchedProject?.name || "",
      scope,
      issue,
      status: "Open",
      inspector,
      photoUrl
    };

    onAddFinding(newFinding);
    setShowAddForm(false);
    setIssue("");
  };

  const handleApplyRemedy = (qcId: string) => {
    if (!remedyText) return;

    onUpdateFinding(qcId, {
      status: "Rectified",
      remedyAction: remedyText,
      rectificationPhotoUrl: rectificationUrl
    });

    setActiveRemedyId(null);
    setRemedyText("");
  };

  const handleApproveQC = (qcId: string) => {
    onUpdateFinding(qcId, {
      status: "Closed"
    });
  };

  const currentFindings = qcList.filter(q => !selectedProjectId || q.projectId === selectedProjectId);

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Quality Control (QC) & Temuan Lapangan</h2>
          <p className="text-xs text-slate-400">Inspeksi mutu struktural, arsitektur, dan plumbing mechanical untuk ketahanan bangunan</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {["Pengawas Lapangan", "Site Engineer", "Super Admin", "Konsultan Pengawas"].includes(userRole) && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition shadow-md w-full sm:w-auto"
            >
              <Plus size={16} /> Laporkan Temuan Defek QC
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

      {/* QC Bento list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentFindings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 md:col-span-2">
            Tidak ada temuan deviasi mutu (defek) saat ini pada proyek terpilih.
          </div>
        ) : (
          currentFindings.map(qc => (
            <div key={qc.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
              
              <div className="p-5 space-y-4">
                {/* Header status */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">{qc.id} ● {qc.scope} CHECK</span>
                    <h4 className="text-sm font-bold text-white mt-1">{qc.projectName}</h4>
                  </div>
                  <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded border ${
                    qc.status === "Open" ? "bg-red-950 text-red-400 border-red-900" :
                    qc.status === "Rectified" ? "bg-amber-950 text-amber-400 border-amber-900" :
                    "bg-emerald-950 text-emerald-300 border-emerald-950"
                  }`}>
                    {qc.status}
                  </span>
                </div>

                {/* Main Issue info */}
                <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-850 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
                    <HeartCrack size={12} className="text-red-400" /> Deskripsi Kerusakan / Mutu Defisit
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">"{qc.issue}"</p>
                </div>

                {/* Photo proofs compared */}
                <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500 font-mono">
                  <div>
                    <span>Foto Kerusakan Mutu:</span>
                    <div className="h-28 rounded-lg mt-1 overflow-hidden bg-slate-950 border border-slate-850">
                      <img src={qc.photoUrl} alt="Defect" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                  <div>
                    <span>Bukti Perbaikan:</span>
                    <div className="h-28 rounded-lg mt-1 overflow-hidden bg-slate-950 border border-slate-850 flex items-center justify-center">
                      {qc.rectificationPhotoUrl ? (
                        <img src={qc.rectificationPhotoUrl} alt="Rectified" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-slate-600 block text-center p-3 font-sans">Belum ada tindakan perbaikan.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remedy Details if resolved */}
                {qc.remedyAction && (
                  <div className="bg-slate-950 p-3 rounded-lg border border-indigo-950 text-xs space-y-1">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase flex items-center gap-1">
                      <CheckSquare size={12} /> Aksi Penanganan Mutu Kontraktor:
                    </span>
                    <p className="text-slate-300 italic">"{qc.remedyAction}"</p>
                  </div>
                )}

                {/* Form to submit remedy */}
                {activeRemedyId === qc.id && (
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-white block">Input Tindakan Penanganan Mutu</span>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Aksi Perbaikan Struktural *</label>
                        <input
                          type="text" required
                          placeholder="Deskripsikan pekerjaan cor ulang, re-pembesian dsb..."
                          value={remedyText}
                          onChange={(e) => setRemedyText(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Link Bukti Foto Perbaikan</label>
                        <input
                          type="text"
                          value={rectificationUrl}
                          onChange={(e) => setRectificationUrl(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-slate-400 font-mono"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={() => setActiveRemedyId(null)} className="bg-slate-900 text-slate-400 px-3 py-1 rounded">Batal</button>
                        <button type="button" onClick={() => handleApplyRemedy(qc.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-bold">Simpan Aksi</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Inspector footer panel / actionable items */}
              <div className="bg-slate-950 px-5 py-3.5 border-t border-slate-850 flex justify-between items-center text-xs font-mono text-slate-400">
                <span>Inspektur: <strong className="text-slate-300 font-sans">{qc.inspector}</strong></span>
                
                {/* Actions */}
                {qc.status === "Open" && ["Kontraktor", "Super Admin", "Project Manager", "Site Engineer"].includes(userRole) && !activeRemedyId && (
                  <button
                    onClick={() => {
                      setActiveRemedyId(qc.id);
                      setRemedyText("");
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-sans text-[11px] px-3 py-1 rounded font-bold cursor-pointer transition shadow"
                  >
                    Atasi Temuan
                  </button>
                )}

                {qc.status === "Rectified" && ["Pengawas Lapangan", "Site Engineer", "Super Admin", "Konsultan Pengawas"].includes(userRole) && (
                  <button
                    onClick={() => handleApproveQC(qc.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-[11px] px-3 py-1 rounded font-bold cursor-pointer transition shadow flex items-center gap-1"
                  >
                    <ShieldCheck size={12} /> Setujui Perbaikan QC
                  </button>
                )}

                {qc.status === "Closed" && (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    ✓ QC APPROVED
                  </span>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Checklist Audit Add finding modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 text-slate-200 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-850 pb-2">Laporkan Temuan Defisit Mutu (CAR)</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Target Proyek</label>
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
                  <label className="text-slate-400 block mb-1">Grup Mutu Scope</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white"
                  >
                    <option value="Struktur">Struktur (Cor, Pembesian)</option>
                    <option value="Arsitektur">Arsitektur (Dinding, Keramik)</option>
                    <option value="MEP">MEP (Mechanical, Electrical, Ground)</option>
                    <option value="Infrastruktur">Infrastruktur (Beton Jalan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Nama Pengawas QC Lapangan *</label>
                <input
                  type="text" required
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Deskripsi Penemuan Defek Mutu (Temuan) *</label>
                <textarea
                  rows={3} required
                  placeholder="Detail temuan: Retak rambut pada sasis kolom, asis pembesian renggang, atau kabel grounding tidak terpasang..."
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-200 animate-pulse-once"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Link Foto Temuan Bukti Kerusakan</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-400 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
                <button type="button" onClick={() => setShowAddForm(false)} className="bg-slate-850 px-3 py-1.5 rounded text-slate-300">Batal</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-white font-bold">Terbitkan Temuan</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
