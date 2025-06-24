import React, { useState, useEffect, useRef } from 'react';
import './GameTracker.css';
import StarRating from '../components/StarRating';

function GameTracker() {
  const [games, setGames] = useState([]);
  const [newGame, setNewGame] = useState({
    title: '',
    platform: '',
    play_status: '',
    rating: 0,
    hours_played: 0, 
  });

  const [filterStatus, setFilterStatus] = useState('All');
  const [editingIndex, setEditingIndex] = useState(null);
  const timersRef = useRef({}); 

  // Real-time timer for all 'Playing' games
  useEffect(() => {
    const interval = setInterval(() => {
      setGames(prevGames => prevGames.map(game => {
        if (game.play_status === 'Playing') {
          return { ...game, hours_played: Math.floor(Number(game.hours_played) || 0) + 1 };
        }
        return game;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch games from database on component mount
  useEffect(() => {
    fetchGames();
  }, []);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearInterval);
    };
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:5000/games');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setGames(data);
      
      // Start timers for games with "Playing" status
      data.forEach((game, index) => {
        if (game.play_status === 'Playing') {
          startTimer(index, game.id);
        }
      });
    } catch (error) {
      console.error('Error fetching games:', error);
      alert('Failed to load games from database');
    }
  };

  const formatTime = (seconds) => {
    seconds = Math.floor(Number(seconds) || 0);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const startTimer = (index, gameId) => {
    // Clear existing timer if any
    if (timersRef.current[gameId]) {
      clearInterval(timersRef.current[gameId]);
    }

    // Start new timer
    timersRef.current[gameId] = setInterval(async () => {
      setGames(prevGames => {
        const updated = [...prevGames];
        if (updated[index]) {
          // Increment by 1 second (not 1 hour)
          updated[index].hours_played = (updated[index].hours_played || 0) + 1;
          
          // Update database every 60 seconds (1 minute)
          if (updated[index].hours_played % 60 === 0) {
            updateGameInDatabase(updated[index]);
          }
        }
        return updated;
      });
    }, 1000); // 1000ms = 1 second
  };

  const stopTimer = (gameId) => {
    if (timersRef.current[gameId]) {
      clearInterval(timersRef.current[gameId]);
      delete timersRef.current[gameId];
    }
  };

  const updateGameInDatabase = async (game) => {
    try {
      await fetch(`http://localhost:5000/games/${game.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(game),
      });
    } catch (error) {
      console.error('Error updating game in database:', error);
    }
  };

  const handleAddOrUpdateGame = async () => {
    if (!newGame.title || !newGame.platform || !newGame.play_status) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (editingIndex !== null) {
        // Update existing game
        const gameToUpdate = games[editingIndex];
        const oldStatus = gameToUpdate.play_status;
        const newStatus = newGame.play_status;

        // Stop timer if status is changing from "Playing"
        if (oldStatus === 'Playing' && newStatus !== 'Playing') {
          stopTimer(gameToUpdate.id);
        }

        const response = await fetch(`http://localhost:5000/games/${gameToUpdate.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newGame),
        });

        if (!response.ok) {
          throw new Error('Failed to update game');
        }

        // Update local state
        const updatedGames = [...games];
        updatedGames[editingIndex] = { ...gameToUpdate, ...newGame };
        setGames(updatedGames);

        // Start timer if new status is "Playing"
        if (newStatus === 'Playing') {
          startTimer(editingIndex, gameToUpdate.id);
        }

        setEditingIndex(null);
      } else {
        // Add new game
        const response = await fetch('http://localhost:5000/games', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newGame),
        });

        if (!response.ok) {
          throw new Error('Failed to add game');
        }

        const savedGame = await response.json();
        const newGameWithId = { id: savedGame.id, ...newGame };
        setGames([...games, newGameWithId]);

        // Start timer if status is "Playing"
        if (newGame.play_status === 'Playing') {
          startTimer(games.length, savedGame.id);
        }
      }

      setNewGame({ title: '', platform: '', play_status: '', rating: 0, hours_played: 0 });
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Failed to save game to database');
    }
  };

  const handleDelete = async (index) => {
    const gameToDelete = games[index];
    
    // Stop timer if game is being deleted
    stopTimer(gameToDelete.id);
    
    try {
      const response = await fetch(`http://localhost:5000/games/${gameToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete game');
      }

      const updated = [...games];
      updated.splice(index, 1);
      setGames(updated);
      if (editingIndex === index) setEditingIndex(null);
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game from database');
    }
  };

  const handleEdit = (index) => {
    const game = games[index];
    setNewGame({
      title: game.title,
      platform: game.platform,
      play_status: game.play_status,
      rating: game.rating || 0,
      hours_played: game.hours_played || 0,
    });
    setEditingIndex(index);
  };

  const handleStatusChange = async (index, newStatus) => {
    const game = games[index];
    const oldStatus = game.play_status;

    // Stop timer if changing from "Playing"
    if (oldStatus === 'Playing' && newStatus !== 'Playing') {
      stopTimer(game.id);
    }

    // Start timer if changing to "Playing"
    if (oldStatus !== 'Playing' && newStatus === 'Playing') {
      startTimer(index, game.id); // Start timer immediately for real-time UI
    }

    try {
      const response = await fetch(`http://localhost:5000/games/${game.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...game,
          play_status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update game status');
      }

      const updatedGames = [...games];
      updatedGames[index].play_status = newStatus;
      setGames(updatedGames);
    } catch (error) {
      console.error('Error updating game status:', error);
      alert('Failed to update game status in database');
    }
  };

  const filteredGames =
    filterStatus === 'All'
      ? games
      : games.filter((game) => game.play_status === filterStatus);

  return (
    <div className="tracker-container">
      <h1 className="title">Video Game Tracker</h1>

      <div className="filter-box">
        <label>Filter by Status: </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Unplayed">Unplayed</option>
          <option value="Playing">Playing</option>
          <option value="Completed">Completed</option>
          <option value="Abandoned">Abandoned</option>
        </select>
      </div>

      <div className="form-box">
        <input
          placeholder="Game Name"
          value={newGame.title}
          onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
        />
        <input
          placeholder="Platform"
          value={newGame.platform}
          onChange={(e) => setNewGame({ ...newGame, platform: e.target.value })}
        />
        <select
          value={newGame.play_status}
          onChange={(e) => setNewGame({ ...newGame, play_status: e.target.value })}
        >
          <option value="">Select status</option>
          <option value="Unplayed">Unplayed</option>
          <option value="Playing">Playing</option>
          <option value="Completed">Completed</option>
          <option value="Abandoned">Abandoned</option>
        </select>

        <div>
          <span>Rating: </span>
          <StarRating
            rating={newGame.rating}
            onRatingChange={(value) =>
              setNewGame({ ...newGame, rating: value })
            }
          />
        </div>

        <button onClick={handleAddOrUpdateGame}>
          {editingIndex !== null ? 'Update Game' : 'Add Game'}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Game</th>
            <th>Platform</th>
            <th>Status</th>
            <th>Play Time</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredGames.map((game, index) => (
            <tr key={game.id || index}>
              <td>{game.title}</td>
              <td>{game.platform}</td>
              <td>
                <select
                  value={game.play_status || ''}
                  onChange={(e) => handleStatusChange(index, e.target.value)}
                >
                  <option value="Unplayed">Unplayed</option>
                  <option value="Playing">Playing</option>
                  <option value="Completed">Completed</option>
                  <option value="Abandoned">Abandoned</option>
                </select>
              </td>
              <td>
                {game.play_status === 'Playing' && (
                  <span style={{ color: '#00ff00', fontWeight: 'bold' }}>▶ </span>
                )}
                {formatTime(game.hours_played || 0)}
              </td>
              <td>
                {'★'.repeat(game.rating || 0)}
                {'☆'.repeat(5 - (game.rating || 0))}
              </td>
              <td>
                <button onClick={() => handleEdit(index)}>Edit</button>{' '}
                <button onClick={() => handleDelete(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GameTracker;
