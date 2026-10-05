import apiClient from "./client.js";

export const getNotifications = async () => {
    const response = await apiClient.get("/api/notifications");
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await apiClient.get("/api/notifications/unread-count");
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await apiClient.put(`/api/notifications/${id}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await apiClient.put("/api/notifications/read-all");
    return response.data;
};
