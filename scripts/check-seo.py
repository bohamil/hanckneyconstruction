"""Validate crawlable static pages, local links/assets, metadata and JSON-LD.
Run: python3 scripts/check-seo.py [site-directory]
No third-party dependencies or network requests.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
import json
import sys
import xml.etree.ElementTree as ET

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]).resolve()
BASE = 'https://hackney-construction.com/'
errors = []

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.tags = []
        self.title = ''
        self.h1 = 0
        self.ids = set()
        self.ld = []
        self.active = None
        self.buffer = ''
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag == 'h1':
            self.h1 += 1
        if tag == 'title' or (tag == 'script' and attrs.get('type') == 'application/ld+json'):
            self.active = tag
            self.buffer = ''
    def handle_data(self, data):
        if self.active:
            self.buffer += data
    def handle_endtag(self, tag):
        if tag == self.active:
            if tag == 'title':
                self.title = self.buffer.strip()
            else:
                self.ld.append(json.loads(self.buffer))
            self.active = None

pages = {}
for file in sorted(ROOT.rglob('*.html')):
    if '.git' in file.parts:
        continue
    try:
        pages[file] = Page(file.read_text())
    except (ValueError, UnicodeError) as exc:
        errors.append(f'{file.relative_to(ROOT)}: invalid HTML/JSON-LD: {exc}')

sitemap = {node.text for node in ET.parse(ROOT / 'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
titles, descriptions = set(), set()
for file, page in pages.items():
    relative = file.relative_to(ROOT).as_posix()
    url = BASE + ('' if relative == 'index.html' else relative)
    meta = [attrs for tag, attrs in page.tags if tag == 'meta']
    noindex = any('noindex' in attrs.get('content', '') for attrs in meta if attrs.get('name') == 'robots')
    if not noindex:
        for label, values, seen in [
            ('title', [page.title] if page.title else [], titles),
            ('description', [a.get('content', '') for a in meta if a.get('name') == 'description'], descriptions),
        ]:
            if len(values) != 1 or not values[0] or values[0] in seen:
                errors.append(f'{relative}: missing/duplicate {label}')
            seen.update(values)
        canonicals = [a.get('href') for t, a in page.tags if t == 'link' and a.get('rel') == 'canonical']
        if canonicals != [url]:
            errors.append(f'{relative}: canonical mismatch {canonicals}')
        if url not in sitemap:
            errors.append(f'{relative}: missing from sitemap')
        if page.h1 != 1:
            errors.append(f'{relative}: expected one main heading, got {page.h1}')
    elif url in sitemap:
        errors.append(f'{relative}: noindex page in sitemap')
    for tag, attrs in page.tags:
        if tag == 'img':
            if 'alt' not in attrs:
                errors.append(f'{relative}: image missing alt')
            if not all(str(attrs.get(key, '')).isdigit() and int(attrs[key]) > 0 for key in ('width', 'height')):
                errors.append(f'{relative}: image needs intrinsic dimensions: {attrs.get("src")}')
        links = []
        if tag == 'a': links.append(attrs.get('href', ''))
        if tag in ('img', 'script'): links.append(attrs.get('src', ''))
        if tag == 'link': links.append(attrs.get('href', ''))
        if attrs.get('srcset'):
            links.extend(candidate.strip().split()[0] for candidate in attrs['srcset'].split(','))
        for link in filter(None, links):
            resolved = urlparse(urljoin(url, link))
            if resolved.netloc != 'hackney-construction.com' or resolved.scheme not in ('http', 'https'):
                continue
            target = ROOT / (unquote(resolved.path).lstrip('/') or 'index.html')
            if not target.is_file():
                errors.append(f'{relative}: missing local target {link}')
            elif resolved.fragment and target in pages and unquote(resolved.fragment) not in pages[target].ids:
                errors.append(f'{relative}: missing anchor {link}')
for url in sitemap:
    file = ROOT / (urlparse(url).path.lstrip('/') or 'index.html')
    if file not in pages:
        errors.append(f'sitemap: missing HTML page {url}')
robots = (ROOT / 'robots.txt').read_text()
if f'Sitemap: {BASE}sitemap.xml' not in robots or 'Disallow: /\n' in robots:
    errors.append('robots.txt: crawl access/sitemap mismatch')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'PASS: {len(sitemap)} indexable pages; metadata, JSON-LD, headings, local links, anchors, assets, image dimensions and robots/sitemap checked.')
