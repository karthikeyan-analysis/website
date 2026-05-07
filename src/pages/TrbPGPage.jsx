import PageLayout from "../components/layout/PageLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";
import { Check } from "lucide-react";

const courseHighlights = [
  "Expert Faculty: Well-experienced subject experts with academic and exam training backgrounds, including previous TRB qualifiers.",
  "Structured Material: Thoroughly prepared notes, previous year question paper discussions, model question banks, and expected questions.",
  "Regular Tests & Analysis: Weekly chapter-wise tests, unit tests, and full-length mock exams with individual performance feedback.",
  "Doubt Clarification Sessions: Scheduled interactive sessions to clear concepts and strengthen weak areas.",
  "Flexible Modes: Online live + recorded classes and weekend batches for working professionals.",
];

export default function TrbPGPage() {
  return (
    <PageLayout
      title="PG TRB Mathematics Exam"
      subtitle="Advanced coaching for PG TRB with in-depth subject knowledge and comprehensive exam strategies."
    >
      <section className="bg-white/60 py-14">
        <Container className="space-y-10">
          {/* Introduction */}
          <Card color="blue" className="text-center">
            <div className="space-y-4 text-center flex flex-col items-center justify-center">
              <p className="text-lg leading-relaxed text-brand-black/80 text-center">
                <strong>Karthikeyan Analysis Study Circle</strong> offers a
                focused and result-driven coaching program for the{" "}
                <strong>
                  Post Graduate Teacher Recruitment Board (PG TRB) – Mathematics
                  exam
                </strong>{" "}
                in Tamil Nadu.
              </p>
            </div>
          </Card>

          {/* Course Highlights */}
          <Card color="orange">
            <div className="flex flex-col items-center justify-center text-center">
              <SectionHeader
                eyebrow="Program Details"
                title="Course Highlights"
                subtitle={null}
              />
            </div>
            <ul className="mx-auto mt-6 grid max-w-3xl gap-3 text-sm text-brand-black/80 sm:text-[15px]">
              {courseHighlights.map((highlight, idx) => (
                <li key={idx} className="grid grid-cols-[1.75rem_1fr] items-start gap-x-3">
                  <span className="mt-0.5 flex w-7 justify-center">
                    <Check className="h-5 w-5 text-brand-orange" />
                  </span>
                  <span className="leading-relaxed text-brand-black/80">
                    {highlight}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Why Choose Us */}
          <Card color="purple" className="text-center">
            <div className="flex flex-col items-center justify-center">
              <SectionHeader
                eyebrow="Benefits"
                title="Why Choose Karthikeyan Analysis for PG TRB"
                subtitle={null}
              />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 place-items-center">
              <div className="rounded-lg bg-gradient-to-r from-brand-orange/10 to-brand-maroon/10 p-4">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Expert Faculty
                </h3>
                <p className="text-sm text-brand-black/70">
                  Well-experienced subject experts with academic backgrounds and
                  previous TRB qualifications.
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-brand-orange/10 to-brand-maroon/10 p-4">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Comprehensive Material
                </h3>
                <p className="text-sm text-brand-black/70">
                  Thoroughly prepared notes with PYQ discussions and model
                  question banks.
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-brand-orange/10 to-brand-maroon/10 p-4">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Regular Assessments
                </h3>
                <p className="text-sm text-brand-black/70">
                  Weekly tests, unit tests, and full-length mock exams with
                  individual feedback.
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-brand-orange/10 to-brand-maroon/10 p-4">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Concept Clarity
                </h3>
                <p className="text-sm text-brand-black/70">
                  Scheduled doubt clearance sessions to strengthen concepts and
                  weak areas.
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-brand-orange/10 to-brand-maroon/10 p-4">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Expected Questions
                </h3>
                <p className="text-sm text-brand-black/70">
                  Access to curated expected question banks based on latest exam
                  patterns.
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-brand-orange/10 to-brand-maroon/10 p-4">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Flexible Learning
                </h3>
                <p className="text-sm text-brand-black/70">
                  Online live classes, recorded sessions, and weekend batches
                  for professionals.
                </p>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </PageLayout>
  );
}
