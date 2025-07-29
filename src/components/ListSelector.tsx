import { useState } from 'react';
import {
  Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Box, Chip, ListItemButton,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon, GetApp as DownloadIcon, Mic as MicIcon } from '@mui/icons-material';
import type { IngredientListData } from '../types';
import VoiceInputModal from './VoiceInputModal';


interface ListSelectorProps {
  lists: IngredientListData[];
  currentListId: string | null;
  onListSelect: (listId: string) => void;
  onCreateList: (name: string) => void;
  onDeleteList: (listId: string) => void;
  onClearAllLists: () => void;
  onResetApp: () => void;
  onDownloadPDF?: (list: IngredientListData) => void;
}

const ListSelector = ({
  lists, currentListId, onListSelect, onCreateList, onDeleteList, onClearAllLists, onResetApp, onDownloadPDF,
}: ListSelectorProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [openVoiceModal, setOpenVoiceModal] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; listId: string | null; listName: string }>({
    open: false,
    listId: null,
    listName: ''
  });

  const [clearAllDialog, setClearAllDialog] = useState(false);
  const [resetAppDialog, setResetAppDialog] = useState(false);

  const handleCreateList = () => {
    console.log('=== LIST SELECTOR CREATE DEBUG ===');
    console.log('New list name:', newListName);
    console.log('New list name trimmed:', newListName.trim());
    console.log('Is name valid:', newListName.trim() !== '');
    
    if (newListName.trim()) {
      console.log('=== CREATE LIST DEBUG ===');
      console.log('Creating list with name:', newListName.trim());
      
      try {
        console.log('About to call onCreateList with:', newListName.trim());
        onCreateList(newListName.trim());
        console.log('onCreateList called successfully');
        setNewListName('');
        setOpenDialog(false);
        console.log('Dialog closed and name cleared');
      } catch (error) {
        console.error('Error creating list:', error);
        alert('Error creating list. Please try again.');
      }
    } else {
      console.log('Empty name, showing alert');
      alert('Please enter a valid list name.');
    }
  };

  const handleVoiceInput = (text: string, _language: string) => {
    console.log('=== VOICE INPUT DEBUG ===');
    console.log('Voice input received:', text, 'Language:', _language);
    console.log('Text length:', text.length);
    console.log('Text trimmed:', text.trim());
    console.log('Text trimmed length:', text.trim().length);
    
    if (text.trim()) {
      console.log('Creating new list with name:', text.trim());
      try {
        console.log('About to call onCreateList with:', text.trim());
        onCreateList(text.trim());
        console.log('onCreateList called successfully');
        alert('List created successfully: ' + text.trim());
      } catch (error) {
        console.error('Error calling onCreateList:', error);
        alert('Error creating list: ' + (error as Error).message);
      }
      setOpenVoiceModal(false);
      console.log('Voice modal closed, list creation initiated');
    } else {
      console.log('Empty text received, not creating list');
      alert('Please speak a list name first.');
    }
  };

  const handleDeleteClick = (listId: string, listName: string) => {
    setDeleteDialog({ open: true, listId, listName });
  };

  const handleConfirmDelete = () => {
    console.log('=== LIST SELECTOR DELETE DEBUG ===');
    console.log('Delete dialog state:', deleteDialog);
    console.log('List ID to delete:', deleteDialog.listId);
    console.log('List name to delete:', deleteDialog.listName);
    
    if (deleteDialog.listId) {
      console.log('=== CONFIRM DELETE DEBUG ===');
      console.log('Deleting list:', deleteDialog.listName, 'with ID:', deleteDialog.listId);
      
      try {
        console.log('About to call onDeleteList with:', deleteDialog.listId);
        onDeleteList(deleteDialog.listId);
        console.log('onDeleteList called successfully');
        setDeleteDialog({ open: false, listId: null, listName: '' });
        console.log('Delete dialog closed');
      } catch (error) {
        console.error('Error deleting list:', error);
        alert('Error deleting list. Please try again.');
      }
    } else {
      console.log('No list ID to delete');
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ open: false, listId: null, listName: '' });
  };

  const handleClearAllLists = () => {
    console.log('=== CLEAR ALL LISTS DEBUG ===');
    console.log('Clearing all lists. Total lists to delete:', lists.length);
    
    try {
      onClearAllLists();
      console.log('Clear all lists operation completed successfully');
      alert('All lists cleared successfully!');
    } catch (error) {
      console.error('Error clearing all lists:', error);
      alert('Error clearing lists. Please try again.');
    }
    
    setClearAllDialog(false);
  };

  const handleResetApp = () => {
    console.log('=== RESET APP DEBUG ===');
    console.log('Resetting entire app');
    
    try {
      onResetApp();
      console.log('App reset completed successfully');
      alert('App reset successfully! All data has been cleared.');
    } catch (error) {
      console.error('Error resetting app:', error);
      alert('Error resetting app. Please try again.');
    }
    
    setResetAppDialog(false);
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Ingredient Lists</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<MicIcon />} 
              onClick={() => setOpenVoiceModal(true)} 
              size="small"
            >
              Voice Create
            </Button>
            <Button variant="contained" onClick={() => setOpenDialog(true)} size="small">
              Create New List
            </Button>
            {lists.length > 0 && (
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => setClearAllDialog(true)} 
                size="small"
              >
                Clear All
              </Button>
            )}
            <Button 
              variant="outlined" 
              color="warning"
              onClick={() => setResetAppDialog(true)} 
              size="small"
            >
              Reset App
            </Button>
          </Box>
        </Box>
        {lists.length === 0 ? (
          <Box color="text.secondary" textAlign="center">
            No lists yet. Create your first ingredient list!
          </Box>
        ) : (
          <List>
            {lists.map((list) => (
              <ListItem key={list.id} disablePadding>
                <ListItemButton
                  selected={currentListId === list.id}
                  onClick={() => onListSelect(list.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemText
                    primary={list.name}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="body2" color="textSecondary" component="span">
                          {formatDate(list.createdAt)}
                        </Typography>
                        <Chip label={`${list.ingredients.length} ingredients`} size="small" variant="outlined" />
                        <Chip label={`${list.numberOfPeople} people`} size="small" variant="outlined" color="primary" />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    {onDownloadPDF && (
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadPDF(list);
                        }}
                        size="small"
                        title="Download PDF"
                      >
                        <DownloadIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(list.id, list.name);
                      }}
                      size="small"
                      title="Delete List"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Create New Ingredient List</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                autoFocus
                margin="dense"
                label="List Name"
                fullWidth
                variant="outlined"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
              />
              <Button 
                variant="outlined" 
                startIcon={<MicIcon />} 
                onClick={() => {
                  setOpenDialog(false);
                  setOpenVoiceModal(true);
                }}
                sx={{ minWidth: 'auto', px: 2 }}
                title="Use Voice Input"
              >
                Voice
              </Button>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Create a new ingredient list. You can type the name or use voice input in Gujarati, Hindi, or English.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateList} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Voice Input Modal for creating new lists */}
        <VoiceInputModal 
          open={openVoiceModal} 
          onClose={() => setOpenVoiceModal(false)} 
          onVoiceInput={handleVoiceInput}
          context="list"
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={handleCancelDelete}>
          <DialogTitle>Delete List</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone.
            </Alert>
            <Typography>
              Are you sure you want to delete the list "{deleteDialog.listName}"?
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              This will permanently remove the list and all its ingredients.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Clear All Lists Confirmation Dialog */}
        <Dialog open={clearAllDialog} onClose={() => setClearAllDialog(false)}>
          <DialogTitle>Clear All Lists</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              This action cannot be undone.
            </Alert>
            <Typography>
              Are you sure you want to delete ALL lists?
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              This will permanently remove all lists and their ingredients. This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearAllDialog(false)}>Cancel</Button>
            <Button onClick={handleClearAllLists} color="error" variant="contained">
              Clear All Lists
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset App Confirmation Dialog */}
        <Dialog open={resetAppDialog} onClose={() => setResetAppDialog(false)}>
          <DialogTitle>Reset App</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              This action cannot be undone.
            </Alert>
            <Typography>
              Are you sure you want to reset the entire app?
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              This will permanently remove ALL data including lists, ingredients, and app settings. This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetAppDialog(false)}>Cancel</Button>
            <Button onClick={handleResetApp} color="warning" variant="contained">
              Reset App
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ListSelector; 