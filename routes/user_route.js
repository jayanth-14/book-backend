const userRouter = require('express').Router();
const { hasFields, allowAuthorized } = require('../handlers/common');
const {userDetailsHandler, profileDetailsHandler, getAddress} = require("../handlers/user")

userRouter.use(allowAuthorized);

userRouter.get("/user/:id",userDetailsHandler)

userRouter.get("/profile",profileDetailsHandler)

userRouter.get("/address", getAddress)


module.exports = userRouter;