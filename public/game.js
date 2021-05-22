// DEFINED in p5.js
/* global createCanvas, color, windowWidth, windowHeight,
   width, height, ellipse, text, fill, noStroke, millis,
   createVector, lerpColor, map, rect, strokeWeight, stroke,
   triangle, p5, ROUND, strokeJoin, frameRate, frameCount,
   background, WEBGL, box, keyCode, LEFT_ARROW, RIGHT_ARROW,
   rotateX, rotateZ, keyIsPressed, plane, translate, camera,
   ortho, push, pop, cylinder, createGraphics, mouseX, mouseY,
   pixelDensity, pointLight, ambientMaterial, ambientLight,
   loadModel, model */

// DEFINED in remote.js OR in_person.js
/* global handlePieceClick, checkVictory, gamestate, gameOver, victoryResult */

const TAU = 2 * Math.PI;

let cameraAngle = TAU / 12;
let minAspect, boardSide, verticalSpacing,
    cameraHeight, cameraFromZAxis,
    pieceHeight;

let selectionCanvas, selectionGL;

gamestate = [];
gameOver = false;
victoryResult = null;

// this will be set to createVector inside of the setup (p5 functions aren't defined yet here)
let v;

// FIXME: victory checking could happen on the server maybe.. but vector libraries.. idk

// get the piece value for a vector
function gV(vector) {
  return gamestate[vector.x][vector.y][vector.z];
}

// looks at the four pieces along the direction of delta starting with start
// returns false if they are not all the same or they are all 0
// otherwise returns an array with three values: the value that all the cells are
// and the two arguments that were passed in
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

