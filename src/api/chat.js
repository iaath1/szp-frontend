import client from './client';

const getChats = async () => {
    const response = await client.get('/api/chats');
    return response.data;
};

const getMessages = async (chatId) => {
    const response = await client.get(`/api/chats/${chatId}/messages`);
    return response.data;
};

const getOrCreatePrivateChat = async (userId) => {
    const response = await client.post(`/api/chats/user/${userId}`);
    return response.data;
};

export default {
    getChats,
    getMessages,
    getOrCreatePrivateChat
};
