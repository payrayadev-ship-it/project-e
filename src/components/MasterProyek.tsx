import React, { useState } from "react";
import { Project, ProjectStatus } from "../types";
import { Plus, X, MapPin, Calculator, Calendar, FileText, CheckCircle, Edit3 } from "lucide-react";

interface MasterProyekProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onUpdateProject: (projectId: string, updated: Partial<Project>) => void;
  userRole: string;
}

export const MasterProyek: React.FC<MasterProyekProps> = ({
  projects,
  onAddProject,
  onUpdateProject,
  userRole
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  
  // New Project Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [value, setValue] = useState(0);
  const [landArea, setLandArea] = useState(0);
  const [buildingArea, setBuildingArea] = useState(0);
  const [type, setType] = useState("Residential");
  const [status, setStatus] = useState<ProjectStatus>("Perencanaan");
  const [targetDate, setTargetDate] = useState("2027-12-31");
  const [progressPhysical, setProgressPhysical] = useState(0);
  const [progressFinancial, setProgressFinancial] = useState(0);
  const [description, setDescription] = useState("");

  const [documentUrl, setDocumentUrl] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [projectDocuments, setProjectDocuments] = useState<{projectId: string, title: string, url: string}[]>([
    { projectId: "PROJ-001", title: "IMB (Izin Mendirikan Bangunan) - Approved", url: "#" },
    { projectId: "PROJ-001", title: "Sertifikat Amdal Lingkungan Hidup", url: "#" },
    { projectId: "PROJ-002", title: "Sertifikat Hak Guna Bangunan Utama", url: "#" }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || value <= 0) return;

    const newProj: Project = {
      id: `PROJ-${Math.floor(100 + Math.random() * 900)}`,
      name,
      location,
      value: Number(value),
      landArea: Number(landArea),
      buildingArea: Number(buildingArea),
      type,
      status,
      targetDate,
      progressPhysical: Number(progressPhysical),
      progressFinancial: Number(progressFinancial),
      description,
      createdAt: new Date().toISOString()
    };

    onAddProject(newProj);
    setShowAddForm(false);
    
    // Reset Form
    setName("");
    setLocation("");
    setValue(0);
    setLandArea(0);
    setBuildingArea(0);
    setDescription("");
  };

  const handleDocAdd = (projId: string) => {
    if (!documentTitle) return;
    setProjectDocuments([...projectDocuments, {
      projectId: projId,
      title: documentTitle,
      url: documentUrl || "#"
    }]);
    setDocumentTitle("");
    setDocumentUrl("");
  };

  const filteredProjects = activeFilter === "All" 
    ? projects 
    : projects.filter(p => p.status === activeFilter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Master Proyek</h2>
          <p className="text-xs text-slate-500">Kelola dan analisis seluruh aset portofolio konstruksi owner</p>
        </div>
        {["Super Admin", "Direktur", "Project Director", "Project Manager"].includes(userRole) && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#0F4C81] hover:bg-[#125B9A] text-white font-medium text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition"
          >
            <Plus size={16} /> Buat Paket Proyek Baru
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {["All", "Perencanaan", "Tender", "Berjalan", "Pemeliharaan", "Selesai"].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl cursor-pointer transition ${
              activeFilter === f 
                ? "bg-[#0F4C81]/15 text-[#0F4C81] border border-[#0F4C81]/20 font-bold"
                : "border border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            {f === "All" ? "Semua Proyek" : f}
          </button>
        ))}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map(p => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:border-[#0F4C81] transition">
            
            {/* Title Block */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-[#0F4C81] font-bold tracking-wider">{p.id}</span>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">{p.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{p.location}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold font-mono tracking-wider px-2.5 py-1 rounded ${
                p.status === "Berjalan" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                p.status === "Tender" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                p.status === "Perencanaan" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                "bg-slate-105 text-slate-700 border border-slate-200"
              }`}>
                {p.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-[#0F4C81]/40 pl-3">
              "{p.description || "Tidak ada deskripsi tambahan."}"
            </p>

            {/* Project Specs */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl text-xs font-mono border border-slate-100">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Nilai Proyek</span>
                <span className="text-[#0F4C81] font-extrabold text-[11px] truncate block">{formatCurrency(p.value)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Luas Lahan</span>
                <span className="text-slate-700 block font-semibold text-[11px]">{p.landArea.toLocaleString()} m²</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Luas Bangunan</span>
                <span className="text-slate-700 block font-semibold text-[11px]">{p.buildingArea.toLocaleString()} m²</span>
              </div>
            </div>

            {/* Tracking Progress Slides */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span className="flex items-center gap-1 font-sans font-medium">
                    <CheckCircle size={12} className="text-emerald-600" /> Progress Realisasi Fisik
                  </span>
                  <span className="font-mono text-emerald-600 font-extrabold">{p.progressPhysical}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${p.progressPhysical}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span className="flex items-center gap-1 font-sans font-medium">
                    <Calculator size={12} className="text-[#0F4C81]" /> Progress Realisasi Keuangan
                  </span>
                  <span className="font-mono text-[#0F4C81] font-extrabold">{p.progressFinancial}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[0F4C81] bg-[#0F4C81] rounded-full" 
                    style={{ width: `${p.progressFinancial}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Interactive Progress Editor (Only for authorised roles) */}
            {["Project Manager", "Project Director", "Site Engineer", "Super Admin"].includes(userRole) && (
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2.5">
                <span className="text-[10px] text-[#0F4C81] uppercase font-mono font-bold tracking-wider flex items-center gap-1">
                  <Edit3 size={11} /> Update Progress Lapangan (PM Controls)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1 font-bold">Set Fisik (%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={p.progressPhysical}
                      onChange={(e) => onUpdateProject(p.id, { progressPhysical: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-mono focus:border-[#0F4C81] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1 font-bold">Set Finansial (%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={p.progressFinancial}
                      onChange={(e) => onUpdateProject(p.id, { progressFinancial: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-mono focus:border-[#0F4C81] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2.5 mt-1">
                  <select
                    value={p.status}
                    onChange={(e) => onUpdateProject(p.id, { status: e.target.value as ProjectStatus })}
                    className="w-full bg-white border border-slate-200 px-2 py-1.5 text-xs rounded-lg text-[#0F4C81] font-mono focus:border-[#0F4C81] focus:outline-none"
                  >
                    <option value="Perencanaan">Status: Perencanaan</option>
                    <option value="Tender">Status: Tender</option>
                    <option value="Berjalan">Status: Berjalan</option>
                    <option value="Pemeliharaan">Status: Pemeliharaan</option>
                    <option value="Selesai">Status: Selesai</option>
                  </select>
                </div>
              </div>
            )}

            {/* Project Documents Section */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Lampiran Legalitas & Gambar Kerja ({projectDocuments.filter(d => d.projectId === p.id).length})</span>
              <div className="space-y-1.5">
                {projectDocuments
                  .filter(d => d.projectId === p.id)
                  .map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl text-slate-700 border border-slate-100">
                      <span className="flex items-center gap-1.5 max-w-[80%] truncate">
                        <FileText size={12} className="text-[#0F4C81] shrink-0" /> {doc.title}
                      </span>
                      <a href={doc.url} className="text-[#0F4C81] hover:underline text-[10px] uppercase font-bold font-mono">Download</a>
                    </div>
                  ))}
              </div>

              {/* Document Simulator Attachment */}
              <div className="mt-3 grid grid-cols-1 gap-2 bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200">
                <input 
                  type="text"
                  placeholder="Nama Dokumen Legalitas..."
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                />
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Link URL (e.g. #)"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    className="w-1/2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-500"
                  />
                  <button 
                    onClick={() => handleDocAdd(p.id)}
                    className="w-1/2 bg-[#0F4C81] hover:bg-[#125B9A] text-white rounded-lg text-xs py-1.5 cursor-pointer font-bold transition"
                  >
                    Simpan Dokumen
                  </button>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Floating Add Project Modal Popup */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl p-6 text-slate-800 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-850 uppercase">Buat Paket Proyek Baru (PT. Foresyndo Owner ERP)</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nama Proyek *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Apartemen Foresyndo Tower Mas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Lokasi Proyek</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Jakarta Selatan"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Nilai Proyek (IDR) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Nilai HPS Proyek"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Luas Lahan (m²)</label>
                  <input 
                    type="number" 
                    value={landArea}
                    onChange={(e) => setLandArea(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Luas Bangunan (m²)</label>
                  <input 
                    type="number" 
                    value={buildingArea}
                    onChange={(e) => setBuildingArea(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Tipe Konstruksi</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] focus:outline-none"
                  >
                    <option value="Residential">Residential</option>
                    <option value="High-Rise Apartments">High-Rise Apartments</option>
                    <option value="Commercial Business">Commercial Business</option>
                    <option value="Industrial Warehouse">Industrial Warehouse</option>
                    <option value="Infrastructure Road">Infrastructure Road</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Status Konstruksi</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] focus:outline-none"
                  >
                    <option value="Perencanaan">Perencanaan</option>
                    <option value="Tender">Tender</option>
                    <option value="Berjalan">Berjalan</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Deskripsi & Catatan Proyek</label>
                <textarea 
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] focus:outline-none"
                  placeholder="Tambahkan spesifikasi konstruksi utama di sini..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#0F4C81] hover:bg-[#125B9A] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  Daftarkan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
