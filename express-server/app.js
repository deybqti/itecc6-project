const express = require('express');
const app = express();
const gamesRoutes = require('./games');  // Adjust the path if needed
const db = require('./database');       // Add this line
const cors = require('cors');
app.use(cors());

// Test database connection
async function testDbConnection() {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS solution');
    console.log('Database connected successfully! Test query result:', rows);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testDbConnection();

app.use(express.json()); // for parsing application/json
app.use('/games', gamesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