// calls checkLine for every possible victory line and returns the first non-falsey result
// this modifies a global variable because it needs to be used in in_person.js or remote.js
// and i didn't feel like reorganizing things (probably the "correct" way would involve objects)
checkVictory = () => {
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

// setup buttons to rotate the board
// this can also be done on a desktop with the left and right arrow keys
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
let pawnModel, knightModel, bishopModel, unicornModel, rookModel, queenModel, kingModel;

function preload() {
  pawnModel = loadModel('https://cdn.glitch.com/0348a368-99bb-4e16-9f2b-4e060c517fd5%2FPawn.obj');
  knightModel = loadModel('https://cdn.glitch.com/0348a368-99bb-4e16-9f2b-4e060c517fd5%2FKnight.obj');
  bishopModel = loadModel('https://cdn.glitch.com/0348a368-99bb-4e16-9f2b-4e060c517fd5%2FBishop.obj');
  unicornModel = loadModel('https://cdn.glitch.com/0348a368-99bb-4e16-9f2b-4e060c517fd5%2FUnicorn.obj');
  rookModel = loadModel('https://cdn.glitch.com/0348a368-99bb-4e16-9f2b-4e060c517fd5%2FRook.obj');
  queenModel = loadModel('https://cdn.glitch.com/0348a368-99bb-4e16-9f2b-4e060c517fd5%2fQueen.obj');
  kingModel = loadModel('https://cdn.glitch.com/0348a368-99bb-4e16-9f2b-4e060c517fd5%2FKing.obj');
}

// p5.js calls this for us
function setup() {
  v = createVector;
  
  playerColors[0] = color(159, 159, 255); // default
  playerColors[1] = color(255, 31, 31); // player 1
  playerColors[2] = color(31, 255, 31); // player 2

  // the game canvas is a square
  // for mobile we make it as big as possible
  // for larger screens we leave 200 pixels to the right for the ui
  if (windowWidth <= 600) {
    minAspect = Math.min(windowWidth - 5, windowHeight - 5);    
  } else {
    minAspect = Math.min(windowWidth - 200, windowHeight - 5);
  }
  let canvas = createCanvas(minAspect, minAspect, WEBGL);
  canvas.parent('game');
  pixelDensity(1);
  ortho(- 3 * width / 7, 3 * width / 7, - height / 2, height, - 2 * height, 2 * height);

  // the selection canvas won't be displayed
  // we render clickable 3D shapes (in this case just the pieces) in parallel to the the main canvas
  // and we give each a unique color; when the user clicks on the canvas we can identify the clicked
  // shape by looking at the color of the corresponding pixel on the selection canvas
  selectionCanvas = createGraphics(minAspect, minAspect, WEBGL);
  selectionCanvas.pixelDensity(1);
  selectionGL = selectionCanvas.elt.getContext('webgl');
  selectionCanvas.ortho(- 3 * width / 7, 3 * width / 7, - height / 2, height / 2, - 2 * height, 2 * height);

  // we calculate some distances based on the size of the canvas that we will use to draw things 
  boardSide = (Math.min(width, height) / 2); // distance along the side of one of the four boards
  verticalSpacing = boardSide / 2; // vertical distance between boards
  pieceHeight = verticalSpacing / 9; // height of each piece
  cameraHeight = boardSide / 2; // place the camera above the scene
  cameraFromZAxis = boardSide; // place the camera laterally away from the center
  
  // set the gamestate to a 4x4x4 3D array of all 0s
  for (let x = 0; x < 4; x ++) {
    gamestate.push([]);
    for (let y = 0; y < 4; y ++) {
      gamestate[x].push([]);
      for (let z = 0; z < 4; z ++) {
        gamestate[x][y].push(0);
      }
    }
  }
}

function placeCamera() {
  // update the cameraAngle if the user is actively rotating it
  if (keyIsPressed || rotateButtonPressed) {
    if (keyCode === LEFT_ARROW || rotateButtonPressed === 'CW') {
      cameraAngle -= 0.03;
    } else if (keyCode === RIGHT_ARROW || rotateButtonPressed === 'CCW') {
      cameraAngle += 0.03;
    }
  }
  
  // place a point light that follows the camera a quarter turn counter-clockwise
  // of the camera but further away and higher up
  pointLight(255, 255, 255,
             4 * cameraFromZAxis * Math.cos(cameraAngle - (TAU / 4)),
             -8 * cameraHeight,
             4 * cameraFromZAxis * Math.sin(cameraAngle - (TAU / 4)));
  
  // place the camera in both canvases
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
  // translate to the position the piece with X,Y position 0,0
  translate(- 3 * boardSide / 8, - 3 * boardSide / 8, pieceHeight / 2);
  selectionCanvas.translate(- 3 * boardSide / 8, - 3 * boardSide / 8, pieceHeight / 2);
  for (let x = 0; x < 4; x ++) {
    for (let y = 0; y < 4; y ++) {
      push();
      selectionCanvas.push();
      // translate to the piece with X,Y position x,y
      translate(x * boardSide / 4, y * boardSide / 4, 0);
      selectionCanvas.translate(x * boardSide / 4, y * boardSide / 4, 0);
      // the cylinder will be drawn by default facing the Y axis sp we rotate it around the X axis
      rotateX(TAU / 4);
      selectionCanvas.rotateX(TAU / 4);
      // color the piece based on the gamestate
      ambientMaterial(playerColors[gV(v(x, y, z))])
      // color the piece in the selection canvas with r,g,b correspond to x,y,z
      selectionCanvas.fill(x, y, z);

      //cylinder(boardSide / 12, pieceHeight);
      model(queenModel);
      selectionCanvas.cylinder(boardSide / 12, pieceHeight);
      pop(); // undo rotation and return to X,Y position 0,0 
      selectionCanvas.pop();
    }
  }
  pop(); // return to position and rotation from before this function call
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
  // the cylinder will be drawn by default along the Y axis
  // we are rotating so that it is drawn along the direction of delta
  // first we rotate around the vertical axis
  if (delta.x !== 0) {
    rotateZ(- Math.atan(delta.x / delta.y));
  }
  // the rotation around the Z axis above changes where the X axis is for the purpose of rotation and
  // translation until the pop() calll below so the adjacent side of the relevant right triangle
  // for our arctangent function is actually the vector sum of the x and y components of delta
  if (delta.z !== 0) {
    let xRot = Math.atan((delta.z * 2) / Math.sqrt((delta.x * delta.x) + (delta.y * delta.y)));
    // i'm not sure why the rotation needs to be inverted in this case but i suspect it has something
    // to do with quaternions
    if (delta.x * delta.y === -1) rotateX(-xRot);
    else rotateX(xRot);
  }

  cylinder(boardSide / 45, cylinderVector.mag());
  pop(); // return to position and rotation from before this function call
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
  translate(0, 0, verticalSpacing);
  selectionCanvas.translate(0, 0, verticalSpacing)
  drawBoard(4);
}

// p5.js calls this function to update the canvas once per frame
function draw() {
  selectionCanvas.reset();
  
  ambientLight(127, 127, 63);
  placeCamera();
  
  background(210);
  selectionCanvas.background(123);
  
  noStroke();
  selectionCanvas.noStroke();
  
  // by default the Z axis is depth and the Y axis is vertical (to match 2D coordinates)
  // this rotation makes the Z axis vertical and the Y axis depth
  // (because of the way our camera moves we can think of X and Y as mostly interchangeable tho)
  rotateX(TAU / 4);
  selectionCanvas.rotateX(TAU / 4);

  drawGame();
}

// this prevents p5.js from treating mobile touch events as two clicks
function touchStarted() {
  mousePressed();
}

// p5.js calls this when a click happens on the canvas
function mousePressed() {
  let pixel = new Uint8Array(4);
  selectionGL.readPixels(mouseX, height - mouseY, 1, 1,
                         selectionGL.RGBA,
                         selectionGL.UNSIGNED_BYTE,
                         pixel);
  
  if (pixel[3] === 255 && pixel[0] < 4 && pixel[1] < 4 && pixel[2] < 4) {
    // click behaviour differs between remote and in-person versions so it is defined in the respective files
    handlePieceClick(pixel[0], pixel[1], pixel[2]);
  }
  
  return false
}
