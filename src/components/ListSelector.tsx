import { useState } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItemButton, ListItemText, ListItemSecondaryAction,
  IconButton, useMediaQuery, useTheme, Chip
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Mic as MicIcon, GetApp as DownloadIcon } from "@mui/icons-material";
import VoiceInputModal from "./VoiceInputModal";
import type { IngredientListData } from '../types';

interface ListSelectorProps {
  lists: IngredientListData[];
  currentListId: string | null;
  onListSelect: (id: string) => void;
  onCreateList: (name: string) => void;
  onDeleteList: (id: string) => void;
  onClearAllLists: () => void;
  onResetApp: () => void;
  onDownloadPDF: (list: IngredientListData) => void;
}

const ListSelector = ({ 
  lists, 
  currentListId, 
  onListSelect, 
  onCreateList, 
  onDeleteList, 
  onClearAllLists, 
  onResetApp,
  onDownloadPDF
}: ListSelectorProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; listId: string | null }>({ open: false, listId: null });
  const [clearAllDialog, setClearAllDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [openVoiceModal, setOpenVoiceModal] = useState(false);
  const [openVoiceCreateModal, setOpenVoiceCreateModal] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCreateList = () => {
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName('');
      setOpenDialog(false);
    }
  };

  const handleDeleteClick = (listId: string) => {
    setDeleteDialog({ open: true, listId });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.listId) {
      onDeleteList(deleteDialog.listId);
      setDeleteDialog({ open: false, listId: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ open: false, listId: null });
  };

  const handleVoiceInput = (result: { text: string }) => {
    if (result.text && result.text.trim()) {
      onCreateList(result.text.trim());
      setOpenVoiceCreateModal(false);
    }
  };

  const downloadListPDF = (list: IngredientListData) => {
    if (onDownloadPDF) {
      onDownloadPDF(list);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 2,
        alignItems: isMobile ? 'stretch' : 'center',
        mb: 2
      }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            minWidth: isMobile ? '100%' : 'auto',
            fontSize: isMobile ? '0.875rem' : '1rem',
            py: isMobile ? 1.5 : 1
          }}
        >
          Create New List
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<MicIcon />}
          onClick={() => setOpenVoiceCreateModal(true)}
          sx={{
            minWidth: isMobile ? '100%' : 'auto',
            fontSize: isMobile ? '0.875rem' : '1rem',
            py: isMobile ? 1.5 : 1
          }}
        >
          Voice Create
        </Button>

        {lists.length > 0 && (
          <>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => setClearAllDialog(true)}
              sx={{
                minWidth: isMobile ? '100%' : 'auto',
                fontSize: isMobile ? '0.875rem' : '1rem',
                py: isMobile ? 1.5 : 1
              }}
            >
              Clear All
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={() => setResetDialog(true)}
              sx={{
                minWidth: isMobile ? '100%' : 'auto',
                fontSize: isMobile ? '0.875rem' : '1rem',
                py: isMobile ? 1.5 : 1
              }}
            >
              Reset App
            </Button>
          </>
        )}
      </Box>

      {lists.length > 0 ? (
        <Box sx={{ 
          maxHeight: isMobile ? '300px' : '400px', 
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}>
          <List dense={isMobile}>
            {lists.map((list) => (
              <ListItemButton
                key={list.id}
                selected={currentListId === list.id}
                onClick={() => onListSelect(list.id)}
                sx={{
                  border: '1px solid',
                  borderColor: currentListId === list.id ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  mb: 1,
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography 
                      variant={isMobile ? "body2" : "body1"}
                      sx={{ 
                        fontWeight: currentListId === list.id ? 'bold' : 'normal',
                        fontSize: isMobile ? '0.875rem' : '1rem'
                      }}
                    >
                      {list.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 0.5 : 1,
                      alignItems: isMobile ? 'flex-start' : 'center',
                      mt: isMobile ? 0.5 : 0
                    }}>
                      <Chip 
                        label={`${list.ingredients.length} ingredients`} 
                        size={isMobile ? "small" : "medium"}
                        variant="outlined"
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                      />
                      <Chip 
                        label={`${list.numberOfPeople} people`} 
                        size={isMobile ? "small" : "medium"}
                        variant="outlined"
                        color="primary"
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                      />
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                      >
                        {new Date(list.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction sx={{ 
                  display: 'flex', 
                  gap: isMobile ? 0.5 : 1,
                  flexDirection: isMobile ? 'column' : 'row'
                }}>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadListPDF(list);
                    }}
                    size={isMobile ? "small" : "medium"}
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': { backgroundColor: 'primary.light' }
                    }}
                  >
                    <DownloadIcon fontSize={isMobile ? "small" : "medium"} />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(list.id);
                    }}
                    size={isMobile ? "small" : "medium"}
                    sx={{ 
                      color: 'error.main',
                      '&:hover': { backgroundColor: 'error.light' }
                    }}
                  >
                    <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
            ))}
          </List>
        </Box>
      ) : (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2
        }}>
          <Typography 
            variant={isMobile ? "body2" : "body1"} 
            color="text.secondary"
            sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
          >
            No lists created yet. Create your first ingredient list!
          </Typography>
        </Box>
      )}

      {/* Create New List Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth={isMobile ? "xs" : "sm"}
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
          Create New List
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            mt: 1
          }}>
            <TextField
              autoFocus
              label="List Name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
              fullWidth
              size={isMobile ? "small" : "medium"}
            />
            <Button
              variant="outlined"
              startIcon={<MicIcon />}
              onClick={() => {
                setOpenDialog(false);
                setOpenVoiceCreateModal(true);
              }}
              sx={{
                minWidth: isMobile ? '100%' : 'auto',
                fontSize: isMobile ? '0.875rem' : '1rem',
                py: isMobile ? 1.5 : 1
              }}
            >
              Voice
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateList} 
            variant="contained"
            disabled={!newListName.trim()}
            size={isMobile ? "small" : "medium"}
          >
            Create List
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={handleCancelDelete}
        maxWidth={isMobile ? "xs" : "sm"}
        fullWidth
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
          Delete List
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
            Are you sure you want to delete this list? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
          <Button 
            onClick={handleCancelDelete}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            size={isMobile ? "small" : "medium"}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog 
        open={clearAllDialog} 
        onClose={() => setClearAllDialog(false)}
        maxWidth={isMobile ? "xs" : "sm"}
        fullWidth
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
          Clear All Lists
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
            Are you sure you want to delete all lists? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
          <Button 
            onClick={() => setClearAllDialog(false)}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onClearAllLists();
              setClearAllDialog(false);
            }} 
            color="warning" 
            variant="contained"
            size={isMobile ? "small" : "medium"}
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset App Confirmation Dialog */}
      <Dialog 
        open={resetDialog} 
        onClose={() => setResetDialog(false)}
        maxWidth={isMobile ? "xs" : "sm"}
        fullWidth
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
          Reset Application
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
            Are you sure you want to reset the entire application? This will delete all data and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
          <Button 
            onClick={() => setResetDialog(false)}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onResetApp();
              setResetDialog(false);
            }} 
            color="error" 
            variant="contained"
            size={isMobile ? "small" : "medium"}
          >
            Reset App
          </Button>
        </DialogActions>
      </Dialog>

      {/* Voice Input Modal for List Creation */}
      <VoiceInputModal
        open={openVoiceCreateModal}
        onClose={() => setOpenVoiceCreateModal(false)}
        onResult={handleVoiceInput}
        context="list"
      />
    </Box>
  );
};

export default ListSelector; 