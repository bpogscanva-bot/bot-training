import { useEffect, useRef } from 'react';
import '../../styles/LiveWaveform.css';

export function LiveWaveform({
  active = false,
  barWidth = 3,
  barGap = 3,
  barRadius = 1.5,
  height = 44,
  className = '',
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 340;
    const h = height;

    canvas.width = width * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const barCount = Math.floor(width / (barWidth + barGap));
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, h);
      time += 0.07;

      const totalBarSpace = barWidth + barGap;
      const startX = (width - barCount * totalBarSpace) / 2;

      for (let i = 0; i < barCount; i++) {
        // Calculate envelope so the waveform tapers smoothly at both ends
        const normalizedPos = i / (barCount - 1);
        const envelope = Math.sin(normalizedPos * Math.PI);

        let barHeight;
        if (active) {
          const wave1 = Math.sin(time * 2.5 + i * 0.35);
          const wave2 = Math.cos(time * 3.8 + i * 0.2);
          const rawWave = Math.abs(wave1 * 0.6 + wave2 * 0.4);
          barHeight = Math.max(3, rawWave * (h - 6) * envelope);
        } else {
          // Gentle idle ripple with envelope
          const idleWave = Math.sin(time * 1.2 + i * 0.25) * 0.5 + 0.5;
          barHeight = Math.max(3, (4 + idleWave * 8) * envelope);
        }

        const x = startX + i * totalBarSpace;
        const y = (h - barHeight) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, barRadius);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [active, barWidth, barGap, barRadius, height]);

  return (
    <div className={`eleven-live-waveform-wrapper ${className}`}>
      <div className="waveform-warm-left-glow" />
      <div className="waveform-cool-right-glow" />
      <canvas ref={canvasRef} style={{ height: `${height}px` }} />
    </div>
  );
}
