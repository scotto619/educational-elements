import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import {
  mergeShopInventories
} from '../../services/globalContent';
import { auth } from '../../utils/firebase';
import { OWNER_EMAILS as CONFIGURED_OWNER_EMAILS } from '../../utils/ownerEmails';

const OWNER_EMAILS = CONFIGURED_OWNER_EMAILS;

const SHOP_DEFAULT = {
  name: '',
  price: 10,
  category: 'basic',
  type: 'avatar',
  rarity: 'custom',
  path: '',
  description: ''
};

const UPDATE_DEFAULT = {
  title: '',
  status: 'NEW',
  summary: '',
  highlight: ''
};

const statusStyles = {
  NEW: 'bg-green-100 text-green-700',
  IMPROVED: 'bg-blue-100 text-blue-700',
  ENHANCED: 'bg-purple-100 text-purple-700',
  UPDATE: 'bg-gray-100 text-gray-700'
};

const AdminGuard = ({ children }) => {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setState({ loading: false, allowed: false });
        router.replace('/login');
        return;
      }

      const email = user.email?.toLowerCase();
      if (OWNER_EMAILS.length > 0 && email && OWNER_EMAILS.includes(email)) {
        setState({ loading: false, allowed: true });
      } else {
        setState({ loading: false, allowed: false });
        router.replace('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-pulse text-lg">Checking access…</div>
      </div>
    );
  }

  if (!state.allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <p className="text-lg font-semibold">Access restricted to the site owner.</p>
          <p className="text-sm opacity-70">Use the owner account to continue.</p>
        </div>
      </div>
    );
  }

  return children;
};

