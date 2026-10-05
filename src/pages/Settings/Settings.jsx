import React, { useState, useEffect, useRef } from 'react';
import { User, Bell, Lock, Palette, Upload, Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import users from '../../api/users.js';
import { getAvatarUrl } from '../../utils/avatar.js';
import './Settings.css';
import './appearance.css';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    
    const [profile, setProfile] = useState({
        name: '',
        surname: '',
        email: '',
        role: '',
        bio: '',
        avatarPath: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        taskUpdated: true,
        projectInvites: true,
        mentions: true
    });

    const [is2faEnabled, setIs2faEnabled] = useState(false);
    const [activeSessions, setActiveSessions] = useState([]);
    const [loginHistory, setLoginHistory] = useState([]);
    const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
    const [is2faModalOpen, setIs2faModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [twoFaCode, setTwoFaCode] = useState('');
    const [isVerifying2fa, setIsVerifying2fa] = useState(false);
    
    // Appearance state
    const [appearance, setAppearance] = useState({
        theme: localStorage.getItem('theme') || 'light',
        accentColor: localStorage.getItem('accentColor') || '#592BF0',
        compactMode: localStorage.getItem('compactMode') === 'true'
    });
    const [isSavingAppearance, setIsSavingAppearance] = useState(false);
    
    const fileInputRef = useRef(null);
    
    const avatarFullPath = getAvatarUrl(profile.avatarPath, profile.name);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const data = await users.getProfile();
                setProfile({
                    name: data.name || '',
                    surname: data.surname || '',
                    email: data.email || '',
                    role: data.role || 'Member',
                    bio: data.bio || '',
                    avatarPath: data.avatarUrl || '' // Map backend avatarUrl to local avatarPath
                });
                if (data.notifications) {
                    setNotifications({
                        emailNotifications: data.notifications.emailNotifications ?? true,
                        pushNotifications: data.notifications.pushNotifications ?? true,
                        taskUpdated: data.notifications.taskUpdated ?? true,
                        projectInvites: data.notifications.projectInvites ?? true,
                        mentions: data.notifications.mentions ?? true
                    });
                }
                if (data.mfaEnabled !== undefined) {
                    setIs2faEnabled(data.mfaEnabled);
                }
                
                // Set appearance if returned by backend
                if (data.theme) {
                    setAppearance({
                        theme: data.theme,
                        accentColor: data.accentColor || '#592BF0',
                        compactMode: data.compactMode || false
                    });
                    
                    // Apply immediately
                    document.documentElement.setAttribute('data-theme', data.theme);
                    document.documentElement.style.setProperty('--accent-color', data.accentColor || '#592BF0');
                    localStorage.setItem('theme', data.theme);
                    localStorage.setItem('accentColor', data.accentColor || '#592BF0');
                    localStorage.setItem('compactMode', data.compactMode || false);
                    if (data.compactMode) {
                        document.documentElement.classList.add('compact-mode');
                    } else {
                        document.documentElement.classList.remove('compact-mode');
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'security') {
            const fetchSecurityData = async () => {
                setIsLoadingSecurity(true);
                try {
                    const [sessionsRes, historyRes] = await Promise.all([
                        users.getSessions(),
                        users.getLoginHistory()
                    ]);
                    setActiveSessions(sessionsRes);
                    setLoginHistory(historyRes);
                } catch (error) {
                    console.error("Failed to fetch security data", error);
                } finally {
                    setIsLoadingSecurity(false);
                }
            };
            fetchSecurityData();
        }
    }, [activeTab]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            const updatedProfile = await users.updateProfile({
                name: profile.name,
                surname: profile.surname,
                email: profile.email,
                bio: profile.bio,
                theme: appearance.theme,
                accentColor: appearance.accentColor,
                compactMode: appearance.compactMode
            });
            setProfile(prev => ({...prev, ...updatedProfile}));
            
            // Update local storage so sidebar updates on refresh
            localStorage.setItem('firstname', updatedProfile.name);
            localStorage.setItem('lastname', updatedProfile.surname);
            
            alert('Settings saved successfully!');
        } catch (error) {
            console.error("Failed to update profile", error);
            alert('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNotifications = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await users.updateNotifications(notifications);
            alert("Notification preferences updated successfully!");
        } catch (error) {
            console.error("Failed to update notifications", error);
            alert("Failed to update notifications. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        try {
            setIsSavingPassword(true);
            await users.changePassword({
                oldPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            alert("Password updated successfully!");
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Failed to update password", error);
            alert(error.response?.data?.message || "Failed to update password. Please check your current password and try again.");
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploadingAvatar(true);
            const formData = new FormData();
            formData.append('file', file);
            
            const newAvatarData = await users.uploadAvatar(formData);
            
            // The backend returns UserResponseDTO which has avatarUrl
            const avatarPath = typeof newAvatarData === 'string' ? newAvatarData : newAvatarData.avatarUrl;
            
            setProfile(prev => ({...prev, avatarPath}));
            localStorage.setItem("avatar", avatarPath);
            
            alert('Avatar updated successfully!');
        } catch (error) {
            console.error("Failed to upload avatar", error);
            alert('Failed to upload avatar.');
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRevokeSession = async (sessionId) => {
        try {
            await users.revokeSession(sessionId);
            setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
        } catch (error) {
            console.error("Failed to revoke session", error);
            alert("Failed to revoke session.");
        }
    };

    const handleSetup2fa = async () => {
        if (is2faEnabled) {
            alert("2FA is already enabled. To disable it, contact support."); // For simplicity in this demo
            return;
        }
        try {
            const data = await users.setup2fa();
            setQrCodeUrl(data.qrCode);
            setIs2faModalOpen(true);
        } catch (error) {
            console.error("Failed to setup 2FA", error);
            alert("Failed to setup 2FA.");
        }
    };

    const handleVerify2fa = async () => {
        if (!twoFaCode) return;
        try {
            setIsVerifying2fa(true);
            await users.verify2fa(twoFaCode);
            setIs2faEnabled(true);
            setIs2faModalOpen(false);
            setTwoFaCode('');
            alert("2FA enabled successfully!");
        } catch (error) {
            console.error("Failed to verify 2FA", error);
            alert("Invalid 2FA code. Try again.");
        } finally {
            setIsVerifying2fa(false);
        }
    };

    const handleApplyAppearance = async () => {
        try {
            setIsSavingAppearance(true);
            
            // 1. Apply locally instantly
            document.documentElement.setAttribute('data-theme', appearance.theme);
            document.documentElement.style.setProperty('--accent-color', appearance.accentColor);
            if (appearance.compactMode) {
                document.documentElement.classList.add('compact-mode');
            } else {
                document.documentElement.classList.remove('compact-mode');
            }
            
            // 2. Save to localStorage
            localStorage.setItem('theme', appearance.theme);
            localStorage.setItem('accentColor', appearance.accentColor);
            localStorage.setItem('compactMode', appearance.compactMode);

            // 3. Save to backend (profile endpoint update)
            await users.updateProfile({
                name: profile.name,
                surname: profile.surname,
                email: profile.email,
                bio: profile.bio,
                theme: appearance.theme,
                accentColor: appearance.accentColor,
                compactMode: appearance.compactMode
            });
            
            alert("Appearance settings saved successfully!");
        } catch (error) {
            console.error("Failed to save appearance", error);
            alert("Settings applied locally, but failed to sync to the server.");
        } finally {
            setIsSavingAppearance(false);
        }
    };

    const themeColors = ['#592BF0', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Header title="Settings" subtitle="Manage your account preferences and settings" />
                <div className="dashboard-content settings-content">
                    
                    <div className="settings-container">
                        <aside className="settings-sidebar">
                            <nav className="settings-nav">
                                <button 
                                    className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    <User size={18} /> Profile
                                </button>
                                <button 
                                    className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('notifications')}
                                >
                                    <Bell size={18} /> Notifications
                                </button>
                                <button 
                                    className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('security')}
                                >
                                    <Lock size={18} /> Security
                                </button>
                                <button 
                                    className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('appearance')}
                                >
                                    <Palette size={18} /> Appearance
                                </button>
                            </nav>
                        </aside>

                        <div className="settings-body">
                            {activeTab === 'profile' && (
                                <div className="settings-section">
                                    <h2>Public Profile</h2>
                                    <p className="settings-desc">This information will be displayed publicly so be careful what you share.</p>
                                    
                                    {isLoading ? (
                                        <div style={{ padding: '40px 0', textAlign: 'center', color: '#6B7280' }}>Loading profile...</div>
                                    ) : (
                                        <>
                                    
                                    <div className="avatar-upload-section">
                                        <div className="current-avatar">
                                            <img src={avatarFullPath} alt="User avatar" />
                                        </div>
                                        <div className="avatar-upload-actions">
                                            <input 
                                                type="file" 
                                                accept="image/jpeg, image/png, image/gif" 
                                                ref={fileInputRef} 
                                                style={{ display: 'none' }} 
                                                onChange={handleAvatarChange}
                                            />
                                            <button 
                                                className="btn-secondary" 
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploadingAvatar}
                                            >
                                                <Upload size={16} style={{marginRight: '8px'}} /> 
                                                {isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                                            </button>
                                            <p>JPG, GIF or PNG. Max size of 800K</p>
                                        </div>
                                    </div>

                                    <form className="settings-form" onSubmit={handleSave}>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>First Name</label>
                                                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Last Name</label>
                                                <input type="text" value={profile.surname} onChange={(e) => setProfile({...profile, surname: e.target.value})} required />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                                        </div>

                                        <div className="form-group">
                                            <label>Role</label>
                                            <input type="text" value={profile.role} disabled className="disabled-input" />
                                        </div>

                                        <div className="form-group">
                                            <label>Bio</label>
                                            <textarea rows="4" value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})}></textarea>
                                        </div>

                                        <div className="form-actions">
                                            <button type="submit" className="btn-primary" disabled={isSaving}>
                                                {isSaving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                    </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="settings-section">
                                    <h2>Notification Preferences</h2>
                                    <p>Choose how you want to be notified about activity.</p>
                                    
                                    <form className="settings-form" onSubmit={handleSaveNotifications}>
                                        <div className="notification-group">
                                            <h3>Delivery Methods</h3>
                                            <div className="notification-item">
                                                <div className="ni-info">
                                                    <span className="ni-title">Email Notifications</span>
                                                    <span className="ni-desc">Receive updates via email.</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input type="checkbox" checked={notifications.emailNotifications} onChange={(e) => setNotifications({...notifications, emailNotifications: e.target.checked})} />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                            <div className="notification-item">
                                                <div className="ni-info">
                                                    <span className="ni-title">Push Notifications</span>
                                                    <span className="ni-desc">Receive push notifications in your browser.</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input type="checkbox" checked={notifications.pushNotifications} onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})} />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="notification-group">
                                            <h3>Activity</h3>
                                            <div className="notification-item">
                                                <div className="ni-info">
                                                    <span className="ni-title">Task Updates</span>
                                                    <span className="ni-desc">Get notified when a task is assigned to you or updated.</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input type="checkbox" checked={notifications.taskUpdated} onChange={(e) => setNotifications({...notifications, taskUpdated: e.target.checked})} />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                            <div className="notification-item">
                                                <div className="ni-info">
                                                    <span className="ni-title">Project Invitations</span>
                                                    <span className="ni-desc">Get notified when you are invited to a new project.</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input type="checkbox" checked={notifications.projectInvites} onChange={(e) => setNotifications({...notifications, projectInvites: e.target.checked})} />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                            <div className="notification-item">
                                                <div className="ni-info">
                                                    <span className="ni-title">Mentions</span>
                                                    <span className="ni-desc">Get notified when someone mentions you in a comment.</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input type="checkbox" checked={notifications.mentions} onChange={(e) => setNotifications({...notifications, mentions: e.target.checked})} />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="form-actions">
                                            <button type="submit" className="btn-primary" disabled={isSaving}>
                                                {isSaving ? 'Saving...' : 'Save Preferences'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="settings-section">
                                    <h2>Security Settings</h2>
                                    <p className="settings-desc">Manage your password, 2FA, and account security.</p>
                                    
                                    <div className="security-group">
                                        <h3>Change Password</h3>
                                        <form className="settings-form" onSubmit={handleChangePassword}>
                                            <div className="form-group">
                                                <label>Current Password</label>
                                                <input 
                                                    type="password" 
                                                    value={passwords.currentPassword} 
                                                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} 
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>New Password</label>
                                                <input 
                                                    type="password" 
                                                    value={passwords.newPassword} 
                                                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                                                    required 
                                                    minLength="6"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Confirm New Password</label>
                                                <input 
                                                    type="password" 
                                                    value={passwords.confirmPassword} 
                                                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} 
                                                    required 
                                                    minLength="6"
                                                />
                                            </div>
                                            
                                            <div className="form-actions" style={{paddingTop: '16px', borderTop: 'none', justifyContent: 'flex-start'}}>
                                                <button type="submit" className="btn-primary" disabled={isSavingPassword}>
                                                    {isSavingPassword ? 'Updating...' : 'Update Password'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    <div className="security-group">
                                        <h3>Two-Factor Authentication (2FA)</h3>
                                        <p className="group-desc">Add an extra layer of security to your account.</p>
                                        <div className="mfa-status-box">
                                            <div className="mfa-info">
                                                <div className={`mfa-badge ${is2faEnabled ? 'enabled' : 'disabled'}`}>
                                                    {is2faEnabled ? 'Enabled' : 'Disabled'}
                                                </div>
                                                <span className="mfa-text">
                                                    {is2faEnabled ? 'Authenticator app configured.' : 'Protect your account with an authenticator app.'}
                                                </span>
                                            </div>
                                            <button 
                                                className={`btn-${is2faEnabled ? 'secondary' : 'primary'}`}
                                                onClick={handleSetup2fa}
                                                disabled={is2faEnabled}
                                            >
                                                <ShieldCheck size={16} style={{marginRight: '6px', verticalAlign: 'middle'}}/>
                                                {is2faEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="security-group">
                                        <h3>Active Sessions</h3>
                                        <p className="group-desc">Devices that are currently logged into your account.</p>
                                        
                                        {isLoadingSecurity ? (
                                            <p style={{color: '#6B7280'}}>Loading sessions...</p>
                                        ) : (
                                            <div className="sessions-list">
                                                {activeSessions.map(session => (
                                                    <div className="session-item" key={session.id}>
                                                        <div className="session-icon">
                                                            {session.deviceInfo?.toLowerCase().includes('mobile') || session.deviceInfo?.toLowerCase().includes('android') || session.deviceInfo?.toLowerCase().includes('iphone') ? <Smartphone size={20}/> : <Monitor size={20}/>}
                                                        </div>
                                                        <div className="session-details">
                                                            <div className="session-name">
                                                                {session.deviceInfo || 'Unknown Device'} 
                                                            </div>
                                                            <div className="session-meta">
                                                                {session.ipAddress} • {new Date(session.createdAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <button className="btn-outline-danger btn-sm" onClick={() => handleRevokeSession(session.id)}>Revoke</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="security-group">
                                        <h3>Login History</h3>
                                        <p className="group-desc">Recent activity on your account.</p>
                                        {isLoadingSecurity ? (
                                            <p style={{color: '#6B7280'}}>Loading history...</p>
                                        ) : (
                                            <div className="history-table-wrapper">
                                                <table className="history-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Device/Browser</th>
                                                            <th>IP Address</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loginHistory.map(log => (
                                                            <tr key={log.id}>
                                                                <td>{new Date(log.attemptTime).toLocaleString()}</td>
                                                                <td>{log.deviceInfo || 'Unknown'}</td>
                                                                <td>{log.ipAddress}</td>
                                                                <td>
                                                                    <span className={`status-badge ${log.status.toLowerCase()}`}>
                                                                        {log.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div className="settings-section">
                                    <h2>Appearance Settings</h2>
                                    <p className="settings-desc">Customize the look and feel of your workspace.</p>
                                    
                                    <div className="security-group">
                                        <h3>Theme</h3>
                                        <p className="group-desc">Choose between light and dark mode.</p>
                                        <div className="theme-options">
                                            <div className={`theme-card ${appearance.theme === 'light' ? 'active' : ''}`} onClick={() => setAppearance({...appearance, theme: 'light'})}>
                                                <div className="theme-preview light">
                                                    <div className="tp-header"></div>
                                                    <div className="tp-body">
                                                        <div className="tp-sidebar"></div>
                                                        <div className="tp-content">
                                                            <div className="tp-line" style={{width: '60%'}}></div>
                                                            <div className="tp-line" style={{width: '40%'}}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="theme-label">Light</span>
                                            </div>
                                            <div className={`theme-card ${appearance.theme === 'dark' ? 'active' : ''}`} onClick={() => setAppearance({...appearance, theme: 'dark'})}>
                                                <div className="theme-preview dark">
                                                    <div className="tp-header"></div>
                                                    <div className="tp-body">
                                                        <div className="tp-sidebar"></div>
                                                        <div className="tp-content">
                                                            <div className="tp-line" style={{width: '60%'}}></div>
                                                            <div className="tp-line" style={{width: '40%'}}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="theme-label">Dark</span>
                                            </div>
                                            <div className={`theme-card ${appearance.theme === 'system' ? 'active' : ''}`} onClick={() => setAppearance({...appearance, theme: 'system'})}>
                                                <div className="theme-preview system">
                                                    <div className="tp-header"></div>
                                                    <div className="tp-body">
                                                        <div className="tp-sidebar"></div>
                                                        <div className="tp-content">
                                                            <div className="tp-line" style={{width: '60%'}}></div>
                                                            <div className="tp-line" style={{width: '40%'}}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="theme-label">System</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="security-group">
                                        <h3>Accent Color</h3>
                                        <p className="group-desc">Choose your primary brand color.</p>
                                        <div className="color-options">
                                            {themeColors.map(color => (
                                                <div 
                                                    key={color}
                                                    className={`color-circle ${appearance.accentColor === color ? 'active' : ''}`} 
                                                    style={{background: color}}
                                                    onClick={() => setAppearance({...appearance, accentColor: color})}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="security-group">
                                        <h3>Layout Density</h3>
                                        <div className="notification-item" style={{marginBottom: 0, paddingBottom: 0, borderBottom: 'none'}}>
                                            <div className="ni-info">
                                                <span className="ni-title">Compact Mode</span>
                                                <span className="ni-desc">Reduce whitespace and fit more content on the screen.</span>
                                            </div>
                                            <label className="toggle-switch">
                                                <input 
                                                    type="checkbox" 
                                                    checked={appearance.compactMode}
                                                    onChange={(e) => setAppearance({...appearance, compactMode: e.target.checked})}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="form-actions" style={{marginTop: '24px'}}>
                                        <button className="btn-primary" onClick={handleApplyAppearance} disabled={isSavingAppearance}>
                                            {isSavingAppearance ? 'Applying...' : 'Apply Changes'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {(activeTab !== 'profile' && activeTab !== 'notifications' && activeTab !== 'security' && activeTab !== 'appearance') && (
                                <div className="settings-section placeholder-section">
                                    <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings</h2>
                                    <p>These settings are coming soon.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            {/* 2FA Setup Modal */}
            {is2faModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '400px', textAlign: 'center'}}>
                        <h3>Set up Two-Factor Authentication</h3>
                        <p style={{color: '#6B7280', marginBottom: '20px', fontSize: '0.9rem'}}>Scan this QR code with Google Authenticator or Authy to configure 2FA.</p>
                        
                        {qrCodeUrl && (
                            <div style={{margin: '20px 0', padding: '16px', background: '#F9FAFB', borderRadius: '8px', display: 'inline-block'}}>
                                <img src={qrCodeUrl} alt="2FA QR Code" style={{width: '200px', height: '200px'}} />
                            </div>
                        )}
                        
                        <div className="form-group" style={{textAlign: 'left'}}>
                            <label>Verification Code</label>
                            <input 
                                type="text" 
                                placeholder="Enter 6-digit code" 
                                value={twoFaCode}
                                onChange={(e) => setTwoFaCode(e.target.value)}
                                maxLength={6}
                                style={{textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem'}}
                            />
                        </div>
                        
                        <div className="modal-actions" style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px'}}>
                            <button className="btn-secondary" onClick={() => setIs2faModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleVerify2fa} disabled={isVerifying2fa || twoFaCode.length < 6}>
                                {isVerifying2fa ? 'Verifying...' : 'Verify & Enable'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
