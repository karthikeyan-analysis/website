import PageLayout from "../components/layout/PageLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";
import { Check } from "lucide-react";

export default function StatisticalServicesPage() {
  const features = [
    "Comprehensive coverage of the TNPSC Statistical Services syllabus, including Mathematics, Statistics and Economics (Degree Standard), and General Studies with Aptitude & Mental Ability.",
    "Experienced faculty team with backgrounds in Statistics, Mathematics, and Economics.",
    "Topic-wise classes, daily problem-solving sessions, and mock tests designed to mirror TNPSC exam patterns.",
    "Doubt clearance sessions, detailed study materials, and guidance on exam strategy.",
  ];

  return (
    <PageLayout
      title="TNPSC Statistical Services"
      subtitle="Comprehensive coaching for Statistical Services with focused, analytical, and result-driven approach"
    >
      <section className="bg-white/60 py-14">
        <Container className="space-y-8 text-brand-black/80">
          {/* Introduction */}
          <div className="prose max-w-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-1">
                <img
                  src="/tnpsc.png"
                  alt="TNPSC Statistical Services"
                  loading="eager"
                  decoding="async"
                  className="w-full rounded-xl bg-white object-contain"
                />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <p className="text-lg leading-relaxed">
                  At <strong>Karthikeyan Analysis Study Circle</strong>, we
                  specialize in providing top-notch coaching for{" "}
                  <strong>TNPSC Statistical Services Examination</strong>,
                  empowering aspirants with the knowledge, skills, and
                  confidence to succeed in one of Tamil Nadu's most competitive
                  exams. With a strong foundation in analytical teaching and
                  result-oriented strategies, our institute has become a trusted
                  destination for students aiming to secure posts such as
                  Assistant Director, Statistical Inspector,{" "}
                  <strong>
                    Assistant Statistical Investigator, Statistical Compiler
                  </strong>
                  , and other roles under the{" "}
                  <strong>TNPSC Statistical Subordinate Services</strong>.
                </p>
                <p className="text-lg font-semibold text-brand-navy italic">
                  "We aim not just to teach, but to mentor and guide every
                  aspirant towards a secure government career through the
                  Statistical Services stream"
                </p>
              </div>
            </div>
          </div>

          {/* Our Program Includes */}
          <Card color="blue">
            <div className="flex flex-col items-center justify-center text-center">
              <SectionHeader
                eyebrow="Our Services"
                title="Our program includes"
                subtitle={null}
              />
            </div>
            <ul className="mx-auto mt-6 grid max-w-3xl gap-3 text-sm text-brand-black/80 sm:text-[15px]">
              {features.map((feature, idx) => (
                <li key={idx} className="grid grid-cols-[1.75rem_1fr] items-start gap-x-3">
                  <span className="mt-0.5 flex w-7 justify-center">
                    <Check className="h-5 w-5 text-brand-blue" />
                  </span>
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Interview Posts Section */}
          <Card color="orange">
            <div className="flex flex-col items-center justify-center">
              <SectionHeader
                eyebrow="Career Opportunities"
                title="Posts included in Statistical Services (Interview Posts)"
                subtitle={null}
              />
            </div>
            <div className="-mx-4 mt-6 overflow-x-auto px-4">
              <table className="min-w-[56rem] w-full border-collapse border border-slate-400 text-sm sm:min-w-0">
                <thead>
                  <tr className="bg-[#002060] text-white">
                    <th className="border border-slate-400 p-3 font-bold">
                      Type
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Standard
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Posts
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Syllabus
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      rowSpan="5"
                      className="border border-slate-400 p-3 font-medium"
                    >
                      Combined Technical Services (Interview Posts)
                    </td>
                    <td className="border border-slate-400 p-3">UG Standard</td>
                    <td className="border border-slate-400 p-3">
                      <strong>Assistant Director of Statistics</strong>
                      <br />
                      Department of Economics and Statistics
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/504_statistics,maths%20and%20economics.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td rowSpan="4" className="border border-slate-400 p-3">
                      PG Standard
                    </td>
                    <td className="border border-slate-400 p-3">
                      <strong>Assistant Director of Industries</strong>
                      <br />
                      Department of Industries and Commerce
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/Combined_Assistant_Director_Commerce_563.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      <strong>Assistant Director of Handlooms</strong>
                      <br />
                      Department of Handlooms and Textiles
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/Combined_Assistant_Director_Commerce_563.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      <strong>Assistant Director (Statistical analyst)</strong>
                      <br />
                      Tamil Nadu Electricity and Regulatory Commission
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/Statistics_PG_std_410%20(1).pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      <strong>Assistant Manager in SIPCOT</strong>
                      <br />
                      State Industries Promotion Corporation of Tamil Nadu
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/564_Assistant%20Manager%20(SIPCOT).pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Scheme of Examination - Interview Posts */}
          <Card color="purple">
            <div className="flex flex-col items-center justify-center">
              <SectionHeader
                eyebrow="Exam Pattern"
                title="Scheme of the examination (Interview Posts)"
                subtitle={null}
              />
            </div>
            <div className="-mx-4 mt-6 overflow-x-auto px-4">
              <table className="min-w-[56rem] w-full border-collapse border border-slate-400 text-sm sm:min-w-0">
                <thead>
                  <tr className="bg-[#002060] text-white">
                    <th className="border border-slate-400 p-3 font-bold">
                      Name of the Examination
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      No. of Papers
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Paper Details
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Standard
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Objective/Descriptive
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Qualifying/Scoring
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      No. of Questions
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Marks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      rowSpan="4"
                      className="border border-slate-400 p-3 font-medium"
                    >
                      Combined Technical Services Examination (Interview Posts)
                    </td>
                    <td rowSpan="4" className="border border-slate-400 p-3">
                      2
                    </td>
                    <td className="border border-slate-400 p-3">
                      I.A) Tamil Eligibility Test
                    </td>
                    <td className="border border-slate-400 p-3">SSLC</td>
                    <td className="border border-slate-400 p-3">Objective</td>
                    <td className="border border-slate-400 p-3">Qualifying</td>
                    <td className="border border-slate-400 p-3">100</td>
                    <td className="border border-slate-400 p-3">150</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      I.B) General Studies
                    </td>
                    <td className="border border-slate-400 p-3">Degree</td>
                    <td className="border border-slate-400 p-3">Objective</td>
                    <td className="border border-slate-400 p-3">Scoring</td>
                    <td className="border border-slate-400 p-3">75</td>
                    <td rowSpan="2" className="border border-slate-400 p-3">
                      150
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      I.B) Aptitude and Mental Ability
                    </td>
                    <td className="border border-slate-400 p-3">SSLC</td>
                    <td className="border border-slate-400 p-3">Objective</td>
                    <td className="border border-slate-400 p-3">Scoring</td>
                    <td className="border border-slate-400 p-3">25</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      II. Subject Paper
                    </td>
                    <td className="border border-slate-400 p-3">
                      Degree/PG Degree
                    </td>
                    <td className="border border-slate-400 p-3">Objective</td>
                    <td className="border border-slate-400 p-3">Scoring</td>
                    <td className="border border-slate-400 p-3">200</td>
                    <td className="border border-slate-400 p-3">300</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan="6" className="border border-slate-400 p-3">
                      Total (Part B of Paper I and Paper II)
                    </td>
                    <td className="border border-slate-400 p-3">450</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan="6" className="border border-slate-400 p-3">
                      Interview
                    </td>
                    <td colSpan="2" className="border border-slate-400 p-3">
                      60
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Non-Interview Posts Section */}
          <Card color="green">
            <div className="flex flex-col items-center justify-center">
              <SectionHeader
                eyebrow="Career Opportunities"
                title="Posts included in Statistical Services (Non-Interview Posts)"
                subtitle={null}
              />
            </div>
            <div className="-mx-4 mt-6 overflow-x-auto px-4">
              <table className="min-w-[56rem] w-full border-collapse border border-slate-400 text-sm sm:min-w-0">
                <thead>
                  <tr className="bg-[#002060] text-white">
                    <th className="border border-slate-400 p-3 font-bold">
                      Type
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Standard
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Posts
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Syllabus
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      rowSpan="8"
                      className="border border-slate-400 p-3 font-medium"
                    >
                      Combined Technical Services (Non-Interview Posts)
                    </td>
                    <td
                      rowSpan="6"
                      className="border border-slate-400 p-3 text-center"
                    >
                      UG Standard
                    </td>
                    <td className="border border-slate-400 p-3">
                      <strong>Statistical Inspector</strong>
                      <br />
                      Department of Veterinary & Animal Husbandry
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/505_stat%20and%20maths.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      <strong>Statistical Compiler</strong>
                      <br />
                      Department of Public Health and Preventive Medicine
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/Stastics-418%20Tam%20&%20Eng.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      <strong>Assistant Statistical Investigator</strong>
                      <br />
                      Department of Statistics and Economics
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/504_statistics,maths%20and%20economics.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      <strong>Block Health Statistician</strong>
                      <br />
                      Department of Family Welfare
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/Stastics-418%20Tam%20&%20Eng.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      <strong>Computor</strong>
                      <br />
                      Department of Public Health and Preventive Medicine
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/Stastics-418%20Tam%20&%20Eng.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      <strong>Computor cum Vaccine Store Keeper</strong>
                      <br />
                      Department of Public Health and Preventive Medicine
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/505_stat%20and%20maths.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td
                      rowSpan="2"
                      className="border border-slate-400 p-3 text-center"
                    >
                      PG Standard
                    </td>
                    <td className="border border-slate-400 p-3">
                      <strong>Statistical Assistant</strong>
                      <br />
                      Department of Food Safety and Drug Administration
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/27122024_syllabus_stats_maths_pg_english.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      <strong>Research Assistant (Statistics)</strong>
                      <br />
                      Department of Town and Country Planning
                    </td>
                    <td className="border border-slate-400 p-3 text-center">
                      <a
                        href="https://tnpsc.gov.in/static_pdf/syllabus/27122024_syllabus_stats_maths_pg_english.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-brand-blue text-white px-3 py-1 rounded">
                          Click here
                        </button>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Scheme of Examination - Non-Interview Posts */}
          <Card color="pink">
            <div className="flex flex-col items-center justify-center">
              <SectionHeader
                eyebrow="Exam Pattern"
                title="Scheme of the examination (Non-Interview Posts)"
                subtitle={null}
              />
            </div>
            <div className="-mx-4 mt-6 overflow-x-auto px-4">
              <table className="min-w-[56rem] w-full border-collapse border border-slate-400 text-sm sm:min-w-0">
                <thead>
                  <tr className="bg-[#002060] text-white">
                    <th className="border border-slate-400 p-3 font-bold">
                      Name of the Examination
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      No. of Papers
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Paper Details
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Standard
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Objective/Descriptive
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Qualifying/Scoring
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      No. of Questions
                    </th>
                    <th className="border border-slate-400 p-3 font-bold">
                      Marks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      rowSpan="4"
                      className="border border-slate-400 p-3 font-medium"
                    >
                      Combined Technical Services Examination (Non-Interview
                      Posts)
                    </td>
                    <td rowSpan="4" className="border border-slate-400 p-3">
                      2
                    </td>
                    <td className="border border-slate-400 p-3">
                      I.A) Tamil Eligibility Test
                    </td>
                    <td className="border border-slate-400 p-3">SSLC</td>
                    <td className="border border-slate-400 p-3">Objective</td>
                    <td className="border border-slate-400 p-3">Qualifying</td>
                    <td className="border border-slate-400 p-3">100</td>
                    <td className="border border-slate-400 p-3">150</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      I.B) General Studies
                    </td>
                    <td className="border border-slate-400 p-3">Degree</td>
                    <td className="border border-slate-400 p-3">Objective</td>
                    <td className="border border-slate-400 p-3">Scoring</td>
                    <td className="border border-slate-400 p-3">75</td>
                    <td rowSpan="2" className="border border-slate-400 p-3">
                      150
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      I.B) Aptitude and Mental Ability
                    </td>
                    <td className="border border-slate-400 p-3">SSLC</td>
                    <td className="border border-slate-400 p-3">Objective</td>
                    <td className="border border-slate-400 p-3">Scoring</td>
                    <td className="border border-slate-400 p-3">25</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-3">
                      II. Subject Paper
                    </td>
                    <td className="border border-slate-400 p-3">
                      Degree/PG Degree
                    </td>
                    <td className="border border-slate-400 p-3">Objective</td>
                    <td className="border border-slate-400 p-3">Scoring</td>
                    <td className="border border-slate-400 p-3">200</td>
                    <td className="border border-slate-400 p-3">300</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan="6" className="border border-slate-400 p-3">
                      Total (Part B of Paper I and Paper II)
                    </td>
                    <td colSpan="2" className="border border-slate-400 p-3">
                      450
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Educational Qualifications Section */}
          <Card color="cyan" className="text-center">
            <div className="flex flex-col items-center justify-center">
              <SectionHeader
                eyebrow="Important Information"
                title="Educational Qualifications for Various Statistical Posts"
                subtitle={null}
              />
            </div>
            <div className="mt-6 flex justify-center items-center">
              <a
                href="https://drive.google.com/file/d/1D_MTuxblagLDLeLeVr-eHncs9CRZCV0c/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg"
              >
                Click Here
              </a>
            </div>
          </Card>
        </Container>
      </section>
    </PageLayout>
  );
}
