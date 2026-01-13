// File: HealthSync/web/src/types/index.ts

export interface AIAnalysisDetails {
    simple_explanation_en?: string;
    simple_explanation_bn?: string;
    detailed_analysis_en?: string;
    detailed_analysis_bn?: string;

    // [NEW] Disease Insight Fields
    disease_insight_en?: string;
    disease_insight_bn?: string;

    medicine_safety_check?: string;
    key_findings?: string[];
}

export interface MedicalEvent {
    id: string;
    title: string;
    event_type: 'REPORT' | 'PRESCRIPTION' | 'VACCINATION';
    event_date: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    summary?: string;
    key_findings?: string[];
    attachment_urls?: string[];
    extracted_text?: string;

    // [NEW] AI Details from Backend
    ai_details?: AIAnalysisDetails;

    vitals?: {
        bp?: string;
        hr?: string;
        temp?: string;
        weight?: string;
    };
    medicines?: {
        name: string;
        dosage?: string;
        duration?: string;
    }[];
    uploader?: {
        id: string;
        full_name: string;
        specialty?: string;
    };
    patient_id: string;
    profiles?: {
        full_name: string;
        phone: string;
    };
    created_at: string;
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
    profiles?: {
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

export interface Doctor {
    id: string;
    full_name: string;
    specialty?: string;
    phone?: string;
    avatar_url?: string;
}

export interface Appointment {
    id: string;
    doctor_id: string;
    patient_id: string;
    appointment_date: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    reason?: string;
}