export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  baseQuantity: number; // Original quantity for scaling
  baseUnit: string; // Original unit for scaling
  parentId?: string; // ID of parent ingredient (for sub-ingredients)
  subIngredients?: Ingredient[]; // Array of sub-ingredients
  isSubIngredient?: boolean; // Flag to identify sub-ingredients
}

export interface IngredientCategory {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

export interface IngredientListData {
  id: string;
  name: string;
  ingredients: Ingredient[];
  numberOfPeople: number;
  createdAt: string;
  updatedAt?: string;
}

export interface VoiceInputResult {
  text: string;
  language: string;
} 