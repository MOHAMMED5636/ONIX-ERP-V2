import React from "react";
import CustomizationPreferencesSection from "../components/CustomizationPreferencesSection";

export default function Preferences() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customization & Preferences
          </h1>
          <p className="text-gray-600">
            Manage theme, language, and other preferences.
          </p>
        </div>

        <CustomizationPreferencesSection />
      </div>
    </div>
  );
}

