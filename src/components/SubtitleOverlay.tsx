import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "./Shared";

type SubtitleEntry = {
  startFrame: number;
  endFrame: number;
  text: string;
};

const VTT_DATA: SubtitleEntry[] = [
  { startFrame: 3, endFrame: 261, text: "Welcome to LogisticsWeb — the digital marketing agency built exclusively for logistics, freight forwarding, trucking, 3PL, and supply chain companies." },
  { startFrame: 259, endFrame: 435, text: "When shippers search online or ask ChatGPT for a freight partner, your company should be the first name they see." },
  { startFrame: 435, endFrame: 586, text: "But if your digital presence is outdated, you're losing bids to tech-forward competitors." },
  { startFrame: 586, endFrame: 642, text: "That's where we come in." },
  { startFrame: 642, endFrame: 864, text: "We rebuild your entire digital footprint — from AI search optimization to high-conversion websites — so procurement managers find you first." },
  { startFrame: 864, endFrame: 959, text: "Our services start with Logistics SEO." },
  { startFrame: 959, endFrame: 1309, text: "We combine traditional search optimization with AIO and GEO — AI search optimization — to get you ranking on page one." },
  { startFrame: 1309, endFrame: 1393, text: "Next, Logistics Website Design." },
  { startFrame: 1393, endFrame: 1646, text: "We build high-conversion, mobile-first websites specifically for logistics companies." },
  { startFrame: 1646, endFrame: 1906, text: "Freight Broker Marketing attracts qualified shippers actively looking for brokers." },
  { startFrame: 1906, endFrame: 2160, text: "And our GEO and AIO Optimization ensures your company gets cited across all major AI platforms." },
  { startFrame: 2160, endFrame: 2419, text: "With a proven six-month roadmap, we take you from invisible to industry leader." },
  { startFrame: 2419, endFrame: 2512, text: "LogisticsWeb — where shippers find you first." },
];

export const SubtitleOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  const current = VTT_DATA.find(
    (s) => frame >= s.startFrame && frame <= s.endFrame
  );

  if (!current) return null;

  const fadeIn = interpolate(
    frame,
    [current.startFrame, current.startFrame + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const fadeOut = interpolate(
    frame,
    [current.endFrame - 8, current.endFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: "0 120px",
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          padding: "14px 28px",
          borderRadius: 12,
          maxWidth: 900,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: COLORS.white,
            textAlign: "center",
            lineHeight: 1.5,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 500,
          }}
        >
          {current.text}
        </div>
      </div>
    </div>
  );
};
