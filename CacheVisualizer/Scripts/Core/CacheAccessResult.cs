using System;

namespace CacheVisualizer.Core
{
    /// <summary>
    /// Result of a cache access operation.
    /// </summary>
    public class CacheAccessResult
    {
        public bool IsHit { get; set; }             // Was it a cache hit?
        public int CacheLineIndex { get; set; }     // Which line was accessed
        public int Tag { get; set; }                // Tag being accessed
        public int PreviousTag { get; set; }        // Tag that was replaced (if any)
        public bool WasValid { get; set; }          // Was the line valid before?
        public int AccessTime { get; set; }         // Access timestamp
        public int ReplacedLine { get; set; }       // Line that was replaced (-1 if none)
        
        public override string ToString()
        {
            if (IsHit)
            {
                return string.Format("✓ CACHE HIT at Line {0}", CacheLineIndex);
            }
            else
            {
                if (WasValid)
                {
                    return string.Format("✗ CACHE MISS at Line {0} (Replaced tag 0x{1:X} with 0x{2:X})",
                        CacheLineIndex, PreviousTag, Tag);
                }
                else
                {
                    return string.Format("✗ CACHE MISS at Line {0} (Loaded tag 0x{1:X} into empty line)",
                        CacheLineIndex, Tag);
                }
            }
        }
    }
}
