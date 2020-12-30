let textWidth;

function initViewSystem(canvas) {
  canvas.font = "16px Verdana,Geneva,sans-serif";
  canvas.fillStyle = "#FFFFFF";
  canvas.strokeStyle = "#FFFFFF";
  canvas.save();
  textWidth = text => canvas.measureText(text).width;
}

class Component {
  constructor({
    type = "Component",
    x = 0,
    y = 0,
    width = 0,
    height = 0
  } = {}) {
    this.type = type;
    this.setDisplay({x, y, width, height});
  }
  
  setDisplay({
    x = this.display.x, 
    y = this.display.y, 
    width = this.display.width, 
    height = this.display.height
  } = {}) {
    this.display = {x, y, width, height};
  }
  
  render(canvas) {}
  
  toString() {
    return `[View ${this.type} Object]`;
  }
}

const View = {
  Component
}

class Container extends View.Component {
  constructor({x, y, width, height} = {}) {
    super({type: "Container", x, y, width ,height});
    this.children = [];
  }
  
  append(view) {
    view.setDisplay({
      x: this.display.x + view.display.x,
      y: this.display.y + view.display.y,
    });
    this.children.push(view);
  }
  
  render(canvas) {
    super.render(canvas);
    for (let view of this.children) {
      view.render(canvas);
    }
  }
}

class Text extends View.Component {
  constructor(text, {x, y, width, height} = {}) {
    super({type: "Text", x, y, width, height});
    this.text = text;
    this.setDisplay();
  }
  
  setFont(fontStyle) {
    this.font = fontStyle;
  }
  
  setDisplay({
    x = this.display.x, 
    y = this.display.y, 
    width = textWidth(this.text), 
    height = this.display.y + 16
  } = {}) {
    super.setDisplay({x, y, width, height});
    this.start = {
      x: this.display.x, 
      y: this.display.y + 16,
    };
  }
  
  render(canvas) {
    super.render(canvas);
    canvas.fillStyle = "#FFFFFF";
    if (this.font) canvas.font = this.font;
    canvas.fillText(this.text, this.start.x, this.start.y);
    canvas.restore();
  }
}

class Button extends View.Component {
  constructor(text, callback, {x, y, width, height} = {}) {
      super({type: "Button", x, y, width, height });
      this.text = new Text(text, {x, y, width, height});
      this.setDisplay(this.text.display);
      this.callback = callback;
  }
  
  onClick() {
    this.callback();
  }
  
  render(canvas) {
    super.render(canvas);
    this.text.render(canvas);
  }
}

// 扫雷
class Minesweeper extends View.Component {
  constructor(imgMap, length, cellWidth, {x, y} = {}) {
    super({x, y, width: cellWidth * length, height: cellWidth * length});
    this.imgMap = imgMap;
    this.length = length;
    this.cellWidth = cellWidth;
    
    this.isEnd = false;
    this.map = null;

    this.dir_x = [-1, 0, 1, 1, 1, 0, -1, -1];
    this.dir_y = [-1, -1, -1, 0, 1, 1, 1, 0];
    
    this.generateMap();
  }
  
  // 点击事件
  onClick(position) {
    position = {
      x: ~~((position.x - this.display.x) / this.cellWidth), 
      y: ~~((position.y - this.display.y) / this.cellWidth),
    };
    console.log(position);
    this.clickMap(position.y, position.x);
  }
  
  // 右键点击事件
  onContextmenu(position) {
    position = {
      x: ~~((position.x - this.display.x) / this.cellWidth), 
      y: ~~((position.y - this.display.y) / this.cellWidth),
    };
    console.log(position);
    this.markMap(position.y, position.x);
  }
  
  // 点击块
  clickMap(y, x) {
    if (this.isEnd || !this.isEffective(y, x)) return;
    switch (this.map[y][x]) {
      case "M":
        this.map[y][x] = "X";
        this.isEnd = true;
        break;
      case "E":
        this.dfs(y, x);
        break;
      case "S":
      case "MS":
      case "X":
      case "B":
      break;
      default:
        this.quickClearUp(y, x);
    }
  }
        
  // 标记块
  markMap(y, x) {
    if (this.isEnd || !this.isEffective(y, x)) return;
    switch (this.map[y][x]) {
      case "M":
        this.map[y][x] = "MS";
        break;
      case "E":
        this.map[y][x] = "S";
        break;
      case "S":
        this.map[y][x] = "E";
        break;
      case "MS":
        this.map[y][x] = "M";
        break;
    }
  }
  
  // 坐标是否合法
  isEffective(y, x) {
    return (
      y >= 0 &&
      y < this.length && 
      x >= 0 && 
      x < this.length
    );
  }

