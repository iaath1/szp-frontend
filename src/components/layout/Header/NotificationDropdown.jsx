import React from 'react';
import { navigate } from '../../../router/Router.jsx';
import { Check, CheckCircle2, Info, UserPlus, Bell } from 'lucide-react';
import './NotificationDropdown.css';

const NotificationDropdown = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) => {

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
            onClose();
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'TASK_UPDATE':
                return <CheckCircle2 size={16} className="notification-icon task" />;
            case 'PROJECT_INVITE':
                return <UserPlus size={16} className="notification-icon invite" />;
            case 'MENTION':
                return <Bell size={16} className="notification-icon mention" />;
            default:
                return <Info size={16} className="notification-icon system" />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
            Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            'day'
        );
    };

    return (
        <div className="notification-dropdown">
            <div className="notification-header">
                <h3>Notifications</h3>
                {notifications.some(n => !n.read) && (
                    <button className="mark-all-btn" onClick={onMarkAllAsRead}>
                        <Check size={14} />
                        Mark all as read
                    </button>
                )}
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="empty-notifications">
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="notification-icon-wrapper">
                                {getIconForType(notification.type)}
                            </div>
                            <div className="notification-content">
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <span className="notification-time">
                                    {formatTime(notification.createdAt)}
                                </span>
                            </div>
                            {!notification.read && <div className="unread-dot"></div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
