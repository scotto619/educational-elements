// ClassroomDesigner.js - Advanced Classroom Layout Planning Tool
import React, { useState, useRef, useCallback, useEffect } from 'react';

const ClassroomDesigner = ({ students, showToast, saveClassroomDataToFirebase, currentClassId }) => {
  const canvasRef = useRef(null);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [dragState, setDragState] = useState(null);
  const [clipboard, setClipboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [roomDimensions, setRoomDimensions] = useState({ width: 800, height: 600 });
  const [gridSize, setGridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState('select');
  const [roomTemplate, setRoomTemplate] = useState('rectangular');
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [showStudentAssignment, setShowStudentAssignment] = useState(false);

  // Furniture and item definitions
  const furnitureTypes = {
    // Seating
    student_desk: { 
      name: 'Student Desk', 
      width: 60, 
      height: 40, 
      color: '#8B4513', 
      icon: '🪑', 
      category: 'seating',
      canAssignStudent: true
    },
    table_round: { 
      name: 'Round Table', 
      width: 80, 
      height: 80, 
      color: '#D2691E', 
      icon: '⭕', 
      category: 'seating',
      shape: 'circle'
    },
    table_rectangular: { 
      name: 'Rectangular Table', 
      width: 120, 
      height: 60, 
      color: '#D2691E', 
      icon: '▬', 
      category: 'seating'
    },
    semicircle_table: { 
      name: 'Semi-circle Table', 
      width: 100, 
      height: 50, 
      color: '#CD853F', 
      icon: '🌙', 
      category: 'seating',
      shape: 'semicircle'
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
      color: '#4682B4', 
      icon: '📷', 
      category: 'technology'
    },
    
    // Special Areas
    reading_corner: { 
      name: 'Reading Corner', 
      width: 100, 
      height: 100, 
      color: '#F0E68C', 
      icon: '📖', 
      category: 'special',
      shape: 'rounded'
    },
    carpet_area: { 
      name: 'Carpet Area', 
      width: 150, 
      height: 100, 
      color: '#DDA0DD', 
      icon: '🏠', 
      category: 'special',
      shape: 'rounded'
    },
    art_station: { 
      name: 'Art Station', 
      width: 80, 
      height: 80, 
      color: '#FF6347', 
      icon: '🎨', 
      category: 'special'
    },
    
    // Room Elements
    door: { 
      name: 'Door', 
      width: 15, 
      height: 80, 
      color: '#8B4513', 
      icon: '🚪', 
      category: 'room'
    },
    window: { 
      name: 'Window', 
      width: 15, 
      height: 100, 
      color: '#87CEEB', 
      icon: '🪟', 
      category: 'room'
    },
    sink: { 
      name: 'Sink', 
      width: 60, 
      height: 40, 
      color: '#4682B4', 
      icon: '🚿', 
      category: 'room'
    },
    pillar: { 
      name: 'Pillar', 
      width: 40, 
      height: 40, 
      color: '#A9A9A9', 
      icon: '⬜', 
      category: 'room'
    }
  };

  // Room templates
  const roomTemplates = {
    rectangular: 'Standard Rectangular Room',
    l_shaped: 'L-Shaped Room',
    u_shaped: 'U-Shaped Room',
    irregular: 'Irregular Room'
  };

  // Categories for sidebar organization
  const categories = {
    seating: { name: 'Seating', icon: '🪑', color: 'bg-blue-50' },
    teaching: { name: 'Teaching', icon: '👩‍🏫', color: 'bg-green-50' },
    storage: { name: 'Storage', icon: '📚', color: 'bg-yellow-50' },
    technology: { name: 'Technology', icon: '💻', color: 'bg-purple-50' },
    special: { name: 'Special Areas', icon: '🎨', color: 'bg-pink-50' },
    room: { name: 'Room Elements', icon: '🚪', color: 'bg-gray-50' }
  };

  // Save to history for undo/redo
  const saveToHistory = useCallback((newItems) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newItems)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Add furniture item
  const addFurniture = (type) => {
    const furniture = furnitureTypes[type];
    if (!furniture) return;

    // Position new items within the classroom bounds
    const roomLeft = 70; // 50 + 20 padding
    const roomTop = 70;  // 50 + 20 padding
    const roomRight = 50 + roomDimensions.width - 20;
    const roomBottom = 50 + roomDimensions.height - 20;
    
    // Find a good position that doesn't overlap with existing items
    let x = roomLeft + Math.random() * (roomRight - roomLeft - furniture.width);
    let y = roomTop + Math.random() * (roomBottom - roomTop - furniture.height);
    
    // Snap to grid if enabled
    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    const newItem = {
      id: Date.now() + Math.random(),
      type,
      x: Math.max(roomLeft, Math.min(x, roomRight - furniture.width)),
      y: Math.max(roomTop, Math.min(y, roomBottom - furniture.height)),
      width: furniture.width,
      height: furniture.height,
      rotation: 0,
      label: furniture.name,
      assignedStudent: null,
      zIndex: items.length
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    saveToHistory(newItems);
    showToast(`Added ${furniture.name}`);
  };

  // Handle mouse events
  const handleMouseDown = (e, itemId = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    if (tool === 'select' && itemId) {
      // Multi-select with Ctrl/Cmd
      if (e.ctrlKey || e.metaKey) {
        setSelectedItems(prev => 
          prev.includes(itemId) 
            ? prev.filter(id => id !== itemId)
            : [...prev, itemId]
        );
      } else if (!selectedItems.includes(itemId)) {
        setSelectedItems([itemId]);
      }

      // Start dragging
      const item = items.find(i => i.id === itemId);
      if (item) {
        setDragState({
          type: 'move',
          startX: x,
          startY: y,
          items: selectedItems.includes(itemId) 
            ? selectedItems.map(id => items.find(i => i.id === id))
            : [item]
        });
      }
    } else if (tool === 'select' && !itemId) {
      // Start selection rectangle
      setSelectedItems([]);
      setDragState({
        type: 'select',
        startX: x,
        startY: y,
        currentX: x,
        currentY: y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!dragState) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    if (dragState.type === 'move') {
      const deltaX = x - dragState.startX;
      const deltaY = y - dragState.startY;

      setItems(prev => prev.map(item => {
        const draggedItem = dragState.items.find(di => di.id === item.id);
        if (draggedItem) {
          let newX = draggedItem.x + deltaX;
          let newY = draggedItem.y + deltaY;

          if (snapToGrid) {
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
          }

          // Keep items within room bounds
          newX = Math.max(50, Math.min(newX, 50 + roomDimensions.width - item.width));
          newY = Math.max(50, Math.min(newY, 50 + roomDimensions.height - item.height));

          return { ...item, x: newX, y: newY };
        }
        return item;
      }));
    } else if (dragState.type === 'select') {
      setDragState(prev => ({ ...prev, currentX: x, currentY: y }));
    }
  };

  const handleMouseUp = (e) => {
    if (dragState?.type === 'move') {
      saveToHistory(items);
    } else if (dragState?.type === 'select') {
      // Select items in rectangle
      const minX = Math.min(dragState.startX, dragState.currentX);
      const maxX = Math.max(dragState.startX, dragState.currentX);
      const minY = Math.min(dragState.startY, dragState.currentY);
      const maxY = Math.max(dragState.startY, dragState.currentY);

      const selectedIds = items
        .filter(item => 
          item.x >= minX && item.x + item.width <= maxX &&
          item.y >= minY && item.y + item.height <= maxY
        )
        .map(item => item.id);
      
      setSelectedItems(selectedIds);
    }
    setDragState(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'c':
            e.preventDefault();
            copySelected();
            break;
          case 'v':
            e.preventDefault();
            pasteClipboard();
            break;
          case 'a':
            e.preventDefault();
            setSelectedItems(items.map(item => item.id));
            break;
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedItems, clipboard, history, historyIndex]);

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setItems(history[historyIndex - 1]);
      setSelectedItems([]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setItems(history[historyIndex + 1]);
      setSelectedItems([]);
    }
  };

  // Copy/Paste
  const copySelected = () => {
    const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
    setClipboard(selectedItemsData);
    showToast(`Copied ${selectedItemsData.length} items`);
  };

  const pasteClipboard = () => {
    if (clipboard.length === 0) return;

    const newItems = clipboard.map(item => ({
      ...item,
      id: Date.now() + Math.random(),
      x: item.x + 20,
      y: item.y + 20
    }));

    const updatedItems = [...items, ...newItems];
    setItems(updatedItems);
    setSelectedItems(newItems.map(item => item.id));
    saveToHistory(updatedItems);
    showToast(`Pasted ${newItems.length} items`);
  };

  // Delete selected
  const deleteSelected = () => {
    if (selectedItems.length === 0) return;

    const newItems = items.filter(item => !selectedItems.includes(item.id));
    setItems(newItems);
    setSelectedItems([]);
    saveToHistory(newItems);
    showToast(`Deleted ${selectedItems.length} items`);
  };

  // Clear all items
  const clearAll = () => {
    if (items.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear all items from the classroom?')) {
      setItems([]);
      setSelectedItems([]);
      saveToHistory([]);
      showToast('Classroom cleared!');
    }
  };

  // Rotate selected items
  const rotateSelected = (degrees) => {
    const newItems = items.map(item => 
      selectedItems.includes(item.id)
        ? { ...item, rotation: (item.rotation + degrees) % 360 }
        : item
    );
    setItems(newItems);
    saveToHistory(newItems);
  };

  // Save layout
  const saveLayout = () => {
    const name = prompt('Enter layout name:');
    if (name) {
      const layout = {
        id: Date.now(),
        name,
        items: JSON.parse(JSON.stringify(items)),
        roomDimensions,
        createdAt: new Date().toISOString()
      };
      
      const newSavedLayouts = [...savedLayouts, layout];
      setSavedLayouts(newSavedLayouts);
      
      // Save to Firebase if available
      if (saveClassroomDataToFirebase) {
        saveClassroomDataToFirebase({ savedLayouts: newSavedLayouts });
      }
      
      showToast(`Layout "${name}" saved!`);
    }
  };

  // Load layout
  const loadLayout = (layout) => {
    setItems(layout.items);
    setRoomDimensions(layout.roomDimensions);
    setSelectedItems([]);
    saveToHistory(layout.items);
    showToast(`Loaded layout "${layout.name}"`);
  };

  // Assign student to desk
  const assignStudentToDesk = (itemId, studentId) => {
    const newItems = items.map(item => 
      item.id === itemId 
        ? { ...item, assignedStudent: studentId }
        : item
    );
    setItems(newItems);
    saveToHistory(newItems);
    
    const student = students.find(s => s.id === studentId);
    showToast(`Assigned ${student?.firstName || 'student'} to desk`);
  };

  // Generate classroom arrangement suggestions
  const generateArrangement = (style) => {
    const newItems = [];
    let id = 1;
    
    // Define classroom interior bounds (room boundary + padding)
    const roomLeft = 70; // 50 + 20 padding
    const roomTop = 70;  // 50 + 20 padding  
    const roomRight = 50 + roomDimensions.width - 20; // room boundary - padding
    const roomBottom = 50 + roomDimensions.height - 20;
    const roomWidth = roomRight - roomLeft;
    const roomHeight = roomBottom - roomTop;

    switch (style) {
      case 'rows':
        // Traditional rows - positioned within classroom
        const deskWidth = 60;
        const deskHeight = 40;
        const deskSpacing = 80;
        const rowSpacing = 70;
        
        // Calculate how many desks fit
        const desksPerRow = Math.floor(roomWidth / deskSpacing);
        const maxRows = Math.floor((roomHeight - 100) / rowSpacing); // Leave space for teacher area
        
        for (let row = 0; row < maxRows && row < 4; row++) {
          for (let col = 0; col < desksPerRow && col < 6; col++) {
            newItems.push({
              id: id++,
              type: 'student_desk',
              x: roomLeft + col * deskSpacing + (roomWidth - (desksPerRow - 1) * deskSpacing) / 2 - deskWidth/2,
              y: roomTop + 80 + row * rowSpacing,
              width: deskWidth,
              height: deskHeight,
              rotation: 0,
              label: `Desk ${id - 1}`,
              assignedStudent: null,
              zIndex: id - 1
            });
          }
        }
        
        // Teacher desk - centered at front
        newItems.push({
          id: id++,
          type: 'teacher_desk',
          x: roomLeft + roomWidth/2 - 60,
          y: roomTop + 20,
          width: 120,
          height: 60,
          rotation: 0,
          label: 'Teacher Desk',
          assignedStudent: null,
          zIndex: id - 1
        });
        
        // Whiteboard - centered at front
        newItems.push({
          id: id++,
          type: 'whiteboard',
          x: roomLeft + roomWidth/2 - 100,
          y: roomTop,
          width: 200,
          height: 15,
          rotation: 0,
          label: 'Whiteboard',
          assignedStudent: null,
          zIndex: id - 1
        });
        break;

      case 'groups':
        // Group tables - arranged in grid within classroom
        const tableSize = 80;
        const tableSpacing = 120;
        const tablesPerRow = Math.floor(roomWidth / tableSpacing);
        const tableRows = Math.floor(roomHeight / tableSpacing);
        
        let groupCount = 0;
        for (let row = 0; row < tableRows && groupCount < 6; row++) {
          for (let col = 0; col < tablesPerRow && groupCount < 6; col++) {
            newItems.push({
              id: id++,
              type: 'table_round',
              x: roomLeft + col * tableSpacing + (roomWidth - (tablesPerRow - 1) * tableSpacing) / 2 - tableSize/2,
              y: roomTop + 40 + row * tableSpacing,
              width: tableSize,
              height: tableSize,
              rotation: 0,
              label: `Group ${groupCount + 1}`,
              assignedStudent: null,
              zIndex: id - 1
            });
            groupCount++;
          }
        }
        break;

      case 'horseshoe':
        // U-shaped arrangement - positioned within classroom bounds
        const centerX = roomLeft + roomWidth / 2;
        const centerY = roomTop + roomHeight / 2;
        const radius = Math.min(roomWidth, roomHeight) / 3;
        
        // Calculate positions around a horseshoe
        const totalDesks = 14;
        const angleStep = Math.PI / (totalDesks - 1); // Spread across 180 degrees
        
        for (let i = 0; i < totalDesks; i++) {
          const angle = Math.PI + i * angleStep; // Start from left side
          const x = centerX + Math.cos(angle) * radius - 30; // -30 to center desk
          const y = centerY + Math.sin(angle) * radius - 20; // -20 to center desk
          const rotation = (angle * 180 / Math.PI + 90) % 360; // Face inward
          
          newItems.push({
            id: id++,
            type: 'student_desk',
            x: Math.max(roomLeft, Math.min(x, roomRight - 60)),
            y: Math.max(roomTop, Math.min(y, roomBottom - 40)),
            width: 60,
            height: 40,
            rotation: rotation,
            label: `Desk ${i + 1}`,
            assignedStudent: null,
            zIndex: id - 1
          });
        }
        
        // Teacher desk in center
        newItems.push({
          id: id++,
          type: 'teacher_desk',
          x: centerX - 60,
          y: centerY - 30,
          width: 120,
          height: 60,
          rotation: 0,
          label: 'Teacher Desk',
          assignedStudent: null,
          zIndex: id - 1
        });
        break;
    }

    setItems(newItems);
    setSelectedItems([]);
    saveToHistory(newItems);
    showToast(`Generated ${style} arrangement`);
  };

  // Render item
  const renderItem = (item) => {
    const furniture = furnitureTypes[item.type];
    if (!furniture) return null;

    const isSelected = selectedItems.includes(item.id);
    const transform = `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg)`;
    
    let shapeStyle = {};
    if (furniture.shape === 'circle') {
      shapeStyle.borderRadius = '50%';
    } else if (furniture.shape === 'semicircle') {
      shapeStyle.borderRadius = `${item.width}px ${item.width}px 0 0`;
    } else if (furniture.shape === 'rounded') {
      shapeStyle.borderRadius = '15px';
    }

    // Determine text color based on background color for better contrast
    const getTextColor = (bgColor) => {
      // Convert hex to RGB and calculate luminance
      const hex = bgColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      // Return white for dark backgrounds, black for light backgrounds
      return luminance < 0.5 ? '#FFFFFF' : '#000000';
    };

    const textColor = getTextColor(furniture.color);

    return (
      <div
        key={item.id}
        className={`absolute cursor-move select-none transition-all duration-150 ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        style={{
          transform,
          transformOrigin: 'top left',
          width: item.width,
          height: item.height,
          backgroundColor: furniture.color,
          border: furniture.border ? `2px solid ${furniture.border}` : '1px solid #333',
          zIndex: item.zIndex + (isSelected ? 1000 : 0),
          boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
          ...shapeStyle
        }}
        onMouseDown={(e) => handleMouseDown(e, item.id)}
      >
        <div 
          className="w-full h-full flex items-center justify-center text-xs font-bold text-center p-1 overflow-hidden"
          style={{ 
            color: textColor,
            textShadow: textColor === '#FFFFFF' ? '1px 1px 2px rgba(0,0,0,0.8)' : '1px 1px 2px rgba(255,255,255,0.8)'
          }}
        >
          {furniture.icon && <span className="mr-1">{furniture.icon}</span>}
          <span className="truncate">{item.label}</span>
        </div>
        
        {item.assignedStudent && students.find(s => s.id === item.assignedStudent) && (
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
            {students.find(s => s.id === item.assignedStudent)?.firstName}
          </div>
        )}
      </div>
    );
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🏫</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Classroom Designer</h2>
        <p className="text-gray-600">
          Add students to your class to use the advanced classroom layout designer.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 mb-2">🏫 Classroom Designer</h2>
          <p className="text-sm text-gray-600">Drag items to design your classroom layout</p>
        </div>

        {/* Tools */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-700 mb-2">Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={saveLayout}
              className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              💾 Save
            </button>
            <button
              onClick={() => setShowStudentAssignment(!showStudentAssignment)}
              className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              👤 Assign
            </button>
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              ↶ Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              ↷ Redo
            </button>
            <button
              onClick={clearAll}
              disabled={items.length === 0}
              className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 col-span-2"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* Quick Arrangements */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-700 mb-2">Quick Arrangements</h3>
          <div className="space-y-2">
            <button
              onClick={() => generateArrangement('rows')}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              📊 Traditional Rows
            </button>
            <button
              onClick={() => generateArrangement('groups')}
              className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              👥 Group Tables
            </button>
            <button
              onClick={() => generateArrangement('horseshoe')}
              className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              🌙 Horseshoe
            </button>
          </div>
        </div>

        {/* Furniture Categories */}
        {Object.entries(categories).map(([categoryId, category]) => (
          <div key={categoryId} className="border-b">
            <div className={`p-3 ${category.color}`}>
              <h3 className="font-semibold text-gray-700 flex items-center">
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </h3>
            </div>
            <div className="p-2 grid grid-cols-2 gap-1">
              {Object.entries(furnitureTypes)
                .filter(([_, furniture]) => furniture.category === categoryId)
                .map(([typeId, furniture]) => (
                  <button
                    key={typeId}
                    onClick={() => addFurniture(typeId)}
                    className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border text-left"
                    title={furniture.name}
                  >
                    <div className="flex items-center">
                      <span className="mr-1">{furniture.icon}</span>
                      <span className="truncate">{furniture.name}</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}

        {/* Settings */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Settings</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Show Grid</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Snap to Grid</span>
            </label>
          </div>
        </div>

        {/* Saved Layouts */}
        {savedLayouts.length > 0 && (
          <div className="p-4 border-t">
            <h3 className="font-semibold text-gray-700 mb-2">Saved Layouts</h3>
            <div className="space-y-2">
              {savedLayouts.map(layout => (
                <button
                  key={layout.id}
                  onClick={() => loadLayout(layout)}
                  className="w-full p-2 text-left bg-gray-50 hover:bg-gray-100 rounded text-sm"
                >
                  {layout.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white shadow-sm border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => rotateSelected(-45)}
                disabled={selectedItems.length === 0}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                ↺ Rotate
              </button>
              <button
                onClick={copySelected}
                disabled={selectedItems.length === 0}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                📋 Copy
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedItems.length === 0}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {selectedItems.length > 0 && `${selectedItems.length} items selected`}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden relative">
          <div
            ref={canvasRef}
            className="w-full h-full relative bg-gray-50 cursor-crosshair"
            style={{
              backgroundImage: showGrid 
                ? `radial-gradient(circle, #ccc 1px, transparent 1px)`
                : 'none',
              backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : 'auto'
            }}
            onMouseDown={(e) => !e.target.closest('[data-furniture-item]') && handleMouseDown(e)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Room boundary */}
            <div
              className="absolute border-4 border-gray-800 bg-white bg-opacity-50"
              style={{
                width: roomDimensions.width,
                height: roomDimensions.height,
                left: 50,
                top: 50
              }}
            />

            {/* Selection rectangle */}
            {dragState?.type === 'select' && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30"
                style={{
                  left: Math.min(dragState.startX, dragState.currentX),
                  top: Math.min(dragState.startY, dragState.currentY),
                  width: Math.abs(dragState.currentX - dragState.startX),
                  height: Math.abs(dragState.currentY - dragState.startY),
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Render all items */}
            {items.map(item => (
              <div key={item.id} data-furniture-item>
                {renderItem(item)}
              </div>
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white border-t p-2 text-sm text-gray-600 flex justify-between">
          <span>{items.length} items in classroom</span>
          <span>Use Ctrl+Z/Y for undo/redo, Ctrl+C/V for copy/paste</span>
        </div>
      </div>

      {/* Student Assignment Modal */}
      {showStudentAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Assign Students to Desks</h2>
            <div className="space-y-2">
              {items
                .filter(item => furnitureTypes[item.type]?.canAssignStudent)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-semibold">{item.label}</span>
                    <select
                      value={item.assignedStudent || ''}
                      onChange={(e) => assignStudentToDesk(item.id, e.target.value || null)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="">Unassigned</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.firstName}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setShowStudentAssignment(false)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomDesigner;