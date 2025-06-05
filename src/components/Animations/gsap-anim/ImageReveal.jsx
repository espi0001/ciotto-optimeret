"use client"; // Gør komponenten til en client component i Next.js

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger); // Registrér ScrollTrigger plugin til GSAP

export default function ImageReveal({
  animateOnScroll = true, // Om animationen kun skal aktiveres ved scroll
  delay = 0, // Delay før animation starter
  duration = 1.2, // Bruges ikke direkte her, men kan bruges til animationstid
  maskColor = "#e7ded0ff",
  className = "",
  style = {},
  children,
  ...props
}) {
  const containerRef = useRef(null); // Ref til wrapper-elementet
  const maskRef = useRef(null); // Ref til masken, der skjuler billedet

  // GSAP-animation setup
  useGSAP(
    () => {
      if (!containerRef.current || !maskRef.current) return; // Stop, hvis refs ikke er klar

      // Sæt initial scaleX på masken, så den dækker billedet
      gsap.set(maskRef.current, {
        scaleX: 1,
        transformOrigin: "right",
      });

      const animationProps = {
        scaleX: 0, // Animer masken væk fra højre mod venstre
        duration: 2.5,
        ease: "power4.inOut", // Blød easing
        delay, // Delay fra props
      };

      if (animateOnScroll) {
        // Kør animationen ved scroll, når elementet er i viewport
        gsap.to(maskRef.current, {
          ...animationProps,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%", // Start animation når elementets top er 80% nede i viewport
            once: true, // Kun én gang
          },
        });
      } else {
        // Kør animation med det samme, hvis ikke scroll-betinget
        gsap.to(maskRef.current, animationProps);
      }
    },
    {
      scope: containerRef, // Begrenser selector-scope til containeren
      dependencies: [animateOnScroll, delay, duration, maskColor], // Kører effekt igen, hvis disse ændres
    }
  );

  return (
    <div
      ref={containerRef}
      className={`image-reveal-container ${className}`}
      style={{
        position: "relative",
        overflow: "hidden", // Skjuler den animerede maske uden for container
        display: "inline-block",
        // width: "100%",
        width: "auto",
        height: "100%",
        ...style, // Tillad override med prop-style
      }}
      {...props}
    >
      {children}
      <div
        ref={maskRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: maskColor,
          zIndex: 2,
          pointerEvents: "none",
          willChange: "transform", // Hint til browser om animation
        }}
      />
    </div>
  );
}
