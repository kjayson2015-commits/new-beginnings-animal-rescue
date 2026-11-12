/* =====================================================================
   Data layer: talks to Supabase when configured, otherwise runs a
   demo store saved in this browser (so the admin can be tried safely).
   ===================================================================== */
(function () {
  const cfg = window.NB_CONFIG || {};
  const configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey &&
    !String(cfg.supabaseUrl).includes("YOUR_") && !String(cfg.supabaseAnonKey).includes("YOUR_"));
  const sb = configured && window.supabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

  const DEFAULT_SETTINGS = {
    name: "New Beginnings Animal Rescue",
    shortName: "New Beginnings",
    logoUrl: "assets/logo.jpg",
    location: "Your City, State",
    email: "hello@your-rescue-email.org",
    heroBadge: "Foster-based rescue · every dog lives in a home",
    heroTitle: "Every dog deserves a second chance",
    heroAccent: " — and a couch to call their own.",
    heroText: "We take in dogs who have run out of time and options, and place them with volunteer fosters where they can decompress, heal and show us who they really are. Then we help them find their people.",
    stats: ["100% foster homes", "Lifetime return promise", "Local & volunteer-run"],
    noticeOn: true,
    noticeText: "Preview site: dogs, prices, payment handles and stories are sample content to replace before launch.",
    fees: [
      { label: "Puppies", range: "Under 1 year", price: "$350" },
      { label: "Adults", range: "1 to 7 years", price: "$275" },
      { label: "Seniors", range: "8 years and up", price: "$150" },
    ],
    feeIncludes: ["Age-appropriate vaccines", "Microchip registered to you", "Spay / neuter", "Starter kit: food, leash & toy"],
    privateNotice: "We're a small, independent rescue run by volunteers — not a 501(c)(3). No shelter building, no paid staff. Just our fosters, a vet we trust, and a lot of late nights. We keep it personal, and we put everything in writing.",
    privatePoints: ["Every adopter is vetted with references", "Signed adoption & liability contract", "Return-to-rescue clause, for life", "Open books: ask us where funds go"],
    donationDisclaimer: "As a private, independent rescue group, contributions are not tax-deductible—100% goes directly to vet care, food, and foster supplies.",
    payments: [
      { label: "Venmo", handle: "@your-venmo-handle", note: "Add 'Vet care' in the memo" },
      { label: "PayPal", handle: "paypal.me/your-link", note: "Choose 'Friends & Family'" },
      { label: "Zelle", handle: "your-zelle-email@example.com", note: "Send to our rescue inbox" },
    ],
    wishlists: [
      { label: "Amazon Wishlist", url: "https://www.amazon.com/", desc: "Beds, toys, crates and enrichment puzzles." },
      { label: "Chewy Registry", url: "https://www.chewy.com/", desc: "Food, treats, and monthly prevention meds." },
    ],
    needs: [
      { title: "Crates (36\" and 42\")", text: "Every new foster asks for one, and we never have enough." },
      { title: "Flea & tick prevention", text: "Most of our dogs arrive needing it. Chews for 10–80 lb dogs." },
      { title: "High-protein kibble", text: "Thin dogs need to put weight back on. 30 lb bags go fast." },
    ],
    sponsorTiers: [
      { amount: 25, label: "Vaccine booster" },
      { amount: 50, label: "Wellness exam" },
      { amount: 100, label: "Dental or bloodwork" },
    ],
    socials: [
      { label: "Instagram", url: "https://www.instagram.com/" },
      { label: "Facebook", url: "https://www.facebook.com/" },
      { label: "TikTok", url: "https://www.tiktok.com/" },
    ],
    story: [
      "New Beginnings started the way a lot of rescues do: with one dog nobody else could take. Then another one. Then a group chat of neighbors who couldn't keep scrolling past the \"urgent\" posts.",
      "We don't have a shelter building. Every dog lives in a real home with a foster who feeds them, walks them, learns their quirks and tells you the honest truth about them — the sweet stuff and the \"he will steal your socks\" stuff.",
      "Sharing a post helps, and we're grateful for every share. But dogs get saved when someone says \"I'll take him.\" Foster, adopt, donate, or tell a friend who's been thinking about a dog. Every bit of it counts.",
    ],
  };

  const SAMPLE_DOGS = [
    { slug: "biscuit", name: "Biscuit", breed: "Beagle & Terrier mix", age_label: "2 years", age_group: "Young", weight: 22, size: "Small", sex: "Male", status: "Available", energy: "High", spay_neuter: true, vaccines: true, kids: true, dogs: true, cats: false, house_trained: true, featured: true, urgent: true, traits: ["Nose-first explorer", "Lap-sized cuddler", "Treat motivated"], coat: "#C98B52", ear: "#7A4E2D",
      bio: "Biscuit was found wandering near a farm road, muddy, skinny and thrilled to meet absolutely everyone. His foster says he wakes up every morning like it's his birthday. He's put the weight back on, learned sit in about a day (treats were involved), and his favorite thing in the world is a long, slow sniff walk.",
      routine: "Up at 7 for a long sniff walk, breakfast in a puzzle feeder, a snooze in the sunniest spot, then an evening game of fetch and couch time.",
      ideal_home: "An active family or single adopter who enjoys daily walks. A secure fence is a must — that beagle nose will follow a scent anywhere. Best without cats." },
    { slug: "juniper", name: "Juniper", breed: "Shepherd & Husky mix", age_label: "4 years", age_group: "Adult", weight: 58, size: "Large", sex: "Female", status: "Available", energy: "High", spay_neuter: true, vaccines: true, kids: true, dogs: true, cats: false, house_trained: true, featured: true, urgent: false, traits: ["Hiking buddy", "Quick learner", "Loyal shadow"], coat: "#8C8F96", ear: "#3E4148",
      bio: "Juniper's family moved overseas and couldn't take her, and she was so confused those first few days. Now she's back to herself: smart, goofy and glued to her foster's side. She knows sit, down, wait and paw, and she's working on not pulling toward every squirrel (it's a work in progress).",
      routine: "A morning run or hike, a frozen Kong while her foster works, training games after lunch, and a long evening walk followed by brushing (she sheds!).",
      ideal_home: "Experienced dog people with an active lifestyle and a fenced yard. She does well with respectful kids and calm dogs, but chases cats." },
    { slug: "pickles", name: "Pickles", breed: "Chihuahua mix", age_label: "10 years", age_group: "Senior", weight: 9, size: "Small", sex: "Male", status: "Available", energy: "Low", spay_neuter: true, vaccines: true, kids: false, dogs: true, cats: true, house_trained: true, featured: true, urgent: true, traits: ["Blanket burrower", "Quiet companion", "Senior sweetheart"], coat: "#E2C29A", ear: "#A9805A",
      bio: "Pickles lived his whole life with one person, and when she went into care, he ended up with nowhere to go. He's a little gentleman: quiet, polite, and very serious about blankets. His foster mom says he burrows under the covers every night and snores louder than a dog his size should.",
      routine: "Slow mornings, a short stroll around the block, plenty of naps, and dinner with a little warm water on his kibble.",
      ideal_home: "A calm, adults-only home — perfect for retirees or remote workers. He lives happily with cats and gentle dogs." },
    { slug: "moose", name: "Moose", breed: "Lab & Great Pyrenees mix", age_label: "5 months", age_group: "Puppy", weight: 38, size: "Medium", sex: "Male", status: "Available", energy: "High", spay_neuter: false, vaccines: true, kids: true, dogs: true, cats: true, house_trained: false, featured: false, urgent: false, traits: ["Big fluffy goofball", "Loves everyone", "Will be large"], coat: "#F1E6D2", ear: "#D8C3A0",
      bio: "Moose is a clumsy, cheerful puppy with enormous paws and an even bigger heart. He's expected to grow to 80+ pounds.",
      routine: "Potty breaks every few hours, short play sessions, puppy class on Saturdays, and plenty of chew toys to save your shoes.",
      ideal_home: "Patient adopters ready for puppy training and a big adult dog. Neuter is included and will be scheduled at 6 months." },
    { slug: "olive", name: "Olive", breed: "Pit Bull Terrier mix", age_label: "3 years", age_group: "Adult", weight: 48, size: "Medium", sex: "Female", status: "Pending", energy: "Medium", spay_neuter: true, vaccines: true, kids: true, dogs: false, cats: false, house_trained: true, featured: false, urgent: false, traits: ["Wiggle-butt greeter", "Couch potato", "Only-dog princess"], coat: "#6F6A67", ear: "#4A4542",
      bio: "Olive is a velvet-headed love bug who thinks every person she meets is her new best friend. She prefers to be the only pet.",
      routine: "Two moderate walks a day, a snuffle mat at lunch, and evenings snuggled under a blanket watching TV.",
      ideal_home: "An application is pending for Olive. If it doesn't work out, she'll need a home with no other pets." },
    { slug: "rosie", name: "Rosie", breed: "Golden Retriever & Poodle mix", age_label: "8 years", age_group: "Senior", weight: 52, size: "Medium", sex: "Female", status: "Adopted", energy: "Medium", spay_neuter: true, vaccines: true, kids: true, dogs: true, cats: true, house_trained: true, featured: false, urgent: false, traits: ["Gentle soul", "Great with kids", "Happy tail"], coat: "#D9A066", ear: "#B07A44",
      bio: "Rosie found her forever home with a family of four and a resident cat.",
      routine: "Retired to a life of belly rubs, garden patrols and family movie nights.",
      ideal_home: "Rosie has been adopted. Thank you to everyone who shared her story!" },
  ].map((d, i) => ({ id: "demo-" + d.slug, photos: [], adoption_fee: "", published: true, sort_order: i, created_at: new Date(Date.now() - i * 864e5).toISOString(), ...d }));

  const SAMPLE_TAILS = [
    { id: "demo-t1", name: "Sample: your first happy tail", adopter: "Adopter's first name", quote: "Replace with a real adopter quote, e.g. how your dog settled in.", photo: "", published: true, sort_order: 0 },
    { id: "demo-t2", name: "Sample: another success", adopter: "Adopter's first name", quote: "Replace with a real adopter quote and a favorite photo.", photo: "", published: true, sort_order: 1 },
  ];

  const uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : "id-" + Math.random().toString(36).slice(2) + Date.now());
  const slugify = (s) => String(s || "dog").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "dog";

  /* ---------- demo store (this browser only) ---------- */
  const KEY = "nb_demo_store_v1";
  let mem = null;
  function demoLoad() {
    if (mem) return mem;
    try { const raw = localStorage.getItem(KEY); if (raw) mem = JSON.parse(raw); } catch (e) {}
    if (!mem) mem = { dogs: SAMPLE_DOGS, happy_tails: SAMPLE_TAILS, applications: [], messages: [], settings: {},
      admins: [{ user_id: "demo-admin", email: "demo@admin", role: "owner", created_at: new Date().toISOString() }] };
    return mem;
  }
  function demoSave() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }
  const sortRows = (t, rows) => {
    const r = [...rows];
    if (t === "dogs" || t === "happy_tails") r.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || String(b.created_at).localeCompare(String(a.created_at)));
    else r.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return r;
  };

  const demo = {
    async settings() { return { ...DEFAULT_SETTINGS, ...(demoLoad().settings || {}) }; },
    async saveSettings(data) { demoLoad().settings = data; demoSave(); },
    async publicList(t) { return sortRows(t, demoLoad()[t].filter(r => r.published !== false)); },
    async list(t) { return sortRows(t, demoLoad()[t]); },
    async insert(t, row) { const r = { id: uid(), created_at: new Date().toISOString(), ...row }; demoLoad()[t].push(r); demoSave(); return r; },
    async update(t, id, patch) { const s = demoLoad(); s[t] = s[t].map(r => r.id === id ? { ...r, ...patch, updated_at: new Date().toISOString() } : r); demoSave(); return s[t].find(r => r.id === id); },
    async remove(t, id) { const s = demoLoad(); s[t] = s[t].filter(r => r.id !== id); demoSave(); },
    async submit(t, row) { await demo.insert(t, { status: "New", ...row }); },
    async upload(file) {
      return await new Promise((res, rej) => {
        const img = new Image(); const fr = new FileReader();
        fr.onload = () => { img.onload = () => {
          const max = 900, sc = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement("canvas"); c.width = img.width * sc; c.height = img.height * sc;
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.8)); };
          img.onerror = rej; img.src = fr.result; };
        fr.onerror = rej; fr.readAsDataURL(file);
      });
    },
    async signIn() { return { email: "demo@admin" }; },
    async signOut() {},
    async currentUser() { return null; },
    async isAdmin() { return true; },
    async resetPassword() {},
    async listAdmins() { return demoLoad().admins; },
    async addAdmin(email, role) { const s = demoLoad(); s.admins.push({ user_id: uid(), email, role: role || "staff", created_at: new Date().toISOString() }); demoSave(); },
    async removeAdmin(id) { const s = demoLoad(); s.admins = s.admins.filter(a => a.user_id !== id); demoSave(); },
    async resetDemo() { mem = null; try { localStorage.removeItem(KEY); } catch (e) {} },
  };

  /* ---------- Supabase store ---------- */
  const chk = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
  const live = sb && {
    async settings() { const r = chk(await sb.from("settings").select("data").eq("id", 1).maybeSingle()); return { ...DEFAULT_SETTINGS, ...((r && r.data) || {}) }; },
    async saveSettings(data) { chk(await sb.from("settings").upsert({ id: 1, data, updated_at: new Date().toISOString() })); },
    async publicList(t) {
      let q = sb.from(t).select("*").eq("published", true);
      q = q.order("sort_order", { ascending: true }).order("created_at", { ascending: false });
      return chk(await q);
    },
    async list(t) {
      let q = sb.from(t).select("*");
      if (t === "dogs" || t === "happy_tails") q = q.order("sort_order", { ascending: true });
      return chk(await q.order("created_at", { ascending: false }));
    },
    async insert(t, row) { return chk(await sb.from(t).insert(row).select().single()); },
    async update(t, id, patch) {
      if (t === "dogs") patch = { ...patch, updated_at: new Date().toISOString() };
      return chk(await sb.from(t).update(patch).eq("id", id).select().single());
    },
    async remove(t, id) { chk(await sb.from(t).delete().eq("id", id)); },
    async submit(t, row) { chk(await sb.from(t).insert({ status: "New", ...row })); },
    async upload(file) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${new Date().getFullYear()}/${uid()}.${ext}`;
      chk(await sb.storage.from("photos").upload(path, file, { cacheControl: "31536000", upsert: false }));
      return sb.storage.from("photos").getPublicUrl(path).data.publicUrl;
    },
    async signIn(email, password) { const r = chk(await sb.auth.signInWithPassword({ email, password })); return r.user; },
    async signOut() { await sb.auth.signOut(); },
    async currentUser() { const r = await sb.auth.getSession(); return r.data && r.data.session ? r.data.session.user : null; },
    async isAdmin() { return !!chk(await sb.rpc("is_admin")); },
    async resetPassword(email) { chk(await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.href.split("#")[0] })); },
    async listAdmins() { return chk(await sb.from("admins").select("*").order("created_at")); },
    async addAdmin(email, role) { chk(await sb.rpc("add_admin", { p_email: email, p_role: role || "staff" })); },
    async removeAdmin(id) { chk(await sb.rpc("remove_admin", { p_user_id: id })); },
    async resetDemo() {},
  };

  window.NB = { configured, mode: configured ? "live" : "demo", api: configured ? live : demo, DEFAULT_SETTINGS, slugify, uid, supabase: sb };
})();
