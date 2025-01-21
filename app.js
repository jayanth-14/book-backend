const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('express-session');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const connectDb = require('./config/connectdb');
const requestLogger = require('morgan')
require('dotenv').config();

// Routes
const loginRoute = require('./routes/login_routes');
const userRouter = require('./routes/user_route');
const bookRouter = require('./routes/books_routes');
const transactionRouter = require('./routes/transaction_routes')
const { swaggerDocs, swaggerUi } = require('./swagger/swagger');

const app = express();
app.use(requestLogger('dev'));
app.use(cors({
  origin: "http://localhost:5173",
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'], // Add this
  exposedHeaders: ['set-cookie'], // Add this
}));
app.use(bodyParser.json());

app.use(cookieSession({
  name: 'session',
  secret: 'rebooked',
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: 'lax',  // Try this for development
  secure: false,
  httpOnly: true,
  domain: 'localhost'  // Add this
}));

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// route to check if user is logined or not


app.use(loginRoute);
app.use(userRouter);
app.use(bookRouter);
app.use(transactionRouter);

const PORT = 5000;
connectDb().then(() => {
  console.log('Mongo db connected');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});