import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

export function useSound() {
  const [sound, setSound] = useState<Audio.Sound>();

  async function loadSound(requirePath: number) {
    const { sound } = await Audio.Sound.createAsync(requirePath);
    setSound(sound);
  }

  async function playSound() {
    if (sound) {
      await sound.replayAsync();
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return { loadSound, playSound };
}