  // 快速点开周围的块
  quickClearUp(y, x) {
    let val = parseInt(this.map[y][x]);
    if (val != this.calculateAdjacent(y, x, ["S", "MS"])) return;
    let dir_x = this.dir_x;
    let dir_y = this.dir_y;
    for (let i = 0; i < dir_x.length; i++)
      if (
        this.isEffective(y + dir_y[i], x + dir_x[i]) && 
        (
          this.map[y + dir_y[i]][x + dir_x[i]] == "E" ||
          this.map[y + dir_y[i]][x + dir_x[i]] == "M"
        )
      ) this.clickMap(y + dir_y[i], x + dir_x[i]);
  }
  
  // 搜索块周围给定格式的块数量
  calculateAdjacent(y, x, types) {
    let i = 0;
    let dir_x = this.dir_x;
    let dir_y = this.dir_y;
    for(let p = 0; p < dir_x.length; p++) {
      let is = false;
      if(this.isEffective(y + dir_y[p], x + dir_x[p]))
        for(let type of types) {
          if(this.map[y + dir_y[p]][x + dir_x[p]] == type) {
            is = true;
            break;
          }
        }
      if(is) i += 1;
    }
    return i;
  }
  
  // 打开空白块周围的方块直到点开数字块
  dfs(y, x) {
    if(!this.isEffective(y, x) || this.map[y][x] != "E") return;
    let dir_x = this.dir_x;
    let dir_y = this.dir_y;
    let i = this.calculateAdjacent(y, x, ["M", "X", "MS"]);
    if(i == 0) {
      this.map[y][x] = "B";
      for(let p = 0; p < dir_x.length; p++) {
        this.dfs(y + dir_y[p], x + dir_x[p]);
      }
    } else this.map[y][x] = "" + i;
  }
  
  // 格式化地图
  formatTiles(tile) {
    let result = 0;
    switch (tile) {
      case "X":
        result = 13;
        break;
      case "M":
        if(this.isEnd) {
          result = 12;
          break;
        }
        result = 2;
        break;
      case "S":
      case "MS":
        result = 3;
        break;
      case "E":
        result = 2;
        break;
      case "B":
        break;
      default:
        result = parseInt(tile) + 3;
    }
    return this.imgMap.get(result);
  }
  
  // 随机雷坐标
  randomMineCoordinate() {
    let sum = 40;
    let y_axis = [];
    let x_axis = [];
  
    y_axis.push(0);
    while (y_axis.length < this.length)
      y_axis.push( Math.floor( Math.random() * sum ) );
    y_axis.push(sum);
    y_axis.sort( (a, b) => a - b );
  
    y_axis = y_axis.map( (item, index, arr) => arr[index + 1] - item );
    y_axis.pop();
    // console.log( y_axis.reduce((a, b) => a + b), y_axis);
  
    x_axis = y_axis.map( item => {
      if (!item) return null;
      let set = new Set();
      while (set.size < item) {
        set.add( Math.floor( Math.random() * this.length ) );
      }
      return [ ...set ];
    });
    // console.log(x_axis);
  
    return x_axis;
  }
  
  // 随机地图
  generateMap() {
    this.map = new Array(this.length).fill("E").map( () => new Array(this.length).fill("E") );
    let coordinate = this.randomMineCoordinate();
    for(let y = 0; y < this.length; y++) {
      if(!coordinate[y]) continue;
      for(let x of coordinate[y])
        this.map[y][x] = "M";
    }
    this.isEnd = false;
  }
  
  // 绘制渲染
  render(canvas) {
    super.render(canvas);
    /*
    for (let x = 1; x < this.length; x++) {
      canvas.beginPath();
      // canvas.strokeStyle = "#FFFFFF";
      canvas.moveTo(0, x * this.cellWidth);
      canvas.lineTo(this.display.width, x * this.cellWidth);
      canvas.stroke();
    }
    for (let y = 1; y < this.length; y++) {
      canvas.beginPath();
      // canvas.strokeStyle = "#FFFFFF";
      canvas.moveTo(y * this.cellWidth, 0);
      canvas.lineTo(y * this.cellWidth, this.display.height);
      canvas.stroke();
    }
    for (let y = 0; y < this.length; y++) {
      for (let x = 0; x < this.length; x++) {
        canvas.fillText(
          this.map[y][x], 
          x * this.cellWidth + 8, 
          (y + 1) * this.cellWidth - 8
        );
      }
    }
    // */
    canvas.drawImage(imageData.get("msn"), 0, -64);
    for (let y = 0; y < this.length; y++) {
      for (let x = 0; x < this.length; x++) {
        let s = this.formatTiles(this.map[y][x]);
        canvas.drawImage(
          this.imgMap.getImage(),
          s.x, s.y, 16, 16,
          x * this.cellWidth, y * this.cellWidth,
          this.cellWidth, this.cellWidth
        );
      }
    }
      
  }
}
