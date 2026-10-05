import React from 'react';
import './AnalyticsTab.css';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { Target, CheckCircle, Clock, Users } from 'lucide-react';
import StatusChart from '../../Dashboard/components/StatusChart.jsx';

const AnalyticsTab = ({ tasksStats, tasks = [], members = [] }) => {
    // 1. Status Data - No longer needed, handled by StatusChart

    // 2. Member Workload Data
    const workloadMap = {};
    members.forEach(m => {
        workloadMap[m.email] = { name: `${m.name} ${m.surname}`, TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0, OVERDUE: 0 };
    });

    tasks.forEach(task => {
        if (task.assigneeEmail && workloadMap[task.assigneeEmail]) {
            if (workloadMap[task.assigneeEmail][task.status] !== undefined) {
                workloadMap[task.assigneeEmail][task.status]++;
            }
        }
    });

    const workloadData = Object.values(workloadMap).filter(
        d => d.TODO > 0 || d.IN_PROGRESS > 0 || d.REVIEW > 0 || d.DONE > 0 || d.OVERDUE > 0
    );

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;

    return (
        <div className="analytics-tab">
            <div className="analytics-summary-cards">
                <div className="analytics-card">
                    <div className="ac-icon" style={{ background: 'var(--bg-accent-light)', color: 'var(--accent-color)' }}>
                        <Target size={24} />
                    </div>
                    <div className="ac-content">
                        <h4>Total Tasks</h4>
                        <div className="ac-value">{totalTasks}</div>
                    </div>
                </div>
                <div className="analytics-card">
                    <div className="ac-icon" style={{ background: 'var(--bg-success-light)', color: '#10B981' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="ac-content">
                        <h4>Completed</h4>
                        <div className="ac-value">{completedTasks}</div>
                    </div>
                </div>
                <div className="analytics-card">
                    <div className="ac-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                        <Clock size={24} />
                    </div>
                    <div className="ac-content">
                        <h4>In Progress</h4>
                        <div className="ac-value">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</div>
                    </div>
                </div>
                <div className="analytics-card">
                    <div className="ac-icon" style={{ background: 'var(--bg-warning-light)', color: '#F59E0B' }}>
                        <Users size={24} />
                    </div>
                    <div className="ac-content">
                        <h4>Active Members</h4>
                        <div className="ac-value">{workloadData.length}</div>
                    </div>
                </div>
            </div>

            <div className="analytics-charts-row">
                <div className="chart-container" style={{ padding: 0, overflow: 'hidden' }}>
                    <StatusChart statuses={tasksStats} />
                </div>

                <div className="chart-container">
                    <h3>Member Workload</h3>
                    {workloadData.length > 0 ? (
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={workloadData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                    maxBarSize={60}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Bar dataKey="DONE" name="Done" stackId="a" fill="#9CA3AF" />
                                    <Bar dataKey="REVIEW" name="Review" stackId="a" fill="#10B981" />
                                    <Bar dataKey="IN_PROGRESS" name="In Progress" stackId="a" fill="#F59E0B" />
                                    <Bar dataKey="TODO" name="To Do" stackId="a" fill="var(--accent-color)" />
                                    <Bar dataKey="OVERDUE" name="Overdue" stackId="a" fill="#EF4444" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="chart-empty">No member assignments found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTab;
