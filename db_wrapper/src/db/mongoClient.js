import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

console.log(2);
console.log("MONGO_URI:", process.env.MONGO_URI);

const mongoClient = new MongoClient('mongodb+srv://sanjayghanshyam5_db_user:Chandan123%40@cluster0.e0dz87b.mongodb.net/');
await mongoClient.connect();

const db = mongoClient.db('security_logs');  // replace with your DB name

// Export collections
export const users = db.collection('users');
export const user_behaviour = db.collection('user_behaviour');
export const user_query_behaviour = db.collection('user_query_behaviour');
