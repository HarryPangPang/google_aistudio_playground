import axios from 'axios';

const API_HOST = _GLOBAL_VARS_.VITE_API_HOST;

const client = axios.create({
    baseURL: API_HOST || _GLOBAL_VARS_.VITE_APP_PROXY,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add driveid and auth token to every request
client.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        // 在 hash 路由模式下，参数在 hash 后面，需要从 hash 中解析
        const hash = window.location.hash;
        const searchIndex = hash.indexOf('?');
        const search = searchIndex !== -1 ? hash.substring(searchIndex) : '';
        const params = new URLSearchParams(search);
        const driveId = params.get('driveid');
        if (driveId) {
            config.params = config.params || {};
            config.params.driveid = driveId;
        }

        // 从 localStorage 获取 token 并添加到请求头
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

client.interceptors.response.use(
    response => response.data,
    error => {
        const message = error.response?.data?.error || error.message || 'Unknown error';
        return Promise.reject(new Error(message));
    }
);
const formatPromot = (prompt: string) => {
    let promt = prompt+ '并满足条:不允许使用Gemini，不需要加入Gemini相关的内容包括GeminiService，我的应用不需要这个服务，同时默认是H5游戏';
    return prompt.replace(/\n/g, ' ').trim();
}
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
        return client.post('/api/generate', { prompt: formatPromot(prompt) });
    },
    getChatContent: (driveid: string) => {
        return client.get('/api/chatcontent', { params: { driveid } });
    },
    initChatContent: (prompt: string, model?: { label: string; value: number }) => {
        return client.post('/api/initChatContent', {
            prompt: formatPromot(prompt),
            modelLabel: model?.label,
            modelValue: model?.value
        });
    },
    sendChatMsg: (payload: { prompt: string, driveid: string, model?: { label: string; value: number } }) => {
        return client.post('/api/chatmsg', {
            ...payload,
            modelLabel: payload.model?.label,
            modelValue: payload.model?.value,
            model: undefined  // Remove the original model field
        });
    },
    deploywithcode: (data: any) => {
        return client.post('/api/deploywithcode', { data });
    },
    importFromUrl: (url: string) => {
        return client.post('/api/import', { url });
    },
    importFromFile: (file: File) => {
        const formData = new FormData();
        formData.append('zipFile', file);
        return client.post('/api/uploadzip', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    getBuildRecord: () => {
        return client.get('/api/buildRecord');
    }
};
