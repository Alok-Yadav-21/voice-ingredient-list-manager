import type { IngredientListData, Ingredient } from '../types';

// Simple database service that works without PostgreSQL
// This prevents the app from breaking if PostgreSQL is not installed

class DatabaseService {
  // Mock service - no real database connection

  async testConnection(): Promise<boolean> {
    console.log('DatabaseService: Testing connection (mock)');
    return true;
  }

  async getAllLists(): Promise<IngredientListData[]> {
    console.log('DatabaseService: Getting all lists (mock)');
    return [];
  }

  async createList(_list: IngredientListData): Promise<boolean> {
    console.log('DatabaseService: Creating list (mock)');
    return true;
  }

  async getListById(_listId: string): Promise<IngredientListData | null> {
    console.log('DatabaseService: Getting list by ID (mock)');
    return null;
  }

  async updateList(_list: IngredientListData): Promise<boolean> {
    console.log('DatabaseService: Updating list (mock)');
    return true;
  }

  async deleteList(_listId: string): Promise<boolean> {
    console.log('DatabaseService: Deleting list (mock)');
    return true;
  }

  async searchLists(_searchTerm: string): Promise<IngredientListData[]> {
    console.log('DatabaseService: Searching lists (mock)');
    return [];
  }

  async addIngredient(_listId: string, _ingredient: Ingredient): Promise<boolean> {
    console.log('DatabaseService: Adding ingredient (mock)');
    return true;
  }

  async updateIngredient(_ingredient: Ingredient): Promise<boolean> {
    console.log('DatabaseService: Updating ingredient (mock)');
    return true;
  }

  async deleteIngredient(_ingredientId: string): Promise<boolean> {
    console.log('DatabaseService: Deleting ingredient (mock)');
    return true;
  }

  async clearAllData(): Promise<boolean> {
    console.log('DatabaseService: Clearing all data (mock)');
    return true;
  }

  async syncWithLocalStorage(): Promise<boolean> {
    console.log('DatabaseService: Syncing with localStorage (mock)');
    return true;
  }
}

export default new DatabaseService(); 