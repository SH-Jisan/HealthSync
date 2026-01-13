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

    // Helper: Convert File to Base64 String
    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the data URL prefix (e.g., "data:image/jpeg;base64,") to get raw base64
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

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

            // Note: Using 'reports' bucket as per your instruction
            const { error: uploadError } = await supabase.storage
                .from('reports')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get Public URL for the database
            const { data: { publicUrl } } = supabase.storage
                .from('reports')
                .getPublicUrl(fileName);

            // 2. Prepare Data for AI Analysis
            setStatus(t('upload.status_analyzing'));

            // Convert file to Base64 for Gemini AI
            const base64String = await convertToBase64(file);

            // 3. Call Edge Function (Updated Payload to match Backend)
            const { error: funcError } = await supabase.functions.invoke('process-medical-report', {
                body: {
                    patient_id: user.id,
                    uploader_id: user.id,
                    imageBase64: base64String, // <--- This was missing before
                    mimeType: file.type,
                    file_url: publicUrl,
                    file_path: fileName,
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