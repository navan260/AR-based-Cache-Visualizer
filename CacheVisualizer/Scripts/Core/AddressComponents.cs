using System;

namespace CacheVisualizer.Core
{
    /// <summary>
    /// Represents the decoded components of a memory address.
    /// </summary>
    public class AddressComponents
    {
        public int Address { get; set; }        // Original address
        public int Tag { get; set; }            // Tag field
        public int Index { get; set; }          // Index/Set field
        public int Offset { get; set; }         // Offset within block
        public int BlockNumber { get; set; }    // Memory block number
        
        /// <summary>
        /// Returns binary representation of each component.
        /// </summary>
        public string ToBinaryString(int tagBits, int indexBits, int offsetBits)
        {
            string tagBinary = Convert.ToString(Tag, 2).PadLeft(tagBits, '0');
            string indexBinary = Convert.ToString(Index, 2).PadLeft(indexBits, '0');
            string offsetBinary = Convert.ToString(Offset, 2).PadLeft(offsetBits, '0');
            
            return tagBinary + " | " + indexBinary + " | " + offsetBinary;
        }
        
        /// <summary>
        /// Returns hexadecimal representation.
        /// </summary>
        public string ToHexString()
        {
            return "0x" + Address.ToString("X");
        }
        
        public override string ToString()
        {
            return string.Format("Address: 0x{0:X} -> Tag: {1}, Index: {2}, Offset: {3}, Block: {4}",
                Address, Tag, Index, Offset, BlockNumber);
        }
    }
}
