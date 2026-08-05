# Puddl3 — marketing site

**Puddl3 is instant payroll. Workers get their money as they earn it, instead of
waiting for a pay cycle.**

Live at **[puddl3.xyz](https://puddl3.xyz)**.

> **This repo is the marketing site only.** It's a static Next.js site with no
> backend, no auth, and no product code in it. The actual application — employer
> dashboard, worker app, payroll engine — lives in separate private repos. If
> you came here looking for the product, this isn't it.

Puddl3 is **pre-launch**. The site is live; the product is in testing.

---

## Stack

- **Next.js 15** (App Router) + **React 19**
- **Tailwind CSS v4**
- **three** / **@react-three/fiber** — WebGL hero
- **GSAP**, **motion**, **Lenis** — animation and smooth scroll
- **next-themes** — light/dark

No API calls, no environment variables, no database. Builds to static output and
deploys to Netlify.

## Running it

Needs Node 18+.

```bash
git clone https://github.com/lakotafox/puddle-landing.git
cd puddle-landing
npm install
npm run dev
```

Then open http://localhost:3000.

Note that `.npmrc` sets `legacy-peer-deps=true`. It's required — a leftover from
the shadcn/v0 scaffolding this was built on. Removing it breaks `npm install`.

## Structure

```
app/            layout, page, globals.css
components/
  agency/       design A — WebGL hero, water-ripple bubbles
  finance/      design B — aurora shader, sectioned layout
  landing-switcher.tsx
lib/
public/
```

## Two designs, one shipping

There are two complete designs in here. **Design B (`components/finance`) is
what's live.** Design A (`components/agency`) is fully built and still in the
repo, but isn't wired up — it was the original direction, kept for reference.

To switch back, import its pieces in `components/landing-switcher.tsx` the way
`FinanceLanding` does and render that instead. Its palette is already defined in
`globals.css`, so nothing else needs touching.

Each design scopes its palette on a wrapper class (`.theme-agency`,
`.theme-finance`) rather than setting the variables globally, because both style
themselves off the same CSS variable names. Those palettes have to live in CSS
rather than as inline styles on the wrapper, so the `.dark` branch can override
them — inline styles would win and the light/dark toggle would silently do
nothing.

Leaving Design A unimported also keeps its WebGL hero out of the bundle, which
is worth about 260 kB.

## A note on the copy

Some sections that shipped with the underlying template were deliberately left
out: a client-logo wall, pricing tiers, and a blog. Puddl3 has no customers yet,
no published pricing and no blog, and the only way to fill those would have been
to invent them. The one testimonial on the site is real and labelled as an early
pilot.

If you're adding sections, please hold to that.

## Team

- **Lakota** — frontend
- **Eli** — backend
- **Connor** — business

## License

No license — all rights reserved.
