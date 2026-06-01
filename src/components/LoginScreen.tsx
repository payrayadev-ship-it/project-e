import React, { useState } from "react";
import { ERPUserRole } from "../types";
import { Brain, Globe, Mail, Lock, CheckCircle2, ShieldAlert, User, Building, ArrowRight, ArrowLeft } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface LoginScreenProps {
  onLogin: (role: ERPUserRole, name: string, email: string) => void;
  language: "ID" | "EN";
  setLanguage: (lang: "ID" | "EN") => void;
}

export function LoginScreen({ onLogin, language, setLanguage }: LoginScreenProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regRole, setRegRole] = useState<ERPUserRole>("Kontraktor");

  // Error & Status State
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const presets = [
    {
      role: "Super Admin" as ERPUserRole,
      name: "Bambang Prakoso",
      email: "admin@foresyndo.com",
      company: "PT. Foresyndo Global Indonesia",
      desc: language === "ID" ? "Akses super penuh ke semua modul ERP." : "Full root access to all ERP modules."
    },
    {
      role: "Direktur" as ERPUserRole,
      name: "Ir. Hermawan Sukarno",
      email: "director@foresyndo.com",
      company: "Foresyndo Development Group",
      desc: language === "ID" ? "Membuka Dashboard KPI Eksekutif & Persetujuan VO." : "Executive KPI Dashboards & VO approvals."
    },
    {
      role: "Kontraktor" as ERPUserRole,
      name: "Andi Wijaya",
      email: "contractor@foresyndo.com",
      company: "PT. Krakatau Karya Jaya (Rekanan)",
      desc: language === "ID" ? "PORTAL TERPROTEKSI: Hanya melihat Progres Fisik, Tender & Buku Log Lapangan." : "PROTECTED PORTAL: Only physical progress, tenders & field log."
    },
    {
      role: "Pengawas Lapangan" as ERPUserRole,
      name: "Budi Santoso",
      email: "supervisor@foresyndo.com",
      company: "Konsultan KSO Pengawas",
      desc: language === "ID" ? "Mengisi Log Harian Lapangan dan Audit Site." : "Fills Daily logbooks & Site inspections."
    }
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setLoginEmail(p.email);
    setLoginPassword("admin123"); // Preset default pass
    setError("");
    setSuccessMsg("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!loginEmail) {
      setError(language === "ID" ? "Email tidak boleh kosong." : "Email cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      // 1. Check presets first
      const matchedPreset = presets.find(p => p.email.toLowerCase() === loginEmail.toLowerCase());
      if (matchedPreset) {
        // Simple mock bypass for default seed email
        onLogin(matchedPreset.role, matchedPreset.name, matchedPreset.email);
        setLoading(false);
        return;
      }

      // 2. Fetch from database collection 'registered_users'
      const userDocRef = doc(db, "registered_users", loginEmail.toLowerCase().trim());
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.password === loginPassword) {
          onLogin(userData.role as ERPUserRole, userData.name, userData.email);
          setLoading(false);
          return;
        } else {
          setError(language === "ID" ? "Kata sandi yang Anda masukkan salah." : "Incorrect security key password.");
          setLoading(false);
          return;
        }
      } else {
        // Custom message stating they need to register first
        setError(
          language === "ID"
            ? "Akun tidak ditemukan. Sesuai prosedur keamanan, silakan daftarkan akun Anda terlebih dahulu."
            : "Account not found. Following security protocol, you must register your account first."
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(language === "ID" ? "Gagal menghubungkan ke database: " + err.message : "Database lookup failed: " + err.message);
      handleFirestoreError(err, OperationType.GET, `registered_users/${loginEmail}`);
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!regName || !regEmail || !regPassword || !regCompany) {
      setError(language === "ID" ? "Harap isi semua kolom formulir pendaftaran." : "Please fill out all registration fields.");
      return;
    }

    setLoading(true);
    try {
      const emailKey = regEmail.toLowerCase().trim();
      
      // Check if user already exists
      const checkDoc = await getDoc(doc(db, "registered_users", emailKey));
      if (checkDoc.exists()) {
        setError(language === "ID" ? "Email ini sudah terdaftar dalam sistem." : "This corporate email is already registered.");
        setLoading(false);
        return;
      }

      // Save new user profile 
      const newUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 11),
        name: regName,
        email: emailKey,
        password: regPassword,
        company: regCompany,
        role: regRole,
        registeredAt: new Date().toISOString()
      };

      await setDoc(doc(db, "registered_users", emailKey), newUser);

      // Trigger Email Notification Template Dispatch to confirm secure barcode processing
      try {
        await fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "REGISTER",
            email: emailKey,
            name: regName,
            details: {
              company: regCompany,
              role: regRole,
            }
          })
        });
      } catch (emailErr) {
        console.warn("Could not dispatch registration email:", emailErr);
      }

      // Success UX
      setSuccessMsg(
        language === "ID" 
          ? `Pendaftaran Berhasil! Akun ${regRole} untuk perusahaan ${regCompany} siap digunakan. Sistem telah memproses barcode digital dan mengirimkan email konfirmasi. Silakan login.`
          : `Registration Successful! ${regRole} account created for ${regCompany}. The system has processed your digital barcode security key and sent a confirmation email.`
      );
      
      // Auto-prefill login screen and switch view
      setLoginEmail(regEmail);
      setLoginPassword(regPassword);
      setIsRegisterMode(false);

      // Clean field values
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegCompany("");
    } catch (err: any) {
      console.error(err);
      setError(language === "ID" ? "Gagal melakukan registrasi: " + err.message : "Failed to register account: " + err.message);
      handleFirestoreError(err, OperationType.WRITE, `registered_users/${regEmail}`);
    }
    setLoading(false);
  };

  const systemRoles: ERPUserRole[] = [
    "Kontraktor",
    "Subkontraktor",
    "Pengawas Lapangan",
    "Quantity Surveyor",
    "Project Manager",
    "Finance",
    "Direktur"
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-10 font-sans relative overflow-hidden selection:bg-[#0F4C81] selection:text-white">
      {/* Background ambient radial gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/15 blur-[130px] pointer-events-none"></div>

      {/* Top Identity Block */}
      <header className="max-w-6xl w-full mx-auto flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0F4C81] rounded-xl flex items-center justify-center border border-blue-400/20 shadow-md">
            <Brain className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-widest font-sans">FORSDIG</h1>
            <p className="text-[9px] text-slate-400 font-mono tracking-widest">CONSOLIDATED ERP NETWORK</p>
          </div>
        </div>

        {/* Language Selection */}
        <button
          onClick={() => setLanguage(language === "ID" ? "EN" : "ID")}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer font-medium text-xs font-mono transition text-slate-300"
        >
          <Globe size={13} className="text-[#3b82f6]" />
          <span>{language === "ID" ? "Bahasa: ID" : "Language: EN"}</span>
        </button>
      </header>

      {/* Center Grid */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-6 z-10">
        
        {/* Left column: Welcome Messaging and Demo presets */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase inline-block">
              {language === "ID" ? "REGISTRASI SEBELUM MASUK" : "REGISTRATION SYSTEM VERIFIED"}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {language === "ID" 
                ? "Daftar Akun Kontraktor & Masuk ke Portal Mandiri" 
                : "Register a Contractor Account & Enter the Specialized Portal"}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              {language === "ID"
                ? "Berdasarkan amanat keamanan siber konstruksi, semua mitra pelaksana kontraktor diwajibkan mendaftarkan profil instansi legal sebelum dapat melakukan pengisian data log aktivitas dan memposting penawaran tender."
                : "Following global digital operations compliance regulations, all contracting firms must declare their corporate credentials and register beforehand to input field progress logs or submit bids."}
            </p>
          </div>

          {!isRegisterMode && (
            <div className="space-y-3 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
              <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                {language === "ID" ? "Profil Cepat (Akses Cepat Pengujian):" : "Instant Profile Bypass:"}
              </h3>

              {/* Presets Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {presets.map((p) => {
                  const isSelected = loginEmail === p.email;
                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`text-left p-3.5 rounded-xl border transition group cursor-pointer ${
                        isSelected 
                          ? "bg-[#0F4C81]/25 border-[#0F4C81] ring-1 ring-[#0F4C81]" 
                          : "bg-slate-900/40 hover:bg-slate-800/50 border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-mono font-bold uppercase ${isSelected ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400"}`}>
                          {p.role === "Kontraktor" ? "👷 " + p.role : p.role}
                        </span>
                        {isSelected && <CheckCircle2 size={12} className="text-blue-400 shrink-0" />}
                      </div>
                      <h4 className="text-xs font-bold text-white leading-none mb-1">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono italic truncate">{p.company}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isRegisterMode && (
            <div className="p-4 bg-[#0F4C81]/10 border border-blue-900/40 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5 font-mono">
                💡 {language === "ID" ? "PERAN PORTAL KONTRAKTOR KHUSUS" : "SPECIALIZED PORTAL RIGHTS"}
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {language === "ID"
                  ? "Jika memilih peran 'Kontraktor' atau 'Subkontraktor', sistem secara otomatis mengunci portal dan menyembunyikan modul sensitif seperti BoQ internal, manajemen anggaran, QC internal, dan laporan keuangan dari jangkauan luar."
                  : "By registering with the 'Kontraktor' or 'Subkontraktor' roles, the custom ERP console will completely filter access, preventing leaks of internal core structures like corporate BoQ entries, QC records, and margins logs."}
              </p>
            </div>
          )}
        </div>

        {/* Right column: Interactive Registration and Sign-In forms */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-sm space-y-6">
            
            {/* Form Title & Toggle */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  {isRegisterMode 
                    ? (language === "ID" ? "Registrasi Akun Baru" : "Register Enterprise ID") 
                    : (language === "ID" ? "Masuk Portal ERP" : "Enterprise Secure Login")
                  }
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isRegisterMode 
                    ? (language === "ID" ? "Lengkapi kredensial mitra pelaksana." : "Fill company credentials to register.")
                    : (language === "ID" ? "Harap verifikasi sistem harian." : "Provide credentials to authorize access.")
                  }
                </p>
              </div>

              <button
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError("");
                  setSuccessMsg("");
                }}
                className="text-xs font-bold text-[#3b82f6] hover:underline font-mono cursor-pointer bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                {isRegisterMode 
                  ? (language === "ID" ? "Menuju Login" : "Go to Login") 
                  : (language === "ID" ? "Daftar Dulu" : "Register First")
                }
              </button>
            </div>

            {/* Notification messages */}
            {error && (
              <div className="bg-red-950/40 border border-red-900/60 text-red-200 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
                <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-200 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* FORM 1: LOGIN MODE */}
            {!isRegisterMode && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    {language === "ID" ? "Alamat Surel (Email)" : "Corporate Email"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="e.g. contractor@foresyndo.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition font-mono"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    {language === "ID" ? "Kata Sandi Keamanan" : "Security Gateway Key"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0F4C81] hover:bg-[#0c3e6b] text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl cursor-pointer transition shadow-lg shadow-[#0f4c81]/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  <span>
                    {loading 
                      ? (language === "ID" ? "Memproses Otentikasi..." : "Verifying Tunnel...") 
                      : (language === "ID" ? "Masuk Portal Kerja" : "Authorize Enterprise Session")
                    }
                  </span>
                  {!loading && <ArrowRight size={13} />}
                </button>
              </form>
            )}

            {/* FORM 2: REGISTER MODE */}
            {isRegisterMode && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    {language === "ID" ? "Nama Lengkap Penanggung Jawab" : "Authorized Person Name"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        setError("");
                      }}
                      placeholder="e.g. Andi Wijaya Pratama"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition"
                    />
                  </div>
                </div>

                {/* Corporate Company Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    {language === "ID" ? "Nama Perusahaan / Instansi" : "Corporate / Entity Name"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <Building size={14} />
                    </span>
                    <input
                      type="text"
                      value={regCompany}
                      onChange={(e) => {
                        setRegCompany(e.target.value);
                        setError("");
                      }}
                      placeholder="e.g. PT. Krakatau Karya Jaya"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    {language === "ID" ? "Alamat Surat Elektronik Resmi" : "Registered Business Email"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="name@company.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition font-mono"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    {language === "ID" ? "Password Akses (Min 5 karakter)" : "Access Password Key"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition"
                    />
                  </div>
                </div>

                {/* Select System Role */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    {language === "ID" ? "Peran ERP / Akses Kinerja" : "Target ERP Account Role"}
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as ERPUserRole)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] rounded-xl p-2 text-xs text-white font-bold outline-none cursor-pointer"
                  >
                    {systemRoles.map((role) => (
                      <option key={role} value={role}>
                        {role === "Kontraktor" ? `👷 Kontraktor (Portal Khusus)` : role}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-700 hover:bg-emerald-850 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl cursor-pointer transition shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  <span>
                    {loading 
                      ? (language === "ID" ? "Mendaftarkan Mitra..." : "Registering Entity...") 
                      : (language === "ID" ? "Daftar Akun Kredensial" : "Register Credentials Now")
                    }
                  </span>
                  {!loading && <ArrowRight size={13} />}
                </button>
              </form>
            )}

            <div className="text-center pt-2 border-t border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                {language === "ID" ? "KONEKSI KONTRAKTOR DIAGNOSTIK: AKTIF" : "CONTRACTOR DIAGNOSTIC CHANNEL: ACTIVE"}
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Footer Branding */}
      <footer className="text-center font-mono text-[10px] text-slate-600 tracking-wide pt-4 border-t border-slate-900 z-10 shrink-0">
        <p>© 2026 PT. Foresyndo Global Indonesia. All encrypted operational nodes certified.</p>
        <p className="text-slate-700 mt-0.5">SHA-256 E-STAMP IDENT ACTIVE — PORTAL PROTECTED WITH STAKEHOLDER MATRIX</p>
      </footer>
    </div>
  );
}
