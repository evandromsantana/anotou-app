import React, { createContext, useContext, useState, useEffect } from "react";
import { Audio } from "expo-av";

interface SoundContextType {
  playScanSound: () => Promise<void>;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [sound, setSound] = useState<Audio.Sound>();

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  async function playScanSound() {
    const { sound: newSound } = await Audio.Sound.createAsync(
      require("../assets/sounds/index.ts")
    );
    setSound(newSound);
    await newSound.playAsync();
  }

  const value = {
    playScanSound,
  };

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
