// components/features/shop/index.js - Shop Management Components
// These focused components handle specific shop-related functionality

import React, { useState, useMemo } from 'react';
import { 
  Button, 
  IconButton, 
  Card, 
  Modal,
  InputField,
  SelectField,
  TextareaField,
  CoinDisplay,
  RarityBorder,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog
} from '../../shared';
import { useStudents, useModals, useLocalStorage } from '../../../hooks';
import { ALL_SHOP_ITEMS, RARITY_CONFIG, calculateCoins } from '../../../config/gameData';
import studentService from '../../../services/studentService';

// ===============================================
// SHOP ITEM CARD COMPONENT
// ===============================================

/**
 * Individual Shop Item Card
 */
export const ShopItemCard = ({ 
  item, 
  student = null,
  onPurchase,
  onPreview,
  isFeatured = false,
  discount = 0 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const canAfford = student ? calculateCoins(student) >= item.price : false;
  const finalPrice = discount > 0 ? Math.floor(item.price * (1 - discount / 100)) : item.price;
  const rarityConfig = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    if (onPreview && item.imagePath) {
      const rect = e.currentTarget.getBoundingClientRect();
      onPreview({
        show: true,
        image: item.imagePath || item.image,
        name: item.name,
        description: item.description,
        x: rect.right + 10,
        y: rect.top
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onPreview) {
      onPreview({ show: false });
    }
  };

  return (
    <RarityBorder 
      rarity={item.rarity}
      className={`
        p-4 transition-all duration-300 cursor-pointer relative overflow-hidden
        ${isHovered ? 'transform scale-105 shadow-lg' : 'shadow-md'}
        ${isFeatured ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
          ⭐ FEATURED
        </div>
      )}

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{discount}%
        </div>
      )}

      <div className="space-y-3">
        {/* Item Image */}
        <div className="text-center">
          {item.imagePath || item.image ? (
            <img
              src={item.imagePath || item.image}
              alt={item.name}
              className="w-16 h-16 mx-auto rounded-lg border-2 border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
              {item.category === 'avatars' ? '🧙' :
               item.category === 'pets' ? '🐾' :
               item.category === 'consumables' ? '🧪' : '📦'}
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="text-center">
          <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</h3>
          {item.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.description}</p>
          )}
        </div>

        {/* Rarity */}
        <div className="text-center">
          <span className={`
            text-xs font-bold px-2 py-1 rounded-full
            ${rarityConfig.bgColor} ${rarityConfig.textColor}
          `}>
            {rarityConfig.name}
          </span>
        </div>

        {/* Effect (for consumables) */}
        {item.effect && (
          <div className="text-center">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {item.effect}
            </span>
          </div>
        )}

        {/* Price and Purchase */}
        <div className="space-y-2">
          <div className="text-center">
            {discount > 0 && (
              <div className="text-xs text-gray-500 line-through">
                <CoinDisplay amount={item.price} size="sm" />
              </div>
            )}
            <CoinDisplay amount={finalPrice} size="md" />
          </div>

          {student && (
            <Button
              size="sm"
              onClick={() => onPurchase?.(item)}
              disabled={!canAfford}
              className={`w-full text-xs ${!canAfford ? 'opacity-50' : ''}`}
              variant={canAfford ? 'primary' : 'secondary'}
            >
              {canAfford ? 'Buy Now' : 'Can\'t Afford'}
            </Button>
          )}
        </div>
      </div>
    </RarityBorder>
  );
};

// ===============================================
// SHOP CATEGORY TABS COMPONENT
// ===============================================

/**
 * Shop Category Navigation
 */
export const ShopCategoryTabs = ({ 
  activeCategory, 
  onCategoryChange,
  itemCounts = {} 
}) => {
  const categories = [
    { id: 'avatars', name: 'Avatars', icon: '🧙‍♂️', description: 'Character appearances' },
    { id: 'pets', name: 'Pets', icon: '🐾', description: 'Loyal companions' },
    { id: 'consumables', name: 'Items', icon: '🧪', description: 'Useful consumables' },
    { id: 'lootboxes', name: 'Loot Boxes', icon: '📦', description: 'Mystery rewards' },
    { id: 'rewards', name: 'Rewards', icon: '🎁', description: 'Teacher rewards' }
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex space-x-1 overflow-x-auto">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all duration-200
              whitespace-nowrap min-w-max
              ${activeCategory === category.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }
            `}
          >
            <span className="text-lg">{category.icon}</span>
            <div className="text-left">
              <div className="font-semibold">{category.name}</div>
              <div className="text-xs opacity-80">
                {itemCounts[category.id] || 0} items
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===============================================
// STUDENT SELECTOR COMPONENT
// ===============================================

/**
 * Student Selection for Shop Purchases
 */
export const ShopStudentSelector = ({ 
  students, 
  selectedStudent, 
  onStudentSelect 
}) => {
  if (!students.length) return null;

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800">Select Student</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {students.map(student => {
            const coins = calculateCoins(student);
            const isSelected = selectedStudent?.id === student.id;
            
            return (
              <button
                key={student.id}
                onClick={() => onStudentSelect(student)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 text-left
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-800' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="font-medium text-sm">
                  {student.firstName} {student.lastName}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <CoinDisplay amount={coins} size="sm" />
                </div>
              </button>
            );
          })}
        </div>

        {selectedStudent && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-blue-800">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </span>
                <div className="text-sm text-blue-600">
                  Level {selectedStudent.level || 1} • {selectedStudent.totalPoints || 0} XP
                </div>
              </div>
              <CoinDisplay amount={calculateCoins(selectedStudent)} size="lg" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// SHOP FILTER COMPONENT
// ===============================================

/**
 * Shop Search and Filter Controls
 */
export const ShopFilter = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  selectedStudent = null
}) => {
  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rarity', label: 'Rarity' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'affordable', label: 'Can Afford' },
    { value: 'common', label: 'Common' },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare', label: 'Rare' },
    { value: 'epic', label: 'Epic' },
    { value: 'legendary', label: 'Legendary' }
  ];

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search shop items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <SelectField
            label="Sort By"
            value={sortBy}
            onChange={onSortChange}
            options={sortOptions}
            className="min-w-40"
          />

          <SelectField
            label="Filter"
            value={filterBy}
            onChange={onFilterChange}
            options={filterOptions}
            className="min-w-32"
          />

          {selectedStudent && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Budget:</span>
              <CoinDisplay amount={calculateCoins(selectedStudent)} size="sm" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// ===============================================
// ITEM PREVIEW COMPONENT
// ===============================================

/**
 * Hover Preview for Shop Items
 */
export const ItemPreview = ({ preview }) => {
  if (!preview.show) return null;

  return (
    <div 
      className="fixed z-50 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 max-w-xs"
      style={{ 
        left: preview.x, 
        top: preview.y,
        transform: 'translateY(-50%)'
      }}
    >
      <div className="space-y-3">
        {preview.image && (
          <img
            src={preview.image}
            alt={preview.name}
            className="w-24 h-24 mx-auto rounded-lg border-2 border-gray-200"
          />
        )}
        
        <div className="text-center">
          <h3 className="font-bold text-gray-800">{preview.name}</h3>
          {preview.description && (
            <p className="text-sm text-gray-600 mt-1">{preview.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ===============================================
// PURCHASE CONFIRMATION MODAL
// ===============================================

/**
 * Purchase Confirmation Dialog
 */
export const PurchaseConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  item,
  student,
  isProcessing = false 
}) => {
  if (!isOpen || !item || !student) return null;

  const studentCoins = calculateCoins(student);
  const canAfford = studentCoins >= item.price;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Purchase"
      size="sm"
    >
      <div className="p-6 space-y-4">
        {/* Item Details */}
        <div className="text-center space-y-3">
          {item.imagePath && (
            <img
              src={item.imagePath}
              alt={item.name}
              className="w-20 h-20 mx-auto rounded-lg border-2 border-gray-200"
            />
          )}
          
          <div>
            <h3 className="font-bold text-gray-800">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}
          </div>
        </div>

        {/* Purchase Summary */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Student:</span>
            <span className="font-medium">
              {student.firstName} {student.lastName}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Current Coins:</span>
            <CoinDisplay amount={studentCoins} size="sm" />
          </div>
          
          <div className="flex justify-between">
            <span>Item Price:</span>
            <CoinDisplay amount={item.price} size="sm" />
          </div>
          
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between font-semibold">
              <span>After Purchase:</span>
              <CoinDisplay amount={studentCoins - item.price} size="sm" />
            </div>
          </div>
        </div>

        {/* Warning if can't afford */}
        {!canAfford && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-red-700 text-sm">
              ⚠️ {student.firstName} doesn't have enough coins for this purchase.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          
          <Button
            onClick={onConfirm}
            disabled={!canAfford || isProcessing}
            loading={isProcessing}
            className="flex-1"
          >
            {canAfford ? 'Buy Now' : 'Can\'t Afford'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ===============================================
// MAIN SHOP TAB COMPONENT
// ===============================================

/**
 * Complete Shop Tab using smaller components
 */
export const ShopTab = ({ userId, classId }) => {
  const { students, loading } = useStudents(userId, classId);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeCategory, setActiveCategory] = useState('avatars');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [preview, setPreview] = useState({ show: false });
  const [purchaseModal, setPurchaseModal] = useState({ isOpen: false, item: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [featuredItem] = useLocalStorage('dailyFeaturedItem', null);

  // Get items for active category
  const categoryItems = ALL_SHOP_ITEMS[activeCategory] || [];

  // Count items by category
  const itemCounts = useMemo(() => {
    return Object.entries(ALL_SHOP_ITEMS).reduce((acc, [category, items]) => {
      acc[category] = items.length;
      return acc;
    }, {});
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = [...categoryItems];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply affordability filter
    if (filterBy === 'affordable' && selectedStudent) {
      const budget = calculateCoins(selectedStudent);
      filtered = filtered.filter(item => item.price <= budget);
    } else if (filterBy !== 'all') {
      // Apply rarity filter
      filtered = filtered.filter(item => item.rarity === filterBy);
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rarity':
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
        filtered.sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0));
        break;
    }

    return filtered;
  }, [categoryItems, searchTerm, filterBy, sortBy, selectedStudent]);

  // Handle purchase
  const handlePurchase = (item) => {
    if (!selectedStudent) {
      // Show student selection prompt
      return;
    }
    
    setPurchaseModal({ isOpen: true, item });
  };

  const confirmPurchase = async () => {
    if (!purchaseModal.item || !selectedStudent) return;

    setIsProcessing(true);
    try {
      const updatedStudent = studentService.processPurchase(selectedStudent, purchaseModal.item);
      
      // Update the selected student with new data
      setSelectedStudent(updatedStudent);
      
      // Close modal
      setPurchaseModal({ isOpen: false, item: null });
      
      // Show success message would go here
    } catch (error) {
      console.error('Purchase failed:', error);
      // Show error message would go here
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Classroom Champions Shop</h2>
        <p className="text-gray-600">Students can spend their hard-earned coins here!</p>
      </div>

      {/* Student Selector */}
      <ShopStudentSelector
        students={students}
        selectedStudent={selectedStudent}
        onStudentSelect={setSelectedStudent}
      />

      {/* Category Tabs */}
      <ShopCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        itemCounts={itemCounts}
      />

      {/* Featured Item */}
      {featuredItem && activeCategory === featuredItem.category && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-bold text-yellow-800 flex items-center justify-center space-x-2">
              <span>⭐</span>
              <span>Daily Featured Item</span>
              <span>⭐</span>
            </h3>
            
            <div className="max-w-xs mx-auto">
              <ShopItemCard
                item={featuredItem}
                student={selectedStudent}
                onPurchase={handlePurchase}
                onPreview={setPreview}
                isFeatured={true}
                discount={30}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Filter Controls */}
      <ShopFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
        selectedStudent={selectedStudent}
      />

      {/* Shop Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map(item => (
            <ShopItemCard
              key={item.id}
              item={item}
              student={selectedStudent}
              onPurchase={handlePurchase}
              onPreview={setPreview}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🛍️"
          title="No items found"
          description={`No ${activeCategory} match your current filters.`}
        />
      )}

      {/* Item Preview */}
      <ItemPreview preview={preview} />

      {/* Purchase Confirmation Modal */}
      <PurchaseConfirmModal
        isOpen={purchaseModal.isOpen}
        onClose={() => setPurchaseModal({ isOpen: false, item: null })}
        onConfirm={confirmPurchase}
        item={purchaseModal.item}
        student={selectedStudent}
        isProcessing={isProcessing}
      />
    </div>
  );
};

// Export all components
