class aify {
  constructor(width) {
    this.width = width;
  }
  area() {
    return Math.pow(this.width, 2);
  }
}

window.aifyjs = aify;

export default aifyjs;
