import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Matter: any;
  }
  const Matter: any;
}

export default function BouncyBallroom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [x, setX] = useState<number>(90);
  const [y, setY] = useState<number>(90);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [photonColor, setPhotonColor] = useState<string>('#EE00FF');
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const engineRef = useRef<any>(null);
  const renderRef = useRef<any>(null);
  const photonsRef = useRef<any[]>([]);

  const changeX = (event: React.ChangeEvent<HTMLInputElement>) => {
    setX(parseFloat(event.target.value));
  };

  const changeY = (event: React.ChangeEvent<HTMLInputElement>) => {
    setY(parseFloat(event.target.value));
  };

  const changeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhotonColor(event.target.value);
  };

  const toggleGenerating = () => {
    setIsGenerating(!isGenerating);
  };

  const startSimulation = () => {
    if (simulationRunning) {
      // Reset the simulation
      if (engineRef.current && renderRef.current) {
        photonsRef.current.forEach((photon) => {
          Matter.World.remove(engineRef.current.world, photon);
        });
        photonsRef.current = [];
      }
      setSimulationRunning(false);
      setIsGenerating(false);
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    } else {
      setSimulationRunning(true);
      setIsGenerating(true); // Start generating immediately
    }
  };

  useEffect(() => {
    const initializeMatter = () => {
      if (typeof Matter !== 'undefined') {
        const { Engine, World, Bodies, Body, Render } = Matter;

        const canvas = canvasRef.current;
        if (!canvas) return;

        engineRef.current = Engine.create();
        engineRef.current.world.gravity.y = 0;

        const render = Render.create({
          canvas: canvas,
          engine: engineRef.current,
          options: {
            width: 800,
            height: 600,
            wireframes: false,
            background: '#dddddd',
          },
        });
        renderRef.current = render;

        const bodyFeatures = {
          isStatic: true,
          friction: 0,
          restitution: 1,
          frictionAir: 0,
          frictionStatic: 1,
          inertia: Infinity,
        };

        const ground = Bodies.rectangle(320, 590, 800, 40, bodyFeatures);
        const ceiling = Bodies.rectangle(480, 10, 800, 40, bodyFeatures);
        const leftWall = Bodies.rectangle(10, 380, 40, 600, bodyFeatures);
        const rightWall = Bodies.rectangle(790, 220, 40, 600, bodyFeatures);

        World.add(engineRef.current.world, [ground, ceiling, leftWall, rightWall]);

        Engine.run(engineRef.current);
        Render.run(render);

        return () => {
          if (intervalIdRef.current) clearInterval(intervalIdRef.current);
          Render.stop(render);
          World.clear(engineRef.current.world);
          Engine.clear(engineRef.current);
        };
      }
    };

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
    script.async = true;
    script.onload = initializeMatter;
    document.head.appendChild(script);

    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (simulationRunning && isGenerating && engineRef.current && typeof Matter !== 'undefined') {
      const { Bodies, Body, World } = Matter;

      const createPhoton = () => {
        const posX = 40;
        const posY = 40;
        const radius = 5;
        const photon = Bodies.circle(posX, posY, radius, {
          friction: 0,
          restitution: 1,
          frictionAir: 0,
          frictionStatic: 1,
          inertia: Infinity,
          render: {
            fillStyle: photonColor,
          },
        });
        const maxValue = .004;
        Body.applyForce(photon, photon.position, { x: x * maxValue / 100, y: y * maxValue / 100 });
        World.add(engineRef.current.world, photon);
        photonsRef.current.push(photon);
      };

      intervalIdRef.current = setInterval(createPhoton, 400);
    } else if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, [simulationRunning, isGenerating, x, y, photonColor]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <div style={{ display: 'flex' }}>
          {/* Vertical Y Slider */}
          <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: 130,
              marginRight: '25px',
              width: '70px'
            }} >
            <label htmlFor="y-slider" style={{ marginBottom: '0px' }}>
              Y: {y.toFixed(4)}
            </label>
            <input
              id="y-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={y}
              onChange={changeY}
              style={{
                width: '200px',
                height: '30px',
                transform: 'rotate(90deg)',
                transformOrigin: 'center',
                marginTop: '100px',
              }}
            />
          </div>

          {/* Main Content Area */}
          <div style={{ position: 'relative' }}>
            {/* Controls above the canvas */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                height: '130px',
              }} >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <label htmlFor="color-picker" style={{ marginRight: '10px' }}>
                  Ball Color:
                </label>
                <input
                  type="color"
                  id="color-picker"
                  value={photonColor}
                  onChange={changeColor}
                  style={{ width: '50px', height: '30px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', gap: '10px' }}>
                <label htmlFor="x-slider" style={{ marginRight: '10px' }}>
                  X: {x.toFixed(4)}
                </label>
                <input
                  id="x-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={x}
                  onChange={changeX}
                  style={{ width: '200px' }}
                />
                {/* Only show generate button if simulation is running */}
                {simulationRunning && (
                  <button
                    onClick={toggleGenerating}
                    style={{
                      border: "none",
                      padding: "10px 20px",
                      fontSize: "1.5rem",
                      cursor: "pointer",
                      outline: "none",
                    }}
                    aria-label={isGenerating ? "Pause Generating" : "Start Generating"}
                  >
                    <i className={`fa-solid ${isGenerating ? "fa-pause" : "fa-play"}`}></i>
                  </button>
                )}
                <button
                  onClick={startSimulation}
                  style={{
                    border: "none",
                    padding: "10px 20px",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    outline: "none",
                  }}
                  aria-label={simulationRunning ? "Restart Simulation" : "Start Simulation"}
                >
                  {simulationRunning ? <i className="fa-solid fa-rotate-right"></i> : "Start"}
                </button>
              </div>
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              id="canvas"
              width="max-width: 100%;"
              height="600"
              style={{ display: 'block', border: '1px solid #000' }}
            ></canvas>
          </div>
        </div>
      </div>
      <style jsx global>{`
        body {
          margin: 0;
          overflow: auto;
        }
        #info {
          position: absolute;
          top: 10px;
          width: 10%;
          text-align: center;
          color: white;
          font-family: Arial, sans-serif;
        }
      `}</style>
    </>
  );
}