import { z } from "zod";

export const delayDistributionTypes = {
  none: "none",
  uniform: "uniform",
  lognormal: "lognormal",
} as const;

export type DelayDistributionType = (typeof delayDistributionTypes)[keyof typeof delayDistributionTypes];

const optionalNonNegativeInteger = z.number().int("Use a whole number.").min(0, "Value must be zero or greater.").optional();

const optionalNonNegativeNumber = z.number().min(0, "Value must be zero or greater.").optional();

const optionalPositiveNumber = z.number().gt(0, "Value must be greater than zero.").optional();

export const settingsFormSchema = z
  .object({
    fixedDelay: optionalNonNegativeInteger,
    distributionType: z.union([
      z.literal(delayDistributionTypes.none),
      z.literal(delayDistributionTypes.uniform),
      z.literal(delayDistributionTypes.lognormal),
    ]),
    uniformLower: optionalNonNegativeInteger,
    uniformUpper: optionalNonNegativeInteger,
    lognormalMedian: optionalNonNegativeNumber,
    lognormalSigma: optionalPositiveNumber,
    proxyPassThrough: z.boolean(),
    badRequestMessage: z.string().max(2_000, "Message must be 2000 characters or fewer.").optional(),
  })
  .superRefine((values, context) => {
    if (values.fixedDelay !== undefined && values.distributionType !== delayDistributionTypes.none) {
      context.addIssue({
        code: "custom",
        path: ["fixedDelay"],
        message: "Choose either a fixed delay or a delay distribution.",
      });
    }

    if (values.distributionType === delayDistributionTypes.uniform) {
      if (values.uniformLower === undefined) {
        context.addIssue({
          code: "custom",
          path: ["uniformLower"],
          message: "Enter the lower bound.",
        });
      }

      if (values.uniformUpper === undefined) {
        context.addIssue({
          code: "custom",
          path: ["uniformUpper"],
          message: "Enter the upper bound.",
        });
      }

      if (
        values.uniformLower !== undefined &&
        values.uniformUpper !== undefined &&
        values.uniformLower > values.uniformUpper
      ) {
        context.addIssue({
          code: "custom",
          path: ["uniformUpper"],
          message: "Upper bound must be greater than or equal to the lower bound.",
        });
      }
    }

    if (values.distributionType === delayDistributionTypes.lognormal) {
      if (values.lognormalMedian === undefined) {
        context.addIssue({
          code: "custom",
          path: ["lognormalMedian"],
          message: "Enter the median value.",
        });
      }

      if (values.lognormalSigma === undefined) {
        context.addIssue({
          code: "custom",
          path: ["lognormalSigma"],
          message: "Enter the sigma value.",
        });
      }
    }
  });

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const defaultSettingsFormValues: SettingsFormValues = {
  fixedDelay: undefined,
  distributionType: delayDistributionTypes.none,
  uniformLower: undefined,
  uniformUpper: undefined,
  lognormalMedian: undefined,
  lognormalSigma: undefined,
  proxyPassThrough: false,
  badRequestMessage: undefined,
};
