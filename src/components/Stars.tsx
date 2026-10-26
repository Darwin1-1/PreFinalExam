export default function Stars({ rating }: { rating: number }) {
  return (
    <div className="rating" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index + 1 <= rating
        const half = !filled && index < rating
        return (
          <span
            key={`${rating}-${index}`}
            className={`star ${filled ? 'full' : half ? 'half' : 'empty'}`}
            aria-hidden="true"
          >
            &#9733;
          </span>
        )
      })}
    </div>
  )
}
