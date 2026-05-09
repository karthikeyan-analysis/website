import PageLayout from "../components/layout/PageLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import { Download, Check } from "lucide-react";

export default function GroupIPage() {
  const features = [
    "Expert Faculty: Experienced mentors with in-depth knowledge of TNPSC syllabus and exam trends.",
    "Comprehensive Coverage: Classes covering General Studies, Aptitude, Polity, History, Geography, Economy, Science, and current affairs – all tailored to the latest TNPSC Group I Prelims syllabus.",
    "Regular Tests & Performance Analysis: Weekly and full-length mock tests with detailed answer key and performance tracking.",
    "Updated Study Materials: Well-researched, exam-focused notes in both English and Tamil.",
    "Doubt Clearing & Mentorship: One-on-one sessions to guide students through difficult topics and exam strategies.",
    "Bilingual Classes: Courses offered in both Tamil and English mediums.",
    "Flexible Learning Modes: We provide live online and recorded classes.",
  ];

  const posts = [
    "Deputy Collector",
    "Deputy Superintend of Police",
    "Assistant Commissioner of Commercial Taxes",
    "Assistant Director of Rural Development",
    "District Employment Officer",
    "District Fire Officer",
  ];

  const handleDownloadSyllabus = () => {
    const link = document.createElement("a");
    link.href = "/497_group-1-preliminary-syllabus.pdf";
    link.download = "497_group-1-preliminary-syllabus.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageLayout
      title="TNPSC Group I Examinations"
      subtitle="Comprehensive coaching for Group I Prelims and Mains"
    >
      <section className="bg-white/60 py-14">
        <Container className="space-y-8 text-brand-black/80">
          {/* Introduction */}
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed">
              At Karthikeyan Analysis Study Circle, we specialize in TNPSC Group
              I Prelims and Mains Coaching with a focused, analytical, and
              result-driven approach. Our program is carefully designed to help
              serious aspirants crack one of Tamil Nadu's most competitive exams
              with confidence and clarity.
            </p>
          </div>

          {/* We Provide Section */}
          <Card color="blue">
            <div className="flex flex-col items-center justify-center text-center">
              <SectionHeader
                eyebrow="Our Services"
                title="We Provide"
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

          {/* Posts Section */}
          <Card color="orange" className="text-center">
            <div className="flex flex-col items-center justify-center">
              <SectionHeader
                eyebrow="Career Opportunities"
                title="Posts Included in Group-I Services"
                subtitle={null}
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 max-w-2xl mx-auto">
              {posts.map((post, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 px-4 py-2 text-sm font-semibold text-brand-navy border border-brand-blue/20"
                >
                  {post}
                </div>
              ))}
            </div>
          </Card>

          {/* Examination Structure */}
          <div className="grid gap-6 lg:grid-cols-2 place-items-center">
            <Card color="purple" className="w-full">
              <div className="flex flex-col items-center justify-center">
                <SectionHeader
                  eyebrow="Three Stages"
                  title="Stages of Examination"
                  subtitle={null}
                />
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-brand-blue/20 px-3 py-1 text-sm font-bold text-brand-blue">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">
                      Preliminary (Objective Type)
                    </p>
                    <p className="text-sm text-brand-black/60 mt-1">
                      General Studies and Aptitude Test
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-brand-blue/20 px-3 py-1 text-sm font-bold text-brand-blue">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">
                      Mains (Descriptive Type)
                    </p>
                    <p className="text-sm text-brand-black/60 mt-1">
                      General Studies I, II, III & Tamil Eligibility Test
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-brand-blue/20 px-3 py-1 text-sm font-bold text-brand-blue">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">
                      Personality Test (Interview)
                    </p>
                    <p className="text-sm text-brand-black/60 mt-1">
                      Final selection round
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card color="green" className="w-full">
              <div className="flex flex-col items-center justify-center">
                <SectionHeader
                  eyebrow="Exam Pattern"
                  title="Quick Overview"
                  subtitle={null}
                />
              </div>
              <div className="mt-6 space-y-4 text-sm">
                <div className="rounded-lg bg-white p-3 border border-black/10">
                  <p className="font-semibold text-brand-navy">
                    Preliminary Exam
                  </p>
                  <p className="text-brand-black/60 mt-1">
                    2 Papers | 300 Marks | Objective Type
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-black/10">
                  <p className="font-semibold text-brand-navy">Mains Exam</p>
                  <p className="text-brand-black/60 mt-1">
                    4 Papers | 850 Marks | Descriptive Type
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-black/10">
                  <p className="font-semibold text-brand-navy">Interview</p>
                  <p className="text-brand-black/60 mt-1">
                    100 Marks | Final Assessment
                  </p>
                </div>
              </div>
            </Card>
          </div>
          <div className="-mx-2 overflow-x-auto rounded-lg pb-4 sm:-mx-0 sm:overflow-x-visible">
            <div className="inline-block min-w-full align-middle sm:block">
              <table className="min-w-[40rem] w-full border-collapse border border-slate-400 text-sm font-sans text-slate-800 sm:min-w-0">
              <thead>
                <tr className="bg-[#002060] text-white text-center">
                  <th className="border border-slate-400 p-2 font-bold">
                    Name of the Examination
                  </th>
                  <th className="border border-slate-400 p-2 font-bold">
                    No. of Papers
                  </th>
                  <th className="border border-slate-400 p-2 font-bold" colSpan={2}>
                    Paper Details
                  </th>
                  <th className="border border-slate-400 p-2 font-bold">
                    Standard
                  </th>
                  <th className="border border-slate-400 p-2 font-bold">
                    Descriptive / Objective
                  </th>
                  <th className="border border-slate-400 p-2 font-bold">
                    Qualifying / Scoring
                  </th>
                  <th className="border border-slate-400 p-2 font-bold">
                    No. of Questions
                  </th>
                  <th className="border border-slate-400 p-2 font-bold">Marks</th>
                </tr>
                <tr className="bg-slate-50 font-bold text-center">
                  <td colSpan={9} className="border border-slate-400 py-1">
                    Civil Services
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    rowSpan={3}
                    className="border border-slate-400 p-3 font-semibold text-center align-middle w-1/5"
                  >
                    Combined Civil Services (Preliminary) Examination (Group I)
                  </td>
                  <td
                    rowSpan={3}
                    className="border border-slate-400 text-center align-middle"
                  >
                    1
                  </td>
                  <td className="border border-slate-400 text-center p-2">A</td>
                  <td className="border border-slate-400 p-2">General Studies</td>
                  <td className="border border-slate-400 text-center">Degree</td>
                  <td className="border border-slate-400 text-center">Objective</td>
                  <td className="border border-slate-400 text-center">
                    Qualifying
                  </td>
                  <td className="border border-slate-400 text-center">175</td>
                  <td
                    rowSpan={2}
                    className="border border-slate-400 text-center align-middle font-semibold"
                  >
                    300
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-400 text-center p-2">B</td>
                  <td className="border border-slate-400 p-2">
                    Aptitude and Mental Ability
                  </td>
                  <td className="border border-slate-400 text-center">SSLC</td>
                  <td className="border border-slate-400 text-center">Objective</td>
                  <td className="border border-slate-400 text-center">
                    Qualifying
                  </td>
                  <td className="border border-slate-400 text-center">25</td>
                </tr>
                <tr className="bg-slate-50 font-semibold">
                  <td
                    colSpan={5}
                    className="border border-slate-400 text-center py-1"
                  >
                    Total
                  </td>
                  <td className="border border-slate-400 text-center">200</td>
                  <td className="border border-slate-400 text-center"></td>
                </tr>

                <tr>
                  <td
                    rowSpan={6}
                    className="border border-slate-400 p-3 font-semibold text-center align-middle w-1/5"
                  >
                    Combined Civil Services (Main) Examination (Group I)
                  </td>
                  <td
                    rowSpan={4}
                    className="border border-slate-400 text-center align-middle"
                  >
                    4
                  </td>
                  <td className="border border-slate-400 text-center p-2">I</td>
                  <td className="border border-slate-400 p-2">
                    Tamil Eligibility Test
                  </td>
                  <td className="border border-slate-400 text-center">SSLC</td>
                  <td className="border border-slate-400 text-center">
                    Descriptive
                  </td>
                  <td className="border border-slate-400 text-center">
                    Qualifying
                  </td>
                  <td className="border border-slate-400 text-center"></td>
                  <td className="border border-slate-400 text-center p-2">100</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 text-center p-2">II</td>
                  <td className="border border-slate-400 p-2">General Studies I</td>
                  <td className="border border-slate-400 text-center">Degree</td>
                  <td className="border border-slate-400 text-center">
                    Descriptive
                  </td>
                  <td className="border border-slate-400 text-center">Scoring</td>
                  <td className="border border-slate-400 text-center"></td>
                  <td className="border border-slate-400 text-center p-2">250</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 text-center p-2">III</td>
                  <td className="border border-slate-400 p-2">
                    General Studies II
                  </td>
                  <td className="border border-slate-400 text-center">Degree</td>
                  <td className="border border-slate-400 text-center">
                    Descriptive
                  </td>
                  <td className="border border-slate-400 text-center">Scoring</td>
                  <td className="border border-slate-400 text-center">--</td>
                  <td className="border border-slate-400 text-center p-2">250</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 text-center p-2">IV</td>
                  <td className="border border-slate-400 p-2">
                    General Studies III
                  </td>
                  <td className="border border-slate-400 text-center">Degree</td>
                  <td className="border border-slate-400 text-center">
                    Descriptive
                  </td>
                  <td className="border border-slate-400 text-center">Scoring</td>
                  <td className="border border-slate-400 text-center"></td>
                  <td className="border border-slate-400 text-center p-2">250</td>
                </tr>
                <tr>
                  <td
                    colSpan={7}
                    className="border border-slate-400 text-center py-1 font-semibold"
                  >
                    Interview
                  </td>
                  <td className="border border-slate-400 text-center font-semibold">
                    100
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td
                    colSpan={7}
                    className="border border-slate-400 text-center py-1"
                  >
                    Total (Paper II, III, IV and Interview)
                  </td>
                  <td className="border border-slate-400 text-center">850</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          {/* Syllabus Section - Below Table */}
          <Card color="cyan">
            <SectionHeader
              eyebrow="Examination Details"
              title="Syllabus of Examinations"
              subtitle={null}
            />
            <p className="mt-4 text-sm leading-relaxed">
              TNPSC has revised the Syllabus of the examination in the year
              2024-25 which includes subject wise and unit wise weightage.
            </p>
            <div className="mt-6">
              <button
                onClick={handleDownloadSyllabus}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg"
              >
                <Download className="h-4 w-4" />
                To know about the detailed prelims syllabus
              </button>
            </div>
          </Card>
        </Container>
      </section>
    </PageLayout>
  );
}
