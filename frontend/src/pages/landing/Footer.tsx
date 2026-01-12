import styles from './styles/Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer} id="contact">
            <div className={styles.content}>
                <div className={styles.column}>
                    <h3>HealthSync</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                        Empowering you to take control of your health with advanced AI and secure record keeping.
                    </p>
                </div>
                <div className={styles.column}>
                    <h3>Services</h3>
                    <ul>
                        <li><a href="#">AI Consultation</a></li>
                        <li><a href="#">Find a Doctor</a></li>
                        <li><a href="#">Blood Bank</a></li>
                        <li><a href="#">Lab Reports</a></li>
                    </ul>
                </div>
                <div className={styles.column}>
                    <h3>Company</h3>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>
            </div>
            <div className={styles.bottom}>
                &copy; {new Date().getFullYear()} HealthSync. All rights reserved.
            </div>
        </footer>
    );
}
