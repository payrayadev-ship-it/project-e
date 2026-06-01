import React, { useState } from "react";
import { MaterialStock, MaterialLog, ERPUserRole } from "../types";
import { AlertCircle, Plus, FileSpreadsheet, ListTodo, Warehouse, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface InventoryMaterialTrackerProps {
  materials: MaterialStock[];
  logs: MaterialLog[];
  onAddLog: (log: MaterialLog) => void;
  userRole: ERPUserRole;
}

export const InventoryMaterialTracker: React.FC<InventoryMaterialTrackerProps> = ({
  materials,
  logs,
  onAddLog,
  userRole
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(materials[0]?.id || "");

  // Form State
  const [logType, setLogType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState(0);
  const [picName, setPicName] = useState("Sutrisno (Gudang Logistik Utama)");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    const matchedMat = materials.find(m => m.id === selectedMaterialId);
    if (!matchedMat) return;

    const newLog: MaterialLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      materialId: selectedMaterialId,
      materialName: matchedMat.name,
      type: logType,
      quantity: Number(quantity),
      unit: matchedMat.unit,
      picName,
      createdAt: new Date().toLocaleString("id-ID"),
      notes: notes || (logType === "IN" ? "Penerimaan Logistik Baru" : "Disbursement Unit Lapangan")
    };

    onAddLog(newLog);
    setShowAddForm(false);
    setQuantity(0);
    setNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Material Logistik & Safety Stock</h2>
          <p className="text-xs text-slate-400">Monitoring suplai semen, besi ulir, ready mix, dan proteksi resiko safety stock lapangan</p>
        </div>
        {["Pengawas Lapangan", "Site Engineer", "Super Admin", "Project Manager", "Logistics Officer"].includes(userRole) && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition shadow shadow-md w-full sm:w-auto"
          >
            <Plus size={16} /> Catat Arus Logistik (In / Out)
          </button>
        )}
      </div>

      {/* Safety Warning Indicator Banners */}
      <div className="space-y-3">
        {materials.map(mat => {
          const isBelowSafety = mat.stock < mat.minSafetyStock;
          if (!isBelowSafety) return null;

          return (
            <div key={mat.id} className="bg-red-950/35 border border-red-900 text-red-200 text-xs p-4 rounded-xl flex gap-3 items-center">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <div className="flex-grow">
                <span className="font-bold">⚠️ SAFETY STOCK MINIMUM ALERT (GUDANG DARURAT)</span>
                <p className="text-slate-300 mt-0.5">
                  Bahan baku utama <strong>{mat.name}</strong> hanya tersisa <strong>{mat.stock} {mat.unit}</strong>, berada di bawah batas kritis aman <strong>{mat.minSafetyStock} {mat.unit}</strong>. Request pengadaan material mendesak wajib diajukan ke Logistics Officer!
                </p>
              </div>
              <span className="bg-red-900 text-white font-mono text-[9px] px-2 py-1 rounded font-bold uppercase">Kritis</span>
            </div>
          );
        })}
      </div>

      {/* Materials Stock Balance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {materials.map(mat => {
          const isDanger = mat.stock < mat.minSafetyStock;
          return (
            <div key={mat.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-slate-700 transition">
              <div className="flex justify-between items-start text-xs">
                <span className="text-slate-500 font-mono">{mat.id}</span>
                <Warehouse className="text-slate-600" size={16} />
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-semibold text-slate-300">{mat.name}</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-mono font-bold ${isDanger ? "text-red-400 animate-pulse" : "text-white"}`}>
                    {mat.stock.toLocaleString()}
                  </span>
                  <span className="text-slate-400 text-xs">{mat.unit}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-850/60 flex justify-between text-[10px] text-slate-500 font-mono uppercase">
                <span>Buffer Safety:</span>
                <span className={isDanger ? "text-red-400 font-bold" : "text-slate-400"}>{mat.minSafetyStock} {mat.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction Logs Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
          <FileSpreadsheet size={14} className="text-blue-400" /> Buku Jurnal keluar Masuk Logistik
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono pb-2">
                <th className="pb-3 w-12 text-center">Kode</th>
                <th className="pb-3">Waktu Log</th>
                <th className="pb-3">Nama Material</th>
                <th className="pb-3 text-center">Arus Logistik</th>
                <th className="pb-3 text-right">Volume</th>
                <th className="pb-3">Dilog Oleh (PIC)</th>
                <th className="pb-3">Catatan / Area Kerja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {logs.map((lg, idx) => (
                <tr key={lg.id || idx} className="hover:bg-slate-950/35 transition">
                  <td className="py-3 text-slate-500 font-mono text-[10px] text-center">{lg.id}</td>
                  <td className="py-3 text-slate-400 font-mono text-[10px]">{lg.createdAt}</td>
                  <td className="py-3 text-slate-200 font-semibold">{lg.materialName}</td>
                  <td className="py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                      lg.type === "IN" 
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-900" 
                        : "bg-red-950 text-red-400 border border-red-900"
                    }`}>
                      {lg.type === "IN" ? (
                        <>
                          <ArrowUpRight size={10} /> TERIMA (IN)
                        </>
                      ) : (
                        <>
                          <ArrowDownRight size={10} /> KELUAR (OUT)
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono text-slate-200 font-bold">{lg.quantity.toLocaleString()} {lg.unit}</td>
                  <td className="py-3 text-slate-400 font-mono text-[11px]">{lg.picName}</td>
                  <td className="py-3 text-slate-400 italic">"{lg.notes}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Add Inventory logs modal popup */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-xl p-6 text-slate-200 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-850 pb-2">Catat Buku Jurnal Logistik</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tipe Transaksi</label>
                  <select
                    value={logType}
                    onChange={(e) => setLogType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white font-mono"
                  >
                    <option value="IN">IN (Penerimaan Gudang)</option>
                    <option value="OUT">OUT (Pengeluaran Lapangan)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Pilih Jenis Material</label>
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white font-mono"
                  >
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Kuantitas Volume *</label>
                  <input
                    type="number" required min="1"
                    placeholder="Volume Kuantitas"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Petugas Penerima / PIC</label>
                  <input
                    type="text"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Catatan Tambahan / Invoice No / Pekerjaan Area</label>
                <input
                  type="text"
                  placeholder="e.g. Dipergunakan untuk Struktur Kolom Slab Lt. 4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
                <button type="button" onClick={() => setShowAddForm(false)} className="bg-slate-850 px-3 py-1.5 rounded text-slate-300">Batal</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-white font-bold">Kirim Transaksi</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
