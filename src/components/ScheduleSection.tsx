import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScheduleService, type ScheduleItem } from '@/services/schedule-service';
import { CalendarDays, Clock, MapPin, User, Phone, Edit, Trash2, Plus, Filter, Search } from 'lucide-react';

interface ScheduleSectionProps {
  onBack?: () => void;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ScheduleItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'calendar' | 'week'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    title: '',
    clientName: '',
    clientPhone: '',
    propertyLocation: '',
    propertyType: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 120,
    status: 'scheduled',
    notes: '',
    priority: 'medium'
  });

  // Load schedule items from Supabase
  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const schedules = await ScheduleService.getSchedules();
      setScheduleItems(schedules);
      setFilteredItems(schedules);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load schedules from database.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = scheduleItems;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.propertyLocation && item.propertyLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [scheduleItems, filterStatus, searchTerm]);

  const handleAddSchedule = async () => {
    if (!formData.title || !formData.clientName || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const newSchedule = await ScheduleService.createSchedule(formData as Omit<ScheduleItem, 'id'>);
      
      if (newSchedule) {
        await loadSchedules(); // Refresh the list
        toast({
          title: "Schedule Added",
          description: `Appointment scheduled for ${formData.clientName} on ${formData.date}`,
          variant: "default"
        });
        setShowAddForm(false);
        resetForm();
      } else {
        toast({
          title: "Error",
          description: "Failed to create appointment. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSchedule = async () => {
    if (!editingItem) return;

    try {
      setIsLoading(true);
      const updatedSchedule = await ScheduleService.updateSchedule(editingItem.id, formData);
      
      if (updatedSchedule) {
        await loadSchedules(); // Refresh the list
        toast({
          title: "Schedule Updated",
          description: "Appointment has been updated successfully.",
          variant: "default"
        });
        setEditingItem(null);
        resetForm();
      } else {
        toast({
          title: "Error",
          description: "Failed to update appointment. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      setIsLoading(true);
      const success = await ScheduleService.deleteSchedule(id);
      
      if (success) {
        await loadSchedules(); // Refresh the list
        toast({
          title: "Schedule Deleted",
          description: "Appointment has been removed from the schedule.",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete appointment. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      clientName: '',
      clientPhone: '',
      propertyLocation: '',
      propertyType: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 120,
      status: 'scheduled',
      notes: '',
      priority: 'medium'
    });
  };

  const startEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowAddForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTodaySchedules = () => {
    const today = new Date().toISOString().split('T')[0];
    return scheduleItems.filter(item => item.date === today);
  };

  const getUpcomingSchedules = () => {
    const today = new Date();
    return scheduleItems.filter(item => new Date(item.date) > today).slice(0, 5);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule Management</h1>
          <p className="text-muted-foreground">Manage your inspection appointments and schedules</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) {
                setEditingItem(null);
                resetForm();
              }
            }}
            className="bg-primary hover:bg-primary-dark text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add Schedule'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-bold text-foreground">{getTodaySchedules().length}</p>
              </div>
              <CalendarDays className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Scheduled</p>
                <p className="text-2xl font-bold text-foreground">{scheduleItems.filter(s => s.status === 'scheduled').length}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{scheduleItems.filter(s => s.status === 'completed').length}</p>
              </div>
              <User className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Schedules</p>
                <p className="text-2xl font-bold text-foreground">{scheduleItems.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? 'Edit Appointment' : 'Schedule New Appointment'}</CardTitle>
            <CardDescription>
              Fill in the details to {editingItem ? 'update' : 'schedule'} an inspection appointment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Appointment Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Property Inspection - Villa"
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
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                  placeholder="+971 50 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={formData.propertyType} onValueChange={(value) => setFormData({...formData, propertyType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Appointment Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Appointment Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={formData.duration?.toString()} onValueChange={(value) => setFormData({...formData, duration: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyLocation">Property Location</Label>
              <Input
                id="propertyLocation"
                value={formData.propertyLocation}
                onChange={(e) => setFormData({...formData, propertyLocation: e.target.value})}
                placeholder="Downtown Dubai, Villa 123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Special instructions or additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={editingItem ? handleEditSchedule : handleAddSchedule}
                className="bg-primary hover:bg-primary-dark text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (editingItem ? 'Update Appointment' : 'Schedule Appointment')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
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
                  placeholder="Search appointments..."
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule List */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments ({filteredItems.length})</CardTitle>
          <CardDescription>Manage your scheduled inspections</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Appointments Found</h3>
              <p className="text-muted-foreground mb-4">
                {scheduleItems.length === 0 
                  ? "Get started by scheduling your first inspection appointment."
                  : "No appointments match your current filters."
                }
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-primary hover:bg-primary-dark text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{item.clientName}</span>
                          {item.clientPhone && <span>• {item.clientPhone}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{item.propertyLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(item.time)} ({item.duration} min)</span>
                        </div>
                      </div>
                      
                      {item.notes && (
                        <p className="text-sm text-muted-foreground bg-accent/30 p-2 rounded">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
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
                        onClick={() => handleDeleteSchedule(item.id)}
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

export default ScheduleSection;