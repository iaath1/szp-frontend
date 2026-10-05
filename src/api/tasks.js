import apiClient from "./client";

const tasks = {
    getTasksCountByStatuses: async () => {
        const res = await apiClient.get(`/api/tasks/count-by-statuses`);
        console.log(res)

        return res.data;
    },

    getTasksCount: async () => {
        const res = await apiClient.get(`/api/tasks/count`);

        console.log(res)
        return res.data;
    },

    getUpcomingTasks: async () => {
        const res = await apiClient.get("api/tasks/upcoming");
        console.log(res);
        return res.data;
    },

    getTeamWorkload: async () => {
        const res = await apiClient.get(`/api/tasks/team-workload`);
        return res.data;
    },

    getTaskVelocity: async (days = 14) => {
        const res = await apiClient.get(`/api/tasks/velocity?days=${days}`);
        return res.data;
    },

    getProjectVelocity: async (projectId, days = 14) => {
        const res = await apiClient.get(`/api/tasks/project-velocity?projectId=${projectId}&days=${days}`);
        return res.data;
    },

    createTask: async (projectId, taskData) => {
        const res = await apiClient.post(`/api/tasks/${projectId}`, taskData)
        console.log(res)
        return res.data;
    },

    updateTaskStatus: async (taskId, status) => {
        // Assuming PATCH /api/tasks/{taskId}/status
        const res = await apiClient.patch(`/api/tasks/${taskId}/status`, { status });
        console.log(res);
        return res.data;
    },

    getMyTasks: async (status) => {
        const url = status && status !== 'ALL' ? `/api/tasks/my/${status}` : "/api/tasks/my";
        const res = await apiClient.get(url);
        console.log(res.data);
        return res.data;
    },

    getMyTasksByStatus: async (status) => {
        const res = await apiClient.get(`/api/tasks/my/${status}`);
        console.log(res.data);
        return res.data;
    },

    addAttachment: async (taskId, fileId) => {
        const res = await apiClient.post(`/api/tasks/${taskId}/attachments/${fileId}`);
        return res.data;
    },

    removeAttachment: async (taskId, fileId) => {
        const res = await apiClient.delete(`/api/tasks/${taskId}/attachments/${fileId}`);
        return res.data;
    },

    addSubtask: async (taskId, subtaskData) => {
        const res = await apiClient.post(`/api/tasks/${taskId}/subtasks`, subtaskData);
        return res.data;
    },

    updateSubtask: async (taskId, subtaskId, subtaskData) => {
        const res = await apiClient.patch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, subtaskData);
        return res.data;
    },

    deleteSubtask: async (taskId, subtaskId) => {
        const res = await apiClient.delete(`/api/tasks/${taskId}/subtasks/${subtaskId}`);
        return res.data;
    },

    getTaskComments: async (taskId) => {
        const res = await apiClient.get(`/api/tasks/${taskId}/comments`);
        return res.data;
    },

    addComment: async (taskId, content) => {
        const res = await apiClient.post(`/api/tasks/${taskId}/comments`, { content });
        return res.data;
    },

    deleteComment: async (taskId, commentId) => {
        const res = await apiClient.delete(`/api/tasks/${taskId}/comments/${commentId}`);
        return res.data;
    }
}

export default tasks;