import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure Gemini Client is initialized safely
const apiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "marketplace-30272" });
  });

  // API 2: Gemini Analysis and Chat Q&A
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const { prompt, contextData, systemInstruction } = req.body;

      if (!ai) {
        return res.status(403).json({ 
          error: "Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets." 
        });
      }

      const promptContext = contextData 
        ? `\n\n--- DATA KONTEKS PROYEK ---\n${JSON.stringify(contextData, null, 2)}\n-------------------------\n\n`
        : "";

      const fullPrompt = `${promptContext}${prompt}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: fullPrompt,
        config: {
          systemInstruction: systemInstruction || "Anda adalah AI Assistant FORSDIG dari PT. Foresyndo Global Indonesia, seorang pakar analisis manajemen konstruksi, ERP, dan audit proyek. Berikan jawaban dalam Bahasa Indonesia yang profesional dan ringkas.",
          temperature: 0.2
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Terjadi kesalahan pada Gemini AI" });
    }
  });

  // API 3: System Simulated Email Notification and Templates Manager
  const emailHistory: any[] = [];

  app.get("/api/email/history", (req, res) => {
    res.json({ emails: emailHistory.slice(-50).reverse() });
  });

  app.post("/api/email/send", (req, res) => {
    try {
      const { type, email, name, details } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email destination is required" });
      }

      const cleanEmail = email.trim();
      const cleanName = name || "User Rekanan";
      const timestamp = new Date().toISOString();
      const localDateStr = new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "medium" });

      let subject = "";
      let htmlTemplate = "";

      if (type === "REGISTER") {
        subject = "✔ [FORSDIG ERP] Registrasi Akun Rekanan Sukses - PT. Foresyndo Global Indonesia";
        htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Registrasi Rekanan Sukses</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .header { background: #0f172a; padding: 30.px; text-align: center; color: #ffffff; border-bottom: 4px solid #2563eb; }
    .header h1 { margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase; }
    .header p { margin: 5px 0 0 0; font-size: 11px; color: #94a3b8; font-family: monospace; letter-spacing: 1px; }
    .body { padding: 35px; line-height: 1.6; font-size: 13px; }
    .welcome { font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 15px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .card-title { font-weight: bold; font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
    .field { margin-bottom: 8px; display: flex; justify-content: space-between; }
    .label { color: #64748b; font-size: 12px; }
    .value { font-weight: bold; color: #0f172a; text-align: right; }
    .barcode-section { text-align: center; margin: 25px 0; background: #f1f5f9; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1; }
    .barcode-lines { display: inline-flex; height: 35px; gap: 2px; align-items: flex-end; background: #ffffff; padding: 8px 15px; border-radius: 4px; border: 1px solid #e2e8f0; }
    .bar { width: 2px; height: 100%; background: #000; }
    .bar-thick { width: 4px; height: 100%; background: #000; }
    .bar-thin { width: 1px; height: 100%; background: #000; }
    .barcode-val { font-size: 9px; font-family: monospace; color: #475569; margin-top: 5px; letter-spacing: 2px; display: block; }
    .badge { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: bold; text-transform: uppercase; display: inline-block; }
    .footer { background: #f1f5f9; padding: 25px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #e2e8f0; }
    .footer strong { color: #475569; }
    .signature { margin-top: 25px; text-align: right; font-size: 11px; }
    .sig-line { font-family: 'Georgia', serif; font-style: italic; font-size: 13px; font-weight: bold; border-bottom: 1px dashed #94a3b8; display: inline-block; padding-bottom: 2px; margin-bottom: 2px; color: #1e293b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PT. FORESYNDO GLOBAL INDONESIA</h1>
      <p>CONSTRUCTION ERP SYSTEM &bull; FORSDIG</p>
    </div>
    <div class="body">
      <div class="welcome">Selamat bergabung, ${cleanName}!</div>
      <p>Terima kasih telah mendaftarkan akun badan usaha Anda pada platform ERP Konstruksi terpadu PT. Foresyndo Global Indonesia. Sistem kami telah memvalidasi data administrasi awal Anda, dan berikut adalah kredensial aktivasi portal kemitraan Anda:</p>
      
      <div class="card">
        <div class="card-title">DATA KREDENSIAL MITRA REKANAN</div>
        <div class="field">
          <span class="label">Nama Pengguna:</span>
          <span class="value">${cleanName}</span>
        </div>
        <div class="field">
          <span class="label">Email Terdaftar:</span>
          <span class="value">${cleanEmail}</span>
        </div>
        <div class="field">
          <span class="label">Nama Perusahaan:</span>
          <span class="value">${details.company || "-"}</span>
        </div>
        <div class="field">
          <span class="label">Hak Akses / Role:</span>
          <span class="value"><span class="badge">${details.role || "Kontraktor"}</span></span>
        </div>
        <div class="field" style="margin-top: 15px;">
          <span class="label">Status Keamanan:</span>
          <span class="value" style="color: #059669;">✔ SECURED & ACTIVE</span>
        </div>
      </div>

      <div class="barcode-section">
        <span style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: #64748b; margin-bottom: 5px; display: block;">ID BARCODE SECURITY PASSPORT AKTIF</span>
        <div class="barcode-lines">
          <div class="bar-thick"></div><div class="bar"></div><div class="bar-thin"></div><div class="bar-thick"></div><div class="bar"></div><div class="bar-thin"></div><div class="bar-thick"></div><div class="bar"></div><div class="bar-thick"></div><div class="bar-thin"></div>
        </div>
        <span class="barcode-val">*SECURE-AUTH-${Math.random().toString(36).substring(3, 9).toUpperCase()}*</span>
      </div>

      <p style="font-size: 11px; color: #64748b; background: #fffbeb; border: 1px solid #fef3c7; padding: 10px; border-radius: 6px;">
        <strong>PENTING:</strong> Simpan barcode dan kata sandi akses Anda dengan aman. Gunakan akun ini untuk login di Hub Utama dan mengakses portal pengadaan lelang serta laporan progress harian.
      </p>

      <div class="signature">
        <span style="font-size: 9px; color: #94a3b8; display: block; margin-bottom:10px;">DITANDATANGANI SECARA DIGITAL OLEH SISTEM:</span>
        <div class="sig-line">FORSDIG Auto-Security</div>
        <div style="font-weight: bold; color: #0f172a; font-size: 11px;">Sistem Otomasi Keamanan ERP</div>
        <div style="color: #64748b; font-size: 10px;">PT. Foresyndo Global Indonesia</div>
      </div>
    </div>
    
    <div class="footer">
      <p>Surat elektronik ini dikirimkan secara otomatis oleh sistem ERP PT. Foresyndo Global Indonesia dan tidak perlu dibalas.</p>
      <p>&copy; ${new Date().getFullYear()} <strong>PT. Foresyndo Global Indonesia</strong>. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>
        `;
      } else if (type === "TENDER_SUBMISSION") {
        const bidId = details.bidId || "BID-000";
        const tenderId = details.tenderId || "TND-000";
        const tenderTitle = details.tenderTitle || "Paket Konstruksi Utama";
        const bidValue = details.bidValue || 0;
        const bidValueFormatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(bidValue);

        subject = `📢 [BERHASIL DIPROSES] Tanda Terima Berkas Tender Digital #${bidId} - PT. Foresyndo Global Indonesia`;
        htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tanda Terima Berkas Sukses Diproses</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .header { background: #1e3a8a; padding: 30px; text-align: center; color: #ffffff; border-bottom: 4px solid #ef4444; }
    .header h1 { margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase; }
    .header p { margin: 5px 0 0 0; font-size: 11px; color: #93c5fd; font-family: monospace; letter-spacing: 1px; }
    .body { padding: 35px; line-height: 1.6; font-size: 13px; }
    .welcome { font-size: 16px; font-weight: bold; color: #1e3a8a; margin-bottom: 15px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .card-title { font-weight: bold; font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
    .field { margin-bottom: 8px; display: flex; justify-content: space-between; }
    .label { color: #64748b; font-size: 12px; }
    .value { font-weight: bold; color: #0f172a; text-align: right; }
    .barcode-section { text-align: center; margin: 25px 0; background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px dashed #bbf7d0; }
    .barcode-lines { display: inline-flex; height: 35px; gap: 2px; align-items: flex-end; background: #ffffff; padding: 8px 15px; border-radius: 4px; border: 1px solid #dcfce7; }
    .bar { width: 2.5px; height: 100%; background: #000; }
    .bar-thick { width: 5px; height: 100%; background: #000; }
    .bar-thin { width: 1.2px; height: 100%; background: #000; }
    .barcode-val { font-size: 9px; font-family: monospace; color: #166534; font-weight: bold; margin-top: 5px; letter-spacing: 2px; display: block; }
    .badge { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: bold; text-transform: uppercase; display: inline-block; }
    .footer { background: #f1f5f9; padding: 25px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #e2e8f0; }
    .footer strong { color: #475569; }
    .signature { margin-top: 25px; text-align: right; font-size: 11px; }
    .sig-line { font-family: 'Georgia', serif; font-style: italic; font-size: 14px; font-weight: bold; border-bottom: 1px dashed #94a3b8; display: inline-block; padding-bottom: 2px; margin-bottom: 2px; color: #0f172a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PT. FORESYNDO GLOBAL INDONESIA</h1>
      <p>SURAT TANDA TERIMA BERKAS DIGITAL &bull; E-PROCUREMENT</p>
    </div>
    <div class="body">
      <div class="welcome">Yth. Pimpinan ${cleanName},</div>
      <p>Sistem E-Procurement PT. Foresyndo Global Indonesia telah sukses menerima pengajuan berkas kelengkapan kualifikasi serta rincian harga penawaran Anda untuk paket lelang aktif. Berikut rincian tanda terima berbarcode yang sah secara hukum:</p>
      
      <div class="card">
        <div class="card-title">RANCANGAN TANDA TERIMA BERKAS</div>
        <div class="field">
          <span class="label">ID Penawaran (Bid ID):</span>
          <span class="value" style="font-family: monospace; color: #1d4ed8;">${bidId}</span>
        </div>
        <div class="field">
          <span class="label">Kode & Nama Paket Tender:</span>
          <span class="value">${tenderTitle} (${tenderId})</span>
        </div>
        <div class="field">
          <span class="label">Nama Kontraktor (Rekanan):</span>
          <span class="value">${cleanName}</span>
        </div>
        <div class="field">
          <span class="label">Nilai Nominal Bid Diajukan:</span>
          <span class="value" style="color: #059669; font-family: monospace; font-size:14px; font-weight:extrabold;">${bidValueFormatted}</span>
        </div>
        <div class="field">
          <span class="label">Status Berkas:</span>
          <span class="value"><span class="badge">DITERIMA & TERSEGEL</span></span>
        </div>
        <div class="field" style="margin-top: 15px;">
          <span class="label">NIB Perusahaan:</span>
          <span class="value">${details.nib || "9120301928371"}</span>
        </div>
        <div class="field">
          <span class="label">NPWP Pajak:</span>
          <span class="value">${details.npwp || "01.324.552.1-013.000"}</span>
        </div>
        <div class="field">
          <span class="label">Sertifikat SBU:</span>
          <span class="value">${details.sbu || "SBU-BG009-2025-001"}</span>
        </div>
      </div>

      <div class="barcode-section">
        <span style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: #166534; margin-bottom: 5px; display: block;">KODE DIGITAL BARCODE TANDA TERIMA SAH</span>
        <div class="barcode-lines">
          <div class="bar-thick"></div><div class="bar-thin"></div><div class="bar"></div><div class="bar-thick"></div><div class="bar"></div><div class="bar-thin"></div><div class="bar-thick"></div><div class="bar-thin"></div><div class="bar-thick"></div><div class="bar"></div><div class="bar-thick"></div>
        </div>
        <span class="barcode-val">*RECEIPT-STAMP-FSD-${bidId}*</span>
      </div>

      <p style="font-size: 11px; color: #475569; background: #f0f9ff; border: 1px solid #e0f2fe; padding: 12px; border-radius: 6px;">
        <strong>Informasi Selanjutnya:</strong> Tim evaluasi panitia lelang PT. Foresyndo Global Indonesia akan melakukan verifikasi teknis/kombinasi score (Administrasi, Teknis, Harga) sesuai prosedur. Anda dapat memonitor status penunjukan pemenang langsung dari Portal Kontraktor Anda.
      </p>

      <div class="signature">
        <span style="font-size: 9px; color: #94a3b8; display: block; margin-bottom:10px;">BAGIAN PENGADAAN SAH (DIGITAL BARCODE SIGN):</span>
        <div class="sig-line">Hendra Setiadi</div>
        <div style="font-weight: bold; color: #0f172a; font-size: 11px;">Drs. Hendra Setiadi, M.T.</div>
        <div style="color: #64748b; font-size: 10px;">Kabag Procurement PT. Foresyndo</div>
      </div>
    </div>
    
    <div class="footer">
      <p>Surat e-receipt ini bersifat konfirmasi resmi dan diatur oleh Kebijakan Hub Mitra Elektronik PT. Foresyndo Global Indonesia.</p>
      <p>&copy; ${new Date().getFullYear()} <strong>PT. Foresyndo Global Indonesia</strong>. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>
        `;
      } else {
        return res.status(400).json({ error: "Invalid email notification type" });
      }

      const emailPayload = {
        id: "eml_" + Math.random().toString(36).substring(2, 9),
        type,
        to: cleanEmail,
        toName: cleanName,
        subject,
        html: htmlTemplate,
        timestamp,
        formattedTime: localDateStr,
        status: "Sent Successfully"
      };

      emailHistory.push(emailPayload);
      console.log(`[EMAIL SYSTEM] Template '${type}' generated and sent to: ${cleanEmail}`);
      console.log(`[EMAIL SUBJECT] ${subject}`);

      res.status(200).json({ 
        success: true, 
        message: "Email notification successfully dispatched", 
        email: emailPayload 
      });
    } catch (err: any) {
      console.error("Email dispatch failed:", err);
      res.status(500).json({ error: "Failed to dispatch email template: " + err.message });
    }
  });

  // Integrate Vite dev server middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server FORSDIG Construction ERP running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
