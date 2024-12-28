import React, { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Texture, SceneLoader, Animation } from '@babylonjs/core';
import '@babylonjs/loaders';

const BabylonScene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);

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
            const hero = meshes[0];
            hero.position = new Vector3(-5, 0, 0); // Start on the left
            hero.scaling.scaleInPlace(0.1);

            // Lock camera on the character's position
            camera.target = hero.position;

            // Get animations
            const walkAnim = scene.getAnimationGroupByName("Walking");
            const sambaAnim = scene.getAnimationGroupByName("Samba");
            const idleAnim = scene.getAnimationGroupByName("Idle");

            // Create position animations
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

            // Start with idle animation for 2 seconds
            idleAnim?.start(true, 1.0, idleAnim.from, idleAnim.to, false);
            setTimeout(() => {
                idleAnim?.stop();
                // Start walking animation
                walkAnim?.start(true, 1.0, walkAnim.from, walkAnim.to, false);
                scene.beginDirectAnimation(hero, [walkToMiddle], 0, 150, false, 1, () => {
                    walkAnim?.stop();
                    idleAnim?.start(true, 1.0, idleAnim.from, idleAnim.to, false);
                    hero.rotation.y = Math.PI / 2; // Face the front
                    sambaAnim?.start(false, 1.0, sambaAnim.from, sambaAnim.to, false);

                    // Stop samba after 3 seconds and walk off to the right
                    setTimeout(() => {
                        sambaAnim?.stop();
                        walkAnim?.start(true, 1.0, walkAnim.from, walkAnim.to, false);
                        scene.beginDirectAnimation(hero, [walkOffRight], 0, 150, false, 1, () => {
                            walkAnim?.stop();
                            idleAnim?.start(true, 1.0, idleAnim.from, idleAnim.to, false);
                        });
                    }, 3000);
                });
            }, 2000);
        });

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