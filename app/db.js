const { Pool} = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'postgres',
  password: process.env.postgresPass,
  port: 5432,
})

module.exports = {
    query: (query, callback) => {
        return pool.query(query, callback);
    }
}
