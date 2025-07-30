import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box,
  useMediaQuery, useTheme, Alert, TextField
} from '@mui/material';
import { Mic as MicIcon, MicOff as MicOffIcon } from '@mui/icons-material';

interface VoiceInputModalProps {
  open: boolean;
  onClose: () => void;
  onResult: (result: { text: string; language: string }) => void;
  context: 'list' | 'category' | 'sub-ingredient';
}

const VoiceInputModal = ({ open, onClose, onResult, context }: VoiceInputModalProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US'; // Default language
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript('');
      };
      
      recognitionInstance.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        const cleanedText = cleanText(result);
        setTranscript(cleanedText);
      };
      
      recognitionInstance.onerror = (event: any) => {
        setIsListening(false);
        let errorMessage = 'Speech recognition error occurred.';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech was detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone was found. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access was denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your connection.';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }
        
        setError(errorMessage);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      setError('Speech recognition is not supported in this browser.');
    }
  }, []);

  const cleanText = (text: string): string => {
    // Remove common artifacts and normalize Unicode
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const startListening = (language: string) => {
    if (recognition) {
      recognition.lang = language;
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const handleSubmit = () => {
    const finalText = transcript || manualText;
    if (finalText.trim()) {
      onResult({ text: finalText.trim(), language: 'en-US' });
      setTranscript('');
      setManualText('');
      onClose();
    }
  };

  const getContextInstructions = () => {
    switch (context) {
      case 'list':
        return {
          title: 'Create List by Voice',
          instruction: 'Speak the name of your ingredient list (e.g., "Birthday Party", "Wedding Menu")',
          placeholder: 'Enter list name manually...',
          buttonText: 'CREATE LIST'
        };
      case 'category':
        return {
          title: 'Add Category by Voice',
          instruction: 'Speak the category name (e.g., "Vegetables", "Spices", "Dairy")',
          placeholder: 'Enter category name manually...',
          buttonText: 'ADD CATEGORY'
        };
      case 'sub-ingredient':
        return {
          title: 'Add Sub-ingredient by Voice',
          instruction: 'Speak the ingredient details (e.g., "2 kg potatoes", "500 grams tomatoes")',
          placeholder: 'Enter ingredient details manually...',
          buttonText: 'ADD INGREDIENT'
        };
      default:
        return {
          title: 'Voice Input',
          instruction: 'Speak clearly into your microphone',
          placeholder: 'Enter text manually...',
          buttonText: 'SUBMIT'
        };
    }
  };

  const contextInfo = getContextInstructions();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={isMobile ? "xs" : "sm"}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 2 : 3,
          minHeight: isMobile ? 'auto' : '400px'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontSize: isMobile ? '1.1rem' : '1.25rem',
        textAlign: 'center',
        pb: 1
      }}>
        {contextInfo.title}
      </DialogTitle>
      
      <DialogContent sx={{ 
        px: isMobile ? 2 : 3,
        py: isMobile ? 1 : 2
      }}>
        <Typography 
          variant={isMobile ? "body2" : "body1"} 
          color="text.secondary"
          sx={{ 
            mb: 2,
            fontSize: isMobile ? '0.875rem' : '1rem',
            textAlign: 'center'
          }}
        >
          {contextInfo.instruction}
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2,
          mb: 2
        }}>
          {/* Language Selection Buttons */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 2,
            justifyContent: 'center'
          }}>
            <Button
              variant={isListening ? "contained" : "outlined"}
              startIcon={isListening ? <MicOffIcon /> : <MicIcon />}
              onClick={() => isListening ? stopListening() : startListening('en-US')}
              disabled={!recognition}
              sx={{
                minWidth: isMobile ? '100%' : '120px',
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                py: isMobile ? 1 : 1.5
              }}
            >
              English
            </Button>
            
            <Button
              variant={isListening ? "contained" : "outlined"}
              startIcon={isListening ? <MicOffIcon /> : <MicIcon />}
              onClick={() => isListening ? stopListening() : startListening('hi-IN')}
              disabled={!recognition}
              sx={{
                minWidth: isMobile ? '100%' : '120px',
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                py: isMobile ? 1 : 1.5
              }}
            >
              हिंदी
            </Button>
            
            <Button
              variant={isListening ? "contained" : "outlined"}
              startIcon={isListening ? <MicOffIcon /> : <MicIcon />}
              onClick={() => isListening ? stopListening() : startListening('gu-IN')}
              disabled={!recognition}
              sx={{
                minWidth: isMobile ? '100%' : '120px',
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                py: isMobile ? 1 : 1.5
              }}
            >
              ગુજરાતી
            </Button>
          </Box>

          {/* Transcript Display */}
          {transcript && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'success.light', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'success.main'
            }}>
              <Typography 
                variant={isMobile ? "body2" : "body1"}
                sx={{ 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  color: 'success.dark',
                  fontWeight: 'medium'
                }}
              >
                "{transcript}"
              </Typography>
            </Box>
          )}

          {/* Manual Input Fallback */}
          <TextField
            label="Or type manually"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={contextInfo.placeholder}
            multiline
            rows={isMobile ? 2 : 3}
            fullWidth
            size={isMobile ? "small" : "medium"}
            sx={{
              '& .MuiInputLabel-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              },
              '& .MuiOutlinedInput-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              }
            }}
          />
        </Box>

        {/* Instructions */}
        <Box sx={{ 
          backgroundColor: 'info.light', 
          p: 2, 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'info.main'
        }}>
          <Typography 
            variant={isMobile ? "caption" : "body2"}
            sx={{ 
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              color: 'info.dark'
            }}
          >
            <strong>Tips:</strong> Speak clearly and slowly. Make sure your microphone is working. 
            If voice doesn't work, you can type manually above.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        px: isMobile ? 2 : 3, 
        pb: isMobile ? 2 : 3,
        gap: 1
      }}>
        <Button 
          onClick={onClose}
          size={isMobile ? "small" : "medium"}
          sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
        >
          Cancel
        </Button>
        
        {error && (
          <Button 
            onClick={() => setError(null)}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
          >
            Try Again
          </Button>
        )}
        
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!transcript.trim() && !manualText.trim()}
          size={isMobile ? "small" : "medium"}
          sx={{ 
            fontSize: isMobile ? '0.875rem' : '1rem',
            minWidth: isMobile ? 'auto' : '120px'
          }}
        >
          {contextInfo.buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VoiceInputModal; 