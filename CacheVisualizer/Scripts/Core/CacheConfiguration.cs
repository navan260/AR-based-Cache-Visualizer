using System;

namespace CacheVisualizer.Core
{
    /// <summary>
    /// Stores configuration parameters for cache and main memory.
    /// This class defines the architecture of the cache system.
    /// </summary>
    public class CacheConfiguration
    {
        // Memory Configuration
        public int MemorySizeKB { get; set; }           // Total main memory size in KB
        public int AddressBits { get; set; }             // Total bits in memory address
        
        // Cache Configuration
        public int CacheSizeKB { get; set; }             // Total cache size in KB
        public int BlockSizeBytes { get; set; }          // Size of each cache block in bytes
        
        // Mapping Configuration
        public MappingType MappingType { get; set; }     // Type of mapping technique
        public int Associativity { get; set; }           // N-way associativity (1=direct, 0=fully)
        
        // Replacement Policy
        public ReplacementPolicy ReplacementPolicy { get; set; }
        
        // Calculated Properties
        public int TotalCacheLines
        {
            get { return (CacheSizeKB * 1024) / BlockSizeBytes; }
        }
        
        public int NumberOfSets
        {
            get { return Associativity > 0 ? TotalCacheLines / Associativity : 1; }
        }
        
        public int MemorySizeBytes
        {
            get { return MemorySizeKB * 1024; }
        }
        
        public int TotalMemoryBlocks
        {
            get { return MemorySizeBytes / BlockSizeBytes; }
        }
        
        /// <summary>
        /// Creates a cache configuration with the given parameters.
        /// </summary>
        public CacheConfiguration(
            int memorySizeKB, 
            int cacheSizeKB, 
            int blockSizeBytes, 
            MappingType mappingType,
            int associativity = 1,
            ReplacementPolicy replacementPolicy = ReplacementPolicy.FIFO)
        {
            MemorySizeKB = memorySizeKB;
            CacheSizeKB = cacheSizeKB;
            BlockSizeBytes = blockSizeBytes;
            MappingType = mappingType;
            Associativity = associativity;
            ReplacementPolicy = replacementPolicy;
            
            // Calculate address bits needed for this memory size
            AddressBits = (int)Math.Ceiling(Math.Log(MemorySizeBytes, 2));
        }
        
        /// <summary>
        /// Validates the configuration parameters.
        /// </summary>
        public bool IsValid(out string errorMessage)
        {
            // Check if values are powers of 2
            if (!IsPowerOfTwo(BlockSizeBytes))
            {
                errorMessage = "Block size must be a power of 2";
                return false;
            }
            
            if (!IsPowerOfTwo(CacheSizeKB * 1024))
            {
                errorMessage = "Cache size must be a power of 2";
                return false;
            }
            
            // Check if cache size is smaller than memory
            if (CacheSizeKB >= MemorySizeKB)
            {
                errorMessage = "Cache size must be smaller than memory size";
                return false;
            }
            
            // Check associativity
            if (MappingType == MappingType.FullyAssociative)
            {
                if (Associativity != TotalCacheLines)
                {
                    errorMessage = "Fully associative requires associativity = total cache lines";
                    return false;
                }
            }
            else if (MappingType == MappingType.DirectMapped)
            {
                if (Associativity != 1)
                {
                    errorMessage = "Direct mapping requires associativity = 1";
                    return false;
                }
            }
            else if (MappingType == MappingType.SetAssociative)
            {
                if (Associativity <= 1 || Associativity >= TotalCacheLines)
                {
                    errorMessage = "Set associative requires 1 < associativity < total cache lines";
                    return false;
                }
            }
            
            errorMessage = string.Empty;
            return true;
        }
        
        /// <summary>
        /// Checks if a number is a power of 2.
        /// </summary>
        private bool IsPowerOfTwo(int value)
        {
            return value > 0 && (value & (value - 1)) == 0;
        }
        
        /// <summary>
        /// Returns a string representation of the configuration.
        /// </summary>
        public override string ToString()
        {
            return string.Format("Memory: {0}KB, Cache: {1}KB, Block: {2}B, Lines: {3}, Mapping: {4}, Associativity: {5}-way",
                MemorySizeKB, CacheSizeKB, BlockSizeBytes, TotalCacheLines, MappingType, Associativity);
        }
    }
    
    /// <summary>
    /// Enumeration of cache mapping techniques.
    /// </summary>
    public enum MappingType
    {
        DirectMapped,       // 1-to-1 mapping
        SetAssociative,     // N-way set associative
        FullyAssociative    // Any block to any line
    }
    
    /// <summary>
    /// Enumeration of cache replacement policies.
    /// </summary>
    public enum ReplacementPolicy
    {
        FIFO,   // First In First Out
        LRU,    // Least Recently Used
        Random  // Random replacement
    }
}
