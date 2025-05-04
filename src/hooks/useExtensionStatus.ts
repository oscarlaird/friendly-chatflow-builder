
import { useState, useEffect } from 'react';

export function useExtensionStatus() {
  const [isExtensionInstalled, setIsExtensionInstalled] = useState<boolean | null>(false);


  useEffect(() => {
    // Set up message listener for extension detection
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'EXTENSION_INSTALLED') {
        setIsExtensionInstalled(true);
      }
    };

    window.addEventListener('message', handleMessage);

    // Send a ping to check if extension is present
    window.postMessage({ type: 'CHECK_EXTENSION' }, '*');

    // Set a timeout to mark extension as not installed if no response received
    // const timeout = setTimeout(() => {
    //   if (isExtensionInstalled === null) {
    //     setIsExtensionInstalled(false);
    //   }
    // }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      // clearTimeout(timeout);
    };
  }, []);

  return { isExtensionInstalled, setIsExtensionInstalled };
}
