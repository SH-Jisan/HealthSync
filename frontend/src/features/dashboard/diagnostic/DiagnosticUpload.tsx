import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
    MagnifyingGlass,
    UploadSimple,
    User,
} from 'phosphor-react';
//import { useTranslation } from 'react-i18next';

export default function DiagnosticUpload() {
    //const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [patient, setPatient] = useState<any>(null);
    const [reportTitle, setReportTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const searchPatient = async () => {
        if (!searchQuery) return;
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, phone, email')
            .or(`email.eq.${searchQuery},phone.eq.${searchQuery}`)
            .single();

        if (data) setPatient(data);
        else alert('Patient not found!');
    };

    const handleUpload = async () => {
        if (!patient || !file || !reportTitle) return alert('Please fill all fields');
        setUploading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser(); // Diagnostic User

            // 1. Upload File (Assuming 'medical-reports' bucket exists)
            const fileName = `${patient.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('medical-reports')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Create DB Entry
            const { error: dbError } = await supabase.from('medical_events').insert({
                patient_id: patient.id,
                uploader_id: user?.id,
                event_type: 'LAB_REPORT',
                title: reportTitle,
                event_date: new Date().toISOString(),
                attachments: [fileName],
                summary: `Uploaded by Diagnostic Center`
            });

            if (dbError) throw dbError;

            alert('Report uploaded successfully!');
            setPatient(null);
            setFile(null);
            setReportTitle('');
            setSearchQuery('');

        } catch (error: any) {
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Upload Patient Report</h2>

            {/* Search Section */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                <input
                    placeholder="Patient Email or Phone"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <button
                    onClick={searchPatient}
                    style={{
                        background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px',
                        borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    <MagnifyingGlass size={20} />
                </button>
            </div>

            {/* Upload Form (Visible if patient found) */}
            {patient && (
                <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                        <div style={{ padding: '10px', background: '#E0F2F1', borderRadius: '50%', color: 'var(--primary)' }}><User size={24} /></div>
                        <div>
                            <h3 style={{ margin: 0 }}>{patient.full_name}</h3>
                            <small style={{ color: 'var(--text-secondary)' }}>{patient.phone || patient.email}</small>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Report Title</label>
                        <input
                            placeholder="e.g. Blood Test Result"
                            value={reportTitle} onChange={e => setReportTitle(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Select File (PDF/Image)</label>
                        <input
                            type="file" accept="image/*,.pdf"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        style={{
                            width: '100%', padding: '14px', background: '#166534', color: 'white',
                            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                        }}
                    >
                        {uploading ? 'Uploading...' : <><UploadSimple size={20} /> Upload & Send</>}
                    </button>
                </div>
            )}
        </div>
    );
}