// File: src/features/diagnostic/DiagnosticPendingReports.tsx

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardText, ArrowRight } from 'phosphor-react';
import { supabase } from '../../lib/supabaseClient';
import styles from './styles/DiagnosticPatients.module.css';

/* =======================
   Types
======================= */

export interface Patient {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
}

interface PendingOrder {
    id: string;
    created_at: string;
    test_names: string[];
    patient_id: string;
    profiles: Patient;
}

interface Props {
    onSelectPatient: (patient: Patient) => void;
}

/* =======================
   Component
======================= */

export default function DiagnosticPendingReports({ onSelectPatient }: Props) {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<PendingOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchPendingReports = async () => {
        setLoading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('patient_payments')
            .select('*, profiles:patient_id(*)')
            .eq('provider_id', user.id)
            .eq('report_status', 'PENDING')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setOrders(data as PendingOrder[]);
        }

        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPendingReports();
    }, []);

    /* =======================
       Data Fetch
    ======================= */

    /* =======================
       UI States
    ======================= */

    if (loading) {
        return <div>{t('common.loading')}</div>;
    }

    if (orders.length === 0) {
        return (
            <div className={styles.emptyState}>
                <ClipboardText size={48} />
                <p>
                    {t('dashboard.diagnostic.pending.no_reports')}
                </p>
            </div>
        );
    }

    /* =======================
       Render
    ======================= */

    return (
        <div className={styles.grid}>
            {orders.map((order) => (
                <div
                    key={order.id}
                    className={`${styles.card} ${styles.pending}`}
                    onClick={() => onSelectPatient(order.profiles)}
                >
                    <div className={styles.avatar}>
                        <ClipboardText size={20} />
                    </div>

                    <div className={styles.info}>
                        <h4>{order.profiles?.full_name || t('common.unknown')}</h4>

                        <p className={styles.tests}>
                            {t('dashboard.diagnostic.pending.tests_label')} <strong>{order.test_names.join(', ')}</strong>
                        </p>

                        <small>
                            {new Date(order.created_at).toLocaleDateString()}
                        </small>
                    </div>

                    <ArrowRight className={styles.arrow} size={18} />
                </div>
            ))}
        </div>
    );
}
