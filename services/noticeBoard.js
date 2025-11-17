import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { firestore } from '../utils/firebase';

export const DEFAULT_NOTICE_ITEMS = [
  {
    id: 'welcome-note',
    title: 'Welcome to the Notice Board',
    content: 'Share reminders, links, and classroom announcements here. Students will see updates instantly.',
    link: '',
    createdAt: new Date().toISOString()
  }
];

export const subscribeToNoticeBoard = (teacherId, callback) => {
  if (!teacherId) {
    return () => {};
  }

  const noticeRef = doc(firestore, 'noticeBoards', teacherId);

  return onSnapshot(
    noticeRef,
    (snapshot) => {
      const data = snapshot.data();
      const items = data?.items || DEFAULT_NOTICE_ITEMS;
      callback({ items, updatedAt: data?.updatedAt });
    },
    (error) => {
      console.error('❌ Error subscribing to notice board:', error);
      callback({ items: DEFAULT_NOTICE_ITEMS });
    }
  );
};

export const saveNoticeBoard = async (teacherId, items = []) => {
  if (!teacherId) {
    throw new Error('Teacher ID is required to save notice board');
  }

  const noticeRef = doc(firestore, 'noticeBoards', teacherId);
  await setDoc(
    noticeRef,
    {
      teacherId,
      items,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
};
