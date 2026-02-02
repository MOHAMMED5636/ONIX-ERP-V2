import React from 'react';
import ProfileForm from '../components/ProfileForm';
import DocumentManagement from '../components/DocumentManagement';
import CustomizationPreferencesSection from '../components/CustomizationPreferencesSection';
import { useAuth } from '../contexts/AuthContext';

function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your profile information and preferences</p>
        </div>

        {/* Profile Settings Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>
          <p className="text-sm text-gray-600 mb-6">
            Update your profile photo and job title. These will be visible to other team members.
          </p>
          <ProfileForm />
        </div>

        {/* Customization & Preferences (Admin Profile) - all users see; only Admin can edit */}
        <CustomizationPreferencesSection />

        {/* Admin Documents Section */}
        {isAdmin && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <DocumentManagement />
          </div>
        )}

        {/* Additional Settings Sections (Optional) */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Change Password
              </label>
              <p className="text-sm text-gray-600 mb-3">
                To change your password, please use the password change feature available after login.
              </p>
              <a
                href="/change-password"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Change Password
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

