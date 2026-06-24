import { supabase } from '@/shared/lib/supabaseClient';
import type { BloodRequest } from '@/types';

export const bloodApi = {
    getMyRequests: async (userId: string | undefined) => {
        if (!userId) return [];

        const { data, error } = await supabase
            .from('blood_requests')
            .select('*')
            .eq('requester_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as BloodRequest[];
    },

    deleteRequest: async (id: string) => {
        const { error } = await supabase
            .from('blood_requests')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
