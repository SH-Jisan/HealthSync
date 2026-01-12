import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Heartbeat, Plus, Robot } from 'phosphor-react';
import TimelineView from '../../features/timeline/TimelineView';
import HealthPlanView from '../../features/health-plan/HealthPlanView';
import AIDoctor from '../../features/ai-doctor/AIDoctor';
import UploadModal from '../../features/upload/UploadModal';
import styles from './styles/CitizenHome.module.css';

export default function CitizenHome() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'timeline' | 'plan' | 'ai'>('timeline');
    const [showUpload, setShowUpload] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{t('welcome')}</h1>
                    <p className={styles.subtitle}>{t('overview')}</p>
                </div>

                <button
                    onClick={() => setShowUpload(true)}
                    className={styles.addReportBtn}
                >
                    <Plus size={20} weight="bold" />
                    {t('add_report')}
                </button>
            </div>

            {/* Tab Navigation */}
            <div className={styles.tabs}>
                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`${styles.tabBtn} ${activeTab === 'timeline' ? styles.activeTab : ''}`}
                >
                    <FileText size={22} weight={activeTab === 'timeline' ? 'fill' : 'regular'} />
                    {t('dashboard.timeline')}
                </button>

                <button
                    onClick={() => setActiveTab('plan')}
                    className={`${styles.tabBtn} ${activeTab === 'plan' ? styles.activeTab : ''}`}
                >
                    <Heartbeat size={22} weight={activeTab === 'plan' ? 'fill' : 'regular'} />
                    {t('dashboard.health_plan')}
                </button>

                <button
                    onClick={() => setActiveTab('ai')}
                    className={`${styles.tabBtn} ${activeTab === 'ai' ? styles.activeTab : ''}`}
                >
                    <Robot size={22} weight={activeTab === 'ai' ? 'fill' : 'regular'} />
                    {t('dashboard.ai_doctor')}
                </button>
            </div>

            {/* Tab Content Area */}
            <div className={styles.contentArea}>
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
        </div>
    );
}