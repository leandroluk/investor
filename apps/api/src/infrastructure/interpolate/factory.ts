// infrastructure/interpolate/factory.ts
import {factory, Factory} from '@/core/di';
import {Renderer} from '@/port';
import {InterpolateMustacheResolver} from './mustache/resolver';

export enum InterpolateProvider {
  MUSTACHE = 'mustache',
}

@factory(Renderer, (process.env.API_INTERPOLATE_PROVIDER ?? InterpolateProvider.MUSTACHE) as InterpolateProvider, {
  [InterpolateProvider.MUSTACHE]: InterpolateMustacheResolver,
})
export class InterpolateFactory extends Factory<Renderer, InterpolateProvider> {}
