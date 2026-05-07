import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import HeroSection from "../components/sections/HeroSection";
import WhyChooseUsSection from "../components/sections/WhyChooseUsSection";
import StudentTestimonialsSection from "../components/sections/StudentTestimonialsSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <WhyChooseUsSection />
        <StudentTestimonialsSection />
      </main>
      <Footer />
    </>
  );
}
