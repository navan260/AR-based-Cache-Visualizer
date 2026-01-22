import { AddressDecoder } from '../utils/cache/AddressDecoder';

interface AddressBreakdownProps {
    address: number;
    decoder: AddressDecoder;
    blockSizeBytes: number;
}

export const AddressBreakdown: React.FC<AddressBreakdownProps> = ({
    address,
    decoder,
    blockSizeBytes
}) => {
    const components = decoder.decode(address);
    const bitCounts = decoder.getBitCounts();

    // Convert to binary string
    const binaryStr = address.toString(2).padStart(bitCounts.total, '0');

    // Split into segments
    const tagBits = binaryStr.slice(0, bitCounts.tag);
    const indexBits = binaryStr.slice(bitCounts.tag, bitCounts.tag + bitCounts.index);
    const offsetBits = binaryStr.slice(bitCounts.tag + bitCounts.index);

    return (
        <div className="address-breakdown">
            <div className="breakdown-header">
                <h4 className="text-md font-semibold text-yellow-400">Address Breakdown</h4>
                <div className="text-sm text-slate-400">
                    0x{address.toString(16).toUpperCase().padStart(4, '0')} = {address} (decimal)
                </div>
            </div>

            <div className="binary-display">
                <div className="binary-segments">
                    {bitCounts.tag > 0 && (
                        <div className="segment tag-segment" title="Tag bits - identify which block">
                            <div className="segment-label">Tag</div>
                            <div className="segment-bits">{tagBits || '—'}</div>
                            <div className="segment-value">{components.tag}</div>
                            <div className="segment-info">{bitCounts.tag} bits</div>
                        </div>
                    )}

                    {bitCounts.index > 0 && (
                        <div className="segment index-segment" title="Index bits - select cache line/set">
                            <div className="segment-label">Index</div>
                            <div className="segment-bits">{indexBits}</div>
                            <div className="segment-value">{components.index}</div>
                            <div className="segment-info">{bitCounts.index} bits</div>
                        </div>
                    )}

                    <div className="segment offset-segment" title="Offset bits - byte within block">
                        <div className="segment-label">Offset</div>
                        <div className="segment-bits">{offsetBits}</div>
                        <div className="segment-value">{components.offset}</div>
                        <div className="segment-info">{bitCounts.offset} bits</div>
                    </div>
                </div>
            </div>

            <div className="breakdown-explanation">
                <div className="explanation-item">
                    <span className="explanation-label">Block Number:</span>
                    <span className="explanation-value">{Math.floor(address / blockSizeBytes)}</span>
                </div>
                <div className="explanation-item">
                    <span className="explanation-label">Offset in Block:</span>
                    <span className="explanation-value">{components.offset} bytes</span>
                </div>
            </div>
        </div>
    );
};
