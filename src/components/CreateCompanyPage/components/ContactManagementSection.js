import React from 'react';
import { deleteContact } from '../utils';

const ContactManagementSection = ({ 
  contacts, 
  setContacts, 
  form, 
  setForm, 
  onAddContact, 
  onEditContact 
}) => {
  const handleDeleteContact = (contactId) => {
    deleteContact(contactId, contacts, setContacts);
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Primary Contact</h3>
        </div>
        <button
          type="button"
          onClick={onAddContact}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Contact
        </button>
      </div>
      
      {/* Contact List */}
      <div className="space-y-2 mb-4">
        {contacts.map(contact => (
          <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{contact.name}</div>
              <div className="text-sm text-gray-600">
                {contact.email} • {contact.phone} {contact.extension && `(Ext: ${contact.extension})`}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => onEditContact(contact)}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDeleteContact(contact.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Selection */}
      <select
        value={form.contact}
        onChange={(e) => setForm(prev => ({ ...prev, contact: e.target.value }))}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        <option value="">Select a contact</option>
        {contacts.map(contact => (
          <option key={contact.id} value={contact.name}>
            {contact.name} ({contact.email})
          </option>
        ))}
      </select>
    </div>
  );
};

export default ContactManagementSection;

