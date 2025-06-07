import React, { useState, useEffect } from "react";

export default function MullerLyer() {
  const baseLength = 200;

  // Type for the function that generates lengths
  const generateLength = (): number =>
    Math.round(
      baseLength * (0.9 + (Math.round(Math.random() * 10) / 10) * 0.2)
    );

  // Define types for state variables
  type GameState = "guessing" | "feedback";
  type Guess = "left" | "right" | "same" | null;

  const [leftLength, setLeftLength] = useState<number>(generateLength());
  const [rightLength, setRightLength] = useState<number>(generateLength());
  const [gameState, setGameState] = useState<GameState>("guessing");
  const [guess, setGuess] = useState<Guess>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const handleGuess = (choice: "left" | "right" | "same"): void => {
    setGuess(choice);
    setGameState("feedback");
    setShowFeedback(true);
  };

  const resetGame = (): void => {
    setTimeout(() => {
      setLeftLength(generateLength());
      setRightLength(generateLength());
      setGuess(null);
    }, 1000);
    setGameState("guessing");
    setShowFeedback(false);
  };

  const isCorrect = (): boolean => {
    if (leftLength > rightLength) return guess === "left";
    if (rightLength > leftLength) return guess === "right";
    return guess === "same";
  };

  const arrowSize = 40;
  const gap = 50;
  let leftX = 100;
  let rightX = leftX + baseLength + gap;
  const y = 50;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Which line is longer?</h1>
      <svg
        width="600px"
        height="275"
        className="mb-4"
        style={{ transform: "scale(.7)" }}
      >
        {/* Left Line with Outward Arrows */}
        <line
          x1={leftX}
          y1={y}
          x2={leftX + leftLength}
          y2={y}
          stroke="black"
          strokeWidth="2"
          className={`${
            gameState === "feedback" && leftLength >= rightLength
              ? "animate-pulse"
              : ""
          }`}
          style={{
            animation:
              gameState === "feedback" && leftLength >= rightLength
                ? "pulse 1s infinite"
                : "none",
            transformOrigin: `${leftX + leftLength}px ${y}px`,
            transform:
              gameState === "feedback" ? "rotate(-90deg)" : "rotate(0deg)",
            transition: "transform 1s ease-in-out",
          }}
        />
        <line
          x1={leftX}
          y1={y}
          x2={leftX - arrowSize}
          y2={y - arrowSize}
          stroke="black"
          strokeWidth="2"
        />
        <line
          x1={leftX}
          y1={y}
          x2={leftX - arrowSize}
          y2={y + arrowSize}
          stroke="black"
          strokeWidth="2"
        />
        <line
          x1={leftX + leftLength}
          y1={y}
          x2={leftX + leftLength + arrowSize}
          y2={y - arrowSize}
          stroke="black"
          strokeWidth="2"
        />
        <line
          x1={leftX + leftLength}
          y1={y}
          x2={leftX + leftLength + arrowSize}
          y2={y + arrowSize}
          stroke="black"
          strokeWidth="2"
        />

        {/* Right Line with Inward Arrows */}
        <line
          x1={rightX}
          y1={y}
          x2={rightX + rightLength}
          y2={y}
          stroke="black"
          strokeWidth="2"
          className={`${
            gameState === "feedback" && rightLength >= leftLength
              ? "animate-pulse"
              : ""
          }`}
          style={{
            animation:
              gameState === "feedback" && rightLength >= leftLength
                ? "pulse 1s infinite"
                : "none",
            transformOrigin: `${rightX}px ${y}px`,
            transform:
              gameState === "feedback" ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 1s ease-in-out",
          }}
        />
        <line
          x1={rightX}
          y1={y}
          x2={rightX + arrowSize}
          y2={y - arrowSize}
          stroke="black"
          strokeWidth="2"
        />
        <line
          x1={rightX}
          y1={y}
          x2={rightX + arrowSize}
          y2={y + arrowSize}
          stroke="black"
          strokeWidth="2"
        />
        <line
          x1={rightX + rightLength}
          y1={y}
          x2={rightX + rightLength - arrowSize}
          y2={y - arrowSize}
          stroke="black"
          strokeWidth="2"
        />
        <line
          x1={rightX + rightLength}
          y1={y}
          x2={rightX + rightLength - arrowSize}
          y2={y + arrowSize}
          stroke="black"
          strokeWidth="2"
        />

        {/* Comparison Line */}
        {showFeedback && (
          <line
            x1={0}
            y1={y + Math.max(leftLength, rightLength)}
            x2="100%"
            y2={y + Math.max(leftLength, rightLength)}
            stroke="#00aa00dd"
            strokeWidth="2"
            strokeDasharray="5,3"
          />
        )}
      </svg>

      <div className="flex space-x-8 mb-8">
        <button
          onClick={() => handleGuess("left")}
          disabled={gameState === "feedback"}
          className={`px-4 py-2 border-2 rounded ${
            guess === "left"
              ? isCorrect()
                ? "border-green-500"
                : "border-red-500"
              : "border-gray-300"
          } hover:bg-gray-200 disabled:opacity-50`}
          aria-label="Guess left line is longer"
          style={{ width: "90px" }}
        >
          Left
        </button>
        <button
          onClick={() => handleGuess("same")}
          disabled={gameState === "feedback"}
          className={`px-4 py-2 border-2 rounded ${
            guess === "same"
              ? isCorrect()
                ? "border-green-500"
                : "border-red-500"
              : "border-gray-300"
          } hover:bg-gray-200 disabled:opacity-50`}
          aria-label="Guess lines are the same length"
          style={{ width: "90px" }}
        >
          Same
        </button>
        <button
          onClick={() => handleGuess("right")}
          disabled={gameState === "feedback"}
          className={`px-4 py-2 border-2 rounded ${
            guess === "right"
              ? isCorrect()
                ? "border-green-500"
                : "border-red-500"
              : "border-gray-300"
          } hover:bg-gray-200 disabled:opacity-50`}
          aria-label="Guess right line is longer"
          style={{ width: "90px" }}
        >
          Right
        </button>
      </div>

      <button
        onClick={resetGame}
        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        aria-label="Reset game and try again"
      >
        Try Again
      </button>

      <style>{`
        @keyframes pulse {
          0% { stroke: black; }
          40% { stroke: #55ff00 }
          100% { stroke: black; }
        }
      `}</style>
    </div>
  );
}