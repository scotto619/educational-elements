// components/features/dashboard/index.js - Dashboard Components
// These focused components handle the main dashboard functionality

import React, { useState, useMemo } from 'react';
import { 
  Button, 
  Card, 
  StatsCard, 
  LoadingSpinner,
  EmptyState
} from '../../shared';
import { useStudents, useQuests, useStudentStats } from '../../../hooks';
import { calculateLevel, calculateCoins } from '../../../config/gameData';

// ===============================================
// GUILD CHAMPIONS LEADERBOARD
// ===============================================

/**
 * Top performing students display
 */
export const GuildChampions = ({ students, limit = 5 }) => {
  const topStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, limit);
  }, [students, limit]);

  if (!topStudents.length) {
    return (
      <Card title="Guild Champions" className="h-full">
        <EmptyState
          icon="🏆"
          title="No champions yet"
          description="Students will appear here as they earn XP!"
        />
      </Card>
    );
  }

  return (
    <Card title="Guild Champions" className="h-full">
      <div className="space-y-3">
        {topStudents.map((student, index) => (
          <div 
            key={student.id}
            className={`
              flex items-center space-x-3 p-3 rounded-lg
              ${index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                index === 1 ? 'bg-gray-50 border border-gray-200' :
                index === 2 ? 'bg-orange-50 border border-orange-200' :
                'bg-blue-50 border border-blue-200'}
            `}
          >
            {/* Rank */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-500 text-white' :
                index === 2 ? 'bg-orange-500 text-white' :
                'bg-blue-500 text-white'}
            `}>
              {index + 1}
            </div>

            {/* Avatar */}
            <img
              src={student.avatar}
              alt={`${student.firstName}'s avatar`}
              className="w-10 h-10 rounded-full border-2 border-white"
              onError={(e) => {
                e.target.src = '/Avatars/Wizard F/Level 1.png';
              }}
            />

            {/* Info */}
            <div className="flex-1">
              <div className="font-semibold text-gray-800">
                {student.firstName} {student.lastName}
              </div>
              <div className="text-sm text-gray-600">
                Level {calculateLevel(student.totalPoints || 0)} • {student.totalPoints || 0} XP
              </div>
            </div>

            {/* Trophy Icon for top 3 */}
            {index < 3 && (
              <div className="text-xl">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

// ===============================================
// CLASS STATISTICS OVERVIEW
// ===============================================

/**
 * Class-wide statistics display
 */
export const ClassStatsOverview = ({ students }) => {
  const stats = useStudentStats(students);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatsCard
        title="Total Students"
        value={stats.totalStudents}
        icon="👥"
        color="blue"
      />
      
      <StatsCard
        title="Total XP Earned"
        value={stats.totalXP.toLocaleString()}
        icon="⭐"
        color="purple"
      />
      
      <StatsCard
        title="Average Level"
        value={(stats.totalXP / stats.totalStudents / 100).toFixed(1)}
        icon="📈"
        color="green"
      />
      
      <StatsCard
        title="Active Learners"
        value={stats.topPerformers.length}
        icon="🔥"
        color="yellow"
      />
    </div>
  );
};

// ===============================================
// RECENT ACTIVITY FEED
// ===============================================

/**
 * Display recent student activities
 */
export const RecentActivity = ({ students, limit = 10 }) => {
  const recentActivities = useMemo(() => {
    const activities = [];

    students.forEach(student => {
      // Get recent XP logs
      if (student.logs && student.logs.length > 0) {
        const recentLogs = student.logs
          .slice(-5) // Last 5 activities per student
          .map(log => ({
            type: 'xp_award',
            studentName: `${student.firstName} ${student.lastName}`,
            studentAvatar: student.avatar,
            category: log.type,
            amount: log.amount,
            timestamp: log.date,
            id: `${student.id}_${log.date}`
          }));
        activities.push(...recentLogs);
      }

      // Add level ups
      if (student.level > 1) {
        activities.push({
          type: 'level_up',
          studentName: `${student.firstName} ${student.lastName}`,
          studentAvatar: student.avatar,
          level: student.level,
          timestamp: student.lastXpDate || student.lastUpdated,
          id: `${student.id}_levelup`
        });
      }

      // Add pet unlocks
      if (student.pet?.image) {
        activities.push({
          type: 'pet_unlock',
          studentName: `${student.firstName} ${student.lastName}`,
          studentAvatar: student.avatar,
          petName: student.pet.name,
          timestamp: student.pet.unlockedAt || student.lastUpdated,
          id: `${student.id}_pet`
        });
      }
    });

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }, [students, limit]);

  if (!recentActivities.length) {
    return (
      <Card title="Recent Activity" className="h-full">
        <EmptyState
          icon="📊"
          title="No recent activity"
          description="Activity will appear here as students earn XP and level up!"
        />
      </Card>
    );
  }

  return (
    <Card title="Recent Activity" className="h-full">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recentActivities.map(activity => (
          <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
            <img
              src={activity.studentAvatar}
              alt={`${activity.studentName}'s avatar`}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                e.target.src = '/Avatars/Wizard F/Level 1.png';
              }}
            />

            <div className="flex-1">
              <div className="text-sm">
                <span className="font-medium">{activity.studentName}</span>
                {activity.type === 'xp_award' && (
                  <span className="text-gray-600">
                    {' '}earned +{activity.amount} {activity.category} XP
                  </span>
                )}
                {activity.type === 'level_up' && (
                  <span className="text-purple-600">
                    {' '}reached Level {activity.level}! 🎉
                  </span>
                )}
                {activity.type === 'pet_unlock' && (
                  <span className="text-green-600">
                    {' '}unlocked pet: {activity.petName} 🐾
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleDateString()}
              </div>
            </div>

            <div className="text-lg">
              {activity.type === 'xp_award' && '⭐'}
              {activity.type === 'level_up' && '🎉'}
              {activity.type === 'pet_unlock' && '🐾'}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ===============================================
// QUICK ACTIONS PANEL
// ===============================================

/**
 * Quick action buttons for common tasks
 */
export const QuickActions = ({ onTabChange, currentClass }) => {
  const quickActionButtons = [
    {
      id: 'students',
      label: 'Manage Students',
      icon: '👥',
      description: 'Award XP and view student progress',
      color: 'bg-blue-500'
    },
    {
      id: 'quests',
      label: 'Create Quest',
      icon: '📜',
      description: 'Set up new learning challenges',
      color: 'bg-purple-500'
    },
    {
      id: 'shop',
      label: 'Class Shop',
      icon: '🛍️',
      description: 'Manage rewards and purchases',
      color: 'bg-green-500'
    },
    {
      id: 'race',
      label: 'Pet Race',
      icon: '🏁',
      description: 'Start a fun class activity',
      color: 'bg-yellow-500'
    },
    {
      id: 'games',
      label: 'Class Games',
      icon: '🎮',
      description: 'Interactive learning games',
      color: 'bg-red-500'
    },
    {
      id: 'toolkit',
      label: 'Teacher Tools',
      icon: '🛠️',
      description: 'Timers, pickers, and utilities',
      color: 'bg-indigo-500'
    }
  ];

  if (!currentClass) {
    return (
      <Card title="Quick Actions" className="h-full">
        <EmptyState
          icon="➕"
          title="No class selected"
          description="Create or select a class to access quick actions"
        />
      </Card>
    );
  }

  return (
    <Card title="Quick Actions" className="h-full">
      <div className="grid grid-cols-2 gap-3">
        {quickActionButtons.map(action => (
          <button
            key={action.id}
            onClick={() => onTabChange(action.id)}
            className={`
              ${action.color} text-white p-4 rounded-lg shadow-md 
              hover:shadow-lg transform hover:scale-105 transition-all duration-200
              text-left
            `}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <div className="font-semibold text-sm">{action.label}</div>
            <div className="text-xs opacity-90 mt-1">{action.description}</div>
          </button>
        ))}
      </div>
    </Card>
  );
};

// ===============================================
// MAIN DASHBOARD COMPONENT
// ===============================================

/**
 * Complete Dashboard using smaller components
 */
export const DashboardTab = ({ userId, classId, currentClass, onTabChange }) => {
  const { students, loading } = useStudents(userId, classId);
  const { activeQuests } = useQuests(userId, classId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentClass) {
    return (
      <div className="text-center py-12">
        <EmptyState
          icon="🏫"
          title="No Class Selected"
          description="Create or select a class to view your dashboard"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to {currentClass.name}! 🏆
        </h1>
        <p className="text-gray-600 mt-2">
          {students.length} brave adventurers ready for learning
        </p>
      </div>

      {/* Statistics Overview */}
      <ClassStatsOverview students={students} />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guild Champions - Takes up 1 column */}
        <div>
          <GuildChampions students={students} />
        </div>

        {/* Recent Activity - Takes up 1 column */}
        <div>
          <RecentActivity students={students} />
        </div>

        {/* Quick Actions - Takes up 1 column */}
        <div>
          <QuickActions 
            onTabChange={onTabChange} 
            currentClass={currentClass} 
          />
        </div>
      </div>

      {/* Additional Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Quests Summary */}
        <Card title="Active Quests">
          {activeQuests.length > 0 ? (
            <div className="space-y-2">
              {activeQuests.slice(0, 3).map(quest => (
                <div key={quest.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{quest.title}</span>
                  <span className="text-xs text-gray-600">
                    {quest.completedBy.length} completed
                  </span>
                </div>
              ))}
              {activeQuests.length > 3 && (
                <div className="text-center">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => onTabChange('quests')}
                  >
                    View All {activeQuests.length} Quests
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon="📜"
              title="No active quests"
              description="Create your first quest to engage students!"
              action={
                <Button onClick={() => onTabChange('quests')}>
                  Create Quest
                </Button>
              }
            />
          )}
        </Card>

        {/* Class Progress Summary */}
        <Card title="Class Progress">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Level Progress</span>
                <span>Level 2.3</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {students.filter(s => s.pet?.image).length}
                </div>
                <div className="text-xs text-gray-600">Have Pets</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {students.filter(s => calculateLevel(s.totalPoints) >= 3).length}
                </div>
                <div className="text-xs text-gray-600">Level 3+</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {students.reduce((sum, s) => sum + calculateCoins(s), 0)}
                </div>
                <div className="text-xs text-gray-600">Total Coins</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Export all components
