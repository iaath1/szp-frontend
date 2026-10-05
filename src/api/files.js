import apiClient from "./client";

export const uploadProjectFile = async (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/api/files/upload/project/${projectId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
};

export const uploadFile = async (file, directory = "common") => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/api/files/upload?directory=${directory}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
};

export const getMyFiles = async () => {
    const response = await apiClient.get('/api/projects/files/my');
    return response.data;
};

export const deleteProjectFile = async (projectId, fileId) => {
    const response = await apiClient.delete(`/api/files/project/${projectId}/file/${fileId}`);
    return response.data;
};
