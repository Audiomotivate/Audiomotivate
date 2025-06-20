import { useState } from 'react';
import { Menu, X, ShoppingCart, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';

interface CartResponse {
  cart: {
    id: number;
    sessionId: string;
  };
  items: any[];
}

interface HeaderProps {
  onSearch?: (term: string) => void;
  searchTerm?: string;
  showSearch?: boolean;
  showMobileFixedSearch?: boolean;
}

export default function Header({ onSearch, searchTerm = "", showSearch = true, showMobileFixedSearch = false }: HeaderProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  const { data: cartData } = useQuery<CartResponse>({
    queryKey: ['/api/cart'],
  });

  const itemCount = cartData?.items?.length || 0;
  const isHomePage = location === '/';

  const handleNavigation = (sectionId: string) => {
    setIsMenuOpen(false);
    
    if (isHomePage) {
      // If on home page, scroll to section
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerHeight = 80;
          const elementPosition = element.offsetTop - headerHeight;
          
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      // If on other pages, navigate to home page with section
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm border-b z-50">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-yellow-500">Audio</span>{' '}
                  <span className="text-blue-600">Motívate</span>
                </h1>
              </Link>
            </div>

          {/* Desktop Navigation and Search */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <button 
                onClick={() => handleNavigation('inicio')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Inicio
              </button>
              <button 
                onClick={() => handleNavigation('audiolibros')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Audiolibros
              </button>
              <button 
                onClick={() => handleNavigation('videos')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Audios
              </button>
              <button 
                onClick={() => handleNavigation('guias')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Guías
              </button>
              <button 
                onClick={() => handleNavigation('contacto')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Contacto
              </button>
            </nav>
            
            {/* Search Bar */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={localSearchTerm}
                  onChange={(e) => {
                    setLocalSearchTerm(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                  className="pl-10 w-64 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
            
            {/* Cart Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="relative"
              onClick={() => {
                const event = new CustomEvent('open-cart-drawer');
                window.dispatchEvent(event);
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="relative"
              onClick={() => {
                const event = new CustomEvent('open-cart-drawer');
                window.dispatchEvent(event);
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            {/* Mobile Search */}
            {showSearch && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={localSearchTerm}
                    onChange={(e) => {
                      setLocalSearchTerm(e.target.value);
                      onSearch?.(e.target.value);
                    }}
                    className="pl-10 w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => handleNavigation('inicio')}
                className="text-gray-600 hover:text-blue-600 text-left py-2 border-b border-gray-100 transition-colors"
              >
                Inicio
              </button>
              <button 
                onClick={() => handleNavigation('audiolibros')}
                className="text-gray-600 hover:text-blue-600 text-left py-2 border-b border-gray-100 transition-colors"
              >
                Audiolibros
              </button>
              <button 
                onClick={() => handleNavigation('videos')}
                className="text-gray-600 hover:text-blue-600 text-left py-2 border-b border-gray-100 transition-colors"
              >
                Audios
              </button>
              <button 
                onClick={() => handleNavigation('guias')}
                className="text-gray-600 hover:text-blue-600 text-left py-2 border-b border-gray-100 transition-colors"
              >
                Guías
              </button>
              <button 
                onClick={() => handleNavigation('contacto')}
                className="text-gray-600 hover:text-blue-600 text-left py-2 transition-colors"
              >
                Contacto
              </button>
            </nav>
          </div>
        )}
      </div>
      </header>
      {/* Mobile Fixed Search Bar - Only on Home Page */}
      {showMobileFixedSearch && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm border-b z-40 px-0 py-2 pt-[6px] pb-[6px] mt-[-7px] mb-[-7px]">
          <div className="relative mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={localSearchTerm}
              onChange={(e) => {
                setLocalSearchTerm(e.target.value);
                onSearch?.(e.target.value);
              }}
              className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}