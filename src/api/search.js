import apiClient from "./client";

export const globalSearch = async (query) => {
    if (!query || query.length < 2) return [];
    const response = await apiClient.get(`/api/search?q=${encodeURIComponent(query)}`);
    return response.data;
};
