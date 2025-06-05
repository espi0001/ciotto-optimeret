"use client";

import { motion } from "framer-motion"; // Importér motion API til animation
import { usePathname } from "next/navigation"; // Brug pathname til at re-rendere ved navigation
import { useRef, useEffect, useState } from "react";

export default function LineAnimated({ width = "100%", height = "1px", color = "var(--color-primary-text)", duration = 0.7, delay = 0.5, className = "", style = {} }) {
  const pathname = usePathname(); // Brug pathname til at animere ved route-skift
  const ref = useRef(null); // Ref til DOM-element
  const [inView, setInView] = useState(false); // Om elementet er i viewport

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let hasAnimated = false; // Sikrer at animation kun kører én gang

    // IntersectionObserver tjekker om linjen er synlig i viewport
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (!hasAnimated && entry.intersectionRatio >= 0.25) {
          setInView(true); // Start animation
          hasAnimated = true;
          observer.disconnect(); // Stop observer for performance
        }
      },
      { threshold: [0, 0.25, 1] } // Trigger når mindst 25% af elementet er synligt
    );
    observer.observe(node);
    return () => observer.disconnect(); // Cleanup ved unmount
  }, [pathname]); // Kør på nyt route-skift (trigger ny animation)

  return (
    <motion.div
      key={pathname} // Sørg for ny animation ved route-skift
      ref={ref}
      className={`pointer-events-none, px-section max-w-screen-2xl mx-auto section-spacing w-full border-t-1 ${className}`}
      initial={{ scaleX: 0 }} // Start med skjult linje (skaleret til 0)
      animate={inView ? { scaleX: 1 } : { scaleX: 0 }} // Animer til fuld længde hvis synlig
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1], // Easing (custom cubic-bezier)
      }}
      style={{
        width,
        height,
        backgroundColor: color,
        transformOrigin: "left",
        ...style,
      }}
    />
  );
}
