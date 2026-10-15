import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('public/assets/aeris');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function runFFmpeg(args, inputBufferCallback) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
    ffmpeg.on('error', reject);
    inputBufferCallback(ffmpeg.stdin);
  });
}

// 1. aeris-hero-atmosphere.mp4: 8s, 30fps = 240 frames, 1280x720
async function generateHeroAtmosphere() {
  const width = 1280;
  const height = 720;
  const fps = 30;
  const duration = 8;
  const totalFrames = fps * duration;
  const outFile = path.join(OUT_DIR, 'aeris-hero-atmosphere.mp4');

  console.log('Generating aeris-hero-atmosphere.mp4...');

  // Precompute glint points with looping orbits
  const glints = [];
  for (let i = 0; i < 45; i++) {
    glints.push({
      baseX: Math.random() * width,
      baseY: Math.random() * height,
      radX: 30 + Math.random() * 80,
      radY: 20 + Math.random() * 60,
      phase: Math.random() * Math.PI * 2,
      size: 1 + Math.random() * 2.5,
      // Paperloo emerald glints with occasional warm amber
      isEmerald: Math.random() > 0.25,
      brightness: 0.6 + Math.random() * 0.4
    });
  }

  const args = [
    '-y',
    '-f', 'rawvideo',
    '-pixel_format', 'rgb24',
    '-video_size', `${width}x${height}`,
    '-framerate', `${fps}`,
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '22',
    outFile
  ];

  await runFFmpeg(args, (stdin) => {
    const frameBuffer = Buffer.alloc(width * height * 3);

    for (let f = 0; f < totalFrames; f++) {
      const angle = (2 * Math.PI * f) / totalFrames;
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);

      // Macro drift through nocturnal cloud inversion
      let idx = 0;
      for (let y = 0; y < height; y++) {
        const ny = (y / height) - 0.5;
        for (let x = 0; x < width; x++) {
          const nx = (x / width) - 0.5;

          // Layered drifting vapor ribbons
          const v1 = Math.sin(nx * 4 + sinA * 0.8 + ny * 2) * 0.5 + 0.5;
          const v2 = Math.cos(nx * 6 - cosA * 0.6 + ny * 5) * 0.5 + 0.5;
          const v3 = Math.sin((nx + ny) * 8 + sinA * 1.2) * 0.5 + 0.5;

          // Atmospheric vapor density
          const density = (v1 * 0.45 + v2 * 0.35 + v3 * 0.2) * (1 - Math.abs(ny * 0.8));
          
          // Deep charcoal black to midnight slate (#080a0c to #1e2428)
          let r = Math.floor(6 + density * 22);
          let g = Math.floor(8 + density * 30);
          let b = Math.floor(10 + density * 36);

          frameBuffer[idx] = r;
          frameBuffer[idx + 1] = g;
          frameBuffer[idx + 2] = b;
          idx += 3;
        }
      }

      // Draw sensor glints (tiny emerald and warm dots with soft bloom)
      for (const g of glints) {
        const gx = Math.round(g.baseX + Math.sin(angle + g.phase) * g.radX);
        const gy = Math.round(g.baseY + Math.cos(angle + g.phase) * g.radY);
        const pulse = Math.sin(angle * 3 + g.phase) * 0.3 + 0.7;

        for (let dy = -2; dy <= 2; dy++) {
          const py = gy + dy;
          if (py < 0 || py >= height) continue;
          for (let dx = -2; dx <= 2; dx++) {
            const px = gx + dx;
            if (px < 0 || px >= width) continue;

            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > g.size + 1) continue;

            const falloff = Math.max(0, 1 - dist / (g.size + 1.2)) * pulse;
            const pidx = (py * width + px) * 3;

            if (g.isEmerald) {
              // Paperloo emerald #10b981
              frameBuffer[pidx] = Math.min(255, frameBuffer[pidx] + Math.floor(16 * falloff));
              frameBuffer[pidx + 1] = Math.min(255, frameBuffer[pidx + 1] + Math.floor(185 * falloff * g.brightness));
              frameBuffer[pidx + 2] = Math.min(255, frameBuffer[pidx + 2] + Math.floor(129 * falloff * g.brightness));
            } else {
              // Warm amber/white glint
              frameBuffer[pidx] = Math.min(255, frameBuffer[pidx] + Math.floor(246 * falloff * g.brightness));
              frameBuffer[pidx + 1] = Math.min(255, frameBuffer[pidx + 1] + Math.floor(180 * falloff * g.brightness));
              frameBuffer[pidx + 2] = Math.min(255, frameBuffer[pidx + 2] + Math.floor(90 * falloff * g.brightness));
            }
          }
        }
      }

      stdin.write(frameBuffer);
    }
    stdin.end();
  });
}

