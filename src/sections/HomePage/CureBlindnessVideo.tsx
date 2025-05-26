export const CureBlindnessVideo = () => {
  return (
    // Adjusted top margin for different screen sizes
    <section className="mt-12 sm:mt-16 md:mt-20">
      <div className="container">
        <div>
          {/* The iframe itself is usually responsive by width. 
              Height is adjusted here for different breakpoints.
              Aspect ratio can be maintained using padding-bottom trick on a wrapper if needed,
              but for a simple iframe, direct height adjustment is often sufficient. */}
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Example video, replace with actual
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-[240px] xs:h-[280px] sm:h-[375px] md:h-[500px] rounded-xl shadow-lg" // Responsive height and added shadow
          ></iframe>
        </div>
      </div>
    </section>
  );
};
