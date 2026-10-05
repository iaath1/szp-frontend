import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './Widgets.css';



const StatusChart = ({ statuses }) => {

    const todo = statuses?.PENDING || statuses?.todo || 0;
    const inProgress = statuses?.IN_PROGRESS || statuses?.inProgress || 0;
    const review = statuses?.review || 0;
    const done = statuses?.DONE || statuses?.done || 0;

    const totalTasks = todo + inProgress + review + done;

    const data = [
        { name: 'To Do', value: todo, color: 'var(--accent-color)' },
        { name: 'In Progress', value: inProgress, color: '#F59E0B' },
        { name: 'Review', value: review, color: '#10B981' },
        { name: 'Done', value: done, color: '#9CA3AF' },
    ];

    return (
        <div className="widget status-chart-widget">
            <div className="widget-header">
                <h2>Tasks by Status</h2>
            </div>
            <div className="status-content">
                <div className="pie-container">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pie-center-text">
                        <span className="pie-total">{totalTasks}</span>
                        <span className="pie-label">Total</span>
                    </div>
                </div>
                <div className="status-legend">
                    {data.map(item => (
                        <div key={item.name} className="legend-item">
                            <div className="legend-indicator">
                                <span className="dot" style={{ backgroundColor: item.color }}></span>
                                <span className="legend-name">{item.name}</span>
                            </div>
                            <span className="legend-value">{item.value} ({totalTasks > 0 ? Math.round(item.value / totalTasks * 100) : 0}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatusChart;
