'use client';
import Default from './Default';
import { componentNames } from './illusionImports.tsx';

import Tarzan from './illusions/Tarzan';
import PurpleJiggle from './illusions/PurpleJiggle';
import Spinner from './illusions/Spinner';
import BouncyBallroom from './illusions/BouncyBallroom';
import CartoonMaker from './illusions/CartoonMaker';
import MullerLyer from './illusions/MullerLyer.tsx';
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

export default function CentralSquare(props: Props) {
  let content = <Default />;

  if(props.slug?.toLowerCase() == "tarzan") 
    content = <Tarzan />
  if(props.slug?.toLowerCase() == "purplejiggle") 
    content = <PurpleJiggle />
  if(props.slug?.toLowerCase() == "spinner") 
    content = <Spinner />
  if(props.slug?.toLowerCase() == "bouncyballroom") 
    content = <BouncyBallroom />
  if(props.slug?.toLowerCase() == "cartoonmaker") 
    content = <CartoonMaker />
  if(props.slug?.toLowerCase() == "mullerlyer") 
    content = <MullerLyer />
  if(props.slug?.toLowerCase() == "asciiart") 
    content = <AsciiArt />
  if(props.slug?.toLowerCase() == "aroundthepole") 
    content = <AroundThePole />
  if(props.slug?.toLowerCase() == "doublearm") 
    content = <DoubleArm />
  if(props.slug?.toLowerCase() == "invertedcolor") 
    content = <InvertedColor />
  if(props.slug?.toLowerCase() == "spinningspirals") 
    content = <SpinningSpirals />
  if(props.slug?.toLowerCase() == "trippydraw") 
    content = <TrippyDraw />
  if(props.slug?.toLowerCase() == "gradientpattern") 
    content = <GradientPattern />
  if(props.slug?.toLowerCase() == "stripeanimator") 
    content = <StripeAnimator />
  // End of content section
  return (
    <div>
      {content}
    </div>
  );
}