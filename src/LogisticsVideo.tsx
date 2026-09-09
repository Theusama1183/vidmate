import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { IntroScene } from "./components/IntroScene";
import { ProblemScene } from "./components/ProblemScene";
import { AboutScene } from "./components/AboutScene";
import {
  SEOServiceScene,
  WebDesignScene,
  FreightBrokerScene,
  GEOAIOScene,
} from "./components/ServiceScenes";
import { RoadmapScene, OutroScene } from "./components/OutroScenes";
import { SubtitleOverlay } from "./components/SubtitleOverlay";

export const LogisticsVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("voiceover.mp3")} />

      <Sequence from={0} durationInFrames={261}>
        <IntroScene />
      </Sequence>

      <Sequence from={261} durationInFrames={381}>
        <ProblemScene />
      </Sequence>

      <Sequence from={642} durationInFrames={222}>
        <AboutScene />
      </Sequence>

      <Sequence from={864} durationInFrames={445}>
        <SEOServiceScene />
      </Sequence>

      <Sequence from={1309} durationInFrames={337}>
        <WebDesignScene />
      </Sequence>

      <Sequence from={1646} durationInFrames={260}>
        <FreightBrokerScene />
      </Sequence>

      <Sequence from={1906} durationInFrames={254}>
        <GEOAIOScene />
      </Sequence>

      <Sequence from={2160} durationInFrames={259}>
        <RoadmapScene />
      </Sequence>

      <Sequence from={2419} durationInFrames={101}>
        <OutroScene />
      </Sequence>

      <SubtitleOverlay />
    </AbsoluteFill>
  );
};
