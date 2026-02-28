import axios from 'axios';
import * as cheerio from 'cheerio';
import { getUserByEmail, getUserById, canUserAccessAudit, createScan } from '../db.js';
import { verifyToken, extractTokenFromHeader } from '../jwt-utils.js';

const normalizeUrl = (url) => {
  const value = String(url || '').trim();
  if (!value) return '';
  return value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
};

export default async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPayload = verifyToken(token);
    if (!userPayload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await getUserByEmail(userPayload.email) || await getUserById(userPayload.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!await canUserAccessAudit(user)) {
      return res.status(403).json({ error: 'You do not have access to this feature.' });
    }

    const { url } = req.body || {};
    const targetUrl = normalizeUrl(url);

    if (!targetUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const parsedUrl = new URL(targetUrl);
    const origin = parsedUrl.origin;
    const domain = parsedUrl.hostname;

    const response = await axios.get(targetUrl, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    const $ = cheerio.load(html);

    const checks = [];

    checks.push({
      id: 'ssl',
      name: 'SSL Certificate (HTTPS)',
      status: targetUrl.startsWith('https://') ? 'Pass' : 'Fail',
      detail: targetUrl.startsWith('https://') ? 'HTTPS enabled' : 'HTTPS not detected'
    });

    const favicon = $('link[rel*="icon"]').attr('href');
    checks.push({
      id: 'favicon',
      name: 'Has Favicon',
      status: favicon ? 'Pass' : 'Fail',
      detail: favicon ? 'Favicon detected' : 'No favicon detected'
    });

    const canonical = $('link[rel="canonical"]').attr('href');
    checks.push({
      id: 'canonical',
      name: 'Canonical Tag Set',
      status: canonical ? 'Pass' : 'Fail',
      detail: canonical ? `Canonical URL: ${canonical}` : 'Canonical tag not found'
    });

    let hasSitemapInRobots = false;
    try {
      const robotsRes = await axios.get(`${origin}/robots.txt`, { timeout: 5000, validateStatus: () => true });
      if (robotsRes.status === 200 && typeof robotsRes.data === 'string') {
        hasSitemapInRobots = /sitemap:/i.test(robotsRes.data);
      }
    } catch (e) {
    }

    checks.push({
      id: 'robots_sitemap',
      name: 'Robots.txt Has Sitemap',
      status: hasSitemapInRobots ? 'Pass' : 'Fail',
      detail: hasSitemapInRobots ? 'Sitemap directive found in robots.txt' : 'Sitemap not found in robots.txt'
    });

    const ogTags = $('meta[property^="og:"]').length;
    checks.push({
      id: 'og_tags',
      name: 'Open Graph Tags',
      status: ogTags >= 3 ? 'Pass' : 'Fail',
      detail: `${ogTags} Open Graph tags found`
    });

    const semanticTags = ['nav', 'main', 'section', 'aside', 'footer', 'article', 'header'];
    const foundSemantic = semanticTags.filter((tag) => $(tag).length > 0);
    checks.push({
      id: 'semantic_html',
      name: 'Semantic HTML Tags',
      status: foundSemantic.length >= 3 ? 'Pass' : 'Fail',
      detail: `${foundSemantic.length} semantic tags found: ${foundSemantic.join(', ')}`
    });

    const title = $('title').text();
    checks.push({
      id: 'title_check',
      name: 'Title Tag',
      status: title && title.length > 10 && title.length < 70 ? 'Pass' : 'Fail',
      detail: title ? `Title: "${title}" (${title.length} chars)` : 'Missing title tag'
    });

    const metaDesc = $('meta[name="description"]').attr('content');
    checks.push({
      id: 'meta_desc',
      name: 'Meta Description',
      status: metaDesc && metaDesc.length > 50 && metaDesc.length < 170 ? 'Pass' : 'Fail',
      detail: metaDesc ? `Description length: ${metaDesc.length} chars` : 'Meta description missing'
    });

    const passCount = checks.filter((c) => c.status === 'Pass').length;
    const score = Math.round((passCount / checks.length) * 100);

    await createScan(user.id, domain, 'audit');

    return res.status(200).json({
      url: targetUrl,
      domain,
      score,
      checks,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('EEAT API error:', error);
    return res.status(500).json({ error: 'Failed to perform E-E-A-T audit.' });
  }
};
