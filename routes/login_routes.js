const loginRouter = require('express').Router();
const { hasFields, isLogined } = require('../handlers/common');
const login = require('../handlers/login');

loginRouter.get('/islogined', isLogined)

loginRouter.post('/signup', hasFields(["email", "fullName", "password", "phone"]), login.signUpHandler);

loginRouter.post('/signin', hasFields(["email", "password"]), login.loginHandler);

module.exports = loginRouter;