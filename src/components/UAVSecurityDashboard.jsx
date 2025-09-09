import React, { useState, useEffect } from "react";
import {
  Shield,
  Upload,
  BarChart3,
  Menu,
  X,
  AlertTriangle,
  Activity,
  Eye,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DashboardView from "./DashboardView";
import UploadAnalysisView from "./UploadAnalysisView";
import AnalysisResultsView from "./AnalysisResultsView";

export default function UAVSecurityDashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Security overview",
    },
    {
      id: "upload",
      label: "Upload Analysis",
      icon: Upload,
      description: "Upload .pcap files",
    },
    {
      id: "results",
      label: "Analysis Results",
      icon: Eye,
      description: "View detailed results",
    },
  ];

  return (
    <div className="min-h-screen bg-[#e0e0e0] font-inter">
      {/* Header */}
      <header className="bg-[#e0e0e0] border-b border-[#d0d0d0] neumorphic-border">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden neumorphic-button p-2 rounded-xl"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="flex items-center space-x-3">
                <div className="neumorphic-inset p-3 rounded-xl">
                  <Shield size={28} className="text-[#666]" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-[#333] font-playfair">
                    UAV Security Monitor
                  </h1>
                  <p className="text-sm text-[#666]">
                    Drone Swarm Intrusion Detection System
                  </p>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2 neumorphic-inset px-4 py-2 rounded-xl">
              <Activity size={16} className="text-green-600" />
              <span className="text-sm text-[#666]">System Active</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static inset-y-0 left-0 z-50 w-80 bg-[#e0e0e0] neumorphic-card border-r border-[#d0d0d0]`}
        >
          <div className="p-6 space-y-6">
            {/* Navigation */}
            <nav className="space-y-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "neumorphic-pressed bg-[#d8d8d8]"
                        : "neumorphic-button hover:bg-[#d8d8d8]"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={isActive ? "text-[#333]" : "text-[#666]"}
                    />
                    <div className="text-left">
                      <div
                        className={`font-medium ${isActive ? "text-[#333]" : "text-[#666]"}`}
                      >
                        {item.label}
                      </div>
                      <div className="text-xs text-[#888]">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats */}
            <div className="neumorphic-inset p-4 rounded-xl">
              <h3 className="text-sm font-medium text-[#666] mb-3">
                Quick Stats
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#888]">Active Analyses</span>
                  <span className="text-[#333] font-medium">4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#888]">Threats Today</span>
                  <span className="text-red-600 font-medium">2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#888]">Avg Trust Score</span>
                  <span className="text-green-600 font-medium">87%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          <main className="p-6">
            {activeView === "dashboard" && <DashboardView />}
            {activeView === "upload" && <UploadAnalysisView />}
            {activeView === "results" && <AnalysisResultsView />}
          </main>
        </div>
      </div>

      {/* Neumorphic Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }

        .neumorphic-card {
          background: #e0e0e0;
          box-shadow: 
            8px 8px 16px rgba(174, 174, 192, 0.4),
            -8px -8px 16px rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .neumorphic-button {
          background: #e0e0e0;
          box-shadow: 
            4px 4px 8px rgba(174, 174, 192, 0.4),
            -4px -4px 8px rgba(255, 255, 255, 0.8);
          border: none;
          transition: all 0.2s ease;
        }

        .neumorphic-button:hover {
          box-shadow: 
            6px 6px 12px rgba(174, 174, 192, 0.5),
            -6px -6px 12px rgba(255, 255, 255, 0.9);
        }

        .neumorphic-button:active,
        .neumorphic-pressed {
          box-shadow: 
            inset 4px 4px 8px rgba(174, 174, 192, 0.4),
            inset -4px -4px 8px rgba(255, 255, 255, 0.8);
        }

        .neumorphic-inset {
          background: #e0e0e0;
          box-shadow: 
            inset 4px 4px 8px rgba(174, 174, 192, 0.4),
            inset -4px -4px 8px rgba(255, 255, 255, 0.8);
        }

        .neumorphic-border {
          border-bottom: 1px solid rgba(174, 174, 192, 0.2);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .stat-card {
          background: #e0e0e0;
          box-shadow: 
            6px 6px 12px rgba(174, 174, 192, 0.4),
            -6px -6px 12px rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          box-shadow: 
            8px 8px 16px rgba(174, 174, 192, 0.5),
            -8px -8px 16px rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
        }

        .chart-container {
          background: #e0e0e0;
          box-shadow: 
            inset 2px 2px 4px rgba(174, 174, 192, 0.3),
            inset -2px -2px 4px rgba(255, 255, 255, 0.7);
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}
