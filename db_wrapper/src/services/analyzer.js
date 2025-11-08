// src/services/analyzer.js
import query from '../db/sqlClient.js';
import fetch from 'node-fetch';
import { user_behaviour, user_query_behaviour } from '../db/mongoClient.js';

export async function runQuery(sqlQuery, userContext) {
  try {
    // 1️⃣ Fetch user behaviour from MongoDB
    const behaviour = await user_behaviour.findOne({ user_id: userContext.id });
    console.log('🛡️ User Behaviour from DB:', behaviour);

    // 2️⃣ Fetch past query behaviour for this user
    const pastQueriesCursor = await user_query_behaviour
      .find({ user_id: userContext.id })
      .sort({ created_at: -1 })
      .limit(10); // you can adjust how many past queries to include
    const pastQueries = await pastQueriesCursor.toArray();
    console.log('📝 Past Queries:', pastQueries);

    // Prepare context for analyzer
    const context = {
      threat_level: behaviour?.threat_level || 'unknown',
      reason: behaviour?.reason || userContext.reason,
      past_queries: pastQueries.map(doc => ({
        query: doc.queries,
        threat_level: doc.threat_level,
        reason: doc.reason,
        created_at: doc.created_at
      }))
    };

    // 3️⃣ Send query + context to Python LLM analyzer
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

    // 4️⃣ Log current query to user_query_behaviour
    await user_query_behaviour.insertOne({
      user_id: userContext.id,
      threat_level: result.analysis?.decision === 'safe' ? 'low' : behaviour?.threat_level || 'medium',
      reason: result.analysis?.explanation || behaviour?.reason || 'No reason provided',
      queries: [sqlQuery],
      created_at: new Date()
    });

    // 5️⃣ Execute query if safe
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
