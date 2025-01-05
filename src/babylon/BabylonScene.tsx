import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Texture, SceneLoader, Animation, AnimationGroup } from '@babylonjs/core';
import '@babylonjs/loaders';
import * as Tone from 'tone';

const BabylonScene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [scene, setScene] = useState<Scene | null>(null);
    const [engine, setEngine] = useState<Engine | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [hero, setHero] = useState<any>(null);
    const [walkAnim, setWalkAnim] = useState<AnimationGroup | null>(null);
    const [sambaAnim, setSambaAnim] = useState<AnimationGroup | null>(null);
    const [idleAnim, setIdleAnim] = useState<AnimationGroup | null>(null);

    // Define animations outside of useEffect to make them accessible in handleRewind
    const walkToMiddle = new Animation("walkToMiddle", "position.x", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    walkToMiddle.setKeys([
        { frame: 0, value: -5 },
        { frame: 150, value: 0 }
    ]);

    const walkOffRight = new Animation("walkOffRight", "position.x", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    walkOffRight.setKeys([
        { frame: 0, value: 0 },
        { frame: 150, value: 5 }
    ]);

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

        // Create a rectangular stage
        const stage = MeshBuilder.CreateGround("stage", { width: 10, height: 10 }, scene);

        // Create a grid material
        const gridMaterial = new StandardMaterial("gridMaterial", scene);
        gridMaterial.diffuseTexture = new Texture("https://playground.babylonjs.com/textures/ground.jpg", scene);
        stage.material = gridMaterial;

        // Load the humanoid model
        SceneLoader.ImportMesh("", "https://assets.babylonjs.com/meshes/", "HVGirl.glb", scene, (meshes, particleSystems, skeletons, animationGroups) => {
            console.log("Model loaded");
            const hero = meshes[0];
            hero.position = new Vector3(-5, 0, 0); // Start on the left
            hero.scaling.scaleInPlace(0.1);
            setHero(hero);

            // Lock camera on the character's position
            camera.target = hero.position;

            // Get animations
            const walkAnim = scene.getAnimationGroupByName("Walking");
            const sambaAnim = scene.getAnimationGroupByName("Samba");
            const idleAnim = scene.getAnimationGroupByName("Idle");

            console.log("Animations loaded:", { walkAnim, sambaAnim, idleAnim });

            setWalkAnim(walkAnim);
            setSambaAnim(sambaAnim);
            setIdleAnim(idleAnim);

            if (walkAnim && sambaAnim && idleAnim) {
                // Define event actions
                const eventActions: { [key: string]: () => void } = {
                    idleStart: () => {
                        console.log("Starting idle animation");
                        idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false);
                    },
                    idleStop: () => {
                        console.log("Stopping idle animation");
                        idleAnim.stop();
                    },
                    walkStart: () => {
                        console.log("Starting walk animation");
                        walkAnim.start(true, 1.0, walkAnim.from, walkAnim.to, false);
                        scene.beginDirectAnimation(hero, [walkToMiddle], 0, 150, false, 1, () => {
                            console.log("Walk animation finished");
                            walkAnim.stop();
                        });
                    },
                    sambaStart: () => {
                        console.log("Starting samba animation");
                        idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false);
                        hero.rotation.y = Math.PI / 2; // Face the front
                        sambaAnim.start(false, 1.0, sambaAnim.from, sambaAnim.to, false);
                    },
                    sambaStop: () => {
                        console.log("Stopping samba animation");
                        sambaAnim.stop();
                    },
                    walkOffStart: () => {
                        console.log("Starting walk off animation");
                        walkAnim.start(true, 1.0, walkAnim.from, walkAnim.to, false);
                        scene.beginDirectAnimation(hero, [walkOffRight], 0, 150, false, 1, () => {
                            console.log("Walk off animation finished");
                            walkAnim.stop();
                            idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false);
                        });
                    }
                };

                // Start the animation sequence
                startAnimationSequence(eventActions);
            } else {
                console.error("Animations not found");
            }
        });

        engine.runRenderLoop(() => {
            scene.render();
        });

        return () => {
            engine.dispose();
        };
    }, []);

    const addEventToTimeline = (part: Tone.Part<{ time: number; event: string }>, time: number, event: string) => {
        part.add(time, { time, event });
    };

    const startAnimationSequence = (eventActions: { [key: string]: () => void }) => {
        // Create a Tone.js part
        const part = new Tone.Part<{ time: number; event: string }>(
            (time, step) => {
                const event = step.event;
                console.log("Triggering event:", event);
                if (eventActions[event]) {
                    eventActions[event]();
                } else {
                    console.error("Event action not found for:", event);
                }
            },
            []
        );

        // Add hardcoded events to the timeline
        addEventToTimeline(part, 0, 'idleStart'); // Idle at the start
        addEventToTimeline(part, 2, 'idleStop');  // Stop idling after 2 seconds
        addEventToTimeline(part, 2, 'walkStart'); // Start walking to the center
        addEventToTimeline(part, 7, 'sambaStart'); // Start dancing samba after reaching the center
        addEventToTimeline(part, 10, 'sambaStop'); // Stop dancing samba after 3 seconds
        addEventToTimeline(part, 10, 'walkOffStart'); // Start walking off to the right
        addEventToTimeline(part, 15, 'idleStart'); // Idle at the end

        // Start the part
        Tone.Transport.start();
        part.start(0);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            Tone.Transport.pause();
        } else {
            Tone.Transport.start();
        }
        setIsPlaying(!isPlaying);
    };

    const handleRewind = () => {
        if (hero) {
            hero.position = new Vector3(-5, 0, 0); // Reset position
            hero.rotation.y = 0; // Reset rotation
            idleAnim?.stop();
            walkAnim?.stop();
            sambaAnim?.stop();
            Tone.Transport.stop();
            Tone.Transport.start();
        }
    };

    const handleSliderChange = (value: number) => {
        setCurrentTime(value);
        Tone.Transport.seconds = value;
        // Reset animations and positions based on the current time
        // This part needs to be implemented based on your specific requirements
    };

    return (
        <div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '80vh' }} />
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button onClick={handleRewind}>REWIND</button>
                <button onClick={handlePlayPause}>{isPlaying ? 'PAUSE' : 'PLAY'}</button>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentTime}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                />
            </div>
        </div>
    );
};

export default BabylonScene;