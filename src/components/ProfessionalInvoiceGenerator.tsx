import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { LoadingSpinner } from './LoadingSpinner';
import {
  FileText,
  Download,
  Send,
  Eye,
  Plus,
  Trash2,
  Calculator,
  DollarSign,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Printer
} from 'lucide-react';
import { InvoiceService, BillingItem } from '@/services/invoice-service';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  propertyAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes: string;
  terms: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

interface ProfessionalInvoiceGeneratorProps {
  onNavigate?: (page: string) => void;
  existingInvoice?: BillingItem;
}

export function ProfessionalInvoiceGenerator({ 
  onNavigate, 
  existingInvoice 
}: ProfessionalInvoiceGeneratorProps) {
  const [invoice, setInvoice] = useState<InvoiceData>(() => ({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: existingInvoice?.clientName || '',
    clientEmail: existingInvoice?.clientEmail || '',
    clientPhone: '',
    clientAddress: '',
    propertyAddress: existingInvoice?.propertyAddress || '',
    items: existingInvoice?.items ? existingInvoice.items.map((item, index) => ({
      id: index.toString(),
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount
    })) : [
      {
        id: '1',
        description: 'Property Inspection Service',
        quantity: 1,
        rate: 150,
        amount: 150
      }
    ],
    subtotal: 0,
    taxRate: 5, // 5% VAT in Oman
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    notes: 'Thank you for choosing Solution Property for your inspection needs.',
    terms: 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.',
    status: 'draft'
  }));

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Calculate totals whenever items change
  React.useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal - invoice.discountAmount) * (invoice.taxRate / 100);
    const totalAmount = subtotal - invoice.discountAmount + taxAmount;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      totalAmount
    }));
  }, [invoice.items, invoice.discountAmount, invoice.taxRate]);

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Recalculate amount if quantity or rate changed
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleSave = async (status: 'draft' | 'sent') => {
    try {
      setLoading(true);
      
      const billingItem: Omit<BillingItem, 'id' | 'createdAt'> = {
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        propertyAddress: invoice.propertyAddress,
        date: invoice.date,
        dueDate: invoice.dueDate,
        items: invoice.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        })),
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.totalAmount,
        status: status as any,
        notes: invoice.notes
      };

      await InvoiceService.addInvoice(billingItem);
      
      // Navigate back to billing section
      onNavigate?.('billing');
      
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to print the invoice');
        return;
      }

      const printContent = printRef.current.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333;
              padding: 20px;
            }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .invoice-table th { background: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            .total-section { margin-top: 20px; }
            .company-info { text-align: left; }
            .client-info { text-align: right; }
            @media print { 
              body { padding: 0; }
              @page { margin: 20mm; }
            }
          </style>
        </head>
        <body onload="window.print(); window.onafterprint = () => window.close();">
          ${printContent}
        </body>
        </html>
      `);
      
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {existingInvoice ? 'Edit Invoice' : 'Create Invoice'}
          </h1>
          <p className="text-muted-foreground">Generate professional invoices for your services</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => handleSave('draft')} disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : <FileText className="w-4 h-4 mr-2" />}
            Save Draft
          </Button>
          <Button onClick={() => handleSave('sent')} disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4 mr-2" />}
            Send Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoice.invoiceNumber}
                    onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Issue Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={invoice.date}
                    onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={invoice.clientName}
                    onChange={(e) => setInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={invoice.clientEmail}
                    onChange={(e) => setInvoice(prev => ({ ...prev, clientEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input
                    id="clientPhone"
                    value={invoice.clientPhone}
                    onChange={(e) => setInvoice(prev => ({ ...prev, clientPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="propertyAddress">Property Address</Label>
                  <Input
                    id="propertyAddress"
                    value={invoice.propertyAddress}
                    onChange={(e) => setInvoice(prev => ({ ...prev, propertyAddress: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="clientAddress">Client Address</Label>
                <Textarea
                  id="clientAddress"
                  value={invoice.clientAddress}
                  onChange={(e) => setInvoice(prev => ({ ...prev, clientAddress: e.target.value }))}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Invoice Items</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12 sm:col-span-5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Service description"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <Label>Rate</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <Label>Amount</Label>
                      <Input
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={invoice.items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoice.notes}
                  onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={invoice.terms}
                  onChange={(e) => setInvoice(prev => ({ ...prev, terms: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{invoice.subtotal.toFixed(2)} OMR</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Discount:</span>
                  <Input
                    type="number"
                    value={invoice.discountAmount}
                    onChange={(e) => setInvoice(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                    className="w-20 text-right h-8"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Tax Rate (%):</span>
                  <Input
                    type="number"
                    value={invoice.taxRate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-20 text-right h-8"
                  />
                </div>
                
                <div className="flex justify-between">
                  <span>Tax Amount:</span>
                  <span>{invoice.taxAmount.toFixed(2)} OMR</span>
                </div>
                
                <hr />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{invoice.totalAmount.toFixed(2)} OMR</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print Invoice
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Preview how your invoice will appear to the client
            </DialogDescription>
          </DialogHeader>
          
          <div ref={printRef} className="bg-white p-8 text-black">
            {/* Invoice Preview Content */}
            <div className="invoice-header">
              <h1 className="text-3xl font-bold text-blue-800 mb-2">Solution Property</h1>
              <p className="text-lg font-semibold">INVOICE</p>
              <p className="text-gray-600">Professional Property Inspection Services</p>
            </div>

            <div className="invoice-details">
              <div className="company-info">
                <h3 className="font-bold mb-2">From:</h3>
                <p><strong>Solution Property</strong></p>
                <p>Property Inspection Services</p>
                <p>Muscat, Sultanate of Oman</p>
                <p>Email: info@solutionproperty.om</p>
              </div>
              
              <div className="client-info">
                <h3 className="font-bold mb-2">To:</h3>
                <p><strong>{invoice.clientName}</strong></p>
                {invoice.clientAddress && <p>{invoice.clientAddress}</p>}
                {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
                {invoice.clientPhone && <p>{invoice.clientPhone}</p>}
              </div>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Invoice #:</strong> {invoice.invoiceNumber}
                </div>
                <div>
                  <strong>Issue Date:</strong> {new Date(invoice.date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              </div>
              {invoice.propertyAddress && (
                <div className="mt-2">
                  <strong>Property:</strong> {invoice.propertyAddress}
                </div>
              )}
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{item.rate.toFixed(2)} OMR</td>
                    <td className="text-right">{item.amount.toFixed(2)} OMR</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="total-section text-right">
              <div className="inline-block text-left">
                <div className="flex justify-between w-64 mb-1">
                  <span>Subtotal:</span>
                  <span>{invoice.subtotal.toFixed(2)} OMR</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between w-64 mb-1">
                    <span>Discount:</span>
                    <span>-{invoice.discountAmount.toFixed(2)} OMR</span>
                  </div>
                )}
                <div className="flex justify-between w-64 mb-1">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>{invoice.taxAmount.toFixed(2)} OMR</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between w-64 text-lg font-bold">
                  <span>Total:</span>
                  <span>{invoice.totalAmount.toFixed(2)} OMR</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-8">
                <h4 className="font-bold mb-2">Notes:</h4>
                <p className="text-sm">{invoice.notes}</p>
              </div>
            )}

            {invoice.terms && (
              <div className="mt-4">
                <h4 className="font-bold mb-2">Terms & Conditions:</h4>
                <p className="text-sm">{invoice.terms}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close Preview
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}