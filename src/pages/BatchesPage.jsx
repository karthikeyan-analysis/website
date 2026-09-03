import { useState, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";
import {
  ongoingBatchesService,
  DEFAULT_ONGOING_BATCHES,
} from "../services/firebaseService";

export default function BatchesPage() {
  const [batches, setBatches] = useState(DEFAULT_ONGOING_BATCHES);

  useEffect(() => {
    const unsub = ongoingBatchesService.subscribeOngoingBatches((data) => {
      if (data && data.length > 0) {
        setBatches(data);
      }
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

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
                  {batches.map((batch, index) => {
                    const date = batch.commencementDate || batch[0] || "";
                    const course = batch.courseName || batch[1] || "";
                    const brochure = batch.brochureUrl || batch[2] || "";
                    const status = batch.status || batch[3] || "Closed";

                    return (
                      <tr
                        key={batch.id || index}
                        className="border-t border-black/10 hover:bg-black/5 transition-colors"
                      >
                        <td className="px-6 py-5 whitespace-nowrap">{date}</td>
                        <td className="px-6 py-5 font-semibold text-brand-navy">
                          {course}
                        </td>
                        <td className="px-6 py-5">
                          {brochure ? (
                            <a
                              href={brochure}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-brand-blue underline underline-offset-4 hover:text-brand-navy inline-flex items-center gap-1"
                            >
                              Click Here
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <Badge
                            tone={status === "Open" ? "success" : "danger"}
                          >
                            {status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </Container>
      </section>
    </PageLayout>
  );
}
