# jasonlau.io

Personal website for Jason Lau — researcher, developer, and designer.

Built with [Eleventy](https://www.11ty.dev/) using Nunjucks templates and Tailwind CSS (via CLI).

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

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

## Project Structure

```
src/
├── _includes/
│   └── base.njk          # Shared layout (head, header, nav, footer)
├── _data/
│   └── site.yaml         # Shared site data (content, nav, meta)
├── index.njk             # Researcher page (homepage)
├── developer.njk         # Developer page
├── designer.njk          # Designer page
├── design-works/         # Design portfolio assets
├── research-papers/      # Publication PDFs
└── (static assets)       # Favicons, profile picture, manifest
```

## Deployment

Serve the contents of `_site/` with any static file server.
