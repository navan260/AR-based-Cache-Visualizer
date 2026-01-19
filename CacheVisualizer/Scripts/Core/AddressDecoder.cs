using System;

namespace CacheVisualizer.Core
{
    /// <summary>
    /// Decodes memory addresses into Tag, Index, and Offset components
    /// based on cache configuration.
    /// 
    /// Address Structure: | Tag | Index | Offset |
    /// </summary>
    public class AddressDecoder
    {
        private CacheConfiguration _config;
        
        // Bit field sizes
        public int OffsetBits { get; private set; }
        public int IndexBits { get; private set; }
        public int TagBits { get; private set; }
        
        // Bit masks for extraction
        private int _offsetMask;
        private int _indexMask;
        private int _tagMask;
        
        /// <summary>
        /// Initializes the address decoder with a cache configuration.
        /// </summary>
        public AddressDecoder(CacheConfiguration config)
        {
            _config = config;
            CalculateBitFields();
            CreateBitMasks();
        }
        
        /// <summary>
        /// Calculates the number of bits needed for offset, index, and tag.
        /// 
        /// ADLD Formula:
        /// - Offset bits = log2(Block Size)
        /// - Index bits = log2(Number of Sets)
        /// - Tag bits = Total Address Bits - Offset - Index
        /// </summary>
        private void CalculateBitFields()
        {
            // Offset bits: how many bytes within a block
            OffsetBits = (int)Math.Log(_config.BlockSizeBytes, 2);
            
            // Index bits: which set/line to check
            IndexBits = (int)Math.Log(_config.NumberOfSets, 2);
            
            // Tag bits: remaining bits for tag comparison
            TagBits = _config.AddressBits - OffsetBits - IndexBits;
        }
        
        /// <summary>
        /// Creates bit masks for efficient extraction of address components.
        /// </summary>
        private void CreateBitMasks()
        {
            // Offset mask: all 1s for offset bits
            _offsetMask = (1 << OffsetBits) - 1;
            
            // Index mask: all 1s for index bits
            _indexMask = (1 << IndexBits) - 1;
            
            // Tag mask: all 1s for tag bits
            _tagMask = (1 << TagBits) - 1;
        }
        
        /// <summary>
        /// Decodes a memory address into its components.
        /// </summary>
        /// <param name="address">Memory address to decode</param>
        /// <returns>AddressComponents containing tag, index, and offset</returns>
        public AddressComponents Decode(int address)
        {
            // Extract offset: lowest N bits
            int offset = address & _offsetMask;
            
            // Extract index: middle M bits
            int index = (address >> OffsetBits) & _indexMask;
            
            // Extract tag: highest K bits
            int tag = (address >> (OffsetBits + IndexBits)) & _tagMask;
            
            // Calculate block number
            int blockNumber = address / _config.BlockSizeBytes;
            
            return new AddressComponents
            {
                Address = address,
                Tag = tag,
                Index = index,
                Offset = offset,
                BlockNumber = blockNumber
            };
        }
        
        /// <summary>
        /// Decodes a hexadecimal address string.
        /// </summary>
        public AddressComponents DecodeHex(string hexAddress)
        {
            // Remove "0x" prefix if present
            if (hexAddress.StartsWith("0x", StringComparison.OrdinalIgnoreCase))
            {
                hexAddress = hexAddress.Substring(2);
            }
            
            int address = Convert.ToInt32(hexAddress, 16);
            return Decode(address);
        }
        
        /// <summary>
        /// Returns a detailed breakdown of the address structure.
        /// </summary>
        public string GetAddressStructure()
        {
            return "Address Structure (" + _config.AddressBits + " bits total):\n" +
                   "  Tag:    " + TagBits + " bits\n" +
                   "  Index:  " + IndexBits + " bits\n" +
                   "  Offset: " + OffsetBits + " bits\n" +
                   "\n" +
                   "Configuration:\n" +
                   "  Number of Sets: " + _config.NumberOfSets + "\n" +
                   "  Cache Lines: " + _config.TotalCacheLines + "\n" +
                   "  Block Size: " + _config.BlockSizeBytes + " bytes";
        }
    }
}
