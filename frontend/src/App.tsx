import { BrowserRouter } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import AppRoutes from './routes/AppRoutes';
import styles from './styles/App.module.css';

function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                Loading HealthSync...
            </div>
        );
    }

    return (
        <BrowserRouter>
            <AppRoutes session={session} />
        </BrowserRouter>
    );
}

export default App;