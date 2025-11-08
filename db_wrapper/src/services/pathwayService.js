import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function analyzeQuery(userId, query, category, reason) {
  const res = await axios.post(process.env.PATHWAY_ANALYZER_URL, {
    user_id: userId,
    query,
    category,
    reason
  });
  return res.data;
}
