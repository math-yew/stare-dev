'use client';
import Image from 'next/image'

export default function PurpleJiggle() {
  return (
    <div className='page-content items-center'>
      <h2 className='items-center'>Purple Jiggle</h2>
      <p>Twist your phone back and forth, or shake it, all while facing the screen towards your face.</p>
      <p>What does the purple ball do?  Do you see it bobble around? Does it's position seem to lag behind?</p>
      <Image
        src="/purple jiggle.png"
        width={1320}
        height={849}  
        style={{
          width: '100%',
          height: 'auto'
        }}
        alt="Purple jiggle illusion"
      />
    </div>
  ) 
}