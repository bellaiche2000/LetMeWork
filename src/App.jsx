import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

// ─── DATA ────────────────────────────────────────────────────────────────────

const SECTORS = ["Marketing", "Développement web", "Vente B2B", "Design", "RH", "Finance", "Communication", "Data"];

const LMW_CHALLENGES = {
  "Marketing": [
    { id: "m1", question: "Une marque lance un produit pour les 18-25 ans avec un budget serré. Quelle stratégie tu proposes et pourquoi ?", type: "text" },
    { id: "m2", question: "Un post Instagram d'une marque reçoit 200 commentaires négatifs en 2h. Tu fais quoi dans les 30 prochaines minutes ?", type: "text" },
    { id: "m3", question: "Classe ces canaux par priorité pour une startup B2C : SEO, Influenceurs, Ads payantes, Email, TikTok", type: "rank", options: ["SEO", "Influenceurs", "Ads payantes", "Email", "TikTok"] },
  ],
  "Développement web": [
    { id: "d1", question: "Un site e-commerce tombe en rade un Black Friday. Tu es le seul dev dispo. Décris ton process de diagnostic.", type: "text" },
    { id: "d2", question: "Tu rejoins une équipe et le code existant est illisible. Comment tu abordes ça sans froisser les anciens ?", type: "text" },
    { id: "d3", question: "Qu'est-ce qui est le plus important dans un projet web ?", type: "choice", options: ["La performance", "La lisibilité du code", "L'expérience utilisateur", "La sécurité"] },
  ],
  "Vente B2B": [
    { id: "v1", question: "Un prospect dit 'c'est trop cher' après ta démo. Qu'est-ce que tu réponds exactement ?", type: "text" },
    { id: "v2", question: "Tu as 10 leads qualifiés et seulement 3 jours pour closer. Comment tu priorises ?", type: "text" },
    { id: "v3", question: "Quel est selon toi le moment idéal pour relancer un prospect silencieux ?", type: "choice", options: ["24h après", "3 jours après", "1 semaine après", "Jamais, attendre qu'il revienne"] },
  ],
  "Design": [
    { id: "de1", question: "Un client te demande de 'rendre ça plus moderne'. Comment tu gères cette demande vague ?", type: "text" },
    { id: "de2", question: "Tu dois choisir entre une interface belle mais complexe ou simple mais moins impressionnante. Ton choix et pourquoi ?", type: "text" },
    { id: "de3", question: "Quel outil utilises-tu en priorité pour prototyper rapidement ?", type: "choice", options: ["Figma", "Sketch", "Adobe XD", "Papier + crayon"] },
  ],
};

const DEFAULT_JOBS = [
  {
    id: "j1", company: "Agence Nova", role: "Chargé(e) de Marketing Digital", sector: "Marketing",
    location: "Paris", type: "CDI", remote: true,
    description: "On cherche quelqu'un de motivé, pas forcément expérimenté. Si tu comprends les réseaux sociaux et que tu aimes analyser des données, on veut te parler.",
    values: ["Curiosité", "Autonomie", "Impact"],
    challenges: [
      { id: "cj1", question: "Propose 3 idées de contenu TikTok pour une marque de café éco-responsable.", type: "text" },
      { id: "cj2", question: "Quelle valeur te ressemble le plus dans notre équipe ?", type: "choice", options: ["Curiosité", "Autonomie", "Impact", "Rigueur"] },
    ],
    recruiter: "Sophie M.", applications: 0
  },
  {
    id: "j2", company: "TechFlow", role: "Développeur(se) Web Junior", sector: "Développement web",
    location: "Lyon", type: "CDI", remote: false,
    description: "Pas besoin d'un portfolio impressionnant. On veut voir comment tu penses, comment tu apprends, et si tu t'intègres à notre culture.",
    values: ["Rigueur", "Esprit d'équipe", "Curiosité"],
    challenges: [
      { id: "cj3", question: "Explique en 5 lignes comment fonctionne le concept de composant React à quelqu'un qui ne code pas.", type: "text" },
      { id: "cj4", question: "Face à un bug que tu ne comprends pas, quelle est ta première réaction ?", type: "choice", options: ["Stack Overflow", "Demander à un collègue", "Lire la doc", "Debugger ligne par ligne"] },
    ],
    recruiter: "Marc D.", applications: 0
  },
  {
    id: "j3", company: "Growthlab", role: "Business Developer", sector: "Vente B2B",
    location: "Bordeaux", type: "CDI", remote: true,
    description: "On ne filtre pas sur l'expérience. On filtre sur l'énergie, la résilience, et la capacité à convaincre. Si tu as ça, tu as ta place ici.",
    values: ["Résilience", "Ambition", "Authenticité"],
    challenges: [
      { id: "cj5", question: "Écris un cold email de 5 lignes pour un CEO de PME pour lui présenter notre outil.", type: "text" },
      { id: "cj6", question: "Face à 10 refus consécutifs, comment tu te remobilises ?", type: "text" },
    ],
    recruiter: "Laure P.", applications: 0
  },
];

const VALUES_QUESTIONS = [
  { id: "val1", question: "Dans une équipe, tu es plutôt...", options: ["Celui qui structure et organise", "Celui qui propose des idées", "Celui qui avance et exécute", "Celui qui crée du lien"] },
  { id: "val2", question: "Face à un échec, tu...", options: ["Analyses ce qui s'est passé", "Passes rapidement à autre chose", "En parles à ton équipe", "Te remets en question en profondeur"] },
  { id: "val3", question: "Ce qui te motive le plus dans un job...", options: ["L'impact concret de ton travail", "Apprendre constamment", "L'ambiance et les collègues", "L'autonomie et la liberté"] },
  { id: "val4", question: "Ton rapport à l'erreur...", options: ["C'est une opportunité d'apprendre", "C'est inévitable, faut avancer", "Ça me tracasse un moment", "Je l'analyse pour ne plus la refaire"] },
];

// ─── THEME ───────────────────────────────────────────────────────────────────

const C = {
  bg: "#07070a",
  bg2: "#0d0d12",
  bg3: "#13131a",
  gold: "#c8a96e",
  goldLight: "#e8d4a8",
  goldDim: "rgba(200,169,110,0.15)",
  white: "#f0eee8",
  muted: "rgba(240,238,232,0.4)",
  muted2: "rgba(240,238,232,0.2)",
  border: "rgba(240,238,232,0.07)",
  borderGold: "rgba(200,169,110,0.25)",
  danger: "#ff6b6b",
  dangerBg: "rgba(255,107,107,0.1)",
  success: "#4ecdc4",
  successBg: "rgba(78,205,196,0.1)",
};

const F = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'DM Sans', system-ui, sans-serif",
};

