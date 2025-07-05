import React, { useState } from 'react';

const ShopTab = ({ 
  students, 
  setStudents, 
  selectedStudent, 
  setSelectedStudent,
  saveStudentsToFirebase,
  showToast,
  setSavingData,
  calculateCoins,
  canAfford,
  spendCoins,
  SHOP_ITEMS,
  ITEM_RARITIES,
  LOOT_BOX_ITEMS,
  generateLootBoxRewards
}) => {
  const [activeShopTab, setActiveShopTab] = useState('all');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showLootBoxModal, setShowLootBoxModal] = useState(false);
  const [lootBoxRewards, setLootBoxRewards] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All Items', icon: '🛍️' },
    { id: 'lootboxes', name: 'Loot Boxes', icon: '📦' },
    { id: 'accessories', name: 'Accessories', icon: '👑' },
    { id: 'powerups', name: 'Power-ups', icon: '⚡' },
    { id: 'trophies', name: 'Trophies', icon: '🏆' }
  ];

  const filteredItems = activeShopTab === 'all' 
    ? SHOP_ITEMS 
    : SHOP_ITEMS.filter(item => item.category === activeShopTab);

  const handlePurchase = (item) => {
    if (!selectedStudent) {
      showToast('Please select a student first!');
      return;
    }

    const student = students.find(s => s.id === selectedStudent.id);
    if (!student) return;

    if (!canAfford(student, item.price)) {
      showToast('Not enough coins!');
      return;
    }

    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (!selectedItem || !selectedStudent) return;

    setSavingData(true);
    
    setStudents(prev => {
      const updatedStudents = prev.map(student => {
        if (student.id === selectedStudent.id) {
          const updatedStudent = spendCoins(student, selectedItem.price);
          
          if (selectedItem.type === 'lootbox') {
            // Generate loot box rewards
            const rewards = generateLootBoxRewards(selectedItem);
            setLootBoxRewards(rewards);
            setShowLootBoxModal(true);
            
            return {
              ...updatedStudent,
              lootBoxes: [...(updatedStudent.lootBoxes || []), ...rewards]
            };
          } else {
            // Add item to inventory
            const newItem = {
              ...selectedItem,
              obtainedAt: new Date().toISOString(),
              id: `${selectedItem.id}_${Date.now()}`
            };
            
            return {
              ...updatedStudent,
              inventory: [...(updatedStudent.inventory || []), newItem]
            };
          }
        }
        return student;
      });
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    setShowPurchaseModal(false);
    setSelectedItem(null);
    setSavingData(false);
    showToast(`${selectedItem.name} purchased successfully!`);
  };

  const CurrencyDisplay = ({ student, size = 'normal' }) => {
    const coins = calculateCoins(student.totalPoints || 0);
    
    return (
      <div className={`flex items-center space-x-1 ${
        size === 'large' ? 'text-lg' : 'text-sm'
      }`}>
        <span className="text-yellow-500">🪙</span>
        <span className="font-bold text-yellow-600">{coins}</span>
        <span className="text-gray-500">coins</span>
      </div>
    );
  };

  const ItemCard = ({ item }) => {
    const rarity = ITEM_RARITIES[item.rarity];
    const studentCoins = selectedStudent ? calculateCoins(selectedStudent.totalPoints || 0) : 0;
    const affordable = selectedStudent ? canAfford(selectedStudent, item.price) : false;

    return (
      <div className={`bg-white rounded-xl p-4 shadow-lg border-2 ${rarity.borderColor} transition-all duration-300 hover:shadow-xl hover:scale-105`}>
        <div className="text-center mb-3">
          <div className="text-4xl mb-2">{item.icon}</div>
          <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
          <p className="text-xs text-gray-600 mt-1">{item.description}</p>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs px-2 py-1 rounded-full ${rarity.bgColor} ${rarity.textColor} font-semibold`}>
            {rarity.name}
          </span>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-500">🪙</span>
            <span className="font-bold text-yellow-600">{item.price}</span>
          </div>
        </div>
        
        <button
          onClick={() => handlePurchase(item)}
          disabled={!selectedStudent || !affordable}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
            affordable && selectedStudent
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {!selectedStudent ? 'Select Student' : 
           !affordable ? 'Not Enough Coins' : 'Purchase'}
        </button>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <span className="text-3xl mr-3">🏪</span>
          Classroom Shop
        </h2>
        
        <div className="flex items-center space-x-4">
          {selectedStudent && (
            <div className="bg-white rounded-lg p-3 shadow-md">
              <div className="flex items-center space-x-3">
                <img 
                  src={selectedStudent.avatar} 
                  alt={selectedStudent.firstName} 
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-800">{selectedStudent.firstName}</p>
                  <CurrencyDisplay student={selectedStudent} />
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowInventoryModal(true)}
            disabled={!selectedStudent}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-300"
          >
            🎒 Inventory
          </button>
        </div>
      </div>

      {/* Student Selection */}
      {!selectedStudent && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Select a Student</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {students.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="bg-white p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <img 
                    src={student.avatar} 
                    alt={student.firstName} 
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-sm">{student.firstName}</p>
                    <CurrencyDisplay student={student} size="small" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveShopTab(category.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
              activeShopTab === category.id
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Shop Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-center">Confirm Purchase</h2>
            
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{selectedItem.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{selectedItem.name}</h3>
              <p className="text-gray-600 mb-4">{selectedItem.description}</p>
              
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-yellow-500 text-2xl">🪙</span>
                <span className="text-2xl font-bold text-yellow-600">{selectedItem.price}</span>
                <span className="text-gray-500">coins</span>
              </div>
              
              {selectedStudent && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {selectedStudent.firstName} will have{' '}
                    <span className="font-semibold">
                      {calculateCoins(selectedStudent.totalPoints) - selectedItem.price} coins
                    </span>{' '}
                    remaining
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loot Box Opening Modal */}
      {showLootBoxModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center">🎉 Loot Box Opened!</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {lootBoxRewards.map((reward, index) => {
                const rarity = ITEM_RARITIES[reward.rarity];
                return (
                  <div key={index} className={`${rarity.bgColor} p-4 rounded-lg text-center border-2 ${rarity.borderColor}`}>
                    <div className="text-3xl mb-2">{reward.icon}</div>
                    <h4 className="font-semibold text-sm">{reward.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${rarity.textColor} font-semibold`}>
                      {rarity.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowLootBoxModal(false)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Awesome! 🎉
            </button>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">
              🎒 {selectedStudent.firstName}'s Inventory
            </h2>
            
            <div className="mb-6 text-center">
              <CurrencyDisplay student={selectedStudent} size="large" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {(selectedStudent.inventory || []).concat(selectedStudent.lootBoxes || []).map((item, index) => {
                const rarity = ITEM_RARITIES[item.rarity];
                return (
                  <div key={index} className={`${rarity.bgColor} p-4 rounded-lg text-center border-2 ${rarity.borderColor}`}>
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <h4 className="font-semibold text-sm">{item.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${rarity.textColor} font-semibold`}>
                      {rarity.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {((selectedStudent.inventory || []).length + (selectedStudent.lootBoxes || []).length) === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎒</div>
                <p className="text-gray-500">No items yet! Visit the shop to start collecting!</p>
              </div>
            )}

            <button
              onClick={() => setShowInventoryModal(false)}
              className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Close Inventory
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopTab;