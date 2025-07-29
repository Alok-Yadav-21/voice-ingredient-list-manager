import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Chip,
} from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';

interface ScalingControlProps {
  numberOfPeople: number;
  onNumberOfPeopleChange: (number: number) => void;
}

const ScalingControl: React.FC<ScalingControlProps> = ({
  numberOfPeople,
  onNumberOfPeopleChange,
}) => {
  const [inputValue, setInputValue] = useState(numberOfPeople.toString());
  const [isEditing, setIsEditing] = useState(false);

  // Update input value when numberOfPeople prop changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(numberOfPeople.toString());
    }
  }, [numberOfPeople, isEditing]);

  const handleFocus = () => {
    setIsEditing(true);
    setInputValue(''); // Clear the input when user starts typing
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    
    const numValue = parseInt(value);
    if (numValue > 0) {
      onNumberOfPeopleChange(numValue);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue <= 0) {
      setInputValue(numberOfPeople.toString());
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GroupIcon color="primary" />
          <Typography variant="h6">Scaling Control</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <TextField
            label="Number of People"
            type="number"
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            inputProps={{ min: 1 }}
            size="small"
            sx={{ width: 150 }}
          />
          <Chip
            label={`All ingredients will scale for ${numberOfPeople} people`}
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Change this number to automatically scale all ingredient quantities proportionally.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ScalingControl; 