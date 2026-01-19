using System;
using System.Linq;

namespace CacheVisualizer.Core
{
    /// <summary>
    /// Implements Fully Associative Mapping.
    /// 
    /// In fully associative mapping:
    /// - Any memory block can go to ANY cache line
    /// - No index field (all tag and offset)
    /// - Must compare tag with ALL cache lines
    /// - Most flexible but requires most hardware
    /// </summary>
    public class FullyAssociativeMappingController
    {
        private CacheConfiguration _config;
        private CacheLine[] _cacheLines;
        private ReplacementPolicyManager _replacementPolicy;
        private int _accessCounter;
        
        public int TotalAccesses { get; private set; }
        public int TotalHits { get; private set; }
        public int TotalMisses { get; private set; }
        
        public double HitRate => TotalAccesses > 0 ? (double)TotalHits / TotalAccesses : 0;
        public double MissRate => TotalAccesses > 0 ? (double)TotalMisses / TotalAccesses : 0;
        
        /// <summary>
        /// Initializes the fully associative mapping controller.
        /// </summary>
        public FullyAssociativeMappingController(CacheConfiguration config)
        {
            if (config.MappingType != MappingType.FullyAssociative)
            {
                throw new ArgumentException("Configuration must be for fully associative mapping");
            }
            
            _config = config;
            _cacheLines = new CacheLine[_config.TotalCacheLines];
            _replacementPolicy = new ReplacementPolicyManager(config.ReplacementPolicy);
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
        /// Note: In fully associative, we still use the address components,
        /// but the "index" is effectively part of the tag.
        /// </summary>
        public CacheAccessResult Access(AddressComponents address)
        {
            TotalAccesses++;
            _accessCounter++;
            
            // In fully associative, we need to check ALL cache lines
            // The effective tag is the block number (since there's no index restriction)
            int effectiveTag = address.BlockNumber;
            
            // Search ALL cache lines for matching tag
            CacheLine hitLine = _cacheLines.FirstOrDefault(line => 
                line.Valid && line.Tag == effectiveTag);
            
            if (hitLine != null)
            {
                // Cache Hit!
                TotalHits++;
                hitLine.RecordAccess(_accessCounter);
                
                return new CacheAccessResult
                {
                    IsHit = true,
                    CacheLineIndex = hitLine.LineNumber,
                    Tag = effectiveTag,
                    PreviousTag = hitLine.Tag,
                    WasValid = true,
                    AccessTime = _accessCounter
                };
            }
            else
            {
                // Cache Miss
                TotalMisses++;
                
                // Check if there's an empty line
                CacheLine emptyLine = _cacheLines.FirstOrDefault(line => !line.Valid);
                
                CacheLine targetLine;
                bool wasReplacement = false;
                int previousTag = 0;
                
                if (emptyLine != null)
                {
                    // Use empty line
                    targetLine = emptyLine;
                }
                else
                {
                    // Cache is full - use replacement policy
                    targetLine = _replacementPolicy.SelectVictim(_cacheLines);
                    wasReplacement = true;
                    previousTag = targetLine.Tag;
                }
                
                // Load new block
                targetLine.LoadBlock(effectiveTag, _accessCounter);
                
                return new CacheAccessResult
                {
                    IsHit = false,
                    CacheLineIndex = targetLine.LineNumber,
                    Tag = effectiveTag,
                    PreviousTag = previousTag,
                    WasValid = wasReplacement,
                    AccessTime = _accessCounter,
                    ReplacedLine = wasReplacement ? targetLine.LineNumber : -1
                };
            }
        }
        
        /// <summary>
        /// Gets a specific cache line.
        /// </summary>
        public CacheLine GetCacheLine(int index)
        {
            if (index < 0 || index >= _cacheLines.Length)
                throw new ArgumentOutOfRangeException(nameof(index));
            
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
            return $"Fully Associative Statistics:\n" +
                   $"  Total Accesses: {TotalAccesses}\n" +
                   $"  Hits: {TotalHits}\n" +
                   $"  Misses: {TotalMisses}\n" +
                   $"  Hit Rate: {HitRate:P2}\n" +
                   $"  Miss Rate: {MissRate:P2}\n" +
                   $"  Replacement Policy: {_config.ReplacementPolicy}";
        }
    }
}
