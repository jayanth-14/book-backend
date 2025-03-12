const userRouter = require('express').Router();
const { hasFields, allowAuthorized } = require('../handlers/common');
const {userDetailsHandler, profileDetailsHandler, getAddress, getMyBooks, getSellerStats, updateProfile} = require("../handlers/user")

userRouter.use(allowAuthorized);

userRouter.get("/user/:id",userDetailsHandler)

userRouter.get("/profile",profileDetailsHandler)

userRouter.put("/update", updateProfile)

userRouter.get("/address", getAddress)
userRouter.get("/mybooks", getMyBooks)

userRouter.get("/dashboard", getSellerStats)



module.exports = userRouter;