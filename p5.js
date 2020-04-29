var p;

var blockSize;

function setup() {
  createCanvas(1200, 1200);

  p = new Plane();
  blockSize = width / p.width;
  p.generateBombs();
  noLoop();
  p.show();
}

function draw() {
  background(250);
  p.show();
}

function mouseClicked() {
  p.reveal(findClosestRect(mouseX, mouseY, p));
  redraw();
}
//returns vector
function findClosestRect(x, y, plane) {
  for (var i = 0; i < plane.width; i++) {
    for (var j = 0; j < plane.width; j++) {
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
}

function isWithinGrid(x, y) {
  if (x >= 0 && x < width && y >= 0 && y < width) return true;
  return false;
}
function revealAround(xpos, ypos, plane) {
  for (var i = -1; i < 2; i++) {
    for (var j = -1; j < 2; j++) {
      if (
        isWithinGrid(xpos + i * blockSize, ypos + j * blockSize) &&
        !(i == 0 && j == 0)
      ) {
        plane.reveal(createVector(xpos + i * blockSize, ypos + j * blockSize));
      }
    }
  }
}

function showNumber(xpos, ypos, plane) {
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
}

class Plane {
  constructor() {
    this.width = 20;
    this.height = 20;
    //array of vectors of revealed field
    this.revealed = [];

    //bombs is array of vectors which points the bomb
    this.bombs = [];
    //array of vectors which points the flag
    this.flags = [];

    this.gameOver = false;
    this.win = false;
  }

  //returns true if already revealed or revealed now
  //false if bomb
  reveal(vector) {
    for (var i = 0; i < this.revealed.length; i++) {
      if (vector.equals(this.revealed[i])) {
        return true;
      }
    }

    for (var i = 0; i < this.bombs.length; i++) {
      if (vector.equals(this.bombs[i])) {
        p.show();
        this.gameOver = true;
        return false;
      }
    }
    this.revealed.push(createVector(vector.x, vector.y));
    //console.log("z reveal: " + showNumber(vector.x, vector.y, this));
    if (showNumber(vector.x, vector.y, this) == 0) {
      revealAround(vector.x, vector.y, this);
    }
    this.isWin();
    return true;
  }

  //generates a grid
  show() {
    for (var y = 0; y < this.width; y++) {
      for (let x = 0; x < this.width; x++) {
        let xpos = x * blockSize;
        let ypos = y * blockSize;

        fill(111, 111, 111);
        stroke(0);

        if (this.gameOver) {
          if (isBomb(xpos, ypos, this)) {
            fill(0, 0, 0);
          }
        }

        if (isRevealed(xpos, ypos, this)) {
          if (showNumber(xpos, ypos, this) == 0) fill(64, 58, 58);
          else if (showNumber(xpos, ypos, this) == 1) fill(30, 42, 203);
          else if (showNumber(xpos, ypos, this) == 2) fill(0, 120, 0);
          else if (showNumber(xpos, ypos, this) == 3) fill(250, 0, 0);
          else if (showNumber(xpos, ypos, this) == 4) fill(1, 7, 42);
          else if (showNumber(xpos, ypos, this) == 5) fill(54, 1, 0);
          else if (showNumber(xpos, ypos, this) == 6) fill(54, 145, 122);
          else fill(111, 111, 111);
          rect(xpos, ypos, blockSize, blockSize);
          textAlign(CENTER);
          fill(0);
          textSize(blockSize / 2);
          //console.log("z show()" + showNumber(xpos, ypos, this));
          text(
            showNumber(xpos, ypos, this),
            xpos + blockSize / 2,
            ypos + blockSize / (3 / 2)
          );
        } else rect(xpos, ypos, blockSize, blockSize);

        // function mouseInside(x, y, w, h) {
        //   if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
        //     return true;
        //   } else {
        //     return false;
        //   }
        // }
        function isRevealed(x, y, plane) {
          for (var i = 0; i < plane.revealed.length; i++) {
            if (plane.revealed[i].x == x && plane.revealed[i].y == y) {
              //console.log("returned true");
              return true;
            }
          }
        }
        function isBomb(x, y, plane) {
          for (var i = 0; i < plane.bombs.length; i++) {
            if (plane.bombs[i].x === x && plane.bombs[i].y === y) {
              return true;
            }
          }
        }
      }
    }
  }
  generateBombs() {
    for (var i = 0; i < 20; i++) {
      let cont = false;
      let vec = findClosestRect(
        Math.floor(random(0, width)),
        Math.floor(random(0, width)),
        this
      );
      if (vec == undefined) {
        continue;
      }
      for (var i = 0; i < this.bombs.length; i++) {
        if (vec.x == this.bombs[i].x && vec.y == this.bombs[i].y) {
          cont = true;
        }
      }
      if (cont) continue;

      this.bombs.push(vec);
      console.log(this.bombs.length);
    }
  }

  isWin() {
    //console.log(this.width * this.width - this.bombs.length);
    //console.log(this.revealed.length);
    if (this.revealed.length == this.width * this.width - this.bombs.length) {
      this.win = true;
      console.log("you won!");
    }
  }
}
