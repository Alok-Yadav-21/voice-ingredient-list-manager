
import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, useTheme,
  Collapse, Chip, Divider
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Add as AddIcon, 
  Mic as MicIcon, 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  GetApp as DownloadIcon
} from "@mui/icons-material";
import VoiceInputModal from "./VoiceInputModal";
import type { IngredientListData, Ingredient } from '../types';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const IngredientList = ({ list, numberOfPeople, onUpdateList }) => {
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: '', unit: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [openVoiceModal, setOpenVoiceModal] = useState(false);
  const [openSubIngredientVoiceModal, setOpenSubIngredientVoiceModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [openSubIngredientDialog, setOpenSubIngredientDialog] = useState(false);
  const [selectedParentIngredient, setSelectedParentIngredient] = useState<Ingredient | null>(null);
  const [newSubIngredient, setNewSubIngredient] = useState({ name: '', quantity: '', unit: '' });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Listen for PDF export events from ListSelector
  useEffect(() => {
    const handleExportEvent = (event: CustomEvent) => {
      if (event.detail.listId === list.id) {
        exportPDF();
      }
    };

    window.addEventListener('exportPDF', handleExportEvent as EventListener);
    
    return () => {
      window.removeEventListener('exportPDF', handleExportEvent as EventListener);
    };
  }, [list.id]);

  // Get main ingredients (categories) only
  const mainIngredients = list.ingredients.filter(ingredient => !ingredient.isSubIngredient);

  // Get sub-ingredients for a specific parent
  const getSubIngredients = (parentId: string) => {
    return list.ingredients.filter(ingredient => ingredient.parentId === parentId);
  };

  const addIngredient = () => {
    if (newIngredient.name.trim()) {
      // Check for duplicate names
      const existingIngredient = list.ingredients.find(ing => 
        ing.name.toLowerCase() === newIngredient.name.trim().toLowerCase() && !ing.isSubIngredient
      );
      
      if (existingIngredient) {
        alert('A category with this name already exists. Please use a different name.');
        return;
      }

      const ingredient: Ingredient = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newIngredient.name.trim(),
        quantity: 0,
        unit: '',
        baseQuantity: 0,
        baseUnit: '',
        subIngredients: []
      };
      
      const updatedList = {
        ...list,
        ingredients: [...list.ingredients, ingredient],
        updatedAt: new Date().toISOString()
      };
      onUpdateList(updatedList);
      setNewIngredient({ name: '', quantity: '', unit: '' });
    }
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    const updatedList = {
      ...list,
      ingredients: list.ingredients.map(ingredient =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      ),
      updatedAt: new Date().toISOString()
    };
    onUpdateList(updatedList);
  };

  const deleteIngredient = (id: string) => {
    // Delete the main ingredient and all its sub-ingredients
    const updatedList = {
      ...list,
      ingredients: list.ingredients.filter(ingredient => 
        ingredient.id !== id && ingredient.parentId !== id
      ),
      updatedAt: new Date().toISOString()
    };
    onUpdateList(updatedList);
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const addSubIngredient = () => {
    if (selectedParentIngredient && newSubIngredient.name.trim()) {
      const subIngredient: Ingredient = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newSubIngredient.name.trim(),
        quantity: parseFloat(newSubIngredient.quantity) || 0,
        unit: newSubIngredient.unit.trim(),
        baseQuantity: parseFloat(newSubIngredient.quantity) || 0,
        baseUnit: newSubIngredient.unit.trim(),
        parentId: selectedParentIngredient.id,
        isSubIngredient: true
      };

      const updatedList = {
        ...list,
        ingredients: [...list.ingredients, subIngredient],
        updatedAt: new Date().toISOString()
      };
      onUpdateList(updatedList);
      setNewSubIngredient({ name: '', quantity: '', unit: '' });
      setOpenSubIngredientDialog(false);
      setSelectedParentIngredient(null);
    }
  };

  const deleteSubIngredient = (subIngredientId: string) => {
    const updatedList = {
      ...list,
      ingredients: list.ingredients.filter(ingredient => ingredient.id !== subIngredientId),
      updatedAt: new Date().toISOString()
    };
    onUpdateList(updatedList);
  };

  const handleVoiceInput = (result) => {
    if (result.text && result.text.trim()) {
      // Check for duplicate names
      const existingIngredient = list.ingredients.find(ing => 
        ing.name.toLowerCase() === result.text.trim().toLowerCase() && !ing.isSubIngredient
      );
      
      if (existingIngredient) {
        alert('A category with this name already exists. Please use a different name.');
        setOpenVoiceModal(false);
        return;
      }

      const ingredient: Ingredient = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: result.text.trim(),
        quantity: 0,
        unit: '',
        baseQuantity: 0,
        baseUnit: '',
        subIngredients: []
      };
      
      const updatedList = {
        ...list,
        ingredients: [...list.ingredients, ingredient],
        updatedAt: new Date().toISOString()
      };
      onUpdateList(updatedList);
      setOpenVoiceModal(false);
    }
  };

  const handleSubIngredientVoiceInput = (result) => {
    if (result.text && result.text.trim()) {
      // Parse voice input for sub-ingredient (e.g., "2 kg potatoes", "500 grams tomatoes")
      const text = result.text.trim().toLowerCase();
      
      // Try to extract quantity and unit from the beginning
      const quantityMatch = text.match(/^(\d+(?:\.\d+)?)\s*(kg|g|grams?|kilos?|liters?|l|ml|pieces?|pcs?|tablespoons?|tbsp|teaspoons?|tsp|cups?|bunches?|heads?|cloves?)/i);
      
      if (quantityMatch) {
        const quantity = quantityMatch[1];
        const unit = quantityMatch[2];
        const name = text.replace(quantityMatch[0], '').trim();
        
        if (name) {
          setNewSubIngredient({
            name: name,
            quantity: quantity,
            unit: unit
          });
        } else {
          // If no name found, use the whole text as name
          setNewSubIngredient({
            name: result.text.trim(),
            quantity: '1',
            unit: 'piece'
          });
        }
      } else {
        // If no quantity/unit pattern found, use the whole text as name
        setNewSubIngredient({
          name: result.text.trim(),
          quantity: '1',
          unit: 'piece'
        });
      }
      
      setOpenSubIngredientVoiceModal(false);
    }
  };

  const exportPDF = async () => {
    // Create a temporary div for clean PDF content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '800px';
    tempDiv.style.padding = '20px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.color = 'black';
    tempDiv.style.fontSize = '19px';
    tempDiv.style.lineHeight = '1.6';
    
    // Create clean HTML content for PDF
    let pdfContent = `
      <div style="margin-bottom: 30px;">
        <h1 style="color: #1976d2; margin: 0 0 10px 0; font-size: 28px; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">
          ${list.name}
        </h1>
        <p style="margin: 0; color: #666; font-size: 16px;">
          Generated on: ${new Date().toLocaleDateString()}
        </p>
      </div>
    `;

    if (mainIngredients.length > 0) {
      pdfContent += '<div style="margin-top: 20px;">';
      
      mainIngredients.forEach((ingredient, ingredientIndex, ingredientArray) => {
        const subIngredients = getSubIngredients(ingredient.id);
        
        if (subIngredients.length > 0) {
          const isLastCategory = ingredientIndex === ingredientArray.length - 1;
          // Add category heading
          pdfContent += `
            <div style="margin-bottom: ${isLastCategory ? '0px' : '20px'}; page-break-inside: avoid; break-inside: avoid; page-break-before: auto;">
              <h2 style="color: #1976d2; margin: 0 0 15px 0; font-size: 22px; border-bottom: 1px solid #ddd; padding-bottom: 5px; page-break-after: avoid;">
                ${ingredient.name}
              </h2>
              <div style="margin-left: 20px; page-break-inside: avoid;">
          `;
          
          // Add sub-ingredients
          subIngredients.forEach((subIngredient, index, array) => {
            const scaledQuantity = subIngredient.baseQuantity * numberOfPeople;
            const isLastItem = index === array.length - 1;
            pdfContent += `
              <div style="margin-bottom: ${isLastItem ? '0px' : '15px'}; padding: 12px; background-color: #f9f9f9; border-radius: 4px; page-break-inside: avoid; break-inside: avoid; page-break-before: auto; orphans: 2; widows: 2; min-height: 60px;">
                <div style="font-weight: bold; font-size: 18px; color: #333; margin-bottom: 6px; page-break-after: avoid;">
                  • ${subIngredient.name}
                </div>
                <div style="color: #666; font-size: 16px; page-break-before: avoid;">
                  ${scaledQuantity} ${subIngredient.baseUnit}
                </div>
              </div>
            `;
          });
          
          pdfContent += '</div></div>';
        }
      });
      
      pdfContent += '</div>';
    } else {
      pdfContent += `
        <div style="text-align: center; padding: 40px; color: #666; font-size: 18px; font-style: italic;">
          No ingredients in this list.
        </div>
      `;
    }

    tempDiv.innerHTML = pdfContent;
    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempDiv.scrollHeight
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${list.name}-ingredients.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Clean up temp div if error occurs
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
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
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          component="h2"
          sx={{ 
            fontSize: isMobile ? '1.1rem' : '1.5rem',
            fontWeight: 'bold',
            color: 'primary.main',
            flex: 1
          }}
        >
          {list.name} - Ingredients
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportPDF}
          sx={{
            minWidth: isMobile ? '100%' : 'auto',
            fontSize: isMobile ? '0.875rem' : '1rem',
            py: isMobile ? 1.5 : 1
          }}
        >
          Export PDF
        </Button>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 2,
        alignItems: isMobile ? 'stretch' : 'center',
        mb: 2
      }}>
        <TextField
          label="Category Name"
          value={newIngredient.name}
          onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
          onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
          fullWidth
          size={isMobile ? "small" : "medium"}
          sx={{
            '& .MuiInputLabel-root': {
              fontSize: isMobile ? '0.875rem' : '1rem'
            },
            '& .MuiOutlinedInput-root': {
              fontSize: isMobile ? '1rem' : '1.125rem'
            }
          }}
        />
        
        <Button
          variant="outlined"
          startIcon={<MicIcon />}
          onClick={() => setOpenVoiceModal(true)}
          sx={{
            minWidth: isMobile ? '100%' : 'auto',
            fontSize: isMobile ? '0.875rem' : '1rem',
            py: isMobile ? 1.5 : 1
          }}
        >
          ADD MAIN CATEGORY
        </Button>
      </Box>

      <Box id="ingredient-list-content" sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        {mainIngredients.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            px: 2
          }}>
            <Typography 
              variant={isMobile ? "body2" : "body1"} 
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              No categories added yet. Add your first category!
            </Typography>
          </Box>
        ) : (
          <List dense={isMobile}>
            {mainIngredients.map((ingredient) => {
              const subIngredients = getSubIngredients(ingredient.id);
              return (
                <Box key={ingredient.id}>
                  <ListItem sx={{ 
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' }
                  }}>
                    <ListItemText
                      primary={
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Typography 
                            variant={isMobile ? "body2" : "body1"}
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: isMobile ? '0.875rem' : '1rem'
                            }}
                          >
                            {editingId === ingredient.id ? (
                              <TextField
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    updateIngredient(ingredient.id, 'name', editValue);
                                    setEditingId(null);
                                  }
                                }}
                                size="small"
                                autoFocus
                              />
                            ) : (
                              ingredient.name
                            )}
                          </Typography>
                          <Chip 
                            label={`${subIngredients.length} sub-ingredients`} 
                            size={isMobile ? "small" : "medium"}
                            variant="outlined"
                            color="primary"
                            sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction sx={{ 
                      display: 'flex', 
                      gap: isMobile ? 0.5 : 1,
                      flexDirection: isMobile ? 'column' : 'row'
                    }}>
                      <IconButton
                        onClick={() => toggleExpanded(ingredient.id)}
                        size={isMobile ? "small" : "medium"}
                      >
                        {expandedItems.has(ingredient.id) ? 
                          <ExpandLessIcon fontSize={isMobile ? "small" : "medium"} /> : 
                          <ExpandMoreIcon fontSize={isMobile ? "small" : "medium"} />
                        }
                      </IconButton>
                      
                      <IconButton
                        onClick={() => {
                          setSelectedParentIngredient(ingredient);
                          setOpenSubIngredientDialog(true);
                        }}
                        size={isMobile ? "small" : "medium"}
                        sx={{ color: 'success.main' }}
                      >
                        <AddIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                      
                      <IconButton
                        onClick={() => {
                          setEditingId(ingredient.id);
                          setEditValue(ingredient.name);
                        }}
                        size={isMobile ? "small" : "medium"}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                      
                      <IconButton
                        onClick={() => deleteIngredient(ingredient.id)}
                        size={isMobile ? "small" : "medium"}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Collapse in={expandedItems.has(ingredient.id)}>
                    <Box sx={{ 
                      backgroundColor: 'grey.50',
                      pl: isMobile ? 2 : 4
                    }}>
                      {subIngredients.map((subIngredient) => (
                        <ListItem key={subIngredient.id} sx={{ 
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' }
                        }}>
                          <ListItemText
                            primary={
                              <Typography 
                                variant={isMobile ? "body2" : "body1"}
                                sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                              >
                                • {subIngredient.name}
                              </Typography>
                            }
                            secondary={
                              <Typography 
                                variant={isMobile ? "caption" : "body2"}
                                color="text.secondary"
                                sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                              >
                                {subIngredient.baseQuantity * numberOfPeople} {subIngredient.baseUnit}
                              </Typography>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              onClick={() => deleteSubIngredient(subIngredient.id)}
                              size={isMobile ? "small" : "medium"}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                      
                      {subIngredients.length === 0 && (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 2,
                          px: 2
                        }}>
                          <Typography 
                            variant={isMobile ? "caption" : "body2"} 
                            color="text.secondary"
                            sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                          >
                            No sub-ingredients yet. Click the + button to add some!
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </List>
        )}
      </Box>

      {/* Sub-ingredient Dialog */}
      <Dialog 
        open={openSubIngredientDialog} 
        onClose={() => setOpenSubIngredientDialog(false)}
        maxWidth={isMobile ? "xs" : "sm"}
        fullWidth
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
          Add Sub-ingredient to {selectedParentIngredient?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 2,
            mt: 1
          }}>
            <TextField
              label="Name"
              value={newSubIngredient.name}
              onChange={(e) => setNewSubIngredient({ ...newSubIngredient, name: e.target.value })}
              fullWidth
              size={isMobile ? "small" : "medium"}
            />
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2
            }}>
              <TextField
                label="Quantity"
                type="number"
                value={newSubIngredient.quantity}
                onChange={(e) => setNewSubIngredient({ ...newSubIngredient, quantity: e.target.value })}
                fullWidth
                size={isMobile ? "small" : "medium"}
              />
              <TextField
                label="Unit"
                value={newSubIngredient.unit}
                onChange={(e) => setNewSubIngredient({ ...newSubIngredient, unit: e.target.value })}
                fullWidth
                size={isMobile ? "small" : "medium"}
              />
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: 1
            }}>
              <Button
                variant="outlined"
                startIcon={<MicIcon />}
                onClick={() => {
                  setOpenSubIngredientVoiceModal(true);
                }}
                sx={{
                  minWidth: isMobile ? '100%' : 'auto',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  py: isMobile ? 1.5 : 1
                }}
              >
                Voice Add
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
          <Button 
            onClick={() => setOpenSubIngredientDialog(false)}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={addSubIngredient} 
            variant="contained"
            disabled={!newSubIngredient.name.trim()}
            size={isMobile ? "small" : "medium"}
          >
            Add Sub-ingredient
          </Button>
        </DialogActions>
      </Dialog>

      {/* Voice Input Modal for Categories */}
      <VoiceInputModal
        open={openVoiceModal}
        onClose={() => setOpenVoiceModal(false)}
        onResult={handleVoiceInput}
        context="category"
      />

      {/* Voice Input Modal for Sub-ingredients */}
      <VoiceInputModal
        open={openSubIngredientVoiceModal}
        onClose={() => setOpenSubIngredientVoiceModal(false)}
        onResult={handleSubIngredientVoiceInput}
        context="sub-ingredient"
      />
    </Box>
  );
};

export default IngredientList; 