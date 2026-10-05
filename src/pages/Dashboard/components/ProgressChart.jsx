import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import tasksApi from '../../../api/tasks.js';
import './Widgets.css';

const ProgressChart = ({ projectId }) => {
    const [chartData, setChartData] = useState([]);
    const [days, setDays] = useState(14);
    
    useEffect(() => {
        const fetchVelocity = async () => {
            try {
                const data = projectId
                    ? await tasksApi.getProjectVelocity(projectId, days)
                    : await tasksApi.getTaskVelocity(days);
                setChartData(data);
            } catch (error) {
                console.error("Failed to fetch task velocity", error);
            }
        };
        fetchVelocity();
    }, [days, projectId]);
    return (
        <div className="widget progress-chart-widget">
            <div className="widget-header">
                <h2>Task Velocity</h2>
                <select className="date-select" value={days} onChange={(e) => setDays(Number(e.target.value))}>
                    <option value={7}>Last 7 Days</option>
                    <option value={14}>Last 14 Days</option>
                    <option value={30}>Last 30 Days</option>
                </select>
            </div>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                        <Line type="monotone" dataKey="completed" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 5, fill: "var(--accent-color)", stroke: "white", strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProgressChart;
