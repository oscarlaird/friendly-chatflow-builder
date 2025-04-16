
import React, { useState, useEffect } from 'react';

interface AnimatedTextProps {
  phrases: string[];
  baseText: string;
  className?: string;
  typingSpeed?: number;
  deleteSpeed?: number;
  delayBetweenPhrases?: number;
}

export const AnimatedText = ({
  phrases,
  baseText,
  className = '',
  typingSpeed = 70,
  deleteSpeed = 30,
  delayBetweenPhrases = 2000
}: AnimatedTextProps) => {
  const [displayedText, setDisplayedText] = useState(baseText);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isTyping && !isPaused) {
      const currentPhrase = phrases[currentPhraseIndex];
      const currentTextLength = displayedText.length - baseText.length;
      
      if (currentTextLength < currentPhrase.length) {
        // Still typing the current phrase
        timeout = setTimeout(() => {
          setDisplayedText(baseText + currentPhrase.substring(0, currentTextLength + 1));
        }, typingSpeed);
      } else {
        // Finished typing the current phrase
        setIsPaused(true);
        timeout = setTimeout(() => {
          setIsPaused(false);
          setIsTyping(false);
        }, delayBetweenPhrases);
      }
    } else if (!isTyping && !isPaused) {
      const currentTextLength = displayedText.length - baseText.length;
      
      if (currentTextLength > 0) {
        // Deleting the current phrase
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
        }, deleteSpeed);
      } else {
        // Completely deleted, move to next phrase
        const nextPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        setCurrentPhraseIndex(nextPhraseIndex);
        setIsTyping(true);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayedText, currentPhraseIndex, isTyping, isPaused, phrases, baseText, typingSpeed, deleteSpeed, delayBetweenPhrases]);
  
  return <span className={className}>{displayedText}</span>;
};
