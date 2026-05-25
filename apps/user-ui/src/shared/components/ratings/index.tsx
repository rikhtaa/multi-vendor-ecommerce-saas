import React, { FC } from 'react'

type Props = {
  rating: number
}

const StarFilled = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FE296A" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const StarEmpty = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE296A" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const Ratings: FC<Props> = ({ rating }) => {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<StarFilled key={`star-${i}`} />)
    } else {
      stars.push(<StarEmpty key={`star-${i}`} />)
    }
  }

  return (
    <div className='flex gap-1'>{stars}</div>
  )
}

export default Ratings