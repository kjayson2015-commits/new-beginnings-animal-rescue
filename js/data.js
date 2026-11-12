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
    location: "the United States",
    email: "hello@your-rescue-email.org",
    siteUrl: "https://kjayson2015-commits.github.io/new-beginnings-animal-rescue/",
    heroBadge: "Connecting dogs with fosters & families across the US",
    heroTitle: "Some dogs just need one person to say yes",
    heroAccent: " — could it be you?",
    heroText: "Every day, rescues and shelters post dogs who need a foster home, fast. We gather those dogs in one place, and when you offer to help, we connect you directly with the rescue caring for them.",
    stats: ["Free to use", "Rescues & shelters nationwide", "Fosters save lives"],
    noticeOn: true,
    noticeText: "Dogs here are shared from public rescue and shelter posts. Situations change fast, so always confirm with the rescue listed on each dog.",
    fees: [],
    feeIncludes: [],
    privateNotice: "New Beginnings is a connector, not a shelter. We don't house dogs or charge adoption fees. We share dogs that rescues and shelters need help with, and we introduce people who can foster or adopt to the group caring for that dog. Each rescue does its own screening, contracts and fees.",
    privatePoints: ["Every dog credits and links to its rescue", "Free for fosters, adopters and rescues", "We mark dogs safe as soon as we hear", "Rescues can ask us to edit or remove a post"],
    donationDisclaimer: "New Beginnings is a private, independent project. Contributions are not tax-deductible. They go toward boosting urgent dogs' posts and helping new fosters with supplies.",
    payments: [
      { label: "Venmo", handle: "@your-venmo-handle", note: "Add 'Foster supplies' in the memo" },
      { label: "PayPal", handle: "paypal.me/your-link", note: "Choose 'Friends & Family'" },
      { label: "Zelle", handle: "your-zelle-email@example.com", note: "Send to our inbox" },
    ],
    wishlists: [
      { label: "Amazon Wishlist", url: "https://www.amazon.com/", desc: "Crates, beds and toys we send to brand-new fosters." },
      { label: "Chewy Registry", url: "https://www.chewy.com/", desc: "Food and flea & tick prevention for foster dogs." },
    ],
    needs: [
      { title: "Crates (36\" and 42\")", text: "The first thing every new foster asks for." },
      { title: "Flea & tick prevention", text: "Most shelter dogs need it the day they leave." },
      { title: "Slip leads & collars", text: "So a foster can pick a dog up the same day." },
    ],
    sponsorTiers: [
      { amount: 25, label: "Boost an urgent dog's post" },
      { amount: 50, label: "Starter kit for a new foster" },
      { amount: 100, label: "Help a rescue pull a dog" },
    ],
    socials: [
      { label: "Instagram", url: "https://www.instagram.com/" },
      { label: "Facebook", url: "https://www.facebook.com/" },
      { label: "TikTok", url: "https://www.tiktok.com/" },
    ],
    story: [
      "New Beginnings started with a Facebook feed full of urgent dogs. Hundreds of people would comment, pray and share, but the rescues kept asking the same question: where are the fosters?",
      "The dogs are out there, and so are the people willing to help. They just weren't finding each other in time. Posts get buried within hours, and the details that matter (where the dog is, who to contact, the deadline) get lost in long threads.",
      "So we built one place where those dogs stay visible. Every dog links back to the rescue or shelter that posted it. When you say \"I can foster,\" we pass your details straight to them, and they take it from there.",
    ],
  };

  /* Dogs shared from public rescue & shelter posts on Facebook (Nov 2026).
     Each listing credits and links back to the group that posted it. */
  const SAMPLE_DOGS = [
    { slug: "cary", name: "Cary", breed: "Shepherd mix", age_label: "1½ years", age_group: "Young", weight: 55, size: "Large", sex: "Female", status: "Available", energy: "Medium",
      need: "Foster", location: "San Bernardino, CA", shelter_id: "A854130", deadline: "On the euthanasia list",
      source_name: "Philozoia Animal Rescue", source_url: "https://www.facebook.com/philozoia", posted_on: "2026-11-12",
      contact: "Philozoia will pull Cary from Devore Animal Shelter as soon as a foster says yes. Message Philozoia on Facebook and mention Cary (ID A854130).",
      spay_neuter: false, vaccines: false, kids: false, dogs: true, cats: false, house_trained: false, featured: true, urgent: true,
      traits: ["Soft eyes, slow tail wag", "Easy to handle", "Shares a kennel nicely"], coat: "#A8794A", ear: "#4E3524",
      bio: "Cary is a 55-pound shepherd mix, only a year and a half old, and she's on the euthanasia list at Devore Animal Shelter. The rescue describes her as gentle and easy to handle, with a slow, happy tail wag. She even shares her kennel calmly with other dogs.",
      routine: "", ideal_home: "A foster who can give her a quiet place to decompress while the rescue finds her family. She's done well around other dogs at the shelter." },
    { slug: "sally-and-micah", name: "Sally & Micah", breed: "Mama dog & her puppy", age_label: "Mom + puppy", age_group: "Puppy", weight: 0, size: "Medium", sex: "Female & male", status: "Available", energy: "Medium",
      need: "Foster", location: "California", shelter_id: "", deadline: "Needs a new foster now",
      source_name: "The Animal Rescue Center of California", source_url: "https://www.facebook.com/thearcofca", posted_on: "2026-11-12",
      contact: "Fill out a foster application with The Animal Rescue Center of California, or message them on Facebook about Sally & Micah.",
      spay_neuter: false, vaccines: true, kids: true, dogs: true, cats: false, house_trained: false, featured: true, urgent: true,
      traits: ["Mama & baby", "Already in rescue care", "Need to stay together"], coat: "#E7D3B5", ear: "#B48A5E",
      bio: "Mama Sally and her little boy Micah are already safe with a rescue, but their foster home can't keep them any longer. They need a new temporary home where they can stay together and keep growing up happy.",
      routine: "", ideal_home: "A calm foster home with room for a mom and her puppy. The rescue answers questions about their needs and how fostering works." },
    { slug: "muneca", name: "Muneca", breed: "Akita & German Shepherd mix", age_label: "About 8 years", age_group: "Senior", weight: 0, size: "Large", sex: "Female", status: "Available", energy: "Medium",
      need: "Short-term foster", location: "Los Angeles, CA", shelter_id: "A1909813", deadline: "Needed until early January",
      source_name: "West LA Shelter Volunteers", source_url: "https://www.facebook.com/westlaanimalshelter", posted_on: "2026-11-12",
      contact: "Message West LA Shelter Volunteers on Facebook about Muneca (#A1909813). Her current fosters will take her back in January.",
      spay_neuter: true, vaccines: true, kids: true, dogs: true, cats: false, house_trained: true, featured: true, urgent: false,
      traits: ["Great with kids", "Doesn't pull on leash", "Fine home alone"], coat: "#C9A27A", ear: "#5B4634",
      bio: "Muneca is a sweet senior whose foster family is traveling for the holidays. Her fosters rave about her: friendly, great with kids, loves being petted, and easy on long walks. She's potty trained and stays calm when left home alone, with no barking or separation anxiety.",
      routine: "Long walks (no pulling), lots of pets, and quiet time at home.", ideal_home: "Anyone who can host her for a few weeks until early January. Her fosters will take her back after that if she hasn't been adopted." },
    { slug: "bruno", name: "Bruno", breed: "Mixed breed", age_label: "Adult", age_group: "Adult", weight: 0, size: "Large", sex: "Male", status: "Available", energy: "Medium",
      need: "Foster", location: "Prince George's County, MD", shelter_id: "", deadline: "Urgent: currently in boarding",
      source_name: "Friends of PG County Animal Shelter", source_url: "https://www.facebook.com/search/top?q=Friends%20of%20PG%20County%20Animal%20Shelter", posted_on: "2026-11-12",
      contact: "Message Friends of PG County Animal Shelter on Facebook and mention Bruno.",
      spay_neuter: false, vaccines: false, kids: false, dogs: false, cats: false, house_trained: false, featured: false, urgent: true,
      traits: ["Needs a quiet home", "Only dog", "Adults only"], coat: "#7A5A43", ear: "#3F2E22",
      bio: "Bruno has ended up in boarding, which is hard on him and is setting back his progress. He needs a foster home without other dogs or children, and the group says he does best with a male foster.",
      routine: "", ideal_home: "A quiet, adults-only home with no other dogs. A male foster is preferred." },
    { slug: "norie-and-nixie", name: "Norie & Nixie", breed: "French Bulldogs", age_label: "Adults", age_group: "Adult", weight: 0, size: "Small", sex: "Female", status: "Available", energy: "Medium",
      need: "Foster", location: "Ask the rescue", shelter_id: "", deadline: "Fosters needed this week",
      source_name: "Freedom Frenchie Rescue", source_url: "https://www.facebook.com/search/top?q=Freedom%20Frenchie%20Rescue", posted_on: "2026-11-12",
      contact: "Contact Freedom Frenchie Rescue on Facebook to apply to foster Norie & Nixie.",
      spay_neuter: false, vaccines: false, kids: false, dogs: true, cats: false, house_trained: false, featured: false, urgent: true,
      traits: ["Bonded pair", "Came in together", "Frenchie charm"], coat: "#D9CBB8", ear: "#8C7B6A",
      bio: "Norie and Nixie came into the shelter together and seem to be bonded, so the rescue hopes to keep them together. Bonded pairs are much harder to place, which is why a foster who can take both would make all the difference.",
      routine: "", ideal_home: "A foster home that can take both girls together." },
    { slug: "chiquita-and-churro", name: "Chiquita & Churro", breed: "French Bulldogs", age_label: "Adults", age_group: "Adult", weight: 0, size: "Small", sex: "Female & male", status: "Available", energy: "Medium",
      need: "Foster", location: "Ask the rescue", shelter_id: "", deadline: "Fosters needed this week",
      source_name: "Freedom Frenchie Rescue", source_url: "https://www.facebook.com/search/top?q=Freedom%20Frenchie%20Rescue", posted_on: "2026-11-12",
      contact: "Contact Freedom Frenchie Rescue on Facebook to foster Chiquita, Churro, or both.",
      spay_neuter: false, vaccines: false, kids: false, dogs: true, cats: false, house_trained: false, featured: false, urgent: true,
      traits: ["Possibly bonded", "Could be fostered apart", "Frenchies"], coat: "#4A403A", ear: "#2B2522",
      bio: "Chiquita and Churro are two of six Frenchies who need foster homes this week. The rescue is testing how they do apart, so they may be able to go to separate foster homes.",
      routine: "", ideal_home: "A foster for one or both. The rescue will help match you." },
    { slug: "francis", name: "Francis", breed: "French Bulldog", age_label: "Adult", age_group: "Adult", weight: 0, size: "Small", sex: "Female", status: "Available", energy: "Low",
      need: "Foster", location: "Ask the rescue", shelter_id: "", deadline: "Fosters needed this week",
      source_name: "Freedom Frenchie Rescue", source_url: "https://www.facebook.com/search/top?q=Freedom%20Frenchie%20Rescue", posted_on: "2026-11-12",
      contact: "Contact Freedom Frenchie Rescue on Facebook. They'll explain Francis's medical needs before you commit.",
      spay_neuter: false, vaccines: false, kids: false, dogs: false, cats: false, house_trained: false, featured: false, urgent: true,
      traits: ["Special needs", "Needs a patient foster", "Big heart"], coat: "#EDE3D6", ear: "#B9A893",
      bio: "Francis has medical needs, and the rescue says finding a foster for her has felt nearly impossible. The rescue covers her care. She needs a home to recover in, plus someone to drive her to appointments and share updates.",
      routine: "", ideal_home: "A patient foster who can handle vet visits and send photos and videos to help find her family." },
    { slug: "princess", name: "Princess", breed: "Pit Bull mix", age_label: "Young", age_group: "Young", weight: 0, size: "Medium", sex: "Female", status: "Available", energy: "Medium",
      need: "Adopter, foster or rescue", location: "Rockdale County, GA", shelter_id: "AC5364", deadline: "Listed for euthanasia 11/13",
      source_name: "Urgent Shelter Dogs", source_url: "https://www.facebook.com/UrgentShelterDogs", posted_on: "2026-11-12",
      contact: "Contact Rockdale County Animal Control about Princess (#AC5364), or comment on Urgent Shelter Dogs' post to pledge or offer to foster.",
      spay_neuter: false, vaccines: false, kids: false, dogs: false, cats: false, house_trained: false, featured: true, urgent: true,
      traits: ["Loves her stuffed toys", "Gentle", "Left behind"], coat: "#2F2B2A", ear: "#1E1B1A",
      bio: "Princess's sister was adopted, and Princess was left behind at Rockdale County Animal Control. She holds on to her stuffed toys in her kennel. She needs an adopter, a foster, or a rescue to step in, and pledges help a rescue say yes.",
      routine: "", ideal_home: "Anyone in or near Georgia who can adopt or foster, or a rescue that can pull her with pledges." },
  ].map((d, i) => ({ id: "demo-" + d.slug, photos: [], adoption_fee: "", published: true, sort_order: i, created_at: new Date(Date.UTC(2026, 10, 12, 20) - i * 36e5).toISOString(), ...d }));

  const SAMPLE_TAILS = [];

  const uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : "id-" + Math.random().toString(36).slice(2) + Date.now());
  const slugify = (s) => String(s || "dog").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "dog";

  /* ---------- demo store (this browser only) ---------- */
  const KEY = "nb_demo_store_v2";
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

  window.NB = { SAMPLE_DOGS, configured, mode: configured ? "live" : "demo", api: configured ? live : demo, DEFAULT_SETTINGS, slugify, uid, supabase: sb };
})();
