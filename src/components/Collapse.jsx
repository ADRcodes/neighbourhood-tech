import { useEffect, useRef, useState } from "react";

export default function Collapse({
  open,
  duration = 500,
  className = "",
  children,
  ariaId,
}) {
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;

    const measure = () => setMaxHeight(el.scrollHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div
      className={`overflow-hidden transition-[max-height] ease-out ${className}`}
      style={{ maxHeight: open ? maxHeight : 0, transitionDuration: `${duration}ms` }}
      aria-hidden={!open}
      id={ariaId}
    >
      <div
        ref={contentRef}
        className={`transition-all ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
        style={{ transitionDuration: `${duration}ms` }}
      >
        {children}
      </div>
    </div>
  );
}
