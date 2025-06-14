// Аккордеон-компонент для секций

export const OrderSection: React.FC<{
        title: string;
        isExpanded: boolean;
        onToggle: () => void;
        children: React.ReactNode;
    }> = ({ title, isExpanded, onToggle, children }) => {
    return (
        <div className={`order-section ${isExpanded ? 'expanded' : ''}`}>
            <div className="section-header" onClick={onToggle}>
                <h3>{title}</h3>
                <span className="toggle-icon">{isExpanded ? '−' : '+'}</span>
            </div>
            {isExpanded && <div className="section-content">{children}</div>}
        </div>
    );
};