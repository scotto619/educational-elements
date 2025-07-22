import { useEffect } from 'react';
import soundService from '../config/services/soundService';

const useInitAudio = () => {
  useEffect(() => {
    const handleClick = () => {
      soundService.resumeAudioContext();
    };

    document.addEventListener('click', handleClick, { once: true });

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);
};

export default useInitAudio;
