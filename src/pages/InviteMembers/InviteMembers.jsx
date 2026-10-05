import { useState, useEffect } from 'react';
import {
    ArrowLeft, Send, X, Users, CheckCircle2, ChevronDown,
    Globe, Eye, PenTool, Code, ShieldCheck, Mail, Upload, FileText, Settings, ExternalLink, Search, Link as LinkIcon, AlertCircle, Copy, UserPlus
} from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar.js';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import { navigate } from "../../router/Router.jsx";
import projects from "../../api/projects.js";
import users from "../../api/users.js";
import apiClient from "../../api/client.js";
import './InviteMembers.css';



const ROLES = [
    { id: 'PROJECT_MANAGER', name: 'Project Manager', desc: 'Full access to project settings, members, tasks and reports.', icon: <CheckCircle2 size={24} /> },
    { id: 'DEVELOPER', name: 'Developer', desc: 'Can view and edit tasks, upload files and comment.', icon: <Code size={24} /> },
    { id: 'DESIGNER', name: 'Designer', desc: 'Can view and edit tasks related to design and assets.', icon: <PenTool size={24} /> },
    { id: 'QA_ENGINEER', name: 'QA Engineer', desc: 'Can create and manage bugs, test and comment.', icon: <ShieldCheck size={24} /> },
    { id: 'VIEWER', name: 'Viewer', desc: 'Can only view project information and tasks.', icon: <Eye size={24} /> },
];

