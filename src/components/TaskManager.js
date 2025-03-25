import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import StoreService from '../services/store';
import 'react-calendar/dist/Calendar.css';
import NavBar from './NavBar';
import DailyTaskDetails from './DailyTaskDetails';
import Icons from './Icons';

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTaskName, setNewTaskName] = useState('');
  const [elapsedTime, setElapsedTime] = useState({});
  const [activeTab, setActiveTab] = useState('tasks');
  const [showDailyDetails, setShowDailyDetails] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [timeRange, setTimeRange] = useState('today'); // 'today', '3days', '7days', '30days', 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'syncing', 'synced', 'error'

  useEffect(() => {
    // Load tasks from store and ensure sessions array exists
    const savedTasks = StoreService.getTasks();
    if (savedTasks) {
      const tasksWithSessions = savedTasks.map(task => ({
        ...task,
        sessions: task.sessions || []
      }));
      setTasks(tasksWithSessions);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.isActive) {
          const lastLog = task.logs[task.logs.length - 1];
          const timeDiff = Math.floor((now - new Date(lastLog.startTime)) / 1000);
          setElapsedTime(prev => ({
            ...prev,
            [task.id]: (task.timeSpent || 0) + timeDiff
          }));
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tasks]);

  const createTask = (taskName, description) => {
    const newTask = {
      id: Date.now(),
      name: taskName,
      description: description,
      timeSpent: 0,
      isActive: false,
      logs: [],
      sessions: [] // Add sessions array to store individual session times
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    StoreService.saveTasks(updatedTasks);
  };

  const saveTasksToStore = async (updatedTasks) => {
    setSyncStatus('syncing');
    try {
      const success = await StoreService.saveTasks(updatedTasks);
      if (!success) throw new Error('Failed to save tasks');
      setTasks(updatedTasks);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error saving tasks:', error);
      setSyncStatus('error');
      // Show error notification
    }
  };

  const toggleTask = (taskId) => {
    const now = new Date();
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const isStarting = !task.isActive;
        const currentSessions = task.sessions || [];
        const currentTime = isStarting ? 0 : (elapsedTime[task.id] || 0);

        return {
          ...task,
          isActive: isStarting,
          timeSpent: task.timeSpent + (isStarting ? 0 : currentTime),
          logs: isStarting 
            ? [...(task.logs || []), { startTime: now.toISOString(), duration: 0 }] 
            : task.logs,
          sessions: !isStarting 
            ? [...currentSessions, currentTime]
            : currentSessions,
          updatedAt: now.toISOString()
        };
      } else if (task.isActive) {
        // Stop other active tasks
        const lastLog = task.logs[task.logs.length - 1];
        const duration = Math.floor((now - new Date(lastLog.startTime)) / 1000);
        return {
          ...task,
          isActive: false,
          timeSpent: task.timeSpent + duration,
          sessions: [...(task.sessions || []), duration],
          logs: task.logs.map((log, index) => 
            index === task.logs.length - 1 
              ? { ...log, duration } 
              : log
          ),
          updatedAt: now.toISOString()
        };
      }
      return task;
    });

    saveTasksToStore(updatedTasks);
    
    // Reset elapsed time for the toggled task
    setElapsedTime(prev => ({
      ...prev,
      [taskId]: 0
    }));
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    StoreService.saveTasks(updatedTasks);
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setNewTaskName(task.name);
    setTaskDescription(task.description);
  };

  const updateTask = (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, name: newTaskName, description: taskDescription }
        : task
    );
    setTasks(updatedTasks);
    StoreService.saveTasks(updatedTasks);
    setEditingTask(null);
    setNewTaskName('');
    setTaskDescription('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      if (editingTask) {
        updateTask(editingTask.id);
      } else {
        createTask(newTaskName, taskDescription);
        setNewTaskName('');
        setTaskDescription('');
      }
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTasksInRange = (range) => {
    const now = new Date();
    const ranges = {
      'today': 1,
      '3days': 3,
      '7days': 7,
      '30days': 30,
      'all': null
    };

    const daysAgo = ranges[range];
    if (!daysAgo) return tasks;

    const startDate = new Date(now.setDate(now.getDate() - daysAgo));
    return tasks.filter(task => 
      task.logs.some(log => new Date(log.startTime) >= startDate)
    );
  };

  const formatTimeForLabel = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const getPieChartData = () => {
    const tasksInRange = getTasksInRange(timeRange);
    const taskTimes = tasksInRange.map(task => {
      const totalSeconds = task.logs.reduce((acc, log) => acc + (log.duration || 0), 0);
      return {
        name: task.name,
        seconds: totalSeconds,
        formatted: formatTimeForLabel(totalSeconds)
      };
    });

    return {
      labels: taskTimes.map(task => `${task.name} (${task.formatted})`),
      datasets: [{
        data: taskTimes.map(task => task.seconds),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
        ]
      }]
    };
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDailyDetails(true);
    setActiveTab('calendar');
  };

  const getSortedTasks = () => {
    return tasks
      .filter(task => 
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by active status first
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        // Then by most recent start time
        const aLastLog = a.logs[a.logs.length - 1];
        const bLastLog = b.logs[b.logs.length - 1];
        if (aLastLog && bLastLog) {
          return new Date(bLastLog.startTime) - new Date(aLastLog.startTime);
        }
        return b.timeSpent - a.timeSpent;
      });
  };

  const handleMenuClick = (taskId, e) => {
    e.stopPropagation();
    setShowMenu(showMenu === taskId ? null : taskId);
  };

  const getDisplayTime = (task) => {
    if (task.isActive) {
      return formatTime(elapsedTime[task.id] || 0); // Show only current session time
    }
    return formatTime(task.timeSpent); // Show total accumulated time when inactive
  };

  const renderTaskForm = () => (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="task-search-input"
          />
          <Icons.Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button
          onClick={() => setEditingTask({})}
          className="create-task-btn"
        >
          <Icons.Plus className="w-5 h-5" />
          Create Task
        </button>
      </div>
      
      {editingTask && (
        <div className="task-modal">
          <form onSubmit={handleSubmit} className="task-form">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Task title"
              className="task-input"
              autoFocus
            />
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Task description (optional)"
              className="task-description-input"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setEditingTask(null);
                  setNewTaskName('');
                  setTaskDescription('');
                }}
              >
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {editingTask.id ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  const renderTaskCard = (task) => (
    <div className="task-footer">
      <div className="time-display flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Icons.Clock className="w-4 h-4" />
          <span className="text-gray-400">Session: {getDisplayTime(task)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icons.Clock className="w-4 h-4" />  {/* Changed from ClockIcon to Clock */}
          <span className="text-gray-400">Total: {formatTime(task.timeSpent)}</span>
        </div>
      </div>
      <button
        onClick={() => {
          if (!task.isActive) {
            setShowTimeModal(task.id);
          } else {
            toggleTask(task.id);
          }
        }}
        className={`task-toggle ${task.isActive ? 'active' : ''}`}
      >
        {task.isActive ? 
          <><Icons.Stop className="w-4 h-4" /> Stop</> : 
          <><Icons.Play className="w-4 h-4" /> Start</>
        }
      </button>
    </div>
  );

  const renderTaskList = () => (
    <div className="task-masonry">
      {getSortedTasks().map(task => (
        <div 
          key={task.id} 
          className={`task-card ${task.description ? 'has-description' : ''} ${task.isActive ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setShowMenu(null)}
        >
          <div className="task-card-content">
            <div className="task-card-header">
              <h3 className="task-title">{task.name}</h3>
              <div className="relative">
                <button
                  className="task-menu-btn"
                  onClick={(e) => handleMenuClick(task.id, e)}
                >
                  <Icons.Menu className="w-5 h-5" />
                </button>
                {showMenu === task.id && (
                  <div className="task-menu">
                    <button
                      onClick={() => startEditing(task)}
                      disabled={task.isActive}
                      className="task-menu-item"
                    >
                      <Icons.Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      disabled={task.isActive}
                      className="task-menu-item text-red-400"
                    >
                      <Icons.Delete className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {task.description && (
              <p className="task-description">{task.description}</p>
            )}

            {renderTaskCard(task)}
          </div>
        </div>
      ))}

      {/* Time Modal */}
      {showTimeModal && (
        <div className="time-modal">
          <div className="time-modal-content">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icons.Clock className="w-5 h-5" />
              Set Time Duration
            </h3>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => {
                  toggleTask(showTimeModal);
                  setShowTimeModal(null);
                }}
                className="flex-1 bg-gradient-to-r from-primary to-primary/90 text-white px-4 py-2.5 rounded-lg font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Icons.Play className="w-4 h-4" />
                Start Now
              </button>
              <button
                onClick={() => setShowTimeModal(null)}
                className="flex-1 bg-app-hover text-gray-300 px-4 py-2.5 rounded-lg font-medium hover:bg-app-light transition-colors flex items-center justify-center gap-2"
              >
                <Icons.XMark className="w-4 h-4" />  {/* Changed from XMarkIcon to XMark */}
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTaskStats = () => {
    const tasksInRange = getTasksInRange(timeRange)
      .sort((a, b) => {
        const aTime = a.logs.reduce((acc, log) => acc + (log.duration || 0), 0);
        const bTime = b.logs.reduce((acc, log) => acc + (log.duration || 0), 0);
        return bTime - aTime;
      });

    return (
      <div className="task-stats">
        {tasksInRange.map(task => {
          const totalTime = task.logs.reduce((acc, log) => acc + (log.duration || 0), 0);
          return (
            <div key={task.id} className="stat-item">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-100">{task.name}</h3>
                <span className="text-sm font-mono text-gray-400">
                  {formatTimeForLabel(totalTime)}
                </span>
              </div>
              <div className="mt-1 w-full bg-app-dark rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ 
                    width: `${(totalTime / (tasksInRange[0].logs.reduce((acc, log) => acc + (log.duration || 0), 0))) * 100}%` 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <div className="task-section space-y-4">
            {renderTaskForm()}
            {renderTaskList()}
          </div>
        );
      case 'calendar':
        return (
          <div className="calendar-section space-y-4">
            <Calendar
              onChange={handleDateSelect}
              value={selectedDate}
              className="calendar-wrapper"
            />
            {showDailyDetails && (
              <DailyTaskDetails 
                date={selectedDate}
                tasks={tasks}
              />
            )}
          </div>
        );
      case 'stats':
        return (
          <div className="chart-section space-y-6">
            <div className="time-range-selector">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="time-range-select"
              >
                <option value="today">Today</option>
                <option value="3days">Last 3 Days</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="stats-chart-container">
                <h3 className="text-lg font-medium mb-4 text-white">Time Distribution</h3>
                <Pie 
                  data={getPieChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: '#9CA3AF',
                          padding: 10,
                          usePointStyle: true,
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="stats-list-container">
                <h3 className="text-lg font-medium mb-4 text-white">Tasks Breakdown</h3>
                {renderTaskStats()}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-app-base text-gray-100 flex">
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-16 sm:ml-20 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">
              {activeTab === 'tasks' ? 'Tasks' : 
               activeTab === 'calendar' ? 'Calendar' : 'Analytics'}
            </h1>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              {syncStatus === 'syncing' && <Icons.Loading className="w-4 h-4 animate-spin" />}
              {syncStatus === 'error' && <Icons.Warning className="w-4 h-4 text-red-400" />}
              {syncStatus === 'synced' && <Icons.Check className="w-4 h-4 text-green-400" />}
              {syncStatus === 'syncing' ? 'Syncing...' :
               syncStatus === 'error' ? 'Sync failed' : 'All changes saved'}
            </div>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default TaskManager;
