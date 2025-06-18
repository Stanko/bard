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

  // console.log(voices.map((voice) => voice.name));

  // Priority list of keywords that might indicate a robotic voice
  const roboticKeywords = [
    // 'organ', // macos
    // 'zarvox', // macos
    // 'robot',
    // 'zira', // Windows robotic-sounding voice
    'fred', // macOS somewhat robotic voice
    'victoria', // Windows somewhat mechanical voice
    'alex', // macOS slightly robotic voice
    'microsoft', // Generally more robotic-sounding than natural voices
  ];

  // First try to find voices matching our robotic keywords
  for (const keyword of roboticKeywords) {
    const roboticVoice = voices.find((voice) =>
      voice.name.toLowerCase().includes(keyword.toLowerCase())
    );

    if (roboticVoice) {
      return roboticVoice;
    }
  }

  // Last resort: pick random
  return voices[Math.floor(Math.random() * voices.length)];
}

const textToSpeech = (text: string, voice: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = getVoice(voice);
  utterance.lang = 'en-US';

  // Make the voice sound more robotic
  utterance.pitch = 1.0;
  utterance.rate = 0.75;

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
            // speechSynthesis.cancel();
          });
        },
        { once: true }
      );
    } else {
      instance = textToSpeech(text, voice);
      instance.addEventListener('end', callback);
      resolve(() => {
        instance.removeEventListener('end', callback);
        // speechSynthesis.cancel();
      });
    }
  });
};
