// components/tabs/ShopTab.js - REIMPLEMENTED AND FULLY FUNCTIONAL (COMPLETE FILE)
import React, { useState } from 'react';

// ===============================================
// SHOP DATA (Classroom Rewards - can be customized here)
// ===============================================
const TEACHER_REWARDS = [
  { id: 'reward_1', name: 'Extra Computer Time', price: 20, category: 'technology', icon: '💻' },
  { id: 'reward_2', name: 'Class Game Session', price: 30, category: 'fun', icon: '🎮' },
  { id: 'reward_3', name: 'No Homework Pass', price: 25, category: 'privileges', icon: '📝' },
  { id: 'reward_4', name: 'Choose Class Music', price: 15, category: 'privileges', icon: '🎵' },
];

// ===============================================
// SHOP TAB COMPONENT
// ===============================================
const ShopTab = ({ 
    students = [], 
    onUpdateStudent, 
    SHOP_BASIC_AVATARS,
    SHOP_PREMIUM_AVATARS,
    SHOP_BASIC_PETS,
    SHOP_PREMIUM_PETS,
    showToast = () => {},
    getAvatarImage,
    getPetImage,
    calculateCoins,
    calculateAvatarLevel
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('basic_avatars');
  const [purchaseModal, setPurchaseModal] = useState({ visible: false, item: null, type: null });
  const [inventoryModal, setInventoryModal] = useState({ visible: false });

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handlePurchase = () => {
    if (!selectedStudent || !purchaseModal.item) return;

    const studentCoins = calculateCoins(selectedStudent);
    if (studentCoins < purchaseModal.item.price) {
      showToast(`${selectedStudent.firstName} needs ${purchaseModal.item.price - studentCoins} more coins!`, 'error');
      return;
    }

    let updatedStudent = { ...selectedStudent };
    updatedStudent.coinsSpent = (updatedStudent.coinsSpent || 0) + purchaseModal.item.price;

    switch (purchaseModal.type) {
      case 'avatar':
        updatedStudent.ownedAvatars = [...new Set([...(updatedStudent.ownedAvatars || []), purchaseModal.item.name])];
        showToast(`${selectedStudent.firstName} bought the ${purchaseModal.item.name} avatar!`, 'success');
        break;
      case 'pet':
        const newPet = { ...purchaseModal.item, id: `pet_${Date.now()}` };
        updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), newPet];
        showToast(`${selectedStudent.firstName} adopted a ${purchaseModal.item.name}!`, 'success');
        break;
      case 'reward':
        updatedStudent.rewardsPurchased = [...(updatedStudent.rewardsPurchased || []), { ...purchaseModal.item, purchasedAt: new Date().toISOString() }];
        showToast(`${selectedStudent.firstName} earned ${purchaseModal.item.name}!`, 'success');
        break;
      default: return;
    }

    onUpdateStudent(updatedStudent);
    setPurchaseModal({ visible: false, item: null, type: null });
  };
  
  const handleEquip = (type, value) => {
    if (!selectedStudent) return;
    let updatedStudent = { ...selectedStudent };

    if (type === 'avatar') {
        updatedStudent.avatarBase = value;
    } else if (type === 'pet') {
        const petToEquip = updatedStudent.ownedPets.find(p => p.id === value);
        const otherPets = updatedStudent.ownedPets.filter(p => p.id !== value);
        updatedStudent.ownedPets = [petToEquip, ...otherPets];
    }
    
    onUpdateStudent(updatedStudent);
    showToast('Item equipped!', 'success');
  };

  const SHOP_CATEGORIES = [
      { id: 'basic_avatars', name: 'Basic Avatars' },
      { id: 'premium_avatars', name: 'Premium Avatars' },
      { id: 'basic_pets', name: 'Basic Pets' },
      { id: 'premium_pets', name: 'Premium Pets' },
      { id: 'rewards', name: 'Class Rewards' }
  ];

  const renderShopItems = () => {
      let items;
      let type;
      switch(activeCategory) {
          case 'basic_avatars': items = SHOP_BASIC_AVATARS; type = 'avatar'; break;
          case 'premium_avatars': items = SHOP_PREMIUM_AVATARS; type = 'avatar'; break;
          case 'basic_pets': items = SHOP_BASIC_PETS; type = 'pet'; break;
          case 'premium_pets': items = SHOP_PREMIUM_PETS; type = 'pet'; break;
          case 'rewards': items = TEACHER_REWARDS; type = 'reward'; break;
          default: items = [];
      }
      
      return items.map(item => {
          const isAvatar = type === 'avatar';
          const isPet = type === 'pet';
          const isReward = type === 'reward';
          const owned = isAvatar ? selectedStudent.ownedAvatars?.includes(item.name) : isPet ? selectedStudent.ownedPets?.some(p => p.name === item.name) : false;
          
          return (
            <div key={item.name || item.id} className={`border-2 rounded-lg p-4 text-center flex flex-col justify-between ${owned ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                {isReward ? (
                    <>
                        <div className="text-4xl">{item.icon}</div>
                        <p className="font-semibold mt-2">{item.name}</p>
                    </>
                ) : (
                    <img src={item.path} className="w-24 h-24 object-contain rounded-full mx-auto mb-2"/>
                )}

                {!isReward && <p className="font-semibold">{item.name}</p>}

                {owned ? (
                    <p className="font-bold text-green-600 mt-2">Owned</p>
                ) : (
                    <button onClick={() => setPurchaseModal({ visible: true, item: item, type: type })} disabled={calculateCoins(selectedStudent) < item.price} className="mt-2 w-full bg-blue-500 text-white text-sm py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">💰 {item.price}</button>
                )}
            </div>
          );
      });
  };

  return (
    <div className="space-y-6">
      {/* Student Selector */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🛒 Select a Champion to Shop</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {students.map(student => (
            <button key={student.id} onClick={() => setSelectedStudentId(student.id)} className={`p-3 rounded-lg border-2 transition-all ${selectedStudentId === student.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
              <img src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))} alt={student.firstName} className="w-16 h-16 rounded-full mx-auto mb-2"/>
              <p className="text-sm font-semibold truncate">{student.firstName}</p>
              <p className="text-xs text-yellow-600">💰 {calculateCoins(student)}</p>
            </button>
          ))}
        </div>
        {selectedStudent && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
                <img src={getAvatarImage(selectedStudent.avatarBase, calculateAvatarLevel(selectedStudent.totalPoints))} className="w-16 h-16 rounded-full border-2 border-white shadow-lg"/>
                <div>
                    <h4 className="text-lg font-bold text-gray-800">{selectedStudent.firstName} is shopping</h4>
                    <p className="font-semibold text-yellow-700">💰 {calculateCoins(selectedStudent)} coins available</p>
                </div>
            </div>
            <button onClick={() => setInventoryModal({ visible: true })} className="bg-purple-600 text-white font-semibold px-5 py-3 rounded-lg hover:bg-purple-700 shadow-md">View Inventory</button>
          </div>
        )}
      </div>

      {/* Shop Interface */}
      {selectedStudent && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex space-x-2 border-b pb-4 mb-4 overflow-x-auto">
                {SHOP_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${activeCategory === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{cat.name}</button>
                ))}
            </div>
            <div className={`grid gap-4 ${activeCategory === 'rewards' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'}`}>{renderShopItems()}</div>
        </div>
      )}

      {/* Purchase Modal */}
      {purchaseModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-6">
                <h2 className="text-2xl font-bold mb-4">Confirm Purchase</h2>
                <p className="mb-4">Buy {purchaseModal.item.name} for 💰{purchaseModal.item.price} coins?</p>
                <div className="flex gap-4">
                    <button onClick={() => setPurchaseModal({ visible: false, item: null, type: null })} className="flex-1 py-3 border rounded-lg">Cancel</button>
                    <button onClick={handlePurchase} className="flex-1 py-3 bg-green-500 text-white rounded-lg">Confirm</button>
                </div>
            </div>
        </div>
      )}

      {/* Inventory Modal */}
      {inventoryModal.visible && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{selectedStudent.firstName}'s Inventory</h2>
                    <button onClick={() => setInventoryModal({ visible: false })} className="text-2xl font-bold">×</button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Owned Avatars</h3>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                            {selectedStudent.ownedAvatars?.map(avatarName => (
                                <div key={avatarName} className={`border-2 rounded-lg p-2 text-center ${selectedStudent.avatarBase === avatarName ? 'border-blue-500' : ''}`}>
                                    <img src={getAvatarImage(avatarName, calculateAvatarLevel(selectedStudent.totalPoints))} className="w-16 h-16 rounded-full mx-auto mb-1"/>
                                    <p className="text-xs font-semibold truncate">{avatarName}</p>
                                    {selectedStudent.avatarBase === avatarName ? (<p className="text-xs text-blue-600 font-bold">Equipped</p>) : (
                                        <button onClick={() => handleEquip('avatar', avatarName)} className="text-xs bg-gray-200 px-2 py-0.5 rounded mt-1">Equip</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Owned Pets</h3>
                        {selectedStudent.ownedPets?.length > 0 ? (
                            <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
                                {selectedStudent.ownedPets.map((pet, index) => (
                                    <div key={pet.id} className={`border-2 rounded-lg p-2 text-center ${index === 0 ? 'border-blue-500' : ''}`}>
                                        <img src={getPetImage(pet)} className="w-16 h-16 rounded-full mx-auto mb-1"/>
                                        <p className="text-xs font-semibold truncate">{pet.name}</p>
                                        {index === 0 ? (<p className="text-xs text-blue-600 font-bold">Following</p>) : (
                                            <button onClick={() => handleEquip('pet', pet.id)} className="text-xs bg-gray-200 px-2 py-0.5 rounded mt-1">Equip</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (<p className="text-gray-500">No pets yet!</p>)}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ShopTab;