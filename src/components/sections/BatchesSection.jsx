import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Container from '../ui/Container'
import SectionHeader from '../ui/SectionHeader'

const batches = [
  { date: '01.May.2026', course: 'STAT WIN-26 Crash Course', status: 'Open' },
  { date: '15.May.2026', course: 'Group II Prelims Smart Track', status: 'Open' },
  { date: '22.May.2026', course: 'TRB Science Revision Camp', status: 'Closed' },
]

export default function BatchesSection() {
  return (
    <section id="batches" className="bg-white/60 py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Admissions"
            title="Current Batches"
            subtitle="Modern live online classes with structured schedules, mentorship, and weekly tests."
          />
          <Link to="/batches">
            <Button variant="secondary">View full batches</Button>
          </Link>
        </div>

        <div className="mt-8 overflow-x-auto">
          <Card className="p-0">
            <table className="min-w-[860px] w-full text-left text-sm">
              <thead className="bg-black/[0.02] text-brand-black/70">
                <tr>
                  <th className="px-6 py-4">Commencement Date</th>
                  <th className="px-6 py-4">Course Name</th>
                  <th className="px-6 py-4">Admission Status</th>
                  <th className="px-6 py-4">Brochure</th>
                  <th className="px-6 py-4">Apply</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.course} className="border-t border-black/10">
                    <td className="px-6 py-5 text-brand-black/80">{batch.date}</td>
                    <td className="px-6 py-5 font-semibold text-brand-navy">{batch.course}</td>
                    <td className="px-6 py-5">
                      <Badge tone={batch.status === 'Open' ? 'success' : 'danger'}>{batch.status}</Badge>
                    </td>
                    <td className="px-6 py-5">
                      <Button variant="secondary" className="px-3 py-2 text-xs">
                        Download
                      </Button>
                    </td>
                    <td className="px-6 py-5">
                      <Button className="px-3 py-2 text-xs">Apply Now</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </Container>
    </section>
  )
}
