import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Calendar as CalendarIcon, Filter, Loader } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import reportsApi from '../../api/reports.js';
import './Reports.css';

const COLORS = ['#592BF0', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const ReportsPage = () => {
    const [dateRange, setDateRange] = useState('This Week');

    // Real state from backend
    const [metrics, setMetrics] = useState({ completedTasks: 0, productivityScore: 0, overdueTasks: 0 });
    const [timeData, setTimeData] = useState([]);
    const [projectData, setProjectData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            setIsLoading(true);
            try {
                const data = await reportsApi.getReport(dateRange);
                setMetrics(data.metrics || { completedTasks: 0, productivityScore: 0, overdueTasks: 0 });
                setTimeData(data.timeData || []);
                setProjectData(data.projectData || []);
            } catch (error) {
                console.error("Failed to load reports:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReportData();
    }, [dateRange]);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Header title="Reports & Analytics" subtitle="Track your productivity and project metrics" />
                <div className="dashboard-content reports-content">

                    <div className="reports-toolbar">
                        <div className="date-filter">
                            <CalendarIcon size={18} color="#6B7280" />
                            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                                <option>This Week</option>
                                <option>Last Week</option>
                                <option>This Month</option>
                                <option>This Quarter</option>
                            </select>
                        </div>
                        <div className="reports-actions">
                            <button className="btn-secondary"><Filter size={16} style={{ marginRight: '8px' }} /> Add Filter</button>
                            <button className="btn-primary"><Download size={16} style={{ marginRight: '8px' }} /> Export CSV</button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: '#6B7280' }}>
                            <Loader className="spinner" size={24} style={{ marginRight: '10px' }} /> Loading report data...
                        </div>
                    ) : (
                        <>
                            <div className="reports-metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-title">Tasks Completed</div>
                                    <div className="metric-value">{metrics.completedTasks}</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-title">Productivity Score</div>
                                    <div className="metric-value">{metrics.productivityScore}%</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-title">Overdue Tasks</div>
                                    <div className="metric-value" style={{ color: metrics.overdueTasks > 0 ? '#EF4444' : 'inherit' }}>
                                        {metrics.overdueTasks}
                                    </div>
                                </div>
                            </div>

                            <div className="reports-charts-grid">
                                <div className="chart-card large-chart">
                                    <h3>Tasks Completed</h3>
                                    <div className="chart-container">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={timeData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                <YAxis stroke="#10B981" axisLine={false} tickLine={false} />
                                                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                                <Legend />
                                                <Bar dataKey="tasks" name="Tasks Completed" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="chart-card small-chart">
                                    <h3>Tasks by Project</h3>
                                    <div className="chart-container">
                                        {projectData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={projectData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {projectData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                                    <Legend verticalAlign="bottom" height={36} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF' }}>
                                                No tasks found for this period
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ReportsPage;
