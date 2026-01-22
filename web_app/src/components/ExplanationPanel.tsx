import { MappingType } from '../utils/cache/types';

interface ExplanationPanelProps {
    mappingType: MappingType;
    associativity?: number;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
    mappingType,
    associativity
}) => {
    const getExplanation = () => {
        switch (mappingType) {
            case MappingType.DirectMapped:
                return {
                    title: '📌 Direct Mapped Cache',
                    description: 'Each memory block maps to exactly ONE specific cache line.',
                    formula: 'Cache Line = (Block Number) mod (Total Cache Lines)',
                    howItWorks: [
                        'Use INDEX bits from address to select cache line',
                        'Check if TAG matches - if yes, HIT! If no, MISS',
                        'On miss: Replace the data in that line (no choice)',
                        'Simple and fast, but can cause conflicts'
                    ],
                    visual: 'RAM Block → Always goes to same Cache Line',
                    pros: ['Simple hardware', 'Fast access', 'Low cost'],
                    cons: ['Conflict misses', 'Poor utilization if many blocks map to same line']
                };

            case MappingType.SetAssociative:
                return {
                    title: `🔀 ${associativity}-Way Set Associative`,
                    description: `Cache is divided into SETS. Each block maps to a SET, but can use any of ${associativity} WAYS within that set.`,
                    formula: 'Set Number = (Block Number) mod (Number of Sets)',
                    howItWorks: [
                        'Use INDEX bits to select a SET',
                        `Search all ${associativity} ways in that set for matching TAG`,
                        'If found in any way: HIT! If not: MISS',
                        'On miss: Use replacement policy (LRU/FIFO) to pick which way to replace',
                        'Balances speed and flexibility'
                    ],
                    visual: `RAM Block → Maps to a Set → Can use any of ${associativity} ways`,
                    pros: ['Fewer conflicts than direct mapped', 'Better cache utilization', 'Moderate complexity'],
                    cons: ['Slightly slower than direct', 'More hardware needed']
                };

            case MappingType.FullyAssociative:
                return {
                    title: '🌐 Fully Associative Cache',
                    description: 'Any memory block can go in ANY cache line. Maximum flexibility!',
                    formula: 'No formula - check all cache lines for matching TAG',
                    howItWorks: [
                        'No INDEX bits needed - all bits except offset are TAG',
                        'Search ALL cache lines in parallel for matching TAG',
                        'If found anywhere: HIT! If not: MISS',
                        'On miss: Use replacement policy to pick any line to replace',
                        'Best utilization, most complex hardware'
                    ],
                    visual: 'RAM Block → Can go ANYWHERE in cache',
                    pros: ['No conflict misses', 'Best cache utilization', 'Flexible'],
                    cons: ['Complex and expensive', 'Slower search (must check all lines)']
                };

            default:
                return null;
        }
    };

    const explanation = getExplanation();
    if (!explanation) return null;

    return (
        <div className="explanation-panel">
            <div className="explanation-header">
                <h3 className="text-lg font-semibold text-orange-400">{explanation.title}</h3>
                <p className="text-sm text-slate-300 mt-1">{explanation.description}</p>
            </div>

            <div className="explanation-content">
                <div className="explanation-section">
                    <h4 className="section-title">📐 Formula</h4>
                    <div className="formula-box">{explanation.formula}</div>
                </div>

                <div className="explanation-section">
                    <h4 className="section-title">⚙️ How It Works</h4>
                    <ol className="how-it-works-list">
                        {explanation.howItWorks.map((step, idx) => (
                            <li key={idx}>{step}</li>
                        ))}
                    </ol>
                </div>

                <div className="explanation-section">
                    <h4 className="section-title">👁️ Visual Flow</h4>
                    <div className="visual-flow">{explanation.visual}</div>
                </div>

                <div className="explanation-section pros-cons">
                    <div className="pros">
                        <h4 className="section-title">✅ Advantages</h4>
                        <ul>
                            {explanation.pros.map((pro, idx) => (
                                <li key={idx}>{pro}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="cons">
                        <h4 className="section-title">⚠️ Disadvantages</h4>
                        <ul>
                            {explanation.cons.map((con, idx) => (
                                <li key={idx}>{con}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
