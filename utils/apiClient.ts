// utils/apiClient.ts
import { getAuth } from 'firebase/auth';

export interface StudentUpdateOptions {
  studentId: string;
  classCode: string;
  /** e.g. { totalPoints: 1 } or { currency: -1 } or { clickerGameData: {...} } */
  updateData: Record<string, unknown>;
  /** 'increment' for numbers, 'set' for objects. Default: 'increment' */
  mode?: 'increment' | 'set';
  note?: string;
  /** Optional idempotency key */
  opId?: string;
  /** Optional override; normally auto-filled from Firebase Auth */
  teacherUserId?: string | null;
}

export interface StudentUpdateResult {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export async function postStudentUpdate({
  studentId,
  classCode,
  updateData,
  mode = 'increment',
  note = '',
  opId,
  teacherUserId,
}: StudentUpdateOptions): Promise<StudentUpdateResult> {
  const auth = getAuth();
  const uid = teacherUserId ?? auth.currentUser?.uid ?? null;

  const res = await fetch('/api/student-update-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId,
      classCode,
      updateData,
      mode,
      note,
      opId,
      teacherUserId: uid,
    }),
  });

  if (!res.ok) {
    let msg = `Student update failed (${res.status})`;
    try {
      const body = await res.json();
      msg = body?.message ?? body?.error ?? msg;
    } catch { /* ignore parse errors */ }
    throw new Error(msg);
  }

  return res.json();
}
