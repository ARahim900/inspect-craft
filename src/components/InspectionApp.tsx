import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SupabaseService, SavedInspection } from '@/services/supabase-service';
import Logo from './Logo';

// Types
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

// Icons
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronDownIcon = ({ isOpen, className }: { isOpen: boolean; className?: string }) => (
  <svg className={cn(`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const PrintIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const AppIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logo.jpeg" 
    alt="InspectCraft Logo" 
    className={cn("w-8 h-8 object-contain rounded", className)}
    onError={(e) => {
      // Fallback to SVG icon if image fails to load
      const target = e.target as HTMLImageElement;
      target.style.display = 'none';
      target.parentElement!.innerHTML = `
        <svg class="${cn("w-8 h-8", className)}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      `;
    }}
  />
);

const CameraIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BackIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin h-5 w-5", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Inspection Categories
const inspectionCategories = {
  "Structural & Interior": ["Hairline Cracks", "Ceilings", "Walls", "Floors", "Doors & Locks", "Wardrobes & Cabinets Functionality", "Switch Logic & Placement", "Stoppers & Door Closers", "Window Lock & Roller Mechanism", "Curtain Box Provision"],
  "Safety / Utility": ["Access Panel for AC Maintenance", "Water Heater Installation Check", "Water Pump Operational Test", "Fire Alarm/Smoke Detector Test"],
  "Plumbing System": ["Water Pressure & Flow", "Pipes & Fittings", "Sinks, Showers, Toilets", "Hot Water System", "Water Tank Status (Cleaning)", "Under-Sink Leaks", "Drainage Flow Speed", "Toilet Flushing Pressure", "Drain Ventilation (Gurgling Sounds)"],
  "Moisture & Thermal": ["Signs of Damp or Mold", "Thermal Imaging"],
  "Kitchen Inspection": ["Cabinet Quality & Alignment", "Countertops & Backsplash", "Sink & Mixer Tap Functionality", "Kitchen Appliances"],
  "HVAC System": ["AC Units", "Ventilation Fans", "Thermostat Functionality"],
  "Fire & Safety": ["Smoke Detectors", "Fire Extinguishers"],
  "Finishing & Aesthetics": ["Paint Finish", "Joinery (wardrobes, cabinets)", "Flooring Condition"],
  "External Inspection": ["Roof Condition", "Walls & Paint", "Drainage", "Windows & Doors"],
  "External Area": ["Balcony Drainage Test", "Tiling Level & Grouting", "Lighting in Outdoor Areas", "External Tap Functionality"],
  "Electrical System": ["Main Distribution Board (DB)", "Sockets & Switches", "Lighting Fixtures", "Grounding & Earthing", "DB Labeling", "All Light Points Working", "All Power Outlets Tested", "AC Drainage Check", "Isolators for AC & Heater", "Telephone/Internet Outlet Presence", "Bell/Intercom Functionality"],
  "Bathroom Inspection": ["Tiling & Grouting", "Waterproofing Issues", "Toilet Flushing", "Water Pressure", "Toilets/Wet Areas Floor Slope", "Exhaust Fan Working", "Glass Shower Partition Sealing"]
};

