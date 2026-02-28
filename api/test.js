module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ 
    message: 'API is working',
    method: req.method,
    url: req.url,
    path: req.path
  });
};