// 2. aeris-about-clouds.mp4: bright overcast stratospheric layer, pale grey and ivory, sliding diagonally
async function generateAboutClouds() {
  const width = 1280;
  const height = 720;
  const fps = 30;
  const duration = 8;
  const totalFrames = fps * duration;
  const outFile = path.join(OUT_DIR, 'aeris-about-clouds.mp4');

  console.log('Generating aeris-about-clouds.mp4...');

  const args = [
    '-y',
    '-f', 'rawvideo',
    '-pixel_format', 'rgb24',
    '-video_size', `${width}x${height}`,
    '-framerate', `${fps}`,
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '22',
    outFile
  ];

  await runFFmpeg(args, (stdin) => {
    const frameBuffer = Buffer.alloc(width * height * 3);

    for (let f = 0; f < totalFrames; f++) {
      const angle = (2 * Math.PI * f) / totalFrames;
      const diagShiftX = Math.cos(angle) * 0.5;
      const diagShiftY = Math.sin(angle) * 0.5;

      let idx = 0;
      for (let y = 0; y < height; y++) {
        const ny = y / height;
        for (let x = 0; x < width; x++) {
          const nx = x / width;

          // Diagonal cloud forms sliding
          const c1 = Math.sin((nx * 3 + ny * 2) + diagShiftX * 2) * 0.5 + 0.5;
          const c2 = Math.cos((nx * 5 - ny * 3) + diagShiftY * 2) * 0.5 + 0.5;
          const c3 = Math.sin((nx * 8 + ny * 6) + diagShiftX * 1.5) * 0.5 + 0.5;
          const c4 = Math.cos((nx * 14 - ny * 10) + diagShiftY * 1.2) * 0.5 + 0.5;

          const cloud = (c1 * 0.4 + c2 * 0.3 + c3 * 0.2 + c4 * 0.1);

          // Pale grey, ivory, and soft diffused stratospheric tones (#e8eaeb to #f5f6f7)
          const base = 226 + cloud * 24; // 226 - 250
          const r = Math.min(255, Math.floor(base - 4));
          const g = Math.min(255, Math.floor(base));
          const b = Math.min(255, Math.floor(base + 2));

          frameBuffer[idx] = r;
          frameBuffer[idx + 1] = g;
          frameBuffer[idx + 2] = b;
          idx += 3;
        }
      }
      stdin.write(frameBuffer);
    }
    stdin.end();
  });
}

