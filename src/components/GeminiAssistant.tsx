import React, { useState } from "react";
import { Project, BOQItem, TenderBid, WorkProgress, DailyReport, MaterialStock, VariationOrder, PaymentTerm } from "../types";
import { Sparkles, Send, RefreshCw, Star, Ban, HelpCircle, Flame, DollarSign, Clock, AlertTriangle, FileText } from "lucide-react";

interface GeminiAssistantProps {
  projects: Project[];
  boqList: BOQItem[];
  bids: TenderBid[];
  progressList: WorkProgress[];
  reports: DailyReport[];
  materials: MaterialStock[];
  variationOrders: VariationOrder[];
  paymentTerms: PaymentTerm[];
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({
  projects,
  boqList,
  bids,
  progressList,
  reports,
  materials,
  variationOrders,
  paymentTerms
}) => {
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: "Halo! Saya adalah **FORSDIG AI Assistant** berbasis Gemini AI. Saya telah mensinkronisasi seluruh data gudang logistik, rincian biaya BOQ, Variation Orders, progress mingguan, dan laporan harian proyek PT. Foresyndo Global Indonesia.\n\nSilakan pilih menu Pintasan Analisis di bawah atau ajukan pertanyaan spesifik Anda!"
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeProject, setActiveProject] = useState<string>(projects[0]?.id || "");

  const getSystemContext = () => {
    const proj = projects.find(p => p.id === activeProject) || projects[0];
    const boqs = boqList.filter(b => b.projectId === proj?.id);
    const projBids = bids.filter(b => b.tenderId === proj?.id);
    const reportsLog = reports.filter(r => r.projectId === proj?.id);
    const voLogs = variationOrders.filter(v => v.projectId === proj?.id);
    const milestones = paymentTerms.filter(m => m.projectId === proj?.id);

    return {
      company: "PT. Foresyndo Global Indonesia",
      system: "FORSDIG Construction ERP",
      proyekAktif: proj,
      rincianBoqRAB: boqs,
      bidsPengajuanTender: projBids,
      siteLogsHarian: reportsLog,
      variationOrders: voLogs,
      jadwalTerminMilestones: milestones,
      materialInventoryGlobal: materials
    };
  };

