import React, { useState } from "react";
import AudioDataContainer from "./components/AudioDataContainer";

export default function App() {
  const [url, setUrl] = useState(null);
  const [showPlayer, setShowPlayer] = useState(true);

  const onSwitchUrl = () => {
    const nextUrl =
      url === "./audio/the-wient.mp3"
        ? "./audio/ford-park.mp3"
        : "./audio/the-wient.mp3";
    setUrl(nextUrl);
  };

  return (
    <div>
      <h1>Simple Audio Analyser</h1>
      <button onClick={() => setShowPlayer(!showPlayer)}>Toggle Player</button>
      <button onClick={onSwitchUrl}>Switch track</button>
      <h2>Track: {url}</h2>

      {url && showPlayer && <AudioDataContainer url={url} />}
    </div>
  );
}
