const Store = require('electron-store');

const store = new Store({
    defaults: {
        tasks: [],
        settings: {
            theme: 'system', // changed from 'light' to 'system'
            notifications: true
        }
    }
});

const validateTask = (task) => {
    if (!task.name?.trim()) throw new Error('Task name is required');
    return {
        id: task.id || Date.now(),
        name: task.name.trim(),
        description: task.description || '',
        timeSpent: task.timeSpent || 0,
        isActive: Boolean(task.isActive),
        logs: Array.isArray(task.logs) ? task.logs : [],
        sessions: Array.isArray(task.sessions) ? task.sessions : [],
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

const StoreService = {
    getTasks: () => {
        try {
            const tasks = store.get('tasks', []);
            return tasks.map(task => validateTask(task));
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    },

    saveTasks: (tasks) => {
        try {
            const validTasks = tasks.map(task => validateTask(task));
            store.set('tasks', validTasks);
            return true;
        } catch (error) {
            console.error('Error saving tasks:', error);
            return false;
        }
    },
    
    // Individual task operations
    updateTask: (taskId, taskData) => {
        const tasks = store.get('tasks');
        const updatedTasks = tasks.map(task => 
            task.id === taskId ? { ...task, ...taskData } : task
        );
        store.set('tasks', updatedTasks);
        return updatedTasks;
    },

    // Settings operations
    getSettings: () => store.get('settings'),
    saveSettings: (settings) => store.set('settings', settings),

    // Theme operations
    getTheme: () => {
        const settings = store.get('settings');
        if (settings.theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return settings.theme;
    }
};

module.exports = StoreService;
