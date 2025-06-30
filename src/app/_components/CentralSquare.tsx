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
  // End of content section
  return (
    <div>
      {content}
    </div>
  );
}