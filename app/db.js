const { Pool } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
})

module.exports = class DataBase {

  static query(query, callback) {
    return pool.query(query, callback);
  }

  static postRoll(user, userId, channelId, message, sides, roll, callback) {
    pool.query("INSERT INTO rolls (username, userid, channelid, message, diesides, roll, rolldate) \
                VALUES ('" + user + "', \
                '" + userId + "', \
                '" + channelId + "', \
                '" + message + "', \
                " + sides + ", \
                " + roll + ", \
                now());",
      callback);
  }

  static getRolls(user, userId, callback) {
    pool.query("SELECT * FROM rolls WHERE username='" + user + "' AND userid='"
      + userId + "';", callback);
  }
}