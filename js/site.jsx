/* Public website for New Beginnings Animal Rescue.
   We connect dogs who need a foster or home with people who can help. */
const API = window.NB.api;

/* ---------------- routing (real URLs so search engines can index every page) ---------------- */
const BASE = (() => { const b = document.querySelector("base"); try { return b ? new URL(b.href).pathname : "/"; } catch (e) { return "/"; } })();
const PAGES = [
  { id: "home", path: "", label: "Home", icon: "House" },
  { id: "dogs", path: "dogs/", label: "Dogs Needing Help", icon: "Dog" },
  { id: "how", path: "how-it-works/", label: "How It Works", icon: "ListChecks" },
  { id: "help", path: "help/", label: "I Can Help", icon: "HeartHandshake" },
  { id: "list", path: "list-a-dog/", label: "List a Dog", icon: "Megaphone" },
  { id: "support", path: "support/", label: "Support", icon: "Gift" },
  { id: "about", path: "about/", label: "About & Contact", icon: "Mail" },
];
const NAV = ["dogs", "how", "list", "support", "about"];
const pathFor = (id, slug) => id === "profile" ? `${BASE}dogs/${slug}/` : BASE + (PAGES.find(p => p.id === id) || PAGES[0]).path;
function readRoute() {
  const h = (window.location.hash || "").replace("#", "");
  if (h.startsWith("dog-")) return { page: "profile", slug: h.slice(4) };
  let rel = window.location.pathname.startsWith(BASE) ? window.location.pathname.slice(BASE.length) : window.location.pathname.replace(/^\//, "");
  rel = rel.replace(/index\.html$/, "").replace(/^\/+/, "");
  const m = rel.match(/^dogs\/([a-z0-9-]+)\/?$/);
  if (m) return { page: "profile", slug: m[1] };
  const p = PAGES.find(x => x.path && (rel === x.path || rel + "/" === x.path));
  if (p) return { page: p.id, dog: new URLSearchParams(window.location.search).get("dog") || "" };
  if (PAGES.some(x => x.id === h)) return { page: h };
  return { page: "home" };
}
let navigateFn = () => {};
function Link({ to, slug, query = "", className = "", children, onNav, ...rest }) {
  const href = pathFor(to, slug) + query;
  return <a href={href} className={className} {...rest} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; e.preventDefault(); navigateFn(href); if (onNav) onNav(); }}>{children}</a>;
}

/* ---------------- SEO: per-page title, description, canonical, social tags, structured data ---------------- */
function setMeta({ s, title, description, path, image, ld }) {
  const site = s.siteUrl || (window.location.origin + BASE);
  const url = new URL(path.replace(BASE, ""), site).href;
  const img = new URL(image || "assets/logo.jpg", site).href;
  document.title = title;
  const set = (sel, attr, key, val) => { let el = document.head.querySelector(sel); if (!el) { el = document.createElement(attr === "link" ? "link" : "meta"); if (attr === "link") el.rel = key; else el.setAttribute(attr, key); document.head.appendChild(el); } el.setAttribute(attr === "link" ? "href" : "content", val); };
  set('meta[name="description"]', "name", "description", description);
  set('link[rel="canonical"]', "link", "canonical", url);
  set('meta[property="og:title"]', "property", "og:title", title);
  set('meta[property="og:description"]', "property", "og:description", description);
  set('meta[property="og:url"]', "property", "og:url", url);
  set('meta[property="og:image"]', "property", "og:image", img);
  set('meta[name="twitter:title"]', "name", "twitter:title", title);
  set('meta[name="twitter:description"]', "name", "twitter:description", description);
  set('meta[name="twitter:image"]', "name", "twitter:image", img);
  let el = document.getElementById("ld-page");
  if (ld) { if (!el) { el = document.createElement("script"); el.type = "application/ld+json"; el.id = "ld-page"; document.head.appendChild(el); } el.textContent = JSON.stringify(ld); }
  else if (el) el.remove();
}
const crumbs = (s, items) => ({ "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it[0], item: new URL(it[1], s.siteUrl || window.location.origin + BASE).href })) });
const dogSummary = (d) => `${d.name} is a ${d.age_label ? d.age_label.toLowerCase() + " " : ""}${d.breed || "dog"} in ${d.location || "the US"} who needs ${/^a|^e|^i|^o|^u/i.test(d.need || "foster") ? "an" : "a"} ${(d.need || "foster").toLowerCase()}. ${d.deadline ? d.deadline + ". " : ""}See how you can help.`;

/* ---------------- shared bits ---------------- */
function SectionTitle({ eyebrow, title, subtitle, center, as = "h2" }) {
  const H = as;
  return (
    <div className={`mb-8 ${center ? "text-center mx-auto max-w-2xl" : ""}`}>
      {eyebrow && <p className="text-sm font-bold uppercase tracking-widest text-terraText mb-2">{eyebrow}</p>}
      <H className="text-3xl md:text-4xl font-extrabold text-ink leading-tight">{title}</H>
      {subtitle && <p className="mt-3 text-muted text-lg">{subtitle}</p>}
    </div>
  );
}
const NEED_STYLE = (n) => /adopt/i.test(n || "") && !/foster/i.test(n || "") ? "bg-[#DCE9F7] text-[#1F4F80]" : "bg-[#E1F0E7] text-[#245A40]";
function NeedPill({ need }) { return <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${NEED_STYLE(need)}`}><Icon name="HandHeart" size={13} />Needs: {need || "Foster"}</span>; }

function Navbar({ page, s }) {
  const [open, setOpen] = useState(false);
  const active = page === "profile" ? "dogs" : page;
  return (
    <header className="sticky top-0 z-40 px-3 md:px-6 pt-3">
      <nav className="glass-strong rounded-2xl md:rounded-full max-w-6xl mx-auto pl-2 pr-3 md:pr-4 py-2 flex items-center justify-between gap-4" aria-label="Main">
        <Link to="home" className="flex items-center gap-3 font-extrabold text-ink min-w-0" onNav={() => setOpen(false)}>
          <Logo settings={s} size={48} /><span className="text-base md:text-lg leading-tight truncate">{s.name}</span>
        </Link>
        <ul className="hidden xl:flex items-center gap-1">
          {NAV.map(id => { const p = PAGES.find(x => x.id === id); return (
            <li key={id}><Link to={id} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active === id ? "bg-white/90 text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{p.label}</Link></li>); })}
        </ul>
        <div className="hidden xl:block"><Link to="help" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold bg-terra hover:bg-terraDark text-white text-sm min-h-[44px]">I Can Help</Link></div>
        <button className="xl:hidden w-11 h-11 rounded-full glass flex items-center justify-center shrink-0" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}><Icon name={open ? "X" : "Menu"} /></button>
      </nav>
      {open && (
        <div className="xl:hidden glass-strong rounded-2xl max-w-6xl mx-auto mt-2 p-3 fade-in">
          {PAGES.map(p => <Link key={p.id} to={p.id} onNav={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold ${active === p.id ? "bg-white/80 text-ink" : "text-muted"}`}><Icon name={p.icon} size={18} /> {p.label}</Link>)}
        </div>
      )}
    </header>
  );
}

