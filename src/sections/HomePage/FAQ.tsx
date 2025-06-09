import FAQItem from "@/components/Products/ProductDetails/FAQItem";
import LinkButton from "@/components/LinkButton";

export const FAQ = () => {
  return (
    // Adjusted top margin and vertical padding for the section
    <section className="bg-[#F8F2F2] mt-12 sm:mt-16 md:mt-16 py-10 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Layout stacks on small, row on medium and up */}
        <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-10">
          {/* Left Column: Text content */}
          <div className="w-full md:w-[40%] flex flex-col gap-4 sm:gap-5 text-center md:text-left">
            {/* Responsive heading text sizes */}
            <h2 className="font-black text-2xl sm:text-3xl md:text-3xl lg:text-5xl tracking-tighter">
              Frequently Asked Questions
            </h2>
            {/* Responsive paragraph text sizes */}
            <p className="text-sm sm:text-base lg:text-lg font-medium">
              Have any questions or doubts about choosing the right pair of
              glasses or contact lenses? Search for an appropriate answer!
            </p>
          </div>

          {/* Right Column: FAQ Items */}
          <div className="w-full md:w-[60%] space-y-4 sm:space-y-5 md:space-y-6 mt-6 md:mt-0">
            {/* FAQItem itself is already designed to be responsive with its internal title and content handling.
                We ensure the container for these items has appropriate spacing.
                The bgWhite prop and internal padding of FAQItem will handle individual item styling.
            */}
            <FAQItem
              title="Do you offer free shipping?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-500 text-sm sm:text-base">
                {" "}
                {/* Responsive text */}
                You bet we do! Standard shipping is 100% on us—because who
                doesn&apos;t love free delivery? If you&apos;re in a hurry to
                get your new look, we also offer expedited shipping at checkout
                (but that one&apos;s on you).
              </p>
            </FAQItem>

            {/* <FAQItem
              title="Do you accept vision insurance?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-500 text-sm sm:text-base">
                {" "}
                Yes, we do! We work with most major vision insurance providers
                across the U.S. You can either use your benefits directly at
                checkout (if eligible) or submit your receipt for reimbursement.
                Either way, we&apos;ve got your eyes (and your wallet) covered.
              </p>
            </FAQItem> */}

            <FAQItem
              title="Do I need a prescription to order contacts?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-500 text-sm sm:text-base">
                {" "}
                {/* Responsive text */}
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
              <p className="text-gray-500 text-sm sm:text-base">
                {" "}
                {/* Responsive text */}
                Yep, and we love flexible spending! You can use your FSA or HSA
                card at checkout to buy contacts, prescription glasses, or any
                eligible eye care products. Don’t let those pre-tax dollars go
                to waste!
              </p>
            </FAQItem>

            {/* <FAQItem
              title="Do I earn loyalty points?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-500 text-sm sm:text-base">
                {" "}
                Oh yes, and they add up fast! Every time you shop with us, you
                rack up loyalty points—because rewarding you for looking good
                just makes sense. The more you buy, the more perks you unlock.
                Discounts, freebies, and more? Yes, please!
              </p>
            </FAQItem> */}
          </div>
        </div>
      </div>
    </section>
  );
};
