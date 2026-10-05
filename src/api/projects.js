import apiClient from "./client";


const projects = {
    getProjectsCount: async () => {
        const res = await apiClient.get(`/api/projects/count`);

        console.log(res)
        return res.data;
    },

    getProjectsByStatus: async (status) => {
        const res = await apiClient.get(`/api/projects/my/${status}`)
        console.log(res)
        return res.data;
    },

    createProject: async (formData) => {
        const res = await apiClient.post(`/api/projects`, formData)

        console.log(res)
        return res.data;
    },

    updateProject: async (id, formData) => {
        const res = await apiClient.put(`/api/projects/edit/${id}`, formData)
        console.log(res)
        return res.data;
    },

    getProjectInfo: async (id) => {
        const res = await apiClient.get(`/api/projects/${id}`)
        console.log("Project info" + res);
        return res.data;
    },

    getProjectTasksStats: async (id) => {
        const res = await apiClient.get(`/api/projects/tasks-stats/${id}`)
        console.log(res);
        return res.data;
    },

    getProjectsStats: async () => {
        const res = await apiClient.get(`/api/projects/stats`)
        console.log(res);
        return res.data;
    },

    getProjects: async () => {
        const res = await apiClient.get(`/api/projects`)
        console.log(res);
        return res.data;
    },

    getProjectMembers: async (id) => {
        const res = await apiClient.get(`/api/projects/${id}/members`)
        console.log(res)
        return res.data;
    },

    getProjectUpcomingTasks: async (id) => {
        const res = await apiClient.get(`/api/projects/upcoming-tasks/${id}`)
        console.log(res)
        return res.data;
    },

    getProjectTasks: async (id) => {
        const res = await apiClient.get(`/api/projects/tasks/${id}`)
        console.log(res)
        return res.data;
    },

    getProjectMilestones: async (id) => {
        const res = await apiClient.get(`/api/projects/${id}/milestones`)
        console.log(res)
        return res.data;
    },

    createProjectMilestone: async (projectId, data) => {
        const res = await apiClient.post(`/api/projects/${projectId}/milestones`, data)
        console.log(res)
        return res.data;
    },

    addProjectMember: async (projectId, email, role) => {
        const res = await apiClient.post(`/api/projects/${projectId}/members`, { email, role })
        console.log(res)
        return res.data;
    },

    createProjectTag: async (projectId, tagData) => {
        const res = await apiClient.post(`/api/projects/${projectId}/tags`, tagData);
        return res.data;
    },

    deleteProjectTag: async (projectId, tagId) => {
        const res = await apiClient.delete(`/api/projects/${projectId}/tags/${tagId}`);
        return res.data;
    },

    getProjectFiles: async (projectId) => {
        const res = await apiClient.get(`/api/projects/${projectId}/files`);
        return res.data;
    },

    uploadProjectFile: async (projectId, formData) => {
        const res = await apiClient.post(`/api/files/upload/project/${projectId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    },

    deleteProjectFile: async (projectId, fileId) => {
        const res = await apiClient.delete(`/api/files/project/${projectId}/file/${fileId}`);
        return res.data;
    },

    deleteProject: async (id) => {
        const res = await apiClient.delete(`/api/projects/${id}`);
        return res.data;
    }
}

export default projects;