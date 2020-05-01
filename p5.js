$(document).ready(function () {
  var start = new Date();

  $("#reset").on("click", function () {
    unlockGridCLicking();
    reset();
    updateDifficulty();
    redraw();
  });
  $("#easy").on("click", function () {
    unlockGridCLicking();
    setDifficultyEasy();
    redraw();
  });
  $("#normal").on("click", function () {
    unlockGridCLicking();
    setDifficultyNormal();
    redraw();
  });
  $("#hard").on("click", function () {
    unlockGridCLicking();
    setDifficultyHard();
    redraw();
  });
});

var gridClickable = true;

let plane = {
  revealed: [],
  bombs: [],
  flags: [],
  difficulty: "normal",
  width: 0,
  height: 0,
  gameOver: false,
  win: false,
};

const reset = function () {
  plane.bombs.length = 0;
  plane.revealed.length = 0;
  plane.flags.length = 0;
  plane.gameOver = false;
  plane.win = false;
};

const updateDifficulty = function () {
  if (plane.difficulty == 1) {
    generateBombs(10);
  } else if (plane.difficulty == 2) {
    generateBombs(40);
  } else if (plane.difficulty == 3) {
    generateBombs(99);
  }
};

var blockSize;

function setup() {
  setDifficultyNormal();
  noLoop();
  show();
}

function draw() {
  background(90, 121, 122);
  show();
  if (isWin()) {
    drawWinText();
  } else if (plane.gameOver) {
    drawLostText();
  }
}

function mousePressed() {
  if (gridClickable) {
    if (mouseButton === RIGHT && isWithinGrid(mouseX, mouseY)) {
      let flagRect = findClosestRect(mouseX, mouseY);
      for (var i = 0; i < plane.flags.length; i++) {
        if (plane.flags[i].equals(flagRect)) {
          plane.flags.splice(i, 1);
          redraw();
          return false;
        }
      }
      plane.flags.push(flagRect);
      redraw();
    } else if (mouseButton === LEFT && isWithinGrid(mouseX, mouseY)) {
      reveal(findClosestRect(mouseX, mouseY));
      redraw();
    }
  }
}

//returns vector
const findClosestRect = function (x, y) {
  for (var i = 0; i < plane.width; i++) {
    for (var j = 0; j < plane.height; j++) {
      if (
        x > i * blockSize &&
        x < (i + 1) * blockSize &&
        y > j * blockSize &&
        y < (j + 1) * blockSize
      ) {
        return createVector(i * blockSize, j * blockSize);
      }
    }
  }
};

const isWithinGrid = function (x, y) {
  if (x >= 0 && x < width && y >= 0 && y < height) return true;
  return false;
};

const revealAround = function (xpos, ypos) {
  for (var i = -1; i < 2; i++) {
    for (var j = -1; j < 2; j++) {
      if (
        isWithinGrid(xpos + i * blockSize, ypos + j * blockSize) &&
        !(i == 0 && j == 0)
      ) {
        reveal(createVector(xpos + i * blockSize, ypos + j * blockSize));
      }
    }
  }
};

const showNumberOfBombsNearby = function (xpos, ypos) {
  //console.log("dostalo: " + xpos + " " + ypos);
  let number = 0;
  let neigh = [];

  for (var i = -1; i < 2; i++) {
    for (var j = -1; j < 2; j++) {
      if (
        isWithinGrid(xpos + i * blockSize, ypos + j * blockSize) &&
        !(i == 0 && j == 0)
      ) {
        neigh.push(createVector(xpos + i * blockSize, ypos + j * blockSize));
      }
    }
  }

  //checking how many neig are bombs
  for (var i = 0; i < plane.bombs.length; i++) {
    for (var j = 0; j < neigh.length; j++) {
      if (plane.bombs[i].equals(neigh[j])) {
        number++;
      }
    }
  }
  return number;
};

const setDifficultyEasy = function () {
  reset();
  plane.difficulty = 1;
  resizeCanvas(900, 900);
  plane.width = 8;
  plane.height = 8;
  blockSize = width / plane.width;
  generateBombs(10);
};
const setDifficultyNormal = function () {
  reset();
  plane.difficulty = 2;
  resizeCanvas(900, 900);
  plane.width = 16;
  plane.height = 16;
  blockSize = width / plane.width;
  generateBombs(40);
};
const setDifficultyHard = function () {
  reset();
  plane.difficulty = 3;
  resizeCanvas(1800, 960);

  plane.width = 30;
  plane.height = 16;
  blockSize = width / plane.width;
  generateBombs(99);
};

