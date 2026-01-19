using System;
using CacheVisualizer.Core;

namespace CacheVisualizer.Demo
{
    /// <summary>
    /// Pre-configured demo scenarios for presentations and testing.
    /// </summary>
    public class DemoScenarios
    {
        /// <summary>
        /// Scenario 1: Basic Direct Mapping Demo
        /// Shows simple cache operation with minimal configuration.
        /// </summary>
        public static void RunBasicDirectMapping()
        {
            Console.WriteLine("DEMO 1: Basic Direct Mapping");
            Console.WriteLine("=" + new string('=', 50));
            Console.WriteLine();
            
            // Small, easy-to-visualize configuration
            var config = new CacheConfiguration(
                memorySizeKB: 16,
                cacheSizeKB: 1,
                blockSizeBytes: 16,
                mappingType: MappingType.DirectMapped
            );
            
            Console.WriteLine("Configuration:");
            Console.WriteLine("  Main Memory: 16 KB");
            Console.WriteLine("  Cache Size: 1 KB (64 lines)");
            Console.WriteLine("  Block Size: 16 bytes");
            Console.WriteLine();
            
            var decoder = new AddressDecoder(config);
            var cache = new DirectMappingController(config);
            
            Console.WriteLine("Address Structure:");
            Console.WriteLine("  Tag: " + decoder.TagBits + " bits");
            Console.WriteLine("  Index: " + decoder.IndexBits + " bits");
            Console.WriteLine("  Offset: " + decoder.OffsetBits + " bits");
            Console.WriteLine();
            
            // Access sequence showing hits and misses
            int[] addresses = { 0x0000, 0x0010, 0x0020, 0x0000, 0x0400 };
            string[] descriptions = {
                "First access - cold miss",
                "Different block - compulsory miss",
                "Another block - compulsory miss",
                "Repeat access - cache hit!",
                "Same index, different tag - conflict miss"
            };
            
            Console.WriteLine("Access Sequence:");
            for (int i = 0; i < addresses.Length; i++)
            {
                var addr = decoder.Decode(addresses[i]);
                var result = cache.Access(addr);
                
                Console.WriteLine(string.Format("\n{0}. Address 0x{1:X4} - {2}",
                    i + 1, addresses[i], descriptions[i]));
                Console.WriteLine(string.Format("   Tag={0}, Index={1}, Offset={2}",
                    addr.Tag, addr.Index, addr.Offset));
                Console.WriteLine("   " + result.ToString());
            }
            
            Console.WriteLine();
            Console.WriteLine(cache.GetStatistics());
        }
        
        /// <summary>
        /// Scenario 2: Demonstrating Cache Conflicts
        /// Shows how direct mapping can cause conflicts.
        /// </summary>
        public static void RunConflictDemo()
        {
            Console.WriteLine("\nDEMO 2: Cache Conflicts in Direct Mapping");
            Console.WriteLine("=" + new string('=', 50));
            Console.WriteLine();
            Console.WriteLine("This demo shows CONFLICT MISSES - when multiple");
            Console.WriteLine("memory blocks map to the same cache line.\n");
            
            var config = new CacheConfiguration(
                memorySizeKB: 16,
                cacheSizeKB: 1,
                blockSizeBytes: 16,
                mappingType: MappingType.DirectMapped
            );
            
            var decoder = new AddressDecoder(config);
            var cache = new DirectMappingController(config);
            
            // These addresses map to the same cache line (index 0)
            // but have different tags
            int[] conflictingAddresses = { 0x0000, 0x0400, 0x0800, 0x0000 };
            
            Console.WriteLine("Accessing blocks that map to cache line 0:");
            foreach (var address in conflictingAddresses)
            {
                var addr = decoder.Decode(address);
                var result = cache.Access(addr);
                
                Console.WriteLine(string.Format("\nAddress 0x{0:X4}:", address));
                Console.WriteLine(string.Format("  Maps to line {0}, Tag = {1}",
                    addr.Index, addr.Tag));
                Console.WriteLine("  " + result.ToString());
            }
            
            Console.WriteLine("\n" + cache.GetStatistics());
            Console.WriteLine("\nConclusion: Only 1 hit due to conflicts!");
        }
        
        /// <summary>
        /// Scenario 3: Comparing Different Cache Sizes
        /// Shows impact of cache size on performance.
        /// </summary>
        public static void RunCacheSizeComparison()
        {
            Console.WriteLine("\nDEMO 3: Impact of Cache Size");
            Console.WriteLine("=" + new string('=', 50));
            Console.WriteLine();
            
            // Same access pattern, different cache sizes
            int[] accessPattern = { 0x0000, 0x0100, 0x0200, 0x0300,
                                   0x0000, 0x0100, 0x0200, 0x0300 };
            
            // Cache sizes in KB (not bytes!)
            int[] cacheSizesKB = { 1, 2, 4 };
            
            foreach (var cacheSizeKB in cacheSizesKB)
            {
                var config = new CacheConfiguration(
                    memorySizeKB: 16,
                    cacheSizeKB: cacheSizeKB,
                    blockSizeBytes: 16,
                    mappingType: MappingType.DirectMapped
                );
                
                var decoder = new AddressDecoder(config);
                var cache = new DirectMappingController(config);
                
                // Run access pattern
                foreach (var address in accessPattern)
                {
                    var addr = decoder.Decode(address);
                    cache.Access(addr);
                }
                
                Console.WriteLine(string.Format("Cache Size: {0} KB ({1} lines)",
                    cacheSizeKB, config.TotalCacheLines));
                Console.WriteLine(string.Format("  Hit Rate: {0:P1}, Misses: {1}",
                    cache.HitRate, cache.TotalMisses));
            }
            
            Console.WriteLine("\nConclusion: Larger cache = higher hit rate!");
        }
        
        /// <summary>
        /// Scenario 4: Sequential vs Random Access Patterns
        /// </summary>
        public static void RunAccessPatternDemo()
        {
            Console.WriteLine("\nDEMO 4: Access Pattern Analysis");
            Console.WriteLine("=" + new string('=', 50));
            Console.WriteLine();
            
            var config = new CacheConfiguration(
                memorySizeKB: 16,
                cacheSizeKB: 1,
                blockSizeBytes: 16,
                mappingType: MappingType.DirectMapped
            );
            
            var decoder = new AddressDecoder(config);
            
            // Sequential access
            Console.WriteLine("A) Sequential Access (good locality):");
            var cache1 = new DirectMappingController(config);
            for (int i = 0; i < 8; i++)
            {
                var addr = decoder.Decode(i * 16);
                cache1.Access(addr);
            }
            // Repeat
            for (int i = 0; i < 8; i++)
            {
                var addr = decoder.Decode(i * 16);
                cache1.Access(addr);
            }
            Console.WriteLine(string.Format("  Hit Rate: {0:P1}", cache1.HitRate));
            
            // Strided access (conflicts)
            Console.WriteLine("\nB) Strided Access (causes conflicts):");
            var cache2 = new DirectMappingController(config);
            int stride = 1024; // Causes conflicts
            for (int i = 0; i < 8; i++)
            {
                var addr = decoder.Decode(i * stride);
                cache2.Access(addr);
            }
            // Repeat
            for (int i = 0; i < 8; i++)
            {
                var addr = decoder.Decode(i * stride);
                cache2.Access(addr);
            }
            Console.WriteLine(string.Format("  Hit Rate: {0:P1}", cache2.HitRate));
            
            Console.WriteLine("\nConclusion: Access pattern matters!");
        }
    }
}
