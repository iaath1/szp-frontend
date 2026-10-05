import React from 'react';
import './Widgets.css';
import { getAvatarUrl } from '../../../utils/avatar';

const TeamWorkload = ({ members = [], tasks = [], precomputedWorkload }) => {
    // If backend provided precomputed workload, use it directly
    if (precomputedWorkload && precomputedWorkload.length > 0) {
        return (
            <div className="widget team-workload-widget" >
                <div className="widget-header">
                    <h2>Team Workload</h2>
                </div>
                <div className="workload-list">
                    {precomputedWorkload.slice(0, 5).map(member => (
                        <div key={member.id} className="workload-item">
                            <div className="workload-user">
                                <img src={getAvatarUrl(member.avatarUrl, member.name)} alt={member.name} />
                                <span>{member.name.length > 15 ? member.name.substring(0, 15) + '...' : member.name}</span>
                            </div>
                            <div className="workload-bar-container" style={{ flex: 1, margin: '0 12px' }}>
                                <div className="workload-bar" style={{ width: `${member.progress}%` }}></div>
                            </div>
                            <div className="workload-percent">{member.progress}%</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Otherwise calculate workload per member (fallback for Project Details)
    const team = members.map(member => {
        const memberTasks = tasks.filter(t => t.assigneeEmail === member.email);
        const total = memberTasks.length;
        const done = memberTasks.filter(t => t.status === 'DONE').length;
        const progress = total === 0 ? 0 : Math.round((done / total) * 100);

        return {
            id: member.id,
            name: `${member.name} ${member.surname}`,
            email: member.email,
            avatarUrl: member.avatarUrl,
            progress: progress,
            totalTasks: total
        };
    }).sort((a, b) => b.totalTasks - a.totalTasks).slice(0, 5); // Show top 5

    return (
        <div className="widget team-workload-widget" >
            <div className="widget-header">
                <h2>Team Workload</h2>
            </div>
            <div className="workload-list">
                {team.length > 0 ? team.map(member => (
                    <div key={member.id} className="workload-item">
                        <div className="workload-user">
                            <img src={getAvatarUrl(member.avatarUrl, member.name)} alt={member.name} />
                            <span>{member.name.length > 15 ? member.name.substring(0, 15) + '...' : member.name}</span>
                        </div>
                        <div className="workload-bar-container" style={{ flex: 1, margin: '0 12px' }}>
                            <div className="workload-bar" style={{ width: `${member.progress}%` }}></div>
                        </div>
                        <div className="workload-percent">{member.progress}%</div>
                    </div>
                )) : (
                    <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>No team members</div>
                )}
            </div>
        </div>
    );
};

export default TeamWorkload;
