'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from "lucide-react";

const Slider = ({ value, onValueChange, min, max, step, className, id, children, ...props }: {
    value: number[];
    onValueChange: (value: number[]) => void;
    min: number;
    max: number;
    step: number;
    className?: string;
    id?: string;
    children?: React.ReactNode;
    [key: string]: any;
}) => {
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value, 10);
        setInternalValue([newValue]);
        onValueChange([newValue]);
    };

    return (
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={internalValue[0]}
            onChange={handleChange}
            className={`w-full ${className}`}
            id={id}
            {...props}
        />
    );
};

export default function Spinner() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawingActive, setIsDrawingActive] = useState(false);
    const [drawing, setDrawing] = useState(false);
    const [size, setSize] = useState(10);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [rotationSpeed, setRotationSpeed] = useState<number>(1);
    const [rotation, setRotation] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [cursorPosition, setCursorPosition] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
    const [previousDrawnPosition, setPreviousDrawnPosition] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const toggleDrawingActive = () => {
        setIsDrawingActive(!isDrawingActive);
        setPreviousDrawnPosition({ x: null, y: null });
        if (!isDrawingActive && canvasRef.current && cursorPosition.x !== null && cursorPosition.y !== null) {
            const transformed = getTransformedCoordinates({ clientX: cursorPosition.x, clientY: cursorPosition.y });
            setPreviousDrawnPosition(transformed);
        }
    };

    // Unified coordinate transformation function
    const getTransformedCoordinates = (event: { clientX: number; clientY: number }) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const relativeX = event.clientX - rect.left;
        const relativeY = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const translatedX = relativeX - centerX;
        const translatedY = relativeY - centerY;

        const rotationRadians = rotation * Math.PI / 180;
        const angleRad = -rotationRadians; // Inverse rotation
        const cosAngle = Math.cos(angleRad);
        const sinAngle = Math.sin(angleRad);

        const unrotatedX = translatedX * cosAngle - translatedY * sinAngle;
        const unrotatedY = translatedX * sinAngle + translatedY * cosAngle;

        const finalX = unrotatedX + centerX;
        const finalY = unrotatedY + centerY;

        return { x: finalX, y: finalY };
    };

    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            setRotation(prevRotation => prevRotation + (isPlaying ? rotationSpeed : 0.5));
            animationFrameId = requestAnimationFrame(animate);

            if (isDrawingActive && context && canvasRef.current && cursorPosition.x !== null && cursorPosition.y !== null) {
                const transformedCursor = getTransformedCoordinates({ clientX: cursorPosition.x, clientY: cursorPosition.y });

                if (previousDrawnPosition.x === null || previousDrawnPosition.y === null) {
                    setPreviousDrawnPosition(transformedCursor);
                } else {
                    context.beginPath();
                    context.moveTo(previousDrawnPosition.x, previousDrawnPosition.y);
                    context.lineTo(transformedCursor.x, transformedCursor.y);
                    context.lineWidth = size;
                    context.strokeStyle = '#000';
                    context.lineCap = 'round';
                    context.stroke();
                    setPreviousDrawnPosition(transformedCursor);
                }
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [rotationSpeed, isPlaying, isDrawingActive, context, size, cursorPosition, previousDrawnPosition]);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                setContext(ctx);
            }
        }
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length > 0) {
            setCursorPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!context || !canvasRef.current) return;
        setDrawing(true);
        context.beginPath();

        let clientX: number, clientY: number;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const transformed = getTransformedCoordinates({ clientX, clientY });
        context.moveTo(transformed.x, transformed.y);
        setPreviousDrawnPosition(transformed);
        e.preventDefault();
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!drawing || !context || !canvasRef.current) return;

        let clientX: number, clientY: number;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const transformed = getTransformedCoordinates({ clientX, clientY });
        context.lineTo(transformed.x, transformed.y);
        context.lineWidth = size;
        context.strokeStyle = '#000';
        context.lineCap = 'round';
        context.stroke();
        setPreviousDrawnPosition(transformed);
        e.preventDefault();
    };

    const stopDrawing = () => {
        setDrawing(false);
        if (context) {
            context.closePath();
        }
    };

    const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRotationSpeed(parseFloat(event.target.value));
    };

    return (
        <div className='flex flex-col items-center justify-start min-h-screen py-2' onMouseMove={handleMouseMove} onTouchMove={handleTouchMove}>
            <h2 className='text-2xl font-bold mb-4'>Canvas Drawing App</h2>
            <div style={{ position: 'relative' }}>
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="border border-gray-300 rounded-full bg-white touch-none"
                    style={{
                        borderRadius: '50%',
                        transform: `rotate(${rotation}deg)`,
                        transition: 'transform 0.1s linear',
                    }}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                />
            </div>
            <div className="mt-4 w-full max-w-md">
                <label htmlFor="size-slider" className="block text-sm font-medium text-gray-700">
                    Size: {size}
                </label>
                <Slider
                    id="size-slider"
                    min={1}
                    max={50}
                    step={1}
                    value={[size]}
                    onValueChange={(value) => setSize(value[0])}
                    className="mt-2"
                />
            </div>
            <div className="flex items-center gap-4 mt-6">
                <button
                    onClick={handlePlayPause}
                    className="bg-white/20 text-white hover:bg-white/30 border border-white/20 px-4 py-2 rounded-md"
                >
                    {isPlaying ? (
                        <>
                            <Pause className="mr-2 h-4 w-4 inline-block" /> Pause
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 h-4 w-4 inline-block" /> Play
                        </>
                    )}
                </button>
                <div className="flex-1">
                    <label htmlFor="speed-slider" className="block text-sm font-medium text-gray-200 mb-2">
                        Rotation Speed: {rotationSpeed.toFixed(1)}x
                    </label>
                    <input
                        type="range"
                        id="speed-slider"
                        defaultValue="1"
                        max="5"
                        min="0.1"
                        step="0.1"
                        onChange={handleSpeedChange}
                        className="w-full"
                    />
                </div>
            </div>
            <button onClick={toggleDrawingActive} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                {isDrawingActive ? 'Stop Continuous Draw' : 'Start Continuous Draw'}
            </button>
        </div>
    );
}