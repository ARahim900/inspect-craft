import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt, 
  DollarSign, 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Filter, 
  Search,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Send
} from 'lucide-react';

interface BillingItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  propertyLocation: string;
  inspectionDate: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paymentDate?: string;
  description: string;
  services: ServiceItem[];
  notes: string;
}

interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface BillingSectionProps {
  onBack?: () => void;
}

const BillingSection: React.FC<BillingSectionProps> = ({ onBack }) => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<BillingItem[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BillingItem | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<BillingItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState<Partial<BillingItem>>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    propertyLocation: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 0,
    tax: 0,
    totalAmount: 0,
    status: 'draft',
    description: '',
    services: [],
    notes: ''
  });

  const [newService, setNewService] = useState<Partial<ServiceItem>>({
    description: '',
    quantity: 1,
    rate: 0,
    amount: 0
  });

  // Load billing items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('billing-items');
    if (saved) {
      const items = JSON.parse(saved);
      setBillingItems(items);
      setFilteredItems(items);
    }
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = billingItems;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.propertyLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [billingItems, filterStatus, searchTerm]);

  // Calculate totals whenever services change
  useEffect(() => {
    const services = formData.services || [];
    const subtotal = services.reduce((sum, service) => sum + service.amount, 0);
    const taxAmount = subtotal * 0.05; // 5% tax
    const total = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      amount: subtotal,
      tax: taxAmount,
      totalAmount: total
    }));
  }, [formData.services]);

  const saveBillingItems = (items: BillingItem[]) => {
    setBillingItems(items);
    localStorage.setItem('billing-items', JSON.stringify(items));
  };

  const handleCreateInvoice = () => {
    if (!formData.clientName || !formData.propertyLocation || !formData.services?.length) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and add at least one service.",
        variant: "destructive"
      });
      return;
    }

    const newItem: BillingItem = {
      ...formData as BillingItem,
      id: Date.now().toString()
    };

    const updatedItems = [...billingItems, newItem];
    saveBillingItems(updatedItems);

    toast({
      title: "Invoice Created",
      description: `Invoice ${formData.invoiceNumber} has been created successfully.`,
      variant: "default"
    });

    setShowCreateForm(false);
    resetForm();
  };

  const handleUpdateInvoice = () => {
    if (!editingItem) return;

    const updatedItems = billingItems.map(item =>
      item.id === editingItem.id ? { ...formData as BillingItem, id: editingItem.id } : item
    );

    saveBillingItems(updatedItems);

    toast({
      title: "Invoice Updated",
      description: "Invoice has been updated successfully.",
      variant: "default"
    });

    setEditingItem(null);
    resetForm();
  };

  const handleDeleteInvoice = (id: string) => {
    const updatedItems = billingItems.filter(item => item.id !== id);
    saveBillingItems(updatedItems);

    toast({
      title: "Invoice Deleted",
      description: "Invoice has been removed from the system.",
      variant: "default"
    });
  };

  const handleStatusChange = (id: string, status: BillingItem['status']) => {
    const updatedItems = billingItems.map(item => {
      if (item.id === id) {
        const updates: Partial<BillingItem> = { status };
        if (status === 'paid') {
          updates.paymentDate = new Date().toISOString().split('T')[0];
        }
        return { ...item, ...updates };
      }
      return item;
    });

    saveBillingItems(updatedItems);

    toast({
      title: "Status Updated",
      description: `Invoice status changed to ${status}.`,
      variant: "default"
    });
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      propertyLocation: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 0,
      tax: 0,
      totalAmount: 0,
      status: 'draft',
      description: '',
      services: [],
      notes: ''
    });
    setNewService({
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    });
  };

  const startEdit = (item: BillingItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowCreateForm(true);
  };

  const addService = () => {
    if (!newService.description || !newService.rate) {
      toast({
        title: "Missing Service Information",
        description: "Please fill in service description and rate.",
        variant: "destructive"
      });
      return;
    }

    const service: ServiceItem = {
      id: Date.now().toString(),
      description: newService.description!,
      quantity: newService.quantity || 1,
      rate: newService.rate || 0,
      amount: (newService.quantity || 1) * (newService.rate || 0)
    };

    setFormData(prev => ({
      ...prev,
      services: [...(prev.services || []), service]
    }));

    setNewService({
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    });
  };

  const removeService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: (prev.services || []).filter(s => s.id !== serviceId)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTotalRevenue = () => {
    return billingItems.filter(item => item.status === 'paid').reduce((sum, item) => sum + item.totalAmount, 0);
  };

  const getOutstandingAmount = () => {
    return billingItems.filter(item => ['sent', 'overdue'].includes(item.status)).reduce((sum, item) => sum + item.totalAmount, 0);
  };

  const getOverdueCount = () => {
    return billingItems.filter(item => {
      if (item.status !== 'sent') return false;
      return new Date(item.dueDate) < new Date();
    }).length;
  };

  const handlePrintInvoice = (invoice: BillingItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Pop-up Blocked",
        description: "Please allow pop-ups to print the invoice.",
        variant: "destructive"
      });
      return;
    }

    const printContent = generateInvoiceHTML(invoice);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generateInvoiceHTML = (invoice: BillingItem) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-info h1 { color: #2563eb; margin: 0; }
          .invoice-info { text-align: right; }
          .client-info { margin-bottom: 30px; }
          .services-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .services-table th, .services-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .services-table th { background-color: #f8f9fa; font-weight: bold; }
          .totals { margin-top: 20px; text-align: right; }
          .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .final-total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 10px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-info">
            <h1>InspectCraft Solutions</h1>
            <p>Professional Property Inspection Services</p>
            <p>Email: info@inspectcraft.com | Phone: +971 4 123 4567</p>
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div class="client-info">
          <h3>Bill To:</h3>
          <p><strong>${invoice.clientName}</strong></p>
          <p>${invoice.clientEmail}</p>
          <p>${invoice.clientPhone}</p>
          <p><strong>Property:</strong> ${invoice.propertyLocation}</p>
          <p><strong>Inspection Date:</strong> ${new Date(invoice.inspectionDate).toLocaleDateString()}</p>
        </div>

        <table class="services-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.services.map(service => `
              <tr>
                <td>${service.description}</td>
                <td>${service.quantity}</td>
                <td>$${service.rate.toFixed(2)}</td>
                <td>$${service.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${invoice.amount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (5%):</span>
            <span>$${invoice.tax.toFixed(2)}</span>
          </div>
          <div class="total-row final-total">
            <span>Total Amount:</span>
            <span>$${invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        ${invoice.notes ? `
          <div style="margin-top: 30px;">
            <h4>Notes:</h4>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for choosing InspectCraft Solutions!</p>
          <p>Payment terms: Net 30 days. Late payments subject to 1.5% monthly service charge.</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices and track payments</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              if (showCreateForm) {
                setEditingItem(null);
                resetForm();
              }
            }}
            className="bg-primary hover:bg-primary-dark text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'Create Invoice'}
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-success">${getTotalRevenue().toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-warning">${getOutstandingAmount().toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{getOverdueCount()}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold text-foreground">{billingItems.length}</p>
              </div>
              <Receipt className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Invoice Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? 'Edit Invoice' : 'Create New Invoice'}</CardTitle>
            <CardDescription>
              Fill in the details to {editingItem ? 'update' : 'create'} an invoice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                  placeholder="INV-2024-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                  placeholder="+971 50 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspectionDate">Inspection Date</Label>
                <Input
                  id="inspectionDate"
                  type="date"
                  value={formData.inspectionDate}
                  onChange={(e) => setFormData({...formData, inspectionDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyLocation">Property Location *</Label>
              <Input
                id="propertyLocation"
                value={formData.propertyLocation}
                onChange={(e) => setFormData({...formData, propertyLocation: e.target.value})}
                placeholder="Downtown Dubai, Villa 123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Property inspection services..."
                rows={2}
              />
            </div>

            {/* Services Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Services</h3>
              
              {/* Add Service Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-accent/30 rounded-lg">
                <Input
                  placeholder="Service description"
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={newService.quantity}
                  onChange={(e) => setNewService({...newService, quantity: parseInt(e.target.value) || 1})}
                />
                <Input
                  type="number"
                  placeholder="Rate"
                  value={newService.rate}
                  onChange={(e) => setNewService({...newService, rate: parseFloat(e.target.value) || 0})}
                />
                <Button onClick={addService} className="bg-primary hover:bg-primary-dark text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Services List */}
              {formData.services && formData.services.length > 0 && (
                <div className="space-y-2">
                  {formData.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <span className="font-medium">{service.description}</span>
                        <span>Qty: {service.quantity}</span>
                        <span>Rate: ${service.rate.toFixed(2)}</span>
                        <span className="font-medium">Amount: ${service.amount.toFixed(2)}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(service.id)}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 p-4 bg-accent/30 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${(formData.amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (5%):</span>
                  <span>${(formData.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>${(formData.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes or payment terms..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={editingItem ? handleUpdateInvoice : handleCreateInvoice}
                className="bg-primary hover:bg-primary-dark text-primary-foreground"
              >
                {editingItem ? 'Update Invoice' : 'Create Invoice'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingItem(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({filteredItems.length})</CardTitle>
          <CardDescription>Manage your billing and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Invoices Found</h3>
              <p className="text-muted-foreground mb-4">
                {billingItems.length === 0 
                  ? "Get started by creating your first invoice."
                  : "No invoices match your current filters."
                }
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-primary hover:bg-primary-dark text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">{item.invoiceNumber}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status}</span>
                        </Badge>
                        <span className="text-lg font-bold text-foreground">${item.totalAmount.toLocaleString()}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Client:</span>
                          <span>{item.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Property:</span>
                          <span>{item.propertyLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Issue Date:</span>
                          <span>{new Date(item.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Due Date:</span>
                          <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {item.status === 'paid' && item.paymentDate && (
                        <p className="text-sm text-success bg-success/10 p-2 rounded">
                          Paid on {new Date(item.paymentDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {item.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(item.id, 'sent')}
                          className="text-primary hover:text-primary-dark"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {['sent', 'overdue'].includes(item.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(item.id, 'paid')}
                          className="text-success hover:text-success-foreground hover:bg-success"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintInvoice(item)}
                        className="text-foreground hover:text-primary-dark"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(item)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInvoice(item.id)}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSection;