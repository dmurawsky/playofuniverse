// Utils
import { seconds } from '../../time';
import { Size, Vector2, pxToNum } from '../utils';

// Types
import { FireworksConfig } from '../types';

// Constants
const GRAVITY = 0.03;
const PARTICLE_SIZE = 3;
const VELOCITY = 7;
const MAX_TAIL_LENGTH = 10;

// Default Config
const DURATION = seconds(7).ms;
const DENSITY = 90;
const AMOUNT = 3000;
const FREQUENCY = 0.4;
const COLORS = ['rgb(224, 204, 254)', 'rgb(241, 206, 244)', 'rgb(253, 206, 203)'];

class Particle {
  public canvas: HTMLCanvasElement;
  public position: Vector2;
  public velocity: Vector2;
  public color: string;
  public alpha: number;
  public tail: Vector2[] = [];
  private tailIntervalTracker: number = 0;
  public size: Size;

  constructor(position: Vector2, color: string, canvas: HTMLCanvasElement, alpha?: number) {
    this.canvas = canvas;

    this.size = new Size(Math.random() * PARTICLE_SIZE + 1);

    this.position = new Vector2(
      position.x - this.size.width / 2,
      position.y - this.size.height / 2
    );

    this.velocity = new Vector2(
      (Math.random() - 0.5) * VELOCITY,
      (Math.random() - 0.5) * VELOCITY
    );

    this.color = color;

    this.alpha = alpha ? alpha : (Math.random() * 0.5) + 0.1;
  }

  public move = () => {
    this.position.x += this.velocity.x;
    this.velocity.y += GRAVITY * this.alpha;
    this.position.y += this.velocity.y;
    this.decrementAlpha();

    if (this.tail.length > MAX_TAIL_LENGTH) {
      this.tail.shift();
    }

    if (this.tailIntervalTracker % 2) {
      this.tail.push({ ...this.position });
    }

    this.tailIntervalTracker++;
  }

  public decrementAlpha = (amount: number = 0.01) => void (this.alpha = Math.max(this.alpha - amount, 0));

  public isAlive = () => !(
      this.position.x <= -this.size.width
    || this.position.x >= pxToNum(this.canvas.style.width!) || this.position.y >= pxToNum(this.canvas.style.height!) || this.alpha <= 0);

  public drawTail = (context: CanvasRenderingContext2D) => {
    this.tail.forEach((tailParticle, index) => {
      context.save();
      context.beginPath();

      const normalizedTailPosition = (1 / (MAX_TAIL_LENGTH / index));

      const sizeDecayCurve = (x: number) => 1.12222 - 0.126667 * x + 0.00444444 * Math.pow(x, 2);

      context.translate(tailParticle.x + this.size.width / 2, tailParticle.y + this.size.height / 2);

      // This would need to change if we would like to support non-cirlces
      context.arc(0, 0, this.size.width * sizeDecayCurve(normalizedTailPosition), 0, Math.PI * 2);
      context.fillStyle = this.color;
      context.globalAlpha = (1 / (MAX_TAIL_LENGTH / index)) * this.alpha;

      context.closePath();
      context.fill();
      context.restore();
    });
  }

  public draw = (context: CanvasRenderingContext2D) => {
    this.drawTail(context);

    context.save();
    context.beginPath();

    context.translate(this.position.x + this.size.width / 2, this.position.y + this.size.height / 2);

    // This would need to change if we would like to support non-cirlces
    context.arc(0, 0, this.size.width, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.globalAlpha = this.alpha;

    context.closePath();
    context.fill();
    context.restore();
  }
}

class FireworksCanvas {
  private density: number;
  private amount: number;
  private duration: number;
  private frequency: number;
  private colors: string[];
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private size: Size;
  private startTime: number = 0;
  private numAlive: number = 0;
  private atLeastOneAlive: boolean = true;
  private generatingFireworks: boolean = true;
  private particles: Particle[] = [];

  constructor(canvas: HTMLCanvasElement, config: FireworksConfig) {
    const { duration, density, amount, frequency, colors } = config;

    this.duration = duration ? seconds(duration).ms : DURATION;
    this.density = density ? density : DENSITY;
    this.amount = amount ? amount : AMOUNT;
    this.frequency = frequency ? frequency : FREQUENCY;

    this.colors = colors ? colors : COLORS;

    this.canvas = canvas;
    this.context = this.canvas.getContext('2d')!;

    this.size = new Size(pxToNum(this.canvas.style.width!), pxToNum(this.canvas.style.height!));
  }

  public start = () => {
    this.startTime = Date.now();
    this.atLeastOneAlive = true;

    window.requestAnimationFrame(this.updateWorld);
  }

  public resizeCanvas = () => {
    if (this.canvas) {
      this.size = new Size(pxToNum(this.canvas.style.width!), pxToNum(this.canvas.style.height!));
    }
  }

  public clearParticles = () => {
    this.particles = [];
    this.context.clearRect(0, 0, this.size.width, this.size.height);
  }

  private updateWorld = () => {
    this.generatingFireworks = Date.now() - this.startTime < this.duration;

    this.draw();

    if (this.generatingFireworks || this.atLeastOneAlive) window.requestAnimationFrame(this.updateWorld);
    else this.clearParticles();
  }

  private draw = () => {
    this.context.clearRect(0, 0, this.size.width, this.size.height);

    if (
      this.numAlive < this.amount &&
      Math.random() < this.frequency &&
      this.generatingFireworks
    ) {
      this.createFirework();
    }

    this.atLeastOneAlive = false;
    this.particles.forEach(particle => {
      particle.move();

      if (particle.isAlive()) {
        this.atLeastOneAlive = true;

        particle.draw(this.context);
        this.numAlive += 1 + MAX_TAIL_LENGTH;
      } else {
        this.numAlive = Math.max(this.numAlive - 1 - MAX_TAIL_LENGTH, 0);
      }
    });
  }

  private createFirework = () => {
    const position = new Vector2(
      Math.floor(Math.random() * this.size.width),
      Math.floor(Math.random() * this.size.height)
    );

    const color = this.colors[Math.floor(Math.random() * COLORS.length)];

    for (let i = 0; i < this.density; i++) {
      const particle = new Particle(position, color, this.canvas);

      const yVelocity = Math.sqrt(25 - Math.pow(particle.velocity.x, 2));

      if (Math.abs(particle.velocity.y) > yVelocity) {
        particle.velocity.y = particle.velocity.y > 0 ? yVelocity : -yVelocity;
      }

      this.particles.push(particle);
    }
  }
}

export { FireworksCanvas };
