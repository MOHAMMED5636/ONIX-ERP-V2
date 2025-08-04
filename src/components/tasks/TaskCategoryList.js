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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Categories</h1>
          <p className="text-gray-600">Manage and organize your project task categories</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Add New Category Form (above grid) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
              <input
                type="text"
                placeholder="Enter category name"
                value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={addForm.color}
                  onChange={e => setAddForm(f => ({ ...f, color: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-gray-500">{addForm.color}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                placeholder="Enter description"
                value={addForm.description}
                onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Category
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {editingId === cat.id ? (
                // Inline edit mode
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="text-lg font-semibold text-gray-900 border-b border-indigo-300 focus:outline-none focus:border-indigo-500 bg-transparent mr-3 px-1"
                        style={{ minWidth: 0, flex: 1 }}
                        placeholder="Category Name"
                      />
                      <input
                        type="color"
                        value={editForm.color}
                        onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))}
                        className="ml-2 w-8 h-8 border border-gray-300 rounded-lg cursor-pointer"
                        title="Pick color"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        title="Save"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    className="text-gray-600 text-sm mb-4 border-b border-indigo-200 focus:outline-none focus:border-indigo-500 bg-transparent px-1 w-full"
                    placeholder="Description"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">ID: {cat.id}</span>
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-medium"
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
                // Normal display mode
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: cat.color }}
                      />
                      <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{cat.description || "No description provided"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">ID: {cat.id}</span>
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-medium"
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