import { supabase } from '@/integrations/supabase/client';

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

export class SupabaseService {
  // Upload photo to Supabase Storage
  static async uploadPhoto(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `inspections/${fileName}`;

      const { data, error } = await supabase.storage
        .from('inspection-photos')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading photo:', error);
        console.error('Upload error details:', {
          message: error.message,
          fileName: fileName,
          filePath: filePath,
          fileSize: file.size,
          fileType: file.type
        });
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('inspection-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo - Exception:', error);
      console.error('Exception details:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return null;
    }
  }

  // Save inspection to database
  static async saveInspection(inspectionData: InspectionData): Promise<SavedInspection | null> {
    try {
      // Start a transaction by saving the main inspection first
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          client_name: inspectionData.clientName,
          property_location: inspectionData.propertyLocation,
          property_type: inspectionData.propertyType,
          inspector_name: inspectionData.inspectorName,
          inspection_date: inspectionData.inspectionDate,
        })
        .select()
        .single();

      if (inspectionError || !inspection) {
        console.error('Error saving inspection:', inspectionError);
        console.error('Save inspection error details:', {
          error: inspectionError,
          data: inspectionData,
          message: inspectionError?.message,
          details: inspectionError?.details,
          hint: inspectionError?.hint,
          code: inspectionError?.code
        });
        return null;
      }

      // Save areas and their items
      for (const area of inspectionData.areas) {
        const { data: savedArea, error: areaError } = await supabase
          .from('inspection_areas')
          .insert({
            inspection_id: inspection.id,
            name: area.name,
          })
          .select()
          .single();

        if (areaError || !savedArea) {
          console.error('Error saving area:', areaError);
          console.error('Save area error details:', {
            error: areaError,
            areaName: area.name,
            inspectionId: inspection.id,
            message: areaError?.message,
            details: areaError?.details
          });
          continue;
        }

        // Save items for this area
        if (area.items.length > 0) {
          const items = area.items.map(item => ({
            area_id: savedArea.id,
            category: item.category,
            point: item.point,
            status: item.status,
            comments: item.comments,
            location: item.location,
            photos: item.photos,
          }));

          const { error: itemsError } = await supabase
            .from('inspection_items')
            .insert(items);

          if (itemsError) {
            console.error('Error saving items:', itemsError);
            console.error('Save items error details:', {
              error: itemsError,
              areaId: savedArea.id,
              itemsCount: items.length,
              message: itemsError?.message,
              details: itemsError?.details,
              hint: itemsError?.hint
            });
          }
        }
      }

      return {
        ...inspectionData,
        id: inspection.id,
        created_at: inspection.created_at,
        updated_at: inspection.updated_at,
      };
    } catch (error) {
      console.error('Error saving inspection - Exception:', error);
      console.error('Save inspection exception details:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        data: inspectionData
      });
      return null;
    }
  }

  // Get all inspections
  static async getInspections(): Promise<SavedInspection[]> {
    try {
      const { data: inspections, error } = await supabase
        .from('inspections')
        .select(`
          *,
          inspection_areas (
            *,
            inspection_items (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inspections:', error);
        return [];
      }

      // Transform the data to match our interface
      return inspections.map(inspection => ({
        id: inspection.id,
        clientName: inspection.client_name,
        propertyLocation: inspection.property_location,
        propertyType: inspection.property_type,
        inspectorName: inspection.inspector_name,
        inspectionDate: inspection.inspection_date,
        created_at: inspection.created_at,
        updated_at: inspection.updated_at,
        areas: inspection.inspection_areas.map((area: any) => ({
          id: area.id,
          name: area.name,
          items: area.inspection_items.map((item: any) => ({
            id: item.id,
            category: item.category,
            point: item.point,
            status: item.status,
            comments: item.comments || '',
            location: item.location || '',
            photos: item.photos || [],
          })),
        })),
      }));
    } catch (error) {
      console.error('Error fetching inspections:', error);
      return [];
    }
  }

  // Get single inspection
  static async getInspection(id: string): Promise<SavedInspection | null> {
    try {
      const { data: inspection, error } = await supabase
        .from('inspections')
        .select(`
          *,
          inspection_areas (
            *,
            inspection_items (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching inspection:', error);
        return null;
      }

      return {
        id: inspection.id,
        clientName: inspection.client_name,
        propertyLocation: inspection.property_location,
        propertyType: inspection.property_type,
        inspectorName: inspection.inspector_name,
        inspectionDate: inspection.inspection_date,
        created_at: inspection.created_at,
        updated_at: inspection.updated_at,
        areas: inspection.inspection_areas.map((area: any) => ({
          id: area.id,
          name: area.name,
          items: area.inspection_items.map((item: any) => ({
            id: item.id,
            category: item.category,
            point: item.point,
            status: item.status,
            comments: item.comments || '',
            location: item.location || '',
            photos: item.photos || [],
          })),
        })),
      };
    } catch (error) {
      console.error('Error fetching inspection:', error);
      return null;
    }
  }

  // Delete inspection
  static async deleteInspection(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting inspection:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting inspection:', error);
      return false;
    }
  }
}