interface GeoResponse {
  ip: string;
  country: string;
  city: string;
}

class GeoService {
  private apiUrl = 'https://get.geojs.io/v1/ip/geo.json';
  
  async getLocation(): Promise<GeoResponse | null> {
    try {
      const response = await fetch(this.apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      return {
        ip: data.ip,
        country: data.country,
        city: data.city
      };
    } catch (error) {
      console.error('Error fetching location:', error);
      return null;
    }
  }
}

export const geoService = new GeoService();
