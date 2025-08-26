import { supabase } from '@/integrations/supabase/client';

export interface ScheduleItem {
  id: string;
  title: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  date: string;
  time: string;
  duration?: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  propertyLocation?: string;
  propertyType?: string;
  notes?: string;
}

export class ScheduleService {
  // Create a new schedule item
  static async createSchedule(scheduleData: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem | null> {
    try {
      console.log('Creating schedule:', scheduleData);
      
      const { data, error } = await supabase
        .from('schedules')
        .insert({
          title: scheduleData.title,
          client_name: scheduleData.clientName,
          client_email: scheduleData.clientEmail,
          client_phone: scheduleData.clientPhone,
          date: scheduleData.date,
          time: scheduleData.time,
          duration: scheduleData.duration || 60,
          status: scheduleData.status,
          priority: scheduleData.priority,
          property_location: scheduleData.propertyLocation,
          property_type: scheduleData.propertyType,
          notes: scheduleData.notes,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating schedule:', error);
        return null;
      }

      return this.transformScheduleFromDB(data);
    } catch (error) {
      console.error('Error in createSchedule:', error);
      return null;
    }
  }

  // Get all schedules for the current user
  static async getSchedules(): Promise<ScheduleItem[]> {
    try {
      console.log('Fetching schedules from Supabase...');
      
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching schedules:', error);
        return [];
      }

      console.log(`☁️ Loaded ${data?.length || 0} schedules from Supabase`);
      return data?.map(this.transformScheduleFromDB) || [];
    } catch (error) {
      console.error('Error in getSchedules:', error);
      return [];
    }
  }

  // Update an existing schedule
  static async updateSchedule(id: string, scheduleData: Partial<ScheduleItem>): Promise<ScheduleItem | null> {
    try {
      console.log('Updating schedule:', id, scheduleData);
      
      const updateData: any = {};
      if (scheduleData.title) updateData.title = scheduleData.title;
      if (scheduleData.clientName) updateData.client_name = scheduleData.clientName;
      if (scheduleData.clientEmail !== undefined) updateData.client_email = scheduleData.clientEmail;
      if (scheduleData.clientPhone !== undefined) updateData.client_phone = scheduleData.clientPhone;
      if (scheduleData.date) updateData.date = scheduleData.date;
      if (scheduleData.time) updateData.time = scheduleData.time;
      if (scheduleData.duration !== undefined) updateData.duration = scheduleData.duration;
      if (scheduleData.status) updateData.status = scheduleData.status;
      if (scheduleData.priority) updateData.priority = scheduleData.priority;
      if (scheduleData.propertyLocation !== undefined) updateData.property_location = scheduleData.propertyLocation;
      if (scheduleData.propertyType !== undefined) updateData.property_type = scheduleData.propertyType;
      if (scheduleData.notes !== undefined) updateData.notes = scheduleData.notes;

      const { data, error } = await supabase
        .from('schedules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating schedule:', error);
        return null;
      }

      return this.transformScheduleFromDB(data);
    } catch (error) {
      console.error('Error in updateSchedule:', error);
      return null;
    }
  }

  // Delete a schedule
  static async deleteSchedule(id: string): Promise<boolean> {
    try {
      console.log('Deleting schedule:', id);
      
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting schedule:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteSchedule:', error);
      return false;
    }
  }

  // Transform database record to ScheduleItem
  private static transformScheduleFromDB(data: any): ScheduleItem {
    return {
      id: data.id,
      title: data.title,
      clientName: data.client_name,
      clientEmail: data.client_email,
      clientPhone: data.client_phone,
      date: data.date,
      time: data.time,
      duration: data.duration,
      status: data.status,
      priority: data.priority,
      propertyLocation: data.property_location,
      propertyType: data.property_type,
      notes: data.notes
    };
  }
}