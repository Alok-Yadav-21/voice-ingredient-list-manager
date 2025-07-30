import { useState, useEffect } from 'react';
import {
  Container, Box, Typography, CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar,
  Snackbar, Alert, useMediaQuery
} from '@mui/material';
import ListSelector from './components/ListSelector';
import IngredientList from './components/IngredientList';
import ScalingControl from './components/ScalingControl';
import type { IngredientListData } from './types';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

function App() {
  const [lists, setLists] = useState<IngredientListData[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load lists from localStorage on app start
  useEffect(() => {
    const savedLists = localStorage.getItem('ingredientLists');
    if (savedLists) {
      try {
        const parsedLists = JSON.parse(savedLists);
        setLists(parsedLists);
        if (parsedLists.length > 0 && !currentListId) {
          setCurrentListId(parsedLists[0].id);
          setNumberOfPeople(parsedLists[0].numberOfPeople || 1);
        }
      } catch (error) {
        console.error('Error loading saved lists:', error);
        localStorage.removeItem('ingredientLists');
      }
    }
  }, []); // Remove currentListId dependency to prevent infinite re-renders

  // Handle currentListId initialization when lists change
  useEffect(() => {
    if (lists.length > 0 && !currentListId) {
      setCurrentListId(lists[0].id);
      setNumberOfPeople(lists[0].numberOfPeople || 1);
    }
  }, [lists, currentListId]);

  // Save lists to localStorage whenever they change
  useEffect(() => {
    if (lists.length > 0) {
      localStorage.setItem('ingredientLists', JSON.stringify(lists));
      console.log('Lists saved to localStorage:', lists.length);
    }
  }, [lists]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const currentList = lists.find(list => list.id === currentListId);

  const createNewList = (name: string) => {
    console.log('=== APP CREATE NEW LIST DEBUG ===');
    console.log('App: Creating new list with name:', name);
    
    if (!name || name.trim() === '') {
      console.error('App: Empty name provided for list creation');
      showSnackbar('Please provide a valid list name.', 'error');
      return;
    }
    
    const newList: IngredientListData = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      ingredients: [],
      numberOfPeople: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('App: New list object:', newList);
    
    setLists(prevLists => {
      console.log('App: Previous lists count:', prevLists.length);
      const updatedLists = [...prevLists, newList];
      console.log('App: Updated lists array:', updatedLists);
      console.log('App: Total lists after creation:', updatedLists.length);
      return updatedLists;
    });
    
    setCurrentListId(newList.id);
    setNumberOfPeople(1);
    console.log('App: List created successfully with ID:', newList.id);
    showSnackbar(`List "${name.trim()}" created successfully!`, 'success');
  };

  const updateList = (updatedList: IngredientListData) => {
    console.log('=== APP UPDATE LIST DEBUG ===');
    console.log('App: Updating list:', updatedList.name);
    
    setLists(prevLists => {
      const updatedLists = prevLists.map(list => list.id === updatedList.id ? updatedList : list);
      console.log('App: Lists updated successfully');
      return updatedLists;
    });
  };

  const deleteList = (listId: string) => {
    console.log('=== APP DELETE LIST DEBUG ===');
    console.log('App: Deleting list with ID:', listId);
    console.log('App: Current lists before deletion:', lists);
    
    setLists(prevLists => {
      const updatedLists = prevLists.filter(list => list.id !== listId);
      console.log('App: Lists after deletion:', updatedLists);
      
      if (currentListId === listId) {
        if (updatedLists.length > 0) {
          setCurrentListId(updatedLists[0].id);
          setNumberOfPeople(updatedLists[0].numberOfPeople || 1);
        } else {
          setCurrentListId(null);
          setNumberOfPeople(1);
        }
      }
      
      return updatedLists;
    });
    
    console.log('App: Delete operation completed');
    showSnackbar('List deleted successfully!', 'success');
  };

  const clearAllLists = () => {
    setLists([]);
    setCurrentListId(null);
    setNumberOfPeople(1);
    localStorage.removeItem('ingredientLists');
    showSnackbar('All lists cleared successfully!', 'success');
  };

  const resetApp = () => {
    setLists([]);
    setCurrentListId(null);
    setNumberOfPeople(1);
    localStorage.clear();
    showSnackbar('App reset successfully! All data has been cleared.', 'success');
  };

  const handleNumberOfPeopleChange = (newNumber: number) => {
    setNumberOfPeople(newNumber);
    if (currentList) {
      updateList({ ...currentList, numberOfPeople: newNumber });
    }
  };

  const handleDownloadPDF = (list: IngredientListData) => {
    // Set the current list to the one being downloaded
    setCurrentListId(list.id);
    setNumberOfPeople(list.numberOfPeople || 1);
    
    // Trigger PDF export after a short delay to ensure state is updated
    setTimeout(() => {
      const event = new CustomEvent('exportPDF', { detail: { listId: list.id } });
      window.dispatchEvent(event);
    }, 100);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: isMobile ? '1rem' : '1.5rem',
              textAlign: isMobile ? 'center' : 'left'
            }}
          >
            Voice Ingredient List Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Container 
        maxWidth={isMobile ? false : "lg"} 
        sx={{ 
          mt: isMobile ? 2 : 4, 
          mb: isMobile ? 2 : 4,
          px: isMobile ? 2 : 3
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: isMobile ? 2 : 3 
        }}>
          <ListSelector
            lists={lists}
            currentListId={currentListId}
            onListSelect={setCurrentListId}
            onCreateList={createNewList}
            onDeleteList={deleteList}
            onClearAllLists={clearAllLists}
            onResetApp={resetApp}
            onDownloadPDF={handleDownloadPDF}
          />
          {currentList && (
            <>
              <ScalingControl
                numberOfPeople={numberOfPeople}
                onNumberOfPeopleChange={handleNumberOfPeopleChange}
              />
              <IngredientList
                list={currentList}
                numberOfPeople={numberOfPeople}
                onUpdateList={updateList}
              />
            </>
          )}
        </Box>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ 
          vertical: isMobile ? 'top' : 'bottom', 
          horizontal: isMobile ? 'center' : 'left' 
        }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            fontSize: isMobile ? '0.875rem' : '1rem'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;