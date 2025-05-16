import React from 'react';
import StarRating from './StarRating';  

const GameTable = ({ games, updateGameStatus, logPlayTime, rateGame, deleteGame }) => {
  return (
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
        {games.length === 0 ? (
          <tr>
            <td colSpan="6">No games added yet!</td>
          </tr>
        ) : (
          games.map((game, index) => (
            <tr key={index}>
              <td>{game.name}</td>
              <td>{game.platform}</td>
              <td>
                <select
                  value={game.status}
                  onChange={(e) => updateGameStatus(index, e.target.value)}
                >
                  <option value="Playing">Playing</option>
                  <option value="Completed">Completed</option>
                  <option value="Unplayed">Unplayed</option>
                  <option value="Abandoned">Abandoned</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={game.playTime}
                  onChange={(e) => logPlayTime(index, Number(e.target.value))}
                  min="0"
                />
              </td>
              <td>
                <StarRating
                  rating={game.rating}
                  onRatingChange={(newRating) => rateGame(index, newRating)}  // Pass the new rating
                />
              </td>
              <td>
                <button onClick={() => deleteGame(index)}>Delete</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default GameTable;
