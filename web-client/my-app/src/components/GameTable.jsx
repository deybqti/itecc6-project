import React from 'react';
import StarRating from './StarRating';  

const GameTable = ({ games, updateGameStatus, logPlayTime, rateGame, deleteGame }) => {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

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
            <tr key={game.id || index}>
              <td>{game.title}</td>
              <td>{game.platform}</td>
              <td>
                <select
                  value={game.play_status || ''}
                  onChange={(e) => updateGameStatus(index, e.target.value)}
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
                <StarRating
                  rating={game.rating || 0}
                  onRatingChange={(newRating) => rateGame(index, newRating)}
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
