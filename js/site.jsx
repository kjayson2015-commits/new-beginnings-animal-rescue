/* Public website for New Beginnings Animal Rescue. Content comes from the admin. */
const API = window.NB.api;

const PAGES = [
  { id: "home", label: "Home", icon: "House" },
  { id: "dogs", label: "Adoptable Dogs", icon: "Dog" },
  { id: "process", label: "Adoption Process", icon: "ListChecks" },
  { id: "apply", label: "Apply", icon: "ClipboardPen" },
  { id: "support", label: "Support", icon: "HeartHandshake" },
  { id: "about", label: "About & Contact", icon: "Mail" },
];
function readHash() {
  const h = (window.location.hash || "").replace("#", "");
  if (h.startsWith("dog-")) return { page: "profile", slug: h.slice(4) };
  if (PAGES.some(p => p.id === h)) return { page: h };
  return { page: "home" };
}

function SectionTitle({ eyebrow, title, subtitle, center }) {
  return (
    <div className={`mb-8 ${center ? "text-center mx-auto max-w-2xl" : ""}`}>
      {eyebrow && <p className="text-sm font-bold uppercase tracking-widest text-terraText mb-2">{eyebrow}</p>}
      <h2 className="text-3xl md:text-4xl font-extrabold text-ink leading-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-muted text-lg">{subtitle}</p>}
    </div>
  );
}

