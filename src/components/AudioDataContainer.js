import React, { useEffect, useRef, useState } from "react";
import Visualiser from "./Visualiser";

/*
fftSize
Must be a power of 2 between 2^5 and 2^15, so one of: 
32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768. Defaults to 2048.
*/
const fftSize = 32;
const totalBands = fftSize / 2 - 1;

export default function AudioDataContainer({ url }) {
  const [volume, setVolume] = useState(1);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [currSeconds, setCurrSeconds] = useState(0);
  const [ampVals, setAmpVals] = useState([...Array(totalBands).fill(0)]);

  const requestRef = useRef();
  const audioDataRef = useRef(null);
  const audioFileRef = useRef(null);
  const gainNode = useRef(null);
  const audioCtxRef = useRef(null);

  // remove animation call on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(requestRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []); // Make sure the effect runs only once

  useEffect(() => {
    // reset everything
    cancelAnimationFrame(requestRef.current);

    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
    }
    setTotalSeconds(0);
    setCurrSeconds(0);
    setAmpVals([...Array(totalBands).fill(0)]);
    audioFileRef.current = null;
  }, [url]);

  const init = () => {
    audioFileRef.current = new Audio();
    audioCtxRef.current = new AudioContext();
    const source = audioCtxRef.current.createMediaElementSource(
      audioFileRef.current
    );
    const analyser = audioCtxRef.current.createAnalyser();
    audioFileRef.current.src = url;
    analyser.fftSize = fftSize;

    gainNode.current = audioCtxRef.current.createGain(); // Create a gainNode reference.
    gainNode.current.connect(audioCtxRef.current.destination);
    source.connect(gainNode.current);

    gainNode.current.gain.value = volume;

    source.connect(analyser);
    audioDataRef.current = analyser;

    audioFileRef.current.play();
    requestRef.current = requestAnimationFrame(runSpectrum);
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
    if (!url) return;

    if (!audioFileRef.current) {
      init();
    } else if (audioFileRef.current.paused) {
      audioFileRef.current.play();
    } else {
      audioFileRef.current.pause();
    }
  };

  const onScrub = (value) => {
    // audioFileRef.current.pause();
    if (!audioFileRef.current) {
      init();
      audioFileRef.current.pause();
    }

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
