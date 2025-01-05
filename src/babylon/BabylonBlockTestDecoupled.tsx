import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, Mesh } from '@babylonjs/core';
import '@babylonjs/loaders';
import * as Tone from 'tone';
import { Model } from '../api/model';

const BabylonBlockTest: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [ground, setGround] = useState<Mesh | null>(null);
    const [box, setBox] = useState<Mesh | null>(null);
    const [model, setModel] = useState<Model | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [queryResult, setQueryResult] = useState<any>(null);
    const eventsRef = useRef<Tone.ToneEvent[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);

        const camera = new ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        const light = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        light.intensity = 0.7;

        // Create a flat plane
        const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
        ground.setEnabled(false);
        setGround(ground);

        // Create a cube
        const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
        box.setEnabled(false);
        setBox(box);

        const model = new Model();
        setModel(model);

        engine.runRenderLoop(() => {
            scene.render();
        });

        return () => {
            eventsRef.current.forEach(event => event.dispose());
            engine.dispose();
        };
    }, []);

    // I am very suspicious of this useEffect, as it supposes
    // that model will never change after it is set... works ok
    // for this example though
    useEffect(() => {
        if (model) {
            handleSliderChange(currentTime);
        }
    }, [model]);

    const handleSliderChange = (value: number) => {
        setCurrentTime(value);
        if (model) {
            const result = model.queryAtTime(value);
            setQueryResult(result);
            if (box) {
                if (result.actingState.enabled) {
                    box.setEnabled(true);
                    box.position = new Vector3(result.actingState.position.x, result.actingState.position.y, result.actingState.position.z);
                } else {
                    box.setEnabled(false);
                }
            }
            if (ground) {
                ground.setEnabled(result.stagingState);
            }

            // Dispose of previous events
            eventsRef.current.forEach(event => event.dispose());
            eventsRef.current = [];

            // Create new Tone.js events for staging directions
            result.stagingSequence.forEach(direction => {
                const event = new Tone.ToneEvent((time) => {
                    // Handle staging direction event
                    console.log(`Staging direction event at time ${time}:`, direction);
                }).start(direction.startTime);
                eventsRef.current.push(event);
            });

            // Create new Tone.js events for acting directions
            result.actingSequence.forEach(direction => {
                const event = new Tone.ToneEvent((time) => {
                    // Handle acting direction event
                    console.log(`Acting direction event at time ${time}:`, direction);
                }).start(direction.startTime);
                eventsRef.current.push(event);
            });
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <div>
                <canvas ref={canvasRef} style={{ width: 800, height: 600 }} />
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.01"
                        value={currentTime}
                        onChange={(e) => handleSliderChange(Number(e.target.value))}
                    />
                    <span>{currentTime.toFixed(2)}</span>
                </div>
            </div>
            <div style={{ textAlign: 'left', marginLeft: '20px' }}>
                <pre>{JSON.stringify(queryResult, null, 2)}</pre>
            </div>
        </div>
    );
};

export default BabylonBlockTest;