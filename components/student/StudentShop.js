// components/student/StudentShop.js - MOBILE OPTIMIZED
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
    { id: 'basic_avatars', name: 'Basic Avatars', shortName: 'Basic' },
    { id: 'premium_avatars', name: 'Premium Avatars', shortName: 'Premium' },
    { id: 'basic_pets', name: 'Basic Pets', shortName: 'Pets' },
    { id: 'premium_pets', name: 'Premium Pets', shortName: 'Rare Pets' },
    { id: 'rewards', name: 'Class Rewards', shortName: 'Rewards' }
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
        <div className="col-span-full text-center py-6 md:py-8">
          <div className="text-3xl md:text-4xl mb-2">📦</div>
          <p className="text-gray-500 text-sm md:text-base">No items available in this category yet.</p>
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
        <div key={item.name || item.id} className={`border-2 rounded-lg p-3 md:p-4 text-center ${owned ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
          {isReward ? (
            <div className="text-3xl md:text-4xl mb-2">{item.icon || '🎁'}</div>
          ) : (
            <img 
              src={item.path} 
              className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-full mx-auto mb-2"
              onError={(e) => {
                e.target.src = '/shop/Basic/Banana.png';
              }}
            />
          )}
          
          <p className="font-semibold mt-2 text-sm md:text-base">{item.name}</p>
          
          {owned ? (
            <p className="font-bold text-green-600 mt-2 text-sm">Owned ✓</p>
          ) : (
            <button 
              onClick={() => setPurchaseModal({ visible: true, item: item, type: type })} 
              disabled={currentCoins < item.price} 
              className="mt-2 w-full bg-blue-500 text-white text-xs md:text-sm py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 active:scale-95 transition-all"
            >
              💰 {item.price} coins
            </button>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Student Info Header - Mobile Optimized */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            <img 
              src={getAvatarImage(studentData.avatarBase, calculateAvatarLevel(studentData.totalPoints))} 
              className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-blue-300 shadow-lg flex-shrink-0"
              onError={(e) => {
                e.target.src = '/shop/Basic/Banana.png';
              }}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">{studentData.firstName}'s Shop</h2>
              <p className="text-base md:text-lg font-semibold text-yellow-600">💰 {currentCoins} coins available</p>
            </div>
          </div>
          <button 
            onClick={() => setInventoryModal({ visible: true })}
            className="bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-purple-700 text-sm md:text-base flex-shrink-0"
          >
            Inventory
          </button>
        </div>
      </div>

      {/* Shop Categories - Mobile Optimized */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
        <div className="flex space-x-1 md:space-x-2 border-b pb-3 md:pb-4 mb-4 md:mb-6 overflow-x-auto">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)} 
              className={`px-2 md:px-4 py-2 rounded-lg font-semibold whitespace-nowrap text-xs md:text-sm ${
                activeCategory === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="md:hidden">{cat.shortName}</span>
              <span className="hidden md:inline">{cat.name}</span>
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {renderShopItems()}
        </div>
      </div>

      {/* Purchase Modal - Mobile Optimized */}
      {purchaseModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-4 md:p-6">
            <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Confirm Purchase</h2>
            <p className="mb-4 text-sm md:text-base">Buy {purchaseModal.item.name} for 💰{purchaseModal.item.price} coins?</p>
            <div className="flex gap-3 md:gap-4">
              <button 
                onClick={() => setPurchaseModal({ visible: false, item: null, type: null })} 
                className="flex-1 py-2 md:py-3 border rounded-lg hover:bg-gray-50 text-sm md:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={handlePurchase} 
                className="flex-1 py-2 md:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm md:text-base"
              >
                Buy Now!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal - Mobile Optimized */}
      {inventoryModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-lg md:text-2xl font-bold">My Inventory</h2>
              <button 
                onClick={() => setInventoryModal({ visible: false })} 
                className="text-2xl font-bold hover:text-red-600"
              >
                ×
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
              {/* Owned Avatars */}
              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">My Avatars</h3>
                {studentData.ownedAvatars && studentData.ownedAvatars.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
                    {studentData.ownedAvatars.map(avatarName => (
                      <div key={avatarName} className={`border-2 rounded-lg p-2 md:p-3 text-center ${studentData.avatarBase === avatarName ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <img 
                          src={getAvatarImage(avatarName, calculateAvatarLevel(studentData.totalPoints))} 
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-1"
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
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded mt-1 hover:bg-blue-600 active:scale-95"
                          >
                            Equip
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm md:text-base">No avatars owned yet. Visit the shop to buy some!</p>
                )}
              </div>

              {/* Owned Pets */}
              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">My Pets</h3>
                {studentData.ownedPets?.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                    {studentData.ownedPets.map((pet, index) => (
                      <div key={pet.id} className={`border-2 rounded-lg p-2 md:p-3 text-center ${index === 0 ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                        <img 
                          src={getPetImage(pet)} 
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-1"
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
                            className="text-xs bg-purple-500 text-white px-2 py-1 rounded mt-1 hover:bg-purple-600 active:scale-95"
                          >
                            Equip
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm md:text-base">No pets yet! Get 50 XP to unlock your first pet.</p>
                )}
              </div>

              {/* Purchased Rewards */}
              {studentData.rewardsPurchased?.length > 0 && (
                <div>
                  <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">My Rewards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {studentData.rewardsPurchased.map((reward, index) => (
                      <div key={index} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 flex items-center gap-3">
                        <div className="text-xl md:text-2xl">{reward.icon || '🎁'}</div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm md:text-base">{reward.name}</p>
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

export default StudentShop;