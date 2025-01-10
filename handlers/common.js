const internalErrorHandler = (res, err) => {
  return res.status(500).json({ error: 'Internal server error.', details: err.message });
}

const inputsErrorHandler = (res, errorMessage) => {
  return res.status(400).json({ error: errorMessage });
}

const hasFields = fields => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !field in req.body);
    if (missingFields.length == 0) {
      return next();
    }
    const error = 'Required fields not present in the request body';
    res.status(StatusCodes.BAD_REQUEST).json({ error, missingFields });
  };
};

const allowAuthorized = (req, res, next) => {
  console.log(req.session);
  
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ session: req.session, error: 'unauthorized' });
  }
};

module.exports = {internalErrorHandler, inputsErrorHandler, hasFields, allowAuthorized}