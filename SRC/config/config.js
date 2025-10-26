require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  db: {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    options: {
      host: process.env.HOST,
      dialect: process.env.DIALECT,
      storage: './data/SnapshotDB.sqlite'
    }
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET
  }
}