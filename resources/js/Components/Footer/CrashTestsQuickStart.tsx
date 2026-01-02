// resources/js/Components/Footer/CrashTestsQuickStart.tsx
import React from 'react';
import useModal from '../../Hooks/useModal';

const CrashTestsQuickStart: React.FC = () => {
    const { openModal } = useModal();

    const videoList = [
        {
            title: "Испытание на прочность",
            desc: "Тестирование профессиональной серии на бетоне",
            duration: "1:30"
        },
        {
            title: "Сравнительный тест",
            desc: "Наши клюшки vs конкуренты",
            duration: "2:15"
        }
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span style={styles.icon}>🛡️</span>
                <h4 style={styles.title}>Наша продукция проходит жесткие испытания</h4>
            </div>
            <p style={styles.description}>
                Посмотрите, как мы тестируем клюшки в экстремальных условиях
            </p>
            <button 
                onClick={() => openModal(
                    <div style={styles.modalContent}>
                        <h2>Видео испытаний</h2>
                        {videoList.map((video, i) => (
                            <div key={i} style={styles.videoItem}>
                                <div style={styles.videoPreview}>
                                    <div style={styles.playBtn}>▶</div>
                                    <span style={styles.duration}>{video.duration}</span>
                                </div>
                                <div>
                                    <h5>{video.title}</h5>
                                    <p>{video.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                style={styles.button}
            >
                Смотреть тесты
            </button>
        </div>
    );
};

const styles = {
    container: {
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderLeft: '2px solid #0ea5e9',
        borderRadius: '12px',
        padding: '10px',
        marginBottom: '20px',
        width: '92.5%' 
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px'
    },
    icon: { fontSize: '24px' },
    title: {
        margin: 0,
        color: '#0369a1',
        fontSize: '16px'
    },
    description: {
        color: '#64748b',
        fontSize: '14px',
        margin: '0 0 15px 0'
    },
    button: {
        background: '#0ea5e9',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600' as const,
        width: '100%'
    },
    modalContent: {
        padding: '20px',
        maxWidth: '500px'
    },
    videoItem: {
        display: 'flex',
        gap: '15px',
        marginBottom: '15px',
        padding: '10px',
        background: '#f8fafc',
        borderRadius: '8px'
    },
    videoPreview: {
        width: '100px',
        height: '70px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative' as const
    },
    playBtn: {
        color: 'white',
        fontSize: '24px'
    },
    duration: {
        position: 'absolute' as const,
        bottom: '5px',
        right: '5px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '12px'
    }
};

export default CrashTestsQuickStart;