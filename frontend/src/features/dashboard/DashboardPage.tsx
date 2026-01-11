// src/features/dashboard/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import CitizenHome from './CitizenHome';
import DoctorHome from './DoctorHome';
import HospitalHome from './HospitalHome';
import DiagnosticHome from "../diagnostic/DiagnosticHome.tsx";

export default function DashboardPage() {
    const { t } = useTranslation();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // রোল সাধারণত ইউজারের মেটাডাটাতে থাকে, অথবা 'profiles' টেবিলে থাকে
                // তোমার Flutter কোড অনুযায়ী: profile['role']
                const roleFromMeta = user.user_metadata?.role;

                // যদি মেটাডাটাতে না থাকে, তাহলে প্রোফাইল টেবিল চেক করতে হবে (Optional)
                if (!roleFromMeta) {
                    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                    setRole(data?.role || 'CITIZEN');
                } else {
                    setRole(roleFromMeta);
                }
            }
            setLoading(false);
        }
        fetchRole();
    }, []);

    if (loading) return <div>{t('dashboard.loading')}</div>;

    // - Role based switch
    switch (role) {
        case 'DOCTOR':
            return <DoctorHome />;
        case 'HOSPITAL':
            return <HospitalHome />;
        case 'DIAGNOSTIC':
            return <DiagnosticHome />;
        case 'CITIZEN':
        default:
            return <CitizenHome />;
    }
}