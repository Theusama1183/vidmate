import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, SlideUp, GlowDot } from "./Shared";

type ServiceProps = {
  badge: string;
  title: string;
  subtitle: string;
  features: string[];
  icon: string;
  accentColor: string;
};

export const ServiceScene: React.FC<ServiceProps> = ({
  badge,
  title,
  subtitle,
  features,
  icon,
  accentColor,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        padding: 80,
        justifyContent: "center",
      }}
    >
      <GlowDot x={800} y={100} size={350} color={accentColor} delay={0} />
      <GlowDot x={100} y={500} size={200} color={COLORS.accentPurple} delay={10} />

      <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
        {/* Left side */}
        <div style={{ flex: 1 }}>
          <SlideUp delay={0}>
            <div
              style={{
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: 20,
                backgroundColor: `${accentColor}20`,
                border: `1px solid ${accentColor}40`,
                color: accentColor,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 20,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {badge}
            </div>
          </SlideUp>

          <SlideUp delay={8}>
            <div
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: COLORS.white,
                lineHeight: 1.2,
                marginBottom: 16,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {title}
            </div>
          </SlideUp>

          <SlideUp delay={15}>
            <div
              style={{
                fontSize: 18,
                color: COLORS.gray,
                lineHeight: 1.7,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {subtitle}
            </div>
          </SlideUp>
        </div>

        {/* Right side - features */}
        <div style={{ flex: 1 }}>
          {features.map((feature, i) => (
            <SlideUp key={i} delay={20 + i * 8}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  marginBottom: 12,
                  borderRadius: 12,
                  backgroundColor: `${COLORS.bgLight}`,
                  border: `1px solid rgba(255,255,255,0.06)`,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: accentColor,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontSize: 16,
                    color: COLORS.white,
                    fontWeight: 500,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {feature}
                </div>
              </div>
            </SlideUp>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SEOServiceScene: React.FC = () => (
  <ServiceScene
    badge="Service 01"
    title={
      <>
        Logistics{"\n"}
        <span style={{ color: COLORS.accent }}>SEO Services</span>
      </>
    }
    subtitle="Stop being invisible when shippers search. We combine traditional SEO with AIO/GEO to rank you on page one — and get you cited in ChatGPT."
    features={[
      "AIO/GEO integration with traditional SEO",
      "Keyword research for logistics",
      "Technical SEO audits",
      "Local SEO for trucking",
    ]}
    icon="🔍"
    accentColor={COLORS.accent}
  />
);

export const WebDesignScene: React.FC = () => (
  <ServiceScene
    badge="Service 02"
    title={
      <>
        Logistics{"\n"}
        <span style={{ color: COLORS.accentCyan }}>Website Design</span>
      </>
    }
    subtitle="High-conversion, mobile-first websites built specifically for logistics — engineered to turn visitors into qualified leads in under 3 seconds."
    features={[
      "Custom logistics UI/UX",
      "Lead capture optimization",
      "Mobile-responsive design",
      "Performance optimized",
    ]}
    icon="🎨"
    accentColor={COLORS.accentCyan}
  />
);

export const FreightBrokerScene: React.FC = () => (
  <ServiceScene
    badge="Service 03"
    title={
      <>
        Freight Broker{"\n"}
        <span style={{ color: COLORS.accentPurple }}>Marketing</span>
      </>
    }
    subtitle="Attract qualified shippers actively looking for brokers through AI citation building, targeted SEO, and content that proves your lane expertise."
    features={[
      "AI citation building for brokers",
      "Broker-specific keywords",
      "Shipper lead generation",
      "LinkedIn targeting",
    ]}
    icon="🚛"
    accentColor={COLORS.accentPurple}
  />
);

export const GEOAIOScene: React.FC = () => (
  <ServiceScene
    badge="Service 04"
    title={
      <>
        GEO & AIO{"\n"}
        <span style={{ color: "#F59E0B" }}>Optimization</span>
      </>
    }
    subtitle="Get cited across all major AI platforms — because that's where shippers under 45 start their vendor search."
    features={[
      "ChatGPT citation building",
      "Perplexity optimization",
      "Google AI Overviews",
      "Entity schema markup",
    ]}
    icon="🤖"
    accentColor="#F59E0B"
  />
);
