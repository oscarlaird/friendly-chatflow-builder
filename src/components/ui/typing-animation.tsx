
import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  phrases: string[];
  typingSpeed?: number;
  deleteSpeed?: number;
  delayBetweenPhrases?: number;
}

export function TypingAnimation({
  phrases,
  typingSpeed = 70,
  deleteSpeed = 50,
  delayBetweenPhrases = 2000,
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: number;
    
    if (isTyping && !isDeleting) {
      // Typing animation
      if (displayText.length < phrases[currentPhraseIndex].length) {
        timer = window.setTimeout(() => {
          setDisplayText(phrases[currentPhraseIndex].substring(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Finished typing current phrase
        setIsTyping(false);
        timer = window.setTimeout(() => {
          setIsDeleting(true);
        }, delayBetweenPhrases);
      }
    } else if (isDeleting) {
      // Deleting animation
      if (displayText.length > 0) {
        timer = window.setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, deleteSpeed);
      } else {
        // Finished deleting, move to next phrase
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsTyping(true);
      }
    } else {
      // Pause before starting to delete
      timer = window.setTimeout(() => {
        setIsDeleting(true);
      }, delayBetweenPhrases);
    }

    return () => clearTimeout(timer);
  }, [displayText, currentPhraseIndex, isTyping, isDeleting, phrases, typingSpeed, deleteSpeed, delayBetweenPhrases]);

  return (
    <div className="typing-container">
      <span className="typing-text">{displayText}</span>
      <span className="typing-cursor">|</span>
    </div>
  );
}
