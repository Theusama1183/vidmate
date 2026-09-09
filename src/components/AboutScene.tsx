import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, SlideUp, FadeIn, GlowDot } from "./Shared";

export const AboutScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <GlowDot x={200} y={200} size={400} color={COLORS.accent} delay={0} />
      <GlowDot x={800} y={350} size={300} color={COLORS.accentCyan} delay={10} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          maxWidth: 900,
        }}
      >
        <SlideUp delay={0}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.accentCyan,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Our Solution
          </div>
        </SlideUp>

        <SlideUp delay={8}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: COLORS.white,
              textAlign: "center",
              lineHeight: 1.2,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            We Rebuild Your
            <br />
            <span style={{ color: COLORS.accent }}>Digital Footprint</span>
          </div>
        </SlideUp>

        <SlideUp delay={18}>
          <div
            style={{
              fontSize: 20,
              color: COLORS.gray,
              textAlign: "center",
              lineHeight: 1.7,
              maxWidth: 700,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            From AI search optimization to high-conversion websites — so
            procurement managers find you first.
          </div>
        </SlideUp>

        <SlideUp delay={30}>
          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 24,
            }}
          >
            {[
              { num: "40%", label: "Reduction in RFP\nResponse Time" },
              { num: "3.2", label: "Weighted Shipper\nInquiries/Week" },
              { num: "85%", label: "Cited in AI Search\nWithin 3 Months" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: COLORS.accent,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {stat.num}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: COLORS.gray,
                    lineHeight: 1.4,
                    whiteSpace: "pre-line",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </SlideUp>
      </div>
    </AbsoluteFill>
  );
};
