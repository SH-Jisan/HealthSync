import { useState } from 'react';
import HospitalOverview from './hospital/HospitalOverview';
import HospitalDoctors from './hospital/HospitalDoctors';
import HospitalPatients from './hospital/HospitalPatients'; // <--- Import

export default function HospitalHome() {
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'patients'>('overview'); // <--- Updated State Type

    return (
        <div>
            {/* Tab Navigation */}
            <div style={{
                display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem'
            }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    style={getTabStyle(activeTab === 'overview')}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('doctors')}
                    style={getTabStyle(activeTab === 'doctors')}
                >
                    Doctors List
                </button>
                <button
                    onClick={() => setActiveTab('patients')}
                    style={getTabStyle(activeTab === 'patients')}
                >
                    Patients
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <HospitalOverview />}
            {activeTab === 'doctors' && <HospitalDoctors />}
            {activeTab === 'patients' && <HospitalPatients />}
        </div>
    );
}

// Helper for clean styles
function getTabStyle(isActive: boolean) {
    return {
        padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '1rem', fontWeight: 600,
        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
        borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
        transition: 'all 0.2s'
    };
}