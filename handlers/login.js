const {supabase} = require('../app');
const { internalErrorHandler, inputsErrorHandler } = require("./common");
const userModel = require('../models/user_model') 


// login hanlers

const loginHandler = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({email: email}).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.'});
    }
    const validPassword = password === user.password;
    
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    delete user.password;
    req.session.userId = user._id;
    res.status(200).json({ status: "success", data: {
      fullName : user.fullName,
      email: user.email,
      userId: user._id
    } });
  } catch (err) {
    internalErrorHandler(res, err);
  }
}

const signUpHandler = async (req, res) => {
  const { email, password, fullName, phone, address, coordinates } = req.body;

  try {
    const userData = {
        "fullName": fullName,
        "email": email,
        "password": password,
        "phone": phone,
        "address": address,
        "location": {
          "type": "Point",
          "coordinates": coordinates
        }
      };
    userModel.create(userData)
      .then((message) => {
        res.status(200).json({ status: "success", message });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({ "error": error });
      })
  } catch (err) {
    console.log(err);
    
    internalErrorHandler(res, err);
  }
}

module.exports = { loginHandler, signUpHandler };
