import { MappingType } from '../utils/cache/types';
import type { CacheLineData } from '../utils/cache/CacheLine';

interface CacheGridProps {
    cacheLines: CacheLineData[];
    mappingType: MappingType;
    associativity: number;
    blockSizeBytes: number;
    accessedLineIndex?: number;
    isHit?: boolean;
    is3D: boolean;
}

export const CacheGrid: React.FC<CacheGridProps> = ({
    cacheLines,
    mappingType,
    associativity,

    accessedLineIndex,
    isHit,
    is3D
}) => {
    const numberOfSets = mappingType === MappingType.FullyAssociative
        ? 1
        : cacheLines.length / associativity;

    const renderDirectMapped = () => (
        <div className={`cache-direct-grid ${is3D ? 'view-3d' : 'view-2d'}`}>
            {cacheLines.map((line, idx) => (
                <div
                    key={idx}
                    id={`cache-line-${idx}`}
                    className={`cache-line ${line.valid ? 'valid' : 'invalid'} ${idx === accessedLineIndex ? (isHit ? 'hit' : 'miss') : ''
                        }`}
                    title={`Cache Line ${idx}\nValid: ${line.valid}\nTag: ${line.valid ? '0x' + line.tag.toString(16) : '-'}`}
                >
                    <div className="line-header">
                        <span className="line-number">L{idx}</span>
                        <span className={`valid-indicator ${line.valid ? 'valid' : 'invalid'}`}>
                            {line.valid ? '●' : '○'}
                        </span>
                    </div>
                    <div className="line-content">
                        {line.valid ? (
                            <>
                                <div className="tag-display">Tag: 0x{line.tag.toString(16).toUpperCase()}</div>
                                <div className="access-time">T={line.lastAccessTime}</div>
                            </>
                        ) : (
                            <div className="empty-state">Empty</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderSetAssociative = () => {
        const sets = [];
        for (let setNum = 0; setNum < numberOfSets; setNum++) {
            const setLines = cacheLines.slice(
                setNum * associativity,
                (setNum + 1) * associativity
            );
            sets.push({ setNum, lines: setLines });
        }

        return (
            <div className={`cache-set-grid ${is3D ? 'view-3d' : 'view-2d'}`}>
                {sets.map(({ setNum, lines }) => (
                    <div key={setNum} className="cache-set">
                        <div className="set-label">Set {setNum}</div>
                        <div className="set-ways">
                            {lines.map((line) => (
                                <div
                                    key={line.lineNumber}
                                    id={`cache-line-${line.lineNumber}`}
                                    className={`cache-line ${line.valid ? 'valid' : 'invalid'} ${line.lineNumber === accessedLineIndex ? (isHit ? 'hit' : 'miss') : ''
                                        }`}
                                    title={`Set ${setNum}, Way ${line.lineNumber % associativity}\nValid: ${line.valid}\nTag: ${line.valid ? '0x' + line.tag.toString(16) : '-'}`}
                                >
                                    <div className="line-header">
                                        <span className="way-label">W{line.lineNumber % associativity}</span>
                                        <span className={`valid-indicator ${line.valid ? 'valid' : 'invalid'}`}>
                                            {line.valid ? '●' : '○'}
                                        </span>
                                    </div>
                                    <div className="line-content">
                                        {line.valid ? (
                                            <>
                                                <div className="tag-display">0x{line.tag.toString(16).toUpperCase()}</div>
                                                <div className="access-time">T={line.lastAccessTime}</div>
                                            </>
                                        ) : (
                                            <div className="empty-state">-</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderFullyAssociative = () => (
        <div className={`cache-fully-grid ${is3D ? 'view-3d' : 'view-2d'}`}>
            <div className="fully-associative-label">Fully Associative (All blocks can go anywhere)</div>
            <div className="cache-lines-wrap">
                {cacheLines.map((line) => (
                    <div
                        key={line.lineNumber}
                        id={`cache-line-${line.lineNumber}`}
                        className={`cache-line ${line.valid ? 'valid' : 'invalid'} ${line.lineNumber === accessedLineIndex ? (isHit ? 'hit' : 'miss') : ''
                            }`}
                        title={`Cache Line ${line.lineNumber}\nValid: ${line.valid}\nTag: ${line.valid ? '0x' + line.tag.toString(16) : '-'}`}
                    >
                        <div className="line-header">
                            <span className="line-number">L{line.lineNumber}</span>
                            <span className={`valid-indicator ${line.valid ? 'valid' : 'invalid'}`}>
                                {line.valid ? '●' : '○'}
                            </span>
                        </div>
                        <div className="line-content">
                            {line.valid ? (
                                <>
                                    <div className="tag-display">0x{line.tag.toString(16).toUpperCase()}</div>
                                    <div className="access-time">T={line.lastAccessTime}</div>
                                </>
                            ) : (
                                <div className="empty-state">Empty</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="cache-grid-container">
            <div className="memory-header">
                <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                    <span className="text-xl">⚡</span> Cache Memory
                </h3>
                <div className="text-xs text-slate-400">
                    {mappingType === MappingType.DirectMapped && `Direct Mapped | ${cacheLines.length} Lines`}
                    {mappingType === MappingType.SetAssociative && `${associativity}-Way Set Associative | ${numberOfSets} Sets`}
                    {mappingType === MappingType.FullyAssociative && `Fully Associative | ${cacheLines.length} Lines`}
                </div>
            </div>

            {mappingType === MappingType.DirectMapped && renderDirectMapped()}
            {mappingType === MappingType.SetAssociative && renderSetAssociative()}
            {mappingType === MappingType.FullyAssociative && renderFullyAssociative()}
        </div>
    );
};
