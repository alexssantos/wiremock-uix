export type UniformDelayDistribution = {
  type: "uniform";
  lower: number;
  upper: number;
};

export type LognormalDelayDistribution = {
  type: "lognormal";
  median: number;
  sigma: number;
};

export type DelayDistribution = UniformDelayDistribution | LognormalDelayDistribution;

export type GlobalSettings = {
  fixedDelay?: number;
  delayDistribution?: DelayDistribution;
  proxyPassThrough?: boolean;
  badRequestMessage?: string;
  badRequestBodyPattern?: unknown;
  extended?: Record<string, unknown>;
};
