import React from 'react';
import './Widgets.css';

const team = [
    { id: 1, name: 'Anna Smith', progress: 80, avatar: '1' },
    { id: 2, name: 'John Doe', progress: 60, avatar: '2' },
    { id: 3, name: 'Emily Johnson', progress: 40, avatar: '3' },
    { id: 4, name: 'Michael Brown', progress: 20, avatar: '4' },
];

const TeamWorkload = () => {
    return (
        <div className="widget team-workload-widget">
            <div className="widget-header">
                <h2>Team Workload</h2>
                <a href="#" className="view-all">View all</a>
            </div>
            <div className="workload-list">
                {team.map(member => (
                    <div key={member.id} className="workload-item">
                        <div className="workload-user">
                            <img src={`https://i.pravatar.cc/150?img=${member.avatar}`} alt={member.name} />
                            <span>{member.name}</span>
                        </div>
                        <div className="workload-bar-container">
                            <div className="workload-bar" style={{ width: `${member.progress}%` }}></div>
                        </div>
                        <div className="workload-percent">{member.progress}%</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamWorkload;
