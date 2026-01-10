import DoctorAppointments from './doctor/DoctorAppointments';

export default function DoctorHome() {
    return (
        <div>
            <div style={{
                background: 'linear-gradient(to right, var(--primary), var(--primary-dark))',
                padding: '2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem'
            }}>
                <h1 style={{ margin: 0 }}>Doctor's Panel</h1>
                <p style={{ opacity: 0.9 }}>Manage your appointments and patient records.</p>
            </div>

            {/* Tabs could be added here (Appointments, Patients, Analytics) */}

            <DoctorAppointments />
        </div>
    );
}