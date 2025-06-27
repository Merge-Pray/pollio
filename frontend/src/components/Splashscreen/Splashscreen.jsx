// src/components/SplashScreen/SplashScreen.jsx
import { useEffect } from "react";
import styles from "./splashScreen.module.css";
import logo from "/assets/logo_w.svg"; // Pfad anpassen!

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1400); // 0.8s Animation + 0.3s Fadeout

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={styles.splashOverlay}>
      <img
        src="../public/pollio_logo_w.svg"
        alt="Logo"
        className={styles.landingpage - logo}
      />
    </div>
  );
};

export default SplashScreen;
