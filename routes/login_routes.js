const loginRouter = require('express').Router();
const { hasFields } = require('../handlers/common');
const login = require('../handlers/login');

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
loginRouter.post('/signup', hasFields(["email", "name", "password", "phone"]), login.signUpHandler);

/**
 * @route POST /signin
 * @status 200 - User successfully signed in.
 * @status 401 - Unauthorized, invalid email or password.
 * @example
 * Request: POST /signin
 * {
 *   "email": "jane.doe@example.com",
 *   "password": "password123"
 * }
 * Response: 
 * {
 *   "status": "success",
 *   "data": {
 *     "fullName": "Jane Doe",
 *     "email": "jane.doe@example.com",
 *     "userId": "60c72b2f9b1d8e001c8e4b8e"
 *   }
 * }
 */
loginRouter.post('/signin', hasFields(["email", "password"]), login.loginHandler);

module.exports = loginRouter;