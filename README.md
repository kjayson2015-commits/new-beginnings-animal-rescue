# New Beginnings Animal Rescue — website & admin

We connect dogs who need a foster or home with people who can help. Dogs are shared from rescues and shelters (credited and linked back), and every "I can help" offer is passed to the rescue caring for that dog.

- **Website:** home, dogs needing help (filters + search by city/state), a page per dog, how it works + FAQ, "I can help" form, list-a-dog form for rescues, support, about & contact
- **Admin:** `admin.html` (dashboard, dogs with photo uploads, applications, messages, happy tails, site settings, team)
- **Database & logins:** [Supabase](https://supabase.com) (free plan is plenty)
- **Hosting:** GitHub Pages via GitHub Actions (free). `.github/workflows/deploy.yml` runs `scripts/build-seo.mjs` on every push and every hour, so new dogs added in the admin get their own search-friendly page and sitemap entry automatically.

Until Supabase is connected, the site runs in **demo mode**: sample dogs, and the admin saves changes only in your own browser. Nothing breaks, so you can try everything first.

---

## 1. Connect Supabase (about 10 minutes, one time)

1. Create a free account at **supabase.com** and click **New project**. Pick a name (e.g. `new-beginnings`), a strong database password, and the region closest to you.
2. When it's ready, open **SQL Editor → New query**, paste everything from [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates the tables, security rules and the photo storage.
3. Open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key
4. In this repository, edit [`js/config.js`](js/config.js) and paste them in place of `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY`. Commit the change.

> The anon key is meant to be public. Your data is protected by the row-level security rules in `schema.sql`: visitors can only read published dogs and send applications/messages; only admins can see applications or change anything.

## 2. Make yourself the first admin

1. In Supabase, go to **Authentication → Users → Add user → Create new user**. Enter your email and a password. Tick "Auto confirm user".
2. Go back to **SQL Editor** and run (with your email):

   ```sql
   insert into public.admins (user_id, email, role)
   select id, email, 'owner' from auth.users where email = 'you@example.com';
   ```
3. Open `https://<your-username>.github.io/<repo>/admin.html` and sign in.

To add more staff later: create them under **Authentication → Users**, then add their email on the admin's **Team** page.

**Recommended:** in **Authentication → URL Configuration**, set the *Site URL* to your website address so "Forgot password" emails link back correctly. Under **Authentication → Providers → Email**, you can turn off public sign-ups, since staff are added by you.

## 3. Start using the admin

- **Dogs:** add a dog, upload several photos (first one is the cover), set status (Available / Pending / Adopted), feature on the homepage, mark urgent, hide, duplicate, reorder.
- **Applications:** every application from the website lands here. Change status, write private notes, mark the dog Pending/Adopted in one click, email the applicant, export to CSV.
- **Messages:** contact form messages, with reply-by-email and archive.
- **Happy Tails:** adopted-dog stories with photos for the About page.
- **Site Settings:** rescue name, logo, homepage text, announcement banner, fees, payment handles (Venmo/PayPal/Zelle/Cash App…), wishlists, urgent supply needs, sponsorship amounts, story and social links.
- **Team:** add or remove staff.

## Adding dogs from Facebook

In the admin, **Dogs → Import from Facebook**: paste the rescue's post text, their name and a link. The listing is filled in for you as a hidden draft. Check the details, rewrite the story in your own words, only add photos you have permission to use, then switch on "Visible on website". Always credit the rescue and link back to them.

## SEO checklist

Already built in: a real HTML page per dog and section with unique titles and descriptions, canonical URLs, Open Graph/Twitter cards, structured data (Organization, WebSite, CollectionPage, BreadcrumbList, FAQPage), `sitemap.xml`, fast-loading fallback content for crawlers, and `noindex` on the admin.

To do once:
1. Add the site to **Google Search Console** (URL-prefix property: your site URL) and submit `sitemap.xml`. Do the same in **Bing Webmaster Tools**.
2. **Get a custom domain** (e.g. newbeginningsrescue.org) and set it in repo Settings → Pages, then update `siteUrl` in Site Settings. A real domain ranks better and lets `robots.txt` work (GitHub only reads it at a domain's root).
3. Create a **Google Business Profile** if you have a service area, and link the site from your Facebook/Instagram bios.

## Before you launch, replace the sample content

In **Site Settings**: your real email, payment handles and wishlist links. In **Dogs**: the starter dogs were shared from public Facebook posts on Nov 12, 2026 — check each with its rescue and mark them Safe or remove them as their situations change.

## Files

```
scripts/template.html   page template (title, meta, structured data)
scripts/build-seo.mjs   builds every page + sitemap into _site/
admin.html          staff admin
js/config.js        your Supabase connection (edit this)
js/data.js          data layer (Supabase or demo mode) + default settings
js/ui.jsx           shared components
js/site.jsx         website pages
js/admin.jsx        admin pages
css/styles.css      glass styles
js/theme.js         colors and fonts
assets/logo.jpg     logo (also changeable from the admin)
supabase/schema.sql database setup
```

No build step: edit a file, commit, and GitHub Pages updates within a minute or two.
