import React, { useState } from "react";
import { WorkProgress, Project, ERPUserRole } from "../types";
import { ThumbsUp, ThumbsDown, Clock, Check, RefreshCcw, Camera, Eye } from "lucide-react";

interface WorkProgressDetailsProps {
  progressList: WorkProgress[];
  projects: Project[];
  onAddProgress: (p: WorkProgress) => void;
  onApproveProgress: (id: string, projectId: string, percentage: number) => void;
  onRejectProgress: (id: string, status: "Rejected" | "Revision") => void;
  userRole: ERPUserRole;
}

export const WorkProgressDetails: React.FC<WorkProgressDetailsProps> = ({
  progressList,
  projects,
  onAddProgress,
  onApproveProgress,
  onRejectProgress,
  userRole
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [showReporterForm, setShowReporterForm] = useState(false);

  // Form State
  const [periodType, setPeriodType] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [percentage, setPercentage] = useState(0);
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || percentage <= 0) return;

    const matchedProject = projects.find(p => p.id === selectedProjectId);

    const newReport: WorkProgress = {
      id: `WP-${Math.floor(100 + Math.random() * 900)}`,
      projectId: selectedProjectId,
      projectName: matchedProject?.name || "",
      contractorId: "CONT-GUEST",
      contractorName: "PT. Krakatau Karya Jaya (Rekanan)",
      periodType,
      percentage: Number(percentage),
      description,
      photoUrl,
      videoUrl: "",
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    onAddProgress(newReport);
    setShowReporterForm(false);
    setDescription("");
    setPercentage(0);
  };

  const filteredReports = progressList.filter(p => !selectedProjectId || p.projectId === selectedProjectId);

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Progress Laporan Bulanan & Mingguan</h2>
          <p className="text-xs text-slate-400">Verifikasi berkas fisik harian lapangan dari kontraktor utama pelaksana</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {["Kontraktor", "Super Admin", "Project Manager"].includes(userRole) && (
            <button
              onClick={() => setShowReporterForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg cursor-pointer transition shadow-md w-full sm:w-auto"
            >
              + Ajukan Laporan Progres
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

      {/* Progress reports list */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
            Belum ada laporan progress harian/mingguan yang diajukan oleh kontraktor untuk filter proyek ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReports.map(report => (
              <div key={report.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
                
                {/* Photo Header */}
                <div className="h-44 relative bg-slate-950 overflow-hidden">
                  <img 
                    src={report.photoUrl} 
                    alt="Progress Lapangan"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40 p-4 flex flex-col justify-between">
                    <span className="bg-blue-600/90 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded self-start uppercase tracking-widest">
                      {report.periodType}
                    </span>
                    
                    <div className="text-white">
                      <span className="text-[10px] text-slate-300 font-mono block">{report.id}</span>
                      <h4 className="text-sm font-bold truncate">{report.projectName || "Situs Konstruksi"}</h4>
                    </div>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 space-y-4 flex-grow">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Diajukan oleh: <strong className="text-slate-300">{report.contractorName}</strong></span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      report.status === "Approved" ? "bg-emerald-950 text-emerald-300 border border-emerald-900" :
                      report.status === "Rejected" ? "bg-red-950 text-red-300 border border-red-900" :
                      report.status === "Revision" ? "bg-amber-950 text-amber-300 border border-amber-900" :
                      "bg-indigo-950 text-indigo-300 border border-indigo-900"
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  {/* Target Completion Progress */}
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Target Capaian Fisik</span>
                    <span className="text-sm font-mono text-emerald-400 font-bold">{report.percentage}%</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-850/80">
                    "{report.description}"
                  </p>
                </div>

                {/* Control bar for Owner / PM */}
                <div className="bg-slate-950 px-5 py-3 border-t border-slate-850 flex justify-between items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Diajukan: {new Date(report.createdAt).toLocaleDateString("id-ID")}
                  </span>
                  
                  {report.status === "Pending" && ["Project Manager", "Project Director", "Super Admin", "Direktur"].includes(userRole) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onRejectProgress(report.id, "Revision")}
                        className="bg-amber-900/40 hover:bg-amber-900 text-amber-300 hover:text-white px-2.5 py-1 rounded text-[11px] font-sans font-medium flex items-center gap-1 cursor-pointer transition border border-amber-800"
                      >
                        <RefreshCcw size={12} /> Revisi
                      </button>
                      <button
                        onClick={() => onRejectProgress(report.id, "Rejected")}
                        className="bg-red-950/45 hover:bg-red-900 text-red-300 hover:text-white px-2.5 py-1 rounded text-[11px] font-sans font-medium flex items-center gap-1 cursor-pointer transition border border-red-900"
                      >
                        <ThumbsDown size={12} /> Tolak
                      </button>
                      <button
                        onClick={() => onApproveProgress(report.id, report.projectId, report.percentage)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-[11px] font-sans font-bold flex items-center gap-1 cursor-pointer transition shadow"
                      >
                        <Check size={12} /> Setujui
                      </button>
                    </div>
                  )}

                  {report.status !== "Pending" && (
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> Status Terverifikasi
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Dialog popup form for contractors */}
      {showReporterForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 text-slate-200 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-850 pb-2">Ajukan Laporan Capaian Fisik Konstruksi</h3>
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
                  <label className="text-slate-400 block mb-1">Periode Laporan</label>
                  <select
                    value={periodType}
                    onChange={(e) => setPeriodType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white"
                  >
                    <option value="Daily">Harian</option>
                    <option value="Weekly">Mingguan</option>
                    <option value="Monthly">Bulanan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Capaian Progres Kumulatif (%) *</label>
                  <input
                    type="number" required min="1" max="100"
                    placeholder="e.g. 35"
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 flex items-center gap-1">
                    <Camera size={12} /> Foto Bukti Lapangan Link
                  </label>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ringkasan Deskripsi Pekerjaan Selesai *</label>
                <textarea
                  required rows={3}
                  placeholder="Deskripsikan beton, pengecoran, pembersihan bekisting, dan material yang berhasil dikerjakan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
                <button type="button" onClick={() => setShowReporterForm(false)} className="bg-slate-850 px-3 py-1.5 rounded text-slate-300">Batal</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-white font-bold">Kirim Laporan</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
