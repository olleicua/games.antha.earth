/* global createCanvas, color, windowWidth, windowHeight,
   width, height, ellipse, text, fill, noStroke, millis,
   createVector, lerpColor, map, rect, strokeWeight, stroke,
   triangle, p5, ROUND, strokeJoin, frameRate, frameCount,
   background, WEBGL, box, keyCode, LEFT_ARROW, RIGHT_ARROW,
   rotateX, rotateZ, keyIsPressed, plane, translate, camera,
   ortho, push, pop, cylinder, createGraphics, mouseX, mouseY,
   pixelDensity, pointLight, ambientMaterial, ambientLight */

const TAU = 2 * Math.PI;
let cameraAngle = TAU / 12;
let minAspect, boardSide, verticalSpacing,
    cameraHeight, cameraFromZAxis,
    pieceHeight;

let selectionCanvas, selectionGL;

const gamestate = [];
let gameOver = false;
let victoryResult = null;

let v;

function gV(vector) {
  return gamestate[vector.x][vector.y][vector.z];
}

function checkLine(start, delta) {
  let i;
  let position = start.copy();
  const first = gV(start);
  if (first === 0) return false;
  for (i = 1; i < 4; i++) {
    position = p5.Vector.add(position, delta);
    if (gV(position) !== first) return false;
  }
  return [first, start, delta];
}

function checkVictory() {
  let x, y, z;
  let result;
  for (x = 0; x < 4; x++) {
    for (y = 0; y < 4; y++) {
      result = checkLine(v(x, y, 0), v(0, 0, 1));
      if (result) return result;
    }
  }
  for (x = 0; x < 4; x++) {
    for (z = 0; z < 4; z++) {
      result = checkLine(v(x, 0, z), v(0, 1, 0));
      if (result) return result;
    }
  }
  for (z = 0; z < 4; z++) {
    for (y = 0; y < 4; y++) {
      result = checkLine(v(0, y, z), v(1, 0, 0));
      if (result) return result;
    }
  }
  for (x = 0; x < 4; x++) {
    result = checkLine(v(x, 0, 0), v(0, 1, 1));
    if (result) return result;
  }
  for (x = 0; x < 4; x++) {
    result = checkLine(v(x, 0, 3), v(0, 1, -1));
    if (result) return result;
  }
  for (y = 0; y < 4; y++) {
    result = checkLine(v(0, y, 0), v(1, 0, 1));
    if (result) return result;
  }
  for (y = 0; y < 4; y++) {
    result = checkLine(v(0, y, 3), v(1, 0, -1));
    if (result) return result;
  }
  for (z = 0; z < 4; z++) {
    result = checkLine(v(0, 0, z), v(1, 1, 0));
    if (result) return result;
  }
  for (z = 0; z < 4; z++) {
    result = checkLine(v(0, 3, z), v(1, -1, 0));
    if (result) return result;
  }
  result = checkLine(v(0, 0, 0), v(1, 1, 1));
  if (result) return result;  
  result = checkLine(v(0, 0, 3), v(1, 1, -1));
  if (result) return result;  
  result = checkLine(v(0, 3, 3), v(1, -1, -1));
  if (result) return result;  
  result = checkLine(v(0, 3, 0), v(1, -1, 1));
  if (result) return result;  
}

let rotateButtonPressed = null;
const $cwb = document.querySelector('.clockwise-button');
const $ccwb = document.querySelector('.counter-clockwise-button');
function setRotateButton(value) {
  return function() {
    rotateButtonPressed = value;
  };
}
function resetRotateButton() {
  rotateButtonPressed = null;
}
$cwb.addEventListener('mousedown', setRotateButton('CW'));
$ccwb.addEventListener('mousedown', setRotateButton('CCW'));
$cwb.addEventListener('touchstart', setRotateButton('CW'));
$ccwb.addEventListener('touchstart', setRotateButton('CCW'));
$cwb.addEventListener('mouseup', resetRotateButton);
$ccwb.addEventListener('mouseup', resetRotateButton);
$cwb.addEventListener('mouseleave', resetRotateButton);
$ccwb.addEventListener('mouseleave', resetRotateButton);
$cwb.addEventListener('touchend', resetRotateButton);
$ccwb.addEventListener('touchend', resetRotateButton);

