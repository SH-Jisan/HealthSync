import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Heartbeat, Plus, Robot } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
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

    const tabs = [
        { id: 'timeline', label: t('dashboard.timeline'), Icon: FileText },
        { id: 'plan', label: t('dashboard.health_plan'), Icon: Heartbeat },
        { id: 'ai', label: t('dashboard.ai_doctor'), Icon: Robot },
    ] as const;

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            {/* Tab Navigation with Sliding Pill */}
            <div className={styles.tabsContainer}>
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activePill"
                                    className={styles.activePill}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <tab.Icon size={20} weight={activeTab === tab.id ? 'fill' : 'regular'} />
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content Area with Staggered Fade */}
            <div className={styles.contentArea}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'timeline' && <TimelineView key={refreshKey} />}
                        {activeTab === 'plan' && <HealthPlanView />}
                        {activeTab === 'ai' && <AIDoctor />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Floating Action Button - Only on Timeline Tab */}
            <AnimatePresence>
                {activeTab === 'timeline' && (
                    <motion.button
                        onClick={() => setShowUpload(true)}
                        className={styles.addReportBtn}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus size={20} weight="bold" />
                        {t('add_report')}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUpload && (
                    <UploadModal
                        onClose={() => setShowUpload(false)}
                        onSuccess={() => setRefreshKey(prev => prev + 1)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}