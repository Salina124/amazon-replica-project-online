
import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-white">
        <div className="container mx-auto px-4 py-16 flex flex-col items-center">
          <div className="max-w-2xl w-full text-center">
            <img
              src="https://m.media-amazon.com/images/G/01/error/title._TTD_.png"
              alt="Dog mascots"
              className="mx-auto mb-6"
            />
            
            <h1 className="text-3xl font-bold mb-4">Looking for something?</h1>
            
            <p className="text-lg mb-6">
              We're sorry. The Web address you entered is not a functioning page on our site.
            </p>
            
            <div className="bg-gray-100 p-6 rounded-md mb-8">
              <p className="font-medium mb-2">Try these instead:</p>
              <ul className="list-disc list-inside text-amazon-light">
                <li>
                  <Link to="/" className="hover:text-amazon-orange hover:underline">
                    Go to the homepage
                  </Link>
                </li>
                <li>
                  <Link to="/deals" className="hover:text-amazon-orange hover:underline">
                    Browse today's deals
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="hover:text-amazon-orange hover:underline">
                    Check your account
                  </Link>
                </li>
              </ul>
            </div>
            
            <Button asChild className="bg-amazon-button text-amazon-default hover:bg-amazon-button-hover">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Homepage
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
