import React from "react";
import styles from "./visualiser.module.css";

export default function Visualiser({ ampVals }) {
  const avgAmp =
    ampVals.reduce((runningTotal, currVal) => runningTotal + currVal) /
    ampVals.length;

  return (
    <div>
      <div className={styles.bar} style={{ width: avgAmp + "px" }} />

      <div className={styles.frequencyBars}>
        {ampVals.map((num, i) => (
          <div className={styles.bar} style={{ height: num + "px" }} key={i} />
        ))}
      </div>
    </div>
  );
}
