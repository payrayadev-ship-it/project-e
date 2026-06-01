import React, { useState, useEffect } from "react";
import { Mail, Printer, X, Eye, RefreshCcw, CheckCircle2, Clock, Search, AlertCircle } from "lucide-react";

interface EmailSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  loggedUserEmail?: string;
}

interface SimulatedEmail {
  id: string;
  type: "REGISTER" | "TENDER_SUBMISSION";
  to: string;
  toName: string;
  subject: string;
  html: string;
  timestamp: string;
  formattedTime: string;
  status: string;
}

export const EmailSimulatorModal: React.FC<EmailSimulatorModalProps> = ({
  isOpen,
  onClose,
  loggedUserEmail = ""
}) => {
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [testSentMsg, setTestSentMsg] = useState("");

  const fetchEmailHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/email/history");
      if (res.ok) {
        const data = await res.json();
        const history: SimulatedEmail[] = data.emails || [];
        setEmails(history);
        if (history.length > 0 && !selectedEmail) {
          setSelectedEmail(history[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch email history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmailHistory();
    }
  }, [isOpen]);

  const handleSendTestEmail = async (type: "REGISTER" | "TENDER_SUBMISSION") => {
    setLoading(true);
    setTestSentMsg("");
    try {
      const payload = {
        type,
        email: loggedUserEmail || "rekanan-test@foresyndo.com",
        name: type === "REGISTER" ? "PT. Megah Wijaya Karya" : "PT. Krakatau Karya Jaya (Rekanan)",
        details: type === "REGISTER" ? {
          company: "PT. Megah Wijaya Karya",
          role: "Kontraktor"
        } : {
          bidId: `BID-${Math.floor(100 + Math.random() * 900)}`,
          tenderId: "TND-BG005-2026",
          tenderTitle: "Pembangunan Struktur Kolom Bendungan Sesi II",
          bidValue: 42500000000,
          nib: "9120301928371",
          npwp: "01.324.552.1-013.000",
          sbu: "SBU-BG009-2025-001"
        }
      };

      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setTestSentMsg(`Simulasi email '${type}' sukses dikirim ke ${payload.email}!`);
        await fetchEmailHistory();
      }
    } catch (e) {
      console.error("Failed to dispatch test email", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredEmails = emails.filter(em => 
    em.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
    em.toName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    em.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    em.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex justify-center items-center z-50 p-4 font-sans text-slate-800 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-900/40 border border-blue-500/30 rounded-lg flex items-center justify-center text-blue-400">
              <Mail size={18} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Simulasi Server Notifikasi Email FORSDIG</h2>
              <p className="text-[10px] text-slate-400 font-mono">PT. Foresyndo Global Indonesia - Security Digital Barcode Dispatch Logs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full cursor-pointer transition shadow"
          >
            <X size={16} />
          </button>
        </div>

        {/* Workspace Grid */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Panel: List of Sent Emails */}
          <div className="w-full md:w-2/5 border-r border-slate-800 flex flex-col bg-slate-950/40 overflow-hidden">
            {/* Search and Controller */}
            <div className="p-4 border-b border-slate-800 space-y-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Cari penerima, subjek, tipe..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-600 font-sans placeholder-slate-500"
                />
              </div>

              {/* Simulation triggers */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSendTestEmail("REGISTER")}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[10px] py-1.5 px-2 rounded border border-slate-700 cursor-pointer text-center transition"
                >
                  📧 Kirim Test Reg
                </button>
                <button
                  onClick={() => handleSendTestEmail("TENDER_SUBMISSION")}
                  className="flex-1 bg-blue-950/60 hover:bg-blue-900 text-blue-300 font-semibold text-[10px] py-1.5 px-2 rounded border border-blue-900/50 cursor-pointer text-center transition"
                >
                  📨 Kirim Test Tender
                </button>
                <button
                  onClick={fetchEmailHistory}
                  title="Refresh Logs"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded border border-slate-700 cursor-pointer transition"
                >
                  <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              {testSentMsg && (
                <div className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 p-2 rounded flex items-center gap-1.5">
                  <CheckCircle2 size={11} /> <span>{testSentMsg}</span>
                </div>
              )}
            </div>

            {/* Email Inbox Log List */}
            <div className="flex-grow overflow-y-auto divide-y divide-slate-850">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                  <AlertCircle className="mx-auto text-slate-600" size={24} />
                  <p>Tidak ada log pengiriman email template yang ditemukan.</p>
                  <p className="text-[10px] opacity-75">Silakan lakukan registrasi mitra baru, ajukan berkas tender lelang kontraktor, atau kirim email simulasi test di atas.</p>
                </div>
              ) : (
                filteredEmails.map((em) => {
                  const isSelected = selectedEmail?.id === em.id;
                  return (
                    <button
                      key={em.id}
                      onClick={() => setSelectedEmail(em)}
                      className={`w-full text-left p-3.5 flex flex-col space-y-1.5 transition cursor-pointer border-l-2 ${
                        isSelected 
                          ? "bg-blue-600/10 border-blue-500" 
                          : "hover:bg-slate-850/40 border-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono ${
                          em.type === "REGISTER" 
                            ? "bg-slate-800 text-slate-200 border border-slate-700" 
                            : "bg-blue-950 text-blue-400 border border-blue-900"
                        }`}>
                          {em.type}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                          <Clock size={10} />
                          <span>{em.formattedTime.split(" ")[1] || "Just now"}</span>
                        </div>
                      </div>

                      <div className="text-xs font-bold text-white truncate max-w-[280px]">
                        {em.subject}
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span className="truncate max-w-[150px]">Kepada: <strong>{em.toName}</strong></span>
                        <span className="font-mono text-emerald-400 text-[9px]">{em.to}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: High-Fidelity Email Client Preview */}
          <div className="flex-grow flex flex-col bg-slate-950 overflow-hidden">
            {selectedEmail ? (
              <div className="flex-grow flex flex-col overflow-hidden">
                {/* Meta details */}
                <div className="bg-slate-900 border-b border-slate-850 p-4 space-y-2 text-xs shrink-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-[#F8FAFC] text-sm">{selectedEmail.subject}</h3>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Dari: <strong className="text-slate-300">PT. Foresyndo Global Indonesia &lt;procurement@foresyndo.com&gt;</strong>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Kepada: <strong className="text-blue-400">{selectedEmail.toName} &lt;{selectedEmail.to}&gt;</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2.5 py-1 rounded font-mono font-bold uppercase">
                        🟢 DELIVERED
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">{selectedEmail.timestamp}</p>
                    </div>
                  </div>
                </div>

                {/* Simulated Web Email View */}
                <div className="flex-grow bg-slate-950 p-4 overflow-y-auto">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 mx-auto max-w-2xl overflow-hidden min-h-[500px]">
                    <iframe
                      title="HTML Email Preview"
                      srcDoc={selectedEmail.html}
                      className="w-full h-[600px] border-0"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col justify-center items-center text-slate-500 text-xs space-y-2 p-8 text-center">
                <Mail size={32} className="text-slate-600 animate-pulse" />
                <p>Silakan pilih atau kirim email di daftar log di samping kiri untuk melihat simulasi layout template email.</p>
              </div>
            )}
          </div>

        </div>
        
        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-850 px-6 py-3 flex justify-between items-center shrink-0">
          <span className="text-[10px] text-slate-500 font-mono">© 2026 FORSDIG INTEGRATED MAIL HUB</span>
          <span className="text-[9px] text-emerald-400 font-mono">STAMP GENERATOR STATUS: SECURED</span>
        </div>

      </div>
    </div>
  );
};
