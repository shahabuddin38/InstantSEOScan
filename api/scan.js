import axios from 'axios';
import { getUserByEmail, getUserById, canUserAccessAudit, createScan } from './db.js';
import { verifyToken, extractTokenFromHeader } from './jwt-utils.js';

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

    const response = await axios.get(targetUrl, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

    const technical = {
      title: (html.match(/<title>(.*?)<\/title>/i) || [])[1] || 'Missing',
      description: (html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || [])[1] || 'Missing',
      h1Count: (html.match(/<h1\b/gi) || []).length,
      h2Count: (html.match(/<h2\b/gi) || []).length,
      h3Count: (html.match(/<h3\b/gi) || []).length,
      imgAltMissing: (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length,
      loadTime: 0
    };

    const content = html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000);

    let domain = '';
    try {
      domain = new URL(targetUrl).hostname;
    } catch (e) {
      domain = targetUrl;
    }

    await createScan(user.id, domain, 'audit');

    return res.status(200).json({
      technical,
      content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Scan API error:', error);
    return res.status(500).json({ error: 'Failed to scan site. Please try again.' });
  }
};
