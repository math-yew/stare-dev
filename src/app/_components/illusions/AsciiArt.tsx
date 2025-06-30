// pages/AsciiArt.tsx
import { useEffect, useReducer, useMemo, useState, Suspense } from 'react';
import DragAndDropUploader from '../DragAndDropUploader'; // Import the new component

const defaultChars =
  "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

interface AsciiState {
  charDensities: { [key: string]: number };
  imageData: ImageData | null;
  asciiArt: string;
}

type AsciiAction =
  | { type: 'SET_DENSITIES'; payload: { [key: string]: number } }
  | { type: 'SET_IMAGE'; payload: ImageData }
  | { type: 'SET_ASCII'; payload: string };

const asciiReducer = (state: AsciiState, action: AsciiAction): AsciiState => {
  switch (action.type) {
    case 'SET_DENSITIES':
      return { ...state, charDensities: action.payload };
    case 'SET_IMAGE':
      return { ...state, imageData: action.payload };
    case 'SET_ASCII':
      return { ...state, asciiArt: action.payload };
    default:
      return state;
  }
};

export default function AsciiArt() {
  const [charMode, setCharMode] = useState<'default' | 'custom'>('default');
  const [customChars, setCustomChars] = useState<string>('');
  const [width, setWidth] = useState<number>(200);
  const [image, setImage] = useState<File | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false); // State for loading indicator for download

  const [state, dispatch] = useReducer(asciiReducer, {
    charDensities: {},
    imageData: null,
    asciiArt: '',
  });

  const charsToUse = useMemo(
    () => (charMode === 'default' ? defaultChars : customChars),
    [charMode, customChars]
  );

  // Calculate character densities
  useEffect(() => {
    const calculateDensities = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 12; // Approximate width of Courier New character
      canvas.height = 16; // Approximate height
      ctx.font = '16px Courier New';
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'top';

      const densities: { [key: string]: number } = {};
      for (const char of charsToUse) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText(char, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const darkPixels = data.reduce(
          (sum, val, i) => (i % 4 === 0 && val > 0 ? sum + 1 : sum),
          0
        );
        densities[char] = darkPixels / (canvas.width * canvas.height);
      }
      dispatch({ type: 'SET_DENSITIES', payload: densities });
    };
    calculateDensities();
  }, [charsToUse]);

  // Process uploaded image
  useEffect(() => {
    if (!image || !Object.keys(state.charDensities).length) return;

    const processImage = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = URL.createObjectURL(image);

      await new Promise((resolve) => (img.onload = resolve));
      const aspectRatio = img.height / img.width;
      canvas.width = width;
      canvas.height = Math.round(width * aspectRatio);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to grayscale
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);
      dispatch({ type: 'SET_IMAGE', payload: imageData });
    };
    processImage();
  }, [image, width, state.charDensities]);

  // Generate ASCII art
  useEffect(() => {
    if (!state.imageData || !Object.keys(state.charDensities).length) return;

    const generateAscii = () => {
      const { data, width, height } = state.imageData!;
      const sortedChars = Object.entries(state.charDensities)
        .sort(([, a], [, b]) => b - a)
        .map(([char]) => char);
      const minDensity = Math.min(...Object.values(state.charDensities));
      const maxDensity = Math.max(...Object.values(state.charDensities));

      let ascii = '';
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const intensity = data[i] / 255;
          const charIndex = Math.round(
            ((1 - intensity) *
              (sortedChars.length - 1) *
              (maxDensity - minDensity)) /
              (maxDensity - minDensity)
          );
          ascii += sortedChars[charIndex] || ' ';
        }
        ascii += '\n';
      }
      dispatch({ type: 'SET_ASCII', payload: ascii });
    };
    generateAscii();
  }, [state.imageData, state.charDensities]);

  const changeCharactersWide = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) value = 1;
    if (value > 300) value = 300;
    setWidth(Math.max(1, value));
  };

  /**
   * Handles the download of the ASCII art as a JPG image.
   * It creates a temporary canvas, draws the ASCII art onto it with
   * the specified font styles, and then converts the canvas to a JPG
   * data URL for download.
   */
  const downloadAsciiArt = () => {
    if (!state.asciiArt) return;

    setIsGeneratingImage(true); // Set loading state

    const lines = state.asciiArt.split('\n').filter(line => line.length > 0);
    if (lines.length === 0) {
      setIsGeneratingImage(false);
      return;
    }

    // Create a temporary offscreen canvas for rendering
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (!offscreenCtx) {
      setIsGeneratingImage(false);
      return;
    }

    // Define the font styles exactly as used in the display div
    const fontFamily = "Courier New, monospace";
    const fontSize = 10; // px
    const lineHeightRatio = 0.9;
    const letterSpacingEm = 0.28;

    offscreenCtx.font = `${fontSize}px ${fontFamily}`;
    offscreenCtx.textBaseline = 'top';

    // Measure base character width for a monospaced font
    const baseCharWidth = offscreenCtx.measureText('M').width;
    // Calculate letter spacing in pixels
    const letterSpacingPx = fontSize * letterSpacingEm;

    // Calculate the total pixel dimensions for the canvas
    const maxLineLength = Math.max(...lines.map(line => line.length));
    const canvasWidth = maxLineLength * baseCharWidth + (maxLineLength > 0 ? (maxLineLength - 1) * letterSpacingPx : 0);
    const charHeight = fontSize * lineHeightRatio;
    const canvasHeight = lines.length * charHeight;

    offscreenCanvas.width = canvasWidth;
    offscreenCanvas.height = canvasHeight;

    // Fill background with black
    offscreenCtx.fillStyle = 'black';
    offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    // Set text color to white
    offscreenCtx.fillStyle = 'white';

    // Draw each character manually to account for letter-spacing
    let currentY = 0;
    for (const line of lines) {
        let currentX = 0;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            offscreenCtx.fillText(char, currentX, currentY);
            // Advance X by character width + letter spacing
            currentX += baseCharWidth + letterSpacingPx;
        }
        currentY += charHeight; // Move to the next line
    }

    // Convert to JPG and trigger download
    const dataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'ascii-art.jpg';
    document.body.appendChild(link); // Temporarily append to body
    link.click(); // Programmatically click the link
    document.body.removeChild(link); // Clean up

    setIsGeneratingImage(false); // Reset loading state
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h1 className="text-2xl text-center font-bold mb-4">
            ASCII Art Maker
          </h1>
          
            {/* Image Upload using DragAndDropUploader */}
            <div className="md:mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <DragAndDropUploader
                onFileChange={setImage}
                acceptedFileTypes="image/*"
                label="Drop image here, or click to select"
              />
              {/* Original Image Preview */}
              {image && (
                <div className="mt-4">
                  <h2 className="text-lg text-center font-semibold mb-2">
                    Original Image
                  </h2>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Uploaded"
                    className="max-w-full h-auto max-h-64 mx-auto"
                  />
                </div>
              )}
            </div>
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              {/* Character Selection */}
              <div className="flex flex-row">
                <label className="flex items-center space-x-2">
                    <span className="items-center">Use all keyboard characters</span>
                    <input
                        type="radio"
                        name="charMode"
                        value="default"
                        checked={charMode === 'default'}
                        onChange={() => setCharMode('default')}
                        className="form-radio"
                    />
                </label>
                <div>

                <label className="flex items-center justify-between space-x-2">
                    <span className="items-center">Use custom characters</span> 
                    <input
                        type="radio"
                        name="charMode"
                        value="custom"
                        checked={charMode === 'custom'}
                        onChange={() => setCharMode('custom')}
                        className="form-radio"
                        />
                </label>
                {charMode === 'custom' && (
                    <textarea
                    value={customChars}
                    onChange={(e) => setCustomChars(e.target.value)}
                    placeholder="Enter custom characters"
                    className="w-full mt-2 p-2 border rounded-md"
                    />
                )}
                </div>
              </div>

              {/* Width Input */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Characters Wide
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => changeCharactersWide(e)}
                  min="1"
                  max="300"
                  className="mt-1 block w-24 p-2 border rounded-md"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ASCII Art Display */}
        <Suspense
          fallback={<div className="text-center">Generating ASCII Art...</div>}
        >
          {state.asciiArt && (
            <div className="bg-white p-4 rounded-lg shadow-xl">
              {/* Zoom Control */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Zoom: {zoom.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div
                className="w-full overflow-auto"
                style={{ maxHeight: '80vh' }}
              >
                <div
                  className="w-fit h-fit p-1"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <div
                    className="w-fit h-fit p-4"
                    style={{
                      minWidth: '100%',
                      fontFamily: 'Courier New, monospace',
                      color: 'white',
                      whiteSpace: 'pre',
                      lineHeight: '.9',
                      fontSize: '10px',
                      letterSpacing: '.28em',
                      backgroundColor: 'black',
                    }}
                  >
                    {state.asciiArt}
                  </div>
                </div>
              </div>
              {/* Download Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={downloadAsciiArt}
                  disabled={isGeneratingImage || !state.asciiArt}
                  className={`px-6 py-3 rounded-lg shadow-md font-semibold text-lg
                              ${isGeneratingImage || !state.asciiArt
                                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'}`}
                >
                  {isGeneratingImage ? 'Generating Image...' : 'Download JPG'}
                </button>
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}