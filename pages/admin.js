// pages/admin.js - Admin Panel for Classroom Champions
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { doc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('avatars');
  
  // Form states
  const [newAvatar, setNewAvatar] = useState({
    name: '',
    price: '',
    type: 'basic',
    imagePath: ''
  });
  
  const [newPet, setNewPet] = useState({
    name: '',
    price: '',
    type: 'basic',
    imagePath: ''
  });
  
  const [dashboardUpdate, setDashboardUpdate] = useState({
    title: '',
    description: '',
    type: 'feature',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [avatarList, setAvatarList] = useState([]);
  const [petList, setPetList] = useState([]);
  const [updatesList, setUpdatesList] = useState([]);
  
  const [message, setMessage] = useState({ text: '', type: '' });

  // Authentication check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        
        // Check if user is admin
        if (user.email === 'scotto6190@gmail.com') {
          setIsAdmin(true);
          await ensureAdminDocument(user.uid);
          await loadAllData();
        } else {
          setMessage({ text: 'Access denied. Admin privileges required.', type: 'error' });
          setTimeout(() => router.push('/'), 3000);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Ensure admin document exists
  const ensureAdminDocument = async (userId) => {
    try {
      const adminRef = doc(firestore, 'admins', userId);
      await setDoc(adminRef, {
        isAdmin: true,
        email: 'scotto6190@gmail.com',
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error creating admin document:', error);
    }
  };

  // Load all data
  const loadAllData = async () => {
    try {
      await loadAvatars();
      await loadPets();
      await loadUpdates();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Load avatars
  const loadAvatars = async () => {
    try {
      const avatarsRef = collection(firestore, 'shopData', 'avatars', 'items');
      const snapshot = await getDocs(avatarsRef);
      const avatars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvatarList(avatars);
    } catch (error) {
      console.error('Error loading avatars:', error);
    }
  };

  // Load pets
  const loadPets = async () => {
    try {
      const petsRef = collection(firestore, 'shopData', 'pets', 'items');
      const snapshot = await getDocs(petsRef);
      const pets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPetList(pets);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  // Load dashboard updates
  const loadUpdates = async () => {
    try {
      const updatesRef = collection(firestore, 'dashboardUpdates');
      const snapshot = await getDocs(updatesRef);
      const updates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUpdatesList(updates.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error loading updates:', error);
    }
  };

  // Add new avatar
  const handleAddAvatar = async (e) => {
    e.preventDefault();
    
    try {
      const avatarsRef = collection(firestore, 'shopData', 'avatars', 'items');
      await addDoc(avatarsRef, {
        name: newAvatar.name,
        price: parseInt(newAvatar.price),
        type: newAvatar.type,
        path: newAvatar.imagePath,
        createdAt: new Date().toISOString(),
        createdBy: user.email
      });
      
      setMessage({ text: 'Avatar added successfully!', type: 'success' });
      setNewAvatar({ name: '', price: '', type: 'basic', imagePath: '' });
      await loadAvatars();
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error adding avatar:', error);
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    }
  };

  // Add new pet
  const handleAddPet = async (e) => {
    e.preventDefault();
    
    try {
      const petsRef = collection(firestore, 'shopData', 'pets', 'items');
      await addDoc(petsRef, {
        name: newPet.name,
        price: parseInt(newPet.price),
        type: newPet.type,
        path: newPet.imagePath,
        createdAt: new Date().toISOString(),
        createdBy: user.email
      });
      
      setMessage({ text: 'Pet added successfully!', type: 'success' });
      setNewPet({ name: '', price: '', type: 'basic', imagePath: '' });
      await loadPets();
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error adding pet:', error);
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    }
  };

  // Add dashboard update
  const handleAddUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const updatesRef = collection(firestore, 'dashboardUpdates');
      await addDoc(updatesRef, {
        title: dashboardUpdate.title,
        description: dashboardUpdate.description,
        type: dashboardUpdate.type,
        date: dashboardUpdate.date,
        createdAt: new Date().toISOString(),
        createdBy: user.email
      });
      
      setMessage({ text: 'Dashboard update added successfully!', type: 'success' });
      setDashboardUpdate({ title: '', description: '', type: 'feature', date: new Date().toISOString().split('T')[0] });
      await loadUpdates();
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error adding update:', error);
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    }
  };

  // Delete item
  const handleDeleteItem = async (collectionPath, itemId, itemName) => {
    if (!confirm(`Are you sure you want to delete ${itemName}?`)) return;
    
    try {
      await deleteDoc(doc(firestore, collectionPath, itemId));
      setMessage({ text: 'Item deleted successfully!', type: 'success' });
      await loadAllData();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🛠️ Admin Panel</h1>
              <p className="text-gray-600">Classroom Champions Backend Management</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-semibold text-gray-800">{user?.email}</p>
              <button
                onClick={() => auth.signOut()}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div className={`container mx-auto px-4 py-4 mt-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-semibold text-center`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-4 mb-6">
          {['avatars', 'pets', 'updates'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'bg-purple-800 text-white hover:bg-purple-700'
              }`}
            >
              {tab === 'avatars' && '👤 '}{tab === 'pets' && '🐾 '}{tab === 'updates' && '📢 '}
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Avatars Tab */}
          {activeTab === 'avatars' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Avatar</h2>
              <form onSubmit={handleAddAvatar} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar Name</label>
                    <input
                      type="text"
                      value={newAvatar.name}
                      onChange={(e) => setNewAvatar({ ...newAvatar, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Wizard Boy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (Coins)</label>
                    <input
                      type="number"
                      value={newAvatar.price}
                      onChange={(e) => setNewAvatar({ ...newAvatar, price: e.target.value })}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newAvatar.type}
                      onChange={(e) => setNewAvatar({ ...newAvatar, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Path</label>
                    <input
                      type="text"
                      value={newAvatar.imagePath}
                      onChange={(e) => setNewAvatar({ ...newAvatar, imagePath: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="/shop/Basic/WizardBoy.png"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all"
                >
                  ➕ Add Avatar
                </button>
              </form>

              {/* Avatar List */}
              <h3 className="text-xl font-bold text-gray-800 mb-4">Current Avatars ({avatarList.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {avatarList.map(avatar => (
                  <div key={avatar.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{avatar.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        avatar.type === 'premium' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
                      }`}>
                        {avatar.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Price: {avatar.price} coins</p>
                    <p className="text-xs text-gray-500 mb-3 truncate">{avatar.path}</p>
                    <button
                      onClick={() => handleDeleteItem('shopData/avatars/items', avatar.id, avatar.name)}
                      className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pets Tab */}
          {activeTab === 'pets' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Pet</h2>
              <form onSubmit={handleAddPet} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pet Name</label>
                    <input
                      type="text"
                      value={newPet.name}
                      onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Dragon Pet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (Coins)</label>
                    <input
                      type="number"
                      value={newPet.price}
                      onChange={(e) => setNewPet({ ...newPet, price: e.target.value })}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newPet.type}
                      onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Path</label>
                    <input
                      type="text"
                      value={newPet.imagePath}
                      onChange={(e) => setNewPet({ ...newPet, imagePath: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="/shop/BasicPets/DragonPet.png"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all"
                >
                  ➕ Add Pet
                </button>
              </form>

              {/* Pet List */}
              <h3 className="text-xl font-bold text-gray-800 mb-4">Current Pets ({petList.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {petList.map(pet => (
                  <div key={pet.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{pet.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        pet.type === 'premium' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
                      }`}>
                        {pet.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Price: {pet.price} coins</p>
                    <p className="text-xs text-gray-500 mb-3 truncate">{pet.path}</p>
                    <button
                      onClick={() => handleDeleteItem('shopData/pets/items', pet.id, pet.name)}
                      className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dashboard Updates Tab */}
          {activeTab === 'updates' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Dashboard Update</h2>
              <form onSubmit={handleAddUpdate} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Title</label>
                    <input
                      type="text"
                      value={dashboardUpdate.title}
                      onChange={(e) => setDashboardUpdate({ ...dashboardUpdate, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., New Pet System Added!"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={dashboardUpdate.type}
                      onChange={(e) => setDashboardUpdate({ ...dashboardUpdate, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="feature">🎉 New Feature</option>
                      <option value="improvement">✨ Improvement</option>
                      <option value="bugfix">🐛 Bug Fix</option>
                      <option value="announcement">📢 Announcement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={dashboardUpdate.date}
                      onChange={(e) => setDashboardUpdate({ ...dashboardUpdate, date: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={dashboardUpdate.description}
                    onChange={(e) => setDashboardUpdate({ ...dashboardUpdate, description: e.target.value })}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe the update..."
                  />
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all"
                >
                  ➕ Add Update
                </button>
              </form>

              {/* Updates List */}
              <h3 className="text-xl font-bold text-gray-800 mb-4">Dashboard Updates ({updatesList.length})</h3>
              <div className="space-y-4">
                {updatesList.map(update => (
                  <div key={update.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 rounded text-sm font-semibold ${
                            update.type === 'feature' ? 'bg-green-200 text-green-800' :
                            update.type === 'improvement' ? 'bg-blue-200 text-blue-800' :
                            update.type === 'bugfix' ? 'bg-red-200 text-red-800' :
                            'bg-purple-200 text-purple-800'
                          }`}>
                            {update.type === 'feature' && '🎉'}{update.type === 'improvement' && '✨'}
                            {update.type === 'bugfix' && '🐛'}{update.type === 'announcement' && '📢'}
                            {' '}{update.type}
                          </span>
                          <span className="text-sm text-gray-500">{update.date}</span>
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg mb-2">{update.title}</h4>
                        <p className="text-gray-600">{update.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteItem('dashboardUpdates', update.id, update.title)}
                        className="ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm whitespace-nowrap"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}