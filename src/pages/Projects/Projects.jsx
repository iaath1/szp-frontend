import { useState, useEffect } from 'react';
import { FolderClosed, CheckCircle2, Clock, CalendarX2, Filter, Plus, MoreVertical } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar.js';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import './Projects.css';
import projects from '../../api/projects.js';
import tasksApi from '../../api/tasks.js';
import { navigate } from '../../router/Router.jsx';
import { getProjectKey } from '../../utils/taskUtils.js';
import { formatStatus } from '../../utils/formatters.js';

const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const diff = Math.floor((new Date() - date) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(isoString);
};

const Projects = () => {
    const [activeTab, setActiveTab] = useState('All Projects');
    const tabs = ['All Projects', 'In Progress', 'Completed', 'On Hold', 'Archived'];

    const [stats, setStats] = useState(null);
    const [projectsList, setProjectsList] = useState([]);
    
    // Sort and Filter state
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'progress'
    const [filterPrivacy, setFilterPrivacy] = useState('all'); // 'all', 'private', 'public'

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    // Actions dropdown state
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleDropdown = (e, projectId) => {
        e.stopPropagation();
        setActiveDropdown(activeDropdown === projectId ? null : projectId);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const statsData = await projects.getProjectsStats();
                setStats(statsData);
                console.log("Fetched Stats:", statsData);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchProjectsList = async () => {
            try {
                let listData;
                if (activeTab === 'All Projects') {
                    listData = await projects.getProjects();
                } else {
                    const statusParam = activeTab.toUpperCase().replace(/ /g, '_');
                    listData = await projects.getProjectsByStatus(statusParam);
                }
                setProjectsList(listData || []);
                console.log("Fetched Projects:", listData);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };
        fetchProjectsList();
    }, [activeTab]);

    // Reset to first page when tab, sort, or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, sortBy, filterPrivacy]);

    const getProcessedProjects = () => {
        if (!projectsList) return [];
        let processed = [...projectsList];

        // Apply filters
        if (filterPrivacy === 'private') {
            processed = processed.filter(p => p.isPrivate === true);
        } else if (filterPrivacy === 'public') {
            processed = processed.filter(p => p.isPrivate === false);
        }

        // Apply sorting
        processed.sort((a, b) => {
            if (sortBy === 'name') {
                return (a.title || '').localeCompare(b.title || '');
            }
            if (sortBy === 'progress') {
                return (b.progress || 0) - (a.progress || 0);
            }
            // recent (updatedAt)
            return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        });

        return processed;
    };

    const processedProjects = getProcessedProjects();
    const totalProjects = processedProjects.length;
    const totalPages = Math.ceil(totalProjects / pageSize) || 1;

    // Apply pagination
    const paginatedProjects = processedProjects.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Header
                    title="Projects"
                    subtitle="Manage and track all your projects in one place."
                />

                <div className="dashboard-content">
                    {/* Top Stats */}
                    <div className="stats-grid">
                        <StatCard
                            title="Total Projects"
                            value={stats?.total}
                            change={2}
                            isPositive={true}
                            icon={FolderClosed}
                            iconBg="var(--bg-accent-light)"
                            iconColor="var(--accent-color)"
                        />
                        <StatCard
                            title="Completed"
                            value={stats?.completed}
                            change={1}
                            isPositive={true}
                            icon={CheckCircle2}
                            iconBg="var(--bg-success-light)"
                            iconColor="#10B981"
                        />
                        <StatCard
                            title="In Progress"
                            value={stats?.inProggres || stats?.inProgress}
                            change={0}
                            isPositive={true}
                            icon={Clock}
                            iconBg="var(--bg-warning-light)"
                            iconColor="#F59E0B"
                        />
                        <StatCard
                            title="On Hold"
                            value={stats?.onHold}
                            change={-1}
                            isPositive={false}
                            icon={CalendarX2}
                            iconBg="var(--bg-danger-light)"
                            iconColor="#EF4444"
                        />
                    </div>

                    {/* Toolbar */}
                    <div className="projects-toolbar">
                        <div className="projects-tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="toolbar-actions">
                            <div className="sort-dropdown" style={{ padding: '0 12px' }}>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', outline: 'none', color: '#374151', fontWeight: 500, cursor: 'pointer' }}
                                >
                                    <option value="recent">Sort by: Recent</option>
                                    <option value="name">Sort by: Name (A-Z)</option>
                                    <option value="progress">Sort by: Progress</option>
                                </select>
                            </div>
                            <div className="btn-filter" style={{ padding: '0 12px' }}>
                                <Filter size={16} />
                                <select 
                                    value={filterPrivacy} 
                                    onChange={(e) => setFilterPrivacy(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', outline: 'none', color: '#374151', fontWeight: 500, cursor: 'pointer' }}
                                >
                                    <option value="all">All Privacy</option>
                                    <option value="public">Public Projects</option>
                                    <option value="private">Private Projects</option>
                                </select>
                            </div>
                            <button className="btn-primary" onClick={() => navigate('/projects/new')}>
                                <Plus size={16} /> New Project
                            </button>
                        </div>
                    </div>

                    {/* Projects Table */}
                    <div className="projects-table-container">
                        <table className="projects-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                    <th>Members</th>
                                    <th>Deadline</th>
                                    <th>Updated <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg></th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProjects.map(project => (
                                    <tr key={project.id} onClick={() => navigate(`/projects/${project.id}`)} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div className="project-info">
                                                <div className="project-icon" style={{ backgroundColor: project.iconBg, color: project.iconColor }}>
                                                    <FolderClosed size={20} />
                                                </div>
                                                <div>
                                                    <div className="project-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {project.title}
                                                        <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: '4px' }}>
                                                            {project.projectKey || getProjectKey(project.title)}
                                                        </span>
                                                    </div>
                                                    <div className="project-subtitle" style={{ color: '#9CA3AF' }}>
                                                        {project.description ? (project.description.substring(0, 40) + (project.description.length > 40 ? '...' : '')) : 'No description'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`status-badge ${formatStatus(project.status).toLowerCase().replace(' ', '-')}`}>
                                                <span className="dot" style={{ backgroundColor: project.statusDot }}></span>
                                                {formatStatus(project.status)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="progress-cell">
                                                <div className="progress-bar-bg">
                                                    <div className="progress-bar-fill" style={{ width: `${project.progress || 0}%`, backgroundColor: project.status === 'COMPLETED' ? '#10B981' : 'var(--accent-color)' }}></div>
                                                </div>
                                                <span className="progress-text">{project.progress || 0}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="members-stack">
                                                {project.members.map((member, index) => (
                                                    <img key={member.id || index} src={getAvatarUrl(member.avatarUrl, member.name)} alt="member" className="member-avatar" />
                                                ))}
                                                {project.extraMembers > 0 && (
                                                    <div className="member-extra">+{project.extraMembers}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`deadline-text ${project.status === 'COMPLETED' ? 'completed' : project.status === 'On Hold' ? 'on-hold' : 'in-progress'}`}>
                                                {formatDate(project.deadLineAt)}
                                            </span>
                                        </td>
                                        <td className="updated-text">{formatRelativeTime(project.updatedAt)}</td>
                                        <td style={{ position: 'relative' }}>
                                            <button className="action-btn" onClick={(e) => toggleDropdown(e, project.id)}>
                                                <MoreVertical size={18} />
                                            </button>
                                            {activeDropdown === project.id && (
                                                <div className="actions-dropdown" style={{ position: 'absolute', right: '40px', top: '20px', zIndex: 10, backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minWidth: '150px', padding: '4px 0', display: 'flex', flexDirection: 'column' }}>
                                                    <button onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}`); }} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>View Details</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); navigate(`/projects/${project.id}/edit`); }} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Edit Project</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#EF4444' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-danger-light)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Delete Project</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalProjects > 0 && (
                        <div className="pagination-container">
                            <span className="showing-text">
                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalProjects)} of {totalProjects} projects
                            </span>
                            <div className="pagination-controls">
                                <button 
                                    className="page-btn nav-btn" 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page}
                                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button 
                                    className="page-btn nav-btn"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                                </button>
                            </div>
                            <div className="page-size-selector">
                                <select 
                                    value={pageSize} 
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    style={{ border: 'none', background: 'transparent', outline: 'none', color: '#6B7280', fontSize: '0.875rem', cursor: 'pointer' }}
                                >
                                    <option value={4}>4 per page</option>
                                    <option value={8}>8 per page</option>
                                    <option value={12}>12 per page</option>
                                    <option value={24}>24 per page</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Projects;
