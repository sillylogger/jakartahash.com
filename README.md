# Jakarta Hash House Harriers

A lightweight static site for Jakarta's running club with a drinking problem. Built with Jekyll.

## Quick Start

```bash
# Requires Ruby
bundle install
bundle exec jekyll serve
```

Site runs at `http://localhost:4000`.

## Deploy

```bash
ruby scripts/process-images.rb  # generate WebP from _source/img/
bundle exec jekyll build
# then deploy _site/
```

## Dev Roadmap

See `.project/active-development.md` for bugs, features, and roadmap.

## Information Sources
* https://en.wikipedia.org/wiki/Hash_House_Harriers
* https://genealogy.gotothehash.net/index.php?r=chapters/list&country=Indonesia

Happy hashing!