function Notice({ s }) {
  const [hidden, setHidden] = useState(false);
  if (!s.noticeOn || !s.noticeText || hidden) return null;
  return (
    <div className="px-3 md:px-6 pt-3">
      <div className="max-w-6xl mx-auto rounded-2xl bg-sand/45 border border-white/60 backdrop-blur-md px-4 py-2 text-sm text-ink flex items-center gap-3">
        <Icon name="Info" size={16} className="shrink-0" /><span className="flex-1">{s.noticeText}</span>
        <button onClick={() => setHidden(true)} className="w-9 h-9 rounded-full hover:bg-white/60 flex items-center justify-center" aria-label="Dismiss notice"><Icon name="X" size={16} /></button>
      </div>
    </div>
  );
}

function Footer({ s }) {
  return (
    <footer className="px-4 md:px-6 pb-8 pt-16">
      <div className="glass rounded-3xl max-w-6xl mx-auto p-8 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 font-extrabold text-lg mb-3"><Logo settings={s} size={44} /> {s.name}</div>
          <p className="text-muted text-sm">We connect dogs who need a foster or a home with people who can help. Every dog links back to the rescue or shelter caring for them.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          {PAGES.map(p => <Link key={p.id} to={p.id} className="text-muted hover:text-ink font-semibold w-fit">{p.label}</Link>)}
        </nav>
        <div className="flex flex-col gap-3 text-sm">
          <span className="font-bold">Stay in touch</span>
          <span className="text-muted break-all">{s.email}</span>
          <div className="flex gap-2">{(s.socials || []).map(x => <a key={x.label} href={x.url} target="_blank" rel="noopener noreferrer" aria-label={x.label} className="w-11 h-11 rounded-full glass flex items-center justify-center hover:bg-white/80"><Icon name={socialIcon(x.label)} size={18} /></a>)}</div>
          <a href={BASE + "admin.html"} className="text-xs text-muted hover:text-ink w-fit mt-2" rel="nofollow">Staff login</a>
        </div>
      </div>
      <p className="text-center text-xs text-muted mt-6">© {new Date().getFullYear()} {s.name}. Dogs are shared with credit to the rescues and shelters caring for them.</p>
    </footer>
  );
}

function DogCard({ dog, headingLevel = "h3" }) {
  const H = headingLevel;
  return (
    <Link to="profile" slug={dog.slug} className="group text-left glass rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(43,41,39,0.10)] transition-all duration-300 flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <DogPhoto dog={dog} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {dog.status !== "Available" ? <StatusPill status={dog.status} /> : dog.urgent && <span className="rounded-full bg-terraText text-white text-xs font-bold px-3 py-1">Urgent</span>}
        </div>
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="flex items-baseline justify-between gap-2"><H className="text-xl font-extrabold">{dog.name}</H><span className="text-sm text-muted font-semibold">{dog.sex}</span></div>
        <p className="text-sm text-muted">{dog.breed}{dog.age_label ? ` · ${dog.age_label}` : ""}</p>
        <p className="text-sm font-semibold flex items-center gap-1"><Icon name="MapPin" size={15} className="text-terraText shrink-0" />{dog.location || "Location: ask the rescue"}</p>
        {dog.deadline && dog.status === "Available" && <p className="text-sm font-bold text-terraText flex items-center gap-1"><Icon name="Clock" size={15} className="shrink-0" />{dog.deadline}</p>}
        <div className="flex flex-wrap gap-2 mt-auto pt-2"><NeedPill need={dog.need} /></div>
        {dog.source_name && <p className="text-xs text-muted pt-1">Shared from {dog.source_name}</p>}
      </div>
    </Link>
  );
}

