import apiClient from "./client";

const users = {
    getSuggestedUsers: async (projectId) => {
        const res = await apiClient.get(`/api/users/suggested/${projectId}`)
        console.log(res)
        return res.data
    },
    getMyTeam: async () => {
        const res = await apiClient.get('/api/users/team');
        return res.data;
    },
    getProfile: async () => {
        const res = await apiClient.get('/api/users/profile');
        return res.data;
    },
    updateProfile: async (data) => {
        const res = await apiClient.put('/api/users/profile', data);
        return res.data;
    },
    updateNotifications: async (data) => {
        const res = await apiClient.put('/api/users/profile/notifications', data);
        return res.data;
    },
    uploadAvatar: async (formData) => {
        const res = await apiClient.post('/api/users/profile/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    },
    changePassword: async (data) => {
        const res = await apiClient.put('/api/users/profile/password', data);
        return res.data;
    },
    getSessions: async () => {
        const res = await apiClient.get('/api/users/sessions');
        return res.data;
    },
    revokeSession: async (sessionId) => {
        const res = await apiClient.delete(`/api/users/sessions/${sessionId}`);
        return res.data;
    },
    getLoginHistory: async () => {
        const res = await apiClient.get('/api/users/login-history');
        return res.data;
    },
    setup2fa: async () => {
        const res = await apiClient.get('/api/users/2fa/setup');
        return res.data;
    },
    verify2fa: async (code) => {
        const res = await apiClient.post('/api/users/2fa/verify', { code });
        return res.data;
    },
    getPublicProfile: async (userId) => {
        const res = await apiClient.get(`/api/users/${userId}/profile`);
        return res.data;
    },
    updateAppearance: async (appearanceData) => {
        const res = await apiClient.put('/api/users/profile', appearanceData);
        return res.data;
    }
}

export default users;