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
import InvertedColor from './illusions/InvertedColor';
import SpinningSpirals from './illusions/SpinningSpirals';
import TrippyDraw from './illusions/TrippyDraw';
import GradientPattern from './illusions/GradientPattern';
import StripeAnimator from './illusions/StripeAnimator';
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
        <SideSquare link="/doublearm" title="DoublevArm" imageName="thumbnails/doublearm thumbnail.jpg"/>
        <SideSquare link="/invertedcolor" title="InvertedvColor" imageName="thumbnails/invertedcolor thumbnail.jpg"/>
        {/* <SideSquare link="/trippydraw" title="TrippyDraw" imageName="thumbnails/trippydraw thumbnail.jpg"/> */}
        <SideSquare link="/stripeanimator" title="StripeAnimator" imageName="thumbnails/stripeanimator thumbnail.jpg"/>
        {/*  End of side squares */}
      </div>

      <div className={styles.centralSquare}>
        <CentralSquare slug={props.slug} />
      </div>

      <div className={styles.sideSquares}>
      
        <SideSquare link="/mullerlyer" title="Muller Lyer" imageName="thumbnails/muller lyer thumbnail.jpg"/>
        <SideSquare link="/cartoonmaker" title="Cartoon Maker" imageName="thumbnails/cartoon maker thumbnail.jpg" />
        <SideSquare link="/purplejiggle" title="Purple Jiggle" imageName="thumbnails/purple jiggle thumbnail.png" />
        <SideSquare link="/aroundthepole" title="Around The Pole" imageName="thumbnails/aroundthepole thumbnail.jpg"/>
        <SideSquare link="/spinningspirals" title="Spinning Spirals" imageName="thumbnails/spinningspirals thumbnail.jpg"/>
        <SideSquare link="/gradientpattern" title="GradientPattern" imageName="thumbnails/gradientpattern thumbnail.jpg"/>
        {/* <SideSquare link="/spinner" title="Spinner" /> */}
      </div>
    </div>
  );
}