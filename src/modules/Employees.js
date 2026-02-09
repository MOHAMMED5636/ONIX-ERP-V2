import React, { useState, createContext, useContext, useEffect } from "react";
import { UserIcon, EnvelopeIcon, PhoneIcon, BriefcaseIcon, MapPinIcon, IdentificationIcon, DocumentPlusIcon, CheckCircleIcon, CalendarIcon, AcademicCapIcon, UsersIcon, ClipboardDocumentListIcon, ArrowLeftIcon, CheckIcon, Cog6ToothIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ClockIcon, XMarkIcon, CurrencyDollarIcon, DocumentTextIcon, BanknotesIcon, CalculatorIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompanySelection } from '../context/CompanySelectionContext';
import { getEmployees, getEmployeeStatistics, createEmployee, updateEmployee, deleteEmployee, restoreEmployee } from '../services/employeeAPI';
import { getCompanies } from '../services/companiesAPI';
import { getCompanyDepartments } from '../services/departmentAPI';

// Custom styles for PhoneInput integration
const phoneInputStyles = `
  .react-tel-input .form-control {
    width: 100% !important;
    height: 42px !important;
    border: 1px solid #d1d5db !important;
    border-radius: 0.375rem !important;
    padding-left: 50px !important;
    font-size: 0.875rem !important;
    background-color: white !important;
  }
  .react-tel-input .form-control:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 1px #3b82f6 !important;
    outline: none !important;
  }
  .react-tel-input .flag-dropdown {
    border: 1px solid #d1d5db !important;
    border-right: none !important;
    border-radius: 0.375rem 0 0 0.375rem !important;
    background-color: white !important;
  }
  .react-tel-input .flag-dropdown.open {
    border-color: #3b82f6 !important;
  }
  .react-tel-input .selected-flag {
    height: 42px !important;
    padding: 0 8px 0 12px !important;
    border-radius: 0.375rem 0 0 0.375rem !important;
  }
  .react-tel-input .country-list {
    border: 1px solid #d1d5db !important;
    border-radius: 0.375rem !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    max-height: 200px !important;
  }
  .react-tel-input .country-list .country {
    padding: 8px 12px !important;
    font-size: 0.875rem !important;
  }
  .react-tel-input .country-list .country:hover {
    background-color: #f3f4f6 !important;
  }
  .react-tel-input .country-list .country.highlight {
    background-color: #3b82f6 !important;
    color: white !important;
  }
`;

// Comprehensive nationality/country list with flags using Unicode
const nationalities = [
  { value: "afghan", label: "Afghan", flag: "\u{1F1E6}\u{1F1EB}" },
  { value: "albanian", label: "Albanian", flag: "\u{1F1E6}\u{1F1F1}" },
  { value: "algerian", label: "Algerian", flag: "\u{1F1E9}\u{1F1FF}" },
  { value: "american", label: "American", flag: "\u{1F1FA}\u{1F1F8}" },
  { value: "andorran", label: "Andorran", flag: "\u{1F1E6}\u{1F1E9}" },
  { value: "angolan", label: "Angolan", flag: "\u{1F1E6}\u{1F1F4}" },
  { value: "antiguans", label: "Antiguans", flag: "\u{1F1E6}\u{1F1EC}" },
  { value: "argentinean", label: "Argentinean", flag: "\u{1F1E6}\u{1F1F7}" },
  { value: "armenian", label: "Armenian", flag: "\u{1F1E6}\u{1F1F2}" },
  { value: "australian", label: "Australian", flag: "\u{1F1E6}\u{1F1FA}" },
  { value: "austrian", label: "Austrian", flag: "\u{1F1E6}\u{1F1F9}" },
  { value: "azerbaijani", label: "Azerbaijani", flag: "\u{1F1E6}\u{1F1FF}" },
  { value: "bahamian", label: "Bahamian", flag: "\u{1F1E7}\u{1F1F8}" },
  { value: "bahraini", label: "Bahraini", flag: "\u{1F1E7}\u{1F1ED}" },
  { value: "bangladeshi", label: "Bangladeshi", flag: "\u{1F1E7}\u{1F1E9}" },
  { value: "barbadian", label: "Barbadian", flag: "\u{1F1E7}\u{1F1E7}" },
  { value: "barbudans", label: "Barbudans", flag: "\u{1F1E6}\u{1F1EC}" },
  { value: "batswana", label: "Batswana", flag: "\u{1F1E7}\u{1F1FC}" },
  { value: "belarusian", label: "Belarusian", flag: "🇧🇾" },
  { value: "belgian", label: "Belgian", flag: "🇧🇪" },
  { value: "belizean", label: "Belizean", flag: "🇧🇿" },
  { value: "beninese", label: "Beninese", flag: "🇧🇯" },
  { value: "bhutanese", label: "Bhutanese", flag: "🇧🇹" },
  { value: "bolivian", label: "Bolivian", flag: "🇧🇴" },
  { value: "bosnian", label: "Bosnian", flag: "🇧🇦" },
  { value: "brazilian", label: "Brazilian", flag: "🇧🇷" },
  { value: "british", label: "British", flag: "🇬🇧" },
  { value: "bruneian", label: "Bruneian", flag: "🇧🇳" },
  { value: "bulgarian", label: "Bulgarian", flag: "🇧🇬" },
  { value: "burkinabe", label: "Burkinabe", flag: "🇧🇫" },
  { value: "burmese", label: "Burmese", flag: "🇲🇲" },
  { value: "burundian", label: "Burundian", flag: "🇧🇮" },
  { value: "cambodian", label: "Cambodian", flag: "🇰🇭" },
  { value: "cameroonian", label: "Cameroonian", flag: "🇨🇲" },
  { value: "canadian", label: "Canadian", flag: "🇨🇦" },
  { value: "cape verdean", label: "Cape Verdean", flag: "🇨🇻" },
  { value: "central african", label: "Central African", flag: "🇨🇫" },
  { value: "chadian", label: "Chadian", flag: "🇹🇩" },
  { value: "chilean", label: "Chilean", flag: "🇨🇱" },
  { value: "chinese", label: "Chinese", flag: "🇨🇳" },
  { value: "colombian", label: "Colombian", flag: "🇨🇴" },
  { value: "comoran", label: "Comoran", flag: "🇰🇲" },
  { value: "congolese", label: "Congolese", flag: "🇨🇬" },
  { value: "costa rican", label: "Costa Rican", flag: "🇨🇷" },
  { value: "croatian", label: "Croatian", flag: "🇭🇷" },
  { value: "cuban", label: "Cuban", flag: "🇨🇺" },
  { value: "cypriot", label: "Cypriot", flag: "🇨🇾" },
  { value: "czech", label: "Czech", flag: "🇨🇿" },
  { value: "danish", label: "Danish", flag: "🇩🇰" },
  { value: "djibouti", label: "Djibouti", flag: "🇩🇯" },
  { value: "dominican", label: "Dominican", flag: "🇩🇴" },
  { value: "dutch", label: "Dutch", flag: "🇳🇱" },
  { value: "east timorese", label: "East Timorese", flag: "🇹🇱" },
  { value: "ecuadorean", label: "Ecuadorean", flag: "🇪🇨" },
  { value: "egyptian", label: "Egyptian", flag: "🇪🇬" },
  { value: "emirian", label: "Emirian", flag: "🇦🇪" },
  { value: "equatorial guinean", label: "Equatorial Guinean", flag: "🇬🇶" },
  { value: "eritrean", label: "Eritrean", flag: "🇪🇷" },
  { value: "estonian", label: "Estonian", flag: "🇪🇪" },
  { value: "ethiopian", label: "Ethiopian", flag: "🇪🇹" },
  { value: "fijian", label: "Fijian", flag: "🇫🇯" },
  { value: "filipino", label: "Filipino", flag: "🇵🇭" },
  { value: "finnish", label: "Finnish", flag: "🇫🇮" },
  { value: "french", label: "French", flag: "🇫🇷" },
  { value: "gabonese", label: "Gabonese", flag: "🇬🇦" },
  { value: "gambian", label: "Gambian", flag: "🇬🇲" },
  { value: "georgian", label: "Georgian", flag: "🇬🇪" },
  { value: "german", label: "German", flag: "🇩🇪" },
  { value: "ghanaian", label: "Ghanaian", flag: "🇬🇭" },
  { value: "greek", label: "Greek", flag: "🇬🇷" },
  { value: "grenadian", label: "Grenadian", flag: "🇬🇩" },
  { value: "guatemalan", label: "Guatemalan", flag: "🇬🇹" },
  { value: "guinea-bissauan", label: "Guinea-Bissauan", flag: "🇬🇼" },
  { value: "guinean", label: "Guinean", flag: "🇬🇳" },
  { value: "guyanese", label: "Guyanese", flag: "🇬🇾" },
  { value: "haitian", label: "Haitian", flag: "🇭🇹" },
  { value: "herzegovinian", label: "Herzegovinian", flag: "🇧🇦" },
  { value: "honduran", label: "Honduran", flag: "🇭🇳" },
  { value: "hungarian", label: "Hungarian", flag: "🇭🇺" },
  { value: "icelander", label: "Icelander", flag: "🇮🇸" },
  { value: "indian", label: "Indian", flag: "🇮🇳" },
  { value: "indonesian", label: "Indonesian", flag: "🇮🇩" },
  { value: "iranian", label: "Iranian", flag: "🇮🇷" },
  { value: "iraqi", label: "Iraqi", flag: "🇮🇶" },
  { value: "irish", label: "Irish", flag: "🇮🇪" },
  { value: "israeli", label: "Israeli", flag: "🇮🇱" },
  { value: "italian", label: "Italian", flag: "🇮🇹" },
  { value: "ivorian", label: "Ivorian", flag: "🇨🇮" },
  { value: "jamaican", label: "Jamaican", flag: "🇯🇲" },
  { value: "japanese", label: "Japanese", flag: "🇯🇵" },
  { value: "jordanian", label: "Jordanian", flag: "🇯🇴" },
  { value: "kazakhstani", label: "Kazakhstani", flag: "🇰🇿" },
  { value: "kenyan", label: "Kenyan", flag: "🇰🇪" },
  { value: "kittian and nevisian", label: "Kittian and Nevisian", flag: "🇰🇳" },
  { value: "kuwaiti", label: "Kuwaiti", flag: "🇰🇼" },
  { value: "kyrgyz", label: "Kyrgyz", flag: "🇰🇬" },
  { value: "laotian", label: "Laotian", flag: "🇱🇦" },
  { value: "latvian", label: "Latvian", flag: "🇱🇻" },
  { value: "lebanese", label: "Lebanese", flag: "🇱🇧" },
  { value: "liberian", label: "Liberian", flag: "🇱🇷" },
  { value: "libyan", label: "Libyan", flag: "🇱🇾" },
  { value: "liechtensteiner", label: "Liechtensteiner", flag: "🇱🇮" },
  { value: "lithuanian", label: "Lithuanian", flag: "🇱🇹" },
  { value: "luxembourger", label: "Luxembourger", flag: "🇱🇺" },
  { value: "macedonian", label: "Macedonian", flag: "🇲🇰" },
  { value: "malagasy", label: "Malagasy", flag: "🇲🇬" },
  { value: "malawian", label: "Malawian", flag: "🇲🇼" },
  { value: "malaysian", label: "Malaysian", flag: "🇲🇾" },
  { value: "maldivan", label: "Maldivan", flag: "🇲🇻" },
  { value: "malian", label: "Malian", flag: "🇲🇱" },
  { value: "maltese", label: "Maltese", flag: "🇲🇹" },
  { value: "marshallese", label: "Marshallese", flag: "🇲🇭" },
  { value: "mauritanian", label: "Mauritanian", flag: "🇲🇷" },
  { value: "mauritian", label: "Mauritian", flag: "🇲🇺" },
  { value: "mexican", label: "Mexican", flag: "🇲🇽" },
  { value: "micronesian", label: "Micronesian", flag: "🇫🇲" },
  { value: "moldovan", label: "Moldovan", flag: "🇲🇩" },
  { value: "monacan", label: "Monacan", flag: "🇲🇨" },
  { value: "mongolian", label: "Mongolian", flag: "🇲🇳" },
  { value: "moroccan", label: "Moroccan", flag: "🇲🇦" },
  { value: "mosotho", label: "Mosotho", flag: "🇱🇸" },
  { value: "motswana", label: "Motswana", flag: "🇧🇼" },
  { value: "mozambican", label: "Mozambican", flag: "🇲🇿" },
  { value: "namibian", label: "Namibian", flag: "🇳🇦" },
  { value: "nauruan", label: "Nauruan", flag: "🇳🇷" },
  { value: "nepalese", label: "Nepalese", flag: "🇳🇵" },
  { value: "new zealander", label: "New Zealander", flag: "🇳🇿" },
  { value: "ni-vanuatu", label: "Ni-Vanuatu", flag: "🇻🇺" },
  { value: "nicaraguan", label: "Nicaraguan", flag: "🇳🇮" },
  { value: "nigerian", label: "Nigerian", flag: "🇳🇬" },
  { value: "nigerien", label: "Nigerien", flag: "🇳🇪" },
  { value: "north korean", label: "North Korean", flag: "🇰🇵" },
  { value: "northern irish", label: "Northern Irish", flag: "🇬🇧" },
  { value: "norwegian", label: "Norwegian", flag: "🇳🇴" },
  { value: "omani", label: "Omani", flag: "🇴🇲" },
  { value: "pakistani", label: "Pakistani", flag: "🇵🇰" },
  { value: "palauan", label: "Palauan", flag: "🇵🇼" },
  { value: "panamanian", label: "Panamanian", flag: "🇵🇦" },
  { value: "papua new guinean", label: "Papua New Guinean", flag: "🇵🇬" },
  { value: "paraguayan", label: "Paraguayan", flag: "🇵🇾" },
  { value: "peruvian", label: "Peruvian", flag: "🇵🇪" },
  { value: "polish", label: "Polish", flag: "🇵🇱" },
  { value: "portuguese", label: "Portuguese", flag: "🇵🇹" },
  { value: "qatari", label: "Qatari", flag: "🇶🇦" },
  { value: "romanian", label: "Romanian", flag: "🇷🇴" },
  { value: "russian", label: "Russian", flag: "🇷🇺" },
  { value: "rwandan", label: "Rwandan", flag: "🇷🇼" },
  { value: "saint lucian", label: "Saint Lucian", flag: "🇱🇨" },
  { value: "salvadoran", label: "Salvadoran", flag: "🇸🇻" },
  { value: "samoan", label: "Samoan", flag: "🇼🇸" },
  { value: "san marinese", label: "San Marinese", flag: "🇸🇲" },
  { value: "sao tomean", label: "Sao Tomean", flag: "🇸🇹" },
  { value: "saudi", label: "Saudi", flag: "🇸🇦" },
  { value: "scottish", label: "Scottish", flag: "🇬🇧" },
  { value: "senegalese", label: "Senegalese", flag: "🇸🇳" },
  { value: "serbian", label: "Serbian", flag: "🇷🇸" },
  { value: "seychellois", label: "Seychellois", flag: "🇸🇨" },
  { value: "sierra leonean", label: "Sierra Leonean", flag: "🇸🇱" },
  { value: "singaporean", label: "Singaporean", flag: "🇸🇬" },
  { value: "slovakian", label: "Slovakian", flag: "🇸🇰" },
  { value: "slovenian", label: "Slovenian", flag: "🇸🇮" },
  { value: "solomon islander", label: "Solomon Islander", flag: "🇸🇧" },
  { value: "somali", label: "Somali", flag: "🇸🇴" },
  { value: "south african", label: "South African", flag: "🇿🇦" },
  { value: "south korean", label: "South Korean", flag: "🇰🇷" },
  { value: "spanish", label: "Spanish", flag: "🇪🇸" },
  { value: "sri lankan", label: "Sri Lankan", flag: "🇱🇰" },
  { value: "sudanese", label: "Sudanese", flag: "🇸🇩" },
  { value: "surinamer", label: "Surinamer", flag: "🇸🇷" },
  { value: "swazi", label: "Swazi", flag: "🇸🇿" },
  { value: "swedish", label: "Swedish", flag: "🇸🇪" },
  { value: "swiss", label: "Swiss", flag: "🇨🇭" },
  { value: "syrian", label: "Syrian", flag: "🇸🇾" },
  { value: "taiwanese", label: "Taiwanese", flag: "🇹🇼" },
  { value: "tajik", label: "Tajik", flag: "🇹🇯" },
  { value: "tanzanian", label: "Tanzanian", flag: "🇹🇿" },
  { value: "thai", label: "Thai", flag: "🇹🇭" },
  { value: "togolese", label: "Togolese", flag: "🇹🇬" },
  { value: "tongan", label: "Tongan", flag: "🇹🇴" },
  { value: "trinidadian or tobagonian", label: "Trinidadian or Tobagonian", flag: "🇹🇹" },
  { value: "tunisian", label: "Tunisian", flag: "🇹🇳" },
  { value: "turkish", label: "Turkish", flag: "🇹🇷" },
  { value: "tuvaluan", label: "Tuvaluan", flag: "🇹🇻" },
  { value: "ugandan", label: "Ugandan", flag: "🇺🇬" },
  { value: "ukrainian", label: "Ukrainian", flag: "🇺🇦" },
  { value: "uruguayan", label: "Uruguayan", flag: "🇺🇾" },
  { value: "uzbekistani", label: "Uzbekistani", flag: "🇺🇿" },
  { value: "venezuelan", label: "Venezuelan", flag: "🇻🇪" },
  { value: "vietnamese", label: "Vietnamese", flag: "🇻🇳" },
  { value: "welsh", label: "Welsh", flag: "🇬🇧" },
  { value: "yemenite", label: "Yemenite", flag: "🇾🇪" },
  { value: "zambian", label: "Zambian", flag: "🇿🇲" },
  { value: "zimbabwean", label: "Zimbabwean", flag: "🇿🇼" }
];

