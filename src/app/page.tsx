import { Blogs } from "@/sections/Blogs";
import { ContactLenses } from "@/sections/ContactLenses";
import { CureBlindnessDetails } from "@/sections/CureBlindnessDetails";
import { CureBlindnessFeatures } from "@/sections/CureBlindnessFeatures";
import { CureBlindnessVideo } from "@/sections/CureBlindnessVideo";
import { FAQ } from "@/sections/FAQ";
import { Footer } from "@/sections/Footer";
import { Header } from "@/sections/Header";
import { Headline } from "@/sections/Headline";
import { Hero } from "@/sections/Hero";
import { LensType } from "@/sections/LensType";
import { Testimonials } from "@/sections/Testimonials";

export default function Home() {
  return (
    <main className="md:overflow-hidden">
      <Header />
      <Hero />
      <Headline />
      <ContactLenses />
      <CureBlindnessFeatures />
      <CureBlindnessDetails />
      <CureBlindnessVideo />
      <Blogs />
      <LensType />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
