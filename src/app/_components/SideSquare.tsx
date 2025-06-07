import Link from 'next/link';
import styles from '../styles/Home.module.css';

interface SideSquareProps {
  link: string;
  title?: string;
  imageName?: string;
}

export default function SideSquare({ link, title, imageName }: SideSquareProps) {
  return (
    <Link href={link} className={styles.sideSquareLink}>
      <div className={styles.sideSquare} style={{backgroundImage: 'url("/' + imageName + '")'}}>
        <div className={styles.tileOverlay}>
          {title}
        </div>
      </div>
    </Link>
  );
}