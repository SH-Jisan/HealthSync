import { useState } from 'react';
import DiagnosticTests from './diagnostic/DiagnosticTests';
import DiagnosticUpload from './diagnostic/DiagnosticUpload';
import { ClipboardText, UploadSimple } from 'phosphor-react';

export default function DiagnosticHome() {
    const [activeTab, setActiveTab] = useState<'tests' | 'upload'>('tests');

    return (
        <div>
            <div style={{ background: 'linear-gradient(to right, #7E22CE, #9333EA)', padding: '2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Diagnostic Center Panel</h1>
                <p style={{ opacity: 0.9 }}>Manage services and upload patient reports.</p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('tests')}
                    style={getTabStyle(activeTab === 'tests')}
                >
                    <ClipboardText size={20} /> Manage Tests
                </button>
                <button
                    onClick={() => setActiveTab('upload')}
                    style={getTabStyle(activeTab === 'upload')}
                >
                    <UploadSimple size={20} /> Upload Report
                </button>
            </div>

            {activeTab === 'tests' && <DiagnosticTests />}
            {activeTab === 'upload' && <DiagnosticUpload />}
        </div>
    );
}

function getTabStyle(isActive: boolean) {
    return {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '1rem', fontWeight: 600,
        color: isActive ? '#7E22CE' : 'var(--text-secondary)',
        borderBottom: isActive ? '3px solid #7E22CE' : '3px solid transparent',
    };
}