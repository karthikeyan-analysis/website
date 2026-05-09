import Footer from "./Footer";
import Header from "./Header";
import Container from "../ui/Container";
import SectionHeader from "../ui/SectionHeader";

export default function PageLayout({ title, subtitle, children }) {
  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-black/[0.06] bg-gradient-to-b from-slate-50 via-white to-white">
          <div className="absolute inset-0 noise opacity-70" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -right-40 -top-32 h-[22rem] w-[22rem] rounded-full bg-brand-sky/[0.12] blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-48 -left-32 h-[20rem] w-[20rem] rounded-full bg-brand-purple/[0.1] blur-3xl"
            aria-hidden="true"
          />
          <Container className="relative py-8 md:py-10 lg:py-12">
            <SectionHeader
              eyebrow="Karthikeyan Analysis"
              title={title}
              subtitle={subtitle}
              align="center"
            />
          </Container>
        </section>
        {children}
      </main>
      <Footer />
    </>
  );
}
