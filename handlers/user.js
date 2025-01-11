// importing nessesary handlers
const { inputsErrorHandler, internalErrorHandler } = require("./common");
const userModel = require("../models/user_model");


const userDetailsHandler = async (req, res) => {
  const id = req.params['id'];
  try {
    const data = await userModel.findOne({_id: id});
    delete data.password;
    res.status(200).json({ status: "success", data });
  } catch (error) {
    return internalErrorHandler(res, error);
  }
};

const profileDetailsHandler = async (req, res) => {
  const userId = req.session.userId;
  try {
    const data = await userModel.findOne({_id: userId});
    delete data.password;
    res.status(200).json({ status: "success", data });
  } catch (error) {
    return internalErrorHandler(res, error);
  }
};

const getUserLocation = async (req, res) => {
  const userId = req.session.userId;
  try {
    const user = await userModel.findOne({_id: userId});
    return await user.location;
  }
  catch (error) {
    return internalErrorHandler(res, error);
  }
};

module.exports = {userDetailsHandler, profileDetailsHandler, getUserLocation};