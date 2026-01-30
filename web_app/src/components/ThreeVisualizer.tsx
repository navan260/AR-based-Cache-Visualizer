import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { ARButton, XR, useXR, createXRStore } from '@react-three/xr';
import { WASDControls } from './WASDControls';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

interface ThreeVisualizerProps {
    memorySizeKB: number;
    cacheSizeKB: number;
    blockSizeBytes: number;
    accessedBlock?: number;
    cacheLineIndex?: number;
    isHit?: boolean;
    onAccess?: (address: number) => void;
}

// RAM Block Component
function RAMBlock({ position, blockNumber, isAccessed, onAccess, blockSizeBytes }: {
    position: [number, number, number];
    blockNumber: number;
    isAccessed: boolean;
    onAccess?: (address: number) => void;
    blockSizeBytes: number;
}) {
    const color = isAccessed ? '#fbbf24' : '#06b6d4';

    return (
        <group position={position}>
            <mesh onClick={() => onAccess?.(blockNumber * blockSizeBytes)}>
                <boxGeometry args={[0.9, 0.9, 0.9]} />
                <meshStandardMaterial
                    color={color}
                    emissive={isAccessed ? '#f59e0b' : '#0891b2'}
                    emissiveIntensity={isAccessed ? 0.8 : 0.3}
                    metalness={0.3}
                    roughness={0.7}
                />
            </mesh>
            <Text
                position={[0, 0, 0.5]}
                fontSize={0.35}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                {blockNumber}
            </Text>
        </group>
    );
}

// Cache Line Component
function CacheLine({ position, lineNumber, isValid, isAccessed, isHit }: {
    position: [number, number, number];
    lineNumber: number;
    isValid: boolean;
    isAccessed: boolean;
    isHit?: boolean;
}) {
    let color = '#8b5cf6';
    if (isAccessed && isHit) color = '#22c55e';
    else if (isAccessed && !isHit) color = '#ef4444';
    else if (isValid) color = '#a78bfa';

    return (
        <group position={position}>
            <mesh>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshStandardMaterial
                    color={color}
                    emissive={isAccessed ? (isHit ? '#16a34a' : '#dc2626') : (isValid ? '#7c3aed' : '#6b7280')}
                    emissiveIntensity={isAccessed ? 0.6 : 0.3}
                />
            </mesh>
            <Text
                position={[0, 0, 0.45]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {lineNumber}
            </Text>
        </group>
    );
}

// Connection Line Component - Using thick tube for visibility
function ConnectionLine({ start, end, isHit }: {
    start: [number, number, number];
    end: [number, number, number];
    isHit: boolean;
}) {
    const points = useMemo(() => {
        const curve = new THREE.LineCurve3(
            new THREE.Vector3(...start),
            new THREE.Vector3(...end)
        );
        return curve.getPoints(50);
    }, [start, end]);

    const color = isHit ? '#22c55e' : '#ef4444';
    const emissiveColor = isHit ? '#16a34a' : '#dc2626';

    const tubeGeometry = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3(points);
        return new THREE.TubeGeometry(curve, 64, 0.15, 8, false);
    }, [points]);

    return (
        <mesh>
            <primitive object={tubeGeometry} attach="geometry" />
            <meshStandardMaterial
                color={color}
                emissive={emissiveColor}
                emissiveIntensity={1.0}
                transparent
                opacity={0.9}
            />
        </mesh>
    );
}

