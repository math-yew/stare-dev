'use client';
import styles from './styles/Home.module.css';
import SquareView from './_components/SquareView';
import { useParams, usePathname } from 'next/navigation';

export default function Home() {
  
  const params = useParams();
  const pathname = usePathname();
  const squareValue = params.square;
  console.log("******************");
  console.log(pathname);
  console.log(squareValue);

  return (
    <SquareView slug="" />
  );
}