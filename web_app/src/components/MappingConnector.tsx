import { useEffect, useState, useRef } from 'react';

interface MappingConnectorProps {
    ramBlockNumber: number;
    cacheLineNumber: number;
    isHit: boolean;
    animate: boolean;
}

export const MappingConnector: React.FC<MappingConnectorProps> = ({
    ramBlockNumber,
    cacheLineNumber,
    isHit,
    animate
}) => {
    const [path, setPath] = useState<string>('');
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        // Calculate path between RAM block and cache line
        const calculatePath = () => {
            const ramElement = document.getElementById(`ram-block-${ramBlockNumber}`);
            const cacheElement = document.getElementById(`cache-line-${cacheLineNumber}`);

            if (!ramElement || !cacheElement || !svgRef.current) return;

            const svgRect = svgRef.current.getBoundingClientRect();
            const ramRect = ramElement.getBoundingClientRect();
            const cacheRect = cacheElement.getBoundingClientRect();

            // Calculate center points relative to SVG
            const ramX = ramRect.left + ramRect.width / 2 - svgRect.left;
            const ramY = ramRect.top + ramRect.height / 2 - svgRect.top;
            const cacheX = cacheRect.left + cacheRect.width / 2 - svgRect.left;
            const cacheY = cacheRect.top + cacheRect.height / 2 - svgRect.top;

            // Create curved path for better visual
            const midX = (ramX + cacheX) / 2;
            const controlOffset = 50;

            const pathString = `M ${ramX} ${ramY} Q ${midX} ${ramY - controlOffset}, ${cacheX} ${cacheY}`;
            setPath(pathString);
        };

        calculatePath();

        // Recalculate on resize
        window.addEventListener('resize', calculatePath);
        return () => window.removeEventListener('resize', calculatePath);
    }, [ramBlockNumber, cacheLineNumber]);

    if (!path) return null;

    return (
        <svg
            ref={svgRef}
            className="mapping-connector-svg"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10
            }}
        >
            <defs>
                <marker
                    id={`arrowhead-${isHit ? 'hit' : 'miss'}`}
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path
                        d="M0,0 L0,6 L9,3 z"
                        fill={isHit ? '#22c55e' : '#ef4444'}
                    />
                </marker>
            </defs>

            <path
                d={path}
                stroke={isHit ? '#22c55e' : '#ef4444'}
                strokeWidth="3"
                fill="none"
                opacity="0.8"
                markerEnd={`url(#arrowhead-${isHit ? 'hit' : 'miss'})`}
                className={animate ? 'animate-draw' : ''}
                style={{
                    filter: `drop-shadow(0 0 8px ${isHit ? '#22c55e' : '#ef4444'})`
                }}
            />

            {/* Animated dot traveling along path */}
            {animate && (
                <circle r="5" fill={isHit ? '#22c55e' : '#ef4444'} className="path-traveler">
                    <animateMotion dur="1s" repeatCount="1" path={path} />
                </circle>
            )}
        </svg>
    );
};
