import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import './Widgets.css';

const StatCard = ({ title, value, change, isPositive, icon: Icon, iconBg, iconColor }) => {
    return (
        <div className="stat-card">
            <div className="stat-header">
                <div className="stat-icon" style={{ backgroundColor: iconBg, color: iconColor }}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="stat-info">
                    <h3>{title}</h3>
                    <h2>{value}</h2>
                    <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        <span>{Math.abs(change)}{title === 'Tasks Completed' ? '%' : ''} from last month</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
