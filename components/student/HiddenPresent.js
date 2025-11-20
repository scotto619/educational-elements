import React, { useEffect, useMemo, useState } from 'react';

const EVENT_KEY = 'christmas-gift-hunt-2024';

const getGiftKey = (giftId) => `${EVENT_KEY}:${giftId}`;

const HiddenPresent = ({
  giftId,
  studentData,
  updateStudentData,
  showToast,
  className = '',
  style = {},
  size = 18,
  label = 'Secret present'
}) => {
  const giftKey = useMemo(() => getGiftKey(giftId), [giftId]);
  const [claimed, setClaimed] = useState(() => Boolean(studentData?.hiddenGifts?.[giftKey]));

  useEffect(() => {
    setClaimed(Boolean(studentData?.hiddenGifts?.[giftKey]));
  }, [studentData, giftKey]);

  if (!studentData || !updateStudentData || claimed) {
    return null;
  }

  const handleClaim = async (event) => {
    event?.stopPropagation?.();
    event?.preventDefault?.();

    const reward = Math.max(1, Math.min(15, Math.floor(Math.random() * 15) + 1));
    const foundAt = new Date().toISOString();

    const nextHiddenGifts = {
      ...(studentData.hiddenGifts || {}),
      [giftKey]: {
        reward,
        foundAt
      }
    };

    const updates = {
      hiddenGifts: nextHiddenGifts,
      currency: (studentData.currency || 0) + reward
    };

    const success = await updateStudentData(updates);

    if (success) {
      setClaimed(true);
      if (showToast) {
        showToast(`You found a hidden present and earned ${reward} coins!`, 'success');
      }
    } else if (showToast) {
      showToast('Could not collect that present. Please try again.', 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClaim}
      className={`hidden-present inline-flex items-center justify-center rounded-full border border-pink-100 bg-white/80 text-rose-500 shadow-sm opacity-80 hover:opacity-100 hover:scale-110 hover:-rotate-3 transition transform focus:outline-none focus:ring-2 focus:ring-pink-300 ${
        className || ''
      }`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        fontSize: Math.max(8, Math.floor(size * 0.55)),
        ...style
      }}
      aria-label={label}
      title={label}
    >
      <span className="sr-only">Hidden Christmas present</span>
      <span aria-hidden className="leading-none">🎁</span>
    </button>
  );
};

export default HiddenPresent;
