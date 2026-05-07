import { Book, ClipboardList, FileText, Microscope, PenLine, Users } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Container from '../ui/Container'
import SectionHeader from '../ui/SectionHeader'

const provideItems = [
  { title: 'Structured Modules', icon: Book },
  { title: 'Weekly Test Cycles', icon: ClipboardList },
  { title: 'Mentor Evaluations', icon: Users },
  { title: 'Previous Year Focus', icon: FileText },
  { title: 'Descriptive Writing Labs', icon: PenLine },
  { title: 'Data Interpretation Drills', icon: Microscope },
]

function CourseTemplate({ title, postsIncluded, scheme, syllabusLinks }) {
  return (
    <Card className="space-y-10 md:p-8">
      <div>
        <h3 className="font-extrabold text-3xl text-brand-navy">{title}</h3>
        <p className="mt-3 text-sm text-brand-black/70">
          <strong className="text-brand-navy">Posts Included:</strong> {postsIncluded}
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-brand-navy">What We Provide</h4>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {provideItems.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white/60 p-4 shadow-sm ring-1 ring-black/[0.06]">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-brand-navy shadow-sm ring-1 ring-black/[0.06]">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-brand-black">{item.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-brand-navy">Scheme of Exam</h4>
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white/50 shadow-sm ring-1 ring-black/[0.06]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/[0.02] text-brand-black/70">
              <tr>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Marks</th>
              </tr>
            </thead>
            <tbody>
              {scheme.map((row) => (
                <tr key={row.stage} className="border-t border-black/10">
                  <td className="px-4 py-3">{row.stage}</td>
                  <td className="px-4 py-3">{row.mode}</td>
                  <td className="px-4 py-3">{row.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-brand-navy">Syllabus Links</h4>
        <div className="mt-4 flex flex-wrap gap-3">
          {syllabusLinks.map((item) => (
            <Button key={item} variant="secondary">
              Download {item} PDF
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default function CourseTemplateSection() {
  return (
    <section id="courses" className="bg-gradient-to-b from-slate-50/50 via-white to-white py-16 md:py-20">
      <Container>
        <SectionHeader
          eyebrow="Courses"
          title="A premium course blueprint"
          subtitle="Reusable academic structure for Group I, Group II, and Statistical Services — built to scale from foundation to final revision."
        />
        <div className="mt-8">
          <CourseTemplate
            title="TNPSC Statistical Services"
            postsIncluded="Assistant Director, Statistical Inspector, Junior Research Analyst"
            scheme={[
              { stage: 'Preliminary Exam', mode: 'Objective', marks: 300 },
              { stage: 'Main Written Exam', mode: 'Descriptive', marks: 450 },
              { stage: 'Oral Test', mode: 'Interview', marks: 60 },
            ]}
            syllabusLinks={['Prelims Syllabus', 'Mains Syllabus', 'Previous Year Questions']}
          />
        </div>
      </Container>
    </section>
  )
}
