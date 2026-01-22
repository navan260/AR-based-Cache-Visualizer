import { useState, useCallback } from 'react';
import { MappingType, ReplacementPolicy, CacheController, AddressDecoder } from './utils/cache';
import type { CacheConfiguration, CacheStatistics, CacheAccessResult, CacheLineData } from './utils/cache';
import { ImprovedVisualizer } from './components/ImprovedVisualizer';
import './styles/visualizer.css';

function App() {
  // Configuration State
  const [memorySizeKB, setMemorySizeKB] = useState(4); // Smaller default for better visualization
  const [cacheSizeKB, setCacheSizeKB] = useState(0.5);
  const [blockSizeBytes, setBlockSizeBytes] = useState(16);
  const [mappingType, setMappingType] = useState<MappingType>(MappingType.DirectMapped);
  const [associativity, setAssociativity] = useState(2);
  const [replacementPolicy, setReplacementPolicy] = useState<ReplacementPolicy>(ReplacementPolicy.LRU);

  // Custom size inputs
  const [customMemoryKB, setCustomMemoryKB] = useState('1024'); // 1024 bytes = 1KB
  const [customCacheKB, setCustomCacheKB] = useState('256'); // 256 bytes
  const [customBlockBytes, setCustomBlockBytes] = useState('16'); // 16 bytes

  // Unit selectors
  const [memoryUnit, setMemoryUnit] = useState<'B' | 'KB'>('B'); // Start with Bytes
  const [cacheUnit, setCacheUnit] = useState<'B' | 'KB'>('B'); // Start with Bytes
  const [blockUnit, setBlockUnit] = useState<'B' | 'KB'>('B');
  const [sizeError, setSizeError] = useState<string | null>(null);

  // Simulation State
  const [controller, setController] = useState<CacheController | null>(null);
  const [cacheLines, setCacheLines] = useState<CacheLineData[]>([]);
  const [statistics, setStatistics] = useState<CacheStatistics | null>(null);
  const [accessHistory, setAccessHistory] = useState<CacheAccessResult[]>([]);
  const [lastResult, setLastResult] = useState<CacheAccessResult | null>(null);
  const [bitCounts, setBitCounts] = useState<{ tag: number; index: number; offset: number; total: number } | null>(null);

  // Input State
  const [addressInput, setAddressInput] = useState('0x0000');
  const [error, setError] = useState<string | null>(null);

  // View State
  const [activeView, setActiveView] = useState<'table' | 'visualizer'>('visualizer');

  // Helper functions for validation
  const isPowerOfTwo = (n: number): boolean => {
    return n > 0 && (n & (n - 1)) === 0;
  };

  const validateAndApplyCustomSizes = (): boolean => {
    setSizeError(null);

    const memValue = parseFloat(customMemoryKB);
    const cacheValue = parseFloat(customCacheKB);
    const blockValue = parseInt(customBlockBytes);

    // Check if valid numbers
    if (isNaN(memValue) || isNaN(cacheValue) || isNaN(blockValue)) {
      setSizeError('Please enter valid numbers');
      return false;
    }

    // Convert to bytes based on selected unit
    const memBytes = memoryUnit === 'KB' ? memValue * 1024 : memValue;
    const cacheBytes = cacheUnit === 'KB' ? cacheValue * 1024 : cacheValue;
    const blockBytes = blockUnit === 'KB' ? blockValue * 1024 : blockValue;

    // Validate all are powers of 2 in bytes
    if (!isPowerOfTwo(memBytes)) {
      setSizeError(`Memory must be power of 2 in bytes. Current: ${memBytes} bytes`);
      return false;
    }
    if (!isPowerOfTwo(cacheBytes)) {
      setSizeError(`Cache must be power of 2 in bytes. Current: ${cacheBytes} bytes`);
      return false;
    }
    if (!isPowerOfTwo(blockBytes)) {
      setSizeError(`Block size must be power of 2 in bytes. Current: ${blockBytes} bytes`);
      return false;
    }

    // Validate cache < memory
    if (cacheBytes >= memBytes) {
      setSizeError('Cache size must be less than memory size');
      return false;
    }

    // Validate block size reasonable
    if (blockBytes < 4 || blockBytes > 1024) {
      setSizeError('Block size should be between 4 and 1024 bytes');
      return false;
    }

    // Validate not too large for visualization
    const totalBlocks = memBytes / blockBytes;
    if (totalBlocks > 256) {
      setSizeError('Too many blocks for visualization! Max 256 blocks. Try larger block size or smaller memory.');
      return false;
    }

    // Convert to KB for internal state
    setMemorySizeKB(memBytes / 1024);
    setCacheSizeKB(cacheBytes / 1024);
    setBlockSizeBytes(blockBytes);
    return true;
  };

  const initializeCache = useCallback(() => {
    setError(null);
    try {
      const effectiveAssociativity = mappingType === MappingType.DirectMapped ? 1 :
        mappingType === MappingType.FullyAssociative ? (cacheSizeKB * 1024) / blockSizeBytes :
          associativity;

      const config: CacheConfiguration = {
        memorySizeKB,
        cacheSizeKB,
        blockSizeBytes,
        mappingType,
        associativity: effectiveAssociativity,
        replacementPolicy
      };

      const newController = new CacheController(config);
      setController(newController);
      setCacheLines(newController.getAllCacheLinesData());
      setStatistics(newController.getStatistics());
      setAccessHistory([]);
      setLastResult(null);
      setBitCounts(newController.getDecoder().getBitCounts());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error initializing cache');
    }
  }, [memorySizeKB, cacheSizeKB, blockSizeBytes, mappingType, associativity, replacementPolicy]);

  const handleAccess = useCallback((providedAddress?: number) => {
    if (!controller) {
      setError('Please initialize cache first');
      return;
    }
    setError(null);
    try {
      let address = 0;

      // If address is provided directly (from visualizer), use it
      if (providedAddress !== undefined) {
        address = providedAddress;
      } else {
        // Otherwise parse from input field
        const input = addressInput.trim();
        if (input.toLowerCase().startsWith('0x')) {
          address = parseInt(input, 16);
        } else {
          address = parseInt(input, 10);
        }
      }

      if (isNaN(address) || address < 0) {
        setError('Invalid address. Use hex (0x...) or decimal.');
        return;
      }

      const result = controller.access(address);
      setLastResult(result);
      setCacheLines(controller.getAllCacheLinesData());
      setStatistics(controller.getStatistics());
      setAccessHistory(controller.getAccessHistory().slice(-20));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error accessing cache');
    }
  }, [controller, addressInput]);

  const handleReset = useCallback(() => {
    if (controller) {
      controller.reset();
      setCacheLines(controller.getAllCacheLinesData());
      setStatistics(controller.getStatistics());
      setAccessHistory([]);
      setLastResult(null);
    }
  }, [controller]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
          Cache Memory Visualizer
        </h1>
        <p className="text-slate-400 mt-2">Explore Direct, Set-Associative, and Fully-Associative Mapping</p>

        {/* View Toggle Tabs */}
        {controller && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setActiveView('visualizer')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeView === 'visualizer'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
            >
              🎨 Interactive Visualizer
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeView === 'table'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
            >
              📊 Table View
            </button>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚙️</span> Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Memory Size - Power of 2</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customMemoryKB}
                  onChange={e => setCustomMemoryKB(e.target.value)}
                  placeholder="e.g., 1024, 2048"
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                />
                <select
                  value={memoryUnit}
                  onChange={e => setMemoryUnit(e.target.value as 'B' | 'KB')}
                  className="bg-slate-800 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none min-w-[70px]"
                >
                  <option value="B">Bytes</option>
                  <option value="KB">KB</option>
                </select>
              </div>
              <div className="text-xs text-slate-500 mt-1">In bytes: 512, 1024, 2048 | In KB: 1, 2, 4, 8</div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Cache Size - Power of 2</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCacheKB}
                  onChange={e => setCustomCacheKB(e.target.value)}
                  placeholder="e.g., 256, 512"
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                />
                <select
                  value={cacheUnit}
                  onChange={e => setCacheUnit(e.target.value as 'B' | 'KB')}
                  className="bg-slate-800 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none min-w-[70px]"
                >
                  <option value="B">Bytes</option>
                  <option value="KB">KB</option>
                </select>
              </div>
              <div className="text-xs text-slate-500 mt-1">In bytes: 128, 256, 512 | In KB: 0.25, 0.5, 1</div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Block Size - Power of 2</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBlockBytes}
                  onChange={e => setCustomBlockBytes(e.target.value)}
                  placeholder="e.g., 16, 32"
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                />
                <select
                  value={blockUnit}
                  onChange={e => setBlockUnit(e.target.value as 'B' | 'KB')}
                  className="bg-slate-800 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none min-w-[70px]"
                >
                  <option value="B">Bytes</option>
                  <option value="KB">KB</option>
                </select>
              </div>
              <div className="text-xs text-slate-500 mt-1">Usually in bytes: 4, 8, 16, 32, 64</div>
            </div>

            {sizeError && (
              <div className="bg-orange-500/20 border border-orange-500/50 text-orange-300 p-3 rounded-lg text-sm">
                ⚠️ {sizeError}
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-300 mb-1">Mapping Type</label>
              <select value={mappingType} onChange={e => setMappingType(e.target.value as MappingType)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value={MappingType.DirectMapped}>Direct Mapped</option>
                <option value={MappingType.SetAssociative}>Set Associative</option>
                <option value={MappingType.FullyAssociative}>Fully Associative</option>
              </select>
            </div>

            {mappingType === MappingType.SetAssociative && (
              <div>
                <label className="block text-sm text-slate-300 mb-1">Associativity (N-way)</label>
                <select value={associativity} onChange={e => setAssociativity(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                  {[2, 4, 8].map(v => <option key={v} value={v}>{v}-way</option>)}
                </select>
              </div>
            )}

            {(mappingType === MappingType.SetAssociative || mappingType === MappingType.FullyAssociative) && (
              <div>
                <label className="block text-sm text-slate-300 mb-1">Replacement Policy</label>
                <select value={replacementPolicy} onChange={e => setReplacementPolicy(e.target.value as ReplacementPolicy)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                  <option value={ReplacementPolicy.LRU}>LRU</option>
                  <option value={ReplacementPolicy.FIFO}>FIFO</option>
                  <option value={ReplacementPolicy.Random}>Random</option>
                </select>
              </div>
            )}

            <button
              onClick={() => {
                if (validateAndApplyCustomSizes()) {
                  initializeCache();
                }
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/25">
              ✨ Validate & Initialize Cache
            </button>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Visualizer View */}
        {activeView === 'visualizer' && controller && (
          <div className="lg:col-span-2">
            <ImprovedVisualizer
              config={controller.getConfig()}
              cacheLines={cacheLines}
              lastResult={lastResult}
              decoder={controller.getDecoder()}
              onAccess={handleAccess}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Table View */}
        {activeView === 'table' && (
          <div className="lg:col-span-2 space-y-6">
            {/* Address Input & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address Input */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📍</span> Memory Access
                </h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addressInput}
                    onChange={e => setAddressInput(e.target.value)}
                    placeholder="0x0000 or 1024"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                  />
                  <button onClick={handleAccess} disabled={!controller}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 rounded-lg transition-all duration-200">
                    Access
                  </button>
                </div>
                <button onClick={handleReset} disabled={!controller}
                  className="mt-3 w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-2 rounded-lg transition-all">
                  Reset Cache
                </button>
              </div>

              {/* Statistics */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span> Statistics
                </h2>
                {statistics ? (
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white">{statistics.totalAccesses}</div>
                      <div className="text-xs text-slate-400">Total Accesses</div>
                    </div>
                    <div className="bg-green-500/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-400">{statistics.hits}</div>
                      <div className="text-xs text-slate-400">Hits ({(statistics.hitRate * 100).toFixed(1)}%)</div>
                    </div>
                    <div className="bg-red-500/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-red-400">{statistics.misses}</div>
                      <div className="text-xs text-slate-400">Misses ({(statistics.missRate * 100).toFixed(1)}%)</div>
                    </div>
                    {bitCounts && (
                      <div className="bg-purple-500/20 rounded-lg p-3">
                        <div className="text-sm font-mono">
                          <span className="text-cyan-400">{bitCounts.tag}T</span> |
                          <span className="text-yellow-400"> {bitCounts.index}I</span> |
                          <span className="text-pink-400"> {bitCounts.offset}O</span>
                        </div>
                        <div className="text-xs text-slate-400">{bitCounts.total}-bit Address</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 text-center py-4">Initialize cache to see stats</div>
                )}
              </div>
            </div>

            {/* Last Access Result */}
            {lastResult && (
              <div className={`rounded-2xl p-4 border ${lastResult.isHit ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{lastResult.isHit ? '✅' : '❌'}</span>
                  <div>
                    <div className="font-semibold text-lg">{lastResult.isHit ? 'Cache HIT!' : 'Cache MISS'}</div>
                    <div className="text-sm text-slate-400 font-mono">
                      Address: 0x{lastResult.addressComponents.address.toString(16).toUpperCase().padStart(4, '0')} →
                      Tag: {lastResult.tag}, Index: {lastResult.addressComponents.index}, Offset: {lastResult.addressComponents.offset}
                      {lastResult.wasValid && !lastResult.isHit && ` (Replaced Tag ${lastResult.previousTag})`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cache Grid */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                <span className="text-2xl">🗄️</span> Cache State
              </h2>
              {cacheLines.length > 0 ? (
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-900">
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="p-2 text-left">Line</th>
                        <th className="p-2 text-center">Valid</th>
                        <th className="p-2 text-left">Tag</th>
                        <th className="p-2 text-left">Last Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cacheLines.map((line, idx) => (
                        <tr key={idx}
                          className={`border-b border-slate-800 transition-all duration-300 ${lastResult?.cacheLineIndex === idx ? (lastResult.isHit ? 'bg-green-500/20' : 'bg-red-500/20') : ''}`}>
                          <td className="p-2 font-mono text-cyan-400">{line.lineNumber}</td>
                          <td className="p-2 text-center">
                            {line.valid ? <span className="text-green-400">●</span> : <span className="text-slate-600">○</span>}
                          </td>
                          <td className="p-2 font-mono">{line.valid ? `0x${line.tag.toString(16).toUpperCase()}` : '-'}</td>
                          <td className="p-2 text-slate-500">{line.valid ? `T=${line.lastAccessTime}` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-slate-500 text-center py-8">Initialize cache to see state</div>
              )}
            </div>

            {/* Access History */}
            {accessHistory.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-orange-400 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📜</span> Access History (Last 20)
                </h2>
                <div className="flex flex-wrap gap-2">
                  {accessHistory.map((res, idx) => (
                    <div key={idx}
                      className={`px-3 py-1 rounded-full text-xs font-mono ${res.isHit ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      0x{res.addressComponents.address.toString(16).toUpperCase().padStart(4, '0')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="text-center text-slate-500 text-sm mt-12">
        AR-Based Cache Memory Visualizer | CSE 3rd Semester - RVCE
      </footer>
    </div>
  );
}

export default App;
