// src/services/analyzer.js
import query from '../db/sqlClient.js';
import fetch from 'node-fetch';
import { user_behaviour, user_query_behaviour } from '../db/mongoClient.js';

export async function runQuery(sqlQuery, userContext) {
  try {
    // 1️⃣ Fetch user behaviour from MongoDB
    const behaviour = await user_behaviour.findOne({ user_id: userContext.id });
    console.log('🛡️ User Behaviour from DB:', behaviour);

    // 2️⃣ Prepare context for analyzer including past queries
    // Ensure single document for user and append current query
    
    // 3️⃣ Fetch the single document for this user to include past queries in context
    const userQueryDoc = await user_query_behaviour.findOne({ user_id: userContext.id });
    console.log('📝 Past Queries:', userQueryDoc.queries);

    const context = {
      threat_level: behaviour?.threat_level || 'unknown',
      reason: behaviour?.reason || userContext.reason,
      past_queries: userQueryDoc.queries
    };

    // 4️⃣ Send query + context to Python LLM analyzer
    const response = await fetch('http://localhost:8123/v1/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userContext.id,
        query: sqlQuery,
        category: userContext.category,
        context
      })
    });

    const result = await response.json();
    console.log('🔍 Analyzer Result:', result);

    // 5️⃣ Update last inserted query with analyzer decision and explanation
     // 1️⃣ Ensure the document exists, create if not
await user_query_behaviour.updateOne(
  { user_id: userContext.id },
  {
    $setOnInsert: {
      threat_level: behaviour?.threat_level || 'unknown',
      reason: behaviour?.reason || userContext.reason,
      created_at: new Date()
      // Don't include `queries` here
    }
  },
  { upsert: true }
);

// 2️⃣ Push the new query with analyzer result
await user_query_behaviour.updateOne(
  { user_id: userContext.id },
  {
    $push: {
      queries: {
        query: sqlQuery,
        threat_level: result.analysis?.decision === 'safe' ? 'low' : behaviour?.threat_level || 'medium',
        reason: result.analysis?.explanation || behaviour?.reason || 'No reason provided',
        created_at: new Date()
      }
    }
  }
);

    // 6️⃣ Execute query if safe
    if (result.analysis?.decision === 'safe') {
      return await query(sqlQuery);
    } else {
      return {
        message: '🚫 Query blocked by analyzer',
        reason: result.analysis?.explanation,
        decision: result.analysis?.decision
      };
    }

  } catch (err) {
    return { error: 'Analyzer server not reachable', details: err.message };
  }
}
