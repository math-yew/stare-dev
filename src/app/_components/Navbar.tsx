import Link from 'next/link';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/video" className={styles.navLink}>
            Video
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/share" className={styles.navLink}>
            Share
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
}