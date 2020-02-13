import React, { Component } from "react";
import Life from "./life";

export interface LifeCanvasProps {
  height: number;
  width: number;
}

// BACKGROUND, DEAD, ADULT, CHILD
const COLORS = [
  [0, 0, 0],
  [200, 0, 0],
  [255, 255, 255],
  [0, 255, 0]
];

class LifeCanvas extends Component<LifeCanvasProps> {
  life: Life;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;

  constructor(props) {
    super(props);

    this.life = new Life(props.width, props.height);
    this.life.randomize();

    this.canvas = null;
    this.ctx = null;
  }

  componentDidMount() {
    this.setupCanvus();
    requestAnimationFrame(() => {
      this.animFrame();
    });
  }

  setupCanvus = () => {
    this.canvas = this.refs.canvas as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");

    if (this.ctx) {
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.props.width, this.props.height);
    }
  };

  animFrame() {
    let cells = this.life.getCells();

    let canvas = this.refs.canvas as HTMLCanvasElement;
    let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.props.width, this.props.height);

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let buffer = imageData.data;

    for (let row = 0; row < this.props.height; row++) {
      for (let col = 0; col < this.props.width; col++) {
        let index = (row * this.props.width + col) * 4;

        let currentNumber = cells[row][col];

        buffer[index + 0] = COLORS[currentNumber][0]; // Red: 0xff == 255, full intensity
        buffer[index + 1] = COLORS[currentNumber][1]; // Green: zero intensity
        buffer[index + 2] = COLORS[currentNumber][2]; // Blue: zero intensity
        buffer[index + 3] = 255; // Alpha: 0xff == 255, fully opaque
      }
    }

    ctx.putImageData(imageData, 0, 0);
    this.life.step();
    requestAnimationFrame(() => this.animFrame());
  }

  render() {
    return (
      <canvas
        ref="canvas"
        width={this.props.width}
        height={this.props.height}
      />
    );
  }
}

export default LifeCanvas;
