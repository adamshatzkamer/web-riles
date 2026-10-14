import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

test('core entry files exist', () => {
  for (const f of ['index.html', 'robots.txt', 'sitemap.xml', 'css/styles.css', 'js/app.js']) {
    assert.ok(existsSync(join(root, f)), `missing ${f}`);
  }
});

test('index.html is a valid document shell', () => {
  const html = read('index.html');
  assert.match(html, /<html[^>]*\slang="[^"]+"/, 'html tag must declare a lang attribute');
  assert.match(html, /<title>[^<]+<\/title>/, 'title is required for SEO');
  assert.match(html, /<meta\s+name="viewport"/, 'viewport meta is required');
});

test('robots.txt points at the sitemap', () => {
  const robots = read('robots.txt');
  assert.match(robots, /Sitemap:\s*\S+\.xml/i, 'robots.txt must reference a sitemap');
});

test('sitemap.xml is well-formed urlset', () => {
  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /<\?xml version="1\.0"/, 'sitemap must declare xml prolog');
  assert.match(sitemap, /<urlset[\s>]/, 'sitemap must be a urlset');
  const urls = sitemap.match(/<loc>/g) || [];
  assert.ok(urls.length >= 1, 'sitemap must contain at least one url');
  const opens = (sitemap.match(/<url>/g) || []).length;
  const closes = (sitemap.match(/<\/url>/g) || []).length;
  assert.equal(opens, closes, 'every <url> must be closed');
});

test('no untracked absolute http:// asset links (mixed content risk)', () => {
  const html = read('index.html');
  const insecure = html.match(/(?:src|href)="http:\/\/[^"]+"/g) || [];
  assert.deepEqual(insecure, [], `found insecure http:// references: ${insecure.join(', ')}`);
});
