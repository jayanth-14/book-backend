const jwt_config = {
  jwt_secret: process.env.JWT_SECRET || 'your-secret-key',
  jwt_expiry: '24h',
  salt_rounds: 10
};

module.exports = jwt_config;