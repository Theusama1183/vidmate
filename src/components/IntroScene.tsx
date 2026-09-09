import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FadeIn, SlideUp, GlowDot } from "./Shared";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = interpolate(frame, [0, 20], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <GlowDot x={100} y={150} size={300} color={COLORS.accent} delay={0} />
      <GlowDot x={900} y={400} size={250} color={COLORS.accentPurple} delay={10} />
      <GlowDot x={500} y={100} size={200} color={COLORS.accentCyan} delay={20} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.white,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -2,
          }}
        >
          Logistics
          <span style={{ color: COLORS.accent }}>Web</span>
        </div>

        <FadeIn delay={15}>
          <div
            style={{
              fontSize: 22,
              color: COLORS.gray,
              fontFamily: "system-ui, sans-serif",
              textAlign: "center",
              maxWidth: 600,
              lineHeight: 1.6,
            }}
          >
            Digital Marketing Built Exclusively
            <br />
            for Logistics & Supply Chain
          </div>
        </FadeIn>

        <FadeIn delay={30}>
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 16,
            }}
          >
            {["50+ Clients", "98% Satisfaction", "AI Search Experts"].map(
              (stat, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 12,
                    backgroundColor: `${COLORS.accent}15`,
                    border: `1px solid ${COLORS.accent}30`,
                    color: COLORS.white,
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {stat}
                </div>
              )
            )}
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};
