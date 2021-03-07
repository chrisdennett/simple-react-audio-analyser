import React, { useRef, useState } from "react";
import styles from "./audioDataContainer.module.css";

/*
fftSize
Must be a power of 2 between 2^5 and 2^15, so one of: 
32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768. Defaults to 2048.
*/
const fftSize = 32;
const totalBands = fftSize / 2 - 1;

export default function AudioDataContainer() {
  const [ampVals, setAmpVals] = useState([...Array(totalBands).fill(0)]);
  const [avgAmp, setAvgAmp] = useState(0);

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
    audioFileRef.current.src = "./audio/theWent-edit-2.mp3";
    analyser.fftSize = fftSize;
    source.connect(audioContextRef.current.destination);
    source.connect(analyser);
    audioDataRef.current = analyser;
  };

  function runSpectrum() {
    const bufferLength = audioDataRef.current.frequencyBinCount;
    const newAmplitudeData = new Uint8Array(bufferLength);
    audioDataRef.current.getByteFrequencyData(newAmplitudeData);

    const arr = Array.from(newAmplitudeData).slice(0, totalBands);
    setAmpVals(arr);

    const total = arr.reduce((runningTotal, currVal) => runningTotal + currVal);
    const avg = total / arr.length;
    setAvgAmp(avg);

    requestAnimationFrame(runSpectrum);

    // this allows the bars to return to starting position
    // because it takes a few frames for the buffer frequencies
    // to return to zero
    // const pausedAndAtZero = audioFileRef.current.paused && avgAmp === 0;
    // if (!pausedAndAtZero) {
    //   requestAnimationFrame(runSpectrum);
    // }
  }

  const onStart = () => {
    if (!audioFileRef.current) {
      init();
      audioFileRef.current.play();
      requestAnimationFrame(runSpectrum);
    } else if (audioFileRef.current.paused) {
      audioFileRef.current.play();
      requestAnimationFrame(runSpectrum);
    } else {
      audioFileRef.current.pause();
    }
  };

  return (
    <div>
      <button onClick={onStart}>play / pause</button>
      <div className={styles.bar} style={{ width: avgAmp + "px" }} />

      <div className={styles.frequencyBars}>
        {ampVals.map((num, i) => (
          <div className={styles.bar} style={{ height: num + "px" }} key={i} />
        ))}
      </div>
    </div>
  );
}
