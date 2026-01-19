using System;

namespace CacheVisualizer.Core
{
    /// <summary>
    /// Implements Direct Mapping cache technique.
    /// 
    /// In direct mapping:
    /// - Each memory block maps to exactly ONE cache line
    /// - Cache Line = Memory Block Number % Total Cache Lines
    /// - No replacement policy needed (deterministic)
    /// </summary>
    public class DirectMappingController
    {
        private CacheConfiguration _config;
        private CacheLine[] _cacheLines;
        private int _accessCounter;
        
        public int TotalAccesses { get; private set; }
        public int TotalHits { get; private set; }
        public int TotalMisses { get; private set; }
        
        public double HitRate
        {
            get { return TotalAccesses > 0 ? (double)TotalHits / TotalAccesses : 0; }
        }
        
        public double MissRate
        {
            get { return TotalAccesses > 0 ? (double)TotalMisses / TotalAccesses : 0; }
        }
        
        /// <summary>
        /// Initializes the direct mapping controller.
        /// </summary>
        public DirectMappingController(CacheConfiguration config)
        {
            if (config.MappingType != MappingType.DirectMapped)
            {
                throw new ArgumentException("Configuration must be for direct mapping");
            }
            
            _config = config;
            _cacheLines = new CacheLine[_config.TotalCacheLines];
            _accessCounter = 0;
            
            // Initialize all cache lines
            for (int i = 0; i < _cacheLines.Length; i++)
            {
                _cacheLines[i] = new CacheLine(i, _config.BlockSizeBytes);
            }
            
            TotalAccesses = 0;
            TotalHits = 0;
            TotalMisses = 0;
        }
        
        /// <summary>
        /// Accesses the cache with the given address components.
        /// </summary>
        /// <returns>CacheAccessResult with hit/miss information</returns>
        public CacheAccessResult Access(AddressComponents address)
        {
            TotalAccesses++;
            _accessCounter++;
            
            // Calculate which cache line this address maps to
            // For direct mapping: line = index (since index already represents the line)
            int lineIndex = address.Index;
            
            CacheLine line = _cacheLines[lineIndex];
            
            // Check for cache hit
            bool isHit = line.Matches(address.Tag);
            
            if (isHit)
            {
                // Cache Hit!
                TotalHits++;
                line.RecordAccess(_accessCounter);
                
                return new CacheAccessResult
                {
                    IsHit = true,
                    CacheLineIndex = lineIndex,
                    Tag = address.Tag,
                    PreviousTag = line.Tag,
                    WasValid = true,
                    AccessTime = _accessCounter
                };
            }
            else
            {
                // Cache Miss
                TotalMisses++;
                
                bool wasValid = line.Valid;
                int previousTag = line.Tag;
                
                // Load new block into cache (no choice in direct mapping)
                line.LoadBlock(address.Tag, _accessCounter);
                
                return new CacheAccessResult
                {
                    IsHit = false,
                    CacheLineIndex = lineIndex,
                    Tag = address.Tag,
                    PreviousTag = previousTag,
                    WasValid = wasValid,
                    AccessTime = _accessCounter,
                    ReplacedLine = wasValid ? lineIndex : -1
                };
            }
        }
        
        /// <summary>
        /// Gets a specific cache line.
        /// </summary>
        public CacheLine GetCacheLine(int index)
        {
            if (index < 0 || index >= _cacheLines.Length)
                throw new ArgumentOutOfRangeException("index");
            
            return _cacheLines[index];
        }
        
        /// <summary>
        /// Gets all cache lines.
        /// </summary>
        public CacheLine[] GetAllCacheLines()
        {
            return _cacheLines;
        }
        
        /// <summary>
        /// Resets the cache to initial state.
        /// </summary>
        public void Reset()
        {
            foreach (var line in _cacheLines)
            {
                line.Invalidate();
            }
            
            _accessCounter = 0;
            TotalAccesses = 0;
            TotalHits = 0;
            TotalMisses = 0;
        }
        
        /// <summary>
        /// Returns cache statistics.
        /// </summary>
        public string GetStatistics()
        {
            return string.Format("Direct Mapping Statistics:\n  Total Accesses: {0}\n  Hits: {1}\n  Misses: {2}\n  Hit Rate: {3:P2}\n  Miss Rate: {4:P2}",
                TotalAccesses, TotalHits, TotalMisses, HitRate, MissRate);
        }
    }
}
