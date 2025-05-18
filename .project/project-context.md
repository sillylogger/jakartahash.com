# Project Context – Hash House Harriers Jakarta

## What is this?

A lightweight static site for the Jakarta chapters of the Hash House Harriers (HHH), a running club with a drinking problem.

## Why?

Most chapters in Jakarta are hard to discover online. This site provides a central, maintainable, and low-cost directory, pulling content dynamically from Instagram.

## How?

- **Framework**: Jekyll
- **Hosting**: Google Cloud Storage (GCS)
- **Deployment**: `gcloud storage rsync`
- **Content sources**:
  - Static Markdown files
  - Instagram Graph API (Business Account) for recent posts
- **Domains**: `hashhouseharriersjakarta.com` and `jakartahash.com` (served from the same bucket)
- **Authorship**: Maintained by Tommy, using Cline + VSCode