//returns true if already revealed or revealed now
//false if bomb
const reveal = function (vector) {
  for (var i = 0; i < plane.revealed.length; i++) {
    if (vector.equals(plane.revealed[i])) {
      return true;
    }
  }

  for (var i = 0; i < plane.bombs.length; i++) {
    if (vector.equals(plane.bombs[i])) {
      show();
      plane.gameOver = true;
      blockGridClicking();
      return false;
    }
  }
  plane.revealed.push(createVector(vector.x, vector.y));
  //console.log("z reveal: " + showNumberOfBombsNearby(vector.x, vector.y, plane));
  if (showNumberOfBombsNearby(vector.x, vector.y, plane) == 0) {
    revealAround(vector.x, vector.y, plane);
  }
  isWin();
  return true;
};

//generates a grid
const show = function () {
  for (var y = 0; y < plane.height; y++) {
    for (let x = 0; x < plane.width; x++) {
      let xpos = x * blockSize;
      let ypos = y * blockSize;
      strokeWeight(1);
      fill(111, 111, 111);
      stroke(0);

      if (isRevealed(xpos, ypos, plane)) {
        if (showNumberOfBombsNearby(xpos, ypos, plane) == 0) fill(64, 58, 58);
        else if (showNumberOfBombsNearby(xpos, ypos) == 1) fill(30, 42, 203);
        else if (showNumberOfBombsNearby(xpos, ypos) == 2) fill(0, 120, 0);
        else if (showNumberOfBombsNearby(xpos, ypos) == 3) fill(213, 11, 17);
        else if (showNumberOfBombsNearby(xpos, ypos) == 4) fill(112, 10, 179);
        else if (showNumberOfBombsNearby(xpos, ypos) == 5) fill(196, 58, 58);
        else if (showNumberOfBombsNearby(xpos, ypos) == 6) fill(54, 145, 122);
        else fill(111, 111, 111);
        rect(xpos, ypos, blockSize, blockSize);
        textAlign(CENTER);
        fill(0);
        textSize(blockSize / 2);

        text(
          showNumberOfBombsNearby(xpos, ypos),
          xpos + blockSize / 2,
          ypos + blockSize / (3 / 2)
        );
      } else rect(xpos, ypos, blockSize, blockSize);

      if (plane.gameOver) {
        if (isBomb(xpos, ypos)) {
          fill(0);
          rect(xpos, ypos, blockSize, blockSize);
          stroke(255);
          line(xpos, ypos, xpos + blockSize, ypos + blockSize);
          line(xpos + blockSize, ypos, xpos, ypos + blockSize);
          //console.log(xpos + " " + ypos);
        }
      }
      if (isFlag(xpos, ypos)) {
        stroke(255, 0, 0);
        strokeWeight(5);
        line(xpos, ypos, xpos + blockSize, ypos + blockSize);
        line(xpos + blockSize, ypos, xpos, ypos + blockSize);
      }
    }
  }
};
const isRevealed = function (x, y) {
  for (var i = 0; i < plane.revealed.length; i++) {
    if (plane.revealed[i].x == x && plane.revealed[i].y == y) {
      //console.log("returned true");
      return true;
    }
  }
};
const isBomb = function (x, y) {
  for (var i = 0; i < plane.bombs.length; i++) {
    if (plane.bombs[i].x === x && plane.bombs[i].y === y) {
      return true;
    }
  }
};
const isFlag = function (x, y) {
  for (var i = 0; i < plane.flags.length; i++) {
    if (plane.flags[i].x === x && plane.flags[i].y === y) {
      return true;
    }
  }
};
const generateBombs = function (amount) {
  for (var i = 0; i < amount; i++) {
    let cont = false;
    let vec = findClosestRect(
      Math.floor(random(0, width)),
      Math.floor(random(0, height)),
      this
    );
    if (vec == undefined) {
      continue;
    }
    for (var i = 0; i < plane.bombs.length; i++) {
      if (vec.x == plane.bombs[i].x && vec.y == plane.bombs[i].y) {
        cont = true;
      }
    }
    if (cont) {
      i--;
      continue;
    }

    plane.bombs.push(vec);
    //console.log(plane.bombs.length);
  }
};

const isWin = function () {
  //console.log(this.width * this.width - this.bombs.length);
  //console.log(this.revealed.length);
  if (
    plane.revealed.length ==
    plane.height * plane.width - plane.bombs.length
  ) {
    plane.win = true;
    redraw();
    return true;
  }
  return false;
};

const drawWinText = function () {
  fill(0, 255, 0);
  textAlign(CENTER);
  strokeWeight(5);
  stroke(0);
  textSize(150);
  text("YOU WIN!!!", width / 2, height / 2);
};

const drawLostText = function () {
  fill(244, 0, 0);
  textAlign(CENTER);
  strokeWeight(5);
  stroke(0);
  textSize(150);
  text("YOU LOST!!!", width / 2, height / 2);
};

const blockGridClicking = function () {
  gridClickable = false;
};
const unlockGridCLicking = function () {
  gridClickable = true;
};

const startTimer = function () {};
