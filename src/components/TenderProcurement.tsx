import React, { useState } from "react";
import { Tender, TenderBid, TenderType, TenderStatus, ERPUserRole } from "../types";
import { Plus, Check, ListFilter, ShieldCheck, FileSpreadsheet, User, Star, Award } from "lucide-react";

interface TenderProcurementProps {
  tenders: Tender[];
  bids: TenderBid[];
  projects: { id: string, name: string }[];
  onAddTender: (tender: Tender) => void;
  onAddBid: (bid: TenderBid) => void;
  onUpdateTender: (id: string, updated: Partial<Tender>) => void;
  onUpdateBid: (id: string, updated: Partial<TenderBid>) => void;
  userRole: ERPUserRole;
  language?: "ID" | "EN";
}

export const TenderProcurement: React.FC<TenderProcurementProps> = ({
  tenders,
  bids,
  projects,
  onAddTender,
  onAddBid,
  onUpdateTender,
  onUpdateBid,
  userRole,
  language = "ID"
}) => {
  const [showAddTender, setShowAddTender] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState<string>(tenders[0]?.id || "");
  
  // New Tender State
  const [newTitle, setNewTitle] = useState("");
  const [newProjectId, setNewProjectId] = useState(projects[0]?.id || "");
  const [newHps, setNewHps] = useState(0);
  const [newType, setNewType] = useState<TenderType>("Terbuka");
  const [newSchedule, setNewSchedule] = useState("Aanwijzing: 10 Juni 2026, Penutupan: 25 Juni 2026");

  // Contractor Form State
  const [contractorRegDone, setContractorRegDone] = useState(false);
  const [nib, setNib] = useState("9120301928371");
  const [npwp, setNpwp] = useState("01.324.552.1-013.000");
  const [siujk, setSiujk] = useState("0220/SIUJK/DPMPTSP/2025");
  const [sbu, setSbu] = useState("SBU-BG009-2025-001");
  const [firmName, setFirmName] = useState("PT. Jaya Makmur Mandiri");

  // Bid submission State
  const [myBidAmount, setMyBidAmount] = useState(0);

  // Grade state
  const [activeTab, setActiveTab] = useState<"owner" | "contractor">(
    userRole === "Kontraktor" ? "contractor" : "owner"
  );

  const handleCreateTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || newHps <= 0) return;

    const matchedProj = projects.find(p => p.id === newProjectId);

    const tender: Tender = {
      id: `TEN-${Math.floor(100 + Math.random() * 900)}`,
      projectId: newProjectId,
      projectName: matchedProj?.name || "Proyek Konstruksi",
      title: newTitle,
      hpsValue: Number(newHps),
      tenderType: newType,
      schedule: newSchedule,
      documentUrl: "#",
      status: "Pengumuman",
      createdAt: new Date().toISOString()
    };

    onAddTender(tender);
    setShowAddTender(false);
    setNewTitle("");
    setNewHps(0);
  };

  const handleSubmitBid = () => {
    if (!selectedTenderId || myBidAmount <= 0) return;
    const selectedTender = tenders.find(t => t.id === selectedTenderId);

    const bid: TenderBid = {
      id: `BID-${Math.floor(100 + Math.random() * 900)}`,
      tenderId: selectedTenderId,
      tenderTitle: selectedTender?.title || "",
      contractorId: "CONT-GUEST",
      contractorName: firmName,
      bidValue: Number(myBidAmount),
      proposalTechUrl: "#",
      proposalPriceUrl: "#",
      scoreAdmin: 0,
      scoreTech: 0,
      scorePrice: 0,
      scoreTotal: 0,
      status: "Diajukan",
      createdAt: new Date().toISOString()
    };

    onAddBid(bid);
    setMyBidAmount(0);
    alert("Penawaran Berhasil Diajukan!");
  };

  const handleGradeBid = (bidId: string, admin: number, tech: number, price: number) => {
    const total = Number(((admin * 0.2) + (tech * 0.4) + (price * 0.4)).toFixed(1));
    onUpdateBid(bidId, {
      scoreAdmin: admin,
      scoreTech: tech,
      scorePrice: price,
      scoreTotal: total,
      status: "Evaluasi"
    });
  };

  const handleSetWinner = (tenderId: string, bid: TenderBid) => {
    onUpdateTender(tenderId, {
      status: "Selesai",
      winnerContractorId: bid.contractorId,
      winnerContractorName: bid.contractorName
    });
    onUpdateBid(bid.id, {
      status: "Pemenang"
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const selectedTender = tenders.find(t => t.id === selectedTenderId) || tenders[0];
  const activeBids = bids.filter(b => b.tenderId === selectedTenderId);

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Modul Procurement & Tender</h2>
          <p className="text-xs text-slate-400">Pengadaan paket pekerjaan terpadu antara Developer & Rekanan Kontraktor</p>
        </div>
        {userRole !== "Kontraktor" ? (
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-mono">
            <button 
              type="button"
              className={`px-3 py-1.5 rounded-md cursor-pointer transition ${activeTab === "owner" ? "bg-blue-600 text-white" : "text-slate-400"}`}
              onClick={() => setActiveTab("owner")}
            >
              Owner Panel
            </button>
            <button 
              type="button"
              className={`px-3 py-1.5 rounded-md cursor-pointer transition ${activeTab === "contractor" ? "bg-blue-600 text-white" : "text-slate-400"}`}
              onClick={() => setActiveTab("contractor")}
            >
              Portal Kontraktor
            </button>
          </div>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 text-xs px-3 py-1.5 rounded-lg font-mono font-bold uppercase tracking-wider">
            🔒 {language === "ID" ? "Portal Kontraktor Terproteksi" : "Secured Contractor Portal"}
          </div>
        )}
      </div>

      {activeTab === "owner" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tenders Selection List (Left - 1 col) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Daftar Paket Tender</h3>
              <button 
                onClick={() => setShowAddTender(true)}
                className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded font-bold font-mono"
              >
                + Tender
              </button>
            </div>

            <div className="space-y-3">
              {tenders.map(t => (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTenderId(t.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition ${
                    selectedTenderId === t.id 
                      ? "bg-slate-950 border-blue-500 shadow-inner" 
                      : "bg-slate-950/40 border-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1.5">
                    <span>{t.id}</span>
                    <span className="text-yellow-400">{t.status}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-2">{t.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 truncate">{t.projectName}</p>
                  <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                    <span>HPS: {formatCurrency(t.hpsValue)}</span>
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded font-sans text-slate-300">{t.tenderType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation & Bids Grading (Right - 2 cols) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 space-y-5">
            {selectedTender ? (
              <>
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-blue-400 uppercase font-mono tracking-widest">{selectedTender.id} ● TENDER PROSES</span>
                      <h3 className="text-lg font-bold text-white mt-1">{selectedTender.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">Grup Proyek: <span className="text-slate-300">{selectedTender.projectName}</span></p>
                    </div>
                    <select
                      value={selectedTender.status}
                      onChange={(e) => onUpdateTender(selectedTender.id, { status: e.target.value as TenderStatus })}
                      className="bg-slate-950 border border-slate-800 text-xs px-2 py-1 rounded text-yellow-400 font-mono"
                    >
                      <option value="Pengumuman">Pengumuman</option>
                      <option value="Aanwijzing">Aanwijzing</option>
                      <option value="Penawaran">Penawaran</option>
                      <option value="Evaluasi">Evaluasi</option>
                      <option value="Negosiasi">Negosiasi</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                  <div className="text-xs text-slate-400 mt-3 font-mono">
                    Jadwal: <span className="text-slate-300">{selectedTender.schedule}</span>
                  </div>
                </div>

                {/* Submissions comparison list */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-400 uppercase font-semibold tracking-wider font-sans">
                    <span>Penawaran Rekanan ({activeBids.length})</span>
                    <span>Bobot Evaluasi (Ad: 20%, Tek: 40%, Ha: 40%)</span>
                  </div>

                  {activeBids.length === 0 ? (
                    <div className="bg-slate-950 p-6 rounded-lg text-center text-xs text-slate-500 border border-slate-850">
                      Belum ada rekanan kontraktor yang menyodorkan penawaran harga untuk paket pekerjaan ini.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeBids.sort((a,b) => b.scoreTotal - a.scoreTotal).map((bid, index) => (
                        <div key={bid.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4 hover:border-slate-700 transition">
                          
                          {/* Contractor Info and ranking */}
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-blue-900 border border-blue-500 text-blue-300 rounded-full flex items-center justify-center text-[10px] font-bold font-mono">
                                {index + 1}
                              </span>
                              <div>
                                <h4 className="text-sm font-semibold text-slate-200">{bid.contractorName}</h4>
                                <span className="text-[10px] text-slate-500 font-mono">Nilai Penawaran: <strong className="text-slate-300">{formatCurrency(bid.bidValue)}</strong></span>
                              </div>
                            </div>

                            {bid.status === "Pemenang" ? (
                              <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                <Award size={12} /> Pemenang Tender
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs font-mono font-bold">Skor Akhir: {bid.scoreTotal || 0}</span>
                            )}
                          </div>

                          {/* Evaluation Form inputs */}
                          <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-3 rounded-lg text-xs">
                            <div>
                              <label className="text-[10px] text-slate-500 block mb-1">Administrasi</label>
                              <input 
                                type="number" 
                                min="0" max="100"
                                value={bid.scoreAdmin}
                                onChange={(e) => handleGradeBid(bid.id, Number(e.target.value), bid.scoreTech, bid.scorePrice)}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center font-mono text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 block mb-1">Poin Teknis</label>
                              <input 
                                type="number" 
                                min="0" max="100"
                                value={bid.scoreTech}
                                onChange={(e) => handleGradeBid(bid.id, bid.scoreAdmin, Number(e.target.value), bid.scorePrice)}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center font-mono text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 block mb-1">Bobot Harga</label>
                              <input 
                                type="number" 
                                min="0" max="100"
                                value={bid.scorePrice}
                                onChange={(e) => handleGradeBid(bid.id, bid.scoreAdmin, bid.scoreTech, Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center font-mono text-white"
                              />
                            </div>
                            <div className="flex flex-col justify-end">
                              {selectedTender.status !== "Selesai" && (
                                <button
                                  onClick={() => handleSetWinner(selectedTender.id, bid)}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] py-1 font-sans cursor-pointer font-bold"
                                >
                                  Tunjuk Pemenang
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Bid materials documentation */}
                          <div className="flex gap-4 text-[11px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1">☑ Proposal Teknis.pdf</span>
                            <span className="flex items-center gap-1">☑ Proposal RAB.xlsx</span>
                            <span className="flex items-center gap-1">☑ NIB & SBU Berkas Legal</span>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-12 text-xs">Pilih paket tender untuk melakukan evaluasi scoring.</div>
            )}
          </div>
        </div>
      ) : (
        /* Contractors Portal Panel */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-400" size={24} />
              <div>
                <h3 className="text-base font-bold text-white">Hub Registrasi & Portal Evaluasi Kontraktor</h3>
                <p className="text-xs text-slate-400">Pastikan seluruh berkas legalitas dan NIB terafiliasi resmi sebelum mengajukan proposal harga.</p>
              </div>
            </div>
            {!contractorRegDone ? (
              <button 
                onClick={() => setContractorRegDone(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2 rounded-lg cursor-pointer transition shadow"
              >
                Kirim Berkas Legalitas & Verifikasi
              </button>
            ) : (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-990 font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
                🟢 Legalitas Verified (QR Code Registered)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Legal */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <User size={13} /> Dokumen Legalitas Perusahaan (Syarat Pengadaan)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Nama Perusahaan (Rekanan)</label>
                  <input type="text" value={firmName} onChange={(e) => setFirmName(e.target.value)} className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1.5 text-slate-200" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-mono text-emerald-400">NIB (Nomor Induk Berusaha)</label>
                  <input type="text" value={nib} onChange={(e) => setNib(e.target.value)} className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1.5 text-slate-400" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">NPWP Badan Usaha</label>
                  <input type="text" value={npwp} onChange={(e) => setNpwp(e.target.value)} className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1.5 text-slate-400" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">No. SIUJK Pemprov</label>
                  <input type="text" value={siujk} onChange={(e) => setSiujk(e.target.value)} className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1.5 text-slate-400" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-slate-400 block mb-1">Sertifikat Badan Usaha (SBU)</label>
                  <input type="text" value={sbu} onChange={(e) => setSbu(e.target.value)} className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Submit proposal section */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <FileSpreadsheet size={14} className="text-emerald-400" /> Pengajuan Penawaran (Bidding Stage)
                </h4>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Pilih Paket Tender Aktif</label>
                    <select 
                      value={selectedTenderId} 
                      onChange={(e) => setSelectedTenderId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white rounded"
                    >
                      {tenders.filter(t => t.status !== "Selesai").map(t => (
                        <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Nilai Penawaran Anda (Rupiah) *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 31000000000"
                      value={myBidAmount}
                      onChange={(e) => setMyBidAmount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-2 text-white font-mono"
                    />
                    {selectedTender && (
                      <span className="text-[10px] text-amber-400 block mt-1.5">
                        ⚠️ Selisih Nilai HPS Maksimum: <strong>{formatCurrency(selectedTender.hpsValue)}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitBid}
                disabled={!contractorRegDone || myBidAmount <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-xs py-2.5 rounded-lg transition mt-4"
              >
                {!contractorRegDone ? "Harap Verifikasi Legalitas Di Atas Pertama" : "Kirimkan Proposal Penawaran"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tender Addition Form Modal */}
      {showAddTender && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 text-slate-200 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-850 pb-2">Buat Paket Pekerjaan Tender Baru</h3>
            <form onSubmit={handleCreateTender} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nama Paket Pekerjaan / Judul Tender *</label>
                <input 
                  type="text" required
                  placeholder="e.g. Pekerjaan Struktur Utama"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nilai HPS Maksimal (IDR) *</label>
                  <input 
                    type="number" required
                    placeholder="Nilai HPS"
                    value={newHps}
                    onChange={(e) => setNewHps(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Proyek Target</label>
                  <select 
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Metode Pemilihan</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as TenderType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
                  >
                    <option value="Terbuka">Tender Terbuka</option>
                    <option value="Terbatas">Tender Terbatas</option>
                    <option value="Langsung">Tender Langsung</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Tenggat Pengumuman</label>
                  <input 
                    type="text"
                    value={newSchedule}
                    onChange={(e) => setNewSchedule(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
                <button 
                  type="button" 
                  onClick={() => setShowAddTender(false)}
                  className="bg-slate-850 px-3 py-1.5 rounded text-xs text-slate-300"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs text-white font-bold"
                >
                  Publish Tender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