// Main App Component
export default function InspectionApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [inspections, setInspections] = useState<SavedInspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; inspectionId: string | null; inspectionName: string }>({ show: false, inspectionId: null, inspectionName: '' });
  const { toast } = useToast();

  // Load inspections from Supabase
  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    setIsLoading(true);
    try {
      const data = await SupabaseService.getInspections();
      setInspections(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load inspections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (page: string, inspectionId: string | null = null) => {
    setCurrentPage(page);
    setSelectedInspectionId(inspectionId);
  };

  const saveInspection = async (inspection: InspectionData) => {
    const savedInspection = await SupabaseService.saveInspection(inspection);
    if (savedInspection) {
      await loadInspections();
      toast({
        title: "Success",
        description: "Inspection saved successfully!",
      });
      navigateTo('dashboard');
    } else {
      toast({
        title: "Error",
        description: "Failed to save inspection",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirmation = (inspectionId: string, inspectionName: string) => {
    setDeleteConfirmation({ show: true, inspectionId, inspectionName });
  };

  const deleteInspection = async () => {
    if (!deleteConfirmation.inspectionId) return;
    
    const success = await SupabaseService.deleteInspection(deleteConfirmation.inspectionId);
    if (success) {
      await loadInspections();
      toast({
        title: "Success",
        description: "Inspection deleted successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete inspection",
        variant: "destructive",
      });
    }
    setDeleteConfirmation({ show: false, inspectionId: null, inspectionName: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, inspectionId: null, inspectionName: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {currentPage === 'dashboard' && (
          <Dashboard 
            navigateTo={navigateTo} 
            inspections={inspections} 
            isLoading={isLoading}
            onDeleteConfirmation={handleDeleteConfirmation}
          />
        )}
        {currentPage === 'newInspection' && (
          <InspectionForm 
            navigateTo={navigateTo} 
            onSave={saveInspection} 
          />
        )}
        {currentPage === 'editInspection' && selectedInspectionId && (
          <InspectionForm 
            navigateTo={navigateTo} 
            onSave={saveInspection}
            editInspection={inspections.find(i => i.id === selectedInspectionId)}
          />
        )}
        {currentPage === 'viewInspection' && selectedInspectionId && (
          <InspectionView 
            inspection={inspections.find(i => i.id === selectedInspectionId)!}
            navigateTo={navigateTo} 
          />
        )}
      </main>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-destructive/10 rounded-full">
                <DeleteIcon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Delete Inspection</h3>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete the inspection for <strong>"{deleteConfirmation.inspectionName}"</strong>? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteInspection}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Header Component
function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo size="medium" />
          <div className="hidden md:block text-sm text-muted-foreground">
            Property Inspection Management
          </div>
        </div>
      </div>
    </header>
  );
}

// Dashboard Component
function Dashboard({ 
  navigateTo, 
  inspections,
  isLoading,
  onDeleteConfirmation
}: { 
  navigateTo: (page: string, id?: string) => void;
  inspections: SavedInspection[];
  isLoading: boolean;
  onDeleteConfirmation: (id: string, name: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage your property inspections</p>
        </div>
        <button 
          onClick={() => navigateTo('newInspection')}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md w-full sm:w-auto justify-center"
        >
          <PlusIcon />
          New Inspection
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-card-foreground mb-6">Recent Inspections</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner className="text-primary" />
          </div>
        ) : inspections.length > 0 ? (
          <div className="grid gap-4">
            {inspections.map((inspection) => (
              <div 
                key={inspection.id} 
                className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-card-foreground text-lg">
                      {inspection.propertyLocation}
                    </h4>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <p>Type: {inspection.propertyType} • Inspector: {inspection.inspectorName}</p>
                      <p>Date: {new Date(inspection.inspectionDate).toLocaleDateString()}</p>
                      {inspection.clientName && <p>Client: {inspection.clientName}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => navigateTo('editInspection', inspection.id)}
                      className="bg-accent text-accent-foreground px-3 py-2 rounded-md hover:bg-accent/80 transition-colors font-medium flex items-center gap-2 text-sm"
                    >
                      <EditIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => navigateTo('viewInspection', inspection.id)}
                      className="bg-secondary text-secondary-foreground px-3 py-2 rounded-md hover:bg-secondary/80 transition-colors font-medium text-sm"
                    >
                      View Report
                    </button>
                    <button 
                      onClick={() => onDeleteConfirmation(inspection.id, inspection.propertyLocation)}
                      className="bg-destructive text-destructive-foreground px-3 py-2 rounded-md hover:bg-destructive/90 transition-colors font-medium flex items-center gap-2 text-sm"
                    >
                      <DeleteIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <div className="mx-auto mb-4 flex justify-center">
              <Logo size="large" showText={false} className="opacity-50" />
            </div>
            <p className="text-muted-foreground mb-2">No inspections found</p>
            <p className="text-sm text-muted-foreground">Click "New Inspection" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Inspection Form Component
function InspectionForm({ 
  navigateTo, 
  onSave,
  editInspection
}: { 
  navigateTo: (page: string) => void;
  onSave: (data: InspectionData) => void;
  editInspection?: SavedInspection;
}) {
  const [inspectionData, setInspectionData] = useState<InspectionData>(
    editInspection || {
      clientName: '',
      propertyLocation: '',
      propertyType: 'Apartment',
      inspectorName: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      areas: [{ id: Date.now(), name: 'General Area', items: [] }]
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const { toast } = useToast();

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInspectionData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAreaNameChange = (areaId: number, newName: string) => {
    setInspectionData(prev => ({
      ...prev,
      areas: prev.areas.map(area => 
        area.id === areaId ? { ...area, name: newName } : area
      )
    }));
  };

  const addArea = () => {
    setInspectionData(prev => ({
      ...prev,
      areas: [...prev.areas, { 
        id: Date.now(), 
        name: `Area ${prev.areas.length + 1}`, 
        items: [] 
      }]
    }));
  };

  const removeArea = (areaId: number) => {
    if (inspectionData.areas.length > 1) {
      setInspectionData(prev => ({
        ...prev,
        areas: prev.areas.filter(area => area.id !== areaId)
      }));
    }
  };

  const addItemToArea = (areaId: number, category: string, point: string) => {
    setInspectionData(prev => ({
      ...prev,
      areas: prev.areas.map(area => {
        if (area.id === areaId) {
          const newItem: InspectionItem = {
            id: Date.now(),
            category,
            point,
            status: 'Snags',
            comments: '',
            location: '',
            photos: []
          };
          return { ...area, items: [...area.items, newItem] };
        }
        return area;
      })
    }));
  };

  const handleItemChange = (areaId: number, itemId: number, field: keyof InspectionItem, value: any) => {
    setInspectionData(prev => ({
      ...prev,
      areas: prev.areas.map(area => {
        if (area.id === areaId) {
          return {
            ...area,
            items: area.items.map(item => 
              item.id === itemId ? { ...item, [field]: value } : item
            )
          };
        }
        return area;
      })
    }));
  };

  const handlePhotoUpload = async (areaId: number, itemId: number, file: File) => {
    setIsUploadingPhoto(true);
    const photoURL = await SupabaseService.uploadPhoto(file);
    
    if (photoURL) {
      setInspectionData(prev => ({
        ...prev,
        areas: prev.areas.map(area => {
          if (area.id === areaId) {
            return {
              ...area,
              items: area.items.map(item => 
                item.id === itemId 
                  ? { ...item, photos: [...item.photos, photoURL] } 
                  : item
              )
            };
          }
          return area;
        })
      }));
      toast({
        title: "Photo uploaded",
        description: "Photo has been added to the inspection point",
      });
    } else {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
    setIsUploadingPhoto(false);
  };

  const removeItem = (areaId: number, itemId: number) => {
    setInspectionData(prev => ({
      ...prev,
      areas: prev.areas.map(area => {
        if (area.id === areaId) {
          return {
            ...area,
            items: area.items.filter(item => item.id !== itemId)
          };
        }
        return area;
      })
    }));
  };

  const handleSave = async () => {
    if (!inspectionData.propertyLocation || !inspectionData.inspectorName) {
      toast({
        title: "Error",
        description: "Please fill in Property Location and Inspector Name",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    await onSave(inspectionData);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
        >
          <BackIcon />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold text-card-foreground mb-8">
          {editInspection ? 'Edit Property Inspection' : 'New Property Inspection'}
        </h2>

        {/* Basic Information */}
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-semibold text-card-foreground border-b border-border pb-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Client Name"
              name="clientName"
              value={inspectionData.clientName}
              onChange={handleHeaderChange}
            />
            <InputField
              label="Property Location/Number"
              name="propertyLocation"
              value={inspectionData.propertyLocation}
              onChange={handleHeaderChange}
              required
            />
            <InputField
              label="Inspector Name"
              name="inspectorName"
              value={inspectionData.inspectorName}
              onChange={handleHeaderChange}
              required
            />
            <InputField
              label="Inspection Date"
              name="inspectionDate"
              type="date"
              value={inspectionData.inspectionDate}
              onChange={handleHeaderChange}
            />
            <SelectField
              label="Property Type"
              name="propertyType"
              value={inspectionData.propertyType}
              onChange={handleHeaderChange}
              options={['Apartment', 'Villa', 'Building', 'Other']}
            />
          </div>
        </div>

        {/* Areas Management */}
        <div className="space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Inspection Areas
            </h3>
            <button
              onClick={addArea}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon />
              Add Area
            </button>
          </div>

          <div className="grid gap-3">
            {inspectionData.areas.map(area => (
              <div key={area.id} className="flex gap-3">
                <input
                  type="text"
                  value={area.name}
                  onChange={(e) => handleAreaNameChange(area.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Area name"
                />
                {inspectionData.areas.length > 1 && (
                  <button
                    onClick={() => removeArea(area.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Inspection Points */}
        <div className="space-y-6">
          {inspectionData.areas.map(area => (
            <InspectionArea
              key={area.id}
              area={area}
              onItemChange={handleItemChange}
              onPhotoUpload={handlePhotoUpload}
              onAddItem={addItemToArea}
              onRemoveItem={removeItem}
              isUploadingPhoto={isUploadingPhoto}
            />
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-border flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-success text-success-foreground px-8 py-3 rounded-lg font-medium hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
          >
            {isSaving && <LoadingSpinner />}
            {isSaving ? 'Saving...' : (editInspection ? 'Update Inspection' : 'Save Inspection')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Inspection Area Component
function InspectionArea({
  area,
  onItemChange,
  onPhotoUpload,
  onAddItem,
  onRemoveItem,
  isUploadingPhoto
}: {
  area: InspectionArea;
  onItemChange: (areaId: number, itemId: number, field: keyof InspectionItem, value: any) => void;
  onPhotoUpload: (areaId: number, itemId: number, file: File) => void;
  onAddItem: (areaId: number, category: string, point: string) => void;
  onRemoveItem: (areaId: number, itemId: number) => void;
  isUploadingPhoto: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(inspectionCategories)[0]);

  const handleAddItem = (point: string) => {
    onAddItem(area.id, selectedCategory, point);
    setShowAddItem(false);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-secondary/50 p-4 text-left font-semibold text-lg flex justify-between items-center hover:bg-secondary/70 transition-colors"
      >
        <span className="text-card-foreground">
          Area: <span className="text-primary">{area.name}</span>
        </span>
        <ChevronDownIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <div className="p-4 md:p-6">
          <div className="space-y-6">
            {area.items.map(item => (
              <InspectionPoint
                key={item.id}
                areaId={area.id}
                item={item}
                onChange={onItemChange}
                onPhotoUpload={onPhotoUpload}
                onRemove={onRemoveItem}
                isUploadingPhoto={isUploadingPhoto}
              />
            ))}
            
            {area.items.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No inspection points added to this area yet.
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            {showAddItem ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-card-foreground">Add New Inspection Point</h4>
                <SelectField
                  label="Category"
                  name="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={Object.keys(inspectionCategories)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {inspectionCategories[selectedCategory as keyof typeof inspectionCategories].map(point => (
                    <button
                      key={point}
                      onClick={() => handleAddItem(point)}
                      className="text-left p-3 bg-background hover:bg-accent border border-border rounded-lg text-sm transition-colors"
                    >
                      {point}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddItem(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <PlusIcon />
                Add Inspection Point
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Inspection Point Component
function InspectionPoint({
  areaId,
  item,
  onChange,
  onPhotoUpload,
  onRemove,
  isUploadingPhoto
}: {
  areaId: number;
  item: InspectionItem;
  onChange: (areaId: number, itemId: number, field: keyof InspectionItem, value: any) => void;
  onPhotoUpload: (areaId: number, itemId: number, file: File) => void;
  onRemove: (areaId: number, itemId: number) => void;
  isUploadingPhoto: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
        <div className="lg:w-1/3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-card-foreground">{item.category}</p>
              <p className="text-sm text-muted-foreground">{item.point}</p>
            </div>
            <button
              onClick={() => onRemove(areaId, item.id)}
              className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <StatusButton
              currentStatus={item.status}
              newStatus="Pass"
              onClick={() => onChange(areaId, item.id, 'status', 'Pass')}
            />
            <StatusButton
              currentStatus={item.status}
              newStatus="Fail"
              onClick={() => onChange(areaId, item.id, 'status', 'Fail')}
            />
            <StatusButton
              currentStatus={item.status}
              newStatus="Snags"
              onClick={() => onChange(areaId, item.id, 'status', 'Snags')}
            />
          </div>
        </div>

        <div className="lg:w-2/3 space-y-3">
          <InputField
            label="Comments"
            value={item.comments}
            onChange={(e) => onChange(areaId, item.id, 'comments', e.target.value)}
            placeholder="Add comments about this inspection point"
          />
          
          <InputField
            label="Specific Location"
            value={item.location}
            onChange={(e) => onChange(areaId, item.id, 'location', e.target.value)}
            placeholder="Specific location (optional)"
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Photos</label>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              {isUploadingPhoto ? <LoadingSpinner /> : <CameraIcon />}
              {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPhotoUpload(areaId, item.id, file);
              }}
              className="hidden"
            />
            
            {item.photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.photos.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-border shadow-sm cursor-pointer hover:opacity-80"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inspection View Component with PDF Export
function InspectionView({
  inspection,
  navigateTo
}: {
  inspection: SavedInspection;
  navigateTo: (page: string) => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to print the report');
        return;
      }

      const printContent = printRef.current.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Inspection Report - ${inspection.propertyLocation}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 20mm;
              }
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .no-print {
                display: none !important;
              }
              .page-break {
                page-break-before: always;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              .status-pass { color: #22c55e; font-weight: bold; }
              .status-fail { color: #ef4444; font-weight: bold; }
              .status-snags { color: #6b7280; font-weight: bold; }
              h1, h2, h3 { color: #1a1a1a; }
              img {
                max-width: 100%;
                height: auto;
                page-break-inside: avoid;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .footer {
                margin-top: 50px;
                padding-top: 30px;
                border-top: 2px solid #333;
              }
              .signature-box {
                border-bottom: 2px solid #999;
                height: 60px;
                margin-top: 10px;
              }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <button 
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
        >
          <BackIcon />
          Back to Dashboard
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigateTo('editInspection', inspection.id)}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/80 transition-colors font-medium"
          >
            <EditIcon className="w-4 h-4" />
            Edit Report
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors font-medium"
          >
            <PrintIcon />
            Print/Export PDF
          </button>
        </div>
      </div>

      <div ref={printRef} className="bg-card border border-border rounded-xl p-8 shadow-sm">
        <header className="header text-center border-b-2 border-primary pb-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-card-foreground">
            Property Inspection Report
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Official Document</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base mb-8">
          <div><strong>Client:</strong> {inspection.clientName || 'N/A'}</div>
          <div><strong>Property:</strong> {inspection.propertyLocation}</div>
          <div><strong>Inspector:</strong> {inspection.inspectorName}</div>
          <div><strong>Date:</strong> {new Date(inspection.inspectionDate).toLocaleDateString()}</div>
          <div className="md:col-span-2"><strong>Property Type:</strong> {inspection.propertyType}</div>
        </section>

        <main className="space-y-8">
          {inspection.areas.map((area, areaIndex) => (
            <div key={area.id} className={areaIndex > 0 ? 'page-break' : ''}>
              <h2 className="text-xl font-bold bg-secondary/20 p-3 rounded-t-lg border-b-2 border-primary text-card-foreground">
                Area: {area.name}
              </h2>
              {area.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/10">
                        <th className="border border-border p-3 text-left w-2/5">Inspection Point</th>
                        <th className="border border-border p-3 text-center w-1/5">Status</th>
                        <th className="border border-border p-3 text-left w-2/5">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {area.items.map(item => (
                        <React.Fragment key={item.id}>
                          <tr className="border-b border-border">
                            <td className="border border-border p-3">
                              <strong>{item.category}</strong><br />
                              {item.point}
                            </td>
                            <td className={cn(
                              "border border-border p-3 text-center font-bold",
                              item.status === 'Pass' && "status-pass text-success",
                              item.status === 'Fail' && "status-fail text-destructive",
                              item.status === 'Snags' && "status-snags text-muted-foreground"
                            )}>
                              {item.status}
                            </td>
                            <td className="border border-border p-3">
                              {item.comments && <p><strong>Comments:</strong> {item.comments}</p>}
                              {item.location && <p><strong>Location:</strong> {item.location}</p>}
                              {item.photos.length > 0 && (
                                <p><strong>Photos:</strong> {item.photos.length} attached</p>
                              )}
                            </td>
                          </tr>
                          {item.photos.length > 0 && (
                            <tr className="border-b border-border">
                              <td colSpan={3} className="border border-border p-3">
                                <div className="space-y-2">
                                  <p className="font-semibold">Photos:</p>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {item.photos.map((photo, idx) => (
                                      <img
                                        key={idx}
                                        src={photo}
                                        alt={`${item.point} - Photo ${idx + 1}`}
                                        className="w-full h-40 object-cover rounded border border-border"
                                      />
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-4 border border-t-0 border-border rounded-b-lg text-muted-foreground">
                  No inspection points recorded for this area.
                </p>
              )}
            </div>
          ))}
        </main>

        <footer className="footer mt-12 pt-8 border-t-2 border-primary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="font-bold mb-4">Inspector Signature:</p>
              <div className="signature-box border-b-2 border-muted h-16"></div>
            </div>
            <div>
              <p className="font-bold mb-4">Client Signature:</p>
              <div className="signature-box border-b-2 border-muted h-16"></div>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-muted-foreground">
            Generated on {new Date().toLocaleDateString()} • InspectCraft
          </div>
        </footer>
      </div>
    </div>
  );
}

// Form Components
function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = ''
}: {
  label?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        required={required}
        className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options
}: {
  label: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function StatusButton({
  currentStatus,
  newStatus,
  onClick
}: {
  currentStatus: string;
  newStatus: string;
  onClick: () => void;
}) {
  const isSelected = currentStatus === newStatus;
  
  const getStatusStyles = () => {
    if (newStatus === 'Pass') {
      return isSelected 
        ? 'bg-success text-success-foreground border-success' 
        : 'bg-background text-success border-success hover:bg-success/10';
    }
    if (newStatus === 'Fail') {
      return isSelected 
        ? 'bg-destructive text-destructive-foreground border-destructive' 
        : 'bg-background text-destructive border-destructive hover:bg-destructive/10';
    }
    // Snags status
    return isSelected 
      ? 'bg-muted text-muted-foreground border-muted' 
      : 'bg-background text-muted-foreground border-muted hover:bg-muted/10';
  };

  const getIcon = () => {
    if (newStatus === 'Pass') return '✓';
    if (newStatus === 'Fail') return '✗';
    return '⚠';  // Warning icon for Snags
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
        getStatusStyles()
      )}
    >
      <span className="font-bold">{getIcon()}</span>
      <span>{newStatus}</span>
    </button>
  );
}