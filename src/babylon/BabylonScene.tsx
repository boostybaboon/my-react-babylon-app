import React, { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder } from '@babylonjs/core';
import '@babylonjs/loaders';

const BabylonScene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);

        const camera = new ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        const light = new HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
        light.intensity = 0.7;

        const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
        sphere.position.y = 1;

        engine.runRenderLoop(() => {
            scene.render();
        });

        return () => {
            engine.dispose();
        };
    }, []);

    return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default BabylonScene;