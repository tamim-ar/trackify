import React from 'react';
import Icons from './Icons';

const DailyTaskDetails = ({ date, tasks }) => {
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTaskStats = (date) => {
    const tasksForDate = tasks.filter(task => 
      task.logs.some(log => 
        new Date(log.startTime).toLocaleDateString() === date.toLocaleDateString()
      )
    );

    return tasksForDate.map(task => {
      const dailyLogs = task.logs.filter(log => 
        new Date(log.startTime).toLocaleDateString() === date.toLocaleDateString()
      );
      
      const totalTime = dailyLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      
      return {
        id: task.id,
        name: task.name,
        attempts: dailyLogs.length,
        totalTime,
        timeFormatted: {
          seconds: totalTime % 60,
          minutes: Math.floor((totalTime % 3600) / 60),
          hours: Math.floor(totalTime / 3600),
        }
      };
    });
  };

  const taskStats = getTaskStats(date);
  const totalAttempts = taskStats.reduce((sum, task) => sum + task.attempts, 0);
  const totalTime = taskStats.reduce((sum, task) => sum + task.totalTime, 0);

  return (
    <div className="daily-details">
      <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2">
        <Icons.Calendar className="w-5 h-5" />
        {formatDate(date)}
      </h2>
      {taskStats.length > 0 ? (
        <div className="daily-summary">
          <div className="summary-total">
            <div className="summary-stat">
              <span className="text-sm text-gray-400">Total Time</span>
              <span className="text-2xl font-bold text-primary">
                {Math.floor(totalTime / 3600)}h {Math.floor((totalTime % 3600) / 60)}m
              </span>
            </div>
            <div className="summary-stat">
              <span className="text-sm text-gray-400">Attempts</span>
              <span className="text-2xl font-bold text-accent-blue">
                {totalAttempts}
              </span>
            </div>
          </div>
          
          <div className="task-stats-list">
            {taskStats.map(task => (
              <div key={task.id} className="task-stat-item">
                <div className="task-stat-header">
                  <h3 className="text-lg font-medium text-gray-100">{task.name}</h3>
                  <span className="text-sm text-accent-blue font-medium">
                    {task.attempts} attempts
                  </span>
                </div>
                <div className="task-stat-times">
                  <div className="time-unit bg-app-hover">
                    <span className="text-2xl font-bold text-gray-100">
                      {task.timeFormatted.hours}
                    </span>
                    <span className="text-xs text-gray-400">hours</span>
                  </div>
                  <div className="time-unit bg-app-hover">
                    <span className="text-2xl font-bold text-gray-100">
                      {task.timeFormatted.minutes}
                    </span>
                    <span className="text-xs text-gray-400">minutes</span>
                  </div>
                  <div className="time-unit bg-app-hover">
                    <span className="text-2xl font-bold text-gray-100">
                      {task.timeFormatted.seconds}
                    </span>
                    <span className="text-xs text-gray-400">seconds</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
          <span className="text-4xl mb-4">📅</span>
          <p>No tasks recorded for this date</p>
        </div>
      )}
    </div>
  );
};

export default DailyTaskDetails;
