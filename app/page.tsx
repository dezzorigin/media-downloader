"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download, Link as LinkIcon, AlertCircle, CheckCircle2, X, Loader2,
  Sparkles, Server, ShieldCheck, Globe, ArrowRight, Play, Zap,
  Eye, Smartphone, Github, ChevronDown, Lock, Layers, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DEMO_INPUT_URL, DEMO_RESPONSE } from "@/lib/demo-fixture";

const REPO_URL = "https://github.com/dezzorigin/media-downloader";
const ENTERED_KEY = "media-downloader-entered";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function isUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function gatherLinks(obj: unknown): { label: string; url: string }[] {
  const links: { label: string; url: string }[] = [];
  if (typeof obj === "string" && isUrl(obj)) {
    links.push({ label: "Media Source", url: obj });
    return links;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      if (typeof item === "string" && isUrl(item)) {
        links.push({ label: `Media Link ${index + 1}`, url: item });
      } else if (typeof item === "object") {
        links.push(...gatherLinks(item));
      }
    });
  } else if (obj && typeof obj === "object") {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "string" && isUrl(value)) {
        const cleanKey = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
        links.push({ label: cleanKey, url: value });
      } else if (typeof value === "object") {
        const nested = gatherLinks(value);
        nested.forEach((n) => links.push({ label: `${key} - ${n.label}`, url: n.url }));
      }
    });
  }
  return links;
}

const PLATFORMS = [
  "TikTok", "Douyin", "CapCut", "Threads", "Instagram", "Facebook",
  "YouTube", "Twitter/X", "Vimeo", "Snapchat", "Bilibili", "Dailymotion",
  "Reddit", "Pinterest", "Spotify", "SoundCloud", "Tumblr", "Telegram",
  "LinkedIn", "Likee", "ShareChat", "iFunny", "Imgur", "ESPN",
];

