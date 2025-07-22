// components/layout/index.js - Layout and Navigation Components
// These components handle the overall app structure and navigation

import React, { Suspense } from 'react';
import { 
  Button, 
  IconButton, 
  LoadingSpinner, 
  Toast,
  Modal 
} from '../shared';
import { useAuth, useClassNavigation, useToast, useSound } from '../../hooks';

// ===============================================
// NAVIGATION COMPONENTS
// ===============================================

/**
 * Main Navigation Tabs
 */
export const NavigationTabs = ({ 
  activeTab, 
  onTabChange, 
  userPlan = 'basic' 
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', isPro: false },
    { id: 'students', label: 'Students', icon: '👥', isPro: false },
    { id: 'quests', label: 'Quests', icon: '📜', isPro: false },
    { id: 'shop', label: 'Shop', icon: '🛍️', isPro: false },
    { id: 'race', label: 'Pet Race', icon: '🏁', isPro: false },
    { id: 'fishing', label: 'Fishing', icon: '🎣', isPro: false },
    { id: 'games', label: 'Games', icon: '🎮', isPro: false },
    { id: 'curriculum', label: 'Curriculum', icon: '📚', isPro: true },
    { id: 'toolkit', label: 'Teacher Tools', icon: '🛠️', isPro: true },
    { id: 'classes', label: 'My Classes', icon: '🏫', isPro: false },
    { id: 'settings', label: 'Settings', icon: '⚙️', isPro: false }
  ];

  // Filter tabs based on user plan
  const availableTabs = tabs.filter(tab => 
    !tab.isPro || userPlan === 'pro' || userPlan === 'premium'
  );

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-wrap gap-2">
        {availableTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2 rounded-lg font-semibold transition-all duration-200 
              flex items-center space-x-2 min-w-max
              ${tab.isPro 
                ? (activeTab === tab.id 
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105" 
                    : "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg")
                : (activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md hover:shadow-lg")
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.isPro && (
              <span className="bg-yellow-400 text-purple-800 text-xs px-2 py-1 rounded-full font-bold">
                PRO
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Class Selector Component
 */
export const ClassSelector = ({ 
  currentClass, 
  availableClasses, 
  onClassChange,
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" />
        <span className="text-gray-600">Loading classes...</span>
      </div>
    );
  }

  if (!availableClasses.length) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600 mb-2">No classes found</p>
        <Button size="sm">Create First Class</Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={currentClass?.id || ''}
        onChange={(e) => {
          const selectedClass = availableClasses.find(cls => cls.id === e.target.value);
          if (selectedClass) onClassChange(selectedClass.id);
        }}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {availableClasses.map(classItem => (
          <option key={classItem.id} value={classItem.id}>
            {classItem.name} ({classItem.students?.length || 0} students)
          </option>
        ))}
      </select>
    </div>
  );
};

// ===============================================
// HEADER COMPONENTS
// ===============================================

/**
 * Main App Header
 */
export const AppHeader = ({ 
  user, 
  userData, 
  currentClass,
  availableClasses,
  onClassChange,
  onLogout,
  classLoading = false 
}) => {
  const { soundEnabled, setSoundEnabled, volume, setVolume } = useSound();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">🏆 Classroom Champions</div>
          </div>

          {/* Class Selector */}
          <div className="flex-1 max-w-xs mx-8">
            {currentClass && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-100">
                  Current Class
                </label>
                <ClassSelector
                  currentClass={currentClass}
                  availableClasses={availableClasses}
                  onClassChange={onClassChange}
                  loading={classLoading}
                />
              </div>
            )}
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-4">
            {/* Sound Toggle */}
            <div className="flex items-center space-x-2">
              <IconButton
                icon={soundEnabled ? '🔊' : '🔇'}
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant="ghost"
                className="text-white hover:bg-blue-500"
                tooltip={soundEnabled ? 'Disable Sound' : 'Enable Sound'}
              />
              
              {soundEnabled && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-16"
                />
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="font-semibold">{user?.email}</div>
                <div className="text-xs text-blue-100">
                  {userData?.subscription || 'Basic'} Plan
                </div>
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={onLogout}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// ===============================================
// CONTENT AREA COMPONENTS
// ===============================================

/**
 * Tab Content Wrapper with Suspense
 */
export const TabContentWrapper = ({ children, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600">Loading component...</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

/**
 * Main Content Area
 */
export const ContentArea = ({ children, className = '' }) => {
  return (
    <main className={`flex-1 overflow-auto bg-gray-50 ${className}`}>
      <div className="bg-white rounded-xl shadow-lg m-6 min-h-[calc(100vh-200px)]">
        <div className="p-8">
          {children}
        </div>
      </div>
    </main>
  );
};

// ===============================================
// TOAST CONTAINER COMPONENT
// ===============================================

/**
 * Toast Notification Container
 */
export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

// ===============================================
// MODAL CONTAINER COMPONENT
// ===============================================

/**
 * Global Modal Container for App-wide Modals
 */
export const ModalContainer = ({ 
  modals, 
  modalData, 
  onCloseModal,
  students = [],
  currentClass = null 
}) => {
  return (
    <>
      {/* Add Student Modal */}
      {modals.addStudent && (
        <Modal
          isOpen={modals.addStudent}
          onClose={() => onCloseModal('addStudent')}
          title="Add New Student"
          size="md"
        >
          <div className="p-6">
            {/* Add Student Form would go here */}
            <p>Add Student Form Component</p>
          </div>
        </Modal>
      )}

      {/* Character Sheet Modal */}
      {modals.characterSheet && modalData.characterSheet && (
        <Modal
          isOpen={modals.characterSheet}
          onClose={() => onCloseModal('characterSheet')}
          title={`${modalData.characterSheet.firstName}'s Character Sheet`}
          size="lg"
        >
          <div className="p-6">
            {/* Character Sheet Component would go here */}
            <p>Character Sheet Component</p>
          </div>
        </Modal>
      )}

      {/* Level Up Modal */}
      {modals.levelUp && modalData.levelUp && (
        <Modal
          isOpen={modals.levelUp}
          onClose={() => onCloseModal('levelUp')}
          title="Level Up!"
          size="md"
        >
          <div className="p-6 text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800">
              {modalData.levelUp.studentName} reached Level {modalData.levelUp.newLevel}!
            </h3>
            <Button onClick={() => onCloseModal('levelUp')}>
              Awesome!
            </Button>
          </div>
        </Modal>
      )}

      {/* Pet Unlock Modal */}
      {modals.petUnlock && modalData.petUnlock && (
        <Modal
          isOpen={modals.petUnlock}
          onClose={() => onCloseModal('petUnlock')}
          title="Pet Unlocked!"
          size="md"
        >
          <div className="p-6 text-center space-y-4">
            <div className="text-6xl">🐾</div>
            <h3 className="text-2xl font-bold text-gray-800">
              {modalData.petUnlock.studentName} unlocked a pet!
            </h3>
            <div className="flex items-center justify-center space-x-3">
              <img
                src={modalData.petUnlock.pet?.image}
                alt={modalData.petUnlock.pet?.name}
                className="w-16 h-16 rounded-lg"
              />
              <div>
                <div className="font-bold">{modalData.petUnlock.pet?.name}</div>
                <div className="text-sm text-gray-600">New Companion</div>
              </div>
            </div>
            <Button onClick={() => onCloseModal('petUnlock')}>
              Cool!
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

// ===============================================
// LOADING STATES
// ===============================================

/**
 * App Loading Screen
 */
export const AppLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white space-y-6">
        <div className="text-6xl animate-bounce">🏆</div>
        <h1 className="text-4xl font-bold">Classroom Champions</h1>
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="lg" color="white" />
          <span className="text-xl">Loading your classroom...</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Error Boundary Fallback
 */
export const ErrorFallback = ({ error, resetError }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">😞</div>
        <h1 className="text-2xl font-bold text-gray-800">Oops! Something went wrong</h1>
        <p className="text-gray-600">
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>
        <div className="space-y-2">
          <Button onClick={resetError}>
            Try Again
          </Button>
          <details className="text-sm text-gray-500">
            <summary className="cursor-pointer">Show error details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-left overflow-auto">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// MAIN LAYOUT COMPONENT
// ===============================================

/**
 * Main App Layout Component
 */
export const AppLayout = ({ 
  user,
  userData,
  currentClass,
  availableClasses,
  classLoading,
  activeTab,
  onTabChange,
  onClassChange,
  onLogout,
  children,
  modals,
  modalData,
  onCloseModal,
  students = []
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <AppHeader
        user={user}
        userData={userData}
        currentClass={currentClass}
        availableClasses={availableClasses}
        onClassChange={onClassChange}
        onLogout={onLogout}
        classLoading={classLoading}
      />

      {/* Navigation */}
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        userPlan={userData?.subscription}
      />

      {/* Main Content */}
      <ContentArea>
        <TabContentWrapper>
          {children}
        </TabContentWrapper>
      </ContentArea>

      {/* Global Modals */}
      <ModalContainer
        modals={modals}
        modalData={modalData}
        onCloseModal={onCloseModal}
        students={students}
        currentClass={currentClass}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

// Export all components
