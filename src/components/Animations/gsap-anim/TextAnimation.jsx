"use client";

import React, { useRef } from "react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText"; // GSAP plugin til at opdele tekst i linjer
import { ScrollTrigger } from "gsap/ScrollTrigger"; // Plugin til scroll-baseret animation
import { useGSAP } from "@gsap/react"; // Hook til at integrere GSAP i React

gsap.registerPlugin(SplitText, ScrollTrigger); // Registrér plugins

export default function Copy({ children, animateOnScroll = true, delay = 0, startAtTenPercent = false, startAtZero = false }) {
  const containerRef = useRef(null); // Ref til container-element
  const elementRefs = useRef([]); // Gemmer refs til elementer der skal splittes
  const splitRefs = useRef([]); // Gemmer SplitText-instanser
  const lines = useRef([]); // Samler alle linjer fra SplitText

  // Animation og opsætning via GSAP
  useGSAP(
    () => {
      if (!containerRef.current) return; // Stop, hvis ref ikke er sat

      // Nulstil refs
      splitRefs.current = [];
      lines.current = [];
      elementRefs.current = [];

      let elements = [];

      // Hvis container har data-attribute, split alle children – ellers bare sig selv
      if (containerRef.current.hasAttribute("data-copy-wrapper")) {
        elements = Array.from(containerRef.current.children);
      } else {
        elements = [containerRef.current];
      }

      // Split hvert element til linjer og gem resultatet
      elements.forEach((element) => {
        elementRefs.current.push(element);

        const split = SplitText.create(element, {
          type: "lines", // Split efter linjer
          mask: "lines", // Brug masker på linjer
          linesClass: "line++", // Klasse til linjerne
          lineThreshold: 0.1, // Følsomhed for line breaks
        });

        splitRefs.current.push(split);

        // Bevar evt. indryk (text-indent) i første linje
        const computedStyle = window.getComputedStyle(element);
        const textIndent = computedStyle.textIndent;

        if (textIndent && textIndent !== "0px") {
          if (split.lines.length > 0) {
            split.lines[0].style.paddingLeft = textIndent;
          }
          element.style.textIndent = "0"; // Fjern oprindelig indryk
        }

        lines.current.push(...split.lines); // Tilføj linjerne til fælles array
      });

      // Sæt startposition for linjerne (skjult nedefra)
      gsap.set(lines.current, { y: "100%" });

      // Opsæt animationen
      const animationProps = {
        y: "0%", // Animer op til normal placering
        duration: 1, // Varighed for hver linje
        stagger: 0.1, // Forsinkelse mellem linjer
        ease: "power4.out", // Blød easing
        delay: delay, // Delay fra props
      };

      if (animateOnScroll) {
        // Scroll-baseret animation med ScrollTrigger
        gsap.to(lines.current, {
          ...animationProps,
          scrollTrigger: {
            trigger: containerRef.current,
            start: startAtTenPercent ? "top 95%" : "top 75%", // Scroll-trigger-position
            once: true, // Kun én gang
          },
        });
      } else {
        // Afspil animation med det samme
        gsap.to(lines.current, animationProps);
      }

      // Oprydning: gendan original tekststruktur ved unmount
      return () => {
        splitRefs.current.forEach((split) => {
          if (split) {
            split.revert();
          }
        });
      };
    },
    {
      scope: containerRef, // Begræns DOM-scope
      dependencies: [animateOnScroll, delay, startAtTenPercent], // Kør effekt igen, hvis disse ændres
    }
  );

  // Hvis ét barn: klon det og tilføj ref direkte
  if (React.Children.count(children) === 1) {
    return React.cloneElement(children, { ref: containerRef });
  }

  // Hvis flere børn: wrap i div og marker som wrapper
  return (
    <div ref={containerRef} data-copy-wrapper="true">
      {children}
    </div>
  );
}
