using System;

namespace CacheVisualizer.Core
{
    /// <summary>
    /// Represents a single line/block in the cache memory.
    /// </summary>
    public class CacheLine
    {
        public int LineNumber { get; set; }         // Line index in cache
        public bool Valid { get; set; }              // Valid bit
        public bool Dirty { get; set; }              // Dirty bit (for write-back)
        public int Tag { get; set; }                 // Tag field
        public byte[] Data { get; set; }             // Actual data (not used in this visualization)
        
        // Metadata for replacement policies
        public int LastAccessTime { get; set; }      // For LRU
        public int InsertionTime { get; set; }       // For FIFO
        public int AccessCount { get; set; }         // Statistics
        
        /// <summary>
        /// Creates a new empty cache line.
        /// </summary>
        public CacheLine(int lineNumber, int blockSize)
        {
            LineNumber = lineNumber;
            Valid = false;
            Dirty = false;
            Tag = 0;
            Data = new byte[blockSize];
            LastAccessTime = 0;
            InsertionTime = 0;
            AccessCount = 0;
        }
        
        /// <summary>
        /// Loads a memory block into this cache line.
        /// </summary>
        public void LoadBlock(int tag, int currentTime)
        {
            Valid = true;
            Dirty = false;
            Tag = tag;
            InsertionTime = currentTime;
            LastAccessTime = currentTime;
            AccessCount = 0;
        }
        
        /// <summary>
        /// Records an access to this cache line.
        /// </summary>
        public void RecordAccess(int currentTime)
        {
            LastAccessTime = currentTime;
            AccessCount++;
        }
        
        /// <summary>
        /// Invalidates this cache line.
        /// </summary>
        public void Invalidate()
        {
            Valid = false;
            Dirty = false;
            Tag = 0;
            AccessCount = 0;
        }
        
        /// <summary>
        /// Checks if this line contains the given tag.
        /// </summary>
        public bool Matches(int tag)
        {
            return Valid && Tag == tag;
        }
        
        public override string ToString()
        {
            if (!Valid)
                return string.Format("Line {0}: [INVALID]", LineNumber);
            
            return string.Format("Line {0}: Valid={1}, Tag={2:X}, Dirty={3}, Accesses={4}",
                LineNumber, Valid, Tag, Dirty, AccessCount);
        }
    }
}
