import { useEffect, useState } from "react";
import { anyCssColorToHex } from "../../theme/color-utils";

export default function useHexFromElementRef(ref) {
  const [hex, setHex] = useState(null);

  useEffect(() => {
    if (!ref?.current) return;
    const el = ref.current;

    let raf;
    const read = () => {
      const css = getComputedStyle(el).backgroundColor; // could be oklch(...), rgb(...), etc.
      const h = anyCssColorToHex(css);
      if (h && h !== hex) setHex(h);
    };

    const kick = () => {
      let frames = 4;
      const tick = () => {
        read();
        if (frames-- > 0) raf = requestAnimationFrame(tick);
      };
      tick();
    };

    // initial & a few frames to allow cascade
    kick();

    // react to theme/token changes
    const mo = new MutationObserver(kick);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "data-theme"] });

    const onTheme = () => kick();
    window.addEventListener("theme:tokens-updated", onTheme);

    // also if the element resizes (rare but harmless)
    const ro = new ResizeObserver(kick);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("theme:tokens-updated", onTheme);
      mo.disconnect();
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return hex;
}
