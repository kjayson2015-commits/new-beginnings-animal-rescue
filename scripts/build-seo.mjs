// Builds the public site into a folder (default: _site) with a real, crawlable
// HTML page for every section and every dog, plus sitemap.xml and robots.txt.
// Dogs and settings come from Supabase when js/config.js is filled in,
// otherwise from the starter data in js/data.js.
// Usage: node scripts/build-seo.mjs [outDir]
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.resolve(ROOT, process.argv[2] || "_site");

function loadBrowserScript(file, ctx) { vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), "utf8"), ctx); }
const ctx = { window: {}, console };
loadBrowserScript("js/config.js", ctx);
loadBrowserScript("js/data.js", ctx);
const NB = ctx.window.NB;
const cfg = ctx.window.NB_CONFIG || {};

let settings = { ...NB.DEFAULT_SETTINGS };
let dogs = NB.SAMPLE_DOGS;
if (NB.configured) {
  const h = { apikey: cfg.supabaseAnonKey, Authorization: `Bearer ${cfg.supabaseAnonKey}` };
  try {
    const [d, st] = await Promise.all([
      fetch(`${cfg.supabaseUrl}/rest/v1/dogs?select=*&published=eq.true&order=sort_order.asc,created_at.desc`, { headers: h }).then(r => { if (!r.ok) throw new Error("dogs " + r.status); return r.json(); }),
      fetch(`${cfg.supabaseUrl}/rest/v1/settings?select=data&id=eq.1`, { headers: h }).then(r => r.ok ? r.json() : []),
    ]);
    dogs = d.length ? d : dogs;
    if (st[0] && st[0].data) settings = { ...settings, ...st[0].data };
    console.log(`Loaded ${d.length} dogs from Supabase`);
  } catch (e) { console.warn("Supabase fetch failed, using starter data:", e.message); }
}

const SITE = (settings.siteUrl || "https://example.org/").replace(/\/?$/, "/");
const BASE = new URL(SITE).pathname;
const NAME = settings.name;
const abs = (p) => new URL(p, SITE).href;
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ld = (obj) => `<script type="application/ld+json" id="ld-page">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const crumbs = (items) => ({ "@type": "BreadcrumbList", itemListElement: items.map(([n, p], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: abs(p) })) });
const open = dogs.filter(d => d.status === "Available");
const an = (w) => (/^[aeiou]/i.test(w) ? "an" : "a");
const dogSummary = (d) => `${d.name} is ${an(d.age_label || d.breed || "dog")} ${d.age_label ? d.age_label.toLowerCase() + " " : ""}${d.breed || "dog"} in ${d.location || "the US"} who needs ${an(d.need || "foster")} ${(d.need || "foster").toLowerCase()}. ${d.deadline ? d.deadline + ". " : ""}See how you can help.`;

const SITE_LD = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": abs("#org"), name: NAME, url: SITE, logo: abs("assets/logo.jpg"), email: settings.email,
      description: "We connect dogs who need a foster or home with people who can help, and link every dog back to the rescue or shelter caring for them.",
      sameAs: (settings.socials || []).map(s => s.url).filter(u => u && !/^https:\/\/www\.(instagram|facebook|tiktok)\.com\/?$/.test(u)) },
    { "@type": "WebSite", "@id": abs("#website"), name: NAME, url: SITE, publisher: { "@id": abs("#org") }, inLanguage: "en-US" },
  ],
};

const FAQ = [
  ["How does fostering a dog work?", "You give a dog a temporary home while the rescue looks for an adopter. The rescue usually covers food, vet care and supplies, and stays in touch the whole time. You provide a safe space, a routine, and photos or updates so the dog gets noticed."],
  ["Does it cost anything to use New Beginnings?", "No. It's free for fosters, adopters and rescues. If you adopt, the rescue may charge its own adoption fee, which goes toward the dog's care."],
  ["How long would I foster a dog?", "It depends on the dog and the rescue. Some need a short-term foster for a couple of weeks; others stay until they're adopted. Tell us what works for you when you offer to help."],
  ["Can I foster if I rent or have other pets?", "Often, yes. Many rescues work with renters (with landlord approval) and homes with pets. Mention it in your offer so we can match you with dogs who fit your home."],
  ["Who decides if I can foster or adopt?", "The rescue or shelter caring for the dog. We pass your details along; they handle screening, meet-and-greets and paperwork."],
  ["I'm with a rescue. How do I list a dog?", "Use the List a Dog form. We'll share your dog with full credit and a link back to you, and send every offer of help straight to your team."],
];

const dogLi = (d) => `<li><a href="dogs/${esc(d.slug)}/"><strong>${esc(d.name)}</strong></a> — ${esc(d.breed)}${d.location ? `, ${esc(d.location)}` : ""}. Needs: ${esc(d.need || "Foster")}.${d.deadline ? ` <em>${esc(d.deadline)}</em>` : ""}</li>`;

const pages = [
  { path: "", title: `${NAME} | Foster or Adopt Urgent Rescue Dogs Near You`,
    desc: "Find urgent rescue dogs who need a foster or forever home across the US. Free to use — we connect fosters and adopters directly with the rescues and shelters caring for each dog.",
    body: `<h1>${esc(settings.heroTitle)}${esc(settings.heroAccent)}</h1><p>${esc(settings.heroText)}</p>
