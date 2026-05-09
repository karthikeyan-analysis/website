import PageLayout from "../components/layout/PageLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import { Download, Check } from "lucide-react";

export default function GroupIIPage() {
  const features = [
    "Expert Faculty: Experienced mentors with in-depth knowledge of TNPSC syllabus and exam trends.",
    "Comprehensive Coverage: Classes covering General Studies, Aptitude, Polity, History, Geography, Economy, Science, and current affairs – all tailored to the latest TNPSC Group II & II A Prelims syllabus.",
    "Regular Tests & Performance Analysis: Weekly and full-length mock tests with detailed answer key and performance tracking.",
    "Updated Study Materials: Well-researched, exam-focused notes in both English and Tamil.",
    "Doubt Clearing & Mentorship: One-on-one sessions to guide students through difficult topics and exam strategies.",
    "Bilingual Classes: Courses offered in both Tamil and English mediums.",
    "Flexible Learning Modes: We provide live online and recorded classes.",
  ];

  const groupIIPosts = [
    "Municipal Commissioner",
    "Deputy Commercial Tax Officer",
    "Sub Registrar",
    "Assistant Inspector of Labour",
    "Junior Employment Officer",
    "Probation Officer",
    "Special Branch Assistant in SBCID",
    "Forester",
    "Assistant Section Officer",
    "Assistant Section Officer cum Programmer",
  ];

  const groupIIAPosts = [
    "Senior Inspector in Cooperative Societies",
    "Audit Inspector in Hindu Religious and Charitable Endowments",
    "Assistant Inspector in Local Fund Audit",
    "Handloom Inspector",
    "Junior Supervisor or Junior Superintendent",
    "Senior Revenue Inspector",
    "Junior Cooperative Auditor",
    "Executive Officer Grade II (Town Panchayat)",
    "Audit Assistant",
    "Assistant in Various Departments",
  ];

  const handleDownloadPrelimsSyllabus = () => {
    const link = document.createElement("a");
    link.href = "/group2/495_Group-II-and-IIA-prelims.pdf";
    link.download = "495_Group-II-and-IIA-prelims.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadGroupIIMains = () => {
    const link = document.createElement("a");
    link.href = "/group2/469_Group-II-mains.pdf";
    link.download = "469_Group-II-mains.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadGroupIIAMains = () => {
    const link = document.createElement("a");
    link.href = "/group2/470_Group-IIA-mains.pdf";
    link.download = "470_Group-IIA-mains.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageLayout
      title="TNPSC Group II & II A Examinations"
      subtitle="Comprehensive coaching for Group II & II A Prelims and Mains"
    >
      <section className="bg-white/60 py-14">
        <Container className="space-y-8 text-brand-black/80">
          {/* Introduction */}
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed">
              At Karthikeyan Analysis Study Circle, we specialize in TNPSC Group
              II, II A Prelims and Mains Coaching with a focused, analytical,
              and result-driven approach. Our program is carefully designed to
              help serious aspirants crack one of Tamil Nadu's most competitive
              exams with confidence and clarity.
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

          {/* Group II Posts Section */}
          <Card color="orange" className="text-center">
            <div className="flex flex-col items-center justify-center">
              <SectionHeader
                eyebrow="Career Opportunities"
                title="Posts Included in Group II Services"
                subtitle={null}
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 max-w-2xl mx-auto">
              {groupIIPosts.map((post, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 px-4 py-2 text-sm font-semibold text-brand-navy border border-brand-blue/20"
                >
                  {post}
                </div>
              ))}
            </div>
          </Card>

          {/* Group II A Posts Section */}
          <Card color="purple" className="text-center">
            <div className="flex flex-col items-center justify-center">
              <SectionHeader
                eyebrow="Career Opportunities"
                title="Posts Included in Group II A Services"
                subtitle={null}
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 max-w-2xl mx-auto">
              {groupIIAPosts.map((post, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-gradient-to-r from-brand-orange/10 to-brand-maroon/10 px-4 py-2 text-sm font-semibold text-brand-navy border border-brand-orange/20"
                >
                  {post}
                </div>
              ))}
            </div>
          </Card>

          {/* Examination Structure */}
          <div className="grid gap-6 lg:grid-cols-2 place-items-center">
            <Card color="green" className="w-full">
              <div className="flex flex-col items-center justify-center">
                <SectionHeader
                  eyebrow="Two Stages"
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
                      Mains (Objective Type)
                    </p>
                    <p className="text-sm text-brand-black/60 mt-1">
                      General Studies & Language Test
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card color="pink" className="w-full">
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
                    1 Paper | 300 Marks | Objective Type
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-black/10">
                  <p className="font-semibold text-brand-navy">Mains Exam</p>
                  <p className="text-brand-black/60 mt-1">
                    2-3 Papers | 400-500 Marks | Descriptive Type
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

          {/* Syllabus Section */}
          <div className="py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-brand-black mb-2">
                Syllabus of Examinations
              </h2>
              <p className="text-brand-black/70 text-base leading-relaxed">
                TNPSC has revised the Syllabus of the examination in the year
                2024-25 which includes subject wise and unit wise weightage.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Prelims Syllabus Card */}
              <Card color="cyan">
                <div className="text-center space-y-4">
                  <p className="text-sm font-semibold text-brand-orange uppercase tracking-wide">
                    To Know About The Detailed
                  </p>
                  <h3 className="text-lg font-bold text-brand-navy">
                    Prelims Syllabus
                  </h3>
                  <button
                    onClick={handleDownloadPrelimsSyllabus}
                    className="w-full rounded-lg bg-gradient-to-r from-brand-orange to-brand-maroon px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg"
                  >
                    Click Here
                  </button>
                </div>
              </Card>

              {/* Group II Mains Syllabus Card */}
              <Card color="amber">
                <div className="text-center space-y-4">
                  <p className="text-sm font-semibold text-brand-navy uppercase tracking-wide">
                    To Know About The Detailed
                  </p>
                  <h3 className="text-lg font-bold text-brand-navy">
                    Group II Mains Syllabus
                  </h3>
                  <button
                    onClick={handleDownloadGroupIIMains}
                    className="w-full rounded-lg bg-gray-300 px-4 py-3 text-sm font-semibold text-brand-navy transition hover:bg-gray-400"
                  >
                    Click Here
                  </button>
                </div>
              </Card>

              {/* Group IIA Mains Syllabus Card */}
              <Card color="rose">
                <div className="text-center space-y-4">
                  <p className="text-sm font-semibold text-brand-orange uppercase tracking-wide">
                    To Know About The Detailed
                  </p>
                  <h3 className="text-lg font-bold text-brand-navy">
                    Group IIA Mains Syllabus
                  </h3>
                  <button
                    onClick={handleDownloadGroupIIAMains}
                    className="w-full rounded-lg bg-gradient-to-r from-brand-orange to-brand-maroon px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg"
                  >
                    Click Here
                  </button>
                </div>
              </Card>
            </div>
          </div>
          <div className="-mx-2 overflow-x-auto pb-4 sm:-mx-0 sm:overflow-x-visible">
            <div className="inline-block min-w-full align-middle p-4 font-sans text-[13px] leading-tight text-slate-900 sm:block sm:p-4">
              <table className="min-w-[42rem] w-full border-collapse border border-slate-400 text-center sm:min-w-0">
              <thead>
                <tr className="bg-[#002060] text-white">
                  <th className="border border-slate-400 p-2 font-bold w-[20%]">
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
              </thead>

              <tbody>
                <tr>
                  <td
                    rowSpan={4}
                    className="border border-slate-400 p-3 font-medium align-middle"
                  >
                    Combined Civil Services (Preliminary) Examination (Group II
                    and IIA)
                  </td>
                  <td rowSpan={4} className="border border-slate-400 align-middle">
                    1
                  </td>
                  <td className="border border-slate-400 p-2">A</td>
                  <td className="border border-slate-400 p-2 text-left">
                    General Studies
                  </td>
                  <td className="border border-slate-400">Degree</td>
                  <td className="border border-slate-400">Objective</td>
                  <td className="border border-slate-400">Qualifying</td>
                  <td className="border border-slate-400">75</td>
                  <td
                    rowSpan={3}
                    className="border border-slate-400 align-middle font-semibold"
                  >
                    300
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-2">B</td>
                  <td className="border border-slate-400 p-2 text-left">
                    Aptitude and Mental Ability
                  </td>
                  <td className="border border-slate-400">SSLC</td>
                  <td className="border border-slate-400">Objective</td>
                  <td className="border border-slate-400">Qualifying</td>
                  <td className="border border-slate-400">25</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-2">C</td>
                  <td className="border border-slate-400 p-2 text-left">
                    Language (General Tamil or General English)
                  </td>
                  <td className="border border-slate-400">SSLC</td>
                  <td className="border border-slate-400">Objective</td>
                  <td className="border border-slate-400">Qualifying</td>
                  <td className="border border-slate-400">100</td>
                </tr>
                <tr className="bg-slate-50 font-semibold text-center">
                  <td colSpan={5} className="border border-slate-400 py-1">
                    Total
                  </td>
                  <td className="border border-slate-400">200</td>
                  <td className="border border-slate-400"></td>
                </tr>

                <tr>
                  <td
                    rowSpan={2}
                    className="border border-slate-400 p-3 font-medium align-middle"
                  >
                    Combined Civil Services (Main) Examination (Group II)
                  </td>
                  <td rowSpan={2} className="border border-slate-400 align-middle">
                    2
                  </td>
                  <td className="border border-slate-400 p-2 text-center">I</td>
                  <td className="border border-slate-400 p-2 text-left">
                    Tamil Eligibility Test
                  </td>
                  <td className="border border-slate-400">SSLC</td>
                  <td className="border border-slate-400">Descriptive</td>
                  <td className="border border-slate-400">Qualifying</td>
                  <td rowSpan={2} className="border border-slate-400 align-middle">
                    --
                  </td>
                  <td className="border border-slate-400 p-2">100</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-2 text-center">II</td>
                  <td className="border border-slate-400 p-2 text-left">
                    General Studies
                  </td>
                  <td className="border border-slate-400">Degree</td>
                  <td className="border border-slate-400">Descriptive</td>
                  <td className="border border-slate-400">Scoring</td>
                  <td className="border border-slate-400 p-2">300</td>
                </tr>

                <tr>
                  <td
                    rowSpan={4}
                    className="border border-slate-400 p-3 font-medium align-middle"
                  >
                    Combined Civil Services (Main) Examination (Group IIA)
                  </td>
                  <td rowSpan={4} className="border border-slate-400 align-middle">
                    2
                  </td>
                  <td className="border border-slate-400 p-2 text-center">I</td>
                  <td className="border border-slate-400 p-2 text-left">
                    Tamil Eligibility Test
                  </td>
                  <td className="border border-slate-400">SSLC</td>
                  <td className="border border-slate-400">Descriptive</td>
                  <td className="border border-slate-400">Qualifying</td>
                  <td className="border border-slate-400">--</td>
                  <td className="border border-slate-400 p-2">100</td>
                </tr>
                <tr>
                  <td
                    rowSpan={3}
                    className="border border-slate-400 p-2 text-center align-middle"
                  >
                    II
                  </td>
                  <td className="border border-slate-400 p-2 text-left">
                    A. General Studies
                  </td>
                  <td className="border border-slate-400">Degree</td>
                  <td className="border border-slate-400">Objective</td>
                  <td className="border border-slate-400">Scoring</td>
                  <td className="border border-slate-400">100</td>
                  <td className="border border-slate-400 p-2">150</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-2 text-left">
                    B. General Intelligence and Reasoning
                  </td>
                  <td className="border border-slate-400">SSLC</td>
                  <td className="border border-slate-400">Objective</td>
                  <td className="border border-slate-400">Scoring</td>
                  <td className="border border-slate-400">40</td>
                  <td className="border border-slate-400 p-2">60</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-2 text-left">
                    C. Language (General Tamil or General English)
                  </td>
                  <td className="border border-slate-400">SSLC</td>
                  <td className="border border-slate-400">Objective</td>
                  <td className="border border-slate-400">Scoring</td>
                  <td className="border border-slate-400">60</td>
                  <td className="border border-slate-400 p-2">90</td>
                </tr>

                <tr className="bg-slate-50 font-bold text-center">
                  <td colSpan={7} className="border border-slate-400 py-1">
                    Total
                  </td>
                  <td className="border border-slate-400">200</td>
                  <td className="border border-slate-400">300</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
