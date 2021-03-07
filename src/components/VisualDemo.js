import React, { useState } from "react";
import styles from "./visualDemo.module.css";

export default function VisualDemo({ onStart, getFrequencyData }) {
  const [ampVals, setAmpVals] = useState([...Array(25).fill(0)]);
  const [avgAmp, setAvgAmp] = useState(0);

  function adjustFreqBandStyle(newAmplitudeData) {
    const arr = Array.from(newAmplitudeData).slice(0, 25);
    setAmpVals(arr);

    const total = arr.reduce((runningTotal, currVal) => runningTotal + currVal);
    const avg = total / arr.length;
    setAvgAmp(avg);
  }

  function runSpectrum() {
    getFrequencyData(adjustFreqBandStyle);
    requestAnimationFrame(runSpectrum);
  }

  function onStartClick() {
    onStart();
    requestAnimationFrame(runSpectrum);
  }

  return (
    <div>
      <button onClick={() => onStartClick()}>play / pause</button>
      <div className={styles.bar} style={{ width: avgAmp + "px" }} />

      <div className={styles.frequencyBars}>
        {ampVals.map((num, i) => (
          <div className={styles.bar} style={{ height: num + "px" }} key={i} />
        ))}
      </div>
    </div>
  );
}
