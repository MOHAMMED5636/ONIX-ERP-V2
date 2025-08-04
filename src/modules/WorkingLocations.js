import React, { useState } from 'react';
import { PencilSquareIcon, TrashIcon, MapPinIcon, BuildingOfficeIcon, UsersIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// Lazy load react-leaflet and leaflet to avoid issues if not installed
let MapContainer, TileLayer, Marker, useMapEvents;
try {
  ({ MapContainer, TileLayer, Marker, useMapEvents } = require('react-leaflet'));
  require('leaflet/dist/leaflet.css');
} catch {}

const demoWorkingLocations = [
  { id: 1, name: 'Test Working Location 1', address: '123 Main St', city: 'Dubai', country: 'United Arab Emirates', capacity: 100, employees: 50 },
  { id: 2, name: 'Test Working Location 2', address: '456 Oak Ave', city: 'Abu Dhabi', country: 'United Arab Emirates', capacity: 50, employees: 25 },
  { id: 3, name: 'Test Working Location 3', address: '789 Pine Ln', city: 'Sharjah', country: 'United Arab Emirates', capacity: 200, employees: 100 },
];

function MapPicker({ lat, lng, onPick, onClose }) {
  const [position, setPosition] = useState(lat && lng ? [lat, lng] : [25.276987, 55.296249]);
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onPick(e.latlng.lat, e.latlng.lng);
      },
    });
    return position ? (
      <Marker position={position} />
    ) : null;
  }
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
        <h3 className="text-lg font-semibold mb-2">Pick Location on Map</h3>
        {MapContainer ? (
          <MapContainer center={position} zoom={10} style={{ flex: 1, minHeight: 400, borderRadius: 8 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
          </MapContainer>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">Map unavailable (react-leaflet not installed)</div>
        )}
      </div>
    </div>
  );
}


function DraggableHeader({ column, id, index }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id });

  return (
    <th
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`py-3 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-left whitespace-nowrap bg-white select-none cursor-grab ${isDragging ? 'opacity-60' : ''}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      scope="col"
    >
      {column.label}
    </th>
  );
}

export default function WorkingLocations() {
  const [showForm, setShowForm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', address: '', city: '', country: '', capacity: '' });

  const handleLocationClick = (location) => {
    // Navigate to location details or employees at this location
    console.log('Location clicked:', location);
    // You can add navigation here when needed
  };

  const handleCreateLocation = () => {
    if (newLocation.name && newLocation.address && newLocation.city && newLocation.country && newLocation.capacity) {
      // Add to demo data
      demoWorkingLocations.push({
        id: demoWorkingLocations.length + 1,
        name: newLocation.name,
        address: newLocation.address,
        city: newLocation.city,
        country: newLocation.country,
        capacity: newLocation.capacity,
        employees: 0
      });
      setNewLocation({ name: '', address: '', city: '', country: '', capacity: '' });
      setShowCreateModal(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-10 border-b bg-white shadow-sm gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <MapPinIcon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-500" /> 
          Working Locations
        </h1>
        <button
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => setShowCreateModal(true)}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Location
        </button>
      </div>
      
      {/* Attractive Section Header */}
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 mt-6 sm:mt-8 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-lg px-4 sm:px-6 py-3 sm:py-4 border-l-4 border-blue-500 shadow-sm">
          <MapPinIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Working Locations</h2>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-indigo-50 to-white min-h-[60vh] px-4 sm:px-6 lg:px-10">
        <div className="w-full mt-4 sm:mt-8">
          {/* Mobile Cards View */}
          <div className="lg:hidden space-y-4">
            {demoWorkingLocations.map(location => (
              <div 
                key={location.id} 
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                onClick={() => handleLocationClick(location)}
                title="Click to view location details"
              >
                <div className="flex items-center gap-3 mb-3">
                  <MapPinIcon className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-semibold text-gray-800">{location.name}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{location.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{location.city}, {location.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Capacity: {location.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4 text-gray-400" />
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                      {location.employees} employees
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-2xl shadow-2xl bg-white border border-indigo-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City/Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {demoWorkingLocations.map(location => (
                  <tr 
                    key={location.id} 
                    className="hover:bg-indigo-50 transition cursor-pointer group" 
                    onClick={() => handleLocationClick(location)}
                    title="Click to view location details"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-semibold flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-indigo-400" /> {location.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-indigo-300" /> {location.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-indigo-300" /> {location.city}, {location.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-indigo-300" /> {location.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 shadow-sm">
                        {location.employees} employees
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Location Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in">
            <h3 className="text-lg font-bold mb-4">Create Working Location</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Location Name <span className="text-red-500">*</span></label>
                <input 
                  className="input" 
                  placeholder="Enter location name" 
                  value={newLocation.name} 
                  onChange={e => setNewLocation(f => ({ ...f, name: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Address <span className="text-red-500">*</span></label>
                <textarea 
                  className="input" 
                  rows="3"
                  placeholder="Enter full address" 
                  value={newLocation.address} 
                  onChange={e => setNewLocation(f => ({ ...f, address: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block font-medium mb-1">City <span className="text-red-500">*</span></label>
                <input 
                  className="input" 
                  placeholder="Enter city" 
                  value={newLocation.city} 
                  onChange={e => setNewLocation(f => ({ ...f, city: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Country <span className="text-red-500">*</span></label>
                <input 
                  className="input" 
                  placeholder="Enter country" 
                  value={newLocation.country} 
                  onChange={e => setNewLocation(f => ({ ...f, country: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Capacity <span className="text-red-500">*</span></label>
                <input 
                  className="input" 
                  type="number"
                  placeholder="Enter capacity" 
                  value={newLocation.capacity} 
                  onChange={e => setNewLocation(f => ({ ...f, capacity: e.target.value }))} 
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" className="btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreateLocation}>Create</button>
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