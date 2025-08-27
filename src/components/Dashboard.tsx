import React from 'react';
import { cn } from '@/lib/utils';
import { DashboardMetrics } from './DashboardMetrics';
import { Button } from './ui/button';
import { Plus, BarChart3, Calendar, FileText, Settings } from 'lucide-react';
import { getDisplayName } from '@/utils/user';

interface DashboardProps {
  user: any;
  profile: any;
  onNavigate: (page: string) => void;
}

export function Dashboard({ user, profile, onNavigate }: DashboardProps) {
  const handleSectionClick = (section: 'inspections' | 'schedules' | 'invoices') => {
    switch (section) {
      case 'inspections':
        onNavigate('newInspection');
        break;
      case 'schedules':
        onNavigate('reportScheduled');
        break;
      case 'invoices':
        onNavigate('billing');
        break;
    }
  };

  const currentTime = new Date();
  const hour = currentTime.getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {greeting}, {getDisplayName(user?.email || profile?.email || 'User')}!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Here's what's happening with your property inspections today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              onClick={() => onNavigate('newInspection')}
              className="btn-enhanced micro-bounce gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              New Inspection
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('reportScheduled')}
              className="btn-enhanced micro-bounce gap-2"
              size="sm"
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="dashboard-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Business Overview
          </h2>
        </div>
        
        <DashboardMetrics onSectionClick={handleSectionClick} />
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            className="card-enhanced p-6 cursor-pointer group"
            onClick={() => onNavigate('newInspection')}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-lg group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Create New Inspection
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a new property inspection report
                </p>
              </div>
            </div>
          </div>

          <div 
            className="card-enhanced p-6 cursor-pointer group"
            onClick={() => onNavigate('reportScheduled')}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-600 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                  Schedule Inspection
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Plan and schedule upcoming inspections
                </p>
              </div>
            </div>
          </div>

          <div 
            className="card-enhanced p-6 cursor-pointer group"
            onClick={() => onNavigate('billing')}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/10 text-green-600 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-green-600 transition-colors">
                  Manage Invoices
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create and track invoice payments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="dashboard-section">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-6">
          Recent Activity
        </h2>
        <div className="card-enhanced p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Activity Timeline Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground">
              View your recent inspections, schedules, and invoice activities in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}