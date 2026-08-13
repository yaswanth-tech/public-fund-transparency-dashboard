import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, IndianRupee, TrendingUp, PieChart as PieIcon, FolderGit2 } from 'lucide-react';
import apiService from '../services/api';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import UtilizationBadge from '../components/UtilizationBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';

export const WardDetails = () => {
  const { wardName } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wardData, setWardData] = useState(null);

  const fetchWardDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getWardDetails(wardName);
      setWardData(data);
    } catch (err) {
      console.error("Ward details fetch error:", err);
      setError(err.message || "Failed to load ward details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wardName) {
      fetchWardDetails();
    }
  }, [wardName]);

  const columns = [
    {
      key: 'project',
      label: 'Project Name',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900">{val}</span>
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (val) => <span className="text-slate-600 font-medium">{val}</span>
    },
    {
      key: 'fiscal_year',
      label: 'Fiscal Year',
      sortable: true,
      render: (val) => <span className="text-slate-700 text-xs font-mono">{val}</span>
    },
    {
      key: 'allocated',
      label: 'Allocated Amount',
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
      key: 'status',
      label: 'Project Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'start_date',
      label: 'Start Date',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-500">{formatDate(val)}</span>
    },
    {
      key: 'expected_end_date',
      label: 'Expected End Date',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-500">{formatDate(val)}</span>
    }
  ];

  if (error) {
    return <ErrorState message={error} onRetry={fetchWardDetails} />;
  }

  return (
    <div className="ward-details-page space-y-6">
      <div>
        <button
          onClick={() => navigate('/wards')}
          className="btn btn-ghost btn-sm mb-3 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Wards
        </button>

        {wardData && (
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  {wardData.region} Region
                </span>
                <UtilizationBadge flag={wardData.flag} value={wardData.utilization} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">{wardData.ward}</h1>
              <p className="text-sm text-slate-500 flex items-center mt-1">
                <UserCheck className="w-4 h-4 mr-1 text-slate-400" /> Representative: <span className="font-semibold text-slate-700 ml-1">{wardData.representative}</span>
              </p>
            </div>

            <div className="utilization-banner-large flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200 space-x-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fund Execution Rate</p>
                <p className="text-3xl font-extrabold text-slate-900">{formatPercent(wardData.utilization)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching ward projects breakdown..." />
      ) : (
        <>
          <div className="kpi-grid">
            <KPICard
              title="Total Allocation"
              value={wardData?.total_allocation || 0}
              isCurrency={true}
              subtitle="Allocated to this ward"
              icon={IndianRupee}
              colorScheme="blue"
            />
            <KPICard
              title="Total Expenditure"
              value={wardData?.total_expenditure || 0}
              isCurrency={true}
              subtitle="Total verified spend"
              icon={TrendingUp}
              colorScheme="teal"
            />
            <KPICard
              title="Utilization Rate"
              value={wardData?.utilization || 0}
              isCurrency={false}
              isPercent={true}
              subtitle="Execution efficiency"
              icon={PieIcon}
              colorScheme={
                (wardData?.utilization || 0) < 50
                  ? 'red'
                  : (wardData?.utilization || 0) < 70
                  ? 'amber'
                  : 'green'
              }
            />
            <KPICard
              title="Total Projects"
              value={wardData?.total_projects || 0}
              isCurrency={false}
              subtitle="Initiatives in this ward"
              icon={FolderGit2}
              colorScheme="slate"
            />
          </div>

          <div className="card">
            <div className="card-header p-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Ward Project Inventory</h3>
              <p className="text-xs text-slate-500">Detailed list of public spending initiatives under {wardData?.ward}</p>
            </div>
            <div className="card-body">
              <DataTable
                columns={columns}
                data={wardData?.projects || []}
                keyField="project_id"
                pageSize={10}
                emptyMessage="No project records found for this ward."
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WardDetails;
