import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, SlideUp, GlowDot } from "./Shared";

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();

  const problems = [
    {
      icon: "🔍",
      title: "Your Safety Score Is Buried",
      desc: "Procurement managers Google you — find an outdated site. The tech-forward 3PL wins the bid you've been running since 2008.",
    },
    {
      icon: "🤖",
      title: "AI Has No Reason to Cite You",
      desc: "ChatGPT names 3 companies — none of them yours. No structured data, no entity schema, no authoritative content.",
    },
    {
      icon: "📉",
      title: "3-Second Elimination",
      desc: "Average time a shipper spends on your website before deciding to move on. Your outdated site doesn't make the cut.",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        padding: 80,
        justifyContent: "center",
      }}
    >
      <GlowDot x={50} y={50} size={200} color="#EF4444" delay={0} />
      <GlowDot x={1000} y={500} size={180} color="#F59E0B" delay={10} />

      <SlideUp delay={0}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#EF4444",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 12,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          The Problem
        </div>
      </SlideUp>

      <SlideUp delay={5}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.2,
            marginBottom: 48,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Why Shippers Are Choosing
          <br />
          Someone Else
        </div>
      </SlideUp>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {problems.map((p, i) => (
          <SlideUp key={i} delay={20 + i * 15}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                padding: 24,
                borderRadius: 16,
                backgroundColor: `${COLORS.bgLight}`,
                border: `1px solid rgba(255,255,255,0.06)`,
              }}
            >
              <div style={{ fontSize: 36, lineHeight: 1 }}>{p.icon}</div>
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: COLORS.white,
                    marginBottom: 8,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: COLORS.gray,
                    lineHeight: 1.6,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {p.desc}
                </div>
              </div>
            </div>
          </SlideUp>
        ))}
      </div>
    </AbsoluteFill>
  );
};
