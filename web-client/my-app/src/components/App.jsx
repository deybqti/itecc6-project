import React, { useState } from 'react';
import GameForm from './GameForm';
import GameTable from './GameTable';
import './App.css';

const App = () => {
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState('');

  const addGame = (game) => {
    setGames([...games, game]);
  };

  const updateGameStatus = (index, status) => {
    const updatedGames = [...games];
    updatedGames[index].status = status;
    setGames(updatedGames);
  };

  const logPlayTime = (index, time) => {
    const updatedGames = [...games];
    updatedGames[index].playTime += time;
    setGames(updatedGames);
  };

  const rateGame = (index, rating) => {
    const updatedGames = [...games];
    updatedGames[index].rating = rating;
    setGames(updatedGames);
  };

  const deleteGame = (index) => {
    const updatedGames = games.filter((_, i) => i !== index);
    setGames(updatedGames);
  };

  const filteredGames = filter
    ? games.filter(game => game.status === filter || game.platform === filter)
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