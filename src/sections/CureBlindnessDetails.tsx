import eyeIcon from "@/assets/eyeIcon.png";
import hospitalIcon from "@/assets/hospitalIcon.png";
import groupIcon from "@/assets/groupIcon.png";
import femaleDoctorIcon from "@/assets/femaleDoctor.png";
import Image from "next/image";
import LinkButton from "@/components/LinkButton";

export const CureBlindnessDetails = () => {
  return (
    <section className="bg-[#E5DBD9]/50 mt-20">
      <div className="container">
        <div className="flex flex-row justify-between items-center md:gap-12 lg:gap-28">
          <div className="flex flex-col gap-4 md:max-w-md lg:max-w-lg">
            <h2 className="md:text-2xl lg:text-4xl font-bold tracking-tighter">
              Meet CureBlindness.org
            </h2>
            <div className="flex flex-col md:gap-5 lg:gap-8">
              <p className="md:text-sm lg:text-lg font-semibold tracking-tight leading-tight">
                For 30 years, we&apos;ve worked to overcome the mountain of
                global blindness. We pause to see how far we&apos;ve come, and
                we&apos;re invigorated to see the possibilities ahead.
              </p>
              <p className="md:text-sm lg:text-lg font-semibold tracking-tight leading-tight">
                Together with our supporters and partners, we are striving for a
                summit where sight is in reach.
              </p>
              <LinkButton
                title="Learn More About CureBlindness.org"
                sectionId="learn-more-btn"
                textStyles="md:text-sm lg:text-lg"
                containerStyles="bg-black text-white px-4 py-2 lg:px-8 lg:py-2 rounded-lg font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-105 transition-all duration-[350ms] w-max"
              />
            </div>
          </div>
          <div className="flex flex-row md:gap-5 lg:gap-10">
            <div className="flex flex-col items-center">
              <div className="bg-white md:px-7 md:py-7 lg:px-12 lg:py-10 rounded-lg flex flex-col items-center gap-2 hover:scale-105 transition-all duration-[350ms]">
                <Image
                  src={eyeIcon}
                  alt="eye icon"
                  className="md:w-[40px] lg:w-[60px]"
                />
                <h3 className="font-black md:text-2xl lg:text-5xl md:mt-1 lg:mt-2">
                  1.6m
                </h3>
                <p className="md:text-sm lg:text-lg font-semibold tracking-tight -mt-2">
                  Surgeries Performed
                </p>
              </div>
              <div className="bg-white md:px-7 md:py-10 lg:px-12 lg:py-10 md:mt-5 lg:mt-10 rounded-lg flex flex-col items-center gap-2 md:w-[190px] lg:w-[250px] hover:scale-105 transition-all duration-[350ms]">
                <Image
                  src={hospitalIcon}
                  alt="Hospital icon"
                  className="md:w-[70px] lg:w-[110px] -mt-6"
                />
                <h3 className="font-black md:text-2xl lg:text-5xl -mt-2">5</h3>
                <p className="md:text-sm lg:text-lg font-semibold tracking-tight -mt-2">
                  Hospitals
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white md:px-7 md:py-7 lg:px-12 lg:py-10 mt-20 rounded-lg flex flex-col items-center gap-2 text-center hover:scale-105 transition-all duration-[350ms]">
                <Image
                  src={groupIcon}
                  alt="Group icon"
                  className="md:w-[40px] lg:w-[60px]"
                />
                <h3 className="font-black md:text-2xl lg:text-5xl mt-2">
                  16.5m
                </h3>
                <p className="md:text-sm lg:text-lg font-semibold tracking-tight -mt-2">
                  Screenings & Basic Treatment
                </p>
              </div>
              <div className="bg-white md:px-7 md:py-7 lg:px-12 lg:py-10 md:mt-5 lg:mt-10 rounded-lg flex flex-col items-center gap-2 md:w-[190px] lg:w-[250px] hover:scale-105 transition-all duration-[350ms]">
                <Image
                  src={femaleDoctorIcon}
                  alt="Doctor icon"
                  className="md:w-[50px] lg:w-[70px]"
                />
                <h3 className="font-black md:text-2xl lg:text-5xl mt-2">
                  20.1k
                </h3>
                <p className="md:text-sm lg:text-lg font-semibold tracking-tight -mt-2">
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
