import React, { useState } from "react";
import { WorkProgress, Project, ERPUserRole } from "../types";
import { ThumbsUp, ThumbsDown, Clock, Check, RefreshCcw, Camera, Eye, FileText } from "lucide-react";
import { jsPDF } from "jspdf";

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

  const handleDownloadProgressPDF = (report: WorkProgress) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Color definitions
    const primaryColor = [15, 76, 129]; // #0F4C81
    const textColor = [33, 37, 41];
    const mutedText = [108, 117, 125];
    const borderLight = [224, 224, 224];

    // Header Banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 38, "F");

    // Header Text
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("LAPORAN CAPAIAN FISIK KONSTRUKSI", 14, 15);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text("FORESYNDO CONSOLIDATED ERP — CONTRACTOR WORK PROGRESS", 14, 21);

    doc.setFont("Helvetica", "bold");
    doc.text(`KODE LAPORAN: ${report.id}`, 140, 15);
    doc.setFont("Helvetica", "normal");
    doc.text(`TANGGAL: ${new Date(report.createdAt).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`, 140, 21);

    // Outer Frame Border
    doc.setDrawColor(210, 215, 225);
    doc.rect(10, 48, 190, 235, "S");

    // SECTION 1: PROYEK & KONTRAKTOR
    doc.setFillColor(245, 247, 250);
    doc.rect(10, 48, 190, 8, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("I. INFORMASI PROYEK & REKANAN PELAKSANA", 13, 53);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    doc.text("Nama Proyek:", 13, 62);
    doc.setFont("Helvetica", "bold");
    const splitProjectName = doc.splitTextToSize(report.projectName || "Situs Konstruksi Proyek", 145);
    doc.text(splitProjectName, 45, 62);

    const startY2 = 62 + (splitProjectName.length > 1 ? (splitProjectName.length - 1) * 4 : 0) + 6;
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.line(13, startY2 - 3, 197, startY2 - 3);

    doc.setFont("Helvetica", "normal");
    doc.text("Kontraktor Utama:", 13, startY2);
    doc.setFont("Helvetica", "bold");
    doc.text(report.contractorName || "PT. Krakatau Karya Jaya (Rekanan)", 45, startY2);

    const startY3 = startY2 + 6;
    doc.line(13, startY3 - 3, 197, startY3 - 3);

    doc.setFont("Helvetica", "normal");
    doc.text("ID Kontraktor:", 13, startY3);
    doc.setFont("Helvetica", "bold");
    doc.text(report.contractorId || "CONT-001", 45, startY3);

    // SECTION 2: CAPAIAN KINERJA FISIK PROYEK
    const section2Y = startY3 + 10;
    doc.setDrawColor(210, 215, 225);
    doc.line(10, section2Y - 4, 200, section2Y - 4);

    doc.setFillColor(245, 247, 250);
    doc.rect(10, section2Y - 4, 190, 8, "F");
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("II. RINGKASAN CAPAIAN FISIK & STATUS HUKUM VERIFIKASI", 13, section2Y + 1);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    doc.text("Periode Pelaporan:", 13, section2Y + 10);
    doc.setFont("Helvetica", "bold");
    doc.text(`${report.periodType === "Daily" ? "Harian" : report.periodType === "Weekly" ? "Mingguan" : "Bulanan"}`, 45, section2Y + 10);

    const valueY = section2Y + 16;
    doc.line(13, valueY - 3, 197, valueY - 3);

    doc.setFont("Helvetica", "normal");
    doc.text("Capaian Fisik (%):", 13, valueY);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(40, 167, 69); // Green accent
    doc.text(`${report.percentage}% (Hingga Periode Ini)`, 45, valueY);

    const statusY = valueY + 6;
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.line(13, statusY - 3, 197, statusY - 3);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Status Verifikasi:", 13, statusY);
    doc.setFont("Helvetica", "bold");
    doc.text(report.status || "Pending Verification", 45, statusY);

    // SECTION 3: RINGKASAN TEKNIS AKTIVITAS (WORK COMPLETED)
    const section3Y = statusY + 10;
    doc.setDrawColor(210, 215, 225);
    doc.line(10, section3Y - 4, 200, section3Y - 4);

    doc.setFillColor(245, 247, 250);
    doc.rect(10, section3Y - 4, 190, 8, "F");
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("III. DESKRIPSI TEKNIS PEKERJAAN SELESAI (WORK REPORT)", 13, section3Y + 1);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Uraian Pekerjaan:", 13, section3Y + 10);

    doc.setFont("Helvetica", "normal");
    const splitDescription = doc.splitTextToSize(report.description || "Tidak ada rincian pekerjaan terperinci.", 145);
    doc.text(splitDescription, 45, section3Y + 10);

    // SECTION 4: LEMBAR PENGESAHAN DANA KLAIM (SIGN SIGN-OFF)
    const section4Y = 232;
    doc.setDrawColor(210, 215, 225);
    doc.line(10, section4Y - 5, 200, section4Y - 5);

    doc.setFillColor(245, 247, 250);
    doc.rect(10, section4Y - 5, 190, 8, "F");
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("IV. LEMBAR PERSETUJUAN MULTI-STAKEHOLDER", 13, section4Y);

    // Signatures placeholders
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);

    // Col 1: Contractor
    doc.text("Diajukan Oleh,", 20, 243);
    doc.text("Project Manager Kontraktor", 20, 247);
    doc.line(20, 267, 70, 267);
    doc.text("Tanda Tangan & Cap", 20, 271);

    // Col 2: Supervising Consultant
    doc.text("Diperiksa Oleh,", 80, 243);
    doc.text("KSO Konsultan Pengawas", 80, 247);
    doc.line(80, 267, 130, 267);
    doc.text("Tanda Tangan & Cap", 80, 271);

    // Col 3: Owner Approval
    doc.text("Disetujui Oleh,", 140, 243);
    doc.text("Developer / Project Director", 140, 247);
    doc.line(140, 267, 190, 267);
    doc.text("Tanda Tangan Pemilik Proyek", 140, 271);

    doc.save(`Foresyndo-WorkProgress-${report.id}.pdf`);
  };

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
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Diajukan: {new Date(report.createdAt).toLocaleDateString("id-ID")}
                    </span>
                    <button
                      onClick={() => handleDownloadProgressPDF(report)}
                      className="bg-emerald-950/45 border border-emerald-900 hover:bg-emerald-900/50 text-emerald-400 hover:text-emerald-300 font-medium px-2 py-0.5 rounded text-[10px] flex items-center gap-1 cursor-pointer transition"
                    >
                      <FileText size={11} /> Unduh PDF
                    </button>
                  </div>
                  
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
