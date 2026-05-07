import PageLayout from "../components/layout/PageLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";
import { Check } from "lucide-react";

const keyHighlights = [
  "Expert Faculty Team: Led by experienced educators and subject matter experts specializing in Mathematics, with deep insight into TRB exam patterns.",
  "Comprehensive Syllabus Coverage: All units of UGTRB Maths syllabus.",
  "Structured Study Plan: Weekly and monthly schedules designed for balanced theory, problem-solving, and revision.",
  "Regular Tests & Feedback: Chapter-wise tests, full-length mock exams, and personalized performance analysis to track progress and enhance accuracy.",
  "Quality Study Material: Well-structured notes, model question papers, previous year solved papers, and formula handbooks tailored for UGTRB Maths.",
  "Doubt-Clearing & Mentoring Sessions: Interactive sessions to resolve doubts and provide motivational and career guidance.",
  "Online Mode: Flexible learning formats available to suit different student needs, including recorded lectures and live online classes.",
];

export default function TrbUGPage() {
  return (
    <PageLayout
      title="UG TRB Mathematics Exam"
      subtitle="Comprehensive coaching for UG TRB with structured planning, regular tests, and expert mentoring."
    >
      <section className="bg-white/60 py-14">
        <Container className="space-y-10">
          {/* Introduction */}
          <Card color="blue" className="text-center">
            <div className="space-y-4 text-center flex flex-col items-center justify-center">
              <p className="text-lg leading-relaxed text-brand-black/80 text-center">
                <strong>Karthikeyan Analysis Study Circle</strong> is a premier
                online coaching institute in Tamil Nadu, committed to providing
                top-notch coaching for{" "}
                <strong>UGTRB Mathematics aspirants</strong>. With a focused
                curriculum, expert faculty, and strategic guidance, we ensure
                every student is equipped to crack the Under Graduate Teacher
                Recruitment Board (UGTRB) exam with confidence.
              </p>
            </div>
          </Card>

          {/* Key Highlights */}
          <Card color="orange">
            <div className="flex flex-col items-center justify-center text-center">
              <SectionHeader
                eyebrow="Our Program"
                title="Key Highlights"
                subtitle={null}
              />
            </div>
            <ul className="mx-auto mt-6 grid max-w-3xl gap-3 text-sm text-brand-black/80 sm:text-[15px]">
              {keyHighlights.map((highlight, idx) => (
                <li key={idx} className="grid grid-cols-[1.75rem_1fr] items-start gap-x-3">
                  <span className="mt-0.5 flex w-7 justify-center">
                    <Check className="h-5 w-5 text-brand-blue" />
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
                title="Why Choose Karthikeyan Analysis for UG TRB"
                subtitle={null}
              />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 place-items-center">
              <div className="rounded-lg bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 p-4">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Expert Faculty
                </h3>
                <p className="text-sm text-brand-black/70">
                  Experienced educators with deep insight into TRB exam patterns
                  and strategies.
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 p-4">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Structured Learning
                </h3>
                <p className="text-sm text-brand-black/70">
                  Weekly and monthly schedules for balanced theory,
                  problem-solving, and revision.
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 p-4">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Regular Assessments
                </h3>
                <p className="text-sm text-brand-black/70">
                  Chapter-wise tests and full-length mock exams with
                  personalized analysis.
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 p-4">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Quality Materials
                </h3>
                <p className="text-sm text-brand-black/70">
                  Comprehensive notes, PYQ papers, and formula handbooks
                  tailored for success.
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 p-4">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Doubt Clearance
                </h3>
                <p className="text-sm text-brand-black/70">
                  Interactive sessions to resolve doubts and provide career
                  guidance.
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 p-4">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Flexible Learning
                </h3>
                <p className="text-sm text-brand-black/70">
                  Online mode with recorded lectures and live classes at your
                  convenience.
                </p>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </PageLayout>
  );
}
