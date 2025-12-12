// Utility to handle PCM Audio Decoding and Playback from Gemini API

let audioContext: AudioContext | null = null;

export const ensureAudioContext = async () => {
  if (!audioContext) {
    // Gemini TTS 2.5 Flash Preview usually returns 24kHz audio
    // We try to set the context to 24kHz, but browsers might enforce hardware rate.
    // That is fine, as we specify 24kHz when creating the buffer.
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass({ sampleRate: 24000 });
  }

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  return audioContext;
};

export const playPCMData = async (base64Data: string): Promise<AudioBufferSourceNode> => {
  const ctx = await ensureAudioContext();
  const SAMPLE_RATE = 24000;

  // 1. Decode Base64 string to binary
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 2. Convert PCM 16-bit integers to Float32
  // The API returns raw 16-bit signed integers (Little Endian)
  const dataInt16 = new Int16Array(bytes.buffer);
  const numChannels = 1;
  const frameCount = dataInt16.length;
  
  // Create buffer with the correct sample rate of the source audio (24kHz)
  // The context will handle resampling if its own rate is different.
  const buffer = ctx.createBuffer(numChannels, frameCount, SAMPLE_RATE);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    // Normalize 16-bit integer (-32768 to 32767) to float (-1.0 to 1.0)
    channelData[i] = dataInt16[i] / 32768.0;
  }

  // 3. Play the buffer
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();

  return source;
};