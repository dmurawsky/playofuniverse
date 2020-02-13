// Utils
import { Size, Vector2, radians, pxToNum } from '../utils';

// Types
import { ConfettiConfig, Color } from '../types';

// Default Config
const SPEED = 30;
const DT = 1.0 / SPEED;
const AMOUNT = 500;
const COLORS: Color[] = [
  { front: 'rgb(224, 204, 254)', back: 'rgb(198, 161, 255)' },
  { front: 'rgb(241, 206, 244)', back: 'rgb(245, 154, 252)' },
  { front: 'rgb(253, 206, 203)', back: 'rgb(250, 158, 152)' },
];

class ConfettiPaper {
  public position: Vector2;
  public rotationSpeed: number;
  public angle: number;
  public rotation: number;
  public cosA: number;
  public size: Size;
  public oscillationSpeed: number;
  public velocity: Vector2;
  public corners: Vector2[] = [];
  public time: number;
  public color: Color;
  public iteration = 0;

  constructor(position: Vector2, color: Color) {
    this.position = position;
    this.color = color;
    this.rotationSpeed = (Math.random() * 600) + 800;
    this.angle = radians(Math.random() * 360);
    this.rotation = radians(Math.random() * 360);
    this.cosA = 1.0;
    this.size = new Size(4.0 * Math.random());
    this.oscillationSpeed = (Math.random() * 1.5) + 0.5;
    this.velocity = new Vector2(40, (Math.random() * 60) + 50.0);
    this.time = Math.random();

    for (let i = 0; i < 4; i++) {
      const deltaX = Math.cos(this.angle + radians((i * 90) + 45));
      const deltaY = Math.sin(this.angle + radians((i * 90) + 45));
      this.corners[i] = new Vector2(deltaX, deltaY);
    }
  }

  public move = (deltaTime: number) => {
    this.time += deltaTime;
    this.rotation += this.rotationSpeed * deltaTime;
    this.cosA = Math.cos(radians(this.rotation));
    this.position.x += Math.cos(this.time * this.oscillationSpeed) * this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  public draw = (context: CanvasRenderingContext2D) => {
    if (this.cosA > 0) {
      context.fillStyle = this.color.front;
    } else {
      context.fillStyle = this.color.back;
    }

    context.beginPath();
    context.moveTo(this.position.x + this.corners[0].x * this.size.width, this.position.y + this.corners[0].y * this.size.height * this.cosA);

    for (let i = 1; i < 4; i++) {
      context.lineTo(this.position.x + this.corners[i].x * this.size.width, this.position.y + this.corners[i].y * this.size.height * this.cosA);
    }

    context.closePath();
    context.fill();
  }
}

class ConfettiCanvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private amount: number;
  private atLeastOneAlive: boolean = true;
  private confettiPapers: ConfettiPaper[] = [];
  private size: Size;
  private deltaTime: number;
  private colors: Color[];

  constructor(canvas: HTMLCanvasElement, config: ConfettiConfig) {
    const { amount, speed, colors } = config;

    this.amount = amount ? amount : AMOUNT;
    this.deltaTime = speed ? (1.0 / speed) : DT;
    this.colors = colors ? colors : COLORS;

    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;

    this.size = new Size(pxToNum(this.canvas.style.width!), pxToNum(this.canvas.style.height!));
  }

  public resizeCanvas = () => {
    if (this.canvas) {
      this.size = new Size(pxToNum(this.canvas.style.width!), pxToNum(this.canvas.style.height!));
    }
  }

  public start = () => {
    for (let i = 0; i < this.amount; i++) {
      const position = new Vector2(Math.random() * this.size.width, Math.random() * this.size.height);
      const color = this.colors[Math.round(Math.random() * (this.colors.length - 1))];
      const paper = new ConfettiPaper(position, color);

      this.confettiPapers.push(paper);
    }

    window.requestAnimationFrame(this.draw);
  }

  public draw = () => {
    this.context.clearRect(0, 0, this.size.width, this.size.height);

    this.atLeastOneAlive = false;
    this.confettiPapers.forEach(paper => {
      paper.move(this.deltaTime);

      if (paper.position.y < this.size.height) {
        this.atLeastOneAlive = true;

        paper.draw(this.context);
      }
    });

    if (this.atLeastOneAlive) window.requestAnimationFrame(this.draw);
    else this.clearConfetti();
  }

  public clearConfetti = () => {
    this.confettiPapers = [];
    this.context.clearRect(0, 0, this.size.width, this.size.height);
  }
}

export { ConfettiCanvas };
