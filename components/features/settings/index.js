// components/features/settings/index.js - Settings and Account Management Components
// These focused components handle user settings, preferences, and account management

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Modal,
  InputField,
  SelectField,
  TextareaField,
  ConfirmDialog,
  LoadingSpinner,
  Toast
} from '../../shared';
import { useAuth, useToast } from '../../../hooks';
import firebaseService from '../../../config/services/firebaseService';
import { downloadJSON, copyToClipboard } from '../../shared/ErrorBoundary';

// ===============================================
// ACCOUNT SETTINGS COMPONENT
// ===============================================

/**
 * User account information and preferences
 */
export const AccountSettings = ({ user, userData, onUpdate }) => {
  const [settings, setSettings] = useState({
    email: user?.email || '',
    displayName: userData?.displayName || '',
    soundEnabled: userData?.preferences?.soundEnabled ?? true,
    theme: userData?.preferences?.theme || 'default',
    notifications: userData?.preferences?.notifications ?? true,
    emailUpdates: userData?.preferences?.emailUpdates ?? false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const preferences = {
        soundEnabled: settings.soundEnabled,
        theme: settings.theme,
        notifications: settings.notifications,
        emailUpdates: settings.emailUpdates
      };

      await firebaseService.updatePreferences(user.uid, preferences);
      
      if (settings.displayName !== userData?.displayName) {
        await firebaseService.updateUserData(user.uid, {
          displayName: settings.displayName
        });
      }

      showToast('Settings saved successfully!', 'success');
      onUpdate?.();
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Account Settings">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
          
          <InputField
            label="Email Address"
            value={settings.email}
            disabled={true}
            className="bg-gray-50"
          />
          
          <InputField
            label="Display Name"
            value={settings.displayName}
            onChange={(value) => setSettings(prev => ({ ...prev, displayName: value }))}
            placeholder="Enter your display name"
          />
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="soundEnabled"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="soundEnabled" className="text-gray-700">
                Enable Sound Effects
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notifications}
                onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="notifications" className="text-gray-700">
                Show Notifications
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="emailUpdates"
                checked={settings.emailUpdates}
                onChange={(e) => setSettings(prev => ({ ...prev, emailUpdates: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="emailUpdates" className="text-gray-700">
                Receive Email Updates
              </label>
            </div>
          </div>

          <SelectField
            label="Theme"
            value={settings.theme}
            onChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}
            options={[
              { value: 'default', label: 'Default Theme' },
              { value: 'dark', label: 'Dark Theme (Coming Soon)' },
              { value: 'colorful', label: 'Colorful Theme (Coming Soon)' }
            ]}
          />
        </div>

        {/* Account Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Subscription:</span>
                <span className="ml-2 capitalize">{userData?.subscription || 'Basic'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Member Since:</span>
                <span className="ml-2">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Classes:</span>
                <span className="ml-2">{userData?.classes?.length || 0}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Login:</span>
                <span className="ml-2">
                  {userData?.lastLoginAt ? new Date(userData.lastLoginAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            loading={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </Card>
  );
};

// ===============================================
// DATA MANAGEMENT COMPONENT
// ===============================================

/**
 * Export, import, and backup data management
 */
export const DataManagement = ({ user, userData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { showToast } = useToast();

  const exportAllData = async () => {
    setIsExporting(true);
    try {
      const allData = {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: userData?.displayName
        },
        userData: userData,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      downloadJSON(allData, `classroom-champions-backup-${new Date().toISOString().split('T')[0]}.json`);
      showToast('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Failed to export data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const copyDataToClipboard = async () => {
    try {
      const data = JSON.stringify(userData, null, 2);
      await copyToClipboard(data);
      showToast('Data copied to clipboard!', 'success');
    } catch (error) {
      showToast('Failed to copy data', 'error');
    }
  };

  const resetAllData = async () => {
    setIsResetting(true);
    try {
      // This would reset user data - implement carefully!
      const resetData = {
        classes: [],
        preferences: userData?.preferences || {},
        resetAt: new Date().toISOString()
      };

      await firebaseService.updateUserData(user.uid, resetData);
      showToast('All data has been reset!', 'success');
      setShowResetDialog(false);
      
      // Refresh the page to reflect changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Reset error:', error);
      showToast('Failed to reset data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card title="Data Management">
      <div className="space-y-6">
        <div className="text-sm text-gray-600">
          Manage your Classroom Champions data with export, backup, and reset options.
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Export & Backup</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={exportAllData}
              loading={isExporting}
              variant="secondary"
              className="flex items-center justify-center space-x-2"
            >
              <span>📥</span>
              <span>Export All Data</span>
            </Button>

            <Button
              onClick={copyDataToClipboard}
              variant="secondary"
              className="flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>Copy to Clipboard</span>
            </Button>
          </div>
        </div>

        {/* Support Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Support</h3>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Need Help?</h4>
            <p className="text-sm text-blue-700 mb-3">
              Contact our support team for assistance with your account or technical issues.
            </p>
            <div className="space-y-2 text-sm">
              <div>📧 Email: support@classroomchampions.com</div>
              <div>📚 Documentation: help.classroomchampions.com</div>
              <div>💬 Live Chat: Available 9 AM - 5 PM EST</div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
          
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <h4 className="font-medium text-red-800 mb-2">Reset All Data</h4>
            <p className="text-sm text-red-700 mb-4">
              This will permanently delete all your classes, students, and progress. This action cannot be undone.
            </p>
            
            <Button
              onClick={() => setShowResetDialog(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reset All Data
            </Button>
          </div>
        </div>

        {/* Reset Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showResetDialog}
          title="Reset All Data"
          message="Are you absolutely sure you want to delete all your data? This action cannot be undone and will remove all classes, students, quests, and progress."
          confirmText="Yes, Reset Everything"
          cancelText="Cancel"
          type="danger"
          onConfirm={resetAllData}
          onCancel={() => setShowResetDialog(false)}
        />
      </div>
    </Card>
  );
};

// ===============================================
// SUBSCRIPTION MANAGEMENT COMPONENT
// ===============================================

/**
 * Subscription and billing information
 */
export const SubscriptionManagement = ({ userData }) => {
  const currentPlan = userData?.subscription || 'basic';

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      features: [
        'Up to 1 class',
        'Basic student management',
        'Core XP system',
        'Limited quests',
        'Basic avatars and pets'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9.99/month',
      features: [
        'Unlimited classes',
        'Advanced student analytics',
        'Custom quests',
        'Teacher toolkit',
        'Curriculum corner',
        'Priority support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19.99/month',
      features: [
        'Everything in Pro',
        'Advanced reporting',
        'Parent portal access',
        'Custom branding',
        'API access',
        'White-label option'
      ]
    }
  ];

  return (
    <Card title="Subscription Management">
      <div className="space-y-6">
        {/* Current Plan */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Current Plan: {plans.find(p => p.id === currentPlan)?.name || 'Unknown'}
          </h3>
          <p className="text-blue-700">
            {currentPlan === 'basic' 
              ? 'You are currently on the free Basic plan.'
              : `You are subscribed to the ${currentPlan} plan.`}
          </p>
        </div>

        {/* Available Plans */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Available Plans</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`
                  border-2 rounded-lg p-6 transition-all
                  ${plan.id === currentPlan 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'}
                `}
              >
                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold text-gray-800">{plan.name}</h4>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {plan.price}
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.id === currentPlan
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={plan.id === currentPlan}
                >
                  {plan.id === currentPlan ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Information */}
        {currentPlan !== 'basic' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Billing Information</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Next Billing Date:</span>
                  <span className="ml-2">January 15, 2025</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Payment Method:</span>
                  <span className="ml-2">•••• •••• •••• 1234</span>
                </div>
              </div>
              
              <div className="mt-4 space-x-3">
                <Button variant="secondary" size="sm">
                  Update Payment Method
                </Button>
                <Button variant="secondary" size="sm">
                  Download Invoices
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// MAIN SETTINGS TAB COMPONENT
// ===============================================

/**
 * Complete Settings tab using smaller components
 */
export const SettingsTab = ({ userId, userData, onUpdate }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('account');

  const sections = [
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'subscription', name: 'Subscription', icon: '💳' },
    { id: 'data', name: 'Data Management', icon: '💾' },
    { id: 'support', name: 'Support', icon: '❓' }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'account':
        return (
          <AccountSettings 
            user={user}
            userData={userData}
            onUpdate={onUpdate}
          />
        );
      
      case 'subscription':
        return <SubscriptionManagement userData={userData} />;
      
      case 'data':
        return <DataManagement user={user} userData={userData} />;
      
      case 'support':
        return (
          <Card title="Support & Help">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-6xl">❓</div>
                <h3 className="text-xl font-bold text-gray-800">
                  Need Help?
                </h3>
                <p className="text-gray-600">
                  We're here to help you make the most of Classroom Champions!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-2">📚 Documentation</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Complete guides and tutorials for all features
                  </p>
                  <Button size="sm" variant="secondary">
                    View Docs
                  </Button>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-2">💬 Live Chat</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Chat with our support team in real-time
                  </p>
                  <Button size="sm" variant="secondary">
                    Start Chat
                  </Button>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-2">📧 Email Support</h4>
                  <p className="text-sm text-purple-700 mb-3">
                    Send us a detailed message about your issue
                  </p>
                  <Button size="sm" variant="secondary">
                    Send Email
                  </Button>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-2">🎥 Video Tutorials</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Watch step-by-step video guides
                  </p>
                  <Button size="sm" variant="secondary">
                    Watch Videos
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-800">
          Settings & Account ⚙️
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your account, preferences, and subscription
        </p>
      </div>

      {/* Section Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`
              p-4 rounded-lg border-2 transition-all text-center
              ${activeSection === section.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="text-2xl mb-2">{section.icon}</div>
            <div className="font-semibold text-sm">{section.name}</div>
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      {renderActiveSection()}
    </div>
  );
};
export { SettingsTab };