const playerColors = [];

function setup() {
  v = createVector;
  
  playerColors[0] = color(159, 159, 255); // default
  playerColors[1] = color(255, 31, 31); // player 1
  playerColors[2] = color(31, 255, 31); // player 2
  
  if (windowWidth <= 600) {
    minAspect = Math.min(windowWidth - 5, windowHeight - 5);    
  } else {
    minAspect = Math.min(windowWidth - 200, windowHeight - 5);
  }
  let canvas = createCanvas(minAspect, minAspect, WEBGL);
  canvas.parent('game');
  pixelDensity(1);
  ortho(- 3 * width / 7, 3 * width / 7, - height / 2, height / 2, - 2 * height, 2 * height);
  
  selectionCanvas = createGraphics(minAspect, minAspect, WEBGL);
  selectionCanvas.pixelDensity(1);
  selectionGL = selectionCanvas.elt.getContext('webgl');
  selectionCanvas.ortho(- 3 * width / 7, 3 * width / 7, - height / 2, height / 2, - 2 * height, 2 * height);

	// selectionCanvas.show();
	// selectionCanvas.style("display", "inline");

  boardSide = (Math.min(width, height) / 2);
  verticalSpacing = boardSide / 2;
  pieceHeight = verticalSpacing / 9;
  cameraHeight = boardSide / 2;
  cameraFromZAxis = boardSide;
  
  for (let x = 0; x < 4; x ++) {
    gamestate.push([]);
    for (let y = 0; y < 4; y ++) {
      gamestate[x].push([]);
      for (let z = 0; z < 4; z ++) {
        gamestate[x][y].push(0);
      }
    }
  }
  
  // const clockwiseButton = document.querySelector('.clockwise-button');
  // const counterClockwiseButton = document.querySelector('.counter-clockwise-button');
  // clockwiseButton.addEventListener('mousedown');
}

function placeCamera() {
  if (keyIsPressed || rotateButtonPressed) {
    if (keyCode === LEFT_ARROW || rotateButtonPressed === 'CW') {
      cameraAngle -= 0.03;
    } else if (keyCode === RIGHT_ARROW || rotateButtonPressed === 'CCW') {
      cameraAngle += 0.03;
    }
  }
  
  pointLight(255, 255, 255,
             4 * cameraFromZAxis * Math.cos(cameraAngle - (TAU / 4)),
             -8 * cameraHeight,
             4 * cameraFromZAxis * Math.sin(cameraAngle - (TAU / 4)));
  
  camera(cameraFromZAxis * Math.cos(cameraAngle),
         -cameraHeight,
         cameraFromZAxis * Math.sin(cameraAngle),
         0, 0, 0,
         0, 1, 0);
  selectionCanvas.camera(cameraFromZAxis * Math.cos(cameraAngle),
         -cameraHeight,
         cameraFromZAxis * Math.sin(cameraAngle),
         0, 0, 0,
         0, 1, 0);
}

function drawBoard(z) {
  ambientMaterial(color('rgba(127, 127, 255, 0.5)'));
  plane(boardSide, boardSide);
  push();
  selectionCanvas.push();
  translate(- 3 * boardSide / 8, - 3 * boardSide / 8, pieceHeight / 2);
  selectionCanvas.translate(- 3 * boardSide / 8, - 3 * boardSide / 8, pieceHeight / 2);
  for (let x = 0; x < 4; x ++) {
    for (let y = 0; y < 4; y ++) {
      push();
      selectionCanvas.push();
      translate(x * boardSide / 4, y * boardSide / 4, 0);
      selectionCanvas.translate(x * boardSide / 4, y * boardSide / 4, 0);
      rotateX(TAU / 4);
      selectionCanvas.rotateX(TAU / 4);
      ambientMaterial(playerColors[gV(v(x, y, z))])
      selectionCanvas.fill(x, y, z);
      cylinder(boardSide / 12, pieceHeight);
      selectionCanvas.cylinder(boardSide / 12, pieceHeight);
      pop();
      selectionCanvas.pop();
    }
  }
  pop();
  selectionCanvas.pop();
}

