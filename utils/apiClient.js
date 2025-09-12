// utils/apiClient.js
export async function postStudentUpdate({
  studentId,
  classCode,
  updateData,           // e.g. { totalPoints: 1 } or { currency: -2 } or { clickerGameData: {...} }
  mode = 'increment',   // 'increment' for numbers; 'set' for object data (e.g., clicker saves)
  note = '',
  opId = undefined,     // optional idempotency key to prevent duplicate applies
}) {
  const res = await fetch('/api/student-update-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, classCode, updateData, mode, note, opId }),
  });

  if (!res.ok) {
    let msg = `Student update failed (${res.status})`;
    try {
      const err = await res.json();
      msg = err?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
