import { useState, useEffect } from 'react';
import { ThreeVisualizer } from './ThreeVisualizer';
import { AddressBreakdown } from './AddressBreakdown';
import { ExplanationPanel } from './ExplanationPanel';
import type { CacheConfiguration } from '../utils/cache/types';
import type { CacheLineData } from '../utils/cache/CacheLine';
import type { CacheAccessResult } from '../utils/cache/CacheController';
import type { AddressDecoder } from '../utils/cache/AddressDecoder';

interface ImprovedVisualizerProps {
    config: CacheConfiguration;
    cacheLines: CacheLineData[];
    lastResult: CacheAccessResult | null;
    decoder: AddressDecoder;
    onAccess: (address: number) => void;
    onReset: () => void;
}

export const ImprovedVisualizer: React.FC<ImprovedVisualizerProps> = ({
    config,

    lastResult,
    decoder,
    onAccess,
    onReset
}) => {
    const [showConnector, setShowConnector] = useState(false);
    const [addressInput, setAddressInput] = useState('0');
    const [numberFormat, setNumberFormat] = useState<'hex' | 'dec' | 'bin' | 'oct'>('hex');
    const [inputError, setInputError] = useState<string | null>(null);

    const handleAccess = () => {
        setInputError(null);
        try {
            let address = 0;
            const input = addressInput.trim();

            switch (numberFormat) {
                case 'hex':
                    address = parseInt(input.startsWith('0x') ? input : '0x' + input, 16);
                    break;
                case 'dec':
                    address = parseInt(input, 10);
                    break;
                case 'bin':
                    address = parseInt(input.startsWith('0b') ? input.slice(2) : input, 2);
                    break;
                case 'oct':
                    address = parseInt(input.startsWith('0o') ? input.slice(2) : input, 8);
                    break;
            }

            if (isNaN(address) || address < 0) {
                setInputError('Invalid address format');
                return;
            }

            const maxAddress = config.memorySizeKB * 1024 - 1;
            if (address > maxAddress) {
                setInputError(`Address too large! Max: ${maxAddress} (0x${maxAddress.toString(16)})`);
                return;
            }

            onAccess(address);
        } catch (e) {
            setInputError('Invalid address format');
        }
    };

    // Show connector animation when there's a new access
    useEffect(() => {
        if (lastResult) {
            setShowConnector(true);
            const timer = setTimeout(() => {
                setShowConnector(false);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [lastResult]);

    const ramBlockNumber = lastResult
        ? Math.floor(lastResult.addressComponents.address / config.blockSizeBytes)
        : undefined;

    return (
        <div className="improved-visualizer">
            {/* Header */}
            <div className="visualizer-header mb-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                    3D RAM ↔ Cache Mapping Visualization
                </h2>
                <p className="text-sm text-slate-400 mt-2">
                    Use mouse to rotate • Scroll to zoom • Enter address below to see mapping
                </p>
            </div>

            {/* Access Control Panel */}
            <div className="access-panel bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                        <label className="block text-sm text-slate-300 mb-2">Memory Address</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={addressInput}
                                onChange={e => setAddressInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleAccess()}
                                placeholder={numberFormat === 'hex' ? '0x0000' : numberFormat === 'bin' ? '0b0000' : numberFormat === 'oct' ? '0o0000' : '0'}
                                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                            />
                            <select
                                value={numberFormat}
                                onChange={e => setNumberFormat(e.target.value as 'hex' | 'dec' | 'bin' | 'oct')}
                                className="bg-slate-800 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none min-w-[100px]"
                            >
                                <option value="hex">Hex</option>
                                <option value="dec">Decimal</option>
                                <option value="bin">Binary</option>
                                <option value="oct">Octal</option>
                            </select>
                            <button
                                onClick={handleAccess}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 rounded-lg transition-all"
                            >
                                Access
                            </button>
                            <button
                                onClick={onReset}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-lg transition-all"
                            >
                                Reset
                            </button>
                        </div>
                        {inputError && (
                            <div className="text-red-400 text-sm mt-2">⚠️ {inputError}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3D Visualization */}
            <div className="three-scene-container bg-slate-900/50 rounded-xl border border-white/10 p-4 mb-6">
                <ThreeVisualizer
                    memorySizeKB={config.memorySizeKB}
                    cacheSizeKB={config.cacheSizeKB}
                    blockSizeBytes={config.blockSizeBytes}
                    accessedBlock={showConnector ? ramBlockNumber : undefined}
                    cacheLineIndex={showConnector && lastResult ? lastResult.cacheLineIndex : undefined}
                    isHit={lastResult?.isHit}
                    onAccess={onAccess}
                />
            </div>

            {/* Status indicator */}
            {lastResult && (
                <div className={`status-indicator mb-6 p-4 rounded-lg border ${lastResult.isHit
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                    }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{lastResult.isHit ? '✅' : '❌'}</span>
                        <div>
                            <div className="font-semibold text-lg">
                                {lastResult.isHit ? 'Cache HIT!' : 'Cache MISS'}
                            </div>
                            <div className="text-sm text-slate-400 font-mono">
                                RAM Block {ramBlockNumber} → Cache Line {lastResult.cacheLineIndex}
                                {lastResult.wasValid && !lastResult.isHit && ` (Replaced previous data)`}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Address breakdown section */}
            {lastResult && (
                <div className="breakdown-section mb-6 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                    <AddressBreakdown
                        address={lastResult.addressComponents.address}
                        decoder={decoder}
                        blockSizeBytes={config.blockSizeBytes}
                    />
                </div>
            )}

            {/* Educational explanation */}
            <div className="explanation-section bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <ExplanationPanel
                    mappingType={config.mappingType}
                    associativity={config.associativity}
                />
            </div>

            {/* Legend */}
            <div className="legend mt-6 bg-slate-900/50 rounded-lg p-4 border border-white/10">
                <h4 className="font-semibold text-sm mb-3 text-slate-300">Color Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: '#fbbf24' }}></div>
                        <span>Accessing (RAM)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: '#22c55e' }}></div>
                        <span>Cache Hit</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: '#ef4444' }}></div>
                        <span>Cache Miss</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: '#a78bfa' }}></div>
                        <span>Valid Cache Line</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: '#06b6d4' }}></div>
                        <span>RAM Block</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: '#8b5cf6' }}></div>
                        <span>Empty Cache Line</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
