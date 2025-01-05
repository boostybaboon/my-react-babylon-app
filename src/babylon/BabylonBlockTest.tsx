import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, StandardMaterial } from '@babylonjs/core';
import '@babylonjs/loaders';
import * as Tone from 'tone';

const BabylonBlockTest: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [scene, setScene] = useState<Scene | null>(null);
    const [engine, setEngine] = useState<Engine | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [box, setBox] = useState<any>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = new Engine(canvas, true);
        setEngine(engine);
        const scene = new Scene(engine);
        setScene(scene);

        const camera = new ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        const light = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        light.intensity = 0.7;

        // Create a flat plane
        const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

        // Create a cube
        const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
        box.position = new Vector3(-5, 0.5, 0); // Start on the left
        setBox(box);

        engine.runRenderLoop(() => {
            scene.render();
        });

        return () => {
            engine.dispose();
        };
    }, []);

    const handlePlayPause = () => {
        if (isPlaying) {
            Tone.Transport.pause();
        } else {
            Tone.Transport.start();
        }
        setIsPlaying(!isPlaying);
    };

    const handleRewind = () => {
        setCurrentTime(0);
        Tone.Transport.stop();
        Tone.Transport.seconds = 0;
        if (box) {
            box.position.x = -5; // Reset position
        }
        setIsPlaying(false);
    };

    const handleSliderChange = (value: number) => {
        setCurrentTime(value);
        Tone.Transport.seconds = value;
        if (box) {
            box.position.x = -5 + (10 * value) / 10; // Update position based on slider
        }
    };

    useEffect(() => {
        const updatePosition = (time: number) => {
            setCurrentTime(time);
            if (box) {
                box.position.x = -5 + (10 * time) / 10; // Update position based on time
            }
        };

        Tone.Transport.scheduleRepeat((time) => {
            updatePosition(Tone.Transport.seconds);
        }, "0.0333"); // Approximately 30fps

        return () => {
            Tone.Transport.cancel();
        };
    }, [box]);

    return (
        <div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '80vh' }} />
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button onClick={handleRewind}>REWIND</button>
                <button onClick={handlePlayPause}>{isPlaying ? 'PAUSE' : 'PLAY'}</button>
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.01"
                    value={currentTime}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                />
                <div>Current Time: {currentTime.toFixed(2)}s</div>
            </div>
        </div>
    );
};

export default BabylonBlockTest;