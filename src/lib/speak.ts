function getVoice(voiceName: string = '') {
  // Get all available voices
  const voices = speechSynthesis.getVoices();

  if (voiceName) {
    const voice = voices.find(
      (v) => v.name.toLowerCase() === voiceName.toLowerCase()
    );

    if (voice) {
      return voice;
    }
  }

  const backupVoices = ['fred', 'microsoft'];

  // First try to find voices matching our robotic keywords
  for (const keyword of backupVoices) {
    const backupVoice = voices.find((voice) =>
      voice.name.toLowerCase().includes(keyword.toLowerCase())
    );

    if (backupVoice) {
      return backupVoice;
    }
  }

  // Last resort: pick random
  return voices[Math.floor(Math.random() * voices.length)];
}

const textToSpeech = (text: string, voice: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = getVoice(voice);
  utterance.lang = 'en-US';

  utterance.pitch = 1;
  utterance.rate = 0.85;

  speechSynthesis.speak(utterance);

  return utterance;
};

export const speak = (
  text: string,
  voice = '',
  callback: () => void
): Promise<() => void> => {
  let instance: SpeechSynthesisUtterance;

  return new Promise((resolve) => {
    // Wait for voices to be loaded
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener(
        'voiceschanged',
        () => {
          instance = textToSpeech(text, voice);
          instance.addEventListener('end', callback);
          resolve(() => {
            instance.removeEventListener('end', callback);
          });
        },
        { once: true }
      );
    } else {
      instance = textToSpeech(text, voice);
      instance.addEventListener('end', callback);
      resolve(() => {
        instance.removeEventListener('end', callback);
      });
    }
  });
};