function addAlpha(c, alpha) {
  return color(`rgba(${c._getRed()}, ${c._getGreen()}, ${c._getBlue()}, ${alpha})`);
}

function drawVictory() {
  const [player, start, delta] = victoryResult;
  push();
  translate(- 3 * boardSide / 8, - 3 * boardSide / 8, (pieceHeight / 2));
  ambientMaterial(addAlpha(playerColors[player], 0.5));
  // a vector from piece 0, 0, 0 to piece 3, 3, 3
  const distortion = v(
    3 * boardSide / 4,
    3 * boardSide / 4,
    3 * verticalSpacing);
  // a spacial vector representing the length of the cylinder
  const cylinderVector = p5.Vector.mult(delta, distortion);
  // a spacial vector representing the start position of the cylinder
  const startPosition = p5.Vector.mult(start, p5.Vector.div(distortion, 3));
  // translate to the center of the cylinder
  translate(p5.Vector.add(startPosition, p5.Vector.mult(cylinderVector, 0.5)));
  // TODO: rotate
  if (delta.x !== 0) {
    rotateZ(- Math.atan(delta.x / delta.y));
  }
  if (delta.z !== 0) {
    let xRot = Math.atan((delta.z * 2) / Math.sqrt((delta.x * delta.x) + (delta.y * delta.y)));
    if (delta.x * delta.y === -1) rotateX(-xRot);
    else rotateX(xRot);
  }
  cylinder(boardSide / 45, cylinderVector.mag());
  pop();
}

function drawGame() {
  translate(0, 0, -1.5 * verticalSpacing)
  if (victoryResult) {
      drawVictory();
  }
  selectionCanvas.translate(0, 0, -1.5 * verticalSpacing)
  drawBoard(0);
  translate(0, 0, verticalSpacing);
  selectionCanvas.translate(0, 0, verticalSpacing)
  drawBoard(1);
  translate(0, 0, verticalSpacing);
  selectionCanvas.translate(0, 0, verticalSpacing)
  drawBoard(2);
  translate(0, 0, verticalSpacing);
  selectionCanvas.translate(0, 0, verticalSpacing)
  drawBoard(3);
}

function drawUI() {
  // TODO:
  //       - claim buttons allow players to claim / release a color
  //       - display claim status
  //       - allow game to be forfeited
  //       - when game is over allow game to be reset
}

function draw() {
  selectionCanvas.reset();
  
  ambientLight(127, 127, 63);
  placeCamera();
  
  background(210);
  selectionCanvas.background(123);
  
  noStroke();
  selectionCanvas.noStroke();
  
  rotateX(TAU / 4);
  selectionCanvas.rotateX(TAU / 4);
  drawGame();
  
  drawUI();
}

function handlePieceClick(x, y, z) {
  console.log(x,y,z);

  // TODO: Instead of rotating through colors this should set the color to
  //       the player's color if not already set and then push state to the server
  switch (gamestate[x][y][z]) {
    case 1:
      gamestate[x][y][z] = 2;
      break;
    case 2:
      gamestate[x][y][z] = 0;
      break;
    default:
      gamestate[x][y][z] = 1;
      break;
  }
  const victory = checkVictory();
  if (victory) {
    gameOver = true;
    victoryResult = victory;
  }
}

function touchStarted() {}

function mousePressed() {
  let pixel = new Uint8Array(4);
  selectionGL.readPixels(mouseX, height - mouseY, 1, 1,
                         selectionGL.RGBA,
                         selectionGL.UNSIGNED_BYTE,
                         pixel);
  //console.log(1, mouseX, mouseY, pixel);
  
  if (pixel[3] === 255 && pixel[0] < 4 && pixel[1] < 4 && pixel[2] < 4) {
    // piece clicked
    handlePieceClick(pixel[0], pixel[1], pixel[2]);
    // handle UI clicks
  }
  
  return false
}

// TODO: recieve web-socket messages from a server
//       that keeps track of state
