import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const demoClients = [
  { name: "SEYED MEHDI HASSANZADEH", type: "Person" },
  { name: "SAMER SAMRA", type: "Person" },
  { name: "MOHAMMED ALAMERI", type: "Person" },
  { name: "MOHAMMED AL MOHAMMADI", type: "Person" },
];

export default function CreateContract() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ref: "",
    company: "",
    category: "",
    start: "",
    end: "",
    latitude: "",
    longitude: "",
    description: "",
    contractFees: "",
    additionalInfo: "",
    documents: [],
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  return (
    <div className="w-full h-full px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 flex flex-col">
      <div className="flex items-center gap-3 mb-4 mt-2 sm:mt-4 md:mt-6 px-2">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Create Contract</h1>
      </div>
      <div className="flex-1 w-full h-full bg-white rounded-2xl shadow-md border border-gray-100 p-2 sm:p-4 md:p-6 flex flex-col">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 sm:gap-y-4 mb-6 flex-1">
          <div>
            <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Reference Number</label>
            <input name="ref" value={form.ref} onChange={handleChange} className="w-full p-2 rounded border text-xs sm:text-base" />
          </div>
          <div>
            <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Company</label>
            <input name="company" value={form.company} onChange={handleChange} className="w-full p-2 rounded border text-xs sm:text-base" />
          </div>
          <div>
            <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Contract Category</label>
            <input name="category" value={form.category} onChange={handleChange} className="w-full p-2 rounded border text-xs sm:text-base" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Select Clients</label>
            <div className="overflow-x-auto rounded border border-gray-200 mb-2">
              <table className="min-w-full text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-2"> </th>
                    <th className="py-2 px-2">Name</th>
                    <th className="py-2 px-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {demoClients.map((c, idx) => (
                    <tr key={idx} className="even:bg-gray-50">
                      <td className="py-2 px-2"><input type="checkbox" /></td>
                      <td className="py-2 px-2 whitespace-nowrap">{c.name}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{c.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" name="start" value={form.start} onChange={handleChange} className="w-full p-2 rounded border text-xs sm:text-base" />
          </div>
          <div>
            <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">End Date</label>
            <input type="date" name="end" value={form.end} onChange={handleChange} className="w-full p-2 rounded border text-xs sm:text-base" />
          </div>
          <div>
            <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Latitude</label>
            <input name="latitude" value={form.latitude} onChange={handleChange} className="w-full p-2 rounded border text-xs sm:text-base" />
          </div>
          <div>
            <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Longitude</label>
            <input name="longitude" value={form.longitude} onChange={handleChange} className="w-full p-2 rounded border text-xs sm:text-base" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full p-2 rounded border text-xs sm:text-base" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Contract Fees</label>
            <input name="contractFees" value={form.contractFees} onChange={handleChange} className="w-full p-2 rounded border text-xs sm:text-base" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Additional Info</label>
            <input name="additionalInfo" value={form.additionalInfo} onChange={handleChange} className="w-full p-2 rounded border text-xs sm:text-base" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Upload Documents</label>
            <input type="file" multiple onChange={e => setForm(f => ({ ...f, documents: Array.from(e.target.files) }))} className="w-full p-2 rounded border text-xs sm:text-base" />
            {form.documents.length > 0 && (
              <ul className="mt-2 text-xs text-gray-600">
                {form.documents.map((f, i) => <li key={i}>{f.name}</li>)}
              </ul>
            )}
          </div>
        </form>
        <div className="flex flex-col md:flex-row justify-between gap-2 mt-auto w-full">
          <button
            type="button"
            onClick={() => navigate("/contracts")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded shadow text-xs sm:text-base w-full md:w-auto"
          >
            Back to List
          </button>
          <button
            type="button"
            onClick={() => navigate("/contracts")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded shadow text-xs sm:text-base w-full md:w-auto md:ml-auto"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
} 