import styles from '../styles/Home.module.css';
import SideSquare from './SideSquare';
import CentralSquare from './CentralSquare';
import Spinner from './illusions/Spinner';
import BouncyBallroom from './illusions/BouncyBallroom';
import CartoonMaker from './illusions/CartoonMaker';
import MullerLyer from './illusions/MullerLyer';
import AsciiArt from './illusions/AsciiArt';
import AroundThePole from './illusions/AroundThePole';
import DoubleArm from './illusions/DoubleArm';
// End of Imports

interface Props {
  slug: string | null
}

export default function SquareView(props: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.sideSquares}>
        <SideSquare link="/asciiart" title="AsciiArt" imageName="thumbnails/asciiart thumbnail.jpg"/>
        <SideSquare link="/tarzan" title="Tarzan Illusion" imageName="thumbnails/tarzan thumbnail.jpg"/>
        <SideSquare link="/bouncyballroom" title="Bouncy Ballroom" imageName="thumbnails/bouncy ballroom thumbnail.jpg"/>
        <SideSquare link="/doublearm" title="DoubleArm" imageName="thumbnails/doublearm thumbnail.jpg"/>
        {/*  End of side squares */}
      </div>

      <div className={styles.centralSquare}>
        <CentralSquare slug={props.slug} />
      </div>

      <div className={styles.sideSquares}>
      
        <SideSquare link="/mullerlyer" title="Muller Lyer" imageName="thumbnails/muller lyer thumbnail.jpg"/>
        <SideSquare link="/cartoonmaker" title="Cartoon Maker" imageName="thumbnails/cartoon maker thumbnail.jpg" />
        <SideSquare link="/purplejiggle" title="Purple Jiggle" imageName="thumbnails/purple jiggle thumbnail.png" />
        <SideSquare link="/aroundthepole" title="AroundThePole" imageName="thumbnails/aroundthepole thumbnail.jpg"/>
        {/* <SideSquare link="/spinner" title="Spinner" /> */}
      </div>
    </div>
  );
}