import React, { useState, useEffect, useRef } from 'react';
import GameForm from './GameForm';
import GameTable from './GameTable';
import './App.css';

const App = () => {
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState('');
  const timersRef = useRef({});

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

  const addGame = async (game) => {
    try {
      const response = await fetch('http://localhost:5000/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: game.name,
          platform: game.platform,
          play_status: game.status,
          rating: game.rating,
          hours_played: game.playTime || 0
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add game');
      }

      const savedGame = await response.json();
      const newGameWithId = { id: savedGame.id, ...game };
      setGames([...games, newGameWithId]);

      // Start timer if status is "Playing"
      if (game.status === 'Playing') {
        startTimer(games.length, savedGame.id);
      }
    } catch (error) {
      console.error('Error adding game:', error);
      alert('Failed to add game to database');
    }
  };

  const updateGameStatus = async (index, status) => {
    const gameToUpdate = games[index];
    const oldStatus = gameToUpdate.play_status;

    // Stop timer if changing from "Playing"
    if (oldStatus === 'Playing' && status !== 'Playing') {
      stopTimer(gameToUpdate.id);
    }

    // Start timer if changing to "Playing"
    if (oldStatus !== 'Playing' && status === 'Playing') {
      startTimer(index, gameToUpdate.id);
    }

    try {
      const response = await fetch(`http://localhost:5000/games/${gameToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...gameToUpdate,
          play_status: status
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update game');
      }

      const updatedGames = [...games];
      updatedGames[index].play_status = status;
      setGames(updatedGames);
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Failed to update game in database');
    }
  };

  const logPlayTime = async (index, time) => {
    const gameToUpdate = games[index];
    try {
      const response = await fetch(`http://localhost:5000/games/${gameToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...gameToUpdate,
          hours_played: time
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update game');
      }

      const updatedGames = [...games];
      updatedGames[index].hours_played = time;
      setGames(updatedGames);
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Failed to update game in database');
    }
  };

  const rateGame = async (index, rating) => {
    const gameToUpdate = games[index];
    try {
      const response = await fetch(`http://localhost:5000/games/${gameToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...gameToUpdate,
          rating: rating
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update game');
      }

      const updatedGames = [...games];
      updatedGames[index].rating = rating;
      setGames(updatedGames);
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Failed to update game in database');
    }
  };

  const deleteGame = async (index) => {
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

      const updatedGames = games.filter((_, i) => i !== index);
      setGames(updatedGames);
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game from database');
    }
  };

  const filteredGames = filter
    ? games.filter(game => game.play_status === filter || game.platform === filter)
    : games;

  return (
    <div className="App">
      <h1>Video Game Tracker</h1>
      <GameForm addGame={addGame} />
      
      <div className="add-game-container">
        <label>Filter by platform/status: </label>
        <select onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="PC">PC</option>
          <option value="Console">Console</option>
          <option value="Unplayed">Unplayed</option>
          <option value="Playing">Playing</option>
          <option value="Completed">Completed</option>
          <option value="Abandoned">Abandoned</option>
        </select>
      </div>

      <div className="table-container">
        <GameTable
          games={filteredGames}
          updateGameStatus={updateGameStatus}
          logPlayTime={logPlayTime}
          rateGame={rateGame}
          deleteGame={deleteGame}
        />
      </div>
    </div>
  );
};

export default App;