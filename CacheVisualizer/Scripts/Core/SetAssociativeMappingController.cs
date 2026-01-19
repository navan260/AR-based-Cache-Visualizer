using System;
using System.Collections.Generic;
using System.Linq;

namespace CacheVisualizer.Core
{
    /// <summary>
    /// Implements N-way Set Associative Mapping.
    /// 
    /// In set associative mapping:
    /// - Cache is divided into sets
    /// - Each memory block maps to a specific set
    /// - Within a set, block can go to any line (N-way)
    /// - Requires replacement policy when set is full
    /// </summary>
    public class SetAssociativeMappingController
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
        /// Initializes the set associative mapping controller.
        /// </summary>
        public SetAssociativeMappingController(CacheConfiguration config)
        {
            if (config.MappingType != MappingType.SetAssociative)
            {
                throw new ArgumentException("Configuration must be for set associative mapping");
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
        /// </summary>
        public CacheAccessResult Access(AddressComponents address)
        {
            TotalAccesses++;
            _accessCounter++;
            
            // Calculate which set this address maps to
            int setNumber = address.Index;
            
            // Get all lines in this set
            CacheLine[] set = GetSet(setNumber);
            
            // Search for matching tag within the set
            CacheLine hitLine = set.FirstOrDefault(line => line.Matches(address.Tag));
            
            if (hitLine != null)
            {
                // Cache Hit!
                TotalHits++;
                hitLine.RecordAccess(_accessCounter);
                
                return new CacheAccessResult
                {
                    IsHit = true,
                    CacheLineIndex = hitLine.LineNumber,
                    Tag = address.Tag,
                    PreviousTag = hitLine.Tag,
                    WasValid = true,
                    AccessTime = _accessCounter
                };
            }
            else
            {
                // Cache Miss - need to find a line to replace
                TotalMisses++;
                
                // Check if there's an empty line in the set
                CacheLine emptyLine = set.FirstOrDefault(line => !line.Valid);
                
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
                    // Set is full - use replacement policy
                    targetLine = _replacementPolicy.SelectVictim(set);
                    wasReplacement = true;
                    previousTag = targetLine.Tag;
                }
                
                // Load new block
                targetLine.LoadBlock(address.Tag, _accessCounter);
                
                return new CacheAccessResult
                {
                    IsHit = false,
                    CacheLineIndex = targetLine.LineNumber,
                    Tag = address.Tag,
                    PreviousTag = previousTag,
                    WasValid = wasReplacement,
                    AccessTime = _accessCounter,
                    ReplacedLine = wasReplacement ? targetLine.LineNumber : -1
                };
            }
        }
        
        /// <summary>
        /// Gets all cache lines in a specific set.
        /// </summary>
        private CacheLine[] GetSet(int setNumber)
        {
            int linesPerSet = _config.Associativity;
            int startIndex = setNumber * linesPerSet;
            
            CacheLine[] set = new CacheLine[linesPerSet];
            Array.Copy(_cacheLines, startIndex, set, 0, linesPerSet);
            
            return set;
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
            return $"{_config.Associativity}-Way Set Associative Statistics:\n" +
                   $"  Total Accesses: {TotalAccesses}\n" +
                   $"  Hits: {TotalHits}\n" +
                   $"  Misses: {TotalMisses}\n" +
                   $"  Hit Rate: {HitRate:P2}\n" +
                   $"  Miss Rate: {MissRate:P2}\n" +
                   $"  Replacement Policy: {_config.ReplacementPolicy}";
        }
    }
}
