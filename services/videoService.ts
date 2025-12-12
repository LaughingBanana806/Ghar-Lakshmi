import { GoogleGenAI } from "@google/genai";

export const generateConceptVideo = async (concept: string, analogy: string): Promise<string> => {
  // Always create a new instance to capture the latest API key from the environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Create a descriptive prompt for the video generation
  const prompt = `A cinematic, high-quality, animated educational video explaining the concept of "${concept}". 
  The visual style should be colorful, vibrant, and inspired by Indian art. 
  Depict this analogy visually: ${analogy}. 
  The video should be clear, engaging, and suitable for a financial literacy app. Aspect ratio 16:9.`;

  // Start the video generation operation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  // Poll for completion
  while (!operation.done) {
    // Wait for 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  // Get the video URI
  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!videoUri) {
    throw new Error("Video generation completed but no video URI was returned.");
  }

  // Fetch the actual video content using the URI and API Key
  const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  
  if (!response.ok) {
    throw new Error("Failed to download the generated video.");
  }

  // Convert to Blob and create a local URL
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateSchemeVideo = async (schemeName: string, steps: string[] = []): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const stepsContext = steps.length > 0 
    ? `The video must visually demonstrate these specific application steps in order: ${steps.map((s, i) => `${i+1}. ${s}`).join(' ')}.`
    : "Show the general application process step-by-step.";

  const prompt = `A clear, step-by-step instructional animation explaining exactly how to apply for the "${schemeName}" government scheme in India. 
  ${stepsContext}
  Show scenes of an Indian citizen performing these actions (e.g. filling a specific form, visiting a Common Service Centre, or using a mobile app). 
  The style should be friendly, clear, and illustrative public service announcement. Aspect ratio 16:9.`;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!videoUri) {
    throw new Error("Video generation completed but no video URI was returned.");
  }

  const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  if (!response.ok) throw new Error("Failed to download video.");

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};