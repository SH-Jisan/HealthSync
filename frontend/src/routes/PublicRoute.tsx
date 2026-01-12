import { Navigate, Outlet } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { PATHS } from './paths';

interface PublicRouteProps {
    session: Session | null;
}

const PublicRoute = ({ session }: PublicRouteProps) => {
    if (session) {
        return <Navigate to={PATHS.DASHBOARD} replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
