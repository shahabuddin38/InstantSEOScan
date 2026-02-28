const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

function normalizeUrl(rawUrl) {
  if (!rawUrl) return null;

  let value = rawUrl.trim();
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  try {
    const url = new URL(value);
    return url.toString();
  } catch {
    return null;
  }
}

function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function auditSeo(html, targetUrl) {
  const $ = cheerio.load(html);

  const title = ($('title').first().text() || '').trim();
  const metaDescription = ($('meta[name="description"]').attr('content') || '').trim();
  const canonical = ($('link[rel="canonical"]').attr('href') || '').trim();
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const images = $('img');
  const imagesWithoutAlt = images.filter((_, img) => !$(img).attr('alt') || !$(img).attr('alt').trim()).length;
  const robots = ($('meta[name="robots"]').attr('content') || '').toLowerCase();
  const hasNoindex = robots.includes('noindex');
  const structuredDataCount = $('script[type="application/ld+json"]').length;

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = countWords(bodyText);

  const checks = [];
  const issues = [];
  let score = 100;

  if (title.length >= 30 && title.length <= 60) {
    checks.push({ level: 'good', message: 'Title length is in the recommended range (30-60).' });
  } else {
    score -= 12;
    const msg = `Title length is ${title.length}. Aim for 30-60 characters.`;
    checks.push({ level: 'warning', message: msg });
    issues.push({ level: 'warning', message: msg });
  }

  if (metaDescription.length >= 120 && metaDescription.length <= 160) {
    checks.push({ level: 'good', message: 'Meta description length is optimized (120-160).' });
  } else {
    score -= 12;
    const msg = `Meta description length is ${metaDescription.length}. Target 120-160 characters.`;
    checks.push({ level: 'warning', message: msg });
    issues.push({ level: 'warning', message: msg });
  }

  if (h1Count === 1) {
    checks.push({ level: 'good', message: 'Exactly one H1 heading found.' });
  } else {
    score -= 10;
    const msg = `Found ${h1Count} H1 headings. Use exactly one H1.`;
    checks.push({ level: 'warning', message: msg });
    issues.push({ level: 'warning', message: msg });
  }

  if (images.length === 0 || imagesWithoutAlt === 0) {
    checks.push({ level: 'good', message: 'All images have alt text.' });
  } else {
    score -= 10;
    const msg = `${imagesWithoutAlt} image(s) missing alt text.`;
    checks.push({ level: 'warning', message: msg });
    issues.push({ level: 'warning', message: msg });
  }

  if (canonical) {
    checks.push({ level: 'good', message: 'Canonical URL tag is present.' });
  } else {
    score -= 7;
    const msg = 'Canonical URL tag is missing.';
    checks.push({ level: 'warning', message: msg });
    issues.push({ level: 'warning', message: msg });
  }

  if (!hasNoindex) {
    checks.push({ level: 'good', message: 'No noindex directive detected.' });
  } else {
    score -= 20;
    const msg = 'Page has a noindex directive and may not appear in search.';
    checks.push({ level: 'bad', message: msg });
    issues.push({ level: 'bad', message: msg });
  }

  if (structuredDataCount > 0) {
    checks.push({ level: 'good', message: 'Structured data was found.' });
  } else {
    score -= 8;
    const msg = 'No structured data found (JSON-LD).' ;
    checks.push({ level: 'warning', message: msg });
    issues.push({ level: 'warning', message: msg });
  }

  if (wordCount >= 300) {
    checks.push({ level: 'good', message: `Content length is healthy (${wordCount} words).` });
  } else {
    score -= 8;
    const msg = `Low content depth (${wordCount} words). Consider adding more relevant content.`;
    checks.push({ level: 'warning', message: msg });
    issues.push({ level: 'warning', message: msg });
  }

  score = Math.max(0, Math.round(score));

  return {
    page: {
      url: targetUrl,
      title,
      metaDescription,
      canonical,
      wordCount
    },
    summary: {
      seoScore: score,
      titleLength: title.length,
      metaDescriptionLength: metaDescription.length,
      h1Count,
      h2Count,
      imageCount: images.length,
      imagesWithoutAlt,
      structuredDataCount
    },
    checks,
    issues
  };
}

function buildFreeRecommendation(report) {
  const { summary, page, issues } = report;
  const topIssues = issues.slice(0, 5).map((item, index) => `${index + 1}. ${item.message}`).join('\n');

  return [
    `Quick SEO Action Plan for ${page.url}`,
    `Current score: ${summary.seoScore}/100`,
    '',
    'Top priorities:',
    topIssues || '1. No major issues found. Focus on content updates and internal linking.',
    '',
    'Next 7 days:',
    '- Update title and meta description for stronger intent match.',
    '- Fix heading structure and add missing image alt text.',
    '- Add schema markup relevant to your business type.',
    '- Expand page content with FAQs and internal links.'
  ].join('\n');
}

async function getGeminiRecommendation(report) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return buildFreeRecommendation(report);
  }

  const prompt = [
    'You are an SEO consultant. Give concise actionable recommendations.',
    'Output in plain text with short bullets.',
    `URL: ${report.page.url}`,
    `SEO Score: ${report.summary.seoScore}`,
    `Title Length: ${report.summary.titleLength}`,
    `Meta Description Length: ${report.summary.metaDescriptionLength}`,
    `H1 Count: ${report.summary.h1Count}`,
    `H2 Count: ${report.summary.h2Count}`,
    `Images Missing Alt: ${report.summary.imagesWithoutAlt}`,
    `Structured Data Blocks: ${report.summary.structuredDataCount}`,
    `Word Count: ${report.page.wordCount}`,
    'Issues:',
    ...(report.issues.length ? report.issues.map((item) => `- ${item.message}`) : ['- No major technical issues'])
  ].join('\n');

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  if (!response.ok) {
    return buildFreeRecommendation(report);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  return text || buildFreeRecommendation(report);
}

app.post('/api/scan', async (req, res) => {
  try {
    const targetUrl = normalizeUrl(req.body?.url);
    if (!targetUrl) {
      return res.status(400).json({ error: 'Enter a valid URL.' });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'instantseoscan.com/1.0 (+https://instantseoscan.com)'
      }
    });

    if (!response.ok) {
      return res.status(400).json({ error: `Could not fetch URL: ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return res.status(400).json({ error: 'URL did not return an HTML page.' });
    }

    const html = await response.text();
    const report = auditSeo(html, targetUrl);

    let aiRecommendation = buildFreeRecommendation(report);
    if (AI_PROVIDER === 'gemini') {
      aiRecommendation = await getGeminiRecommendation(report);
    }

    return res.json({
      ...report,
      aiProvider: process.env.GEMINI_API_KEY ? 'gemini' : 'free-local',
      aiRecommendation
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Scan failed unexpectedly.' });
  }
});

if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`instantseoscan.com running at http://localhost:${PORT}`);
  });
}
