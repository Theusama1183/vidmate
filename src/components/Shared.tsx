import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const COLORS = {
  bg: "#0B1120",
  bgLight: "#111827",
  accent: "#3B82F6",
  accentCyan: "#06B6D4",
  accentPurple: "#8B5CF6",
  white: "#F9FAFB",
  gray: "#9CA3AF",
  grayDark: "#6B7280",
};

export { COLORS };

export const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}> = ({ children, delay = 0, duration = 20 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <div style={{ opacity }}>{children}</div>;
};

export const SlideUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
}> = ({ children, delay = 0, duration = 20, distance = 40 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame - delay, [0, duration], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </div>
  );
};

export const ScaleIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}> = ({ children, delay = 0, duration = 20 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame - delay, [0, duration], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity, transform: `scale(${scale})` }}>{children}</div>
  );
};

export const GlowDot: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  delay?: number;
}> = ({ x, y, size, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin((frame - delay) * 0.05) * 0.3 + 0.7;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        opacity: pulse * 0.4,
        filter: `blur(${size / 2}px)`,
      }}
    />
  );
};

export const ProgressBar: React.FC<{
  progress: number;
  color?: string;
}> = ({ progress, color = COLORS.accent }) => {
  return (
    <div
      style={{
        width: "100%",
        height: 4,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: 2,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
};

export const Badge: React.FC<{
  text: string;
  color?: string;
}> = ({ text, color = COLORS.accent }) => {
  return (
    <div
      style={{
        display: "inline-block",
        padding: "6px 16px",
        borderRadius: 20,
        backgroundColor: `${color}20`,
        border: `1px solid ${color}40`,
        color: color,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
};
