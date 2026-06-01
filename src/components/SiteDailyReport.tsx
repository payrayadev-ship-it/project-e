import React, { useState } from "react";
import { DailyReport, Project, ERPUserRole } from "../types";
import { CloudRain, Sun, Cloud, Eye, Plus, MapPin, HardHat, FileText, Anchor } from "lucide-react";

interface SiteDailyReportProps {
  reports: DailyReport[];
  projects: Project[];
  onAddReport: (report: DailyReport) => void;
  userRole: ERPUserRole;
}

export const SiteDailyReport: React.FC<SiteDailyReportProps> = ({
  reports,
  projects,
  onAddReport,
  userRole
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");

  // Form states
  const [reporterName, setReporterName] = useState("Ir. Rudy Hartono (Pengawas Lapangan)");
  const [manpower, setManpower] = useState("Tukang Besi: 12, Tukang Kayu: 8, Pekerja Galian: 25, Mandor: 2");
  const [equipment, setEquipment] = useState("Excavator CAT-320 (1 unit), Stamper Pemadat (2 unit)");
  const [materialsEntered, setMaterialsEntered] = useState("Semen Gresik PPC 50kg: 250 Zak, Besi D16 SNI: 80 Batang");
  const [weather, setWeather] = useState<"Cerah" | "Hujan" | "Mendung" | "Gerimis">("Cerah");
  const [challenges, setChallenges] = useState("Tidak ada kendala kritis harian.");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600");
  const [gpsLocation, setGpsLocation] = useState("-6.2146, 106.8451 (Site Coordinates)");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manpower || !materialsEntered) return;

    const matchedProject = projects.find(p => p.id === selectedProjectId);

    const newLog: DailyReport = {
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      projectId: selectedProjectId,
      projectName: matchedProject?.name || "",
      reporterName,
      manpower,
      equipment,
      materialsEntered,
      weather,
      challenges,
      photoUrl,
      createdAt: new Date().toISOString(),
      gpsLocation
    };

    onAddReport(newLog);
    setShowForm(false);
    
    // Clear
    setChallenges("Tidak ada kendala kritis harian.");
  };

  const handleFetchMockGPS = () => {
    const lat = (-6.21 + Math.random() * 0.05).toFixed(4);
    const lng = (106.81 + Math.random() * 0.05).toFixed(4);
    setGpsLocation(`${lat}, ${lng} (Auto GPS Geo-Tag)`);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Laporan Harian Pengawas Lapangan</h2>
          <p className="text-xs text-slate-400">Logbook harian pencatatan tenaga kerja, material masuk, dan deviasi cuaca makro</p>
        </div>
        {["Pengawas Lapangan", "Site Engineer", "Super Admin", "Project Manager", "Konsultan Pengawas"].includes(userRole) && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition shadow-md w-full sm:w-auto"
          >
            <Plus size={16} /> Catat Laporan Harian Konstruksi (QC)
          </button>
        )}
      </div>

      {/* Reports Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timeline cards */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Buku Catatan Log Lapangan Terbaru ({reports.length})</h3>

          {reports.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
              Belum ada logbook harian lapangan. Pengawas konstruksi dapat mengisi data baru di tombol kanan atas.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{report.id} ● DAILY LOG</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{report.projectName || "Situs Konstruksi Proyek"}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Dilaporkan oleh: <span className="text-slate-300 font-sans">{report.reporterName}</span></p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-850">
                      {report.weather === "Cerah" && <Sun className="text-yellow-400" size={13} />}
                      {report.weather === "Hujan" && <CloudRain className="text-blue-400" size={13} />}
                      {report.weather === "Gerimis" && <CloudRain className="text-blue-300" size={13} />}
                      {report.weather === "Mendung" && <Cloud className="text-slate-400" size={13} />}
                      <span className="text-[10px] text-slate-300 font-mono font-bold">{report.weather}</span>
                    </div>
                  </div>

                  {/* Operational stats grids */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 font-mono">
                    <div className="bg-slate-950 p-3 rounded border border-slate-850/80">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold mb-1">🛠 Mobilisasi Alat Berat</span>
                      <p className="font-sans leading-relaxed text-slate-300 text-[11px]">{report.equipment || "Tidak ada alat berat aktif."}</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-850/80">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold mb-1">🏗 Logistik Semen/Material Masuk</span>
                      <p className="font-sans leading-relaxed text-slate-300 text-[11px]">{report.materialsEntered}</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-850/80">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold mb-1">👷 Komposisi Tenaga Kerja</span>
                      <p className="font-sans leading-relaxed text-slate-300 text-[11px]">{report.manpower}</p>
                    </div>
                  </div>

                  {/* GPS & Photo proofs */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-3 text-xs font-mono border-t border-slate-800 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-blue-400 shrink-0" />
                      <span>GPS: <strong className="text-slate-300 font-semibold">{report.gpsLocation || "Geo-tag (N/A)"}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500">Masa Log: {new Date(report.createdAt).toLocaleDateString("id-ID")}</span>
                      {report.photoUrl && (
                        <a href={report.photoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-850 text-[10px]">
                          <Eye size={10} /> Lihat Bukti Foto
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Challenges Audit Alerts */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Daftar Kendala Konstruksi (Site Risk)</h3>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            {reports.map((r, i) => (
              <div key={r.id || i} className="border-b border-slate-850 pb-3 last:border-0 last:pb-0 text-xs">
                <span className="font-mono text-emerald-400 font-semibold">{r.id}</span>
                <p className="font-semibold text-slate-200 mt-1 line-clamp-1">{r.projectName}</p>
                <div className="bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-lg text-amber-200 text-xs mt-2 italic leading-relaxed">
                  "{r.challenges || "Tidak ada kendala kritis terlaporkan harian."}"
                </div>
                <span className="text-[10px] text-slate-500 block mt-2 font-mono uppercase">Supervised by: {r.reporterName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily report addition modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-xl p-6 text-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2">
              <h3 className="text-base font-bold text-white">Catat Log Laporan Harian Pengawas</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Proyek Target</label>
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
                  <label className="text-slate-400 block mb-1">Cuaca Terpantau Lapangan</label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white"
                  >
                    <option value="Cerah">Cerah / Panas Terik</option>
                    <option value="Mendung">Mendung Shading</option>
                    <option value="Gerimis">Gerimis Rintik</option>
                    <option value="Hujan">Hujan Intensitas Tinggi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Nama Surveyor / Log Reporter *</label>
                <input 
                  type="text" required
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Kehadiran Tenaga Kerja (Komposisi) *</label>
                  <textarea 
                    rows={2} required
                    value={manpower}
                    onChange={(e) => setManpower(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-200 font-mono"
                    placeholder="e.g. Tukang Kolom: 10, Mandor: 1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Alat Berat / Equipment Hari Ini</label>
                  <textarea 
                    rows={2}
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-200 font-mono"
                    placeholder="e.g. Excavator PC200 (1 unit), Stamper"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Material Bangunan Masuk (Logistik) *</label>
                  <textarea 
                    rows={2} required
                    value={materialsEntered}
                    onChange={(e) => setMaterialsEntered(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-200 font-mono"
                    placeholder="e.g. Semen Tiga Roda: 150 Zak, Pasir Cor: 2 Truk"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Deviasi Kendala / Isu Lapangan</label>
                  <textarea 
                    rows={2}
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-200"
                    placeholder="Isi kendala lalu lintas, pemadaman listrik, dsb..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Lampiran Foto Lapangan URL</label>
                  <input 
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 flex justify-between items-center">
                    <span>GPS Coordinates (Latitude/Longitude)</span>
                    <button type="button" onClick={handleFetchMockGPS} className="text-blue-400 text-[10px] hover:underline font-mono">Simulate GPS</button>
                  </label>
                  <input 
                    type="text"
                    value={gpsLocation}
                    onChange={(e) => setGpsLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
                <button type="button" onClick={() => setShowForm(false)} className="bg-slate-850 px-3 py-1.5 rounded text-slate-300">Batal</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-white font-bold">Simpan Buku Log</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
