import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './Widgets.css';

const data = [
  { name: 'To Do', value: 18, color: '#592BF0' },
  { name: 'In Progress', value: 16, color: '#F59E0B' },
  { name: 'Review', value: 7, color: '#10B981' },
  { name: 'Done', value: 4, color: '#9CA3AF' },
];

const StatusChart = () => {
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
                        <span className="pie-total">45</span>
                        <span className="pie-label">Total</span>
                    </div>
                </div>
                <div className="status-legend">
                    {data.map(item => (
                        <div key={item.name} className="legend-item">
                            <div className="legend-indicator">
                                <span className="dot" style={{backgroundColor: item.color}}></span>
                                <span className="legend-name">{item.name}</span>
                            </div>
                            <span className="legend-value">{item.value} ({Math.round(item.value/45*100)}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatusChart;
