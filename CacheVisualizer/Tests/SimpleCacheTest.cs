using System;
using CacheVisualizer.Core;

namespace CacheVisualizer.Tests
{
    class SimpleCacheTest
    {
        static void Main(string[] args)
        {
            Console.WriteLine("==========================================");
            Console.WriteLine("  AR Cache Visualizer - Core Logic Test");
            Console.WriteLine("==========================================");
            Console.WriteLine();
            
            // Test 1: Configuration
            Console.WriteLine("Creating cache configuration...");
            var config = new CacheConfiguration(
                memorySizeKB: 16,
                cacheSizeKB: 1,
                blockSizeBytes: 16,
                mappingType: MappingType.DirectMapped
            );
           
            string error;
            if (!config.IsValid(out error))
            {
                Console.WriteLine("ERROR: " + error);
                Console.ReadKey();
                return;
            }
            
            Console.WriteLine("Configuration: " + config.ToString());
            Console.WriteLine("  Total cache lines: " + config.TotalCacheLines);
            Console.WriteLine("  Number of sets: " + config.NumberOfSets);
            Console.WriteLine();
            
            // Test 2: Address Decoder
            Console.WriteLine("Creating address decoder...");
            var decoder = new AddressDecoder(config);
            Console.WriteLine(decoder.GetAddressStructure());
            Console.WriteLine();
            
            // Test 3: Decode an address
            Console.WriteLine("Decoding address 0x1A4B...");
            var addr = decoder.DecodeHex("0x1A4B");
            Console.WriteLine(addr.ToString());
            Console.WriteLine("Binary: " + addr.ToBinaryString(decoder.TagBits, decoder. IndexBits, decoder.OffsetBits));
            Console.WriteLine();
            
            // Test 4: Direct Mapping
            Console.WriteLine("Testing Direct Mapping...");
            var cache = new DirectMappingController(config);
            
            int[] testAddresses = { 0x0000, 0x0040, 0x0080, 0x0000, 0x0400 };
            
            foreach (int address in testAddresses)
            {
                var components = decoder.Decode(address);
                var result = cache.Access(components);
                
                Console.WriteLine(string.Format("Address 0x{0:X4}: {1}",
                    address, result.ToString()));
            }
            
            Console.WriteLine();
            Console.WriteLine(cache.GetStatistics());
            Console.WriteLine();
            
            Console.WriteLine("==========================================");
            Console.WriteLine("  All Tests Completed Successfully!");
            Console.WriteLine("==========================================");
            Console.WriteLine();
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
    }
}
