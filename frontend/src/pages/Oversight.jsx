import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import apiService from '../services/api';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import UtilizationBadge from '../components/UtilizationBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const Oversight = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flags, setFlags] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [flagFilter, setFlagFilter] = useState('');

  const fetchFlags = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getFlags();
      setFlags(data.flags || []);
    } catch (err) {
      console.error("Oversight fetch error:", err);
      setError(err.message || "Failed to load oversight records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const criticalCount = useMemo(() => flags.filter((f) => f.flag === 'Critical').length, [flags]);
  const lowCount = useMemo(() => flags.filter((f) => f.flag === 'Low').length, [flags]);

  const filteredFlags = useMemo(() => {
    return flags.filter((f) => {
      if (flagFilter && f.flag !== flagFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchWard = (f.ward || '').toLowerCase().includes(q);
        const matchRep = (f.representative || '').toLowerCase().includes(q);
        const matchRegion = (f.region || '').toLowerCase().includes(q);
        return matchWard || matchRep || matchRegion;
      }
      return true;
    });
  }, [flags, flagFilter, searchQuery]);

  const columns = [
    {
      key: 'flag',
      label: 'Review Priority',
      sortable: true,
      render: (val, row) => <UtilizationBadge flag={val} value={row.utilization} />
    },
    {
      key: 'ward',
      label: 'Administrative Ward',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900">{val}</span>
    },
    {
      key: 'region',
      label: 'Region',
      sortable: true,
      render: (val) => <span className="text-slate-600 text-xs">{val}</span>
    },
    {
      key: 'representative',
      label: 'Representative',
      sortable: true,
      render: (val) => <span className="text-slate-700 font-medium">{val}</span>
    },
    {
      key: 'allocated',
      label: 'Allocated Budget',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-semibold text-slate-900">{formatCurrency(val)}</span>
    },
    {
      key: 'spent',
      label: 'Spent Amount',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-semibold text-slate-900">{formatCurrency(val)}</span>
    },
    {
      key: 'utilization',
      label: 'Utilization Rate',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-extrabold text-slate-900">{formatPercent(val)}</span>
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      align: 'center',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/wards/${encodeURIComponent(row.ward)}`)}
          className="btn btn-secondary btn-sm"
        >
          Review Ward <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      )
    }
  ];

  if (error) {
    return <ErrorState message={error} onRetry={fetchFlags} />;
  }

  return (
    <div className="oversight-page space-y-6">
      <div className="page-header">
        <div className="flex items-center space-x-2 text-amber-600 text-sm font-semibold mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Oversight & Review Center</span>
        </div>
        <h1 className="page-title">Oversight & Attention Center</h1>
        <p className="page-subtitle">
          Identify wards requiring additional review based on fund utilization rates. This portal supports performance review and allocation adjustments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Flagged Wards"
          value={flags.length}
          icon={ShieldAlert}
          color="amber"
          badge="Attention Required"
        />
        <StatCard
          label="Critical Utilization (< 50%)"
          value={criticalCount}
          icon={AlertTriangle}
          color="red"
          badge="High Priority"
        />
        <StatCard
          label="Low Utilization (50% - 70%)"
          value={lowCount}
          icon={AlertCircle}
          color="amber"
          badge="Medium Priority"
        />
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            key: 'flag',
            label: 'Severity Level',
            options: [
              { label: 'Critical Priority', value: 'Critical' },
              { label: 'Low Utilization', value: 'Low' }
            ]
          }
        ]}
        selectedFilters={{ flag: flagFilter }}
        onFilterChange={(_, val) => setFlagFilter(val)}
        onReset={() => {
          setFlagFilter('');
          setSearchQuery('');
        }}
      />

      {loading ? (
        <LoadingSpinner label="Fetching flagged wards data..." />
      ) : (
        <div className="card">
          <DataTable
            columns={columns}
            data={filteredFlags}
            keyField="ward"
            pageSize={10}
            emptyMessage="All administrative wards are operating normally without oversight flags."
          />
        </div>
      )}
    </div>
  );
};

export default Oversight;
