import React from 'react';
import { Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

interface StarRatingProps {
  value: number;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  onChange?: (value: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  readOnly = true,
  size = 'medium',
  showValue = false,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-1">
      <Rating
        value={value}
        readOnly={readOnly}
        precision={0.1}
        size={size}
        icon={<StarIcon fontSize="inherit" />}
        emptyIcon={<StarIcon fontSize="inherit" />}
        onChange={(_, newValue) => {
          if (onChange && newValue !== null) {
            onChange(newValue);
          }
        }}
      />
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};
