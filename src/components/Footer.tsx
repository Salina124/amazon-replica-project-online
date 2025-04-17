
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-amazon-default text-white">
      {/* Back to top button */}
      <div className="bg-amazon-light hover:bg-gray-700 transition-colors cursor-pointer">
        <a href="#top" className="block text-center py-4 text-sm">Back to top</a>
      </div>
      
      {/* Main footer links */}
      <div className="container mx-auto py-10 grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
        <div>
          <h3 className="font-bold mb-3">Get to Know Us</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/about" className="hover:underline">Careers</Link></li>
            <li><Link to="/blog" className="hover:underline">Blog</Link></li>
            <li><Link to="/about" className="hover:underline">About Amazon</Link></li>
            <li><Link to="/sustainability" className="hover:underline">Sustainability</Link></li>
            <li><Link to="/press" className="hover:underline">Press Center</Link></li>
            <li><Link to="/investor-relations" className="hover:underline">Investor Relations</Link></li>
            <li><Link to="/devices" className="hover:underline">Amazon Devices</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold mb-3">Make Money with Us</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/sell" className="hover:underline">Sell products on Amazon</Link></li>
            <li><Link to="/sell-apps" className="hover:underline">Sell apps on Amazon</Link></li>
            <li><Link to="/associates" className="hover:underline">Become an Affiliate</Link></li>
            <li><Link to="/creator-academy" className="hover:underline">Become a Creator</Link></li>
            <li><Link to="/sell-services" className="hover:underline">Sell Your Services</Link></li>
            <li><Link to="/self-publish" className="hover:underline">Self-Publish with Us</Link></li>
            <li><Link to="/host" className="hover:underline">Host an Amazon Hub</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold mb-3">Amazon Payment Products</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/rewards-card" className="hover:underline">Amazon Rewards Visa Signature Cards</Link></li>
            <li><Link to="/store-card" className="hover:underline">Amazon Store Card</Link></li>
            <li><Link to="/secure-card" className="hover:underline">Amazon Secured Card</Link></li>
            <li><Link to="/business-card" className="hover:underline">Amazon Business Card</Link></li>
            <li><Link to="/credit-line" className="hover:underline">Shop with Points</Link></li>
            <li><Link to="/credit-line" className="hover:underline">Credit Card Marketplace</Link></li>
            <li><Link to="/reload-balance" className="hover:underline">Reload Your Balance</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold mb-3">Let Us Help You</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/covid" className="hover:underline">Amazon and COVID-19</Link></li>
            <li><Link to="/your-account" className="hover:underline">Your Account</Link></li>
            <li><Link to="/your-orders" className="hover:underline">Your Orders</Link></li>
            <li><Link to="/shipping-rates" className="hover:underline">Shipping Rates & Policies</Link></li>
            <li><Link to="/returns" className="hover:underline">Returns & Replacements</Link></li>
            <li><Link to="/manage-content" className="hover:underline">Manage Your Content and Devices</Link></li>
            <li><Link to="/help" className="hover:underline">Help</Link></li>
          </ul>
        </div>
      </div>
      
      {/* Footer bottom */}
      <div className="border-t border-gray-700 py-6">
        <div className="container mx-auto flex justify-center items-center">
          <Logo />
        </div>
        <div className="text-xs text-gray-400 text-center mt-4">
          <p>© 1996-2025, Amazon.com, Inc. or its affiliates</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
