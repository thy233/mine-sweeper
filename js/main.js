const root = document.getElementById("app");
const canvas = root.getContext("2d");
canvas.imageSmoothingEnabled = false;

const app = new App({
  el: root,
  canvas,
  width: root.width,
  height: root.height
});

let imageUrl = new Map([
  ["ms", "./img/ms-2.png"], 
  ["msn", "./img/msn.png"], 
]);

let minesweeperImage = null;

initViewSystem(app.canvas);
initImageSystem(imageUrl, () => {
  init();
  main();
});

function init(main) {
  minesweeperImage = new ImageMap(
    imageData.get("ms"),
    [
      { x: 0, y: 0 },
      { x: 16, y: 0 },
      { x: 32, y: 0 },
      { x: 48, y: 0 },
      { x: 0, y: 16 },
      { x: 16, y: 16 },
      { x: 32, y: 16 },
      { x: 0, y: 32 },
      { x: 16, y: 32 },
      { x: 32, y: 32 },
      { x: 0, y: 48 },
      { x: 16, y: 48 },
      { x: 32, y: 48 },
      { x: 48, y: 48 }
    ]
  );
}

function main() {
  let msn = imageData.get("msn");
  console.log(msn.width, msn.height);
  let container = new Container({x: 0, y: 0, width: app.width, height: app.height});
  let minesweeper = new Minesweeper(minesweeperImage, 16, 32, {x: 0, y: 0});
  container.append(minesweeper);
  app.setMainView(container);
}
