// ==========================================
// Animated HTML5 Canvas Waves Background
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('global-bg-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Resize canvas to fill window
    let width, height;
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();
    
    // Wave configuration - Thicker, slower, angled
    const waves = [
        {
            yOffset: 0.3,
            amplitude: 150,
            speed: 0.0005,      // Slower
            frequency: 0.002,
            color: 'rgba(129, 140, 248, 0.4)', // Indigo
            lineWidth: 3,       // Thicker
            angle: 0
        },
        {
            yOffset: 0.8,
            amplitude: 250,
            speed: 0.0003,
            frequency: 0.001,
            color: 'rgba(196, 181, 253, 0.3)', // Light Purple
            lineWidth: 5,
            angle: Math.PI / 12  // Slight diagonal 15deg
        },
        {
            yOffset: 0.2,
            amplitude: 200,
            speed: 0.0006,
            frequency: 0.0015,
            color: 'rgba(139, 92, 246, 0.5)', // Deep Purple
            lineWidth: 4,
            angle: -Math.PI / 8  // Slight diagonal opposite
        },
        {
            yOffset: 0.6,
            amplitude: 300,
            speed: 0.0002,
            frequency: 0.0008,
            color: 'rgba(79, 70, 229, 0.25)', // Primary Indigo
            lineWidth: 6,
            angle: 0
        },
        {
            yOffset: 0.5,
            amplitude: 400,
            speed: 0.0004,
            frequency: 0.0005,
            color: 'rgba(167, 139, 250, 0.15)', // Faint wide background band
            lineWidth: 10,
            angle: Math.PI / 4 // 45 degree angle
        }
    ];

    let time = 0;

    function draw() {
        ctx.clearRect(0, 0, width, height);
        
        waves.forEach((wave) => {
            ctx.save();
            
            // Move origin to center to rotate around center, then move back
            ctx.translate(width / 2, height / 2);
            ctx.rotate(wave.angle);
            ctx.translate(-width / 2, -height / 2);
            
            // To ensure the wave covers the screen even when rotated, draw far beyond width
            const drawWidth = width * 2;
            const startX = -width / 2;
            
            ctx.beginPath();
            ctx.moveTo(startX, height * wave.yOffset);
            
            for (let x = startX; x < drawWidth; x += 15) {
                const y1 = Math.sin(x * wave.frequency + time * wave.speed);
                const y2 = Math.sin(x * (wave.frequency * 0.8) + time * (wave.speed * 1.2));
                const y = height * wave.yOffset + (y1 + y2) * 0.5 * wave.amplitude;
                
                ctx.lineTo(x, y);
            }
            
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = wave.lineWidth;
            
            // Thicker, stronger glow
            ctx.shadowColor = wave.color;
            ctx.shadowBlur = 25;
            
            ctx.stroke();
            ctx.restore();
        });
        
        time += 16;
        requestAnimationFrame(draw);
    }
    
    draw();
});
