const mysql = require('mysql2');

// Create a connection pool for better performance and scalability
const pool = mysql.createPool({
  host: 'localhost',       // Your MySQL host, usually localhost
  user: 'root',   // Your MySQL username
  password: '12345', // Your MySQL password
  database: 'videogametracker', // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the promise-based pool so you can use async/await
module.exports = pool.promise();
