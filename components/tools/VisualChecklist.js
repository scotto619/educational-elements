// components/tools/VisualChecklist.js - Interactive Visual Checklist for Classroom Display
import React, { useState, useEffect } from 'react';

const VisualChecklist = ({ students, showToast, saveData, loadedData }) => {
  const [displayMode, setDisplayMode] = useState(false);
  const [checklists, setChecklists] = useState([]);
  const [activeChecklistId, setActiveChecklistId] = useState(null);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Predefined color schemes for visual appeal
  const COLOR_SCHEMES = [
    { bg: 'bg-red-400', hover: 'hover:bg-red-500', text: 'text-white', border: 'border-red-600', name: 'Cherry Red' },
    { bg: 'bg-blue-400', hover: 'hover:bg-blue-500', text: 'text-white', border: 'border-blue-600', name: 'Ocean Blue' },
    { bg: 'bg-green-400', hover: 'hover:bg-green-500', text: 'text-white', border: 'border-green-600', name: 'Forest Green' },
    { bg: 'bg-purple-400', hover: 'hover:bg-purple-500', text: 'text-white', border: 'border-purple-600', name: 'Royal Purple' },
    { bg: 'bg-orange-400', hover: 'hover:bg-orange-500', text: 'text-white', border: 'border-orange-600', name: 'Sunset Orange' },
    { bg: 'bg-pink-400', hover: 'hover:bg-pink-500', text: 'text-white', border: 'border-pink-600', name: 'Bubblegum Pink' },
    { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500', text: 'text-black', border: 'border-yellow-600', name: 'Sunshine Yellow' },
    { bg: 'bg-indigo-400', hover: 'hover:bg-indigo-500', text: 'text-white', border: 'border-indigo-600', name: 'Deep Indigo' }
  ];

  // Preset icons for checklist items
  const ICONS = [
    '📚', '✏️', '🎒', '🧹', '🪑', '💻', '📋', '📝', '🌟', '⭐', '✅', '👥', 
    '🎵', '🎨', '📖', '🏃', '🧠', '💡', '🎯', '🏆', '🎪', '🎭', '🎨', '🚀'
  ];

  // Preset templates for common routines
  const PRESET_TEMPLATES = [
    {
      name: 'Morning Routine',
      items: [
        { text: 'Hang up backpacks', icon: '🎒', colorScheme: COLOR_SCHEMES[0] },
        { text: 'Put away homework', icon: '📚', colorScheme: COLOR_SCHEMES[1] },
        { text: 'Sharpen pencils', icon: '✏️', colorScheme: COLOR_SCHEMES[2] },
        { text: 'Morning journal', icon: '📖', colorScheme: COLOR_SCHEMES[3] },
        { text: 'Ready to learn!', icon: '🌟', colorScheme: COLOR_SCHEMES[4] }
      ]
    },
    {
      name: 'End of Day',
      items: [
        { text: 'Pack homework', icon: '📋', colorScheme: COLOR_SCHEMES[5] },
        { text: 'Clean desk area', icon: '🧹', colorScheme: COLOR_SCHEMES[6] },
        { text: 'Push in chairs', icon: '🪑', colorScheme: COLOR_SCHEMES[0] },
        { text: 'Line up quietly', icon: '👥', colorScheme: COLOR_SCHEMES[1] },
        { text: 'Have a great day!', icon: '🎉', colorScheme: COLOR_SCHEMES[2] }
      ]
    },
    {
      name: 'Lesson Start',
      items: [
        { text: 'Materials ready', icon: '📚', colorScheme: COLOR_SCHEMES[3] },
        { text: 'Eyes on teacher', icon: '👀', colorScheme: COLOR_SCHEMES[4] },
        { text: 'Listen carefully', icon: '👂', colorScheme: COLOR_SCHEMES[5] },
        { text: 'Raise hand to speak', icon: '✋', colorScheme: COLOR_SCHEMES[6] }
      ]
    }
  ];

  // Load saved checklists on component mount
  useEffect(() => {
    if (loadedData?.visualChecklists) {
      setChecklists(loadedData.visualChecklists);
    }
  }, [loadedData]);

  // Save checklists to Firebase
  const saveChecklists = async (updatedChecklists) => {
    try {
      await saveData({ visualChecklists: updatedChecklists });
      setChecklists(updatedChecklists);
      showToast('Checklist saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving checklist:', error);
      showToast('Error saving checklist', 'error');
    }
  };

  // Create new checklist
  const createChecklist = (name, template = null) => {
    const newChecklist = {
      id: `checklist_${Date.now()}`,
      name: name,
      items: template ? template.items.map((item, index) => ({
        id: `item_${Date.now()}_${index}`,
        ...item,
        completed: false
      })) : [],
      createdAt: new Date().toISOString()
    };

    const updatedChecklists = [...checklists, newChecklist];
    saveChecklists(updatedChecklists);
    setShowCreateModal(false);
  };

  // Update checklist
  const updateChecklist = (checklistId, updates) => {
    const updatedChecklists = checklists.map(checklist =>
      checklist.id === checklistId ? { ...checklist, ...updates } : checklist
    );
    saveChecklists(updatedChecklists);
  };

  // Delete checklist
  const deleteChecklist = (checklistId) => {
    const updatedChecklists = checklists.filter(c => c.id !== checklistId);
    saveChecklists(updatedChecklists);
    if (activeChecklistId === checklistId) {
      setActiveChecklistId(null);
    }
  };

  // Toggle item completion
  const toggleItem = (checklistId, itemId) => {
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        const updatedItems = checklist.items.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...checklist, items: updatedItems };
      }
      return checklist;
    });
    setChecklists(updatedChecklists);
    // Don't save immediately to avoid too many Firebase calls
  };

  // Add item to checklist
  const addItemToChecklist = (checklistId, item) => {
    const newItem = {
      id: `item_${Date.now()}`,
      ...item,
      completed: false
    };
    
    const updatedChecklists = checklists.map(checklist =>
      checklist.id === checklistId 
        ? { ...checklist, items: [...checklist.items, newItem] }
        : checklist
    );
    saveChecklists(updatedChecklists);
  };

  // Remove item from checklist
  const removeItemFromChecklist = (checklistId, itemId) => {
    const updatedChecklists = checklists.map(checklist =>
      checklist.id === checklistId
        ? { ...checklist, items: checklist.items.filter(item => item.id !== itemId) }
        : checklist
    );
    saveChecklists(updatedChecklists);
  };

  // Reset all items in a checklist
  const resetChecklist = (checklistId) => {
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        const resetItems = checklist.items.map(item => ({ ...item, completed: false }));
        return { ...checklist, items: resetItems };
      }
      return checklist;
    });
    saveChecklists(updatedChecklists);
  };

  // Get active checklist
  const activeChecklist = checklists.find(c => c.id === activeChecklistId);

  // DISPLAY MODE - Full screen checklist for classroom display - FIXED VERSION
  if (displayMode && activeChecklist) {
    const itemCount = activeChecklist.items.length;
    
    // Calculate optimal grid layout based on item count
    let columns = 2;
    let rows = 2;
    
    if (itemCount <= 4) {
      columns = Math.min(itemCount, 2);
      rows = Math.ceil(itemCount / columns);
    } else if (itemCount <= 6) {
      columns = 3;
      rows = 2;
    } else if (itemCount <= 9) {
      columns = 3;
      rows = 3;
    } else if (itemCount <= 12) {
      columns = 4;
      rows = 3;
    } else {
      columns = 4;
      rows = Math.ceil(itemCount / 4);
    }

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 z-40">
        {/* Header - Fixed position */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 md:p-6 shadow-xl">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-center flex-1">
              {activeChecklist.name}
            </h1>
            <button
              onClick={() => setDisplayMode(false)}
              className="bg-white text-purple-600 px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold hover:bg-gray-100 transition-all text-lg md:text-xl"
            >
              Exit Display
            </button>
          </div>
        </div>

        {/* Main Content - Properly positioned between header and footer */}
        <div 
          className="absolute left-0 right-0 p-4 md:p-6 lg:p-8"
          style={{ 
            top: '120px', // Space for header
            bottom: '100px' // Space for footer
          }}
        >
          <div className="w-full h-full max-w-7xl mx-auto">
            <div 
              className="grid gap-3 md:gap-4 lg:gap-6 w-full h-full"
              style={{ 
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`
              }}
            >
              {activeChecklist.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(activeChecklistId, item.id)}
                  className={`
                    ${item.colorScheme.bg} ${item.colorScheme.hover} ${item.colorScheme.text}
                    rounded-2xl md:rounded-3xl shadow-2xl cursor-pointer transform transition-all duration-300 
                    hover:scale-105 active:scale-95 p-2 md:p-4 lg:p-6 flex flex-col items-center justify-center
                    text-center relative overflow-hidden border-2 md:border-4 ${item.colorScheme.border}
                    ${item.completed ? 'opacity-75 saturate-50' : ''}
                  `}
                >
                  {/* Completion checkmark */}
                  {item.completed && (
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-green-500 text-white rounded-full w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 flex items-center justify-center text-lg md:text-2xl lg:text-3xl animate-pulse">
                      ✅
                    </div>
                  )}
                  
                  {/* Item icon - Responsive sizing */}
                  <div className="text-3xl md:text-5xl lg:text-7xl xl:text-8xl mb-2 md:mb-4 transform hover:rotate-12 transition-transform flex-shrink-0">
                    {item.icon}
                  </div>
                  
                  {/* Item text - Responsive sizing with proper overflow handling */}
                  <h3 className="text-sm md:text-xl lg:text-3xl xl:text-4xl font-bold leading-tight break-words hyphens-auto">
                    {item.text}
                  </h3>
                  
                  {/* Decorative elements */}
                  <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 opacity-20">
                    <div className="text-4xl md:text-6xl lg:text-8xl">{item.icon}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Fixed position */}
        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur p-3 md:p-4 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 md:px-8 md:py-4 rounded-full shadow-lg">
              <span className="text-lg md:text-2xl font-bold">
                Progress: {activeChecklist.items.filter(item => item.completed).length} / {activeChecklist.items.length} Complete
                {activeChecklist.items.filter(item => item.completed).length === activeChecklist.items.length && " 🎉"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <span className="text-3xl mr-3">📋</span>
            Visual Checklist
          </h3>
          <p className="text-gray-600">Create engaging visual checklists for classroom routines</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
        >
          + New Checklist
        </button>
      </div>

      {/* Existing Checklists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {checklists.map(checklist => (
          <div key={checklist.id} className="bg-white rounded-xl shadow-lg border hover:shadow-xl transition-all">
            <div className="p-6">
              <h4 className="text-xl font-bold mb-2">{checklist.name}</h4>
              <p className="text-gray-600 mb-4">{checklist.items.length} items</p>
              
              {/* Preview of checklist items */}
              <div className="space-y-2 mb-4">
                {checklist.items.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-gray-600 truncate">{item.text}</span>
                  </div>
                ))}
                {checklist.items.length > 3 && (
                  <div className="text-sm text-gray-400">...and {checklist.items.length - 3} more</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setActiveChecklistId(checklist.id);
                    setDisplayMode(true);
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  🖥️ Display
                </button>
                <button
                  onClick={() => setEditingChecklist(checklist)}
                  className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => resetChecklist(checklist.id)}
                  className="bg-orange-500 text-white py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  title="Reset all items"
                >
                  🔄
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${checklist.name}"?`)) {
                      deleteChecklist(checklist.id);
                    }
                  }}
                  className="bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm"
                  title="Delete checklist"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Checklist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Create New Checklist</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-2xl font-bold text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Templates */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Choose a Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PRESET_TEMPLATES.map((template, index) => (
                    <div key={index} className="border rounded-xl p-4 hover:bg-gray-50 cursor-pointer"
                         onClick={() => createChecklist(template.name, template)}>
                      <h4 className="font-bold mb-2">{template.name}</h4>
                      <div className="space-y-1">
                        {template.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-sm">
                            <span>{item.icon}</span>
                            <span className="text-gray-600">{item.text}</span>
                          </div>
                        ))}
                        {template.items.length > 3 && (
                          <div className="text-xs text-gray-400">+{template.items.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Checklist */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Or Create Custom Checklist</h3>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Checklist name..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        createChecklist(e.target.value.trim());
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.parentNode.querySelector('input');
                      if (input.value.trim()) {
                        createChecklist(input.value.trim());
                      }
                    }}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Checklist Modal */}
      {editingChecklist && <EditChecklistModal />}
    </div>
  );

  // Edit Checklist Modal Component
  function EditChecklistModal() {
    const [editName, setEditName] = useState(editingChecklist.name);
    const [editItems, setEditItems] = useState([...editingChecklist.items]);
    const [newItemText, setNewItemText] = useState('');
    const [newItemIcon, setNewItemIcon] = useState('📌');
    const [newItemColor, setNewItemColor] = useState(COLOR_SCHEMES[0]);

    const saveEditedChecklist = () => {
      const updatedChecklist = {
        ...editingChecklist,
        name: editName,
        items: editItems
      };
      
      const updatedChecklists = checklists.map(c =>
        c.id === editingChecklist.id ? updatedChecklist : c
      );
      
      saveChecklists(updatedChecklists);
      setEditingChecklist(null);
    };

    const addNewItem = () => {
      if (newItemText.trim()) {
        const newItem = {
          id: `item_${Date.now()}`,
          text: newItemText.trim(),
          icon: newItemIcon,
          colorScheme: newItemColor,
          completed: false
        };
        setEditItems([...editItems, newItem]);
        setNewItemText('');
        setNewItemIcon('📌');
        setNewItemColor(COLOR_SCHEMES[0]);
      }
    };

    const removeItem = (itemId) => {
      setEditItems(editItems.filter(item => item.id !== itemId));
    };

    const updateItem = (itemId, updates) => {
      setEditItems(editItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit Checklist</h2>
              <button
                onClick={() => setEditingChecklist(null)}
                className="text-2xl font-bold text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Checklist Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Checklist Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Existing Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Checklist Items</h3>
              <div className="space-y-3">
                {editItems.map((item, index) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 flex-1">
                      <select
                        value={item.icon}
                        onChange={(e) => updateItem(item.id, { icon: e.target.value })}
                        className="text-2xl bg-transparent"
                      >
                        {ICONS.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateItem(item.id, { text: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={COLOR_SCHEMES.findIndex(cs => cs.name === item.colorScheme.name)}
                        onChange={(e) => updateItem(item.id, { colorScheme: COLOR_SCHEMES[e.target.value] })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {COLOR_SCHEMES.map((scheme, idx) => (
                          <option key={idx} value={idx}>{scheme.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Item */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Add New Item</h3>
              <div className="flex items-center space-x-3">
                <select
                  value={newItemIcon}
                  onChange={(e) => setNewItemIcon(e.target.value)}
                  className="text-2xl bg-transparent border border-gray-300 rounded-lg px-2 py-2"
                >
                  {ICONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Item text..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
                />
                <select
                  value={COLOR_SCHEMES.findIndex(cs => cs.name === newItemColor.name)}
                  onChange={(e) => setNewItemColor(COLOR_SCHEMES[e.target.value])}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {COLOR_SCHEMES.map((scheme, idx) => (
                    <option key={idx} value={idx}>{scheme.name}</option>
                  ))}
                </select>
                <button
                  onClick={addNewItem}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setEditingChecklist(null)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedChecklist}
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default VisualChecklist;