// Demo employee data removed - now using real backend data

// Form context for multi-step form state
const EmployeeFormContext = createContext();
function useEmployeeForm() { return useContext(EmployeeFormContext); }

const steps = [
  { label: "Personal Info", icon: UserIcon },
  { label: "Personal Details", icon: UserIcon },
  { label: "Contact Info", icon: PhoneIcon },
  { label: "Company Info", icon: BriefcaseIcon },
  { label: "Legal Info", icon: IdentificationIcon },
  { label: "Review & Submit", icon: CheckCircleIcon },
];

function EmployeeForm({ onBack, onSaveEmployee, jobTitles, attendancePrograms, employeesList }) {
  const [step, setStep] = useState(0);
  const location = useLocation();
  const { selectedCompany } = useCompanySelection();
  
  // Only use department from navigation state (when coming from positions/subdepartments), not from localStorage/context
  const navigationState = location.state || {};
  // Only prefill department if explicitly coming from a position/subdepartment navigation
  const hasExplicitNavigation = navigationState.position || navigationState.subDepartment || navigationState.positionId;
  
  // Extract department name - handle both string and object formats
  let departmentFromNavigation = null;
  if (hasExplicitNavigation) {
    const dept = navigationState.department || navigationState.departmentName;
    if (dept) {
      // If it's an object, extract the name property; otherwise use it as-is
      departmentFromNavigation = typeof dept === 'object' && dept !== null ? (dept.name || dept.title || String(dept)) : dept;
    }
  }
  
  // Static company locations
  const companyLocations = [
    "Dubai HQ",
    "Abu Dhabi Office",
    "Syria Office"
  ];
  
  const [form, setForm] = useState({
    employeeType: "",
    firstName: "",
    lastName: "",
    employeeId: "",
    status: "",
    userAccount: false,
    role: 'EMPLOYEE',
    personalImage: null,
    gender: "",
    maritalStatus: "",
    nationality: "",
    currentAddress: "",
    childrenCount: "",
    birthday: "",
    contacts: [{ type: "phone", value: "", countryCode: "ae" }],
    emails: [""],
    department: (typeof departmentFromNavigation === 'string' ? departmentFromNavigation : (departmentFromNavigation?.name || departmentFromNavigation?.title || '')) || "",
    jobTitle: "",
    location: "",
    manager: "",
    passport: "",
    id: "",
    visa: "",
    insurance: "",
    documents: [],
    company: selectedCompany || "",
    attendanceProgram: "",
    joiningDate: "",
    exitDate: "",
    companyLocation: "",
    workingLocations: [],
    isLineManager: false,
    passportNumber: "",
    passportIssue: "",
    passportExpiry: "",
    passportAttachment: null,
    nationalIdNumber: "",
    nationalIdExpiry: "",
    nationalIdAttachment: null,
    residencyNumber: "",
    residencyExpiry: "",
    residencyAttachment: null,
    insuranceNumber: "",
    insuranceExpiry: "",
    insuranceAttachment: null,
    drivingNumber: "",
    drivingExpiry: "",
    drivingAttachment: null,
    labourNumber: "",
    labourExpiry: "",
    labourAttachment: null,
    remarks: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userAccountFields, setUserAccountFields] = useState({ workEmail: '', password: '', passwordConfirm: '' });
  const [useGeneratedPassword, setUseGeneratedPassword] = useState(false);
  const [openLegalSection, setOpenLegalSection] = useState('');
  const [nationalityDropdownOpen, setNationalityDropdownOpen] = useState(false);
  const [nationalitySearchTerm, setNationalitySearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // Context value
  const ctxValue = { form, setForm };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nationalityDropdownOpen && !event.target.closest('.nationality-dropdown')) {
        setNationalityDropdownOpen(false);
        // Reset search term if no selection was made
        if (!form.nationality) {
          setNationalitySearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [nationalityDropdownOpen, form.nationality]);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await getCompanies();
        if (response.success && response.data) {
          const companiesList = Array.isArray(response.data) ? response.data : (response.data.companies || []);
          setCompanies(companiesList);
          
          // If there's a selected company from context, find and set it
          if (selectedCompany) {
            const foundCompany = companiesList.find(c => c.name === selectedCompany || c.id === selectedCompany);
            if (foundCompany) {
              setSelectedCompanyId(foundCompany.id);
              setForm(prev => ({ ...prev, company: foundCompany.name }));
              // Fetch departments for the selected company
              fetchDepartmentsForCompany(foundCompany.id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch departments for a company
  const fetchDepartmentsForCompany = async (companyId) => {
    if (!companyId) {
      setDepartments([]);
      return;
    }

    setLoadingDepartments(true);
    try {
      const response = await getCompanyDepartments(companyId);
      if (response.success && response.data) {
        const departmentsList = Array.isArray(response.data) ? response.data : [];
        setDepartments(departmentsList);
        
        // Only prefill department if explicitly coming from navigation (position/subdepartment), not from localStorage/context
        // Check if we have explicit navigation state indicating we came from a specific position/subdepartment
        const hasExplicitNavigation = navigationState.position || navigationState.subDepartment || navigationState.positionId;
        if (hasExplicitNavigation && departmentFromNavigation) {
          const foundDepartment = departmentsList.find(d => d.name === departmentFromNavigation);
          if (foundDepartment) {
            setForm(prev => ({ ...prev, department: foundDepartment.name }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Handle company selection change
  const handleCompanyChange = async (e) => {
    const companyName = e.target.value;
    const selectedCompanyObj = companies.find(c => c.name === companyName);
    
    if (selectedCompanyObj) {
      setSelectedCompanyId(selectedCompanyObj.id);
      setForm(prev => ({ ...prev, company: companyName, department: '' })); // Clear department when company changes
      await fetchDepartmentsForCompany(selectedCompanyObj.id);
    } else {
      setSelectedCompanyId(null);
      setForm(prev => ({ ...prev, company: companyName, department: '' }));
      setDepartments([]);
    }
  };

  // Update form when selected company or department changes from context
  useEffect(() => {
    if (selectedCompany && companies.length > 0) {
      const foundCompany = companies.find(c => c.name === selectedCompany || c.id === selectedCompany);
      if (foundCompany && foundCompany.id !== selectedCompanyId) {
        setSelectedCompanyId(foundCompany.id);
        setForm(prev => ({ ...prev, company: foundCompany.name }));
        fetchDepartmentsForCompany(foundCompany.id);
      }
    }
  }, [selectedCompany, companies.length]);

  // Only update department if explicitly coming from navigation (position/subdepartment), not from localStorage/context
  useEffect(() => {
    const hasExplicitNavigation = navigationState.position || navigationState.subDepartment || navigationState.positionId;
    if (hasExplicitNavigation && departmentFromNavigation && departments.length > 0) {
      const foundDepartment = departments.find(d => d.name === departmentFromNavigation);
      if (foundDepartment && form.department !== foundDepartment.name) {
        setForm(prev => ({ ...prev, department: foundDepartment.name }));
      }
    }
  }, [departmentFromNavigation, departments.length]);

  // Helper function to format phone number for submission
  const formatPhoneForSubmission = (phoneNumber, countryCode) => {
    // Remove any non-digit characters except the + sign
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    // Ensure it starts with + if it doesn't already
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  };

  // Helper function to calculate age from birthday
  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Validate birthday for minimum age
  const validateBirthday = (birthday) => {
    if (!birthday) {
      return "Required";
    }
    const age = calculateAge(birthday);
    if (age === null) {
      return "Invalid date";
    }
    if (age < 18) {
      return "This employee cannot be added to the company unless they are at least 18 years old.";
    }
    return null;
  };

  // Validate passport expiry date - must be at least 6 months from today
  const validatePassportExpiry = (expiryDate) => {
    if (!expiryDate) {
      return "Required";
    }
    const expiry = new Date(expiryDate);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(expiry.getTime())) {
      return "Invalid date";
    }
    
    // Calculate 6 months from today
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(today.getMonth() + 6);
    
    // Check if expiry date is at least 6 months away
    if (expiry < sixMonthsFromNow) {
      return "Passport must be valid for at least 6 months from today. Please upload a passport with a later expiry date.";
    }
    
    return null;
  };

  // Handlers
  const handleChange = (field, value) => {
    // Ensure department is always stored as a string
    if (field === 'department' && typeof value !== 'string') {
      value = typeof value === 'object' && value !== null ? (value.name || value.title || String(value)) : String(value);
    }
    setForm({ ...form, [field]: value });
  };
  const handleContactChange = (idx, value, countryCode = null) => {
    const contacts = [...form.contacts];
    contacts[idx].value = value;
    if (countryCode) {
      contacts[idx].countryCode = countryCode;
    }
    setForm({ ...form, contacts });
  };
  const handleAddContact = () => setForm({ ...form, contacts: [...form.contacts, { type: "phone", value: "", countryCode: "ae" }] });
  const handleRemoveContact = (idx) => setForm({ ...form, contacts: form.contacts.filter((_, i) => i !== idx) });
  const handleEmailChange = (idx, value) => {
    const emails = [...form.emails];
    emails[idx] = value;
    setForm({ ...form, emails });
  };
  const handleAddEmail = () => setForm({ ...form, emails: [...form.emails, ""] });
  const handleRemoveEmail = (idx) => setForm({ ...form, emails: form.emails.filter((_, i) => i !== idx) });
  const handleFileChange = (e) => setForm({ ...form, documents: Array.from(e.target.files) });
  const handleImageChange = (e) => setForm({ ...form, personalImage: e.target.files[0] });
  const handleLegalDocumentChange = (field, file) => setForm({ ...form, [field]: file });
  const handleMultiSelect = (field, value) => {
    setForm((prev) => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const handleUserAccountSave = () => {
    setForm({ ...form, userAccount: true, userAccountFields });
    setShowUserModal(false);
  };

  // Validation (simple)
  const validateStep = () => {
    let errs = {};
    if (step === 0) {
      if (!form.employeeType) errs.employeeType = "Required";
      if (!form.firstName) errs.firstName = "Required";
      if (!form.lastName) errs.lastName = "Required";
      if (!form.employeeId) errs.employeeId = "Required";
      if (!form.status) errs.status = "Required";
    }
    if (step === 1) {
      if (!form.gender) errs.gender = "Required";
      if (!form.maritalStatus) errs.maritalStatus = "Required";
      if (!form.nationality) errs.nationality = "Required";
      if (!form.currentAddress) errs.currentAddress = "Required";
      if (!form.childrenCount) errs.childrenCount = "Required";
      // Validate birthday with age check
      const birthdayError = validateBirthday(form.birthday);
      if (birthdayError) {
        errs.birthday = birthdayError;
      }
    }
    if (step === 2) {
      if (!form.contacts[0].value) errs.contacts = "At least one phone required";
      if (form.contacts[0].value && form.contacts[0].value.length < 8) errs.contacts = "Phone number must be at least 8 digits";
      if (!form.emails[0]) errs.emails = "At least one email required";
    }
    if (step === 3) {
      if (!form.company) errs.company = "Required";
      if (!form.department) errs.department = "Required";
      if (!form.jobTitle) errs.jobTitle = "Required";
      if (!form.attendanceProgram) errs.attendanceProgram = "Required";
      if (!form.joiningDate) errs.joiningDate = "Required";
      if (!form.companyLocation) errs.companyLocation = "Required";
      // Line Manager is optional - no validation required
    }
    if (step === 4) {
      // Passport - REQUIRED
      if (!form.passportNumber) errs.passportNumber = "Required";
      if (!form.passportIssue) errs.passportIssue = "Required";
      // Validate passport expiry - must be at least 6 months away
      const passportExpiryError = validatePassportExpiry(form.passportExpiry);
      if (passportExpiryError) {
        errs.passportExpiry = passportExpiryError;
      }
      // All other legal documents (National ID, Residency, Insurance, Driving License, Labour ID) are OPTIONAL
      // No validation required for these fields
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const handlePrev = () => setStep((s) => s - 1);
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all steps before submission
    let allErrors = {};
    
    // Validate step 0
    if (!form.employeeType) allErrors.employeeType = "Required";
    if (!form.firstName) allErrors.firstName = "Required";
    if (!form.lastName) allErrors.lastName = "Required";
    if (!form.employeeId) allErrors.employeeId = "Required";
    if (!form.status) allErrors.status = "Required";
    
    // Validate step 1 (including birthday age check)
    if (!form.gender) allErrors.gender = "Required";
    if (!form.maritalStatus) allErrors.maritalStatus = "Required";
    if (!form.nationality) allErrors.nationality = "Required";
    if (!form.currentAddress) allErrors.currentAddress = "Required";
    if (!form.childrenCount) allErrors.childrenCount = "Required";
    const birthdayError = validateBirthday(form.birthday);
    if (birthdayError) {
      allErrors.birthday = birthdayError;
    }
    
    // Validate step 2
    if (!form.contacts[0]?.value) allErrors.contacts = "At least one phone required";
    if (!form.emails[0]) allErrors.emails = "At least one email required";
    
    // Validate step 3
    if (!form.company) allErrors.company = "Required";
    if (!form.department) allErrors.department = "Required";
    if (!form.jobTitle) allErrors.jobTitle = "Required";
    if (!form.attendanceProgram) allErrors.attendanceProgram = "Required";
    if (!form.joiningDate) allErrors.joiningDate = "Required";
    if (!form.companyLocation) allErrors.companyLocation = "Required";
    
    // ERP Access validation (when enabled)
    if (form.userAccount) {
      const we = (userAccountFields.workEmail || '').trim();
      if (!we) allErrors.workEmail = "Work email is required for ERP login.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(we)) allErrors.workEmail = "Enter a valid email address.";
      if (!useGeneratedPassword) {
        if (!userAccountFields.password) allErrors.erpPassword = "Password is required, or use Generate temporary password.";
        else if (userAccountFields.password.length < 8) allErrors.erpPassword = "Password must be at least 8 characters.";
        else if (!/[a-zA-Z]/.test(userAccountFields.password) || !/\d/.test(userAccountFields.password)) allErrors.erpPassword = "Password must contain at least one letter and one number.";
        else if (userAccountFields.password !== userAccountFields.passwordConfirm) allErrors.erpPasswordConfirm = "Passwords do not match.";
      }
    }
    
    // If there are errors, set them and prevent submission
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Scroll to first error
      const firstErrorField = Object.keys(allErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                          document.querySelector(`input[value*="${firstErrorField}"]`)?.closest('.w-full');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Format phone numbers for submission
    const formattedContacts = form.contacts.map(contact => ({
      ...contact,
      value: formatPhoneForSubmission(contact.value, contact.countryCode)
    }));
    
    // Extract passport fields and map to backend expected names
    const { 
      passportIssue, passportExpiry, nationalIdExpiry, residencyExpiry, 
      insuranceExpiry, drivingExpiry, drivingNumber, labourExpiry,
      ...restOfForm 
    } = form;
    
    // ERP Access: workEmail (required when enabled), password (optional - backend generates if empty), role
    const workEmailVal = form.userAccount ? (userAccountFields.workEmail || '').trim() : '';
    const passwordVal = form.userAccount && !useGeneratedPassword ? userAccountFields.password : '';
    const submissionData = {
      ...restOfForm,
      contacts: formattedContacts,
      passportNumber: form.passportNumber || '',
      passportIssueDate: passportIssue || '',
      passportExpiryDate: passportExpiry || '',
      nationalIdExpiryDate: nationalIdExpiry || null,
      residencyExpiryDate: residencyExpiry || null,
      insuranceExpiryDate: insuranceExpiry || null,
      drivingLicenseExpiryDate: drivingExpiry || null,
      labourIdExpiryDate: labourExpiry || null,
      drivingLicenseNumber: drivingNumber || null,
      // ERP Access
      workEmail: form.userAccount ? workEmailVal || undefined : undefined,
      password: form.userAccount && passwordVal ? passwordVal : undefined,
      userAccount: !!form.userAccount,
      role: form.role || 'EMPLOYEE',
    };
    
    console.log('Submitting employee data:', submissionData);
    console.log('Passport fields check:', {
      passportNumber: submissionData.passportNumber,
      passportIssueDate: submissionData.passportIssueDate,
      passportExpiryDate: submissionData.passportExpiryDate,
      formPassportNumber: form.passportNumber,
      formPassportIssue: form.passportIssue,
      formPassportExpiry: form.passportExpiry
    });
    setSubmitted(true);
    
    // Save the employee to the list
    if (onSaveEmployee) {
      onSaveEmployee(submissionData);
    }
  };

  // Step content
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            {/* User Account Modal */}
            {showUserModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
                  <h3 className="text-lg font-bold mb-4">ERP Access (Login Credentials)</h3>
                  <div className="mb-4">
                    <label className="block font-medium mb-1">Work Email *</label>
                    <input type="email" className="input" placeholder="e.g. name@company.com" value={userAccountFields.workEmail} onChange={e => setUserAccountFields(f => ({ ...f, workEmail: e.target.value }))} />
                    {userAccountFields.workEmail === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
                  </div>
                  <div className="mb-4">
                    <label className="block font-medium mb-1">Password</label>
                    <input type="password" className="input" placeholder="Min 8 chars, letter + number" value={userAccountFields.password} onChange={e => setUserAccountFields(f => ({ ...f, password: e.target.value }))} />
                    {userAccountFields.password === '' && <div className="text-red-500 text-xs mt-1">Required (or use Generate in form)</div>}
                  </div>
                  <div className="mb-4">
                    <label className="block font-medium mb-1">Confirm Password</label>
                    <input type="password" className="input" placeholder="Confirm password" value={userAccountFields.passwordConfirm} onChange={e => setUserAccountFields(f => ({ ...f, passwordConfirm: e.target.value }))} />
                    {userAccountFields.passwordConfirm === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button type="button" className="btn" onClick={() => setShowUserModal(false)}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={() => {
                      if (userAccountFields.workEmail && userAccountFields.password && userAccountFields.passwordConfirm) {
                        handleUserAccountSave();
                      }
                    }}>Save</button>
                  </div>
                </div>
              </div>
            )}
                          <div className="flex items-center gap-6 mb-8 flex-col sm:flex-row">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-400 flex items-center justify-center shadow-lg overflow-hidden cursor-pointer" onClick={() => document.getElementById('personalImageInput').click()}>
                    {form.personalImage ? (
                      <img src={URL.createObjectURL(form.personalImage)} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                  <input
                    id="personalImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {form.personalImage && (
                    <p className="text-xs text-green-600 font-medium mt-1">{form.personalImage.name}</p>
                  )}
                </div>
                <div className="text-lg font-semibold text-gray-700 mt-2 sm:mt-0">Main Information</div>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-6 px-1 sm:px-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Employee Type<span className="text-red-500 ml-1">*</span></label>
                <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.employeeType} onChange={e => handleChange('employeeType', e.target.value)}>
                  <option value="">Select employee type</option>
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
                {errors.employeeType && <div className="text-red-500 text-xs">{errors.employeeType}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">First Name<span className="text-red-500 ml-1">*</span></label>
                <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter first name" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} />
                {errors.firstName && <div className="text-red-500 text-xs">{errors.firstName}</div>}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Last Name<span className="text-red-500 ml-1">*</span></label>
                <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter last name" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} />
                {errors.lastName && <div className="text-red-500 text-xs">{errors.lastName}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Employee ID<span className="text-red-500 ml-1">*</span></label>
                <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter employee ID" value={form.employeeId} onChange={e => handleChange('employeeId', e.target.value)} />
                {errors.employeeId && <div className="text-red-500 text-xs">{errors.employeeId}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Status<span className="text-red-500 ml-1">*</span></label>
                <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="probation">Probation</option>
                </select>
                {errors.status && <div className="text-red-500 text-xs">{errors.status}</div>}
              </div>

              {/* ERP Access section */}
              <div className="md:col-span-2 w-full mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">ERP Access</h4>
                <p className="text-xs text-gray-500 mb-3">These credentials will be used for ERP login.</p>
                <div className="flex items-center gap-2 mb-3">
                  <input type="checkbox" id="erpAccessToggle" checked={form.userAccount} onChange={e => handleChange('userAccount', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <label htmlFor="erpAccessToggle" className="text-sm font-medium text-gray-700">Enable ERP Access</label>
                </div>
                {form.userAccount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Email (required for login) *</label>
                      <input type="email" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="e.g. name@company.com" value={userAccountFields.workEmail} onChange={e => setUserAccountFields(f => ({ ...f, workEmail: e.target.value }))} />
                      {errors.workEmail && <div className="text-red-500 text-xs mt-1">{errors.workEmail}</div>}
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.role} onChange={e => handleChange('role', e.target.value)}>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="PROJECT_MANAGER">Manager</option>
                        <option value="HR">HR</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input type="password" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder={useGeneratedPassword ? "Will be generated" : "Min 8 chars, letter + number"} value={userAccountFields.password} onChange={e => { setUserAccountFields(f => ({ ...f, password: e.target.value })); setUseGeneratedPassword(false); }} disabled={useGeneratedPassword} />
                      {errors.erpPassword && <div className="text-red-500 text-xs mt-1">{errors.erpPassword}</div>}
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input type="password" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Confirm password" value={userAccountFields.passwordConfirm} onChange={e => setUserAccountFields(f => ({ ...f, passwordConfirm: e.target.value }))} disabled={useGeneratedPassword} />
                      {errors.erpPasswordConfirm && <div className="text-red-500 text-xs mt-1">{errors.erpPasswordConfirm}</div>}
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <button type="button" className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100" onClick={() => { setUseGeneratedPassword(true); setUserAccountFields(f => ({ ...f, password: '', passwordConfirm: '' })); }}>Generate temporary password</button>
                      {useGeneratedPassword && <span className="text-xs text-gray-600">Temporary password will be shown after save.</span>}
                    </div>
                  </div>
                )}
              </div>

            </div>
                     </div>
         );
       case 1:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><UserIcon className="h-6 w-6 text-indigo-400" /> Personal Details</div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Gender<span className="text-red-500 ml-1">*</span></label>
                 <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
                   <option value="">Select gender</option>
                   <option value="male">Male</option>
                   <option value="female">Female</option>
                   <option value="other">Other</option>
                 </select>
                 {errors.gender && <div className="text-red-500 text-xs">{errors.gender}</div>}
               </div>
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Marital Status<span className="text-red-500 ml-1">*</span></label>
                 <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.maritalStatus} onChange={e => handleChange('maritalStatus', e.target.value)}>
                   <option value="">Select marital status</option>
                   <option value="single">Single</option>
                   <option value="married">Married</option>
                   <option value="divorced">Divorced</option>
                   <option value="widowed">Widowed</option>
                 </select>
                 {errors.maritalStatus && <div className="text-red-500 text-xs">{errors.maritalStatus}</div>}
               </div>
               <div className="w-full">
                                     <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Nationality<span className="text-red-500 ml-1">*</span></label>
                    <div className="relative nationality-dropdown">
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full h-[42px] px-4 py-2 pr-10 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                          placeholder="Type to search nationality..."
                          value={form.nationality 
                            ? nationalities.find(n => n.value === form.nationality)?.label || form.nationality 
                            : nationalitySearchTerm}
                          onChange={(e) => {
                            const searchValue = e.target.value;
                            setNationalitySearchTerm(searchValue);
                            setNationalityDropdownOpen(true);
                            // Clear selection if user starts typing something different
                            if (form.nationality) {
                              const currentLabel = nationalities.find(n => n.value === form.nationality)?.label || '';
                              if (searchValue !== currentLabel) {
                                handleChange('nationality', '');
                              }
                            }
                          }}
                          onFocus={() => {
                            setNationalityDropdownOpen(true);
                            // If there's a selected nationality, show it in search term for editing
                            if (form.nationality) {
                              const selectedLabel = nationalities.find(n => n.value === form.nationality)?.label || '';
                              setNationalitySearchTerm(selectedLabel);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setNationalityDropdownOpen(false);
                              // Restore selected value if exists
                              if (form.nationality) {
                                const selectedLabel = nationalities.find(n => n.value === form.nationality)?.label || '';
                                setNationalitySearchTerm(selectedLabel);
                              } else {
                                setNationalitySearchTerm('');
                              }
                            }
                            // Allow Enter key to select first filtered option
                            if (e.key === 'Enter' && nationalityDropdownOpen) {
                              e.preventDefault();
                              const filteredNationalities = nationalities.filter((nationality) =>
                                nationality.label.toLowerCase().includes(nationalitySearchTerm.toLowerCase()) ||
                                nationality.value.toLowerCase().includes(nationalitySearchTerm.toLowerCase())
                              );
                              if (filteredNationalities.length > 0) {
                                handleChange('nationality', filteredNationalities[0].value);
                                setNationalitySearchTerm('');
                                setNationalityDropdownOpen(false);
                              }
                            }
                          }}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          {form.nationality ? (
                            <span className="text-lg" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols"' }}>
                              {nationalities.find(n => n.value === form.nationality)?.flag}
                            </span>
                          ) : (
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      {nationalityDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {(() => {
                            const filteredNationalities = nationalities.filter((nationality) =>
                              nationality.label.toLowerCase().includes(nationalitySearchTerm.toLowerCase()) ||
                              nationality.value.toLowerCase().includes(nationalitySearchTerm.toLowerCase())
                            );
                            
                            if (filteredNationalities.length === 0) {
                              return (
                                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                  No nationalities found
                                </div>
                              );
                            }
                            
                            return filteredNationalities.map((nationality) => (
                              <div
                                key={nationality.value}
                                className="px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer flex items-center transition-colors"
                                onClick={() => {
                                  handleChange('nationality', nationality.value);
                                  setNationalitySearchTerm('');
                                  setNationalityDropdownOpen(false);
                                }}
                              >
                                <span className="mr-2 text-lg" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols"' }}>{nationality.flag}</span>
                                <span className={form.nationality === nationality.value ? 'font-semibold text-indigo-600' : ''}>{nationality.label}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                    {errors.nationality && <div className="text-red-500 text-xs">{errors.nationality}</div>}
               </div>
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Children Count<span className="text-red-500 ml-1">*</span></label>
                 <input type="number" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter children count" value={form.childrenCount} onChange={e => handleChange('childrenCount', e.target.value)} min="0" />
                 {errors.childrenCount && <div className="text-red-500 text-xs">{errors.childrenCount}</div>}
               </div>
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Birthday<span className="text-red-500 ml-1">*</span></label>
                 <input 
                   type="date" 
                   className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${
                     errors.birthday ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                   }`}
                   value={form.birthday} 
                   onChange={e => {
                     const birthdayValue = e.target.value;
                     handleChange('birthday', birthdayValue);
                     // Real-time validation
                     const birthdayError = validateBirthday(birthdayValue);
                     if (birthdayError) {
                       setErrors(prev => ({ ...prev, birthday: birthdayError }));
                     } else {
                       setErrors(prev => {
                         const newErrors = { ...prev };
                         delete newErrors.birthday;
                         return newErrors;
                       });
                     }
                   }}
                   max={(() => {
                     // Set max date to 18 years ago from today
                     const today = new Date();
                     const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                     return maxDate.toISOString().split('T')[0];
                   })()}
                 />
                 {errors.birthday && (
                   <div className={`text-xs mt-1 ${
                     errors.birthday.includes('at least 18 years old') 
                       ? 'text-red-600 font-medium' 
                       : 'text-red-500'
                   }`}>
                     {errors.birthday}
                   </div>
                 )}
                 {form.birthday && !errors.birthday && (
                   <div className="text-xs text-gray-500 mt-1">
                     Age: {calculateAge(form.birthday)} years old
                   </div>
                 )}
               </div>
               <div className="w-full col-span-1 md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Current Address<span className="text-red-500 ml-1">*</span></label>
                 <textarea className="w-full h-[80px] px-4 py-2 text-sm border rounded-md" placeholder="Enter current address" value={form.currentAddress} onChange={e => handleChange('currentAddress', e.target.value)} />
                 {errors.currentAddress && <div className="text-red-500 text-xs">{errors.currentAddress}</div>}
               </div>

             </div>
           </div>
         );
       case 2:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><PhoneIcon className="h-6 w-6 text-indigo-400" /> Contact Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Phone Numbers<span className="text-red-500 ml-1">*</span></label>
                {form.contacts.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <PhoneInput
                      country={'ae'}
                      value={c.value}
                      onChange={(phone, country) => handleContactChange(i, phone, country.countryCode)}
                      placeholder="50 123 4567"
                      enableSearch={true}
                      searchPlaceholder="Search country..."
                      preferredCountries={['ae', 'sa', 'kw', 'bh', 'om', 'qa']}
                      autoFormat={true}
                      disableSearchIcon={true}
                      countryCodeEditable={false}
                    />
                    {form.contacts.length > 1 && <button type="button" className="text-red-500" onClick={() => handleRemoveContact(i)}>Remove</button>}
                  </div>
                ))}
                <button type="button" className="text-blue-600" onClick={handleAddContact}>+ Add Phone</button>
                {errors.contacts && <div className="text-red-500 text-xs">{errors.contacts}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Emails<span className="text-red-500 ml-1">*</span></label>
                {form.emails.map((em, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={em} onChange={e => handleEmailChange(i, e.target.value)} placeholder="Email" />
                    {form.emails.length > 1 && <button type="button" className="text-red-500" onClick={() => handleRemoveEmail(i)}>Remove</button>}
                  </div>
                ))}
                <button type="button" className="text-blue-600" onClick={handleAddEmail}>+ Add Email</button>
                {errors.emails && <div className="text-red-500 text-xs">{errors.emails}</div>}
              </div>
            </div>
          </div>
        );
             case 3:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><BriefcaseIcon className="h-6 w-6 text-indigo-400" /> Company Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Company<span className="text-red-500 ml-1">*</span>
                  {selectedCompany && form.company === selectedCompany && (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                      <CheckIcon className="h-3 w-3" />
                      Pre-filled
                    </span>
                  )}
                </label>
                <select
                  className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${
                    selectedCompany && form.company === selectedCompany ? 'border-green-300 bg-green-50' : ''
                  }`}
                  value={form.company}
                  onChange={handleCompanyChange}
                  disabled={loadingCompanies}
                >
                  <option value="">{loadingCompanies ? 'Loading companies...' : 'Select company'}</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.name}>
                      {company.name}
                    </option>
                  ))}
                </select>
                {errors.company && <div className="text-red-500 text-xs">{errors.company}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Department<span className="text-red-500 ml-1">*</span>
                  {departmentFromNavigation && form.department === departmentFromNavigation && (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                      <CheckIcon className="h-3 w-3" />
                      Pre-filled
                    </span>
                  )}
                  {selectedCompanyId && departments.length > 0 && form.department && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                      <CheckIcon className="h-3 w-3" />
                      {departments.length} available
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    list={`department-list-${selectedCompanyId || 'none'}`}
                    className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${
                      departmentFromNavigation && form.department === departmentFromNavigation ? 'border-green-300 bg-green-50' : ''
                    }`}
                    placeholder={loadingDepartments 
                      ? 'Loading departments...' 
                      : !selectedCompanyId 
                        ? 'Select a company first' 
                        : departments.length === 0
                          ? 'Enter department name'
                          : 'Select or type department name'}
                    value={typeof form.department === 'string' ? form.department : (form.department?.name || form.department?.title || '')}
                    onChange={e => handleChange('department', e.target.value)}
                    disabled={loadingDepartments || !selectedCompanyId}
                  />
                  <datalist id={`department-list-${selectedCompanyId || 'none'}`}>
                    {departments.map(department => (
                      <option key={department.id} value={department.name}>
                        {department.name}
                      </option>
                    ))}
                  </datalist>
                </div>
                {selectedCompanyId && departments.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {departments.length} department{departments.length !== 1 ? 's' : ''} available. Select from list or type a new name.
                  </div>
                )}
                {selectedCompanyId && departments.length === 0 && !loadingDepartments && (
                  <div className="text-xs text-gray-500 mt-1">
                    No departments found for this company. You can enter a department name manually.
                  </div>
                )}
                {errors.department && <div className="text-red-500 text-xs">{errors.department}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Job Title<span className="text-red-500 ml-1">*</span></label>
                <select 
                  key={`job-title-select-${jobTitles?.length || 0}`}
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.jobTitle || ""} 
                  onChange={e => {
                    const newJobTitle = e.target.value;
                    console.log('Job Title selected:', newJobTitle);
                    console.log('Available job titles:', jobTitles);
                    console.log('Current form.jobTitle:', form.jobTitle);
                    
                    // Update job title using functional update to ensure latest state
                    setForm(prev => {
                      const updated = { ...prev, jobTitle: newJobTitle };
                      // Clear manager field when job title is "Manager"
                      if (newJobTitle === "Manager") {
                        updated.manager = '';
                      }
                      return updated;
                    });
                    
                    // Clear manager error if it exists when selecting Manager
                    if (newJobTitle === "Manager") {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.manager;
                        return newErrors;
                      });
                    }
                  }}
                >
                  <option value="">Select job title</option>
                  {jobTitles && jobTitles.length > 0 ? (
                    jobTitles.map((job, index) => {
                      const jobTitleValue = job.title || job.name || '';
                      const jobTitleDisplay = job.title || job.name || '';
                      return (
                        <option 
                          key={job.id || `job-${index}`} 
                          value={jobTitleValue}
                        >
                          {jobTitleDisplay}
                        </option>
                      );
                    })
                  ) : (
                    <option value="Manager">Manager</option>
                  )}
                </select>
                {errors.jobTitle && <div className="text-red-500 text-xs">{errors.jobTitle}</div>}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Current value: {form.jobTitle || '(empty)'} | Available: {jobTitles?.length || 0} titles
                  </div>
                )}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Attendance Program<span className="text-red-500 ml-1">*</span></label>
                <select 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.attendanceProgram} 
                  onChange={e => handleChange('attendanceProgram', e.target.value)}
                >
                  <option value="">Select attendance program</option>
                  {attendancePrograms && attendancePrograms.map(program => (
                    <option key={program.id} value={program.name}>{program.name}</option>
                  ))}
                </select>
                {errors.attendanceProgram && <div className="text-red-500 text-xs">{errors.attendanceProgram}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Joining Date<span className="text-red-500 ml-1">*</span></label>
                <input type="date" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.joiningDate} onChange={e => handleChange('joiningDate', e.target.value)} />
                {errors.joiningDate && <div className="text-red-500 text-xs">{errors.joiningDate}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Exit Date</label>
                <input type="date" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.exitDate} onChange={e => handleChange('exitDate', e.target.value)} />
                {errors.exitDate && <div className="text-red-500 text-xs">{errors.exitDate}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Company Location<span className="text-red-500 ml-1">*</span></label>
                <select 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.companyLocation} 
                  onChange={e => handleChange('companyLocation', e.target.value)}
                >
                  <option value="">Select company location</option>
                  {companyLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                {errors.companyLocation && <div className="text-red-500 text-xs">{errors.companyLocation}</div>}
              </div>
              {form.jobTitle !== "Manager" && (
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Line Manager</label>
                  <select 
                    className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                    value={form.manager} 
                    onChange={e => handleChange('manager', e.target.value)}
                  >
                    <option value="">Select line manager (Optional)</option>
                    {employeesList && employeesList.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                  {errors.manager && <div className="text-red-500 text-xs">{errors.manager}</div>}
                </div>
              )}
              <div className="w-full flex items-center gap-2 mt-6">
                <input type="checkbox" checked={form.isLineManager} onChange={e => handleChange('isLineManager', e.target.checked)} />
                <label className="block text-sm font-medium text-gray-700 mb-1">Is Line Manager</label>
              </div>
            </div>
          </div>
        );
             case 4:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><IdentificationIcon className="h-6 w-6 text-indigo-400" /> Legal Information</div>
            <div className="space-y-4 mb-6">
              {/* Collapsible Section Helper */}
              {[
                { key: 'passport', label: 'Passport Info', attachmentField: 'passportAttachment', fields: [
                  { name: 'passportNumber', label: 'Passport Number', placeholder: 'Enter passport number' },
                  { name: 'passportIssue', label: 'Passport Issue Date', type: 'date' },
                  { name: 'passportExpiry', label: 'Passport Expiry Date', type: 'date' },
                ]},
                { key: 'nationalId', label: 'National ID', attachmentField: 'nationalIdAttachment', fields: [
                  { name: 'nationalIdNumber', label: 'National ID Number', placeholder: 'Enter national ID number' },
                  { name: 'nationalIdExpiry', label: 'National ID Expiry', type: 'date' },
                ]},
                { key: 'residency', label: 'Residency Info', attachmentField: 'residencyAttachment', fields: [
                  { name: 'residencyNumber', label: 'Residency Number', placeholder: 'Enter residency number' },
                  { name: 'residencyExpiry', label: 'Residency Expiry', type: 'date' },
                ]},
                { key: 'insurance', label: 'Insurance', attachmentField: 'insuranceAttachment', fields: [
                  { name: 'insuranceNumber', label: 'Insurance Number', placeholder: 'Enter insurance number' },
                  { name: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' },
                ]},
                { key: 'driving', label: 'Driving Licence', attachmentField: 'drivingAttachment', fields: [
                  { name: 'drivingNumber', label: 'Driving Licence Number', placeholder: 'Enter driving licence number' },
                  { name: 'drivingExpiry', label: 'Driving Licence Expiry', type: 'date' },
                ]},
                { key: 'labour', label: 'Labour ID', attachmentField: 'labourAttachment', fields: [
                  { name: 'labourNumber', label: 'Labour ID Number', placeholder: 'Enter labour ID number' },
                  { name: 'labourExpiry', label: 'Labour ID Expiry', type: 'date' },
                ]},
              ].map(section => (
                <div key={section.key} className="border rounded-lg overflow-hidden">
                  <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-indigo-50 transition font-semibold text-left" onClick={() => setOpenLegalSection(openLegalSection === section.key ? '' : section.key)}>
                    {section.label}
                    <span>{openLegalSection === section.key ? '-' : '+'}</span>
                  </button>
                  {openLegalSection === section.key && (
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-4">
                        {section.fields.map(field => {
                          // Special handling for passport expiry date
                          const isPassportExpiry = field.name === 'passportExpiry';
                          return (
                            <div key={field.name} className="w-full">
                              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                              <input
                                className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${
                                  errors[field.name] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                                }`}
                                type={field.type || 'text'}
                                placeholder={field.placeholder || field.label}
                                value={form[field.name] || ''}
                                onChange={e => {
                                  const value = e.target.value;
                                  handleChange(field.name, value);
                                  
                                  // Real-time validation for passport expiry
                                  if (isPassportExpiry) {
                                    const expiryError = validatePassportExpiry(value);
                                    if (expiryError) {
                                      setErrors(prev => ({ ...prev, [field.name]: expiryError }));
                                    } else {
                                      setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors[field.name];
                                        return newErrors;
                                      });
                                    }
                                  }
                                }}
                                min={isPassportExpiry ? (() => {
                                  // Set min date to 6 months from today
                                  const today = new Date();
                                  const minDate = new Date();
                                  minDate.setMonth(today.getMonth() + 6);
                                  return minDate.toISOString().split('T')[0];
                                })() : undefined}
                              />
                              {errors[field.name] && (
                                <div className={`text-xs mt-1 ${
                                  errors[field.name].includes('6 months') 
                                    ? 'text-red-600 font-medium' 
                                    : 'text-red-500'
                                }`}>
                                  {errors[field.name]}
                                </div>
                              )}
                              {isPassportExpiry && form[field.name] && !errors[field.name] && (() => {
                                const expiry = new Date(form[field.name]);
                                const today = new Date();
                                const monthsUntilExpiry = (expiry.getFullYear() - today.getFullYear()) * 12 + (expiry.getMonth() - today.getMonth());
                                return (
                                  <div className="text-xs text-green-600 mt-1">
                                    Valid for {monthsUntilExpiry} months
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Attachment Section */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <DocumentPlusIcon className="h-5 w-5 text-indigo-500" />
                          <label className="block text-sm font-medium text-gray-700">Upload {section.label} Document</label>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={e => handleLegalDocumentChange(section.attachmentField, e.target.files[0])}
                          />
                          {form[section.attachmentField] && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckIcon className="h-4 w-4" />
                              <span>{form[section.attachmentField].name}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                                 </div>
               ))}
             </div>
             
             {/* Legal Documents Summary */}
             <div className="mt-6 p-4 bg-gray-50 rounded-lg">
               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                 <DocumentPlusIcon className="h-4 w-4 text-indigo-500" />
                 Uploaded Legal Documents
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {[
                   { label: 'Passport', field: 'passportAttachment' },
                   { label: 'National ID', field: 'nationalIdAttachment' },
                   { label: 'Residency', field: 'residencyAttachment' },
                   { label: 'Insurance', field: 'insuranceAttachment' },
                   { label: 'Driving License', field: 'drivingAttachment' },
                   { label: 'Labour ID', field: 'labourAttachment' }
                 ].map(doc => (
                   <div key={doc.field} className="flex items-center gap-2 p-2 bg-white rounded border">
                     {form[doc.field] ? (
                       <>
                         <CheckIcon className="h-4 w-4 text-green-500" />
                         <span className="text-sm text-gray-700">{doc.label}:</span>
                         <span className="text-sm text-green-600 font-medium">{form[doc.field].name}</span>
                       </>
                     ) : (
                       <>
                         <div className="h-4 w-4 border-2 border-gray-300 rounded"></div>
                         <span className="text-sm text-gray-500">{doc.label}: Not uploaded</span>
                       </>
                     )}
                   </div>
                 ))}
               </div>
             </div>
           </div>
        );

                            case 5:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><CheckCircleIcon className="h-6 w-6 text-green-500" /> Review & Submit</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
              <div className="w-full"><b>Gender:</b> {form.gender}</div>
              <div className="w-full"><b>Marital Status:</b> {form.maritalStatus}</div>
                              <div className="w-full"><b>Nationality:</b> {nationalities.find(n => n.value === form.nationality)?.flag} {nationalities.find(n => n.value === form.nationality)?.label || form.nationality}</div>
              <div className="w-full"><b>Birthday:</b> {form.birthday}</div>
              <div className="w-full"><b>Phones:</b> {form.contacts.map(c => c.value).join(", ")}</div>
              <div className="w-full"><b>Emails:</b> {form.emails.join(", ")}</div>
              <div className="w-full"><b>Department:</b> {form.department}</div>
              <div className="w-full"><b>Job Title:</b> {form.jobTitle}</div>
              <div className="w-full"><b>Attendance Program:</b> {form.attendanceProgram}</div>
              <div className="w-full"><b>Company Location:</b> {form.companyLocation}</div>
              {form.jobTitle !== "Manager" && (
                <div className="w-full"><b>Line Manager:</b> {form.manager}</div>
              )}
              <div className="w-full"><b>Passport:</b> {form.passport}</div>
              <div className="w-full"><b>ID:</b> {form.id}</div>
              <div className="w-full"><b>Visa:</b> {form.visa}</div>
              <div className="w-full"><b>Insurance:</b> {form.insurance}</div>
              <div className="w-full col-span-2">
                <b>Legal Documents:</b>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { label: 'Passport', field: 'passportAttachment' },
                    { label: 'National ID', field: 'nationalIdAttachment' },
                    { label: 'Residency', field: 'residencyAttachment' },
                    { label: 'Insurance', field: 'insuranceAttachment' },
                    { label: 'Driving License', field: 'drivingAttachment' },
                    { label: 'Labour ID', field: 'labourAttachment' }
                  ].map(doc => (
                    <div key={doc.field} className="text-sm">
                      <span className="font-medium">{doc.label}:</span> {form[doc.field] ? form[doc.field].name : 'Not uploaded'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <EmployeeFormContext.Provider value={ctxValue}>
      <div className="w-full flex flex-col items-center animate-fade-in px-1 sm:px-2 md:px-4">
        {/* Mobile Stepper */}
        <div className="w-full lg:hidden mb-4 mt-2 px-1 overflow-x-auto">
          <div className="flex items-center justify-between mb-4 min-w-[400px]">
            <span className="text-xs font-medium text-gray-500">Step {step + 1} of {steps.length}</span>
            <span className="text-xs font-medium text-indigo-600">{steps[step].label}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop Stepper */}
        <div className="w-full relative mb-6 mt-6 px-2 sm:px-4 lg:px-10 hidden lg:block" style={{height: 60}}>
          {/* Progress line (background) */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-gray-300 rounded z-0" />
          {/* Progress line (active) */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-indigo-500 rounded z-0 transition-all duration-300"
            style={{ width: `${(step/(steps.length-1))*100}%`, right: 'auto' }}
          />
          {/* Stepper icons */}
          <div className="relative z-10 flex items-center justify-between w-full">
            {steps.map((s, i) => {
              const canGo = i === 0 || Array.from({length: i}).every((_, idx) => {
                // Simulate validation for each previous step
                let errs = {};
                if (idx === 0) {
                  if (!form.employeeType) errs.employeeType = 'Required';
                  if (!form.firstName) errs.firstName = 'Required';
                  if (!form.lastName) errs.lastName = 'Required';
                  if (!form.employeeId) errs.employeeId = 'Required';
                  if (!form.status) errs.status = 'Required';
                }
                                 if (idx === 1) {
                   if (!form.gender) errs.gender = 'Required';
                   if (!form.maritalStatus) errs.maritalStatus = 'Required';
                   if (!form.nationality) errs.nationality = 'Required';
                   if (!form.currentAddress) errs.currentAddress = 'Required';
                   if (!form.childrenCount) errs.childrenCount = 'Required';
                   // Validate birthday with age check
                   const birthdayError = validateBirthday(form.birthday);
                   if (birthdayError) {
                     errs.birthday = birthdayError;
                   }
                 }
                 if (idx === 2) {
                   if (!form.contacts[0].value) errs.contacts = 'At least one phone required';
                   if (!form.emails[0]) errs.emails = 'At least one email required';
                 }
                 if (idx === 3) {
                   if (!form.company) errs.company = 'Required';
                   if (!form.department) errs.department = 'Required';
                   if (!form.jobTitle) errs.jobTitle = 'Required';
                   if (!form.attendanceProgram) errs.attendanceProgram = 'Required';
                   if (!form.joiningDate) errs.joiningDate = 'Required';
                   if (!form.exitDate) errs.exitDate = 'Required';
                   if (!form.workingLocations || form.workingLocations.length === 0) errs.workingLocations = 'Required';
                   // Line Manager is optional - no validation required
                 }
                 if (idx === 4) {
                   // Passport - REQUIRED
                   if (!form.passportNumber) errs.passportNumber = 'Required';
                   if (!form.passportIssue) errs.passportIssue = 'Required';
                   // Validate passport expiry - must be at least 6 months away
                   const passportExpiryError = validatePassportExpiry(form.passportExpiry);
                   if (passportExpiryError) {
                     errs.passportExpiry = passportExpiryError;
                   }
                   // All other legal documents (National ID, Residency, Insurance, Driving License, Labour ID) are OPTIONAL
                   // No validation required for these fields
                 }
                return Object.keys(errs).length === 0;
              });
              const isCompleted = i < step;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center w-1/6 ${i === step ? 'text-indigo-600 font-bold' : canGo ? 'text-gray-400 cursor-pointer hover:text-indigo-500' : 'text-gray-300 cursor-not-allowed'}`}
                  onClick={() => canGo && setStep(i)}
                  title={canGo ? s.label : 'Complete previous steps first'}
                  style={{ pointerEvents: canGo ? 'auto' : 'none' }}
                >
                  <div className={`relative z-10 rounded-full w-10 h-10 flex items-center justify-center border-2 ${i === step ? 'border-indigo-600 bg-indigo-100' : isCompleted ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 bg-white'} transition-all duration-300`}>
                    {isCompleted ? (
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <s.icon className={`h-6 w-6 ${i === step ? 'text-indigo-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="text-xs mt-2 text-center whitespace-nowrap">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-2xl p-2 sm:p-4 lg:p-10 border border-indigo-100 mx-0">
          {renderStep()}
          <div className="flex flex-col sm:flex-row justify-between mt-6 gap-2 sm:gap-4">
            <button type="button" className="btn flex items-center justify-center gap-2 order-2 sm:order-1 w-full sm:w-auto" onClick={onBack}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to List
            </button>
            <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2 w-full sm:w-auto">
              {step > 0 && <button type="button" className="btn flex items-center justify-center gap-2 w-full sm:w-auto" onClick={handlePrev}><svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Previous</button>}
              {step < steps.length - 1 && <button type="button" className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto" onClick={handleNext}>Next <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>}
              {step === steps.length - 1 && <button type="submit" className="btn btn-success flex items-center justify-center gap-2 w-full sm:w-auto"><CheckCircleIcon className="h-5 w-5" /> Submit</button>}
            </div>
          </div>
          {submitted && <div className="mt-4 text-green-600 font-bold text-center">Employee submitted successfully!</div>}
        </form>
        <style>{`
          .input { @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200; }
          .btn { @apply px-4 py-2 rounded font-semibold transition bg-white border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm; }
          .btn-primary { @apply bg-indigo-600 text-white hover:bg-indigo-700 border-0; }
          .btn-success { @apply bg-green-600 text-white hover:bg-green-700 border-0; }
          .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(.4,0,.2,1); }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
          
          ${phoneInputStyles}
        `}</style>
      </div>
    </EmployeeFormContext.Provider>
  );
}

export default function Employees() {
  const location = useLocation();
  // Get navigation state for breadcrumbs (company, department, subdepartment, position)
  const navigationState = location.state || {};
  const company = navigationState.company || null;
  const department = navigationState.department || null;
  const subDepartment = navigationState.subDepartment || null;
  const position = navigationState.position || null;
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    totalDepartments: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showJobTitlesModal, setShowJobTitlesModal] = useState(false);
  const [showAttendanceProgramModal, setShowAttendanceProgramModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] = useState(null);
  const [showPayrollDrawer, setShowPayrollDrawer] = useState(false);
  const [selectedEmployeeForPayroll, setSelectedEmployeeForPayroll] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState(null);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState(null);
  const [openLegalSection, setOpenLegalSection] = useState('');
  
  // Fetch employees and statistics on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch employees
        const employeesResponse = await getEmployees();
        if (employeesResponse.success && employeesResponse.data) {
          // Transform backend employee data to match frontend format
          const transformedEmployees = employeesResponse.data.map(emp => ({
            id: emp.id,
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            department: emp.department || 'N/A',
            email: emp.email || emp.emailAddresses ? (Array.isArray(emp.emailAddresses) ? emp.emailAddresses[0] : JSON.parse(emp.emailAddresses || '[]')[0] || emp.email) : 'No email',
            jobTitle: emp.jobTitle || 'N/A',
            employeeType: emp.employeeType || 'N/A',
            status: emp.status || (emp.isActive ? 'Active' : 'Inactive'),
            phone: emp.phone || (emp.phoneNumbers ? (Array.isArray(emp.phoneNumbers) ? emp.phoneNumbers[0]?.value : JSON.parse(emp.phoneNumbers || '[]')[0]?.value) : 'No phone'),
            manager: emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : 'N/A',
            joiningDate: emp.joiningDate || null,
            ...emp // Include all backend fields
          }));
          setEmployees(transformedEmployees);
        }

        // Fetch statistics
        const statsResponse = await getEmployeeStatistics();
        if (statsResponse.success && statsResponse.data) {
          setStatistics(statsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching employees and statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter employees based on search term
  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (emp.name || '').toLowerCase().includes(searchLower) ||
      (emp.department || '').toLowerCase().includes(searchLower) ||
      (emp.jobTitle || '').toLowerCase().includes(searchLower) ||
      (emp.email || '').toLowerCase().includes(searchLower) ||
      (emp.id || '').toString().includes(searchTerm)
    );
  });
  
  const [employeeDocuments, setEmployeeDocuments] = useState({
    1: [
      {
        id: 1,
        name: "Passport.pdf",
        type: "Passport",
        uploadDate: "2024-01-15",
        expiryDate: "2029-05-20",
        fileSize: "2.3 MB",
        status: "active"
      },
      {
        id: 2,
        name: "Employment_Contract.pdf",
        type: "Employment Contract",
        uploadDate: "2024-01-10",
        expiryDate: null,
        fileSize: "1.8 MB",
        status: "active"
      },
      {
        id: 3,
        name: "Visa_Document.pdf",
        type: "Visa",
        uploadDate: "2024-01-12",
        expiryDate: "2026-08-15",
        fileSize: "3.1 MB",
        status: "active"
      }
    ],
    2: [
      {
        id: 4,
        name: "ID_Card.jpg",
        type: "ID Card",
        uploadDate: "2024-01-08",
        expiryDate: "2028-12-31",
        fileSize: "1.2 MB",
        status: "active"
      },
      {
        id: 5,
        name: "Labour_Card.pdf",
        type: "Labour Card",
        uploadDate: "2024-01-05",
        expiryDate: "2027-03-10",
        fileSize: "2.7 MB",
        status: "active"
      }
    ]
  });
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [jobTitles, setJobTitles] = useState([
    { id: 1, title: "Manager", department: "All", description: "Management role" },
    { id: 2, title: "Developer", department: "IT", description: "Software development" },
    { id: 3, title: "Accountant", department: "Finance", description: "Financial management" },
    { id: 4, title: "Sales Rep", department: "Sales", description: "Sales and marketing" }
  ]);
  const [attendancePrograms, setAttendancePrograms] = useState([
    { id: 1, name: "Standard 9-5", hours: "9:00 AM - 5:00 PM", description: "Regular office hours" },
    { id: 2, name: "Flexible Hours", hours: "Flexible", description: "Flexible working hours" },
    { id: 3, name: "Shift Work", hours: "Rotating shifts", description: "24/7 shift rotation" },
    { id: 4, name: "Remote Work", hours: "Remote", description: "Work from home" }
  ]);

  // Mock data for payroll information
  const [payrollData, setPayrollData] = useState({
    1: {
      basicSalary: 5000,
      allowances: {
        housing: 800,
        transport: 300,
        meal: 200,
        other: 150
      },
      deductions: {
        tax: 450,
        insurance: 200,
        pension: 300,
        other: 100
      },
      bonuses: {
        performance: 500,
        attendance: 200,
        other: 0
      },
      monthlyRecords: [
        {
          id: 1,
          month: "January 2024",
          basicSalary: 5000,
          totalAllowances: 1450,
          totalDeductions: 1050,
          totalBonuses: 700,
          netSalary: 6100,
          status: "paid",
          transactionId: "TXN-2024-001",
          paymentDate: "2024-01-31T10:30:00Z",
          payslipGenerated: true
        },
        {
          id: 2,
          month: "December 2023",
          basicSalary: 5000,
          totalAllowances: 1450,
          totalDeductions: 1050,
          totalBonuses: 600,
          netSalary: 6000,
          status: "paid",
          transactionId: "TXN-2023-012",
          paymentDate: "2023-12-31T10:30:00Z",
          payslipGenerated: true
        }
      ]
    },
    2: {
      basicSalary: 4500,
      allowances: {
        housing: 700,
        transport: 250,
        meal: 180,
        other: 120
      },
      deductions: {
        tax: 400,
        insurance: 180,
        pension: 270,
        other: 90
      },
      bonuses: {
        performance: 400,
        attendance: 150,
        other: 0
      },
      monthlyRecords: [
        {
          id: 3,
          month: "January 2024",
          basicSalary: 4500,
          totalAllowances: 1250,
          totalDeductions: 940,
          totalBonuses: 550,
          netSalary: 5360,
          status: "paid",
          transactionId: "TXN-2024-002",
          paymentDate: "2024-01-31T10:30:00Z",
          payslipGenerated: true
        }
      ]
    },
    3: {
      basicSalary: 6000,
      allowances: {
        housing: 1000,
        transport: 400,
        meal: 250,
        other: 200
      },
      deductions: {
        tax: 550,
        insurance: 250,
        pension: 360,
        other: 120
      },
      bonuses: {
        performance: 800,
        attendance: 300,
        other: 0
      },
      monthlyRecords: [
        {
          id: 4,
          month: "January 2024",
          basicSalary: 6000,
          totalAllowances: 1850,
          totalDeductions: 1280,
          totalBonuses: 1100,
          netSalary: 7670,
          status: "pending",
          transactionId: null,
          paymentDate: null,
          payslipGenerated: false
        }
      ]
    },
    4: {
      basicSalary: 3800,
      allowances: {
        housing: 600,
        transport: 200,
        meal: 150,
        other: 100
      },
      deductions: {
        tax: 320,
        insurance: 150,
        pension: 228,
        other: 80
      },
      bonuses: {
        performance: 300,
        attendance: 100,
        other: 0
      },
      monthlyRecords: [
        {
          id: 5,
          month: "January 2024",
          basicSalary: 3800,
          totalAllowances: 1050,
          totalDeductions: 778,
          totalBonuses: 400,
          netSalary: 4472,
          status: "paid",
          transactionId: "TXN-2024-004",
          paymentDate: "2024-01-31T10:30:00Z",
          payslipGenerated: true
        }
      ]
    }
  });

  // Mock data for employee change logs
  const [employeeChangeLogs, setEmployeeChangeLogs] = useState({
    1: [
      {
        id: 1,
        employeeId: 1,
        fieldChanged: "Department",
        oldValue: "IT",
        newValue: "HR",
        changedBy: "Admin User",
        changedAt: "2024-01-15T10:30:00Z",
        changeType: "update"
      },
      {
        id: 2,
        employeeId: 1,
        fieldChanged: "Job Title",
        oldValue: "Developer",
        newValue: "Manager",
        changedBy: "HR Manager",
        changedAt: "2024-01-10T14:20:00Z",
        changeType: "update"
      },
      {
        id: 3,
        employeeId: 1,
        fieldChanged: "Email",
        oldValue: "ahmed.ali@oldcompany.com",
        newValue: "ahmed.ali@email.com",
        changedBy: "System Admin",
        changedAt: "2024-01-05T09:15:00Z",
        changeType: "update"
      }
    ],
    2: [
      {
        id: 4,
        employeeId: 2,
        fieldChanged: "Phone",
        oldValue: "+1234567890",
        newValue: "+1987654321",
        changedBy: "Sara Youssef",
        changedAt: "2024-01-12T16:45:00Z",
        changeType: "update"
      },
      {
        id: 5,
        employeeId: 2,
        fieldChanged: "Status",
        oldValue: "Inactive",
        newValue: "Active",
        changedBy: "HR Manager",
        changedAt: "2024-01-08T11:30:00Z",
        changeType: "update"
      }
    ],
    3: [
      {
        id: 6,
        employeeId: 3,
        fieldChanged: "Department",
        oldValue: "Sales",
        newValue: "IT",
        changedBy: "John Smith",
        changedAt: "2024-01-14T13:20:00Z",
        changeType: "update"
      }
    ],
    4: [
      {
        id: 7,
        employeeId: 4,
        fieldChanged: "Manager",
        oldValue: "None",
        newValue: "Ahmed Ali",
        changedBy: "HR Manager",
        changedAt: "2024-01-13T15:10:00Z",
        changeType: "update"
      }
    ]
  });
  const navigate = useNavigate();

  const handleEmployeeClick = (employee) => {
    // Open the employee view modal when employee is clicked
    handleViewEmployee(employee);
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployeeForView(employee);
    setShowViewModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployeeForEdit(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = async (employee) => {
    const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.name || 'this employee';
    
    if (window.confirm(`Are you sure you want to delete ${employeeName}? This will deactivate their account.`)) {
      try {
        const response = await deleteEmployee(employee.id);
        
        if (response.success) {
          alert(`Employee ${employeeName} has been deactivated successfully.`);
          
          // Refresh employees and statistics
          const employeesResponse = await getEmployees();
          if (employeesResponse.success && employeesResponse.data) {
            const transformedEmployees = employeesResponse.data.map(emp => ({
              id: emp.id,
              name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
              firstName: emp.firstName,
              lastName: emp.lastName,
              department: emp.department || 'N/A',
              email: emp.email || emp.emailAddresses ? (Array.isArray(emp.emailAddresses) ? emp.emailAddresses[0] : JSON.parse(emp.emailAddresses || '[]')[0] || emp.email) : 'No email',
              jobTitle: emp.jobTitle || 'N/A',
              employeeType: emp.employeeType || 'N/A',
              status: emp.status || (emp.isActive ? 'Active' : 'Inactive'),
              isActive: emp.isActive,
              ...emp
            }));
            setEmployees(transformedEmployees);
          }
          
          // Refresh statistics
          const statsResponse = await getEmployeeStatistics();
          if (statsResponse.success && statsResponse.data) {
            setStatistics(statsResponse.data);
          }
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert(`Failed to delete employee: ${error.message}`);
      }
    }
  };

  const handleRestoreEmployee = async (employee) => {
    const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.name || 'this employee';
    
    if (window.confirm(`Are you sure you want to restore ${employeeName}? This will reactivate their account.`)) {
      try {
        const response = await restoreEmployee(employee.id);
        
        if (response.success) {
          alert(`Employee ${employeeName} has been restored successfully.`);
          
          // Refresh employees and statistics
          const employeesResponse = await getEmployees();
          if (employeesResponse.success && employeesResponse.data) {
            const transformedEmployees = employeesResponse.data.map(emp => ({
              id: emp.id,
              name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
              firstName: emp.firstName,
              lastName: emp.lastName,
              department: emp.department || 'N/A',
              email: emp.email || emp.emailAddresses ? (Array.isArray(emp.emailAddresses) ? emp.emailAddresses[0] : JSON.parse(emp.emailAddresses || '[]')[0] || emp.email) : 'No email',
              jobTitle: emp.jobTitle || 'N/A',
              employeeType: emp.employeeType || 'N/A',
              status: emp.status || (emp.isActive ? 'Active' : 'Inactive'),
              isActive: emp.isActive,
              ...emp
            }));
            setEmployees(transformedEmployees);
          }
          
          // Refresh statistics
          const statsResponse = await getEmployeeStatistics();
          if (statsResponse.success && statsResponse.data) {
            setStatistics(statsResponse.data);
          }
        }
      } catch (error) {
        console.error('Error restoring employee:', error);
        alert(`Failed to restore employee: ${error.message}`);
      }
    }
  };

  const handleUpdateEmployee = async () => {
    if (selectedEmployeeForEdit) {
      try {
        // Update employee via API
        const response = await updateEmployee(selectedEmployeeForEdit.id, selectedEmployeeForEdit);
        
        if (response.success) {
          // Refresh employees and statistics
          const employeesResponse = await getEmployees();
          if (employeesResponse.success && employeesResponse.data) {
            const transformedEmployees = employeesResponse.data.map(emp => ({
              id: emp.id,
              name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
              department: emp.department || 'N/A',
              email: emp.email || emp.emailAddresses ? (Array.isArray(emp.emailAddresses) ? emp.emailAddresses[0] : JSON.parse(emp.emailAddresses || '[]')[0] || emp.email) : 'No email',
              jobTitle: emp.jobTitle || 'N/A',
              employeeType: emp.employeeType || 'N/A',
              status: emp.status || (emp.isActive ? 'Active' : 'Inactive'),
              phone: emp.phone || (emp.phoneNumbers ? (Array.isArray(emp.phoneNumbers) ? emp.phoneNumbers[0]?.value : JSON.parse(emp.phoneNumbers || '[]')[0]?.value) : 'No phone'),
              manager: emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : 'N/A',
              joiningDate: emp.joiningDate || null,
              ...emp
            }));
            setEmployees(transformedEmployees);
          }

          // Refresh statistics
          const statsResponse = await getEmployeeStatistics();
          if (statsResponse.success && statsResponse.data) {
            setStatistics(statsResponse.data);
          }

          setShowEditModal(false);
          setSelectedEmployeeForEdit(null);
          alert('Employee updated successfully!');
        } else {
          alert(`Failed to update employee: ${response.message}`);
        }
      } catch (error) {
        console.error('Error updating employee:', error);
        alert(`Error updating employee: ${error.message}`);
      }
    }
  };

  const handleEditFieldChange = (field, value) => {
    setSelectedEmployeeForEdit(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBackToPositions = () => {
    // Navigate back to the positions page
    navigate(-1);
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      // Create employee via API
      const response = await createEmployee(employeeData);
      
      if (response.success) {
        // Refresh employees and statistics
        const employeesResponse = await getEmployees();
        if (employeesResponse.success && employeesResponse.data) {
          const transformedEmployees = employeesResponse.data.map(emp => ({
            id: emp.id,
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            department: emp.department || 'N/A',
            email: emp.email || emp.emailAddresses ? (Array.isArray(emp.emailAddresses) ? emp.emailAddresses[0] : JSON.parse(emp.emailAddresses || '[]')[0] || emp.email) : 'No email',
            jobTitle: emp.jobTitle || 'N/A',
            employeeType: emp.employeeType || 'N/A',
            status: emp.status || (emp.isActive ? 'Active' : 'Inactive'),
            phone: emp.phone || (emp.phoneNumbers ? (Array.isArray(emp.phoneNumbers) ? emp.phoneNumbers[0]?.value : JSON.parse(emp.phoneNumbers || '[]')[0]?.value) : 'No phone'),
            manager: emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : 'N/A',
            joiningDate: emp.joiningDate || null,
            ...emp
          }));
          setEmployees(transformedEmployees);
        }

        // Refresh statistics
        const statsResponse = await getEmployeeStatistics();
        if (statsResponse.success && statsResponse.data) {
          setStatistics(statsResponse.data);
        }

        setShowForm(false);
        if (response.data?.credentials?.temporaryPassword) {
          alert(`Employee created successfully!\n\nERP Login credentials (save these - they will not be shown again):\nEmail: ${response.data.credentials.email}\nTemporary password: ${response.data.credentials.temporaryPassword}\n\n${response.data.credentials.message || 'User should change password on first login.'}`);
        } else {
          alert('Employee created successfully!');
        }
      } else {
        alert(`Failed to create employee: ${response.message}`);
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      alert(`Error creating employee: ${error.message}`);
    }
  };

  const handleAddJobTitle = (newJobTitle) => {
    // Check for duplicates (case-insensitive)
    const titleLower = newJobTitle.title?.toLowerCase().trim();
    const isDuplicate = jobTitles.some(job => 
      (job.title || job.name || '').toLowerCase().trim() === titleLower
    );
    
    if (isDuplicate) {
      alert(`Job title "${newJobTitle.title}" already exists. Please use a different title.`);
      return;
    }
    
    if (!titleLower) {
      alert('Please enter a job title.');
      return;
    }
    
    const jobTitle = {
      id: jobTitles.length + 1,
      title: newJobTitle.title.trim(),
      department: newJobTitle.department?.trim() || 'All',
      description: newJobTitle.description?.trim() || ''
    };
    
    setJobTitles(prev => [...prev, jobTitle]);
    alert(`Job title "${jobTitle.title}" has been added successfully!`);
  };

  const handleAddAttendanceProgram = (newProgram) => {
    const program = {
      id: attendancePrograms.length + 1,
      name: newProgram.name,
      hours: newProgram.hours,
      description: newProgram.description
    };
    setAttendancePrograms(prev => [...prev, program]);
  };

  const handleRuleButton = (employee) => {
    navigate(`/employees/rule-builder?empId=${employee.id}`);
  };

  // Document handling functions
  const handleUploadDocument = (employeeId, documentData) => {
    const newDocument = {
      id: Date.now(),
      name: documentData.name,
      type: documentData.type,
      uploadDate: new Date().toLocaleDateString(),
      expiryDate: documentData.expiryDate,
      fileSize: documentData.fileSize,
      status: 'active'
    };

    setEmployeeDocuments(prev => ({
      ...prev,
      [employeeId]: [...(prev[employeeId] || []), newDocument]
    }));

    setShowDocumentUpload(false);
    setSelectedDocumentType('');
    
    // Show success message
    alert(`Document "${documentData.name}" uploaded successfully!`);
  };

  const handleDeleteDocument = (employeeId, documentId) => {
    const document = employeeDocuments[employeeId]?.find(doc => doc.id === documentId);
    if (document && window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      setEmployeeDocuments(prev => ({
        ...prev,
        [employeeId]: prev[employeeId]?.filter(doc => doc.id !== documentId) || []
      }));
      alert(`Document "${document.name}" deleted successfully!`);
    }
  };

  const handleViewDocument = (document) => {
    // In a real application, this would open the document in a viewer
    console.log('Viewing document:', document);
    alert(`Viewing document: ${document.name}`);
  };

  const handleDownloadDocument = (document) => {
    // In a real application, this would trigger a download
    console.log('Downloading document:', document);
    alert(`Downloading document: ${document.name}`);
  };

  const handleExportEmployees = () => {
    // Create CSV content from employees data
    const headers = ['ID', 'Name', 'Department', 'Job Title', 'Email', 'Phone', 'Status', 'Manager', 'Joining Date'];
    const csvContent = [
      headers.join(','),
      ...employees.map(emp => [
        emp.id,
        emp.name,
        emp.department,
        emp.jobTitle,
        emp.email,
        emp.phone,
        emp.status,
        emp.manager || '',
        emp.joiningDate || ''
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleImportEmployees = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const importedEmployees = lines.slice(1).filter(line => line.trim()).map((line, index) => {
        const values = line.split(',');
        return {
          id: employees.length + index + 1,
          name: values[1] || '',
          department: values[2] || '',
          email: values[4] || '',
          jobTitle: values[3] || '',
          phone: values[5] || '',
          status: values[6] || 'Active',
          manager: values[7] || '',
          joiningDate: values[8] || ''
        };
      });

      setEmployees(prev => [...prev, ...importedEmployees]);
      setShowImportExportModal(false);
    };
    reader.readAsText(file);
  };

  const handleHistoryButton = (employee) => {
    setSelectedEmployeeForHistory(employee);
    setShowHistoryDrawer(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePayrollButton = (employee) => {
    setSelectedEmployeeForPayroll(employee);
    setShowPayrollDrawer(true);
  };

  const calculateNetSalary = (basicSalary, allowances, deductions, bonuses) => {
    const totalAllowances = Object.values(allowances).reduce((sum, value) => sum + value, 0);
    const totalDeductions = Object.values(deductions).reduce((sum, value) => sum + value, 0);
    const totalBonuses = Object.values(bonuses).reduce((sum, value) => sum + value, 0);
    return basicSalary + totalAllowances - totalDeductions + totalBonuses;
  };

  const handleUpdatePayroll = (employeeId, field, value) => {
    setPayrollData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value
      }
    }));
  };

  const handleUpdateAllowance = (employeeId, allowanceType, value) => {
    setPayrollData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        allowances: {
          ...prev[employeeId].allowances,
          [allowanceType]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleUpdateDeduction = (employeeId, deductionType, value) => {
    setPayrollData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        deductions: {
          ...prev[employeeId].deductions,
          [deductionType]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleUpdateBonus = (employeeId, bonusType, value) => {
    setPayrollData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        bonuses: {
          ...prev[employeeId].bonuses,
          [bonusType]: parseFloat(value) || 0
        }
      }
    }));
  };

  const generatePayslip = (employee, payrollRecord) => {
    // Mock payslip generation
    const payslipContent = `
      PAYSLIP - ${payrollRecord.month}
      
      Employee: ${employee.name}
      Employee ID: ${employee.id}
      Department: ${employee.department}
      Job Title: ${employee.jobTitle}
      
      EARNINGS:
      Basic Salary: $${payrollRecord.basicSalary}
      Allowances: $${payrollRecord.totalAllowances}
      Bonuses: $${payrollRecord.totalBonuses}
      Total Earnings: $${payrollRecord.basicSalary + payrollRecord.totalAllowances + payrollRecord.totalBonuses}
      
      DEDUCTIONS:
      Total Deductions: $${payrollRecord.totalDeductions}
      
      NET SALARY: $${payrollRecord.netSalary}
      
      Payment Status: ${payrollRecord.status.toUpperCase()}
      Transaction ID: ${payrollRecord.transactionId || 'Pending'}
      Payment Date: ${payrollRecord.paymentDate ? formatDate(payrollRecord.paymentDate) : 'Pending'}
    `;

    const blob = new Blob([payslipContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${employee.name}_${payrollRecord.month.replace(' ', '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Mock user role for access control
  const currentUserRole = "admin"; // Can be "admin", "hr", "employee"
  const canEditPayroll = currentUserRole === "admin" || currentUserRole === "hr";
  return (
    <div className="w-full h-full flex flex-col">
      {!showForm && <Breadcrumbs 
        names={{ 
          company: company?.name || null,
          department: department?.name || null,
          subdepartment: subDepartment?.name || null,
          position: position?.name || null
        }} 
        company={company}
      />}
      
      {/* Enhanced Top Section - Employee Directory */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 px-4 sm:px-6 lg:px-10 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToPositions}
            className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm"
            title="Back to Positions"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-500" /> 
            Employee Directory
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => setShowJobTitlesModal(true)}
          >
            <BriefcaseIcon className="h-5 w-5" />
            Job Titles
          </button>
          <button
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => setShowImportExportModal(true)}
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Import/Export
          </button>
          <button
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => setShowAttendanceProgramModal(true)}
          >
            <CalendarIcon className="h-5 w-5" />
            Attendance Program
          </button>
          <button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => setShowForm(true)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Employee
          </button>
        </div>
      </div>
      
      {/* Enhanced Section Header - Employees Management - Only show when not in form */}
      {!showForm && (
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className={`rounded-3xl shadow-2xl p-8 relative overflow-hidden mb-8 transition-all duration-300 ${
            showJobTitlesModal || showAttendanceProgramModal 
              ? 'bg-transparent' 
              : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600'
          }`}>
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white opacity-10 rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <UsersIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-indigo-100 text-lg">View and manage all employees in your organization</p>
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white bg-opacity-30 rounded-xl">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {loading ? '...' : (searchTerm ? filteredEmployees.length : statistics.totalEmployees)}
                      </div>
                      <div className="text-indigo-100 text-sm">
                        {searchTerm ? 'Filtered Employees' : 'Total Employees'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white bg-opacity-30 rounded-xl">
                      <BriefcaseIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {loading ? '...' : statistics.totalDepartments}
                      </div>
                      <div className="text-indigo-100 text-sm">Departments</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white bg-opacity-30 rounded-xl">
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {loading ? '...' : (searchTerm ? filteredEmployees.filter(emp => (emp.status || '').toLowerCase() === 'active').length : statistics.activeEmployees)}
                      </div>
                      <div className="text-indigo-100 text-sm">
                        {searchTerm ? 'Filtered Active' : 'Active Employees'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search Bar */}
      {!showForm && (
        <div className="w-full px-4 sm:px-6 lg:px-10 mb-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search employees by name, department, job title, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">
                  {filteredEmployees.length} of {employees.length} employees
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                )}
              </div>
            </div>
            {searchTerm && (
              <div className="mt-3 text-sm text-indigo-600">
                Searching for: <span className="font-semibold">"{searchTerm}"</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-indigo-50 to-white min-h-[60vh] px-4 sm:px-6 lg:px-10">
        {!showForm ? (
          <div className="w-full mt-4 sm:mt-8">
            {/* Enhanced Mobile Cards View */}
            <div className="lg:hidden space-y-6">
              {filteredEmployees.map(emp => {
                const isInactive = !emp.isActive;
                return (
                <div 
                  key={emp.id} 
                  className={`group bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-indigo-300 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden ${isInactive ? 'opacity-40' : ''}`}
                  onClick={() => handleEmployeeClick(emp)}
                  title="Click to view employee details"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative p-6">
                    {/* Header with enhanced styling */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                        <UserIcon className="h-6 w-6 text-white" />
                  </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-900 transition-colors">{emp.name}</h3>
                        </div>
                        <p className="text-gray-500 text-sm">Employee</p>
                    </div>
                    </div>
                    
                    {/* Enhanced info sections */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <BriefcaseIcon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Department</span>
                          <div className="text-gray-900 font-semibold">{emp.department}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <ClipboardDocumentListIcon className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Job Title</span>
                          <div className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm">
                        {emp.jobTitle}
                    </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-indigo-50 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-indigo-100 rounded-lg flex items-center justify-center">
                          <EnvelopeIcon className="h-4 w-4 text-pink-600" />
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Email</span>
                          <div className="text-gray-900 font-semibold text-sm">{emp.email}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEmployee(emp);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Employee"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEmployee(emp);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit Employee"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {!emp.isActive ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreEmployee(emp);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Restore Employee"
                          >
                            <ArrowPathIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmployee(emp);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Employee"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )})}
              
              {/* No Results Message for Mobile */}
              {searchTerm && filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
                    <p className="text-gray-500 mb-4">No employees match your search for "{searchTerm}"</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Enhanced Desktop Table View */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                      <tr>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Employee</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Department</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Job Title</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Contact</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                  {filteredEmployees.map(emp => {
                    const isInactive = !emp.isActive;
                    return (
                    <tr 
                      key={emp.id} 
                          className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer group ${isInactive ? 'opacity-40' : ''}`}
                      onClick={() => handleEmployeeClick(emp)}
                      title="Click to view employee details"
                    >
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                                <UserIcon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-gray-900 text-base group-hover:text-indigo-900 transition-colors">{emp.name}</div>
                                </div>
                                <div className="text-gray-500 text-sm">Employee</div>
                              </div>
                            </div>
                      </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm">
                                <BriefcaseIcon className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <span className="text-gray-900 text-sm font-semibold">{emp.department}</span>
                                <div className="text-gray-500 text-xs">Department</div>
                              </div>
                            </div>
                      </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-sm">
                                <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm">
                                  {emp.jobTitle}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm">
                                <EnvelopeIcon className="h-5 w-5 text-pink-600" />
                              </div>
                              <div>
                                <span className="text-gray-900 text-sm font-semibold">{emp.email}</span>
                                <div className="text-gray-500 text-xs">Email</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewEmployee(emp);
                                }}
                                className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                title="View Employee"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEmployee(emp);
                                }}
                                className="p-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                title="Edit Employee"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRuleButton(emp);
                                }}
                                className="p-3 text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                title="Rule Settings"
                              >
                                <Cog6ToothIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleHistoryButton(emp);
                                }}
                                className="p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                title="View History"
                              >
                                <ClockIcon className="h-5 w-5" />
                              </button>
                              {!emp.isActive ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestoreEmployee(emp);
                                  }}
                                  className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                  title="Restore Employee"
                                >
                                  <ArrowPathIcon className="h-5 w-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEmployee(emp);
                                  }}
                                  className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                  title="Delete Employee"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePayrollButton(emp);
                                }}
                                className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                title="Payroll Management"
                              >
                                <CurrencyDollarIcon className="h-5 w-5" />
                              </button>
                            </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
              
              {/* No Results Message for Desktop */}
              {searchTerm && filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-white border-t border-gray-100 p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
                    <p className="text-gray-500 mb-4">No employees match your search for "{searchTerm}"</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmployeeForm 
            onBack={() => setShowForm(false)} 
            onSaveEmployee={handleSaveEmployee}
            jobTitles={jobTitles}
            attendancePrograms={attendancePrograms}
            employeesList={employees}
          />
        )}
      </div>

      {/* Job Titles Modal */}
      {showJobTitlesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <div className="flex items-center gap-3">
                <BriefcaseIcon className="h-8 w-8" />
                <div>
                  <h3 className="text-xl font-bold">Job Titles Management</h3>
                  <p className="text-blue-100">Create and manage job titles</p>
                </div>
              </div>
              <button
                onClick={() => setShowJobTitlesModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Add New Job Title Form */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Add New Job Title</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Job Title"
                    className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="newJobTitle"
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="newJobDepartment"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="newJobDescription"
                  />
                </div>
                <button
                  onClick={() => {
                    const title = document.getElementById('newJobTitle').value;
                    const department = document.getElementById('newJobDepartment').value;
                    const description = document.getElementById('newJobDescription').value;
                    if (title && department) {
                      handleAddJobTitle({ title, department, description });
                      document.getElementById('newJobTitle').value = '';
                      document.getElementById('newJobDepartment').value = '';
                      document.getElementById('newJobDescription').value = '';
                    }
                  }}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Job Title
                </button>
              </div>

              {/* Job Titles List */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Current Job Titles</h4>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {jobTitles.map(job => (
                    <div key={job.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-900">{job.title}</h5>
                          <p className="text-sm text-gray-600">Department: {job.department}</p>
                          <p className="text-sm text-gray-500">{job.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            ID: {job.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Program Modal */}
      {showAttendanceProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-8 w-8" />
                <div>
                  <h3 className="text-xl font-bold">Attendance Program Management</h3>
                  <p className="text-green-100">Create and manage attendance programs</p>
                </div>
              </div>
              <button
                onClick={() => setShowAttendanceProgramModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Add New Attendance Program Form */}
              <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-4">Add New Attendance Program</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Program Name"
                    className="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    id="newProgramName"
                  />
                  <input
                    type="text"
                    placeholder="Working Hours"
                    className="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    id="newProgramHours"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    id="newProgramDescription"
                  />
                </div>
                <button
                  onClick={() => {
                    const name = document.getElementById('newProgramName').value;
                    const hours = document.getElementById('newProgramHours').value;
                    const description = document.getElementById('newProgramDescription').value;
                    if (name && hours) {
                      handleAddAttendanceProgram({ name, hours, description });
                      document.getElementById('newProgramName').value = '';
                      document.getElementById('newProgramHours').value = '';
                      document.getElementById('newProgramDescription').value = '';
                    }
                  }}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Program
                </button>
              </div>

              {/* Attendance Programs List */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Current Attendance Programs</h4>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {attendancePrograms.map(program => (
                    <div key={program.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-900">{program.name}</h5>
                          <p className="text-sm text-gray-600">Hours: {program.hours}</p>
                          <p className="text-sm text-gray-500">{program.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            ID: {program.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {showImportExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <div className="flex items-center gap-3">
                <ArrowDownTrayIcon className="h-8 w-8" />
                <div>
                  <h3 className="text-xl font-bold">Import/Export Employees</h3>
                  <p className="text-orange-100">Import or export employee data via CSV</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportExportModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Export Section */}
              <div className="mb-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <ArrowDownTrayIcon className="h-6 w-6 text-orange-600" />
                  <h4 className="text-lg font-semibold text-orange-900">Export Employees</h4>
                </div>
                <p className="text-orange-700 mb-4">
                  Download all current employee data as a CSV file. The file will include: ID, Name, Department, Job Title, Email, Phone, Status, Manager, and Joining Date.
                </p>
                <button
                  onClick={handleExportEmployees}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Export to CSV
                </button>
              </div>

              {/* Import Section */}
              <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <ArrowUpTrayIcon className="h-6 w-6 text-red-600" />
                  <h4 className="text-lg font-semibold text-red-900">Import Employees</h4>
                </div>
                <p className="text-red-700 mb-4">
                  Upload a CSV file to import new employees. The file should have columns: Name, Department, Job Title, Email, Phone, Status, Manager, Joining Date.
                </p>
                <div className="mb-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportEmployees}
                    className="block w-full text-sm text-red-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 file:cursor-pointer"
                  />
                </div>
                <div className="text-xs text-red-600">
                  <p><strong>Note:</strong> Imported employees will be added to the existing list. Make sure your CSV file follows the correct format.</p>
                </div>
              </div>

              {/* Sample CSV Format */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-2">Sample CSV Format:</h5>
                <div className="text-xs text-gray-600 font-mono bg-white p-2 rounded border">
                  Name,Department,Job Title,Email,Phone,Status,Manager,Joining Date<br/>
                  John Doe,IT,Developer,john.doe@company.com,+1234567890,Active,Manager Name,2023-01-15
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {showHistoryDrawer && selectedEmployeeForHistory && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300"
            onClick={() => setShowHistoryDrawer(false)}
          ></div>
          
          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-gradient-to-b from-white to-gray-50 shadow-2xl transform transition-all duration-500 ease-out">
            <div className="flex flex-col h-full">
              {/* Enhanced Header */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative flex items-center justify-between p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                      <ClockIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Employee History</h3>
                      <p className="text-indigo-100 text-sm font-medium">{selectedEmployeeForHistory.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistoryDrawer(false)}
                    className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Enhanced Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Employee Profile Card */}
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                        <UserIcon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-1">{selectedEmployeeForHistory.name}</h4>
                        <p className="text-gray-600 mb-2">{selectedEmployeeForHistory.jobTitle} • {selectedEmployeeForHistory.department}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-indigo-600">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            Active Employee
                          </span>
                          <span className="text-gray-500">ID: {selectedEmployeeForHistory.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Change Logs */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h5 className="text-lg font-bold text-gray-900">Change History</h5>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
                  </div>
                  
                  {employeeChangeLogs[selectedEmployeeForHistory.id] && employeeChangeLogs[selectedEmployeeForHistory.id].length > 0 ? (
                    <div className="space-y-4">
                      {employeeChangeLogs[selectedEmployeeForHistory.id].map((log, index) => (
                        <div key={log.id} className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          {/* Timeline indicator */}
                          <div className="relative">
                            <div className="absolute left-0 top-0 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"></div>
                            <div className="absolute left-1.5 top-3 w-0.5 h-full bg-gradient-to-b from-purple-500 to-transparent"></div>
                          </div>
                          
                          <div className="ml-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
                                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="font-bold text-gray-900 text-lg">{log.fieldChanged}</span>
                                  <p className="text-sm text-gray-500">Field Updated</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{formatDate(log.changedAt)}</span>
                              </div>
                            </div>
                            
                            {/* Change Details */}
                            <div className="grid grid-cols-1 gap-3 mb-4">
                              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-700">Previous:</span>
                                <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">{log.oldValue}</span>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-700">Updated to:</span>
                                <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">{log.newValue}</span>
                              </div>
                            </div>
                            
                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">{log.changedBy.charAt(0)}</span>
                                </div>
                                <span className="text-sm text-gray-600">Changed by <span className="font-semibold text-gray-900">{log.changedBy}</span></span>
                              </div>
                              <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                                {log.changeType}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl inline-block mb-4">
                        <ClockIcon className="h-16 w-16 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">No Changes Yet</h4>
                      <p className="text-gray-500">This employee's record hasn't been modified yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Footer */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <span className="text-gray-600">Employee ID: <span className="font-semibold text-gray-900">{selectedEmployeeForHistory.id}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Total Changes:</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full font-bold">
                        {employeeChangeLogs[selectedEmployeeForHistory.id]?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Drawer */}
      {showPayrollDrawer && selectedEmployeeForPayroll && payrollData[selectedEmployeeForPayroll.id] && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300"
            onClick={() => setShowPayrollDrawer(false)}
          ></div>
          
          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-gradient-to-b from-white to-gray-50 shadow-2xl transform transition-all duration-500 ease-out">
            <div className="flex flex-col h-full">
              {/* Enhanced Header */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"></div>
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative flex items-center justify-between p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                      <CurrencyDollarIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Payroll Management</h3>
                      <p className="text-green-100 text-sm font-medium">{selectedEmployeeForPayroll.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPayrollDrawer(false)}
                    className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  </div>
                </div>

            {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Employee Info Card */}
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                        <UserIcon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-1">{selectedEmployeeForPayroll.name}</h4>
                        <p className="text-gray-600 mb-2">{selectedEmployeeForPayroll.jobTitle} • {selectedEmployeeForPayroll.department}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Active Employee
                          </span>
                          <span className="text-gray-500">ID: {selectedEmployeeForPayroll.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payroll Configuration */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Basic Salary */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <BanknotesIcon className="h-5 w-5 text-white" />
                      </div>
                      <h5 className="text-lg font-bold text-gray-900">Basic Salary</h5>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Basic Salary</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={payrollData[selectedEmployeeForPayroll.id].basicSalary}
                            onChange={(e) => handleUpdatePayroll(selectedEmployeeForPayroll.id, 'basicSalary', parseFloat(e.target.value) || 0)}
                            disabled={!canEditPayroll}
                            className={`w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${!canEditPayroll ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Salary Calculator */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <CalculatorIcon className="h-5 w-5 text-white" />
                      </div>
                      <h5 className="text-lg font-bold text-gray-900">Net Salary Calculator</h5>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Basic Salary:</span>
                        <span className="font-semibold">${payrollData[selectedEmployeeForPayroll.id].basicSalary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Allowances:</span>
                        <span className="font-semibold text-green-600">+${Object.values(payrollData[selectedEmployeeForPayroll.id].allowances).reduce((sum, value) => sum + value, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Deductions:</span>
                        <span className="font-semibold text-red-600">-${Object.values(payrollData[selectedEmployeeForPayroll.id].deductions).reduce((sum, value) => sum + value, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Bonuses:</span>
                        <span className="font-semibold text-blue-600">+${Object.values(payrollData[selectedEmployeeForPayroll.id].bonuses).reduce((sum, value) => sum + value, 0)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-bold text-gray-900">Net Salary:</span>
                          <span className="text-xl font-bold text-green-600">
                            ${calculateNetSalary(
                              payrollData[selectedEmployeeForPayroll.id].basicSalary,
                              payrollData[selectedEmployeeForPayroll.id].allowances,
                              payrollData[selectedEmployeeForPayroll.id].deductions,
                              payrollData[selectedEmployeeForPayroll.id].bonuses
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allowances, Deductions, and Bonuses */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Allowances */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <h5 className="text-lg font-bold text-gray-900">Allowances</h5>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(payrollData[selectedEmployeeForPayroll.id].allowances).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => handleUpdateAllowance(selectedEmployeeForPayroll.id, key, e.target.value)}
                              disabled={!canEditPayroll}
                              className={`w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${!canEditPayroll ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                      </div>
                      <h5 className="text-lg font-bold text-gray-900">Deductions</h5>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(payrollData[selectedEmployeeForPayroll.id].deductions).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => handleUpdateDeduction(selectedEmployeeForPayroll.id, key, e.target.value)}
                              disabled={!canEditPayroll}
                              className={`w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${!canEditPayroll ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bonuses */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <h5 className="text-lg font-bold text-gray-900">Bonuses</h5>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(payrollData[selectedEmployeeForPayroll.id].bonuses).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => handleUpdateBonus(selectedEmployeeForPayroll.id, key, e.target.value)}
                              disabled={!canEditPayroll}
                              className={`w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!canEditPayroll ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Monthly Payroll Records */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-white" />
                    </div>
                    <h5 className="text-lg font-bold text-gray-900">Monthly Payroll Records</h5>
                  </div>
                  
                  <div className="space-y-4">
                    {payrollData[selectedEmployeeForPayroll.id].monthlyRecords.map((record) => (
                      <div key={record.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h6 className="font-semibold text-gray-900">{record.month}</h6>
                            <p className="text-sm text-gray-600">Net Salary: ${record.netSalary}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              record.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.status.toUpperCase()}
                            </span>
                            {record.payslipGenerated && (
                              <button
                                onClick={() => generatePayslip(selectedEmployeeForPayroll, record)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Download Payslip"
                              >
                                <DocumentTextIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Basic:</span>
                            <span className="ml-2 font-medium">${record.basicSalary}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Allowances:</span>
                            <span className="ml-2 font-medium text-green-600">+${record.totalAllowances}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Deductions:</span>
                            <span className="ml-2 font-medium text-red-600">-${record.totalDeductions}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Bonuses:</span>
                            <span className="ml-2 font-medium text-blue-600">+${record.totalBonuses}</span>
                          </div>
                        </div>
                        
                        {record.transactionId && (
                          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                            <div className="flex items-center justify-between">
                              <span>Transaction ID: <span className="font-medium">{record.transactionId}</span></span>
                              <span>Paid: {formatDate(record.paymentDate)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                      <span className="text-gray-600">Access Level: <span className="font-semibold text-gray-900 capitalize">{currentUserRole}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Can Edit:</span>
                      <span className={`px-3 py-1 rounded-full font-bold ${canEditPayroll ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {canEditPayroll ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && selectedEmployeeForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="relative flex items-center justify-between p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                    <UserIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Employee Details</h3>
                    <p className="text-indigo-100 text-sm font-medium">{selectedEmployeeForView.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              {/* Employee Profile Header */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                      <UserIcon className="h-12 w-12 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedEmployeeForView.name}</h4>
                      <p className="text-gray-600 mb-3 text-lg">{selectedEmployeeForView.jobTitle} • {selectedEmployeeForView.department}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-2 text-indigo-600 font-semibold">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                          Active Employee
                        </span>
                        <span className="text-gray-500 font-medium">ID: {selectedEmployeeForView.id}</span>
                        <span className="text-gray-500 font-medium">Status: {selectedEmployeeForView.status || 'Active'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          handleEditEmployee(selectedEmployeeForView);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                      >
                        EDIT
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Sections */}
              <div className="space-y-6">
                {/* Contacts Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenLegalSection(openLegalSection === 'contacts' ? '' : 'contacts')}
                    className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <h5 className="text-lg font-bold text-gray-900">Contacts</h5>
                    </div>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openLegalSection === 'contacts' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openLegalSection === 'contacts' && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                          <p className="text-gray-900 font-medium">Not provided</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Alternative Phone</label>
                          <p className="text-gray-900 font-medium">Not provided</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Company Details Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenLegalSection(openLegalSection === 'company' ? '' : 'company')}
                    className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h5 className="text-lg font-bold text-gray-900">Company Details</h5>
                    </div>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openLegalSection === 'company' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openLegalSection === 'company' && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.id}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.jobTitle}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.department}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Employee Type</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.employeeType || 'Full-time'}</p>
                        </div>
                        {selectedEmployeeForView.jobTitle !== "Manager" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
                            <p className="text-gray-900 font-medium">{selectedEmployeeForView.manager || 'Not assigned'}</p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.joiningDate || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company Location</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.companyLocation || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            selectedEmployeeForView.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedEmployeeForView.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Passport Details Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenLegalSection(openLegalSection === 'passport' ? '' : 'passport')}
                    className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h5 className="text-lg font-bold text-gray-900">Passport Details</h5>
                    </div>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openLegalSection === 'passport' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openLegalSection === 'passport' && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.passportNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.passportIssue || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.passportExpiry || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.nationality || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Documents Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenLegalSection(openLegalSection === 'documents' ? '' : 'documents')}
                    className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h5 className="text-lg font-bold text-gray-900">Documents</h5>
                    </div>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openLegalSection === 'documents' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openLegalSection === 'documents' && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="space-y-6">
                        {/* Document Upload Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h6 className="text-lg font-semibold text-gray-900">Upload New Document</h6>
                              <p className="text-sm text-blue-600 font-medium">Employee ID: {selectedEmployeeForView?.id}</p>
                            </div>
                            <button
                              onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                              {showDocumentUpload ? 'Cancel' : 'Add Document'}
                            </button>
                          </div>
                          
                          {showDocumentUpload && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                                  <select
                                    value={selectedDocumentType}
                                    onChange={(e) => setSelectedDocumentType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="">Select document type</option>
                                    <option value="passport">Passport</option>
                                    <option value="visa">Visa</option>
                                    <option value="labour_card">Labour Card</option>
                                    <option value="contract">Employment Contract</option>
                                    <option value="id_card">ID Card</option>
                                    <option value="certificate">Certificate</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (if applicable)</label>
                                  <input
                                    id="expiry-date"
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                                <div 
                                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                                  onClick={() => document.getElementById('file-upload').click()}
                                >
                                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                                  <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                                  <input 
                                    id="file-upload"
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        const documentData = {
                                          name: file.name,
                                          type: selectedDocumentType,
                                          expiryDate: document.getElementById('expiry-date').value,
                                          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                        };
                                        handleUploadDocument(selectedEmployeeForView.id, documentData);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                  Upload Document
                                </button>
                                <button 
                                  onClick={() => setShowDocumentUpload(false)}
                                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Documents List */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold text-gray-900">Uploaded Documents</h6>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">ID: {selectedEmployeeForView?.id}</span>
                          </div>
                          <div className="space-y-3">
                            {employeeDocuments[selectedEmployeeForView?.id]?.length > 0 ? (
                              employeeDocuments[selectedEmployeeForView?.id]?.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                                                         <div>
                                       <p className="font-medium text-gray-900">{doc.name}</p>
                                       <p className="text-sm text-gray-500">{doc.type} • {doc.uploadDate} • {doc.fileSize}</p>
                                       {doc.expiryDate && (
                                         <p className={`text-xs ${new Date(doc.expiryDate) < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                                           Expires: {doc.expiryDate}
                                         </p>
                                       )}
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => handleViewDocument(doc)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="View Document"
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>
                                    <button 
                                      onClick={() => handleDownloadDocument(doc)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Download Document"
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteDocument(selectedEmployeeForView.id, doc.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete Document"
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <p className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</p>
                                  <p className="mt-1 text-sm text-gray-500">Upload employee documents to get started</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Personal Details Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenLegalSection(openLegalSection === 'personal' ? '' : 'personal')}
                    className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h5 className="text-lg font-bold text-gray-900">Personal Details</h5>
                    </div>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openLegalSection === 'personal' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openLegalSection === 'personal' && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.gender || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.birthday || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.maritalStatus || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.nationality || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Children Count</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.childrenCount || 'Not specified'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.currentAddress || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Residency Details Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenLegalSection(openLegalSection === 'residency' ? '' : 'residency')}
                    className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <h5 className="text-lg font-bold text-gray-900">Residency Details</h5>
                    </div>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openLegalSection === 'residency' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openLegalSection === 'residency' && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Residency Number</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.residencyNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Residency Expiry</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.residencyExpiry || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Visa Number</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.visa || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Labour Card Number</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.labourNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Labour Card Expiry</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.labourExpiry || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Number</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.insuranceNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Quick Actions
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handlePayrollButton(selectedEmployeeForView);
                    }}
                    className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    View Payroll
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleHistoryButton(selectedEmployeeForView);
                    }}
                    className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View History
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleRuleButton(selectedEmployeeForView);
                    }}
                    className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Rule Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployeeForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col">
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"></div>
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="relative flex items-center justify-between p-6 text-white">
                <div className="flex items-center gap-4">
                  {/* Back Button */}
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setShowViewModal(true);
                    }}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110 mr-2"
                    title="Back to View"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Edit Employee</h3>
                    <p className="text-purple-100 text-sm font-medium">{selectedEmployeeForEdit.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-purple-600" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.firstName || selectedEmployeeForEdit.name?.split(' ')[0] || ''}
                          onChange={(e) => handleEditFieldChange('firstName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.lastName || selectedEmployeeForEdit.name?.split(' ')[1] || ''}
                          onChange={(e) => handleEditFieldChange('lastName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter last name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={selectedEmployeeForEdit.email}
                          onChange={(e) => handleEditFieldChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={selectedEmployeeForEdit.phone || ''}
                          onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                          value={selectedEmployeeForEdit.gender || ''}
                          onChange={(e) => handleEditFieldChange('gender', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                        <select
                          value={selectedEmployeeForEdit.maritalStatus || ''}
                          onChange={(e) => handleEditFieldChange('maritalStatus', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.nationality || ''}
                          onChange={(e) => handleEditFieldChange('nationality', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter nationality"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
                        <input
                          type="date"
                          value={selectedEmployeeForEdit.birthday || ''}
                          onChange={(e) => handleEditFieldChange('birthday', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                      <textarea
                        value={selectedEmployeeForEdit.currentAddress || ''}
                        onChange={(e) => handleEditFieldChange('currentAddress', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="Enter current address"
                      />
                    </div>
                  </div>

                  {/* Work Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                      Work Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.employeeId || selectedEmployeeForEdit.id || ''}
                          onChange={(e) => handleEditFieldChange('employeeId', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter employee ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                        <select
                          key={`edit-job-title-select-${jobTitles?.length || 0}`}
                          value={selectedEmployeeForEdit.jobTitle || ""}
                          onChange={(e) => {
                            const newJobTitle = e.target.value;
                            handleEditFieldChange('jobTitle', newJobTitle);
                            // Clear manager field when job title is "Manager"
                            if (newJobTitle === "Manager") {
                              handleEditFieldChange('manager', '');
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select job title</option>
                          {jobTitles && jobTitles.length > 0 ? (
                            jobTitles.map((job, index) => {
                              const jobTitleValue = job.title || job.name || '';
                              const jobTitleDisplay = job.title || job.name || '';
                              return (
                                <option 
                                  key={job.id || `edit-job-${index}`} 
                                  value={jobTitleValue}
                                >
                                  {jobTitleDisplay}
                                </option>
                              );
                            })
                          ) : (
                            <>
                              <option value="Manager">Manager</option>
                              <option value="Developer">Developer</option>
                              <option value="Accountant">Accountant</option>
                              <option value="Sales Rep">Sales Rep</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <select
                          value={selectedEmployeeForEdit.department}
                          onChange={(e) => handleEditFieldChange('department', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select department</option>
                          <option value="HR">HR</option>
                          <option value="IT">IT</option>
                          <option value="Finance">Finance</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Operations">Operations</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Type</label>
                        <select
                          value={selectedEmployeeForEdit.employeeType || 'Full-time'}
                          onChange={(e) => handleEditFieldChange('employeeType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Intern">Intern</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={selectedEmployeeForEdit.status || 'Active'}
                          onChange={(e) => handleEditFieldChange('status', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Terminated">Terminated</option>
                        </select>
                      </div>
                      {selectedEmployeeForEdit.jobTitle !== "Manager" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Line Manager (Optional)</label>
                          <input
                            type="text"
                            value={selectedEmployeeForEdit.manager || ''}
                            onChange={(e) => handleEditFieldChange('manager', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter manager name (Optional)"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                        <input
                          type="date"
                          value={selectedEmployeeForEdit.joiningDate || ''}
                          onChange={(e) => handleEditFieldChange('joiningDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Location</label>
                        <select
                          value={selectedEmployeeForEdit.companyLocation || ''}
                          onChange={(e) => handleEditFieldChange('companyLocation', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select location</option>
                          <option value="Dubai HQ">Dubai HQ</option>
                          <option value="Abu Dhabi Office">Abu Dhabi Office</option>
                          <option value="Syria Office">Syria Office</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Program</label>
                        <select
                          value={selectedEmployeeForEdit.attendanceProgram || ''}
                          onChange={(e) => handleEditFieldChange('attendanceProgram', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select program</option>
                          <option value="Standard 9-5">Standard 9-5</option>
                          <option value="Flexible Hours">Flexible Hours</option>
                          <option value="Shift Work">Shift Work</option>
                          <option value="Remote Work">Remote Work</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Legal Documents */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5 text-green-600" />
                      Legal Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.passportNumber || ''}
                          onChange={(e) => handleEditFieldChange('passportNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter passport number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Passport Expiry</label>
                        <input
                          type="date"
                          value={selectedEmployeeForEdit.passportExpiry || ''}
                          onChange={(e) => handleEditFieldChange('passportExpiry', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">National ID Number</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.nationalIdNumber || ''}
                          onChange={(e) => handleEditFieldChange('nationalIdNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter national ID number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">National ID Expiry</label>
                        <input
                          type="date"
                          value={selectedEmployeeForEdit.nationalIdExpiry || ''}
                          onChange={(e) => handleEditFieldChange('nationalIdExpiry', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Residency Number</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.residencyNumber || ''}
                          onChange={(e) => handleEditFieldChange('residencyNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter residency number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Residency Expiry</label>
                        <input
                          type="date"
                          value={selectedEmployeeForEdit.residencyExpiry || ''}
                          onChange={(e) => handleEditFieldChange('residencyExpiry', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Number</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.insuranceNumber || ''}
                          onChange={(e) => handleEditFieldChange('insuranceNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter insurance number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Expiry</label>
                        <input
                          type="date"
                          value={selectedEmployeeForEdit.insuranceExpiry || ''}
                          onChange={(e) => handleEditFieldChange('insuranceExpiry', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Number</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.drivingNumber || ''}
                          onChange={(e) => handleEditFieldChange('drivingNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter driving license number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Expiry</label>
                        <input
                          type="date"
                          value={selectedEmployeeForEdit.drivingExpiry || ''}
                          onChange={(e) => handleEditFieldChange('drivingExpiry', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Labour Card Number</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.labourNumber || ''}
                          onChange={(e) => handleEditFieldChange('labourNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter labour card number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Labour Card Expiry</label>
                        <input
                          type="date"
                          value={selectedEmployeeForEdit.labourExpiry || ''}
                          onChange={(e) => handleEditFieldChange('labourExpiry', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      Documents Management
                    </h4>
                    
                                         {/* Document Upload Section */}
                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 mb-6">
                       <div className="flex items-center justify-between mb-4">
                         <div>
                           <h6 className="text-lg font-semibold text-gray-900">Upload New Document</h6>
                           <p className="text-sm text-blue-600 font-medium">Employee ID: {selectedEmployeeForEdit?.id}</p>
                         </div>
                         <button
                           onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                         >
                           <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                           </svg>
                           {showDocumentUpload ? 'Cancel' : 'Add Document'}
                         </button>
                       </div>
                      
                      {showDocumentUpload && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                              <select
                                value={selectedDocumentType}
                                onChange={(e) => setSelectedDocumentType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select document type</option>
                                <option value="passport">Passport</option>
                                <option value="visa">Visa</option>
                                <option value="labour_card">Labour Card</option>
                                <option value="contract">Employment Contract</option>
                                <option value="id_card">ID Card</option>
                                <option value="certificate">Certificate</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (if applicable)</label>
                              <input
                                id="edit-expiry-date"
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                            <div 
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                              onClick={() => document.getElementById('edit-file-upload').click()}
                            >
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                              <input 
                                id="edit-file-upload"
                                type="file" 
                                className="hidden" 
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const documentData = {
                                      name: file.name,
                                      type: selectedDocumentType,
                                      expiryDate: document.getElementById('edit-expiry-date').value,
                                      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                    };
                                    handleUploadDocument(selectedEmployeeForEdit.id, documentData);
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              Upload Document
                            </button>
                            <button 
                              onClick={() => setShowDocumentUpload(false)}
                              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Documents List */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h6 className="text-lg font-semibold text-gray-900">Uploaded Documents</h6>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">ID: {selectedEmployeeForEdit?.id}</span>
                      </div>
                      <div className="space-y-3">
                        {employeeDocuments[selectedEmployeeForEdit?.id]?.length > 0 ? (
                          employeeDocuments[selectedEmployeeForEdit?.id]?.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{doc.name}</p>
                                  <p className="text-sm text-gray-500">{doc.type} • {doc.uploadDate} • {doc.fileSize}</p>
                                  {doc.expiryDate && (
                                    <p className={`text-xs ${new Date(doc.expiryDate) < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                                      Expires: {doc.expiryDate}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleViewDocument(doc)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Document"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleDownloadDocument(doc)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Download Document"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleDeleteDocument(selectedEmployeeForEdit.id, doc.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Document"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <div className="text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</p>
                              <p className="mt-1 text-sm text-gray-500">Upload employee documents to get started</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <UsersIcon className="h-5 w-5 text-orange-600" />
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Children Count</label>
                        <input
                          type="number"
                          value={selectedEmployeeForEdit.childrenCount || ''}
                          onChange={(e) => handleEditFieldChange('childrenCount', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Number of children"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Exit Date</label>
                        <input
                          type="date"
                          value={selectedEmployeeForEdit.exitDate || ''}
                          onChange={(e) => handleEditFieldChange('exitDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                      <textarea
                        value={selectedEmployeeForEdit.remarks || ''}
                        onChange={(e) => handleEditFieldChange('remarks', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        placeholder="Enter any additional remarks"
                      />
                    </div>
                  </div>

                  
                </div>


              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Employee ID:</span> {selectedEmployeeForEdit.id}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-semibold border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateEmployee}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ✅ Update Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
} 