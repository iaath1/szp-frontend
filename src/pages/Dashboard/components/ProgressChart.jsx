import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Widgets.css';

const data = [
  { name: 'May 1', value: 10 },
  { name: 'May 7', value: 30 },
  { name: 'May 14', value: 25 },
  { name: 'May 21', value: 50 },
  { name: 'May 28', value: 45 },
  { name: 'May 31', value: 85 },
];

const ProgressChart = () => {
    return (
        <div className="widget progress-chart-widget">
            <div className="widget-header">
                <h2>Project Progress</h2>
                <select className="date-select">
                    <option>This Month</option>
                </select>
            </div>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                        <Line type="monotone" dataKey="value" stroke="#592BF0" strokeWidth={3} dot={{ r: 5, fill: "#592BF0", stroke: "white", strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProgressChart;
