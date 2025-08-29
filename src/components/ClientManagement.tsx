import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { LoadingSpinner, SectionLoading } from './LoadingSpinner';
import { LoadingError } from './ErrorBoundary';
import {
  User,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Building,
  Filter,
  Download,
  UserPlus
} from 'lucide-react';
import { StorageService, SavedInspection } from '@/services/storage-service';
import { InvoiceService, BillingItem } from '@/services/invoice-service';
import { ScheduleService, ScheduleItem } from '@/services/schedule-service';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  type: 'individual' | 'corporate';
  status: 'active' | 'inactive';
  createdAt: string;
  lastInspection?: string;
  totalInspections: number;
  totalRevenue: number;
  notes?: string;
}

interface ClientStats {
  totalClients: number;
  activeClients: number;
  corporateClients: number;
  totalRevenue: number;
  averageRevenue: number;
}

interface ClientManagementProps {
  onNavigate?: (page: string, data?: any) => void;
}

export function ClientManagement({ onNavigate }: ClientManagementProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'corporate'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0,
    activeClients: 0,
    corporateClients: 0,
    totalRevenue: 0,
    averageRevenue: 0
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter, typeFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [inspections, invoices, schedules] = await Promise.all([
        StorageService.getInspections(),
        InvoiceService.getInvoices(),
        ScheduleService.getSchedules()
      ]);

      // Extract unique clients from all sources
      const clientMap = new Map<string, Client>();

      // From inspections
      inspections.forEach(inspection => {
        if (inspection.clientName && inspection.clientName.trim()) {
          const clientId = inspection.clientName.toLowerCase().replace(/\s+/g, '-');
          const existing = clientMap.get(clientId);
          
          clientMap.set(clientId, {
            id: clientId,
            name: inspection.clientName,
            email: existing?.email || '',
            phone: existing?.phone || '',
            address: existing?.address || inspection.propertyLocation || '',
            company: existing?.company,
            type: existing?.type || 'individual',
            status: existing?.status || 'active',
            createdAt: existing?.createdAt || inspection.inspectionDate,
            lastInspection: inspection.inspectionDate,
            totalInspections: (existing?.totalInspections || 0) + 1,
            totalRevenue: existing?.totalRevenue || 0,
            notes: existing?.notes
          });
        }
      });

      // From invoices
      invoices.forEach(invoice => {
        if (invoice.clientName && invoice.clientName.trim()) {
          const clientId = invoice.clientName.toLowerCase().replace(/\s+/g, '-');
          const existing = clientMap.get(clientId);
          
          clientMap.set(clientId, {
            ...existing,
            id: clientId,
            name: invoice.clientName,
            email: existing?.email || invoice.clientEmail || '',
            phone: existing?.phone || '',
            address: existing?.address || invoice.propertyLocation || '',
            totalRevenue: (existing?.totalRevenue || 0) + (invoice.status === 'paid' ? invoice.totalAmount : 0)
          } as Client);
        }
      });

      // From schedules
      schedules.forEach(schedule => {
        if (schedule.clientName && schedule.clientName.trim()) {
          const clientId = schedule.clientName.toLowerCase().replace(/\s+/g, '-');
          const existing = clientMap.get(clientId);
          
          if (!existing) {
            clientMap.set(clientId, {
              id: clientId,
              name: schedule.clientName,
              email: schedule.clientEmail || '',
              phone: schedule.clientPhone || '',
              address: schedule.propertyLocation || '',
              type: 'individual',
              status: 'active',
              createdAt: schedule.date,
              totalInspections: 0,
              totalRevenue: 0
            });
          } else {
            clientMap.set(clientId, {
              ...existing,
              email: existing.email || schedule.clientEmail || '',
              phone: existing.phone || schedule.clientPhone || '',
              address: existing.address || schedule.propertyLocation || ''
            });
          }
        }
      });

      const clientsArray = Array.from(clientMap.values()).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setClients(clientsArray);

      // Calculate stats
      const newStats: ClientStats = {
        totalClients: clientsArray.length,
        activeClients: clientsArray.filter(c => c.status === 'active').length,
        corporateClients: clientsArray.filter(c => c.type === 'corporate').length,
        totalRevenue: clientsArray.reduce((sum, c) => sum + c.totalRevenue, 0),
        averageRevenue: clientsArray.length > 0 
          ? clientsArray.reduce((sum, c) => sum + c.totalRevenue, 0) / clientsArray.length 
          : 0
      };
      setStats(newStats);

    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Failed to load client data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(client => client.type === typeFilter);
    }

    setFilteredClients(filtered);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowViewDialog(true);
  };

  const handleExportClients = () => {
    const csvContent = [
      'Name,Email,Phone,Address,Company,Type,Status,Total Inspections,Total Revenue,Last Inspection',
      ...filteredClients.map(client =>
        `"${client.name}","${client.email}","${client.phone}","${client.address}","${client.company || ''}","${client.type}","${client.status}","${client.totalInspections}","${client.totalRevenue}","${client.lastInspection || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <SectionLoading message="Loading client data..." height="h-96" />;
  if (error) return <LoadingError message={error} onRetry={loadClients} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Management</h1>
          <p className="text-muted-foreground">Manage your client relationships and history</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportClients} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold">{stats.totalClients}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold">{stats.activeClients}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Corporate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span className="text-2xl font-bold">{stats.corporateClients}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} OMR</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No clients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? "Try adjusting your filters" 
                  : "Start by adding your first client"}
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First Client
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                      <Badge variant="outline">
                        {client.type}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {client.phone}
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {client.address}
                        </div>
                      )}
                      {client.lastInspection && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Last: {new Date(client.lastInspection).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>{client.totalInspections} inspections</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span>{client.totalRevenue.toLocaleString()} OMR</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewClient(client)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Client Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedClient.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground capitalize">{selectedClient.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedClient.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{selectedClient.phone || 'Not provided'}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-muted-foreground">{selectedClient.address || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Inspections</Label>
                  <p className="text-sm text-muted-foreground">{selectedClient.totalInspections}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Revenue</Label>
                  <p className="text-sm text-muted-foreground">{selectedClient.totalRevenue.toLocaleString()} OMR</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Inspection</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient.lastInspection 
                      ? new Date(selectedClient.lastInspection).toLocaleDateString()
                      : 'No inspections yet'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Client Since</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedClient.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {selectedClient.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedClient.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}