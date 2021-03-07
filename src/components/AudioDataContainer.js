import React, { useEffect, useRef, useState } from "react";
import Visualiser from "./Visualiser";

// playBackRate should be between 0.5 and 4
/*
fftSize
Must be a power of 2 between 2^5 and 2^15, so one of: 
32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768. Defaults to 2048.
*/
const fftSize = 32;
const totalBands = fftSize / 2 - 1;

export default function AudioDataContainer({ url }) {
  const [playSpeed, setPlaySpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [currSeconds, setCurrSeconds] = useState(0);
  const [ampVals, setAmpVals] = useState([...Array(totalBands).fill(0)]);

  const requestRef = useRef();
  const audioDataRef = useRef(null);
  const audioFileRef = useRef(null);
  const gainNode = useRef(null);
  const audioCtxRef = useRef(null);

  const cleanUp = () => {
    cancelAnimationFrame(requestRef.current);

    if (audioFileRef.current) {
      audioFileRef.current.pause();
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        console.log("could not close audio context >e: ", e);
      }
    }

    setTotalSeconds(0);
    setPlaySpeed(1);
    setCurrSeconds(0);
    setAmpVals([...Array(totalBands).fill(0)]);
    audioFileRef.current = null;
  };

  // RUN CLEANUP ON NEW URL...
  useEffect(() => {
    cleanUp();
  }, [url]);
  // ... AND UNMOUNT
  useEffect(() => {
    return () => cleanUp();
  }, []);

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

  // listen for volume change to set gain
  useEffect(() => {
    if (!gainNode.current) return;
    gainNode.current.gain.value = volume;
  }, [volume]);

  // listen for speed change to set gain
  useEffect(() => {
    if (!audioFileRef.current) return;

    try {
      audioFileRef.current.playbackRate = playSpeed;
    } catch (error) {
      console.log("Playback Rate not supported> Error: " + error.message);
    }
  }, [playSpeed]);

  function runSpectrum() {
    if (!audioFileRef.current) return;

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

  const onSpeedScrub = (value) => {
    // audioFileRef.current.pause();
    if (!audioFileRef.current) {
      init();
      audioFileRef.current.pause();
    }

    setPlaySpeed(parseFloat(value).toFixed(1));
  };

  return (
    <div>
      <button onClick={onStart}>play / pause</button>
      Speed:
      <input
        type="range"
        min={0.5}
        max={2}
        step={0.1}
        value={playSpeed}
        onChange={(e) => onSpeedScrub(e.target.value)}
        // onMouseUp={onScrubEnd}
        // onKeyUp={onScrubEnd}
      />
      Position:
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
