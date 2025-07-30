import { useState, useEffect } from 'react';
import { Box, Typography, TextField, useMediaQuery, useTheme } from '@mui/material';

interface ScalingControlProps {
  numberOfPeople: number;
  onNumberOfPeopleChange: (number: number) => void;
}

const ScalingControl = ({ numberOfPeople, onNumberOfPeopleChange }: ScalingControlProps) => {
  const [inputValue, setInputValue] = useState(numberOfPeople.toString());
  const [isEditing, setIsEditing] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    setInputValue(numberOfPeople.toString());
  }, [numberOfPeople]);

  const handleFocus = () => {
    setIsEditing(true);
    setInputValue('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: isMobile ? 2 : 3,
      p: isMobile ? 2 : 3,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      backgroundColor: 'background.paper'
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 1,
        flex: isMobile ? 'none' : 1
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          component="h2"
          sx={{ 
            fontSize: isMobile ? '1.1rem' : '1.5rem',
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          Scaling Control
        </Typography>
        <Typography 
          variant={isMobile ? "body2" : "body1"} 
          color="text.secondary"
          sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
        >
          Adjust the number of people to automatically scale ingredient quantities
        </Typography>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? 1 : 2,
        minWidth: isMobile ? '100%' : 'auto'
      }}>
        <TextField
          label="Number of People"
          type="number"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          inputProps={{ 
            min: 1,
            style: { 
              fontSize: isMobile ? '1rem' : '1.125rem',
              textAlign: 'center'
            }
          }}
          size={isMobile ? "small" : "medium"}
          sx={{
            minWidth: isMobile ? '100%' : '200px',
            '& .MuiInputLabel-root': {
              fontSize: isMobile ? '0.875rem' : '1rem'
            },
            '& .MuiOutlinedInput-root': {
              fontSize: isMobile ? '1rem' : '1.125rem'
            }
          }}
        />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: isMobile ? 'center' : 'flex-start',
          gap: 0.5
        }}>
          <Typography 
            variant={isMobile ? "body2" : "body1"}
            sx={{ 
              fontSize: isMobile ? '0.875rem' : '1rem',
              fontWeight: 'medium'
            }}
          >
            Current Scale: {numberOfPeople}x
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
          >
            All quantities will be multiplied by {numberOfPeople}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ScalingControl; 