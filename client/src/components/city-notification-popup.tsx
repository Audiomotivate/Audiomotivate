import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, MapPin, Users } from 'lucide-react';
import { geoService } from '../lib/geoService';

interface CityNotificationPopupProps {
  onClose: () => void;
}

export default function CityNotificationPopup({ onClose }: CityNotificationPopupProps) {
  const [city, setCity] = useState('tu ciudad');
  const [isVisible, setIsVisible] = useState(false);
  const [purchaseCount] = useState(Math.floor(Math.random() * 8) + 3); // 3-10 purchases

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await geoService.getLocation();
        if (location && location.city) {
          setCity(location.city);
        } else {
          // Fallback to Mexican cities if geolocation fails
          const mexicanCities = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón', 'Querétaro', 'Mérida'];
          const randomCity = mexicanCities[Math.floor(Math.random() * mexicanCities.length)];
          setCity(randomCity);
        }
      } catch (error) {
        console.error('Error getting location:', error);
        // Fallback to Mexican cities
        const mexicanCities = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón', 'Querétaro', 'Mérida'];
        const randomCity = mexicanCities[Math.floor(Math.random() * mexicanCities.length)];
        setCity(randomCity);
      }
    };

    fetchLocation();
    
    // Show popup after 3 seconds to allow time for geolocation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 5000);
      
      return () => clearTimeout(hideTimer);
    }, 3000);

    return () => clearTimeout(showTimer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className={`transform transition-all duration-300 shadow-xl border-0 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        <CardContent className="p-4 relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-1 right-1 h-6 w-6 rounded-full text-white hover:bg-white/20"
          >
            <X className="h-3 w-3" />
          </Button>
          
          <div className="pr-6">
            <div className="flex items-center mb-2">
              <Users className="h-4 w-4 mr-2 text-yellow-300" />
              <span className="font-bold text-sm">¡Tendencia en {city}!</span>
            </div>
            
            <p className="text-xs text-blue-100 leading-relaxed">
              <span className="font-bold text-yellow-300">{purchaseCount} personas</span> de tu ciudad compraron audios motivacionales hoy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}