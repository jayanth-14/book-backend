/**
 * @route POST /signup
 * @status 200 - User successfully signed up.
 * @status 400 - Bad request, missing or invalid fields.
 * @example
 * Request: POST /signup
 * {
 *   "email": "jane.doe@example.com",
 *   "name": "Jane Doe",
 *   "password": "password123",
 *   "phone": "1234567890"
 * }
 * Response: 
 * {
 *   "status": "success",
 *   "message": "User created successfully"
 * }
 */

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

/**
 * @route GET /user/:email
 * @status 200 - User details fetched successfully.
 * @status 404 - User not found.
 * @example
 * Request: GET /user/jane.doe@example.com
 * Response: 
 * {
 *   "status": "success",
 *   "data": {
 *     "fullName": "Jane Doe",
 *     "email": "jane.doe@example.com",
 *     "phone": "1234567890",
 *     "address": "123 Main St",
 *     "location": {
 *       "type": "Point",
 *       "coordinates": [-73.935242, 40.730610]
 *     },
 *     "isEmailVerified": false,
 *     "isPhoneVerified": false,
 *     "wishlist": []
 *   }
 * }
 */