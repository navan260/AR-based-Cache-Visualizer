import { CacheLine } from "./CacheLine";
import { ReplacementPolicy } from "./types";

export class ReplacementPolicyManager {
    private policy: ReplacementPolicy;

    constructor(policy: ReplacementPolicy) {
        this.policy = policy;
    }

    public selectVictim(lines: CacheLine[]): CacheLine {
        if (!lines || lines.length === 0) {
            throw new Error("Lines array cannot be empty");
        }

        switch (this.policy) {
            case ReplacementPolicy.FIFO:
                return this.selectFIFO(lines);
            case ReplacementPolicy.LRU:
                return this.selectLRU(lines);
            case ReplacementPolicy.Random:
                return this.selectRandom(lines);
            default:
                throw new Error(`Policy ${this.policy} not implemented`);
        }
    }

    private selectFIFO(lines: CacheLine[]): CacheLine {
        // Find line with smallest insertion time
        return lines.reduce((oldest, current) =>
            current.insertionTime < oldest.insertionTime ? current : oldest
        );
    }

    private selectLRU(lines: CacheLine[]): CacheLine {
        // Find line with smallest last access time
        return lines.reduce((lru, current) =>
            current.lastAccessTime < lru.lastAccessTime ? current : lru
        );
    }

    private selectRandom(lines: CacheLine[]): CacheLine {
        const index = Math.floor(Math.random() * lines.length);
        return lines[index];
    }

    public getPolicyDescription(): string {
        switch (this.policy) {
            case ReplacementPolicy.FIFO:
                return "FIFO (First In First Out): Replaces the oldest block in the cache";
            case ReplacementPolicy.LRU:
                return "LRU (Least Recently Used): Replaces the block that hasn't been used for the longest time";
            case ReplacementPolicy.Random:
                return "Random: Randomly selects a block to replace";
            default:
                return "Unknown policy";
        }
    }
}
