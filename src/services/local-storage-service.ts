// Local Storage Service - Works without Supabase
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

export class LocalStorageService {
  private static STORAGE_KEY = 'solution_property_inspections';
  private static PHOTOS_KEY = 'solution_property_photos';

  // Convert file to base64 for local storage
  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Upload photo (stores as base64 in localStorage)
  static async uploadPhoto(file: File): Promise<string | null> {
    try {
      console.log('LocalStorage: Uploading photo:', file.name);
      
      // Check file size (localStorage has limits)
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        console.error('File too large for local storage (max 5MB)');
        return null;
      }

      const base64 = await this.fileToBase64(file);
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Store photo in localStorage
      const photos = this.getPhotos();
      photos[photoId] = base64;
      
      try {
        localStorage.setItem(this.PHOTOS_KEY, JSON.stringify(photos));
        console.log('LocalStorage: Photo uploaded successfully:', photoId);
        return photoId; // Return the ID instead of base64 to save space in inspection data
      } catch (e) {
        console.error('LocalStorage quota exceeded. Clearing old photos...');
        // Clear old photos if storage is full
        localStorage.setItem(this.PHOTOS_KEY, JSON.stringify({ [photoId]: base64 }));
        return photoId;
      }
    } catch (error) {
      console.error('LocalStorage: Error uploading photo:', error);
      return null;
    }
  }

  // Get photo by ID
  static getPhoto(photoId: string): string | null {
    const photos = this.getPhotos();
    return photos[photoId] || null;
  }

  // Get all stored photos
  private static getPhotos(): Record<string, string> {
    try {
      const photos = localStorage.getItem(this.PHOTOS_KEY);
      return photos ? JSON.parse(photos) : {};
    } catch {
      return {};
    }
  }

  // Save inspection to localStorage
  static async saveInspection(inspectionData: InspectionData): Promise<SavedInspection | null> {
    try {
      console.log('LocalStorage: Saving inspection:', inspectionData);
      
      const inspections = await this.getInspections();
      const newInspection: SavedInspection = {
        ...inspectionData,
        id: `inspection_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      inspections.push(newInspection);
      
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(inspections));
        console.log('LocalStorage: Inspection saved successfully:', newInspection.id);
        return newInspection;
      } catch (e) {
        console.error('LocalStorage quota exceeded. Please clear some old inspections.');
        return null;
      }
    } catch (error) {
      console.error('LocalStorage: Error saving inspection:', error);
      return null;
    }
  }

  // Get all inspections
  static async getInspections(): Promise<SavedInspection[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const inspections = data ? JSON.parse(data) : [];
      console.log('LocalStorage: Loaded inspections:', inspections.length);
      return inspections;
    } catch (error) {
      console.error('LocalStorage: Error loading inspections:', error);
      return [];
    }
  }

  // Get single inspection
  static async getInspection(id: string): Promise<SavedInspection | null> {
    try {
      const inspections = await this.getInspections();
      return inspections.find(i => i.id === id) || null;
    } catch (error) {
      console.error('LocalStorage: Error getting inspection:', error);
      return null;
    }
  }

  // Update inspection
  static async updateInspection(id: string, inspectionData: InspectionData): Promise<SavedInspection | null> {
    try {
      const inspections = await this.getInspections();
      const index = inspections.findIndex(i => i.id === id);
      
      if (index === -1) {
        console.error('LocalStorage: Inspection not found:', id);
        return null;
      }

      const updatedInspection: SavedInspection = {
        ...inspectionData,
        id,
        created_at: inspections[index].created_at,
        updated_at: new Date().toISOString()
      };

      inspections[index] = updatedInspection;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(inspections));
      
      console.log('LocalStorage: Inspection updated successfully:', id);
      return updatedInspection;
    } catch (error) {
      console.error('LocalStorage: Error updating inspection:', error);
      return null;
    }
  }

  // Delete inspection
  static async deleteInspection(id: string): Promise<boolean> {
    try {
      const inspections = await this.getInspections();
      const filtered = inspections.filter(i => i.id !== id);
      
      if (filtered.length === inspections.length) {
        console.error('LocalStorage: Inspection not found:', id);
        return false;
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      console.log('LocalStorage: Inspection deleted successfully:', id);
      return true;
    } catch (error) {
      console.error('LocalStorage: Error deleting inspection:', error);
      return false;
    }
  }

  // Clear all data (useful for testing)
  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PHOTOS_KEY);
    console.log('LocalStorage: All data cleared');
  }

  // Export data as JSON (for backup)
  static async exportData(): Promise<string> {
    const inspections = await this.getInspections();
    const photos = this.getPhotos();
    return JSON.stringify({ inspections, photos }, null, 2);
  }

  // Import data from JSON
  static async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data.inspections) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.inspections));
      }
      if (data.photos) {
        localStorage.setItem(this.PHOTOS_KEY, JSON.stringify(data.photos));
      }
      return true;
    } catch (error) {
      console.error('LocalStorage: Error importing data:', error);
      return false;
    }
  }
}