import type { CacheConfiguration } from "./types";

export interface AddressComponents {
    address: number;
    tag: number;
    index: number;
    offset: number;
    blockNumber: number;
}

export class AddressDecoder {
    private config: CacheConfiguration;

    public offsetBits: number = 0;
    public indexBits: number = 0;
    public tagBits: number = 0;

    private offsetMask: number = 0;
    private indexMask: number = 0;
    private tagMask: number = 0;
    private addressBits: number = 0;

    constructor(config: CacheConfiguration) {
        this.config = config;
        this.calculateBitFields();
        this.createBitMasks();
    }

    private calculateBitFields(): void {
        // Offset bits = log2(Block Size)
        this.offsetBits = Math.log2(this.config.blockSizeBytes);

        // Total Cache Lines = (Cache Size * 1024) / Block Size
        const totalCacheLines = (this.config.cacheSizeKB * 1024) / this.config.blockSizeBytes;

        // Number of Sets
        // Direct: Sets = Total Lines (Associativity = 1)
        // Set Associative: Sets = Total Lines / Way
        // Fully: Sets = 1
        const numSets = this.config.associativity > 0
            ? totalCacheLines / this.config.associativity
            : 1;

        this.indexBits = Math.log2(numSets);

        // Address Bits (assuming 32-bit or derived from memory size, 
        // usually we just use what's left or a fixed size, but C# code derived it from memory size)
        // Memory Size in Bytes
        const memorySizeBytes = this.config.memorySizeKB * 1024;
        this.addressBits = Math.ceil(Math.log2(memorySizeBytes));

        this.tagBits = this.addressBits - this.offsetBits - this.indexBits;
    }

    private createBitMasks(): void {
        this.offsetMask = (1 << this.offsetBits) - 1;
        this.indexMask = (1 << this.indexBits) - 1;
        this.tagMask = (1 << this.tagBits) - 1;
    }

    public decode(address: number): AddressComponents {
        const offset = address & this.offsetMask;
        const index = (address >> this.offsetBits) & this.indexMask;
        const tag = (address >> (this.offsetBits + this.indexBits)) & this.tagMask;
        const blockNumber = Math.floor(address / this.config.blockSizeBytes);

        return {
            address,
            tag,
            index,
            offset,
            blockNumber
        };
    }

    public getBitCounts() {
        return {
            tag: this.tagBits,
            index: this.indexBits,
            offset: this.offsetBits,
            total: this.addressBits
        };
    }
}
