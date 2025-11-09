import { auth } from '../utils/firebase';

const withAuthFetch = async (url, options = {}) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('You must be signed in as the owner to perform this action.');
  }

  const token = await currentUser.getIdToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let message = 'Request failed.';
    try {
      const data = await response.json();
      message = data.error || message;
    } catch (err) {
      // Ignore JSON parse errors and fall back to generic message
    }
    throw new Error(message);
  }

  return response;
};

export const loadAdminContent = async () => {
  const response = await withAuthFetch('/api/admin/global-content');
  return response.json();
};

export const saveShopItem = async (item) => {
  const response = await withAuthFetch('/api/admin/global-shop', {
    method: 'POST',
    body: JSON.stringify({ item })
  });
  return response.json();
};

export const setShopItemActive = async (id, active) => {
  const response = await withAuthFetch('/api/admin/global-shop', {
    method: 'PATCH',
    body: JSON.stringify({ id, active })
  });
  return response.json();
};

export const removeShopItem = async (id) => {
  await withAuthFetch(`/api/admin/global-shop?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
};

export const saveDashboardUpdate = async (update) => {
  const response = await withAuthFetch('/api/admin/dashboard-updates', {
    method: 'POST',
    body: JSON.stringify({ update })
  });
  return response.json();
};

export const setDashboardUpdateActive = async (id, active) => {
  const response = await withAuthFetch('/api/admin/dashboard-updates', {
    method: 'PATCH',
    body: JSON.stringify({ id, active })
  });
  return response.json();
};

export const removeDashboardUpdate = async (id) => {
  await withAuthFetch(`/api/admin/dashboard-updates?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
};
