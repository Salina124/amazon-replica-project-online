import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Globe, Send } from 'lucide-react';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !email || !subject || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent successfully', {
        description: 'We will get back to you as soon as possible',
      });
      
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto py-8 px-4">
          {/* Breadcrumb */}
          <div className="text-sm mb-6">
            <Link to="/" className="text-amazon-light hover:text-amazon-orange">Home</Link> {' > '}
            <span className="font-medium">Contact Us</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-6">Get In Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="mt-1 mr-4 bg-amazon-yellow p-2 rounded-full">
                      <MapPin className="h-5 w-5 text-amazon-default" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Our Location</h3>
                      <p className="text-gray-600 mt-1">
                        410 Terry Ave N<br />
                        Seattle, WA 98109<br />
                        United States
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-4 bg-amazon-yellow p-2 rounded-full">
                      <Mail className="h-5 w-5 text-amazon-default" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email Us</h3>
                      <p className="text-gray-600 mt-1">
                        <a href="mailto:support@amazon.com" className="hover:underline text-amazon-light">
                          support@amazon.com
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-4 bg-amazon-yellow p-2 rounded-full">
                      <Phone className="h-5 w-5 text-amazon-default" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Call Us</h3>
                      <p className="text-gray-600 mt-1">
                        <a href="tel:+18004444444" className="hover:underline text-amazon-light">
                          +1 (800) 444-4444
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-4 bg-amazon-yellow p-2 rounded-full">
                      <Globe className="h-5 w-5 text-amazon-default" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Working Hours</h3>
                      <p className="text-gray-600 mt-1">
                        Monday - Sunday: 24/7<br />
                        Customer service available round the clock
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Full Name*
                      </label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email Address*
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">
                      Subject*
                    </label>
                    <Select value={subject} onValueChange={setSubject} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                        <SelectItem value="Product Support">Product Support</SelectItem>
                        <SelectItem value="Order Issue">Order Issue</SelectItem>
                        <SelectItem value="Return or Refund">Return or Refund</SelectItem>
                        <SelectItem value="Technical Support">Technical Support</SelectItem>
                        <SelectItem value="Account Help">Account Help</SelectItem>
                        <SelectItem value="Feedback">Feedback</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium mb-1">
                      Message*
                    </label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Your message"
                      rows={5}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto bg-amazon-yellow hover:bg-amazon-orange text-amazon-default"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-10 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">How do I track my order?</h3>
                <p className="text-gray-600">
                  You can track your order by going to Your Orders in your account, or by clicking on the tracking link in your shipping confirmation email.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">How do I return an item?</h3>
                <p className="text-gray-600">
                  Go to Your Orders in your account, select the item you want to return, and follow the prompts. You can print a return label or get a QR code for drop-off.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">When will I receive my refund?</h3>
                <p className="text-gray-600">
                  Refunds are processed once we receive your returned item. It usually takes 3-5 business days for the refund to appear in your account.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">How do I change or cancel my order?</h3>
                <p className="text-gray-600">
                  Go to Your Orders in your account, and if the order hasn't shipped yet, you may have the option to cancel or change it. Otherwise, you'll need to wait for it to arrive and then return it.
                </p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link to="/help" className="text-amazon-light hover:text-amazon-orange hover:underline">
                View all FAQs
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactUs; 