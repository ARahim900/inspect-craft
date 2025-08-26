import { supabase } from '@/integrations/supabase/client';

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BillingItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  propertyLocation: string;
  propertyType: 'residential' | 'commercial';
  propertyArea?: number;
  inspectionDate?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paymentDate?: string;
  description?: string;
  services: ServiceItem[];
  notes?: string;
  inspectionId?: string;
}

export class InvoiceService {
  // Create a new invoice
  static async createInvoice(invoiceData: Omit<BillingItem, 'id'>): Promise<BillingItem | null> {
    try {
      console.log('Creating invoice:', invoiceData);
      
      // First create the invoice record
      const { data: invoiceRecord, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceData.invoiceNumber,
          client_name: invoiceData.clientName,
          client_email: invoiceData.clientEmail,
          client_phone: invoiceData.clientPhone,
          property_location: invoiceData.propertyLocation,
          property_type: invoiceData.propertyType,
          property_area: invoiceData.propertyArea,
          inspection_date: invoiceData.inspectionDate,
          issue_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          amount: invoiceData.amount,
          tax: invoiceData.tax,
          total_amount: invoiceData.totalAmount,
          status: invoiceData.status,
          payment_method: invoiceData.paymentMethod,
          payment_date: invoiceData.paymentDate,
          description: invoiceData.description,
          notes: invoiceData.notes,
          inspection_id: invoiceData.inspectionId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        return null;
      }

      // Then create the service items
      if (invoiceData.services.length > 0) {
        const serviceItems = invoiceData.services.map(service => ({
          invoice_id: invoiceRecord.id,
          description: service.description,
          quantity: service.quantity,
          rate: service.rate,
          amount: service.amount
        }));

        const { error: servicesError } = await supabase
          .from('invoice_services')
          .insert(serviceItems);

        if (servicesError) {
          console.error('Error creating invoice services:', servicesError);
          // Try to clean up the invoice record
          await supabase.from('invoices').delete().eq('id', invoiceRecord.id);
          return null;
        }
      }

      // Fetch the complete invoice with services
      return await this.getInvoice(invoiceRecord.id);
    } catch (error) {
      console.error('Error in createInvoice:', error);
      return null;
    }
  }

  // Get all invoices for the current user
  static async getInvoices(): Promise<BillingItem[]> {
    try {
      console.log('Fetching invoices from Supabase...');
      
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_services (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }

      console.log(`☁️ Loaded ${invoices?.length || 0} invoices from Supabase`);
      return invoices?.map(this.transformInvoiceFromDB) || [];
    } catch (error) {
      console.error('Error in getInvoices:', error);
      return [];
    }
  }

  // Get a single invoice by ID
  static async getInvoice(id: string): Promise<BillingItem | null> {
    try {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_services (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching invoice:', error);
        return null;
      }

      return invoice ? this.transformInvoiceFromDB(invoice) : null;
    } catch (error) {
      console.error('Error in getInvoice:', error);
      return null;
    }
  }

  // Update an existing invoice
  static async updateInvoice(id: string, invoiceData: Partial<BillingItem>): Promise<BillingItem | null> {
    try {
      console.log('Updating invoice:', id, invoiceData);
      
      // Update the invoice record
      const updateData: any = {};
      if (invoiceData.invoiceNumber) updateData.invoice_number = invoiceData.invoiceNumber;
      if (invoiceData.clientName) updateData.client_name = invoiceData.clientName;
      if (invoiceData.clientEmail !== undefined) updateData.client_email = invoiceData.clientEmail;
      if (invoiceData.clientPhone !== undefined) updateData.client_phone = invoiceData.clientPhone;
      if (invoiceData.propertyLocation) updateData.property_location = invoiceData.propertyLocation;
      if (invoiceData.propertyType) updateData.property_type = invoiceData.propertyType;
      if (invoiceData.propertyArea !== undefined) updateData.property_area = invoiceData.propertyArea;
      if (invoiceData.inspectionDate !== undefined) updateData.inspection_date = invoiceData.inspectionDate;
      if (invoiceData.issueDate) updateData.issue_date = invoiceData.issueDate;
      if (invoiceData.dueDate) updateData.due_date = invoiceData.dueDate;
      if (invoiceData.amount !== undefined) updateData.amount = invoiceData.amount;
      if (invoiceData.tax !== undefined) updateData.tax = invoiceData.tax;
      if (invoiceData.totalAmount !== undefined) updateData.total_amount = invoiceData.totalAmount;
      if (invoiceData.status) updateData.status = invoiceData.status;
      if (invoiceData.paymentMethod !== undefined) updateData.payment_method = invoiceData.paymentMethod;
      if (invoiceData.paymentDate !== undefined) updateData.payment_date = invoiceData.paymentDate;
      if (invoiceData.description !== undefined) updateData.description = invoiceData.description;
      if (invoiceData.notes !== undefined) updateData.notes = invoiceData.notes;
      if (invoiceData.inspectionId !== undefined) updateData.inspection_id = invoiceData.inspectionId;

      const { error: invoiceError } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id);

      if (invoiceError) {
        console.error('Error updating invoice:', invoiceError);
        return null;
      }

      // Update services if provided
      if (invoiceData.services) {
        // Delete existing services
        await supabase
          .from('invoice_services')
          .delete()
          .eq('invoice_id', id);

        // Insert new services
        if (invoiceData.services.length > 0) {
          const serviceItems = invoiceData.services.map(service => ({
            invoice_id: id,
            description: service.description,
            quantity: service.quantity,
            rate: service.rate,
            amount: service.amount
          }));

          const { error: servicesError } = await supabase
            .from('invoice_services')
            .insert(serviceItems);

          if (servicesError) {
            console.error('Error updating invoice services:', servicesError);
            return null;
          }
        }
      }

      // Fetch the updated invoice
      return await this.getInvoice(id);
    } catch (error) {
      console.error('Error in updateInvoice:', error);
      return null;
    }
  }

  // Delete an invoice
  static async deleteInvoice(id: string): Promise<boolean> {
    try {
      console.log('Deleting invoice:', id);
      
      // Services will be deleted automatically due to CASCADE
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting invoice:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteInvoice:', error);
      return false;
    }
  }

  // Transform database record to BillingItem
  private static transformInvoiceFromDB(data: any): BillingItem {
    const services: ServiceItem[] = (data.invoice_services || []).map((service: any) => ({
      id: service.id,
      description: service.description,
      quantity: parseFloat(service.quantity),
      rate: parseFloat(service.rate),
      amount: parseFloat(service.amount)
    }));

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      clientName: data.client_name,
      clientEmail: data.client_email,
      clientPhone: data.client_phone,
      propertyLocation: data.property_location,
      propertyType: data.property_type,
      propertyArea: data.property_area ? parseFloat(data.property_area) : undefined,
      inspectionDate: data.inspection_date,
      issueDate: data.issue_date,
      dueDate: data.due_date,
      amount: parseFloat(data.amount),
      tax: parseFloat(data.tax),
      totalAmount: parseFloat(data.total_amount),
      status: data.status,
      paymentMethod: data.payment_method,
      paymentDate: data.payment_date,
      description: data.description,
      services,
      notes: data.notes,
      inspectionId: data.inspection_id
    };
  }
}