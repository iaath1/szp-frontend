import apiClient from "./client";

const activities = {
    getRecentActivities: async (limit = 10) => {
        const res = await apiClient.get(`/api/activities/recent?limit=${limit}`);
        return res.data;
    }
};

export default activities;
