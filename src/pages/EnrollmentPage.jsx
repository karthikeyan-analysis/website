import { useState, useRef } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";
import PageLayout from "../components/layout/PageLayout";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";

const INPUT_CLS =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10";
const SELECT_CLS =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10";
const LABEL_CLS = "mb-1 block text-sm font-medium text-brand-black/80";
const SECTION_HEAD_CLS =
  "mb-4 text-base font-bold text-brand-navy border-b border-brand-navy/10 pb-2";

const TERMS = [
  "I agree to the fee payment terms. Fees paid are non-refundable after the course commencement date.",
  "I agree to maintain a minimum attendance of 75% as required by the institution.",
  "I agree to follow all institutional rules, regulations, and maintain discipline at all times.",
  "I consent to my personal information being used for academic records, communication, and institutional administration.",
  "I acknowledge that study materials provided are for personal use only and may not be shared or reproduced.",
];

const EDU_LEVELS = ["ug", "pg", "other"];
const EDU_LEVEL_LABELS = { ug: "UG", pg: "PG", other: "Other" };

const emptyEduRow = () => ({
  maths: false,
  statistics: false,
  economics: false,
  percentMarks: "",
  yearOfPassing: "",
});

const initialForm = () => ({
  name: "",
  fatherName: "",
  dob: "",
  gender: "",
  caste: "",
  mobile: "",
  whatsapp: "",
  telegram: "",
  email: "",
  doorNo: "",
  street: "",
  district: "",
  state: "",
  pincode: "",
  education: {
    ug: emptyEduRow(),
    pg: emptyEduRow(),
    other: emptyEduRow(),
  },
  maritalStatus: "",
  workStatus: "",
  natureOfWork: "",
  batchName: "",
  batchDuration: "",
  dateOfPayment: "",
  modeOfTransaction: "",
  terms: [false, false, false, false, false],
});

