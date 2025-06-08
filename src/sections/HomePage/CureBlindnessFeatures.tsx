import cureBlindnessImage1 from "@/assets/cure-blindness-image1.png";
import cureBlindnessImage2 from "@/assets/cure-blindness-image2.jpg";
import LinkButton from "@/components/LinkButton";
import Link from "next/link";
// import Image from "next/image"; // Not used directly, background images are used

export const CureBlindnessFeatures = () => {
  return (
    // Adjusted top margin for different screen sizes
    <section className="mt-12 sm:mt-16 md:mt-20">
      <div className="container">
        {/* Grid for small screens (1 column), flex for medium and up (row) */}
        <div className="grid grid-cols-1 md:flex md:flex-row gap-8 md:gap-10 md:w-full md:min-h-[575px] lg:min-h-[700px]">
          {/* Card 1: Focused on Vision */}
          <div
            className="relative w-full h-[400px] sm:h-[450px] md:w-1/2 md:h-[500px] lg:h-[600px] rounded-3xl bg-cover bg-center hover:md:h-[525px] hover:lg:h-[650px] transition-all duration-[350ms]"
            style={{
              backgroundImage: `url('${cureBlindnessImage1.src}')`,
              // Adjusted backgroundPosition for smaller screens, more specific for larger
              backgroundPosition:
                "center left -100px sm:center left -150px md:bottom 0px left -195px",
            }}
          >
            <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute inset-0 rounded-3xl" />
            <div className="absolute flex flex-col bottom-6 sm:bottom-8 md:bottom-12 lg:bottom-16 left-4 right-4 sm:left-5 sm:right-5 p-4 rounded-3xl">
              {/* Adjusted text sizes */}
              <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-[40px] text-white font-extrabold tracking-tight">
                Focused on Vision
              </h2>
              <p className="text-white text-base sm:text-lg md:text-lg lg:text-2xl font-normal md:font-semibold mt-1 sm:mt-2">
                Helping you see clearly, every step of the way.
              </p>
              {/* Adjusted button sizes and gap */}
              <div className="flex flex-col xs:flex-row md:flex-row gap-2 sm:gap-3 md:gap-2 lg:gap-4 mt-3 sm:mt-4">
                <LinkButton
                  title="Contact Lenses"
                  href="/pages/contact-lenses"
                  sectionId="contact-lenses-btn"
                  textStyles="text-xs xs:text-sm md:text-sm lg:text-lg" // xs for very small text adjustment
                  containerStyles="w-full md:w-fit xs:w-auto bg-white text-black px-4 py-2 sm:px-5 md:px-3 lg:px-8 rounded-full font-medium inline-flex items-center justify-center tracking-tight hover:font-bold hover:scale-105 transition-all duration-[350ms]"
                />

                <LinkButton
                  title="Glasses"
                  href="/pages/eyewear"
                  sectionId="glasses-btn"
                  textStyles="text-xs xs:text-sm md:text-sm lg:text-lg"
                  containerStyles="w-full md:w-fit xs:w-auto bg-white text-black px-4 py-2 sm:px-6 md:px-3 lg:px-8 rounded-full font-medium inline-flex items-center justify-center tracking-tight hover:font-bold hover:scale-105 transition-all duration-[350ms]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Committed to Care */}
          <div
            className="relative w-full h-[400px] sm:h-[450px] md:w-1/2 md:h-[500px] lg:h-[600px] rounded-3xl bg-cover bg-center hover:md:h-[525px] hover:lg:h-[650px] transition-all duration-[350ms]"
            // Removed mt-12 for stacked layout, gap-8 in parent handles spacing
            style={{
              backgroundImage: `url('${cureBlindnessImage2.src}')`,
              // Adjusted backgroundPosition
              backgroundPosition:
                "center left -80px sm:center left -100px md:bottom 20px left -135px",
            }}
          >
            <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute inset-0 rounded-3xl" />
            <div className="absolute flex flex-col max-w-full bottom-6 sm:bottom-8 md:bottom-12 lg:bottom-16 left-4 right-4 sm:left-5 sm:right-5 p-4 rounded-3xl">
              {/* Adjusted text sizes */}
              <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-[40px] text-white font-extrabold tracking-tight">
                Committed to Care
              </h2>
              <p className="text-white text-base sm:text-lg md:text-lg lg:text-2xl tracking-tight leading-normal md:font-semibold mt-1 sm:mt-2">
                Over 35 Million people are blind and have no access to eye care.
                Let&apos;s fix that.
              </p>
              {/* Adjusted button size and gap */}
              <div className="flex gap-4 mt-3 sm:mt-4">
                <LinkButton
                  title="Learn More"
                  sectionId="learn-more-btn"
                  textStyles="text-sm md:text-sm lg:text-lg" // Base text-sm
                  containerStyles="bg-white text-black px-5 py-2 sm:px-6 md:px-3 lg:px-8 rounded-full font-medium inline-flex items-center justify-center tracking-tight hover:font-bold hover:scale-105 transition-all duration-[350ms]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
