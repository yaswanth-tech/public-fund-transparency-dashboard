import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  PieChart as PieIcon,
  FolderGit2,
  AlertOctagon,
  ArrowUpRight,
  ShieldAlert,
  BarChart3
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
  Area,
  LabelList
} from 'recharts';
import apiService from '../services/api';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import FilterBar from '../components/FilterBar';
import UtilizationBadge from '../components/UtilizationBadge';
import LoadingSpinner, { SkeletonKPI, SkeletonChart } from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { formatCurrency, formatPercent } from '../utils/formatters';

const WardCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const getBadgeColor = (val) => {
      if (val < 50) return 'bg-red-600 text-white';
      if (val < 70) return 'bg-amber-600 text-white';
      if (val < 85) return 'bg-teal-600 text-white';
      return 'bg-blue-600 text-white';
    };

    const getStatusLabel = (val) => {
      if (val < 50) return 'Critical';
      if (val < 70) return 'Low';
      if (val < 85) return 'Healthy';
      return 'Optimal';
    };

    return (
      <div className="bg-slate-900 border border-slate-700 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <span className="font-extrabold text-sm text-slate-100">{data.ward || data.department}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeColor(data.utilization)}`}>
            {getStatusLabel(data.utilization)} ({data.utilization}%)
          </span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Allocated Fund:</span>
          <span className="font-semibold text-slate-100">{formatCurrency(data.allocated)}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Spent Amount:</span>
          <span className="font-semibold text-slate-100">{formatCurrency(data.spent)}</span>
        </div>
      </div>
    );
  }
  return null;
};

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

  // Department Utilization Data - Sorted Lowest to Highest
  const deptUtilizationChartData = useMemo(() => {
    const map = {};
    filteredProjects.forEach((p) => {
      const dept = p.department || 'Unassigned';
      if (!map[dept]) {
        map[dept] = { department: dept, allocated: 0, spent: 0 };
      }
      map[dept].allocated += p.allocated_amount || 0;
      map[dept].spent += p.spent_amount || 0;
    });

    return Object.values(map)
      .map((d) => {
        const util = d.allocated > 0 ? (d.spent / d.allocated) * 100 : 0;
        return {
          department: d.department,
          utilization: Number(util.toFixed(1)),
          allocated: d.allocated,
          spent: d.spent
        };
      })
      .sort((a, b) => a.utilization - b.utilization); // Lowest to highest
  }, [filteredProjects]);

  // Ward Utilization Data - Sorted Lowest to Highest
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
      .sort((a, b) => a.utilization - b.utilization); // Lowest to highest utilization
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

  const getUtilizationColor = (val) => {
    if (val < 50) return '#DC2626'; // Red <50%
    if (val < 70) return '#D97706'; // Amber 50-70%
    if (val < 85) return '#0D9488'; // Teal 70-85%
    return '#2563EB'; // Blue >85%
  };

  const wardChartHeight = Math.max(380, wardUtilizationChartData.length * 34);
  const deptUtilChartHeight = Math.max(200, deptUtilizationChartData.length * 36);

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
          {/* LEFT COLUMN: Department Allocation vs Expenditure & Department Utilization % */}
          <ChartCard
            title="Allocation vs Expenditure by Department"
            subtitle="Comparison of allocated budget versus actual spending (in ₹) & Department Utilization %"
          >
            <div className="space-y-6">
              {/* Chart 1: Grouped Bar Chart */}
              <div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-15} textAnchor="end" />
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

              {/* Chart 2: Compact Department Budget Utilization % Horizontal Bar Chart */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-800">Department Budget Utilization %</h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Sorted: Lowest → Highest</span>
                </div>

                <div className="chart-container-inner overflow-y-auto max-h-[260px] pr-2">
                  <ResponsiveContainer width="100%" height={deptUtilChartHeight}>
                    <BarChart
                      layout="vertical"
                      data={deptUtilizationChartData}
                      margin={{ top: 10, right: 45, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#475569' }} />
                      <YAxis
                        dataKey="department"
                        type="category"
                        width={95}
                        tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
                      />
                      <Tooltip content={<WardCustomTooltip />} />
                      <Bar dataKey="utilization" radius={[0, 6, 6, 0]}>
                        {deptUtilizationChartData.map((entry, index) => (
                          <Cell key={`dept-cell-${index}`} fill={getUtilizationColor(entry.utilization)} />
                        ))}
                        <LabelList
                          dataKey="utilization"
                          position="right"
                          formatter={(v) => `${v}%`}
                          style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </ChartCard>

          {/* RIGHT COLUMN: Ward Utilization Percentage */}
          <ChartCard
            title="Ward Utilization Percentage"
            subtitle="Sorted from lowest to highest utilization rate across administrative wards"
          >
            <div className="space-y-3">
              {/* 4-Category Threshold Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Utilization Thresholds:</span>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-600 inline-block shadow-sm" />
                  <span className="text-slate-700 font-medium">Red (&lt;50%)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-600 inline-block shadow-sm" />
                  <span className="text-slate-700 font-medium">Amber (50%–70%)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-teal-600 inline-block shadow-sm" />
                  <span className="text-slate-700 font-medium">Teal (70%–85%)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shadow-sm" />
                  <span className="text-slate-700 font-medium">Blue (&gt;85%)</span>
                </div>
              </div>

              {/* Sorted Horizontal Bar Chart */}
              <div className="chart-container-inner overflow-y-auto max-h-[500px] pr-2">
                <ResponsiveContainer width="100%" height={wardChartHeight}>
                  <BarChart
                    layout="vertical"
                    data={wardUtilizationChartData}
                    margin={{ top: 10, right: 45, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis
                      dataKey="ward"
                      type="category"
                      width={85}
                      tick={{ fontSize: 12, fill: '#1E293B', fontWeight: 600 }}
                    />
                    <Tooltip content={<WardCustomTooltip />} />
                    <Bar dataKey="utilization" radius={[0, 6, 6, 0]}>
                      {wardUtilizationChartData.map((entry, index) => (
                        <Cell key={`ward-cell-${index}`} fill={getUtilizationColor(entry.utilization)} />
                      ))}
                      <LabelList
                        dataKey="utilization"
                        position="right"
                        formatter={(v) => `${v}%`}
                        style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ChartCard>

          {/* BOTTOM ROW: Department Spending Distribution & Fiscal Year Trend */}
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
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
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
            title="Fiscal Year Spending Trend"
            subtitle="Growth in public fund allocation and actual spending"
          >
            <div className="chart-container-inner">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={fiscalTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <defs>
                    <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), '']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', border: 'none' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    dataKey="Allocated"
                    stroke="#2563EB"
                    fillOpacity={1}
                    fill="url(#colorAllocated)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Spent"
                    stroke="#0D9488"
                    fillOpacity={1}
                    fill="url(#colorSpent)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}

      {!loading && flags.length > 0 && (
        <div className="card p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg border border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>Oversight Attention Required</span>
              </div>
              <h3 className="text-lg font-bold">
                {flags.length} Wards Operating Under Target Utilization Threshold (&lt;70%)
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Immediate review recommended to improve fund execution efficiency.
              </p>
            </div>

            <button
              onClick={() => navigate('/oversight')}
              className="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold border-none btn-md flex-shrink-0"
            >
              Open Oversight Center <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
