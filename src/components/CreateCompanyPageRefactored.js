import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Import modular components and utilities
import {
  defaultFormState,
  defaultContactFormState,
  initialContacts
} from './CreateCompanyPage/index';
import {
  saveCompany,
  initializeFormForEdit
} from './CreateCompanyPage/index';
import {
  BasicInformationSection,
  LicenseInformationSection,
  ContactManagementSection,
  FileUploadSection
} from './CreateCompanyPage/index';
import {
  ContactModal
} from './CreateCompanyPage/index';

export default function CreateCompanyPageRefactored() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.company;
  
  const [form, setForm] = useState(defaultFormState);
  const [contacts, setContacts] = useState(initialContacts);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState(defaultContactFormState);
  const [editingContactId, setEditingContactId] = useState(null);
  const [fileErrors, setFileErrors] = useState({});

  // Initialize form with company data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setForm(initializeFormForEdit(isEditMode));
    }
  }, [isEditMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveCompany(form, isEditMode, isEditMode?.id);
    navigate('/companies');
  };

  const handleAddContact = () => {
    setContactForm(defaultContactFormState);
    setEditingContactId(null);
    setShowContactModal(true);
  };

  const handleEditContact = (contact) => {
    setContactForm({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || "",
      extension: contact.extension || ""
    });
    setEditingContactId(contact.id);
    setShowContactModal(true);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
    setContactForm(defaultContactFormState);
    setEditingContactId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              to="/companies"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-all duration-200 mr-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Companies
            </Link>
          </div>
          
          {/* Enhanced Title Section */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {isEditMode ? "Edit Company" : "Create New Company"}
                </h1>
                <p className="text-indigo-100 text-lg">
                  {isEditMode ? "Update company information" : "Add a new company to your system"}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">1</div>
                <div className="text-indigo-100 text-sm">Company</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">Complete</div>
                <div className="text-indigo-100 text-sm">Form</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">Secure</div>
                <div className="text-indigo-100 text-sm">Data</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
            <p className="text-gray-600 mt-2">Fill in the details below to create your company profile</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information Section */}
            <BasicInformationSection form={form} setForm={setForm} />

            {/* License Information Section */}
            <LicenseInformationSection form={form} setForm={setForm} />

            {/* Contact Management Section */}
            <ContactManagementSection
              contacts={contacts}
              setContacts={setContacts}
              form={form}
              setForm={setForm}
              onAddContact={handleAddContact}
              onEditContact={handleEditContact}
            />

            {/* File Uploads Section */}
            <FileUploadSection
              form={form}
              setForm={setForm}
              fileErrors={fileErrors}
              setFileErrors={setFileErrors}
            />
          </form>

          {/* Submit Button */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <Link
                to="/companies"
                className="flex items-center gap-2 px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Link>
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {isEditMode ? "Update Company" : "Create Company"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={handleCloseContactModal}
        contactForm={contactForm}
        setContactForm={setContactForm}
        editingContactId={editingContactId}
        contacts={contacts}
        setContacts={setContacts}
      />
    </div>
  );
}
