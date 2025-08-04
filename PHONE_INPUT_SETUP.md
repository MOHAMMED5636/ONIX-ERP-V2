# International Phone Input Setup

## Installation

To use the international phone input field, you need to install the `react-phone-input-2` package:

```bash
npm install react-phone-input-2
```

## Features Implemented

✅ **UAE as default country** (`+971`)  
✅ **Country selection dropdown** with flags  
✅ **Placeholder format** (`50 123 4567`)  
✅ **Country flag and code display**  
✅ **Full number submission** (with country code)  
✅ **Tailwind CSS styling** integration  
✅ **Controlled component** with React state  
✅ **Multi-step form integration**  

## Usage

The phone input field is now integrated into the "Contact Info" step of the employee form. Users can:

1. **Select country** from the dropdown (UAE is default)
2. **Enter phone number** with the specified format
3. **Add multiple phone numbers** using the "+ Add Phone" button
4. **Remove phone numbers** using the "Remove" button

## Data Structure

Phone numbers are stored in the form state as:

```javascript
contacts: [
  {
    type: "phone",
    value: "+971501234567", // Full international number
    countryCode: "ae"       // Country code
  }
]
```

## Styling

The component uses custom CSS to match your existing form design:
- Consistent height (42px)
- Matching border colors and focus states
- Proper spacing and typography
- Responsive design

## Validation

- At least one phone number is required
- Phone number must be at least 8 digits
- Full international format is validated on submission

## Backend Integration

When submitting the form, phone numbers are automatically formatted to include the full international format (e.g., `+971501234567`) and logged to the console for backend integration. 