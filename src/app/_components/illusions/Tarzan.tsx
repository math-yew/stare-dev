'use client';
import Image from 'next/image'

export default function Tarzan() {
  return (
    <div className='page-content items-center'>
      <h2 className='items-center'>Tarzan Illusion</h2>
      <p>While staring at these images of tarzan, cross your eyes to overlap the two on top of each other.  You may have to adjust the distance between you and the screen to get that sweet spot where the image falls into place.   What do you see?</p>
      <p>If done right, you will see that Tarzan's body appears to be behind the foilage but his hand reaches out in front of it.</p>
      <Image
        src="/tarzan illusion.jpg"
        width={1320}
        height={849}  
        style={{
          width: '100%',
          height: 'auto'
        }}
        alt="Tarzan optical illusion"
      />
    </div>
  ) 
}