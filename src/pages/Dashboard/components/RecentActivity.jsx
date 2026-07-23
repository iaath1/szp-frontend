import React from 'react';
import { Check, Plus, FileText, UserPlus } from 'lucide-react';
import './Widgets.css';

const activities = [
    { id: 1, text: 'Task "Design new homepage" completed', subtext: 'by Anna Smith • 2h ago', icon: Check, color: '#592BF0', bg: '#F3F0FF' },
    { id: 2, text: 'New project "Marketing Campaign" created', subtext: 'by You • 5h ago', icon: Plus, color: '#10B981', bg: '#ECFDF5' },
    { id: 3, text: 'File "Project Brief.pdf" uploaded', subtext: 'by John Doe • 1d ago', icon: FileText, color: '#F59E0B', bg: '#FEF3C7' },
    { id: 4, text: 'Emily joined the project "SaaS Platform"', subtext: 'by You • 2d ago', icon: UserPlus, color: '#592BF0', bg: '#F3F0FF' },
];

const RecentActivity = () => {
    return (
        <div className="widget recent-activity-widget">
            <div className="widget-header">
                <h2>Recent Activity</h2>
                <a href="#" className="view-all">View all</a>
            </div>
            <div className="activity-list">
                {activities.map(activity => {
                    const Icon = activity.icon;
                    return (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-icon" style={{ backgroundColor: activity.bg, color: activity.color }}>
                                <Icon size={20} strokeWidth={2.5} />
                            </div>
                            <div className="activity-details">
                                <p>{activity.text}</p>
                                <span>{activity.subtext}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecentActivity;
