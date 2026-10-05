import client from './client';

const getReport = async (period) => {
    // URL-encode the period to handle spaces (e.g., "This Week")
    const response = await client.get(`/api/reports?period=${encodeURIComponent(period)}`);
    return response.data;
};

export default {
    getReport
};
