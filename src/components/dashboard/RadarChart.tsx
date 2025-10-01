import { useEffect, useRef } from 'react';

export const RadarChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const skills = [
      { name: 'Frontend', value: 85 },
      { name: 'Backend', value: 92 },
      { name: 'Database', value: 78 },
      { name: 'Testing', value: 65 },
      { name: 'DevOps', value: 70 },
      { name: 'APIs', value: 88 },
    ];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 40;
    const levels = 5;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid circles
    ctx.strokeStyle = 'hsl(215 28% 25%)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= levels; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius / levels) * i, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw grid lines and labels
    const angleStep = (2 * Math.PI) / skills.length;
    skills.forEach((skill, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + maxRadius * Math.cos(angle);
      const y = centerY + maxRadius * Math.sin(angle);

      // Grid line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'hsl(215 28% 25%)';
      ctx.stroke();

      // Label
      ctx.fillStyle = 'hsl(210 40% 98%)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelX = centerX + (maxRadius + 25) * Math.cos(angle);
      const labelY = centerY + (maxRadius + 25) * Math.sin(angle);
      ctx.fillText(skill.name, labelX, labelY);
    });

    // Draw data polygon
    ctx.beginPath();
    skills.forEach((skill, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const value = (skill.value / 100) * maxRadius;
      const x = centerX + value * Math.cos(angle);
      const y = centerY + value * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    
    // Fill
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    gradient.addColorStop(0, 'hsla(189, 94%, 43%, 0.3)');
    gradient.addColorStop(1, 'hsla(142, 76%, 36%, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke
    ctx.strokeStyle = 'hsl(189, 94%, 43%)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    skills.forEach((skill, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const value = (skill.value / 100) * maxRadius;
      const x = centerX + value * Math.cos(angle);
      const y = centerY + value * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'hsl(189, 94%, 43%)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(222 47% 11%)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

  }, []);

  return (
    <div className="flex justify-center">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={300}
        className="max-w-full"
      />
    </div>
  );
};
