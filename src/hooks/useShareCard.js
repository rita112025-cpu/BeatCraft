// Result sharing: draws the story image and handles download, copy and native share.
import { I as React } from "../../runtime.js";
import { clipboardText, drawShareCard, nativeShareText } from "../game/shareCard.js";

const COPIED_MS = 2000;

function copyWithTextarea(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function useShareCard({ screen, mode, level, players, isDemon }) {
  const canvasRef = React.useRef(null);
  const [imageUrl, setImageUrl] = React.useState(null);
  const [copied, setCopied] = React.useState(false);
  const [canShare, setCanShare] = React.useState(false);

  React.useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const draw = React.useCallback(() => {
    if (!canvasRef.current) return;
    const url = drawShareCard(canvasRef.current, { mode, level, players, isDemon });
    if (url) setImageUrl(url);
  }, [mode, level, players, isDemon]);

  React.useEffect(() => {
    if (screen !== "result") {
      setImageUrl(null);
      return;
    }
    // Wait for the result screen to mount its canvas.
    const timer = setTimeout(draw, 120);
    return () => clearTimeout(timer);
  }, [screen, draw]);

  function download() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = `beatcraft-${level.name}-${Date.now()}.png`;
    link.click();
  }

  async function copyText() {
    const text = clipboardText(mode, level, players);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      copyWithTextarea(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_MS);
  }

  async function share() {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.share) return;
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.92));
      if (!blob) return;
      const data = {
        title: "BeatCraft 成績",
        text: nativeShareText(mode, level, players),
        files: [new File([blob], "beatcraft-score.png", { type: "image/png" })],
      };
      if (navigator.canShare && !navigator.canShare(data)) delete data.files;
      await navigator.share(data);
    } catch {}
  }

  return { canvasRef, imageUrl, copied, canShare, download, copyText, share };
}
