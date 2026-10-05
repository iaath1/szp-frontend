import React from 'react';
import { Check, Plus, FileText, UserPlus } from 'lucide-react';
import './Widgets.css';

const RecentActivity = ({ tasks = [], files = [], precomputedActivities }) => {
    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "Just now";
    };

    // If backend provided precomputed activities, map them directly
    if (precomputedActivities && precomputedActivities.length > 0) {
        return (
            <div className="widget recent-activity-widget" >
                <div className="widget-header">
                    <h2>Recent Activity</h2>
                </div>
                <div className="activity-list">
                    {precomputedActivities.map(activity => {
                        let Icon = Plus;
                        let color = '#10B981';
                        let bg = 'var(--bg-success-light)';
                        
                        if (activity.type === 'TASK_COMPLETED') {
                            Icon = Check;
                            color = 'var(--accent-color)';
                            bg = 'var(--bg-accent-light)';
                        } else if (activity.type === 'FILE_UPLOADED') {
                            Icon = FileText;
                            color = '#F59E0B';
                            bg = 'var(--bg-warning-light)';
                        }
                        
                        return (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-icon" style={{ backgroundColor: bg, color: color }}>
                                    <Icon size={20} strokeWidth={2.5} />
                                </div>
                                <div className="activity-details">
                                    <p>{activity.message}</p>
                                    <span>by {activity.userName} &bull; {getTimeAgo(new Date(activity.createdAt))}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Combine tasks and files into a single array of events (Fallback)
    const activities = [];

    // 1. Task events (created or completed)
    tasks.forEach(task => {
        if (task.createdAt) {
            activities.push({
                id: `task-create-${task.id}`,
                type: 'TASK_CREATED',
                text: `Task "${task.title}" created`,
                subtext: `by ${task.assigneeEmail || 'Someone'}`,
                date: new Date(task.createdAt),
                icon: Plus,
                color: '#10B981',
                bg: 'var(--bg-success-light)'
            });
        }
        if (task.status === 'DONE' && task.updatedAt) {
            activities.push({
                id: `task-done-${task.id}`,
                type: 'TASK_COMPLETED',
                text: `Task "${task.title}" completed`,
                subtext: `by ${task.assigneeEmail || 'Someone'}`,
                date: new Date(task.updatedAt),
                icon: Check,
                color: 'var(--accent-color)',
                bg: 'var(--bg-accent-light)'
            });
        }
    });

    // 2. File events
    files.forEach(file => {
        if (file.uploadetAt || file.uploadedAt) {
            activities.push({
                id: `file-${file.id}`,
                type: 'FILE_UPLOADED',
                text: `File "${file.name || file.originalName || 'Document'}" uploaded`,
                subtext: 'by a team member',
                date: new Date(file.uploadetAt || file.uploadedAt),
                icon: FileText,
                color: '#F59E0B',
                bg: 'var(--bg-warning-light)'
            });
        }
    });

    // Sort by date descending and take top 5
    const sortedActivities = activities
        .filter(a => !isNaN(a.date.getTime()))
        .sort((a, b) => b.date - a.date)
        .slice(0, 5);

    return (
        <div className="widget recent-activity-widget" >
            <div className="widget-header">
                <h2>Recent Activity</h2>
            </div>
            <div className="activity-list">
                {sortedActivities.length > 0 ? sortedActivities.map(activity => {
                    const Icon = activity.icon;
                    return (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-icon" style={{ backgroundColor: activity.bg, color: activity.color }}>
                                <Icon size={20} strokeWidth={2.5} />
                            </div>
                            <div className="activity-details">
                                <p>{activity.text}</p>
                                <span>{activity.subtext} &bull; {getTimeAgo(activity.date)}</span>
                            </div>
                        </div>
                    );
                }) : (
                    <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>No recent activity</div>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;
