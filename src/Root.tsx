import { Composition } from "remotion";
import { LogisticsVideo } from "./LogisticsVideo";
import { PythonBasicsVideo } from "./PythonBasicsVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LogisticsWebAbout"
        component={LogisticsVideo}
        durationInFrames={2520}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PythonBasicsVideo"
        component={PythonBasicsVideo}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
