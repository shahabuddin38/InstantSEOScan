// RapidAPI configuration
export const RAPIDAPI_KEY = 'ddcc181474msh9f948f7f9a00791p1bdcc6jsn6e1484faee71';

export const RAPIDAPI_ENDPOINTS = {
  // Semrush Keyword Magic Tool
  keywordVolume: {
    host: 'semrush-keyword-magic-tool.p.rapidapi.com',
    url: 'https://semrush-keyword-magic-tool.p.rapidapi.com/global-volume',
    method: 'GET'
  },
  keywordResearch: {
    host: 'semrush-keyword-magic-tool.p.rapidapi.com',
    url: 'https://semrush-keyword-magic-tool.p.rapidapi.com/keyword-research',
    method: 'GET'
  },
  questionKeywords: {
    host: 'semrush-keyword-magic-tool.p.rapidapi.com',
    url: 'https://semrush-keyword-magic-tool.p.rapidapi.com/Question-keyword-research-More',
    method: 'GET'
  },

  // Semrush Traffic
  urlTraffic: {
    host: 'semrush8.p.rapidapi.com',
    url: 'https://semrush8.p.rapidapi.com/url_traffic',
    method: 'GET'
  },

  // Moz DA/PA
  getDaPa: {
    host: 'moz-da-pa1.p.rapidapi.com',
    url: 'https://moz-da-pa1.p.rapidapi.com/v1/getDaPa',
    method: 'POST'
  },

  // Technical SEO Audit
  seoAudit: {
    host: 'technical-seo-audit.p.rapidapi.com',
    url: 'https://technical-seo-audit.p.rapidapi.com/api/complete-seo-report',
    method: 'POST'
  },

  // Bulk DA/PA Checker
  bulkDaPa: {
    host: 'bulk-ahref-da-pa-checker5.p.rapidapi.com',
    url: 'https://bulk-ahref-da-pa-checker5.p.rapidapi.com/bulk-dapa.php',
    method: 'POST'
  }
};

export function getApiHeaders(host: string) {
  return {
    'x-rapidapi-host': host,
    'x-rapidapi-key': RAPIDAPI_KEY,
    'Content-Type': 'application/json'
  };
}
