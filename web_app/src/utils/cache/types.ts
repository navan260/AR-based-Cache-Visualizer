
export const MappingType = {
    DirectMapped: "DirectMapped",
    SetAssociative: "SetAssociative",
    FullyAssociative: "FullyAssociative"
} as const;

export type MappingType = typeof MappingType[keyof typeof MappingType];

export const ReplacementPolicy = {
    FIFO: "FIFO",
    LRU: "LRU",
    Random: "Random"
} as const;

export type ReplacementPolicy = typeof ReplacementPolicy[keyof typeof ReplacementPolicy];

export interface CacheConfiguration {
    memorySizeKB: number;
    cacheSizeKB: number;
    blockSizeBytes: number;
    mappingType: MappingType;
    associativity: number;
    replacementPolicy: ReplacementPolicy;
}

export interface CacheStatistics {
    totalAccesses: number;
    hits: number;
    misses: number;
    hitRate: number;
    missRate: number;
}
