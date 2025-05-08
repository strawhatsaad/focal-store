import cureBlindnessImage1 from "@/assets/cure-blindness-image1.png";
import cureBlindnessImage2 from "@/assets/cure-blindness-image2.jpg";
import LinkButton from "@/components/LinkButton";
import Image from "next/image";

export const CureBlindnessFeatures = () => {
  return (
    <section className="mt-6 md:mt-20">
      <div className="container">
        <div className="grid grid-cols-1 md:flex md:flex-row md:gap-10 md:w-full md:min-h-[575px] lg:min-h-[700px]">
          <div
            className="relative w-[325px] h-[500px] md:w-[1600px] md:h-[500px] lg:w-[1800px] lg:h-[600px] rounded-3xl hover:md:h-[525px] hover:lg:h-[650px] transition-all duration-[350ms]"
            style={{
              backgroundImage: `url('${cureBlindnessImage1.src}')`,
              backgroundSize: "cover",
              backgroundPosition: "bottom 0px left -195px",
            }}
          >
            <div className="bg-gradient-to-b from-transparent to-black/80 absolute top-0 left-0 w-full h-full rounded-3xl" />
            <div className="absolute flex flex-col bottom-12 md:bottom-16 lg:bottom-20 ml-5 rounded-3xl">
              <h2 className="text-3xl md:text-3xl lg:text-[40px] text-white font-extrabold tracking-tight">
                Focused on Vision
              </h2>
              <p className="text-white text-lg md:text-lg lg:text-2xl font-normal md:font-semibold">
                Subtext to be added later
              </p>
              <div className="flex gap-2 md:gap-2 lg:gap-4 mt-4">
                <LinkButton
                  title="Contact Lenses"
                  sectionId="contact-lenses-btn"
                  textStyles="md:text-sm lg:text-lg"
                  containerStyles="bg-white text-black px-5 py-2 md:px-3 md:py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                />
                <LinkButton
                  title="Glasses"
                  sectionId="glasses-btn"
                  textStyles="md:text-sm lg:text-lg"
                  containerStyles="bg-white text-black px-6 py-2 md:px-3 md:py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                />
              </div>
            </div>
          </div>
          <div
            className="w-[325px] h-[500px] md:w-[1600px] md:h-[500px] lg:w-[1800px] rounded-3xl lg:h-[600px] relative mt-12 hover:lg:h-[650px] hover:md:h-[525px] transition-all duration-[350ms]"
            style={{
              backgroundImage: `url('${cureBlindnessImage2.src}')`,
              backgroundSize: "cover",
              backgroundPosition: "bottom 20px left -135px",
            }}
          >
            <div className="bg-gradient-to-b from-transparent to-black/80 absolute top-0 left-0 w-full h-full rounded-3xl" />
            <div className="absolute flex flex-col max-w-full bottom-10 md:bottom-16 lg:bottom-20 ml-5 rounded-3xl">
              <h2 className="text-3xl md:text-3xl lg:text-[40px] text-white font-extrabold tracking-tight">
                Committed to Care
              </h2>
              <p className="text-white text-lg md:mt-2 md:text-lg lg:text-2xl tracking-tight leading-normal md:font-semibold sm:font-normal">
                Over 35 Million people are blind and have no access to eye care.
                Let&apos;s fix that.
              </p>
              <div className="flex gap-4 mt-4">
                <LinkButton
                  title="Learn More"
                  sectionId="learn-more-btn"
                  textStyles="text-lg md:text-sm lg:text-lg"
                  containerStyles="bg-white text-black px-6 py-1.5 md:px-3 md:py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
