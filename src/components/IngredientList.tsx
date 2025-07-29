
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Collapse, ListItemButton
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Mic as MicIcon, GetApp as DownloadIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import type { IngredientListData, Ingredient } from '../types';
import VoiceInputModal from './VoiceInputModal';

interface IngredientListProps {
  list: IngredientListData;
  numberOfPeople: number;
  onUpdateList: (list: IngredientListData) => void;
}

const IngredientList = ({ list, numberOfPeople, onUpdateList }: IngredientListProps) => {
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openVoiceModal, setOpenVoiceModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: 1, unit: 'pieces' });
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [openSubIngredientDialog, setOpenSubIngredientDialog] = useState(false);
  const [selectedParentIngredient, setSelectedParentIngredient] = useState<Ingredient | null>(null);
  const [newSubIngredient, setNewSubIngredient] = useState({ name: '', quantity: 1, unit: 'pieces' });
  const [openSubIngredientVoiceModal, setOpenSubIngredientVoiceModal] = useState(false);
  const [voiceInputField, setVoiceInputField] = useState<'name' | 'quantity' | null>(null);
  const [quantityInputValue, setQuantityInputValue] = useState('1');
  const [isQuantityEditing, setIsQuantityEditing] = useState(false);

  // Sync quantity input value with newSubIngredient state
  useEffect(() => {
    if (!isQuantityEditing) {
      setQuantityInputValue(newSubIngredient.quantity.toString());
    }
  }, [newSubIngredient.quantity, isQuantityEditing]);

  const commonUnits = [
    'pieces', 'kg', 'g', 'liters', 'ml', 'cups', 'tablespoons', 'teaspoons',
    'pounds', 'ounces', 'quarts', 'pints', 'bunches', 'heads', 'cloves'
  ];

  const addIngredient = () => {
    if (newIngredient.name.trim()) {
      // Check if ingredient with same name already exists
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
        quantity: 0, // Main ingredients are just categories
        unit: '',
        baseQuantity: 0,
        baseUnit: '',
      };
      const updatedList = {
        ...list,
        ingredients: [...list.ingredients, ingredient],
        updatedAt: new Date().toISOString(),
      };
      onUpdateList(updatedList);
      setNewIngredient({ name: '', quantity: 1, unit: 'pieces' });
      setOpenAddDialog(false);
      console.log('Added ingredient:', ingredient.name, 'Total ingredients:', updatedList.ingredients.length);
    }
  };

  const updateIngredient = () => {
    if (editingIngredient && editingIngredient.name.trim()) {
      const updatedIngredients = list.ingredients.map(ing =>
        ing.id === editingIngredient.id ? {
          ...editingIngredient,
          quantity: editingIngredient.baseQuantity * numberOfPeople,
        } : ing
      );
      const updatedList = {
        ...list,
        ingredients: updatedIngredients,
        updatedAt: new Date().toISOString(),
      };
      onUpdateList(updatedList);
      setEditingIngredient(null);
    }
  };

  const deleteIngredient = (id: string) => {
    // Remove the ingredient and all its sub-ingredients
    const updatedIngredients = list.ingredients.filter(ing => ing.id !== id && ing.parentId !== id);
    const updatedList = {
      ...list,
      ingredients: updatedIngredients,
      updatedAt: new Date().toISOString(),
    };
    onUpdateList(updatedList);
  };

  const toggleExpanded = (ingredientId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(ingredientId)) {
      newExpanded.delete(ingredientId);
    } else {
      newExpanded.add(ingredientId);
    }
    setExpandedItems(newExpanded);
  };

  const addSubIngredient = () => {
    if (selectedParentIngredient && newSubIngredient.name.trim()) {
      const subIngredient: Ingredient = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newSubIngredient.name.trim(),
        quantity: newSubIngredient.quantity * numberOfPeople,
        unit: newSubIngredient.unit,
        baseQuantity: newSubIngredient.quantity,
        baseUnit: newSubIngredient.unit,
        parentId: selectedParentIngredient.id,
        isSubIngredient: true,
      };
      
      const updatedIngredients = [...list.ingredients, subIngredient];
      const updatedList = {
        ...list,
        ingredients: updatedIngredients,
        updatedAt: new Date().toISOString(),
      };
      onUpdateList(updatedList);
      setNewSubIngredient({ name: '', quantity: 1, unit: 'pieces' });
      setQuantityInputValue('1');
      setIsQuantityEditing(false);
      setOpenSubIngredientDialog(false);
      setSelectedParentIngredient(null);
    }
  };

  const deleteSubIngredient = (id: string) => {
    const updatedIngredients = list.ingredients.filter(ing => ing.id !== id);
    const updatedList = {
      ...list,
      ingredients: updatedIngredients,
      updatedAt: new Date().toISOString(),
    };
    onUpdateList(updatedList);
  };

  const handleVoiceInput = (text: string, _language: string) => {
    // For main ingredients, just use the text as the category name
    if (text.trim()) {
      // Check if ingredient with same name already exists
      const existingIngredient = list.ingredients.find(ing => 
        ing.name.toLowerCase() === text.trim().toLowerCase() && !ing.isSubIngredient
      );
      
      if (existingIngredient) {
        alert('A category with this name already exists. Please use a different name.');
        setOpenVoiceModal(false);
        return;
      }
      
      const ingredient: Ingredient = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: text.trim(),
        quantity: 0, // Main ingredients are just categories
        unit: '',
        baseQuantity: 0,
        baseUnit: '',
      };
      const updatedList = {
        ...list,
        ingredients: [...list.ingredients, ingredient],
        updatedAt: new Date().toISOString(),
      };
      onUpdateList(updatedList);
      setOpenVoiceModal(false);
      console.log('Added ingredient via voice:', ingredient.name, 'Total ingredients:', updatedList.ingredients.length);
    }
  };

  const handleSubIngredientVoiceInput = (text: string, _language: string) => {
    // Simple parsing logic for sub-ingredients
    const words = text.toLowerCase().split(' ');
    let name = '';
    let quantity = 1;
    let unit = 'pieces';
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const num = parseFloat(word);
      if (!isNaN(num)) {
        quantity = num;
        if (i + 1 < words.length && commonUnits.includes(words[i + 1])) {
          unit = words[i + 1];
          name = words.slice(0, i).join(' ');
          break;
        } else {
          name = words.slice(0, i).concat(words.slice(i + 1)).join(' ');
          break;
        }
      }
    }
    if (!name) {
      name = text;
    }
    
    // Directly add the sub-ingredient without opening dialog
    if (selectedParentIngredient && name.trim()) {
      const subIngredient: Ingredient = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        quantity: quantity * numberOfPeople,
        unit: unit,
        baseQuantity: quantity,
        baseUnit: unit,
        parentId: selectedParentIngredient.id,
        isSubIngredient: true,
      };
      
      const updatedIngredients = [...list.ingredients, subIngredient];
      const updatedList = {
        ...list,
        ingredients: updatedIngredients,
        updatedAt: new Date().toISOString(),
      };
      onUpdateList(updatedList);
      setOpenVoiceModal(false);
      setSelectedParentIngredient(null);
    }
  };

  const handleSubIngredientFieldVoiceInput = (text: string, _language: string) => {
    console.log('=== SUB-INGREDIENT FIELD VOICE INPUT ===');
    console.log('Voice input for field:', voiceInputField);
    console.log('Voice text:', text);
    
    if (!voiceInputField) return;
    
    if (voiceInputField === 'name') {
      setNewSubIngredient(prev => ({ ...prev, name: text.trim() }));
    } else if (voiceInputField === 'quantity') {
      const num = parseFloat(text);
      if (!isNaN(num) && num > 0) {
        setNewSubIngredient(prev => ({ ...prev, quantity: num }));
        setQuantityInputValue(num.toString());
      } else {
        alert('Please speak a valid number for quantity.');
      }
    }
    
    setOpenSubIngredientVoiceModal(false);
    setVoiceInputField(null);
  };

  // Quantity input handlers
  const handleQuantityFocus = () => {
    setIsQuantityEditing(true);
    setQuantityInputValue(''); // Clear the input when user starts typing
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuantityInputValue(value);
    
    const numValue = parseFloat(value);
    if (numValue > 0) {
      setNewSubIngredient(prev => ({ ...prev, quantity: numValue }));
    }
  };

  const handleQuantityBlur = () => {
    setIsQuantityEditing(false);
    const numValue = parseFloat(quantityInputValue);
    if (isNaN(numValue) || numValue <= 0) {
      setQuantityInputValue(newSubIngredient.quantity.toString());
    }
  };

  // PDF Export function using HTML to Canvas for proper Unicode support
  const exportPDF = async () => {
    try {
      // Create a temporary div for PDF content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.color = 'black';
      
      // Create the content HTML
      tempDiv.innerHTML = `
        <div style="margin-bottom: 20px;">
          <h1 style="color: #1976d2; margin: 0 0 10px 0; font-size: 24px;">${list.name}</h1>
          <p style="margin: 0; color: #666; font-size: 14px;">Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        ${list.ingredients.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #1976d2; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Ingredient</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Quantity</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Unit</th>
              </tr>
            </thead>
            <tbody>
              ${list.ingredients
                .filter(ing => !ing.isSubIngredient)
                .map((ing, index) => {
                  const subIngredients = list.ingredients.filter(sub => sub.parentId === ing.id);
                  
                  let rows = '';
                  
                  // Only show categories that have sub-ingredients
                  if (subIngredients.length > 0) {
                    rows += `
                      <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                        <td style="padding: 12px; border: 1px solid #ddd; font-size: 14px; font-weight: bold; color: #1976d2;">${ing.name}</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-size: 14px;">-</td>
                        <td style="padding: 12px; border: 1px solid #ddd; font-size: 14px;">-</td>
                      </tr>
                    `;
                    
                    // Add sub-ingredients
                    subIngredients.forEach((subIng) => {
                      const subScaledQuantity = subIng.baseQuantity * numberOfPeople;
                      rows += `
                        <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                          <td style="padding: 12px 12px 12px 32px; border: 1px solid #ddd; font-size: 14px;">• ${subIng.name}</td>
                          <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-size: 14px;">${subScaledQuantity}</td>
                          <td style="padding: 12px; border: 1px solid #ddd; font-size: 14px;">${subIng.baseUnit}</td>
                        </tr>
                      `;
                    });
                  }
                  
                  return rows;
                }).join('')}
            </tbody>
          </table>
        ` : `
          <div style="text-align: center; padding: 40px; color: #666; font-size: 16px;">
            No ingredients in this list.
          </div>
        `}
      `;
      
      document.body.appendChild(tempDiv);
      
      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary div
      document.body.removeChild(tempDiv);
      
      // Create PDF
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
      
      pdf.save(`${list.name}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Ingredients</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)} size="small">Add Ingredient</Button>
            <Button variant="outlined" startIcon={<MicIcon />} onClick={() => setOpenVoiceModal(true)} size="small">Voice Input</Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} size="small" onClick={exportPDF}>Export PDF</Button>
          </Box>
        </Box>
        {list.ingredients.length === 0 ? (
          <Box color="text.secondary" textAlign="center">
            No ingredients yet. Add your first ingredient!
          </Box>
        ) : (
          <List>
            {list.ingredients
              .filter(ingredient => !ingredient.isSubIngredient) // Only show main ingredients
              .map((ingredient) => {
                const subIngredients = list.ingredients.filter(sub => sub.parentId === ingredient.id);
                const isExpanded = expandedItems.has(ingredient.id);
                
                return (
                  <Box key={ingredient.id}>
                    <ListItem sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                      <ListItemButton onClick={() => toggleExpanded(ingredient.id)} sx={{ p: 0 }}>
                        <ListItemText 
                          primary={ingredient.name} 
                          secondary={`${subIngredients.length} sub-ingredients`} 
                        />
                        {subIngredients.length > 0 && (
                          <IconButton size="small">
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        )}
                      </ListItemButton>
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedParentIngredient(ingredient);
                            setOpenSubIngredientDialog(true);
                          }} 
                          size="small"
                          title="Add Sub-ingredient"
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedParentIngredient(ingredient);
                            setOpenVoiceModal(true);
                          }} 
                          size="small"
                          title="Voice Input for Sub-ingredient"
                        >
                          <MicIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => setEditingIngredient(ingredient)} size="small"><EditIcon /></IconButton>
                        <IconButton edge="end" onClick={() => deleteIngredient(ingredient.id)} size="small"><DeleteIcon /></IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    {/* Sub-ingredients */}
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <List sx={{ pl: 4 }}>
                        {subIngredients.map((subIngredient) => {
                          const subScaledQuantity = subIngredient.baseQuantity * numberOfPeople;
                          return (
                            <ListItem key={subIngredient.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1, backgroundColor: 'grey.50' }}>
                              <ListItemText 
                                primary={`• ${subIngredient.name}`} 
                                secondary={`${subScaledQuantity} ${subIngredient.baseUnit}`} 
                              />
                              <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => setEditingIngredient(subIngredient)} size="small"><EditIcon /></IconButton>
                                <IconButton edge="end" onClick={() => deleteSubIngredient(subIngredient.id)} size="small"><DeleteIcon /></IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Collapse>
                  </Box>
                );
              })}
          </List>
        )}
        {/* Add Ingredient Dialog */}
        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
          <DialogTitle>Add Category</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField 
                autoFocus 
                margin="dense" 
                label="Category Name" 
                fullWidth 
                variant="outlined" 
                value={newIngredient.name} 
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} 
                placeholder="e.g., Vegetables, Spices, Dairy"
              />
              <Button 
                variant="outlined" 
                startIcon={<MicIcon />} 
                onClick={() => {
                  setOpenAddDialog(false);
                  setOpenVoiceModal(true);
                }}
                sx={{ minWidth: 'auto', px: 2 }}
                title="Use Voice Input"
              >
                Voice
              </Button>
            </Box>
            <Typography variant="body2" color="textSecondary">
              This will create a category where you can add sub-ingredients with quantities and units.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button onClick={addIngredient} variant="contained">Add Category</Button>
          </DialogActions>
        </Dialog>
        {/* Edit Ingredient Dialog */}
        <Dialog open={!!editingIngredient} onClose={() => setEditingIngredient(null)}>
          <DialogTitle>Edit Ingredient</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="Ingredient Name" fullWidth variant="outlined" value={editingIngredient?.name || ''} onChange={(e) => setEditingIngredient(editingIngredient ? { ...editingIngredient, name: e.target.value } : null)} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Base Quantity (per person)" type="number" value={editingIngredient?.baseQuantity || 1} onChange={(e) => setEditingIngredient(editingIngredient ? { ...editingIngredient, baseQuantity: parseFloat(e.target.value) || 1 } : null)} inputProps={{ min: 0, step: 0.1 }} sx={{ width: '50%' }} />
              <FormControl sx={{ width: '50%' }}>
                <InputLabel>Unit</InputLabel>
                <Select value={editingIngredient?.baseUnit || 'pieces'} label="Unit" onChange={(e) => setEditingIngredient(editingIngredient ? { ...editingIngredient, baseUnit: e.target.value } : null)}>
                  {commonUnits.map((unit) => (<MenuItem key={unit} value={unit}>{unit}</MenuItem>))}
                </Select>
              </FormControl>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Current total: {(editingIngredient?.baseQuantity || 1) * numberOfPeople} {editingIngredient?.baseUnit || 'pieces'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingIngredient(null)}>Cancel</Button>
            <Button onClick={updateIngredient} variant="contained">Update</Button>
          </DialogActions>
        </Dialog>
        {/* Add Sub-Ingredient Dialog */}
        <Dialog open={openSubIngredientDialog} onClose={() => setOpenSubIngredientDialog(false)}>
          <DialogTitle>Add Sub-Ingredient to {selectedParentIngredient?.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField 
                autoFocus 
                margin="dense" 
                label="Sub-Ingredient Name" 
                fullWidth 
                variant="outlined" 
                value={newSubIngredient.name} 
                onChange={(e) => setNewSubIngredient({ ...newSubIngredient, name: e.target.value })} 
                placeholder="e.g., Onion, Tomato, Ginger"
              />
              <Button 
                variant="outlined" 
                startIcon={<MicIcon />} 
                onClick={() => {
                  setVoiceInputField('name');
                  setOpenSubIngredientVoiceModal(true);
                }}
                sx={{ minWidth: 'auto', px: 2 }}
                title="Use Voice Input for Name"
              >
                Voice
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, width: '50%' }}>
                <TextField 
                  label="Quantity" 
                  type="number" 
                  value={quantityInputValue} 
                  onChange={handleQuantityChange}
                  onFocus={handleQuantityFocus}
                  onBlur={handleQuantityBlur}
                  inputProps={{ min: 0, step: 0.1 }} 
                  fullWidth
                />
                <Button 
                  variant="outlined" 
                  startIcon={<MicIcon />} 
                  onClick={() => {
                    setVoiceInputField('quantity');
                    setOpenSubIngredientVoiceModal(true);
                  }}
                  sx={{ minWidth: 'auto', px: 2 }}
                  title="Use Voice Input for Quantity"
                >
                  Voice
                </Button>
              </Box>
              <FormControl sx={{ width: '50%' }}>
                <InputLabel>Unit</InputLabel>
                <Select 
                  value={newSubIngredient.unit} 
                  label="Unit" 
                  onChange={(e) => setNewSubIngredient({ ...newSubIngredient, unit: e.target.value })}
                >
                  {commonUnits.map((unit) => (<MenuItem key={unit} value={unit}>{unit}</MenuItem>))}
                </Select>
              </FormControl>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              You can use voice input for the ingredient name and quantity. Speak clearly in Gujarati, Hindi, or English.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSubIngredientDialog(false)}>Cancel</Button>
            <Button 
              variant="outlined" 
              startIcon={<MicIcon />} 
              onClick={() => {
                setOpenSubIngredientDialog(false);
                setOpenVoiceModal(true);
              }}
            >
              Voice Add
            </Button>
            <Button onClick={addSubIngredient} variant="contained">Add Sub-Ingredient</Button>
          </DialogActions>
        </Dialog>

        {/* Voice Input Modal */}
        <VoiceInputModal 
          open={openVoiceModal} 
          onClose={() => setOpenVoiceModal(false)} 
          onVoiceInput={selectedParentIngredient ? handleSubIngredientVoiceInput : handleVoiceInput}
          context={selectedParentIngredient ? 'sub-ingredient' : 'category'}
        />

        {/* Sub-Ingredient Voice Input Modal */}
        <VoiceInputModal 
          open={openSubIngredientVoiceModal} 
          onClose={() => setOpenSubIngredientVoiceModal(false)} 
          onVoiceInput={handleSubIngredientFieldVoiceInput}
          context="sub-ingredient"
        />
      </CardContent>
    </Card>
  );
};

export default IngredientList; 