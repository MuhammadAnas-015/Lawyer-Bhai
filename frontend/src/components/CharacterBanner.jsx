import { useState, useEffect } from "react";
import Avatar3D from "./Avatar3D";

const CharacterBanner = ({ message }) => {
  const [size, setSize] = useState({ w: 300, h: 440 });

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      if (vw <= 480)      setSize({ w: 150, h: 210 });
      else if (vw <= 768) setSize({ w: 180, h: 250 });
      else if (vw <= 1024)setSize({ w: 240, h: 340 });
      else                setSize({ w: 300, h: 440 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="char-banner char-banner--solo">
      <Avatar3D width={size.w} height={size.h} />
    </div>
  );
};

export default CharacterBanner;
