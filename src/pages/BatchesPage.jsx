import PageLayout from "../components/layout/PageLayout";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";

const batches = [
  [
    "08.October.2025",
    "SURE SHOT STAT MISSION-26 (Integrated Course)",
    "https://drive.google.com/file/d/12plNT5TUl0SdWp5DuEnJ5YPb4e6huPdS/view?usp=sharing",
    "Closed",
  ],
  [
    "26.January.2026",
    "STAT MASTERS-26 (Exclusive Course)",
    "https://drive.google.com/file/d/1p90EvIw1NuusJKUFrZ0-jsP38VQ8xtl0/view?usp=sharing",
    "Closed",
  ],
  [
    "01.March.2026",
    "UG TRB MATHS BATCH (Full Course)",
    "https://drive.google.com/file/d/1BpDvLk1n8Lf1s-tXZVnIPlIyMkMDWxE7/view?usp=sharing",
    "Closed",
  ],
  [
    "01.May.2026",
    "STAT WIN-26 (Crash Course)",
    "https://drive.google.com/file/d/1DHDwlsJR9DJsB_QRgfCixnevTV91DdAl/view?usp=sharing",
    "Open",
  ],
];

export default function BatchesPage() {
  return (
    <PageLayout
      title="Our Batches"
      subtitle="Structured, expert-led live online classes for TNPSC Group Exams, Statistical Services, and TRB examinations."
    >
      <section className="bg-white/60 py-14">
        <Container className="space-y-8">
          {/* Introduction */}
          <Card color="blue">
            <p className="text-lg leading-relaxed text-brand-black/80">
              <strong>Karthikeyan Analysis Study Circle</strong> offers
              structured, expert-led <strong>Live Online Classes</strong>{" "}
              tailored for competitive exams such as{" "}
              <strong>
                TNPSC Group Exams, Statistical Services, and TRB Exams
              </strong>
              .
            </p>
          </Card>

          {/* Batches Table */}
          <Card color="orange">
            <SectionHeader
              eyebrow="Current Batches"
              title="Our Ongoing Batches"
              subtitle={null}
            />
            <div className="-mx-4 mt-6 overflow-x-auto px-4">
              <table className="min-w-[780px] w-full text-left text-sm sm:min-w-0">
                <thead className="bg-brand-navy text-white">
                  <tr>
                    <th className="px-6 py-4 font-bold">Commencement Date</th>
                    <th className="px-6 py-4 font-bold">Course Name</th>
                    <th className="px-6 py-4 font-bold">Course Brochure</th>
                    <th className="px-6 py-4 font-bold">Admission Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(([date, course, brochure, status]) => (
                    <tr key={course} className="border-t border-black/10">
                      <td className="px-6 py-5">{date}</td>
                      <td className="px-6 py-5 font-semibold text-brand-navy">
                        {course}
                      </td>
                      <td className="px-6 py-5">
                        <a
                          href={brochure}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-blue underline underline-offset-4 hover:text-brand-navy"
                        >
                          Click Here
                        </a>
                      </td>
                      <td className="px-6 py-5">
                        <Badge tone={status === "Open" ? "success" : "danger"}>
                          {status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Container>
      </section>
    </PageLayout>
  );
}
