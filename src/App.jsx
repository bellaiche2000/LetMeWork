import { useState, useEffect, useRef } from "react";

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

// ─── STYLES ──────────────────────────────────────────────────────────────────

const G = {
  ink: "#111110", ink2: "#1c1c1a", ink3: "#282826",
  paper: "#f7f5f0", paper2: "#efede8", paper3: "#e5e2da",
  muted: "#8a8880", muted2: "#6a6864",
  gold: "#c8a96e",
  success: "#2d6a4f", successBg: "#d8f3dc",
  danger: "#a32d2d", dangerBg: "#fcebeb",
};

const font = { serif: "'Georgia', serif", sans: "'DM Sans', system-ui, sans-serif" };

const s = {
  page: { minHeight: "100vh", background: G.paper, fontFamily: font.sans, color: G.ink },
  card: { background: "#fff", border: `1px solid ${G.paper3}`, borderRadius: 4, padding: "1.5rem" },
  cardDark: { background: G.ink, border: `1px solid ${G.ink2}`, borderRadius: 4, padding: "1.5rem", color: G.paper },
  input: { width: "100%", padding: "10px 14px", border: `1px solid ${G.paper3}`, borderRadius: 2, fontFamily: font.sans, fontSize: 14, color: G.ink, background: "#fff", outline: "none", transition: "border-color 0.2s" },
  textarea: { width: "100%", padding: "10px 14px", border: `1px solid ${G.paper3}`, borderRadius: 2, fontFamily: font.sans, fontSize: 14, color: G.ink, background: "#fff", outline: "none", resize: "vertical", minHeight: 100, transition: "border-color 0.2s" },
  btnPrimary: { background: G.ink, color: G.paper, border: "none", borderRadius: 2, padding: "10px 22px", fontFamily: font.sans, fontSize: 13, fontWeight: 400, cursor: "pointer", letterSpacing: "0.02em", transition: "opacity 0.2s" },
  btnGhost: { background: "transparent", color: G.muted, border: `1px solid ${G.paper3}`, borderRadius: 2, padding: "10px 22px", fontFamily: font.sans, fontSize: 13, cursor: "pointer", transition: "all 0.2s" },
  btnSmall: { background: G.ink, color: G.paper, border: "none", borderRadius: 2, padding: "7px 16px", fontFamily: font.sans, fontSize: 12, cursor: "pointer", letterSpacing: "0.02em" },
  label: { fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: G.muted, marginBottom: 6, display: "block" },
  eyebrow: { fontSize: 11, fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: G.muted, display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  serif: { fontFamily: font.serif },
  tag: { display: "inline-flex", alignItems: "center", fontSize: 11, padding: "3px 10px", borderRadius: 20, border: `1px solid ${G.paper3}`, color: G.muted, background: G.paper2 },
  badge: (c) => ({ display: "inline-flex", alignItems: "center", fontSize: 11, padding: "3px 10px", borderRadius: 20, background: c === "green" ? G.successBg : c === "gold" ? "#fdf3e2" : G.paper2, color: c === "green" ? G.success : c === "gold" ? "#7a5c1e" : G.muted }),
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function calcScore(answers) {
  if (!answers || Object.keys(answers).length === 0) return 0;
  const n = Object.keys(answers).length;
  const filled = Object.values(answers).filter(v => v && String(v).trim().length > 10).length;
  return Math.round(55 + (filled / Math.max(n, 1)) * 35 + Math.random() * 10);
}

function ScoreBar({ value, max = 100, color = G.ink }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(value), 200); }, [value]);
  return (
    <div style={{ height: 3, background: G.paper3, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${(w / max) * 100}%`, background: color, borderRadius: 2, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

function Divider() { return <div style={{ height: 1, background: G.paper3, margin: "1.5rem 0" }} />; }
function DividerDark() { return <div style={{ height: 1, background: "rgba(247,245,240,0.08)", margin: "1.5rem 0" }} />; }

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

function OnboardingScreen({ onComplete }) {
  const [mode, setMode] = useState(null); // 'candidat' | 'recruteur'
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", password: "", sector: "", motivation: "", company: "" });
  const [err, setErr] = useState("");

  function submit() {
    if (!form.name || !form.email || !form.password) { setErr("Remplis tous les champs obligatoires."); return; }
    if (mode === "candidat" && !form.sector) { setErr("Choisis un secteur."); return; }
    if (mode === "recruteur" && !form.company) { setErr("Indique le nom de ton entreprise."); return; }
    setErr("");
    onComplete({ ...form, mode, id: Date.now() });
  }

  if (!mode) return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: G.muted, marginBottom: "2rem" }}>Beta — Accès anticipé</div>
        <h1 style={{ fontFamily: font.serif, fontSize: 42, letterSpacing: -1, lineHeight: 1.05, marginBottom: "1rem", color: G.ink }}>
          Bienvenue sur<br /><em style={{ color: G.muted }}>LetMeWork</em>
        </h1>
        <p style={{ fontSize: 15, color: G.muted, fontWeight: 300, lineHeight: 1.7, marginBottom: "2.5rem" }}>Le potentiel avant le papier. Rejoins la plateforme et découvre un recrutement basé sur qui tu es vraiment.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { k: "candidat", title: "Je cherche un emploi", sub: "Crée ton profil, passe les défis, trouve ton match" },
            { k: "recruteur", title: "Je recrute", sub: "Publie une offre, crée tes défis, trouve les bons profils" },
          ].map(o => (
            <button key={o.k} onClick={() => setMode(o.k)} style={{ background: "#fff", border: `1px solid ${G.paper3}`, borderRadius: 4, padding: "1.5rem", cursor: "pointer", textAlign: "left", transition: "border-color 0.2s, transform 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G.ink; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = G.paper3; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: G.ink, marginBottom: 6 }}>{o.title}</div>
              <div style={{ fontSize: 13, color: G.muted, fontWeight: 300, lineHeight: 1.6 }}>{o.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: 440, width: "100%" }}>
        <button onClick={() => setMode(null)} style={{ ...s.btnGhost, marginBottom: "2rem", fontSize: 12 }}>← Retour</button>
        <div style={s.eyebrow}><div style={{ width: 24, height: 1, background: G.muted }} />{mode === "candidat" ? "Création de compte candidat" : "Création de compte recruteur"}</div>
        <h2 style={{ fontFamily: font.serif, fontSize: 28, letterSpacing: -0.5, marginBottom: "2rem", color: G.ink }}>
          {mode === "candidat" ? "Dis-nous qui tu es." : "Parle-nous de ton entreprise."}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { k: "name", label: "Prénom & nom *", placeholder: "Alex Martin" },
            { k: "email", label: "Email *", placeholder: "alex@email.com", type: "email" },
            { k: "password", label: "Mot de passe *", placeholder: "••••••••", type: "password" },
          ].map(f => (
            <div key={f.k}>
              <label style={s.label}>{f.label}</label>
              <input style={s.input} type={f.type || "text"} placeholder={f.placeholder} value={form[f.k]}
                onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                onFocus={e => e.target.style.borderColor = G.ink}
                onBlur={e => e.target.style.borderColor = G.paper3} />
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
                <label style={s.label}>Ce qui te motive (optionnel)</label>
                <textarea style={s.textarea} placeholder="Ce qui me drive c'est..." value={form.motivation}
                  onChange={e => setForm(p => ({ ...p, motivation: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = G.ink}
                  onBlur={e => e.target.style.borderColor = G.paper3} />
              </div>
            </>
          )}

          {mode === "recruteur" && (
            <div>
              <label style={s.label}>Entreprise *</label>
              <input style={s.input} placeholder="Nom de ton entreprise" value={form.company}
                onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                onFocus={e => e.target.style.borderColor = G.ink}
                onBlur={e => e.target.style.borderColor = G.paper3} />
            </div>
          )}

          {err && <div style={{ fontSize: 13, color: G.danger, padding: "8px 12px", background: G.dangerBg, borderRadius: 2 }}>{err}</div>}

          <button style={{ ...s.btnPrimary, padding: "12px", marginTop: 4 }} onClick={submit}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}>
            Créer mon compte →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

function Sidebar({ user, page, setPage, onLogout }) {
  const links = user.mode === "candidat"
    ? [["dashboard", "Tableau de bord"], ["defis", "Mes défis"], ["offres", "Offres"], ["profil", "Mon profil"]]
    : [["dashboard", "Tableau de bord"], ["offres", "Mes offres"], ["candidats", "Candidats"], ["nouvelle-offre", "Créer une offre"]];

  return (
    <div style={{ width: 220, minHeight: "100vh", background: G.ink, display: "flex", flexDirection: "column", padding: "1.5rem 0", flexShrink: 0 }}>
      <div style={{ padding: "0 1.5rem 1.5rem", borderBottom: "1px solid rgba(247,245,240,0.06)" }}>
        <div style={{ fontFamily: font.serif, fontSize: 18, color: G.paper }}><em style={{ fontStyle: "italic", color: "rgba(247,245,240,0.35)" }}>Let</em>MeWork</div>
        <div style={{ fontSize: 11, color: "rgba(247,245,240,0.3)", marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>{user.mode}</div>
      </div>
      <nav style={{ flex: 1, padding: "1rem 0" }}>
        {links.map(([k, label]) => (
          <button key={k} onClick={() => setPage(k)} style={{
            display: "block", width: "100%", textAlign: "left", padding: "10px 1.5rem",
            background: page === k ? "rgba(247,245,240,0.08)" : "transparent",
            border: "none", color: page === k ? G.paper : "rgba(247,245,240,0.4)",
            fontSize: 13, cursor: "pointer", fontFamily: font.sans,
            borderLeft: page === k ? `2px solid ${G.paper}` : "2px solid transparent",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { if (page !== k) e.currentTarget.style.color = "rgba(247,245,240,0.7)"; }}
            onMouseLeave={e => { if (page !== k) e.currentTarget.style.color = "rgba(247,245,240,0.4)"; }}>
            {label}
          </button>
        ))}
      </nav>
      <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(247,245,240,0.06)" }}>
        <div style={{ fontSize: 13, color: G.paper, marginBottom: 4 }}>{user.name}</div>
        <div style={{ fontSize: 11, color: "rgba(247,245,240,0.3)", marginBottom: 12 }}>{user.email}</div>
        <button onClick={onLogout} style={{ fontSize: 12, color: "rgba(247,245,240,0.3)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: font.sans }}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}

// ─── CANDIDAT PAGES ───────────────────────────────────────────────────────────

function CandidatDashboard({ user, jobs, onNavigate }) {
  const score = user.globalScore || 0;
  const applied = user.applications?.length || 0;

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 900 }}>
      <div style={s.eyebrow}><div style={{ width: 20, height: 1, background: G.muted }} />Bonjour, {user.name.split(" ")[0]}</div>
      <h1 style={{ fontFamily: font.serif, fontSize: 32, letterSpacing: -1, marginBottom: "2rem", color: G.ink }}>Ton tableau de bord</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "2rem" }}>
        {[
          { label: "Score global", val: score ? `${score}%` : "—", sub: score ? "Potentiel LetMeWork" : "Passe tes défis", color: score > 70 ? G.success : G.muted },
          { label: "Candidatures", val: applied, sub: `offre${applied > 1 ? "s" : ""} postulée${applied > 1 ? "s" : ""}` },
          { label: "Offres disponibles", val: jobs.length, sub: "correspondant à ton profil" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", border: `1px solid ${G.paper3}`, borderRadius: 4, padding: "1.25rem 1.5rem" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: G.muted, marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: font.serif, fontSize: 36, letterSpacing: -1, color: m.color || G.ink, lineHeight: 1 }}>{m.val}</div>
            <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {!user.globalScore && (
        <div style={{ background: G.ink, borderRadius: 4, padding: "1.5rem 2rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: G.paper, marginBottom: 4 }}>Construis ton score de potentiel</div>
            <div style={{ fontSize: 13, color: "rgba(247,245,240,0.45)", fontWeight: 300 }}>Passe les défis LetMeWork pour que les recruteurs te voient vraiment.</div>
          </div>
          <button style={{ ...s.btnPrimary, background: G.paper, color: G.ink, whiteSpace: "nowrap", marginLeft: "2rem" }} onClick={() => onNavigate("defis")}>
            Commencer les défis →
          </button>
        </div>
      )}

      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: "1rem", color: G.ink }}>Offres récentes pour toi</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {jobs.slice(0, 3).map(job => (
          <div key={job.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: G.ink }}>{job.role}</div>
              <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{job.company} · {job.location} · {job.remote ? "Remote" : "Sur site"}</div>
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
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(user.challengeAnswers || {});
  const [done, setDone] = useState(user.globalScore ? true : false);
  const [ranking, setRanking] = useState({});

  function saveAnswer(id, val) { setAnswers(p => ({ ...p, [id]: val })); }

  function finish() {
    const allAnswers = { ...answers };
    // add values questions answers
    const score = calcScore(allAnswers);
    setDone(true);
    onScoreUpdate(score, allAnswers);
  }

  if (done) return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 700 }}>
      <div style={s.eyebrow}><div style={{ width: 20, height: 1, background: G.muted }} />Défis LetMeWork</div>
      <h1 style={{ fontFamily: font.serif, fontSize: 32, letterSpacing: -1, marginBottom: "2rem" }}>Ton score de potentiel</h1>
      <div style={{ ...s.cardDark, marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 13, color: "rgba(247,245,240,0.4)", marginBottom: 8 }}>Score global LetMeWork</div>
        <div style={{ fontFamily: font.serif, fontSize: 64, letterSpacing: -2, color: G.paper, lineHeight: 1, marginBottom: "1.5rem" }}>{user.globalScore}%</div>
        <ScoreBar value={user.globalScore} color="rgba(247,245,240,0.7)" />
        <div style={{ fontSize: 13, color: "rgba(247,245,240,0.35)", marginTop: 12 }}>Ce score est visible par tous les recruteurs sur LetMeWork.</div>
      </div>
      <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.7 }}>Tu peux maintenant postuler aux offres. En postulant, tu passeras aussi les défis spécifiques du recruteur pour affiner le score de fit.</div>
    </div>
  );

  const allChallenges = [...challenges, ...VALUES_QUESTIONS.slice(0, 2)];
  const c = allChallenges[current];
  const progress = ((current) / allChallenges.length) * 100;

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 680 }}>
      <div style={s.eyebrow}><div style={{ width: 20, height: 1, background: G.muted }} />Défis LetMeWork · {user.sector}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: font.serif, fontSize: 28, letterSpacing: -0.5 }}>Défis & mise en situation</h1>
        <div style={{ fontSize: 12, color: G.muted }}>{current + 1} / {allChallenges.length}</div>
      </div>

      <div style={{ height: 2, background: G.paper3, borderRadius: 1, marginBottom: "2.5rem", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: G.ink, borderRadius: 1, transition: "width 0.4s ease" }} />
      </div>

      <div style={{ ...s.card, marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: G.muted, marginBottom: "1rem" }}>
          {current < challenges.length ? "Mise en situation" : "Valeurs & personnalité"}
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: G.ink, marginBottom: "1.5rem" }}>{c.question}</p>

        {c.type === "text" && (
          <textarea style={s.textarea} placeholder="Ta réponse..." value={answers[c.id] || ""}
            onChange={e => saveAnswer(c.id, e.target.value)}
            onFocus={e => e.target.style.borderColor = G.ink}
            onBlur={e => e.target.style.borderColor = G.paper3} />
        )}

        {(c.type === "choice" || c.type === "single_select") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {c.options.map(opt => (
              <button key={opt} onClick={() => saveAnswer(c.id, opt)} style={{
                padding: "10px 16px", borderRadius: 2, cursor: "pointer", textAlign: "left",
                border: `1px solid ${answers[c.id] === opt ? G.ink : G.paper3}`,
                background: answers[c.id] === opt ? G.ink : "#fff",
                color: answers[c.id] === opt ? G.paper : G.ink,
                fontSize: 14, fontFamily: font.sans, transition: "all 0.15s",
              }}>{opt}</button>
            ))}
          </div>
        )}

        {c.type === "rank" && (
          <div>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 10 }}>Clique pour classer par ordre de priorité (1 = plus important)</div>
            {c.options.map((opt, i) => (
              <div key={opt} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${G.paper3}` }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: G.paper2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: G.muted }}>
                  {ranking[opt] || "—"}
                </div>
                <button onClick={() => {
                  const next = (Object.keys(ranking).length) + 1;
                  if (!ranking[opt]) setRanking(p => { const n = { ...p, [opt]: next }; saveAnswer(c.id, JSON.stringify(n)); return n; });
                }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: G.ink, fontFamily: font.sans }}>
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
          ? <button style={{ ...s.btnPrimary, flex: 1 }} onClick={() => setCurrent(p => p + 1)}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}>Suivant →</button>
          : <button style={{ ...s.btnPrimary, flex: 1 }} onClick={finish}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}>Terminer et voir mon score →</button>
        }
      </div>
    </div>
  );
}

