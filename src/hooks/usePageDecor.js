// Page-level side effects that are purely decorative.
import { I as React } from "../../runtime.js";
import { FONT_URL } from "../constants.js";

export function useGoogleFonts() {
  React.useEffect(() => {
    const link = document.createElement("link");
    link.href = FONT_URL;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
}

// Index of the lane highlighted by the idle animation on the hero card.
export function useMenuBeat() {
  const [beat, setBeat] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setBeat((value) => (value + 1) % 4), 350);
    return () => clearInterval(timer);
  }, []);
  return beat;
}
