export const Headline = () => {
  return (
    <section>
      {/* On very small screens, items will stack. On sm and up, they'll be in a row. */}
      <div className="flex flex-col sm:flex-row items-center justify-center bg-[#215044]/20">
        {/* Adjusted padding and text size for smaller screens */}
        <div className="px-4 py-2 sm:px-5 md:px-8 lg:px-28 sm:py-2 lg:py-7 border-b-2 sm:border-b-0 sm:border-r-2 border-[#215044] text-center w-full sm:w-auto">
          <span className="text-[#215044] font-semibold text-[11px] xs:text-xs sm:text-xs md:text-sm lg:text-xl text-center">
            Free shipping
          </span>
        </div>
        <div className="px-4 py-2 sm:px-5 md:px-8 lg:px-28 sm:py-2 lg:py-7 border-b-2 sm:border-b-0 sm:border-r-2 border-[#215044] text-center w-full sm:w-auto">
          <span className="text-[#215044] font-semibold text-[11px] xs:text-xs sm:text-xs md:text-sm lg:text-xl">
            Free 30-day returns
          </span>
        </div>
        <div className="px-4 py-2 sm:px-5 md:px-8 lg:px-28 sm:py-2 lg:py-7 text-center w-full sm:w-auto">
          <span className="text-[#215044] font-semibold text-[11px] xs:text-xs sm:text-xs md:text-sm lg:text-xl">
            FSA/HSA Eligible
          </span>
        </div>
      </div>
    </section>
  );
};
