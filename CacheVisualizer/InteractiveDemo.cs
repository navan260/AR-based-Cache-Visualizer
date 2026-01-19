using System;
using CacheVisualizer.Core;
using CacheVisualizer.Demo;

namespace CacheVisualizer
{
    /// <summary>
    /// Interactive console demo for cache visualizer.
    /// Perfect for demonstrations and presentations!  
    /// </summary>
    class InteractiveDemo
    {
        static void Main(string[] args)
        {
            Console.Title = "AR Cache Visualizer - Interactive Demo";
            
            while (true)
            {
                ShowMainMenu();
                
                Console.Write("\nEnter your choice (1-6): ");
                string choice = Console.ReadLine();
                Console.Clear();
                
                switch (choice)
                {
                    case "1":
                        DemoScenarios.RunBasicDirectMapping();
                        break;
                    case "2":
                        DemoScenarios.RunConflictDemo();
                        break;
                    case "3":
                        DemoScenarios.RunCacheSizeComparison();
                        break;
                    case "4":
                        DemoScenarios.RunAccessPatternDemo();
                        break;
                    case "5":
                        RunCustomDemo();
                        break;
                    case "6":
                        Console.WriteLine("Thanks for using AR Cache Visualizer!");
                        return;
                    default:
                        Console.WriteLine("Invalid choice!");
                        break;
                }
                
                Console.WriteLine("\n\nPress any key to return to menu...");
                Console.ReadKey();
                Console.Clear();
            }
        }
        
        static void ShowMainMenu()
        {
            Console.WriteLine("================================================================");
            Console.WriteLine("       AR-BASED CACHE MEMORY VISUALIZER - INTERACTIVE DEMO");
            Console.WriteLine("================================================================");
            Console.WriteLine();
            Console.WriteLine("  CSE 3rd Semester - RVCE");
            Console.WriteLine("  Applied Digital Logic Design & Computer Organization");
            Console.WriteLine();
            Console.WriteLine("================================================================");
            Console.WriteLine();
            Console.WriteLine("  DEMO SCENARIOS:");
            Console.WriteLine();
            Console.WriteLine("  1. Basic Direct Mapping");
            Console.WriteLine("     - Understand cache hits and misses");
            Console.WriteLine("     - See tag/index/offset in action");
            Console.WriteLine();
            Console.WriteLine("  2. Cache Conflicts");
            Console.WriteLine("     - Why direct mapping has conflicts");
            Console.WriteLine("     - Multiple blocks competing for same line");
            Console.WriteLine();
            Console.WriteLine("  3. Cache Size Impact");
            Console.WriteLine("     - Compare different cache sizes");
            Console.WriteLine("     - See performance improvement");
            Console.WriteLine();
            Console.WriteLine("  4. Access Pattern Analysis");
            Console.WriteLine("     - Sequential vs strided access");
            Console.WriteLine("     - Importance of locality");
            Console.WriteLine();
            Console.WriteLine("  5. Custom Demo (Try your own addresses)");
            Console.WriteLine();
            Console.WriteLine("  6. Exit");
            Console.WriteLine();
            Console.WriteLine("================================================================");
        }
        
        static void RunCustomDemo()
        {
            Console.WriteLine("CUSTOM CACHE DEMO");
            Console.WriteLine("=" + new string('=', 50));
            Console.WriteLine();
            
            // Get configuration from user
            Console.WriteLine("Enter cache configuration:");
            Console.WriteLine();
            
            int memSize, cacheSize, blockSize;
            
            try
            {
                Console.Write("Memory Size (KB) [default: 16]: ");
                string memInput = Console.ReadLine();
                memSize = string.IsNullOrEmpty(memInput) ? 16 : int.Parse(memInput);
                
                Console.Write("Cache Size (KB) [default: 1]: ");
                string cacheInput = Console.ReadLine();
                cacheSize = string.IsNullOrEmpty(cacheInput) ? 1 : int.Parse(cacheInput);
                
                Console.Write("Block Size (bytes) [default: 16]: ");
                string blockInput = Console.ReadLine();
                blockSize = string.IsNullOrEmpty(blockInput) ? 16 : int.Parse(blockInput);
            }
            catch (FormatException)
            {
                Console.WriteLine("ERROR: Invalid number format. Using defaults.");
                memSize = 16;
                cacheSize = 1;
                blockSize = 16;
            }
            
            Console.WriteLine();
            
            try
            {
                var config = new CacheConfiguration(
                    memorySizeKB: memSize,
                    cacheSizeKB: cacheSize,
                    blockSizeBytes: blockSize,
                    mappingType: MappingType.DirectMapped
                );
                
                string error;
                if (!config.IsValid(out error))
                {
                    Console.WriteLine("ERROR: " + error);
                    return;
                }
                
                var decoder = new AddressDecoder(config);
                var cache = new DirectMappingController(config);
                
                Console.WriteLine("Configuration created successfully!");
                Console.WriteLine(config.ToString());
                Console.WriteLine();
                Console.WriteLine(decoder.GetAddressStructure());
                Console.WriteLine();
                
                // Interactive address input
                while (true)
                {
                    Console.Write("\nEnter address in hex (e.g., 0x1A4B) or 'done': ");
                    string input = Console.ReadLine();
                    
                    if (input.ToLower() == "done")
                        break;
                    
                    try
                    {
                        var addr = decoder.DecodeHex(input);
                        var result = cache.Access(addr);
                        
                        Console.WriteLine();
                        Console.WriteLine("  " + addr.ToString());
                        Console.WriteLine("  Binary: " + addr.ToBinaryString(
                            decoder.TagBits, decoder.IndexBits, decoder.OffsetBits));
                        Console.WriteLine("  " + result.ToString());
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("  ERROR: " + ex.Message);
                    }
                }
                
                Console.WriteLine();
                Console.WriteLine(cache.GetStatistics());
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERROR: " + ex.Message);
            }
        }
    }
}
