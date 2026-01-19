using System;
using System.Linq;

namespace CacheVisualizer.Core
{
    /// <summary>
    /// Manages cache replacement policies (FIFO, LRU, Random).
    /// </summary>
    public class ReplacementPolicyManager
    {
        private ReplacementPolicy _policy;
        private Random _random;
        
        public ReplacementPolicyManager(ReplacementPolicy policy)
        {
            _policy = policy;
            _random = new Random();
        }
        
        /// <summary>
        /// Selects a victim cache line to replace based on the policy.
        /// </summary>
        /// <param name="lines">Array of cache lines to choose from</param>
        /// <returns>The cache line to replace</returns>
        public CacheLine SelectVictim(CacheLine[] lines)
        {
            if (lines == null || lines.Length == 0)
                throw new ArgumentException("Lines array cannot be empty");
            
            switch (_policy)
            {
                case ReplacementPolicy.FIFO:
                    return SelectFIFO(lines);
                
                case ReplacementPolicy.LRU:
                    return SelectLRU(lines);
                
                case ReplacementPolicy.Random:
                    return SelectRandom(lines);
                
                default:
                    throw new NotImplementedException($"Policy {_policy} not implemented");
            }
        }
        
        /// <summary>
        /// FIFO: First In First Out
        /// Replaces the line that was inserted earliest.
        /// </summary>
        private CacheLine SelectFIFO(CacheLine[] lines)
        {
            // Find line with smallest insertion time
            return lines.OrderBy(line => line.InsertionTime).First();
        }
        
        /// <summary>
        /// LRU: Least Recently Used
        /// Replaces the line that was accessed longest ago.
        /// </summary>
        private CacheLine SelectLRU(CacheLine[] lines)
        {
            // Find line with smallest last access time
            return lines.OrderBy(line => line.LastAccessTime).First();
        }
        
        /// <summary>
        /// Random: Random replacement
        /// Selects a random line to replace.
        /// </summary>
        private CacheLine SelectRandom(CacheLine[] lines)
        {
            int index = _random.Next(lines.Length);
            return lines[index];
        }
        
        /// <summary>
        /// Returns a description of the current policy.
        /// </summary>
        public string GetPolicyDescription()
        {
            switch (_policy)
            {
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
}
