import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Database,
  Layers,
  FileX,
  CopyX
} from 'lucide-react';
import apiService from '../services/api';

export const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [responseResult, setResponseResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.toLowerCase().endsWith('.csv')) {
        setFile(droppedFile);
        setUploadError(null);
        setResponseResult(null);
      } else {
        setUploadError('Only CSV files (.csv) are supported.');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.toLowerCase().endsWith('.csv')) {
        setFile(selectedFile);
        setUploadError(null);
        setResponseResult(null);
      } else {
        setUploadError('Only CSV files (.csv) are supported.');
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setResponseResult(null);
    setUploadProgress(10);

    try {
      const result = await apiService.uploadCSV(file, (evt) => {
        if (evt.total) {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setUploadProgress(percent);
        }
      });
      setResponseResult(result);
    } catch (err) {
      console.error("CSV Upload failed:", err);
      const detail = err.response?.data?.detail || err.message || "Failed to upload CSV file.";
      setUploadError(detail);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page max-w-4xl mx-auto space-y-6">
      <div className="page-header text-center">
        <div className="inline-flex items-center space-x-2 text-blue-600 text-sm font-semibold mb-1 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
          <UploadCloud className="w-4 h-4" />
          <span>Data Ingestion Engine</span>
        </div>
        <h1 className="page-title text-3xl">Upload Civic Spending Data</h1>
        <p className="page-subtitle max-w-xl mx-auto">
          Upload a CSV file to validate, standardize, and process public spending records into the civic database.
        </p>
      </div>

      {!responseResult && (
        <div className="card p-8 bg-white border border-slate-200 shadow-sm rounded-2xl">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`dropzone-area p-10 border-2 border-dashed rounded-xl text-center transition-all ${
              dragging
                ? 'border-blue-600 bg-blue-50/50'
                : file
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              id="file-upload-input"
              onChange={handleFileSelect}
              className="hidden"
            />

            <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                {file ? <FileCheck className="w-8 h-8 text-emerald-600" /> : <UploadCloud className="w-8 h-8" />}
              </div>

              {file ? (
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{file.name}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    Size: {(file.size / 1024).toFixed(2)} KB • Ready for processing
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Drag and drop your CSV file here</h4>
                  <p className="text-sm text-slate-500 mt-1">or click to browse local files from your computer</p>
                  <p className="text-xs text-slate-400 mt-2 font-mono">Accepts: .csv spending format</p>
                </div>
              )}
            </label>
          </div>

          {uploadError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-3 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Processing & Validating CSV...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {file && !uploading && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setFile(null)}
                className="btn btn-ghost btn-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                className="btn btn-primary btn-md"
              >
                Upload & Process Data
              </button>
            </div>
          )}
        </div>
      )}

      {responseResult && (
        <div className="card p-8 bg-white border border-emerald-200 shadow-md rounded-2xl space-y-6">
          <div className="flex items-center space-x-3 text-emerald-600 pb-4 border-b border-slate-100">
            <CheckCircle className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold text-slate-900">Data Processed Successfully</h3>
              <p className="text-xs text-slate-500">File: {responseResult.filename}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <Layers className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <span className="text-xs text-slate-500 font-semibold block">Original</span>
              <span className="text-xl font-bold text-slate-900">{responseResult.original_records}</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="text-xs text-emerald-700 font-semibold block">Valid</span>
              <span className="text-xl font-bold text-emerald-900">{responseResult.valid_records}</span>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <CopyX className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <span className="text-xs text-amber-700 font-semibold block">Duplicates</span>
              <span className="text-xl font-bold text-amber-900">{responseResult.duplicates_removed}</span>
            </div>

            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-center">
              <FileX className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <span className="text-xs text-red-700 font-semibold block">Invalid</span>
              <span className="text-xl font-bold text-red-900">{responseResult.invalid_records}</span>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center col-span-2 md:col-span-1">
              <Database className="w-5 h-5 text-blue-700 mx-auto mb-1" />
              <span className="text-xs text-blue-800 font-semibold block">In Database</span>
              <span className="text-xl font-bold text-blue-900">{responseResult.database_records}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setFile(null);
                setResponseResult(null);
              }}
              className="btn btn-secondary btn-md"
            >
              Upload Another CSV
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary btn-md"
            >
              View Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
