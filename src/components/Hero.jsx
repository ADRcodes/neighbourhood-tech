import React from "react";

export default function Hero() {
  return (
    <section
      className="
        relative isolate min-h-[80dvh] w-full overflow-clip
        grid place-items-center
      "
      aria-label="Landing hero"
    >
      {/* Background image */}
      <div
        className="
        max-h-[80vh]  
        absolute inset-0 -z-20 bg-cover bg-center
          [background-position:60%_50%]  /* nudge subject a bit right */
        "
        style={{
          backgroundImage:
            'url("https://i.natgeofe.com/n/073ddafb-0678-4e28-8718-15f1c6e40d8d/quidividivillageMichaelWinsor.jpg")',
        }}
      />

      {/* Primary radial overlay: left half -> fades to transparent on the right */}
      <div
        className="
        max-h-[80vh]  
        absolute inset-0 -z-10
          bg-[radial-gradient(120%_300%_at_0%_80%,_var(--color-primary)_30%,_color-mix(in_oklch,_var(--color-primary),_transparent_5%)_40%,_transparent_50%)]
          backdrop-blur-[2px]
          md:backdrop-blur-[1px]
          pointer-events-none
        "
      />

      {/* Content (left side) */}
      <div
        className="
          mx-auto max-w-6xl relative z-10 w-full
          grid grid-cols-1
        "
      >
        <div
          className="
            mx-auto w-full
            px-[var(--mobile-padding)] md:px-[var(--desktop-padding)]
            flex items-center
          "
        >
          <div className="max-w-2xl pr-6 md:pr-10 lg:pr-16">
            {/* lock text to on-primary, since it sits over the primary gradient */}
            <h1 className="
                text-[var(--color-onprimary)]
                text-4xl md:text-5xl lg:text-6xl
                font-semibold leading-tight tracking-tight
              ">
              Find your people
            </h1>

            <p className="
                mt-3 md:mt-4
                text-[var(--color-onprimary)]
                text-base md:text-lg
                opacity-90
              ">
              Discover local events and activities that match your interests.
              Connect with like-minded individuals in your community and make new friends.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#get-started"
                className="
                  inline-flex items-center justify-center
                  rounded-lg px-5 py-3
                  bg-primary hover:bg-primary-hover active:bg-primary-pressed
                  text-[var(--color-onprimary)]
                  transition-colors
                "
              >
                Get started
              </a>
              <a
                href="#explore"
                className="
                  inline-flex items-center justify-center
                  rounded-lg px-5 py-3
                  bg-brand-complement/90 hover:bg-brand-complement
                  text-[var(--color-oncomplement)]
                  transition-colors
                "
              >
                Explore nearby
              </a>
              <a
                href="#learn-more"
                className="
                  inline-flex items-center justify-center
                  rounded-lg px-5 py-3
                  bg-transparent
                  underline decoration-2 underline-offset-4
                  text-accent hover:opacity-90
                "
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Safety scrim at extreme right for small screens where text could drift */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/10 to-transparent md:hidden" />
    </section>
  );
}
