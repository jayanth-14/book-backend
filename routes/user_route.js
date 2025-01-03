const userRouter = require('express').Router();
const { hasFields, allowAuthorized } = require('../handlers/common');
const {userDetailsHandler, profileDetailsHandler} = require("../handlers/user")

userRouter.use(allowAuthorized);

userRouter.get("/user/:email",userDetailsHandler)

userRouter.get("/user/profile",profileDetailsHandler)


module.exports = userRouter;