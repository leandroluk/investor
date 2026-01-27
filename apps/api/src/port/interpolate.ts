// port/interpolate.ts
export abstract class Renderer {
  abstract render(template: string, variables: Record<string, any>): string;
}
