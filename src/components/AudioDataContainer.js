import React, { useRef, useState } from "react";
import styles from "./audioDataContainer.module.css";

const totalBands = 25;

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
    analyser.fftSize = 64;
    source.connect(audioContextRef.current.destination);
    source.connect(analyser);
    audioDataRef.current = analyser;
  };

  const getFrequencyData = () => {
    if (!audioDataRef.current) return;

    const bufferLength = audioDataRef.current.frequencyBinCount;
    const amplitudeArray = new Uint8Array(bufferLength);
    audioDataRef.current.getByteFrequencyData(amplitudeArray);

    return amplitudeArray;
  };

  function runSpectrum() {
    const newAmplitudeData = getFrequencyData();

    const arr = Array.from(newAmplitudeData).slice(0, 25);
    setAmpVals(arr);

    const total = arr.reduce((runningTotal, currVal) => runningTotal + currVal);
    const avg = total / arr.length;
    setAvgAmp(avg);

    // this allows the bars to return to starting position
    // because it takes a few frames for the buffer frequencies
    // to return to zero
    // const pausedAndAtZero = audioFileRef.current.paused && avgAmp === 0;
    // if (!pausedAndAtZero) {
    requestAnimationFrame(runSpectrum);
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
