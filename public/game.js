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

function setup() {
  minAspect = Math.min(windowWidth - 200, windowHeight - 5);
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
        gamestate[x][y].push(null);
      }
    }
  }
  
  // const clockwiseButton = document.querySelector('.clockwise-button');
  // const counterClockwiseButton = document.querySelector('.counter-clockwise-button');
  // clockwiseButton.addEventListener('mousedown');
}

function placeCamera() {
  if (keyIsPressed) {
    if (keyCode === LEFT_ARROW) {
      cameraAngle -= 0.03;
    } else if (keyCode === RIGHT_ARROW) {
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
      switch (gamestate[x][y][z]) {
        case 1:
          ambientMaterial(255, 31, 31);
          break;
        case 2:
          ambientMaterial(31, 255, 31);
          break;
        default:
          ambientMaterial(159, 159, 255);
          break;
          
      }
      selectionCanvas.fill(x, y, z);
      //selectionCanvas.fill(32 * x, 32 * y, 32 * z);
      cylinder(boardSide / 12, pieceHeight);
      selectionCanvas.cylinder(boardSide / 12, pieceHeight);
      pop();
      selectionCanvas.pop();
    }
  }
  pop();
  selectionCanvas.pop();
}

function drawGame() {
  translate(0, 0, -1.5 * verticalSpacing)
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
  //       - rotate buttons for touchscreen users
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
  
  // TODO: check if there is a winner and highlight the winning line
  //checkVictory();
  
  rotateX(TAU / 4);
  selectionCanvas.rotateX(TAU / 4);
  drawGame();
  
  drawUI();
}

function handlePieceClick(x, y, z) {
  // TODO: Instead of rotating through colors this should set the color to
  //       the player's color if not already set and then push state to the server
  switch (gamestate[x][y][z]) {
    case 1:
      gamestate[x][y][z] = 2;
      break;
    case 2:
      gamestate[x][y][z] = null;
      break;
    default:
      gamestate[x][y][z] = 1;
      break;
  }
}

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
}

// TODO: recieve web-socket messages from a server
//       that keeps track of state
