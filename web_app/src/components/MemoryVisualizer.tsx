import { useState, useEffect } from 'react';
import { RAMGrid } from './RAMGrid';
import { CacheGrid } from './CacheGrid';
import { MappingConnector } from './MappingConnector';
import { AddressBreakdown } from './AddressBreakdown';
import { ExplanationPanel } from './ExplanationPanel';
import { ViewToggle } from './ViewToggle';
import type { CacheConfiguration } from '../utils/cache/types';
import type { CacheLineData } from '../utils/cache/CacheLine';
import type { CacheAccessResult } from '../utils/cache/CacheController';
import type { AddressDecoder } from '../utils/cache/AddressDecoder';

interface MemoryVisualizerProps {
    config: CacheConfiguration;
    cacheLines: CacheLineData[];
    lastResult: CacheAccessResult | null;
    decoder: AddressDecoder;
}

export const MemoryVisualizer: React.FC<MemoryVisualizerProps> = ({
    config,
    cacheLines,
    lastResult,
    decoder
}) => {
    const [is3D, setIs3D] = useState(false);
    const [showConnector, setShowConnector] = useState(false);

    // Show connector animation when there's a new access
    useEffect(() => {
        if (lastResult) {
            setShowConnector(true);
            const timer = setTimeout(() => {
                setShowConnector(false);
            }, 2000); // Hide after 2 seconds
            return () => clearTimeout(timer);
        }
    }, [lastResult]);

    const ramBlockNumber = lastResult
        ? Math.floor(lastResult.addressComponents.address / config.blockSizeBytes)
        : -1;

    return (
        <div className="memory-visualizer">
            {/* Header with view toggle */}
            <div className="visualizer-header">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                        RAM ↔ Cache Mapping Visualizer
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Watch how memory blocks map to cache lines in real-time
                    </p>
                </div>
                <ViewToggle is3D={is3D} onToggle={setIs3D} />
            </div>

            {/* Main visualization area */}
            <div className={`visualization-container ${is3D ? 'perspective-3d' : ''}`}>
                <div className="grids-wrapper" style={{ position: 'relative' }}>
                    {/* RAM Grid on the left */}
                    <div className="ram-section">
                        <RAMGrid
                            memorySizeKB={config.memorySizeKB}
                            blockSizeBytes={config.blockSizeBytes}
                            accessedAddress={lastResult?.addressComponents.address}
                            highlightBlock={ramBlockNumber >= 0 ? ramBlockNumber : undefined}
                            is3D={is3D}
                        />
                    </div>

                    {/* Mapping connector overlay */}
                    {showConnector && lastResult && (
                        <MappingConnector
                            ramBlockNumber={ramBlockNumber}
                            cacheLineNumber={lastResult.cacheLineIndex}
                            isHit={lastResult.isHit}
                            animate={true}
                        />
                    )}

                    {/* Cache Grid on the right */}
                    <div className="cache-section">
                        <CacheGrid
                            cacheLines={cacheLines}
                            mappingType={config.mappingType}
                            associativity={config.associativity}
                            blockSizeBytes={config.blockSizeBytes}
                            accessedLineIndex={lastResult?.cacheLineIndex}
                            isHit={lastResult?.isHit}
                            is3D={is3D}
                        />
                    </div>
                </div>
            </div>

            {/* Address breakdown section */}
            {lastResult && (
                <div className="breakdown-section">
                    <AddressBreakdown
                        address={lastResult.addressComponents.address}
                        decoder={decoder}
                    />
                </div>
            )}

            {/* Educational explanation */}
            <div className="explanation-section">
                <ExplanationPanel
                    mappingType={config.mappingType}
                    associativity={config.associativity}
                />
            </div>

            {/* Legend */}
            <div className="legend">
                <h4 className="legend-title">Legend</h4>
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="legend-color hit"></span>
                        <span>Cache Hit (Found)</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color miss"></span>
                        <span>Cache Miss (Not Found)</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color valid"></span>
                        <span>Valid Data</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color invalid"></span>
                        <span>Empty/Invalid</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color accessed"></span>
                        <span>Currently Accessing</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
