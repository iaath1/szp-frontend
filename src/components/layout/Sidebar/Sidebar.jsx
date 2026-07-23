import React from 'react';
import { Home, FolderClosed, CheckSquare, Calendar, Users, BarChart2, MessageSquare, FileText, Settings, LogOut } from 'lucide-react';
import { navigate, useRoute } from "../../../router/Router.jsx";
import './Sidebar.css';

const Sidebar = () => {
    const currentPath = useRoute();

    const menuItems = [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Projects', icon: FolderClosed, path: '/projects' },
        { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
        { name: 'Calendar', icon: Calendar, path: '/calendar' },
        { name: 'Team', icon: Users, path: '/team' },
        { name: 'Reports', icon: BarChart2, path: '/reports' },
        { name: 'Messages', icon: MessageSquare, path: '/messages' },
        { name: 'Files', icon: FileText, path: '/files' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="7" height="7" rx="2" fill="#592BF0"/>
                        <rect x="14" y="3" width="7" height="7" rx="2" fill="#592BF0"/>
                        <rect x="14" y="14" width="7" height="7" rx="2" fill="#592BF0"/>
                        <rect x="3" y="14" width="7" height="7" rx="2" fill="#592BF0"/>
                    </svg>
                </div>
                <span className="logo-text">ProManage</span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path;
                    return (
                        <a 
                            key={item.name}
                            href={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(item.path);
                            }}
                        >
                            <Icon className="nav-icon" size={20} />
                            <span>{item.name}</span>
                        </a>
                    );
                })}
            </nav>

            <div className="sidebar-bottom">
                <div className="user-profile">
                    <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" className="avatar" />
                    <div className="user-info">
                        <span className="user-name">Misha Stozhkov</span>
                        <span className="user-role">Project Manager</span>
                    </div>
                    <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <button className="logout-btn" onClick={() => navigate('/login')}>
                    <LogOut size={18} />
                    <span>Log out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
