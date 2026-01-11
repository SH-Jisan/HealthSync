import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabaseClient';
import { CloudArrowUp, X, FileImage, Spinner } from 'phosphor-react';
import styles from './UploadModal.module.css';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export default function UploadModal({ onClose, onSuccess }: Props) {
    const { t } = useTranslation();
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    });

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        setStatus(t('upload.status_uploading'));

        try {
            const file = files[0];
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error(t('upload.error_no_user'));

            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('medical_docs') // Ensure this bucket exists in your Supabase
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Call Edge Function to Analyze
            setStatus(t('upload.status_analyzing'));
            const { error: funcError } = await supabase.functions.invoke('process-medical-report', {
                body: {
                    storage_path: fileName,
                    patient_id: user.id
                }
            });

            if (funcError) throw funcError;

            setStatus(t('upload.status_success'));
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);

        } catch (error: any) {
            console.error('Upload failed:', error);
            setStatus(`${t('upload.error_fail')}: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3>{t('upload.title')}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div
                    {...getRootProps()}
                    className={`${styles.dropzone} ${isDragActive ? styles.activeDropzone : ''}`}
                >
                    <input {...getInputProps()} />
                    <CloudArrowUp size={48} color="var(--primary)" />
                    <p>{t('upload.drag_drop')}</p>
                    <small style={{ color: 'var(--text-secondary)' }}>{t('upload.supports')}</small>
                </div>

                {files.length > 0 && (
                    <div className={styles.fileList}>
                        {files.map((file, idx) => (
                            <div key={idx} className={styles.fileItem}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileImage size={20} />
                                    {file.name}
                                </div>
                                <button onClick={() => setFiles([])} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {status && <p style={{ marginTop: '1rem', textAlign: 'center', color: uploading ? 'var(--primary)' : 'red' }}>{status}</p>}

                <button
                    className={styles.uploadBtn}
                    onClick={handleUpload}
                    disabled={files.length === 0 || uploading}
                >
                    {uploading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Spinner className="spin" size={20} /> {t('upload.processing')}</span> : t('upload.btn_analyze')}
                </button>
            </div>

            {/* CSS Animation for Spinner */}
            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}