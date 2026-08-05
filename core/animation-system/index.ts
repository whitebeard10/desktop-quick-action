export const springPresets = {
  snappy: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
    mass: 0.8,
  },
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 20,
  },
  smooth: {
    type: 'spring',
    stiffness: 300,
    damping: 28,
  },
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  },
};

export const easeCurves = {
  windowsEaseOut: [0, 0, 0, 1],
  fluentAccelerate: [0.7, 0, 1, 0.5],
  fluentDecelerate: [0.1, 0.9, 0.2, 1.0],
};

export const durationStandards = {
  instantMs: 150,
  normalMs: 200,
  deliberateMs: 250,
};
