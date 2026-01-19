using System;
using CacheVisualizer.Core;

namespace CacheVisualizer.Tests
{
    /// <summary>
    /// Test program to verify cache logic without Unity.
    /// This demonstrates all core functionality.
    /// </summary>
    class CacheSimulatorTest
    {
        static void Main(string[] args)
        {
            Console.WriteLine("===========================================");
            Console.WriteLine("  AR Cache Visualizer - Core Logic Test  ");
            Console.WriteLine("===========================================\n");
            
            // Run all tests
            TestAddressDecoder();
            Console.WriteLine("\n" + new string('=', 43) + "\n");
            
            TestDirectMapping();
            Console.WriteLine("\n" + new string('=', 43) + "\n");
            
            TestSetAssociativeMapping();
            Console.WriteLine("\n" + new string('=', 43) + "\n");
            
            TestFullyAssociativeMapping();
            Console.WriteLine("\n" + new string('=', 43) + "\n");
            
            TestReplacementPolicies();
            
            Console.WriteLine("\n===========================================");
            Console.WriteLine("  All Tests Completed Successfully! ✓");
            Console.WriteLine("===========================================");
            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
        }
        
        static void TestAddressDecoder()
        {
            Console.WriteLine("TEST 1: Address Decoder");
            Console.WriteLine("-------------------------");
            
            // Create configuration: 16KB memory, 1KB cache, 16B blocks
            var config = new CacheConfiguration(
                memorySizeKB: 16,
                cacheSizeKB: 1,
                blockSizeBytes: 16,
                mappingType: MappingType.DirectMapped
            );
            
            var decoder = new AddressDecoder(config);
            
            Console.WriteLine(decoder.GetAddressStructure());
            Console.WriteLine();
            
            // Test address: 0x1A4B
            var components = decoder.DecodeHex("0x1A4B");
            
            Console.WriteLine($"Decoding address: {components.ToHexString()}");
            Console.WriteLine($"  Tag:    {components.Tag} (0x{components.Tag:X})");
            Console.WriteLine($"  Index:  {components.Index} (0x{components.Index:X})");
            Console.WriteLine($"  Offset: {components.Offset} (0x{components.Offset:X})");
            Console.WriteLine($"  Block:  {components.BlockNumber}");
            Console.WriteLine($"\nBinary: {components.ToBinaryString(decoder.TagBits, decoder.IndexBits, decoder.OffsetBits)}");
        }
        
        static void TestDirectMapping()
        {
            Console.WriteLine("TEST 2: Direct Mapping");
            Console.WriteLine("-------------------------");
            
            var config = new CacheConfiguration(
                memorySizeKB: 16,
                cacheSizeKB: 1,
                blockSizeBytes: 16,
                mappingType: MappingType.DirectMapped
            );
            
            var decoder = new AddressDecoder(config);
            var cache = new DirectMappingController(config);
            
            // Test sequence of addresses
            int[] addresses = { 0x0000, 0x0040, 0x0080, 0x0000, 0x0400 };
            
            Console.WriteLine("Access Sequence:");
            foreach (var addr in addresses)
            {
                var components = decoder.Decode(addr);
                var result = cache.Access(components);
                
                Console.WriteLine($"\nAddress 0x{addr:X4}:");
                Console.WriteLine($"  {components}");
                Console.WriteLine($"  {result}");
            }
            
            Console.WriteLine($"\n{cache.GetStatistics()}");
        }
        
        static void TestSetAssociativeMapping()
        {
            Console.WriteLine("TEST 3: 2-Way Set Associative Mapping");
            Console.WriteLine("---------------------------------------");
            
            var config = new CacheConfiguration(
                memorySizeKB: 16,
                cacheSizeKB: 1,
                blockSizeBytes: 16,
                mappingType: MappingType.SetAssociative,
                associativity: 2,
                replacementPolicy: ReplacementPolicy.LRU
            );
            
            var decoder = new AddressDecoder(config);
            var cache = new SetAssociativeMappingController(config);
            
            Console.WriteLine($"Configuration: {config}");
            Console.WriteLine($"Number of Sets: {config.NumberOfSets}");
            Console.WriteLine();
            
            // Test sequence
            int[] addresses = { 0x0000, 0x0040, 0x0080, 0x0000, 0x00C0, 0x0040 };
            
            Console.WriteLine("Access Sequence:");
            foreach (var addr in addresses)
            {
                var components = decoder.Decode(addr);
                var result = cache.Access(components);
                
                Console.WriteLine($"\nAddress 0x{addr:X4}:");
                Console.WriteLine($"  {result}");
            }
            
            Console.WriteLine($"\n{cache.GetStatistics()}");
        }
        
        static void TestFullyAssociativeMapping()
        {
            Console.WriteLine("TEST 4: Fully Associative Mapping");
            Console.WriteLine("-----------------------------------");
            
            var config = new CacheConfiguration(
                memorySizeKB: 16,
                cacheSizeKB: 1,
                blockSizeBytes: 16,
                mappingType: MappingType.FullyAssociative,
                associativity: 64,  // Total cache lines
                replacementPolicy: ReplacementPolicy.FIFO
            );
            
            var decoder = new AddressDecoder(config);
            var cache = new FullyAssociativeMappingController(config);
            
            Console.WriteLine($"Configuration: {config}");
            Console.WriteLine();
            
            // Test sequence
            int[] addresses = { 0x0000, 0x1000, 0x2000, 0x0000, 0x3000 };
            
            Console.WriteLine("Access Sequence:");
            foreach (var addr in addresses)
            {
                var components = decoder.Decode(addr);
                var result = cache.Access(components);
                
                Console.WriteLine($"\nAddress 0x{addr:X4}:");
                Console.WriteLine($"  {result}");
            }
            
            Console.WriteLine($"\n{cache.GetStatistics()}");
        }
        
        static void TestReplacementPolicies()
        {
            Console.WriteLine("TEST 5: Comparing Replacement Policies");
            Console.WriteLine("----------------------------------------");
            
            // Same access pattern, different policies
            int[] addresses = { 0x0000, 0x0400, 0x0800, 0x0C00, 0x1000, 0x0000, 0x0400 };
            
            Console.WriteLine("Access pattern (addresses that map to same set):");
            Console.Write("  ");
            foreach (var addr in addresses)
                Console.Write($"0x{addr:X4} ");
            Console.WriteLine("\n");
            
            // Test with FIFO
            Console.WriteLine("A) Using FIFO:");
            TestWithPolicy(ReplacementPolicy.FIFO, addresses);
            
            Console.WriteLine("\nB) Using LRU:");
            TestWithPolicy(ReplacementPolicy.LRU, addresses);
        }
        
        static void TestWithPolicy(ReplacementPolicy policy, int[] addresses)
        {
            var config = new CacheConfiguration(
                memorySizeKB: 16,
                cacheSizeKB: 1,
                blockSizeBytes: 16,
                mappingType: MappingType.SetAssociative,
                associativity: 4,
                replacementPolicy: policy
            );
            
            var decoder = new AddressDecoder(config);
            var cache = new SetAssociativeMappingController(config);
            
            foreach (var addr in addresses)
            {
                var components = decoder.Decode(addr);
                var result = cache.Access(components);
                Console.WriteLine($"  {result}");
            }
            
            Console.WriteLine($"  Final: Hits={cache.TotalHits}, Misses={cache.TotalMisses}, Hit Rate={cache.HitRate:P1}");
        }
    }
}
