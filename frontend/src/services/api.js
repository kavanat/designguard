import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = {
    getPositions: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/positions`);
            return response.data;
        } catch (error) {
            console.error('Error fetching positions:', error);
            if (error.message.includes('Network Error')) {
                throw new Error('Unable to connect to the backend server. Please ensure the server is running.');
            }
            throw error;
        }
    },

    submitTradeEvent: async (event) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/events`, [event]);
            return response.data;
        } catch (error) {
            console.error('Error submitting trade event:', error);
            if (error.message.includes('Network Error')) {
                throw new Error('Unable to connect to the backend server. Please ensure the server is running.');
            }
            if (error.response) {
                throw new Error(error.response.data.message || 'Error submitting trade event');
            }
            throw error;
        }
    }
};

export default api; 