import { Navigate, Outlet } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { PATHS } from './paths';

interface ProtectedRouteProps {
    session: Session | null;
}

const ProtectedRoute = ({ session }: ProtectedRouteProps) => {
    if (!session) {
        return <Navigate to={PATHS.LOGIN} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
