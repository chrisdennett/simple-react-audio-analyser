import React, { useEffect, useRef, useState } from "react";
import Visualiser from "./Visualiser";

/*
fftSize
Must be a power of 2 between 2^5 and 2^15, so one of: 
32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768. Defaults to 2048.
*/
const fftSize = 32;
const totalBands = fftSize / 2 - 1;

export default function AudioDataContainer() {
  const [volume, setVolume] = useState(1);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [currSeconds, setCurrSeconds] = useState(0);
  const [ampVals, setAmpVals] = useState([...Array(totalBands).fill(0)]);

  const requestRef = React.useRef();
  const audioDataRef = useRef(null);
  const audioFileRef = useRef(null);
  const gainNode = useRef(null);

  // remove animation call on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Make sure the effect runs only once

  const init = () => {
    audioFileRef.current = new Audio();
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audioFileRef.current);
    const analyser = audioCtx.createAnalyser();
    audioFileRef.current.src = "./audio/theWent-edit-2.mp3";
    analyser.fftSize = fftSize;

    gainNode.current = audioCtx.createGain(); // Create a gainNode reference.
    gainNode.current.connect(audioCtx.destination);
    source.connect(gainNode.current);

    gainNode.current.gain.value = volume;

    source.connect(analyser);
    audioDataRef.current = analyser;
  };

  useEffect(() => {
    if (!gainNode.current) return;

    gainNode.current.gain.value = volume;
  }, [volume]);

  function runSpectrum() {
    if (totalSeconds === 0) {
      setTotalSeconds(audioFileRef.current.duration);
    }

    setCurrSeconds(audioFileRef.current.currentTime);

    const bufferLength = audioDataRef.current.frequencyBinCount;
    const newAmplitudeData = new Uint8Array(bufferLength);
    audioDataRef.current.getByteFrequencyData(newAmplitudeData);

    const arr = Array.from(newAmplitudeData).slice(0, totalBands);
    setAmpVals(arr);

    requestRef.current = requestAnimationFrame(runSpectrum);
  }

  const onStart = () => {
    if (!audioFileRef.current) {
      init();
      audioFileRef.current.play();
      requestRef.current = requestAnimationFrame(runSpectrum);
    } else if (audioFileRef.current.paused) {
      audioFileRef.current.play();
    } else {
      audioFileRef.current.pause();
    }
  };

  const onScrub = (value) => {
    // audioFileRef.current.pause();
    audioFileRef.current.currentTime = value;
    setCurrSeconds(audioFileRef.current.currentTime);
  };

  return (
    <div>
      <button onClick={onStart}>play / pause</button>
      <input
        type="range"
        min="0"
        max={totalSeconds | 1}
        step="0.1"
        value={currSeconds}
        onChange={(e) => onScrub(e.target.value)}
        // onMouseUp={onScrubEnd}
        // onKeyUp={onScrubEnd}
      />
      CurrSeconds: {currSeconds}
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => setVolume(e.target.value)}
      />
      Volume: {volume}
      <Visualiser ampVals={ampVals} />
    </div>
  );
}
