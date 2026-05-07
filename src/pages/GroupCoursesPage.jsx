import PageLayout from "../components/layout/PageLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";

const group1Posts = [
  "Deputy Collector",
  "Deputy Superintendent of Police",
  "Assistant Commissioner of Commercial Taxes",
  "Assistant Director of Rural Development",
  "District Employment Officer",
  "District Fire Officer",
];

const group2Posts = [
  "Municipal Commissioner",
  "Deputy Commercial Tax Officer",
  "Sub Registrar",
  "Assistant Inspector of Labour",
  "Junior Employment Officer",
  "Probation Officer",
];

const group2aPosts = [
  "Senior Inspector in Cooperative Societies",
  "Audit Inspector in HR&CE",
  "Handloom Inspector",
  "Junior Cooperative Auditor",
  "Executive Officer Grade II",
  "Assistant in Various Departments",
];

export default function GroupCoursesPage() {
  return (
    <PageLayout
      title="TNPSC Group I & II Services"
      subtitle="Focused and analytical coaching for Group I, Group II, and Group IIA Prelims and Mains with structured mentorship."
    >
      <section className="bg-white/60 py-14">
        <Container className="grid gap-8 lg:grid-cols-2 place-items-center">
          <article className="w-full">
            <Card color="blue" className="text-center h-full">
              <div className="flex flex-col items-center justify-center">
                <SectionHeader
                  eyebrow="Services"
                  title="Group I - Posts Included"
                  subtitle={null}
                />
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-brand-black/80 inline-block text-left">
                {group1Posts.map((post) => (
                  <li key={post}>{post}</li>
                ))}
              </ul>
            </Card>
          </article>
          <article className="w-full">
            <Card color="orange" className="text-center h-full">
              <div className="flex flex-col items-center justify-center">
                <SectionHeader
                  eyebrow="Services"
                  title="Group II - Posts Included"
                  subtitle={null}
                />
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-brand-black/80 inline-block text-left">
                {group2Posts.map((post) => (
                  <li key={post}>{post}</li>
                ))}
              </ul>
            </Card>
          </article>
          <article className="lg:col-span-2 w-full">
            <Card color="purple" className="text-center">
              <div className="flex flex-col items-center justify-center">
                <SectionHeader
                  eyebrow="Services"
                  title="Group IIA - Posts Included"
                  subtitle={null}
                />
              </div>
              <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-brand-black/80 md:grid-cols-2 justify-center">
                {group2aPosts.map((post) => (
                  <li key={post}>{post}</li>
                ))}
              </ul>
            </Card>
          </article>
        </Container>
      </section>
    </PageLayout>
  );
}
