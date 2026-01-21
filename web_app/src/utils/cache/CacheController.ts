import { MappingType } from "./types";
import type { CacheConfiguration, CacheStatistics } from "./types";
import { AddressDecoder } from "./AddressDecoder";
import type { AddressComponents } from "./AddressDecoder";
import { CacheLine } from "./CacheLine";
import type { CacheLineData } from "./CacheLine";
import { ReplacementPolicyManager } from "./ReplacementPolicyManager";

export interface CacheAccessResult {
    isHit: boolean;
    cacheLineIndex: number;
    tag: number;
    previousTag: number;
    wasValid: boolean;
    accessTime: number;
    replacedLine: number;
    addressComponents: AddressComponents;
}

export class CacheController {
    private config: CacheConfiguration;
    private decoder: AddressDecoder;
    private cacheLines: CacheLine[];
    private replacementPolicy: ReplacementPolicyManager;
    private accessCounter: number = 0;

    private totalAccesses: number = 0;
    private totalHits: number = 0;
    private totalMisses: number = 0;

    private accessHistory: CacheAccessResult[] = [];

    constructor(config: CacheConfiguration) {
        this.config = config;
        this.decoder = new AddressDecoder(config);
        this.replacementPolicy = new ReplacementPolicyManager(config.replacementPolicy);

        const totalLines = this.getTotalCacheLines();
        this.cacheLines = [];
        for (let i = 0; i < totalLines; i++) {
            this.cacheLines.push(new CacheLine(i, config.blockSizeBytes));
        }
    }

    public getTotalCacheLines(): number {
        return (this.config.cacheSizeKB * 1024) / this.config.blockSizeBytes;
    }

    public getNumberOfSets(): number {
        if (this.config.mappingType === MappingType.FullyAssociative) {
            return 1;
        }
        return this.getTotalCacheLines() / this.config.associativity;
    }

    public access(address: number): CacheAccessResult {
        this.totalAccesses++;
        this.accessCounter++;

        const addrComponents = this.decoder.decode(address);

        let result: CacheAccessResult;

        switch (this.config.mappingType) {
            case MappingType.DirectMapped:
                result = this.accessDirectMapped(addrComponents);
                break;
            case MappingType.SetAssociative:
                result = this.accessSetAssociative(addrComponents);
                break;
            case MappingType.FullyAssociative:
                result = this.accessFullyAssociative(addrComponents);
                break;
            default:
                throw new Error("Unknown mapping type");
        }

        this.accessHistory.push(result);
        return result;
    }

    private accessDirectMapped(addr: AddressComponents): CacheAccessResult {
        const lineIndex = addr.index;
        const line = this.cacheLines[lineIndex];

        const isHit = line.matches(addr.tag);

        if (isHit) {
            this.totalHits++;
            line.recordAccess(this.accessCounter);
            return {
                isHit: true,
                cacheLineIndex: lineIndex,
                tag: addr.tag,
                previousTag: line.tag,
                wasValid: true,
                accessTime: this.accessCounter,
                replacedLine: -1,
                addressComponents: addr
            };
        } else {
            this.totalMisses++;
            const wasValid = line.valid;
            const previousTag = line.tag;
            line.loadBlock(addr.tag, this.accessCounter);
            return {
                isHit: false,
                cacheLineIndex: lineIndex,
                tag: addr.tag,
                previousTag: previousTag,
                wasValid: wasValid,
                accessTime: this.accessCounter,
                replacedLine: wasValid ? lineIndex : -1,
                addressComponents: addr
            };
        }
    }

    private accessSetAssociative(addr: AddressComponents): CacheAccessResult {
        const setNumber = addr.index;
        const set = this.getSet(setNumber);

        // Search for hit
        const hitLine = set.find(line => line.matches(addr.tag));

        if (hitLine) {
            this.totalHits++;
            hitLine.recordAccess(this.accessCounter);
            return {
                isHit: true,
                cacheLineIndex: hitLine.lineNumber,
                tag: addr.tag,
                previousTag: hitLine.tag,
                wasValid: true,
                accessTime: this.accessCounter,
                replacedLine: -1,
                addressComponents: addr
            };
        } else {
            this.totalMisses++;
            // Check for empty line
            const emptyLine = set.find(line => !line.valid);

            let targetLine: CacheLine;
            let wasReplacement = false;
            let previousTag = 0;

            if (emptyLine) {
                targetLine = emptyLine;
            } else {
                targetLine = this.replacementPolicy.selectVictim(set);
                wasReplacement = true;
                previousTag = targetLine.tag;
            }

            targetLine.loadBlock(addr.tag, this.accessCounter);
            return {
                isHit: false,
                cacheLineIndex: targetLine.lineNumber,
                tag: addr.tag,
                previousTag: previousTag,
                wasValid: wasReplacement,
                accessTime: this.accessCounter,
                replacedLine: wasReplacement ? targetLine.lineNumber : -1,
                addressComponents: addr
            };
        }
    }

    private accessFullyAssociative(addr: AddressComponents): CacheAccessResult {
        // In fully associative, all lines are one set
        return this.accessSetAssociative({ ...addr, index: 0 });
    }

    private getSet(setNumber: number): CacheLine[] {
        const linesPerSet = this.config.associativity;
        const startIndex = setNumber * linesPerSet;
        return this.cacheLines.slice(startIndex, startIndex + linesPerSet);
    }

    public getAllCacheLinesData(): CacheLineData[] {
        return this.cacheLines.map(line => line.toData());
    }

    public getStatistics(): CacheStatistics {
        return {
            totalAccesses: this.totalAccesses,
            hits: this.totalHits,
            misses: this.totalMisses,
            hitRate: this.totalAccesses > 0 ? this.totalHits / this.totalAccesses : 0,
            missRate: this.totalAccesses > 0 ? this.totalMisses / this.totalAccesses : 0
        };
    }

    public getDecoder(): AddressDecoder {
        return this.decoder;
    }

    public getConfig(): CacheConfiguration {
        return this.config;
    }

    public getAccessHistory(): CacheAccessResult[] {
        return this.accessHistory;
    }

    public reset(): void {
        for (const line of this.cacheLines) {
            line.invalidate();
        }
        this.accessCounter = 0;
        this.totalAccesses = 0;
        this.totalHits = 0;
        this.totalMisses = 0;
        this.accessHistory = [];
    }
}
