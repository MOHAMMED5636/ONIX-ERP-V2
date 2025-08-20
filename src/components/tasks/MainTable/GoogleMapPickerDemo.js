import React from 'react';

const GoogleMapPickerDemo = ({ onPick, onClose }) => {
  // For demo, clicking anywhere on the map will pick a fixed location
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-2xl relative flex flex-col" style={{ height: 500 }}>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          title="Close"
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-2">Pick Location on Google Map (Demo)</h3>
        <div className="flex-1 flex items-center justify-center">
          <div style={{ width: '100%', height: 400, position: 'relative' }}>
            <iframe
              title="Google Map Demo"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0, borderRadius: 8 }}
              src="https://www.google.com/maps/embed/v1/view?key=AIzaSyD-EXAMPLE-KEY&center=25.276987,55.296249&zoom=10"
              allowFullScreen
            />
            <button
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onClick={() => { onPick(25.276987, 55.296249); }}
              title="Pick this location"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapPickerDemo;

