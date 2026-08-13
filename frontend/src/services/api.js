import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create instance trying direct origin first, with fallback to Vite proxy /api if CORS/Network issue arises
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Interceptor for automatic fallback to /api proxy
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.config && !error.config._retry && (error.code === 'ERR_NETWORK' || !error.response)) {
      error.config._retry = true;
      error.config.baseURL = '/api';
      return api(error.config);
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  async checkHealth() {
    const res = await api.get('/health');
    return res.data;
  },

  async getDashboard() {
    const res = await api.get('/dashboard');
    return res.data;
  },

  async getWards() {
    const res = await api.get('/wards');
    return res.data;
  },

  async getWardDetails(wardName) {
    const res = await api.get(`/wards/${encodeURIComponent(wardName)}`);
    return res.data;
  },

  async getProjects() {
    const res = await api.get('/projects');
    return res.data;
  },

  async getFlags() {
    const res = await api.get('/flags');
    return res.data;
  },

  async getDatabaseCount() {
    const res = await api.get('/database/count');
    return res.data;
  },

  async uploadCSV(file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
    return res.data;
  },

  async downloadReport() {
    try {
      const res = await api.get('/export', {
        responseType: 'blob'
      });
      
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'civic_fund_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.warn("Backend /export API call failed, generating client-side CSV export fallback...", err);
      // Fallback: Fetch projects data and build CSV client-side
      const projectsRes = await this.getProjects();
      const projects = projectsRes.projects || [];
      if (!projects.length) {
        throw new Error("No data available to export.");
      }

      const headers = [
        "project_id", "project", "ward", "region", "representative",
        "department", "fiscal_year", "allocated_amount", "spent_amount",
        "status", "start_date", "expected_end_date"
      ];

      const csvRows = [headers.join(",")];
      for (const p of projects) {
        const row = [
          p.project_id || '',
          `"${(p.project || '').replace(/"/g, '""')}"`,
          `"${(p.ward || '').replace(/"/g, '""')}"`,
          `"${(p.region || '').replace(/"/g, '""')}"`,
          `"${(p.representative || '').replace(/"/g, '""')}"`,
          `"${(p.department || '').replace(/"/g, '""')}"`,
          `"${(p.fiscal_year || '').replace(/"/g, '""')}"`,
          p.allocated_amount || 0,
          p.spent_amount || 0,
          `"${(p.status || '').replace(/"/g, '""')}"`,
          `"${(p.start_date || '').replace(/"/g, '""')}"`,
          `"${(p.expected_end_date || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(","));
      }

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'civic_fund_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    }
  }
};

export default apiService;
