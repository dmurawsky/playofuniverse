export const DEG_TO_RAD = Math.PI / 180;

export const pxToNum = (value: string) => Number(value.substr(0, value.length - 2));
export const radians = (deg: number) => DEG_TO_RAD * deg;

export class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Size {
  public width: number;
  public height: number;

  constructor(width: number, height?: number) {
    this.width = width;
    this.height = height ? height : width;
  }
}
