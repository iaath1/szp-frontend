import React from 'react';
import { Search, Bell } from 'lucide-react';
import './Header.css';

const Header = () => {
    return (
        <header className="dashboard-header">
            <div className="header-title">
                <h1>Dashboard</h1>
                <p>Welcome back, Misha! Here's what's happening with your projects.</p>
            </div>
            <div className="header-actions">
                <div className="search-bar">
                    <Search className="search-icon" size={18} />
                    <input type="text" placeholder="Search projects, tasks..." />
                </div>
                <button className="notification-btn">
                    <Bell size={20} color="#6B7280" />
                    <span className="notification-badge">3</span>
                </button>
                <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" className="header-avatar" />
            </div>
        </header>
    );
};

export default Header;
