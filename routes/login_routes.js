const loginRouter = require('express').Router();
const { hasFields } = require('../handlers/common');
const login = require('../handlers/login');

loginRouter.post('/signup', hasFields(["email", "name", "password", "phone"]), login.signUpHandler);

loginRouter.post('/signin', hasFields(["email", "password"]), login.loginHandler);

module.exports = loginRouter;