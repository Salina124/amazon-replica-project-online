
import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  title: string;
  image: string;
  link: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, image, link }) => {
  return (
    <div className="bg-white p-5 rounded shadow-sm h-full">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <div className="aspect-square overflow-hidden mb-3">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
        />
      </div>
      <Link to={link} className="text-amazon-light hover:text-amazon-orange text-sm">
        Shop now
      </Link>
    </div>
  );
};

export default CategoryCard;
