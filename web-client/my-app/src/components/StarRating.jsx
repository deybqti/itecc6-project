import React, { useState } from 'react';

function StarRating({ rating, onRatingChange }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div>
      {Array(5).fill(0).map((_, index) => {
        const starValue = index + 1;
        const displayRating = hoverRating || rating;
        return (
          <span
            key={index}
            style={{ 
              cursor: 'pointer', 
              color: starValue <= displayRating ? '#FFD700' : '#ccc', 
              fontSize: '24px',
              transition: 'color 0.2s ease-in-out'
            }}
            onClick={() => onRatingChange(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;
