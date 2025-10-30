import { useState, useEffect } from 'react';

export default function useHomeViewModel() {
  const [message, setMessage] = useState('Welcome to Home!');

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage('Data loaded!');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { message };
}