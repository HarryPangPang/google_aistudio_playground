import axios from 'axios';

const API_HOST = _GLOBAL_VARS_.VITE_API_HOST;

const client = axios.create({
    baseURL: API_HOST || _GLOBAL_VARS_.VITE_APP_PROXY,
    headers: {
        'Content-Type': 'application/json'
    }
});

client.interceptors.response.use(
    response => response.data,
    error => {
        const message = error.response?.data?.error || error.message || 'Unknown error';
        return Promise.reject(new Error(message));
    }
);

export const api = {
    saveApp: (id: string, files: Record<string, string>) => {
        return client.post('/api/apps', { id, files });
    },

    deployApp: (payload: { files?: Record<string, string>, appId?: string }) => {
        return client.post('/api/deploy', payload);
    },

    getApp: (id: string) => {
        return client.get(`/api/apps?id=${id}`);
    },

    generateCode: (prompt: string) => {
        return client.post('/api/generate', { prompt });
    },
    getChatContent: () => {
        return client.get('/api/chatcontent');
    },
    sendChatMsg: (prompt: string) => {
        return client.post('/api/chatmsg', { prompt });
    },
    deploywithcode: (data: any) => {
        return client.post('/api/deploywithcode', { data });
    },
};
