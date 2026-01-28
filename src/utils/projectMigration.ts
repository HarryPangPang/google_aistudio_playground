import type { Project } from '../types/project';

/**
 * 将旧格式的项目数据迁移到新格式
 */
export const migrateProject = (oldProject: any): Project => {
    // 如果已经是新格式，直接返回
    if (oldProject.type && (oldProject.id || oldProject.driveid)) {
        return oldProject as Project;
    }

    // 迁移旧格式
    const migrated: Project = {
        // ID: 优先使用 id，否则使用 driveid
        id: oldProject.id || oldProject.driveid || `legacy-${Date.now()}`,

        // 类型推断：有 driveid 就是 ai-chat
        type: oldProject.driveid ? 'ai-chat' : undefined,

        // 平台信息
        platformId: oldProject.platformId || 'google-ai-studio',

        // 模型信息（兼容旧格式）
        model: typeof oldProject.model === 'object'
            ? oldProject.model
            : typeof oldProject.model === 'number'
                ? { label: getModelLabel(oldProject.model), value: oldProject.model }
                : undefined,

        // 标题和内容
        title: oldProject.title || getFirstPrompt(oldProject.prompt),
        prompt: normalizePrompt(oldProject.prompt),
        chatContent: oldProject.chatContent,

        // Google AI Studio 特有
        driveid: oldProject.driveid,

        // 部署信息
        deployUrl: oldProject.deployUrl,

        // 状态
        status: oldProject.status || (oldProject.deployUrl ? 'deployed' : 'draft'),

        // 时间戳
        createdAt: oldProject.createdAt || Date.now(),
        updatedAt: oldProject.updatedAt,

        // 其他字段
        files: oldProject.files,
        sourceUrl: oldProject.sourceUrl,
    };

    return migrated;
};

/**
 * 批量迁移项目列表
 */
export const migrateProjects = (projects: any[]): Project[] => {
    return projects.map(migrateProject);
};

/**
 * 从 localStorage 加载并迁移项目
 */
export const loadAndMigrateProjects = (): Project[] => {
    try {
        const stored = localStorage.getItem('chat_history');
        if (!stored) return [];

        const projects = JSON.parse(stored);
        const migrated = migrateProjects(projects);

        // 保存迁移后的数据（静默升级）
        localStorage.setItem('chat_history', JSON.stringify(migrated));

        return migrated;
    } catch (e) {
        console.error('Failed to load and migrate projects:', e);
        return [];
    }
};

// 辅助函数
function getModelLabel(value: number): string {
    const modelMap: Record<number, string> = {
        1: 'Gemini 3 Flash Preview',
        2: 'Gemini 3 Pro Preview',
        3: 'Gemini 2.5 Pro',
        4: 'Gemini 2.5 Flash',
    };
    return modelMap[value] || 'Unknown Model';
}

function getFirstPrompt(prompt: any): string | undefined {
    if (Array.isArray(prompt) && prompt.length > 0) {
        return prompt[0];
    }
    if (typeof prompt === 'string') {
        return prompt;
    }
    return undefined;
}

function normalizePrompt(prompt: any): string[] | undefined {
    if (Array.isArray(prompt)) {
        return prompt;
    }
    if (typeof prompt === 'string') {
        return [prompt];
    }
    return undefined;
}
