# New Beginnings Animal Rescue — website & admin

A fast, mobile-friendly rescue website with a full staff admin.

- **Website:** `index.html` (home, adoptable dogs with filters, dog profiles, adoption process, application form, support & supplies, about & contact)
- **Admin:** `admin.html` (dashboard, dogs with photo uploads, applications, messages, happy tails, site settings, team)
- **Database & logins:** [Supabase](https://supabase.com) (free plan is plenty)
- **Hosting:** GitHub Pages (free)

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

## Before you launch, replace the sample content

In **Site Settings**: your real email, location, payment handles, wishlist links and fees, then turn off (or rewrite) the "Preview site" banner. In **Dogs** and **Happy Tails**: delete the sample dogs and stories and add your own.

## Files

```
index.html          public website
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
