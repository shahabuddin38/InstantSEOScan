export default (req, res) => {
  res.json({ message: 'API working', timestamp: new Date().toISOString() });
};
