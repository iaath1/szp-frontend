import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ArrowLeft, Folder, CheckSquare, User as UserIcon } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAvatarUrl } from '../../../utils/avatar.js';
import NotificationDropdown from './NotificationDropdown';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../../api/notifications.js';
import { navigate } from '../../../router/Router.jsx';
import usersApi from '../../../api/users.js';
import { globalSearch } from '../../../api/search.js';
import './Header.css';

const URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Header = ({ title = "Dashboard", subtitle, onBack }) => {

    const name = localStorage.getItem("firstname")
    const surname = localStorage.getItem("lastname");
    const avatarUrl = localStorage.getItem("avatar");
    const avatarFullPath = getAvatarUrl(avatarUrl, `${name} ${surname}`);

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isRinging, setIsRinging] = useState(false);
    const [toastNotification, setToastNotification] = useState(null);
    const [isToastHiding, setIsToastHiding] = useState(false);
    
    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);

    const dropdownRef = useRef(null);
    const stompClientRef = useRef(null);
    const toastTimerRef = useRef(null);
    const toastHideTimerRef = useRef(null);

    const fetchNotificationsData = async () => {
        try {
            const countData = await getUnreadCount();
            setUnreadCount(countData.count);
            
            if (isNotificationOpen) {
                const notifsData = await getNotifications();
                setNotifications(notifsData);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNotificationsData();

        // WebSocket setup
        const token = localStorage.getItem('accessToken');
        let userEmail = '';
        try {
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                userEmail = payload.sub;
            }
        } catch (e) {
            console.error("Failed to parse JWT", e);
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(`${URL}/ws-chat`),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                console.log("Connected to STOMP for notifications");
                const topic = userEmail ? `/topic/notifications/${userEmail}` : '/user/queue/notifications';
                client.subscribe(topic, (message) => {
                    const newNotification = JSON.parse(message.body);
                    console.log("Received new notification:", newNotification);
                    
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    
                    // Visual effects
                    setIsRinging(true);
                    setIsToastHiding(false);
                    setToastNotification(newNotification);
                    
                    // Clear ringing after animation
                    setTimeout(() => setIsRinging(false), 600);
                    
                    // Clear toast timers
                    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                    if (toastHideTimerRef.current) clearTimeout(toastHideTimerRef.current);
                    
                    toastHideTimerRef.current = setTimeout(() => {
                        setIsToastHiding(true);
                    }, 3700);
                    
                    toastTimerRef.current = setTimeout(() => {
                        setToastNotification(null);
                        setIsToastHiding(false);
                    }, 4000);
                });
            },
            onStompError: (frame) => {
                console.error("Broker reported error: " + frame.headers['message']);
                console.error("Additional details: " + frame.body);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    // Re-fetch when dropdown is opened to ensure it's up to date
    useEffect(() => {
        if (isNotificationOpen) {
            getNotifications().then(data => setNotifications(data)).catch(console.error);
        }
    }, [isNotificationOpen]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const results = await globalSearch(searchQuery);
                    setSearchResults(results);
                    setIsSearchOpen(true);
                } catch (error) {
                    console.error("Failed to search", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setIsSearchOpen(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleNotifications = () => {
        setIsNotificationOpen(!isNotificationOpen);
    };

    const handleSearchResultClick = (url) => {
        setIsSearchOpen(false);
        setSearchQuery('');
        navigate(url);
    };

    const getIconForType = (type) => {
        switch(type) {
            case 'PROJECT': return <Folder size={16} color="#592BF0" />;
            case 'TASK': return <CheckSquare size={16} color="#10B981" />;
            case 'USER': return <UserIcon size={16} color="#F59E0B" />;
            default: return <Search size={16} />;
        }
    };

    const handleAvatarClick = async () => {
        try {
            const profile = await usersApi.getProfile();
            navigate(`/user/${profile.id}`);
        } catch (error) {
            console.error("Failed to fetch my profile", error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all notifications as read", error);
        }
    };

    return (
        <header className="dashboard-header">
            <div className="header-title">
                <div className="title-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {onBack && (
                        <button 
                            className="back-btn" 
                            onClick={onBack}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: 'var(--accent-color)' }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h1 style={{ margin: 0 }}>{title}</h1>
                </div>
                <p>{subtitle || `Welcome back, ${name}! Here's what's happening with your projects.`}</p>
            </div>
            <div className="header-actions">
                <div className="search-bar" ref={searchRef} style={{ position: 'relative' }}>
                    <Search className="search-icon" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search projects, tasks, users..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if(searchResults.length > 0) setIsSearchOpen(true); }}
                    />
                    
                    {isSearchOpen && (
                        <div className="search-dropdown">
                            {isSearching ? (
                                <div className="search-loading">Searching...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(item => (
                                    <div 
                                        key={`${item.type}-${item.id}`} 
                                        className="search-item"
                                        onClick={() => handleSearchResultClick(item.url)}
                                    >
                                        <div className="search-item-icon">
                                            {getIconForType(item.type)}
                                        </div>
                                        <div className="search-item-content">
                                            <div className="search-item-title">{item.title}</div>
                                            <div className="search-item-subtitle">{item.subtitle}</div>
                                        </div>
                                        <div className="search-item-type">{item.type.toLowerCase()}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="search-loading">No results found</div>
                            )}
                        </div>
                    )}
                </div>
                <div className="notification-container" ref={dropdownRef}>
                    <button className={`notification-btn ${isRinging ? 'ringing' : ''}`} onClick={toggleNotifications}>
                        <Bell size={20} style={{ color: 'var(--accent-color)' }} />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        )}
                    </button>
                    {isNotificationOpen && (
                        <NotificationDropdown 
                            notifications={notifications}
                            onMarkAsRead={handleMarkAsRead}
                            onMarkAllAsRead={handleMarkAllAsRead}
                            onClose={() => setIsNotificationOpen(false)}
                        />
                    )}
                    
                    {toastNotification && (
                        <div className={`notification-toast ${isToastHiding ? 'hiding' : ''}`}>
                            <h4>{toastNotification.title || 'Новое уведомление'}</h4>
                            <p>{toastNotification.message}</p>
                        </div>
                    )}
                </div>
                <img 
                    src={avatarFullPath} 
                    alt="User Avatar" 
                    className="header-avatar" 
                    onClick={handleAvatarClick}
                    style={{ cursor: 'pointer' }}
                />
            </div>
        </header>
    );
};

export default Header;