<h2>Dogs who need a foster this week</h2><ul>${open.filter(d => d.urgent || d.featured).slice(0, 8).map(dogLi).join("")}</ul>
<p><a href="dogs/">See all dogs needing help</a> · <a href="help/">Offer to foster</a> · <a href="list-a-dog/">List a dog (rescues)</a></p>
<h2>How it works</h2><ol><li>Browse dogs who need help, shared from rescues and shelters.</li><li>Tell us you can foster, adopt, transport or pledge.</li><li>We connect you with the rescue caring for that dog.</li></ol>` },
  { path: "dogs/", title: `Dogs Needing a Foster or Home Right Now | ${NAME}`,
    desc: `Browse ${open.length} rescue and shelter dogs who need a foster, adopter or rescue. Search by city or state and offer to help in two minutes.`,
    ld: { "@context": "https://schema.org", "@type": "CollectionPage", name: "Dogs needing a foster or home", url: abs("dogs/"), breadcrumb: crumbs([["Home", ""], ["Dogs needing help", "dogs/"]]),
      mainEntity: { "@type": "ItemList", numberOfItems: open.length, itemListElement: open.map((d, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`dogs/${d.slug}/`), name: d.name })) } },
    body: `<h1>Dogs who need a foster or home</h1><p>Shared from rescues and shelters across the US. Every dog links back to the group caring for them.</p><ul>${open.map(dogLi).join("")}</ul>` },
  { path: "how-it-works/", title: `How Dog Fostering Works — Free Matching with Rescues | ${NAME}`,
    desc: "How fostering a dog works, what it costs (nothing), how long it lasts, and how we connect you with the rescue caring for a dog who needs you.",
    ld: { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    body: `<h1>How we connect dogs with fosters and families</h1><p>${esc(settings.privateNotice)}</p><h2>Questions people ask</h2>${FAQ.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}` },
  { path: "help/", title: `Offer to Foster or Adopt a Rescue Dog | ${NAME}`,
    desc: "Tell us how you can help — foster, short-term foster, adopt, transport or pledge — and we'll introduce you to the rescue caring for the dog.",
    body: `<h1>Offer to foster, adopt or help a dog</h1><p>Takes about two minutes. We'll introduce you to the rescue caring for the dog.</p>` },
  { path: "list-a-dog/", title: `List a Dog Who Needs a Foster — Free for Rescues | ${NAME}`,
    desc: "Rescues, shelters and volunteers: share a dog who needs a foster, adopter or pull. Free, credited to you, and every offer of help goes straight to your team.",
    body: `<h1>List a dog who needs a foster</h1><p>Free for rescues, shelters and volunteers. We credit and link back to you, and every offer of help comes straight to your team.</p>` },
  { path: "support/", title: `Support Foster Dogs — Wishlists & Donations | ${NAME}`,
    desc: "Help new fosters say yes with crates, supplies and small donations, and help urgent dogs get seen in time.",
    body: `<h1>Help more dogs get seen in time</h1><p>${esc(settings.donationDisclaimer)}</p>` },
  { path: "about/", title: `About & Contact | ${NAME}`,
    desc: "Why we built New Beginnings Animal Rescue: one place where dogs who need fosters stay visible, and every offer of help reaches the right rescue.",
    body: `<h1>Why New Beginnings exists</h1>${(settings.story || []).map(p => `<p>${esc(p)}</p>`).join("")}<p>Email: ${esc(settings.email)}</p>` },
  ...dogs.map(d => ({
    path: `dogs/${d.slug}/`,
    title: `${d.name}${d.need ? ` Needs a ${d.need.split(",")[0]}` : ""}${d.location ? ` in ${d.location}` : ""} | ${NAME}`,
    desc: dogSummary(d).slice(0, 300),
    image: (d.photos || [])[0] ? abs(d.photos[0]) : undefined, imageAlt: (d.photos || [])[0] ? `${d.name}, ${d.breed}` : "",
    ld: { "@context": "https://schema.org", "@type": "WebPage", name: `${d.name} — ${d.breed}`, url: abs(`dogs/${d.slug}/`), description: dogSummary(d),
      breadcrumb: crumbs([["Home", ""], ["Dogs needing help", "dogs/"], [d.name, `dogs/${d.slug}/`]]),
      ...(d.posted_on ? { datePublished: d.posted_on } : {}), ...((d.photos || [])[0] ? { primaryImageOfPage: { "@type": "ImageObject", url: abs(d.photos[0]) } } : {}) },
    body: `<nav aria-label="Breadcrumb"><a href="./">Home</a> › <a href="dogs/">Dogs needing help</a> › ${esc(d.name)}</nav>
<h1>${esc(d.name)}</h1><p>${esc(d.breed)} · ${esc(d.sex)}${d.age_label ? ` · ${esc(d.age_label)}` : ""}${d.location ? ` · ${esc(d.location)}` : ""}</p>
<p><strong>Needs:</strong> ${esc(d.need || "Foster")}${d.deadline ? ` — ${esc(d.deadline)}` : ""}</p>
<p>${esc(d.bio)}</p>${d.ideal_home ? `<h2>The right home</h2><p>${esc(d.ideal_home)}</p>` : ""}
${d.contact ? `<h2>How to help ${esc(d.name)}</h2><p>${esc(d.contact)}</p>` : ""}
<p><a href="help/?dog=${esc(d.slug)}">I can help ${esc(d.name)}</a>${d.source_url ? ` · <a href="${esc(d.source_url)}" rel="noopener nofollow">Contact ${esc(d.source_name)}</a>` : ""}</p>
${d.source_name ? `<p><small>Shared from a public post by ${esc(d.source_name)}.</small></p>` : ""}` ,
    status: d.status,
  })),
];

