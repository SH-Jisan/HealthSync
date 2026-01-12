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
    const [isError, setIsError] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
        setIsError(false);
        setStatus('');
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
        setIsError(false);
        setStatus(t('upload.status_uploading'));

        try {
            const file = files[0];
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error(t('upload.error_no_user'));

            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('medical_docs')
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

        } catch (error: unknown) {
            console.error('Upload failed:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            setIsError(true);
            setStatus(`${t('upload.error_fail')}: ${message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{t('upload.title')}</h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <div
                    {...getRootProps()}
                    className={`${styles.dropzone} ${isDragActive ? styles.activeDropzone : ''}`}
                >
                    <input {...getInputProps()} />
                    <CloudArrowUp size={48} color="var(--primary)" />
                    <p className={styles.dropText}>{t('upload.drag_drop')}</p>
                    <small className={styles.supportText}>{t('upload.supports')}</small>
                </div>

                {files.length > 0 && (
                    <div className={styles.fileList}>
                        {files.map((file, idx) => (
                            <div key={idx} className={styles.fileItem}>
                                <div className={styles.fileInfo}>
                                    <FileImage size={20} />
                                    {file.name}
                                </div>
                                <button
                                    onClick={() => setFiles([])}
                                    className={styles.removeBtn}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {status && (
                    <p className={`${styles.status} ${isError ? styles.statusError : styles.statusUploading}`}>
                        {status}
                    </p>
                )}

                <button
                    className={styles.uploadBtn}
                    onClick={handleUpload}
                    disabled={files.length === 0 || uploading}
                >
                    {uploading ? (
                        <span className={styles.spinnerWrapper}>
                            <Spinner className={styles.spinner} size={20} />
                            {t('upload.processing')}
                        </span>
                    ) : (
                        t('upload.btn_analyze')
                    )}
                </button>
            </div>
        </div>
    );
}