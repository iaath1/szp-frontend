import { Mail, MoreHorizontal, UserPlus } from 'lucide-react';
import { navigate } from '../../../router/Router.jsx';
import { getAvatarUrl } from '../../../utils/avatar.js';
import './TeamTab.css';

const TeamTab = ({ members, projectId }) => {
    
    // Safely extract properties handling both flattened and nested DTO structures
    const getMemberName = (m) => {
        if (m.user && m.user.name) return `${m.user.name} ${m.user.surname || ''}`.trim();
        return m.name || 'Unknown User';
    };

    const getMemberRole = (m) => {
        const role = m.role || m.projectRole || m.memberRole || (m.user && m.user.role) || (m.user && m.user.projectRole);
        if (role && typeof role === 'object') return role.name || 'Member';
        if (role && typeof role === 'string') {
            return role.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }
        return 'Member';
    };

    const getMemberEmail = (m) => {
        if (m.user && m.user.email) return m.user.email;
        return m.email || '';
    };

    const getMemberAvatar = (m, name) => {
        let path = null;
        if (m.user && m.user.avatarUrl) path = m.user.avatarUrl;
        else if (m.avatarUrl) path = m.avatarUrl;
        
        return getAvatarUrl(path, name);
    };

    const membersList = Array.isArray(members) ? members : [];

    return (
        <div className="team-tab">
            <div className="team-toolbar">
                <h3 className="team-count">All Members ({membersList.length})</h3>
                <button 
                    className="btn-primary"
                    onClick={() => navigate(`/projects/${projectId}/invite`)}
                >
                    <UserPlus size={16} /> Invite Member
                </button>
            </div>
            
            <div className="team-grid">
                {membersList.length === 0 ? (
                    <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '48px', color: '#6B7280', textAlign: 'center' }}>
                        No members found. Invite some to get started!
                    </div>
                ) : (
                    membersList.map((member, index) => {
                        const name = getMemberName(member);
                        const role = getMemberRole(member);
                        const email = getMemberEmail(member);
                        const avatarUrl = getMemberAvatar(member, name);
                        const isOwner = member.isOwner || (role.toLowerCase().includes('manager'));

                        return (
                            <div key={member.id || index} className="team-member-card">
                                <div className="tmc-header">
                                    <img src={avatarUrl} alt={name} className="tmc-avatar" />
                                    <button className="btn-icon-small"><MoreHorizontal size={16} /></button>
                                </div>
                                <div className="tmc-info">
                                    <h4 className="tmc-name">{name}</h4>
                                    <span className="tmc-role">{role}</span>
                                    {isOwner && <span className="tmc-badge">Owner</span>}
                                </div>
                                <div className="tmc-footer">
                                    <div className="tmc-contact">
                                        <Mail size={14} />
                                        <span>{email}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TeamTab;
