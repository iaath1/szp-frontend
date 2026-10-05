import client from './client';

export const getMonthlyEvents = async (year, month) => {
    const response = await client.get(`/api/calendar/events?year=${year}&month=${month}`);
    return response.data;
};

export const createEvent = async (eventData) => {
    const response = await client.post('/api/calendar/events', eventData);
    return response.data;
};

export const deleteEvent = async (eventId) => {
    const response = await client.delete(`/api/calendar/events/${eventId}`);
    return response.data;
};
