const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
};


const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON in request body.' });
  }
 
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A record with this value already exists.' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error.' });
};

module.exports = { notFound, errorHandler };
