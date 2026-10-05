import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Phone, MoreVertical, Shield } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar.js';
import { navigate } from '../../router/Router.jsx';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import usersApi from '../../api/users';
import chatApi from '../../api/chat';
import './Team.css';

const TeamPage = () => {
    const [search, setSearch] = useState('');
    const [team, setTeam] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const data = await usersApi.getMyTeam();
                setTeam(data);
            } catch (error) {
                console.error("Failed to load team members:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeam();
    }, []);

    const filteredTeam = team.filter(member => {
        const fullName = `${member.name} ${member.surname}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
    });

    const handleMessageClick = async (memberId) => {
        try {
            const chat = await chatApi.getOrCreatePrivateChat(memberId);
            navigate(`/messages?chatId=${chat.id}`);
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Header title="Team Directory" subtitle="Manage and collaborate with your colleagues" />
                <div className="dashboard-content team-content">
                    
                    <div className="team-toolbar">
                        <div className="team-search">
                            <Search size={18} color="#9CA3AF" />
                            <input 
                                type="text" 
                                placeholder="Search members by name..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary">Invite Member</button>
                    </div>

                    {isLoading ? (
                        <p style={{padding: '20px', color: '#6B7280'}}>Loading team members...</p>
                    ) : (
                        <div className="team-grid">
                            {filteredTeam.map(member => (
                                <div key={member.id} className="team-card">
                                    <div className="team-card-header">
                                        <div className="member-avatar-large">
                                            <img 
                                                src={getAvatarUrl(member.avatarUrl, `${member.name} ${member.surname}`)} 
                                                alt={`${member.name} ${member.surname}`} 
                                            />
                                        </div>
                                        <button className="more-btn"><MoreVertical size={18} /></button>
                                    </div>
                                    <div className="team-card-body">
                                        <h3 
                                            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                                            onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'}
                                            onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
                                            onClick={() => navigate(`/user/${member.id}`)}
                                        >
                                            {member.name} {member.surname}
                                        </h3>
                                        <p className="member-role">{member.email}</p>
                                    </div>
                                    <div className="team-card-actions">
                                        <button className="action-icon-btn" onClick={() => handleMessageClick(member.id)} title="Message">
                                            <MessageSquare size={16} />
                                        </button>
                                        <button className="action-icon-btn"><Phone size={16} /></button>
                                        <button className="action-icon-btn"><Shield size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {filteredTeam.length === 0 && (
                                <p style={{padding: '20px', color: '#6B7280'}}>No team members found.</p>
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default TeamPage;
