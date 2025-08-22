import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { StorageService } from '@/services/storage-service';
import type { SavedInspection } from '@/services/storage-service';
import { PhotoDisplay } from './PhotoDisplay';
import { StorageStatus } from './StorageStatus';
import { ProfessionalReport } from './ProfessionalReport';
import { BilingualDisclaimer } from './BilingualDisclaimer';
import { ThemeToggle } from './ThemeToggle';
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

const InspectionsIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PassIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FailIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SnagsIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const HamburgerIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DashboardIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 15v4" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v8" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7v12" />
  </svg>
);

const ScheduleIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BillingIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
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

// Report Scheduled Page Component  
function ReportScheduled({ navigateTo }: { navigateTo: (page: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Report Scheduled</h2>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-lg">
        <div className="text-center py-12">
          <ScheduleIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Schedule Management</h3>
          <p className="text-gray-600 mb-6">
            Plan and schedule future inspections, manage appointments, and track upcoming work.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md bg-white shadow-sm">
              <CalendarIcon className="w-8 h-8 mb-2 text-primary" />
              <h4 className="font-semibold mb-1 text-gray-800">Calendar View</h4>
              <p className="text-sm text-gray-500">View scheduled inspections in calendar format</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md bg-white shadow-sm">
              <ScheduleIcon className="w-8 h-8 mb-2 text-primary" />
              <h4 className="font-semibold mb-1 text-gray-800">Schedule Planning</h4>
              <p className="text-sm text-gray-500">Plan and organize upcoming inspection visits</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md bg-white shadow-sm">
              <InspectionsIcon className="w-8 h-8 mb-2 text-primary" />
              <h4 className="font-semibold mb-1 text-gray-800">Appointment Management</h4>
              <p className="text-sm text-gray-500">Manage client appointments and availability</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            🚧 This feature is under development and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}

// Billing Page Component
function Billing({ navigateTo }: { navigateTo: (page: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Billing & Invoices</h2>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-lg">
        <div className="text-center py-12">
          <BillingIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Financial Management</h3>
          <p className="text-gray-600 mb-6">
            Generate invoices, track payments, and manage your inspection business finances.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md bg-white shadow-sm">
              <BillingIcon className="w-8 h-8 mb-2 text-primary" />
              <h4 className="font-semibold mb-1 text-gray-800">Invoice Generation</h4>
              <p className="text-sm text-gray-500">Create professional invoices from inspection reports</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md bg-white shadow-sm">
              <CalendarIcon className="w-8 h-8 mb-2 text-primary" />
              <h4 className="font-semibold mb-1 text-gray-800">Payment Tracking</h4>
              <p className="text-sm text-gray-500">Monitor payment status and outstanding balances</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md bg-white shadow-sm">
              <DashboardIcon className="w-8 h-8 mb-2 text-primary" />
              <h4 className="font-semibold mb-1 text-gray-800">Financial Reports</h4>
              <p className="text-sm text-gray-500">View revenue reports and business analytics</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            🚧 This feature is under development and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({ 
  currentPage, 
  navigateTo, 
  isOpen, 
  onClose 
}: { 
  currentPage: string; 
  navigateTo: (page: string) => void; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <DashboardIcon />, 
      description: 'Overview & KPIs',
      badge: null
    },
    { 
      id: 'reportScheduled', 
      label: 'Report Scheduled', 
      icon: <ScheduleIcon />, 
      description: 'Planning & Scheduling',
      badge: 'Coming Soon'
    },
    { 
      id: 'billing', 
      label: 'Billing', 
      icon: <BillingIcon />, 
      description: 'Invoices & Payments',
      badge: 'Coming Soon'
    },
  ];

  const handleNavigation = (pageId: string) => {
    navigateTo(pageId);
    onClose(); // Close mobile sidebar after navigation
  };

  return (
    <>
      {/* Mobile Overlay - Enhanced with better backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar - Enhanced with solid background and better contrast */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-72 bg-sidebar z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
        "border-r border-sidebar-border shadow-2xl lg:shadow-lg",
        "supports-[backdrop-filter]:bg-sidebar/95 supports-[backdrop-filter]:backdrop-blur-xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full bg-sidebar">
          {/* Sidebar Header - Enhanced with better spacing and contrast */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border bg-sidebar-accent/30">
            <div className="flex items-center gap-3">
              <Logo size="small" />
              <div className="hidden sm:block">
                <h2 className="text-sm font-semibold text-sidebar-foreground">InspectCraft</h2>
                <p className="text-xs text-sidebar-foreground/70">Property Solutions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
              aria-label="Close navigation menu"
            >
              <CloseIcon className="w-5 h-5 text-sidebar-foreground" />
            </button>
          </div>
          
          {/* Navigation Menu - Enhanced with better spacing and accessibility */}
          <nav className="flex-1 p-4 overflow-y-auto" role="navigation" aria-label="Main navigation">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-200 group relative",
                    "focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2 focus:ring-offset-sidebar",
                    "hover:transform hover:scale-[1.02] active:scale-[0.98]",
                    currentPage === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25 border border-sidebar-primary/20"
                      : "hover:bg-sidebar-accent hover:shadow-md text-sidebar-foreground hover:text-sidebar-accent-foreground border border-transparent hover:border-sidebar-border"
                  )}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                >
                  {/* Active indicator */}
                  {currentPage === item.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary-foreground rounded-r-full" />
                  )}
                  
                  <div className="flex-shrink-0">
                    {React.cloneElement(item.icon as React.ReactElement, {
                      className: cn(
                        "w-6 h-6 transition-colors",
                        currentPage === item.id 
                          ? "text-sidebar-primary-foreground" 
                          : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
                      )
                    })}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          currentPage === item.id
                            ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                            : "bg-sidebar-accent text-sidebar-foreground"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className={cn(
                      "text-xs truncate transition-colors mt-0.5",
                      currentPage === item.id 
                        ? "text-sidebar-primary-foreground/80" 
                        : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground/80"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Quick Actions Section */}
            <div className="mt-8 pt-6 border-t border-sidebar-border">
              <h3 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-3 px-2">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigation('newInspection')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group hover:bg-sidebar-accent hover:shadow-sm text-sidebar-foreground hover:text-sidebar-accent-foreground border border-dashed border-sidebar-border hover:border-sidebar-primary"
                >
                  <PlusIcon className="w-5 h-5 text-sidebar-foreground group-hover:text-sidebar-primary" />
                  <span className="text-sm font-medium">New Inspection</span>
                </button>
              </div>
            </div>
          </nav>
          
          {/* Sidebar Footer - Enhanced with better styling */}
          <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/20">
            <div className="text-center">
              <div className="text-xs text-sidebar-foreground/60 bg-sidebar-accent py-3 px-4 rounded-lg border border-sidebar-border">
                <div className="font-medium text-sidebar-foreground">Solution Property</div>
                <div className="text-sidebar-foreground/50">v1.0.0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Main App Component
export default function InspectionApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [inspections, setInspections] = useState<SavedInspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; inspectionId: string | null; inspectionName: string }>({ show: false, inspectionId: null, inspectionName: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Load inspections from Supabase
  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    setIsLoading(true);
    try {
      const data = await StorageService.getInspections();
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

  const saveInspection = async (inspection: InspectionData, isEditing: boolean = false, editId?: string) => {
    try {
      console.log('Attempting to save inspection:', inspection);
      let savedInspection;
      
      if (isEditing && editId) {
        console.log('Updating existing inspection:', editId);
        savedInspection = await StorageService.updateInspection(editId, inspection);
      } else {
        console.log('Creating new inspection');
        savedInspection = await StorageService.saveInspection(inspection);
      }
      
      if (savedInspection) {
        await loadInspections();
        toast({
          title: "Success",
          description: isEditing ? "Inspection updated successfully!" : "Inspection saved successfully!",
        });
        navigateTo('dashboard');
      } else {
        console.error('Failed to save inspection - no data returned');
        toast({
          title: "Error",
          description: "Failed to save inspection. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in saveInspection:', error);
      toast({
        title: "Error",
        description: `Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirmation = (inspectionId: string, inspectionName: string) => {
    setDeleteConfirmation({ show: true, inspectionId, inspectionName });
  };

  const deleteInspection = async () => {
    if (!deleteConfirmation.inspectionId) return;
    
    const success = await StorageService.deleteInspection(deleteConfirmation.inspectionId);
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
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          navigateTo={navigateTo}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
            sidebarOpen={sidebarOpen}
          />
          
          <main className="flex-1 overflow-auto bg-background shadow-inner">
            <div className="container mx-auto px-6 py-8 max-w-7xl">
              {currentPage === 'dashboard' && (
                <Dashboard 
                  navigateTo={navigateTo} 
                  inspections={inspections} 
                  isLoading={isLoading}
                  onDeleteConfirmation={handleDeleteConfirmation}
                />
              )}
              {currentPage === 'reportScheduled' && (
                <ReportScheduled navigateTo={navigateTo} />
              )}
              {currentPage === 'billing' && (
                <Billing navigateTo={navigateTo} />
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
                  onSave={(data) => saveInspection(data, true, selectedInspectionId)}
                  editInspection={inspections.find(i => i.id === selectedInspectionId)}
                />
              )}
              {currentPage === 'viewInspection' && selectedInspectionId && (
                <InspectionView 
                  inspection={inspections.find(i => i.id === selectedInspectionId)!}
                  navigateTo={navigateTo} 
                />
              )}
              {currentPage === 'professionalReport' && selectedInspectionId && (
                <ProfessionalReport 
                  inspection={inspections.find(i => i.id === selectedInspectionId)!}
                  onBack={() => navigateTo('dashboard')} 
                />
              )}
            </div>
          </main>
        </div>
      </div>
      
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

// Header Component - Enhanced with better integration and theme support
function Header({ 
  onMenuClick, 
  sidebarOpen 
}: { 
  onMenuClick: () => void; 
  sidebarOpen: boolean; 
}) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/90 border-b border-border shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Mobile Menu Button & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className={cn(
              "lg:hidden p-2 hover:bg-accent rounded-lg transition-all duration-200 hover:scale-105",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              sidebarOpen && "bg-accent"
            )}
            aria-label="Toggle navigation menu"
            aria-expanded={sidebarOpen}
          >
            <HamburgerIcon className="w-6 h-6 text-foreground" />
          </button>
          <div className="lg:hidden">
            <Logo size="small" />
          </div>
        </div>
        
        {/* Desktop Title & Breadcrumb */}
        <div className="hidden lg:flex items-center gap-4 flex-1 justify-center">
          <div className="text-center">
            <h1 className="text-sm font-semibold text-foreground">Professional Property Inspection Solutions</h1>
            <p className="text-xs text-muted-foreground">Comprehensive inspection management platform</p>
          </div>
        </div>
        
        {/* Header Actions - Enhanced with theme toggle and better styling */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-primary/20">
            <span className="text-sm font-bold text-primary-foreground">SP</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// KPI Card Component
function KPICard({ 
  title, 
  value, 
  icon, 
  color, 
  description 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color: string; 
  description: string; 
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className={cn("p-4 rounded-xl shadow-lg", color)}>
          {icon}
        </div>
      </div>
    </div>
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
  // Calculate KPI statistics
  const totalInspections = inspections.length;
  
  // Calculate status statistics
  const statusStats = inspections.reduce((acc, inspection) => {
    inspection.areas.forEach(area => {
      area.items.forEach(item => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        acc.total = (acc.total || 0) + 1;
      });
    });
    return acc;
  }, {} as Record<string, number>);

  const passCount = statusStats['Pass'] || 0;
  const failCount = statusStats['Fail'] || 0;
  const snagsCount = statusStats['Snags'] || 0;
  const totalItems = statusStats.total || 0;

  // Calculate recent inspections (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentInspections = inspections.filter(inspection => 
    new Date(inspection.inspectionDate) >= thirtyDaysAgo
  ).length;

  // Calculate pass rate
  const passRate = totalItems > 0 ? Math.round((passCount / totalItems) * 100) : 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage your property inspections</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigateTo('newInspection')}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md w-full sm:w-auto justify-center text-sm sm:text-base"
          >
            <PlusIcon />
            New Inspection
          </button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Inspections"
          value={totalInspections}
          icon={<InspectionsIcon className="text-white" />}
          color="bg-primary text-primary-foreground"
          description="All completed inspections"
        />
        <KPICard
          title="Recent Inspections"
          value={recentInspections}
          icon={<CalendarIcon className="text-white" />}
          color="bg-blue-500 text-white"
          description="Last 30 days"
        />
        <KPICard
          title="Pass Rate"
          value={`${passRate}%`}
          icon={<PassIcon className="text-white" />}
          color="bg-success text-success-foreground"
          description="Overall success rate"
        />
        <KPICard
          title="Issues Found"
          value={failCount + snagsCount}
          icon={<SnagsIcon className="text-white" />}
          color="bg-orange-500 text-white"
          description="Fails + Snags combined"
        />
      </div>

      {/* Status Breakdown Cards */}
      {totalItems > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KPICard
            title="Pass Items"
            value={passCount}
            icon={<PassIcon className="text-white" />}
            color="bg-success text-success-foreground"
            description={`${Math.round((passCount / totalItems) * 100)}% of all items`}
          />
          <KPICard
            title="Failed Items"
            value={failCount}
            icon={<FailIcon className="text-white" />}
            color="bg-destructive text-destructive-foreground"
            description={`${Math.round((failCount / totalItems) * 100)}% of all items`}
          />
          <KPICard
            title="Snag Items"
            value={snagsCount}
            icon={<SnagsIcon className="text-white" />}
            color="bg-gray-500 text-white"
            description={`${Math.round((snagsCount / totalItems) * 100)}% of all items`}
          />
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-foreground mb-6">Recent Inspections</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner className="text-primary" />
          </div>
        ) : inspections.length > 0 ? (
          <div className="grid gap-4">
            {inspections.map((inspection) => (
              <div 
                key={inspection.id} 
                className="border border-border rounded-lg p-4 hover:bg-accent transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-lg">
                      {inspection.propertyLocation}
                    </h4>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <p>Type: {inspection.propertyType} • Inspector: {inspection.inspectorName}</p>
                      <p>Date: {new Date(inspection.inspectionDate).toLocaleDateString()}</p>
                      {inspection.clientName && <p>Client: {inspection.clientName}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button 
                      onClick={() => navigateTo('editInspection', inspection.id)}
                      className="bg-accent text-accent-foreground px-3 py-2 rounded-md hover:bg-accent/80 transition-colors font-medium flex items-center gap-2 text-sm justify-center sm:justify-start"
                    >
                      <EditIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => navigateTo('viewInspection', inspection.id)}
                      className="bg-secondary text-secondary-foreground px-3 py-2 rounded-md hover:bg-secondary/80 transition-colors font-medium text-sm justify-center sm:justify-start"
                    >
                      View Report
                    </button>
                    <button 
                      onClick={() => navigateTo('professionalReport', inspection.id)}
                      className="bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 text-sm justify-center sm:justify-start"
                    >
                      <PrintIcon className="w-4 h-4" />
                      Print Report
                    </button>
                    <button 
                      onClick={() => onDeleteConfirmation(inspection.id, inspection.propertyLocation)}
                      className="bg-destructive text-destructive-foreground px-3 py-2 rounded-md hover:bg-destructive/90 transition-colors font-medium flex items-center gap-2 text-sm justify-center sm:justify-start"
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
    try {
      console.log('Uploading photo:', { areaId, itemId, fileName: file.name, fileSize: file.size, fileType: file.type });
      const photoURL = await StorageService.uploadPhoto(file);
      
      if (photoURL) {
        console.log('Photo uploaded successfully:', photoURL);
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
        console.error('Photo upload failed - no URL returned');
        toast({
          title: "Upload failed",
          description: "Failed to upload photo. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in handlePhotoUpload:', error);
      toast({
        title: "Error",
        description: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
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
      <div className="flex items-center justify-between gap-4">
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
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-card-foreground border-b border-border pb-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
                {item.photos.map((photoId, index) => (
                  <PhotoDisplay
                    key={index}
                    photoId={photoId}
                    alt={`Photo ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-border shadow-sm cursor-pointer hover:opacity-80"
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

  // Function to calculate property grade based on inspection results
  const calculatePropertyGrade = (inspection: SavedInspection): string => {
    let totalItems = 0;
    let passCount = 0;
    let failCount = 0;
    let snagsCount = 0;

    inspection.areas.forEach(area => {
      area.items.forEach(item => {
        totalItems++;
        switch (item.status) {
          case 'Pass':
            passCount++;
            break;
          case 'Fail':
            failCount++;
            break;
          case 'Snags':
            snagsCount++;
            break;
        }
      });
    });

    if (totalItems === 0) return 'C';

    const passPercentage = (passCount / totalItems) * 100;
    const failPercentage = (failCount / totalItems) * 100;

    // Grading logic
    if (passPercentage >= 95 && failPercentage === 0) return 'AAA';
    if (passPercentage >= 90 && failPercentage <= 2) return 'AA';
    if (passPercentage >= 80 && failPercentage <= 5) return 'A';
    if (passPercentage >= 70 && failPercentage <= 10) return 'B';
    if (passPercentage >= 60 && failPercentage <= 15) return 'C';
    return 'D';
  };

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
          <title>Solution Property - Inspection Report - ${inspection.propertyLocation}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm 18mm 20mm 18mm;
            }
            
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              line-height: 1.3;
              color: #333;
              font-size: 9pt;
              margin: 0 !important;
              padding: 15mm !important;
              position: relative;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
              box-sizing: border-box;
              background: white;
            }
            
            .report-container {
              margin: 0 auto !important;
              padding: 0 !important;
              box-sizing: border-box;
              background: white;
              width: 100% !important;
              max-width: 180mm !important;
            }
            
            /* Watermark that appears on every page */
            body::before {
              content: '';
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 400px;
              height: 400px;
              background-image: url('/logo.jpeg');
              background-repeat: no-repeat;
              background-position: center;
              background-size: contain;
              opacity: 0.05;
              z-index: -1;
              pointer-events: none;
            }
            
            .report-container {
              position: relative;
              z-index: 1;
              background: white;
            }
            
            .no-print {
              display: none !important;
            }
            
            .page-break {
              page-break-before: always;
              padding-top: 20px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 10pt;
            }
            
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            
            th {
              background-color: #f2f2f2 !important;
              font-weight: bold;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .status-pass { color: #22c55e !important; font-weight: bold; }
            .status-fail { color: #ef4444 !important; font-weight: bold; }
            .status-snags { color: #6b7280 !important; font-weight: bold; }
            
            h1 { font-size: 24pt; color: #1a1a1a; margin: 10px 0; }
            h2 { font-size: 20pt; color: #1a1a1a; margin: 8px 0; }
            h3 { font-size: 14pt; color: #1a1a1a; margin: 8px 0; }
            
            /* Photo sizing - much smaller for print */
            img.photo-item {
              width: 120px !important;
              height: 90px !important;
              object-fit: cover;
              page-break-inside: avoid;
              border-radius: 4px;
              border: 1px solid #ddd;
              margin: 4px;
              display: inline-block;
            }
            
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
              margin-bottom: 20px;
              position: relative;
              padding-top: 15px;
              page-break-after: avoid;
            }
            
            .watermark-logo {
              position: absolute;
              top: 5px;
              left: 50%;
              transform: translateX(-50%);
              z-index: 0;
            }
            
            .watermark-logo img {
              width: 80px !important;
              height: 80px !important;
              object-fit: contain;
              opacity: 0.2;
            }
            
            .header-content {
              position: relative;
              z-index: 1;
              padding-top: 60px;
            }
            
            .introduction-section {
              margin-bottom: 20px;
              padding: 15px;
              background-color: #EBF8FF !important;
              border: 1px solid #90CDF4;
              border-radius: 6px;
              page-break-inside: avoid;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .introduction-section h3 {
              font-weight: bold;
              font-size: 12pt;
              margin-bottom: 10px;
              text-align: center;
              color: #1E40AF !important;
            }
            
            .introduction-section div {
              font-size: 10pt;
              color: #374151;
            }
            
            .introduction-section p {
              margin-bottom: 8px;
              line-height: 1.4;
            }
            
            .property-details {
              font-size: 10pt;
              margin-bottom: 20px;
            }
            
            .disclaimer-section {
              margin-top: 30px;
              margin-bottom: 20px;
              padding: 15px;
              background-color: #F3F4F6 !important;
              border: 1px solid #E5E7EB;
              border-radius: 6px;
              page-break-inside: avoid;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .disclaimer-section h3 {
              font-weight: bold;
              font-size: 12pt;
              margin-bottom: 10px;
              text-align: center;
            }
            
            .disclaimer-section div {
              font-size: 9pt;
              color: #374151;
            }
            
            .disclaimer-section p {
              margin-bottom: 6px;
              line-height: 1.3;
            }
            
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #333;
              page-break-inside: avoid;
            }
            
            .signature-box {
              border-bottom: 2px solid #999;
              height: 50px;
              margin-top: 8px;
            }
            
            .signature-section {
              display: table;
              width: 100%;
              table-layout: fixed;
            }
            
            .signature-column {
              display: table-cell;
              width: 45%;
              padding-right: 5%;
            }
            
            .photo-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 8px;
            }
            
            @media print {
              body {
                margin: 0 !important;
                padding: 5mm !important;
                box-sizing: border-box;
              }
              
              .report-wrapper {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
              }
              
              .report-container {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box;
                width: 100% !important;
              }
              
              /* Prevent content cutoff */
              * {
                overflow: visible !important;
                word-wrap: break-word !important;
              }
              
              table {
                width: 100% !important;
                table-layout: auto !important;
              }
              
              /* Professional section spacing */
              .header {
                margin-bottom: 10mm !important;
                page-break-after: avoid;
              }
              
              .bilingual-disclaimer-section {
                margin-bottom: 10mm !important;
              }
              
              .property-details {
                margin-bottom: 8mm !important;
                page-break-inside: avoid;
              }
              
              .area-section {
                margin-bottom: 8mm !important;
              }
              
              .footer {
                margin-top: 10mm !important;
                page-break-inside: avoid;
              }
              
              /* Text spacing improvements */
              p {
                margin-bottom: 3mm;
                text-align: justify;
              }
              
              /* Table improvements */
              table {
                margin: 6mm 0 !important;
              }
              
              th, td {
                padding: 3mm !important;
              }
              
              /* Prevent orphaned content */
              h1, h2, h3, h4 {
                page-break-after: avoid;
                margin-bottom: 4mm;
                margin-top: 6mm;
              }
              
              /* Arabic text improvements */
              [dir="rtl"] {
                text-align: right;
                font-family: 'Arial Unicode MS', 'Tahoma', 'Arial', sans-serif;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.onafterprint = () => window.close();">
          <div class="print-wrapper" style="margin: 0; padding: 0;">
            ${printContent}
          </div>
          <style>
            /* CRITICAL: Additional print margin enforcement */
            @media print {
              html {
                margin: 0 !important;
                padding: 0 !important;
              }
              
              body {
                margin: 0 !important;
                padding: 15mm !important;
                width: auto !important;
                min-height: auto !important;
                box-sizing: border-box !important;
                background: white !important;
              }
              
              .print-wrapper {
                margin: 0 auto !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: 180mm !important;
                box-sizing: border-box !important;
              }
              
              @page {
                size: A4 !important;
                margin: 20mm 18mm !important;
              }
              
              /* CRITICAL: Force safe positioning */
              * {
                max-width: 100% !important;
                box-sizing: border-box !important;
                overflow: visible !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
              }
              
              /* Ensure all content is within safe area */
              .report-container {
                margin: 0 auto !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: 180mm !important;
              }
              
              table {
                width: 100% !important;
                table-layout: fixed !important;
                border-collapse: collapse !important;
                margin: 0 !important;
              }
              
              td, th {
                word-wrap: break-word !important;
                overflow: visible !important;
                font-size: 8pt !important;
                padding: 2mm !important;
                margin: 0 !important;
              }
              
              /* Fix bilingual content */
              .bilingual-disclaimer-section td:first-child,
              .bilingual-disclaimer-section th:first-child {
                width: 48% !important;
                text-align: left !important;
              }
              
              .bilingual-disclaimer-section td:last-child,
              .bilingual-disclaimer-section th:last-child {
                width: 48% !important;
                text-align: right !important;
                direction: rtl !important;
              }
            }
          </style>
        </body>
        </html>
      `);
      
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm sm:text-base"
          >
            <BackIcon />
            Back to Dashboard
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigateTo('editInspection')}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-3 sm:px-4 py-2 rounded-lg hover:bg-accent/80 transition-colors font-medium text-sm sm:text-base justify-center"
          >
            <EditIcon className="w-4 h-4" />
            Edit Report
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 sm:px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors font-medium text-sm sm:text-base justify-center"
          >
            <PrintIcon />
            Print/Export PDF
          </button>
        </div>
      </div>

      <div ref={printRef} className="report-container bg-card border border-border rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
        <header className="header text-center border-b-2 border-primary pb-6 mb-8">
          <div className="watermark-logo">
            <img 
              src="/logo.jpeg" 
              alt="Company Logo Watermark" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <div className="header-content">
            <h1 className="text-3xl md:text-4xl font-bold text-card-foreground">
              Solution Property
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-card-foreground mt-2">
              Property Inspection Report
            </h2>
            <p className="text-lg text-muted-foreground mt-2">Official Document</p>
          </div>
        </header>

        <BilingualDisclaimer
          clientName={inspection.clientName || 'Valued Client'}
          propertyLocation={inspection.propertyLocation}
          inspectionDate={inspection.inspectionDate}
          inspectorName={inspection.inspectorName}
          propertyGrade={calculatePropertyGrade(inspection)}
        />

        <section className="property-details grid grid-cols-1 md:grid-cols-2 gap-6 text-base mb-8">
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
                                  <div className="photo-grid">
                                    {item.photos.map((photoId, idx) => (
                                      <PhotoDisplay
                                        key={idx}
                                        photoId={photoId}
                                        alt={`${item.point} - Photo ${idx + 1}`}
                                        className="photo-item"
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
          <div className="disclaimer-section mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-lg mb-4 text-center">DISCLAIMER</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Scope of Inspection:</strong> This report is based on a visual inspection of the property conducted on the date specified. The inspection covers readily accessible areas and systems that were visible and available for examination at the time of the inspection.
              </p>
              <p>
                <strong>Limitations:</strong> This inspection does not include areas that were inaccessible, covered, or concealed at the time of inspection. The report does not guarantee against future defects or problems that may arise after the inspection date.
              </p>
              <p>
                <strong>Professional Opinion:</strong> The findings and recommendations in this report represent the professional opinion of the inspector based on industry standards and best practices. This report is intended for the exclusive use of the client named herein.
              </p>
              <p>
                <strong>Liability:</strong> Solution Property and its inspectors shall not be liable for any damages, losses, or costs arising from the use of this report or any actions taken based on its contents beyond the cost of the inspection service.
              </p>
              <p>
                <strong>Validity:</strong> This report is valid for 30 days from the inspection date. Property conditions may change after this period.
              </p>
            </div>
          </div>
          
          <div className="signature-section">
            <div className="signature-column">
              <p className="font-bold mb-4">Inspector Signature:</p>
              <div className="signature-box"></div>
              <p className="text-sm text-gray-600 mt-2">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="signature-column">
              <p className="font-bold mb-4">Client Signature:</p>
              <div className="signature-box"></div>
              <p className="text-sm text-gray-600 mt-2">Date: _______________</p>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-muted-foreground">
            Generated on {new Date().toLocaleDateString()} • Solution Property - Professional Property Inspection Services
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