import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Activity,
  BarChart3,
  PieChart,
  Clock,
  DollarSign,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/StatCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface AnalyticsData {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  averageWaitTime: number;
  patientSatisfaction: number;
  monthlyRevenue: number;
  patientGrowth: number;
  appointmentTrends: Array<{
    month: string;
    appointments: number;
    completed: number;
    cancelled: number;
  }>;
  topConditions: Array<{
    condition: string;
    count: number;
    percentage: number;
  }>;
  appointmentsByHour: Array<{
    hour: string;
    count: number;
  }>;
}

export function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        totalPatients: 1247,
        totalAppointments: 3456,
        completedAppointments: 3102,
        cancelledAppointments: 354,
        averageWaitTime: 12,
        patientSatisfaction: 4.7,
        monthlyRevenue: 125000,
        patientGrowth: 8.5,
        appointmentTrends: [
          { month: 'Jan', appointments: 280, completed: 252, cancelled: 28 },
          { month: 'Feb', appointments: 310, completed: 279, cancelled: 31 },
          { month: 'Mar', appointments: 295, completed: 266, cancelled: 29 },
          { month: 'Apr', appointments: 340, completed: 306, cancelled: 34 },
          { month: 'May', appointments: 365, completed: 328, cancelled: 37 },
          { month: 'Jun', appointments: 320, completed: 288, cancelled: 32 },
        ],
        topConditions: [
          { condition: 'Hypertension', count: 156, percentage: 12.5 },
          { condition: 'Diabetes Type 2', count: 134, percentage: 10.7 },
          { condition: 'Anxiety', count: 98, percentage: 7.9 },
          { condition: 'Asthma', count: 87, percentage: 7.0 },
          { condition: 'Depression', count: 76, percentage: 6.1 },
        ],
        appointmentsByHour: [
          { hour: '8 AM', count: 45 },
          { hour: '9 AM', count: 78 },
          { hour: '10 AM', count: 92 },
          { hour: '11 AM', count: 85 },
          { hour: '12 PM', count: 67 },
          { hour: '1 PM', count: 54 },
          { hour: '2 PM', count: 89 },
          { hour: '3 PM', count: 95 },
          { hour: '4 PM', count: 82 },
          { hour: '5 PM', count: 71 },
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="h-8 w-48" />
          <LoadingSkeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent padding="md">
                <LoadingSkeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Failed to load analytics data</p>
      </div>
    );
  }

  const completionRate = Math.round((analyticsData.completedAppointments / analyticsData.totalAppointments) * 100);
  const cancellationRate = Math.round((analyticsData.cancelledAppointments / analyticsData.totalAppointments) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Practice insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={analyticsData.totalPatients.toLocaleString()}
          subtitle={`+${analyticsData.patientGrowth}% this month`}
          icon={<Users className="h-6 w-6" />}
          variant="primary"
          trend={{ value: analyticsData.patientGrowth, isPositive: true }}
        />
        
        <StatCard
          title="Total Appointments"
          value={analyticsData.totalAppointments.toLocaleString()}
          subtitle={`${completionRate}% completion rate`}
          icon={<Calendar className="h-6 w-6" />}
          variant="success"
        />
        
        <StatCard
          title="Avg. Wait Time"
          value={`${analyticsData.averageWaitTime} min`}
          subtitle="Below target of 15 min"
          icon={<Clock className="h-6 w-6" />}
          variant="success"
          trend={{ value: 2.3, isPositive: false }}
        />
        
        <StatCard
          title="Patient Satisfaction"
          value={`${analyticsData.patientSatisfaction}/5.0`}
          subtitle="Based on 234 reviews"
          icon={<TrendingUp className="h-6 w-6" />}
          variant="primary"
          trend={{ value: 0.3, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Trends */}
        <Card>
          <CardHeader border>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Appointment Trends
              </h2>
            </div>
          </CardHeader>
          <CardContent padding="md">
            <div className="space-y-4">
              {analyticsData.appointmentTrends.map((trend) => (
                <div key={trend.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8">
                      {trend.month}
                    </span>
                    <div className="flex-1">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(trend.appointments / 400) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {trend.appointments}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {Math.round((trend.completed / trend.appointments) * 100)}% completed
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Conditions */}
        <Card>
          <CardHeader border>
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Most Common Conditions
              </h2>
            </div>
          </CardHeader>
          <CardContent padding="md">
            <div className="space-y-4">
              {analyticsData.topConditions.map((condition) => (
                <div key={condition.condition} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {condition.condition}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {condition.count}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {condition.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Distribution */}
      <Card>
        <CardHeader border>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Appointments by Hour
            </h2>
          </div>
        </CardHeader>
        <CardContent padding="md">
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
            {analyticsData.appointmentsByHour.map((hourData) => (
              <div key={hourData.hour} className="text-center">
                <div className="mb-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-16 flex items-end justify-center">
                    <div 
                      className="bg-purple-500 rounded-full w-4 transition-all duration-300" 
                      style={{ height: `${(hourData.count / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {hourData.hour}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {hourData.count}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completionRate}%
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ArrowUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cancellation Rate
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {cancellationRate}%
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <ArrowDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${analyticsData.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}