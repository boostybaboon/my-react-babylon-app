import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, NullEngine } from '@babylonjs/core';
import '@babylonjs/loaders';
import * as Tone from 'tone';

const BabylonBlockTest: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [scene, setScene] = useState<Scene | null>(null);
    const [engine, setEngine] = useState<Engine | null>(null);

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
        ground.setEnabled(false);

        // Create a cube
        const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
        box.position = new Vector3(-5, 0.5, 0); // Start on the left
        box.setEnabled(false);
        setBox(box);

        engine.runRenderLoop(() => {
            scene.render();
        });

        return () => {
            engine.dispose();
        };
    }, []);

    return (
        <div>
            <canvas ref={canvasRef} style={{ width: 800, height: 600 }} />
        </div>
    );
};

export default BabylonBlockTest;