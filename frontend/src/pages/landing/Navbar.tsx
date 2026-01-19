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
            <div className={styles.navContainer}>
                <div
                    className={styles.logo}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <div style={{
                        opacity: showLogo ? 1 : 0,
                        transition: `opacity 0.5s ease ${showLogo ? '1.0s' : '0s'}`,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <div
                            className={styles.gapFromLogo}
                        />
                        <span className={styles.logoText}>
                            <span style={{ color: 'var(--gradient-start)' }}>Health</span>
                            <span style={{ color: 'var(--gradient-end)' }}>Sync</span>
                        </span>
                    </div>
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
            </div>
        </nav>
    );
}
