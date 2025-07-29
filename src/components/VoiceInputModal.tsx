import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, FormControl, InputLabel, Select, MenuItem, Chip, Alert, TextField
} from '@mui/material';
import { Mic as MicIcon, MicOff as MicOffIcon, VolumeUp as VolumeUpIcon } from '@mui/icons-material';

interface VoiceInputModalProps {
  open: boolean;
  onClose: () => void;
  onVoiceInput: (text: string, language: string) => void;
  context?: 'list' | 'category' | 'sub-ingredient';
}

const VoiceInputModal = ({ open, onClose, onVoiceInput, context = 'sub-ingredient' }: VoiceInputModalProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const languages = [
    { code: 'en-US', name: 'English' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'gu-IN', name: 'Gujarati' },
  ];

  // Check microphone permissions
  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      console.log('VoiceInputModal: Microphone permission granted');
    } catch (error) {
      console.error('VoiceInputModal: Microphone permission denied:', error);
      setHasPermission(false);
      setError('Microphone access denied. Please allow microphone access in your browser settings.');
    }
  };

  // Check permissions when modal opens
  useEffect(() => {
    if (open) {
      checkMicrophonePermission();
    }
  }, [open]);

  // Function to clean and normalize text, especially for Gujarati
  const cleanText = (text: string, lang: string): string => {
    let cleaned = text.trim();
    
    // For Gujarati, handle common encoding issues
    if (lang === 'gu-IN') {
      // Remove any mathematical symbols or encoding artifacts
      cleaned = cleaned.replace(/[¬Ÿ¾•]/g, '');
      // Normalize Unicode characters
      cleaned = cleaned.normalize('NFC');
      // Remove any remaining non-Gujarati characters that might be encoding artifacts
      cleaned = cleaned.replace(/[^\u0A80-\u0AFF\u0020-\u007F]/g, (match) => {
        // Keep Gujarati characters and basic ASCII
        if (/[\u0A80-\u0AFF]/.test(match)) return match;
        if (/[\u0020-\u007F]/.test(match)) return match;
        return '';
      });
    }
    
    return cleaned;
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    // Configure recognition settings
    recognitionInstance.continuous = false; // Changed to false to avoid continuous listening issues
    recognitionInstance.interimResults = true;
    recognitionInstance.maxAlternatives = 1;
    recognitionInstance.lang = language;
    
    // Set timeout to prevent hanging
    recognitionInstance.timeout = 10000; // 10 seconds timeout
    
    recognitionInstance.onstart = () => { 
      console.log('VoiceInputModal: Speech recognition started');
      setIsListening(true); 
      setError(null); 
    };
    
    recognitionInstance.onresult = (event: any) => {
      console.log('VoiceInputModal: Speech recognition result received');
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        const cleanedText = cleanText(finalTranscript, language);
        setTranscript(cleanedText);
        console.log('VoiceInputModal: Final transcript received:', cleanedText);
      } else if (interimTranscript) {
        const cleanedText = cleanText(interimTranscript, language);
        setTranscript(cleanedText);
        console.log('VoiceInputModal: Interim transcript received:', cleanedText);
      }
    };
    
    recognitionInstance.onerror = (event: any) => {
      console.error('VoiceInputModal: Speech recognition error:', event.error);
      
      let errorMessage = '';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please speak clearly and try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not found or access denied. Please check your microphone permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed. Please try again.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
      }
      
      setError(errorMessage);
      setIsListening(false);
    };
    
    recognitionInstance.onend = () => { 
      console.log('VoiceInputModal: Speech recognition ended');
      setIsListening(false); 
    };
    
    setRecognition(recognitionInstance);
    
    return () => { 
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [language]);

  const startListening = () => { 
    if (!hasPermission) {
      setError('Microphone permission required. Please allow microphone access and try again.');
      checkMicrophonePermission();
      return;
    }
    
    if (recognition) { 
      setTranscript('');
      setError(null);
      try {
        recognition.start();
        console.log('VoiceInputModal: Starting speech recognition');
      } catch (error) {
        console.error('VoiceInputModal: Error starting recognition:', error);
        setError('Failed to start speech recognition. Please try again.');
      }
    } else {
      setError('Speech recognition not initialized. Please refresh the page and try again.');
    }
  };
  
  const stopListening = () => { 
    if (recognition) {
      try {
        recognition.stop();
        console.log('VoiceInputModal: Stopping speech recognition');
      } catch (error) {
        console.error('VoiceInputModal: Error stopping recognition:', error);
      }
    }
  };
  const handleSubmit = () => { 
    console.log('VoiceInputModal: Submit clicked, transcript:', transcript);
    if (transcript.trim()) { 
      const cleanedText = cleanText(transcript.trim(), language);
      console.log('VoiceInputModal: Cleaned text:', cleanedText, 'Language:', language);
      
      // Call onVoiceInput and then close modal
      onVoiceInput(cleanedText, language); 
      setTranscript(''); 
      onClose(); // Close the modal after submitting
      console.log('VoiceInputModal: onVoiceInput called, transcript cleared, modal closed');
    } else {
      console.log('VoiceInputModal: Empty transcript, not submitting');
      alert('Please speak something first before creating the list.');
    }
  };
  const handleLanguageChange = (newLanguage: string) => { 
    setLanguage(newLanguage); 
    if (recognition) recognition.lang = newLanguage; 
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Voice Input</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {context === 'list' && 'Speak the name of your new list. For example: "Birthday Party for 50 people"'}
            {context === 'category' && 'Speak the name of your category. For example: "Vegetables" or "Spices"'}
            {context === 'sub-ingredient' && 'Speak your ingredient details. For example: "2 kilograms of rice" or "5 pieces of tomatoes"'}
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Language</InputLabel>
            <Select value={language} label="Language" onChange={(e) => handleLanguageChange(e.target.value)}>
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
              <Box sx={{ mt: 1 }}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => {
                    setError(null);
                    startListening();
                  }}
                >
                  Try Again
                </Button>
              </Box>
            </Alert>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant={isListening ? 'contained' : 'outlined'}
              color={isListening ? 'secondary' : 'primary'}
              startIcon={isListening ? <MicOffIcon /> : <MicIcon />}
              onClick={isListening ? stopListening : startListening}
              size="large"
              disabled={!!error}
            >
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </Button>
          </Box>
          {isListening && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Chip icon={<VolumeUpIcon />} label="Listening..." color="primary" variant="outlined" />
            </Box>
          )}
          {!isListening && !transcript && !error && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Tips for better voice recognition:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                • Speak clearly and at a normal pace<br/>
                • Ensure your microphone is working<br/>
                • Try to minimize background noise<br/>
                • Wait for the "Listening..." indicator before speaking
              </Typography>
            </Alert>
          )}
          {transcript && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Recognized Text:</Typography>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, backgroundColor: 'grey.50', minHeight: 60 }}>
                <Typography>{transcript}</Typography>
              </Box>
            </Box>
          )}
          
          {/* Manual text input fallback */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Or type manually:</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type here if voice recognition doesn't work..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              multiline
              rows={2}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!transcript.trim()}>
          {context === 'list' ? 'Create List' : context === 'category' ? 'Add Category' : 'Add to List'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VoiceInputModal; 