const InviteMembers = ({ params }) => {
    const projectId = params?.id;
    const [projectDetails, setProjectDetails] = useState(null);
    const [emailInput, setEmailInput] = useState('');
    const [activeRoleCard, setActiveRoleCard] = useState('VIEWER'); // For the bottom role cards
    const [notify, setNotify] = useState(true);
    const [invitedUsers, setInvitedUsers] = useState([]);
    const [suggested, setSuggested] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [openRoleDropdownId, setOpenRoleDropdownId] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            if (!projectId) return;
            try {
                const details = await projects.getProjectInfo(projectId);
                setProjectDetails(details);
            } catch (error) {
                console.error("Error fetching project details:", error);
            }
        };

        const fetchSuggestedUsers = async () => {
            if (!projectId) return;
            try {
                const suggestedUsers = await users.getSuggestedUsers(projectId);
                setSuggested(suggestedUsers);
            } catch (error) {
                console.error("Error fetching suggested users:", error);
            }
        };
        fetchSuggestedUsers();
        fetchProject();
    }, [projectId]);

    useEffect(() => {
        const fetchSearch = async () => {
            if (emailInput.trim().length < 2) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }
            setIsSearching(true);
            try {
                const res = await apiClient.get(`/api/search?q=${encodeURIComponent(emailInput)}`);
                const usersFound = res.data.filter(item => item.type === 'USER');
                setSearchResults(usersFound);
                setShowDropdown(true);
            } catch (err) {
                console.error("Error searching users", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [emailInput]);

    const handleAddManual = () => {
        if (!emailInput.trim() || !emailInput.includes('@')) return;

        // Find if already added
        if (invitedUsers.find(u => u.email === emailInput)) {
            setEmailInput('');
            return;
        }

        const roleObj = ROLES.find(r => r.id === activeRoleCard);
        
        const newUser = {
            id: Date.now(),
            name: emailInput.split('@')[0], // Mock name
            email: emailInput,
            roleId: roleObj?.id || 'DEVELOPER',
            roleName: roleObj?.name || 'Developer',
            avatar: `https://ui-avatars.com/api/?name=${emailInput}&background=random`
        };

        setInvitedUsers(prev => [...prev, newUser]);
        setEmailInput('');
        setShowDropdown(false);
    };

    const handleInviteFromSearch = (searchUser) => {
        if (invitedUsers.find(u => u.email === searchUser.subtitle)) {
            setEmailInput('');
            setShowDropdown(false);
            return;
        }

        const roleObj = ROLES.find(r => r.id === activeRoleCard);
        
        const newUser = {
            id: searchUser.id,
            name: searchUser.title,
            email: searchUser.subtitle,
            roleId: roleObj?.id || 'DEVELOPER',
            roleName: roleObj?.name || 'Developer',
            avatar: null
        };

        setInvitedUsers(prev => [...prev, newUser]);
        setEmailInput('');
        setShowDropdown(false);
    };

    const handleUpdateUserRole = (userId, newRoleId) => {
        const roleObj = ROLES.find(r => r.id === newRoleId);
        setInvitedUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return { ...u, roleId: roleObj.id, roleName: roleObj.name };
            }
            return u;
        }));
        setOpenRoleDropdownId(null);
    };

    const handleInviteSuggested = (user) => {
        if (invitedUsers.find(u => u.email === user.email)) return;

        const roleObj = ROLES.find(r => r.id === activeRoleCard);
        setInvitedUsers(prev => [...prev, {
            ...user,
            roleId: roleObj?.id || 'DEVELOPER',
            roleName: roleObj?.name || user.role
        }]);
        setSuggested(prev => prev.filter(u => u.id !== user.id));
    };

    const handleRemoveInvited = (id) => {
        setInvitedUsers(prev => prev.filter(u => u.id !== id));
    };

    const handleSendInvitations = async () => {
        if (invitedUsers.length === 0) return;

        try {
            // We loop and add each one, or just do the first one to test
            for (const user of invitedUsers) {
                await projects.addProjectMember(projectId, user.email, user.roleId);
            }
            navigate(`/projects/${projectId}`);
        } catch (error) {
            console.error("Failed to add members", error);
            alert("Some members could not be added. Make sure they exist on the platform.");
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                {/* Custom Header for this page */}
                <div style={{ padding: '24px 32px 0 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => navigate(`/projects/${projectId}`)} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                        <ArrowLeft size={16} /> Back to Project
                    </button>
                </div>

                <div className="dashboard-content invite-members-content">
                    <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: '16px 0 8px 0' }}>Invite People to Project</h1>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 32px 0' }}>Add people to your project and assign roles and permissions.</p>

                    {/* Project Header Card */}
                    <div className="invite-members-header-card">
                        <div className="im-header-left">
                            <div className="im-project-icon">
                                <Globe size={24} />
                            </div>
                            <div className="im-project-info">
                                <h2>{projectDetails?.title || 'Loading Project...'} <span className="im-active-badge">Active</span></h2>
                                <p className="im-project-meta">WEB • Created on May 24, 2024</p>
                                <p className="im-project-desc">{projectDetails?.description || 'Redesign and develop the new corporate website with modern UI/UX.'}</p>
                            </div>
                        </div>
                        <div className="im-header-right">
                            <div className="im-stat">
                                <div className="im-stat-value"><Users size={16} /> {projectDetails?.membersCount || 0}</div>
                                <div className="im-stat-label">Members</div>
                            </div>
                            <div className="im-stat">
                                <div className="im-stat-value"><CheckCircle2 size={16} /> {projectDetails?.tasksCount || 0}</div>
                                <div className="im-stat-label">Tasks</div>
                            </div>
                            <div className="im-stat">
                                <div className="im-stat-value"><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #10B981', borderTopColor: 'transparent' }}></div> {projectDetails?.proggress || 0}%</div>
                                <div className="im-stat-label">{projectDetails?.deadlineAt ? new Date(projectDetails.deadlineAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="invite-members-grid">
                        {/* Left Column */}
                        <div className="im-left-col">

                            <div className="im-section">
                                <h3 className="im-section-title">1. Add People</h3>
                                <p className="im-section-desc">Invite people by email address. They will receive an invitation to join the project.</p>

                                <div className="im-add-row" style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter name or email address..."
                                        className="im-input"
                                        value={emailInput}
                                        onChange={e => setEmailInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddManual()}
                                        onFocus={() => {
                                            if (searchResults.length > 0) setShowDropdown(true);
                                        }}
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                    />
                                    <button className="btn-add" onClick={handleAddManual}>Add</button>
                                    
                                    {showDropdown && (
                                        <div className="search-dropdown">
                                            {isSearching ? (
                                                <div className="search-dropdown-item">Searching...</div>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map(user => (
                                                    <div 
                                                        key={user.id} 
                                                        className="search-dropdown-item"
                                                        onClick={() => handleInviteFromSearch(user)}
                                                    >
                                                        <img src={getAvatarUrl(null, user.title)} alt={user.title} className="sd-avatar" />
                                                        <div className="sd-info">
                                                            <div className="sd-name">{user.title}</div>
                                                            <div className="sd-email">{user.subtitle}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="search-dropdown-item">No users found.</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <h4 className="im-suggested-title">Suggested People</h4>
                                <div className="suggested-list">
                                    {suggested
                                        .filter(user => 
                                            (user.email && user.email.toLowerCase().includes(emailInput.toLowerCase())) ||
                                            (user.name && user.name.toLowerCase().includes(emailInput.toLowerCase())) ||
                                            (user.surname && user.surname.toLowerCase().includes(emailInput.toLowerCase()))
                                        )
                                        .map(user => (
                                        <div className="suggested-item" key={user.id}>
                                            <div className="si-user">
                                                <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name} className="si-avatar" />
                                                <div className="si-info">
                                                    <span className="si-name">{user.name}</span>
                                                    <span className="si-email">{user.email}</span>
                                                </div>
                                            </div>
                                            <span className="si-role">{user.role}</span>
                                            <button className="btn-invite-small" onClick={() => handleInviteSuggested(user)}>
                                                + Invite
                                            </button>
                                        </div>
                                    ))}
                                    {suggested.filter(user => 
                                        (user.email && user.email.toLowerCase().includes(emailInput.toLowerCase())) ||
                                        (user.name && user.name.toLowerCase().includes(emailInput.toLowerCase())) ||
                                        (user.surname && user.surname.toLowerCase().includes(emailInput.toLowerCase()))
                                    ).length === 0 && <div className="si-email" style={{ padding: '16px 0' }}>No matching users found.</div>}
                                </div>
                                <div className="show-more-row">
                                    <button className="btn-show-more">Show more <ChevronDown size={14} /></button>
                                </div>
                            </div>

                            <div className="im-section">
                                <h3 className="im-section-title">2. Set Role and Permissions</h3>
                                <p className="im-section-desc">Choose a role for the invited people.</p>

                                <div className="role-cards-grid">
                                    {ROLES.map(role => (
                                        <div
                                            key={role.id}
                                            className={`role-card ${activeRoleCard === role.id ? 'selected' : ''}`}
                                            onClick={() => setActiveRoleCard(role.id)}
                                        >
                                            <div className="rc-radio"></div>
                                            <div className="rc-icon">{role.icon}</div>
                                            <div className="rc-title">{role.name}</div>
                                            <div className="rc-desc">{role.desc}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="notify-row">
                                    <input
                                        type="checkbox"
                                        id="notify-email"
                                        className="notify-checkbox"
                                        checked={notify}
                                        onChange={() => setNotify(!notify)}
                                    />
                                    <div className="notify-text">
                                        <h4><label htmlFor="notify-email">Notify people via email</label></h4>
                                        <p>They will receive an email invitation to join the project.</p>
                                    </div>
                                </div>

                                <div className="im-actions-bottom">
                                    <button className="btn-cancel" onClick={() => navigate(`/projects/${projectId}`)}>Cancel</button>
                                    <button className="btn-send" onClick={handleSendInvitations}>
                                        <Send size={16} /> Send Invitations
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Right Column */}
                        <div className="im-right-col">

                            {/* People to Invite */}
                            <div className="im-right-section">
                                <div className="im-right-header">
                                    <h3 className="im-right-title">People to Invite ({invitedUsers.length})</h3>
                                    {invitedUsers.length > 0 && <button className="btn-clear" onClick={() => setInvitedUsers([])}>Clear all</button>}
                                </div>

                                <div className="people-to-invite-list">
                                    {invitedUsers.map(user => (
                                        <div className="pti-item" key={user.id}>
                                            <div className="pti-user">
                                                <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name} className="pti-avatar" />
                                                <div className="si-info">
                                                    <span className="pti-name">{user.name}</span>
                                                    <span className="pti-email">{user.email}</span>
                                                </div>
                                            </div>
                                            <div className="pti-role-select" style={{ position: 'relative' }}>
                                                <span 
                                                    className="pti-role" 
                                                    onClick={() => setOpenRoleDropdownId(openRoleDropdownId === user.id ? null : user.id)}
                                                >
                                                    {user.roleName} <ChevronDown size={14} />
                                                </span>

                                                {openRoleDropdownId === user.id && (
                                                    <div className="role-dropdown-menu">
                                                        {ROLES.map(role => (
                                                            <div 
                                                                key={role.id} 
                                                                className="role-dropdown-item"
                                                                onClick={() => handleUpdateUserRole(user.id, role.id)}
                                                            >
                                                                {role.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <button className="btn-remove-pti" onClick={() => handleRemoveInvited(user.id)}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {invitedUsers.length === 0 && <div className="si-email" style={{ padding: '16px 0' }}>No users selected yet.</div>}
                                </div>

                                <div className="im-promo-box">
                                    <div className="promo-icon"><Send size={32} /></div>
                                    <h4 className="promo-title">Instant invitations</h4>
                                    <p className="promo-desc">Invited users will receive an email with the invitation link.</p>
                                </div>
                            </div>

                            {/* Project Access Details */}
                            <div className="im-right-section">
                                <h3 className="im-right-title" style={{ marginBottom: '20px' }}>Project Access</h3>
                                <p className="im-section-desc">Control what invited members can do in this project.</p>

                                <div className="access-list">
                                    <div className="access-item">
                                        <div className="access-icon green"><Eye size={16} /></div>
                                        <span className="access-text">View project details and tasks</span>
                                    </div>
                                    <div className="access-item">
                                        <div className="access-icon purple"><PenTool size={16} /></div>
                                        <span className="access-text">Comment on tasks and files</span>
                                    </div>
                                    <div className="access-item">
                                        <div className="access-icon blue"><Upload size={16} /></div>
                                        <span className="access-text">Upload and download files</span>
                                    </div>
                                    <div className="access-item">
                                        <div className="access-icon red"><Settings size={16} /></div>
                                        <span className="access-text">Manage project settings (based on role)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Help Box */}
                            <div className="help-box">
                                <h3 className="help-title">Need help?</h3>
                                <p className="help-desc">Learn more about roles and permissions in our documentation.</p>
                                <button className="btn-outline">View Documentation <ExternalLink size={14} /></button>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InviteMembers;
