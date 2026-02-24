import { Request, Response } from 'express';
import axios from 'axios';
import { RAPIDAPI_ENDPOINTS, getApiHeaders } from '../config/rapidapi.js';

export const keywordHandler = async (req: Request, res: Response) => {
  const { keyword, country = 'us', languagecode = 'en' } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    // Get keyword volume data
    const volumeResponse = await axios.get(
      `${RAPIDAPI_ENDPOINTS.keywordVolume.url}?keyword=${encodeURIComponent(keyword)}&country=${country}`,
      { headers: getApiHeaders(RAPIDAPI_ENDPOINTS.keywordVolume.host) }
    );

    // Get keyword research data
    const researchResponse = await axios.get(
      `${RAPIDAPI_ENDPOINTS.keywordResearch.url}?keyword=${encodeURIComponent(keyword)}&country=${country}&languagecode=${languagecode}`,
      { headers: getApiHeaders(RAPIDAPI_ENDPOINTS.keywordResearch.host) }
    );

    res.json({
      keyword,
      country,
      volume: volumeResponse.data || {},
      research: researchResponse.data || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Keyword API error:', error);
    res.status(500).json({ error: 'Failed to fetch keyword data' });
  }
};