  const handleSendMessage = async (textToSend: string, isQuickPrompt = false) => {
    if (!textToSend.trim() && !isQuickPrompt) return;
    setLoading(true);

    const userQuery = textToSend || userInput;
    if (!isQuickPrompt) {
      setMessages(prev => [...prev, { sender: "user", text: userQuery }]);
      setUserInput("");
    } else {
      setMessages(prev => [...prev, { sender: "user", text: `[Pintasan Analitis] ${userQuery}` }]);
    }

    try {
      const resp = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userQuery,
          contextData: getSystemContext()
        })
      });

      const data = await resp.json();
      if (data.error) {
        setMessages(prev => [...prev, { 
          sender: "ai", 
          text: `⚠️ **Error dari Server:**\n\n${data.error}` 
        }]);
      } else {
        setMessages(prev => [...prev, { sender: "ai", text: data.result }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        sender: "ai", 
        text: `Error menghubungi asisten AI: ${err.message}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
            <Sparkles className="text-[#0F4C81]" size={18} /> FORSDIG AI Consultant (Gemini AI)
          </h2>
          <p className="text-xs text-slate-500">Pusat analitik prediksi kendala keterlambatan, mitigasi pembengkakan biaya, dan evaluasi rekanan</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500 font-mono font-bold">Fokus Proyek Analisis:</label>
          <select
            value={activeProject}
            onChange={(e) => setActiveProject(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs py-2 px-3 text-slate-700 font-semibold focus:border-[#0F4C81] focus:outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Quick Action Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Trigger 1 */}
        <button
          onClick={() => handleSendMessage("Analisis deviasi keterlambatan fisik proyek ini. Bandingkan dengan laporan harian cuaca dan kendala lapangan yang tercatat.", true)}
          className="bg-white border border-slate-200 p-4 rounded-2xl flex items-start gap-3.5 hover:border-[#0F4C81] hover:bg-slate-50/50 text-left transition cursor-pointer shadow-sm"
        >
          <Clock className="text-amber-500 shrink-0 mt-1" size={18} />
          <div>
            <h4 className="text-xs font-bold text-slate-800">Analisis Keterlambatan Fisik</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">Estimasi deviasi S-Curve berdasar tantangan cuaca dan logistik.</p>
          </div>
        </button>

        {/* Trigger 2 */}
        <button
          onClick={() => handleSendMessage("Lakukan analisa budget overrun/over-budget proyek. Bandingkan nilai realisasi pada list BOQ dengan pagu anggaran awal, sebutkan item tertinggi pemicu.", true)}
          className="bg-white border border-slate-200 p-4 rounded-2xl flex items-start gap-3.5 hover:border-[#0F4C81] hover:bg-slate-50/50 text-left transition cursor-pointer shadow-sm"
        >
          <AlertTriangle className="text-rose-500 shrink-0 mt-1" size={18} />
          <div>
            <h4 className="text-xs font-bold text-slate-800">Prediksi Over-Budget BOQ</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">Analisa penyimpangan unit price material & amandemen Variation Order.</p>
          </div>
        </button>

        {/* Trigger 3 */}
        <button
          onClick={() => handleSendMessage("Buat proyeksi cashflow & arus kas proyek berdasarkan milestones termin yang belum terbayar vs estimasi pengeluaran kontraktor.", true)}
          className="bg-white border border-slate-200 p-4 rounded-2xl flex items-start gap-3.5 hover:border-[#0F4C81] hover:bg-slate-50/50 text-left transition cursor-pointer shadow-sm"
        >
          <DollarSign className="text-emerald-600 shrink-0 mt-1" size={18} />
          <div>
            <h4 className="text-xs font-bold text-slate-800">Proyeksi Arus Kas / Cash Flow</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">Audit likuiditas termin jatuh tempo dan cash outflow pembangunan.</p>
          </div>
        </button>

        {/* Trigger 4 */}
        <button
          onClick={() => handleSendMessage("Evaluasi performa kinerja kontraktor pelaksana berdasar ketepatan waktu, kualitas QC checklist, dan kesesuaian nilai penawaran.", true)}
          className="bg-white border border-slate-200 p-4 rounded-2xl flex items-start gap-3.5 hover:border-[#0F4C81] hover:bg-slate-50/50 text-left transition cursor-pointer shadow-sm"
        >
          <Star className="text-[#0F4C81] shrink-0 mt-1" size={18} />
          <div>
            <h4 className="text-xs font-bold text-slate-800">Evaluasi Rekanan Kontraktor</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">Rating kualifikasi kontraktor dibanding target sertifikasi IMB.</p>
          </div>
        </button>

        {/* Trigger 5 */}
        <button
          onClick={() => handleSendMessage("Tulis resume otomatis komprehensif mengenai progress fisik & kendala mingguan terakhir yang sah.", true)}
          className="bg-white border border-slate-200 p-4 rounded-2xl flex items-start gap-3.5 hover:border-[#0F4C81] hover:bg-slate-50/50 text-left transition cursor-pointer shadow-sm"
        >
          <FileText className="text-blue-500 shrink-0 mt-1" size={18} />
          <div>
            <h4 className="text-xs font-bold text-slate-800">Resume Progres & Site Report</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">Sintesa otomatis logbook harian pengawas dan semen keluar masuk.</p>
          </div>
        </button>

        {/* Trigger 6 */}
        <button
          onClick={() => handleSendMessage("Berikan rangkuman audit mitigasi resiko keselamatan, kekuatan struktur (QC), dan ketersediaan semen di gudang saat ini.", true)}
          className="bg-white border border-slate-200 p-4 rounded-2xl flex items-start gap-3.5 hover:border-[#0F4C81] hover:bg-slate-50/50 text-left transition cursor-pointer shadow-sm"
        >
          <Flame className="text-rose-500 shrink-0 mt-1" size={18} />
          <div>
            <h4 className="text-xs font-bold text-slate-800">Rangkuman Mitigasi Resiko Proyek</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">Analisis logistis kritis terhadap safety stock material semen.</p>
          </div>
        </button>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[500px] shadow-sm">
        {/* Chat window viewport */}
        <div className="p-5 flex-grow overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div 
              key={idx}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.sender === "user" 
                  ? "bg-[#0F4C81] text-white rounded-tr-none font-semibold shadow-sm" 
                  : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none space-y-2 whitespace-pre-wrap shadow-sm"
              }`}>
                {/* Simplified markdown handling for formatting (e.g. bold titles **text**, list items) */}
                {m.text.split("\n\n").map((para, pIdx) => {
                  return (
                    <p key={pIdx}>
                      {para.split("**").map((chunk, cIdx) => {
                        return cIdx % 2 === 1 ? <strong key={cIdx} className="text-[#0F4C81] font-bold bg-[#0F4C81]/10 px-1 rounded">{chunk}</strong> : chunk;
                      })}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-500 flex items-center gap-2.5 shadow-sm">
                <RefreshCw size={14} className="animate-spin text-[#0F4C81]" />
                <span>Gemini AI sedang mengolah koordinasi data konstruksi, mohon tunggu...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage("")}
            placeholder="Tanyakan analisis deviasi biaya, evaluasi RAB BOQ, harian cuaca dsb..."
            className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#0F4C81] shadow-sm"
          />
          <button
            onClick={() => handleSendMessage("")}
            disabled={loading || !userInput.trim()}
            className="bg-[#0F4C81] hover:bg-[#125B9A] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl px-4 flex items-center justify-center transition cursor-pointer shadow-sm font-bold"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
