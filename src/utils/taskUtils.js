const PROJECT_COLORS = [
    '#592BF0', // Purple
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#3B82F6', // Blue
    '#06B6D4'  // Cyan
];

export const getProjectColor = (projectId) => {
    if (!projectId) return PROJECT_COLORS[0];
    const numId = typeof projectId === 'string' ? projectId.length : projectId;
    return PROJECT_COLORS[numId % PROJECT_COLORS.length];
};

export const getProjectKey = (title) => {
    if (!title) return 'PRJ';
    const words = title.trim().split(/\s+/);
    if (words.length > 1) {
        return words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
    }
    return title.substring(0, 3).toUpperCase();
};

export const formatTaskId = (task) => {
    if (task.projectKey) return `${task.projectKey}-${task.id}`;
    return `${getProjectKey(task.projectTitle)}-${task.id}`;
};
