import express from 'express';
import { runQuery } from './services/analyzer.js';
import {users,user_behaviour,user_query_behaviour} from './db/mongoClient.js';
const app = express();
app.use(express.json());

app.post('/run-query', async (req, res) => {
const { sqlQuery, userContext } = req.body;
console.log("myqqqq--------------------------------------------------------", userContext);

const result = await runQuery(sqlQuery, userContext);
res.json(result);
});

/**
 * @route   GET /test
 * @desc    Fetch all documents from the 'profiles' collection
 */
// app.get('/test', async (req, res) => {
//   try {
//     // Assuming 'profiles' is a Mongoose model,
//     // .find({}) will fetch all documents in that collection.
    
//     // --- FIX ---
//     // The error shows 'profiles' is a native MongoDB collection,
//     // so we must call .toArray() on the cursor returned by .find()
//     const allProfiles = await profiles.find({}).toArray();
    

// await users.insertOne({ username: 'alice', email: 'alice@example.com', created_at: new Date() });
// await user_behaviour.insertOne({ user_id: someId, threat_level: 'high', reason: 'Suspicious activity', created_at: new Date() });
// await user_query_behaviour.insertOne({ user_id: someId, threat_level: 'medium', reason: 'Dangerous queries', queries: ['DROP TABLE users;'], created_at: new Date() });

    
//     // Send the array of profiles as a JSON response
//     res.status(200).json(allProfiles);

//   } catch (error) {
//     console.error('Error fetching profiles:', error.message);
//     res.status(500).json({
//       message: 'Server error while fetching profiles',
//       error: error.message
//     });
//   }
// });

app.listen(3000, () => console.log('✅ DB Wrapper running on port 3000'));