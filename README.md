# Jakarta Hash House Harriers

Welcome to the Jakarta Hash House Harriers website! This site is built using Jekyll, a static site generator.

## Triage!
* [ ] Respond to the guy from gotothehash.net
* [ ] Get logos for each Hash to make it easier for people to make shirts
* [ ] inspiration: https://www.hash.cn/
* [ ] Don suggested adding that WA photo 🤔, should make a full gallery w/better photos

## Project Overview

This project is a website for Jakarta's running club with a drinking problem. It provides information about the club, events, and more.

## Information Sources
* https://en.wikipedia.org/wiki/Hash_House_Harriers
* https://genealogy.gotothehash.net/index.php?r=chapters/list&country=Indonesia


## Installation Instructions

1. **Install Ruby**: Ensure you have Ruby installed on your system. You can check this by running `ruby -v` in your terminal.

2. **Install Bundler**: Bundler is a tool for managing Ruby gem dependencies. Install it by running:
   ```bash
   gem install bundler
   ```

3. **Install Dependencies**: Navigate to the project directory and run:
   ```bash
   bundle install
   ```

## Running the Site

To serve the site locally, run the following command:
```bash
bundle exec jekyll serve
```
This will start a local server at `http://localhost:4000`, where you can view the site.

## Development Tips

- **Configuration**: Modify `_config.yml` to change site settings.
- **Content**: Add or edit markdown files in the root directory to update content.
- **Layouts and Includes**: Customize the HTML structure by editing files in `_layouts` and `_includes`.

---

## LightWidget Configuration

The site embeds Instagram posts via [LightWidget](https://lightwidget.com). Configuration is split between their dashboard and our custom JavaScript.

### LightWidget Dashboard Settings

These settings are configured at lightwidget.com and affect the **widget grid** (the Instagram feed display):

| Section | Setting | Value |
|---------|---------|-------|
| **Content** | Instagram account | @hashhouseharriersjakarta |
| | Show all images | ON |
| | Show videos | ON |
| | Show reels removed from profile grid | OFF |
| **Layout** | Posts layout | Grid |
| | Number of columns | 4 |
| | Number of posts | 8 |
| | Number of show more posts | 6 |
| | Padding | 2px |
| **Posts** | Image format | Original |
| | Carousel posts display | Show all |
| | Post click action | Open lightbox |
| | Post hover effect | None |
| **Captions** | Show captions below posts | ON |
| | Captions length | 160 chars |
| | Font size | 0.8rem |
| **Lightbox** | Enable lightbox | ON |
| | Elements shown | Profile photo, Caption, View on Instagram, Navigation |
| | Padding | 0 |
| **Header** | Show header | ON |
| | Layout | Layout 2 |
| | Elements | Profile photo, Name, Username, Follow, Bio, Website, Stats |
| **Footer** | Show footer | OFF |
| **Advanced** | Lazy-load images | ON |
| | Tablet breakpoint | 920px |
| | Mobile breakpoint | 640px |

### Custom JavaScript (in index.md)

Our custom JS enhances the **lightbox** (the popup when you click a post). LightWidget's Custom CSS field does NOT affect the lightbox - it must be styled via site code.

| Feature | What it does |
|---------|--------------|
| **Lightbox detection** | MutationObserver watches for `.lightwidget__lightbox` added to DOM |
| **Responsive layout** | Mobile: stacks vertically (image top, caption below). Desktop: side-by-side (40% image / 60% caption) |
| **URL enhancement** | Converts plain text URLs to clickable links |
| **Phone enhancement** | Converts Indonesian phone numbers (0xxx or +62xxx) to WhatsApp links |
| **Navigation watching** | Re-enhances caption when navigating between posts |

Happy hashing!
