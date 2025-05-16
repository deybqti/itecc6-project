import React, { useState, useEffect, useRef } from 'react';
import './GameTracker.css';
import StarRating from '../components/StarRating';

function GameTracker() {
  const [games, setGames] = useState([]);
  const [newGame, setNewGame] = useState({
    name: '',
    platform: '',
    status: '',
    rating: 0,
    playTime: 0, 
  });

  const [filterStatus, setFilterStatus] = useState('All');
  const [editingIndex, setEditingIndex] = useState(null);
  const timersRef = useRef({}); 
 
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const handleAddOrUpdateGame = () => {
    if (!newGame.name || !newGame.platform || !newGame.status) {
      alert('Please fill in all fields');
      return;
    }

    if (editingIndex !== null) {
      const updatedGames = [...games];
      updatedGames[editingIndex] = newGame;

 
      if (
        timersRef.current[editingIndex] &&
        newGame.status !== 'Playing'
      ) {
        clearInterval(timersRef.current[editingIndex]);
        delete timersRef.current[editingIndex];
      }

 
      if (
        newGame.status === 'Playing' &&
        !timersRef.current[editingIndex]
      ) {
        startTimer(editingIndex);
      }

      setGames(updatedGames);
      setEditingIndex(null);
    } else {
      const updatedGames = [...games, newGame];
      setGames(updatedGames);

      if (newGame.status === 'Playing') {
        startTimer(updatedGames.length - 1); 
      }
    }

    setNewGame({ name: '', platform: '', status: '', rating: 0, playTime: 0 });
  };

  const handleDelete = (index) => {
    const updated = [...games];
    updated.splice(index, 1);
    setGames(updated);
    if (editingIndex === index) setEditingIndex(null);

    if (timersRef.current[index]) {
      clearInterval(timersRef.current[index]);
      delete timersRef.current[index];
    }
  };

  const handleEdit = (index) => {
    setNewGame(games[index]);
    setEditingIndex(index);
  };

  const filteredGames =
    filterStatus === 'All'
      ? games
      : games.filter((game) => game.status === filterStatus);

  const startTimer = (index) => {
    timersRef.current[index] = setInterval(() => {
      setGames((prevGames) => {
        const updated = [...prevGames];
        if (updated[index]) {
          updated[index].playTime += 1;
        }
        return updated;
      });
    }, 1000);
  };

  useEffect(() => {
   
    return () => {
      Object.values(timersRef.current).forEach(clearInterval);
    };
  }, []);

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
          value={newGame.name}
          onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
        />
        <input
          placeholder="Platform"
          value={newGame.platform}
          onChange={(e) => setNewGame({ ...newGame, platform: e.target.value })}
        />
        <select
          value={newGame.status}
          onChange={(e) => setNewGame({ ...newGame, status: e.target.value })}
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
            <tr key={index}>
              <td>{game.name}</td>
              <td>{game.platform}</td>
              <td>{game.status}</td>
              <td>{formatTime(game.playTime)}</td>
              <td>
                {'★'.repeat(game.rating)}
                {'☆'.repeat(5 - game.rating)}
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
