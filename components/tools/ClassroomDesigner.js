// ClassroomDesigner.js - Interactive Classroom Layout Designer (FIXED CONTRAST)
import React, { useState, useRef, useCallback, useEffect } from 'react';

const ClassroomDesigner = ({ 
  students, 
  showToast, 
  saveClassroomDataToFirebase, 
  currentClassId 
}) => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [roomDimensions, setRoomDimensions] = useState({ width: 800, height: 600 });
  const [viewMode, setViewMode] = useState('design'); // 'design' or 'view'
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [showItemLibrary, setShowItemLibrary] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [zoom, setZoom] = useState(1);
  
  const canvasRef = useRef(null);
  const [nextId, setNextId] = useState(1);

  // Available classroom items
  const itemLibrary = {
    // Seating
    desk_single: { 
      name: 'Single Desk', 
      width: 60, 
      height: 40, 
      color: '#8B4513', 
      icon: '🪑', 
      category: 'seating'
    },
    desk_double: { 
      name: 'Double Desk', 
      width: 120, 
      height: 40, 
      color: '#A0522D', 
      icon: '🪑🪑', 
      category: 'seating'
    },
    table_round: { 
      name: 'Round Table', 
      width: 80, 
      height: 80, 
      color: '#CD853F', 
      icon: '⭕', 
      category: 'seating'
    },
    table_group: { 
      name: 'Group Table', 
      width: 120, 
      height: 80, 
      color: '#D2B48C', 
      icon: '⬜', 
      category: 'seating'
    },
    chair: { 
      name: 'Chair', 
      width: 30, 
      height: 30, 
      color: '#696969', 
      icon: '🪑', 
      category: 'seating'
    },
    bean_bag: { 
      name: 'Bean Bag', 
      width: 40, 
      height: 40, 
      color: '#9370DB', 
      icon: '🫘', 
      category: 'seating'
    },
    
    // Teaching Area
    teacher_desk: { 
      name: 'Teacher Desk', 
      width: 120, 
      height: 60, 
      color: '#4682B4', 
      icon: '👩‍🏫', 
      category: 'teaching'
    },
    whiteboard: { 
      name: 'Whiteboard', 
      width: 200, 
      height: 15, 
      color: '#F5F5F5', 
      icon: '⬜', 
      category: 'teaching',
      border: '#000'
    },
    smart_board: { 
      name: 'Smart Board', 
      width: 180, 
      height: 15, 
      color: '#2F4F4F', 
      icon: '📺', 
      category: 'teaching'
    },
    projector_screen: { 
      name: 'Projector Screen', 
      width: 160, 
      height: 120, 
      color: '#F8F8FF', 
      icon: '🎬', 
      category: 'teaching'
    },
    easel: { 
      name: 'Easel', 
      width: 40, 
      height: 60, 
      color: '#8B4513', 
      icon: '🎨', 
      category: 'teaching'
    },
    
    // Storage
    bookshelf: { 
      name: 'Bookshelf', 
      width: 30, 
      height: 120, 
      color: '#8B4513', 
      icon: '📚', 
      category: 'storage'
    },
    cabinet: { 
      name: 'Cabinet', 
      width: 80, 
      height: 40, 
      color: '#696969', 
      icon: '🗄️', 
      category: 'storage'
    },
    locker: { 
      name: 'Lockers', 
      width: 40, 
      height: 150, 
      color: '#708090', 
      icon: '🔒', 
      category: 'storage'
    },
    supply_cart: { 
      name: 'Supply Cart', 
      width: 50, 
      height: 30, 
      color: '#A9A9A9', 
      icon: '🛒', 
      category: 'storage'
    },
    
    // Technology
    computer_station: { 
      name: 'Computer Station', 
      width: 80, 
      height: 60, 
      color: '#2F4F4F', 
      icon: '💻', 
      category: 'technology'
    },
    printer: { 
      name: 'Printer', 
      width: 50, 
      height: 40, 
      color: '#696969', 
      icon: '🖨️', 
      category: 'technology'
    },
    document_camera: { 
      name: 'Document Camera', 
      width: 30, 
      height: 30, 
      color: '#4B0082', 
      icon: '📷', 
      category: 'technology'
    },
    
    // Miscellaneous
    plant: { 
      name: 'Plant', 
      width: 30, 
      height: 30, 
      color: '#228B22', 
      icon: '🪴', 
      category: 'misc'
    },
    trash_bin: { 
      name: 'Trash Bin', 
      width: 25, 
      height: 25, 
      color: '#696969', 
      icon: '🗑️', 
      category: 'misc'
    },
    reading_corner: { 
      name: 'Reading Corner', 
      width: 100, 
      height: 100, 
      color: '#FFB6C1', 
      icon: '📖', 
      category: 'misc'
    },
    carpet: { 
      name: 'Carpet/Rug', 
      width: 150, 
      height: 100, 
      color: '#DC143C', 
      icon: '🟫', 
      category: 'misc'
    }
  };

  const categories = [
    { id: 'all', name: 'All Items', icon: '📋' },
    { id: 'seating', name: 'Seating', icon: '🪑' },
    { id: 'teaching', name: 'Teaching', icon: '👩‍🏫' },
    { id: 'storage', name: 'Storage', icon: '📚' },
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'misc', name: 'Miscellaneous', icon: '🌟' }
  ];

  // Add item to canvas
  const addItem = (itemType) => {
    const libraryItem = itemLibrary[itemType];
    if (!libraryItem) return;

    const newItem = {
      id: nextId,
      type: itemType,
      x: 100 + (nextId * 20) % 200, // Offset new items
      y: 100 + (nextId * 20) % 200,
      width: libraryItem.width,
      height: libraryItem.height,
      rotation: 0,
      label: libraryItem.name,
      assignedStudent: null,
      zIndex: nextId
    };

    setItems(prev => [...prev, newItem]);
    setNextId(prev => prev + 1);
    showToast(`Added ${libraryItem.name}!`);
  };

  // Delete selected item
  const deleteItem = () => {
    if (selectedItem) {
      if (window.confirm(`Are you sure you want to delete "${selectedItem.label}"?`)) {
        setItems(prev => prev.filter(item => item.id !== selectedItem.id));
        setSelectedItem(null);
        showToast('Item deleted!');
      }
    }
  };

  // Duplicate selected item
  const duplicateItem = () => {
    if (selectedItem) {
      const newItem = {
        ...selectedItem,
        id: nextId,
        x: selectedItem.x + 50,
        y: selectedItem.y + 50,
        zIndex: nextId
      };
      setItems(prev => [...prev, newItem]);
      setNextId(prev => prev + 1);
      showToast('Item duplicated!');
    }
  };

  // Load preset layouts
  const loadPresetLayout = (layoutType) => {
    let newItems = [];
    let id = 1;
    
    // Clear existing items
    setItems([]);
    setSelectedItem(null);
    
    const roomLeft = 50;
    const roomTop = 50;
    const roomWidth = roomDimensions.width - 100;
    const roomHeight = roomDimensions.height - 100;

    switch (layoutType) {
      case 'traditional':
        // Traditional rows layout
        const deskWidth = 60;
        const deskHeight = 40;
        const deskSpacingX = 80;
        const deskSpacingY = 60;
        const desksPerRow = Math.floor(roomWidth / deskSpacingX);
        const rows = Math.ceil(Math.min(students.length, 30) / desksPerRow);
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < desksPerRow && newItems.length < students.length; col++) {
            newItems.push({
              id: id,
              type: 'desk_single',
              x: roomLeft + col * deskSpacingX + (roomWidth - (desksPerRow - 1) * deskSpacingX) / 2,
              y: roomTop + roomHeight - (row + 1) * deskSpacingY - 100,
              width: deskWidth,
              height: deskHeight,
              rotation: 0,
              label: `Desk ${id}`,
              assignedStudent: null,
              zIndex: id
            });
            id++;
          }
        }
        
        // Teacher desk - centered at front
        newItems.push({
          id: id,
          type: 'teacher_desk',
          x: roomLeft + roomWidth/2 - 60,
          y: roomTop + 20,
          width: 120,
          height: 60,
          rotation: 0,
          label: 'Teacher Desk',
          assignedStudent: null,
          zIndex: id
        });
        id++;
        
        // Whiteboard - centered at front
        newItems.push({
          id: id,
          type: 'whiteboard',
          x: roomLeft + roomWidth/2 - 100,
          y: roomTop,
          width: 200,
          height: 15,
          rotation: 0,
          label: 'Whiteboard',
          assignedStudent: null,
          zIndex: id
        });
        id++;
        break;

      case 'groups':
        // Group tables - arranged in grid within classroom
        const tableSize = 80;
        const tableSpacing = 150; // Increased spacing to prevent overlap
        const tablesPerRow = Math.floor(roomWidth / tableSpacing);
        const tableRows = Math.ceil(6 / tablesPerRow); // Calculate rows needed for 6 tables
        
        let groupCount = 0;
        for (let row = 0; row < tableRows && groupCount < 6; row++) {
          for (let col = 0; col < tablesPerRow && groupCount < 6; col++) {
            newItems.push({
              id: id,
              type: 'table_round',
              x: roomLeft + col * tableSpacing + (roomWidth - Math.min(tablesPerRow, 6 - row * tablesPerRow) * tableSpacing) / 2 + tableSpacing/2 - tableSize/2,
              y: roomTop + row * tableSpacing + 100,
              width: tableSize,
              height: tableSize,
              rotation: 0,
              label: `Group ${groupCount + 1}`,
              assignedStudent: null,
              zIndex: id
            });
            id++;
            groupCount++;
          }
        }
        
        // Teacher desk
        newItems.push({
          id: id,
          type: 'teacher_desk',
          x: roomLeft + 20,
          y: roomTop + 20,
          width: 120,
          height: 60,
          rotation: 0,
          label: 'Teacher Desk',
          assignedStudent: null,
          zIndex: id
        });
        id++;
        
        // Whiteboard
        newItems.push({
          id: id,
          type: 'whiteboard',
          x: roomLeft + roomWidth/2 - 100,
          y: roomTop,
          width: 200,
          height: 15,
          rotation: 0,
          label: 'Whiteboard',
          assignedStudent: null,
          zIndex: id
        });
        id++;
        break;

      case 'flexible':
        // Flexible learning spaces with better spacing
        
        // Reading corner
        newItems.push({
          id: id,
          type: 'reading_corner',
          x: roomLeft + 20,
          y: roomTop + roomHeight - 120,
          width: 100,
          height: 100,
          rotation: 0,
          label: 'Reading Corner',
          assignedStudent: null,
          zIndex: id
        });
        id++;
        
        // Computer station
        newItems.push({
          id: id,
          type: 'computer_station',
          x: roomLeft + roomWidth - 100,
          y: roomTop + roomHeight - 80,
          width: 80,
          height: 60,
          rotation: 0,
          label: 'Computer Station',
          assignedStudent: null,
          zIndex: id
        });
        id++;
        
        // Central group table
        newItems.push({
          id: id,
          type: 'table_group',
          x: roomLeft + roomWidth/2 - 60,
          y: roomTop + roomHeight/2 - 40,
          width: 120,
          height: 80,
          rotation: 0,
          label: 'Central Table',
          assignedStudent: null,
          zIndex: id
        });
        id++;
        
        // Teacher mobile desk
        newItems.push({
          id: id,
          type: 'teacher_desk',
          x: roomLeft + roomWidth - 140,
          y: roomTop + 20,
          width: 120,
          height: 60,
          rotation: 0,
          label: 'Teacher Desk',
          assignedStudent: null,
          zIndex: id
        });
        id++;
        
        // Smart board
        newItems.push({
          id: id,
          type: 'smart_board',
          x: roomLeft + 20,
          y: roomTop,
          width: 180,
          height: 15,
          rotation: 0,
          label: 'Smart Board',
          assignedStudent: null,
          zIndex: id
        });
        id++;
        break;
    }

    setItems(newItems);
    setNextId(id);
    showToast(`Loaded ${layoutType} layout with ${newItems.length} items!`);
  };

  // Save current layout
  const saveLayout = () => {
    const layoutName = prompt('Enter layout name:');
    if (layoutName && layoutName.trim()) {
      const layout = {
        id: Date.now(),
        name: layoutName.trim(),
        items: items,
        roomDimensions: roomDimensions,
        createdAt: new Date(),
        studentCount: students.length
      };
      
      setSavedLayouts(prev => [layout, ...prev]);
      
      // Save to Firebase if available
      if (saveClassroomDataToFirebase && currentClassId) {
        saveClassroomDataToFirebase(currentClassId, layout);
      }
      
      showToast('Layout saved successfully!');
    }
  };

  // Load saved layout
  const loadLayout = (layout) => {
    setItems(layout.items);
    setRoomDimensions(layout.roomDimensions);
    showToast(`Loaded layout: ${layout.name}!`);
  };

  // Clear all items
  const clearAllItems = () => {
    if (window.confirm('Are you sure you want to clear all items? This cannot be undone.')) {
      setItems([]);
      setSelectedItem(null);
      setNextId(1);
      showToast('All items cleared!');
    }
  };

  // Mouse event handlers
  const handleMouseDown = (e, item) => {
    if (viewMode !== 'design') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    setSelectedItem(item);
    setIsDragging(true);
    setDragOffset({
      x: x - item.x,
      y: y - item.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !selectedItem || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    const newX = x - dragOffset.x;
    const newY = y - dragOffset.y;
    
    // Snap to grid if enabled
    const finalX = showGrid ? Math.round(newX / gridSize) * gridSize : newX;
    const finalY = showGrid ? Math.round(newY / gridSize) * gridSize : newY;
    
    setItems(prev => prev.map(item => 
      item.id === selectedItem.id 
        ? { ...item, x: Math.max(0, finalX), y: Math.max(0, finalY) }
        : item
    ));
  }, [isDragging, selectedItem, dragOffset, showGrid, gridSize, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Get filtered items for library
  const getFilteredLibraryItems = () => {
    if (selectedCategory === 'all') {
      return Object.entries(itemLibrary);
    }
    return Object.entries(itemLibrary).filter(([_, item]) => item.category === selectedCategory);
  };

  // Render classroom item
  const renderItem = (item) => {
    const libraryItem = itemLibrary[item.type];
    if (!libraryItem) return null;

    const isSelected = selectedItem?.id === item.id;
    const assignedStudent = item.assignedStudent ? students.find(s => s.id === item.assignedStudent) : null;
    
    return (
      <div
        key={item.id}
        className={`absolute cursor-move select-none transition-all duration-200 ${
          isSelected ? 'ring-4 ring-blue-500 ring-offset-2 shadow-lg z-50' : 'hover:ring-2 hover:ring-gray-300'
        } ${viewMode === 'design' ? 'hover:shadow-lg' : ''}`}
        style={{
          left: item.x,
          top: item.y,
          width: item.width,
          height: item.height,
          backgroundColor: libraryItem.color,
          border: libraryItem.border ? `2px solid ${libraryItem.border}` : '1px solid #ccc',
          borderRadius: '4px',
          zIndex: item.zIndex,
          transform: `rotate(${item.rotation || 0}deg)`,
        }}
        onMouseDown={(e) => handleMouseDown(e, item)}
        title={item.label + (assignedStudent ? ` - ${assignedStudent.firstName}` : '')}
      >
        <div className="w-full h-full flex flex-col items-center justify-center text-xs font-bold text-white p-1 text-center">
          <span className="text-base">{libraryItem.icon}</span>
          {/* Show student name if assigned */}
          {assignedStudent && (
            <div className="bg-black bg-opacity-75 text-white px-1 py-0.5 rounded text-xs font-bold mt-1 truncate w-full text-center">
              {assignedStudent.firstName}
            </div>
          )}
        </div>
        
        {isSelected && viewMode === 'design' && (
          <>
            <div className="absolute -top-8 left-0 bg-blue-600 text-white text-xs px-3 py-1 rounded whitespace-nowrap shadow-lg">
              ✏️ {item.label} - Editing
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              ✓
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🏫 Classroom Designer</h2>
            <p className="text-gray-700">Design and plan your ideal classroom layout</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('design')}
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                  viewMode === 'design' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎨 Design
              </button>
              <button
                onClick={() => setViewMode('view')}
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                  viewMode === 'view' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-300'
                }`}
              >
                👁️ View
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                −
              </button>
              <span className="text-sm text-gray-700 font-semibold min-w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        {viewMode === 'design' && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* Preset Layouts */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Quick Layouts:</span>
              <button
                onClick={() => loadPresetLayout('traditional')}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
              >
                Traditional
              </button>
              <button
                onClick={() => loadPresetLayout('groups')}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold"
              >
                Group Tables
              </button>
              <button
                onClick={() => loadPresetLayout('flexible')}
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-semibold"
              >
                Flexible
              </button>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            {/* Item Controls */}
            <div className="flex items-center gap-2">
              {selectedItem && (
                <span className="text-sm text-blue-600 font-semibold mr-2">
                  ✏️ Editing: {selectedItem.label}
                </span>
              )}
              <button
                onClick={duplicateItem}
                disabled={!selectedItem}
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 text-sm font-semibold"
              >
                📋 Copy
              </button>
              <button
                onClick={deleteItem}
                disabled={!selectedItem}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm font-semibold"
              >
                🗑️ Delete
              </button>
              <button
                onClick={clearAllItems}
                className="px-3 py-1 bg-red-700 text-white rounded hover:bg-red-800 text-sm font-semibold"
              >
                🧹 Clear All
              </button>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            {/* Grid Toggle */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-700 font-semibold">Show Grid</span>
            </label>

            {/* Save/Load */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={saveLayout}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold"
              >
                💾 Save Layout
              </button>
              <button
                onClick={() => setShowItemLibrary(!showItemLibrary)}
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-semibold"
              >
                📚 {showItemLibrary ? 'Hide' : 'Show'} Library
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Item Library Sidebar */}
        {showItemLibrary && viewMode === 'design' && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3">Item Library</h3>
              
              {/* Category Filter */}
              <div className="grid grid-cols-3 gap-1 mb-4">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-2 rounded text-xs font-semibold transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div>{category.icon}</div>
                    <div className="mt-1">{category.name}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {getFilteredLibraryItems().map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => addItem(key)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-semibold text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-600">
                      {item.width}×{item.height}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-8">
            <div
              ref={canvasRef}
              className="relative bg-white border-2 border-gray-300 mx-auto"
              style={{
                width: roomDimensions.width * zoom,
                height: roomDimensions.height * zoom,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                backgroundImage: showGrid ? 
                  `linear-gradient(to right, #e5e5e5 1px, transparent 1px),
                   linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)` : 'none',
                backgroundSize: `${gridSize}px ${gridSize}px`
              }}
              onClick={(e) => {
                // Only deselect if clicking directly on the canvas background, not on items
                if (e.target === e.currentTarget) {
                  setSelectedItem(null);
                }
              }}
            >
              {/* Room borders */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full border-4 border-gray-800 rounded-lg"></div>
              </div>

              {/* Render all items */}
              {items.map(renderItem)}

              {/* Room label and help text */}
              <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-bold">
                Classroom ({roomDimensions.width}×{roomDimensions.height})
              </div>
              
              {!selectedItem && viewMode === 'design' && items.length > 0 && (
                <div className="absolute bottom-4 right-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg text-xs max-w-48">
                  💡 Click any item to open the properties panel and assign students or modify settings.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedItem && viewMode === 'design' && (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Item Properties</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700 font-bold text-lg"
                title="Close properties panel"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 <strong>Tip:</strong> This panel stays open while you modify your selected item. Click the × to close or click empty space to deselect.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Label</label>
                <input
                  type="text"
                  value={selectedItem.label}
                  onChange={(e) => {
                    setItems(prev => prev.map(item =>
                      item.id === selectedItem.id
                        ? { ...item, label: e.target.value }
                        : item
                    ));
                    setSelectedItem(prev => ({ ...prev, label: e.target.value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">X Position</label>
                  <input
                    type="number"
                    value={Math.round(selectedItem.x)}
                    onChange={(e) => {
                      const newX = parseInt(e.target.value) || 0;
                      setItems(prev => prev.map(item =>
                        item.id === selectedItem.id
                          ? { ...item, x: newX }
                          : item
                      ));
                      setSelectedItem(prev => ({ ...prev, x: newX }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Y Position</label>
                  <input
                    type="number"
                    value={Math.round(selectedItem.y)}
                    onChange={(e) => {
                      const newY = parseInt(e.target.value) || 0;
                      setItems(prev => prev.map(item =>
                        item.id === selectedItem.id
                          ? { ...item, y: newY }
                          : item
                      ));
                      setSelectedItem(prev => ({ ...prev, y: newY }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Width</label>
                  <input
                    type="number"
                    value={selectedItem.width}
                    onChange={(e) => {
                      const newWidth = parseInt(e.target.value) || 10;
                      setItems(prev => prev.map(item =>
                        item.id === selectedItem.id
                          ? { ...item, width: newWidth }
                          : item
                      ));
                      setSelectedItem(prev => ({ ...prev, width: newWidth }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Height</label>
                  <input
                    type="number"
                    value={selectedItem.height}
                    onChange={(e) => {
                      const newHeight = parseInt(e.target.value) || 10;
                      setItems(prev => prev.map(item =>
                        item.id === selectedItem.id
                          ? { ...item, height: newHeight }
                          : item
                      ));
                      setSelectedItem(prev => ({ ...prev, height: newHeight }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rotation (degrees)</label>
                <input
                  type="number"
                  value={selectedItem.rotation || 0}
                  onChange={(e) => {
                    const newRotation = parseInt(e.target.value) || 0;
                    setItems(prev => prev.map(item =>
                      item.id === selectedItem.id
                        ? { ...item, rotation: newRotation }
                        : item
                    ));
                    setSelectedItem(prev => ({ ...prev, rotation: newRotation }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                  min="0"
                  max="360"
                />
              </div>

              {/* Student Assignment */}
              {['desk_single', 'desk_double', 'table_round', 'table_group', 'chair'].includes(selectedItem.type) && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Student</label>
                  <select
                    value={selectedItem.assignedStudent || ''}
                    onChange={(e) => {
                      const studentId = e.target.value || null;
                      setItems(prev => prev.map(item =>
                        item.id === selectedItem.id
                          ? { ...item, assignedStudent: studentId }
                          : item
                      ));
                      setSelectedItem(prev => ({ ...prev, assignedStudent: studentId }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                  >
                    <option value="">No assignment</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Saved Layouts Panel */}
      {savedLayouts.length > 0 && viewMode === 'design' && (
        <div className="bg-white border-t border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 mb-3">Saved Layouts</h3>
          <div className="flex gap-3 overflow-x-auto">
            {savedLayouts.map(layout => (
              <button
                key={layout.id}
                onClick={() => loadLayout(layout)}
                className="flex-shrink-0 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left min-w-48"
              >
                <div className="font-semibold text-gray-800">{layout.name}</div>
                <div className="text-xs text-gray-600">
                  {layout.items.length} items • {layout.createdAt.toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomDesigner;