import React, { useState } from 'react';
import { Clock, Shield, AlertTriangle, Activity, ChevronRight, FileText, Network, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AnalysisResultsView() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);

  // Fetch all analyses
  const { data: analysesData, isLoading: analysesLoading } = useQuery({
    queryKey: ['analyses'],
    queryFn: async () => {
      const response = await fetch('/api/analyses');
      if (!response.ok) throw new Error('Failed to fetch analyses');
      return response.json();
    },
  });

  // Fetch detailed analysis data for selected analysis
  const { data: detailsData, isLoading: detailsLoading } = useQuery({
    queryKey: ['analysis-details', selectedAnalysisId],
    queryFn: async () => {
      if (!selectedAnalysisId) return null;
      const response = await fetch(`/api/analyses/${selectedAnalysisId}`);
      if (!response.ok) throw new Error('Failed to fetch analysis details');
      return response.json();
    },
    enabled: !!selectedAnalysisId,
  });

  const analyses = analysesData?.analyses || [];
  const selectedAnalysis = detailsData?.analysis;
  const alerts = detailsData?.alerts || [];
  const droneNodes = detailsData?.droneNodes || [];
  const metrics = detailsData?.metrics || [];

  // Auto-select first analysis if none selected
  React.useEffect(() => {
    if (analyses.length > 0 && !selectedAnalysisId) {
      setSelectedAnalysisId(analyses[0].id);
    }
  }, [analyses, selectedAnalysisId]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrustColor = (trustScore) => {
    if (trustScore > 0.8) return 'text-green-600';
    if (trustScore > 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (analysesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neumorphic-inset p-4 rounded-xl">
          <Activity className="animate-pulse text-[#666]" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#333] font-playfair mb-2">
          Analysis Results
        </h1>
        <p className="text-[#666]">
          View detailed results and metrics from your security analyses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Analysis History List */}
        <div className="lg:col-span-4">
          <div className="neumorphic-card p-6 rounded-xl h-full">
            <h3 className="text-lg font-semibold text-[#333] mb-4 flex items-center">
              <Clock size={20} className="mr-2 text-[#666]" />
              Analysis History
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analyses.map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => setSelectedAnalysisId(analysis.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    selectedAnalysisId === analysis.id
                      ? 'neumorphic-pressed bg-[#d8d8d8]'
                      : 'neumorphic-button hover:bg-[#d8d8d8]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-[#666]" />
                      <span className="font-medium text-[#333] text-sm truncate">
                        {analysis.filename}
                      </span>
                    </div>
                    <ChevronRight 
                      size={16} 
                      className={`text-[#888] transition-transform ${
                        selectedAnalysisId === analysis.id ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#888]">
                      {new Date(analysis.upload_timestamp).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded-lg ${getStatusColor(analysis.status)}`}>
                      {analysis.status}
                    </span>
                  </div>
                  
                  {analysis.status === 'completed' && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-[#666]">
                        Trust: {Math.round((analysis.trust_score || 0) * 100)}%
                      </span>
                      <span className="text-red-600">
                        {analysis.attacks_detected || 0} threats
                      </span>
                    </div>
                  )}
                </button>
              ))}
              
              {analyses.length === 0 && (
                <div className="text-center py-8 text-[#888]">
                  <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No analyses found</p>
                  <p className="text-xs mt-1">Upload a .pcap file to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Analysis View */}
        <div className="lg:col-span-8">
          {selectedAnalysis ? (
            <div className="space-y-6">
              {/* Analysis Overview */}
              <div className="neumorphic-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#333]">
                    {selectedAnalysis.filename}
                  </h3>
                  <span className={`px-3 py-1 rounded-xl text-sm ${getStatusColor(selectedAnalysis.status)}`}>
                    {selectedAnalysis.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="neumorphic-inset p-3 rounded-xl text-center">
                    <div className="text-lg font-bold text-[#333]">
                      {formatFileSize(selectedAnalysis.file_size)}
                    </div>
                    <div className="text-xs text-[#666]">File Size</div>
                  </div>
                  
                  <div className="neumorphic-inset p-3 rounded-xl text-center">
                    <div className="text-lg font-bold text-[#333]">
                      {selectedAnalysis.total_packets?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-[#666]">Total Packets</div>
                  </div>
                  
                  <div className="neumorphic-inset p-3 rounded-xl text-center">
                    <div className="text-lg font-bold text-[#333]">
                      {selectedAnalysis.total_nodes || 'N/A'}
                    </div>
                    <div className="text-xs text-[#666]">Drone Nodes</div>
                  </div>
                  
                  <div className="neumorphic-inset p-3 rounded-xl text-center">
                    <div className="text-lg font-bold text-[#333]">
                      {selectedAnalysis.analysis_duration || 'N/A'}s
                    </div>
                    <div className="text-xs text-[#666]">Analysis Time</div>
                  </div>
                </div>

                {selectedAnalysis.status === 'completed' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="neumorphic-inset p-4 rounded-xl text-center">
                      <div className={`text-2xl font-bold mb-1 ${getTrustColor(selectedAnalysis.trust_score)}`}>
                        {Math.round((selectedAnalysis.trust_score || 0) * 100)}%
                      </div>
                      <div className="text-sm text-[#666]">Trust Score</div>
                    </div>
                    
                    <div className="neumorphic-inset p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {selectedAnalysis.attacks_detected || 0}
                      </div>
                      <div className="text-sm text-[#666]">Attacks Detected</div>
                    </div>
                    
                    <div className="neumorphic-inset p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {Math.round((selectedAnalysis.anomaly_score || 0) * 100)}%
                      </div>
                      <div className="text-sm text-[#666]">Anomaly Score</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Alerts Section */}
              {alerts.length > 0 && (
                <div className="neumorphic-card p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-[#333] mb-4 flex items-center">
                    <AlertTriangle size={20} className="mr-2 text-red-600" />
                    Security Alerts ({alerts.length})
                  </h3>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {alerts.map((alert, index) => (
                      <div key={index} className="neumorphic-inset p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-[#333]">
                              {alert.attack_type}
                            </span>
                            <span className={`px-2 py-1 rounded-lg text-xs ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <span className="text-sm text-[#666]">
                            {Math.round((alert.confidence || 0) * 100)}% confidence
                          </span>
                        </div>
                        
                        <div className="text-sm text-[#666] mb-1">
                          Node: {alert.affected_node_id} • Method: {alert.detection_method}
                        </div>
                        
                        <div className="text-xs text-[#888]">
                          {new Date(alert.timestamp_detected).toLocaleString()}
                        </div>
                        
                        {alert.description && (
                          <div className="text-sm text-[#666] mt-2 bg-[#f0f0f0] p-2 rounded">
                            {alert.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Metrics Chart */}
              {metrics.length > 0 && (
                <div className="neumorphic-card p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-[#333] mb-4 flex items-center">
                    <Activity size={20} className="mr-2 text-[#666]" />
                    Network Metrics Over Time
                  </h3>
                  
                  <div className="chart-container p-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d0d0d0" />
                        <XAxis 
                          dataKey="timestamp_recorded" 
                          stroke="#888" 
                          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#e0e0e0',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '4px 4px 8px rgba(174, 174, 192, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.8)'
                          }}
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="packet_rate" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          name="Packet Rate"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="drop_ratio" 
                          stroke="#EF4444" 
                          strokeWidth={2}
                          name="Drop Ratio"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="average_delay" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          name="Avg Delay"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Drone Nodes Trust Scores */}
              {droneNodes.length > 0 && (
                <div className="neumorphic-card p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-[#333] mb-4 flex items-center">
                    <Network size={20} className="mr-2 text-[#666]" />
                    Drone Nodes Trust Scores
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {droneNodes.slice(0, 12).map((node) => (
                      <div key={node.node_id} className="neumorphic-inset p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-[#333] text-sm">
                            {node.node_id}
                          </span>
                          <span className={`text-sm font-bold ${getTrustColor(node.trust_score)}`}>
                            {Math.round((node.trust_score || 0) * 100)}%
                          </span>
                        </div>
                        
                        <div className="neumorphic-inset p-1 rounded-lg mb-2">
                          <div className="bg-[#e0e0e0] rounded-lg overflow-hidden">
                            <div 
                              className={`h-2 rounded-lg transition-all duration-300 ${
                                node.trust_score > 0.8 ? 'bg-green-500' :
                                node.trust_score > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(node.trust_score || 0) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-[#666]">
                          <span>Sent: {node.packets_sent}</span>
                          <span>Dropped: {node.packets_dropped}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="neumorphic-card p-12 rounded-xl text-center">
              <BarChart3 size={48} className="mx-auto mb-4 text-[#888] opacity-50" />
              <h3 className="text-lg font-semibold text-[#333] mb-2">
                Select an Analysis
              </h3>
              <p className="text-[#666]">
                Choose an analysis from the history to view detailed results and metrics
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}