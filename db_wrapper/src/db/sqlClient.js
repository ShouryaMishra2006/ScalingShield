// src/db/sqlClient.js
export default async function query(sqlQuery) {
  if (sqlQuery.toLowerCase().includes('drop') || sqlQuery.toLowerCase().includes('delete')) {
    return { rows: [], message: 'Mock DB: Query would be destructive, skipped execution.' };
  } else {
    return { rows: [{ mock: 'Query executed safely in mock DB' }] };
  }
}
