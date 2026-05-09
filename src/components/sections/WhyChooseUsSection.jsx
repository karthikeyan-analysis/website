import {
  BarChart3,
  BookOpenCheck,
  ClipboardCheck,
  GraduationCap,
  Laptop,
  Medal,
  Target,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import Container from "../ui/Container";
import SectionHeader from "../ui/SectionHeader";
import Card from "../ui/Card";

const items = [
  {
    title: "Expert Faculty with Proven Track Record",
    desc: "Our team comprises experienced educators and subject experts in TNPSC, TRB, and competitive exams, including toppers and government service holders.",
    icon: GraduationCap,
    accent: "from-indigo-600 to-violet-600 ring-indigo-500/25",
  },
  {
    title: "Result-Oriented Coaching",
    desc: "We focus on real outcomes. Our students consistently clear Group I, Group II, Group IV, TRB, and Statistical Services with strong ranks.",
    icon: Target,
    accent: "from-emerald-600 to-teal-600 ring-emerald-500/25",
  },
  {
    title: "Concept-Based, Practical Teaching",
    desc: "Our analysis-based method builds concept clarity, analytical thinking, and exam-relevant strategy so students solve with confidence.",
    icon: BookOpenCheck,
    accent: "from-sky-600 to-blue-600 ring-sky-500/25",
  },
  {
    title: "High-Quality Study Material",
    desc: "Students get comprehensive notes, practice questions, model tests, and previous year papers aligned to the latest exam patterns.",
    icon: ClipboardCheck,
    accent: "from-amber-500 to-orange-600 ring-amber-400/25",
  },
  {
    title: "Personalized Attention & Mentorship",
    desc: "We keep batch sizes optimal so each student receives focused guidance, timely feedback, and one-to-one mentor support.",
    icon: Users,
    accent: "from-fuchsia-600 to-pink-600 ring-fuchsia-500/25",
  },
  {
    title: "Regular Tests & Performance Analysis",
    desc: "Weekly and monthly tests track your progress; detailed analytics help improve strengths, fix gaps, and raise scores consistently.",
    icon: BarChart3,
    accent: "from-cyan-600 to-sky-600 ring-cyan-500/25",
  },
  {
    title: "Online Learning Modes",
    desc: "Flexible live online sessions let aspirants prepare from anywhere without compromising teaching quality or mentor access.",
    icon: Laptop,
    accent: "from-slate-700 to-slate-900 ring-slate-500/25",
  },
  {
    title: "Trusted by Thousands of Aspirants",
    desc: "With a growing student base and high success rate, Karthikeyan Analysis has earned trust across Tamil Nadu.",
    icon: Medal,
    accent: "from-rose-600 to-red-600 ring-rose-500/25",
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="bg-gradient-to-b from-white via-slate-50/40 to-white py-16 md:py-20">
      <Container>
        <SectionHeader
          eyebrow="Why choose Karthikeyan Analysis"
          title="Best Online Platform for TNPSC Exams"
          subtitle="A professional, analysis-driven coaching ecosystem built for results, consistency, and rank-focused exam performance."
          align="center"
        />
        <div className="mt-12 grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className="h-full">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-sm ring-1 ${item.accent}`}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="mt-5 text-base font-semibold text-brand-navy">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-black/70">
                  {item.desc}
                </p>
              </Card>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
