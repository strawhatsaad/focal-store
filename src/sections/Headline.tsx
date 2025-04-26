export const Headline = () => {
  return (
    <section>
      <div className="flex items-center justify-center bg-[#215044]/20">
        <div className="lg:px-28 lg:py-7 border-r-2 border-[#215044] text-center">
          <span className="text-[#215044] font-semibold text-xl text-center">
            Free shipping
          </span>
        </div>
        <div className="lg:px-28 lg:py-7 border-r-2 border-[#215044] text-center">
          <span className="text-[#215044] font-semibold text-xl">
            Free 30-day returns
          </span>
        </div>
        <div className="lg:px-28 lg:py-7 text-center">
          <span className="text-[#215044] font-semibold text-xl">
            FSA/HSA Eligible
          </span>
        </div>
      </div>
    </section>
  );
};
