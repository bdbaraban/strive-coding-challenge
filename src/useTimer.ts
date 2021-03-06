import { useState, useEffect } from 'react';

const useTimer = (initialTime: number) => {
  const [time, setTime] = useState(initialTime);

  const reset = () => setTime(initialTime);

  useEffect((): void | VoidFunction => {
    if (time > 0) {
      // Tick down timer
      const interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);

      return (): void => clearInterval(interval);
    }
  }, [time]);

  const min = Math.floor(time / 60);
  const sec = time - min * 60;
  const string = `${min < 10 ? `0${min}` : min}:${sec < 10 ? `0${sec}` : sec}`;

  return { time, string, reset };
};

export default useTimer;
