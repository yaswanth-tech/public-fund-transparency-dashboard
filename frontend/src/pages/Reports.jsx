import React, { useEffect, useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2, ShieldCheck, Database, Calendar } from 'lucide-react';
import apiService from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';

export const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const [dbCount, setDbCount] = useState(null);
  const [dashData, setDashData] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const [countRes, dashRes] = await Promise.all([
        apiService.getDatabaseCount(),
        apiService.getDashboard()
      ]);
      setDbCount(countRes.total_projects || 0);
      setDashData(dashRes);
    } catch (err) {
      console.error("Reports summary fetch error:", err);
      setError(err.message || "Failed to load report parameters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleDownloadCSV = async () => {
    setDownloading(true);
    setDownloadSuccess(false);
    try {
      await apiService.downloadReport();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("CSV Download error:", err);
      alert("Download failed. Please check backend connection.");
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchSummary} />;
  }

  return (
    <div className="reports-page max-w-4xl mx-auto space-y-6">
      <div className="page-header text-center">
        <div className="inline-flex items-center space-x-2 text-emerald-600 text-sm font-semibold mb-1 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Public Transparency Data Export</span>
        </div>
        <h1 className="page-title text-3xl">Public Disclosure Reports</h1>
        <p className="page-subtitle max-w-xl mx-auto">
          Download standardized, machine-readable civic spending records for audit, research, and public accountability.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Compiling public disclosure report details..." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Database Records"
              value={dbCount ?? 0}
              icon={Database}
              color="blue"
              badge="Verified Projects"
            />
            <StatCard
              label="Total Budget Allocation"
              value={formatCurrency(dashData?.total_allocation || 0)}
              icon={ShieldCheck}
              color="teal"
              badge="Public Funds"
            />
            <StatCard
              label="Overall Utilization"
              value={formatPercent(dashData?.utilization || 0)}
              icon={CheckCircle2}
              color="green"
              badge="Execution Rate"
            />
          </div>

          <div className="card p-8 bg-white border border-slate-200 shadow-md rounded-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Standardized Civic Spending CSV Report</h3>
                  <p className="text-xs text-slate-500">Includes ward, region, representative, department, allocated & spent amounts, and status dates.</p>
                </div>
              </div>

              <button
                onClick={handleDownloadCSV}
                disabled={downloading}
                className="btn btn-primary btn-md flex-shrink-0"
              >
                <Download className={`w-5 h-5 mr-2 ${downloading ? 'animate-bounce' : ''}`} />
                {downloading ? 'Preparing CSV...' : 'Download CSV Report'}
              </button>
            </div>

            {downloadSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span><strong>civic_fund_report.csv</strong> successfully downloaded!</span>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs text-slate-600">
              <div className="space-y-1">
                <span className="text-slate-400 block font-semibold">Report Format</span>
                <span className="font-bold text-slate-800 font-mono text-sm">CSV (RFC 4180)</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-semibold">Coverage</span>
                <span className="font-bold text-slate-800 text-sm">All Administrative Wards</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-semibold">Projects Count</span>
                <span className="font-bold text-slate-800 text-sm">{dbCount} Projects</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-semibold">Generated On</span>
                <span className="font-bold text-slate-800 text-sm flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {formatDate(new Date())}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
