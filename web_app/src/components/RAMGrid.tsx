import { useMemo } from 'react';

interface RAMGridProps {
  memorySizeKB: number;
  blockSizeBytes: number;
  accessedAddress?: number;
  highlightBlock?: number;
  is3D: boolean;
}

export const RAMGrid: React.FC<RAMGridProps> = ({
  memorySizeKB,
  blockSizeBytes,
  accessedAddress,
  highlightBlock,
  is3D
}) => {
  const totalBlocks = useMemo(() => {
    return (memorySizeKB * 1024) / blockSizeBytes;
  }, [memorySizeKB, blockSizeBytes]);

  const blocksPerRow = useMemo(() => {
    // Calculate optimal grid layout
    const sqrt = Math.sqrt(totalBlocks);
    return Math.ceil(sqrt);
  }, [totalBlocks]);

  const blocks = useMemo(() => {
    return Array.from({ length: totalBlocks }, (_, i) => ({
      blockNumber: i,
      address: i * blockSizeBytes
    }));
  }, [totalBlocks, blockSizeBytes]);

  const currentBlock = accessedAddress !== undefined 
    ? Math.floor(accessedAddress / blockSizeBytes) 
    : -1;

  return (
    <div className="ram-grid-container">
      <div className="memory-header">
        <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
          <span className="text-xl">💾</span> Main Memory (RAM)
        </h3>
        <div className="text-xs text-slate-400">
          {memorySizeKB} KB | {totalBlocks} Blocks | {blockSizeBytes}B each
        </div>
      </div>
      
      <div 
        className={`ram-grid ${is3D ? 'view-3d' : 'view-2d'}`}
        style={{
          gridTemplateColumns: `repeat(${blocksPerRow}, minmax(0, 1fr))`
        }}
      >
        {blocks.map((block) => {
          const isAccessed = block.blockNumber === currentBlock;
          const isHighlighted = block.blockNumber === highlightBlock;
          
          return (
            <div
              key={block.blockNumber}
              id={`ram-block-${block.blockNumber}`}
              className={`ram-block ${isAccessed ? 'accessed' : ''} ${isHighlighted ? 'highlighted' : ''}`}
              title={`Block ${block.blockNumber}\nAddress: 0x${block.address.toString(16).toUpperCase().padStart(4, '0')}`}
            >
              <div className="block-number">{block.blockNumber}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
