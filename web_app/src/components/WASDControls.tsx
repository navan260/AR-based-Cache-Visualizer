import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

export const WASDControls = () => {
    const { camera } = useThree();
    const codes = useRef<Set<string>>(new Set());
    const speed = 0.5; // Movement speed

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => codes.current.add(e.code);
        const handleKeyUp = (e: KeyboardEvent) => codes.current.delete(e.code);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame((_, delta) => {
        const controls = (camera as any).userData.controls || _.controls;

        if (codes.current.size > 0) {
            if (controls) controls.enabled = false;
        } else {
            if (controls) controls.enabled = true;
            return;
        }

        const moveSpeed = speed * (delta * 60); // Normalize speed based on frame rate
        const forward = new Vector3();
        const right = new Vector3();

        // Get camera forward vector
        camera.getWorldDirection(forward);

        // Calculate right vector
        right.crossVectors(forward, camera.up);

        if (codes.current.has('KeyW')) {
            camera.position.addScaledVector(forward, moveSpeed);
        }
        if (codes.current.has('KeyS')) {
            camera.position.addScaledVector(forward, -moveSpeed);
        }
        if (codes.current.has('KeyA')) {
            camera.position.addScaledVector(right, -moveSpeed);
        }
        if (codes.current.has('KeyD')) {
            camera.position.addScaledVector(right, moveSpeed);
        }

        // Up/Down movement (global Y axis)
        if (codes.current.has('Space')) {
            camera.position.y += moveSpeed;
        }
        if (codes.current.has('ShiftLeft') || codes.current.has('ShiftRight')) {
            camera.position.y -= moveSpeed;
        }
    });

    return null;
};
