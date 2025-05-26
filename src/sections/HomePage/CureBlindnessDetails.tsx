import eyeIcon from "@/assets/eyeIcon.png";
import hospitalIcon from "@/assets/hospitalIcon.png";
import groupIcon from "@/assets/groupIcon.png";
import femaleDoctorIcon from "@/assets/femaleDoctor.png";
import Image from "next/image";
import LinkButton from "@/components/LinkButton";

export const CureBlindnessDetails = () => {
  return (
    // Adjusted top margin for different screen sizes
    <section className="bg-[#E5DBD9]/50 mt-12 sm:mt-16 md:mt-20">
      {/* Adjusted vertical padding for the section */}
      <div className="container py-10 sm:py-12 md:py-16">
        {/* Layout stacks on small, row on medium and up */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12 lg:gap-16 xl:gap-28">
          {/* Text content section */}
          <div className="flex flex-col gap-4 md:max-w-md lg:max-w-lg text-center md:text-left">
            {/* Adjusted text sizes */}
            <h2 className="text-2xl sm:text-3xl md:text-2xl lg:text-4xl font-bold tracking-tighter">
              Meet CureBlindness.org
            </h2>
            <div className="flex flex-col gap-4 sm:gap-5 md:gap-5 lg:gap-8">
              <p className="text-base sm:text-lg md:text-sm lg:text-lg font-semibold tracking-tight leading-snug md:leading-tight">
                For 30 years, we&apos;ve worked to overcome the mountain of
                global blindness. We pause to see how far we&apos;ve come, and
                we&apos;re invigorated to see the possibilities ahead.
              </p>
              <p className="text-base sm:text-lg md:text-sm lg:text-lg font-semibold tracking-tight leading-snug md:leading-tight">
                Together with our supporters and partners, we are striving for a
                summit where sight is in reach.
              </p>
              <div className="flex justify-center md:justify-start">
                <LinkButton
                  title="Learn More About CureBlindness.org"
                  sectionId="learn-more-btn"
                  // Adjusted text and padding for buttons
                  textStyles="text-sm sm:text-base md:text-sm lg:text-lg"
                  containerStyles="bg-black text-white px-5 py-2.5 sm:px-6 md:px-4 lg:px-8 rounded-lg font-medium inline-flex items-center justify-center tracking-normal md:tracking-tight hover:font-bold hover:scale-105 transition-all duration-[350ms] w-auto"
                />
              </div>
            </div>
          </div>

          {/* Stats cards section - visible on medium and up */}
          <div className="hidden md:flex md:flex-row gap-4 sm:gap-5 md:gap-5 lg:gap-10 mt-8 md:mt-0">
            {/* Column 1 of stats */}
            <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-5 lg:gap-10">
              <div className="bg-white p-4 sm:p-5 md:px-7 md:py-7 lg:px-12 lg:py-10 rounded-lg flex flex-col items-center gap-1 sm:gap-2 text-center hover:scale-105 transition-all duration-[350ms]">
                <Image
                  src={eyeIcon}
                  alt="eye icon"
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-[40px] lg:w-[60px]" // Responsive icon size
                />
                <h3 className="font-black text-xl sm:text-2xl md:text-2xl lg:text-5xl mt-1 sm:mt-1 md:mt-1 lg:mt-2">
                  1.6m
                </h3>
                <p className="text-xs sm:text-sm md:text-sm lg:text-lg font-semibold tracking-tight -mt-1 sm:-mt-1 md:-mt-2">
                  Surgeries Performed
                </p>
              </div>
              <div className="bg-white p-4 sm:p-5 md:px-7 md:py-10 lg:px-12 lg:py-10 rounded-lg flex flex-col items-center gap-1 sm:gap-2 text-center md:w-auto lg:w-[250px] hover:scale-105 transition-all duration-[350ms]">
                <Image
                  src={hospitalIcon}
                  alt="Hospital icon"
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-[70px] lg:w-[110px] -mt-2 sm:-mt-4 md:-mt-6" // Responsive icon size
                />
                <h3 className="font-black text-xl sm:text-2xl md:text-2xl lg:text-5xl -mt-1 sm:-mt-1 md:-mt-2">
                  5
                </h3>
                <p className="text-xs sm:text-sm md:text-sm lg:text-lg font-semibold tracking-tight -mt-1 sm:-mt-1 md:-mt-2">
                  Hospitals
                </p>
              </div>
            </div>
            {/* Column 2 of stats */}
            <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-5 lg:gap-10 md:mt-[60px] lg:mt-20">
              {" "}
              {/* Adjusted top margin for staggered effect */}
              <div className="bg-white p-4 sm:p-5 md:px-7 md:py-7 lg:px-12 lg:py-10 rounded-lg flex flex-col items-center gap-1 sm:gap-2 text-center hover:scale-105 transition-all duration-[350ms]">
                <Image
                  src={groupIcon}
                  alt="Group icon"
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-[40px] lg:w-[60px]" // Responsive icon size
                />
                <h3 className="font-black text-xl sm:text-2xl md:text-2xl lg:text-5xl mt-1 sm:mt-1 md:mt-1 lg:mt-2">
                  16.5m
                </h3>
                <p className="text-xs sm:text-sm md:text-sm lg:text-lg font-semibold tracking-tight -mt-1 sm:-mt-1 md:-mt-2">
                  Screenings & Basic Treatment
                </p>
              </div>
              <div className="bg-white p-4 sm:p-5 md:px-7 md:py-7 lg:px-12 lg:py-10 rounded-lg flex flex-col items-center gap-1 sm:gap-2 text-center md:w-auto lg:w-[250px] hover:scale-105 transition-all duration-[350ms]">
                <Image
                  src={femaleDoctorIcon}
                  alt="Doctor icon"
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-[50px] lg:w-[70px]" // Responsive icon size
                />
                <h3 className="font-black text-xl sm:text-2xl md:text-2xl lg:text-5xl mt-1 sm:mt-1 md:mt-1 lg:mt-2">
                  20.1k
                </h3>
                <p className="text-xs sm:text-sm md:text-sm lg:text-lg font-semibold tracking-tight -mt-1 sm:-mt-1 md:-mt-2">
                  Trainings Performed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
