import React, { useState } from "react";
import { BOQItem, Project } from "../types";
import { AlertCircle, Plus, Info, Wallet, TrendingDown, RefreshCw } from "lucide-react";

interface BoqRabProps {
  boqList: BOQItem[];
  projects: Project[];
  onAddBoqItem: (item: BOQItem) => void;
  userRole: string;
}

export const BoqRab: React.FC<BoqRabProps> = ({
  boqList,
  projects,
  onAddBoqItem,
  userRole
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [showAddForm, setShowAddForm] = useState(false);

  // New Item State
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState<"Struktur" | "Arsitektur" | "MEP" | "Infrastruktur">("Struktur");
  const [unit, setUnit] = useState("m3");
  const [volume, setVolume] = useState(0);
  const [unitPriceBudget, setUnitPriceBudget] = useState(0);
  const [unitPriceActual, setUnitPriceActual] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || volume <= 0) return;

    const newItem: BOQItem = {
      id: `BOQ-${Math.floor(1000 + Math.random() * 9000)}`,
      projectId: selectedProjectId,
      itemCode: itemCode || `BOQ-${category.slice(0, 2).toUpperCase()}`,
      itemName,
      category,
      unit,
      volume: Number(volume),
      unitPriceBudget: Number(unitPriceBudget),
      unitPriceActual: Number(unitPriceActual)
    };

    onAddBoqItem(newItem);
    setShowAddForm(false);
    
    // Reset Form
    setItemCode("");
    setItemName("");
    setVolume(0);
    setUnitPriceBudget(0);
    setUnitPriceActual(0);
  };

  const currentBoqs = boqList.filter(b => b.projectId === selectedProjectId);
  const selectedProjectObj = projects.find(p => p.id === selectedProjectId);

  // Totals calculations
  const totalBudget = currentBoqs.reduce((acc, current) => acc + (current.volume * current.unitPriceBudget), 0);
  const totalActual = currentBoqs.reduce((acc, current) => acc + (current.volume * current.unitPriceActual), 0);
  const varianceValue = totalBudget - totalActual;
  const isOverBudget = totalActual > totalBudget;

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
          <h2 className="text-xl font-semibold text-white tracking-tight">RAB & Bill of Quantities (BOQ)</h2>
          <p className="text-xs text-slate-400">Analisis estimasi volume kualitatif konstruksi kontraktor dibanding pagu owner</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs text-slate-400 font-mono shrink-0">Pilih Proyek:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-blue-500 w-full sm:w-48"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Financial Health Alerts Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Budget limit */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Total Anggaran Pagu (RAB)</span>
          <h3 className="text-xl font-mono font-bold text-white tracking-tight">
            {formatCurrency(totalBudget)}
          </h3>
          <p className="text-xs text-slate-400">Total volume dikali estimasi harga satuan rencana</p>
        </div>

        {/* Card 2: Actual Spend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Total Realisasi Harga Kontrak</span>
          <h3 className="text-xl font-mono font-bold text-blue-400 tracking-tight">
            {formatCurrency(totalActual)}
          </h3>
          <p className="text-xs text-slate-400">Alokasi nilai kontrak final ditandatangani</p>
        </div>

        {/* Card 3: Saved / Over limit */}
        <div className={`border rounded-xl p-5 shadow-sm space-y-1 transition ${
          varianceValue >= 0 
            ? "bg-slate-900 border-slate-800" 
            : "bg-red-950/20 border-red-900/60"
        }`}>
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Selisih Anggaran (Cost Control)</span>
          <h3 className={`text-xl font-mono font-bold tracking-tight ${
            varianceValue >= 0 ? "text-emerald-400" : "text-red-400"
          }`}>
            {varianceValue >= 0 ? "+" : ""}{formatCurrency(varianceValue)}
          </h3>
          <p className="text-xs text-slate-400">
            {varianceValue >= 0 ? "🟢 Cost Saving Efisien" : "🔴 Over Budget Alert!"}
          </p>
        </div>
      </div>

      {/* Over Budget Notice */}
      {isOverBudget && (
        <div className="bg-red-950/30 border border-red-900/60 text-red-200 text-xs p-4 rounded-xl flex gap-3 items-start">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
          <div>
            <span className="font-bold">SISTEM MONITORING OVER-BUDGET: PERINGATAN BIAYA</span>
            <p className="mt-1 text-slate-300">
              Jumlah beban biaya realisasi aktual melampaui pagu target awal untuk proyek <strong>{selectedProjectObj?.name}</strong>. Quantity Surveyor (QS) disarankan mengecek kembali anomali material atau varian spesifikasi melalui modul Change Order.
            </p>
          </div>
        </div>
      )}

      {/* BOQ Table Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-white">Bill of Quantities (BOQ) Rincian Item Pekerjaan</h3>
          {["Quantity Surveyor", "Project Manager", "Super Admin"].includes(userRole) && (
            <button
              onClick={() => setShowAddForm(true)}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 transition"
            >
              <Plus size={14} /> Tambah Item BOQ
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-3 text-center w-12">Kode</th>
                <th className="pb-3">Deskripsi Item Pekerjaan</th>
                <th className="pb-3">Kategori</th>
                <th className="pb-3 text-center">Volume</th>
                <th className="pb-3 text-right">Harga Target (Pagu)</th>
                <th className="pb-3 text-right">Harga Kontrak (Aktual)</th>
                <th className="pb-3 text-right">Deviasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {currentBoqs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-8 italic">
                    Belum ada item BOQ terdaftar pada proyek ini. Harap tambahkan rincian baru.
                  </td>
                </tr>
              ) : (
                currentBoqs.map(b => {
                  const subTotalProp = b.volume * b.unitPriceBudget;
                  const subTotalAct = b.volume * b.unitPriceActual;
                  const itemVariance = subTotalProp - subTotalAct;
                  const itemExceeded = subTotalAct > subTotalProp;

                  return (
                    <tr key={b.id} className="hover:bg-slate-950/40 transition">
                      <td className="py-3.5 text-center font-mono text-[10px] text-slate-500">{b.itemCode}</td>
                      <td className="py-3.5 text-slate-200">
                        <div className="font-semibold">{b.itemName}</div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Satuan: 1 {b.unit}</span>
                      </td>
                      <td className="py-3.5 text-slate-400">{b.category}</td>
                      <td className="py-3.5 text-center font-mono text-slate-300 font-bold">{b.volume.toLocaleString()}</td>
                      <td className="py-3.5 text-right font-mono text-slate-400">
                        <div>{formatCurrency(b.unitPriceBudget)}</div>
                        <span className="text-[9px] text-slate-500">Total: {formatCurrency(subTotalProp)}</span>
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-300">
                        <div className={`${itemExceeded ? "text-amber-400 font-bold" : ""}`}>{formatCurrency(b.unitPriceActual)}</div>
                        <span className="text-[9px] text-slate-500">Total: {formatCurrency(subTotalAct)}</span>
                      </td>
                      <td className={`py-3.5 text-right font-mono font-bold ${
                        itemVariance >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {itemVariance >= 0 ? "+" : ""}{formatCurrency(itemVariance)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Add BOQ Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 text-slate-200 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-850 pb-2">Tambah Item Pekerjaan BOQ</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Kode Item</label>
                  <input type="text" placeholder="e.g. ST-01" value={itemCode} onChange={(e) => setItemCode(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Kategori Pekerjaan</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white">
                    <option value="Struktur">Struktur</option>
                    <option value="Arsitektur">Arsitektur</option>
                    <option value="MEP">MEP</option>
                    <option value="Infrastruktur">Infrastruktur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Deskripsi Item Pekerjaan *</label>
                <input type="text" required placeholder="e.g. Cor Beton Ulir Bored Pile" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Satuan Ukur</label>
                  <input type="text" placeholder="e.g. m3, m2, Unit, Kg" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Volume Kuantitas *</label>
                  <input type="number" required placeholder="Volume" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Harga Satuan Target (Pagu)</label>
                  <input type="number" placeholder="IDR sat" value={unitPriceBudget} onChange={(e) => setUnitPriceBudget(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Harga Satuan Kontrak (Aktual)</label>
                  <input type="number" placeholder="IDR sat" value={unitPriceActual} onChange={(e) => setUnitPriceActual(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white font-mono" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
                <button type="button" onClick={() => setShowAddForm(false)} className="bg-slate-850 px-3 py-1.5 rounded text-slate-300">Batal</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-white font-bold">Simpan Item BOQ</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