function Landing({ onEnter, onDemo }: { onEnter: () => void; onDemo: () => void }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#E2E8F0]">
      <header className="h-[60px] sticky top-0 z-40 bg-[#E2E8F0]/90 backdrop-blur-md border-b border-[#D0D5D2]">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between px-4 md:px-6 h-full">
          <div className="flex items-center gap-[12px]">
            <div className="w-[32px] h-[32px] bg-[#020817] rounded-[6px] flex items-center justify-center">
              <Download className="w-[18px] h-[18px] text-[#FF9E33]" strokeWidth={2.5} />
            </div>
            <span className="text-[#020817] font-medium text-[16px] tracking-tight">MEDIA Downloader</span>
          </div>
          <nav className="hidden sm:flex items-center gap-[24px]">
            <a href="#fitur" className="text-[#020817] text-[14px] font-medium hover:text-[#1863DC]">Fitur</a>
            <a href="#cara-kerja" className="text-[#020817] text-[14px] font-medium hover:text-[#1863DC]">Cara Kerja</a>
            <a href="#platform" className="text-[#020817] text-[14px] font-medium hover:text-[#1863DC]">Platform</a>
          </nav>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="Lihat di GitHub"
            className="flex items-center gap-[8px] text-[#020817] hover:text-[#1863DC] text-[14px] font-medium">
            <GitHubIcon className="w-[20px] h-[20px]" />
            <span className="hidden sm:inline">Lihat di GitHub</span>
          </a>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Hero */}
        <section className="grid md:grid-cols-2 gap-10 items-center py-14 md:py-20">
          <div>
            <div className="inline-flex items-center gap-[8px] bg-[#FFDBC4] text-[#38102A] px-[16px] py-[8px] rounded-[50px] mb-[20px] font-medium text-[13px]">
              <Sparkles className="w-[16px] h-[16px] text-[#FF9E33]" />
              <span>Tempel tautan, unduh medianya</span>
            </div>
            <h1 className="text-[36px] md:text-[52px] font-medium leading-[1.15] text-[#020817] mb-[16px]">
              Unduh media dari media sosial, tanpa ribet.
            </h1>
            <p className="text-[16px] md:text-[18px] leading-[1.6] text-[#212121] mb-[28px] max-w-xl">
              Tempel tautan video atau foto dari TikTok, Instagram, YouTube, dan
              puluhan platform lain — Media Downloader mengekstrak tautan medianya
              supaya bisa diunduh langsung. Gratis, tanpa login.
            </p>
            <div className="flex flex-wrap gap-[12px]">
              <button onClick={onEnter}
                className="h-[48px] bg-[#FF9E33] text-white text-[15px] font-medium px-[28px] rounded-[4px] hover:bg-[#FFB700] transition-colors flex items-center gap-[8px]">
                Buka Downloader <ArrowRight className="w-[18px] h-[18px]" />
              </button>
              <button onClick={onDemo}
                className="h-[48px] bg-transparent text-[#1863DC] text-[15px] font-medium px-[24px] rounded-[4px] border-[2px] border-[#1863DC] hover:bg-[rgba(24,99,220,0.05)] transition-colors flex items-center gap-[8px]">
                <Play className="w-[16px] h-[16px]" /> Lihat contoh hasil
              </button>
            </div>
            <p className="text-[13px] text-[#212121] opacity-70 mt-[16px]">
              Ekstraksi dijalankan lewat layanan pihak ketiga (downr.org) — sebagian
              platform bisa gagal sewaktu-waktu. Lihat catatan jujur di bawah.
            </p>
          </div>

          {/* Product preview */}
          <div className="bg-white p-[20px] md:p-[24px] rounded-[12px] border border-[#E2E8F0] shadow-[0px_8px_24px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-[8px] mb-[16px]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
              <span className="text-[12px] text-[#212121] opacity-60 ml-[8px]">unduh-media.pages.dev</span>
            </div>
            <div className="flex gap-[10px] mb-[16px]">
              <div className="flex-1 h-[44px] bg-[#F4F4F4] border border-[#D0D5D2] rounded-[4px] px-[14px] flex items-center text-[14px] text-[#212121] truncate">
                https://vt.tiktok.com/…
              </div>
              <div className="h-[44px] bg-[#FF9E33] text-white text-[14px] font-medium px-[18px] rounded-[4px] flex items-center gap-[6px]">
                <Download className="w-[16px] h-[16px]" /> Extract
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              {["Video HD", "Video SD", "Audio", "Thumbnail"].map((label) => (
                <div key={label} className="border border-[#D0D5D2] rounded-[6px] bg-[#F4F4F4] p-[14px]">
                  <p className="text-[13px] font-medium text-[#020817]">{label}</p>
                  <p className="text-[12px] text-[#1863DC] mt-[6px]">Access Media →</p>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#212121] opacity-60 mt-[14px]">
              Pratinjau tampilan aplikasi — hasil asli tergantung layanan ekstraksi.
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="fitur" className="py-10 md:py-14">
          <h2 className="text-[28px] md:text-[32px] font-medium text-[#020817] mb-[8px]">Fitur</h2>
          <p className="text-[15px] text-[#212121] mb-[28px]">Yang benar-benar ada di aplikasi ini — bukan janji.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
            {[
              { icon: Globe, title: "Banyak platform", desc: "TikTok, Instagram, YouTube, Facebook, Threads, dan puluhan platform lain lewat satu kolom input." },
              { icon: Lock, title: "Tanpa login", desc: "Tidak ada akun, tidak ada data yang disimpan di server kami. Tautan yang ditempel hanya dipakai untuk satu permintaan ekstraksi." },
              { icon: Eye, title: "Pratinjau tautan hasil", desc: "Setiap tautan media yang ditemukan ditampilkan sebagai kartu, lengkap dengan payload teknis mentahnya bila perlu diperiksa." },
              { icon: Zap, title: "Cache 10 menit", desc: "Tautan yang sama tidak diekstrak ulang dalam 10 menit — permintaan berulang dijawab dari cache." },
              { icon: Clock, title: "Coba tanpa antre", desc: "Mode demo menampilkan contoh hasil ekstraksi supaya tampilan hasilnya bisa dilihat tanpa menunggu layanan pihak ketiga." },
              { icon: Smartphone, title: "PWA — bisa di-install", desc: "Manifest dan service worker tersedia, jadi aplikasi bisa ditambahkan ke layar utama dari browser." },
            ].map((f) => (
              <div key={f.title} className="bg-white p-[24px] rounded-[9px] border border-[#E2E8F0] shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
                <div className="w-[44px] h-[44px] bg-[#FFDBC4] rounded-[6px] flex items-center justify-center mb-[14px]">
                  <f.icon className="w-[22px] h-[22px] text-[#FF9E33]" />
                </div>
                <h3 className="text-[17px] font-medium text-[#020817] mb-[6px]">{f.title}</h3>
                <p className="text-[14px] leading-[1.6] text-[#212121]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="cara-kerja" className="py-10 md:py-14">
          <h2 className="text-[28px] md:text-[32px] font-medium text-[#020817] mb-[28px]">Cara Kerja</h2>
          <div className="grid md:grid-cols-3 gap-[20px]">
            {[
              { n: "1", title: "Tempel tautan", desc: "Salin tautan video atau foto dari aplikasi media sosial, lalu tempel di kolom input." },
              { n: "2", title: "Ekstraksi di edge", desc: "Worker di Cloudflare meneruskan tautan ke layanan downr.org, yang mengambil tautan media aslinya." },
              { n: "3", title: "Unduh medianya", desc: "Kartu hasil menampilkan setiap tautan media yang ditemukan — ketuk untuk membuka atau mengunduhnya." },
            ].map((s) => (
              <div key={s.n} className="bg-white p-[24px] rounded-[9px] border border-[#E2E8F0] shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
                <div className="w-[36px] h-[36px] bg-[#020817] text-white rounded-full flex items-center justify-center font-medium mb-[14px]">{s.n}</div>
                <h3 className="text-[17px] font-medium text-[#020817] mb-[6px]">{s.title}</h3>
                <p className="text-[14px] leading-[1.6] text-[#212121]">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Platforms */}
        <section id="platform" className="py-10 md:py-14">
          <h2 className="text-[28px] md:text-[32px] font-medium text-[#020817] mb-[8px]">Platform yang didukung</h2>
          <p className="text-[15px] text-[#212121] mb-[24px]">
            Daftar ini mengikuti klaim layanan ekstraksi (downr.org). Dukungan nyata
            per platform bisa berubah tanpa pemberitahuan — bila satu platform gagal,
            pesannya ditampilkan apa adanya.
          </p>
          <div className="flex flex-wrap gap-[10px]">
            {PLATFORMS.map((p) => (
              <span key={p} className="bg-white border border-[#D0D5D2] text-[#020817] text-[13px] font-medium px-[14px] py-[8px] rounded-[50px]">{p}</span>
            ))}
          </div>
        </section>

        {/* Honest note */}
        <section className="py-8 md:py-10">
          <div className="bg-[#FFDBC4] rounded-[9px] p-[24px] md:p-[32px] text-[#38102A]">
            <div className="flex items-center gap-[10px] mb-[10px]">
              <ShieldCheck className="w-[22px] h-[22px]" />
              <h2 className="text-[20px] font-medium">Catatan jujur</h2>
            </div>
            <p className="text-[14px] leading-[1.7]">
              Media Downloader bukan layanan pengunduh itu sendiri — ia meneruskan
              tautan ke downr.org, layanan pihak ketiga yang mengekstrak tautan media
              dari halaman platform. Proyek ini tidak mengontrol layanan itu, tidak
              menyimpan media, dan tidak menjamin semua tautan berhasil diekstrak.
              Unduh hanya media yang memang boleh diunduh, dan hormati hak cipta
              pembuatnya.
            </p>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-[#D0D5D2] py-[32px] bg-white px-4 mt-auto">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[24px] h-[24px] bg-[#020817] rounded-[4px] flex items-center justify-center">
              <Download className="w-[14px] h-[14px] text-[#FF9E33]" strokeWidth={2.5} />
            </div>
            <p className="text-[14px] text-[#212121]">MEDIA Downloader — dibangun oleh <span className="font-medium text-[#020817]">dezzorigin</span></p>
          </div>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-[6px] text-[#1863DC] text-[14px] font-medium hover:underline">
            <GitHubIcon className="w-[16px] h-[16px]" /> github.com/dezzorigin/media-downloader
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const deferredPromptRef = useRef<{
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  } | null>(null);

  useEffect(() => {
    // localStorage only exists in the browser; reading it here (not during
    // render) keeps server prerender and hydration identical.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(ENTERED_KEY) === "1") setEntered(true);
    } catch { /* private mode — landing stays */ }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as unknown as {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: string }>;
      };
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const enterApp = () => {
    try { localStorage.setItem(ENTERED_KEY, "1"); } catch { /* ignore */ }
    // Fresh form on every entry from the landing (demo results don't linger).
    setUrl("");
    setResult(null);
    setError(null);
    setIsDemo(false);
    setEntered(true);
  };

  const handleInstallClick = async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      deferredPromptRef.current = null;
      setCanInstall(false);
    }
  };

  const runDemo = () => {
    enterApp();
    setUrl(DEMO_INPUT_URL);
    setResult(DEMO_RESPONSE.Result);
    setError(null);
    setIsDemo(true);
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    if (!isUrl(url)) {
      setError("Tautan tidak valid — tempel URL lengkap, contoh: https://vt.tiktok.com/…");
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setIsDemo(false);
    try {
      const res = await fetch(`/api/download?url=${encodeURIComponent(url)}`, { method: "GET" });
      if (!res.ok) {
        throw new Error(`Layanan ekstraksi tidak merespons (HTTP ${res.status}). Coba lagi nanti.`);
      }
      const data = await res.json();
      if (!data.Status) {
        setError(data.Error || "Gagal memproses URL.");
      } else {
        setResult(data.Result);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.");
    } finally {
      setLoading(false);
    }
  };

  const links = result ? gatherLinks(result) : [];

  if (!entered) {
    return <Landing onEnter={enterApp} onDemo={runDemo} />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#E2E8F0]">
      <header className="h-[60px] sticky top-0 z-40 bg-[#E2E8F0]/90 backdrop-blur-md border-b flex items-center px-4 md:px-[24px] border-[#D0D5D2]">
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <div className="w-[32px] h-[32px] bg-[#020817] rounded-[6px] flex items-center justify-center">
              <Download className="w-[18px] h-[18px] text-[#FF9E33]" strokeWidth={2.5} />
            </div>
            <span className="text-[#020817] font-medium text-[16px] tracking-tight">MEDIA Downloader</span>
          </div>
          <nav className="flex items-center gap-[12px] md:gap-[20px]">
            <button onClick={() => setEntered(false)} className="text-[#020817] text-[14px] font-medium hover:text-[#1863DC]">
              ← Landing
            </button>
            {canInstall && (
              <button onClick={handleInstallClick}
                className="text-[13px] font-medium bg-[#020817] text-white px-[14px] py-[7px] rounded-[4px] hover:opacity-90">
                Install App
              </button>
            )}
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="Lihat di GitHub"
              className="text-[#020817] hover:text-[#1863DC]" title="Lihat di GitHub">
              <GitHubIcon className="w-[20px] h-[20px]" />
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-[24px] md:px-[40px] py-[40px] md:py-[64px] flex flex-col gap-[24px] md:gap-[32px]">
        <section className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-[8px] bg-[#FFDBC4] text-[#38102A] px-[16px] py-[8px] rounded-[50px] mb-[20px] font-medium text-[12px] md:text-[14px]">
            <Sparkles className="w-[16px] h-[16px] text-[#FF9E33]" />
            <span>Tempel tautan, ekstrak medianya</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-[32px] md:text-[44px] font-medium leading-[1.2] text-[#020817] mb-[12px] max-w-3xl">
            Universal Media Downloader
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-[15px] md:text-[17px] leading-[1.5] text-[#212121] mb-[32px] max-w-2xl px-4">
            Tempel tautan video atau foto dari media sosial — tautan media aslinya
            akan diekstrak lewat layanan downr.org.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="w-full max-w-3xl bg-[#FFFFFF] p-[24px] rounded-[9px] border border-[#E2E8F0] shadow-[0px_4px_12px_rgba(0,0,0,0.1)] relative z-10">
            <form onSubmit={handleDownload} className="flex flex-col md:flex-row gap-[16px]">
              <div className="flex-1 relative">
                <input
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="Tempel URL di sini (contoh: https://vt.tiktok.com/...)"
                  className="w-full h-[44px] bg-[#FFFFFF] text-[#212121] text-[16px] font-normal px-[16px] rounded-[4px] border border-[#D0D5D2] placeholder:text-[#CCCCCC] focus:border-2 focus:border-[#1863DC] focus:ring-[4px] focus:ring-[rgba(24,99,220,0.1)] focus:outline-none transition-all"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: url && !loading ? 1.02 : 1 }}
                whileTap={{ scale: url && !loading ? 0.98 : 1 }}
                type="submit"
                disabled={loading || !url}
                className="h-[44px] shrink-0 bg-[#FF9E33] text-[#FFFFFF] text-[14px] font-medium px-[24px] rounded-[2px] border-[2px] border-[#FF9E33] hover:bg-[#FFB700] hover:border-[#FFB700] active:bg-[#E8A025] active:border-[#E8A025] disabled:bg-[#CCCCCC] disabled:border-[#CCCCCC] disabled:text-[#FFFFFF] disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-[8px]">
                {loading ? (
                  <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Memproses</>
                ) : (
                  <><Download className="w-[18px] h-[18px]" /> Extract Media</>
                )}
              </motion.button>
            </form>
            <div className="flex flex-wrap items-center justify-between gap-[12px] mt-[16px]">
              <p className="text-[12px] text-[#212121] opacity-70 text-left">
                Ekstraksi memakai layanan pihak ketiga downr.org — sebagian platform bisa gagal.
              </p>
              <button onClick={runDemo} disabled={loading}
                className="text-[13px] font-medium text-[#1863DC] hover:underline flex items-center gap-[6px] shrink-0">
                <Play className="w-[14px] h-[14px]" /> Lihat contoh hasil
              </button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden">
                  <div className="inline-flex items-center gap-[8px] bg-[#BE2B2D] text-[#FFFFFF] text-[12px] font-medium px-[12px] py-[6px] rounded-[16px]">
                    <AlertCircle className="w-[14px] h-[14px]" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        <AnimatePresence mode="wait">
          {result && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="flex flex-col items-center w-full">
              <div className="w-full max-w-3xl bg-[#FFFFFF] p-[24px] md:p-[32px] rounded-[9px] border border-[#E2E8F0] shadow-[0px_4px_12px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-[24px] border-b border-[#EBEBEB] pb-[16px] gap-[12px]">
                  <div>
                    <h3 className="text-[24px] md:text-[28px] font-medium leading-[1.2] text-[#000000]">Ekstraksi Selesai</h3>
                    <p className="text-[#212121] text-[14px] mt-[4px]">Pratinjau dan unduh media yang diminta.</p>
                  </div>
                  <div className="flex items-center gap-[8px] shrink-0">
                    {isDemo && (
                      <span className="bg-[#FFDBC4] text-[#38102A] text-[12px] font-medium px-[12px] py-[6px] rounded-[16px]">Data contoh</span>
                    )}
                    <span className="bg-[#008000] text-[#FFFFFF] text-[12px] font-medium px-[12px] py-[6px] rounded-[16px] flex items-center gap-[6px]">
                      <CheckCircle2 className="w-[14px] h-[14px]" /> Sukses
                    </span>
                  </div>
                </div>

                {isDemo && (
                  <p className="text-[13px] text-[#212121] bg-[#F4F4F4] border border-[#EBEBEB] rounded-[6px] px-[14px] py-[10px] mb-[20px]">
                    Ini hasil contoh (data contoh, bukan ekstraksi langsung) — untuk
                    menunjukkan tampilan kartu hasil. Tempel tautan asli untuk ekstraksi sungguhan.
                  </p>
                )}

                {links.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[24px]">
                    {links.map((link, idx) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: idx * 0.05 }}
                        key={idx}
                        className="flex flex-col justify-between p-[20px] border border-[#D0D5D2] rounded-[6px] bg-[#F4F4F4] hover:border-[#1863DC] hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-all group">
                        <div className="flex items-start gap-[12px] mb-[16px]">
                          <div className="w-[40px] h-[40px] bg-[#FFFFFF] rounded-[4px] border border-[#EBEBEB] flex items-center justify-center shrink-0 shadow-sm">
                            <LinkIcon className="w-[20px] h-[20px] text-[#1863DC]" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="text-[14px] font-medium text-[#020817] truncate" title={link.label}>{link.label}</h4>
                            <p className="text-[12px] text-[#212121] opacity-70 truncate mt-[2px]">Siap diakses</p>
                          </div>
                        </div>
                        <a
                          href={link.url} target="_blank" rel="noopener noreferrer"
                          className="w-full h-[40px] flex items-center justify-center gap-[8px] bg-transparent text-[#1863DC] border-[2px] border-[#1863DC] rounded-[2px] text-[14px] font-medium transition-colors hover:bg-[rgba(24,99,220,0.05)] active:bg-[rgba(24,99,220,0.1)]">
                          <Download className="w-[16px] h-[16px]" /> Access Media
                        </a>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-[32px] text-center border border-[#EBEBEB] rounded-[6px] bg-[#F4F4F4] mb-[24px]">
                    <p className="text-[16px] leading-[25px] text-[#212121]">Tidak ada URL media yang bisa diekstrak dari respons ini.</p>
                  </div>
                )}

                <details className="group border border-[#EBEBEB] rounded-[6px] overflow-hidden">
                  <summary className="bg-[#F4F4F4] text-[#020817] text-[14px] font-medium leading-[24px] p-[16px] hover:bg-[#E2E8F0] cursor-pointer transition-colors outline-none flex items-center justify-between">
                    <span>Lihat Payload Teknis</span>
                    <span className="text-[12px] opacity-60 group-open:hidden">Expand</span>
                    <span className="text-[12px] opacity-60 hidden group-open:block">Collapse</span>
                  </summary>
                  <div className="p-[16px] bg-[#FFFFFF] text-[12px] font-mono text-[#212121] whitespace-pre-wrap overflow-x-auto max-h-[400px] overflow-y-auto border-t border-[#EBEBEB]">
                    {JSON.stringify(result, null, 2)}
                  </div>
                </details>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="w-full max-w-4xl mx-auto mt-[16px] md:mt-[32px] grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          <div className="md:col-span-1 flex flex-col gap-[24px]">
            <div className="bg-[#FFDBC4] p-[24px] rounded-[9px] text-[#38102A] h-full shadow-[0px_4px_12px_rgba(0,0,0,0.1)] flex flex-col items-start">
              <div className="w-[48px] h-[48px] bg-[#FFFFFF] rounded-[6px] flex items-center justify-center mb-[16px] shadow-sm">
                <Globe className="w-[24px] h-[24px] text-[#FF9E33]" />
              </div>
              <h3 className="text-[18px] font-medium leading-[24px] mb-[8px]">Jangkauan Luas</h3>
              <p className="text-[14px] leading-[21px] flex-1">
                Satu kolom input untuk puluhan platform — tautan media diekstrak
                lewat layanan downr.org.
              </p>
            </div>
          </div>
          <div className="md:col-span-2 bg-[#FFFFFF] p-[24px] md:p-[32px] rounded-[9px] border border-[#E2E8F0] shadow-[0px_4px_12px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-[12px] mb-[16px] pb-[16px] border-b border-[#EBEBEB]">
              <Server className="w-[24px] h-[24px] text-[#1863DC]" />
              <h3 className="text-[18px] font-medium leading-[24px] text-[#020817]">Platform yang Didukung</h3>
            </div>
            <p className="text-[14px] leading-[24px] text-[#212121]">
              Daftar ini mengikuti klaim layanan ekstraksi (downr.org):
              <span className="font-medium mt-[8px] block opacity-80">
                TikTok, Douyin, CapCut, Threads, Instagram, Facebook, ESPN,
                Pinterest, IMDb, Imgur, iFunny, Reddit, YouTube, Twitter,
                Vimeo, Snapchat, Bilibili, Dailymotion, ShareChat, Likee,
                LinkedIn, Tumblr, Telegram, Spotify, SoundCloud, dan lainnya.
              </span>
            </p>
          </div>
        </section>

        <section className="w-full max-w-4xl mx-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-[9px] p-[20px] md:p-[24px] flex flex-col sm:flex-row items-start gap-[16px]">
            <Layers className="w-[24px] h-[24px] text-[#1863DC] shrink-0 mt-[2px]" />
            <div>
              <h3 className="text-[16px] font-medium text-[#020817] mb-[4px]">Bagaimana cara kerjanya?</h3>
              <p className="text-[14px] leading-[1.7] text-[#212121]">
                Tautan yang ditempel dikirim ke <code className="bg-[#F4F4F4] px-[6px] py-[2px] rounded-[4px]">/api/download</code>,
                yang dijalankan oleh worker Cloudflare di edge. Worker itu meminta
                layanan downr.org untuk mengekstrak tautan media dari halaman
                platform, lalu hasilnya ditampilkan sebagai kartu di atas.
                Detail teknis lengkap ada di <code className="bg-[#F4F4F4] px-[6px] py-[2px] rounded-[4px]">docs/api.md</code>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-[#D0D5D2] py-[32px] bg-[#FFFFFF] px-4 mt-auto">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[24px] h-[24px] bg-[#020817] rounded-[4px] flex items-center justify-center">
              <Download className="w-[14px] h-[14px] text-[#FF9E33]" strokeWidth={2.5} />
            </div>
            <p className="text-[14px] text-[#212121]">MEDIA Downloader — dibangun oleh <span className="font-medium text-[#020817]">dezzorigin</span></p>
          </div>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-[6px] text-[#1863DC] text-[14px] font-medium hover:underline">
            <GitHubIcon className="w-[16px] h-[16px]" /> github.com/dezzorigin/media-downloader
          </a>
        </div>
      </footer>
    </div>
  );
}
