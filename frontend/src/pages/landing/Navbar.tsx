import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import styles from './styles/Navbar.module.css';

interface NavbarProps {
    showLogo?: boolean;
}

export default function Navbar({ showLogo = true }: NavbarProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className={styles.navbar}>
            <div
                className={styles.logo}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                {/* Invisible Placeholder Image */}
                <img
                    src="/logo2.png"
                    alt="HealthSync Logo"
                    className={styles.logoImage}
                    style={{ opacity: 0 }}
                />

                {/* [FIXED] Colored Text for Glass Background */}
                <span style={{
                    opacity: showLogo ? 1 : 0,
                    transition: 'opacity 0.5s ease 0.5s',
                    visibility: showLogo ? 'visible' : 'hidden',
                    display: 'flex',
                    gap: '0px',
                    fontSize: '1.5rem',
                    fontWeight: '800', /* এক্সট্রা বোল্ড */
                    letterSpacing: '-0.5px'
                }}>
                    {/* Health: গাঢ় নীল */}
                    <span style={{ color: '#0056D2' }}>Health</span>

                    {/* Sync: উজ্জ্বল সবুজ */}
                    <span style={{ color: '#00796B' }}>Sync</span>
                </span>
            </div>

            <ul className={styles.navItems}>
                <li><a onClick={() => scrollToSection('features')}>{t('landing.nav_features', 'Features')}</a></li>
                <li><a onClick={() => scrollToSection('about')}>{t('landing.nav_about', 'About')}</a></li>
                <li><a onClick={() => scrollToSection('contact')}>{t('landing.nav_contact', 'Contact')}</a></li>
            </ul>

            <div className={styles.navActions}>
                <LanguageSwitcher variant="text" className={styles.langToggle} />
                <div className={styles.loginBtn}>
                    <button onClick={() => navigate('/login')}>
                        {t('common.login', 'Login')}
                    </button>
                </div>
            </div>
        </nav>
    );
}
