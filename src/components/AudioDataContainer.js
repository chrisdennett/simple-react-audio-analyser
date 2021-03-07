import React, { useRef } from "react";
import VisualDemo from "./VisualDemo";
import soundFile from "../audio/GummyBearz.mp3";

const frequencyBandArray = [...Array(25).keys()];

export default function AudioDataContainer() {
  const audioDataRef = useRef(null);
  const audioFileRef = useRef(null);
  const audioContextRef = useRef(null);

  const init = () => {
    audioFileRef.current = new Audio();
    audioContextRef.current = new AudioContext();
    const source = audioContextRef.current.createMediaElementSource(
      audioFileRef.current
    );
    const analyser = audioContextRef.current.createAnalyser();
    audioFileRef.current.src = soundFile;
    analyser.fftSize = 64;
    source.connect(audioContextRef.current.destination);
    source.connect(analyser);
    audioDataRef.current = analyser;
  };

  const onStart = () => {
    if (!audioFileRef.current) {
      init();
      audioFileRef.current.play();
    } else if (audioFileRef.current.paused) {
      audioFileRef.current.play();
    } else {
      audioFileRef.current.pause();
    }
  };

  const getFrequencyData = (styleAdjuster) => {
    if (!audioDataRef.current) return;

    const bufferLength = audioDataRef.current.frequencyBinCount;
    const amplitudeArray = new Uint8Array(bufferLength);
    audioDataRef.current.getByteFrequencyData(amplitudeArray);

    styleAdjuster(amplitudeArray);
  };

  return (
    <div>
      <VisualDemo
        onStart={onStart}
        frequencyBandArray={frequencyBandArray}
        getFrequencyData={getFrequencyData}
      />
    </div>
  );
}
