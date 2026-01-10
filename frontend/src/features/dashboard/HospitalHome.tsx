import { useState } from 'react';
import HospitalOverview from './hospital/HospitalOverview';
import HospitalDoctors from './hospital/HospitalDoctors';

export default function HospitalHome() {
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors'>('overview');

    return (
        <div>
            {/* Tab Navigation */}
            <div style={{
                display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem'
            }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    style={{
                        padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '1rem', fontWeight: 600,
                        color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : '3px solid transparent'
                    }}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('doctors')}
                    style={{
                        padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '1rem', fontWeight: 600,
                        color: activeTab === 'doctors' ? 'var(--primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'doctors' ? '3px solid var(--primary)' : '3px solid transparent'
                    }}
                >
                    Doctors List
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' ? <HospitalOverview /> : <HospitalDoctors />}
        </div>
    );
}