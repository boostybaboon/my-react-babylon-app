import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Texture, SceneLoader, Animation, AnimationGroup } from '@babylonjs/core';
import '@babylonjs/loaders';
import { gsap } from 'gsap';

const BabylonScene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [scene, setScene] = useState<Scene | null>(null);
    const [engine, setEngine] = useState<Engine | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
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

            setWalkAnim(walkAnim);
            setSambaAnim(sambaAnim);
            setIdleAnim(idleAnim);

            // Start the animation sequence
            startAnimationSequence(hero, walkAnim, sambaAnim, idleAnim, scene);
        });

        engine.runRenderLoop(() => {
            scene.render();
        });

        return () => {
            engine.dispose();
        };
    }, []);

    const startAnimationSequence = (hero: any, walkAnim: AnimationGroup | null, sambaAnim: AnimationGroup | null, idleAnim: AnimationGroup | null, scene: Scene | null) => {
        if (!scene || !hero || !walkAnim || !sambaAnim || !idleAnim) return;

        const timeline = gsap.timeline();

        // Idle for 2 seconds
        timeline.add(() => {
            idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false);
        }, 0);
        timeline.add(() => {
            idleAnim.stop();
        }, 2);

        // Walk to the middle
        timeline.add(() => {
            walkAnim.start(true, 1.0, walkAnim.from, walkAnim.to, false);
            scene.beginDirectAnimation(hero, [walkToMiddle], 0, 150, false, 1, () => {
                walkAnim.stop();
            });
        }, 2);

        // Face the front and samba for 3 seconds
        timeline.add(() => {
            idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false);
            hero.rotation.y = Math.PI / 2; // Face the front
            sambaAnim.start(false, 1.0, sambaAnim.from, sambaAnim.to, false);
        }, 7);
        timeline.add(() => {
            sambaAnim.stop();
        }, 10);

        // Walk off to the right
        timeline.add(() => {
            walkAnim.start(true, 1.0, walkAnim.from, walkAnim.to, false);
            scene.beginDirectAnimation(hero, [walkOffRight], 0, 150, false, 1, () => {
                walkAnim.stop();
                idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false);
            });
        }, 10);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            gsap.globalTimeline.pause();
        } else {
            gsap.globalTimeline.resume();
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
            gsap.globalTimeline.restart();
        }
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

export default BabylonScene;