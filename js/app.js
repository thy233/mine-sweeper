function getPosition(e) {
  let x = -1, y = -1;
  if (e.layerX || e.layerX === 0) {
    x = e.layerX;
    y = e.layerY;
  } else if (e.offsetX || e.offsetX === 0) {
    x = e.offsetX;
    y = e.offsetY;
  }
  return {x, y};
}

function isPointInPath(position, display) {
  if (position.x < display.x) return false;
  if (position.x > display.width) return false;
  if (position.y < display.y) return false;
  if (position.y > display.width) return false;
  return true;
}

class App {
  constructor({
    el, canvas, width, height, mainView
  }) {
    this.el = el;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    if (mainView) this.setMainView(mainView);
    this.clickableQueue = [];
    this.contextmenuQueue = [];
    
    this.el.addEventListener("click", e => {
      let position = getPosition(e);
      // console.log(position);
      for (let clickable of this.clickableQueue) {
        if (isPointInPath(position, clickable.display))
          clickable.onClick(position);
      }
      this.render();
    });
    this.el.addEventListener("contextmenu", e => {
      e.preventDefault();
      let position = getPosition(e);
      // console.log(position);
      for (let clickable of this.contextmenuQueue) {
        if (isPointInPath(position, clickable.display))
          clickable.onContextmenu(position);
      }
      this.render();
    });
  }
  
  setMainView(mainView) {
    this.mainView = mainView;
    this.updateClickableQueue(this.mainView);
    this.render();
  }
  
  updateClickableQueue(container) {
    for (let component of container.children) {
      if (component.type === "Container") this.updateClickableQueue(component);
      if (component.onClick) this.clickableQueue.push(component);
      if (component.onContextmenu) this.contextmenuQueue.push(component);
    }
  }
  
  render() {
    this.canvas.clearRect(0, 0, this.width, this.height);
    this.mainView.render(this.canvas);
  }
}