const template = fs.readFileSync(path.join(ROOT, "scripts/template.html"), "utf8");
function render(p, { robots = "index, follow, max-image-preview:large" } = {}) {
  const url = abs(p.path);
  return template
    .replaceAll("{{BASE}}", esc(BASE))
    .replaceAll("{{TITLE}}", esc(p.title))
    .replaceAll("{{DESC}}", esc(p.desc))
    .replaceAll("{{ROBOTS}}", robots)
    .replaceAll("{{URL}}", esc(url))
    .replaceAll("{{SITE_NAME}}", esc(NAME))
    .replaceAll("{{IMAGE}}", esc(p.image || abs("assets/logo.jpg")))
    .replaceAll("{{IMAGE_ALT}}", esc(p.imageAlt || `${NAME} logo`))
    .replaceAll("{{SITE_LD}}", JSON.stringify(SITE_LD).replace(/</g, "\\u003c"))
    .replaceAll("{{PAGE_LD}}", p.ld ? ld(p.ld) : "")
    .replaceAll("{{BODY}}", p.body);
}

// copy static files
fs.rmSync(OUT, { recursive: true, force: true });
const COPY = ["admin.html", "assets", "css", "js", "README.md", ".nojekyll"];
for (const c of COPY) { const src = path.join(ROOT, c); if (fs.existsSync(src)) fs.cpSync(src, path.join(OUT, c), { recursive: true }); }

for (const p of pages) {
  const dir = path.join(OUT, p.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), render(p));
}
// 404 page: same app shell (handles dogs added since the last build), not indexed
fs.writeFileSync(path.join(OUT, "404.html"), render({ path: "", title: `Page not found | ${NAME}`, desc: pages[0].desc, body: `<h1>Page not found</h1><p><a href="dogs/">See dogs who need help</a></p>` }, { robots: "noindex, follow" }));

const today = new Date().toISOString().slice(0, 10);
const urls = pages.map(p => {
  const pri = p.path === "" ? "1.0" : p.path === "dogs/" ? "0.9" : p.path.startsWith("dogs/") ? (p.status === "Available" ? "0.8" : "0.4") : "0.6";
  const freq = p.path === "" || p.path === "dogs/" ? "hourly" : p.path.startsWith("dogs/") ? "daily" : "weekly";
  return `  <url><loc>${esc(abs(p.path))}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`;
});
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: ${BASE}admin.html\n\nSitemap: ${abs("sitemap.xml")}\n`);
console.log(`Built ${pages.length} pages into ${path.relative(ROOT, OUT) || "."} for ${SITE}`);
