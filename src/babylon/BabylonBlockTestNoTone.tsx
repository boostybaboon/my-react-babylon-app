import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders';

const BabylonBlockTestNoTone: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [scene, setScene] = useState<Scene | null>(null);
    const [engine, setEngine] = useState<Engine | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [box, setBox] = useState<any>(null);
    const duration = 10; // Duration of the animation in seconds
    const lastUpdateTimeRef = useRef<number | null>(null);
    const currentTimeRef = useRef<number>(0);

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
            if (isPlaying) {
                const now = performance.now();
                if (lastUpdateTimeRef.current !== null) {
                    const deltaTime = (now - lastUpdateTimeRef.current) / 1000;
                    currentTimeRef.current += deltaTime;
                    if (currentTimeRef.current <= duration) {
                        box.position.x = -5 + (10 * currentTimeRef.current) / duration; // Update position based on time
                    } else {
                        setIsPlaying(false);
                    }
                }
                lastUpdateTimeRef.current = now;
            } else {
                lastUpdateTimeRef.current = null;
            }
        });

        return () => {
            engine.dispose();
        };
    }, [isPlaying]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying) {
            lastUpdateTimeRef.current = performance.now();
        }
    };

    const handleRewind = () => {
        currentTimeRef.current = 0;
        if (box) {
            box.position.x = -5; // Reset position
        }
        setIsPlaying(false);
        lastUpdateTimeRef.current = null;
    };

    return (
        <div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '80vh' }} />
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button onClick={handleRewind}>REWIND</button>
                <button onClick={handlePlayPause}>{isPlaying ? 'PAUSE' : 'PLAY'}</button>
            </div>
        </div>
    );
};

export default BabylonBlockTestNoTone;