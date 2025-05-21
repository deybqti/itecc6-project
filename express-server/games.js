const express = require('express');
const router = express.Router();
const db = require('./database');

// Get all games
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM games');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new game
router.post('/', async (req, res) => {
  try {
    const { title, platform, play_status, hours_played, rating } = req.body;
    const [result] = await db.execute(
      'INSERT INTO games (title, platform, play_status, hours_played, rating) VALUES (?, ?, ?, ?, ?)',
      [title, platform, play_status, hours_played, rating]
    );
    res.status(201).json({ id: result.insertId, message: 'Game added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a game by id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, platform, play_status, hours_played, rating } = req.body;
    await db.execute(
      'UPDATE games SET title = ?, platform = ?, play_status = ?, hours_played = ?, rating = ? WHERE id = ?',
      [title, platform, play_status, hours_played, rating, id]
    );
    res.json({ message: 'Game updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a game by id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM games WHERE id = ?', [id]);
    res.json({ message: 'Game deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
