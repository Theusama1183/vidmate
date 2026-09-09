import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, SlideUp, GlowDot } from "./Shared";

export const RoadmapScene: React.FC = () => {
  const frame = useCurrentFrame();

  const steps = [
    { month: "Month 1-2", title: "AI Foundation", color: COLORS.accent },
    { month: "Month 3-4", title: "GEO & AIO Integration", color: COLORS.accentCyan },
    { month: "Month 5-6", title: "AI-Powered Lead Gen", color: COLORS.accentPurple },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        padding: 80,
        justifyContent: "center",
      }}
    >
      <GlowDot x={100} y={200} size={300} color={COLORS.accent} delay={0} />
      <GlowDot x={900} y={400} size={250} color={COLORS.accentCyan} delay={10} />

      <SlideUp delay={0}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: COLORS.accent,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 12,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Your Roadmap
        </div>
      </SlideUp>

      <SlideUp delay={5}>
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.2,
            marginBottom: 48,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          6-Month Path to
          <br />
          <span style={{ color: COLORS.accent }}>Industry Leader</span>
        </div>
      </SlideUp>

      <div style={{ display: "flex", gap: 24 }}>
        {steps.map((step, i) => (
          <SlideUp key={i} delay={15 + i * 12}>
            <div
              style={{
                flex: 1,
                padding: 28,
                borderRadius: 16,
                backgroundColor: COLORS.bgLight,
                border: `1px solid ${step.color}30`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  backgroundColor: step.color,
                }}
              />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: step.color,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {step.month}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: COLORS.white,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {step.title}
              </div>
            </div>
          </SlideUp>
        ))}
      </div>

      <SlideUp delay={55}>
        <div
          style={{
            marginTop: 40,
            padding: "20px 32px",
            borderRadius: 16,
            backgroundColor: `${COLORS.accent}10`,
            border: `1px solid ${COLORS.accent}25`,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 28 }}>🎯</div>
          <div
            style={{
              fontSize: 17,
              color: COLORS.gray,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <span style={{ color: COLORS.white, fontWeight: 600 }}>
              Result:
            </span>{" "}
            Cited across 5+ AI platforms, 100+ qualified leads/month, market
            leader positioning.
          </div>
        </div>
      </SlideUp>
    </AbsoluteFill>
  );
};

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();

  const pulse = Math.sin(frame * 0.08) * 0.1 + 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <GlowDot x={300} y={200} size={400} color={COLORS.accent} delay={0} />
      <GlowDot x={700} y={350} size={300} color={COLORS.accentCyan} delay={10} />
      <GlowDot x={500} y={100} size={250} color={COLORS.accentPurple} delay={20} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <SlideUp delay={0}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: COLORS.white,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -2,
              transform: `scale(${pulse})`,
            }}
          >
            Logistics
            <span style={{ color: COLORS.accent }}>Web</span>
          </div>
        </SlideUp>

        <SlideUp delay={10}>
          <div
            style={{
              fontSize: 24,
              color: COLORS.accentCyan,
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: 1,
            }}
          >
            Where Shippers Find You First
          </div>
        </SlideUp>

        <SlideUp delay={20}>
          <div
            style={{
              marginTop: 24,
              padding: "16px 40px",
              borderRadius: 12,
              backgroundColor: COLORS.accent,
              color: COLORS.white,
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            logisticsweb.site
          </div>
        </SlideUp>
      </div>
    </AbsoluteFill>
  );
};
