function initImageSystem(imageUrl, callback) {
  imageLoader(imageUrl, callback);
}

const imageData = new Map();

function loadImageAsync(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = function() {
      resolve(image);
    };
    image.onerror = function() {
      reject(new Error("Could not load image at " + url));
    };
    image.src = url;
  });
}

async function imageLoader(imageUrl, callback) {
  for (let [name, url] of imageUrl) {
    let img = await loadImageAsync(url);
    imageData.set(name, img);
  }
  // 图片加载完毕执行回调
  if (callback) callback();
}

// 图片映射
class ImageMap {
  constructor(img, map) {
      this.img = img;
      if (map) this.map = map;
      else this.map = [];
  }
  
  get(i) {
    return this.map[i];
  }
  
  set(i, mapping) {
    this.map[i] = mapping;
  }
  
  addMap(mapping) {
    this.map.push(mapping);
    return map.length - 1;
  }
  
  getImage() {
    return this.img;
  }
}