import StatsSection from "../components/sections/StatsSection";
import PageLayout from "../components/layout/PageLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";

export default function AboutPage() {
  return (
    <PageLayout title="Who Are We?" subtitle="About Us">
      <section className="bg-white/60 py-14">
        <Container className="space-y-8 text-brand-black/80">
          {/* Welcome Section */}
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed">
              Welcome to Karthikeyan Analysis Study Circle, a pioneering online
              coaching institute dedicated exclusively to TNPSC Group-I, II &
              Statistical Services aspirants. Since our inception in 2020, we
              have been on a mission to redefine how students prepare for
              analytical and challenging competitive exams in Tamil Nadu.
            </p>
          </div>

          {/* Our Story */}
          <Card color="blue" className="text-center">
            <div className="flex flex-col items-center justify-center">
              <SectionHeader
                eyebrow="Since 2020"
                title="Our Story"
                subtitle={null}
              />
            </div>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-center">
              <p>
                Karthikeyan Analysis Study Circle was founded with a simple yet
                powerful vision — to make quality Online coaching accessible,
                effective, and inspiring. Recognizing the lack of specialized
                platforms for TNPSC Statistical Services, our founder, Mr.
                Karthikeyan, set out to create a focused learning space where
                analytical thinking meets strategic preparation.
              </p>
              <p>
                Over the years, what started as a small learning initiative has
                evolved into a trusted online coaching hub for hundreds of
                aspirants across Tamil Nadu. Our success stories stand as a
                testament to our commitment, expertise, and unwavering belief in
                our students' potential.
              </p>
            </div>
          </Card>

          {/* What We Offer */}
          <Card color="orange">
            <div className="flex flex-col items-center justify-center text-center">
              <SectionHeader
                eyebrow="Our Specialization"
                title="What We Offer"
                subtitle={null}
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-brand-black/75 sm:text-[15px] sm:leading-relaxed">
              At Karthikeyan Analysis Study Circle, we specialize in TNPSC
              Statistical Services online crash courses — designed for serious
              aspirants who want to make the most of their preparation time. Our
              courses combine conceptual clarity with intensive practice,
              ensuring that students not only understand theories but can also
              apply them confidently in exam settings.
            </p>
            <ul className="mx-auto mt-6 grid max-w-3xl gap-3 text-sm text-brand-black/80 sm:text-[15px]">
              <li className="grid grid-cols-[1.75rem_1fr] items-start gap-x-3">
                <span className="mt-0.5 flex w-7 justify-center">
                  <i
                    className="fa-solid fa-book text-lg text-brand-blue"
                    aria-hidden="true"
                  />
                </span>
                <span className="leading-relaxed">
                  <strong>Comprehensive Online Lectures</strong> – Covering the
                  entire TNPSC Statistical syllabus in a structured,
                  easy-to-follow format.
                </span>
              </li>
              <li className="grid grid-cols-[1.75rem_1fr] items-start gap-x-3">
                <span className="mt-0.5 flex w-7 justify-center">
                  <i
                    className="fa-solid fa-calculator text-lg text-brand-blue"
                    aria-hidden="true"
                  />
                </span>
                <span className="leading-relaxed">
                  <strong>Concept-Driven Learning</strong> – Focusing on
                  understanding the "why" behind every topic.
                </span>
              </li>
              <li className="grid grid-cols-[1.75rem_1fr] items-start gap-x-3">
                <span className="mt-0.5 flex w-7 justify-center">
                  <i
                    className="fa-solid fa-chalkboard-user text-lg text-brand-blue"
                    aria-hidden="true"
                  />
                </span>
                <span className="leading-relaxed">
                  <strong>Expert Guidance</strong> – Mentorship and insights
                  from experienced professionals and educators.
                </span>
              </li>
              <li className="grid grid-cols-[1.75rem_1fr] items-start gap-x-3">
                <span className="mt-0.5 flex w-7 justify-center">
                  <i
                    className="fa-solid fa-clock text-lg text-brand-blue"
                    aria-hidden="true"
                  />
                </span>
                <span className="leading-relaxed">
                  <strong>Crash Course Format</strong> – Perfect for those who
                  seek focused, time-efficient preparation without compromising
                  on quality.
                </span>
              </li>
              <li className="grid grid-cols-[1.75rem_1fr] items-start gap-x-3">
                <span className="mt-0.5 flex w-7 justify-center">
                  <i
                    className="fa-solid fa-chart-bar text-lg text-brand-blue"
                    aria-hidden="true"
                  />
                </span>
                <span className="leading-relaxed">
                  <strong>Regular Assessments & Mock Tests</strong> – To help
                  students track progress, identify weak areas, and build exam
                  confidence.
                </span>
              </li>
            </ul>
          </Card>

          {/* Teaching Philosophy */}
          <Card color="purple" className="text-center">
            <div className="flex flex-col items-center justify-center">
              <SectionHeader
                eyebrow="Our Approach"
                title="Our Teaching Philosophy"
                subtitle={null}
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-center">
              Our approach blends academic depth, helping students not only
              clear the exam but also build a strong analytical foundation for
              their future careers. Every session at Karthikeyan Analysis Study
              Circle is designed to make learning interactive, engaging, and
              outcome-driven. We encourage questions, foster discussions, and
              focus on problem-solving — empowering students to transform their
              preparation into measurable results.
            </p>
          </Card>

          {/* Mission and Vision */}
          <div className="grid gap-6 lg:grid-cols-2 place-items-center">
            <Card color="green" className="text-center w-full">
              <div className="flex flex-col items-center justify-center">
                <SectionHeader
                  eyebrow="Direction"
                  title="Our Mission"
                  subtitle={null}
                />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-center">
                To empower TNPSC aspirants with the knowledge, skills, and
                confidence needed to excel in Statistical Services examinations.
                We aim to bridge the gap between learning and application
                through innovative online teaching methods, continuous
                evaluation, and personalized mentorship.
              </p>
            </Card>
            <Card color="pink" className="text-center w-full">
              <div className="flex flex-col items-center justify-center">
                <SectionHeader
                  eyebrow="Direction"
                  title="Our Vision"
                  subtitle={null}
                />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-center">
                To be the most trusted and result-oriented online coaching
                institute for TNPSC Statistical Services, producing analytical
                thinkers and data-savvy civil servants who can contribute
                meaningfully to the state's growth.
              </p>
            </Card>
          </div>

          {/* Join the Circle */}
          <Card
            color="cyan"
            className="bg-gradient-to-r from-cyan-50/85 to-blue-50/85"
          >
            <h3 className="text-2xl font-bold text-brand-black">
              Join the Circle
            </h3>
            <p className="mt-4 text-sm leading-relaxed">
              At Karthikeyan Analysis Study Circle, learning isn't just about
              passing an exam — it's about unlocking your analytical potential
              and shaping a career built on precision, logic, and purpose. If
              you're ready to take the next step toward your TNPSC Statistical
              Services dream, we're here to guide you every step of the way.
            </p>
            <p className="mt-3 text-lg font-semibold text-brand-blue">
              Karthikeyan Analysis Study Circle – Turning Analysis into
              Achievement.
            </p>
          </Card>
        </Container>
      </section>
      <StatsSection />
    </PageLayout>
  );
}
