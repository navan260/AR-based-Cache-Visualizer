
export interface CacheLineData {
    lineNumber: number;
    valid: boolean;
    tag: number;
    data: number[];  // Placeholder data bytes
    insertionTime: number;
    lastAccessTime: number;
}

export class CacheLine {
    public lineNumber: number;
    public valid: boolean = false;
    public tag: number = 0;
    public data: number[] = [];
    public insertionTime: number = 0;
    public lastAccessTime: number = 0;

    constructor(lineNumber: number, blockSize: number) {
        this.lineNumber = lineNumber;
        this.data = new Array(blockSize).fill(0);
    }

    public matches(tag: number): boolean {
        return this.valid && this.tag === tag;
    }

    public loadBlock(tag: number, time: number): void {
        this.valid = true;
        this.tag = tag;
        this.insertionTime = time;
        this.lastAccessTime = time;
    }

    public recordAccess(time: number): void {
        this.lastAccessTime = time;
    }

    public invalidate(): void {
        this.valid = false;
        this.tag = 0;
        this.insertionTime = 0;
        this.lastAccessTime = 0;
    }

    public toData(): CacheLineData {
        return {
            lineNumber: this.lineNumber,
            valid: this.valid,
            tag: this.tag,
            data: [...this.data],
            insertionTime: this.insertionTime,
            lastAccessTime: this.lastAccessTime
        };
    }
}
