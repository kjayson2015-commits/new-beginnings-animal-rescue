/* Admin dashboard for New Beginnings Animal Rescue. */
const API = window.NB.api;
const DEMO = window.NB.mode === "demo";

const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "dogs", label: "Dogs", icon: "Dog" },
  { id: "applications", label: "Applications", icon: "ClipboardList" },
  { id: "messages", label: "Messages", icon: "Inbox" },
  { id: "tails", label: "Happy Tails", icon: "Smile" },
  { id: "settings", label: "Site Settings", icon: "Settings" },
  { id: "team", label: "Team", icon: "Users" },
];
const fmtDate = (d) => { try { return new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }); } catch (e) { return ""; } };
const APP_STATUSES = ["New", "Reviewing", "Approved", "Declined", "Withdrawn"];
const APP_STYLE = { New: "bg-terra text-white", Reviewing: "bg-sand text-ink", Approved: "bg-sage text-white", Declined: "bg-[#A39C94] text-white", Withdrawn: "bg-[#D9D3CC] text-ink" };
const MSG_STYLE = { New: "bg-terra text-white", Replied: "bg-sage text-white", Archived: "bg-[#D9D3CC] text-ink" };
const Pill = ({ cls, children }) => <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${cls}`}>{children}</span>;

/* ---------- small building blocks ---------- */
function Modal({ open, onClose, title, children, wide, footer }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-2 md:p-6 bg-ink/30 backdrop-blur-sm fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`glass-strong rounded-3xl w-full ${wide ? "max-w-4xl" : "max-w-lg"} max-h-[96vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/70">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/70 flex items-center justify-center" aria-label="Close"><Icon name="X" /></button>
        </div>
        <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-white/70 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

function useConfirm() {
  const [state, setState] = useState(null);
  const ask = (opts) => new Promise(res => setState({ ...opts, res }));
  const node = state && (
    <Modal open title={state.title || "Are you sure?"} onClose={() => { state.res(false); setState(null); }}
      footer={<>
        <Button variant="glass" onClick={() => { state.res(false); setState(null); }}>Cancel</Button>
        <Button variant={state.danger ? "danger" : "primary"} onClick={() => { state.res(true); setState(null); }}>{state.confirm || "Confirm"}</Button>
      </>}>
      <p className="text-muted">{state.message}</p>
    </Modal>
  );
  return [ask, node];
}

function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex items-center gap-3 min-h-[44px] text-left">
      <span className={`w-11 h-6 rounded-full relative transition ${checked ? "bg-sage" : "bg-[#D9D3CC]"}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} /></span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function Card({ children, className = "" }) { return <div className={`glass rounded-3xl p-5 md:p-6 ${className}`}>{children}</div>; }
function PageHead({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div><h1 className="text-2xl md:text-3xl font-extrabold">{title}</h1>{subtitle && <p className="text-muted mt-1">{subtitle}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
function Empty({ icon, text, action }) {
  return <Card className="text-center py-12"><Icon name={icon} size={40} className="mx-auto text-muted mb-3" /><p className="font-bold mb-4">{text}</p>{action}</Card>;
}

function PhotoManager({ photos, onChange, toast, single }) {
  const [busy, setBusy] = useState(false); const [url, setUrl] = useState("");
  const fileRef = useRef(null);
  const upload = async (files) => {
    setBusy(true);
    try {
      const urls = [];
      for (const f of Array.from(files)) {
        if (!f.type.startsWith("image/")) continue;
        if (f.size > 8 * 1024 * 1024) { toast(`${f.name} is over 8 MB — please use a smaller photo`); continue; }
        urls.push(await API.upload(f));
      }
      onChange(single ? urls.slice(0, 1) : [...photos, ...urls]);
      if (urls.length) toast(`${urls.length} photo${urls.length > 1 ? "s" : ""} uploaded`);
    } catch (e) { toast("Upload failed: " + e.message); }
    setBusy(false); if (fileRef.current) fileRef.current.value = "";
  };
  const move = (i, d) => { const a = [...photos]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; onChange(a); };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {photos.map((p, i) => (
          <div key={p + i} className="relative w-28 h-24 rounded-2xl overflow-hidden border-2 border-white/80 group">
            <img src={p} alt="" className="w-full h-full object-cover" />
            {i === 0 && !single && <span className="absolute top-1 left-1 bg-ink text-white text-[10px] font-bold rounded-full px-2 py-0.5">Cover</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/60 p-1">
              {!single && <button type="button" onClick={() => move(i, -1)} className="w-7 h-7 rounded-full text-white hover:bg-white/20 flex items-center justify-center" aria-label="Move left"><Icon name="ChevronLeft" size={16} /></button>}
              <button type="button" onClick={() => onChange(photos.filter((_, k) => k !== i))} className="w-7 h-7 rounded-full text-white hover:bg-white/20 flex items-center justify-center" aria-label="Remove photo"><Icon name="Trash2" size={14} /></button>
              {!single && <button type="button" onClick={() => move(i, 1)} className="w-7 h-7 rounded-full text-white hover:bg-white/20 flex items-center justify-center" aria-label="Move right"><Icon name="ChevronRight" size={16} /></button>}
            </div>
          </div>
        ))}
        {(!single || photos.length === 0) && (
          <label className={`w-28 h-24 rounded-2xl border-2 border-dashed border-[#D9CFC3] flex flex-col items-center justify-center gap-1 text-sm font-semibold text-muted cursor-pointer hover:bg-white/60 ${busy ? "opacity-50 pointer-events-none" : ""}`}
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}>
            <Icon name={busy ? "Loader" : "ImagePlus"} className={busy ? "animate-spin" : ""} />{busy ? "Uploading" : "Add photo"}
            <input ref={fileRef} type="file" accept="image/*" multiple={!single} className="sr-only" onChange={(e) => upload(e.target.files)} />
          </label>
        )}
      </div>
      <div className="flex gap-2">
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="…or paste a photo link (https://…)" className={inputCls + " py-2"} />
        <Button variant="glass" onClick={() => { if (/^https?:\/\//.test(url)) { onChange(single ? [url] : [...photos, url]); setUrl(""); } else toast("Paste a full link starting with https://"); }}>Add</Button>
      </div>
      {!single && <p className="text-xs text-muted">The first photo is the cover. Drag files onto "Add photo" or click to choose several at once.</p>}
    </div>
  );
}

function ChipsInput({ value, onChange, placeholder }) {
  const [t, setT] = useState("");
  const add = () => { const v = t.trim(); if (v && !value.includes(v)) onChange([...value, v]); setT(""); };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {value.map(v => <span key={v} className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-[#E9E2D9] pl-3 pr-1 py-1 text-sm font-semibold">{v}<button type="button" onClick={() => onChange(value.filter(x => x !== v))} className="w-6 h-6 rounded-full hover:bg-[#EFE9E2] flex items-center justify-center" aria-label={`Remove ${v}`}><Icon name="X" size={12} /></button></span>)}
      </div>
      <div className="flex gap-2">
        <input value={t} onChange={e => setT(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder} className={inputCls + " py-2"} />
        <Button variant="glass" onClick={add}>Add</Button>
      </div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ go, toast }) {
  const [d, setD] = useState(null);
  const load = async () => {
    const [dogs, apps, msgs] = await Promise.all([API.list("dogs"), API.list("applications"), API.list("messages")]);
    setD({ dogs, apps, msgs });
  };
  useEffect(() => { load().catch(e => toast(e.message)); }, []);
  if (!d) return <Spinner />;
  const c = (arr, f) => arr.filter(f).length;
  const stats = [
    { label: "Available dogs", value: c(d.dogs, x => x.status === "Available"), icon: "Dog", go: "dogs", tone: "bg-sage" },
    { label: "Pending adoptions", value: c(d.dogs, x => x.status === "Pending"), icon: "Clock", go: "dogs", tone: "bg-sand" },
    { label: "Adopted", value: c(d.dogs, x => x.status === "Adopted"), icon: "PartyPopper", go: "dogs", tone: "bg-[#A39C94]" },
    { label: "New applications", value: c(d.apps, x => x.status === "New"), icon: "ClipboardList", go: "applications", tone: "bg-terra" },
    { label: "New messages", value: c(d.msgs, x => x.status === "New"), icon: "Inbox", go: "messages", tone: "bg-terra" },
  ];
  return (
    <div className="fade-in">
      <PageHead title="Welcome back" subtitle="Here's what's happening at the rescue." actions={<><Button onClick={() => go("dogs", { add: true })}><Icon name="Plus" size={18} /> Add a dog</Button><a href="index.html" target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold glass min-h-[44px]"><Icon name="ExternalLink" size={16} /> View website</a></>} />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(s => (
          <button key={s.label} onClick={() => go(s.go)} className="glass rounded-3xl p-5 text-left hover:-translate-y-0.5 transition">
            <span className={`w-10 h-10 rounded-xl ${s.tone} text-white flex items-center justify-center mb-3`}><Icon name={s.icon} size={18} /></span>
            <div className="text-3xl font-extrabold">{s.value}</div><div className="text-sm text-muted font-semibold">{s.label}</div>
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center justify-between mb-4"><h2 className="font-extrabold text-lg">Latest applications</h2><button onClick={() => go("applications")} className="text-sm font-bold text-terraText">See all</button></div>
          {d.apps.length === 0 ? <p className="text-muted">No applications yet. They'll appear here as soon as someone applies.</p> :
            <ul className="flex flex-col gap-2">{d.apps.slice(0, 5).map(a => (
              <li key={a.id}><button onClick={() => go("applications", { id: a.id })} className="w-full flex items-center justify-between gap-3 rounded-2xl bg-white/60 hover:bg-white/90 px-4 py-3 text-left">
                <span><span className="font-bold">{a.name}</span><span className="text-muted text-sm"> for {a.dog_name || "any dog"}</span><br /><span className="text-xs text-muted">{fmtDate(a.created_at)}</span></span>
                <Pill cls={APP_STYLE[a.status]}>{a.status}</Pill></button></li>))}</ul>}
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4"><h2 className="font-extrabold text-lg">Latest messages</h2><button onClick={() => go("messages")} className="text-sm font-bold text-terraText">See all</button></div>
          {d.msgs.length === 0 ? <p className="text-muted">No messages yet.</p> :
            <ul className="flex flex-col gap-2">{d.msgs.slice(0, 5).map(m => (
              <li key={m.id}><button onClick={() => go("messages", { id: m.id })} className="w-full flex items-center justify-between gap-3 rounded-2xl bg-white/60 hover:bg-white/90 px-4 py-3 text-left">
                <span className="min-w-0"><span className="font-bold">{m.name}</span><span className="text-muted text-sm"> · {m.topic}</span><br /><span className="text-xs text-muted truncate block">{m.message}</span></span>
                <Pill cls={MSG_STYLE[m.status]}>{m.status}</Pill></button></li>))}</ul>}
        </Card>
      </div>
      {DEMO && (
        <Card className="mt-5 bg-sand/30">
          <h2 className="font-extrabold text-lg mb-2 flex items-center gap-2"><Icon name="FlaskConical" size={20} /> You're in demo mode</h2>
          <p className="text-muted mb-4">Everything you change here is saved only in this browser and shows on the website in this browser. Connect Supabase (see the README) to make it real and shared with your team.</p>
          <Button variant="glass" onClick={async () => { await API.resetDemo(); toast("Demo data reset"); setTimeout(() => window.location.reload(), 400); }}><Icon name="RotateCcw" size={16} /> Reset demo data</Button>
        </Card>
      )}
    </div>
  );
}

/* ---------- Dogs ---------- */
const BLANK_DOG = { name: "", breed: "", age_label: "", age_group: "Adult", weight: 30, size: "Medium", sex: "Female", status: "Available", energy: "Medium",
  spay_neuter: true, vaccines: true, kids: false, dogs: false, cats: false, house_trained: false, featured: false, urgent: false, traits: [], bio: "", routine: "", ideal_home: "",
  photos: [], coat: "#C98B52", ear: "#7A4E2D", adoption_fee: "", published: true, sort_order: 0 };

function DogEditor({ dog, all, onClose, onSaved, toast }) {
  const [f, setF] = useState({ ...BLANK_DOG, ...dog });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const inp = (k, type = "text") => <input type={type} value={f[k] ?? ""} onChange={e => set(k, type === "number" ? Number(e.target.value) : e.target.value)} className={inputCls} />;
  const sel = (k, opts) => <select value={f[k]} onChange={e => set(k, e.target.value)} className={inputCls}>{opts.map(o => <option key={o}>{o}</option>)}</select>;
  const save = async () => {
    if (!f.name.trim()) { toast("Please give the dog a name"); return; }
    setBusy(true);
    try {
      const row = { ...f }; delete row.id; delete row.created_at; delete row.updated_at;
      if (!dog.id) {
        let slug = window.NB.slugify(f.name); const taken = new Set(all.map(x => x.slug));
        if (taken.has(slug)) { let n = 2; while (taken.has(`${slug}-${n}`)) n++; slug = `${slug}-${n}`; }
        row.slug = slug; row.sort_order = Math.min(0, ...all.map(x => x.sort_order || 0)) - 1;
        await API.insert("dogs", row); toast(`${f.name} added`);
      } else { await API.update("dogs", dog.id, row); toast(`${f.name} saved`); }
      onSaved();
    } catch (e) { toast("Couldn't save: " + e.message); }
    setBusy(false);
  };
  return (
    <Modal open wide title={dog.id ? `Edit ${dog.name}` : "Add a dog"} onClose={onClose}
      footer={<><Button variant="glass" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={busy}><Icon name="Save" size={16} /> {busy ? "Saving…" : "Save dog"}</Button></>}>
      <div className="flex flex-col gap-6">
        <section><h3 className="font-extrabold mb-3">Photos</h3><PhotoManager photos={f.photos || []} onChange={v => set("photos", v)} toast={toast} /></section>
        <section className="grid md:grid-cols-3 gap-4">
          <Field label="Name">{inp("name")}</Field>
          <Field label="Breed / mix">{inp("breed")}</Field>
          <Field label="Sex">{sel("sex", ["Female", "Male"])}</Field>
          <Field label="Age (shown on site)" hint="e.g. 2 years, 5 months">{inp("age_label")}</Field>
          <Field label="Age group">{sel("age_group", ["Puppy", "Young", "Adult", "Senior"])}</Field>
          <Field label="Weight (lbs)">{inp("weight", "number")}</Field>
          <Field label="Size">{sel("size", ["Small", "Medium", "Large"])}</Field>
          <Field label="Energy">{sel("energy", ["Low", "Medium", "High"])}</Field>
          <Field label="Status">{sel("status", ["Available", "Pending", "Adopted"])}</Field>
          <Field label="Adoption fee (optional)" hint="Leave blank to use your standard fees">{inp("adoption_fee")}</Field>
        </section>
        <section className="grid sm:grid-cols-2 md:grid-cols-4 gap-x-4">
          <Switch checked={f.kids} onChange={v => set("kids", v)} label="Good with kids" />
          <Switch checked={f.dogs} onChange={v => set("dogs", v)} label="Good with dogs" />
          <Switch checked={f.cats} onChange={v => set("cats", v)} label="Good with cats" />
          <Switch checked={f.house_trained} onChange={v => set("house_trained", v)} label="House-trained" />
          <Switch checked={f.spay_neuter} onChange={v => set("spay_neuter", v)} label="Spayed / neutered" />
          <Switch checked={f.vaccines} onChange={v => set("vaccines", v)} label="Vaccines current" />
          <Switch checked={f.featured} onChange={v => set("featured", v)} label="Feature on homepage" />
          <Switch checked={f.urgent} onChange={v => set("urgent", v)} label="Mark as urgent" />
          <Switch checked={f.published} onChange={v => set("published", v)} label="Visible on website" />
        </section>
        <Field label="Personality tags (up to 3 show on cards)"><ChipsInput value={f.traits || []} onChange={v => set("traits", v)} placeholder="e.g. Couch potato — press Enter" /></Field>
        <Field label="Personality & story"><textarea rows="4" value={f.bio} onChange={e => set("bio", e.target.value)} className={inputCls} /></Field>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="A day in the life"><textarea rows="3" value={f.routine} onChange={e => set("routine", e.target.value)} className={inputCls} /></Field>
          <Field label="Ideal home"><textarea rows="3" value={f.ideal_home} onChange={e => set("ideal_home", e.target.value)} className={inputCls} /></Field>
        </div>
        {(f.photos || []).length === 0 && (
          <section className="flex flex-wrap items-center gap-4">
            <div className="w-28 h-20 rounded-2xl overflow-hidden"><DogArt dog={f} className="w-full h-full" /></div>
            <Field label="Illustration coat color"><input type="color" value={f.coat} onChange={e => set("coat", e.target.value)} className="w-16 h-11 rounded-xl" /></Field>
            <Field label="Ear color"><input type="color" value={f.ear} onChange={e => set("ear", e.target.value)} className="w-16 h-11 rounded-xl" /></Field>
            <p className="text-xs text-muted max-w-xs">Shown only until you add a real photo.</p>
          </section>
        )}
      </div>
    </Modal>
  );
}

function DogsAdmin({ toast, confirm, params }) {
  const [rows, setRows] = useState(null); const [q, setQ] = useState(""); const [tab, setTab] = useState("All");
  const [edit, setEdit] = useState(params && params.add ? {} : null);
  const load = async () => { try { setRows(await API.list("dogs")); } catch (e) { toast(e.message); setRows([]); } };
  useEffect(() => { load(); }, []);
  const quick = async (d, patch, msg) => { try { await API.update("dogs", d.id, patch); toast(msg); load(); } catch (e) { toast(e.message); } };
  const del = async (d) => { if (await confirm({ title: `Delete ${d.name}?`, message: "This removes the dog and their profile from the website. This can't be undone. (Tip: set status to Adopted or hide it instead to keep a record.)", confirm: "Delete", danger: true })) { await API.remove("dogs", d.id); toast(`${d.name} deleted`); load(); } };
  const dup = async (d) => { const { id, created_at, updated_at, ...rest } = d; let slug = `${d.slug}-copy`, n = 2; const taken = new Set(rows.map(r => r.slug)); while (taken.has(slug)) slug = `${d.slug}-copy-${n++}`; await API.insert("dogs", { ...rest, name: `${d.name} (copy)`, slug, published: false }); toast("Copy created (hidden)"); load(); };
  const move = async (i, dir) => {
    const list = [...view]; const j = i + dir; if (j < 0 || j >= list.length) return;
    const a = list[i], b = list[j];
    const ao = a.sort_order || 0, bo = b.sort_order || 0;
    await API.update("dogs", a.id, { sort_order: bo === ao ? bo + dir : bo }); await API.update("dogs", b.id, { sort_order: ao }); load();
  };
  if (!rows) return <Spinner />;
  const counts = { All: rows.length, Available: 0, Pending: 0, Adopted: 0, Hidden: 0 };
  rows.forEach(r => { counts[r.status]++; if (!r.published) counts.Hidden++; });
  const view = rows.filter(r => (tab === "All" || (tab === "Hidden" ? !r.published : r.status === tab)) && (!q || `${r.name} ${r.breed}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="fade-in">
      <PageHead title="Dogs" subtitle="Add, edit and organise every dog on the website." actions={<Button onClick={() => setEdit({})}><Icon name="Plus" size={18} /> Add a dog</Button>} />
      <Card className="mb-5 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex flex-wrap gap-2">{Object.keys(counts).map(t => <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t} className={`rounded-full px-4 py-2 text-sm font-semibold min-h-[40px] ${tab === t ? "bg-ink text-white" : "bg-white/60 text-muted hover:text-ink"}`}>{t} <span className="opacity-70">{counts[t]}</span></button>)}</div>
        <label className="relative md:ml-auto md:w-72"><span className="sr-only">Search dogs</span><Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or breed" className={inputCls + " pl-9 py-2"} /></label>
      </Card>
      {view.length === 0 ? <Empty icon="Dog" text="No dogs here yet." action={<Button onClick={() => setEdit({})}>Add your first dog</Button>} /> : (
        <div className="flex flex-col gap-3">
          {view.map((d, i) => (
            <div key={d.id} className={`glass rounded-3xl p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-4 ${!d.published ? "opacity-70" : ""}`}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex flex-col">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="w-8 h-8 rounded-full hover:bg-white/70 disabled:opacity-30 flex items-center justify-center" aria-label={`Move ${d.name} up`}><Icon name="ChevronUp" size={16} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === view.length - 1} className="w-8 h-8 rounded-full hover:bg-white/70 disabled:opacity-30 flex items-center justify-center" aria-label={`Move ${d.name} down`}><Icon name="ChevronDown" size={16} /></button>
                </div>
                <div className="w-20 h-16 rounded-2xl overflow-hidden shrink-0"><DogPhoto dog={d} className="w-full h-full" /></div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-extrabold text-lg">{d.name}</span>
                    {d.featured && <Pill cls="bg-sand text-ink">★ Featured</Pill>}{d.urgent && <Pill cls="bg-terra text-white">Urgent</Pill>}{!d.published && <Pill cls="bg-[#D9D3CC] text-ink">Hidden</Pill>}</div>
                  <p className="text-sm text-muted truncate">{d.breed} · {d.age_label} · {d.weight} lbs · {(d.photos || []).length} photo{(d.photos || []).length === 1 ? "" : "s"}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`st-${d.id}`}>Status for {d.name}</label>
                <select id={`st-${d.id}`} value={d.status} onChange={e => quick(d, { status: e.target.value }, `${d.name} is now ${e.target.value}`)} className="rounded-full bg-white/80 border border-[#E9E2D9] px-3 py-2 text-sm font-bold min-h-[40px]">
                  {["Available", "Pending", "Adopted"].map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => quick(d, { featured: !d.featured }, d.featured ? "Removed from homepage" : "Featured on homepage")} title="Feature on homepage" aria-label="Toggle featured" className={`w-10 h-10 rounded-full flex items-center justify-center ${d.featured ? "bg-sand" : "hover:bg-white/70"}`}><Icon name="Star" size={18} /></button>
                <button onClick={() => quick(d, { published: !d.published }, d.published ? "Hidden from website" : "Visible on website")} title={d.published ? "Hide from website" : "Show on website"} aria-label="Toggle visible" className="w-10 h-10 rounded-full hover:bg-white/70 flex items-center justify-center"><Icon name={d.published ? "Eye" : "EyeOff"} size={18} /></button>
                <button onClick={() => dup(d)} title="Duplicate" aria-label="Duplicate" className="w-10 h-10 rounded-full hover:bg-white/70 flex items-center justify-center"><Icon name="Copy" size={18} /></button>
                <a href={`index.html#dog-${d.slug}`} target="_blank" rel="noopener" title="View on website" aria-label="View on website" className="w-10 h-10 rounded-full hover:bg-white/70 flex items-center justify-center"><Icon name="ExternalLink" size={18} /></a>
                <button onClick={() => del(d)} title="Delete" aria-label="Delete" className="w-10 h-10 rounded-full hover:bg-[#F6DCD5] text-[#B8432C] flex items-center justify-center"><Icon name="Trash2" size={18} /></button>
                <Button variant="dark" onClick={() => setEdit(d)} className="py-2"><Icon name="Pencil" size={16} /> Edit</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {edit && <DogEditor dog={edit} all={rows} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} toast={toast} />}
    </div>
  );
}

/* ---------- Applications ---------- */
const APP_LABELS = { cityState: "City / State", housing: "Own or rent", landlordName: "Landlord name", landlordPhone: "Landlord phone", yard: "Yard & fence", adults: "Adults in home", kids: "Children", pets: "Current pets", vet: "Vet reference", hoursAlone: "Hours alone", exercise: "Exercise plan", experience: "Experience", waiverAgreed: "Agreed to contract & waiver" };

function toCSV(rows) {
  const keys = ["created_at", "status", "dog_name", "name", "email", "phone", ...Object.keys(APP_LABELS), "notes"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map(r => keys.map(k => esc(k in r ? r[k] : (r.data || {})[k])).join(","))].join("\n");
}

function ApplicationsAdmin({ toast, confirm, params }) {
  const [rows, setRows] = useState(null); const [sel, setSel] = useState(params && params.id); const [tab, setTab] = useState("All"); const [q, setQ] = useState("");
  const [notes, setNotes] = useState("");
  const load = async () => { try { setRows(await API.list("applications")); } catch (e) { toast(e.message); setRows([]); } };
  useEffect(() => { load(); }, []);
  const cur = rows && rows.find(r => r.id === sel);
  useEffect(() => { setNotes(cur ? cur.notes || "" : ""); }, [sel, rows && rows.length]);
  if (!rows) return <Spinner />;
  const view = rows.filter(r => (tab === "All" || r.status === tab) && (!q || `${r.name} ${r.email} ${r.dog_name}`.toLowerCase().includes(q.toLowerCase())));
  const setStatus = async (s) => { await API.update("applications", cur.id, { status: s }); toast(`Marked ${s}`); load(); };
  const markDog = async (status) => { try { await API.update("dogs", cur.dog_id, { status }); toast(`${cur.dog_name} set to ${status}`); } catch (e) { toast(e.message); } };
  const exportCSV = () => {
    const blob = new Blob([toCSV(view)], { type: "text/csv" }); const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); a.remove();
  };
  return (
    <div className="fade-in">
      <PageHead title="Applications" subtitle="Review adoption applications and track each one." actions={<Button variant="glass" onClick={exportCSV} disabled={!view.length}><Icon name="Download" size={16} /> Export CSV</Button>} />
      <Card className="mb-5 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex flex-wrap gap-2">{["All", ...APP_STATUSES].map(t => <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t} className={`rounded-full px-4 py-2 text-sm font-semibold min-h-[40px] ${tab === t ? "bg-ink text-white" : "bg-white/60 text-muted hover:text-ink"}`}>{t} <span className="opacity-70">{t === "All" ? rows.length : rows.filter(r => r.status === t).length}</span></button>)}</div>
        <label className="relative md:ml-auto md:w-72"><span className="sr-only">Search applications</span><Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email or dog" className={inputCls + " pl-9 py-2"} /></label>
      </Card>
      {view.length === 0 ? <Empty icon="ClipboardList" text="No applications here yet." /> : (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-5 items-start">
          <div className="flex flex-col gap-2">
            {view.map(a => (
              <button key={a.id} onClick={() => setSel(a.id)} className={`glass rounded-2xl px-4 py-3 text-left flex items-center justify-between gap-3 ${sel === a.id ? "ring-2 ring-terra" : ""}`}>
                <span className="min-w-0"><span className="font-bold block truncate">{a.name}</span><span className="text-sm text-muted block truncate">{a.dog_name || "Any dog"} · {fmtDate(a.created_at)}</span></span>
                <Pill cls={APP_STYLE[a.status]}>{a.status}</Pill>
              </button>
            ))}
          </div>
          {cur ? (
            <Card className="lg:sticky lg:top-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div><h2 className="text-2xl font-extrabold">{cur.name}</h2><p className="text-muted">Applied for <strong className="text-ink">{cur.dog_name || "any dog"}</strong> · {fmtDate(cur.created_at)}</p></div>
                <Pill cls={APP_STYLE[cur.status]}>{cur.status}</Pill>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold break-all"><Icon name="Mail" size={14} className="inline mr-1" />{cur.email}</span>
                <span className="rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold"><Icon name="Phone" size={14} className="inline mr-1" />{cur.phone || "—"}</span>
                <Button variant="glass" className="py-1.5 text-sm" onClick={() => copyText(cur.email, toast)}><Icon name="Copy" size={14} /> Copy email</Button>
                <a className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-bold glass min-h-[40px]" href={`mailto:${cur.email}?subject=${encodeURIComponent("Your application for " + (cur.dog_name || "a dog"))}`}><Icon name="Reply" size={14} /> Email them</a>
              </div>
              <dl className="grid sm:grid-cols-2 gap-2 mb-5">
                {Object.keys(APP_LABELS).filter(k => (cur.data || {})[k] !== undefined && (cur.data || {})[k] !== "").map(k => (
                  <div key={k} className="rounded-2xl bg-white/60 px-4 py-2"><dt className="text-xs font-bold uppercase tracking-wider text-muted">{APP_LABELS[k]}</dt><dd className="font-semibold break-words whitespace-pre-line">{String(cur.data[k] === true ? "Yes" : cur.data[k] === false ? "No" : cur.data[k])}</dd></div>
                ))}
              </dl>
              <p className="text-sm font-bold mb-2">Set status</p>
              <div className="flex flex-wrap gap-2 mb-5">{APP_STATUSES.map(s => <button key={s} onClick={() => setStatus(s)} aria-pressed={cur.status === s} className={`rounded-full px-4 py-2 text-sm font-bold min-h-[40px] ${cur.status === s ? APP_STYLE[s] : "bg-white/60 text-muted hover:text-ink"}`}>{s}</button>)}</div>
              {cur.dog_id && <div className="flex flex-wrap gap-2 mb-5"><Button variant="glass" className="text-sm" onClick={() => markDog("Pending")}>Mark {cur.dog_name} as Pending</Button><Button variant="glass" className="text-sm" onClick={() => markDog("Adopted")}>Mark {cur.dog_name} as Adopted</Button></div>}
              <Field label="Internal notes (only staff see these)"><textarea rows="4" value={notes} onChange={e => setNotes(e.target.value)} className={inputCls} placeholder="Reference check results, meet & greet date…" /></Field>
              <div className="flex flex-wrap justify-between gap-2 mt-3">
                <Button variant="ghost" className="text-[#B8432C]" onClick={async () => { if (await confirm({ title: "Delete this application?", message: "It will be permanently removed. This can't be undone.", confirm: "Delete", danger: true })) { await API.remove("applications", cur.id); setSel(null); toast("Application deleted"); load(); } }}><Icon name="Trash2" size={16} /> Delete</Button>
                <Button onClick={async () => { await API.update("applications", cur.id, { notes }); toast("Notes saved"); load(); }}><Icon name="Save" size={16} /> Save notes</Button>
              </div>
            </Card>
          ) : <Card className="text-center text-muted py-16">Select an application to see the details.</Card>}
        </div>
      )}
    </div>
  );
}

/* ---------- Messages ---------- */
function MessagesAdmin({ toast, confirm, params }) {
  const [rows, setRows] = useState(null); const [sel, setSel] = useState(params && params.id); const [tab, setTab] = useState("New");
  const load = async () => { try { setRows(await API.list("messages")); } catch (e) { toast(e.message); setRows([]); } };
  useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;
  const view = rows.filter(r => tab === "All" || r.status === tab);
  const cur = rows.find(r => r.id === sel);
  const setStatus = async (s) => { await API.update("messages", cur.id, { status: s }); toast(`Marked ${s}`); load(); };
  return (
    <div className="fade-in">
      <PageHead title="Messages" subtitle="Questions sent through the contact form." />
      <div className="flex flex-wrap gap-2 mb-5">{["New", "Replied", "Archived", "All"].map(t => <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t} className={`rounded-full px-4 py-2 text-sm font-semibold min-h-[40px] ${tab === t ? "bg-ink text-white" : "glass text-muted hover:text-ink"}`}>{t} <span className="opacity-70">{t === "All" ? rows.length : rows.filter(r => r.status === t).length}</span></button>)}</div>
      {view.length === 0 ? <Empty icon="Inbox" text={`No ${tab === "All" ? "" : tab.toLowerCase() + " "}messages.`} /> : (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-5 items-start">
          <div className="flex flex-col gap-2">
            {view.map(m => (
              <button key={m.id} onClick={() => setSel(m.id)} className={`glass rounded-2xl px-4 py-3 text-left ${sel === m.id ? "ring-2 ring-terra" : ""}`}>
                <div className="flex items-center justify-between gap-2"><span className="font-bold truncate">{m.name}</span><Pill cls={MSG_STYLE[m.status]}>{m.status}</Pill></div>
                <p className="text-sm text-muted truncate">{m.topic} · {m.message}</p><p className="text-xs text-muted">{fmtDate(m.created_at)}</p>
              </button>
            ))}
          </div>
          {cur ? (
            <Card className="lg:sticky lg:top-6">
              <h2 className="text-2xl font-extrabold">{cur.name}</h2>
              <p className="text-muted mb-4">{cur.topic} · {fmtDate(cur.created_at)}</p>
              <p className="rounded-2xl bg-white/70 p-4 whitespace-pre-line mb-4">{cur.message}</p>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold break-all">{cur.email}</span>
                <Button variant="glass" className="py-1.5 text-sm" onClick={() => copyText(cur.email, toast)}><Icon name="Copy" size={14} /> Copy</Button>
                <a className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-bold bg-terra text-white min-h-[40px]" href={`mailto:${cur.email}?subject=${encodeURIComponent("Re: " + cur.topic)}`}><Icon name="Reply" size={14} /> Reply by email</a>
              </div>
              <div className="flex flex-wrap gap-2">
                {["New", "Replied", "Archived"].map(s => <button key={s} onClick={() => setStatus(s)} aria-pressed={cur.status === s} className={`rounded-full px-4 py-2 text-sm font-bold min-h-[40px] ${cur.status === s ? MSG_STYLE[s] : "bg-white/60 text-muted hover:text-ink"}`}>{s}</button>)}
                <Button variant="ghost" className="ml-auto text-[#B8432C]" onClick={async () => { if (await confirm({ title: "Delete this message?", message: "This can't be undone.", confirm: "Delete", danger: true })) { await API.remove("messages", cur.id); setSel(null); toast("Message deleted"); load(); } }}><Icon name="Trash2" size={16} /> Delete</Button>
              </div>
            </Card>
          ) : <Card className="text-center text-muted py-16">Select a message to read it.</Card>}
        </div>
      )}
    </div>
  );
}

/* ---------- Happy Tails ---------- */
function TailsAdmin({ toast, confirm }) {
  const [rows, setRows] = useState(null); const [edit, setEdit] = useState(null); const [busy, setBusy] = useState(false);
  const load = async () => { try { setRows(await API.list("happy_tails")); } catch (e) { toast(e.message); setRows([]); } };
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!edit.name) { toast("Add the dog's name"); return; }
    setBusy(true);
    try { const { id, created_at, ...row } = edit; if (id) await API.update("happy_tails", id, row); else await API.insert("happy_tails", { published: true, sort_order: 0, ...row }); toast("Saved"); setEdit(null); load(); }
    catch (e) { toast(e.message); }
    setBusy(false);
  };
  if (!rows) return <Spinner />;
  return (
    <div className="fade-in">
      <PageHead title="Happy Tails" subtitle="Adopted dogs and their families, shown on the About page." actions={<Button onClick={() => setEdit({ name: "", adopter: "", quote: "", photo: "", published: true })}><Icon name="Plus" size={18} /> Add a story</Button>} />
      {rows.length === 0 ? <Empty icon="Smile" text="No happy tails yet." /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map(t => (
            <Card key={t.id} className={`p-0 overflow-hidden ${!t.published ? "opacity-70" : ""}`}>
              <div className="aspect-[4/3]">{t.photo ? <img src={t.photo} alt="" className="w-full h-full object-cover" /> : <DogArt dog={{ name: t.name, slug: t.id }} className="w-full h-full" />}</div>
              <div className="p-5">
                <p className="font-extrabold text-lg">{t.name} {!t.published && <Pill cls="bg-[#D9D3CC] text-ink">Hidden</Pill>}</p>
                <p className="text-sm text-muted italic line-clamp-2">"{t.quote}"</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="dark" className="py-2 text-sm" onClick={() => setEdit(t)}><Icon name="Pencil" size={14} /> Edit</Button>
                  <Button variant="glass" className="py-2 text-sm" onClick={async () => { await API.update("happy_tails", t.id, { published: !t.published }); load(); }}>{t.published ? "Hide" : "Show"}</Button>
                  <button className="w-10 h-10 rounded-full hover:bg-[#F6DCD5] text-[#B8432C] flex items-center justify-center ml-auto" aria-label="Delete" onClick={async () => { if (await confirm({ title: "Delete this story?", message: "This can't be undone.", confirm: "Delete", danger: true })) { await API.remove("happy_tails", t.id); load(); } }}><Icon name="Trash2" size={16} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {edit && (
        <Modal open title={edit.id ? "Edit story" : "Add a happy tail"} onClose={() => setEdit(null)} footer={<><Button variant="glass" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button></>}>
          <div className="flex flex-col gap-4">
            <Field label="Photo"><PhotoManager single photos={edit.photo ? [edit.photo] : []} onChange={v => setEdit({ ...edit, photo: v[0] || "" })} toast={toast} /></Field>
            <Field label="Dog's name"><input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} className={inputCls} /></Field>
            <Field label="Adopter (shown as '— name')"><input value={edit.adopter} onChange={e => setEdit({ ...edit, adopter: e.target.value })} className={inputCls} placeholder="e.g. The Garcia family" /></Field>
            <Field label="Quote from the adopter"><textarea rows="3" value={edit.quote} onChange={e => setEdit({ ...edit, quote: e.target.value })} className={inputCls} /></Field>
            <Switch checked={edit.published !== false} onChange={v => setEdit({ ...edit, published: v })} label="Show on website" />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Settings ---------- */
function ListEditor({ items, onChange, fields, addLabel }) {
  const blank = Object.fromEntries(fields.map(f => [f.key, f.type === "number" ? 0 : ""]));
  const upd = (i, k, v) => onChange(items.map((it, j) => j === i ? { ...it, [k]: v } : it));
  const move = (i, d) => { const a = [...items]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; onChange(a); };
  return (
    <div className="flex flex-col gap-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-2xl bg-white/50 border border-white/70 p-3 flex flex-col md:flex-row gap-3 md:items-end">
          <div className={`grid gap-3 flex-1 ${fields.length > 2 ? "md:grid-cols-3" : fields.length === 2 ? "md:grid-cols-2" : ""}`}>
            {fields.map(f => <Field key={f.key} label={f.label}><input type={f.type || "text"} value={it[f.key] ?? ""} onChange={e => upd(i, f.key, f.type === "number" ? Number(e.target.value) : e.target.value)} className={inputCls + " py-2"} placeholder={f.placeholder} /></Field>)}
          </div>
          <div className="flex gap-1">
            <button type="button" onClick={() => move(i, -1)} className="w-9 h-9 rounded-full hover:bg-white/80 flex items-center justify-center" aria-label="Move up"><Icon name="ChevronUp" size={16} /></button>
            <button type="button" onClick={() => move(i, 1)} className="w-9 h-9 rounded-full hover:bg-white/80 flex items-center justify-center" aria-label="Move down"><Icon name="ChevronDown" size={16} /></button>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="w-9 h-9 rounded-full hover:bg-[#F6DCD5] text-[#B8432C] flex items-center justify-center" aria-label="Remove"><Icon name="Trash2" size={16} /></button>
          </div>
        </div>
      ))}
      <Button variant="glass" className="self-start text-sm" onClick={() => onChange([...items, blank])}><Icon name="Plus" size={16} /> {addLabel}</Button>
    </div>
  );
}
function StringList({ items, onChange, addLabel, multiline }) {
  return <ListEditor items={items.map(v => ({ v }))} onChange={a => onChange(a.map(x => x.v))} fields={[{ key: "v", label: "", }]} addLabel={addLabel} multiline={multiline} />;
}

function Section({ title, icon, children, desc }) {
  return <Card className="mb-5"><h2 className="font-extrabold text-lg mb-1 flex items-center gap-2"><Icon name={icon} size={20} className="text-terraText" />{title}</h2>{desc && <p className="text-sm text-muted mb-4">{desc}</p>}<div className="grid md:grid-cols-2 gap-4 mt-3">{children}</div></Card>;
}

function SettingsAdmin({ toast }) {
  const [s, setS] = useState(null); const [busy, setBusy] = useState(false); const [dirty, setDirty] = useState(false);
  useEffect(() => { API.settings().then(setS).catch(e => toast(e.message)); }, []);
  useEffect(() => { const h = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, [dirty]);
  if (!s) return <Spinner />;
  const set = (k, v) => { setS(p => ({ ...p, [k]: v })); setDirty(true); };
  const txt = (k, label, hint) => <Field label={label} hint={hint}><input value={s[k] ?? ""} onChange={e => set(k, e.target.value)} className={inputCls} /></Field>;
  const area = (k, label, rows = 3) => <Field label={label} full><textarea rows={rows} value={s[k] ?? ""} onChange={e => set(k, e.target.value)} className={inputCls} /></Field>;
  const save = async () => { setBusy(true); try { await API.saveSettings(s); setDirty(false); toast("Settings saved — the website is updated"); } catch (e) { toast("Couldn't save: " + e.message); } setBusy(false); };
  return (
    <div className="fade-in pb-24">
      <PageHead title="Site Settings" subtitle="Everything visitors read on the website — no code needed." actions={<Button onClick={save} disabled={busy || !dirty}><Icon name="Save" size={16} /> {busy ? "Saving…" : dirty ? "Save changes" : "Saved"}</Button>} />
      <Section title="Brand" icon="BadgeCheck">
        {txt("name", "Rescue name")}{txt("shortName", "Short name")}{txt("location", "Location", "e.g. Austin, TX")}{txt("email", "Public email")}
        <Field label="Logo (shown as a circle)" full><div className="flex items-center gap-4"><Logo settings={s} size={72} /><div className="flex-1"><PhotoManager single photos={s.logoUrl ? [s.logoUrl] : []} onChange={v => set("logoUrl", v[0] || "assets/logo.jpg")} toast={toast} /></div></div></Field>
      </Section>
      <Section title="Homepage" icon="House">
        {txt("heroBadge", "Small badge above the headline")}{txt("heroTitle", "Headline")}{txt("heroAccent", "Headline ending (in color)")}
        {area("heroText", "Intro paragraph")}
        <Field label="Floating badges (up to 3)" full><StringList items={s.stats || []} onChange={v => set("stats", v)} addLabel="Add badge" /></Field>
      </Section>
      <Section title="Announcement banner" icon="Megaphone" desc="A thin bar at the top of every page — great for events or urgent appeals.">
        <div className="md:col-span-2"><Switch checked={!!s.noticeOn} onChange={v => set("noticeOn", v)} label="Show the banner" /></div>
        {area("noticeText", "Banner text", 2)}
      </Section>
      <Section title="Adoption fees & policies" icon="Receipt">
        <Field label="Fee cards" full><ListEditor items={s.fees || []} onChange={v => set("fees", v)} addLabel="Add fee" fields={[{ key: "label", label: "Name" }, { key: "range", label: "Who it's for" }, { key: "price", label: "Price" }]} /></Field>
        <Field label="Every fee includes" full><StringList items={s.feeIncludes || []} onChange={v => set("feeIncludes", v)} addLabel="Add item" /></Field>
        {area("privateNotice", "Private-rescue explanation")}
        <Field label="Trust points" full><StringList items={s.privatePoints || []} onChange={v => set("privatePoints", v)} addLabel="Add point" /></Field>
      </Section>
      <Section title="Donations & supplies" icon="HeartHandshake">
        {area("donationDisclaimer", "Disclaimer banner", 2)}
        <Field label="Payment methods" full><ListEditor items={s.payments || []} onChange={v => set("payments", v)} addLabel="Add payment method" fields={[{ key: "label", label: "Name", placeholder: "Venmo, PayPal, Zelle, Cash App…" }, { key: "handle", label: "Handle / link" }, { key: "note", label: "Note" }]} /></Field>
        <Field label="Wishlists" full><ListEditor items={s.wishlists || []} onChange={v => set("wishlists", v)} addLabel="Add wishlist" fields={[{ key: "label", label: "Name" }, { key: "url", label: "Link", placeholder: "https://…" }, { key: "desc", label: "Description" }]} /></Field>
        <Field label="Urgently needed items" full><ListEditor items={s.needs || []} onChange={v => set("needs", v)} addLabel="Add item" fields={[{ key: "title", label: "Item" }, { key: "text", label: "Details" }]} /></Field>
        <Field label="Vet sponsorship amounts" full><ListEditor items={s.sponsorTiers || []} onChange={v => set("sponsorTiers", v)} addLabel="Add amount" fields={[{ key: "amount", label: "Amount ($)", type: "number" }, { key: "label", label: "What it covers" }]} /></Field>
      </Section>
      <Section title="About page" icon="BookHeart">
        <Field label="Our story (one box per paragraph)" full><StringList items={s.story || []} onChange={v => set("story", v)} addLabel="Add paragraph" /></Field>
        <Field label="Social media" full><ListEditor items={s.socials || []} onChange={v => set("socials", v)} addLabel="Add social link" fields={[{ key: "label", label: "Network", placeholder: "Instagram, Facebook, TikTok, YouTube…" }, { key: "url", label: "Link", placeholder: "https://…" }]} /></Field>
      </Section>
      {dirty && <div className="fixed bottom-5 right-5 z-40"><Button onClick={save} disabled={busy} className="shadow-xl"><Icon name="Save" size={16} /> {busy ? "Saving…" : "Save changes"}</Button></div>}
    </div>
  );
}

/* ---------- Team ---------- */
function TeamAdmin({ toast, confirm, user }) {
  const [rows, setRows] = useState(null); const [email, setEmail] = useState(""); const [role, setRole] = useState("staff");
  const load = async () => { try { setRows(await API.listAdmins()); } catch (e) { toast(e.message); setRows([]); } };
  useEffect(() => { load(); }, []);
  const add = async (e) => { e.preventDefault(); try { await API.addAdmin(email.trim(), role); toast(`${email} can now use the admin`); setEmail(""); load(); } catch (x) { toast(x.message); } };
  if (!rows) return <Spinner />;
  return (
    <div className="fade-in">
      <PageHead title="Team" subtitle="People who can log in to this admin." />
      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <Card>
          <ul className="flex flex-col gap-2">
            {rows.map(a => (
              <li key={a.user_id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-4 py-3">
                <span className="min-w-0"><span className="font-bold block truncate">{a.email}</span><span className="text-xs text-muted capitalize">{a.role} · since {fmtDate(a.created_at)}</span></span>
                {(!user || a.user_id !== user.id) && <button onClick={async () => { if (await confirm({ title: `Remove ${a.email}?`, message: "They will no longer be able to use the admin.", confirm: "Remove", danger: true })) { try { await API.removeAdmin(a.user_id); load(); } catch (x) { toast(x.message); } } }} className="w-10 h-10 rounded-full hover:bg-[#F6DCD5] text-[#B8432C] flex items-center justify-center" aria-label={`Remove ${a.email}`}><Icon name="UserMinus" size={18} /></button>}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-extrabold text-lg mb-2">Add a team member</h2>
          <ol className="text-sm text-muted list-decimal pl-5 mb-4 flex flex-col gap-1">
            <li>In Supabase, open <strong>Authentication → Users → Add user</strong> and create them with their email and a temporary password.</li>
            <li>Add the same email below. They can then log in here and change their password with "Forgot password".</li>
          </ol>
          <form onSubmit={add} className="flex flex-col gap-3">
            <Field label="Email"><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} /></Field>
            <Field label="Role"><select value={role} onChange={e => setRole(e.target.value)} className={inputCls}><option value="staff">Staff</option><option value="owner">Owner</option></select></Field>
            <Button type="submit" className="self-start"><Icon name="UserPlus" size={16} /> Add to team</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Login & shell ---------- */
function Login({ onIn, settings }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false);
  const submit = async (e) => { e.preventDefault(); setBusy(true); setErr(""); try { onIn(await API.signIn(email, pw)); } catch (x) { setErr(x.message || "Couldn't sign in"); } setBusy(false); };
  const reset = async () => { if (!email) { setErr("Type your email first, then click Forgot password."); return; } try { await API.resetPassword(email); setSent(true); } catch (x) { setErr(x.message); } };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-strong rounded-[2rem] p-8 w-full max-w-md fade-in">
        <div className="flex flex-col items-center text-center mb-6"><Logo settings={settings} size={88} className="border-4 mb-4" /><h1 className="text-2xl font-extrabold">{settings.name}</h1><p className="text-muted">Staff admin</p></div>
        {DEMO ? (
          <div className="flex flex-col gap-4">
            <p className="rounded-2xl bg-sand/40 p-4 text-sm"><strong>Demo mode.</strong> Supabase isn't connected yet, so this admin uses sample data saved only in your browser. Try everything safely.</p>
            <Button onClick={() => onIn({ email: "demo@admin", id: "demo-admin" })} className="py-3"><Icon name="LogIn" size={18} /> Enter demo admin</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Email"><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} autoComplete="username" /></Field>
            <Field label="Password"><input required type="password" value={pw} onChange={e => setPw(e.target.value)} className={inputCls} autoComplete="current-password" /></Field>
            {err && <p className="text-sm font-semibold text-[#A64B33]" role="alert">{err}</p>}
            {sent && <p className="text-sm font-semibold text-[#2F6B50]">Check your email for a password reset link.</p>}
            <Button type="submit" disabled={busy} className="py-3">{busy ? "Signing in…" : "Sign in"}</Button>
            <button type="button" onClick={reset} className="text-sm font-semibold text-muted hover:text-ink">Forgot password?</button>
          </form>
        )}
        <a href="index.html" className="block text-center text-sm font-semibold text-muted hover:text-ink mt-6">← Back to website</a>
      </div>
    </div>
  );
}

function readAdminHash() { const h = (window.location.hash || "").replace("#", ""); return SECTIONS.some(s => s.id === h) ? h : "dashboard"; }

function AdminApp() {
  const [settings, setSettings] = useState(window.NB.DEFAULT_SETTINGS);
  const [user, setUser] = useState(undefined); const [isAdmin, setIsAdmin] = useState(false);
  const [section, setSection] = useState(readAdminHash()); const [params, setParams] = useState(null);
  const [menu, setMenu] = useState(false);
  const [toastMsg, toast] = useToast(); const [confirm, confirmNode] = useConfirm();

  useEffect(() => {
    API.settings().then(setSettings).catch(() => {});
    (async () => {
      if (DEMO) { setUser(null); return; }
      const u = await API.currentUser().catch(() => null);
      if (u) { setIsAdmin(await API.isAdmin().catch(() => false)); }
      setUser(u);
    })();
    const h = () => { setSection(readAdminHash()); setParams(null); };
    window.addEventListener("hashchange", h); return () => window.removeEventListener("hashchange", h);
  }, []);
  const go = (id, p) => { setParams(p || null); setMenu(false); try { if (window.location.hash !== "#" + id) window.location.hash = id; else setSection(id); } catch (e) { setSection(id); } setSection(id); window.scrollTo({ top: 0 }); };
  const signIn = async (u) => { if (!DEMO) setIsAdmin(await API.isAdmin().catch(() => false)); else setIsAdmin(true); setUser(u); };
  const signOut = async () => { await API.signOut(); setUser(null); setIsAdmin(false); };

  if (user === undefined) return <Spinner label="Checking your login…" />;
  if (!user) return <><Background /><Login onIn={signIn} settings={settings} /></>;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center p-4"><Background />
      <Card className="max-w-md text-center"><Icon name="ShieldAlert" size={40} className="mx-auto text-terraText mb-3" /><h1 className="text-xl font-extrabold mb-2">You're signed in, but not on the team yet</h1><p className="text-muted mb-5">Ask an owner to add <strong>{user.email}</strong> on the Team page. If you're setting up the rescue, follow "First admin" in the README.</p><Button variant="glass" onClick={signOut}>Sign out</Button></Card>
    </div>
  );

  const props = { toast, confirm, params, go, user };
  const views = { dashboard: <Dashboard {...props} />, dogs: <DogsAdmin {...props} />, applications: <ApplicationsAdmin {...props} />, messages: <MessagesAdmin {...props} />, tails: <TailsAdmin {...props} />, settings: <SettingsAdmin {...props} />, team: <TeamAdmin {...props} /> };
  return (
    <div className="min-h-screen">
      <Background />
      <div className="lg:hidden sticky top-0 z-30 p-3"><div className="glass-strong rounded-2xl px-3 py-2 flex items-center justify-between">
        <span className="flex items-center gap-2 font-extrabold"><Logo settings={settings} size={36} /> Admin</span>
        <button onClick={() => setMenu(!menu)} className="w-11 h-11 rounded-full glass flex items-center justify-center" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu}><Icon name={menu ? "X" : "Menu"} /></button>
      </div></div>
      <div className="flex">
        <aside className={`${menu ? "block" : "hidden"} lg:block fixed lg:sticky top-[76px] lg:top-0 left-0 right-0 lg:right-auto z-20 lg:h-screen p-3 lg:w-72 shrink-0`}>
          <nav className="glass-strong rounded-3xl p-4 h-full flex flex-col gap-1" aria-label="Admin">
            <div className="hidden lg:flex items-center gap-3 px-2 pb-4 mb-2 border-b border-white/70"><Logo settings={settings} size={44} /><span className="font-extrabold leading-tight">{settings.shortName || settings.name}<br /><span className="text-xs font-semibold text-muted">Admin</span></span></div>
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); go(s.id); }} className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold ${section === s.id ? "bg-ink text-white" : "text-muted hover:bg-white/70 hover:text-ink"}`}><Icon name={s.icon} size={18} />{s.label}</a>
            ))}
            <div className="mt-auto pt-4 border-t border-white/70 flex flex-col gap-1">
              {DEMO && <span className="mx-2 mb-2 rounded-full bg-sand/60 px-3 py-1 text-xs font-bold text-center">Demo mode</span>}
              <a href="index.html" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-muted hover:bg-white/70"><Icon name="Globe" size={18} /> View website</a>
              <span className="px-4 text-xs text-muted truncate">{user.email}</span>
              <button onClick={signOut} className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-muted hover:bg-white/70 text-left"><Icon name="LogOut" size={18} /> Sign out</button>
            </div>
          </nav>
        </aside>
        <main className="flex-1 min-w-0 p-3 md:p-6 lg:p-8 max-w-6xl" key={section}>{views[section]}</main>
      </div>
      {confirmNode}
      <Toast msg={toastMsg} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AdminApp />);
