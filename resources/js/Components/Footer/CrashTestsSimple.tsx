// Создайте файл resources/js/Components/Footer/CrashTestsSimple.tsx
import React from 'react';
import useModal from '../../Hooks/useModal';
// import CrashTestsModal from '../Articles/CrashTestsModal';

const CrashTestsSimple: React.FC = () => {
    const { openModal } = useModal();

    const styles = {
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
        },
        icon: { fontSize: '14px' },
        title: {
            margin: 0,
            color: '#0369a1',
            fontSize: '14px',
            // backgroundColor: 'red',
            lineHeight: '1.1    '
        },
    };
    
    return (
        <div style={{
            background: '#f7fcffff',
            border: '2px solid #0ea5e9',
            borderRadius: '8px',
            padding: '15px',
            // marginBottom: '15px',
        }}>
            <div style={{margin: '0 0 10px 0', color: '#0369a1'}}>
                <div style={styles.header}>
                    <span style={styles.icon}>🛡️</span>
                    <h4 style={styles.title}>Тестируем продукцию в экстремальных условиях</h4>
                </div>
            </div>
            <button 
                onClick={() => openModal(<div>Пока заглушка для видео</div>)}
                style={{
                    background: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                Смотреть испытания
            </button>

            <div className="crash-stats">
                <div className="stat-item">
                    <span className="stat-number">100+</span>
                    <span className="stat-label">тестов проведено</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">контроль качества</span>
                </div>
            </div>

        </div>
    );
};

export default CrashTestsSimple;