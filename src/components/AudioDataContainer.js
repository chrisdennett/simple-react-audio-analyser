import React, { useRef, useState } from "react";
import Visualiser from "./Visualiser";

/*
fftSize
Must be a power of 2 between 2^5 and 2^15, so one of: 
32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768. Defaults to 2048.
*/
const fftSize = 32;
const totalBands = fftSize / 2 - 1;

export default function AudioDataContainer() {
  const [ampVals, setAmpVals] = useState([...Array(totalBands).fill(0)]);

  const audioDataRef = useRef(null);
  const audioFileRef = useRef(null);

  const init = () => {
    audioFileRef.current = new Audio();
    const audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audioFileRef.current);
    const analyser = audioContext.createAnalyser();
    audioFileRef.current.src = "./audio/theWent-edit-2.mp3";
    analyser.fftSize = fftSize;
    source.connect(audioContext.destination);
    source.connect(analyser);
    audioDataRef.current = analyser;
  };

  function runSpectrum() {
    const bufferLength = audioDataRef.current.frequencyBinCount;
    const newAmplitudeData = new Uint8Array(bufferLength);
    audioDataRef.current.getByteFrequencyData(newAmplitudeData);

    const arr = Array.from(newAmplitudeData).slice(0, totalBands);
    setAmpVals(arr);

    requestAnimationFrame(runSpectrum);
  }

  const onStart = () => {
    if (!audioFileRef.current) {
      init();
      audioFileRef.current.play();
      requestAnimationFrame(runSpectrum);
    } else if (audioFileRef.current.paused) {
      audioFileRef.current.play();
    } else {
      audioFileRef.current.pause();
    }
  };

  return (
    <div>
      <button onClick={onStart}>play / pause</button>
      <Visualiser ampVals={ampVals} />
    </div>
  );
}
