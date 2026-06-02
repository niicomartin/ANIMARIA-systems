import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL || "";

const crearConfig = () => {
  if (databaseUrl) {
    const url = new URL(databaseUrl);

    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username || "root"),
      password: decodeURIComponent(url.password || ""),
      database: url.pathname.replace("/", "") || process.env.MYSQLDATABASE || "animaria",
      waitForConnections: true,
      connectionLimit: 10,
      multipleStatements: false,
    };
  }

  return {
    host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
    port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQLUSER || process.env.DB_USER || "root",
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "root",
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || "animaria",
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: false,
  };
};

const pool = mysql.createPool(crearConfig());

export default pool;
