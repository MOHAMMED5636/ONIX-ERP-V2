import React, { useState } from "react";
import { UserIcon, BriefcaseIcon, CalendarIcon, EnvelopeIcon, PhoneIcon, UsersIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const leadSources = ["Company Website", "Social Media", "Referral", "Friends"];
const ranks = ["Gold", "Diamond", "Silver", "VIP"];
// Nationality options for dropdown
const nationalities = [
  "Afghan", "Albanian", "Algerian", "American", "Argentine", "Armenian", "Australian", "Austrian", "Azerbaijani",
  "Bahraini", "Bangladeshi", "Belgian", "Brazilian", "British", "Bulgarian", "Burmese", "Cambodian", "Canadian",
  "Chilean", "Chinese", "Colombian", "Croatian", "Cypriot", "Czech", "Danish", "Dutch", "Egyptian", "Estonian",
  "Ethiopian", "Filipino", "Finnish", "French", "Georgian", "German", "Ghanaian", "Greek", "Hungarian", "Icelandic",
  "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Japanese", "Jordanian", "Kazakhstani",
  "Kenyan", "Korean", "Kuwaiti", "Latvian", "Lebanese", "Libyan", "Lithuanian", "Luxembourgish", "Malaysian",
  "Maltese", "Mexican", "Moroccan", "Nepalese", "New Zealander", "Nigerian", "Norwegian", "Omani", "Pakistani",
  "Palestinian", "Peruvian", "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Saudi Arabian", "Singaporean",
  "Slovak", "Slovenian", "South African", "Spanish", "Sri Lankan", "Sudanese", "Swedish", "Swiss", "Syrian",
  "Thai", "Tunisian", "Turkish", "Ukrainian", "Emirati", "Uruguayan", "Venezuelan", "Vietnamese", "Yemeni", "Zimbabwean"
];

export default function CreateClient() {
  const navigate = useNavigate();
  // Top section state
  const [refNumber, setRefNumber] = useState("0-CL-(Year)(SR)");
  const [status, setStatus] = useState("");
  const [isCorporate, setIsCorporate] = useState(false);
  const [trnNumber, setTrnNumber] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [rank, setRank] = useState("");

  // Collapsible sections
  const [openSection, setOpenSection] = useState("clientInfo");

  // Corporation Info
  const [corporationInfo, setCorporationInfo] = useState({
    corporationName: "",
    registrationNumber: "",
    incorporationDate: "",
  });
  const [ownerInfo, setOwnerInfo] = useState({
    ownerName: "",
    ownerNationality: "",
    ownerId: "",
  });

  // Client Info
  const [clientInfo, setClientInfo] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    idNumber: "",
    idEndDate: "",
    idEndDateReminder: false,
    nationality: "",
    passportNumber: "",
    address: "",
    gender: "",
    birthDate: "",
  });

  // Contacts
  const [contacts, setContacts] = useState([{ type: "phone", value: "" }]);
  const [emails, setEmails] = useState([""]);

  // User Account Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [userAccountFields, setUserAccountFields] = useState({ username: '', password: '', passwordConfirm: '' });
  const [userAccountCreated, setUserAccountCreated] = useState(false);

  // Documents
  const [documents, setDocuments] = useState([]);

  // Validation
  const [errors, setErrors] = useState({});

  // Handlers
  const handleClientInfoChange = (field, value) => setClientInfo({ ...clientInfo, [field]: value });
  const handleContactChange = (idx, value) => {
    const arr = [...contacts];
    arr[idx].value = value;
    setContacts(arr);
  };
  const handleAddContact = () => setContacts([...contacts, { type: "phone", value: "" }]);
  const handleRemoveContact = (idx) => setContacts(contacts.filter((_, i) => i !== idx));
  const handleEmailChange = (idx, value) => {
    const arr = [...emails];
    arr[idx] = value;
    setEmails(arr);
  };
  const handleAddEmail = () => setEmails([...emails, ""]);
  const handleRemoveEmail = (idx) => setEmails(emails.filter((_, i) => i !== idx));
  const handleFileChange = (e) => setDocuments(Array.from(e.target.files));
  const handleCorporationInfoChange = (field, value) => setCorporationInfo({ ...corporationInfo, [field]: value });
  const handleOwnerInfoChange = (field, value) => setOwnerInfo({ ...ownerInfo, [field]: value });

  // User Account Modal logic
  const handleUserAccountSave = () => {
    if (userAccountFields.username && userAccountFields.password && userAccountFields.passwordConfirm) {
      setUserAccountCreated(true);
      setShowUserModal(false);
    }
  };

  // Validation
  const validate = () => {
    let errs = {};
    if (!refNumber) errs.refNumber = "Required";
    if (!status) errs.status = "Required";
    if (!trnNumber) errs.trnNumber = "Required";
    if (!leadSource) errs.leadSource = "Required";
    if (!rank) errs.rank = "Required";
    // Corporation Info required if isCorporate
    if (isCorporate) {
      if (!corporationInfo.corporationName) errs.corporationName = "Required";
      if (!corporationInfo.registrationNumber) errs.registrationNumber = "Required";
      if (!corporationInfo.incorporationDate) errs.incorporationDate = "Required";
      if (!ownerInfo.ownerName) errs.ownerName = "Required";
      if (!ownerInfo.ownerNationality) errs.ownerNationality = "Required";
      if (!ownerInfo.ownerId) errs.ownerId = "Required";
    }
    // Client Info
    if (!clientInfo.firstName) errs.firstName = "Required";
    if (!clientInfo.lastName) errs.lastName = "Required";
    if (!clientInfo.idNumber) errs.idNumber = "Required";
    if (!clientInfo.nationality) errs.nationality = "Required";
    if (!clientInfo.gender) errs.gender = "Required";
    if (!clientInfo.birthDate) errs.birthDate = "Required";
    // At least one contact
    if (!contacts[0].value) errs.contacts = "At least one phone required";
    if (!emails[0]) errs.emails = "At least one email required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert("Client created!");
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <form onSubmit={handleSubmit} className="w-full bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-10 border border-indigo-100 mx-0">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-lg px-4 sm:px-6 py-3 sm:py-4 border-l-4 border-blue-500 shadow-sm">
          <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Clients</h2>
        </div>
        
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number <span className="text-red-500">*</span></label>
            <input type="text" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={refNumber} onChange={e => setRefNumber(e.target.value)} />
            {errors.refNumber && <div className="text-red-500 text-xs">{errors.refNumber}</div>}
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
            <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Select status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && <div className="text-red-500 text-xs">{errors.status}</div>}
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source <span className="text-red-500">*</span></label>
            <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={leadSource} onChange={e => setLeadSource(e.target.value)}>
              <option value="">Select lead source</option>
              {leadSources.map(src => <option key={src} value={src}>{src}</option>)}
            </select>
            {errors.leadSource && <div className="text-red-500 text-xs">{errors.leadSource}</div>}
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rank <span className="text-red-500">*</span></label>
            <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={rank} onChange={e => setRank(e.target.value)}>
              <option value="">Select rank</option>
              {ranks.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.rank && <div className="text-red-500 text-xs">{errors.rank}</div>}
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">TRN Number <span className="text-red-500">*</span></label>
            <input type="text" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={trnNumber} onChange={e => setTrnNumber(e.target.value)} />
            {errors.trnNumber && <div className="text-red-500 text-xs">{errors.trnNumber}</div>}
          </div>
          <div className="w-full flex items-center gap-2 mt-6">
            <input type="checkbox" id="isCorporate" checked={isCorporate} onChange={e => setIsCorporate(e.target.checked)} />
            <label htmlFor="isCorporate" className="block text-sm font-medium text-gray-700 mb-1">Is Corporate</label>
          </div>
        </div>
        
        {/* Collapsible Sections */}
        <div className="space-y-4 mb-6">
          {/* Corporation Info (if corporate) */}
          {isCorporate && (
            <div className="border rounded-lg overflow-hidden">
              <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-indigo-50 transition font-semibold text-left" onClick={() => setOpenSection(openSection === 'corporationInfo' ? '' : 'corporationInfo')}>
                <span className="flex items-center gap-2"><BriefcaseIcon className="h-5 w-5 text-indigo-400" /> Corporation Info</span>
                <span>{openSection === 'corporationInfo' ? '-' : '+'}</span>
              </button>
              {openSection === 'corporationInfo' && (
                <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Corporation Name <span className="text-red-500">*</span></label>
                    <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Corporation Name" value={corporationInfo.corporationName} onChange={e => handleCorporationInfoChange('corporationName', e.target.value)} />
                    {errors.corporationName && <div className="text-red-500 text-xs">{errors.corporationName}</div>}
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number <span className="text-red-500">*</span></label>
                    <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Registration Number" value={corporationInfo.registrationNumber} onChange={e => handleCorporationInfoChange('registrationNumber', e.target.value)} />
                    {errors.registrationNumber && <div className="text-red-500 text-xs">{errors.registrationNumber}</div>}
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Incorporation Date <span className="text-red-500">*</span></label>
                    <input type="date" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={corporationInfo.incorporationDate} onChange={e => handleCorporationInfoChange('incorporationDate', e.target.value)} />
                    {errors.incorporationDate && <div className="text-red-500 text-xs">{errors.incorporationDate}</div>}
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name <span className="text-red-500">*</span></label>
                    <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Owner Name" value={ownerInfo.ownerName} onChange={e => handleOwnerInfoChange('ownerName', e.target.value)} />
                    {errors.ownerName && <div className="text-red-500 text-xs">{errors.ownerName}</div>}
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Nationality <span className="text-red-500">*</span></label>
                    <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Owner Nationality" value={ownerInfo.ownerNationality} onChange={e => handleOwnerInfoChange('ownerNationality', e.target.value)} />
                    {errors.ownerNationality && <div className="text-red-500 text-xs">{errors.ownerNationality}</div>}
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner ID <span className="text-red-500">*</span></label>
                    <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Owner ID" value={ownerInfo.ownerId} onChange={e => handleOwnerInfoChange('ownerId', e.target.value)} />
                    {errors.ownerId && <div className="text-red-500 text-xs">{errors.ownerId}</div>}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Client Info */}
          <div className="border rounded-lg overflow-hidden">
            <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-indigo-50 transition font-semibold text-left" onClick={() => setOpenSection(openSection === 'clientInfo' ? '' : 'clientInfo')}>
              <span className="flex items-center gap-2"><UserIcon className="h-5 w-5 text-indigo-400" /> Client Info</span>
              <span>{openSection === 'clientInfo' ? '-' : '+'}</span>
            </button>
            {openSection === 'clientInfo' && (
              <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="First Name" value={clientInfo.firstName} onChange={e => handleClientInfoChange('firstName', e.target.value)} />
                  {errors.firstName && <div className="text-red-500 text-xs">{errors.firstName}</div>}
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Middle Name" value={clientInfo.middleName} onChange={e => handleClientInfoChange('middleName', e.target.value)} />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Last Name" value={clientInfo.lastName} onChange={e => handleClientInfoChange('lastName', e.target.value)} />
                  {errors.lastName && <div className="text-red-500 text-xs">{errors.lastName}</div>}
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number <span className="text-red-500">*</span></label>
                  <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="ID Number" value={clientInfo.idNumber} onChange={e => handleClientInfoChange('idNumber', e.target.value)} />
                  {errors.idNumber && <div className="text-red-500 text-xs">{errors.idNumber}</div>}
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Expiry Date</label>
                  <input type="date" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={clientInfo.idEndDate} onChange={e => handleClientInfoChange('idEndDate', e.target.value)} />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality <span className="text-red-500">*</span></label>
                  <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={clientInfo.nationality} onChange={e => handleClientInfoChange('nationality', e.target.value)}>
                    <option value="">Select nationality</option>
                    {nationalities.map(nationality => (
                      <option key={nationality} value={nationality}>{nationality}</option>
                    ))}
                  </select>
                  {errors.nationality && <div className="text-red-500 text-xs">{errors.nationality}</div>}
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                  <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Passport Number" value={clientInfo.passportNumber} onChange={e => handleClientInfoChange('passportNumber', e.target.value)} />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea className="w-full px-4 py-2 text-sm border rounded-md" rows="3" placeholder="Address" value={clientInfo.address} onChange={e => handleClientInfoChange('address', e.target.value)} />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                  <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={clientInfo.gender} onChange={e => handleClientInfoChange('gender', e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.gender && <div className="text-red-500 text-xs">{errors.gender}</div>}
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date <span className="text-red-500">*</span></label>
                  <input type="date" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={clientInfo.birthDate} onChange={e => handleClientInfoChange('birthDate', e.target.value)} />
                  {errors.birthDate && <div className="text-red-500 text-xs">{errors.birthDate}</div>}
                </div>
              </div>
            )}
          </div>
          
          {/* Contacts */}
          <div className="border rounded-lg overflow-hidden">
            <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-indigo-50 transition font-semibold text-left" onClick={() => setOpenSection(openSection === 'contacts' ? '' : 'contacts')}>
              <span className="flex items-center gap-2"><PhoneIcon className="h-5 w-5 text-indigo-400" /> Contacts</span>
              <span>{openSection === 'contacts' ? '-' : '+'}</span>
            </button>
            {openSection === 'contacts' && (
              <div className="p-4 bg-white space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Numbers <span className="text-red-500">*</span></label>
                  {contacts.map((contact, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <select className="h-[42px] px-3 py-2 text-sm border rounded-md" value={contact.type} onChange={e => {
                        const arr = [...contacts];
                        arr[idx].type = e.target.value;
                        setContacts(arr);
                      }}>
                        <option value="phone">Phone</option>
                        <option value="mobile">Mobile</option>
                        <option value="fax">Fax</option>
                      </select>
                      <input className="flex-1 h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Phone number" value={contact.value} onChange={e => handleContactChange(idx, e.target.value)} />
                      {contacts.length > 1 && (
                        <button type="button" className="h-[42px] px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600" onClick={() => handleRemoveContact(idx)}>Remove</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="text-sm text-indigo-600 hover:text-indigo-800" onClick={handleAddContact}>+ Add Phone</button>
                  {errors.contacts && <div className="text-red-500 text-xs">{errors.contacts}</div>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Addresses <span className="text-red-500">*</span></label>
                  {emails.map((email, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input className="flex-1 h-[42px] px-4 py-2 text-sm border rounded-md" type="email" placeholder="Email address" value={email} onChange={e => handleEmailChange(idx, e.target.value)} />
                      {emails.length > 1 && (
                        <button type="button" className="h-[42px] px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600" onClick={() => handleRemoveEmail(idx)}>Remove</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="text-sm text-indigo-600 hover:text-indigo-800" onClick={handleAddEmail}>+ Add Email</button>
                  {errors.emails && <div className="text-red-500 text-xs">{errors.emails}</div>}
                </div>
              </div>
            )}
          </div>
          
          {/* User Account */}
          <div className="border rounded-lg overflow-hidden">
            <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-indigo-50 transition font-semibold text-left" onClick={() => setOpenSection(openSection === 'userAccount' ? '' : 'userAccount')}>
              <span className="flex items-center gap-2"><UserIcon className="h-5 w-5 text-indigo-400" /> User Account</span>
              <span>{openSection === 'userAccount' ? '-' : '+'}</span>
            </button>
            {openSection === 'userAccount' && (
              <div className="p-4 bg-white mb-6">
                {!userAccountCreated ? (
                  <button type="button" className="btn btn-primary" onClick={() => setShowUserModal(true)}>
                    Create User Account
                  </button>
                ) : (
                  <div className="text-green-600 font-medium">✓ User account created successfully</div>
                )}
              </div>
            )}
          </div>
          
          {/* Documents */}
          <div className="border rounded-lg overflow-hidden">
            <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-indigo-50 transition font-semibold text-left" onClick={() => setOpenSection(openSection === 'documents' ? '' : 'documents')}>
              <span className="flex items-center gap-2"><DocumentTextIcon className="h-5 w-5 text-indigo-400" /> Documents</span>
              <span>{openSection === 'documents' ? '-' : '+'}</span>
            </button>
            {openSection === 'documents' && (
              <div className="p-4 bg-white mb-6">
                <input type="file" multiple className="w-full" onChange={handleFileChange} />
                {documents.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Selected files:</h4>
                    <ul className="space-y-1">
                      {documents.map((file, idx) => (
                        <li key={idx} className="text-sm text-gray-600">{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button type="button" className="btn flex items-center justify-center gap-2 order-2 sm:order-1" onClick={() => navigate('/clients')}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to List
          </button>
          <button type="submit" className="btn btn-primary flex items-center justify-center gap-2 order-1 sm:order-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Create Client
          </button>
        </div>
      </form>
      
      {/* User Account Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in">
            <h3 className="text-lg font-bold mb-4">Create User Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">User Name <span className="text-red-500">*</span></label>
                <input className="input" placeholder="Enter user name" value={userAccountFields.username} onChange={e => setUserAccountFields(f => ({ ...f, username: e.target.value }))} />
                {userAccountFields.username === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
              <div>
                <label className="block font-medium mb-1">Password <span className="text-red-500">*</span></label>
                <input type="password" className="input" placeholder="Enter password" value={userAccountFields.password} onChange={e => setUserAccountFields(f => ({ ...f, password: e.target.value }))} />
                {userAccountFields.password === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
              <div>
                <label className="block font-medium mb-1">Password Confirm <span className="text-red-500">*</span></label>
                <input type="password" className="input" placeholder="Confirm password" value={userAccountFields.passwordConfirm} onChange={e => setUserAccountFields(f => ({ ...f, passwordConfirm: e.target.value }))} />
                {userAccountFields.passwordConfirm === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" className="btn" onClick={() => setShowUserModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleUserAccountSave}>Save</button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .input { @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200; }
        .btn { @apply px-4 py-2 rounded font-semibold transition bg-white border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm; }
        .btn-primary { @apply bg-indigo-600 text-white hover:bg-indigo-700 border-0; }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
} 