// 3. aeris-sensor-field.mp4: dark particulate streams passing scanning light plane
async function generateSensorField() {
  const width = 1280;
  const height = 720;
  const fps = 30;
  const duration = 6;
  const totalFrames = fps * duration;
  const outFile = path.join(OUT_DIR, 'aeris-sensor-field.mp4');

  console.log('Generating aeris-sensor-field.mp4...');

  // Particles moving through scanning laser/light plane
  const particles = [];
  for (let i = 0; i < 180; i++) {
    particles.push({
      x0: Math.random() * width,
      y0: Math.random() * height,
      vx: 120 + Math.random() * 180, // pixels per loop
      vy: (Math.random() - 0.5) * 40,
      size: 1 + Math.random() * 2.2,
      opacity: 0.3 + Math.random() * 0.7,
      isPulse: Math.random() > 0.65
    });
  }

  const args = [
    '-y',
    '-f', 'rawvideo',
    '-pixel_format', 'rgb24',
    '-video_size', `${width}x${height}`,
    '-framerate', `${fps}`,
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '22',
    outFile
  ];

  await runFFmpeg(args, (stdin) => {
    const frameBuffer = Buffer.alloc(width * height * 3);

    for (let f = 0; f < totalFrames; f++) {
      const progress = f / totalFrames;
      const angle = progress * Math.PI * 2;
      const scanX = width * 0.55 + Math.sin(angle) * 80;

      // Dark background with faint vertical scanning field
      frameBuffer.fill(12); // #0c0c0e

      let idx = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const distToScan = Math.abs(x - scanX);
          let intensity = 0;
          if (distToScan < 30) {
            intensity = (1 - distToScan / 30) * 28;
          }
          // Emerald tint scanning sheet
          frameBuffer[idx] = 10;
          frameBuffer[idx + 1] = Math.min(255, 14 + Math.floor(intensity * 1.4));
          frameBuffer[idx + 2] = Math.min(255, 14 + Math.floor(intensity * 0.8));
          idx += 3;
        }
      }

      // Draw particulate streams
      for (const p of particles) {
        const curX = (p.x0 + p.vx * progress) % width;
        const curY = (p.y0 + p.vy * progress + height) % height;

        const distToScan = Math.abs(curX - scanX);
        const scanBoost = distToScan < 25 ? (1 + (1 - distToScan / 25) * 2.5) : 1;

        const py = Math.floor(curY);
        const px = Math.floor(curX);

        for (let dy = -1; dy <= 1; dy++) {
          const ty = py + dy;
          if (ty < 0 || ty >= height) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const tx = px + dx;
            if (tx < 0 || tx >= width) continue;

            const pidx = (ty * width + tx) * 3;
            const factor = p.opacity * scanBoost;

            if (p.isPulse && distToScan < 40) {
              // Emerald pulse
              frameBuffer[pidx] = Math.min(255, frameBuffer[pidx] + Math.floor(16 * factor));
              frameBuffer[pidx + 1] = Math.min(255, frameBuffer[pidx + 1] + Math.floor(190 * factor));
              frameBuffer[pidx + 2] = Math.min(255, frameBuffer[pidx + 2] + Math.floor(130 * factor));
            } else {
              // Translucent particulate
              const val = Math.min(220, Math.floor(140 * factor));
              frameBuffer[pidx] = Math.min(255, frameBuffer[pidx] + val);
              frameBuffer[pidx + 1] = Math.min(255, frameBuffer[pidx + 1] + val);
              frameBuffer[pidx + 2] = Math.min(255, frameBuffer[pidx + 2] + val);
            }
          }
        }
      }

      stdin.write(frameBuffer);
    }
    stdin.end();
  });
}

// 4. aeris-radar-close.mp4: rotating atmospheric radar lens, high grain, slow motion, loop-safe
async function generateRadarClose() {
  const size = 720;
  const fps = 30;
  const duration = 6;
  const totalFrames = fps * duration;
  const outFile = path.join(OUT_DIR, 'aeris-radar-close.mp4');

  console.log('Generating aeris-radar-close.mp4...');

  const args = [
    '-y',
    '-f', 'rawvideo',
    '-pixel_format', 'rgb24',
    '-video_size', `${size}x${size}`,
    '-framerate', `${fps}`,
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '22',
    outFile
  ];

  await runFFmpeg(args, (stdin) => {
    const frameBuffer = Buffer.alloc(size * size * 3);
    const cx = size / 2;
    const cy = size / 2;

    for (let f = 0; f < totalFrames; f++) {
      const sweepAngle = (2 * Math.PI * f) / totalFrames;

      let idx = 0;
      for (let y = 0; y < size; y++) {
        const dy = y - cy;
        for (let x = 0; x < size; x++) {
          const dx = x - cx;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let pixelVal = 10;

          if (dist < 340) {
            // Angle of current pixel relative to center
            let a = Math.atan2(dy, dx);
            if (a < 0) a += Math.PI * 2;

            // Difference behind sweep
            let diff = sweepAngle - a;
            while (diff < 0) diff += Math.PI * 2;
            while (diff >= Math.PI * 2) diff -= Math.PI * 2;

            // Phosphor decay trail
            if (diff < Math.PI * 0.8) {
              const trail = Math.pow(1 - diff / (Math.PI * 0.8), 2.2);
              pixelVal += Math.floor(trail * 120);
            }

            // Radar range rings (at 70, 140, 210, 280, 330)
            const ringDistances = [70, 140, 210, 280, 330];
            for (const r of ringDistances) {
              if (Math.abs(dist - r) < 1.2) {
                pixelVal = Math.max(pixelVal, 95);
              }
            }

            // Crosshairs
            if (Math.abs(dx) < 1 || Math.abs(dy) < 1) {
              pixelVal = Math.max(pixelVal, 80);
            }

            // Atmospheric echo clouds
            const cloudDist = dist / 340;
            const noise = Math.sin(a * 4 + dist * 0.05) * Math.cos(a * 3 - dist * 0.03);
            if (noise > 0.4 && diff < Math.PI * 0.5) {
              pixelVal += Math.floor(noise * 60);
            }
          }

          // High detail photographic grain
          const grain = (Math.random() - 0.5) * 16;
          const finalVal = Math.min(255, Math.max(0, Math.floor(pixelVal + grain)));

          // Subtle Paperloo monochrome with emerald phosphor tint
          frameBuffer[idx] = Math.floor(finalVal * 0.85);
          frameBuffer[idx + 1] = Math.floor(finalVal * 1.0);
          frameBuffer[idx + 2] = Math.floor(finalVal * 0.9);
          idx += 3;
        }
      }

      stdin.write(frameBuffer);
    }
    stdin.end();
  });
}

