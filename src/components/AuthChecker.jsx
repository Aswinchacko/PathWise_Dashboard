import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthChecker = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        console.log('Token expired, redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      console.log('Token is valid, user is authenticated');
    } catch (error) {
      console.log('Invalid token format, redirecting to login');
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  return children;
};

export default AuthChecker;
