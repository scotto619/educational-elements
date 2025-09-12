// utils/apiClient.js
export async function postStudentUpdate({
  studentId,
  classCode,
  updateData,           // e.g. { totalPoints: 1 } or { currency: -1 } or { clickerGameData: {...} }
  mode = 'increment',   // 'increment' (numbers) or 'set' (objects)
  note = '',
  opId,                 // optional idempotency key
}) {
  const res = await fetch('/api/student-update-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, classCode, updateData, mode, note, opId }),
  });
  if (!res.ok) {
    let msg = `Student update failed (${res.status})`;
    try { msg = (await res.json())?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}
