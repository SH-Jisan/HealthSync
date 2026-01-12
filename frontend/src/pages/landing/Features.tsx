import { Brain, Heartbeat, ShieldCheck, Users } from 'phosphor-react';
import styles from './styles/Features.module.css';

const features = [
    {
        icon: <Brain size={32} weight="fill" />,
        title: "AI Doctor",
        desc: "Get instant symptom analysis and triage recommendations using advanced AI algorithms."
    },
    {
        icon: <Heartbeat size={32} weight="fill" />,
        title: "Vitals Tracking",
        desc: "Monitor your health vitals over time and get alerts for any irregularities."
    },
    {
        icon: <ShieldCheck size={32} weight="fill" />,
        title: "Secure Records",
        desc: "Your medical history is encrypted and stored securely, accessible only by you and your doctors."
    },
    {
        icon: <Users size={32} weight="fill" />,
        title: "Doctor Connect",
        desc: "Find specialist doctors near you and book appointments seamlessly."
    }
];

export default function Features() {
    return (
        <section id="features" className={styles.section}>
            <div className={styles.titleContainer}>
                <h2 className={styles.title}>Why Choose HealthSync?</h2>
                <div className={styles.underline}></div>
            </div>

            <div className={styles.grid}>
                {features.map((feature, idx) => (
                    <div key={idx} className={styles.card}>
                        <div className={styles.iconBox}>
                            {feature.icon}
                        </div>
                        <h3 className={styles.cardTitle}>{feature.title}</h3>
                        <p className={styles.cardDesc}>{feature.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
