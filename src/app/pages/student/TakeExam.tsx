import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../context/AuthContext";
import bannerImage from "../../../banner.jpeg";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../components/ui/utils";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { PLATFORM_INSTRUCTIONS_TEXT } from "./cbtInstructions";
import instruction1 from "../../../instructions/1.jpg";
import instruction2 from "../../../instructions/2.jpg";
import instruction3 from "../../../instructions/3.jpg";
import instruction4 from "../../../instructions/4.jpg";
import instruction5 from "../../../instructions/5.jpg";
import instruction6 from "../../../instructions/6.jpg";
import instruction7 from "../../../instructions/7.jpg";
import instruction8 from "../../../instructions/8.jpg";
import instruction9 from "../../../instructions/9.jpg";
import {
  getAttempt,
  getExamTest,
  listPrivateQuestions,
  listPublicQuestions,
  saveAttemptProgress,
  startAttempt,
} from "../../features/exams/examApi";
import type {
  ExamQuestionPrivate,
  ExamQuestionPublic,
  ExamShowAnswersAfter,
  ExamTest,
} from "../../features/exams/types";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { ChevronLeft, ChevronRight, Clock, Flag, Loader2, Save, XCircle } from "lucide-react";
import { submitAttempt } from "../../features/exams/examApi";
import { sha256Base64 } from "../../features/exams/password";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTimeLeft(totalSeconds: number) {
  const s = clamp(Math.floor(totalSeconds), 0, Number.MAX_SAFE_INTEGER);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** Passport-style label initials when no photo URL. */
function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

function canShowAnswers(params: {
  showAnswersAfter: ExamShowAnswersAfter;
  nowMs: number;
  endAtMs: number;
}) {
  if (params.showAnswersAfter === "never") return false;
  if (params.showAnswersAfter === "after_end") return params.nowMs >= params.endAtMs;
  return true;
}

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [test, setTest] = useState<ExamTest | null>(null);
  const [questions, setQuestions] = useState<ExamQuestionPublic[]>([]);
  const [correctKeys, setCorrectKeys] = useState<ExamQuestionPrivate[] | null>(null);

  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwVerified, setPwVerified] = useState(false);
  const [pwChecking, setPwChecking] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [visited, setVisited] = useState<Record<string, true>>({});
  const [attemptStartedAtIso, setAttemptStartedAtIso] = useState<string | null>(null);
  const [attemptSubmittedAtIso, setAttemptSubmittedAtIso] = useState<string | null>(null);
  const [attemptStatus, setAttemptStatus] = useState<"in_progress" | "submitted" | null>(null);
  const [score, setScore] = useState<{ score: number; maxScore: number } | null>(null);

  const autosaveTimer = useRef<number | null>(null);

  const nowTick = useNowTicker(1000);

  const testId = id || "";
  const uid = user?.id || "";
  const pwSessionKey = useMemo(() => `exam_pw_ok:${testId}:${uid}`, [testId, uid]);
  const instructionsSessionKey = useMemo(() => `cbt_instr_ok:${testId}:${uid}`, [testId, uid]);
  const [instructionsOk, setInstructionsOk] = useState(false);
  const [instructionsChecked, setInstructionsChecked] = useState(false);

  useEffect(() => {
    if (!uid || !testId) return;
    setInstructionsOk(sessionStorage.getItem(instructionsSessionKey) === "1");
  }, [instructionsSessionKey, testId, uid]);

  const endAtMs = test ? new Date(test.endAt).getTime() : 0;

  const attemptStartedAtMs = attemptStartedAtIso
    ? new Date(attemptStartedAtIso).getTime()
    : null;

  const durationMs = (test?.durationMinutes || 0) * 60 * 1000;
  const hardEndMs = useMemo(() => {
    if (!test || !attemptStartedAtMs) return null;
    // Exam ends strictly by duration from attempt start (no fixed schedule window).
    return attemptStartedAtMs + durationMs;
  }, [attemptStartedAtMs, durationMs, test]);
  const isAttemptActive = attemptStatus === "in_progress";
  const isAttemptSubmitted = attemptStatus === "submitted";

  const timeLeftSeconds = hardEndMs ? Math.max(0, Math.floor((hardEndMs - nowTick) / 1000)) : 0;

  const currentQuestion = questions[currentIndex];

  const questionIdOrder = useMemo(() => questions.map((q) => q.id), [questions]);

  const answeredCount = useMemo(() => {
    return questionIdOrder.reduce((acc, qid) => (answers[qid] != null ? acc + 1 : acc), 0);
  }, [answers, questionIdOrder]);

  const reviewCount = useMemo(() => markedForReview.length, [markedForReview.length]);

  const notVisitedCount = useMemo(() => {
    const visitedCount = Object.keys(visited).length;
    return Math.max(0, questions.length - visitedCount);
  }, [questions.length, visited]);

  const paletteStatus = useMemo(() => {
    const statusById: Record<
      string,
      "not_visited" | "not_answered" | "answered" | "marked_for_review"
    > = {};

    questionIdOrder.forEach((qid) => {
      const isVisited = !!visited[qid];
      if (!isVisited) statusById[qid] = "not_visited";
      else statusById[qid] = answers[qid] == null ? "not_answered" : "answered";
      if (markedForReview.includes(qid)) statusById[qid] = "marked_for_review";
    });

    return statusById;
  }, [answers, markedForReview, questionIdOrder, visited]);

  const autoSubmitTriggered = useRef(false);

  useEffect(() => {
    if (!uid || !testId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const t = await getExamTest(testId);
        if (!t) throw new Error("Exam not found");
        if (cancelled) return;

        setTest(t);

        const alreadyOk = sessionStorage.getItem(pwSessionKey) === "1";
        setPwVerified(!t.accessPasswordHash || alreadyOk);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [pwSessionKey, testId, uid]);

  useEffect(() => {
    if (!uid || !testId) return;
    if (!test) return;
    if (test.accessPasswordHash && !pwVerified) return;
    if (!instructionsOk) return;
    let cancelled = false;

    const loadQuestionsAndAttempt = async () => {
      setLoading(true);
      try {
        const qs = await listPublicQuestions(testId);
        if (cancelled) return;
        setQuestions(qs);

        const attempt = await getAttempt(testId, uid);
        if (cancelled) return;

        if (!attempt) {
          const startMs = Date.now();
          const hardEnd = new Date(startMs + (test.durationMinutes || 0) * 60 * 1000).toISOString();
          await startAttempt({
            testId,
            uid,
            batchId: user?.batchId || "",
            studentRecordId: user?.studentRecordId,
            questionIds: qs.map((q) => q.id),
            hardEndAt: hardEnd,
          });
          setAttemptStartedAtIso(new Date().toISOString());
          setAttemptStatus("in_progress");
          const freshAnswers: Record<string, number | null> = {};
          qs.forEach((q) => (freshAnswers[q.id] = null));
          setAnswers(freshAnswers);
          setMarkedForReview([]);
          setVisited(qs.length ? { [qs[0].id]: true } : {});
        } else {
          setAttemptStartedAtIso(attempt.startedAt);
          setAttemptStatus(attempt.status);
          setAttemptSubmittedAtIso(attempt.submittedAt || null);
          setAnswers(attempt.answers || {});
          setMarkedForReview(attempt.markedForReview || []);
          const v: Record<string, true> = {};
          // Consider answered/marked as visited; also mark first question visited.
          qs.forEach((q) => {
            if (attempt.answers?.[q.id] != null) v[q.id] = true;
          });
          (attempt.markedForReview || []).forEach((qid) => {
            v[qid] = true;
          });
          if (qs[0]?.id) v[qs[0].id] = true;
          setVisited(v);
          if (attempt.status === "submitted" && attempt.score != null && attempt.maxScore != null) {
            setScore({ score: attempt.score, maxScore: attempt.maxScore });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadQuestionsAndAttempt();
    return () => {
      cancelled = true;
    };
  }, [
    pwVerified,
    instructionsOk,
    test,
    testId,
    uid,
    user?.batchId,
    user?.studentRecordId,
  ]);

  // Mark current question as visited whenever you navigate.
  useEffect(() => {
    const qid = questions[currentIndex]?.id;
    if (!qid) return;
    setVisited((prev) => (prev[qid] ? prev : { ...prev, [qid]: true }));
  }, [currentIndex, questions]);

  // Periodic autosave (every 10s, debounced by latest state)
  useEffect(() => {
    if (!uid || !testId) return;
    if (!isAttemptActive) return;

    if (autosaveTimer.current) window.clearInterval(autosaveTimer.current);
    autosaveTimer.current = window.setInterval(async () => {
      try {
        setSaving(true);
        await saveAttemptProgress({ testId, uid, answers, markedForReview });
      } catch (e) {
        console.error("Autosave failed", e);
        // Keep UI simple: show only when user is actively taking the exam.
        // This avoids silent failure when Firestore rules/network blocks writes.
        // eslint-disable-next-line no-alert
        alert("Autosave failed. Please click Save manually once.");
      } finally {
        setSaving(false);
      }
    }, 10_000);

    return () => {
      if (autosaveTimer.current) window.clearInterval(autosaveTimer.current);
      autosaveTimer.current = null;
    };
  }, [answers, isAttemptActive, markedForReview, testId, uid]);

  // Auto-submit when timer ends.
  useEffect(() => {
    if (!isAttemptActive) return;
    if (!hardEndMs) return;
    if (autoSubmitTriggered.current) return;
    if (nowTick < hardEndMs) return;
    autoSubmitTriggered.current = true;
    void handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hardEndMs, isAttemptActive, nowTick]);

  // Lock navigation while exam is active (best-effort on web).
  useEffect(() => {
    if (!isAttemptActive) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    const onPopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("popstate", onPopState);
    };
  }, [isAttemptActive]);

  const handleSelect = (optionIndex: number) => {
    if (!currentQuestion) return;
    if (!isAttemptActive) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const handleClear = () => {
    if (!currentQuestion) return;
    if (!isAttemptActive) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: null }));
  };

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    if (!isAttemptActive) return;
    setMarkedForReview((prev) => {
      const has = prev.includes(currentQuestion.id);
      if (has) return prev.filter((id) => id !== currentQuestion.id);
      return [...prev, currentQuestion.id];
    });
  };

  const goNext = () => setCurrentIndex((i) => clamp(i + 1, 0, questions.length - 1));
  const goPrev = () => setCurrentIndex((i) => clamp(i - 1, 0, questions.length - 1));

  const handleManualSave = async () => {
    if (!uid || !testId) return;
    try {
      setSaving(true);
      await saveAttemptProgress({ testId, uid, answers, markedForReview });
    } catch (e) {
      console.error("Manual save failed", e);
      alert("Save failed. Please check your internet and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!uid || !testId) return;
    if (!test) return;
    if (!isAttemptActive) return;

    try {
      setSubmitting(true);
      setSaving(true);
      await saveAttemptProgress({ testId, uid, answers, markedForReview });
      // Compute score (keys are readable only after submission and after hardEndAt per rules)
      const keys = await listPrivateQuestions(testId);
      setCorrectKeys(keys);
      const keyById = new Map(keys.map((k) => [k.id, k.correctIndex]));
      const neg = test?.negativeMarkPerWrong || 0;

      let s = 0;
      let max = 0;
      questions.forEach((q) => {
        max += q.marks;
        const selected = answers[q.id];
        if (selected == null) return;
        const correct = keyById.get(q.id);
        if (correct == null) return;
        if (selected === correct) s += q.marks;
        else s -= neg;
      });
      s = Math.max(0, s);

      await submitAttempt({ testId, uid, score: s, maxScore: max });
      setAttemptStatus("submitted");
      setAttemptSubmittedAtIso(new Date().toISOString());
      setScore({ score: s, maxScore: max });
      navigate(`/student/tests/${testId}/result`, { replace: true });
    } catch (e) {
      console.error("Submit failed", e);
      autoSubmitTriggered.current = false;
    } finally {
      setSubmitting(false);
      setSaving(false);
    }
  };

  const showAnswers = useMemo(() => {
    if (!test) return false;
    if (!isAttemptSubmitted) return false;
    const effectiveEndAtMs = hardEndMs ?? endAtMs;
    const can =
      canShowAnswers({ showAnswersAfter: test.showAnswersAfter, nowMs: nowTick, endAtMs: effectiveEndAtMs }) ||
      false;
    return can;
  }, [endAtMs, hardEndMs, isAttemptSubmitted, nowTick, test]);

  const ensureCorrectKeys = async () => {
    if (!showAnswers) return;
    if (correctKeys) return;
    try {
      const keys = await listPrivateQuestions(testId);
      setCorrectKeys(keys);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    void ensureCorrectKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnswers]);

  const correctIndexById = useMemo(() => {
    if (!correctKeys) return new Map<string, number>();
    return new Map(correctKeys.map((k) => [k.id, k.correctIndex]));
  }, [correctKeys]);

  const paletteButton = (q: (typeof questions)[0], idx: number, compact?: boolean) => {
    const st = paletteStatus[q.id];
    const isCurrent = idx === currentIndex;
    const base =
      st === "answered"
        ? "bg-emerald-600 text-white border-emerald-600"
        : st === "marked_for_review"
          ? "bg-violet-600 text-white border-violet-600"
          : st === "not_answered"
            ? "bg-red-600 text-white border-red-600"
            : "bg-white text-slate-900 border-slate-200";

    return (
      <button
        key={q.id}
        type="button"
        className={cn(
          "shrink-0 rounded-lg border text-xs font-semibold transition-all",
          compact ? "h-9 min-w-[2.25rem] px-0" : "h-9",
          base,
          isCurrent && "ring-2 ring-indigo-400 ring-offset-1 lg:ring-offset-2",
          st === "not_visited" && "hover:bg-slate-50",
        )}
        onClick={() => setCurrentIndex(idx)}
      >
        {idx + 1}
      </button>
    );
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading exam...
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Exam not found</AlertTitle>
        <AlertDescription>This exam does not exist or you don&apos;t have access.</AlertDescription>
      </Alert>
    );
  }

  if (!user.batchId || user.batchId !== test.batchId) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Access denied</AlertTitle>
        <AlertDescription>This exam is not available for your batch.</AlertDescription>
      </Alert>
    );
  }

  // Exams can be started any time; the attempt timer runs from the moment the attempt starts.

  if (test.accessPasswordHash && !pwVerified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <div>
              <div className="text-lg font-semibold text-slate-900">Enter test password</div>
              <div className="text-sm text-slate-600 mt-1">
                This exam is password protected. Ask your admin/trainer for the password.
              </div>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={pwInput}
                onChange={(e) => {
                  setPwInput(e.target.value);
                  setPwError(null);
                }}
                placeholder="Password"
              />
              {pwError ? <div className="text-sm text-rose-600">{pwError}</div> : null}
            </div>

            <div className="flex items-center gap-2">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={pwChecking || !pwInput.trim()}
                onClick={async () => {
                  if (!test.accessPasswordHash) {
                    setPwVerified(true);
                    return;
                  }
                  try {
                    setPwChecking(true);
                    const h = await sha256Base64(pwInput.trim());
                    if (h !== test.accessPasswordHash) {
                      setPwError("Wrong password. Try again.");
                      return;
                    }
                    sessionStorage.setItem(pwSessionKey, "1");
                    setPwVerified(true);
                  } catch (e) {
                    console.error(e);
                    setPwError("Could not verify password. Please try again.");
                  } finally {
                    setPwChecking(false);
                  }
                }}
              >
                {pwChecking ? "Checking..." : "Continue"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/student/tests")}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!instructionsOk && !isAttemptSubmitted) {
    const tamilFriendlyFont =
      'font-["Noto_Sans_Tamil","Nirmala_UI","Latha","Hind_Madurai","Inter",system-ui,sans-serif]';
    const instructionPages = [
      instruction1,
      instruction2,
      instruction3,
      instruction4,
      instruction5,
      instruction6,
      instruction7,
      instruction8,
      instruction9,
    ];

    return (
      <div className={cn("min-h-screen bg-slate-50 p-4 sm:p-6", tamilFriendlyFont)}>
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-2 sm:px-8 sm:py-3 bg-white border-b border-slate-200">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 border border-indigo-100">
                    Pre-test checklist
                  </div>
                  <h1 className="mt-1 text-lg sm:text-xl font-semibold tracking-tight text-slate-900 truncate">
                    Instructions before you start
                  </h1>
                  <p className="mt-0.5 text-xs text-slate-600 max-w-2xl">
                    Read the official CBT instructions and the platform guidelines. You can start the test only after you
                    confirm you’ve read them.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-slate-300"
                  onClick={() => navigate("/student/tests")}
                >
                  Back
                </Button>
              </div>
            </div>

            <div className="px-5 py-5 sm:px-8 sm:py-7 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="max-h-[52vh] overflow-y-auto">
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">TNPSC CBT Instructions (Scanned)</div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            Official instructions pages (Tamil + English)
                          </div>
                        </div>
                        <Badge className="bg-indigo-600 text-white">Official</Badge>
                      </div>
                      <div className="mt-4 space-y-3">
                        {instructionPages.map((src, idx) => (
                          <div
                            key={src}
                            className="rounded-lg border border-slate-200 bg-white overflow-hidden"
                          >
                            <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-700">Page {idx + 1} / {instructionPages.length}</span>
                            </div>
                            <img
                              src={src}
                              alt={`TNPSC CBT instructions page ${idx + 1}`}
                              className="w-full h-auto object-contain bg-white"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">
                            Important Instructions (Our platform)
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            How to use Save/Mark/Submit properly
                          </div>
                        </div>
                        <Badge className="bg-violet-600 text-white">Platform</Badge>
                      </div>
                      <pre className={cn("mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-900", tamilFriendlyFont)}>
                        {PLATFORM_INSTRUCTIONS_TEXT.trim()}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-start gap-3 text-sm text-slate-700 select-none">
                    <Checkbox
                      checked={instructionsChecked}
                      onCheckedChange={(v) => setInstructionsChecked(v === true)}
                    />
                    <span>
                      I have read and understood the instructions. I agree to follow them during the examination.
                    </span>
                  </label>

                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={!instructionsChecked}
                    onClick={() => {
                      sessionStorage.setItem(instructionsSessionKey, "1");
                      setInstructionsOk(true);
                    }}
                  >
                    Continue to test
                  </Button>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Tip: If you get disconnected, wait for the page to recover—avoid refresh during the exam.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-100 p-0 pb-[calc(11.25rem+env(safe-area-inset-bottom))] lg:min-h-screen lg:bg-slate-50 lg:p-6 lg:pb-6">
      <div className="flex min-h-[100dvh] flex-col gap-0 lg:h-[calc(100vh-3rem)] lg:gap-4">
        {/* ——— Mobile: sticky compact exam bar ——— */}
        <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            <img
              src={bannerImage}
              alt=""
              className="h-7 w-auto max-w-[100px] shrink-0 object-contain object-left opacity-90"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-slate-900">{test.title}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1">
                <span className="rounded bg-slate-100 px-1.5 py-0 text-[10px] font-medium text-slate-600">
                  {test.subject}
                </span>
                <span className="text-[10px] text-slate-500">
                  Q{currentIndex + 1}/{questions.length}
                </span>
              </div>
            </div>
            <div
              className={cn(
                "shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-center tabular-nums",
                timeLeftSeconds <= 60 && !isAttemptSubmitted && "border-rose-200 bg-rose-50",
              )}
            >
              <div className="text-[9px] font-medium uppercase tracking-wide text-slate-500">Time</div>
              <div
                className={cn(
                  "text-sm font-bold leading-none",
                  timeLeftSeconds <= 60 && !isAttemptSubmitted ? "text-rose-700" : "text-slate-900",
                )}
              >
                {isAttemptSubmitted ? "—" : formatTimeLeft(timeLeftSeconds)}
              </div>
            </div>
            <div
              className="relative h-10 w-8 shrink-0 overflow-hidden rounded border border-slate-800 bg-white shadow-sm"
              title="You"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-indigo-700">
                  {initialsFromName(user.name || "S")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ——— Desktop: slim header — logo left; timers + test info grouped on the right (timers left of title) ——— */}
        <div className="hidden w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-slate-950/5 lg:block">
          <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:gap-4">
            <div className="flex shrink-0 items-center">
              <img
                src={bannerImage}
                alt="EduHub banner"
                className="block h-10 w-auto max-w-[min(200px,28vw)] object-contain object-left lg:h-11"
              />
            </div>

            <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-3 lg:flex-nowrap lg:gap-4">
              <div className="flex shrink-0 items-center gap-3 border-r border-slate-200/90 pr-3 lg:gap-4 lg:pr-4">
                <div className="text-left">
                  <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                    Duration
                  </div>
                  <div className="text-lg font-bold tabular-nums leading-none text-slate-900">
                    {formatTimeLeft((test.durationMinutes || 0) * 60)}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                    Time left
                  </div>
                  <div
                    className={cn(
                      "text-lg font-extrabold tabular-nums leading-none tracking-tight",
                      timeLeftSeconds <= 60 && !isAttemptSubmitted ? "text-rose-600" : "text-slate-900",
                    )}
                  >
                    {isAttemptSubmitted ? formatTimeLeft(0) : formatTimeLeft(timeLeftSeconds)}
                  </div>
                </div>
              </div>

              <div className="min-w-0 w-fit max-w-full rounded-md border border-slate-200/80 bg-slate-50/80 px-2 py-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <h1 className="max-w-[10rem] truncate text-sm font-bold text-slate-900 sm:max-w-[14rem]">
                    {test.title}
                  </h1>
                  <Badge
                    variant="outline"
                    className="h-5 shrink-0 border-slate-200 bg-white px-1.5 py-0 text-[10px] font-medium leading-none text-slate-700"
                  >
                    {test.subject}
                  </Badge>
                  {isAttemptSubmitted ? (
                    <Badge className="h-5 shrink-0 bg-emerald-600 px-1.5 py-0 text-[10px] font-medium leading-none text-white hover:bg-emerald-600">
                      Submitted
                    </Badge>
                  ) : (
                    <Badge className="h-5 shrink-0 bg-indigo-600 px-1.5 py-0 text-[10px] font-medium leading-none text-white hover:bg-indigo-600">
                      In progress
                    </Badge>
                  )}
                  <span className="hidden shrink-0 text-slate-300 sm:inline">|</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-slate-600">
                    <span className="font-semibold text-slate-800">{questions.length}</span> Q
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-300">·</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-slate-600">
                    <span className="font-semibold text-slate-800">{test.totalMarks}</span> pts
                  </span>
                  <span className="hidden shrink-0 text-slate-300 md:inline">|</span>
                  <span
                    className="min-w-0 max-w-full truncate font-mono text-[10px] font-medium text-slate-600 md:max-w-[14rem] lg:max-w-xs"
                    title={test.batchId}
                  >
                    {test.batchId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-2 pt-2 lg:grid lg:grid-cols-[1fr_360px] lg:gap-4 lg:px-0 lg:pt-0">
          {/* Question panel */}
          <Card className="min-h-0 flex-1 overflow-hidden rounded-xl border-slate-200 shadow-sm lg:rounded-xl">
            <CardContent className="flex h-full min-h-0 flex-col p-0">
              <div className="hidden border-b border-slate-200 px-4 py-3 lg:flex lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-slate-900 text-white hover:bg-slate-900">Q{currentIndex + 1}</Badge>
                  <span className="text-sm text-slate-600">Mark: {currentQuestion?.marks ?? 0}</span>
                  {currentQuestion && markedForReview.includes(currentQuestion.id) && (
                    <Badge className="border border-violet-200/80 bg-violet-100 text-violet-800">Marked</Badge>
                  )}
                </div>
              </div>

              {/* Mobile: in-card Q strip (desktop header row is above) */}
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 lg:hidden">
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-900 text-white hover:bg-slate-900">Q{currentIndex + 1}</Badge>
                  <span className="text-xs text-slate-600">Mark: {currentQuestion?.marks ?? 0}</span>
                </div>
                {currentQuestion && markedForReview.includes(currentQuestion.id) ? (
                  <Badge className="border border-violet-200/80 bg-violet-100 text-[10px] text-violet-800">
                    Marked
                  </Badge>
                ) : (
                  <span className="text-[10px] text-slate-400"> </span>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 pb-2 lg:p-4">
                <div className="text-[15px] leading-relaxed text-slate-900 whitespace-pre-wrap lg:text-base">
                  {currentQuestion?.text}
                </div>

                {currentQuestion?.imageUrl ? (
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 lg:mt-4 lg:rounded-xl">
                    <img
                      src={currentQuestion.imageUrl}
                      alt={`Question ${currentIndex + 1}`}
                      className="max-h-[min(220px,38vh)] w-full object-contain lg:max-h-[360px]"
                      loading="lazy"
                    />
                  </div>
                ) : null}

                <fieldset className="mt-4 min-w-0 border-0 p-0 lg:mt-5 m-0 flex flex-col gap-2 lg:gap-3">
                  <legend className="sr-only">Select one answer</legend>
                  {currentQuestion?.options?.slice(0, 5).map((opt, idx) => {
                    const selected = answers[currentQuestion.id] === idx;
                    const correctIndex = correctIndexById.get(currentQuestion.id);
                    const showCorrect = showAnswers && correctIndex != null;
                    const isCorrect = showCorrect && correctIndex === idx;
                    const isWrongSelected = showCorrect && selected && correctIndex !== idx;
                    const letter = String.fromCharCode(65 + idx);
                    const label = (opt || "").trim() || letter;
                    const isLetterOnly = label.toUpperCase() === letter;
                    const inputId = `q-${currentQuestion.id}-opt-${idx}`;

                    return (
                      <label
                        key={idx}
                        htmlFor={inputId}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2.5 rounded-sm py-2 text-left transition-colors lg:gap-3 lg:py-2.5",
                          "border-0 bg-transparent shadow-none ring-0",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
                          !isAttemptActive && "cursor-default",
                        )}
                      >
                        <input
                          id={inputId}
                          type="radio"
                          name={`exam-answer-${currentQuestion.id}`}
                          value={idx}
                          checked={selected}
                          onChange={() => handleSelect(idx)}
                          disabled={!isAttemptActive}
                          className={cn(
                            "h-4 w-4 shrink-0 border-slate-300 accent-indigo-600 lg:h-4",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                            isCorrect && "accent-emerald-600",
                            isWrongSelected && "accent-red-600",
                          )}
                        />
                        <span className="flex min-w-0 flex-1 items-baseline gap-2">
                          <span
                            className={cn(
                              "shrink-0 text-xs font-bold tabular-nums lg:text-sm",
                              isCorrect && "text-emerald-800",
                              isWrongSelected && "text-red-800",
                              !isCorrect && !isWrongSelected && selected && "text-indigo-800",
                              !isCorrect && !isWrongSelected && !selected && "text-slate-500",
                            )}
                          >
                            {letter}.
                          </span>
                          <span
                            className={cn(
                              "text-xs font-medium leading-snug lg:text-sm",
                              isLetterOnly && "sr-only",
                              isCorrect && "text-emerald-900",
                              isWrongSelected && "text-red-900",
                              !isCorrect && !isWrongSelected && selected && "text-indigo-950",
                              !isCorrect && !isWrongSelected && !selected && "text-slate-800",
                            )}
                          >
                            {label}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </fieldset>

                {isAttemptSubmitted && score && (
                  <div className="mt-4 lg:mt-6">
                    <Alert className="border-emerald-200 bg-emerald-50">
                      <AlertTitle className="text-emerald-900">Result</AlertTitle>
                      <AlertDescription className="text-emerald-800">
                        Score: <span className="font-semibold">{score.score}</span> /{" "}
                        <span className="font-semibold">{score.maxScore}</span>
                        {attemptSubmittedAtIso ? (
                          <span className="mt-1 block text-xs text-emerald-700">
                            Submitted at: {new Date(attemptSubmittedAtIso).toLocaleString()}
                          </span>
                        ) : null}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>

              <div className="hidden border-t border-slate-200 px-4 py-3 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toggleMarkForReview();
                      goNext();
                    }}
                    disabled={!isAttemptActive || currentIndex === questions.length - 1}
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Mark for Review &amp; Next
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClear} disabled={!isAttemptActive}>
                    Clear Response
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => void handleManualSave().then(goNext)}
                    disabled={
                      !isAttemptActive || saving || submitting || currentIndex === questions.length - 1
                    }
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save &amp; Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Side panel — desktop only */}
          <Card className="hidden h-full min-h-0 flex-col lg:flex">
            <CardContent className="flex h-full min-h-0 flex-col p-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Candidate</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 truncate" title={user.name}>
                    {user.name || "Student"}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {user.studentId || user.studentRecordId || "ID not available"}
                  </div>
                </div>
                <div
                  className="relative w-[84px] h-[108px] rounded-sm border-[3px] border-slate-800 bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0"
                  title="Student photo"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="max-w-full max-h-full w-full h-full object-contain object-center"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm font-bold text-indigo-700 tabular-nums px-1 text-center select-none">
                      {initialsFromName(user.name || "Student")}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="rounded-md border border-slate-200 bg-white px-2 py-1">
                  Answered: <span className="font-semibold text-slate-900">{answeredCount}</span>
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-2 py-1">
                  Marked: <span className="font-semibold text-slate-900">{reviewCount}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Question Palette</div>
              <div className="text-xs text-slate-500">
                {answeredCount}/{questions.length} answered
              </div>
            </div>

            <div className="mt-3 grid grid-cols-6 gap-2">
              {questions.map((q, idx) => paletteButton(q, idx))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <LegendChip color="bg-emerald-600" label="Answered" />
              <LegendChip color="bg-red-600" label="Not Answered" />
              <LegendChip color="bg-violet-600" label="Marked" />
              <LegendChip color="bg-white border border-slate-200" label="Not Visited" />
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Answered</span>
                <span className="font-semibold text-slate-900">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Marked</span>
                <span className="font-semibold text-slate-900">{reviewCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Not visited (approx)</span>
                <span className="font-semibold text-slate-900">{notVisitedCount}</span>
              </div>
            </div>

            <div className="mt-auto pt-4">
              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Exam ends only when the timer finishes.
              </div>
              {attemptStartedAtIso ? (
                <div className="mt-1 text-[11px] text-slate-500">
                  Started: {new Date(attemptStartedAtIso).toLocaleString()}
                </div>
              ) : null}
            </div>
          </CardContent>
          </Card>
        </div>

        {/* Mobile: fixed bottom dock (palette + actions) — desktop unchanged */}
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/98 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_rgba(15,23,42,0.14)] backdrop-blur-md lg:hidden"
          style={{ paddingLeft: "max(0.75rem, env(safe-area-inset-left))", paddingRight: "max(0.75rem, env(safe-area-inset-right))" }}
        >
          <div className="flex gap-1.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {questions.map((q, idx) => paletteButton(q, idx, true))}
          </div>
          <div className="mb-2 flex items-center justify-between gap-2 text-[10px] text-slate-500">
            <span className="shrink-0 tabular-nums">
              {answeredCount}/{questions.length} answered · {reviewCount} marked
            </span>
            <span className="min-w-0 truncate text-right font-medium text-slate-600">
              {test.totalMarks} marks · {formatTimeLeft((test.durationMinutes || 0) * 60)} total
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-11 flex-1 text-xs font-medium"
              onClick={() => {
                toggleMarkForReview();
                goNext();
              }}
              disabled={!isAttemptActive || currentIndex === questions.length - 1}
            >
              <Flag className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              Mark &amp; next
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 flex-1 text-xs font-medium"
              onClick={handleClear}
              disabled={!isAttemptActive}
            >
              Clear
            </Button>
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-11 w-12 shrink-0 px-0"
              aria-label="Previous question"
              onClick={goPrev}
              disabled={!isAttemptActive || currentIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              className="h-11 min-w-0 flex-1 bg-blue-600 text-sm font-semibold hover:bg-blue-700"
              onClick={() => void handleManualSave().then(goNext)}
              disabled={
                !isAttemptActive || saving || submitting || currentIndex === questions.length - 1
              }
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4 shrink-0" />
              )}
              Save &amp; next
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 w-12 shrink-0 px-0"
              aria-label="Next question"
              onClick={goNext}
              disabled={!isAttemptActive || currentIndex === questions.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("inline-block w-3 h-3 rounded-sm", color)} />
      <span>{label}</span>
    </div>
  );
}

function useNowTicker(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}

