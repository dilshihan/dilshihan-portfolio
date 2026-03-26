import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  // FaXTwitter,
} from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { useEffect } from "react";

const SocialIcons = () => {
  useEffect(() => {
    const social = document.getElementById("social") as HTMLElement;

    const cleanups: (() => void)[] = [];

    social.querySelectorAll("span").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a") as HTMLElement;

      const rect = elem.getBoundingClientRect();
      let mouseX = rect.width / 2;
      let mouseY = rect.height / 2;
      let currentX = rect.width / 2;
      let currentY = rect.height / 2;

      const updatePosition = () => {
        currentX += (mouseX - currentX) * 0.15;
        currentY += (mouseY - currentY) * 0.15;

        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);

        requestAnimationFrame(updatePosition);
      };

      const onMouseMove = (e: MouseEvent) => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < rect.width && x > 0 && y < rect.height && y > 0) {
          mouseX = x;
          mouseY = y;
        } else {
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      updatePosition();

      cleanups.push(() => window.removeEventListener("mousemove", onMouseMove));
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        <span>
          <a href="https://github.com/dilshihan" target="_blank">
            <FaGithub />
          </a>
        </span>
        <span>
          <a href="https://www.linkedin.com/in/muhammed-dilshihan-a68737317/" target="_blank">
            <FaLinkedinIn />
          </a>
        </span>

        <span>
          <a href="https://www.instagram.com/diiilshhann._zx" target="_blank">
            <FaInstagram />
          </a>
        </span>
      </div>

    </div>
  );
};

export default SocialIcons;
