// Game session state: screen flow, the note loop, judging and keyboard input.
import { I as React } from "../../runtime.js";
import { pattern, recordResult } from "../../progress.js";
import { COUNTDOWN_SECONDS, HIT_LINE, KEY_TO_LANE } from "../constants.js";
import {
  advanceNotes,
  applyHit,
  applyMiss,
  beatInterval,
  closestNote,
  createBurst,
  fallVelocity,
  isGameOver,
  judge,
  newPlayers,
  spawnNotes,
  stepParticles,
  teamOfLane,
} from "../game/rules.js";

const newClock = () => ({ lastFrame: null, elapsedMs: 0, sinceBeat: 0, beatIndex: 0, now: 0 });

export function useGame({ progress, setProgress, settings, sfx }) {
  const [screen, setScreen] = React.useState("menu");
  const [mode, setMode] = React.useState("1P");
  const [levelIndex, setLevelIndex] = React.useState(0);
  const [practice, setPractice] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const [paused, setPaused] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [players, setPlayers] = React.useState(newPlayers);
  const [timeLeft, setTimeLeft] = React.useState(30);
  const [notes, setNotes] = React.useState([]);
  const [particles, setParticles] = React.useState([]);
  const [feedback, setFeedback] = React.useState(null);
  const [pressedLane, setPressedLane] = React.useState(null);
  const [shaking, setShaking] = React.useState(false);
  // Note ids already scored or penalised, so each note is judged exactly once.
  const judged = React.useRef(new Set());
  const clock = React.useRef(newClock());
  const nextParticleId = React.useRef(0);

  const level = progress[levelIndex];
  const isDemon = !!level?.isDemon;
  const { reduceMotion } = settings;
  const running = screen === "playing" && !paused && !countdown;
  const ranked = !practice && speed === 1 && mode === "1P";
  const hasNextLevel = levelIndex < progress.length - 1 && !progress[levelIndex + 1].locked;

  const playJudgement = React.useCallback(
    (frequency, quality) => {
      if (settings.sound) sfx.judgement(frequency, quality);
    },
    [settings.sound, sfx],
  );

  const playBeat = React.useCallback(() => {
    if (settings.music) sfx.beat(isDemon);
  }, [settings.music, sfx, isDemon]);

  const shake = React.useCallback(
    (duration) => {
      if (reduceMotion) return;
      setShaking(true);
      setTimeout(() => setShaking(false), duration);
    },
    [reduceMotion],
  );

  const registerMiss = React.useCallback(
    (team) => setPlayers((current) => ({ ...current, [team]: applyMiss(current[team], practice) })),
    [practice],
  );

  const missNotes = React.useCallback(
    (missed) => {
      for (const note of missed) {
        if (judged.current.has(note.id)) continue;
        judged.current.add(note.id);
        registerMiss(teamOfLane(note.lane, mode));
      }
      setFeedback({ lane: missed[0].lane, quality: "miss", id: Date.now() });
      if (isDemon) shake(220);
    },
    [mode, isDemon, registerMiss, shake],
  );

  function resetRun(index) {
    sfx.unlock();
    judged.current.clear();
    clock.current = newClock();
    setPaused(false);
    setCountdown(COUNTDOWN_SECONDS);
    setPlayers(newPlayers());
    setTimeLeft(progress[index]?.duration ?? 30);
    setNotes([]);
    setParticles([]);
    setFeedback(null);
    setShaking(false);
  }

  function start(index) {
    setLevelIndex(index);
    resetRun(index);
    setScreen("playing");
  }

  const resume = React.useCallback(() => {
    setPaused(false);
    setCountdown(COUNTDOWN_SECONDS);
  }, []);

  const togglePause = React.useCallback(() => {
    if (paused) resume();
    else setPaused(true);
  }, [paused, resume]);

  React.useEffect(() => {
    if (!countdown) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Leaving the tab or window pauses the run.
  React.useEffect(() => {
    if (screen !== "playing") return;
    const onBlur = () => setPaused(true);
    const onVisibilityChange = () => {
      if (document.hidden) setPaused(true);
    };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [screen]);

  // Frame loop: spawns notes on the beat, moves them and counts down the clock.
  React.useEffect(() => {
    if (!running) {
      clock.current.lastFrame = null;
      return;
    }
    const beatMs = beatInterval(level, speed);
    const velocity = fallVelocity(level, speed);
    let lastBeatSound = 0;
    let frameId = 0;

    const step = (now) => {
      const c = clock.current;
      if (c.lastFrame === null) c.lastFrame = now;
      const elapsed = now - c.lastFrame;
      c.lastFrame = now;
      c.now = now;
      c.elapsedMs += elapsed;
      setTimeLeft(Math.max(0, Math.ceil(level.duration - c.elapsedMs / 1000)));
      c.sinceBeat += elapsed;

      if (c.sinceBeat >= beatMs) {
        c.sinceBeat -= beatMs;
        const lanes = pattern(level.id, c.beatIndex, mode === "2P");
        c.beatIndex += 1;
        const spawned = spawnNotes(lanes, c.beatIndex);
        setNotes((current) => [...current, ...spawned]);
        if (now - lastBeatSound > 80) {
          playBeat();
          lastBeatSound = now;
        }
      }

      setNotes((current) => {
        const { active, missed } = advanceNotes(current, elapsed * velocity);
        if (missed.length) setTimeout(() => missNotes(missed), 0);
        return active;
      });
      if (!reduceMotion) setParticles(stepParticles);
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [running, level, mode, speed, reduceMotion, playBeat, missNotes]);

  React.useEffect(() => {
    if (screen === "playing" && (timeLeft === 0 || isGameOver(mode, players))) setScreen("result");
  }, [screen, timeLeft, mode, players]);

  React.useEffect(() => {
    if (screen === "result" && ranked) setProgress((current) => recordResult(current, levelIndex, players.p1.score));
  }, [screen, ranked, levelIndex, players.p1.score]);

  const hit = React.useCallback(
    (lane) => {
      if (!running) return;
      const team = teamOfLane(lane, mode);
      if (players[team].lives <= 0) return;
      setPressedLane(lane);
      setTimeout(() => setPressedLane((current) => (current === lane ? null : current)), 120);

      const target = closestNote(notes.filter((n) => n.lane === lane && !n.hit && !judged.current.has(n.id)));
      if (!target) {
        const opponentNoteNearLine = notes.some(
          (n) => !n.hit && teamOfLane(n.lane, mode) !== team && Math.abs(n.y - HIT_LINE) < 12,
        );
        if (mode === "2P" && opponentNoteNearLine) {
          setFeedback({ lane, quality: "notYours", id: Date.now() });
          playJudgement(180, "notYours");
          shake(180);
          return;
        }
        setFeedback({ lane, quality: null, id: Date.now() });
        playJudgement(220 + lane * 60, null);
        return;
      }

      const quality = judge(Math.abs(target.y - HIT_LINE));
      judged.current.add(target.id);
      if (quality === "miss") {
        setNotes((current) => current.filter((n) => n.id !== target.id));
        registerMiss(team);
        playJudgement(180, "miss");
        setFeedback({ lane, quality, id: Date.now() });
        if (isDemon) shake(250);
        return;
      }

      setNotes((current) => current.map((n) => (n.id === target.id ? { ...n, hit: true } : n)));
      setPlayers((current) => ({ ...current, [team]: applyHit(current[team], quality) }));
      playJudgement(320 + lane * 80, quality);
      setFeedback({ lane, quality, id: Date.now() });
      if (quality === "perfect" && !reduceMotion) {
        const burst = createBurst(lane, nextParticleId.current);
        nextParticleId.current += burst.length;
        setParticles((current) => [...current, ...burst]);
      }
    },
    [running, notes, mode, players, isDemon, reduceMotion, registerMiss, shake, playJudgement],
  );

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.repeat || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return;
      if (event.code === "Space" && screen === "playing") {
        event.preventDefault();
        togglePause();
        return;
      }
      const lane = KEY_TO_LANE[event.key.toLowerCase()];
      if (lane !== undefined) {
        event.preventDefault();
        hit(lane);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hit, screen, togglePause]);

  return {
    screen,
    mode,
    level,
    levels: progress,
    isDemon,
    practice,
    speed,
    ranked,
    paused,
    countdown,
    players,
    timeLeft,
    notes,
    particles,
    feedback,
    pressedLane,
    shaking,
    frameTime: clock.current.now,
    hasNextLevel,
    setMode,
    setPractice,
    setSpeed,
    hit,
    resume,
    pause: () => setPaused(true),
    openMenu: () => setScreen("menu"),
    openLevelSelect: () => setScreen("levelSelect"),
    selectLevel: (index) => {
      if (!progress[index].locked || practice) start(index);
    },
    restart: () => start(levelIndex),
    nextLevel: () => (hasNextLevel ? start(levelIndex + 1) : setScreen("levelSelect")),
    quit: () => {
      setPaused(false);
      setCountdown(0);
      setScreen("levelSelect");
    },
  };
}
