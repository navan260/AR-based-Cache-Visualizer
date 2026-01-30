import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { XR, useXR, createXRStore } from '@react-three/xr';
import { WASDControls } from './WASDControls';
import { Suspense, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';

const store = createXRStore();

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

// Debug component to check AR support
function XRDebug() {
    const [status, setStatus] = useState<{ supported: boolean | null; error: string | null; secure: boolean }>({
        supported: null,
        error: null,
        secure: window.isSecureContext
    });

    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!('xr' in navigator)) {
            setStatus(s => ({ ...s, supported: false, error: "WebXR not found (navigator.xr undefined)" }));
            return;
        }

        (navigator as any).xr.isSessionSupported('immersive-ar')
            .then((supported: boolean) => {
                setStatus(s => ({ ...s, supported, error: supported ? null : "immersive-ar not supported on this device" }));
            })
            .catch((e: any) => {
                setStatus(s => ({ ...s, supported: false, error: e.message || "Error checking support" }));
            });
    }, []);

    const enterAR = () => store.enterAR();

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="fixed top-20 right-4 bg-slate-900/50 hover:bg-slate-900/80 border border-slate-500/50 text-white/70 hover:text-white p-2 rounded-lg text-xs font-mono z-[9999] backdrop-blur-sm transition-all"
            >
                🛠️
            </button>
        );
    }

    return (
        <div className="fixed top-4 left-4 right-4 bg-slate-900/95 border-2 border-slate-500 text-white p-4 rounded-xl text-sm font-mono z-[9999] shadow-2xl pointer-events-auto">
            <div className="flex justify-between items-center border-b border-slate-500/50 mb-2 pb-2">
                <h3 className="font-bold text-lg">🔧 AR Debug Panel</h3>
                <button onClick={() => setIsExpanded(false)} className="text-slate-400 hover:text-white px-2">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-800 p-2 rounded">🔒 HTTPS: {status.secure ? "✅" : "❌"}</div>
                <div className="bg-slate-800 p-2 rounded">📱 API: {'xr' in navigator ? "✅" : "❌"}</div>
                <div className="col-span-2 bg-slate-800 p-2 rounded text-center">
                    🕶️ AR: {status.supported === null ? "⏳ Checking..." : (status.supported ? "✅ Supported" : "❌ Unsupported")}
                </div>
            </div>
            {status.error && <div className="mb-2 text-red-200 bg-red-900/50 p-1 rounded">{status.error}</div>}

            <button
                onClick={enterAR}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                🚀 Force Enter AR
            </button>
            <div className="mt-1 text-[10px] text-slate-400 text-center">
                If the automatic button is missing, try forcing entry.
            </div>
        </div>
    );
}



function FixedARButton() {
    const [supported, setSupported] = useState<boolean>(false);

    useEffect(() => {
        if ('xr' in navigator) {
            (navigator as any).xr.isSessionSupported('immersive-ar')
                .then((isSupported: boolean) => setSupported(isSupported))
                .catch(() => setSupported(false));
        }
    }, []);

    if (!supported) return null;

    return (
        <button
            onClick={() => store.enterAR()}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-purple-500/50 z-[9990] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 max-w-[90vw] whitespace-nowrap"
        >
            <span>👓</span> View in AR
        </button>
    );
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
            <XRDebug />
            <FixedARButton />
            {/* Info Display */}
            <div className="text-xs text-slate-400 mb-2 font-mono bg-slate-900/50 p-2 rounded">
                📊 RAM: {memorySizeKB * 1024}B ÷ {blockSizeBytes}B = <span className="text-cyan-400 font-bold">{ramBlocks} blocks</span> |
                Cache: {cacheSizeKB * 1024}B ÷ {blockSizeBytes}B = <span className="text-purple-400 font-bold">{cacheLines} lines</span>
            </div>
            <div className="w-full h-[60vh] min-h-[400px] border border-slate-700 rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm">
                <Canvas dpr={[1, 2]}>
                    <XR store={store}>
                        <PerspectiveCamera makeDefault position={[0, 0, 35]} fov={75} />
                        <InteractiveControls />
                        <WASDControls />
                        <Suspense fallback={null}>
                            <group scale={0.2}>
                                <Scene
                                    ramBlocks={ramBlocks}
                                    cacheLines={cacheLines}
                                    accessedBlock={accessedBlock}
                                    cacheLineIndex={cacheLineIndex}
                                    isHit={isHit}
                                    onAccess={onAccess}
                                    blockSizeBytes={blockSizeBytes}
                                />
                            </group>
                        </Suspense>
                    </XR>
                </Canvas>
            </div>
        </div>
    );
};
