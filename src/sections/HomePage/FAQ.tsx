import FAQItem from "@/components/Products/ProductDetails/FAQItem";
import LinkButton from "@/components/LinkButton";

export const FAQ = () => {
  return (
    <section className="bg-[#F8F2F2] mt-16">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-start gap-10">
          {/* Left Column */}
          <div className="w-full md:w-[40%] flex flex-col gap-5">
            <h2 className="font-black text-2xl md:text-3xl lg:text-5xl tracking-tighter">
              Frequently Asked Questions
            </h2>
            <p className="text-sm md:text-base lg:text-lg font-medium">
              Have any questions or doubts about choosing the right pair of
              glasses or contact lenses? Search for an appropriate answer!
            </p>
            <LinkButton
              title="All FAQs"
              sectionId="faq-btn"
              textStyles="md:text-sm lg:text-lg"
              containerStyles="hidden md:block bg-black text-white px-4 py-2 lg:px-8 lg:py-2 w-fit rounded-lg font-medium inline-flex items-center justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-300"
            />
          </div>

          {/* Right Column */}
          <div className="w-full md:w-[60%] space-y-6">
            <FAQItem
              title="Do you offer free shipping?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-500">
                You bet we do! Standard shipping is 100% on us—because who
                doesn’t love free delivery? If you’re in a hurry to get your new
                look, we also offer expedited shipping at checkout (but that
                one's on you).
              </p>
            </FAQItem>

            <FAQItem
              title="Do you accept vision insurance?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-500">
                Yes, we do! We work with most major vision insurance providers
                across the U.S. You can either use your benefits directly at
                checkout (if eligible) or submit your receipt for reimbursement.
                Either way, we’ve got your eyes (and your wallet) covered.
              </p>
            </FAQItem>

            <FAQItem
              title="Do I need a prescription to order contacts?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-500">
                Absolutely. A valid prescription isn’t just a legal
                requirement—it ensures you get the right lenses for your eyes.
                If you don’t have one handy, we can help guide you through how
                to get one. Your eyes deserve the best!
              </p>
            </FAQItem>

            <FAQItem
              title="Do you accept FSA or HSA cards?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-500">
                Yep, and we love flexible spending! You can use your FSA or HSA
                card at checkout to buy contacts, prescription glasses, or any
                eligible eye care products. Don’t let those pre-tax dollars go
                to waste!
              </p>
            </FAQItem>

            <FAQItem
              title="Do I earn loyalty points?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-500">
                Oh yes, and they add up fast! Every time you shop with us, you
                rack up loyalty points—because rewarding you for looking good
                just makes sense. The more you buy, the more perks you unlock.
                Discounts, freebies, and more? Yes, please!
              </p>
            </FAQItem>

            {/* Add more FAQItem components here as needed */}
          </div>
        </div>
      </div>
    </section>
  );
};
