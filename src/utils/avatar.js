const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const getAvatarUrl = (path, fallbackName = '') => {
    if (!path || path === 'undefined' || path === '/uploads/default_user_avatar.png') {
        if (fallbackName) {
            return `https://ui-avatars.com/api/?name=${fallbackName.replace(' ', '+')}&background=random`;
        }
        return 'https://i.pravatar.cc/150?img=11';
    }
    if (path.startsWith('http')) return path;
    return `${API_URL}/api/files/download?fileName=${path}`;
};
