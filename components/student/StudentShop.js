// components/student/StudentShop.js - FIXED VERSION
import React, { useState } from 'react';

const StudentShop = ({ 
  studentData,
  updateStudentData,
  showToast,
  getAvatarImage,
  getPetImage,
  calculateCoins,
  calculateAvatarLevel,
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  classRewards
}) => {
  const [activeCategory, setActiveCategory] = useState('basic_avatars');
  const [purchaseModal, setPurchaseModal] = useState({ visible: false, item: null, type: null });
  const [inventoryModal, setInventoryModal] = useState({ visible: false });

  const currentCoins = calculateCoins(studentData);

  const handlePurchase = async () => {
    if (!purchaseModal.item) return;

    if (currentCoins < purchaseModal.item.price) {
      showToast(`You need ${purchaseModal.item.price - currentCoins} more coins!`, 'error');
      return;
    }

    let updates = {
      coinsSpent: (studentData.coinsSpent || 0) + purchaseModal.item.price
    };

    switch (purchaseModal.type) {
      case 'avatar':
        updates.ownedAvatars = [...new Set([...(studentData.ownedAvatars || []), purchaseModal.item.name])];
        showToast(`You bought the ${purchaseModal.item.name} avatar!`, 'success');
        break;
      case 'pet':
        const newPet = { ...purchaseModal.item, id: `pet_${Date.now()}` };
        updates.ownedPets = [...(studentData.ownedPets || []), newPet];
        showToast(`You adopted a ${purchaseModal.item.name}!`, 'success');
        break;
      case 'reward':
        updates.rewardsPurchased = [...(studentData.rewardsPurchased || []), { 
          ...purchaseModal.item, 
          purchasedAt: new Date().toISOString() 
        }];
        showToast(`You earned ${purchaseModal.item.name}!`, 'success');
        break;
    }

    const success = await updateStudentData(updates);
    if (success) {
      setPurchaseModal({ visible: false, item: null, type: null });
    } else {
      showToast('Purchase failed. Please try again.', 'error');
    }
  };

  const handleEquip = async (type, value) => {
    let updates = {};
    
    if (type === 'avatar') {
      updates.avatarBase = value;
      showToast('Avatar equipped!', 'success');
    } else if (type === 'pet') {
      const petToEquip = studentData.ownedPets.find(p => p.id === value);
      const otherPets = studentData.ownedPets.filter(p => p.id !== value);
      updates.ownedPets = [petToEquip, ...otherPets];
      showToast('Pet equipped!', 'success');
    }
    
    await updateStudentData(updates);
  };

  const categories = [
    { id: 'basic_avatars', name: 'Basic Avatars' },
    { id: 'premium_avatars', name: 'Premium Avatars' },
    { id: 'basic_pets', name: 'Basic Pets' },
    { id: 'premium_pets', name: 'Premium Pets' },
    { id: 'rewards', name: 'Class Rewards' }
  ];

  const renderShopItems = () => {
    let items, type;
    switch(activeCategory) {
      case 'basic_avatars': items = SHOP_BASIC_AVATARS; type = 'avatar'; break;
      case 'premium_avatars': items = SHOP_PREMIUM_AVATARS; type = 'avatar'; break;
      case 'basic_pets': items = SHOP_BASIC_PETS; type = 'pet'; break;
      case 'premium_pets': items = SHOP_PREMIUM_PETS; type = 'pet'; break;
      case 'rewards': items = classRewards || []; type = 'reward'; break;
      default: items = [];
    }

    if (!items || items.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <div className="text-4xl mb-2">📦</div>
          <p className="text-gray-500">No items available in this category yet.</p>
        </div>
      );
    }

    return items.map(item => {
      const isAvatar = type === 'avatar';
      const isPet = type === 'pet';
      const isReward = type === 'reward';
      const owned = isAvatar ? studentData?.ownedAvatars?.includes(item.name) : 
                    isPet ? studentData?.ownedPets?.some(p => p.name === item.name) : false;
      
      return (
        <div key={item.name || item.id} className={`border-2 rounded-lg p-4 text-center ${owned ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
          {isReward ? (
            <div className="text-4xl mb-2">{item.icon || '🎁'}</div>
          ) : (
            <img 
              src={item.path} 
              className="w-24 h-24 object-contain rounded-full mx-auto mb-2"
              onError={(e) => {
                e.target.src = '/shop/Basic/Banana.png'; // Fallback
              }}
            />
          )}
          
          <p className="font-semibold mt-2">{item.name}</p>
          
          {owned ? (
            <p className="font-bold text-green-600 mt-2">Owned ✓</p>
          ) : (
            <button 
              onClick={() => setPurchaseModal({ visible: true, item: item, type: type })} 
              disabled={currentCoins < item.price} 
              className="mt-2 w-full bg-blue-500 text-white text-sm py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              💰 {item.price} coins
            </button>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Student Info Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={getAvatarImage(studentData.avatarBase, calculateAvatarLevel(studentData.totalPoints))} 
              className="w-16 h-16 rounded-full border-2 border-blue-300 shadow-lg"
              onError={(e) => {
                e.target.src = '/shop/Basic/Banana.png'; // Fallback
              }}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{studentData.firstName}'s Shop</h2>
              <p className="text-lg font-semibold text-yellow-600">💰 {currentCoins} coins available</p>
            </div>
          </div>
          <button 
            onClick={() => setInventoryModal({ visible: true })}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            View Inventory
          </button>
        </div>
      </div>

      {/* Shop Categories */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex space-x-2 border-b pb-4 mb-6 overflow-x-auto">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)} 
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                activeCategory === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {renderShopItems()}
        </div>
      </div>

      {/* Purchase Modal */}
      {purchaseModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-6">
            <h2 className="text-2xl font-bold mb-4">Confirm Purchase</h2>
            <p className="mb-4">Buy {purchaseModal.item.name} for 💰{purchaseModal.item.price} coins?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setPurchaseModal({ visible: false, item: null, type: null })} 
                className="flex-1 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handlePurchase} 
                className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Buy Now!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {inventoryModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Inventory</h2>
              <button 
                onClick={() => setInventoryModal({ visible: false })} 
                className="text-2xl font-bold hover:text-red-600"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Owned Avatars */}
              <div>
                <h3 className="font-bold text-lg mb-3">My Avatars</h3>
                {studentData.ownedAvatars && studentData.ownedAvatars.length > 0 ? (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {studentData.ownedAvatars.map(avatarName => (
                      <div key={avatarName} className={`border-2 rounded-lg p-2 text-center ${studentData.avatarBase === avatarName ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <img 
                          src={getAvatarImage(avatarName, calculateAvatarLevel(studentData.totalPoints))} 
                          className="w-16 h-16 rounded-full mx-auto mb-1"
                          onError={(e) => {
                            e.target.src = '/shop/Basic/Banana.png';
                          }}
                        />
                        <p className="text-xs font-semibold truncate">{avatarName}</p>
                        {studentData.avatarBase === avatarName ? (
                          <p className="text-xs text-blue-600 font-bold">Equipped</p>
                        ) : (
                          <button 
                            onClick={() => handleEquip('avatar', avatarName)} 
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded mt-1 hover:bg-blue-600"
                          >
                            Equip
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No avatars owned yet. Visit the shop to buy some!</p>
                )}
              </div>

              {/* Owned Pets */}
              <div>
                <h3 className="font-bold text-lg mb-3">My Pets</h3>
                {studentData.ownedPets?.length > 0 ? (
                  <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
                    {studentData.ownedPets.map((pet, index) => (
                      <div key={pet.id} className={`border-2 rounded-lg p-2 text-center ${index === 0 ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                        <img 
                          src={getPetImage(pet)} 
                          className="w-16 h-16 rounded-full mx-auto mb-1"
                          onError={(e) => {
                            e.target.src = '/shop/BasicPets/Wizard.png';
                          }}
                        />
                        <p className="text-xs font-semibold truncate">{pet.name}</p>
                        {index === 0 ? (
                          <p className="text-xs text-purple-600 font-bold">Active</p>
                        ) : (
                          <button 
                            onClick={() => handleEquip('pet', pet.id)} 
                            className="text-xs bg-purple-500 text-white px-2 py-1 rounded mt-1 hover:bg-purple-600"
                          >
                            Equip
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No pets yet! Get 50 XP to unlock your first pet.</p>
                )}
              </div>

              {/* Purchased Rewards */}
              {studentData.rewardsPurchased?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">My Rewards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {studentData.rewardsPurchased.map((reward, index) => (
                      <div key={index} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 flex items-center gap-3">
                        <div className="text-2xl">{reward.icon || '🎁'}</div>
                        <div>
                          <p className="font-semibold">{reward.name}</p>
                          <p className="text-xs text-gray-600">Earned: {new Date(reward.purchasedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// FIXED: Use default export
export default StudentShop;