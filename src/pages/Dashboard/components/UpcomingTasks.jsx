import React from 'react';
import { Calendar } from 'lucide-react';
import './Widgets.css';

const tasks = [
    { id: 1, name: 'Design new homepage', category: 'Marketing Website', date: 'May 24, 2024', status: 'overdue', dotColor: '#EF4444', avatars: ['1', '2'] },
    { id: 2, name: 'API integration', category: 'Mobile App', date: 'May 25, 2024', status: 'warning', dotColor: '#F59E0B', avatars: ['3', '4'], extra: 2 },
    { id: 3, name: 'User authentication flow', category: 'SaaS Platform', date: 'May 27, 2024', status: 'normal', dotColor: '#592BF0', avatars: ['5'] },
    { id: 4, name: 'Create dashboard UI', category: 'Admin Panel', date: 'May 30, 2024', status: 'normal', dotColor: '#10B981', avatars: ['6'] },
    { id: 5, name: 'Fix bugs and improvements', category: 'Mobile App', date: 'Jun 2, 2024', status: 'overdue', dotColor: '#EF4444', avatars: ['7', '8'], extra: 1 },
];

const UpcomingTasks = ({ upcomingTasks }) => {

    const formatDate = (dateString) => {
        if (!dateString) return '';

        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="widget upcoming-tasks-widget">
            <div className="widget-header">
                <h2>Upcoming Tasks</h2>
                <a href="#" className="view-all">View all</a>
            </div>
            <div className="task-list">
                {(Array.isArray(upcomingTasks) ? upcomingTasks : []).map(task => (
                    <div key={task.id} className="task-item">
                        <div className="task-name-col">
                            <span className="dot" style={{ backgroundColor: task.dotColor }}></span>
                            <span>{task.title}</span>
                        </div>
                        <div className="task-category">
                            {task.projectTitle}
                        </div>
                        <div className={`task-date ${task.status}`}>
                            <Calendar size={16} />
                            {formatDate(task.deadline)}
                        </div>
                        {/* <div className="task-assignees">
                            {task.avatars.map(avatarId => (
                                <img key={avatarId} src={`https://i.pravatar.cc/150?img=${avatarId}`} alt="Assignee" className="assignee-avatar" />
                            ))}
                            {task.extra && <div className="assignee-more">+{task.extra}</div>}
                        </div> */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingTasks;