const AdminPortal = () => {
  const [shopForm, setShopForm] = useState(SHOP_DEFAULT);
  const [updateForm, setUpdateForm] = useState(UPDATE_DEFAULT);
  const [shopItems, setShopItems] = useState([]);
  const [shopInventory, setShopInventory] = useState({ basicAvatars: [], premiumAvatars: [], basicPets: [], premiumPets: [] });
  const [updates, setUpdates] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const resetShopForm = () => setShopForm(SHOP_DEFAULT);
  const resetUpdateForm = () => setUpdateForm(UPDATE_DEFAULT);

  const getCurrentToken = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be signed in to use the owner tools.');
    }
    return currentUser.getIdToken();
  }, []);

  const callAdminApi = useCallback(async (path, { method = 'GET', body } = {}) => {
    const token = await getCurrentToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    let payload;
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }

    const response = await fetch(path, {
      method,
      headers,
      body: payload,
    });

    let data = null;
    if (response.status !== 204) {
      try {
        data = await response.json();
      } catch (error) {
        data = null;
      }
    }

    if (!response.ok) {
      const error = new Error(data?.error || 'Request failed');
      error.status = response.status;
      error.details = data?.details;
      throw error;
    }

    return data;
  }, [getCurrentToken]);

  const loadContent = useCallback(async () => {
    setBusy(true);
    try {
      const [shopResponse, updatesResponse] = await Promise.all([
        callAdminApi('/api/admin/shop-items'),
        callAdminApi('/api/admin/dashboard-updates?includeInactive=1')
      ]);

      setShopItems(shopResponse?.items || []);
      setShopInventory(shopResponse?.inventory || { basicAvatars: [], premiumAvatars: [], basicPets: [], premiumPets: [] });
      setUpdates(updatesResponse?.updates || []);
      setMessage(null);
    } catch (error) {
      console.error('Failed to load admin content', error);
      setMessage({ type: 'error', text: error.message || 'Could not load data. Check console for details.' });
    } finally {
      setBusy(false);
    }
  }, [callAdminApi]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleShopSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);

    try {
      await callAdminApi('/api/admin/shop-items', {
        method: shopForm.id ? 'PUT' : 'POST',
        body: shopForm
      });
      resetShopForm();
      setMessage({ type: 'success', text: 'Shop item saved and live for all classrooms.' });
      await loadContent();
    } catch (error) {
      console.error('Failed to save shop item', error);
      setMessage({ type: 'error', text: error.message || 'Unable to save shop item. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);

    try {
      await callAdminApi('/api/admin/dashboard-updates', {
        method: updateForm.id ? 'PUT' : 'POST',
        body: updateForm
      });
      resetUpdateForm();
      setMessage({ type: 'success', text: 'Dashboard update published successfully.' });
      await loadContent();
    } catch (error) {
      console.error('Failed to save dashboard update', error);
      setMessage({ type: 'error', text: error.message || 'Unable to save dashboard update. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const toggleShopItem = async (item) => {
    setBusy(true);
    try {
      await callAdminApi('/api/admin/shop-items', {
        method: 'PATCH',
        body: { id: item.id, active: !item.active }
      });
      await loadContent();
    } catch (error) {
      console.error('Failed to toggle shop item', error);
      setMessage({ type: 'error', text: error.message || 'Unable to change item visibility.' });
    } finally {
      setBusy(false);
    }
  };

  const deleteShopItem = async (item) => {
    if (!window.confirm(`Remove ${item.name} from the global shop?`)) return;

    setBusy(true);
    try {
      await callAdminApi(`/api/admin/shop-items?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE'
      });
      await loadContent();
    } catch (error) {
      console.error('Failed to delete shop item', error);
      setMessage({ type: 'error', text: error.message || 'Unable to delete item.' });
    } finally {
      setBusy(false);
    }
  };

  const toggleUpdate = async (update) => {
    setBusy(true);
    try {
      await callAdminApi('/api/admin/dashboard-updates', {
        method: 'PATCH',
        body: { id: update.id, active: !update.active }
      });
      await loadContent();
    } catch (error) {
      console.error('Failed to toggle dashboard update', error);
      setMessage({ type: 'error', text: error.message || 'Unable to change update visibility.' });
    } finally {
      setBusy(false);
    }
  };

  const deleteUpdate = async (update) => {
    if (!window.confirm(`Delete update "${update.title}"?`)) return;

    setBusy(true);
    try {
      await callAdminApi(`/api/admin/dashboard-updates?id=${encodeURIComponent(update.id)}`, {
        method: 'DELETE'
      });
      await loadContent();
    } catch (error) {
      console.error('Failed to delete dashboard update', error);
      setMessage({ type: 'error', text: error.message || 'Unable to delete update.' });
    } finally {
      setBusy(false);
    }
  };

  const activeShopInventory = useMemo(() => mergeShopInventories({
    basicAvatars: [],
    premiumAvatars: [],
    basicPets: [],
    premiumPets: []
  }, shopInventory), [shopInventory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-bold">Owner Control Center</h1>
          <p className="text-sm text-slate-400">Add new avatars and pets to the marketplace and broadcast updates to every dashboard.</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-10">
        {message && (
          <div className={`rounded-lg border px-4 py-3 text-sm ${message.type === 'success' ? 'border-green-500/50 bg-green-500/10 text-green-200' : 'border-red-500/50 bg-red-500/10 text-red-200'}`}>
            {message.text}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold mb-4">Add Global Shop Item</h2>
            <form onSubmit={handleShopSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm font-medium text-slate-300">
                  Item Name
                  <input
                    required
                    value={shopForm.name}
                    onChange={(event) => setShopForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                    placeholder="Phoenix Rider"
                  />
                </label>
                <label className="text-sm font-medium text-slate-300">
                  Price (coins)
                  <input
                    type="number"
                    min="1"
                    value={shopForm.price}
                    onChange={(event) => setShopForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="text-sm font-medium text-slate-300">
                  Type
                  <select
                    value={shopForm.type}
                    onChange={(event) => setShopForm((prev) => ({ ...prev, type: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                  >
                    <option value="avatar">Avatar</option>
                    <option value="pet">Pet</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-300">
                  Category
                  <select
                    value={shopForm.category}
                    onChange={(event) => setShopForm((prev) => ({ ...prev, category: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-300">
                  Rarity
                  <select
                    value={shopForm.rarity}
                    onChange={(event) => setShopForm((prev) => ({ ...prev, rarity: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                  >
                    <option value="custom">Custom</option>
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </label>
              </div>

              <label className="text-sm font-medium text-slate-300">
                Image Path or URL
                <input
                  required
                  value={shopForm.path}
                  onChange={(event) => setShopForm((prev) => ({ ...prev, path: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                  placeholder="/shop/Seasonal/PhoenixRider.png"
                />
              </label>

              <label className="text-sm font-medium text-slate-300">
                Description (optional)
                <textarea
                  value={shopForm.description}
                  onChange={(event) => setShopForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                  rows={3}
                  placeholder="Fiery classroom companion with a loyalty bonus."
                />
              </label>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetShopForm}
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Reset form
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-purple-400 disabled:opacity-50"
                >
                  {shopForm.id ? 'Update Item' : 'Publish Item'}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold mb-4">Post Dashboard Update</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <label className="text-sm font-medium text-slate-300">
                Title
                <input
                  required
                  value={updateForm.title}
                  onChange={(event) => setUpdateForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                  placeholder="New Pet Racing Season"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm font-medium text-slate-300">
                  Status Badge
                  <select
                    value={updateForm.status}
                    onChange={(event) => setUpdateForm((prev) => ({ ...prev, status: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                  >
                    <option value="NEW">New</option>
                    <option value="IMPROVED">Improved</option>
                    <option value="ENHANCED">Enhanced</option>
                    <option value="UPDATE">Update</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-300">
                  Highlight (optional)
                  <input
                    value={updateForm.highlight}
                    onChange={(event) => setUpdateForm((prev) => ({ ...prev, highlight: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                    placeholder="Rollout in progress"
                  />
                </label>
              </div>

              <label className="text-sm font-medium text-slate-300">
                Summary
                <textarea
                  required
                  value={updateForm.summary}
                  onChange={(event) => setUpdateForm((prev) => ({ ...prev, summary: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                  rows={4}
                  placeholder="Explain what changed so teachers can share with students."
                />
              </label>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetUpdateForm}
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Reset form
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-400 disabled:opacity-50"
                >
                  {updateForm.id ? 'Update Announcement' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">Live Shop Inventory</h2>
            <p className="text-xs text-slate-400">Automatically available to every teacher and student shop.</p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {['basicAvatars', 'premiumAvatars', 'basicPets', 'premiumPets'].map((key) => (
              <div key={key} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold capitalize text-slate-200">{key.replace('Avatars', ' avatars').replace('Pets', ' pets')}</h3>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">
                    {activeShopInventory[key].length}
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {activeShopInventory[key].length === 0 && (
                    <li className="text-slate-500">No custom items yet.</li>
                  )}
                  {activeShopInventory[key].slice(0, 6).map(item => (
                    <li key={item.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{item.name}</span>
                      <span className="text-slate-400">💰 {item.price}</span>
                    </li>
                  ))}
                  {activeShopInventory[key].length > 6 && (
                    <li className="text-slate-500">+{activeShopInventory[key].length - 6} more…</li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Item</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Category</th>
                  <th className="px-3 py-2 text-left font-medium">Price</th>
                  <th className="px-3 py-2 text-left font-medium">Visibility</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {shopItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-slate-500">
                      No items yet. Add your first avatar or pet above.
                    </td>
                  </tr>
                )}
                {shopItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-100">{item.name}</div>
                      {item.description && <div className="text-xs text-slate-500">{item.description}</div>}
                    </td>
                    <td className="px-3 py-3 capitalize text-slate-300">{item.type}</td>
                    <td className="px-3 py-3 capitalize text-slate-300">{item.category}</td>
                    <td className="px-3 py-3 text-slate-300">💰 {item.price}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${item.active ? 'bg-green-500/10 text-green-300' : 'bg-slate-800 text-slate-400'}`}>
                        {item.active ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setShopForm({ ...item, path: item.path })}
                        className="text-xs text-blue-300 hover:text-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleShopItem(item)}
                        className="text-xs text-amber-300 hover:text-amber-100"
                      >
                        {item.active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteShopItem(item)}
                        className="text-xs text-red-300 hover:text-red-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">Dashboard Announcements</h2>
            <p className="text-xs text-slate-400">These appear on every teacher dashboard and Classroom Champions tab.</p>
          </div>

          <div className="mt-4 space-y-3">
            {updates.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-slate-500">
                No announcements yet. Publish your first update above.
              </div>
            )}
            {updates.map((update) => (
              <article key={update.id} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[update.status] || statusStyles.UPDATE}`}>
                        {update.status}
                      </span>
                      {update.highlight && (
                        <span className="text-xs text-slate-400">{update.highlight}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-100">{update.title}</h3>
                    <p className="text-sm text-slate-300">{update.summary}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setUpdateForm(update)}
                      className="text-xs text-blue-300 hover:text-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleUpdate(update)}
                      className="text-xs text-amber-300 hover:text-amber-100"
                    >
                      {update.active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteUpdate(update)}
                      className="text-xs text-red-300 hover:text-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {busy && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center text-slate-100">
          <div className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-4 text-sm">Saving changes…</div>
        </div>
      )}
    </div>
  );
};

const AdminPage = () => (
  <AdminGuard>
    <AdminPortal />
  </AdminGuard>
);

export default AdminPage;
