import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // <--- Import Hook
import { FileText, Heartbeat, Plus, Robot } from 'phosphor-react';
import TimelineView from '../timeline/TimelineView';
import HealthPlanView from '../health-plan/HealthPlanView';
import AIDoctor from '../ai-doctor/AIDoctor'; // <--- Import AI Doctor
import UploadModal from '../upload/UploadModal';

export default function CitizenHome() {
    const { t } = useTranslation(); // <--- Init Hook
    const [activeTab, setActiveTab] = useState<'timeline' | 'plan' | 'ai'>('timeline');
    const [showUpload, setShowUpload] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div>
            {/* Header Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        {t('welcome')}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        {t('overview')}
                    </p>
                </div>

                <button
                    onClick={() => setShowUpload(true)}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '50px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Plus size={20} weight="bold" />
                    {t('add_report')}
                </button>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '2rem',
                borderBottom: '2px solid var(--border)',
                paddingBottom: '0'
            }}>
                <button
                    onClick={() => setActiveTab('timeline')}
                    style={getTabStyle(activeTab === 'timeline')}
                >
                    <FileText size={22} weight={activeTab === 'timeline' ? 'fill' : 'regular'} />
                    {t('timeline')}
                </button>

                <button
                    onClick={() => setActiveTab('plan')}
                    style={getTabStyle(activeTab === 'plan')}
                >
                    <Heartbeat size={22} weight={activeTab === 'plan' ? 'fill' : 'regular'} />
                    {t('health_plan')}
                </button>

                {/* AI Doctor Tab Added */}
                <button
                    onClick={() => setActiveTab('ai')}
                    style={getTabStyle(activeTab === 'ai')}
                >
                    <Robot size={22} weight={activeTab === 'ai' ? 'fill' : 'regular'} />
                    {t('ai_doctor')}
                </button>
            </div>

            {/* Tab Content Area */}
            <div style={{ minHeight: '400px', animation: 'fadeIn 0.3s ease-in' }}>
                {activeTab === 'timeline' && <TimelineView key={refreshKey} />}
                {activeTab === 'plan' && <HealthPlanView />}
                {activeTab === 'ai' && <AIDoctor />}
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onSuccess={() => setRefreshKey(prev => prev + 1)}
                />
            )}

            <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

// Helper Style Function
function getTabStyle(isActive: boolean) {
    return {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '1rem 0',
        background: 'none',
        border: 'none',
        borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
        fontWeight: isActive ? 600 : 500,
        cursor: 'pointer',
        fontSize: '1rem',
        marginBottom: '-2px',
        transition: 'color 0.2s'
    };
}