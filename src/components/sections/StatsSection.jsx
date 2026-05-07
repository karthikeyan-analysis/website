import { motion } from "framer-motion";
import { useCountUp } from "../../hooks/useCountUp";
import Container from "../ui/Container";
import SectionHeader from "../ui/SectionHeader";
import { Award, BookOpen, GraduationCap, Users } from "lucide-react";

const stats = [
  { label: "Aspirants Enrolled", value: 1000, suffix: "+", icon: Users },
  { label: "Successful Students", value: 500, suffix: "+", icon: Award },
  { label: "Courses", value: 20, suffix: "+", icon: BookOpen },
  { label: "Dedicated Faculties", value: 10, suffix: "+", icon: GraduationCap },
];

function StatCard({ label, value, suffix, icon: Icon }) {
  const { ref, count } = useCountUp(value);

  return (
    <div ref={ref}>
      <div className="group relative">
        <div className="absolute -inset-2 rounded-3xl bg-brand-orange/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative rounded-3xl bg-white/12 p-[1px] shadow-soft">
          <div className="rounded-3xl bg-white/10 px-6 py-7 backdrop-blur ring-1 ring-white/10 transition-transform duration-300 group-hover:-translate-y-0.5">
            <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Icon className="h-5 w-5 text-white/90" />
            </div>
            <p className="text-center font-extrabold text-5xl leading-none md:text-6xl">
              <span className="text-white">
                {count}
                {suffix}
              </span>
            </p>
            <p className="mt-3 text-center text-sm font-semibold tracking-wide text-white/80">
              {label}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-brand-navy py-16">
      <div
        className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-brand-orange/18 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-48 -bottom-48 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader
            align="center"
            eyebrow="Proof"
            title="Our Work Stats"
            subtitle="Aspirants trust us for structured preparation, consistent tests, and measurable progress."
            theme="dark"
          />
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </Container>
    </section>
  );
}
