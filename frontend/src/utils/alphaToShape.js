import * as THREE from 'three';

/**
 * Convert a PNG data URL to a THREE.Shape by tracing its alpha channel contour.
 * @param {string} dataUrl
 * @param {number} targetSize - Target max dimension in Three.js units (default 0.08 = 8cm)
 * @returns {Promise<THREE.Shape>}
 */
export async function alphaToShape(dataUrl, targetSize = 0.08) {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Downsample for performance
  const maxDim = 128;
  const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const w = canvas.width;
  const h = canvas.height;

  // Build alpha mask
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    mask[i] = imageData.data[i * 4 + 3] > 128 ? 1 : 0;
  }

  // Check if image has any transparency at all
  const solidCount = mask.reduce((a, b) => a + b, 0);
  if (solidCount === 0 || solidCount === w * h) {
    // No alpha info — fall back to a rounded rectangle
    return createRoundedRect(
      targetSize,
      (targetSize * img.height) / img.width,
      targetSize * 0.05
    );
  }

  // Extract contour using marching squares
  const contour = marchSquares(mask, w, h);

  if (contour.length < 3) {
    return createRoundedRect(
      targetSize,
      (targetSize * img.height) / img.width,
      targetSize * 0.05
    );
  }

  // Simplify contour
  const simplified = rdpSimplify(contour, 1.2);

  // Normalize to target size, centered at origin
  const bounds = getBounds(simplified);
  const bw = bounds.maxX - bounds.minX;
  const bh = bounds.maxY - bounds.minY;
  const normalizeScale = targetSize / Math.max(bw, bh);
  const cx = bounds.minX + bw / 2;
  const cy = bounds.minY + bh / 2;

  const shape = new THREE.Shape();
  simplified.forEach((pt, i) => {
    const x = (pt.x - cx) * normalizeScale;
    const y = -(pt.y - cy) * normalizeScale; // flip Y
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();

  return shape;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function createRoundedRect(w, h, r) {
  const shape = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return shape;
}

/**
 * Simple marching squares contour tracer.
 * Returns an array of {x, y} points tracing the outer boundary.
 */
function marchSquares(mask, w, h) {
  // Find a starting edge pixel
  let startX = -1;
  let startY = -1;
  outer: for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x] === 1) {
        // Check if it's an edge pixel (has at least one empty neighbor)
        if (
          x === 0 ||
          y === 0 ||
          x === w - 1 ||
          y === h - 1 ||
          mask[y * w + (x - 1)] === 0 ||
          mask[(y - 1) * w + x] === 0 ||
          mask[y * w + (x + 1)] === 0 ||
          mask[(y + 1) * w + x] === 0
        ) {
          startX = x;
          startY = y;
          break outer;
        }
      }
    }
  }

  if (startX === -1) return [];

  const contour = [];
  const visited = new Set();

  // Moore neighborhood tracing
  const dx = [1, 1, 0, -1, -1, -1, 0, 1];
  const dy = [0, 1, 1, 1, 0, -1, -1, -1];

  let cx = startX;
  let cy = startY;
  let dir = 7; // start direction
  const maxSteps = w * h * 2;

  for (let step = 0; step < maxSteps; step++) {
    const key = `${cx},${cy}`;
    if (step > 2 && cx === startX && cy === startY) break;

    if (!visited.has(key)) {
      contour.push({ x: cx, y: cy });
      visited.add(key);
    }

    // Search for next boundary pixel
    const startDir = (dir + 5) % 8; // backtrack direction + 1
    let found = false;
    for (let i = 0; i < 8; i++) {
      const d = (startDir + i) % 8;
      const nx = cx + dx[d];
      const ny = cy + dy[d];
      if (nx >= 0 && nx < w && ny >= 0 && ny < h && mask[ny * w + nx] === 1) {
        dir = d;
        cx = nx;
        cy = ny;
        found = true;
        break;
      }
    }
    if (!found) break;
  }

  return contour;
}

/**
 * Ramer-Douglas-Peucker line simplification.
 */
function rdpSimplify(points, epsilon) {
  if (points.length < 3) return points;

  let maxDist = 0;
  let maxIdx = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDist(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > epsilon) {
    const left = rdpSimplify(points.slice(0, maxIdx + 1), epsilon);
    const right = rdpSimplify(points.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

function perpendicularDist(point, lineStart, lineEnd) {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const ex = point.x - lineStart.x;
    const ey = point.y - lineStart.y;
    return Math.sqrt(ex * ex + ey * ey);
  }
  const num = Math.abs(
    dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x
  );
  return num / Math.sqrt(lenSq);
}

function getBounds(points) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}
