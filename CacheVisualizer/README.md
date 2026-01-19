# AR-Based Cache Memory Visualizer

An Augmented Reality educational system for visualizing cache memory organization and mapping techniques.

## Project Overview

This project demonstrates cache memory concepts through AR visualization, allowing students to see:
- Cache memory structure in 3D
- Address decoding (Tag | Index | Offset)
- Cache mapping techniques (Direct, Set Associative, Fully Associative)
- Cache hit/miss scenarios
- Replacement policies (FIFO, LRU)

## Project Structure

```
CacheVisualizer/
├── Scripts/
│   ├── Core/                          # Core cache logic (C#)
│   │   ├── CacheConfiguration.cs      # Cache/memory configuration
│   │   ├── AddressDecoder.cs          # Address decoding logic
│   │   ├── CacheLine.cs               # Cache line data structure
│   │   ├── DirectMappingController.cs # Direct mapping implementation
│   │   ├── SetAssociativeMappingController.cs
│   │   ├── FullyAssociativeMappingController.cs
│   │   └── ReplacementPolicyManager.cs
│   ├── Visualization/                 # Unity visualization (to be added)
│   ├── UI/                            # User interface (to be added)
│   ├── AR/                            # AR components (to be added)
│   └── Demo/                          # Demo scenarios (to be added)
└── Tests/
    └── CacheSimulatorTest.cs          # Core logic test program
```

## Current Status

✅ **Phase 1: Core Logic** (COMPLETED)
- Address decoder with bit field calculation
- Direct mapping controller
- Set associative mapping controller
- Fully associative mapping controller
- Replacement policies (FIFO, LRU, Random)
- Test program for verification

✅ **Phase 2: Testing & Demos** (COMPLETED)
- Comprehensive test suite
- Interactive demo program with 4 scenarios
- Build scripts for easy execution
- Presentation and documentation materials

🔜 **Next Steps:**
- Unity project setup
- 3D visualization components
- AR integration

## Available Programs

### 1. Quick Test (Automated)
```bash
quick_test.bat
```
Runs basic functionality tests quickly.

### 2. Full Test Suite
```bash
build_and_test.bat
```
Compiles and runs comprehensive test suite.

### 3. Interactive Demo (Recommended for Presentations)
```bash
run_demo.bat
```
**NEW!** Interactive menu-driven demo with:
- Basic Direct Mapping demonstration
- Cache Conflict visualization
- Cache Size comparison
- Access Pattern analysis
- Custom address testing

## Documentation

- **README.md** - This file
- **UNITY_SETUP_GUIDE.md** - Step-by-step Unity integration guide
- **PRESENTATION_GUIDE.md** - Complete guide for viva/presentation
- **PROJECT_REPORT_OUTLINE.md** - Full report template for submission

## Testing the Core Logic

### Option 1: Interactive Demo (Best for Presentations)
```bash
cd CacheVisualizer
run_demo.bat
```

Choose from menu:
1. Basic Direct Mapping
2. Cache Conflicts
3. Cache Size Impact  
4. Access Pattern Analysis
5. Custom Demo (enter your own addresses)

### Option 2: Quick Automated Test
```bash
quick_test.bat
```

### Option 3: Full Test Suite
```bash
build_and_test.bat
```

## Key Concepts Demonstrated

### 1. Address Decoding
- **Offset bits** = log₂(Block Size)
- **Index bits** = log₂(Number of Sets)
- **Tag bits** = Total Address Bits - Offset - Index

### 2. Mapping Techniques
- **Direct Mapping**: Cache Line = Block Number mod Total Lines
- **Set Associative**: Set = Block Number mod Number of Sets
- **Fully Associative**: Block can go anywhere

### 3. Replacement Policies
- **FIFO**: Replace oldest block
- **LRU**: Replace least recently used block
- **Random**: Replace random block

## Example Configuration

```csharp
var config = new CacheConfiguration(
    memorySizeKB: 16,      // 16 KB main memory
    cacheSizeKB: 1,        // 1 KB cache
    blockSizeBytes: 16,    // 16-byte blocks
    mappingType: MappingType.DirectMapped
);
```

This results in:
- 64 cache lines
- 4 offset bits
- 6 index bits
- 4 tag bits

## Technologies Used

- **Language**: C# (.NET)
- **Future**: Unity3D + AR Foundation
- **Target Platforms**: Android (ARCore), iOS (ARKit)

## Authors

CSE 3rd Semester - RVCE
Applied Digital Logic Design & Computer Organization Project

## License

Educational Project - RVCE 2026
