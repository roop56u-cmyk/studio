"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
  totalStars?: number;
}

export function StarRating({ rating, setRating, totalStars = 5 }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {[...Array(totalStars)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={index}
            className="focus:outline-none"
            onClick={() => setRating(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(null)}
            aria-label={`Rate ${ratingValue} out of ${totalStars} stars`}
          >
            <Star
              className={cn(
                "h-6 w-6 cursor-pointer transition-colors",
                ratingValue <= (hover || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
