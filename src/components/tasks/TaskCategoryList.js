import React, { useState } from "react";

const initialCategories = [
  { id: 1, name: "MANAGEMENT", color: "#06b6d4", description: "Project management and coordination tasks" },
  { id: 2, name: "ACCOUNTING", color: "#a78bfa", description: "Financial and accounting related tasks" },
  { id: 3, name: "AUTHORITY APPROVAL", color: "#fde047", description: "Regulatory and approval processes" },
  { id: 4, name: "ARCHITECTURE DESIGN", color: "#6366f1", description: "Architectural design and planning" },
  { id: 5, name: "STRUCTURE DESIGN", color: "#f472b6", description: "Structural engineering and design" },
  { id: 6, name: "MEP DESIGN", color: "#bef264", description: "Mechanical, Electrical, and Plumbing design" },
  { id: 7, name: "SUPERVISION", color: "#f59e42", description: "Construction supervision and monitoring" },
  { id: 8, name: "Tender", color: "#a16207", description: "Tendering and procurement processes" }
];

export default function TaskCategoryList() {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState(null); // id of category being edited
  const [editForm, setEditForm] = useState({ name: "", color: "#06b6d4", description: "" });
  const [addForm, setAddForm] = useState({ name: "", color: "#06b6d4", description: "" });

  // Add new category
  function handleAdd() {
    if (!addForm.name.trim()) return;
    setCategories([
      ...categories,
      { ...addForm, id: Date.now() }
    ]);
    setAddForm({ name: "", color: "#06b6d4", description: "" });
  }

  // Start editing a category
  function handleEdit(cat) {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, color: cat.color, description: cat.description });
  }

  // Save edit
  function handleUpdate(id) {
    if (!editForm.name.trim()) return;
    setCategories(categories.map(cat => cat.id === id ? { ...cat, ...editForm } : cat));
    setEditingId(null);
    setEditForm({ name: "", color: "#06b6d4", description: "" });
  }

  // Cancel edit
  function handleCancelEdit() {
    setEditingId(null);
    setEditForm({ name: "", color: "#06b6d4", description: "" });
  }

  // Delete
  function handleDelete(id) {
    setCategories(categories.filter(cat => cat.id !== id));
    if (editingId === id) handleCancelEdit();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">Task Categories</h1>
          <p className="text-gray-600 text-lg">Manage and organize your project task categories</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Use</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Add New Category Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Category
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Category Name</label>
              <input
                type="text"
                placeholder="Enter category name"
                value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={addForm.color}
                  onChange={e => setAddForm(f => ({ ...f, color: e.target.value }))}
                  className="w-14 h-12 border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                />
                <span className="text-sm font-medium text-gray-600 px-3 py-2 bg-gray-100 rounded-lg">{addForm.color}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <input
                type="text"
                placeholder="Enter description"
                value={addForm.description}
                onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-8">
            <button
              onClick={handleAdd}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-semibold flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Category
            </button>
          </div>
        </div>

        {/* Enhanced Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              {editingId === cat.id ? (
                // Enhanced Inline edit mode
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="text-lg font-semibold text-gray-900 border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 bg-transparent mr-3 px-2 py-1 rounded transition-all duration-200"
                        style={{ minWidth: 0, flex: 1 }}
                        placeholder="Category Name"
                      />
                      <input
                        type="color"
                        value={editForm.color}
                        onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))}
                        className="ml-2 w-10 h-10 border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                        title="Pick color"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="p-2 text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                        title="Save"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                        title="Cancel"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    className="text-gray-600 text-sm mb-4 border-b-2 border-blue-200 focus:outline-none focus:border-blue-500 bg-transparent px-2 py-1 w-full rounded transition-all duration-200"
                    placeholder="Description"
                  />
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">ID: {cat.id}</span>
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                      style={{ 
                        backgroundColor: `${editForm.color}20`,
                        color: editForm.color
                      }}
                    >
                      Active
                    </div>
                  </div>
                </>
              ) : (
                // Enhanced Normal display mode
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1">
                      <div 
                        className="w-5 h-5 rounded-full mr-3 shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      />
                      <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 bg-gray-50 px-3 py-2 rounded-lg">{cat.description || "No description provided"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">ID: {cat.id}</span>
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                      style={{ 
                        backgroundColor: `${cat.color}20`,
                        color: cat.color
                      }}
                    >
                      Active
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}