
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DealCardProps {
  id: number;
  title: string;
  image: string;
  discountPrice: string;
  originalPrice: string;
  discountPercent: number;
  claimedPercentage: number;
  endsIn?: string;
}

const DealCard: React.FC<DealCardProps> = ({
  id,
  title,
  image,
  discountPrice,
  originalPrice,
  discountPercent,
  claimedPercentage,
  endsIn,
}) => {
  return (
    <Link to={`/deal/${id}`} className="bg-white p-4 rounded shadow-sm block group">
      <div className="relative mb-3">
        <div className="aspect-square overflow-hidden flex items-center justify-center bg-gray-50">
          <img 
            src={image} 
            alt={title} 
            className="max-h-[150px] w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-2 py-1">
          {discountPercent}% OFF
        </div>
      </div>
      
      <div>
        <div className="flex items-baseline mb-1">
          <span className="text-red-600 font-bold mr-2">{discountPrice}</span>
          <span className="text-gray-500 line-through text-xs">{originalPrice}</span>
        </div>
        
        <h3 className="text-sm line-clamp-2 mb-2 group-hover:text-amazon-orange transition-colors">
          {title}
        </h3>
        
        {endsIn && (
          <div className="flex items-center text-xs text-gray-600 mb-2">
            <Clock size={12} className="mr-1" />
            <span>Ends in: {endsIn}</span>
          </div>
        )}
        
        <div className="mt-2">
          <Progress value={claimedPercentage} className="h-2 bg-gray-200" />
          <p className="text-xs text-gray-600 mt-1">
            {claimedPercentage}% claimed
          </p>
        </div>
      </div>
    </Link>
  );
};

export default DealCard;
