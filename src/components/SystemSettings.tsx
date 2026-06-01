import React, { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { ERPUserRole } from "../types";
import { 
  Building2, MapPin, Mail, Phone, ShieldCheck, Eye, EyeOff, Save, RefreshCw, Key, Info, CheckCircle2, Lock, Sparkles, HelpCircle, AlertTriangle
} from "lucide-react";

interface SystemSettingsProps {
  language: "ID" | "EN";
}

export interface SystemConfig {
  officeAddress: string;
  officeEmail: string;
  officeWhatsapp: string;
  rolePasswords: Record<ERPUserRole, string>;
}

const DEFAULT_CONFIG: SystemConfig = {
  officeAddress: "Gedung Foresyndo Multi-Infrastruktur Lt. 8, Mega Kuningan, Jakarta Selatan, 12950",
  officeEmail: "procurement@foresyndo.com",
  officeWhatsapp: "+628119002821",
  rolePasswords: {
    "Super Admin": "admin123",
    "Direktur": "admin123",
    "Project Director": "admin123",
    "Project Manager": "admin123",
    "Quantity Surveyor": "admin123",
    "Site Engineer": "admin123",
    "Pengawas Lapangan": "admin123",
    "Purchasing": "admin123",
    "Finance": "admin123",
    "Kontraktor": "admin123",
    "Subkontraktor": "admin123",
    "Konsultan Pengawas": "admin123"
  }
};

export default function SystemSettings({ language }: SystemSettingsProps) {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPasswordRole, setShowPasswordRole] = useState<Record<string, boolean>>({});

  // Fetch real-time settings
  useEffect(() => {
    const docRef = doc(db, "system_settings", "config");
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SystemConfig;
        
        // Merge with defaults in case of missing roles
        const mergedPasswords = { ...DEFAULT_CONFIG.rolePasswords, ...data.rolePasswords };
        setConfig({
          officeAddress: data.officeAddress || DEFAULT_CONFIG.officeAddress,
          officeEmail: data.officeEmail || DEFAULT_CONFIG.officeEmail,
          officeWhatsapp: data.officeWhatsapp || DEFAULT_CONFIG.officeWhatsapp,
          rolePasswords: mergedPasswords
        });
      } else {
        // Doc doesn't exist, create it with default
        setDoc(docRef, DEFAULT_CONFIG).catch((err) => {
          console.error("Error creating default system settings:", err);
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error on system_settings/config:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFieldChange = (field: keyof Omit<SystemConfig, "rolePasswords">, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveSuccess(false);
  };

  const handlePasswordChange = (role: ERPUserRole, value: string) => {
    setConfig(prev => ({
      ...prev,
      rolePasswords: {
        ...prev.rolePasswords,
        [role]: value
      }
    }));
    setSaveSuccess(false);
  };

  const togglePasswordVisibility = (role: string) => {
    setShowPasswordRole(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  const generateRandomPassword = (role: ERPUserRole) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let newPass = "";
    for (let i = 0; i < 10; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handlePasswordChange(role, newPass);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const docRef = doc(db, "system_settings", "config");
      await setDoc(docRef, config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000); // clear banner after 5s
    } catch (err: any) {
      console.error("Failed saving system settings:", err);
      handleFirestoreError(err, OperationType.WRITE, "system_settings/config");
    } finally {
      setSaving(false);
    }
  };

  const systemRoles: ERPUserRole[] = [
    "Super Admin",
    "Direktur",
    "Project Director",
    "Project Manager",
    "Quantity Surveyor",
    "Site Engineer",
    "Pengawas Lapangan",
    "Purchasing",
    "Finance",
    "Kontraktor",
    "Subkontraktor",
    "Konsultan Pengawas"
  ];

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="animate-spin text-blue-600 mb-3" size={32} />
        <p className="text-sm font-semibold text-slate-500 font-mono">
          {language === "ID" ? "Menghubungkan ke secure node pengaturan..." : "Syncing secure settings tunnel..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#0F4C81]/10 text-[#0F4C81]">
              <ShieldCheck size={16} />
            </span>
            <h2 className="text-md font-black text-slate-800 tracking-wide uppercase font-sans">
              {language === "ID" ? "Modul Pengaturan Sistem (Super Admin Only)" : "System Configuration Console"}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {language === "ID" 
              ? "Kelola alamat legal PT. Foresyndo, info resmi, serta perbarui kunci sandi (gate pass) untuk setiap entitas." 
              : "Manage dynamic company endpoints, printable seals metadata, and unique security keys for all roles."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            {language === "ID" ? "TERKONEKSI FIRESTORE REAL-TIME" : "SECURE FIRESTORE SYNC ACTIVE"}
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-start gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{language === "ID" ? "Sistem Diperbarui Berhasil!" : "System Updated Successfully!"}</p>
            <p className="text-emerald-700/90 mt-0.5">
              {language === "ID" 
                ? "Seluruh parameter alamat, kontak, dan kata sandi baru telah disimpan secara aman ke database cloud. Perubahan berlaku langsung tanpa reload." 
                : "All company parameters, email hooks, WhatsApp channels, and master passwords have been synchronised in real-time."}
            </p>
          </div>
        </div>
      )}

      {/* Main Settings Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Office & Legal settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-5">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Building2 size={14} className="text-blue-600" />
              {language === "ID" ? "Profil Resmi Owner & Kontak" : "Company Profile & Legal Contacts"}
            </h3>

            {/* Office Address Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={11} className="text-slate-400" />
                {language === "ID" ? "Alamat Kantor Resmi (Cetak Bukti)" : "Office Address (Receipt print)"}
              </label>
              <textarea
                value={config.officeAddress}
                onChange={(e) => handleFieldChange("officeAddress", e.target.value)}
                rows={3}
                placeholder="Gedung Foresyndo, Jalan Mega Kuningan..."
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] focus:bg-white rounded-xl p-3 text-xs text-slate-800 outline-none transition font-sans leading-relaxed shadow-inner"
                required
              />
              <span className="text-[9px] text-slate-400 font-mono block">
                * {language === "ID" ? "Alamat ini akan dicetak otomatis pada PDF Tanda Terima Berkas Lelang." : "This address is automatically updated on the printable pdf E-Receipt."}
              </span>
            </div>

            {/* Office Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Mail size={11} className="text-slate-400" />
                {language === "ID" ? "E-mail Korespodensi Resmi" : "Corporate Correspondence Email"}
              </label>
              <input
                type="email"
                value={config.officeEmail}
                onChange={(e) => handleFieldChange("officeEmail", e.target.value)}
                placeholder="procurement@foresyndo.com"
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-800 outline-none transition font-mono shadow-inner"
                required
              />
            </div>

            {/* WhatsApp Number Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Phone size={11} className="text-slate-400" />
                {language === "ID" ? "No. WhatsApp Resmi / Hotline" : "WhatsApp Business Number"}
              </label>
              <input
                type="text"
                value={config.officeWhatsapp}
                onChange={(e) => handleFieldChange("officeWhatsapp", e.target.value)}
                placeholder="+628119002821"
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-800 outline-none transition font-mono shadow-inner"
                required
              />
            </div>

            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1 text-blue-800 text-[11px] font-bold">
                <Info size={12} />
                <span>INFO AUDIT LOGISTIK & PROYEK</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                {language === "ID" 
                  ? "Semua data alamat dan kontak diselaraskan dengan server pusat e-Procurement guna mencegah ketidaksesuaian kontrak hukum." 
                  : "All corporate settings are tied to the e-Procurement template so all PDF output headers match actual data."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Role Gate Passwords (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Key size={14} className="text-blue-600" />
                {language === "ID" ? "Pengaturan Sandi untuk Setiap Role" : "Secure Gate Passwords by Role"}
              </h3>
              
              <div className="bg-[#0F4C81]/10 text-[#0F4C81] px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                🛡️ Gatekeeper system
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Keamanan Terpusat:</span> Perubahan sandi di bawah ini akan mengubah kredensial bypass login cepat (preset) dan juga akun terkait yang diakses melalui portal FORSDIG. Harap bagikan sandi baru secara berhati-hati kepada staf bersangkutan.
              </div>
            </div>

            {/* List of Roles custom password inputs with scroll containment */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {systemRoles.map((role) => {
                const passVal = config.rolePasswords[role] || "admin123";
                const showPass = showPasswordRole[role] || false;
                
                return (
                  <div key={role} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-xl gap-3 transition">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span className="text-[10px]">👤</span>
                        {role}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono tracking-tight font-semibold">
                        {role === "Super Admin" ? "ROOT CONTROL ACCESSIBLE" : "GATEWAY LEVEL ACCESS"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          value={passVal}
                          onChange={(e) => handlePasswordChange(role, e.target.value)}
                          placeholder="Password"
                          className="w-[140px] sm:w-[160px] bg-white border border-slate-200 focus:border-[#0F4C81] rounded-lg px-2.5 py-1 text-xs text-slate-800 outline-none transition font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(role)}
                          className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => generateRandomPassword(role)}
                        className="bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 border border-slate-200 py-1 px-1.5 rounded-lg text-[9px] font-bold font-mono transition"
                        title={language === "ID" ? "Acak sandi baru" : "Randomize password"}
                      >
                        ⚡ {language === "ID" ? "Acak" : "Rand"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Master save actions block */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#0F4C81] hover:bg-[#0c3e6b] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl transition shadow-md shadow-blue-900/10 flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <RefreshCw className="animate-spin" size={13} />
                    <span>{language === "ID" ? "Menyimpan Konfigurasi..." : "Saving Parameters..."}</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>{language === "ID" ? "Simpan Seluruh Pengaturan" : "Save All Configurations"}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}
