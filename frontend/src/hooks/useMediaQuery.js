import { useEffect, useState } from "react";

/**
 * Tiny responsive helper for the rare cases where a component
 * (usually a Recharts chart) needs to make a *layout* decision in
 * JS rather than CSS — e.g. moving a legend from the side to the
 * bottom on small screens.
 *
 * Usage:
 *   const isMobile = useMediaQuery("(max-width: 767px)");
 */
export default function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== "undefined" && "matchMedia" in window
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleChange = (event) => setMatches(event.matches);

    setMatches(mediaQueryList.matches);

    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