export default function EnrollmentPage() {
  const [form, setForm] = useState(initialForm());
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function setEdu(level, field, value) {
    setForm((p) => ({
      ...p,
      education: {
        ...p.education,
        [level]: { ...p.education[level], [field]: value },
      },
    }));
  }

  function setTerm(idx, value) {
    setForm((p) => {
      const terms = [...p.terms];
      terms[idx] = value;
      return { ...p, terms };
    });
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function validate() {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.fatherName.trim()) return "Father's name is required.";
    if (!form.dob) return "Date of birth is required.";
    if (!form.gender) return "Gender is required.";
    if (!form.mobile.trim()) return "Mobile number is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.doorNo.trim()) return "Door number is required.";
    if (!form.street.trim()) return "Street is required.";
    if (!form.district.trim()) return "District is required.";
    if (!form.state.trim()) return "State is required.";
    if (!form.pincode.trim()) return "Pincode is required.";
    if (!form.maritalStatus) return "Marital status is required.";
    if (!form.workStatus) return "Work status is required.";
    if (form.workStatus === "employed" && !form.natureOfWork.trim())
      return "Nature of work is required when employed.";
    if (!form.batchName.trim()) return "Batch name is required.";
    if (!form.batchDuration.trim()) return "Batch duration is required.";
    if (!form.dateOfPayment) return "Date of payment is required.";
    if (!form.modeOfTransaction) return "Mode of transaction is required.";
    if (!form.terms.every(Boolean))
      return "Please accept all Terms & Conditions to proceed.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const validationErr = validate();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);
    try {
      let photoUrl = "";
      if (photo) {
        const photoRef = ref(storage, `enrollments/${Date.now()}_${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoUrl = await getDownloadURL(photoRef);
      }

      const record = {
        ...form,
        photoUrl,
        submittedAt: new Date().toISOString(),
      };
      delete record.terms;

      await addDoc(collection(db, "enrollments"), {
        ...record,
        termsAccepted: true,
        submittedAt: new Date().toISOString(),
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Enrollment error:", err);
      setError("Failed to submit your enrollment. Please try again or contact us.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <PageLayout
        title="Enrollment Form"
        subtitle="Online registration for Karthikeyan Analysis courses."
      >
        <section className="py-16">
          <Container className="max-w-lg">
            <Card className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-brand-navy">Enrollment Submitted!</h2>
              <p className="mt-3 text-sm text-brand-black/70 leading-relaxed">
                Thank you for enrolling with Karthikeyan Analysis. We have received your registration and will
                contact you shortly to confirm your batch details.
              </p>
              <a
                href="/"
                className="mt-6 inline-block rounded-xl bg-brand-navy px-6 py-3 text-sm font-bold text-white hover:bg-brand-navy/90"
              >
                Back to Home
              </a>
            </Card>
          </Container>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Enrollment Form"
      subtitle="Fill in your details to register for a course at Karthikeyan Analysis."
    >
      <section className="py-10">
        <Container className="max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {/* ── 1. Personal Details ──────────────────────────────── */}
            <Card className="p-6">
              <h2 className={SECTION_HEAD_CLS}>Personal Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLS}>Full Name *</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="As per official records"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Father's Name *</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="Father's full name"
                    value={form.fatherName}
                    onChange={(e) => set("fatherName", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Date of Birth *</label>
                  <input
                    type="date"
                    className={INPUT_CLS}
                    value={form.dob}
                    onChange={(e) => set("dob", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Gender *</label>
                  <select
                    className={SELECT_CLS}
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                  >
                    <option value="">Select gender…</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Caste</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="Caste (optional)"
                    value={form.caste}
                    onChange={(e) => set("caste", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Mobile Number *</label>
                  <input
                    type="tel"
                    className={INPUT_CLS}
                    placeholder="10-digit mobile"
                    value={form.mobile}
                    onChange={(e) => set("mobile", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>WhatsApp Number</label>
                  <input
                    type="tel"
                    className={INPUT_CLS}
                    placeholder="If different from mobile"
                    value={form.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Telegram Number / Username</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="@username or phone"
                    value={form.telegram}
                    onChange={(e) => set("telegram", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLS}>Email Address *</label>
                  <input
                    type="email"
                    className={INPUT_CLS}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>

                {/* Photo upload */}
                <div className="sm:col-span-2">
                  <label className={LABEL_CLS}>Passport Photo</label>
                  <div className="flex items-center gap-4">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-20 w-20 rounded-xl object-cover border border-black/10"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-black/20 bg-black/[0.02] text-brand-black/30">
                        <Upload className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-brand-navy hover:bg-black/[0.02]"
                      >
                        {photo ? "Change Photo" : "Upload Photo"}
                      </button>
                      <p className="mt-1 text-xs text-brand-black/50">JPG or PNG, max 2 MB</p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        onChange={handlePhoto}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ── 2. Address Details ───────────────────────────────── */}
            <Card className="p-6">
              <h2 className={SECTION_HEAD_CLS}>Address Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLS}>Door No. *</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="Door / House number"
                    value={form.doorNo}
                    onChange={(e) => set("doorNo", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Street / Village *</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="Street name or village"
                    value={form.street}
                    onChange={(e) => set("street", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>District *</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="District"
                    value={form.district}
                    onChange={(e) => set("district", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>State *</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Pincode *</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => set("pincode", e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* ── 3. Educational Details ───────────────────────────── */}
            <Card className="p-6">
              <h2 className={SECTION_HEAD_CLS}>Educational Details</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-sm">
                  <thead>
                    <tr className="border-b border-black/10 text-xs font-semibold text-brand-black/60 text-left">
                      <th className="pb-2 pr-3 w-16">Level</th>
                      <th className="pb-2 pr-3">Subjects</th>
                      <th className="pb-2 pr-3 w-32">Percent Marks</th>
                      <th className="pb-2 w-32">Year of Passing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05]">
                    {EDU_LEVELS.map((level) => (
                      <tr key={level} className="align-top">
                        <td className="py-3 pr-3 font-semibold text-brand-navy">
                          {EDU_LEVEL_LABELS[level]}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                            {[
                              ["maths", "Maths"],
                              ["statistics", "Statistics"],
                              ["economics", "Economics"],
                            ].map(([field, label]) => (
                              <label key={field} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={form.education[level][field]}
                                  onChange={(e) => setEdu(level, field, e.target.checked)}
                                  className="h-4 w-4 rounded border-black/20 accent-brand-navy"
                                />
                                <span>{label}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <input
                            className={INPUT_CLS}
                            placeholder="e.g. 75%"
                            value={form.education[level].percentMarks}
                            onChange={(e) => setEdu(level, "percentMarks", e.target.value)}
                          />
                        </td>
                        <td className="py-3">
                          <input
                            className={INPUT_CLS}
                            placeholder="e.g. 2022"
                            maxLength={4}
                            value={form.education[level].yearOfPassing}
                            onChange={(e) => setEdu(level, "yearOfPassing", e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* ── 4. Other Details ─────────────────────────────────── */}
            <Card className="p-6">
              <h2 className={SECTION_HEAD_CLS}>Other Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLS}>Marital Status *</label>
                  <select
                    className={SELECT_CLS}
                    value={form.maritalStatus}
                    onChange={(e) => set("maritalStatus", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Work Status *</label>
                  <select
                    className={SELECT_CLS}
                    value={form.workStatus}
                    onChange={(e) => set("workStatus", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="student">Student</option>
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self-Employed</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </div>
                {form.workStatus === "employed" || form.workStatus === "self_employed" ? (
                  <div className="sm:col-span-2">
                    <label className={LABEL_CLS}>Nature of Work *</label>
                    <input
                      className={INPUT_CLS}
                      placeholder="Describe your current occupation"
                      value={form.natureOfWork}
                      onChange={(e) => set("natureOfWork", e.target.value)}
                    />
                  </div>
                ) : null}
              </div>
            </Card>

            {/* ── 5. Batch Details ─────────────────────────────────── */}
            <Card className="p-6">
              <h2 className={SECTION_HEAD_CLS}>Batch Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLS}>Batch Name *</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="e.g. TNPSC Group I Batch 2025"
                    value={form.batchName}
                    onChange={(e) => set("batchName", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Batch Duration *</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="e.g. 6 months"
                    value={form.batchDuration}
                    onChange={(e) => set("batchDuration", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Date of Payment *</label>
                  <input
                    type="date"
                    className={INPUT_CLS}
                    value={form.dateOfPayment}
                    onChange={(e) => set("dateOfPayment", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Mode of Transaction *</label>
                  <select
                    className={SELECT_CLS}
                    value={form.modeOfTransaction}
                    onChange={(e) => set("modeOfTransaction", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI / Online Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="dd">Demand Draft (DD)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* ── 6. Terms & Conditions ────────────────────────────── */}
            <Card className="p-6">
              <h2 className={SECTION_HEAD_CLS}>Terms & Conditions</h2>
              <div className="space-y-3">
                {TERMS.map((text, idx) => (
                  <label
                    key={idx}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                      form.terms[idx]
                        ? "border-brand-navy/30 bg-brand-navy/[0.04]"
                        : "border-black/10 hover:border-black/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.terms[idx]}
                      onChange={(e) => setTerm(idx, e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/20 accent-brand-navy"
                    />
                    <span className="text-sm leading-relaxed text-brand-black/80">{text}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Submit */}
            <div className="flex flex-col items-center gap-3">
              {error && (
                <p className="text-sm text-red-600 font-medium">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-12 w-full max-w-xs items-center justify-center rounded-xl bg-brand-navy px-6 text-sm font-bold text-white shadow-md hover:bg-brand-navy/90 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting…
                  </span>
                ) : (
                  "Submit Enrollment"
                )}
              </button>
              <p className="text-xs text-brand-black/50 text-center max-w-sm">
                By submitting, you confirm that all information provided is accurate to the best of your knowledge.
              </p>
            </div>
          </form>
        </Container>
      </section>
    </PageLayout>
  );
}
