import React, { useState, useRef } from 'react';
import { Upload, FileText, Activity, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export default function UploadAnalysisView() {
  const [dragActive, setDragActive] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Check analysis progress for current upload
  const { data: analysisProgress } = useQuery({
    queryKey: ['analysis-progress', currentAnalysis?.id],
    queryFn: async () => {
      if (!currentAnalysis?.id) return null;
      const response = await fetch(`/api/analyses/${currentAnalysis.id}`);
      if (!response.ok) throw new Error('Failed to fetch analysis progress');
      return response.json();
    },
    enabled: !!currentAnalysis?.id,
    refetchInterval: currentAnalysis?.status === 'processing' ? 2000 : false,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/analyses', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentAnalysis({ ...data.analysis, status: 'processing' });
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
    onError: (error) => {
      console.error('Upload error:', error);
    },
  });

  // Update current analysis when progress data changes
  React.useEffect(() => {
    if (analysisProgress?.analysis) {
      setCurrentAnalysis(analysisProgress.analysis);
      
      // If analysis is completed, clear it after showing results briefly
      if (analysisProgress.analysis.status === 'completed') {
        setTimeout(() => {
          setCurrentAnalysis(null);
        }, 5000);
      }
    }
  }, [analysisProgress]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file) => {
    if (!file.name.endsWith('.pcap')) {
      alert('Please upload a .pcap file');
      return;
    }
    
    uploadMutation.mutate(file);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getProgressSteps = () => [
    { label: 'Parsing network packets', progress: 20, icon: Activity },
    { label: 'Extracting features', progress: 40, icon: Activity },
    { label: 'Running rule-based detection', progress: 60, icon: Activity },
    { label: 'Applying ML anomaly detection', progress: 80, icon: Activity },
    { label: 'Generating trust scores', progress: 90, icon: Activity },
    { label: 'Analysis complete', progress: 100, icon: CheckCircle },
  ];

  const getCurrentStep = (progress) => {
    const steps = getProgressSteps();
    return steps.find(step => progress <= step.progress) || steps[steps.length - 1];
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#333] font-playfair mb-2">
          Upload Analysis
        </h1>
        <p className="text-[#666]">
          Upload .pcap files from NS-3 drone simulations for security analysis
        </p>
      </div>

      {!currentAnalysis ? (
        /* Upload Zone */
        <div className="neumorphic-card p-8 rounded-xl">
          <div
            className={`relative transition-all duration-200 ${
              dragActive ? 'bg-[#d8d8d8]' : ''
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="neumorphic-inset p-12 rounded-xl text-center">
              <div className="neumorphic-button p-6 rounded-full inline-block mb-6">
                <Upload size={48} className="text-[#666]" />
              </div>
              
              <h3 className="text-xl font-semibold text-[#333] mb-2">
                Upload PCAP File
              </h3>
              <p className="text-[#666] mb-6">
                Drag and drop your .pcap file here, or click to browse
              </p>
              
              <button
                onClick={openFileDialog}
                disabled={uploadMutation.isPending}
                className="neumorphic-button px-8 py-3 rounded-xl font-medium text-[#333] hover:bg-[#d8d8d8] transition-colors duration-200 disabled:opacity-50"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Select File'}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pcap"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="mt-6 text-sm text-[#888]">
                <p>Supported format: .pcap files from NS-3 simulations</p>
                <p>Maximum file size: 100MB</p>
              </div>
            </div>
          </div>

          {uploadMutation.isError && (
            <div className="mt-4 neumorphic-inset p-4 rounded-xl">
              <div className="flex items-center text-red-600">
                <AlertCircle size={20} className="mr-2" />
                <span className="font-medium">Upload Error</span>
              </div>
              <p className="text-sm text-[#666] mt-1">
                {uploadMutation.error?.message || 'Failed to upload file'}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="neumorphic-inset p-4 rounded-xl text-center">
              <FileText size={32} className="text-[#666] mx-auto mb-3" />
              <h4 className="font-medium text-[#333] mb-2">1. Prepare File</h4>
              <p className="text-sm text-[#666]">
                Export your NS-3 simulation data as a .pcap file using pcap helpers
              </p>
            </div>
            
            <div className="neumorphic-inset p-4 rounded-xl text-center">
              <Upload size={32} className="text-[#666] mx-auto mb-3" />
              <h4 className="font-medium text-[#333] mb-2">2. Upload</h4>
              <p className="text-sm text-[#666]">
                Drag and drop or select your .pcap file to begin analysis
              </p>
            </div>
            
            <div className="neumorphic-inset p-4 rounded-xl text-center">
              <Activity size={32} className="text-[#666] mx-auto mb-3" />
              <h4 className="font-medium text-[#333] mb-2">3. Monitor</h4>
              <p className="text-sm text-[#666]">
                Watch real-time progress as the IDS analyzes your network data
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Analysis Progress */
        <div className="space-y-6">
          {/* File Info */}
          <div className="neumorphic-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="neumorphic-inset p-3 rounded-xl">
                  <FileText size={24} className="text-[#666]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#333]">{currentAnalysis.filename}</h3>
                  <p className="text-sm text-[#666]">
                    {formatFileSize(currentAnalysis.file_size)} • 
                    Uploaded {new Date(currentAnalysis.upload_timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {currentAnalysis.status === 'processing' && (
                  <Activity className="animate-spin text-blue-600" size={20} />
                )}
                {currentAnalysis.status === 'completed' && (
                  <CheckCircle className="text-green-600" size={20} />
                )}
                <span className={`text-sm font-medium ${
                  currentAnalysis.status === 'processing' ? 'text-blue-600' :
                  currentAnalysis.status === 'completed' ? 'text-green-600' :
                  'text-[#666]'
                }`}>
                  {currentAnalysis.status === 'processing' ? 'Processing' :
                   currentAnalysis.status === 'completed' ? 'Complete' : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="neumorphic-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-[#333] mb-4">Analysis Progress</h3>
            
            {/* Progress Bar */}
            <div className="neumorphic-inset p-2 rounded-xl mb-6">
              <div className="bg-[#e0e0e0] rounded-lg overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-lg transition-all duration-300"
                  style={{ width: `${currentAnalysis.progress || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-[#666]">
                  {getCurrentStep(currentAnalysis.progress || 0).label}
                </span>
                <span className="text-sm font-medium text-[#333]">
                  {currentAnalysis.progress || 0}%
                </span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getProgressSteps().map((step, index) => {
                const isActive = (currentAnalysis.progress || 0) >= step.progress;
                const isCurrent = getCurrentStep(currentAnalysis.progress || 0).progress === step.progress;
                
                return (
                  <div
                    key={index}
                    className={`neumorphic-inset p-3 rounded-lg transition-all duration-300 ${
                      isActive ? 'bg-[#d8d8d8]' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isActive ? 'bg-green-100' : 'bg-[#f0f0f0]'
                      }`}>
                        <step.icon 
                          size={16} 
                          className={`${
                            isActive ? 'text-green-600' : 'text-[#888]'
                          } ${isCurrent && currentAnalysis.status === 'processing' ? 'animate-pulse' : ''}`}
                        />
                      </div>
                      <span className={`text-sm ${
                        isActive ? 'text-[#333] font-medium' : 'text-[#888]'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Summary (shown when complete) */}
          {currentAnalysis.status === 'completed' && (
            <div className="neumorphic-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-[#333] mb-4 flex items-center">
                <CheckCircle size={20} className="mr-2 text-green-600" />
                Analysis Complete
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="neumorphic-inset p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {Math.round((currentAnalysis.trust_score || 0) * 100)}%
                  </div>
                  <div className="text-sm text-[#666]">Overall Trust Score</div>
                </div>
                
                <div className="neumorphic-inset p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {currentAnalysis.attacks_detected || 0}
                  </div>
                  <div className="text-sm text-[#666]">Attacks Detected</div>
                </div>
                
                <div className="neumorphic-inset p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {Math.round((currentAnalysis.anomaly_score || 0) * 100)}%
                  </div>
                  <div className="text-sm text-[#666]">Anomaly Score</div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setCurrentAnalysis(null)}
                  className="neumorphic-button px-6 py-2 rounded-xl font-medium text-[#333] hover:bg-[#d8d8d8] transition-colors duration-200"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}