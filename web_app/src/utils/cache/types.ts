
export enum MappingType {
    DirectMapped = "DirectMapped",
    SetAssociative = "SetAssociative",
    FullyAssociative = "FullyAssociative"
}

export enum ReplacementPolicy {
    FIFO = "FIFO",
    LRU = "LRU",
    Random = "Random"
}

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
