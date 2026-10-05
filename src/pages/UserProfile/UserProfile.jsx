import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, User, Info, AlertTriangle, MessageSquare } from 'lucide-react';
import { navigate } from '../../router/Router.jsx';
import usersApi from '../../api/users';
import chatApi from '../../api/chat';
import { getAvatarUrl } from '../../utils/avatar';
import './UserProfile.css';

const UserProfile = ({ params }) => {
    const { id } = params;
    const [profile, setProfile] = useState(null);
    const [isMyProfile, setIsMyProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const [data, myProfile] = await Promise.all([
                    usersApi.getPublicProfile(id),
                    usersApi.getProfile().catch(() => null)
                ]);
                setProfile(data);
                if (myProfile) {
                    setIsMyProfile(data.id === myProfile.id || data.email === myProfile.email);
                }
                setError(null);
            } catch (err) {
                console.error("Failed to fetch user profile", err);
                setError("Unable to load user profile. They might not exist or you don't have permission to view them.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProfile();
        }
    }, [id]);

    const handleSendMessage = async () => {
        try {
            const chat = await chatApi.getOrCreatePrivateChat(id);
            navigate(`/messages?chatId=${chat.id}`);
        } catch (err) {
            console.error("Failed to start chat", err);
            alert("Failed to start chat. Please try again later.");
        }
    };

    if (isLoading) {
        return (
            <div className="user-profile-page">
                <div className="profile-loading">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="user-profile-page">
                <div className="profile-error">
                    <AlertTriangle size={48} />
                    <h2>Profile Not Found</h2>
                    <p>{error}</p>
                    <button className="btn-primary" onClick={() => window.history.back()}>Go Back</button>
                </div>
            </div>
        );
    }

    const avatarFullPath = getAvatarUrl(profile.avatarUrl, `${profile.name} ${profile.surname}`);

    return (
        <div className="user-profile-page">
            <div className="profile-header">
                <button className="back-button" onClick={() => window.history.back()}>
                    <ArrowLeft size={18} />
                    Back
                </button>
                
                <div className="profile-avatar-container">
                    {profile.avatarUrl ? (
                        <img src={avatarFullPath} alt={`${profile.name}'s avatar`} className="profile-avatar" />
                    ) : (
                        <div className="profile-avatar-placeholder">
                            {profile.name?.charAt(0)}{profile.surname?.charAt(0)}
                        </div>
                    )}
                </div>

                <div className="profile-info">
                    <h1 className="profile-name">{profile.name} {profile.surname}</h1>
                    
                    {profile.email && (
                        <div className="profile-email">
                            <Mail size={16} />
                            {profile.email}
                        </div>
                    )}
                    
                    <div className="profile-badges">
                        <span className="profile-badge">Member</span>
                    </div>
                </div>
                
                {!isMyProfile && (
                    <div className="profile-actions">
                        <button className="message-btn" onClick={handleSendMessage}>
                            <MessageSquare size={18} />
                            Message
                        </button>
                    </div>
                )}
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <h3>
                        <User size={20} style={{ color: 'var(--accent-color)' }} />
                        About
                    </h3>
                    {profile.bio ? (
                        <p className="profile-bio">{profile.bio}</p>
                    ) : (
                        <p className="profile-bio empty">This user hasn't added a bio yet.</p>
                    )}
                </div>

                <div className="profile-card">
                    <h3>
                        <Info size={20} style={{ color: 'var(--accent-color)' }} />
                        Activity
                    </h3>
                    <p className="profile-bio empty">Activity history will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