function Navbar({ page, go, s }) {
  const [open, setOpen] = useState(false);
  const active = page === "profile" ? "dogs" : page;
  const nav = (id) => { setOpen(false); go(id); };
  return (
    <header className="sticky top-0 z-40 px-3 md:px-6 pt-3">
      <nav className="glass-strong rounded-2xl md:rounded-full max-w-6xl mx-auto pl-2 pr-3 md:pr-4 py-2 flex items-center justify-between gap-4" aria-label="Main">
        <a href="#home" onClick={(e) => { e.preventDefault(); nav("home"); }} className="flex items-center gap-3 font-extrabold text-ink min-w-0">
          <Logo settings={s} size={48} />
          <span className="text-base md:text-lg leading-tight truncate">{s.name}</span>
        </a>
        <ul className="hidden xl:flex items-center gap-1">
          {PAGES.filter(p => p.id !== "home").map(p => (
            <li key={p.id}><a href={`#${p.id}`} onClick={(e) => { e.preventDefault(); nav(p.id); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active === p.id ? "bg-white/90 text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{p.label}</a></li>
          ))}
        </ul>
        <div className="hidden xl:block"><Button onClick={() => nav("dogs")} className="text-sm">Meet the Dogs</Button></div>
        <button className="xl:hidden w-11 h-11 rounded-full glass flex items-center justify-center shrink-0" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          <Icon name={open ? "X" : "Menu"} />
        </button>
      </nav>
      {open && (
        <div className="xl:hidden glass-strong rounded-2xl max-w-6xl mx-auto mt-2 p-3 fade-in">
          {PAGES.map(p => (
            <a key={p.id} href={`#${p.id}`} onClick={(e) => { e.preventDefault(); nav(p.id); }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold ${active === p.id ? "bg-white/80 text-ink" : "text-muted"}`}>
              <Icon name={p.icon} size={18} /> {p.label}
            </a>
          ))}
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

function Footer({ go, s }) {
  return (
    <footer className="px-4 md:px-6 pb-8 pt-16">
      <div className="glass rounded-3xl max-w-6xl mx-auto p-8 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 font-extrabold text-lg mb-3"><Logo settings={s} size={44} /> {s.name}</div>
          <p className="text-muted text-sm">A private, foster-based dog rescue in {s.location}. Not a 501(c)(3); contributions are not tax-deductible.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {PAGES.map(p => <a key={p.id} href={`#${p.id}`} onClick={(e) => { e.preventDefault(); go(p.id); }} className="text-muted hover:text-ink font-semibold w-fit">{p.label}</a>)}
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <span className="font-bold">Stay in touch</span>
          <span className="text-muted break-all">{s.email}</span>
          <div className="flex gap-2">
            {(s.socials || []).map(x => (
              <a key={x.label} href={x.url} target="_blank" rel="noopener noreferrer" aria-label={x.label} className="w-11 h-11 rounded-full glass flex items-center justify-center hover:bg-white/80"><Icon name={socialIcon(x.label)} size={18} /></a>
            ))}
          </div>
          <a href="admin.html" className="text-xs text-muted hover:text-ink w-fit mt-2">Staff login</a>
        </div>
      </div>
      <p className="text-center text-xs text-muted mt-6">© {new Date().getFullYear()} {s.name}. Made with love for dogs.</p>
    </footer>
  );
}

function DogCard({ dog, openDog }) {
  return (
    <button onClick={() => openDog(dog)} className="group text-left glass rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(43,41,39,0.10)] transition-all duration-300 flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <DogPhoto dog={dog} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 flex gap-2"><StatusPill status={dog.status} />{dog.urgent && dog.status === "Available" && <span className="rounded-full bg-terraText text-white text-xs font-bold px-3 py-1">Urgent</span>}</div>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-baseline justify-between gap-2"><h3 className="text-xl font-extrabold">{dog.name}</h3><span className="text-sm text-muted font-semibold">{dog.sex}</span></div>
        <p className="text-sm text-muted">{dog.breed}</p>
        <div className="flex gap-4 text-sm font-semibold text-ink">
          <span className="flex items-center gap-1"><Icon name="Cake" size={15} className="text-terraText" />{dog.age_label}</span>
          <span className="flex items-center gap-1"><Icon name="Weight" size={15} className="text-terraText" />{dog.weight} lbs</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-auto pt-1">{(dog.traits || []).slice(0, 3).map(t => <Tag key={t}>{t}</Tag>)}</div>
      </div>
    </button>
  );
}

function HomePage({ go, openDog, s, dogs }) {
  const featured = dogs.filter(d => d.featured && d.status !== "Adopted").slice(0, 3);
  const heroDog = featured[0] || dogs[0];
  const steps = [
    { icon: "Search", title: "Find your match", text: "Read each dog's story, written by the foster who lives with them. No guesswork, no surprises." },
    { icon: "ClipboardPen", title: "Apply & chat with us", text: "Send an application. We call your references and talk honestly about whether it's the right fit." },
    { icon: "House", title: "Meet & bring them home", text: "Meet your dog with their foster, sign the contract, and start a two-week trial at home." },
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
              <Button onClick={() => go("dogs")} className="px-6 py-3"><Icon name="Dog" size={18} /> Meet Adoptable Dogs</Button>
              <Button variant="glass" onClick={() => go("support")} className="px-6 py-3"><Icon name="Heart" size={18} /> Support Our Dogs</Button>
            </div>
          </div>
          <div className="relative min-h-[360px] md:min-h-[440px]">
            <div className="glass rounded-[2rem] overflow-hidden absolute inset-0 md:inset-x-8">
              {heroDog ? <DogPhoto dog={heroDog} className="w-full h-full" /> : <img src={s.logoUrl} alt="" className="w-full h-full object-cover" />}
            </div>
            {(s.stats || []).slice(0, 3).map((x, i) => (
              <div key={x + i} className={`glass-strong rounded-2xl px-4 py-3 font-bold text-sm absolute float flex items-center gap-2 ${["top-6 -left-2", "top-1/2 -right-2", "bottom-6 left-6"][i]}`} style={{ animationDelay: `${i * 1.2}s` }}>
                <span className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-terraText"><Icon name={["House", "HeartHandshake", "MapPin"][i]} size={16} /></span>{x}
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="px-4 md:px-6 pt-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow="Featured & urgent" title="Dogs who need a home soon" subtitle="They've been waiting the longest. Could one of them be yours?" />
              <Button variant="glass" onClick={() => go("dogs")} className="mb-8">See all dogs <Icon name="ArrowRight" size={18} /></Button>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {featured.map(d => (
                <button key={d.id} onClick={() => openDog(d)} className="group text-left glass rounded-3xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all">
                  <div className="relative aspect-[4/3] overflow-hidden"><DogPhoto dog={d} index={0} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    {d.urgent && <span className="absolute top-3 left-3 rounded-full bg-terraText text-white text-xs font-bold px-3 py-1">Urgent</span>}</div>
                  <div className="p-5">
                    <h3 className="text-xl font-extrabold">{d.name}</h3>
                    <p className="text-sm text-muted mb-3">{d.breed} · {d.age_label}</p>
                    <div className="flex flex-wrap gap-2 mb-4">{(d.traits || []).slice(0, 2).map(t => <Tag key={t}>{t}</Tag>)}</div>
                    <span className="inline-flex items-center gap-1 font-bold text-terraText">View profile <Icon name="ArrowRight" size={16} /></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 md:px-6 pt-20">
        <div className="max-w-6xl mx-auto glass-strong rounded-[2rem] p-8 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-terraText mb-2">Can't adopt right now?</p>
            <h2 className="text-3xl font-extrabold mb-3">Foster. It saves a life, too.</h2>
            <p className="text-muted text-lg max-w-2xl">Every foster home means one more dog we can say yes to. We cover food, vet care and supplies; you give a dog a quiet room, a routine and a little patience. Even two weeks makes a difference.</p>
          </div>
          <div className="flex flex-wrap gap-3"><Button onClick={() => go("about")} className="px-6 py-3"><Icon name="House" size={18} /> Become a foster</Button><Button variant="glass" onClick={() => go("support")} className="px-6 py-3">Other ways to help</Button></div>
        </div>
      </section>

      <section className="px-4 md:px-6 pt-20">
        <div className="max-w-6xl mx-auto">
          <SectionTitle eyebrow="How it works" title="Three simple steps to adoption" center />
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((x, i) => (
              <div key={x.title} className="glass rounded-3xl p-7">
                <div className="flex items-center justify-between mb-5">
                  <span className="w-12 h-12 rounded-2xl bg-terra text-white flex items-center justify-center"><Icon name={x.icon} /></span>
                  <span className="text-5xl font-extrabold text-ink/10">0{i + 1}</span>
                </div>
                <h3 className="text-xl font-extrabold mb-2">{x.title}</h3>
                <p className="text-muted">{x.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8"><Button variant="glass" onClick={() => go("process")}>Read our full adoption process</Button></div>
        </div>
      </section>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} aria-pressed={checked}
      className={`rounded-full px-4 py-2 text-sm font-semibold border transition min-h-[40px] ${checked ? "bg-sage text-white border-sage" : "bg-white/60 border-white/70 text-muted hover:text-ink"}`}>
      {checked && <span aria-hidden="true">✓ </span>}{label}
    </button>
  );
}
function SegGroup({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition min-h-[40px] ${value === o.value ? "bg-ink text-white" : "bg-white/60 border border-white/70 text-muted hover:text-ink"}`}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

const EMPTY_COMPAT = { kids: false, dogs: false, cats: false, house_trained: false };
function DogsPage({ openDog, dogs }) {
  const [q, setQ] = useState(""); const [status, setStatus] = useState("All");
  const [size, setSize] = useState("All"); const [age, setAge] = useState("All");
  const [compat, setCompat] = useState(EMPTY_COMPAT);
  const filtered = useMemo(() => dogs.filter(d => {
    if (q && !(`${d.name} ${d.breed} ${(d.traits || []).join(" ")}`.toLowerCase().includes(q.toLowerCase()))) return false;
    if (status !== "All" && d.status !== status) return false;
    if (size !== "All" && d.size !== size) return false;
    if (age !== "All" && d.age_group !== age) return false;
    for (const k of Object.keys(compat)) if (compat[k] && !d[k]) return false;
    return true;
  }), [dogs, q, status, size, age, compat]);
  const reset = () => { setQ(""); setStatus("All"); setSize("All"); setAge("All"); setCompat(EMPTY_COMPAT); };
  const all = (arr) => [{ value: "All", label: "All" }, ...arr.map(a => ({ value: a, label: a }))];
  return (
    <div className="px-4 md:px-6 pt-10 fade-in">
      <div className="max-w-6xl mx-auto">
        <SectionTitle eyebrow="Adoptable dogs" title="Find your new best friend" subtitle="Filter by what matters to your home. Every dog lives with a foster who knows them well." />
        <div className="glass rounded-3xl p-5 md:p-6 mb-8 flex flex-col gap-5">
          <label className="relative block"><span className="sr-only">Search dogs</span>
            <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, breed or personality…" className="w-full rounded-full bg-white/75 border border-white/70 pl-11 pr-4 py-3 text-ink placeholder:text-muted/70" />
          </label>
          <div className="grid md:grid-cols-3 gap-5">
            <SegGroup label="Status" value={status} onChange={setStatus} options={[{ value: "All", label: "All" }, { value: "Available", label: "Available" }, { value: "Pending", label: "Application Pending" }]} />
            <SegGroup label="Size" value={size} onChange={setSize} options={all(["Small", "Medium", "Large"])} />
            <SegGroup label="Age" value={age} onChange={setAge} options={all(["Puppy", "Young", "Adult", "Senior"])} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Compatibility</span>
            <div className="flex flex-wrap gap-2 items-center">
              <Toggle label="Good with Kids" checked={compat.kids} onChange={v => setCompat({ ...compat, kids: v })} />
              <Toggle label="Good with Dogs" checked={compat.dogs} onChange={v => setCompat({ ...compat, dogs: v })} />
              <Toggle label="Good with Cats" checked={compat.cats} onChange={v => setCompat({ ...compat, cats: v })} />
              <Toggle label="House-Trained" checked={compat.house_trained} onChange={v => setCompat({ ...compat, house_trained: v })} />
              <button onClick={reset} className="ml-auto text-sm font-bold text-terraText hover:text-terraDark flex items-center gap-1 min-h-[40px] px-2"><Icon name="RotateCcw" size={15} /> Reset filters</button>
            </div>
          </div>
        </div>
        <p className="text-sm font-semibold text-muted mb-4" aria-live="polite">Showing {filtered.length} of {dogs.length} dogs</p>
        {filtered.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{filtered.map(d => <DogCard key={d.id} dog={d} openDog={openDog} />)}</div>
        ) : (
          <div className="glass rounded-3xl p-10 text-center">
            <Icon name="SearchX" size={40} className="mx-auto text-muted mb-3" />
            <p className="font-bold text-lg">No dogs match those filters yet.</p>
            <p className="text-muted mb-5">Try loosening a filter, or check back soon — new fosters arrive often.</p>
            <Button onClick={reset}>Reset filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Check({ ok, label }) {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <span className={`w-7 h-7 rounded-full flex items-center justify-center ${ok ? "bg-sage text-white" : "bg-[#E7E2DC] text-muted"}`}><Icon name={ok ? "Check" : "X"} size={15} strokeWidth={3} /></span>
      <span className={ok ? "text-ink" : "text-muted"}>{label}</span>
    </div>
  );
}

function ProfilePage({ slug, dogs, go, applyFor, toast }) {
  const dog = dogs.find(d => d.slug === slug);
  const [photo, setPhoto] = useState(0);
  useEffect(() => setPhoto(0), [slug]);
  if (!dog) return (
    <div className="px-4 pt-16 text-center fade-in"><div className="glass rounded-3xl p-10 max-w-lg mx-auto"><p className="font-bold text-lg mb-4">We couldn't find that dog.</p><Button onClick={() => go("dogs")}>Back to all dogs</Button></div></div>
  );
  const nPhotos = Math.max(1, (dog.photos || []).filter(Boolean).length);
  const thumbs = Array.from({ length: (dog.photos || []).length ? nPhotos : 3 }, (_, i) => i);
  const share = () => copyText(`${window.location.href.split("#")[0]}#dog-${dog.slug}`, toast);
  const specs = [
    { icon: "Cake", label: "Age", value: `${dog.age_label} · ${dog.age_group}` },
    { icon: "Ruler", label: "Size / Weight", value: `${dog.size} · ${dog.weight} lbs` },
    { icon: "Zap", label: "Energy level", value: dog.energy },
    { icon: "Stethoscope", label: "Medical", value: `${dog.spay_neuter ? "Spayed/neutered" : "Spay/neuter scheduled"} · ${dog.vaccines ? "Vaccines current" : "Vaccines due"}` },
  ];
  return (
    <div className="px-4 md:px-6 pt-8 fade-in">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => go("dogs")} className="inline-flex items-center gap-2 font-semibold text-muted hover:text-ink mb-6 min-h-[44px]"><Icon name="ArrowLeft" size={18} /> All dogs</button>
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8">
          <div>
            <div className="glass rounded-[2rem] overflow-hidden relative aspect-[4/3]">
              <DogPhoto dog={dog} index={photo} className="w-full h-full" />
              <StatusPill status={dog.status} className="absolute top-4 left-4" />
              <button onClick={share} className="absolute top-4 right-4 glass-strong rounded-full px-4 py-2 font-bold text-sm flex items-center gap-2 min-h-[44px]"><Icon name="Share2" size={16} /> Share</button>
            </div>
            {thumbs.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {thumbs.map(i => (
                  <button key={i} onClick={() => setPhoto(i)} aria-label={`Show photo ${i + 1}`} aria-pressed={photo === i}
                    className={`w-24 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition ${photo === i ? "border-terra" : "border-white/60 opacity-70 hover:opacity-100"}`}>
                    <DogPhoto dog={dog} index={i} className="w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold">{dog.name}</h1>
              <p className="text-lg text-muted mt-1">{dog.breed} · {dog.sex}</p>
              <div className="flex flex-wrap gap-2 mt-4">{(dog.traits || []).map(t => <Tag key={t}>{t}</Tag>)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {specs.map(x => (
                <div key={x.label} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-1"><Icon name={x.icon} size={14} className="text-terraText" />{x.label}</div>
                  <div className="font-bold">{x.value}</div>
                </div>
              ))}
              <div className="glass rounded-2xl p-4 col-span-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Compatibility</div>
                <div className="flex flex-wrap gap-x-6 gap-y-3"><Check ok={dog.kids} label="Kids" /><Check ok={dog.dogs} label="Dogs" /><Check ok={dog.cats} label="Cats" /><Check ok={dog.house_trained} label="House-trained" /></div>
              </div>
            </div>
            <div className="glass-strong rounded-2xl p-5 lg:sticky lg:top-28">
              {dog.status === "Available" && <>
                <Button onClick={() => applyFor(dog)} className="w-full text-lg py-3"><Icon name="Heart" size={18} /> Apply to Adopt {dog.name}</Button>
                <p className="text-xs text-muted text-center mt-3">{dog.adoption_fee ? `Adoption fee: ${dog.adoption_fee}. ` : ""}Fee includes vaccines, microchip, spay/neuter and a starter kit.</p>
              </>}
              {dog.status === "Pending" && <>
                <p className="font-bold mb-3 flex items-center gap-2"><Icon name="Clock" size={18} className="text-[#9A6A12]" /> An application is pending for {dog.name}.</p>
                <Button variant="glass" onClick={() => go("dogs")} className="w-full">Meet other available dogs</Button>
              </>}
              {dog.status === "Adopted" && <>
                <p className="font-bold mb-3 flex items-center gap-2"><Icon name="PartyPopper" size={18} className="text-sage" /> {dog.name} found a forever home!</p>
                <Button variant="glass" onClick={() => go("dogs")} className="w-full">Meet dogs still waiting</Button>
              </>}
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {[{ t: "Personality", i: "Smile", b: dog.bio }, { t: "A day in the life", i: "Sun", b: dog.routine }, { t: "Ideal home", i: "House", b: dog.ideal_home }].filter(c => c.b).map(c => (
            <div key={c.t} className="glass rounded-3xl p-6">
              <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2"><Icon name={c.i} size={20} className="text-terraText" />{c.t}</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">{c.b}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProcessPage({ go, s }) {
  const steps = [
    { icon: "ClipboardPen", title: "Submit Application", text: "Tell us about your home, schedule and the dog you're interested in. It takes about 10 minutes." },
    { icon: "PhoneCall", title: "Reference & Landlord Check", text: "We call your vet reference and, if you rent, confirm with your landlord that dogs are allowed." },
    { icon: "Users", title: "Meet & Greet", text: "Meet the dog with their foster. Bring everyone who lives with you, including any resident dogs." },
    { icon: "FilePenLine", title: "Contract & Home Trial", text: "Sign the adoption and liability contract, pay the fee, and begin a two-week trial at home." },
  ];
  return (
    <div className="px-4 md:px-6 pt-10 fade-in">
      <div className="max-w-6xl mx-auto">
        <SectionTitle eyebrow="Adoption process & policies" title="A careful process, for happy endings" subtitle="We take our time so every match lasts. Most adoptions are finished within 1–2 weeks." />
        <ol className="grid md:grid-cols-4 gap-5">
          {steps.map((x, i) => (
            <li key={x.title} className="glass rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4"><span className="w-10 h-10 rounded-full bg-ink text-white font-extrabold flex items-center justify-center">{i + 1}</span><Icon name={x.icon} className="text-terraText" /></div>
              <h3 className="font-extrabold text-lg mb-2">{x.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{x.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-16">
          <SectionTitle eyebrow="Fees" title="Transparent adoption fees" subtitle="Fees cover only part of each dog's vet care. Every fee includes:" />
          <div className="flex flex-wrap gap-2 mb-6">{(s.feeIncludes || []).map(x => <span key={x} className="glass rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2"><Icon name="Check" size={15} className="text-sage" strokeWidth={3} />{x}</span>)}</div>
          <div className="grid md:grid-cols-3 gap-5">
            {(s.fees || []).map((f, i) => (
              <div key={f.label + i} className={`glass rounded-3xl p-7 ${i === 1 ? "ring-2 ring-terra/40" : ""}`}>
                <p className="text-sm font-bold uppercase tracking-wider text-muted">{f.range}</p>
                <h3 className="text-2xl font-extrabold mt-1">{f.label}</h3>
                <p className="text-5xl font-extrabold text-terraText mt-4">{f.price}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 glass-strong rounded-3xl p-7 md:p-10 grid md:grid-cols-[auto_1fr] gap-6 items-start">
          <span className="w-14 h-14 rounded-2xl bg-sage text-white flex items-center justify-center"><Icon name="ShieldCheck" size={28} /></span>
          <div>
            <h2 className="text-2xl font-extrabold mb-3">About us as a private rescue</h2>
            <p className="text-muted leading-relaxed mb-3">{s.privateNotice}</p>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm font-semibold">
              {(s.privatePoints || []).map(x => <li key={x} className="flex items-center gap-2"><Icon name="Check" size={16} className="text-sage" strokeWidth={3} />{x}</li>)}
            </ul>
          </div>
        </div>
        <div className="text-center mt-10"><Button onClick={() => go("dogs")}>Find a dog to apply for <Icon name="ArrowRight" size={18} /></Button></div>
      </div>
    </div>
  );
}

function FormSection({ icon, title, children }) {
  return (
    <fieldset className="glass rounded-3xl p-6 md:p-8">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-xl font-extrabold mb-5 flex items-center gap-2"><span className="w-9 h-9 rounded-xl bg-terra text-white flex items-center justify-center"><Icon name={icon} size={18} /></span>{title}</h2>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </fieldset>
  );
}

const EMPTY_APP = { dog: "", name: "", email: "", phone: "", cityState: "", housing: "Own", landlordName: "", landlordPhone: "", yard: "Fenced yard",
  adults: "1", kids: "0", pets: "", vet: "", hoursAlone: "", exercise: "", experience: "", waiver: false };

function ApplyPage({ preselect, go, dogs, s }) {
  const available = dogs.filter(d => d.status === "Available");
  const [f, setF] = useState({ ...EMPTY_APP, dog: preselect || "" });
  const [done, setDone] = useState(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const chosen = dogs.find(d => d.id === f.dog);
  const submit = async (e) => {
    e.preventDefault();
    if (!f.waiver) { setError("Please agree to sign the adoption contract and liability waiver."); return; }
    setError(""); setBusy(true);
    try {
      const { name, email, phone, waiver, dog, ...rest } = f;
      await API.submit("applications", { dog_id: chosen && !String(chosen.id).startsWith("demo-") ? chosen.id : null, dog_name: chosen ? chosen.name : "Not sure yet", name, email, phone, notes: "", data: { ...rest, waiverAgreed: waiver } });
      setDone({ ...f }); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { setError("Sorry, something went wrong sending your application. Please try again or email us at " + s.email + "."); }
    setBusy(false);
  };
  if (done) {
    const rows = [["Dog", chosen ? chosen.name : "Not sure yet — open to a match"], ["Name", done.name], ["Email", done.email], ["Phone", done.phone], ["City / State", done.cityState],
      ["Housing", done.housing + (done.housing === "Rent" ? ` (landlord: ${done.landlordName || "—"})` : "")], ["Yard", done.yard], ["Household", `${done.adults} adult(s), ${done.kids} kid(s)`],
      ["Vet reference", done.vet || "—"], ["Hours alone", done.hoursAlone || "—"]];
    return (
      <div className="px-4 md:px-6 pt-10 fade-in">
        <div className="max-w-2xl mx-auto glass-strong rounded-[2rem] p-8 md:p-10 text-center">
          {chosen && <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white/80"><DogPhoto dog={chosen} className="w-full h-full" /></div>}
          <span className="inline-flex w-14 h-14 rounded-full bg-sage text-white items-center justify-center mb-4"><Icon name="PartyPopper" size={28} /></span>
          <h1 className="text-3xl md:text-4xl font-extrabold">Application received!</h1>
          <p className="text-muted mt-2">Thank you, {done.name.split(" ")[0] || "friend"}. {chosen ? `${chosen.name}'s foster` : "Our team"} will review it and reach out within 2–3 days.</p>
          <dl className="text-left grid sm:grid-cols-2 gap-3 mt-8">
            {rows.map(([k, v]) => <div key={k} className="glass rounded-2xl px-4 py-3"><dt className="text-xs font-bold uppercase tracking-wider text-muted">{k}</dt><dd className="font-semibold break-words">{v}</dd></div>)}
          </dl>
          {window.NB.mode === "demo" && <p className="text-xs text-muted mt-6">Demo mode: saved in this browser only. Connect Supabase to receive real applications.</p>}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Button onClick={() => go("dogs")}>Back to dogs</Button>
            <Button variant="glass" onClick={() => { setDone(null); setF({ ...EMPTY_APP }); }}>Start a new application</Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="px-4 md:px-6 pt-10 fade-in">
      <div className="max-w-4xl mx-auto">
        <SectionTitle eyebrow="Adoption application" title="Let's find your perfect match" subtitle="Be as detailed as you can — it helps us place the right dog with the right family." />
        <form onSubmit={submit} className="flex flex-col gap-6">
          <div className="glass-strong rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-5 md:items-center">
            <div className="flex-1">
              <Field label="Which dog are you applying for?">
                <select value={f.dog} onChange={set("dog")} className={inputCls}>
                  <option value="">Not sure yet — help me find a match</option>
                  {available.map(d => <option key={d.id} value={d.id}>{d.name} — {d.breed}, {d.age_label}</option>)}
                </select>
              </Field>
            </div>
            {chosen && <div className="flex items-center gap-3 glass rounded-2xl p-2 pr-4"><div className="w-16 h-16 rounded-xl overflow-hidden"><DogPhoto dog={chosen} className="w-full h-full" /></div><span className="font-bold">{chosen.name}</span></div>}
          </div>
          <FormSection icon="User" title="Applicant info">
            <Field label="Full name"><input required value={f.name} onChange={set("name")} className={inputCls} autoComplete="name" /></Field>
            <Field label="Email"><input required type="email" value={f.email} onChange={set("email")} className={inputCls} autoComplete="email" /></Field>
            <Field label="Phone"><input required type="tel" value={f.phone} onChange={set("phone")} className={inputCls} autoComplete="tel" /></Field>
            <Field label="City / State"><input required value={f.cityState} onChange={set("cityState")} className={inputCls} placeholder="e.g. Austin, TX" /></Field>
          </FormSection>
          <FormSection icon="House" title="Living situation">
            <Field label="Do you own or rent?">
              <div className="flex gap-2">{["Own", "Rent"].map(o => (
                <button key={o} type="button" onClick={() => setF({ ...f, housing: o })} aria-pressed={f.housing === o} className={`flex-1 rounded-xl py-3 font-bold min-h-[44px] ${f.housing === o ? "bg-ink text-white" : "bg-white/70 border border-[#E9E2D9] text-muted"}`}>{o}</button>
              ))}</div>
            </Field>
            <Field label="Yard & fence">
              <select value={f.yard} onChange={set("yard")} className={inputCls}>{["Fenced yard", "Unfenced yard", "Shared / apartment green space", "No yard"].map(o => <option key={o}>{o}</option>)}</select>
            </Field>
            {f.housing === "Rent" && <>
              <Field label="Landlord name"><input required value={f.landlordName} onChange={set("landlordName")} className={inputCls} /></Field>
              <Field label="Landlord phone"><input required type="tel" value={f.landlordPhone} onChange={set("landlordPhone")} className={inputCls} /></Field>
            </>}
          </FormSection>
          <FormSection icon="Users" title="Household & pets">
            <Field label="Adults in home"><input type="number" min="1" value={f.adults} onChange={set("adults")} className={inputCls} /></Field>
            <Field label="Children in home (and ages)"><input value={f.kids} onChange={set("kids")} className={inputCls} placeholder="e.g. 2 (ages 6 and 9)" /></Field>
            <Field label="Current pets & spay/neuter status" full><textarea rows="3" value={f.pets} onChange={set("pets")} className={inputCls} placeholder="e.g. 1 cat, 5 yrs, spayed" /></Field>
            <Field label="Vet clinic reference" full hint="Clinic name and phone. Write 'first pet' if you don't have one yet."><input required value={f.vet} onChange={set("vet")} className={inputCls} /></Field>
          </FormSection>
          <FormSection icon="CalendarClock" title="Lifestyle & schedule">
            <Field label="Hours the dog would be alone on a typical day"><input required value={f.hoursAlone} onChange={set("hoursAlone")} className={inputCls} placeholder="e.g. 4–5 hours" /></Field>
            <Field label="Exercise plan"><input required value={f.exercise} onChange={set("exercise")} className={inputCls} placeholder="e.g. two 30-min walks + weekend hikes" /></Field>
            <Field label="Dog experience (optional)" full><textarea rows="2" value={f.experience} onChange={set("experience")} className={inputCls} placeholder="Past dogs, training experience, anything else we should know" /></Field>
            <label className="md:col-span-2 flex items-start gap-3 glass rounded-2xl p-4 cursor-pointer">
              <input type="checkbox" checked={f.waiver} onChange={set("waiver")} className="mt-1 w-5 h-5 accent-[#E07A5F]" />
              <span className="text-sm">I agree to sign {s.name}'s adoption contract and liability waiver, including returning the dog to the rescue (never rehoming or surrendering elsewhere) if I can no longer keep them.</span>
            </label>
          </FormSection>
          {error && <p className="rounded-2xl bg-terra/15 border border-terra/30 px-4 py-3 font-semibold text-[#A64B33]" role="alert">{error}</p>}
          <div className="flex justify-end"><Button type="submit" disabled={busy} className="text-lg px-8 py-3"><Icon name="Send" size={18} /> {busy ? "Sending…" : "Submit application"}</Button></div>
        </form>
      </div>
    </div>
  );
}

function SupportPage({ toast, s, dogs }) {
  const tiers = s.sponsorTiers || [];
  const [tier, setTier] = useState(tiers[1] ? tiers[1].amount : (tiers[0] || {}).amount);
  const [sponsorDog, setSponsorDog] = useState("any");
  const sponsorName = sponsorDog === "any" ? "the dog who needs it most" : (dogs.find(d => d.id === sponsorDog) || {}).name;
  return (
    <div className="px-4 md:px-6 pt-10 fade-in">
      <div className="max-w-6xl mx-auto">
        <SectionTitle eyebrow="Support & supplies" title="Help us care for every dog" subtitle="Supplies, vet visits and foster gear keep our dogs healthy until they go home." />
        <div className="rounded-3xl bg-sand/45 border border-white/60 backdrop-blur-xl p-5 md:p-6 mb-10 flex gap-4 items-start shadow-[0_8px_32px_rgba(43,41,39,0.06)]">
          <Icon name="Info" size={24} className="shrink-0 text-[#8A6420]" /><p className="font-semibold">{s.donationDisclaimer}</p>
        </div>
        {(s.wishlists || []).length > 0 && <>
          <h2 className="text-2xl font-extrabold mb-5">Supply wishlists</h2>
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            {s.wishlists.map(w => (
              <div key={w.label} className="glass rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3"><span className="w-12 h-12 rounded-2xl bg-terra text-white flex items-center justify-center"><Icon name="ShoppingBag" /></span><h3 className="text-xl font-extrabold">{w.label}</h3></div>
                <p className="text-muted">{w.desc}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <a href={w.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold bg-terra hover:bg-terraDark text-white min-h-[44px]">Open list <Icon name="ExternalLink" size={16} /></a>
                  <Button variant="glass" onClick={() => copyText(w.url, toast)}><Icon name="Copy" size={16} /> Copy link</Button>
                </div>
              </div>
            ))}
          </div>
        </>}
        {(s.needs || []).length > 0 && <>
          <h3 className="font-extrabold text-lg mb-3">Urgently needed right now</h3>
          <div className="grid md:grid-cols-3 gap-5 mb-14">
            {s.needs.map(n => (
              <div key={n.title} className="glass rounded-3xl p-5 flex gap-4 items-start">
                <span className="w-11 h-11 rounded-xl bg-sand/70 flex items-center justify-center shrink-0"><Icon name="PackageOpen" size={20} /></span>
                <div><p className="font-bold">{n.title}</p><p className="text-sm text-muted">{n.text}</p></div>
              </div>
            ))}
          </div>
        </>}
        {tiers.length > 0 && <>
          <h2 className="text-2xl font-extrabold mb-5">Sponsor a dog's vet visit</h2>
          <div className="glass-strong rounded-3xl p-6 md:p-8 mb-10">
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {tiers.map((t, i) => (
                <button key={i} onClick={() => setTier(t.amount)} aria-pressed={tier === t.amount}
                  className={`rounded-2xl p-5 text-left border-2 transition ${tier === t.amount ? "border-terra bg-white/80" : "border-white/60 bg-white/40 hover:bg-white/60"}`}>
                  <Icon name={["Syringe", "Stethoscope", "HeartPulse"][i % 3]} className="text-terraText mb-2" />
                  <div className="text-3xl font-extrabold">${t.amount}</div>
                  <div className="text-sm text-muted font-semibold">{t.label}</div>
                </button>
              ))}
            </div>
            <div className="grid md:grid-cols-[1fr_1.4fr] gap-5 items-end">
              <Field label="Who would you like to sponsor?">
                <select value={sponsorDog} onChange={e => setSponsorDog(e.target.value)} className={inputCls}>
                  <option value="any">The dog who needs it most</option>
                  {dogs.filter(d => d.status !== "Adopted").map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
              <p className="glass rounded-2xl px-5 py-4 font-semibold">Send <span className="text-terraText">${tier}</span> with any method below and add the note <span className="whitespace-nowrap">"Vet visit – {sponsorName}"</span>.</p>
            </div>
          </div>
        </>}
        <div className="grid md:grid-cols-3 gap-5">
          {(s.payments || []).map(p => (
            <div key={p.label} className="glass rounded-3xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3"><span className="w-11 h-11 rounded-xl bg-sage text-white flex items-center justify-center"><Icon name={payIcon(p.label)} size={20} /></span><h3 className="text-lg font-extrabold">{p.label}</h3></div>
              <p className="font-mono text-sm bg-white/70 rounded-xl px-3 py-2 break-all">{p.handle}</p>
              <p className="text-xs text-muted">{p.note}</p>
              <Button variant="glass" onClick={() => copyText(p.handle, toast)} className="mt-auto"><Icon name="Copy" size={16} /> Copy {p.label} handle</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutPage({ toast, s, tails }) {
  const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const [c, setC] = useState({ name: "", email: "", topic: "Adoption question", message: "" });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await API.submit("messages", { ...c }); setSent(true); } catch (x) { setErr("Sorry, your message couldn't be sent. Please email us at " + s.email + "."); }
    setBusy(false);
  };
  return (
    <div className="px-4 md:px-6 pt-10 fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-start mb-16">
          <div>
            <SectionTitle eyebrow="Our story" title="Small rescue, big hearts" />
            <div className="flex flex-col gap-4 text-muted text-lg leading-relaxed">{(s.story || []).map((p, i) => <p key={i}>{p}</p>)}</div>
          </div>
          <div className="glass rounded-[2rem] p-6 flex flex-col items-center text-center gap-4">
            <Logo settings={s} size={160} className="border-4" />
            <p className="text-2xl font-extrabold">{s.name}</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              {[["House", "Foster-based", "No kennels, ever"], ["HeartHandshake", "Lifetime return", "Always welcome back"], ["ShieldCheck", "Careful vetting", "References & contracts"], ["Sparkles", "Volunteer-run", "Powered by neighbors"]].map(([i, t, x]) => (
                <div key={t} className="bg-white/60 rounded-2xl p-4 text-left"><Icon name={i} className="text-terraText mb-2" /><p className="font-extrabold">{t}</p><p className="text-sm text-muted">{x}</p></div>
              ))}
            </div>
          </div>
        </div>
        {tails.length > 0 && <>
          <SectionTitle eyebrow="Happy tails" title="Where they are now" />
          <div className="grid md:grid-cols-3 gap-5 mb-16">
            {tails.map(t => (
              <figure key={t.id} className="glass rounded-3xl overflow-hidden">
                <div className="aspect-[4/3]">{t.photo ? <img src={t.photo} alt={`Photo of ${t.name}`} className="w-full h-full object-cover" loading="lazy" /> : <DogArt dog={{ name: t.name, slug: t.id }} className="w-full h-full" />}</div>
                <figcaption className="p-5">
                  <p className="font-extrabold text-lg">{t.name}</p>
                  {t.quote && <blockquote className="text-muted italic mt-1">"{t.quote}"</blockquote>}
                  {t.adopter && <p className="text-sm font-semibold mt-2">— {t.adopter}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        </>}
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8">
          <div className="flex flex-col gap-5">
            <SectionTitle eyebrow="Contact" title="Say hello" subtitle="We answer every message within two days. We keep personal phone numbers private, so email is the best way to reach us." />
            <div className="glass-strong rounded-3xl p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Rescue inbox</p>
              <div className="flex flex-wrap items-center gap-3"><span className="font-bold text-lg break-all">{s.email}</span><Button variant="glass" onClick={() => copyText(s.email, toast)}><Icon name="Copy" size={16} /> Copy email</Button></div>
            </div>
            <div className="flex flex-wrap gap-3">
              {(s.socials || []).map(x => <a key={x.label} href={x.url} target="_blank" rel="noopener noreferrer" className="glass rounded-full px-4 py-3 font-semibold flex items-center gap-2 hover:bg-white/80 min-h-[44px]"><Icon name={socialIcon(x.label)} size={18} />{x.label}</a>)}
            </div>
          </div>
          <div className="glass rounded-3xl p-6 md:p-8">
            {sent ? (
              <div className="text-center py-10 fade-in">
                <span className="inline-flex w-14 h-14 rounded-full bg-sage text-white items-center justify-center mb-4"><Icon name="MailCheck" size={28} /></span>
                <h3 className="text-2xl font-extrabold">Thanks, {c.name.split(" ")[0] || "friend"}!</h3>
                <p className="text-muted mt-2">We got your message about "{c.topic}" and will reply to {c.email}.</p>
                <Button variant="glass" className="mt-6" onClick={() => { setSent(false); setC({ name: "", email: "", topic: "Adoption question", message: "" }); }}>Send another message</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
                <Field label="Name"><input required value={c.name} onChange={e => setC({ ...c, name: e.target.value })} className={inputCls} autoComplete="name" /></Field>
                <Field label="Email"><input required type="email" value={c.email} onChange={e => setC({ ...c, email: e.target.value })} className={inputCls} autoComplete="email" /></Field>
                <Field label="Topic" full>
                  <select value={c.topic} onChange={e => setC({ ...c, topic: e.target.value })} className={inputCls}>
                    {["Adoption question", "Becoming a foster", "Surrendering a dog", "Donations & supplies", "Something else"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Message" full><textarea required rows="5" value={c.message} onChange={e => setC({ ...c, message: e.target.value })} className={inputCls} /></Field>
                {err && <p className="md:col-span-2 text-sm font-semibold text-[#A64B33]" role="alert">{err}</p>}
                <div className="md:col-span-2 flex justify-end"><Button type="submit" disabled={busy}><Icon name="Send" size={18} /> {busy ? "Sending…" : "Send message"}</Button></div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(readHash());
  const [preselect, setPreselect] = useState("");
  const [toastMsg, toast] = useToast();
  const [s, setS] = useState(window.NB.DEFAULT_SETTINGS);
  const [dogs, setDogs] = useState(null); const [tails, setTails] = useState([]); const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [st, d, t] = await Promise.all([API.settings(), API.publicList("dogs"), API.publicList("happy_tails")]);
        setS(st); setDogs(d); setTails(t);
        document.title = st.name;
      } catch (e) { setLoadErr(e.message || "Could not load"); setDogs([]); }
    })();
    const onHash = () => { setRoute(readHash()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const setHash = (h) => { try { if (window.location.hash !== "#" + h) window.location.hash = h; else setRoute(readHash()); } catch (e) { setRoute(h.startsWith("dog-") ? { page: "profile", slug: h.slice(4) } : { page: h }); } window.scrollTo({ top: 0 }); };
  const go = (page) => { if (page === "apply") setPreselect(""); setHash(page); };
  const openDog = (d) => setHash("dog-" + d.slug);
  const applyFor = (d) => { setPreselect(d.id); setHash("apply"); };

  let view;
  if (!dogs) view = <Spinner label="Fetching our dogs…" />;
  else switch (route.page) {
    case "dogs": view = <DogsPage openDog={openDog} dogs={dogs} />; break;
    case "profile": view = <ProfilePage slug={route.slug} dogs={dogs} go={go} applyFor={applyFor} toast={toast} />; break;
    case "process": view = <ProcessPage go={go} s={s} />; break;
    case "apply": view = <ApplyPage key={preselect || "none"} preselect={preselect} go={go} dogs={dogs} s={s} />; break;
    case "support": view = <SupportPage toast={toast} s={s} dogs={dogs} />; break;
    case "about": view = <AboutPage toast={toast} s={s} tails={tails} />; break;
    default: view = <HomePage go={go} openDog={openDog} s={s} dogs={dogs} />;
  }
  return (
    <div className="min-h-screen relative">
      <Background />
      <Navbar page={route.page} go={go} s={s} />
      <Notice s={s} />
      {loadErr && <div className="max-w-6xl mx-auto px-4 pt-3"><p className="rounded-2xl bg-terra/15 px-4 py-3 text-sm font-semibold">We couldn't load the latest dogs right now. Please refresh in a moment.</p></div>}
      <main key={route.page + (route.slug || "")}>{view}</main>
      <Footer go={go} s={s} />
      <Toast msg={toastMsg} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
