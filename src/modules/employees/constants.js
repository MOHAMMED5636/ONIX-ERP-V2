// Custom styles for PhoneInput integration
export const phoneInputStyles = `
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
export const nationalities = [
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

// Demo employee data
export const demoEmployees = [
  { id: 1, name: "Ahmed Ali", department: "HR", email: "ahmed.ali@email.com", jobTitle: "Manager" },
  { id: 2, name: "Sara Youssef", department: "Finance", email: "sara.y@email.com", jobTitle: "Accountant" },
  { id: 3, name: "John Smith", department: "IT", email: "john.smith@email.com", jobTitle: "Developer" },
  { id: 4, name: "Fatima Noor", department: "Sales", email: "fatima.noor@email.com", jobTitle: "Sales Rep" },
];

// Form steps configuration
export const steps = [
  { label: "Personal Info", icon: "UserIcon" },
  { label: "Personal Details", icon: "UserIcon" },
  { label: "Contact Info", icon: "PhoneIcon" },
  { label: "Company Info", icon: "BriefcaseIcon" },
  { label: "Legal Info", icon: "IdentificationIcon" },
  { label: "Review & Submit", icon: "CheckCircleIcon" },
];

// Company locations
export const companyLocations = [
  "HQ - Main Office",
  "Branch 1 - Downtown",
  "Branch 2 - Industrial Area", 
  "Branch 3 - Airport Road",
  "Branch 4 - Shopping District",
  "Branch 5 - Business Park",
  "Remote - Work from Home",
  "Site Office - Project Location",
  "Client Office - On-site",
  "Mobile - Field Work"
];

// Initial form state
export const initialFormState = {
  employeeType: "",
  firstName: "",
  lastName: "",
  employeeId: "",
  status: "",
  userAccount: false,
  personalImage: null,
  gender: "",
  maritalStatus: "",
  nationality: "",
  currentAddress: "",
  childrenCount: "",
  birthday: "",
  contacts: [{ type: "phone", value: "", countryCode: "ae" }],
  emails: [""],
  department: "",
  jobTitle: "",
  location: "",
  manager: "",
  passport: "",
  id: "",
  visa: "",
  insurance: "",
  documents: [],
  company: "",
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
};
