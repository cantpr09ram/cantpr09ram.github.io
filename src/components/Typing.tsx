import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface TypewriterEffectProps {
  text: string;
  speed: number;
}

const useTypewriter = (text: string, speed = 100) => {
  const controls = useAnimation();
  const [displayedText, setDisplayedText] = React.useState("");

  useEffect(() => {
    const animateText = async () => {
      for (let i = 0; i <= text.length; i++) {
        await controls.start({
          width: `${(i / text.length) * 100}%`,
          transition: { duration: speed / 1000 },
        });
        setDisplayedText(text.slice(0, i));
      }
    };

    animateText();
  }, [text, speed, controls]);

  return { controls, displayedText };
};

export default function TypewriterEffect({
  text,
  speed,
}: TypewriterEffectProps) {
  const { controls, displayedText } = useTypewriter(text, speed);

  return (
    <div className="flex items-start">
      <motion.div
        className="absolute"
        initial={{ width: 0 }}
        animate={controls}
      />
      <h1 className="text-4xl font-bold relative z-10">
        {displayedText || <span className="opacity-50">&nbsp;</span>}
      </h1>
    </div>
  );
}
