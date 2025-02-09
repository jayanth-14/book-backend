const userModel = require("../models/user_model");

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
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'unauthorized' });
  }
};

const isLogined = async (req, res) => {
  if (req.session.userId) {
    const user = await userModel.findById(req.session.userId);
    res.status(200).json({ status: 'success', isLogined: true, user  });
  } else {
    res.status(200).json({ status: 'success', isLogined: false });
  }
};

module.exports = {internalErrorHandler, inputsErrorHandler, hasFields, allowAuthorized, isLogined}