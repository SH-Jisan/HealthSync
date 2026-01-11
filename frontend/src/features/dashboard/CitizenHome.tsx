import { useState } from 'react';
import { FileText, Heartbeat, Plus } from 'phosphor-react';
import TimelineView from '../timeline/TimelineView';
import HealthPlanView from '../health-plan/HealthPlanView';
import UploadModal from '../upload/UploadModal';
import { Robot } from 'phosphor-react';
import AIDoctor from "../../features/ai-doctor/AIDoctor.tsx";


export default function CitizenHome() {
    const [activeTab, setActiveTab] = useState<'timeline' | 'plan' | 'ai'>('timeline');
    const [showUpload, setShowUpload] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // টাইমলাইন রিফ্রেশ করার জন্য

    return (
        <div>
            {/* Header Section with Title & Add Report Button */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        Welcome Back!
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        Here is your health overview.
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
                    Add Report
                </button>
            </div>

            {/* Modern Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '2rem',
                borderBottom: '2px solid var(--border)',
                paddingBottom: '0'
            }}>
                <button
                    onClick={() => setActiveTab('timeline')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '1rem 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'timeline' ? '3px solid var(--primary)' : '3px solid transparent',
                        color: activeTab === 'timeline' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'timeline' ? '600' : '500',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        marginBottom: '-2px', // বর্ডার ওভারল্যাপ করার জন্য
                        transition: 'color 0.2s'
                    }}
                >
                    <FileText size={22} weight={activeTab === 'timeline' ? 'fill' : 'regular'} />
                    Medical History
                </button>

                <button
                    onClick={() => setActiveTab('plan')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '1rem 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'plan' ? '3px solid var(--primary)' : '3px solid transparent',
                        color: activeTab === 'plan' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'plan' ? '600' : '500',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        marginBottom: '-2px',
                        transition: 'color 0.2s'
                    }}
                >
                    <Heartbeat size={22} weight={activeTab === 'plan' ? 'fill' : 'regular'} />
                    Health Plan
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem 0', background: 'none', border: 'none',
                        borderBottom: activeTab === 'ai' ? '3px solid var(--primary)' : '3px solid transparent',
                        color: activeTab === 'ai' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'ai' ? '600' : '500', cursor: 'pointer', fontSize: '1rem',
                        marginBottom: '-2px', transition: 'color 0.2s'
                    }}
                >
                    <Robot size={22} weight={activeTab === 'ai' ? 'fill' : 'regular'} />
                    AI Doctor
                </button>
            </div>

            {/* Tab Content Area */}
            <div style={{ minHeight: '400px', animation: 'fadeIn 0.3s ease-in' }}>
                {activeTab === 'timeline' && <TimelineView key={refreshKey} />}
                {activeTab === 'plan' && <HealthPlanView />}
                {activeTab === 'ai' && <AIDoctor />}
            </div>

            {/* Upload Modal Popup */}
            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onSuccess={() => {
                        setRefreshKey(prev => prev + 1); // টাইমলাইন রিফ্রেশ করবে
                        // চাইলে এখানে সাকসেস টোস্ট বা অ্যালার্ট দেখাতে পারো
                    }}
                />
            )}

            {/* Simple Fade In Animation */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}