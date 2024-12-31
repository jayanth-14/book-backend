// importing nessesary handlers
const { inputsErrorHandler, internalErrorHandler } = require("./common");
const userModel = require("../models/user_model");


const userDetailsHandler = async (req, res) => {
  const email = req.params['email'];
  try {
    const data = await userModel.findOne({email: email});
    res.status(200).json({ status: "success", data });
  } catch (error) {
    return internalErrorHandler(res, error);
  }
};

module.exports = {userDetailsHandler};