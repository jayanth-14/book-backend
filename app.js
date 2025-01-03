const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const connectDb = require('./config/connectdb');
require('dotenv').config();

// Routes
const loginRoute = require('./routes/login_routes');
const userRouter = require('./routes/user_route');
const bookRouter = require('./routes/books_routes');
const { swaggerDocs, swaggerUi } = require('./swagger/swagger');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(cookieSession({
  name: 'session',
  secret: 'rebooked',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}));

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use(loginRoute);
app.use(userRouter);
app.use(bookRouter);


const PORT = 5000;
connectDb().then(() => {
  console.log('Mongo db connected');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});