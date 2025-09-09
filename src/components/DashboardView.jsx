import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  Network,
  Clock,
  Target,
  Zap,
  BarChart3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardView() {
  const [networkNodes, setNetworkNodes] = useState([]);

  // Fetch dashboard statistics
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Generate network topology visualization data
  useEffect(() => {
    const nodes = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i * 2 * Math.PI) / 12;
      const radius = 100 + Math.random() * 80;
      const trustScore = 0.6 + Math.random() * 0.4;

      nodes.push({
        id: `UAV_${String(i + 1).padStart(2, "0")}`,
        x: 150 + Math.cos(angle) * radius,
        y: 150 + Math.sin(angle) * radius,
        trustScore: trustScore,
        status:
          trustScore > 0.8
            ? "trusted"
            : trustScore > 0.5
              ? "suspicious"
              : "malicious",
      });
    }
    setNetworkNodes(nodes);
  }, []);

  // Sample data for charts
  const networkMetricsData = [
    { time: "00:00", packetRate: 145, dropRatio: 8, avgDelay: 12 },
    { time: "04:00", packetRate: 152, dropRatio: 12, avgDelay: 15 },
    { time: "08:00", packetRate: 138, dropRatio: 25, avgDelay: 22 },
    { time: "12:00", packetRate: 125, dropRatio: 34, avgDelay: 28 },
    { time: "16:00", packetRate: 162, dropRatio: 15, avgDelay: 18 },
    { time: "20:00", packetRate: 148, dropRatio: 19, avgDelay: 16 },
  ];

  const pieColors = ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neumorphic-inset p-4 rounded-xl">
          <Activity className="animate-pulse text-[#666]" size={32} />
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentThreats = dashboardData?.recentThreats || [];
  const threatDistribution = dashboardData?.threatDistribution || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#333] font-playfair mb-2">
            Security Dashboard
          </h1>
          <p className="text-[#666]">
            Real-time monitoring and threat detection for UAV networks
          </p>
        </div>
        <div className="neumorphic-inset px-4 py-2 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-[#666]">Live Monitoring</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#888] font-medium">Total Analyses</p>
              <p className="text-2xl font-bold text-[#333] mt-1">
                {stats.totalAnalyses || 0}
              </p>
            </div>
            <div className="neumorphic-inset p-3 rounded-xl">
              <BarChart3 size={24} className="text-[#666]" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp size={16} className="text-green-600 mr-1" />
            <span className="text-green-600">+12% from last week</span>
          </div>
        </div>

        <div className="stat-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#888] font-medium">Active Threats</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats.activeThreats || 0}
              </p>
            </div>
            <div className="neumorphic-inset p-3 rounded-xl">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-[#888]">Last 24 hours</span>
          </div>
        </div>

        <div className="stat-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#888] font-medium">
                Average Trust Score
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {Math.round((stats.averageTrustScore || 0) * 100)}%
              </p>
            </div>
            <div className="neumorphic-inset p-3 rounded-xl">
              <Shield size={24} className="text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-green-600">
              Network Health: {stats.networkHealth || "Unknown"}
            </span>
          </div>
        </div>

        <div className="stat-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#888] font-medium">Response Time</p>
              <p className="text-2xl font-bold text-[#333] mt-1">1.2s</p>
            </div>
            <div className="neumorphic-inset p-3 rounded-xl">
              <Zap size={24} className="text-[#666]" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-[#888]">Avg detection latency</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Threats */}
        <div className="lg:col-span-1">
          <div className="neumorphic-card p-6 rounded-xl h-full">
            <h3 className="text-lg font-semibold text-[#333] mb-4 flex items-center">
              <AlertTriangle size={20} className="mr-2 text-red-600" />
              Recent Threats
            </h3>
            <div className="space-y-3">
              {recentThreats.slice(0, 5).map((threat, index) => (
                <div key={index} className="neumorphic-inset p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#333]">
                      {threat.attack_type}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-lg ${
                        threat.severity === "critical"
                          ? "bg-red-200 text-red-800"
                          : threat.severity === "high"
                            ? "bg-orange-200 text-orange-800"
                            : threat.severity === "medium"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-blue-200 text-blue-800"
                      }`}
                    >
                      {threat.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[#666]">
                    Node: {threat.affected_node_id}
                  </p>
                  <p className="text-xs text-[#888]">
                    {new Date(threat.timestamp_detected).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              {recentThreats.length === 0 && (
                <div className="text-center py-8 text-[#888]">
                  <Shield size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No recent threats detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Network Metrics Chart */}
        <div className="lg:col-span-2">
          <div className="neumorphic-card p-6 rounded-xl h-full">
            <h3 className="text-lg font-semibold text-[#333] mb-4 flex items-center">
              <Activity size={20} className="mr-2 text-[#666]" />
              Network Metrics
            </h3>
            <div className="chart-container p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={networkMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d0d0d0" />
                  <XAxis dataKey="time" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#e0e0e0",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow:
                        "4px 4px 8px rgba(174, 174, 192, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.8)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="packetRate"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Packet Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="dropRatio"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Drop Ratio %"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgDelay"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Avg Delay (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Distribution */}
        <div className="neumorphic-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-[#333] mb-4 flex items-center">
            <Target size={20} className="mr-2 text-[#666]" />
            Threat Distribution
          </h3>
          <div className="chart-container p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="attack_type"
                >
                  {threatDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#e0e0e0",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow:
                      "4px 4px 8px rgba(174, 174, 192, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.8)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {threatDistribution.map((threat, index) => (
              <div
                key={threat.attack_type}
                className="flex items-center space-x-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: pieColors[index % pieColors.length],
                  }}
                ></div>
                <span className="text-sm text-[#666]">
                  {threat.attack_type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Network Topology */}
        <div className="neumorphic-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-[#333] mb-4 flex items-center">
            <Network size={20} className="mr-2 text-[#666]" />
            Network Topology
          </h3>
          <div className="chart-container p-4 h-64 relative">
            <svg width="100%" height="100%" viewBox="0 0 300 300">
              {/* Connection lines */}
              {networkNodes.map((node, i) =>
                networkNodes
                  .slice(i + 1)
                  .map((otherNode, j) => (
                    <line
                      key={`connection-${i}-${j}`}
                      x1={node.x}
                      y1={node.y}
                      x2={otherNode.x}
                      y2={otherNode.y}
                      stroke="#d0d0d0"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  )),
              )}

              {/* Nodes */}
              {networkNodes.map((node, index) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="8"
                    fill={
                      node.status === "trusted"
                        ? "#10B981"
                        : node.status === "suspicious"
                          ? "#F59E0B"
                          : "#EF4444"
                    }
                    stroke="#e0e0e0"
                    strokeWidth="2"
                  />
                  <text
                    x={node.x}
                    y={node.y - 12}
                    textAnchor="middle"
                    className="text-xs fill-[#666]"
                  >
                    {node.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-[#666]">Trusted</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-[#666]">Suspicious</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-[#666]">Malicious</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
