import { Request, Response } from 'express';
import axios from 'axios';
import { RAPIDAPI_ENDPOINTS, getApiHeaders } from '../config/rapidapi.js';

export const daPaCheckerHandler = async (req: Request, res: Response) => {
  const { domain } = req.body;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    const response = await axios.post(
      RAPIDAPI_ENDPOINTS.getDaPa.url,
      { q: domain },
      { headers: getApiHeaders(RAPIDAPI_ENDPOINTS.getDaPa.host) }
    );

    res.json({
      domain,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('DA/PA API error:', error);
    res.status(500).json({ error: 'Failed to fetch DA/PA data' });
  }
};
