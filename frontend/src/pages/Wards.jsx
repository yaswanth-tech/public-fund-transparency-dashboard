import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import apiService from '../services/api';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import UtilizationBadge from '../components/UtilizationBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const Wards = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wards, setWards] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    flag: '',
    region: ''
  });

  const fetchWards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getWards();
      setWards(data || []);
    } catch (err) {
      console.error("Wards fetch error:", err);
      setError(err.message || "Failed to load wards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const filterOptions = useMemo(() => {
    const flags = ['Critical', 'Low', 'Normal'];
    const regions = Array.from(new Set(wards.map((w) => w.region).filter(Boolean))).sort();

    return [
      {
        key: 'flag',
        label: 'Status Flag',
        options: flags.map((f) => ({ label: f, value: f }))
      },
      {
        key: 'region',
        label: 'Region',
        options: regions.map((r) => ({ label: r, value: r }))
      }
    ];
  }, [wards]);

  const filteredWards = useMemo(() => {
    return wards.filter((w) => {
      if (selectedFilters.flag && w.flag !== selectedFilters.flag) return false;
      if (selectedFilters.region && w.region !== selectedFilters.region) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchWard = (w.ward || '').toLowerCase().includes(q);
        const matchRep = (w.representative || '').toLowerCase().includes(q);
        const matchRegion = (w.region || '').toLowerCase().includes(q);
        return matchWard || matchRep || matchRegion;
      }

      return true;
    });
  }, [wards, selectedFilters, searchQuery]);

  const columns = [
    {
      key: 'ward',
      label: 'Administrative Ward',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900">{val}</span>
    },
    {
      key: 'region',
      label: 'Region / Zone',
      sortable: true,
      render: (val) => <span className="text-slate-600 text-xs font-medium">{val}</span>
    },
    {
      key: 'representative',
      label: 'Representative',
      sortable: true,
      render: (val) => <span className="text-slate-700 font-medium">{val}</span>
    },
    {
      key: 'allocated',
      label: 'Allocation',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-semibold text-slate-900">{formatCurrency(val)}</span>
    },
    {
      key: 'spent',
      label: 'Expenditure',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-semibold text-slate-900">{formatCurrency(val)}</span>
    },
    {
      key: 'utilization',
      label: 'Utilization Rate',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-bold text-slate-900">{formatPercent(val)}</span>
    },
    {
      key: 'flag',
      label: 'Status Flag',
      sortable: true,
      render: (val, row) => <UtilizationBadge flag={val} value={row.utilization} />
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      align: 'center',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/wards/${encodeURIComponent(row.ward)}`)}
          className="btn btn-secondary btn-sm"
        >
          View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      )
    }
  ];

  if (error) {
    return <ErrorState message={error} onRetry={fetchWards} />;
  }

  return (
    <div className="wards-page space-y-6">
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-sm font-semibold mb-1">
            <Building2 className="w-4 h-4" />
            <span>Administrative Geography</span>
          </div>
          <h1 className="page-title">Ward Spending Overview</h1>
          <p className="page-subtitle">Compare public fund allocation, expenditure, and utilization rates across administrative wards.</p>
        </div>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filterOptions}
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
        onReset={() => {
          setSelectedFilters({ flag: '', region: '' });
          setSearchQuery('');
        }}
      />

      {loading ? (
        <LoadingSpinner label="Loading administrative ward data..." />
      ) : (
        <div className="card">
          <DataTable
            columns={columns}
            data={filteredWards}
            keyField="ward"
            pageSize={12}
            emptyMessage="No wards match your search filters."
          />
        </div>
      )}
    </div>
  );
};

export default Wards;
