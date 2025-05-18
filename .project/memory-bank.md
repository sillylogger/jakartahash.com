# 🧠 Memory Bank: Jakarta Hash House Harriers Website

## Project Goal
Create a low-maintenance static website for the Jakarta Hash House Harriers to help new people discover local running chapters and events.

## Tech Stack
- **Static site generator:** Jekyll
- **Hosting:** Google Cloud Storage (GCS)
- **Content Source:** Instagram Graph API (via Business account)
- **Deployment:** GCS via `gcloud storage rsync` (modern CLI)
- **Dev Env:** VSCode + Cline (ChatGPT model)

## Site Structure
- `/` – Home: Auto-updating Instagram feed
- `/kennels` – Static list of Jakarta HHH chapters
- `/assets/css/style.css` – Minimal styling
- `_layouts/` – HTML templates
- `_includes/` – Shared head/footer HTML
- `bin/deploy.sh` – Builds + syncs to GCS

## To-Do
- [ ] Finalize Instagram Graph API integration
- [ ] Replace static kennel list with `_data/kennels.yml`
- [ ] Optional: Deploy via GitHub Actions

## Domains
- `hashhouseharriersjakarta.com`
- `jakartahash.com`

## Notes
- Avoid dynamic frameworks (e.g., WordPress)
- Instagram Business Account required for API access
- Consider lightWidget/SnapWidget fallback if API proves fragile
