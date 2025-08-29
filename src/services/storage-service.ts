// Unified Storage Service - Uses Supabase with LocalStorage fallback
import { SupabaseService } from './supabase-service';
import { LocalStorageService } from './local-storage-service';

interface InspectionItem {
  id: number;
  category: string;
  point: string;
  status: 'Snags' | 'Pass' | 'Fail';
  comments: string;
  location: string;
  photos: string[];
}

interface InspectionArea {
  id: number;
  name: string;
  items: InspectionItem[];
}

interface InspectionData {
  clientName: string;
  propertyLocation: string;
  propertyType: string;
  inspectorName: string;
  inspectionDate: string;
  areas: InspectionArea[];
}

export interface SavedInspection extends InspectionData {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export class StorageService {
  // Try Supabase first, fallback to local storage if needed
  private static useLocalStorage = false;
  private static hasTestedSupabase = false;

  // Test Supabase connection on first use
  private static async testSupabase(): Promise<boolean> {
    if (this.hasTestedSupabase) {
      return !this.useLocalStorage;
    }

    try {
      console.log('🔄 Testing Supabase connection...');
      // Try a simple query to test connection
      const inspections = await SupabaseService.getInspections();
      this.hasTestedSupabase = true;
      this.useLocalStorage = false;
      console.log('✅ Supabase connected successfully');
      return true;
    } catch (error) {
      console.warn('⚠️ Supabase connection failed, using local storage as fallback');
      console.warn('Error:', error);
      this.hasTestedSupabase = true;
      this.useLocalStorage = true;
      return false;
    }
  }

  // Upload photo with fallback
  static async uploadPhoto(file: File): Promise<string | null> {
    // Test Supabase connection first
    await this.testSupabase();
    
    // Try Supabase first, fallback to localStorage if it fails
    if (!this.useLocalStorage) {
      try {
        console.log('☁️ Attempting to upload photo to Supabase...');
        const result = await SupabaseService.uploadPhoto(file);
        if (result) {
          console.log('✅ Photo uploaded successfully to Supabase:', result);
          return result;
        }
        console.warn('Supabase upload returned null, falling back to local storage');
      } catch (error) {
        console.error('Supabase photo upload error:', error);
        console.warn('Falling back to local storage for photo upload');
      }
    }
    
    // Fallback to local storage
    console.log('💾 Using local storage for photo upload');
    return await LocalStorageService.uploadPhoto(file);
  }

  // Save inspection with fallback
  static async saveInspection(inspectionData: InspectionData): Promise<SavedInspection | null> {
    await this.testSupabase();
    
    if (this.useLocalStorage) {
      console.log('💾 Using local storage to save inspection');
      return await LocalStorageService.saveInspection(inspectionData);
    }

    try {
      console.log('☁️ Saving inspection to Supabase...');
      const result = await SupabaseService.saveInspection(inspectionData);
      if (!result) {
        console.warn('Supabase save failed, falling back to local storage');
        this.useLocalStorage = true;
        return await LocalStorageService.saveInspection(inspectionData);
      }
      console.log('✅ Inspection saved to Supabase successfully');
      return result;
    } catch (error) {
      console.error('Supabase error:', error);
      console.warn('Falling back to local storage');
      this.useLocalStorage = true;
      return await LocalStorageService.saveInspection(inspectionData);
    }
  }

  // Get all inspections with fallback
  static async getInspections(): Promise<SavedInspection[]> {
    await this.testSupabase();
    
    if (this.useLocalStorage) {
      const result = await LocalStorageService.getInspections();
      console.log(`📋 Loaded ${result.length} inspections from local storage`);
      return result;
    }

    try {
      const result = await SupabaseService.getInspections();
      console.log(`☁️ Loaded ${result.length} inspections from Supabase`);
      if (!result || result.length === 0) {
        // Also check local storage for any locally saved inspections
        const localInspections = await LocalStorageService.getInspections();
        if (localInspections.length > 0) {
          console.log('Found inspections in local storage');
          return localInspections;
        }
      }
      return result;
    } catch (error) {
      console.error('Supabase error:', error);
      this.useLocalStorage = true;
      return await LocalStorageService.getInspections();
    }
  }

  // Get single inspection with fallback
  static async getInspection(id: string): Promise<SavedInspection | null> {
    if (!this.useLocalStorage) {
      try {
        return await SupabaseService.getInspection(id);
      } catch (error) {
        console.error('Supabase error:', error);
        this.useLocalStorage = true;
        return await LocalStorageService.getInspection(id);
      }
    }
    
    try {
      return await LocalStorageService.getInspection(id);
    } catch (error) {
      console.error('Error getting inspection:', error);
      return null;
    }
  }

  // Delete inspection with fallback
  static async deleteInspection(id: string): Promise<boolean> {
    if (!this.useLocalStorage) {
      try {
        const result = await SupabaseService.deleteInspection(id);
        if (result) {
          console.log('✅ Inspection deleted successfully from Supabase');
        }
        return result;
      } catch (error) {
        console.error('Supabase delete error:', error);
        this.useLocalStorage = true;
        return await LocalStorageService.deleteInspection(id);
      }
    }
    
    try {
      const result = await LocalStorageService.deleteInspection(id);
      if (result) {
        console.log('✅ Inspection deleted successfully from local storage');
      }
      return result;
    } catch (error) {
      console.error('Error deleting inspection:', error);
      return false;
    }
  }

  // Update existing inspection
  static async updateInspection(id: string, inspectionData: InspectionData): Promise<SavedInspection | null> {
    await this.testSupabase();
    
    if (this.useLocalStorage || id.startsWith('inspection_')) {
      return await LocalStorageService.updateInspection(id, inspectionData);
    }

    try {
      // For Supabase, use the proper update method
      console.log('☁️ Updating inspection in Supabase...');
      const updatedInspection = await SupabaseService.updateInspection(id, inspectionData);
      if (updatedInspection) {
        console.log('✅ Inspection updated in Supabase successfully');
        return updatedInspection;
      }
      
      // If Supabase update fails, fallback to local storage
      console.warn('Supabase update failed, falling back to local storage');
      this.useLocalStorage = true;
      return await LocalStorageService.updateInspection(id, inspectionData);
    } catch (error) {
      console.error('Supabase update error:', error);
      this.useLocalStorage = true;
      return await LocalStorageService.updateInspection(id, inspectionData);
    }
  }

  // Get storage type being used
  static getStorageType(): string {
    return this.useLocalStorage ? 'Local Storage' : 'Supabase Cloud';
  }

  // Force use of local storage (for testing)
  static forceLocalStorage(force: boolean): void {
    this.useLocalStorage = force;
    console.log(`Storage mode: ${this.getStorageType()}`);
  }

  // Export all data
  static async exportData(): Promise<string> {
    if (this.useLocalStorage) {
      return await LocalStorageService.exportData();
    }
    
    // For Supabase, get all inspections and format as JSON
    const inspections = await this.getInspections();
    return JSON.stringify({ inspections }, null, 2);
  }

  // Clear all local data
  static clearLocalData(): void {
    LocalStorageService.clearAll();
  }
}