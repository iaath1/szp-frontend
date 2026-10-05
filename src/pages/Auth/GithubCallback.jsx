import React, { useEffect, useState, useRef } from 'react';
import authAPI from '../../api/auth.js';
import { navigate } from '../../router/Router.jsx';
import './GithubCallback.css';

const GithubCallback = () => {
    const [error, setError] = useState(null);
    const hasRequested = useRef(false);

    useEffect(() => {
        if (hasRequested.current) return;
        hasRequested.current = true;
        
        const handleCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (!code) {
                setError('No authorization code found in the URL.');
                return;
            }

            try {
                const data = await authAPI.loginWithGithub(code);
                
                // Save user data to localStorage
                localStorage.setItem("accessToken", data?.accessToken);
                localStorage.setItem("refreshToken", data?.refreshToken);
                localStorage.setItem("firstname", data?.firstname);
                localStorage.setItem("lastname", data?.lastname);
                localStorage.setItem("avatar", data?.avatarUrl);
                
                // Redirect to dashboard
                navigate("/dashboard");
            } catch (err) {
                console.error('GitHub authentication failed:', err);
                setError(err.message || 'Authentication failed. Please try again.');
            }
        };

        handleCallback();
    }, []);

    if (error) {
        return (
            <div className="github-callback-container">
                <div className="github-error-box">
                    <h2>Authentication Error</h2>
                    <p>{error}</p>
                    <button 
                        className="github-back-button"
                        onClick={() => navigate('/login')}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="github-callback-container">
            <div className="github-loading-box">
                <div className="loading-spinner"></div>
                <p>Authenticating with GitHub...</p>
            </div>
        </div>
    );
};

export default GithubCallback;