const s = {
  input: {
    width: "100%", padding: "12px 16px",
    border: `1px solid ${C.border}`,
    borderRadius: 4, fontFamily: F.sans, fontSize: 14,
    color: C.white, background: "rgba(255,255,255,0.04)",
    outline: "none", transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%", padding: "12px 16px",
    border: `1px solid ${C.border}`,
    borderRadius: 4, fontFamily: F.sans, fontSize: 14,
    color: C.white, background: "rgba(255,255,255,0.04)",
    outline: "none", resize: "vertical", minHeight: 100,
    transition: "border-color 0.2s",
  },
  label: { fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 6, display: "block" },
  card: { background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "1.25rem 1.5rem" },
  btnPrimary: { background: C.gold, color: C.bg, border: "none", borderRadius: 4, padding: "11px 24px", fontFamily: F.sans, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.02em" },
  btnGhost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 4, padding: "11px 24px", fontFamily: F.sans, fontSize: 13, cursor: "pointer", transition: "all 0.2s" },
  btnSmall: { background: C.goldDim, color: C.gold, border: `1px solid ${C.borderGold}`, borderRadius: 4, padding: "6px 14px", fontFamily: F.sans, fontSize: 12, cursor: "pointer" },
  tag: { display: "inline-flex", alignItems: "center", fontSize: 11, padding: "3px 10px", borderRadius: 20, border: `1px solid ${C.border}`, color: C.muted, background: "rgba(255,255,255,0.03)" },
  eyebrow: { fontSize: 11, fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
};

function calcScore(answers) {
  if (!answers || Object.keys(answers).length === 0) return 0;
  const n = Object.keys(answers).length;
  const filled = Object.values(answers).filter(v => v && String(v).trim().length > 10).length;
  return Math.round(55 + (filled / Math.max(n, 1)) * 35 + Math.random() * 10);
}

// ─── CONSTELLATION BACKGROUND ────────────────────────────────────────────────

function ConstellationBg() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const N = Math.floor((W * H) / 14000);
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.4,
      o: Math.random() * 0.5 + 0.15,
      pulse: Math.random() * Math.PI * 2,
    }));

    const onMove = (e) => {
      const touch = e.touches?.[0];
      mouseRef.current = { x: touch ? touch.clientX : e.clientX, y: touch ? touch.clientY : e.clientY };
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", resize);

    let frame = 0;
    let raf;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      particles.forEach(p => {
        // Mouse repulsion
        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.vx += dx / dist * 0.08;
          p.vy += dy / dist * 0.08;
        }
        // Damping
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        // Pulse
        p.pulse += 0.01;
        const pulse = Math.sin(p.pulse) * 0.15;

        // Draw star
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grd.addColorStop(0, `rgba(200,169,110,${(p.o + pulse) * 0.9})`);
        grd.addColorStop(1, `rgba(200,169,110,0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,238,232,${p.o + pulse})`;
        ctx.fill();
      });

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            const alpha = (1 - d / 140) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(200,169,110,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, zIndex: 0,
      pointerEvents: "none", opacity: 0.7,
    }} />
  );
}

// ─── SHARED LAYOUT ────────────────────────────────────────────────────────────

