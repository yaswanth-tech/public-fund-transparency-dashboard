import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  PieChart as PieIcon,
  FolderGit2,
  AlertOctagon,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import apiService from '../services/api';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import FilterBar from '../components/FilterBar';
import UtilizationBadge from '../components/UtilizationBadge';
import LoadingSpinner, { SkeletonKPI, SkeletonChart } from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [flags, setFlags] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    fiscalYear: '',
    ward: '',
    department: '',
    status: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, projRes, flagRes] = await Promise.all([
        apiService.getDashboard(),
        apiService.getProjects(),
        apiService.getFlags()
      ]);
      setDashboardData(dashRes);
      setProjects(projRes.projects || []);
      setFlags(flagRes.flags || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterOptions = useMemo(() => {
    const fiscalYears = Array.from(new Set(projects.map((p) => p.fiscal_year).filter(Boolean))).sort();
    const wards = Array.from(new Set(projects.map((p) => p.ward).filter(Boolean))).sort();
    const departments = Array.from(new Set(projects.map((p) => p.department).filter(Boolean))).sort();
    const statuses = Array.from(new Set(projects.map((p) => p.status).filter(Boolean))).sort();

    return [
      {
        key: 'fiscalYear',
        label: 'Fiscal Year',
        options: fiscalYears.map((fy) => ({ label: fy, value: fy }))
      },
      {
        key: 'ward',
        label: 'Ward',
        options: wards.map((w) => ({ label: w, value: w }))
      },
      {
        key: 'department',
        label: 'Department',
        options: departments.map((d) => ({ label: d, value: d }))
      },
      {
        key: 'status',
        label: 'Status',
        options: statuses.map((s) => ({ label: s, value: s }))
      }
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedFilters.fiscalYear && p.fiscal_year !== selectedFilters.fiscalYear) return false;
      if (selectedFilters.ward && p.ward !== selectedFilters.ward) return false;
      if (selectedFilters.department && p.department !== selectedFilters.department) return false;
      if (selectedFilters.status && p.status !== selectedFilters.status) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.project || '').toLowerCase().includes(q);
        const matchWard = (p.ward || '').toLowerCase().includes(q);
        const matchDept = (p.department || '').toLowerCase().includes(q);
        return matchName || matchWard || matchDept;
      }

      return true;
    });
  }, [projects, selectedFilters, searchQuery]);

  const deptChartData = useMemo(() => {
    const map = {};
    filteredProjects.forEach((p) => {
      const dept = p.department || 'Unassigned';
      if (!map[dept]) {
        map[dept] = { department: dept, Allocated: 0, Spent: 0 };
      }
      map[dept].Allocated += p.allocated_amount || 0;
      map[dept].Spent += p.spent_amount || 0;
    });
    return Object.values(map);
  }, [filteredProjects]);

  const wardUtilizationChartData = useMemo(() => {
    const map = {};
    filteredProjects.forEach((p) => {
      const ward = p.ward || 'Unknown Ward';
      if (!map[ward]) {
        map[ward] = { ward, allocated: 0, spent: 0 };
      }
      map[ward].allocated += p.allocated_amount || 0;
      map[ward].spent += p.spent_amount || 0;
    });

    return Object.values(map)
      .map((w) => {
        const utilization = w.allocated > 0 ? (w.spent / w.allocated) * 100 : 0;
        return {
          ward: w.ward,
          utilization: Number(utilization.toFixed(1)),
          allocated: w.allocated,
          spent: w.spent
        };
      })
      .sort((a, b) => a.utilization - b.utilization);
  }, [filteredProjects]);

  const deptDistributionData = useMemo(() => {
    const map = {};
    filteredProjects.forEach((p) => {
      const dept = p.department || 'Other';
      map[dept] = (map[dept] || 0) + (p.spent_amount || 0);
    });

    const colors = ['#2563EB', '#0D9488', '#D97706', '#9333EA', '#DC2626', '#059669', '#6366F1'];
    return Object.keys(map).map((dept, index) => ({
      name: dept,
      value: map[dept],
      color: colors[index % colors.length]
    }));
  }, [filteredProjects]);

  const fiscalTrendData = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      const fy = p.fiscal_year || 'N/A';
      if (!map[fy]) {
        map[fy] = { year: fy, Allocated: 0, Spent: 0 };
      }
      map[fy].Allocated += p.allocated_amount || 0;
      map[fy].Spent += p.spent_amount || 0;
    });

    return Object.values(map).sort((a, b) => a.year.localeCompare(b.year));
  }, [projects]);

  const handleFilterChange = (key, val) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => {
    setSelectedFilters({ fiscalYear: '', ward: '', department: '', status: '' });
    setSearchQuery('');
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="dashboard-page space-y-6">
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="live-dot" />
            <span>Official Civic Spending Intelligence</span>
          </div>
          <h1 className="hero-title">Public Fund Transparency</h1>
          <p className="hero-subtitle">
            Track how public funds are allocated, spent, and utilized across administrative wards and government departments.
          </p>
        </div>
        <div className="hero-status">
          <span className="hero-status-pill">
            <span className="status-indicator-green" /> Data Updated & Verified
          </span>
        </div>
      </div>

      {loading ? (
        <div className="kpi-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonKPI key={i} />
          ))}
        </div>
      ) : (
        <div className="kpi-grid">
          <KPICard
            title="Total Allocation"
            value={dashboardData?.total_allocation || 0}
            isCurrency={true}
            subtitle="Approved civic budget"
            icon={IndianRupee}
            colorScheme="blue"
          />
          <KPICard
            title="Total Expenditure"
            value={dashboardData?.total_expenditure || 0}
            isCurrency={true}
            subtitle="Verified funds spent"
            icon={TrendingUp}
            colorScheme="teal"
          />
          <KPICard
            title="Overall Utilization"
            value={dashboardData?.utilization || 0}
            isCurrency={false}
            isPercent={true}
            subtitle="Fund execution efficiency"
            icon={PieIcon}
            colorScheme={
              (dashboardData?.utilization || 0) < 50
                ? 'red'
                : (dashboardData?.utilization || 0) < 70
                ? 'amber'
                : 'green'
            }
          />
          <KPICard
            title="Total Projects"
            value={dashboardData?.total_projects || 0}
            isCurrency={false}
            subtitle="Active civic initiatives"
            icon={FolderGit2}
            colorScheme="slate"
          />
          <KPICard
            title="Wards Needing Attention"
            value={dashboardData?.low_utilization_wards || 0}
            isCurrency={false}
            subtitle="Utilization under 70%"
            icon={AlertOctagon}
            colorScheme={dashboardData?.low_utilization_wards > 0 ? 'amber' : 'green'}
          />
        </div>
      )}

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filterOptions}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {loading ? (
        <div className="charts-grid">
          <SkeletonChart />
          <SkeletonChart />
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : (
        <div className="charts-grid">
          <ChartCard
            title="Allocation vs Expenditure by Department"
            subtitle="Comparison of allocated budget versus actual spending (in ₹)"
          >
            <div className="chart-container-inner">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#475569' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), '']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', border: 'none' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Allocated" fill="#2563EB" radius={[4, 4, 0, 0]} name="Allocated Fund" />
                  <Bar dataKey="Spent" fill="#0D9488" radius={[4, 4, 0, 0]} name="Spent Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Ward Utilization Percentage"
            subtitle="Utilization ranking across administrative wards"
          >
            <div className="chart-container-inner">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={wardUtilizationChartData}
                  margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="ward" type="category" tick={{ fontSize: 12, fill: '#334155' }} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Utilization']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', border: 'none' }}
                  />
                  <Bar dataKey="utilization" radius={[0, 4, 4, 0]}>
                    {wardUtilizationChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.utilization < 50
                            ? '#EF4444'
                            : entry.utilization < 70
                            ? '#F59E0B'
                            : '#10B981'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Spending Distribution by Department"
            subtitle="Share of total verified expenditure"
          >
            <div className="chart-container-inner flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deptDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deptDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Expenditure']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', border: 'none' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Fiscal Year Budget & Spend Trend"
            subtitle="Historical trajectory across fiscal periods"
          >
            <div className="chart-container-inner">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={fiscalTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), '']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', border: 'none' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="Allocated" stroke="#2563EB" fillOpacity={1} fill="url(#colorAllocated)" name="Total Allocation" />
                  <Area type="monotone" dataKey="Spent" stroke="#0D9488" fillOpacity={1} fill="url(#colorSpent)" name="Total Expenditure" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}

      <div className="attention-section card">
        <div className="card-header flex justify-between items-center pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Wards Requiring Oversight</h3>
              <p className="text-xs text-slate-500">Administrative wards flagged for low fund utilization (&lt; 70%)</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/oversight')}
            className="btn btn-secondary btn-sm"
          >
            View Oversight Center <ArrowUpRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="card-body pt-4">
          {flags.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">All wards are operating within normal utilization parameters.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flags.map((item) => (
                <div key={item.ward} className="flag-card border rounded-xl p-4 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{item.ward}</h4>
                      <p className="text-xs text-slate-500">{item.region} • {item.representative}</p>
                    </div>
                    <UtilizationBadge flag={item.flag} value={item.utilization} />
                  </div>

                  <div className="space-y-1 my-3 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Allocated:</span>
                      <span className="font-medium text-slate-800">{formatCurrency(item.allocated)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spent:</span>
                      <span className="font-medium text-slate-800">{formatCurrency(item.spent)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/wards/${encodeURIComponent(item.ward)}`)}
                    className="btn btn-ghost btn-sm w-full mt-2 justify-center border border-slate-200"
                  >
                    View Ward Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
