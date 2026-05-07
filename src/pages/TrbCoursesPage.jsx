import PageLayout from "../components/layout/PageLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";

export default function TrbCoursesPage() {
  return (
    <PageLayout
      title="TRB Courses"
      subtitle="Focused programs for UG TRB and PG TRB Mathematics with structured planning, regular tests, and expert mentoring."
    >
      <section className="bg-white/60 py-14">
        <Container className="grid gap-8 lg:grid-cols-2 place-items-center">
          <article className="w-full">
            <Card color="blue" className="text-center h-full">
              <div className="flex flex-col items-center justify-center">
                <SectionHeader
                  eyebrow="TRB"
                  title="UG TRB Programs"
                  subtitle={null}
                />
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-brand-black/80 inline-block text-left">
                <li>Expert faculty specialized in UGTRB Mathematics.</li>
                <li>Complete syllabus coverage and structured weekly plans.</li>
                <li>
                  Regular chapter tests, mock exams, and performance analysis.
                </li>
                <li>Quality notes, PYQ discussions, and formula handbooks.</li>
                <li>Live online and recorded sessions.</li>
              </ul>
            </Card>
          </article>
          <article className="w-full">
            <Card color="orange" className="text-center h-full">
              <div className="flex flex-col items-center justify-center">
                <SectionHeader
                  eyebrow="TRB"
                  title="PG TRB Programs"
                  subtitle={null}
                />
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-brand-black/80 inline-block text-left">
                <li>Subject experts with strong exam-training background.</li>
                <li>Structured material with expected question banks.</li>
                <li>Weekly unit tests and full-length mock exams.</li>
                <li>Dedicated doubt-clarification sessions.</li>
                <li>Flexible live, recorded, and weekend batches.</li>
              </ul>
            </Card>
          </article>
        </Container>
      </section>
    </PageLayout>
  );
}
