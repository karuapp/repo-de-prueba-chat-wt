import "../bootstrap";

module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
  },
  dialect: process.env.DB_DIALECT || "mysql",
  timezone: process.env.DB_TIMEZONE || "-03:00",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: process.env.DB_DEBUG === "true",
  pool: {
    max: process.env.DB_POOL_MAX || 20, // Maximum number of connections in the pool
    min: process.env.DB_POOL_MIN || 0, // Minimum number of connections in the pool
    acquire: process.env.DB_POOL_ACQUIRE || 30000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
    idle: process.env.DB_POOL_IDLE || 10000 // The maximum time, in milliseconds, that a connection can be idle before being released
  }
};