// Main 3D Scene
function Scene({
    ramBlocks,
    cacheLines,
    accessedBlock,
    cacheLineIndex,
    isHit,
    onAccess,
    blockSizeBytes
}: {
    ramBlocks: number;
    cacheLines: number;
    accessedBlock?: number;
    cacheLineIndex?: number;
    isHit?: boolean;
    onAccess?: (address: number) => void;
    blockSizeBytes: number;
}) {
    // Calculate grid layouts
    const ramCols = Math.ceil(Math.sqrt(ramBlocks));
    const cacheCols = Math.ceil(Math.sqrt(cacheLines));

    const ramPositions = useMemo(() => {
        const positions: [number, number, number][] = [];
        for (let i = 0; i < ramBlocks; i++) {
            const row = Math.floor(i / ramCols);
            const col = i % ramCols;
            positions.push([-10 + col * 1, 5 - row * 1, 0]);
        }
        return positions;
    }, [ramBlocks, ramCols]);

    const cachePositions = useMemo(() => {
        const positions: [number, number, number][] = [];
        for (let i = 0; i < cacheLines; i++) {
            const row = Math.floor(i / cacheCols);
            const col = i % cacheCols;
            positions.push([10 + col * 1, 5 - row * 1, 0]);
        }
        return positions;
    }, [cacheLines, cacheCols]);

    return (
        <>
            {/* Ambient lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />

            {/* RAM section label */}
            <Text
                position={[-10, 7, 0]}
                fontSize={0.8}
                color="#06b6d4"
                anchorX="left"
                anchorY="middle"
            >
                RAM Blocks
            </Text>

            {/* RAM blocks */}
            {ramPositions.map((pos, i) => (
                <RAMBlock
                    key={`ram-${i}`}
                    position={pos}
                    blockNumber={i}
                    isAccessed={i === accessedBlock}
                    onAccess={onAccess}
                    blockSizeBytes={blockSizeBytes}
                />
            ))}

            {/* Cache section label */}
            <Text
                position={[10, 7, 0]}
                fontSize={0.8}
                color="#8b5cf6"
                anchorX="left"
                anchorY="middle"
            >
                Cache Lines
            </Text>

            {/* Cache lines */}
            {cachePositions.map((pos, i) => (
                <CacheLine
                    key={`cache-${i}`}
                    position={pos}
                    lineNumber={i}
                    isValid={false}
                    isAccessed={i === cacheLineIndex}
                    isHit={isHit}
                />
            ))}

            {/* Connection line */}
            {accessedBlock !== undefined && cacheLineIndex !== undefined && (
                <ConnectionLine
                    start={ramPositions[accessedBlock]}
                    end={cachePositions[cacheLineIndex]}
                    isHit={isHit || false}
                />
            )}
        </>
    );
}

const store = createXRStore();

// OrbitControls wrapper that disables itself in AR mode
function InteractiveControls() {
    const isPresenting = useXR(state => !!state.session);
    return !isPresenting ? (
        <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.05}
            minDistance={15}
            maxDistance={40}
        />
    ) : null;
}

export const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({
    memorySizeKB,
    cacheSizeKB,
    blockSizeBytes,
    accessedBlock,
    cacheLineIndex,
    isHit,
    onAccess
}) => {
    const ramBlocks = Math.floor((memorySizeKB * 1024) / blockSizeBytes);
    const cacheLines = Math.floor((cacheSizeKB * 1024) / blockSizeBytes);

    return (
        <div className="three-visualizer-container relative">
            {/* Info Display */}
            <div className="text-xs text-slate-400 mb-2 font-mono bg-slate-900/50 p-2 rounded">
                📊 RAM: {memorySizeKB * 1024}B ÷ {blockSizeBytes}B = <span className="text-cyan-400 font-bold">{ramBlocks} blocks</span> |
                Cache: {cacheSizeKB * 1024}B ÷ {blockSizeBytes}B = <span className="text-purple-400 font-bold">{cacheLines} lines</span>
            </div>
            <div style={{ width: '100%', height: '600px' }}>
                <ARButton className="ar-button" store={store} />
                <Canvas>
                    <XR store={store}>
                        <PerspectiveCamera makeDefault position={[0, 0, 25]} />
                        <InteractiveControls />
                        <WASDControls />
                        <Suspense fallback={null}>
                            <Scene
                                ramBlocks={ramBlocks}
                                cacheLines={cacheLines}
                                accessedBlock={accessedBlock}
                                cacheLineIndex={cacheLineIndex}
                                isHit={isHit}
                                onAccess={onAccess}
                                blockSizeBytes={blockSizeBytes}
                            />
                        </Suspense>
                    </XR>
                </Canvas>
            </div>
        </div>
    );
};
