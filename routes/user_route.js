const userRouter = require('express').Router();
const { hasFields, allowAuthorized } = require('../handlers/common');
const {userDetailsHandler} = require("../handlers/user")

// userRouter.use(allowAuthorized);

userRouter.get("/user/:email",userDetailsHandler)

module.exports = userRouter;