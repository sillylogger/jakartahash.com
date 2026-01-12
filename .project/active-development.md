# Active Development – Hash House Harriers Jakarta

## Current Focus
- Improve the aesthetics of the site, potentially leveraging the assets/cartoon-finished.png

## Dev Roadmap

### Bugs
- [ ] Window height ~1413px causes layout spazzing (overflow auto scroller toggling rapidly)

### Features
- [ ] Create a hash.cn knockoff page (new path, link as "can haz webzite?" next to kennels)
  - Inspiration: https://www.hash.cn/
  - Responsive hero slider with navigation arrows
  - Grid-based event layout
  - Sticky navigation
  - Will need hasher photos for content
- [ ] Full photo gallery (Don suggested adding WA photo)
- [ ] parse / pretty markdown text in the captions as well as the existing links etc.  Example:
```markdown
  JH3 Run Directions for Run 2990, 15 November 2025
  *Time* : 3:30 PM
  *Location* : Kampung Abdi – formerly Saung Otong
  *Hare* : Sorerail
  *Directions* :
  Take the Jagorawi Toll Road and exit at Sirkuit Sentul.
```
- [ ] Get logos for each Hash to make it easier for people to make shirts
        
### Admin
- [ ] Respond to the guy from gotothehash.net
- [ ] Upgrade LightWidget to paid once they accept credit card
- [ ] Setup Google Analytics or Facebook Analytics
- [ ] Add social/meta tags and favicon
- [ ] Test site on both domains

## Done
- Deployed with Terraform
- Fetched IG posts via Instagram Graph API and rendered in JS on home page
- Built `_data/kennels.yml` to drive kennel listing
- Changed index.md and kennels.md content to markdown (allowing raw html)

## Wanna Do?

**Initial Setup**: See README.md for quick start (Ruby + bundle install + jekyll serve).

**Dev Tips**: Modify `_config.yml` for site settings. Add/edit markdown files for content. Customize HTML in `_layouts` and `_includes`.

**Custom JS**: The lightbox enhancement code in `index.md` adds responsive layout, clickable URLs, and WhatsApp links for phone numbers. See `.project/lightwidget-config.md` for full details.

## Notes
- Avoid `url:` in `_config.yml` to support both domains
- `project-context.md` should not change frequently
- Use `.project/` folder for internal dev memory files
