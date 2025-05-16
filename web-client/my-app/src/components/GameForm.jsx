import React, { useState } from 'react';
import StarRating from './StarRating';

const GameForm = ({ addGame }) => {
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newGame = { name, platform, status, rating, playTime: 0 };
    addGame(newGame);  // Add the new game to the state
    setName('');
    setPlatform('');
    setStatus('');
    setRating(0);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Game Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label>Platform</label>
        <input
          type="text"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        />
      </div>
      <div>
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Select status</option>
          <option value="Unplayed">Unplayed</option>
          <option value="Playing">Playing</option>
          <option value="Completed">Completed</option>
          <option value="Abandoned">Abandoned</option>
        </select>
      </div>
      <div>
        <label>Rating</label>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>
      <button type="submit">Add Game</button>
    </form>
  );
};

export default GameForm;
