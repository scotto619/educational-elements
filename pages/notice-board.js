import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { DEFAULT_NOTICE_ITEMS, saveNoticeBoard, subscribeToNoticeBoard } from '../services/noticeBoard';

const NoticeBoardManager = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState(DEFAULT_NOTICE_ITEMS);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(false);
      } else {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const unsubscribe = subscribeToNoticeBoard(user.uid, (board) => {
      setItems(board.items || DEFAULT_NOTICE_ITEMS);
      setStatus(board.updatedAt ? 'Live for students' : '');
      setIsDirty(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: 'New notice',
        content: '',
        link: '',
        createdAt: new Date().toISOString()
      }
    ]);
    setIsDirty(true);
  };

  const updateItem = (id, field, value) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    setIsDirty(true);
  };

  const removeItem = (id) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (filtered.length === 0) {
        return [
          {
            ...DEFAULT_NOTICE_ITEMS[0],
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
          }
        ];
      }
      return filtered;
    });
    setIsDirty(true);
  };

  const saveChanges = useCallback(async () => {
    if (!user?.uid) return;

    setSaving(true);
    setStatus('Saving...');

    try {
      const cleaned = items
        .map((item) => ({
          ...item,
          title: item.title?.trim() || '',
          content: item.content?.trim() || '',
          link: item.link?.trim() || '',
          id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        }))
        .filter((item) => item.title || item.content || item.link);

      const payload = cleaned.length > 0 ? cleaned : DEFAULT_NOTICE_ITEMS;
      await saveNoticeBoard(user.uid, payload);

      setStatus('Saved and live for students ✨');
      setIsDirty(false);
    } catch (error) {
      console.error('❌ Error saving notice board:', error);
      setStatus('Error saving notice board. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [items, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-700 font-semibold">Loading notice board...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notice Board Manager</h1>
            <p className="text-gray-600 mt-1">Create notes, reminders, and links that sync instantly to the student portal.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={saveChanges}
              disabled={saving || !isDirty}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-purple-100 rounded-xl shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className={`px-2 py-1 rounded-full font-semibold ${isDirty ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {isDirty ? 'Unsaved changes' : 'Live for students'}
            </span>
            {status && <span className="text-gray-500">{status}</span>}
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border border-purple-100 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Title</label>
                      <input
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={item.title}
                        onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                        placeholder="e.g., Excursion reminder"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Details</label>
                      <textarea
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows="2"
                        value={item.content}
                        onChange={(e) => updateItem(item.id, 'content', e.target.value)}
                        placeholder="Add notes, reminders, or instructions"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Link (optional)</label>
                      <input
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={item.link}
                        onChange={(e) => updateItem(item.id, 'link', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start text-red-600 hover:text-red-700 text-sm font-semibold"
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={addItem}
                type="button"
                className="flex-1 sm:flex-none bg-white border border-purple-300 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50"
              >
                ➕ Add notice
              </button>
              <button
                onClick={saveChanges}
                type="button"
                disabled={saving || !isDirty}
                className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save & Publish'}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Changes appear automatically for students once saved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeBoardManager;