function PageShell({ children, user, onLogout, onHome }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.white, fontFamily: F.sans, position: "relative" }}>
      <ConstellationBg />
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: rgba(200,169,110,0.3); color: #f0eee8; }
        input, textarea, select { color-scheme: dark; }
        input::placeholder, textarea::placeholder { color: rgba(240,238,232,0.25); }
        select option { background: #13131a; color: #f0eee8; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.borderGold}; border-radius: 2px; }
      `}</style>
    </div>
  );
}

// ─── APP LAYOUT WITH SIDEBAR ──────────────────────────────────────────────────

function AppLayout({ user, page, setPage, onLogout, onHome, children }) {
  const links = user.mode === "candidat"
    ? [["dashboard", "Tableau de bord"], ["defis", "Mes défis"], ["offres", "Offres"], ["profil", "Mon profil"]]
    : [["dashboard", "Tableau de bord"], ["offres", "Mes offres"], ["candidats", "Candidats"], ["nouvelle-offre", "Créer une offre"]];

  return (
    <PageShell user={user} onLogout={onLogout} onHome={onHome}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: 220, minHeight: "100vh", background: "rgba(7,7,10,0.95)", backdropFilter: "blur(20px)", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "1.5rem 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
          <div style={{ padding: "0 1.5rem 1.5rem", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: F.serif, fontSize: 20, color: C.white }}>
              Let<em style={{ fontStyle: "italic", color: C.gold }}>Me</em>Work
            </div>
            <div style={{ fontSize: 11, color: C.gold, marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>{user.mode}</div>
          </div>
          <nav style={{ flex: 1, padding: "1rem 0" }}>
            {links.map(([k, label]) => (
              <button key={k} onClick={() => setPage(k)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 1.5rem",
                background: page === k ? "rgba(200,169,110,0.08)" : "transparent",
                border: "none",
                color: page === k ? C.gold : C.muted,
                fontSize: 13, cursor: "pointer", fontFamily: F.sans,
                borderLeft: page === k ? `2px solid ${C.gold}` : `2px solid transparent`,
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { if (page !== k) { e.currentTarget.style.color = C.white; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; } }}
                onMouseLeave={e => { if (page !== k) { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = "transparent"; } }}>
                {label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, color: C.white, marginBottom: 2 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>{user.email}</div>
            <button onClick={onHome} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: F.sans, display: "block", marginBottom: 8, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = C.white}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}>
              ← Page d'accueil
            </button>
            <button onClick={onLogout} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: F.sans, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = C.danger}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}>
              Déconnexion
            </button>
          </div>
        </div>
        {/* Main */}
        <main style={{ flex: 1, overflow: "auto", background: "rgba(7,7,10,0.6)", backdropFilter: "blur(8px)" }}>
          {children}
        </main>
      </div>
    </PageShell>
  );
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function ScoreBar({ value, color = C.gold }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(value), 300); }, [value]);
  return (
    <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 2, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

function Divider() { return <div style={{ height: 1, background: C.border, margin: "1.5rem 0" }} />; }

function GoldBadge({ children }) {
  return <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, padding: "3px 10px", borderRadius: 20, background: C.goldDim, color: C.gold, border: `1px solid ${C.borderGold}` }}>{children}</span>;
}

function SuccessBadge({ children }) {
  return <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, padding: "3px 10px", borderRadius: 20, background: C.successBg, color: C.success }}>{children}</span>;
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

function LandingPage({ onEnter }) {
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [heroText] = useState("Et si tout changeait ?");
  const [displayedChars, setDisplayedChars] = useState(0);
  const [revealed, setRevealed] = useState({});
  const revRefs = useRef({});

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setRevealed(p => ({ ...p, [e.target.dataset.rid]: true })); });
    }, { threshold: 0.1 });
    Object.values(revRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function rr(id) { return el => { if (el) { el.dataset.rid = id; revRefs.current[id] = el; } }; }
  function rv(id, delay = 0) {
    return {
      opacity: revealed[id] ? 1 : 0,
      transform: revealed[id] ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.9s ${delay}s cubic-bezier(0.4,0,0.2,1), transform 0.9s ${delay}s cubic-bezier(0.4,0,0.2,1)`,
    };
  }

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 400);
    let i = 0;
    const t = setInterval(() => { i++; setDisplayedChars(i); if (i >= heroText.length) clearInterval(t); }, 60);
    return () => clearInterval(t);
  }, []);

  const marqueeItems = ["Potentiel", "Culture Fit", "Mise en situation", "Reconversion", "Matching", "Évaluation hybride", "Premier emploi", "Score de fit", "Sans diplôme", "Niaque", "Ambition"];

  return (
    <PageShell>
      <div style={{ fontFamily: F.sans, color: C.white }}>
        <style>{`
          @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        `}</style>

        {/* NAV */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 4rem", background: scrollY > 50 ? "rgba(7,7,10,0.92)" : "transparent", backdropFilter: scrollY > 50 ? "blur(20px)" : "none", borderBottom: scrollY > 50 ? `1px solid ${C.border}` : "1px solid transparent", transition: "all 0.4s" }}>
          <div style={{ fontFamily: F.serif, fontSize: 22, color: C.white }}>
            Let<em style={{ fontStyle: "italic", color: C.gold }}>Me</em>Work
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => onEnter("login")} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, padding: "8px 20px", borderRadius: 4, fontSize: 13, fontFamily: F.sans, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
              Se connecter
            </button>
            <button onClick={() => onEnter("signup")} style={{ background: C.gold, border: "none", color: C.bg, padding: "8px 20px", borderRadius: 4, fontSize: 13, fontFamily: F.sans, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.transform = "none"; }}>
              Rejoindre →
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "8rem 4rem 4rem", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(200,169,110,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, marginBottom: "2rem", display: "flex", alignItems: "center", gap: 12, opacity: loaded ? 1 : 0, transition: "opacity 1s 0.3s" }}>
            <div style={{ width: 32, height: 1, background: C.gold }} />
            Beta — Accès anticipé
            <div style={{ width: 32, height: 1, background: C.gold }} />
          </div>

          <h1 style={{ fontFamily: F.serif, fontSize: "clamp(48px, 9vw, 120px)", fontWeight: 300, lineHeight: 0.95, letterSpacing: "-0.02em", maxWidth: 900, marginBottom: "2rem", position: "relative" }}>
            {heroText.split("").map((char, i) => (
              <span key={i} style={{ opacity: i < displayedChars ? 1 : 0, color: i >= 11 ? C.gold : C.white, transition: "opacity 0.1s", fontStyle: i > 5 ? "italic" : "normal" }}>
                {char}
              </span>
            ))}
            <span style={{ display: "inline-block", width: 3, height: "0.75em", background: C.gold, marginLeft: 4, verticalAlign: "middle", animation: displayedChars >= heroText.length ? "blink 1s infinite" : "none", display: "none" }} />
          </h1>

          <p style={{ fontFamily: F.serif, fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 300, fontStyle: "italic", color: C.muted, maxWidth: 600, lineHeight: 1.7, marginBottom: "3rem", opacity: loaded ? 1 : 0, transition: "opacity 1s 1.5s" }}>
            Le recrutement basé sur le potentiel, pas le papier.<br />
            <span style={{ color: C.white }}>Ton CV ne te définit pas.</span>
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", opacity: loaded ? 1 : 0, transition: "opacity 1s 2s" }}>
            <button onClick={() => onEnter("signup")} style={{ background: C.gold, border: "none", color: C.bg, padding: "15px 40px", borderRadius: 4, fontSize: 15, fontFamily: F.sans, fontWeight: 500, cursor: "pointer", transition: "all 0.3s", letterSpacing: "0.02em" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(200,169,110,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              Rejoindre LetMeWork →
            </button>
            <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, padding: "15px 32px", borderRadius: 4, fontSize: 15, fontFamily: F.sans, cursor: "pointer", transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
              Découvrir ↓
            </button>
          </div>

          <div style={{ position: "absolute", bottom: "3rem", left: "50%", transform: "translateX(-50%)", animation: "float 2s ease-in-out infinite", opacity: 0.4 }}>
            <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${C.gold}, transparent)`, margin: "0 auto" }} />
          </div>
        </section>

        {/* MARQUEE */}
        <div style={{ overflow: "hidden", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "1rem 0", background: "rgba(7,7,10,0.8)", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", animation: "marquee 40s linear infinite", width: "max-content" }}>
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "2rem", padding: "0 2rem", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, whiteSpace: "nowrap" }}>
                {item}
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.gold, opacity: 0.5 }} />
              </div>
            ))}
          </div>
        </div>

        {/* PROBLEM */}
        <section style={{ padding: "10rem 4rem", background: "rgba(7,7,10,0.7)", backdropFilter: "blur(10px)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div ref={rr("pb0")} style={{ textAlign: "center", marginBottom: "5rem", ...rv("pb0") }}>
              <div style={{ ...s.eyebrow, justifyContent: "center", marginBottom: "1rem" }}>
                <div style={{ width: 20, height: 1, background: C.gold }} />Le problème
              </div>
              <h2 style={{ fontFamily: F.serif, fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 300, letterSpacing: "-0.02em", color: C.white, lineHeight: 1.1 }}>
                Les sites d'emploi filtrent.<br />
                <em style={{ fontStyle: "italic", color: C.gold }}>Ils ne révèlent pas.</em>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {[
                ["1", "Les algorithmes éliminent les bons profils", "Un mot-clé manquant et ton dossier part à la poubelle — avant même qu'un humain le lise."],
                ["2", "Le cercle vicieux de l'expérience", "Pas d'expérience → pas de job → pas d'expérience. Impossible d'entrer dans la boucle sans la bonne case cochée."],
                ["3", "Le bon profil, la mauvaise personne", "Embauché sur le CV, licencié pour le caractère. Tout le monde perd du temps sur des erreurs évitables."],
              ].map(([n, title, text], i) => (
                <div key={n} ref={rr(`pb${i + 1}`)} style={{ ...s.card, ...rv(`pb${i + 1}`, i * 0.15), transition: `all 0.9s ${i * 0.15}s cubic-bezier(0.4,0,0.2,1), border-color 0.3s` }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.borderGold}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <div style={{ fontFamily: F.serif, fontSize: 40, fontWeight: 300, color: C.borderGold, lineHeight: 1, marginBottom: "1rem" }}>{n}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: C.white, marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, fontWeight: 300 }}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW */}
        <section style={{ padding: "10rem 4rem", background: "rgba(13,13,18,0.8)", backdropFilter: "blur(10px)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <div ref={rr("hw0")} style={{ ...rv("hw0") }}>
              <div style={{ ...s.eyebrow, justifyContent: "center", marginBottom: "1rem" }}>
                <div style={{ width: 20, height: 1, background: C.gold }} />La solution
              </div>
              <h2 style={{ fontFamily: F.serif, fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 300, letterSpacing: "-0.02em", color: C.white, marginBottom: "1rem", lineHeight: 1.1 }}>
                Prouve ce que tu vaux.<br />
                <em style={{ fontStyle: "italic", color: C.gold }}>Sans CV. Sans filtre.</em>
              </h2>
              <p style={{ fontSize: 15, color: C.muted, fontWeight: 300, lineHeight: 1.8, maxWidth: 500, margin: "0 auto 4rem" }}>
                Des défis concrets. Des questions sur tes valeurs. Un score de potentiel visible par les recruteurs qui cherchent vraiment.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2, background: C.border, borderRadius: 8, overflow: "hidden" }}>
              {[
                ["Crée ton profil", "Pas de CV. Décris qui tu es et ce qui te motive."],
                ["Passe les défis", "Mises en situation concrètes créées par secteur."],
                ["Obtiens ton score", "Un score de potentiel visible par tous les recruteurs."],
                ["Trouve ton match", "Postule ou laisse les recruteurs venir à toi."],
              ].map(([title, text], i) => (
                <div key={i} ref={rr(`hw${i + 1}`)} style={{ background: C.bg2, padding: "2.5rem 1.5rem", ...rv(`hw${i + 1}`, i * 0.1) }}>
                  <div style={{ fontFamily: F.serif, fontSize: 42, fontWeight: 300, color: C.gold, lineHeight: 1, marginBottom: "1rem", opacity: 0.5 }}>0{i + 1}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.white, marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, fontWeight: 300 }}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HISTOIRE */}
        <section style={{ padding: "10rem 4rem", background: "rgba(7,7,10,0.85)", backdropFilter: "blur(10px)" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div ref={rr("h0")} style={{ ...rv("h0") }}>
              <div style={{ ...s.eyebrow, marginBottom: "1.5rem" }}>
                <div style={{ width: 20, height: 1, background: C.gold }} />Pourquoi LetMeWork
              </div>
              <h2 style={{ fontFamily: F.serif, fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, letterSpacing: "-0.02em", color: C.white, marginBottom: "3rem", lineHeight: 1.1 }}>
                Une idée née d'une<br /><em style={{ fontStyle: "italic", color: C.gold }}>frustration personnelle.</em>
              </h2>
            </div>
            <div ref={rr("h1")} style={{ ...rv("h1", 0.1) }}>
              {[
                "Je m'appelle Kévin. Et comme beaucoup, j'ai vécu cette situation : envoyer des candidatures, attendre, ne jamais avoir de retour. Pas parce que je n'avais rien à apporter — mais parce que mon profil ne cochait pas les bonnes cases.",
                "J'ai réalisé que le problème n'était pas les candidats. C'était le système. Des algorithmes qui filtrent sur des mots-clés, des recruteurs qui cherchent 5 ans d'expérience pour un premier poste.",
                "Et si on jugeait les gens sur ce qu'ils sont capables de faire, pas sur ce qu'ils ont déjà fait ?",
              ].map((para, i) => (
                <p key={i} style={{
                  fontSize: i === 2 ? 22 : 15, color: i === 2 ? C.white : C.muted,
                  lineHeight: 1.9, fontWeight: 300, marginBottom: "1.5rem",
                  fontStyle: i === 2 ? "italic" : "normal",
                  fontFamily: i === 2 ? F.serif : F.sans,
                  borderLeft: i === 2 ? `2px solid ${C.gold}` : "none",
                  paddingLeft: i === 2 ? "1.5rem" : 0,
                }}>{para}</p>
              ))}
            </div>
            <div ref={rr("h2")} style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem", ...rv("h2", 0.2) }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: C.white }}>Bellaïche Kévin</div>
                <div style={{ fontSize: 12, color: C.gold, marginTop: 3, letterSpacing: "0.06em" }}>Fondateur, LetMeWork</div>
              </div>
              <button onClick={() => onEnter("signup")} style={{ background: "transparent", border: `1px solid ${C.borderGold}`, color: C.gold, padding: "10px 24px", borderRadius: 4, fontSize: 13, fontFamily: F.sans, cursor: "pointer", transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = C.bg; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.gold; }}>
                Rejoindre l'aventure →
              </button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "10rem 4rem", textAlign: "center", background: "rgba(13,13,18,0.9)", backdropFilter: "blur(10px)", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(200,169,110,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div ref={rr("cta")} style={{ maxWidth: 600, margin: "0 auto", position: "relative", ...rv("cta") }}>
            <h2 style={{ fontFamily: F.serif, fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.0, marginBottom: "1.5rem", color: C.white }}>
              Ta chance,<br /><em style={{ fontStyle: "italic", color: C.gold }}>c'est maintenant.</em>
            </h2>
            <p style={{ fontSize: 15, color: C.muted, fontWeight: 300, lineHeight: 1.8, marginBottom: "3rem" }}>
              Rejoins LetMeWork et découvre un recrutement basé sur qui tu es, pas sur ce que tu as fait.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => onEnter("signup")} style={{ background: C.gold, border: "none", color: C.bg, padding: "16px 44px", borderRadius: 4, fontSize: 15, fontFamily: F.sans, fontWeight: 500, cursor: "pointer", transition: "all 0.3s", letterSpacing: "0.02em" }}
                onMouseEnter={e => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(200,169,110,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                Je cherche un emploi →
              </button>
              <button onClick={() => onEnter("signup")} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, padding: "16px 36px", borderRadius: 4, fontSize: 15, fontFamily: F.sans, cursor: "pointer", transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.white; e.currentTarget.style.color = C.white; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                Je recrute
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "1.5rem 4rem", background: "rgba(7,7,10,0.95)", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ fontFamily: F.serif, fontSize: 18, color: C.white }}>
            Let<em style={{ fontStyle: "italic", color: C.gold }}>Me</em>Work
          </div>
          <div style={{ position: "fixed", bottom: "1rem", right: "1rem", fontSize: 11, color: "rgba(240,238,232,0.2)", fontFamily: F.sans }}>Conçu par Bellaïche Kévin</div>
        </footer>
      </div>
    </PageShell>
  );
}

// ─── AUTH SCREENS ─────────────────────────────────────────────────────────────

function LoginScreen({ onComplete, onSwitch, onBack }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.email || !form.password) { setErr("Remplis tous les champs."); return; }
    setErr(""); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setLoading(false);
    if (error) { setErr("Email ou mot de passe incorrect."); return; }
    const meta = data.user.user_metadata;
    onComplete({ email: form.email, name: meta.name || form.email.split("@")[0], mode: meta.mode || "candidat", sector: meta.sector || "", company: meta.company || "", id: data.user.id });
  }

  return (
    <PageShell>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 400, width: "100%", background: "rgba(13,13,18,0.9)", backdropFilter: "blur(20px)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "2.5rem" }}>
          <div style={{ fontFamily: F.serif, fontSize: 20, color: C.white, marginBottom: "2rem" }}>
            Let<em style={{ fontStyle: "italic", color: C.gold }}>Me</em>Work
          </div>
          <div style={{ ...s.eyebrow, marginBottom: "0.5rem" }}>Connexion</div>
          <h2 style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 300, letterSpacing: "-0.5px", marginBottom: "2rem", color: C.white }}>
            Content de te revoir.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[{ k: "email", label: "Email", type: "email", ph: "ton@email.com" }, { k: "password", label: "Mot de passe", type: "password", ph: "••••••••" }].map(f => (
              <div key={f.k}>
                <label style={s.label}>{f.label}</label>
                <input style={s.input} type={f.type} placeholder={f.ph} value={form[f.k]}
                  onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = C.gold}
                  onBlur={e => e.target.style.borderColor = C.border}
                  onKeyDown={e => e.key === "Enter" && submit()} />
              </div>
            ))}
            {err && <div style={{ fontSize: 13, color: C.danger, padding: "8px 12px", background: C.dangerBg, borderRadius: 4 }}>{err}</div>}
            <button style={{ ...s.btnPrimary, padding: 12, marginTop: 4, opacity: loading ? 0.6 : 1 }} onClick={submit} disabled={loading}>
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
            <div style={{ textAlign: "center", fontSize: 13, color: C.muted }}>
              Pas encore de compte ?{" "}
              <button onClick={onSwitch} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontSize: 13, fontFamily: F.sans }}>
                Rejoindre LetMeWork
              </button>
            </div>
            <button onClick={onBack} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", fontFamily: F.sans, textAlign: "center" }}>
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function OnboardingScreen({ onComplete, onBack }) {
  const [mode, setMode] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", sector: "", motivation: "", company: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.name || !form.email || !form.password) { setErr("Remplis tous les champs obligatoires."); return; }
    if (mode === "candidat" && !form.sector) { setErr("Choisis un secteur."); return; }
    if (mode === "recruteur" && !form.company) { setErr("Indique le nom de ton entreprise."); return; }
    setErr(""); setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { name: form.name, mode, sector: form.sector || "", company: form.company || "", motivation: form.motivation || "" } }
    });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    onComplete({ ...form, mode, id: data.user.id });
  }

  if (!mode) return (
    <PageShell>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: F.serif, fontSize: 20, color: C.white, marginBottom: "3rem" }}>
            Let<em style={{ fontStyle: "italic", color: C.gold }}>Me</em>Work
          </div>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: "1.5rem" }}>Beta — Accès anticipé</div>
          <div style={{ fontFamily: F.serif, fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 300, color: C.white, letterSpacing: "-0.02em", marginBottom: "1rem", marginTop: "1rem" }}>
  Let<em style={{ fontStyle: "italic", color: C.gold }}>Me</em>Work
</div>
          <h1 style={{ fontFamily: F.serif, fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 300, letterSpacing: "-1px", lineHeight: 1.05, marginBottom: "1rem", color: C.white }}>
            Bienvenue sur<br /><em style={{ fontStyle: "italic", color: C.gold }}>LetMeWork</em>
          </h1>
          <p style={{ fontSize: 15, color: C.muted, fontWeight: 300, lineHeight: 1.7, marginBottom: "3rem" }}>Le potentiel avant le papier.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { k: "candidat", title: "Je cherche un emploi", sub: "Crée ton profil, passe les défis, trouve ton match" },
              { k: "recruteur", title: "Je recrute", sub: "Publie une offre, crée tes défis, trouve les bons profils" },
            ].map(o => (
              <button key={o.k} onClick={() => setMode(o.k)} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "1.5rem", cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: C.white }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderGold; e.currentTarget.style.background = "rgba(200,169,110,0.05)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: C.white, marginBottom: 6 }}>{o.title}</div>
                <div style={{ fontSize: 13, color: C.muted, fontWeight: 300, lineHeight: 1.6 }}>{o.sub}</div>
              </button>
            ))}
          </div>
          <button onClick={onBack} style={{ marginTop: "2rem", fontSize: 13, color: C.muted, background: "none", border: "none", cursor: "pointer", fontFamily: F.sans }}>
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </PageShell>
  );

  return (
    <PageShell>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 440, width: "100%", background: "rgba(13,13,18,0.9)", backdropFilter: "blur(20px)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "2.5rem" }}>
          <button onClick={() => setMode(null)} style={{ ...s.btnGhost, marginBottom: "1.5rem", fontSize: 12, padding: "6px 14px" }}>← Retour</button>
          <div style={{ ...s.eyebrow, marginBottom: "0.5rem" }}>{mode === "candidat" ? "Compte candidat" : "Compte recruteur"}</div>
          <h2 style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 300, letterSpacing: "-0.5px", marginBottom: "2rem", color: C.white }}>
            {mode === "candidat" ? "Dis-nous qui tu es." : "Parle-nous de ton entreprise."}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[{ k: "name", label: "Prénom & nom *", ph: "Alex Martin" }, { k: "email", label: "Email *", ph: "alex@email.com", type: "email" }, { k: "password", label: "Mot de passe *", ph: "••••••••", type: "password" }].map(f => (
              <div key={f.k}>
                <label style={s.label}>{f.label}</label>
                <input style={s.input} type={f.type || "text"} placeholder={f.ph} value={form[f.k]}
                  onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = C.gold}
                  onBlur={e => e.target.style.borderColor = C.border} />
              </div>
            ))}
            {mode === "candidat" && (
              <>
                <div>
                  <label style={s.label}>Secteur visé *</label>
                  <select style={{ ...s.input, appearance: "none" }} value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}>
                    <option value="">Choisir un secteur</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Ce qui te motive</label>
                  <textarea style={s.textarea} placeholder="Ce qui me drive c'est..." value={form.motivation}
                    onChange={e => setForm(p => ({ ...p, motivation: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = C.gold}
                    onBlur={e => e.target.style.borderColor = C.border} />
                </div>
              </>
            )}
            {mode === "recruteur" && (
              <div>
                <label style={s.label}>Entreprise *</label>
                <input style={s.input} placeholder="Nom de ton entreprise" value={form.company}
                  onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = C.gold}
                  onBlur={e => e.target.style.borderColor = C.border} />
              </div>
            )}
            {err && <div style={{ fontSize: 13, color: C.danger, padding: "8px 12px", background: C.dangerBg, borderRadius: 4 }}>{err}</div>}
            <button style={{ ...s.btnPrimary, padding: 12, marginTop: 4, opacity: loading ? 0.6 : 1 }} onClick={submit} disabled={loading}>
              {loading ? "Création..." : "Créer mon compte →"}
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── CANDIDAT PAGES ───────────────────────────────────────────────────────────

function CandidatDashboard({ user, jobs, onNavigate }) {
  const score = user.globalScore || 0;
  const applied = user.applications?.length || 0;
  return (
    <div style={{ padding: "2.5rem 3rem", maxWidth: 900 }}>
      <div style={s.eyebrow}><div style={{ width: 16, height: 1, background: C.gold }} />Bonjour, {user.name?.split(" ")[0]}</div>
      <h1 style={{ fontFamily: F.serif, fontSize: 36, fontWeight: 300, letterSpacing: -1, marginBottom: "2.5rem", color: C.white }}>Tableau de bord</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "2rem" }}>
        {[
          { label: "Score global", val: score ? `${score}%` : "—", sub: score ? "Potentiel LetMeWork" : "Passe tes défis", color: score > 70 ? C.success : C.gold },
          { label: "Candidatures", val: applied, sub: `offre${applied > 1 ? "s" : ""} postulée${applied > 1 ? "s" : ""}` },
          { label: "Offres disponibles", val: jobs.length, sub: "correspondant à ton profil" },
        ].map((m, i) => (
          <div key={i} style={{ ...s.card, transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.borderGold}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>{m.label}</div>
            <div style={{ fontFamily: F.serif, fontSize: 40, fontWeight: 300, letterSpacing: -1, color: m.color || C.white, lineHeight: 1 }}>{m.val}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{m.sub}</div>
          </div>
        ))}
      </div>
      {!user.globalScore && (
        <div style={{ ...s.card, background: "rgba(200,169,110,0.06)", border: `1px solid ${C.borderGold}`, marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: C.white, marginBottom: 4 }}>Construis ton score de potentiel</div>
            <div style={{ fontSize: 13, color: C.muted, fontWeight: 300 }}>Passe les défis LetMeWork pour que les recruteurs te voient vraiment.</div>
          </div>
          <button style={{ ...s.btnPrimary, whiteSpace: "nowrap" }} onClick={() => onNavigate("defis")}>Commencer →</button>
        </div>
      )}
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: "1rem", color: C.white }}>Offres récentes</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {jobs.slice(0, 3).map(job => (
          <div key={job.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.borderGold}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.white }}>{job.role}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{job.company} · {job.location}</div>
            </div>
            <button style={s.btnSmall} onClick={() => onNavigate("offres")}>Voir</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChallengesPage({ user, onScoreUpdate }) {
  const challenges = LMW_CHALLENGES[user.sector] || LMW_CHALLENGES["Marketing"];
  const allChallenges = [...challenges, ...VALUES_QUESTIONS.slice(0, 2)];
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(user.challengeAnswers || {});
  const [done, setDone] = useState(user.globalScore ? true : false);
  const [ranking, setRanking] = useState({});

  function saveAnswer(id, val) { setAnswers(p => ({ ...p, [id]: val })); }

  function finish() {
    const score = calcScore(answers);
    setDone(true);
    onScoreUpdate(score, answers);
  }

  if (done) return (
    <div style={{ padding: "2.5rem 3rem", maxWidth: 600 }}>
      <div style={s.eyebrow}><div style={{ width: 16, height: 1, background: C.gold }} />Défis LetMeWork</div>
      <h1 style={{ fontFamily: F.serif, fontSize: 32, fontWeight: 300, letterSpacing: -1, marginBottom: "2rem", color: C.white }}>Ton score de potentiel</h1>
      <div style={{ ...s.card, background: "rgba(200,169,110,0.06)", border: `1px solid ${C.borderGold}`, marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Score global LetMeWork</div>
        <div style={{ fontFamily: F.serif, fontSize: 64, fontWeight: 300, letterSpacing: -2, color: C.gold, lineHeight: 1, marginBottom: "1.5rem" }}>{user.globalScore}%</div>
        <ScoreBar value={user.globalScore} />
        <div style={{ fontSize: 13, color: C.muted, marginTop: 12, fontWeight: 300 }}>Ce score est visible par tous les recruteurs sur LetMeWork.</div>
      </div>
    </div>
  );

  const c = allChallenges[current];
  const progress = (current / allChallenges.length) * 100;

  return (
    <div style={{ padding: "2.5rem 3rem", maxWidth: 680 }}>
      <div style={s.eyebrow}><div style={{ width: 16, height: 1, background: C.gold }} />Défis · {user.sector}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 300, letterSpacing: -0.5, color: C.white }}>Défis & mise en situation</h1>
        <div style={{ fontSize: 12, color: C.muted }}>{current + 1} / {allChallenges.length}</div>
      </div>
      <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, marginBottom: "2.5rem", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: C.gold, borderRadius: 1, transition: "width 0.4s ease" }} />
      </div>
      <div style={{ ...s.card, marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: "1rem" }}>
          {current < challenges.length ? "Mise en situation" : "Valeurs & personnalité"}
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: C.white, marginBottom: "1.5rem" }}>{c.question}</p>
        {c.type === "text" && (
          <textarea style={s.textarea} placeholder="Ta réponse..." value={answers[c.id] || ""}
            onChange={e => saveAnswer(c.id, e.target.value)}
            onFocus={e => e.target.style.borderColor = C.gold}
            onBlur={e => e.target.style.borderColor = C.border} />
        )}
        {(c.type === "choice" || c.type === "single_select") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {c.options.map(opt => (
              <button key={opt} onClick={() => saveAnswer(c.id, opt)} style={{
                padding: "10px 16px", borderRadius: 4, cursor: "pointer", textAlign: "left",
                border: `1px solid ${answers[c.id] === opt ? C.gold : C.border}`,
                background: answers[c.id] === opt ? "rgba(200,169,110,0.12)" : "rgba(255,255,255,0.02)",
                color: answers[c.id] === opt ? C.gold : C.muted,
                fontSize: 14, fontFamily: F.sans, transition: "all 0.15s",
              }}>{opt}</button>
            ))}
          </div>
        )}
        {c.type === "rank" && (
          <div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Clique pour classer par ordre de priorité</div>
            {c.options.map((opt) => (
              <div key={opt} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.gold }}>
                  {ranking[opt] || "—"}
                </div>
                <button onClick={() => {
                  const next = Object.keys(ranking).length + 1;
                  if (!ranking[opt]) setRanking(p => { const n = { ...p, [opt]: next }; saveAnswer(c.id, JSON.stringify(n)); return n; });
                }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: C.white, fontFamily: F.sans }}>
                  {opt}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {current > 0 && <button style={s.btnGhost} onClick={() => setCurrent(p => p - 1)}>← Précédent</button>}
        {current < allChallenges.length - 1
          ? <button style={{ ...s.btnPrimary, flex: 1 }} onClick={() => setCurrent(p => p + 1)}>Suivant →</button>
          : <button style={{ ...s.btnPrimary, flex: 1 }} onClick={finish}>Terminer et voir mon score →</button>
        }
      </div>
    </div>
  );
}

function JobsPage({ user, jobs, onApply }) {
  const [selected, setSelected] = useState(null);
  const [applyStep, setApplyStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentChallenge, setCurrentChallenge] = useState(0);

  if (applyStep === 2 && selected) {
    const fitScore = Math.round((user.globalScore || 70) * 0.5 + calcScore(answers) * 0.5);
    return (
      <div style={{ padding: "2.5rem 3rem", maxWidth: 600 }}>
        <h1 style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 300, letterSpacing: -0.5, marginBottom: "2rem", color: C.white }}>Candidature envoyée ✓</h1>
        <div style={{ ...s.card, background: "rgba(200,169,110,0.06)", border: `1px solid ${C.borderGold}`, marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>{selected.role} · {selected.company}</div>
          <div style={{ fontFamily: F.serif, fontSize: 52, fontWeight: 300, letterSpacing: -2, color: C.gold, lineHeight: 1, marginBottom: "1.5rem" }}>{fitScore}%</div>
          <div style={{ fontSize: 13, color: C.muted }}>Score de fit global · visible par {selected.recruiter}</div>
          <Divider />
          {[["Défis LetMeWork", user.globalScore || 70], ["Défis recruteur", calcScore(answers)], ["Valeurs & culture", Math.round(65 + Math.random() * 25)]].map(([l, v]) => (
            <div key={l} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 4 }}>
                <span>{l}</span><span style={{ color: C.gold }}>{v}%</span>
              </div>
              <ScoreBar value={v} />
            </div>
          ))}
        </div>
        <button style={s.btnGhost} onClick={() => { setApplyStep(0); setSelected(null); setAnswers({}); setCurrentChallenge(0); }}>← Retour aux offres</button>
      </div>
    );
  }

  if (applyStep === 1 && selected) {
    const ch = selected.challenges[currentChallenge];
    return (
      <div style={{ padding: "2.5rem 3rem", maxWidth: 620 }}>
        <div style={s.eyebrow}><div style={{ width: 16, height: 1, background: C.gold }} />Défis · {selected.company}</div>
        <h2 style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 300, letterSpacing: -0.5, marginBottom: "2rem", color: C.white }}>Défis du recruteur</h2>
        <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, marginBottom: "2rem", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(currentChallenge / selected.challenges.length) * 100}%`, background: C.gold, transition: "width 0.4s" }} />
        </div>
        <div style={{ ...s.card, marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: "1rem" }}>Question {currentChallenge + 1} / {selected.challenges.length}</div>
          <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: "1.5rem", color: C.white }}>{ch.question}</p>
          {ch.type === "text" ? (
            <textarea style={s.textarea} placeholder="Ta réponse..." value={answers[ch.id] || ""}
              onChange={e => setAnswers(p => ({ ...p, [ch.id]: e.target.value }))}
              onFocus={e => e.target.style.borderColor = C.gold}
              onBlur={e => e.target.style.borderColor = C.border} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ch.options.map(opt => (
                <button key={opt} onClick={() => setAnswers(p => ({ ...p, [ch.id]: opt }))} style={{
                  padding: "10px 16px", borderRadius: 4, cursor: "pointer", textAlign: "left",
                  border: `1px solid ${answers[ch.id] === opt ? C.gold : C.border}`,
                  background: answers[ch.id] === opt ? "rgba(200,169,110,0.12)" : "rgba(255,255,255,0.02)",
                  color: answers[ch.id] === opt ? C.gold : C.muted,
                  fontSize: 14, fontFamily: F.sans, transition: "all 0.15s",
                }}>{opt}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {currentChallenge > 0 && <button style={s.btnGhost} onClick={() => setCurrentChallenge(p => p - 1)}>← Précédent</button>}
          {currentChallenge < selected.challenges.length - 1
            ? <button style={{ ...s.btnPrimary, flex: 1 }} onClick={() => setCurrentChallenge(p => p + 1)}>Suivant →</button>
            : <button style={{ ...s.btnPrimary, flex: 1 }} onClick={() => { setApplyStep(2); onApply(selected.id); }}>Envoyer ma candidature →</button>
          }
        </div>
      </div>
    );
  }

  if (selected) return (
    <div style={{ padding: "2.5rem 3rem", maxWidth: 700 }}>
      <button style={{ ...s.btnGhost, marginBottom: "1.5rem", fontSize: 12 }} onClick={() => setSelected(null)}>← Retour aux offres</button>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
        <span style={s.tag}>{selected.sector}</span>
        <span style={s.tag}>{selected.location}</span>
        <span style={s.tag}>{selected.type}</span>
        {selected.remote && <GoldBadge>Remote ✓</GoldBadge>}
      </div>
      <h1 style={{ fontFamily: F.serif, fontSize: 32, fontWeight: 300, letterSpacing: -1, marginBottom: 6, color: C.white }}>{selected.role}</h1>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: "2rem" }}>{selected.company} · {selected.recruiter}</div>
      <Divider />
      <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, fontWeight: 300, marginBottom: "2rem" }}>{selected.description}</p>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Valeurs de l'équipe</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{selected.values.map(v => <GoldBadge key={v}>{v}</GoldBadge>)}</div>
      </div>
      <div style={{ ...s.card, background: "rgba(200,169,110,0.04)", border: `1px solid ${C.borderGold}`, marginBottom: "2rem" }}>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, fontWeight: 300 }}>
          En postulant, tu passeras <span style={{ color: C.gold }}>{selected.challenges.length} défis</span> créés par {selected.recruiter}. L'IA combinera ton score LetMeWork ({user.globalScore || "—"}%) avec ce score pour calculer ton fit global.
        </div>
      </div>
      <button style={{ ...s.btnPrimary, padding: "13px 28px" }} onClick={() => setApplyStep(1)}>Postuler et passer les défis →</button>
    </div>
  );

  return (
    <div style={{ padding: "2.5rem 3rem", maxWidth: 800 }}>
      <div style={s.eyebrow}><div style={{ width: 16, height: 1, background: C.gold }} />Offres disponibles</div>
      <h1 style={{ fontFamily: F.serif, fontSize: 32, fontWeight: 300, letterSpacing: -1, marginBottom: "2rem", color: C.white }}>Toutes les offres</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {jobs.map(job => (
          <div key={job.id} style={{ ...s.card, cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => setSelected(job)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderGold; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.background = "rgba(200,169,110,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: C.white, marginBottom: 4 }}>{job.role}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{job.company} · {job.location}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <span style={s.tag}>{job.sector}</span>
                  <span style={s.tag}>{job.type}</span>
                  {job.remote && <GoldBadge>Remote</GoldBadge>}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{job.challenges.length} défis</div>
                <div style={{ fontSize: 11, color: C.muted }}>{job.applications || 0} candidats</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilPage({ user, onUpdate }) {
  const [form, setForm] = useState({ name: user.name, sector: user.sector, motivation: user.motivation || "" });
  const [saved, setSaved] = useState(false);
  function save() { onUpdate(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }

  return (
    <div style={{ padding: "2.5rem 3rem", maxWidth: 600 }}>
      <div style={s.eyebrow}><div style={{ width: 16, height: 1, background: C.gold }} />Mon profil</div>
      <h1 style={{ fontFamily: F.serif, fontSize: 32, fontWeight: 300, letterSpacing: -1, marginBottom: "2rem", color: C.white }}>Tes informations</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={s.label}>Nom complet</label>
          <input style={s.input} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
        <div>
          <label style={s.label}>Secteur visé</label>
          <select style={{ ...s.input, appearance: "none" }} value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={s.label}>Ma motivation</label>
          <textarea style={s.textarea} value={form.motivation} onChange={e => setForm(p => ({ ...p, motivation: e.target.value }))}
            onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
        <button style={{ ...s.btnPrimary, padding: 12 }} onClick={save}>{saved ? "Sauvegardé ✓" : "Sauvegarder"}</button>
        {user.globalScore && (
          <>
            <Divider />
            <div style={{ ...s.card, background: "rgba(200,169,110,0.06)", border: `1px solid ${C.borderGold}` }}>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Ton score LetMeWork</div>
              <div style={{ fontFamily: F.serif, fontSize: 48, fontWeight: 300, letterSpacing: -2, color: C.gold, lineHeight: 1, marginBottom: "1rem" }}>{user.globalScore}%</div>
              <ScoreBar value={user.globalScore} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── RECRUTEUR PAGES ──────────────────────────────────────────────────────────

function RecruteurDashboard({ user, jobs, onNavigate }) {
  const myJobs = jobs.filter(j => j.recruiterId === user.id);
  const totalApps = myJobs.reduce((s, j) => s + (j.applications || 0), 0);
  return (
    <div style={{ padding: "2.5rem 3rem", maxWidth: 900 }}>
      <div style={s.eyebrow}><div style={{ width: 16, height: 1, background: C.gold }} />{user.company}</div>
      <h1 style={{ fontFamily: F.serif, fontSize: 36, fontWeight: 300, letterSpacing: -1, marginBottom: "2.5rem", color: C.white }}>Tableau de bord recruteur</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "2rem" }}>
        {[{ label: "Offres actives", val: myJobs.length }, { label: "Candidatures reçues", val: totalApps }, { label: "Profils dans le vivier", val: 0 }].map((m, i) => (
          <div key={i} style={{ ...s.card }}>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>{m.label}</div>
            <div style={{ fontFamily: F.serif, fontSize: 40, fontWeight: 300, letterSpacing: -1, color: C.white, lineHeight: 1 }}>{m.val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: C.white }}>Tes offres</h2>
        <button style={s.btnPrimary} onClick={() => onNavigate("nouvelle-offre")}>+ Nouvelle offre</button>
      </div>
      {myJobs.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: "3rem" }}>
          <div style={{ fontFamily: F.serif, fontSize: 22, marginBottom: 8, color: C.white }}>Aucune offre pour l'instant</div>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: "1.5rem" }}>Publie ta première offre et commence à recevoir des candidats qualifiés.</div>
          <button style={s.btnPrimary} onClick={() => onNavigate("nouvelle-offre")}>Créer une offre →</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {myJobs.map(job => (
            <div key={job.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.white }}>{job.role}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{job.sector} · {job.location}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <SuccessBadge>{job.applications || 0} candidats</SuccessBadge>
                <button style={s.btnSmall} onClick={() => onNavigate("candidats")}>Voir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NouvelleOffrePage({ user, onPublish }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ role: "", sector: "", location: "", type: "CDI", remote: false, description: "", values: [] });
  const [challenges, setChallenges] = useState([{ id: "c1", question: "", type: "text" }]);
  const [published, setPublished] = useState(false);
  const valueOptions = ["Curiosité", "Rigueur", "Autonomie", "Esprit d'équipe", "Ambition", "Bienveillance", "Impact", "Authenticité", "Résilience"];

  function addChallenge() { setChallenges(p => [...p, { id: `c${p.length + 1}`, question: "", type: "text" }]); }
  function updateChallenge(i, field, val) { setChallenges(p => p.map((c, j) => j === i ? { ...c, [field]: val } : c)); }
  function removeChallenge(i) { setChallenges(p => p.filter((_, j) => j !== i)); }

  function publish() {
    if (!form.role || !form.sector) return;
    const job = { ...form, id: `job_${Date.now()}`, recruiterId: user.id, recruiter: user.name, company: user.company, challenges: challenges.filter(c => c.question.trim()), applications: 0 };
    onPublish(job);
    setPublished(true);
  }

  if (published) return (
    <div style={{ padding: "2.5rem 3rem", maxWidth: 600 }}>
      <h1 style={{ fontFamily: F.serif, fontSize: 32, fontWeight: 300, letterSpacing: -1, marginBottom: "1rem", color: C.white }}>Offre publiée ✓</h1>
      <div style={{ ...s.card, background: "rgba(200,169,110,0.06)", border: `1px solid ${C.borderGold}`, marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, fontWeight: 300 }}>Ton offre est maintenant visible par les candidats.</div>
      </div>
      <button style={s.btnGhost} onClick={() => { setPublished(false); setStep(0); setForm({ role: "", sector: "", location: "", type: "CDI", remote: false, description: "", values: [] }); setChallenges([{ id: "c1", question: "", type: "text" }]); }}>
        Créer une autre offre
      </button>
    </div>
  );

  return (
    <div style={{ padding: "2.5rem 3rem", maxWidth: 680 }}>
      <div style={s.eyebrow}><div style={{ width: 16, height: 1, background: C.gold }} />Nouvelle offre</div>
      <h1 style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 300, letterSpacing: -0.5, marginBottom: "2rem", color: C.white }}>
        {step === 0 ? "Décris le poste" : "Crée tes défis"}
      </h1>
      <div style={{ display: "flex", gap: 8, marginBottom: "2rem" }}>
        {["Infos du poste", "Tes défis"].map((l, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 1, background: i <= step ? C.gold : "rgba(255,255,255,0.06)", transition: "background 0.3s" }} />
        ))}
      </div>
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={s.label}>Intitulé du poste *</label>
            <input style={s.input} placeholder="Ex: Chargé(e) de Marketing Digital" value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={s.label}>Secteur *</label>
              <select style={{ ...s.input, appearance: "none" }} value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}>
                <option value="">Choisir</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Ville</label>
              <input style={s.input} placeholder="Paris" value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
            </div>
          </div>
          <div>
            <label style={s.label}>Type de contrat</label>
            <select style={{ ...s.input, appearance: "none" }} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {["CDI", "CDD", "Stage", "Alternance", "Freelance"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" id="remote" checked={form.remote} onChange={e => setForm(p => ({ ...p, remote: e.target.checked }))} />
            <label htmlFor="remote" style={{ fontSize: 13, color: C.muted, cursor: "pointer" }}>Remote possible</label>
          </div>
          <div>
            <label style={s.label}>Description</label>
            <textarea style={s.textarea} placeholder="Ce qu'on cherche vraiment..." value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
          <div>
            <label style={s.label}>Valeurs de l'équipe</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {valueOptions.map(v => (
                <button key={v} onClick={() => setForm(p => ({ ...p, values: p.values.includes(v) ? p.values.filter(x => x !== v) : [...p.values, v] }))} style={{
                  padding: "5px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: F.sans,
                  background: form.values.includes(v) ? "rgba(200,169,110,0.15)" : "rgba(255,255,255,0.03)",
                  color: form.values.includes(v) ? C.gold : C.muted,
                  border: `1px solid ${form.values.includes(v) ? C.borderGold : C.border}`,
                  transition: "all 0.15s",
                }}>{v}</button>
              ))}
            </div>
          </div>
          <button style={{ ...s.btnPrimary, padding: 12 }} onClick={() => { if (form.role && form.sector) setStep(1); }}>Continuer →</button>
        </div>
      )}
      {step === 1 && (
        <div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: "1.5rem", padding: "12px 16px", background: "rgba(200,169,110,0.06)", borderRadius: 4, border: `1px solid ${C.borderGold}`, fontWeight: 300 }}>
            Crée des mises en situation spécifiques à ton poste.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "1.5rem" }}>
            {challenges.map((c, i) => (
              <div key={c.id} style={{ ...s.card }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: C.muted }}>Défi {i + 1}</div>
                  {challenges.length > 1 && <button onClick={() => removeChallenge(i)} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>Supprimer</button>}
                </div>
                <textarea style={{ ...s.textarea, minHeight: 80 }} placeholder="Quelle mise en situation ?"
                  value={c.question} onChange={e => updateChallenge(i, "question", e.target.value)}
                  onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  {["text", "choice"].map(t => (
                    <button key={t} onClick={() => updateChallenge(i, "type", t)} style={{
                      padding: "5px 14px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontFamily: F.sans,
                      background: c.type === t ? "rgba(200,169,110,0.15)" : "rgba(255,255,255,0.03)",
                      color: c.type === t ? C.gold : C.muted,
                      border: `1px solid ${c.type === t ? C.borderGold : C.border}`,
                    }}>{t === "text" ? "Texte libre" : "Choix multiple"}</button>
                  ))}
                </div>
                {c.type === "choice" && (
                  <div style={{ marginTop: 10 }}>
                    <label style={s.label}>Options (séparées par une virgule)</label>
                    <input style={s.input} placeholder="Option A, Option B, Option C"
                      value={c.options?.join(", ") || ""}
                      onChange={e => updateChallenge(i, "options", e.target.value.split(",").map(x => x.trim()))}
                      onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={s.btnGhost} onClick={addChallenge}>+ Ajouter un défi</button>
            <button style={{ ...s.btnPrimary, flex: 1 }} onClick={publish}>Publier l'offre →</button>
          </div>
          <button style={{ ...s.btnGhost, marginTop: 10, width: "100%" }} onClick={() => setStep(0)}>← Modifier les infos</button>
        </div>
      )}
    </div>
  );
}

function CandidatsPage({ jobs, user }) {
  const myJobs = jobs.filter(j => j.recruiterId === user.id);
  const mockCandidates = [
    { name: "Alex L.", sector: "Marketing", score: 91, job: myJobs[0]?.role || "Marketing Digital", status: "nouveau" },
    { name: "Sara M.", sector: "Développement web", score: 87, job: myJobs[0]?.role || "Dev Web", status: "en cours" },
    { name: "Jordan K.", sector: "Vente B2B", score: 82, job: myJobs[0]?.role || "Business Dev", status: "nouveau" },
  ];

  return (
    <div style={{ padding: "2.5rem 3rem", maxWidth: 800 }}>
      <div style={s.eyebrow}><div style={{ width: 16, height: 1, background: C.gold }} />Candidats</div>
      <h1 style={{ fontFamily: F.serif, fontSize: 32, fontWeight: 300, letterSpacing: -1, marginBottom: "2rem", color: C.white }}>Candidatures reçues</h1>
      {myJobs.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: "3rem" }}>
          <div style={{ fontFamily: F.serif, fontSize: 20, color: C.white, marginBottom: 8 }}>Aucune candidature pour l'instant</div>
          <div style={{ fontSize: 14, color: C.muted }}>Publie une offre pour commencer à recevoir des candidats qualifiés.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mockCandidates.map((c, i) => (
            <div key={i} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderGold}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(200,169,110,0.1)", border: `1px solid ${C.borderGold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: C.gold, flexShrink: 0 }}>
                  {c.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.white }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{c.job} · Score : <span style={{ color: C.gold }}>{c.score}%</span></div>
                  <div style={{ marginTop: 8, width: 160 }}><ScoreBar value={c.score} /></div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {c.status === "nouveau" ? <GoldBadge>Nouveau</GoldBadge> : <SuccessBadge>En cours</SuccessBadge>}
                <button style={s.btnSmall}>Voir le profil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [jobs, setJobs] = useState(DEFAULT_JOBS);

  function handleEnter(mode) { setScreen(mode === "login" ? "login" : "auth"); }
  function handleLogin(userData) { setUser(userData); setScreen("app"); setPage("dashboard"); }
  function handleLogout() { setUser(null); setScreen("landing"); }
  function handleScoreUpdate(score, answers) { setUser(p => ({ ...p, globalScore: score, challengeAnswers: answers })); }
  function handleApply(jobId) {
    setUser(p => ({ ...p, applications: [...(p.applications || []), jobId] }));
    setJobs(p => p.map(j => j.id === jobId ? { ...j, applications: (j.applications || 0) + 1 } : j));
  }
  function handlePublish(job) { setJobs(p => [...p, job]); setPage("dashboard"); }
  function handleProfileUpdate(data) { setUser(p => ({ ...p, ...data })); }

  if (screen === "landing") return <LandingPage onEnter={handleEnter} />;
  if (screen === "login") return <LoginScreen onComplete={handleLogin} onSwitch={() => setScreen("auth")} onBack={() => setScreen("landing")} />;
  if (screen === "auth") return <OnboardingScreen onComplete={handleLogin} onBack={() => setScreen("landing")} />;

  const renderPage = () => {
    if (user.mode === "candidat") {
      if (page === "dashboard") return <CandidatDashboard user={user} jobs={jobs} onNavigate={setPage} />;
      if (page === "defis") return <ChallengesPage user={user} onScoreUpdate={handleScoreUpdate} />;
      if (page === "offres") return <JobsPage user={user} jobs={jobs} onApply={handleApply} />;
      if (page === "profil") return <ProfilPage user={user} onUpdate={handleProfileUpdate} />;
    } else {
      if (page === "dashboard") return <RecruteurDashboard user={user} jobs={jobs} onNavigate={setPage} />;
      if (page === "offres") return <RecruteurDashboard user={user} jobs={jobs} onNavigate={setPage} />;
      if (page === "candidats") return <CandidatsPage jobs={jobs} user={user} />;
      if (page === "nouvelle-offre") return <NouvelleOffrePage user={user} onPublish={handlePublish} />;
    }
    return null;
  };

  return (
    <AppLayout user={user} page={page} setPage={setPage} onLogout={handleLogout} onHome={() => setScreen("landing")}>
      {renderPage()}
    </AppLayout>
  );
}
