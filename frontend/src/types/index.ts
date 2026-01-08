// src/types/index.ts
export interface MedicalEvent {
    id: string;
    title: string;
    event_type: 'REPORT' | 'PRESCRIPTION' | 'VACCINATION'; // Enums from DB
    event_date: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    summary?: string;
    key_findings?: string[];
    attachment_urls?: string[];
    created_at: string;
    // ai_details?: any; // যদি লাগে
}
export interface BloodRequest {
    id: string;
    requester_id: string;
    blood_group: string;
    hospital_name: string;
    urgency: 'NORMAL' | 'CRITICAL';
    reason?: string;
    status: 'OPEN' | 'FULFILLED';
    accepted_count: number;
    created_at: string;
    profiles?: { // requester details
        full_name: string;
        phone: string;
    };
}

export interface DonorProfile {
    user_id: string;
    availability: boolean;
    last_donation_date?: string;
    profiles?: {
        full_name: string;
        blood_group: string;
        district: string;
        phone: string;
    };
}