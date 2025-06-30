import React, { useState, useEffect } from "react";

const AroundThePole: React.FC = () => {
  const [angle, setAngle] = useState<number>(0);
  const [direction, setDirection] = useState<"clockwise" | "counter-clockwise">("clockwise");
  const [circleColor, setCircleColor] = useState<string>("black");

  // Constants for the elliptical path
  const horizontalRadius: number = 100;
  const verticalRadius: number = 60;

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAngle((prevAngle) => {
        return (prevAngle + 2) % 360;
      });
    }, 20);

    return () => clearInterval(animationInterval);
  }, [direction]);

  const rectangleWidth: string = "100px";
  const rectangleHeight: string = "150px";

  const upperRectangleStyle: React.CSSProperties = {
    backgroundColor: "black",
    width: rectangleWidth,
    height: rectangleHeight,
    margin: "0 auto",
    borderTopLeftRadius: "0",
    borderTopRightRadius: "0",
    position: "relative",
    zIndex: direction === "clockwise" ? 2 : 0,
  };

  const lowerRectangleStyle: React.CSSProperties = {
    backgroundColor: "black",
    width: rectangleWidth,
    height: rectangleHeight,
    margin: "0 auto",
    marginTop: "0",
    borderBottomLeftRadius: "0",
    borderBottomRightRadius: "0",
    position: "relative",
    zIndex: direction === "counter-clockwise" ? 2 : 0,
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "70vh",
    position: "relative",
    overflow: "hidden",
  };

  // Calculate position on elliptical path
  const radians: number = (angle * Math.PI) / 180;
  const x: number = horizontalRadius * Math.cos(radians);
  const y: number = verticalRadius * Math.sin(radians);

  // Ensure the circle stays between the ellipses by adjusting the vertical position
  // when it's at the junction of the rectangles
  const adjustedY: number = y;

  const circleStyle: React.CSSProperties = {
    backgroundColor: circleColor,
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    position: "absolute",
    top: `calc(50% + ${adjustedY}px)`,
    left: `calc(50% + ${x}px)`,
    transform: "translate(-50%, -50%)",
    zIndex: 1,
  };

  const ellipseHeight: string = "20px";

  const topEllipseStyle: React.CSSProperties = {
    width: rectangleWidth,
    height: ellipseHeight,
    backgroundColor: "gray",
    borderRadius: "100% / 100%",
    position: "absolute",
    top: "0",
    left: "0",
    transform: "translateY(-50%)",
  };

  const bottomEllipseStyle: React.CSSProperties = {
    width: rectangleWidth,
    height: ellipseHeight,
    backgroundColor: "black",
    borderRadius: "100% / 100%",
    position: "absolute",
    bottom: "0",
    left: "0",
    transform: "translateY(50%)",
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 16px",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const handleClockwise = (): void => {
    setDirection("clockwise");
    setCircleColor("#f5f");
  };

  const handleReset = (): void => {
    setCircleColor("black");
  };

  const handleCounterClockwise = (): void => {
    setDirection("counter-clockwise");
    setCircleColor("#f5f");
  };

  return (
    <div>
      <h2 className="text-center mt-8 text-2xl">
        Clockwise or Counter-Clockwise?
      </h2>
      <div style={containerStyle}>
        <div style={upperRectangleStyle}>
          <div style={topEllipseStyle}></div>
        </div>
        <div style={lowerRectangleStyle}>
          <div style={bottomEllipseStyle}></div>
        </div>
        <div style={circleStyle}></div>
      </div>
      <div style={buttonContainerStyle}>
        <button style={buttonStyle} onClick={handleClockwise}>
          Clockwise
        </button>
        <button style={buttonStyle} onClick={handleReset}>
          Reset
        </button>
        <button style={buttonStyle} onClick={handleCounterClockwise}>
          Counter-Clockwise
        </button>
      </div>
    </div>
  );
};

export default AroundThePole;