/* ---------------- pages ---------------- */
function HomePage({ s, dogs }) {
  const urgent = dogs.filter(d => d.status === "Available" && (d.featured || d.urgent)).slice(0, 6);
  const heroDog = urgent[0] || dogs[0];
  const steps = [
    { icon: "Search", title: "Browse dogs who need help", text: "Rescues and shelters post dogs who need a foster or home. We collect them here, with the details you need up front." },
    { icon: "HandHeart", title: "Say \"I can help\"", text: "Tell us whether you can foster, adopt, transport or pledge. It takes two minutes." },
    { icon: "Handshake", title: "We connect you", text: "We pass your details to the rescue caring for that dog. They screen, match and set everything up with you." },
  ];
  return (
    <div className="fade-in">
      <section className="px-4 md:px-6 pt-10 md:pt-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-bold text-terraText mb-6"><Icon name="Sparkles" size={16} /> {s.heroBadge}</span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] text-ink">{s.heroTitle}<span className="text-terraText">{s.heroAccent}</span></h1>
            <p className="mt-6 text-lg text-muted max-w-xl">{s.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="dogs" className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold bg-terra hover:bg-terraDark text-white min-h-[44px] shadow-[0_8px_24px_rgba(224,122,95,0.30)]"><Icon name="Dog" size={18} /> See dogs needing help</Link>
              <Link to="help" className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold glass hover:bg-white/80 min-h-[44px]"><Icon name="HandHeart" size={18} /> I can foster</Link>
            </div>
          </div>
          <div className="relative min-h-[360px] md:min-h-[440px]">
            <div className="glass rounded-[2rem] overflow-hidden absolute inset-0 md:inset-x-8">{heroDog ? <DogPhoto dog={heroDog} className="w-full h-full" /> : <img src={s.logoUrl} alt="" className="w-full h-full object-cover" />}</div>
            {(s.stats || []).slice(0, 3).map((x, i) => (
              <div key={x + i} className={`glass-strong rounded-2xl px-4 py-3 font-bold text-sm absolute float flex items-center gap-2 ${["top-6 -left-2", "top-1/2 -right-2", "bottom-6 left-6"][i]}`} style={{ animationDelay: `${i * 1.2}s` }}>
                <span className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-terraText"><Icon name={["BadgeCheck", "MapPinned", "HeartHandshake"][i]} size={16} /></span>{x}
              </div>
            ))}
          </div>
        </div>
      </section>

      {urgent.length > 0 && (
        <section className="px-4 md:px-6 pt-20" aria-labelledby="urgent-h">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="mb-8"><p className="text-sm font-bold uppercase tracking-widest text-terraText mb-2">Urgent right now</p><h2 id="urgent-h" className="text-3xl md:text-4xl font-extrabold">Dogs who need a foster this week</h2><p className="mt-3 text-muted text-lg">Fostering is free; the rescue covers food and vet care. Could one of them stay with you?</p></div>
              <Link to="dogs" className="mb-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold glass hover:bg-white/80 min-h-[44px]">See all dogs <Icon name="ArrowRight" size={18} /></Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{urgent.map(d => <DogCard key={d.id} dog={d} />)}</div>
          </div>
        </section>
      )}

      <section className="px-4 md:px-6 pt-20">
        <div className="max-w-6xl mx-auto">
          <SectionTitle eyebrow="How it works" title="We help the right people find each other in time" center />
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((x, i) => (
              <div key={x.title} className="glass rounded-3xl p-7">
                <div className="flex items-center justify-between mb-5"><span className="w-12 h-12 rounded-2xl bg-terra text-white flex items-center justify-center"><Icon name={x.icon} /></span><span className="text-5xl font-extrabold text-ink/10">0{i + 1}</span></div>
                <h3 className="text-xl font-extrabold mb-2">{x.title}</h3><p className="text-muted">{x.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 pt-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-5">
          <div className="glass-strong rounded-[2rem] p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-terraText mb-2">For fosters</p>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Can't adopt? Foster. It saves a life, too.</h2>
            <p className="text-muted mb-6">Every foster home means one more dog a rescue can say yes to. The rescue covers food, vet care and supplies; you give a dog a quiet room, a routine and a little patience. Even two weeks makes a difference.</p>
            <Link to="help" className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold bg-terra hover:bg-terraDark text-white min-h-[44px]"><Icon name="House" size={18} /> Offer to foster</Link>
          </div>
          <div className="glass rounded-[2rem] p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-terraText mb-2">For rescues & shelters</p>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Need fosters? Send us your dog.</h2>
            <p className="text-muted mb-6">Share a dog who needs a foster, adopter or pull. We'll post them with full credit to you and send every offer of help straight to you. It's free.</p>
            <Link to="list" className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold glass hover:bg-white/80 min-h-[44px]"><Icon name="Megaphone" size={18} /> List a dog</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return <button type="button" onClick={() => onChange(!checked)} aria-pressed={checked} className={`rounded-full px-4 py-2 text-sm font-semibold border transition min-h-[40px] ${checked ? "bg-sage text-white border-sage" : "bg-white/60 border-white/70 text-muted hover:text-ink"}`}>{checked && <span aria-hidden="true">✓ </span>}{label}</button>;
}
function SegGroup({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">{options.map(o => <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value} className={`rounded-full px-4 py-2 text-sm font-semibold transition min-h-[40px] ${value === o.value ? "bg-ink text-white" : "bg-white/60 border border-white/70 text-muted hover:text-ink"}`}>{o.label}</button>)}</div>
    </div>
  );
}
const EMPTY_COMPAT = { kids: false, dogs: false, cats: false, house_trained: false };
function DogsPage({ dogs }) {
  const [q, setQ] = useState(""); const [need, setNeed] = useState("All"); const [size, setSize] = useState("All"); const [age, setAge] = useState("All");
  const [showSafe, setShowSafe] = useState(false); const [compat, setCompat] = useState(EMPTY_COMPAT);
  const filtered = useMemo(() => dogs.filter(d => {
    if (!showSafe && d.status === "Adopted") return false;
    if (q && !(`${d.name} ${d.breed} ${d.location} ${d.source_name} ${(d.traits || []).join(" ")}`.toLowerCase().includes(q.toLowerCase()))) return false;
    if (need === "Foster" && !/foster/i.test(d.need || "")) return false;
    if (need === "Adopter" && !/adopt/i.test(d.need || "")) return false;
    if (size !== "All" && d.size !== size) return false;
    if (age !== "All" && d.age_group !== age) return false;
    for (const k of Object.keys(compat)) if (compat[k] && !d[k]) return false;
    return true;
  }), [dogs, q, need, size, age, compat, showSafe]);
  const reset = () => { setQ(""); setNeed("All"); setSize("All"); setAge("All"); setCompat(EMPTY_COMPAT); setShowSafe(false); };
  const all = (arr) => [{ value: "All", label: "All" }, ...arr.map(a => ({ value: a, label: a }))];
  return (
    <div className="px-4 md:px-6 pt-10 fade-in">
      <div className="max-w-6xl mx-auto">
        <SectionTitle as="h1" eyebrow="Dogs needing help" title="Dogs who need a foster or home" subtitle="Shared from rescues and shelters across the US. Search by city or state to find dogs near you." />
        <div className="glass rounded-3xl p-5 md:p-6 mb-8 flex flex-col gap-5">
          <label className="relative block"><span className="sr-only">Search dogs</span>
            <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by city, state, name, breed or rescue…" className="w-full rounded-full bg-white/75 border border-white/70 pl-11 pr-4 py-3 text-ink placeholder:text-muted/70" />
          </label>
          <div className="grid md:grid-cols-3 gap-5">
            <SegGroup label="They need" value={need} onChange={setNeed} options={all(["Foster", "Adopter"])} />
            <SegGroup label="Size" value={size} onChange={setSize} options={all(["Small", "Medium", "Large"])} />
            <SegGroup label="Age" value={age} onChange={setAge} options={all(["Puppy", "Young", "Adult", "Senior"])} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Known to be good with</span>
            <div className="flex flex-wrap gap-2 items-center">
              <Toggle label="Kids" checked={compat.kids} onChange={v => setCompat({ ...compat, kids: v })} />
              <Toggle label="Dogs" checked={compat.dogs} onChange={v => setCompat({ ...compat, dogs: v })} />
              <Toggle label="Cats" checked={compat.cats} onChange={v => setCompat({ ...compat, cats: v })} />
              <Toggle label="House-trained" checked={compat.house_trained} onChange={v => setCompat({ ...compat, house_trained: v })} />
              <Toggle label="Show dogs already safe" checked={showSafe} onChange={setShowSafe} />
              <button onClick={reset} className="ml-auto text-sm font-bold text-terraText hover:text-terraDark flex items-center gap-1 min-h-[40px] px-2"><Icon name="RotateCcw" size={15} /> Reset</button>
            </div>
          </div>
        </div>
        <p className="text-sm font-semibold text-muted mb-4" aria-live="polite">Showing {filtered.length} dog{filtered.length === 1 ? "" : "s"}</p>
        {filtered.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{filtered.map(d => <DogCard key={d.id} dog={d} headingLevel="h2" />)}</div> : (
          <div className="glass rounded-3xl p-10 text-center">
            <Icon name="SearchX" size={40} className="mx-auto text-muted mb-3" />
            <p className="font-bold text-lg">No dogs match those filters right now.</p>
            <p className="text-muted mb-5">Try a wider search, or tell us you can help and we'll reach out when a dog near you needs a foster.</p>
            <div className="flex justify-center gap-3"><Button onClick={reset}>Reset filters</Button><Link to="help" className="inline-flex items-center rounded-full px-5 py-2.5 font-bold glass min-h-[44px]">I can help</Link></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Check({ ok, label }) {
  return <div className="flex items-center gap-2 font-semibold"><span className={`w-7 h-7 rounded-full flex items-center justify-center ${ok ? "bg-sage text-white" : "bg-[#E7E2DC] text-muted"}`}><Icon name={ok ? "Check" : "Minus"} size={15} strokeWidth={3} /></span><span className={ok ? "text-ink" : "text-muted"}>{label}</span></div>;
}

function ProfilePage({ slug, dogs, toast }) {
  const dog = dogs.find(d => d.slug === slug);
  const [photo, setPhoto] = useState(0);
  useEffect(() => setPhoto(0), [slug]);
  if (!dog) return <div className="px-4 pt-16 text-center fade-in"><div className="glass rounded-3xl p-10 max-w-lg mx-auto"><h1 className="font-bold text-lg mb-4">We couldn't find that dog. They may already be safe!</h1><Link to="dogs" className="inline-flex rounded-full px-5 py-2.5 font-bold bg-terra text-white">See dogs who still need help</Link></div></div>;
  const n = (dog.photos || []).filter(Boolean).length;
  const thumbs = Array.from({ length: n ? n : 3 }, (_, i) => i);
  const share = () => copyText(window.location.origin + pathFor("profile", dog.slug), toast);
  const specs = [
    dog.age_label && { icon: "Cake", label: "Age", value: dog.age_label },
    { icon: "Ruler", label: "Size", value: `${dog.size}${dog.weight ? ` · ${dog.weight} lbs` : ""}` },
    dog.location && { icon: "MapPin", label: "Location", value: dog.location },
    dog.shelter_id && { icon: "Hash", label: "Shelter ID", value: dog.shelter_id },
  ].filter(Boolean);
  const known = [dog.kids && "Kids", dog.dogs && "Dogs", dog.cats && "Cats", dog.house_trained && "House-trained"].filter(Boolean);
  return (
    <article className="px-4 md:px-6 pt-8 fade-in">
      <div className="max-w-6xl mx-auto">
        <nav aria-label="Breadcrumb" className="text-sm font-semibold text-muted mb-6 flex items-center gap-2"><Link to="home" className="hover:text-ink">Home</Link><Icon name="ChevronRight" size={14} /><Link to="dogs" className="hover:text-ink">Dogs needing help</Link><Icon name="ChevronRight" size={14} /><span className="text-ink">{dog.name}</span></nav>
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8">
          <div>
            <div className="glass rounded-[2rem] overflow-hidden relative aspect-[4/3]">
              <DogPhoto dog={dog} index={photo} className="w-full h-full" />
              <div className="absolute top-4 left-4">{dog.status !== "Available" ? <StatusPill status={dog.status} /> : dog.urgent && <span className="rounded-full bg-terraText text-white text-xs font-bold px-3 py-1">Urgent</span>}</div>
              <button onClick={share} className="absolute top-4 right-4 glass-strong rounded-full px-4 py-2 font-bold text-sm flex items-center gap-2 min-h-[44px]"><Icon name="Share2" size={16} /> Share</button>
            </div>
            {thumbs.length > 1 && <div className="flex gap-3 mt-4 overflow-x-auto pb-1">{thumbs.map(i => <button key={i} onClick={() => setPhoto(i)} aria-label={`Show photo ${i + 1}`} aria-pressed={photo === i} className={`w-24 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition ${photo === i ? "border-terra" : "border-white/60 opacity-70 hover:opacity-100"}`}><DogPhoto dog={dog} index={i} className="w-full h-full" /></button>)}</div>}
            {!n && dog.source_url && <p className="text-sm text-muted mt-3">Photos and videos of {dog.name} are on <a href={dog.source_url} target="_blank" rel="noopener nofollow" className="font-bold underline">{dog.source_name}'s page</a>.</p>}
          </div>
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold">{dog.name}</h1>
              <p className="text-lg text-muted mt-1">{dog.breed} · {dog.sex}</p>
              <div className="flex flex-wrap gap-2 mt-4"><NeedPill need={dog.need} />{(dog.traits || []).map(t => <Tag key={t}>{t}</Tag>)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {specs.map(x => <div key={x.label} className="glass rounded-2xl p-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-1"><Icon name={x.icon} size={14} className="text-terraText" />{x.label}</div><div className="font-bold">{x.value}</div></div>)}
              <div className="glass rounded-2xl p-4 col-span-2"><div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Known to be good with</div>
                {known.length ? <div className="flex flex-wrap gap-x-6 gap-y-3">{known.map(k => <Check key={k} ok label={k} />)}</div> : <p className="text-sm text-muted">Not listed yet. Ask the rescue.</p>}</div>
            </div>
            <div className="glass-strong rounded-2xl p-5 lg:sticky lg:top-28 flex flex-col gap-3">
              {dog.status === "Available" ? <>
                {dog.deadline && <p className="font-bold text-terraText flex items-center gap-2"><Icon name="Clock" size={18} /> {dog.deadline}</p>}
                <Link to="help" query={`?dog=${dog.slug}`} className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-bold bg-terra hover:bg-terraDark text-white text-lg min-h-[44px]"><Icon name="HandHeart" size={18} /> I can help {dog.name}</Link>
                {dog.source_url && <a href={dog.source_url} target="_blank" rel="noopener nofollow" className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-bold glass hover:bg-white/80 min-h-[44px]"><Icon name="ExternalLink" size={16} /> Contact {dog.source_name}</a>}
                {dog.contact && <p className="text-sm text-muted">{dog.contact}</p>}
              </> : <p className="font-bold flex items-center gap-2"><Icon name="PartyPopper" size={18} className="text-sage" /> {dog.status === "Adopted" ? `${dog.name} is safe! Thank you for sharing.` : `Help is on the way for ${dog.name}.`}</p>}
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {[{ t: `About ${dog.name}`, i: "Smile", b: dog.bio }, { t: "A day in the life", i: "Sun", b: dog.routine }, { t: "The right home", i: "House", b: dog.ideal_home }].filter(c => c.b).map(c => (
            <section key={c.t} className="glass rounded-3xl p-6"><h2 className="text-lg font-extrabold mb-3 flex items-center gap-2"><Icon name={c.i} size={20} className="text-terraText" />{c.t}</h2><p className="text-muted leading-relaxed whitespace-pre-line">{c.b}</p></section>
          ))}
        </div>
        {dog.source_name && <p className="text-sm text-muted mt-6 flex items-start gap-2"><Icon name="Info" size={16} className="shrink-0 mt-0.5" /><span>Shared from a public post by <a href={dog.source_url} target="_blank" rel="noopener nofollow" className="font-bold underline">{dog.source_name}</a>{dog.posted_on ? ` on ${new Date(dog.posted_on + "T12:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}` : ""}. Situations change quickly, so please confirm details with them. Rescue staff can <Link to="about" className="underline">ask us to update or remove this listing</Link>.</span></p>}
      </div>
    </article>
  );
}

const FAQ = [
  ["How does fostering a dog work?", "You give a dog a temporary home while the rescue looks for an adopter. The rescue usually covers food, vet care and supplies, and stays in touch the whole time. You provide a safe space, a routine, and photos or updates so the dog gets noticed."],
  ["Does it cost anything to use New Beginnings?", "No. It's free for fosters, adopters and rescues. If you adopt, the rescue may charge its own adoption fee, which goes toward the dog's care."],
  ["How long would I foster a dog?", "It depends on the dog and the rescue. Some need a short-term foster for a couple of weeks; others stay until they're adopted. Tell us what works for you when you offer to help."],
  ["Can I foster if I rent or have other pets?", "Often, yes. Many rescues work with renters (with landlord approval) and homes with pets. Mention it in your offer so we can match you with dogs who fit your home."],
  ["Who decides if I can foster or adopt?", "The rescue or shelter caring for the dog. We pass your details along; they handle screening, meet-and-greets and paperwork."],
  ["I'm with a rescue. How do I list a dog?", "Use the List a Dog form. We'll share your dog with full credit and a link back to you, and send every offer of help straight to your team."],
];

function HowPage({ s }) {
  const steps = [
    { icon: "Megaphone", title: "Rescues share dogs", text: "Rescues, shelters and volunteers post dogs who need a foster, adopter or pull. We feature them here, credited and linked back." },
    { icon: "HandHeart", title: "You offer to help", text: "Pick a dog (or don't) and tell us how you can help: foster, adopt, transport, or pledge." },
    { icon: "Send", title: "We make the introduction", text: "Within a day, we send your details to the rescue caring for that dog and let you know who to expect." },
    { icon: "House", title: "The rescue takes it from there", text: "They'll talk with you, do their screening, and set up a meet-and-greet and paperwork." },
  ];
  return (
    <div className="px-4 md:px-6 pt-10 fade-in">
      <div className="max-w-6xl mx-auto">
        <SectionTitle as="h1" eyebrow="How it works" title="How we connect dogs with fosters and families" subtitle="A simple, free bridge between people who want to help and the rescues who need them." />
        <ol className="grid md:grid-cols-4 gap-5">
          {steps.map((x, i) => <li key={x.title} className="glass rounded-3xl p-6"><div className="flex items-center gap-3 mb-4"><span className="w-10 h-10 rounded-full bg-ink text-white font-extrabold flex items-center justify-center">{i + 1}</span><Icon name={x.icon} className="text-terraText" /></div><h2 className="font-extrabold text-lg mb-2">{x.title}</h2><p className="text-muted text-sm leading-relaxed">{x.text}</p></li>)}
        </ol>
        <div className="mt-16 glass-strong rounded-3xl p-7 md:p-10 grid md:grid-cols-[auto_1fr] gap-6 items-start">
          <span className="w-14 h-14 rounded-2xl bg-sage text-white flex items-center justify-center"><Icon name="ShieldCheck" size={28} /></span>
          <div>
            <h2 className="text-2xl font-extrabold mb-3">What we are, and what we're not</h2>
            <p className="text-muted leading-relaxed mb-3">{s.privateNotice}</p>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm font-semibold">{(s.privatePoints || []).map(x => <li key={x} className="flex items-center gap-2"><Icon name="Check" size={16} className="text-sage" strokeWidth={3} />{x}</li>)}</ul>
          </div>
        </div>
        <section className="mt-16" aria-labelledby="faq-h">
          <h2 id="faq-h" className="text-3xl font-extrabold mb-6">Questions people ask</h2>
          <div className="flex flex-col gap-3">{FAQ.map(([q, a]) => <details key={q} className="glass rounded-2xl p-5 group"><summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between gap-4">{q}<Icon name="ChevronDown" size={20} className="shrink-0 transition group-open:rotate-180" /></summary><p className="text-muted mt-3 leading-relaxed">{a}</p></details>)}</div>
        </section>
        <div className="text-center mt-10 flex flex-wrap justify-center gap-3">
          <Link to="dogs" className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold bg-terra hover:bg-terraDark text-white min-h-[44px]">See dogs needing help <Icon name="ArrowRight" size={18} /></Link>
          <Link to="list" className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold glass min-h-[44px]">I'm with a rescue</Link>
        </div>
      </div>
    </div>
  );
}

function FormSection({ icon, title, children }) {
  return <fieldset className="glass rounded-3xl p-6 md:p-8"><legend className="sr-only">{title}</legend><h2 className="text-xl font-extrabold mb-5 flex items-center gap-2"><span className="w-9 h-9 rounded-xl bg-terra text-white flex items-center justify-center"><Icon name={icon} size={18} /></span>{title}</h2><div className="grid md:grid-cols-2 gap-4">{children}</div></fieldset>;
}
const HELP_TYPES = ["Foster", "Short-term foster", "Adopt", "Transport", "Pledge / donate"];
const EMPTY_HELP = { dog: "", helpTypes: ["Foster"], name: "", email: "", phone: "", cityState: "", housing: "Own", pets: "", kids: "", experience: "", availability: "", message: "", consent: false };

function HelpPage({ preselect, dogs, s }) {
  const open = dogs.filter(d => d.status === "Available");
  const pre = open.find(d => d.slug === preselect);
  const [f, setF] = useState({ ...EMPTY_HELP, dog: pre ? pre.id : "" });
  const [done, setDone] = useState(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const toggleType = (t) => setF({ ...f, helpTypes: f.helpTypes.includes(t) ? f.helpTypes.filter(x => x !== t) : [...f.helpTypes, t] });
  const chosen = dogs.find(d => d.id === f.dog);
  const submit = async (e) => {
    e.preventDefault();
    if (!f.helpTypes.length) { setError("Pick at least one way you can help."); return; }
    if (!f.consent) { setError("Please agree that we can share your details with the rescue."); return; }
    setError(""); setBusy(true);
    try {
      const { name, email, phone, dog, consent, helpTypes, ...rest } = f;
      await API.submit("applications", { dog_id: chosen && !String(chosen.id).startsWith("demo-") ? chosen.id : null, dog_name: chosen ? chosen.name : "Any dog", name, email, phone, notes: "",
        data: { ...rest, helpTypes: helpTypes.join(", "), rescue: chosen ? chosen.source_name : "", rescueLink: chosen ? chosen.source_url : "", consentToShare: consent } });
      setDone({ ...f }); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { setError("Sorry, something went wrong. Please try again or email us at " + s.email + "."); }
    setBusy(false);
  };
  if (done) return (
    <div className="px-4 md:px-6 pt-10 fade-in">
      <div className="max-w-2xl mx-auto glass-strong rounded-[2rem] p-8 md:p-10 text-center">
        {chosen && <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white/80"><DogPhoto dog={chosen} className="w-full h-full" /></div>}
        <span className="inline-flex w-14 h-14 rounded-full bg-sage text-white items-center justify-center mb-4"><Icon name="PartyPopper" size={28} /></span>
        <h1 className="text-3xl md:text-4xl font-extrabold">Thank you, {done.name.split(" ")[0] || "friend"}!</h1>
        <p className="text-muted mt-3">{chosen ? `We'll pass your offer to ${chosen.source_name || "the rescue"} for ${chosen.name}.` : "We'll match you with a dog near you who needs your kind of help."} Expect to hear from us or the rescue within a day or two.</p>
        {chosen && chosen.source_url && <p className="mt-4"><a href={chosen.source_url} target="_blank" rel="noopener nofollow" className="font-bold underline">Can't wait? Message {chosen.source_name} directly</a></p>}
        {window.NB.mode === "demo" && <p className="text-xs text-muted mt-6">Demo mode: saved in this browser only until the database is connected.</p>}
        <div className="flex flex-wrap justify-center gap-3 mt-6"><Link to="dogs" className="inline-flex rounded-full px-5 py-2.5 font-bold bg-terra text-white min-h-[44px] items-center">See more dogs</Link><Button variant="glass" onClick={() => { setDone(null); setF({ ...EMPTY_HELP }); }}>Help another dog</Button></div>
      </div>
    </div>
  );
  return (
    <div className="px-4 md:px-6 pt-10 fade-in">
      <div className="max-w-4xl mx-auto">
        <SectionTitle as="h1" eyebrow="I can help" title="Offer to foster, adopt or help a dog" subtitle="Takes about two minutes. We'll introduce you to the rescue caring for the dog." />
        <form onSubmit={submit} className="flex flex-col gap-6">
          <div className="glass-strong rounded-3xl p-6 md:p-8 flex flex-col gap-5">
            <div className="flex flex-col md:flex-row gap-5 md:items-center">
              <div className="flex-1"><Field label="Which dog would you like to help?">
                <select value={f.dog} onChange={set("dog")} className={inputCls}><option value="">Any dog near me who needs help</option>{open.map(d => <option key={d.id} value={d.id}>{d.name} — {d.location || d.breed}</option>)}</select>
              </Field></div>
              {chosen && <div className="flex items-center gap-3 glass rounded-2xl p-2 pr-4"><div className="w-16 h-16 rounded-xl overflow-hidden"><DogPhoto dog={chosen} className="w-full h-full" /></div><span className="font-bold">{chosen.name}<br /><span className="text-xs font-semibold text-muted">{chosen.source_name}</span></span></div>}
            </div>
            <div><span className="text-sm font-bold block mb-2">How can you help?</span><div className="flex flex-wrap gap-2">{HELP_TYPES.map(t => <Toggle key={t} label={t} checked={f.helpTypes.includes(t)} onChange={() => toggleType(t)} />)}</div></div>
          </div>
          <FormSection icon="User" title="About you">
            <Field label="Full name"><input required value={f.name} onChange={set("name")} className={inputCls} autoComplete="name" /></Field>
            <Field label="Email"><input required type="email" value={f.email} onChange={set("email")} className={inputCls} autoComplete="email" /></Field>
            <Field label="Phone"><input required type="tel" value={f.phone} onChange={set("phone")} className={inputCls} autoComplete="tel" /></Field>
            <Field label="City / State"><input required value={f.cityState} onChange={set("cityState")} className={inputCls} placeholder="e.g. Dallas, TX" autoComplete="address-level2" /></Field>
          </FormSection>
          <FormSection icon="House" title="Your home">
            <Field label="Do you own or rent?"><div className="flex gap-2">{["Own", "Rent"].map(o => <button key={o} type="button" onClick={() => setF({ ...f, housing: o })} aria-pressed={f.housing === o} className={`flex-1 rounded-xl py-3 font-bold min-h-[44px] ${f.housing === o ? "bg-ink text-white" : "bg-white/70 border border-[#E9E2D9] text-muted"}`}>{o}</button>)}</div></Field>
            <Field label="Kids at home (ages)"><input value={f.kids} onChange={set("kids")} className={inputCls} placeholder="e.g. none, or 2 (ages 6 and 9)" /></Field>
            <Field label="Other pets" full><input value={f.pets} onChange={set("pets")} className={inputCls} placeholder="e.g. 1 dog (neutered, friendly), 1 cat" /></Field>
            <Field label="Experience with dogs" full><textarea rows="2" value={f.experience} onChange={set("experience")} className={inputCls} placeholder="Past dogs, fostering, training…" /></Field>
            <Field label="When could you start, and for how long?" full><input value={f.availability} onChange={set("availability")} className={inputCls} placeholder="e.g. this weekend, for 2–4 weeks" /></Field>
            <Field label="Anything else?" full><textarea rows="3" value={f.message} onChange={set("message")} className={inputCls} /></Field>
            <label className="md:col-span-2 flex items-start gap-3 glass rounded-2xl p-4 cursor-pointer"><input type="checkbox" checked={f.consent} onChange={set("consent")} className="mt-1 w-5 h-5 accent-[#E07A5F]" /><span className="text-sm">I agree that {s.shortName || s.name} can share my details with the rescue or shelter caring for {chosen ? chosen.name : "the dog"} so they can contact me.</span></label>
          </FormSection>
          {error && <p className="rounded-2xl bg-terra/15 border border-terra/30 px-4 py-3 font-semibold text-[#A64B33]" role="alert">{error}</p>}
          <div className="flex justify-end"><Button type="submit" disabled={busy} className="text-lg px-8 py-3"><Icon name="Send" size={18} /> {busy ? "Sending…" : "Send my offer"}</Button></div>
        </form>
      </div>
    </div>
  );
}

const EMPTY_LIST = { org: "", contactName: "", email: "", phone: "", dogName: "", location: "", need: "Foster", deadline: "", postLink: "", details: "", permission: false };
function ListPage({ s }) {
  const [f, setF] = useState(EMPTY_LIST); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const submit = async (e) => {
    e.preventDefault(); if (!f.permission) { setErr("Please confirm you're allowed to share this dog."); return; }
    setBusy(true); setErr("");
    const message = [`Rescue / group: ${f.org}`, `Contact: ${f.contactName} · ${f.phone}`, `Dog: ${f.dogName}`, `Location: ${f.location}`, `Needs: ${f.need}`, `Deadline: ${f.deadline || "—"}`, `Post / photos: ${f.postLink || "—"}`, "", f.details].join("\n");
    try { await API.submit("messages", { name: f.contactName || f.org, email: f.email, topic: "Dog listing request", message }); setDone(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
    catch (x) { setErr("Sorry, that didn't go through. Please email us at " + s.email + "."); }
    setBusy(false);
  };
  if (done) return <div className="px-4 pt-10 fade-in"><div className="max-w-xl mx-auto glass-strong rounded-[2rem] p-10 text-center"><span className="inline-flex w-14 h-14 rounded-full bg-sage text-white items-center justify-center mb-4"><Icon name="MailCheck" size={28} /></span><h1 className="text-3xl font-extrabold">Got it, thank you!</h1><p className="text-muted mt-3">We'll post {f.dogName || "your dog"} shortly and send every offer of help straight to you.</p><Button variant="glass" className="mt-6" onClick={() => { setDone(false); setF(EMPTY_LIST); }}>List another dog</Button></div></div>;
  return (
    <div className="px-4 md:px-6 pt-10 fade-in">
      <div className="max-w-4xl mx-auto">
        <SectionTitle as="h1" eyebrow="For rescues, shelters & volunteers" title="List a dog who needs a foster" subtitle="Free. We credit and link back to you, and every offer of help comes straight to your team." />
        <form onSubmit={submit} className="flex flex-col gap-6">
          <FormSection icon="Building2" title="About you">
            <Field label="Rescue, shelter or group name"><input required value={f.org} onChange={set("org")} className={inputCls} /></Field>
            <Field label="Your name"><input required value={f.contactName} onChange={set("contactName")} className={inputCls} autoComplete="name" /></Field>
            <Field label="Email for offers of help"><input required type="email" value={f.email} onChange={set("email")} className={inputCls} autoComplete="email" /></Field>
            <Field label="Phone (optional)"><input type="tel" value={f.phone} onChange={set("phone")} className={inputCls} autoComplete="tel" /></Field>
          </FormSection>
          <FormSection icon="Dog" title="About the dog">
            <Field label="Dog's name"><input required value={f.dogName} onChange={set("dogName")} className={inputCls} /></Field>
            <Field label="City / State"><input required value={f.location} onChange={set("location")} className={inputCls} /></Field>
            <Field label="What do they need?"><select value={f.need} onChange={set("need")} className={inputCls}>{["Foster", "Short-term foster", "Adopter", "Foster or adopter", "Rescue pull", "Transport"].map(o => <option key={o}>{o}</option>)}</select></Field>
            <Field label="Deadline (if any)"><input value={f.deadline} onChange={set("deadline")} className={inputCls} placeholder="e.g. euthanasia list 11/20" /></Field>
            <Field label="Link to your post or photos" full><input type="url" value={f.postLink} onChange={set("postLink")} className={inputCls} placeholder="https://facebook.com/…" /></Field>
            <Field label="Tell us about them" full><textarea required rows="5" value={f.details} onChange={set("details")} className={inputCls} placeholder="Age, size, personality, good with kids/dogs/cats, medical needs…" /></Field>
            <label className="md:col-span-2 flex items-start gap-3 glass rounded-2xl p-4 cursor-pointer"><input type="checkbox" checked={f.permission} onChange={set("permission")} className="mt-1 w-5 h-5 accent-[#E07A5F]" /><span className="text-sm">I'm part of the group caring for this dog (or have their permission), and {s.shortName || s.name} may share this dog with credit to us.</span></label>
          </FormSection>
          {err && <p className="rounded-2xl bg-terra/15 border border-terra/30 px-4 py-3 font-semibold text-[#A64B33]" role="alert">{err}</p>}
          <div className="flex justify-end"><Button type="submit" disabled={busy} className="text-lg px-8 py-3"><Icon name="Send" size={18} /> {busy ? "Sending…" : "Submit dog"}</Button></div>
        </form>
      </div>
    </div>
  );
}

function SupportPage({ toast, s }) {
  const tiers = s.sponsorTiers || [];
  const [tier, setTier] = useState(tiers[1] ? tiers[1].amount : (tiers[0] || {}).amount);
  return (
    <div className="px-4 md:px-6 pt-10 fade-in">
      <div className="max-w-6xl mx-auto">
        <SectionTitle as="h1" eyebrow="Support" title="Help more dogs get seen in time" subtitle="Sharing is free and powerful. Supplies and small donations help new fosters say yes." />
        <div className="rounded-3xl bg-sand/45 border border-white/60 backdrop-blur-xl p-5 md:p-6 mb-10 flex gap-4 items-start"><Icon name="Info" size={24} className="shrink-0 text-[#8A6420]" /><p className="font-semibold">{s.donationDisclaimer}</p></div>
        {(s.wishlists || []).length > 0 && <><h2 className="text-2xl font-extrabold mb-5">Foster supply wishlists</h2>
          <div className="grid md:grid-cols-2 gap-5 mb-6">{s.wishlists.map(w => (
            <div key={w.label} className="glass rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3"><span className="w-12 h-12 rounded-2xl bg-terra text-white flex items-center justify-center"><Icon name="ShoppingBag" /></span><h3 className="text-xl font-extrabold">{w.label}</h3></div>
              <p className="text-muted">{w.desc}</p>
              <div className="flex flex-wrap gap-2 mt-auto"><a href={w.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold bg-terra hover:bg-terraDark text-white min-h-[44px]">Open list <Icon name="ExternalLink" size={16} /></a><Button variant="glass" onClick={() => copyText(w.url, toast)}><Icon name="Copy" size={16} /> Copy link</Button></div>
            </div>))}</div></>}
        {(s.needs || []).length > 0 && <><h3 className="font-extrabold text-lg mb-3">What new fosters need most</h3>
          <div className="grid md:grid-cols-3 gap-5 mb-14">{s.needs.map(n => <div key={n.title} className="glass rounded-3xl p-5 flex gap-4 items-start"><span className="w-11 h-11 rounded-xl bg-sand/70 flex items-center justify-center shrink-0"><Icon name="PackageOpen" size={20} /></span><div><p className="font-bold">{n.title}</p><p className="text-sm text-muted">{n.text}</p></div></div>)}</div></>}
        {tiers.length > 0 && <><h2 className="text-2xl font-extrabold mb-5">Chip in</h2>
          <div className="glass-strong rounded-3xl p-6 md:p-8 mb-10">
            <div className="grid sm:grid-cols-3 gap-3 mb-5">{tiers.map((t, i) => <button key={i} onClick={() => setTier(t.amount)} aria-pressed={tier === t.amount} className={`rounded-2xl p-5 text-left border-2 transition ${tier === t.amount ? "border-terra bg-white/80" : "border-white/60 bg-white/40 hover:bg-white/60"}`}><Icon name={["Megaphone", "Package", "Truck"][i % 3]} className="text-terraText mb-2" /><div className="text-3xl font-extrabold">${t.amount}</div><div className="text-sm text-muted font-semibold">{t.label}</div></button>)}</div>
            <p className="glass rounded-2xl px-5 py-4 font-semibold">Send <span className="text-terraText">${tier}</span> with any method below. Add a note if you'd like it to go to a specific dog.</p>
          </div></>}
        <div className="grid md:grid-cols-3 gap-5">{(s.payments || []).map(p => (
          <div key={p.label} className="glass rounded-3xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3"><span className="w-11 h-11 rounded-xl bg-sage text-white flex items-center justify-center"><Icon name={payIcon(p.label)} size={20} /></span><h3 className="text-lg font-extrabold">{p.label}</h3></div>
            <p className="font-mono text-sm bg-white/70 rounded-xl px-3 py-2 break-all">{p.handle}</p><p className="text-xs text-muted">{p.note}</p>
            <Button variant="glass" onClick={() => copyText(p.handle, toast)} className="mt-auto"><Icon name="Copy" size={16} /> Copy {p.label} handle</Button>
          </div>))}</div>
      </div>
    </div>
  );
}

function AboutPage({ toast, s, tails }) {
  const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const [c, setC] = useState({ name: "", email: "", topic: "Becoming a foster", message: "" });
  const submit = async (e) => { e.preventDefault(); setBusy(true); setErr(""); try { await API.submit("messages", { ...c }); setSent(true); } catch (x) { setErr("Sorry, your message couldn't be sent. Please email us at " + s.email + "."); } setBusy(false); };
  return (
    <div className="px-4 md:px-6 pt-10 fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-start mb-16">
          <div><SectionTitle as="h1" eyebrow="Our story" title="Why New Beginnings exists" /><div className="flex flex-col gap-4 text-muted text-lg leading-relaxed">{(s.story || []).map((p, i) => <p key={i}>{p}</p>)}</div></div>
          <div className="glass rounded-[2rem] p-6 flex flex-col items-center text-center gap-4">
            <Logo settings={s} size={160} className="border-4" /><p className="text-2xl font-extrabold">{s.name}</p>
            <div className="grid grid-cols-2 gap-3 w-full">{[["Megaphone", "Dogs stay visible", "Not buried in a feed"], ["Handshake", "Direct intros", "You talk to the rescue"], ["BadgeCheck", "Always credited", "Every dog links back"], ["HeartHandshake", "Free", "For everyone, always"]].map(([i, t, x]) => <div key={t} className="bg-white/60 rounded-2xl p-4 text-left"><Icon name={i} className="text-terraText mb-2" /><p className="font-extrabold">{t}</p><p className="text-sm text-muted">{x}</p></div>)}</div>
          </div>
        </div>
        {tails.length > 0 && <><SectionTitle eyebrow="Happy tails" title="Dogs who found their people" />
          <div className="grid md:grid-cols-3 gap-5 mb-16">{tails.map(t => <figure key={t.id} className="glass rounded-3xl overflow-hidden"><div className="aspect-[4/3]">{t.photo ? <img src={t.photo} alt={`Photo of ${t.name}`} className="w-full h-full object-cover" loading="lazy" /> : <DogArt dog={{ name: t.name, slug: t.id }} className="w-full h-full" />}</div><figcaption className="p-5"><p className="font-extrabold text-lg">{t.name}</p>{t.quote && <blockquote className="text-muted italic mt-1">"{t.quote}"</blockquote>}{t.adopter && <p className="text-sm font-semibold mt-2">— {t.adopter}</p>}</figcaption></figure>)}</div></>}
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8">
          <div className="flex flex-col gap-5">
            <SectionTitle eyebrow="Contact" title="Say hello" subtitle="Questions about fostering, a dog you saw here, or a listing you'd like updated or removed — we read everything." />
            <div className="glass-strong rounded-3xl p-6"><p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Email</p><div className="flex flex-wrap items-center gap-3"><span className="font-bold text-lg break-all">{s.email}</span><Button variant="glass" onClick={() => copyText(s.email, toast)}><Icon name="Copy" size={16} /> Copy email</Button></div></div>
            <div className="flex flex-wrap gap-3">{(s.socials || []).map(x => <a key={x.label} href={x.url} target="_blank" rel="noopener noreferrer" className="glass rounded-full px-4 py-3 font-semibold flex items-center gap-2 hover:bg-white/80 min-h-[44px]"><Icon name={socialIcon(x.label)} size={18} />{x.label}</a>)}</div>
          </div>
          <div className="glass rounded-3xl p-6 md:p-8">
            {sent ? <div className="text-center py-10 fade-in"><span className="inline-flex w-14 h-14 rounded-full bg-sage text-white items-center justify-center mb-4"><Icon name="MailCheck" size={28} /></span><h3 className="text-2xl font-extrabold">Thanks, {c.name.split(" ")[0] || "friend"}!</h3><p className="text-muted mt-2">We'll reply to {c.email} soon.</p><Button variant="glass" className="mt-6" onClick={() => { setSent(false); setC({ name: "", email: "", topic: "Becoming a foster", message: "" }); }}>Send another message</Button></div> : (
              <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
                <Field label="Name"><input required value={c.name} onChange={e => setC({ ...c, name: e.target.value })} className={inputCls} autoComplete="name" /></Field>
                <Field label="Email"><input required type="email" value={c.email} onChange={e => setC({ ...c, email: e.target.value })} className={inputCls} autoComplete="email" /></Field>
                <Field label="Topic" full><select value={c.topic} onChange={e => setC({ ...c, topic: e.target.value })} className={inputCls}>{["Becoming a foster", "A dog I saw here", "Update or remove a listing", "Partnering as a rescue", "Something else"].map(o => <option key={o}>{o}</option>)}</select></Field>
                <Field label="Message" full><textarea required rows="5" value={c.message} onChange={e => setC({ ...c, message: e.target.value })} className={inputCls} /></Field>
                {err && <p className="md:col-span-2 text-sm font-semibold text-[#A64B33]" role="alert">{err}</p>}
                <div className="md:col-span-2 flex justify-end"><Button type="submit" disabled={busy}><Icon name="Send" size={18} /> {busy ? "Sending…" : "Send message"}</Button></div>
              </form>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- app ---------------- */
function App() {
  const [route, setRoute] = useState(readRoute());
  const [toastMsg, toast] = useToast();
  const [s, setS] = useState(window.NB.DEFAULT_SETTINGS);
  const [dogs, setDogs] = useState(null); const [tails, setTails] = useState([]); const [loadErr, setLoadErr] = useState("");

  navigateFn = (href) => { try { window.history.pushState({}, "", href); } catch (e) { window.location.href = href; return; } setRoute(readRoute()); window.scrollTo({ top: 0 }); };
  useEffect(() => {
    (async () => {
      try { const [st, d, t] = await Promise.all([API.settings(), API.publicList("dogs"), API.publicList("happy_tails")]); setS(st); setDogs(d); setTails(t); }
      catch (e) { setLoadErr(e.message || "Could not load"); setDogs([]); }
    })();
    const onPop = () => { setRoute(readRoute()); };
    window.addEventListener("popstate", onPop); window.addEventListener("hashchange", onPop);
    return () => { window.removeEventListener("popstate", onPop); window.removeEventListener("hashchange", onPop); };
  }, []);

  useEffect(() => {
    if (!dogs) return;
    const n = s.name; const page = route.page;
    const meta = {
      home: { title: `${n} | Foster or Adopt Urgent Rescue Dogs Near You`, description: "Find urgent rescue dogs who need a foster or forever home across the US. Free to use — we connect fosters and adopters directly with the rescues and shelters caring for each dog.", ld: null },
      dogs: { title: `Dogs Needing a Foster or Home Right Now | ${n}`, description: `Browse ${dogs.filter(d => d.status === "Available").length} rescue and shelter dogs who need a foster, adopter or rescue. Search by city or state and offer to help in two minutes.`,
        ld: { "@context": "https://schema.org", "@type": "CollectionPage", name: "Dogs needing a foster or home", breadcrumb: crumbs(s, [["Home", ""], ["Dogs needing help", "dogs/"]]), mainEntity: { "@type": "ItemList", itemListElement: dogs.filter(d => d.status === "Available").map((d, i) => ({ "@type": "ListItem", position: i + 1, url: new URL(`dogs/${d.slug}/`, s.siteUrl).href, name: d.name })) } } },
      how: { title: `How Dog Fostering Works — Free Matching with Rescues | ${n}`, description: "How fostering a dog works, what it costs (nothing), how long it lasts, and how we connect you with the rescue caring for a dog who needs you.",
        ld: { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) } },
      help: { title: `Offer to Foster or Adopt a Rescue Dog | ${n}`, description: "Tell us how you can help — foster, short-term foster, adopt, transport or pledge — and we'll introduce you to the rescue caring for the dog.", ld: null },
      list: { title: `List a Dog Who Needs a Foster — Free for Rescues | ${n}`, description: "Rescues, shelters and volunteers: share a dog who needs a foster, adopter or pull. Free, credited to you, and every offer of help goes straight to your team.", ld: null },
      support: { title: `Support Foster Dogs — Wishlists & Donations | ${n}`, description: "Help new fosters say yes with crates, supplies and small donations, and help urgent dogs get seen in time.", ld: null },
      about: { title: `About & Contact | ${n}`, description: "Why we built New Beginnings Animal Rescue: one place where dogs who need fosters stay visible, and every offer of help reaches the right rescue.", ld: null },
    };
    if (page === "profile") {
      const d = dogs.find(x => x.slug === route.slug);
      if (d) setMeta({ s, title: `${d.name}${d.need ? ` Needs a ${d.need.split(",")[0]}` : ""}${d.location ? ` in ${d.location}` : ""} | ${n}`, description: dogSummary(d), path: pathFor("profile", d.slug), image: (d.photos || [])[0],
        ld: { "@context": "https://schema.org", "@type": "WebPage", name: `${d.name} — ${d.breed}`, description: dogSummary(d), breadcrumb: crumbs(s, [["Home", ""], ["Dogs needing help", "dogs/"], [d.name, `dogs/${d.slug}/`]]) } });
      else setMeta({ s, title: `Dog not found | ${n}`, description: meta.dogs.description, path: pathFor("dogs") });
    } else { const m = meta[page] || meta.home; setMeta({ s, title: m.title, description: m.description, path: pathFor(page), ld: m.ld }); }
  }, [route, dogs, s]);

  let view;
  if (!dogs) view = <Spinner label="Fetching dogs who need help…" />;
  else switch (route.page) {
    case "dogs": view = <DogsPage dogs={dogs} />; break;
    case "profile": view = <ProfilePage slug={route.slug} dogs={dogs} toast={toast} />; break;
    case "how": view = <HowPage s={s} />; break;
    case "help": view = <HelpPage key={route.dog || "any"} preselect={route.dog} dogs={dogs} s={s} />; break;
    case "list": view = <ListPage s={s} />; break;
    case "support": view = <SupportPage toast={toast} s={s} />; break;
    case "about": view = <AboutPage toast={toast} s={s} tails={tails} />; break;
    default: view = <HomePage s={s} dogs={dogs} />;
  }
  return (
    <div className="min-h-screen relative">
      <Background />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 bg-white rounded-full px-4 py-2 font-bold">Skip to content</a>
      <Navbar page={route.page} s={s} />
      <Notice s={s} />
      {loadErr && <div className="max-w-6xl mx-auto px-4 pt-3"><p className="rounded-2xl bg-terra/15 px-4 py-3 text-sm font-semibold">We couldn't load the latest dogs right now. Please refresh in a moment.</p></div>}
      <main id="main" key={route.page + (route.slug || "")}>{view}</main>
      <Footer s={s} />
      <Toast msg={toastMsg} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
