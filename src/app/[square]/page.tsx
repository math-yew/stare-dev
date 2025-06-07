// 'use client';

// import { useParams, usePathname } from 'next/navigation';
import CentralSquare from '../_components/CentralSquare';
import SquareView from '../_components/SquareView';

interface SquareParams {
  square: string;
}

export async function generateStaticParams(): Promise<SquareParams []> {
  const illusions = [
    'tarzan', 
    'bouncyballroom',
    'purplejiggle',
    'cartoonmaker',
    'mullerlyer', 
    // End of illusion slugs
    ];
  return illusions.map((page)=>( {square: page} ));
}

interface Props {
  params: SquareParams;
}

export default async function SquarePage({
  params,
}: {
  params: Promise<{ square: string }>
}) {
  const { square } = await params;


  let squareValue: string  = square;

  return (
    <div>
      <SquareView slug={squareValue} />
    </div>
  )
}