import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { CodeEditor, CodeLine, TerminalLine } from "./components/CodeEditor";

// ─── All lines of code in one session ──────────────────────
// speed: 4 frames/char (~7.5 chars/sec, natural human pace)
// Total typing ≈ 1710 frames (57s) — fits in 1800 with 3s buffer
const ALL_LINES: CodeLine[] = [
  // === Section 1: Variables ===
  { text: "# Python Basics", pause: 14, hold: 22, speed: 4 },
  { text: 'name = "Ahmed"', pause: 14, hold: 18, speed: 4 },
  { text: "age = 25", pause: 14, hold: 18, speed: 4 },
  { text: "height = 5.9", pause: 14, hold: 18, speed: 4 },
  { text: "is_student = True", pause: 14, hold: 22, speed: 4 },
  // === Section 2: Data Types ===
  { text: "", pause: 6, hold: 6 },
  { text: "# Data Types", pause: 24, hold: 20, speed: 4 },
  { text: 'print(type(name))', pause: 14, hold: 18, speed: 4 },
  { text: 'print(type(age))', pause: 14, hold: 18, speed: 4 },
  { text: 'print(type(height))', pause: 14, hold: 18, speed: 4 },
  // === Section 3: Operations ===
  { text: "", pause: 6, hold: 6 },
  { text: "# Operations", pause: 24, hold: 20, speed: 4 },
  { text: "result = age + 5", pause: 14, hold: 18, speed: 4 },
  { text: 'greeting = "Hello " + name', pause: 14, hold: 18, speed: 4 },
  { text: "print(greeting)", pause: 14, hold: 18, speed: 4 },
  // === Section 4: f-strings ===
  { text: "", pause: 6, hold: 6 },
  { text: "# F-Strings", pause: 24, hold: 20, speed: 4 },
  { text: 'msg = f"{name} is {age} years old"', pause: 14, hold: 18, speed: 4 },
  { text: "print(msg)", pause: 14, hold: 18, speed: 4 },
  { text: "print(len(msg))", pause: 14, hold: 20, speed: 4 },
];

// ─── Pre-compute frame timings (matching CodeEditor logic) ──
function computeTimings(lines: CodeLine[], startFrame: number) {
  const result: { start: number; charEnd: number; end: number }[] = [];
  let acc = 0;
  for (const line of lines) {
    const pause = line.pause ?? 10;
    const speed = line.speed ?? 2;
    const hold = line.hold ?? 12;
    const chars = Math.max(1, line.text.length);
    const start = acc + pause;
    const charEnd = start + chars * speed;
    const end = charEnd + hold;
    result.push({ start: start + startFrame, charEnd: charEnd + startFrame, end: end + startFrame });
    acc = end - startFrame;
  }
  return result;
}

const TIMINGS = computeTimings(ALL_LINES, 0);

// ─── Terminal output lines (appear after print statements) ──
const TERMINAL: TerminalLine[] = [
  { text: "Python 3.11.0 (main, Oct 24 2024)", color: "#888" },
  { prompt: true, text: "python main.py", color: "#6A9955" },
  // After line 7: print(type(name))
  { text: "<class 'str'>", color: "#CCCCCC" },
  // After line 8: print(type(age))
  { text: "<class 'int'>", color: "#CCCCCC" },
  // After line 9: print(type(height))
  { text: "<class 'float'>", color: "#CCCCCC" },
  // After line 14: print(greeting)
  { text: "Hello Ahmed", color: "#CCCCCC" },
  // After line 18: print(msg)
  { text: "Ahmed is 25 years old", color: "#CCCCCC" },
  // After line 19: print(len(msg))
  { text: "23", color: "#CCCCCC" },
];

// Which terminal line appears when (mapped to frame numbers)
const TERM_TRIGGERS: { frame: number; termIndex: number }[] = [
  { frame: TIMINGS[7]?.charEnd ?? 200,  termIndex: 2 },  // after type(name)
  { frame: TIMINGS[8]?.charEnd ?? 240,  termIndex: 3 },  // after type(age)
  { frame: TIMINGS[9]?.charEnd ?? 280,  termIndex: 4 },  // after type(height)
  { frame: TIMINGS[14]?.charEnd ?? 500, termIndex: 5 },  // after print(greeting)
  { frame: TIMINGS[18]?.charEnd ?? 700, termIndex: 6 },  // after print(msg)
  { frame: TIMINGS[19]?.charEnd ?? 740, termIndex: 7 },  // after print(len(msg))
];

// ─── Concept labels ────────────────────────────────────────
const CONCEPTS: { text: string; frame: number; color: string; icon: string }[] = [
  { text: "Variables", frame: TIMINGS[1]?.start ?? 60, color: "#3B82F6", icon: "📦" },
  { text: "Data Types", frame: TIMINGS[7]?.start ?? 200, color: "#8B5CF6", icon: "🔍" },
  { text: "Operations", frame: TIMINGS[12]?.start ?? 400, color: "#F59E0B", icon: "⚡" },
  { text: "F-Strings", frame: TIMINGS[17]?.start ?? 600, color: "#10B981", icon: "✨" },
];

