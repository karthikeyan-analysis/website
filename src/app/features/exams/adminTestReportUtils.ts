import type { Student } from "../../context/DataContext";
import type { ExamAttempt, ExamTest } from "./types";

export function toIsoOrEmpty(value: unknown) {
  if (!value) return "";
  try {
    return new Date(value as string).toISOString();
  } catch {
    return String(value);
  }
}

export function percentScore(a: ExamAttempt, maxMarks: number) {
  const max = a.maxScore ?? maxMarks;
  const score = a.score;
  if (score == null || !Number.isFinite(max) || max <= 0) return null;
  return Math.round((score / max) * 1000) / 10;
}

export function attemptCompositeKey(testId: string, studentRecordIdOrUid: string) {
  return `${testId}::${studentRecordIdOrUid}`;
}

export function buildAttemptsLookup(pairs: { test: ExamTest; attempts: ExamAttempt[] }[]) {
  const m = new Map<string, ExamAttempt>();
  for (const { test, attempts } of pairs) {
    for (const a of attempts) {
      const sk = (a.studentRecordId || "").trim() || a.uid;
      if (sk) m.set(attemptCompositeKey(test.id, sk), a);
    }
  }
  return m;
}

/** Same rules as exams list for visibility (roster-aligned). */
export function isEligibleForExam(student: Student, test: ExamTest): boolean {
  if (test.visibility === "SELECTIVE") {
    const ids = test.selectedStudentRecordIds;
    return Array.isArray(ids) && ids.includes(student.id);
  }
  return Boolean(student.batchId && student.batchId === test.batchId);
}

export function presentAbsentLabel(
  student: Student,
  test: ExamTest,
  attemptsMap: Map<string, ExamAttempt>,
): string {
  if (!isEligibleForExam(student, test)) return "N/A";
  const a = attemptsMap.get(attemptCompositeKey(test.id, student.id));
  if (!a) return "Absent";
  return "Present";
}

export function scoreCellDisplay(
  student: Student,
  test: ExamTest,
  attemptsMap: Map<string, ExamAttempt>,
): string {
  if (!isEligibleForExam(student, test)) return "N/A";
  const a = attemptsMap.get(attemptCompositeKey(test.id, student.id));
  if (!a) return "";
  const maxMarks = test.totalMarks;
  if (a.status === "in_progress") return "In progress";
  const pct = percentScore(a, maxMarks);
  const score = a.score ?? "";
  const max = a.maxScore ?? maxMarks;
  const pctPart = pct != null ? `${pct}%` : "";
  if (score !== "" && pctPart) return `${score}/${max} (${pctPart})`;
  if (score !== "") return `${score}/${max}`;
  return "Submitted";
}

export function safeFileName(name: string) {
  return (name || "export").replace(/[\\/:*?"<>|]+/g, "_");
}
