const sharp = require('sharp');

function generateNonogram(width, height, fillProbability = 0.45) {
  if (width < 5 || height < 5 || width > 50 || height > 50) {
    throw new Error('Dimensions must be between 5x5 and 50x50.');
  }

  const grid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => (Math.random() < fillProbability ? 1 : 0))
  );

  const rowHints = grid.map(row => {
    const hints = [];
    let count = 0;
    for (let cell of row) {
      if (cell === 1) count++;
      else if (count > 0) { hints.push(count); count = 0; }
    }
    if (count > 0) hints.push(count);
    return hints.length ? hints : [0];
  });

  const colHints = [];
  for (let x = 0; x < width; x++) {
    const hints = [];
    let count = 0;
    for (let y = 0; y < height; y++) {
      if (grid[y][x] === 1) count++;
      else if (count > 0) { hints.push(count); count = 0; }
    }
    if (count > 0) hints.push(count);
    colHints.push(hints.length ? hints : [0]);
  }

  return { grid, rowHints, colHints };
}

async function renderNonogramPuzzle(rowHints, colHints, cellSize = 40, options = {}) {
  const { background = '#ffffff', gridColor = '#000000', textColor = '#000000' } = options;

  const gridWidth = colHints.length;
  const gridHeight = rowHints.length;

  const maxRowHintLength = Math.max(...rowHints.map(h => h.length), 1);
  const maxColHintLength = Math.max(...colHints.map(h => h.length), 1);

  const hintAreaLeft = maxRowHintLength * cellSize * 0.7;
  const hintAreaTop = maxColHintLength * cellSize * 0.7;

  const totalWidth = Math.ceil(hintAreaLeft + gridWidth * cellSize);
  const totalHeight = Math.ceil(hintAreaTop + gridHeight * cellSize);

  const svg = `
    <svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${background}" />
      ${generateGridLines(hintAreaLeft, hintAreaTop, gridWidth, gridHeight, cellSize, gridColor)}
      ${generateRowHints(rowHints, hintAreaLeft, hintAreaTop, cellSize, textColor)}
      ${generateColHints(colHints, hintAreaLeft, hintAreaTop, cellSize, textColor)}
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function generateGridLines(leftOffset, topOffset, width, height, cellSize, color) {
  let lines = '';
  for (let i = 0; i <= width; i++) {
    const x = leftOffset + i * cellSize;
    lines += `<line x1="${x}" y1="${topOffset}" x2="${x}" y2="${topOffset + height * cellSize}" stroke="${color}" stroke-width="1" />`;
  }
  for (let i = 0; i <= height; i++) {
    const y = topOffset + i * cellSize;
    lines += `<line x1="${leftOffset}" y1="${y}" x2="${leftOffset + width * cellSize}" y2="${y}" stroke="${color}" stroke-width="1" />`;
  }
  return lines;
}

function generateRowHints(hints, leftOffset, topOffset, cellSize, color) {
  let text = '';
  hints.forEach((row, i) => {
    const y = topOffset + i * cellSize + cellSize / 2;
    row.forEach((num, j) => {
      const x = leftOffset - (row.length - j) * cellSize * 0.7;
      text += `<text x="${x}" y="${y}" font-size="${cellSize * 0.5}" fill="${color}" text-anchor="middle" dominant-baseline="middle">${num}</text>`;
    });
  });
  return text;
}

function generateColHints(hints, leftOffset, topOffset, cellSize, color) {
  let text = '';
  hints.forEach((col, i) => {
    const x = leftOffset + i * cellSize + cellSize / 2;
    col.forEach((num, j) => {
      const y = topOffset - (col.length - j) * cellSize * 0.7;
      text += `<text x="${x}" y="${y}" font-size="${cellSize * 0.5}" fill="${color}" text-anchor="middle" dominant-baseline="middle">${num}</text>`;
    });
  });
  return text;
}

module.exports = {
  generateNonogram,
  renderNonogramPuzzle
};
