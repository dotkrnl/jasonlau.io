# jasonlau.io

Personal website for Jason Lau — researcher, developer, and designer.

Built with [Eleventy](https://www.11ty.dev/), [Nunjucks](https://mozilla.github.io/nunjucks/) templates, and [Tailwind CSS v4](https://tailwindcss.com/) (via CLI). CV PDF generated with [Typst](https://typst.app/).

## Adapting This Site

This site is designed around a single data file. To make it your own:

### 1. Replace content in `src/_data/site.yaml`

This is the single source of truth for all pages. Update these sections:

| Section | What it controls |
|---|---|
| Top-level fields (`name`, `url`, `email`, etc.) | Header, footer, meta tags, structured data |
| `roles` | Navigation tabs (Researcher / Developer / Designer) |
| `navLinks` | Header links (Scholar, GitHub, Email, CV) |
| `education` | Education entries across all pages |
| `experience` | Work experience across all pages |
| `publications` | Publication list on the researcher page |
| `services`, `reviews` | Academic service on the researcher page |
| `projects`, `skills`, `awards` | Developer page sidebar and main content |

Each education/experience entry uses **per-page visibility flags** (`researcher: true`, `developer: { ... }`, `cv: true`) to control where it appears and with what overrides. See the comments in `site.yaml` for details.

### 2. Replace static assets

| File | Purpose |
|---|---|
| `src/profile-picture.png` | Profile photo (320x360) |
| `src/research-papers/*.pdf` | Publication PDFs (referenced by `publications` in site.yaml) |
| `src/design-works/*` | Designer portfolio images/videos |
| `src/favicon*.png`, `src/apple-touch-icon.png` | Favicons (generate at [realfavicongenerator.net](https://realfavicongenerator.net/)) |
| `src/site.webmanifest` | PWA manifest (update `name` and `short_name`) |

### 3. Update page frontmatter

Each page (`src/index.njk`, `src/developer.njk`, `src/designer.njk`) has frontmatter controlling:

- `title`, `description`, `keywords` — SEO meta tags
- `h1` — accessible heading (screen readers)
- `printSubtitle` — subtitle shown in print/PDF header
- `activeRole` — which nav tab is highlighted
- `tagline` — introductory text after the name
- `permalink` — output filename

### 4. Customize styling

- `src/styles.css` — Custom CSS (animated underlines, PDF preview panel, print styles)
- Tailwind classes are used directly in templates; edit `.njk` files to change layout
- Print styles produce a professional CV layout when printing the researcher page

### 5. Modify templates (optional)

| File | Purpose |
|---|---|
| `src/_includes/base.njk` | Shared layout: `<head>`, header with roles/nav, footer |
| `src/_includes/macros.njk` | Reusable components: section headings, education list, services, reviews |
| `src/index.njk` | Researcher page with publications and PDF preview panel |
| `src/developer.njk` | Developer page with experience and projects |
| `src/designer.njk` | Designer page with portfolio grid |

### 6. Add or remove role pages

To remove a role (e.g., Designer): delete the `.njk` file, remove the entry from `roles` in `site.yaml`, and clean up any role-specific flags in the data entries.

To add a role: create a new `.njk` file following the existing pattern, add an entry to `roles`, and add visibility flags to data entries as needed.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Typst](https://typst.app/) (for CV PDF generation only; install with `brew install typst`)

## Build

```bash
npm install
npm run build
```

The built site is output to `_site/`.

## Development

```bash
npm run serve
```

Starts a local dev server with live reload at `http://localhost:8080`.

## CV PDF Generation

```bash
npm run cv
```

Reads `src/_data/site.yaml`, generates `cv/data.json`, and compiles `cv/template.typ` into `cv/jason-lau-cv.pdf`. The PDF is automatically copied to `_site/` during build.

## Update Citation Count

```bash
npm run update-citations
```

Fetches the total citation count from Google Scholar and updates `publicationsCitations` in `site.yaml`.

## Deployment

Serve the contents of `_site/` with any static file server, or deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Project Structure

```
src/
  _data/site.yaml          # All site content (single source of truth)
  _includes/
    base.njk               # Shared HTML layout
    macros.njk              # Reusable template components
  index.njk                # Researcher page (homepage)
  developer.njk            # Developer page
  designer.njk             # Designer page
  styles.css               # Custom + print CSS
  research-papers/         # Publication PDFs
  design-works/            # Portfolio assets
cv/
  template.typ             # Typst CV template
  data.json                # Generated from site.yaml (gitignored)
scripts/
  generate-cv.js           # site.yaml -> data.json -> PDF
  update-citations.js      # Fetch citation count from Google Scholar
eleventy.config.js         # Build config (passthrough, Tailwind, HTML minification)
wrangler.toml              # Cloudflare Workers deployment config
```

## License

[MIT](LICENSE) — except for files in `src/research-papers/`, which are copyrighted by their respective publishers.
