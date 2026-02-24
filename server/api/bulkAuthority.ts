import { Request, Response } from 'express';
import axios from 'axios';
import { RAPIDAPI_ENDPOINTS, getApiHeaders } from '../config/rapidapi.js';

export const bulkAuthorityHandler = async (req: Request, res: Response) => {
  const { domains } = req.body;

  if (!domains || !Array.isArray(domains)) {
    return res.status(400).json({ error: 'Domains array is required' });
  }

  try {
    const results = [];

    for (const domain of domains) {
      try {
        const response = await axios.post(
          RAPIDAPI_ENDPOINTS.bulkDaPa.url,
          { q: domain },
          { headers: getApiHeaders(RAPIDAPI_ENDPOINTS.bulkDaPa.host) }
        );

        results.push({
          domain,
          data: response.data
        });
      } catch (error) {
        results.push({
          domain,
          error: 'Failed to fetch data'
        });
      }
    }

    res.json({
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bulk Authority API error:', error);
    res.status(500).json({ error: 'Failed to fetch bulk authority data' });
  }
};