function JobsPage({ user, jobs, onApply }) {
  const [selected, setSelected] = useState(null);
  const [applyStep, setApplyStep] = useState(0); // 0=list, 1=challenges, 2=done
  const [answers, setAnswers] = useState({});
  const [currentChallenge, setCurrentChallenge] = useState(0);

  if (applyStep === 2 && selected) {
    const fitScore = Math.round((user.globalScore || 70) * 0.5 + calcScore(answers) * 0.5);
    return (
      <div style={{ padding: "2rem 2.5rem", maxWidth: 600 }}>
        <h1 style={{ fontFamily: font.serif, fontSize: 28, letterSpacing: -0.5, marginBottom: "2rem" }}>Candidature envoyée ✓</h1>
        <div style={{ ...s.cardDark, marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 13, color: "rgba(247,245,240,0.4)", marginBottom: 6 }}>{selected.role} · {selected.company}</div>
          <div style={{ fontFamily: font.serif, fontSize: 52, letterSpacing: -2, color: G.paper, lineHeight: 1, marginBottom: "1.5rem" }}>{fitScore}%</div>
          <div style={{ fontSize: 13, color: "rgba(247,245,240,0.35)" }}>Score de fit global · visible par {selected.recruiter}</div>
          <DividerDark />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["Défis LetMeWork", user.globalScore || 70], ["Défis recruteur", calcScore(answers)], ["Valeurs & culture", Math.round(65 + Math.random() * 25)]].map(([l, v]) => (
              <div key={l}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(247,245,240,0.45)", marginBottom: 4 }}>
                  <span>{l}</span><span>{v}%</span>
                </div>
                <ScoreBar value={v} color="rgba(247,245,240,0.5)" />
              </div>
            ))}
          </div>
        </div>
        <button style={s.btnGhost} onClick={() => { setApplyStep(0); setSelected(null); setAnswers({}); setCurrentChallenge(0); }}>← Retour aux offres</button>
      </div>
    );
  }

  if (applyStep === 1 && selected) {
    const ch = selected.challenges[currentChallenge];
    return (
      <div style={{ padding: "2rem 2.5rem", maxWidth: 620 }}>
        <div style={s.eyebrow}><div style={{ width: 20, height: 1, background: G.muted }} />Défis · {selected.company}</div>
        <h2 style={{ fontFamily: font.serif, fontSize: 26, letterSpacing: -0.5, marginBottom: "2rem" }}>Défis du recruteur</h2>
        <div style={{ height: 2, background: G.paper3, borderRadius: 1, marginBottom: "2rem", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(currentChallenge / selected.challenges.length) * 100}%`, background: G.ink, transition: "width 0.4s" }} />
        </div>
        <div style={{ ...s.card, marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: G.muted, marginBottom: "1rem" }}>
            Question {currentChallenge + 1} / {selected.challenges.length}
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: "1.5rem" }}>{ch.question}</p>
          {ch.type === "text" ? (
            <textarea style={s.textarea} placeholder="Ta réponse..." value={answers[ch.id] || ""}
              onChange={e => setAnswers(p => ({ ...p, [ch.id]: e.target.value }))}
              onFocus={e => e.target.style.borderColor = G.ink}
              onBlur={e => e.target.style.borderColor = G.paper3} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ch.options.map(opt => (
                <button key={opt} onClick={() => setAnswers(p => ({ ...p, [ch.id]: opt }))} style={{
                  padding: "10px 16px", borderRadius: 2, cursor: "pointer", textAlign: "left",
                  border: `1px solid ${answers[ch.id] === opt ? G.ink : G.paper3}`,
                  background: answers[ch.id] === opt ? G.ink : "#fff",
                  color: answers[ch.id] === opt ? G.paper : G.ink,
                  fontSize: 14, fontFamily: font.sans, transition: "all 0.15s",
                }}>{opt}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {currentChallenge > 0 && <button style={s.btnGhost} onClick={() => setCurrentChallenge(p => p - 1)}>← Précédent</button>}
          {currentChallenge < selected.challenges.length - 1
            ? <button style={{ ...s.btnPrimary, flex: 1 }} onClick={() => setCurrentChallenge(p => p + 1)}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}>Suivant →</button>
            : <button style={{ ...s.btnPrimary, flex: 1 }} onClick={() => { setApplyStep(2); onApply(selected.id); }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}>Envoyer ma candidature →</button>
          }
        </div>
      </div>
    );
  }

  if (selected) return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 700 }}>
      <button style={{ ...s.btnGhost, marginBottom: "1.5rem", fontSize: 12 }} onClick={() => setSelected(null)}>← Retour aux offres</button>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
        <span style={s.tag}>{selected.sector}</span>
        <span style={s.tag}>{selected.location}</span>
        <span style={s.tag}>{selected.type}</span>
        {selected.remote && <span style={s.badge("green")}>Remote ✓</span>}
      </div>
      <h1 style={{ fontFamily: font.serif, fontSize: 32, letterSpacing: -1, marginBottom: 6 }}>{selected.role}</h1>
      <div style={{ fontSize: 14, color: G.muted, marginBottom: "2rem" }}>{selected.company} · {selected.recruiter}</div>
      <Divider />
      <p style={{ fontSize: 15, color: G.muted, lineHeight: 1.8, fontWeight: 300, marginBottom: "2rem" }}>{selected.description}</p>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: G.muted, marginBottom: 10 }}>Valeurs de l'équipe</div>
        <div style={{ display: "flex", gap: 8 }}>{selected.values.map(v => <span key={v} style={s.badge("gold")}>{v}</span>)}</div>
      </div>
      <div style={{ ...s.card, background: G.paper2, marginBottom: "2rem" }}>
        <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.7 }}>
          En postulant, tu passeras <strong style={{ color: G.ink }}>{selected.challenges.length} défis</strong> créés par {selected.recruiter}. L'IA combinera ensuite ton score LetMeWork ({user.globalScore || "—"}%) avec ce score pour calculer ton fit global.
        </div>
      </div>
      <button style={{ ...s.btnPrimary, padding: "13px 28px" }} onClick={() => setApplyStep(1)}
        onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
        onMouseLeave={e => e.currentTarget.style.opacity = 1}>
        Postuler et passer les défis →
      </button>
    </div>
  );

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 800 }}>
      <div style={s.eyebrow}><div style={{ width: 20, height: 1, background: G.muted }} />Offres disponibles</div>
      <h1 style={{ fontFamily: font.serif, fontSize: 32, letterSpacing: -1, marginBottom: "2rem" }}>Toutes les offres</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {jobs.map(job => (
          <div key={job.id} style={{ ...s.card, cursor: "pointer", transition: "border-color 0.2s, transform 0.15s" }}
            onClick={() => setSelected(job)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = G.ink; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = G.paper3; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: G.ink, marginBottom: 4 }}>{job.role}</div>
                <div style={{ fontSize: 13, color: G.muted }}>{job.company} · {job.location}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <span style={s.tag}>{job.sector}</span>
                  <span style={s.tag}>{job.type}</span>
                  {job.remote && <span style={s.badge("green")}>Remote</span>}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 4 }}>{job.challenges.length} défis</div>
                <div style={{ fontSize: 11, color: G.muted }}>{job.applications || 0} candidats</div>
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
    <div style={{ padding: "2rem 2.5rem", maxWidth: 600 }}>
      <div style={s.eyebrow}><div style={{ width: 20, height: 1, background: G.muted }} />Mon profil</div>
      <h1 style={{ fontFamily: font.serif, fontSize: 32, letterSpacing: -1, marginBottom: "2rem" }}>Tes informations</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[{ k: "name", label: "Nom complet" }].map(f => (
          <div key={f.k}>
            <label style={s.label}>{f.label}</label>
            <input style={s.input} value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
              onFocus={e => e.target.style.borderColor = G.ink} onBlur={e => e.target.style.borderColor = G.paper3} />
          </div>
        ))}
        <div>
          <label style={s.label}>Secteur visé</label>
          <select style={{ ...s.input, appearance: "none" }} value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={s.label}>Ma motivation</label>
          <textarea style={s.textarea} value={form.motivation} onChange={e => setForm(p => ({ ...p, motivation: e.target.value }))}
            onFocus={e => e.target.style.borderColor = G.ink} onBlur={e => e.target.style.borderColor = G.paper3} />
        </div>
        <button style={{ ...s.btnPrimary, padding: 12 }} onClick={save}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
          onMouseLeave={e => e.currentTarget.style.opacity = 1}>
          {saved ? "Sauvegardé ✓" : "Sauvegarder"}
        </button>
        {user.globalScore && (
          <>
            <Divider />
            <div style={s.cardDark}>
              <div style={{ fontSize: 13, color: "rgba(247,245,240,0.4)", marginBottom: 8 }}>Ton score LetMeWork</div>
              <div style={{ fontFamily: font.serif, fontSize: 48, letterSpacing: -2, color: G.paper, lineHeight: 1, marginBottom: "1rem" }}>{user.globalScore}%</div>
              <ScoreBar value={user.globalScore} color="rgba(247,245,240,0.6)" />
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
    <div style={{ padding: "2rem 2.5rem", maxWidth: 900 }}>
      <div style={s.eyebrow}><div style={{ width: 20, height: 1, background: G.muted }} />{user.company}</div>
      <h1 style={{ fontFamily: font.serif, fontSize: 32, letterSpacing: -1, marginBottom: "2rem" }}>Tableau de bord recruteur</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "2rem" }}>
        {[
          { label: "Offres actives", val: myJobs.length, sub: "en ligne" },
          { label: "Candidatures reçues", val: totalApps, sub: "au total" },
          { label: "Profils dans le vivier", val: 0, sub: "à contacter" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", border: `1px solid ${G.paper3}`, borderRadius: 4, padding: "1.25rem 1.5rem" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: G.muted, marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: font.serif, fontSize: 36, letterSpacing: -1, color: G.ink, lineHeight: 1 }}>{m.val}</div>
            <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: G.ink }}>Tes offres</h2>
        <button style={s.btnPrimary} onClick={() => onNavigate("nouvelle-offre")}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
          onMouseLeave={e => e.currentTarget.style.opacity = 1}>
          + Nouvelle offre
        </button>
      </div>

      {myJobs.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: "3rem", color: G.muted }}>
          <div style={{ fontFamily: font.serif, fontSize: 22, marginBottom: 8, color: G.ink }}>Aucune offre pour l'instant</div>
          <div style={{ fontSize: 14, marginBottom: "1.5rem" }}>Publie ta première offre et commence à recevoir des candidats qualifiés.</div>
          <button style={s.btnPrimary} onClick={() => onNavigate("nouvelle-offre")}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}>Créer une offre →</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {myJobs.map(job => (
            <div key={job.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: G.ink }}>{job.role}</div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{job.sector} · {job.location} · {job.challenges?.length || 0} défis</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={s.badge("green")}>{job.applications || 0} candidats</span>
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
    <div style={{ padding: "2rem 2.5rem", maxWidth: 600 }}>
      <h1 style={{ fontFamily: font.serif, fontSize: 32, letterSpacing: -1, marginBottom: "1rem" }}>Offre publiée ✓</h1>
      <div style={{ ...s.card, background: G.paper2, marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 14, color: G.muted, lineHeight: 1.7 }}>Ton offre est maintenant visible par les candidats. Tu recevras une notification dès qu'un candidat postule avec son score de fit.</div>
      </div>
      <button style={s.btnGhost} onClick={() => { setPublished(false); setStep(0); setForm({ role: "", sector: "", location: "", type: "CDI", remote: false, description: "", values: [] }); setChallenges([{ id: "c1", question: "", type: "text" }]); }}>
        Créer une autre offre
      </button>
    </div>
  );

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 680 }}>
      <div style={s.eyebrow}><div style={{ width: 20, height: 1, background: G.muted }} />Nouvelle offre</div>
      <h1 style={{ fontFamily: font.serif, fontSize: 28, letterSpacing: -0.5, marginBottom: "2rem" }}>
        {step === 0 ? "Décris le poste" : "Crée tes défis"}
      </h1>

      <div style={{ display: "flex", gap: 8, marginBottom: "2rem" }}>
        {["Infos du poste", "Tes défis"].map((l, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 1, background: i <= step ? G.ink : G.paper3, transition: "background 0.3s" }} />
        ))}
      </div>

      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={s.label}>Intitulé du poste *</label>
            <input style={s.input} placeholder="Ex: Chargé(e) de Marketing Digital" value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              onFocus={e => e.target.style.borderColor = G.ink} onBlur={e => e.target.style.borderColor = G.paper3} />
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
                onFocus={e => e.target.style.borderColor = G.ink} onBlur={e => e.target.style.borderColor = G.paper3} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Type de contrat</label>
              <select style={{ ...s.input, appearance: "none" }} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {["CDI", "CDD", "Stage", "Alternance", "Freelance"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
              <input type="checkbox" id="remote" checked={form.remote} onChange={e => setForm(p => ({ ...p, remote: e.target.checked }))} />
              <label htmlFor="remote" style={{ fontSize: 13, color: G.ink, cursor: "pointer" }}>Remote possible</label>
            </div>
          </div>
          <div>
            <label style={s.label}>Description du poste</label>
            <textarea style={s.textarea} placeholder="Ce qu'on cherche vraiment, au-delà du diplôme et de l'expérience..." value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              onFocus={e => e.target.style.borderColor = G.ink} onBlur={e => e.target.style.borderColor = G.paper3} />
          </div>
          <div>
            <label style={s.label}>Valeurs de l'équipe</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {valueOptions.map(v => (
                <button key={v} onClick={() => setForm(p => ({ ...p, values: p.values.includes(v) ? p.values.filter(x => x !== v) : [...p.values, v] }))} style={{
                  padding: "5px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: font.sans,
                  background: form.values.includes(v) ? G.ink : "#fff",
                  color: form.values.includes(v) ? G.paper : G.ink,
                  border: `1px solid ${form.values.includes(v) ? G.ink : G.paper3}`,
                  transition: "all 0.15s",
                }}>{v}</button>
              ))}
            </div>
          </div>
          <button style={{ ...s.btnPrimary, padding: 12 }} onClick={() => { if (form.role && form.sector) setStep(1); }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}>
            Continuer → Créer mes défis
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.7, marginBottom: "1.5rem", padding: "12px 16px", background: G.paper2, borderRadius: 2 }}>
            Crée des mises en situation spécifiques à ton poste. Ces défis seront complétés par les candidats en plus de leurs défis LetMeWork.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "1.5rem" }}>
            {challenges.map((c, i) => (
              <div key={c.id} style={{ ...s.card, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: G.muted, letterSpacing: "0.08em" }}>Défi {i + 1}</div>
                  {challenges.length > 1 && (
                    <button onClick={() => removeChallenge(i)} style={{ fontSize: 12, color: G.muted, background: "none", border: "none", cursor: "pointer" }}>Supprimer</button>
                  )}
                </div>
                <textarea style={{ ...s.textarea, minHeight: 80 }} placeholder="Quelle mise en situation veux-tu proposer ?"
                  value={c.question} onChange={e => updateChallenge(i, "question", e.target.value)}
                  onFocus={e => e.target.style.borderColor = G.ink} onBlur={e => e.target.style.borderColor = G.paper3} />
                <div style={{ marginTop: 8 }}>
                  <label style={s.label}>Type de réponse</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["text", "choice"].map(t => (
                      <button key={t} onClick={() => updateChallenge(i, "type", t)} style={{
                        padding: "5px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: font.sans,
                        background: c.type === t ? G.ink : "#fff",
                        color: c.type === t ? G.paper : G.ink,
                        border: `1px solid ${c.type === t ? G.ink : G.paper3}`,
                        transition: "all 0.15s",
                      }}>{t === "text" ? "Texte libre" : "Choix multiple"}</button>
                    ))}
                  </div>
                </div>
                {c.type === "choice" && (
                  <div style={{ marginTop: 10 }}>
                    <label style={s.label}>Options (séparées par une virgule)</label>
                    <input style={s.input} placeholder="Option A, Option B, Option C, Option D"
                      value={c.options?.join(", ") || ""}
                      onChange={e => updateChallenge(i, "options", e.target.value.split(",").map(x => x.trim()))}
                      onFocus={e => e.target.style.borderColor = G.ink} onBlur={e => e.target.style.borderColor = G.paper3} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={s.btnGhost} onClick={addChallenge}>+ Ajouter un défi</button>
            <button style={{ ...s.btnPrimary, flex: 1 }} onClick={publish}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}>
              Publier l'offre →
            </button>
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
    <div style={{ padding: "2rem 2.5rem", maxWidth: 800 }}>
      <div style={s.eyebrow}><div style={{ width: 20, height: 1, background: G.muted }} />Candidats</div>
      <h1 style={{ fontFamily: font.serif, fontSize: 32, letterSpacing: -1, marginBottom: "2rem" }}>Candidatures reçues</h1>

      {myJobs.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: "3rem", color: G.muted }}>
          <div style={{ fontFamily: font.serif, fontSize: 20, color: G.ink, marginBottom: 8 }}>Aucune candidature pour l'instant</div>
          <div style={{ fontSize: 14 }}>Publie une offre pour commencer à recevoir des candidats qualifiés.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mockCandidates.map((c, i) => (
            <div key={i} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: G.paper2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: G.muted, flexShrink: 0 }}>
                  {c.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: G.ink }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{c.job} · Score : {c.score}%</div>
                  <div style={{ marginTop: 8, width: 160 }}><ScoreBar value={c.score} color={c.score > 85 ? G.success : G.muted} /></div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={s.badge(c.status === "nouveau" ? "gold" : "green")}>{c.status === "nouveau" ? "Nouveau" : "En cours"}</span>
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
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [jobs, setJobs] = useState(DEFAULT_JOBS);

  function handleLogin(userData) {
    setUser(userData);
    setPage("dashboard");
  }

  function handleLogout() {
    setUser(null);
    setPage("dashboard");
  }

  function handleScoreUpdate(score, answers) {
    setUser(p => ({ ...p, globalScore: score, challengeAnswers: answers }));
  }

  function handleApply(jobId) {
    setUser(p => ({ ...p, applications: [...(p.applications || []), jobId] }));
    setJobs(p => p.map(j => j.id === jobId ? { ...j, applications: (j.applications || 0) + 1 } : j));
  }

  function handlePublish(job) {
    setJobs(p => [...p, job]);
    setPage("offres");
  }

  function handleProfileUpdate(data) {
    setUser(p => ({ ...p, ...data }));
  }

  if (!user) return <OnboardingScreen onComplete={handleLogin} />;

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
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: font.sans, background: G.paper }}>
      <Sidebar user={user} page={page} setPage={setPage} onLogout={handleLogout} />
      <main style={{ flex: 1, overflow: "auto" }}>
        {renderPage()}
      </main>
    </div>
  );
}
