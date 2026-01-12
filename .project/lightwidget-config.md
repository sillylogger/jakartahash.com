# LightWidget Configuration

The site embeds Instagram posts via [LightWidget](https://lightwidget.com). Configuration is split between their dashboard and our custom JavaScript.

## Dashboard Settings (lightwidget.com)

These settings affect the **widget grid** (the Instagram feed display):

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

## Custom JavaScript (in index.md)

Our custom JS enhances the **lightbox** (the popup when you click a post). LightWidget's Custom CSS field does NOT affect the lightbox - it must be styled via site code.

| Feature | What it does |
|---------|--------------|
| **Lightbox detection** | MutationObserver watches for `.lightwidget__lightbox` added to DOM |
| **Responsive layout** | Mobile: stacks vertically (image top, caption below). Desktop: side-by-side (40% image / 60% caption) |
| **URL enhancement** | Converts plain text URLs to clickable links |
| **Phone enhancement** | Converts Indonesian phone numbers (0xxx or +62xxx) to WhatsApp links |
| **Navigation watching** | Re-enhances caption when navigating between posts |
