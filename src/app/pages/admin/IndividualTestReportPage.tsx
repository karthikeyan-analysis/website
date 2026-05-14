import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ArrowLeft, ClipboardList, Download, Loader2 } from "lucide-react";
import { getExamTest, listAttemptsForAdmin } from "../../features/exams/examApi";
import type { ExamAttempt, ExamTest } from "../../features/exams/types";
import {
  attemptCompositeKey,
  buildAttemptsLookup,
  isEligibleForExam,
  percentScore,
  presentAbsentLabel,
  safeFileName,
  scoreCellDisplay,
  toIsoOrEmpty,
} from "../../features/exams/adminTestReportUtils";
import { useData } from "../../context/DataContext";
import * as XLSX from "xlsx";

export default function IndividualTestReportPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { students, batches } = useData();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<ExamTest | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!testId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [t, att] = await Promise.all([
          getExamTest(testId),
          listAttemptsForAdmin(testId),
        ]);
        if (!cancelled) {
          setTest(t);
          setAttempts(att);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [testId]);

  const attemptsMap = useMemo(() => {
    if (!test) return new Map<string, ExamAttempt>();
    return buildAttemptsLookup([{ test, attempts }]);
  }, [test, attempts]);

  const eligibleRoster = useMemo(() => {
    if (!test) return [];
    return students
      .filter((s) => isEligibleForExam(s, test))
      .sort((a, b) =>
        `${a.name}`.localeCompare(`${b.name}`, undefined, {
          sensitivity: "base",
        }),
      );
  }, [students, test]);

  const filteredRoster = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return eligibleRoster;
    return eligibleRoster.filter(
      (s) =>
        `${s.name}`.toLowerCase().includes(q) ||
        `${s.email}`.toLowerCase().includes(q) ||
        `${s.studentId}`.toLowerCase().includes(q),
    );
  }, [eligibleRoster, search]);

  const batchName = useMemo(
    () =>
      test
        ? batches.find((b) => b.id === test.batchId)?.name || test.batchId
        : "",
    [batches, test],
  );

  const exportExcel = useCallback(() => {
    if (!test) return;
    setExporting(true);
    try {
      const rows = eligibleRoster.map((s) => {
        const bn = batches.find((b) => b.id === s.batchId)?.name || "";
        const a = attemptsMap.get(attemptCompositeKey(test.id, s.id));
        const pct =
          a?.status === "submitted"
            ? percentScore(a, test.totalMarks)
            : null;
        return {
          studentRecordId: s.id,
          studentId: s.studentId,
          studentName: s.name,
          studentEmail: s.email,
          studentBatch: bn,
          rosterStatus: s.status,
          presentAbsent: presentAbsentLabel(s, test, attemptsMap),
          attemptStatus: a?.status ?? "",
          score: a?.score ?? "",
          maxMarks: a ? (a.maxScore ?? test.totalMarks) : "",
          percent: pct ?? "",
          startedAt: a ? toIsoOrEmpty(a.startedAt) : "",
          submittedAt: a ? toIsoOrEmpty(a.submittedAt) : "",
          lastSavedAt: a ? toIsoOrEmpty(a.lastSavedAt) : "",
        };
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Test_report");
      const notes = [
        ["Individual test report"],
        ["Exam", test.title],
        ["Exam ID", test.id],
        ["Batch", batchName],
        ["Subject", test.subject],
        [
          "Window",
          `${toIsoOrEmpty(test.startAt)} – ${toIsoOrEmpty(test.endAt)}`,
        ],
        [""],
        [
          "Present = attempt exists; Absent = eligible but no attempt; N/A = not eligible (omitted from this roster).",
        ],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(notes), "Notes");
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      XLSX.writeFile(
        wb,
        `${safeFileName(`test_report_${test.title}_${stamp}`)}.xlsx`,
      );
    } finally {
      setExporting(false);
    }
  }, [attemptsMap, batches, batchName, eligibleRoster, test]);

  if (!testId) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Missing test id.{" "}
        <Button
          variant="link"
          className="h-auto p-0"
          onClick={() => navigate("/admin/tests")}
        >
          Back to tests
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit"
            onClick={() => navigate("/admin/tests")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to tests
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Individual test report
          </h1>
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </p>
          ) : !test ? (
            <p className="text-sm text-slate-600">
              This exam could not be found. It may have been deleted.
            </p>
          ) : (
            <div className="max-w-2xl space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">{test.title}</span>
                <span className="text-slate-400"> · </span>
                {test.subject}
                <span className="text-slate-400"> · </span>
                {batchName}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(test.startAt).toLocaleString()} –{" "}
                {new Date(test.endAt).toLocaleString()}
                <span className="text-slate-400"> · </span>
                {test.totalQuestions} questions, {test.totalMarks} marks
              </p>
            </div>
          )}
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 sm:self-start"
          onClick={exportExcel}
          disabled={loading || exporting || !test || eligibleRoster.length === 0}
        >
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download Excel
        </Button>
      </div>

      {test ? (
        <Card>
          <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Eligible roster & attempts
                </CardTitle>
                <CardDescription className="max-w-xl">
                  Only students eligible for this exam (same batch, or on the
                  selective list) are listed. Present / absent follows attempt
                  records; scores appear after submission.
                </CardDescription>
              </div>
            </div>
            <div className="w-full space-y-2 sm:max-w-xs">
              <Label htmlFor="single-test-search">Search</Label>
              <Input
                id="single-test-search"
                placeholder="Name, email, or student ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {eligibleRoster.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-slate-500">
                No eligible students for this exam (check batch assignment or
                selective student list).
              </p>
            ) : filteredRoster.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-slate-500">
                No students match this search.
              </p>
            ) : (
              <div className="max-h-[min(560px,60vh)] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead>Student</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Present / Absent</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoster.map((s) => {
                      const a = attemptsMap.get(
                        attemptCompositeKey(test.id, s.id),
                      );
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium text-slate-900">
                            {s.name}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 tabular-nums">
                            {s.studentId}
                          </TableCell>
                          <TableCell
                            className="max-w-[220px] truncate text-sm text-slate-600"
                            title={s.email}
                          >
                            {s.email}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {presentAbsentLabel(s, test, attemptsMap)}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">
                            {scoreCellDisplay(s, test, attemptsMap)}
                          </TableCell>
                          <TableCell className="text-right">
                            {a?.status ? (
                              <Badge
                                variant={
                                  a.status === "submitted"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs font-normal"
                              >
                                {a.status === "in_progress"
                                  ? "In progress"
                                  : "Submitted"}
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
