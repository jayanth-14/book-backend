const userRouter = require('express').Router();
const { hasFields, allowAuthorized } = require('../handlers/common');
const {userDetailsHandler, profileDetailsHandler} = require("../handlers/user")

userRouter.use(allowAuthorized);

userRouter.get("/user/:id",userDetailsHandler)

userRouter.get("/profile",profileDetailsHandler)


module.exports = userRouter;