// 5. aeris-trace-topography.webp: 1920x1280 monochrome elevation/thermal topographic field
async function generateTraceTopography() {
  const width = 1920;
  const height = 1280;
  const outFile = path.join(OUT_DIR, 'aeris-trace-topography.webp');

  console.log('Generating aeris-trace-topography.webp...');

  const args = [
    '-y',
    '-f', 'rawvideo',
    '-pixel_format', 'rgb24',
    '-video_size', `${width}x${height}`,
    '-framerate', '1',
    '-i', '-',
    '-c:v', 'libwebp',
    '-quality', '90',
    outFile
  ];

  await runFFmpeg(args, (stdin) => {
    const frameBuffer = Buffer.alloc(width * height * 3);
    let idx = 0;

    for (let y = 0; y < height; y++) {
      const ny = (y / height) * 4;
      for (let x = 0; x < width; x++) {
        const nx = (x / width) * 6;

        // Organic topographic contour function
        const e1 = Math.sin(nx * 1.5 + Math.cos(ny * 1.8) * 1.2);
        const e2 = Math.cos(ny * 2.2 + Math.sin(nx * 1.1) * 0.9);
        const e3 = Math.sin(nx * 3.5 - ny * 2.5) * 0.4;
        const elevation = (e1 + e2 + e3 + 2.4) / 4.8; // 0..1

        // Contour lines: modulo quantization
        const contourStep = 0.055;
        const distToLine = Math.abs((elevation % contourStep) - (contourStep / 2));
        const isLine = distToLine < 0.0035;
        const isMajorLine = Math.abs((elevation % (contourStep * 4)) - (contourStep * 2)) < 0.005;

        // Base field: ivory, black, muted grey with generous negative space
        let lum = 225 + Math.floor(elevation * 20); // soft pale field (#e1e3e2 to #f5f6f4)
        if (isMajorLine) {
          lum = 40; // dark crisp contour
        } else if (isLine) {
          lum = 90; // muted contour
        }

        // Stippled dot matrix data texture
        if (x % 32 === 0 && y % 32 === 0) {
          lum = 25; // stipple coordinate dots
        }

        // Slight paperloo sage/emerald undertone
        frameBuffer[idx] = Math.max(0, lum - 4);
        frameBuffer[idx + 1] = Math.max(0, lum);
        frameBuffer[idx + 2] = Math.max(0, lum - 2);
        idx += 3;
      }
    }

    stdin.write(frameBuffer);
    stdin.end();
  });
}

// 6. Generate Posters from videos
async function extractPosters() {
  console.log('Extracting video poster frames...');
  const pairs = [
    ['aeris-hero-atmosphere.mp4', 'aeris-hero-poster.webp'],
    ['aeris-about-clouds.mp4', 'aeris-about-poster.webp'],
    ['aeris-sensor-field.mp4', 'aeris-sensor-poster.webp'],
    ['aeris-radar-close.mp4', 'aeris-radar-poster.webp']
  ];

  for (const [vid, poster] of pairs) {
    const vidPath = path.join(OUT_DIR, vid);
    const posterPath = path.join(OUT_DIR, poster);
    const args = ['-y', '-i', vidPath, '-vframes', '1', '-c:v', 'libwebp', '-quality', '85', posterPath];
    await new Promise((res, rej) => {
      const p = spawn('ffmpeg', args, { stdio: 'inherit' });
      p.on('close', (c) => (c === 0 ? res() : rej(new Error(`Exit ${c}`))));
      p.on('error', rej);
    });
  }
}

async function main() {
  try {
    await generateHeroAtmosphere();
    await generateAboutClouds();
    await generateSensorField();
    await generateRadarClose();
    await generateTraceTopography();
    await extractPosters();
    console.log('All AERIS assets successfully generated!');
  } catch (err) {
    console.error('Asset generation failed:', err);
    process.exit(1);
  }
}

main();
