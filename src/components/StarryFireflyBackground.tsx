"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  phase: number;
}

interface Firefly {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
  fadeDirection: number; // 1 = fade in, -1 = fade out
  fadeSpeed: number;
  maxOpacity: number;
}

export default function StarryFireflyBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let fireflies: Firefly[] = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Setup stars
    const initStars = (count: number) => {
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.8), // mostly upper portion
          size: Math.random() * 1.5 + 0.5,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    // Setup fireflies
    const initFireflies = (count: number) => {
      fireflies = [];
      for (let i = 0; i < count; i++) {
        fireflies.push({
          x: Math.random() * width,
          y: height * 0.4 + Math.random() * (height * 0.6), // mostly middle to bottom
          size: Math.random() * 2.5 + 1.5,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.3,
          opacity: Math.random(),
          fadeDirection: Math.random() > 0.5 ? 1 : -1,
          fadeSpeed: Math.random() * 0.008 + 0.003,
          maxOpacity: Math.random() * 0.6 + 0.4,
        });
      }
    };

    const isMobile = width < 768;
    initStars(isMobile ? 40 : 100);
    initFireflies(isMobile ? 15 : 35);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const isMobileNow = width < 768;
      initStars(isMobileNow ? 40 : 100);
      initFireflies(isMobileNow ? 15 : 35);
    };

    window.addEventListener("resize", handleResize);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Twinkling Stars
      stars.forEach((star) => {
        star.phase += star.twinkleSpeed;
        const currentOpacity = 0.2 + 0.8 * Math.abs(Math.sin(star.phase));
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();
      });

      // Draw Glowing Fireflies
      fireflies.forEach((firefly) => {
        // Move firefly
        firefly.x += firefly.vx;
        firefly.y += firefly.vy;

        // Change directions randomly, very subtly
        if (Math.random() < 0.01) {
          firefly.vx += (Math.random() - 0.5) * 0.15;
          firefly.vy += (Math.random() - 0.5) * 0.1;
          
          // Speed limit
          const maxSpeed = 0.5;
          const currentSpeed = Math.sqrt(firefly.vx * firefly.vx + firefly.vy * firefly.vy);
          if (currentSpeed > maxSpeed) {
            firefly.vx = (firefly.vx / currentSpeed) * maxSpeed;
            firefly.vy = (firefly.vy / currentSpeed) * maxSpeed;
          }
        }

        // Fade logic
        firefly.opacity += firefly.fadeDirection * firefly.fadeSpeed;
        if (firefly.opacity >= firefly.maxOpacity) {
          firefly.opacity = firefly.maxOpacity;
          firefly.fadeDirection = -1;
        } else if (firefly.opacity <= 0.05) {
          firefly.opacity = 0.05;
          firefly.fadeDirection = 1;
        }

        // Wrap around borders
        if (firefly.x < -20) firefly.x = width + 20;
        if (firefly.x > width + 20) firefly.x = -20;
        if (firefly.y < height * 0.2) firefly.y = height + 20;
        if (firefly.y > height + 20) firefly.y = height * 0.2;

        // Draw firefly with radial glow
        const gradient = ctx.createRadialGradient(
          firefly.x,
          firefly.y,
          0.1,
          firefly.x,
          firefly.y,
          firefly.size * 3.5
        );
        gradient.addColorStop(0, `rgba(0, 255, 135, ${firefly.opacity})`);
        gradient.addColorStop(0.2, `rgba(0, 255, 135, ${firefly.opacity * 0.6})`);
        gradient.addColorStop(0.5, `rgba(0, 245, 212, ${firefly.opacity * 0.2})`);
        gradient.addColorStop(1, "rgba(0, 255, 135, 0)");

        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.size * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw core highlight
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${firefly.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#030705]">
      {/* Global Background Tree & Sky Image */}
      <img
        src="/hero-tree.jpg"
        alt="Mystical Tree Background"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.22] filter brightness-[0.75] contrast-[1.05]"
      />
      {/* Gradient overlays to soften and blend with content */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030705] via-[#030705]/20 to-[#030705]/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#030705_95%)]" />

      {/* Aurora Layer 1 - Mint Green */}
      <div className="absolute top-[-30%] left-[-20%] w-[100vw] h-[100vh] rounded-full bg-emerald-500/8 blur-[130px] mix-blend-screen animate-aurora-1 pointer-events-none" />
      
      {/* Aurora Layer 2 - Cyan/Teal */}
      <div className="absolute top-[-20%] right-[-10%] w-[90vw] h-[90vh] rounded-full bg-teal-500/6 blur-[110px] mix-blend-screen animate-aurora-2 pointer-events-none" />
      
      {/* Aurora Layer 3 - Subtle Yellow Green */}
      <div className="absolute top-[-10%] left-[25%] w-[80vw] h-[80vh] rounded-full bg-green-500/4 blur-[120px] mix-blend-screen animate-aurora-3 pointer-events-none" />

      {/* Canvas for stars & fireflies */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