// ─── Scene 1: Intro ────────────────────────────────────────
const INTRO_FRAMES = 75;

function IntroOverlay() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame: frame - 10, fps, config: { damping: 14, mass: 0.8 } }) * 30;
  const subtitleOpacity = interpolate(frame, [35, 50], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [60, 75], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.82)",
          borderRadius: 16,
          padding: "48px 72px",
          textAlign: "center",
          opacity: fadeOut,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800, color: "#FFFFFF", opacity: titleOpacity, fontFamily: "'Segoe UI', sans-serif" }}>
          Python Basics
        </div>
        <div style={{ fontSize: 24, color: "#94A3B8", marginTop: 12, opacity: subtitleOpacity, fontFamily: "'Segoe UI', sans-serif" }}>
          Variables, Data Types, Operations & F-Strings
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Concept Label Pill (appears on the right side) ────────
function ConceptPill({ text, color, icon, frame: startFrame }: { text: string; color: string; icon: string; frame: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame - startFrame;

  if (rel < 0 || rel > 120) return null;

  const opacity = interpolate(rel, [0, 15, 105, 120], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slideX = spring({ frame: rel, fps, config: { damping: 12, mass: 0.6 } }) * 40;

  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        right: 40,
        background: color,
        color: "#FFFFFF",
        borderRadius: 24,
        padding: "10px 24px",
        fontSize: 20,
        fontWeight: 700,
        fontFamily: "'Segoe UI', sans-serif",
        display: "flex",
        alignItems: "center",
        gap: 8,
        opacity,
        transform: `translateX(${slideX}px)`,
        boxShadow: `0 4px 20px ${color}44`,
        zIndex: 50,
      }}
    >
      <span>{icon}</span>
      {text}
    </div>
  );
}

// ─── Subtitle Overlay (bottom text) — synced to narration ──
// Frames derived from voiceover segment manifest (30fps):
//   s1 5-131, s2 130-482, s3 470-725, s4 890-1205, s5 1335-1524, s6 1625-1795
const SUBTITLES: { text: string; frame: number; dur: number }[] = [
  { text: "Assalam o Alaikum! Aaj hum seekhenge Python ki basics.", frame: 5, dur: 125 },
  { text: "Sab se pehle variables. Name mein string hai Ahmed, age mein number 25.", frame: 132, dur: 185 },
  { text: "Height decimal 5.9, aur is_student boolean True.", frame: 320, dur: 162 },
  { text: "Ab type function se data types check karte hain.", frame: 470, dur: 120 },
  { text: "Dekho: name string hai, age integer, height float.", frame: 592, dur: 133 },
  { text: "Ab operations. Numbers pe arithmetic; age mein 5 joro, result 30.", frame: 890, dur: 175 },
  { text: "Strings ko plus se joro; Hello Ahmed.", frame: 1065, dur: 140 },
  { text: "F-strings se variables ko sentence mein dalo.", frame: 1335, dur: 110 },
  { text: "Len string ki lambai batata hai.", frame: 1445, dur: 79 },
  { text: "Practice karte raho, agle video mein functions seekhenge. Allah Hafiz!", frame: 1625, dur: 170 },
];

// ─── Main Composition ──────────────────────────────────────
export const PythonBasicsVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Visible lines: start with 0, add as typing progresses
  const firstActiveIndex = TIMINGS.findIndex((t) => frame < t.charEnd);
  const visibleCount = firstActiveIndex >= 0 ? firstActiveIndex + 1 : ALL_LINES.length;

  // Terminal: count how many output lines to show
  let visibleTermCount = 2; // always show header + prompt
  for (const trig of TERM_TRIGGERS) {
    if (frame >= trig.frame) visibleTermCount = trig.termIndex + 1;
  }
  const termVisible = visibleCount > 6; // show terminal after first print section starts

  // Which line to highlight
  const activeLine = firstActiveIndex >= 0 ? firstActiveIndex : ALL_LINES.length - 1;

  // Subtitle
  const activeSub = SUBTITLES.find(
    (s) => frame >= s.frame && frame < s.frame + s.dur
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#1E1E1E" }}>
      {/* Voiceover */}
      <Audio src={staticFile("voiceover_urdu.mp3")} />

      {/* Intro overlay */}
      <Sequence durationInFrames={INTRO_FRAMES}>
        <IntroOverlay />
      </Sequence>

      {/* Code Editor — full screen */}
      <CodeEditor
        lines={ALL_LINES}
        visibleLineCount={visibleCount}
        terminalLines={TERMINAL}
        terminalLineCount={visibleTermCount}
        terminalVisible={termVisible}
        title="main.py"
        highlightLine={activeLine}
        fontSize={28}
      />

      {/* Concept pills */}
      {CONCEPTS.map((c, i) => (
        <ConceptPill key={i} {...c} />
      ))}

      {/* Subtitle */}
      {activeSub && (
        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.78)",
              color: "#FFFFFF",
              fontSize: 26,
              fontWeight: 500,
              padding: "12px 32px",
              borderRadius: 12,
              fontFamily: "'Segoe UI', sans-serif",
              maxWidth: "80%",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {activeSub.text}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
