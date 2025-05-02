import LinkButton from "@/components/LinkButton";
import { PlusIcon } from "lucide-react";

export const FAQ = () => {
  return (
    <section className="bg-[#F8F2F2] mt-16">
      <div className="container py-16">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center max-w-[1100px] mx-auto">
          <div className="flex flex-col gap-5 md:min-w-[250px] lg:max-w-lg">
            <h2 className="font-black text-2xl md:text-3xl lg:text-5xl tracking-tighter">
              Frequently Asked Questions
            </h2>
            <p className="text-sm md:text-sm lg:text-lg font-medium">
              Have any questions or doubts about choosing the right pair of
              glasses or contact lenses? Search for an appropriate answer!
            </p>
            <LinkButton
              title="All FAQs"
              sectionId="faq-btn"
              textStyles="md:text-sm lg:text-lg"
              containerStyles="hidden md:block bg-black text-white px-4 py-2 lg:px-8 lg:py-2 w-fit rounded-lg font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
            />
          </div>
          <div className="flex flex-col gap-3 md:gap-3 lg:gap-5">
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center bg-white md:w-[400px] lg:w-[600px] p-4 rounded-lg">
                <p className="font-medium md:text-lg lg:text-xl">
                  Do you offer free shipping?
                </p>
                <PlusIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center bg-white md:w-[400px] lg:w-[600px] p-4 rounded-lg">
                <p className="font-medium md:text-lg lg:text-xl">
                  Do you accept vision insurance?
                </p>
                <PlusIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center bg-white md:w-[400px] lg:w-[600px] p-4 rounded-lg">
                <p className="font-medium md:text-lg lg:text-xl">
                  Do I need prescription to order contacts?
                </p>
                <PlusIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center bg-white md:w-[400px] lg:w-[600px] p-4 rounded-lg">
                <p className="font-medium md:text-lg lg:text-xl">
                  Do you accept FSA or HSA cards?
                </p>
                <PlusIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center bg-white md:w-[400px] lg:w-[600px] p-4 rounded-lg">
                <p className="font-medium md:text-lg lg:text-xl">
                  Do you I earn loyalty points?
                </p>
                <PlusIcon className="w-6 h-6" />
              </div>
            </div>
            <LinkButton
              title="All FAQs"
              sectionId="faq-btn"
              textStyles="md:text-sm lg:text-lg"
              containerStyles="flex md:hidden bg-black text-white mt-6 px-4 py-2 lg:px-8 lg:py-2 w-full rounded-lg font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-105 transition-all duration-[350ms]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
