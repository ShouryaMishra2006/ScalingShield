import dotenv from "dotenv";
dotenv.config();

export const config = {
  sql: {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_DB,
  },
  mongoUri: process.env.MONGO_URI,
  analyzerUrl: process.env.ANALYZER_URL,
};
