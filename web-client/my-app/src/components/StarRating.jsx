import React from 'react';

function StarRating({ rating, onRatingChange }) {
  return (
    <div>
      {Array(5).fill(0).map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            style={{ 
              cursor: 'pointer', 
              color: starValue <= rating ? '#FFD700' : '#ccc', 
              fontSize: '24px',
              transition: 'color 0.2s ease-in-out'
            }}
            onClick={() => onRatingChange(starValue)}
            onMouseEnter={() => onRatingChange(starValue)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;
