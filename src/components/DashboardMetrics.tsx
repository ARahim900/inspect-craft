import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScheduleService, ScheduleItem } from '@/services/schedule-service';
import { InvoiceService, BillingItem } from '@/services/invoice-service';
import { StorageService, SavedInspection } from '@/services/storage-service';
import { 
  Calendar, 
  FileText, 
  DollarSign, 
  ClipboardList, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  color = 'primary',
  onClick 
}: MetricCardProps) {
  const colorClasses = {
    primary: 'border-primary/20 hover:border-primary/40',
    success: 'border-green-500/20 hover:border-green-500/40',
    warning: 'border-yellow-500/20 hover:border-yellow-500/40', 
    danger: 'border-red-500/20 hover:border-red-500/40',
    info: 'border-blue-500/20 hover:border-blue-500/40'
  };

  return (
    <div 
      className={cn(
        "metric-card cursor-pointer group",
        colorClasses[color]
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-foreground">
              {value}
            </h3>
            {trend && trendValue && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                trend === 'up' && "text-green-600",
                trend === 'down' && "text-red-600", 
                trend === 'neutral' && "text-muted-foreground"
              )}>
                <TrendingUp className={cn(
                  "w-3 h-3",
                  trend === 'down' && "rotate-180"
                )} />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          "p-2 rounded-lg transition-colors duration-200",
          color === 'primary' && "bg-primary/10 text-primary group-hover:bg-primary/20",
          color === 'success' && "bg-green-500/10 text-green-600 group-hover:bg-green-500/20",
          color === 'warning' && "bg-yellow-500/10 text-yellow-600 group-hover:bg-yellow-500/20",
          color === 'danger' && "bg-red-500/10 text-red-600 group-hover:bg-red-500/20",
          color === 'info' && "bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/20"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface DashboardMetricsProps {
  onSectionClick?: (section: 'inspections' | 'schedules' | 'invoices') => void;
}

export function DashboardMetrics({ onSectionClick }: DashboardMetricsProps) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [invoices, setInvoices] = useState<BillingItem[]>([]);
  const [inspections, setInspections] = useState<SavedInspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [schedulesData, invoicesData, inspectionsData] = await Promise.all([
          ScheduleService.getSchedules(),
          InvoiceService.getInvoices(),
          StorageService.getInspections()
        ]);

        setSchedules(schedulesData);
        setInvoices(invoicesData);
        setInspections(inspectionsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate inspection metrics
  const inspectionMetrics = {
    total: inspections.length,
    // For now, we'll show all as completed since we don't have status in SavedInspection
    completed: inspections.length,
    inProgress: 0,
    pending: 0
  };

  // Calculate schedule metrics  
  const scheduleMetrics = {
    total: schedules.length,
    upcoming: schedules.filter(s => {
      const scheduleDate = new Date(s.date);
      const today = new Date();
      return scheduleDate >= today && s.status !== 'completed' && s.status !== 'cancelled';
    }).length,
    completed: schedules.filter(s => s.status === 'completed').length,
    overdue: schedules.filter(s => {
      const scheduleDate = new Date(s.date);
      const today = new Date();
      return scheduleDate < today && s.status !== 'completed' && s.status !== 'cancelled';
    }).length
  };

  // Calculate invoice metrics
  const invoiceMetrics = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'sent').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalRevenue: invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0),
    pendingRevenue: invoices
      .filter(i => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, inv) => sum + inv.totalAmount, 0)
  };

  if (loading) {
    return (
      <div className="grid-metrics">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="metric-card animate-pulse">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16 mb-1"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
              <div className="w-10 h-10 bg-muted rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid-metrics">
      {/* Inspection Metrics */}
      <MetricCard
        title="Total Inspections"
        value={inspectionMetrics.total}
        subtitle="All time"
        icon={<ClipboardList className="w-5 h-5" />}
        color="primary"
        onClick={() => onSectionClick?.('inspections')}
      />
      
      <MetricCard
        title="Completed Reports"
        value={inspectionMetrics.completed}
        subtitle={inspectionMetrics.completed > 0 ? "Ready for delivery" : "No reports yet"}
        icon={<CheckCircle className="w-5 h-5" />}
        color="success"
        onClick={() => onSectionClick?.('inspections')}
      />

      {/* Schedule Metrics */}
      <MetricCard
        title="Upcoming Schedules"
        value={scheduleMetrics.upcoming}
        subtitle={scheduleMetrics.total > 0 ? `${scheduleMetrics.total} total scheduled` : "No schedules yet"}
        icon={<Calendar className="w-5 h-5" />}
        color="info"
        trend={scheduleMetrics.upcoming > scheduleMetrics.completed ? 'up' : 'neutral'}
        onClick={() => onSectionClick?.('schedules')}
      />

      <MetricCard
        title="Overdue Tasks"
        value={scheduleMetrics.overdue}
        subtitle={scheduleMetrics.overdue > 0 ? "Requires attention" : "All caught up"}
        icon={<AlertTriangle className="w-5 h-5" />}
        color={scheduleMetrics.overdue > 0 ? "warning" : "success"}
        onClick={() => onSectionClick?.('schedules')}
      />

      {/* Invoice Metrics */}
      <MetricCard
        title="Revenue (Paid)"
        value={`$${invoiceMetrics.totalRevenue.toLocaleString()}`}
        subtitle={`${invoiceMetrics.paid} invoices paid`}
        icon={<DollarSign className="w-5 h-5" />}
        color="success"
        trend="up"
        trendValue={`${invoiceMetrics.paid}/${invoiceMetrics.total}`}
        onClick={() => onSectionClick?.('invoices')}
      />

      <MetricCard
        title="Pending Revenue"
        value={`$${invoiceMetrics.pendingRevenue.toLocaleString()}`}
        subtitle={`${invoiceMetrics.pending + invoiceMetrics.overdue} invoices pending`}
        icon={<Clock className="w-5 h-5" />}
        color="warning"
        onClick={() => onSectionClick?.('invoices')}
      />

      <MetricCard
        title="Active Clients"
        value={new Set([
          ...schedules.map(s => s.clientName),
          ...invoices.map(i => i.clientName),
          ...inspections.map(i => i.clientName)
        ]).size}
        subtitle="Unique clients"
        icon={<Users className="w-5 h-5" />}
        color="info"
        onClick={() => onSectionClick?.('schedules')}
      />

      <MetricCard
        title="Invoice Status"
        value={invoiceMetrics.overdue > 0 ? invoiceMetrics.overdue : invoiceMetrics.pending}
        subtitle={invoiceMetrics.overdue > 0 ? "Overdue invoices" : "Pending invoices"}
        icon={invoiceMetrics.overdue > 0 ? <XCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
        color={invoiceMetrics.overdue > 0 ? "danger" : "warning"}
        onClick={() => onSectionClick?.('invoices')}
      />
    </div>
  );
}