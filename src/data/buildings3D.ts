import { Building3D } from '../types';

export const STATIC_3D_BUILDINGS: Building3D[] = [
  {
    id: 'cantonment-safe-hub',
    name: 'Cantonment Pedestrian Hub & Emergency Access',
    type: 'school',
    height: 24,
    color: '#e0e7ff',
    roofColor: '#1e3a8a',
    footprint: [
      [10.8042, 78.6714],
      [10.8042, 78.6724],
      [10.8034, 78.6724],
      [10.8034, 78.6714]
    ]
  },
  {
    id: 'cantonment-green-park',
    name: 'Cantonment Public Park & Fitness Trail Ground',
    type: 'school',
    height: 10,
    color: '#fee2e2',
    roofColor: '#be123c',
    footprint: [
      [10.8033, 78.6715],
      [10.8033, 78.6722],
      [10.8028, 78.6722],
      [10.8028, 78.6715]
    ]
  },
  {
    id: 'rockfort-citadel-base',
    name: 'Rockfort Rock Citadel Base',
    type: 'temple',
    height: 45,
    color: '#78716c',
    roofColor: '#57534e',
    footprint: [
      [10.8282, 78.6968],
      [10.8282, 78.698],
      [10.827, 78.698],
      [10.827, 78.6968]
    ]
  },
  {
    id: 'rockfort-summit-temple',
    name: 'Ucchi Pillayar Summit Shrine',
    type: 'temple',
    height: 65,
    color: '#fbbf24',
    roofColor: '#b45309',
    footprint: [
      [10.8278, 78.6972],
      [10.8278, 78.6976],
      [10.8274, 78.6976],
      [10.8274, 78.6972]
    ]
  },
  {
    id: 'srirangam-rajagopuram',
    name: 'Srirangam Temple Rajagopuram Tower',
    type: 'temple',
    height: 72,
    color: '#f97316',
    roofColor: '#c2410c',
    footprint: [
      [10.8628, 78.6898],
      [10.8628, 78.6904],
      [10.862, 78.6904],
      [10.862, 78.6898]
    ]
  },
  {
    id: 'central-bus-stand-terminal',
    name: 'Central Bus Stand Main Concourse',
    type: 'station',
    height: 16,
    color: '#e2e8f0',
    roofColor: '#1e3a8a',
    footprint: [
      [10.7956, 78.683],
      [10.7956, 78.6842],
      [10.7948, 78.6842],
      [10.7948, 78.683]
    ]
  },
  {
    id: 'trichy-junction-station',
    name: 'Tiruchchirappalli Junction Heritage Building',
    type: 'station',
    height: 22,
    color: '#fecaca',
    roofColor: '#be123c',
    footprint: [
      [10.7937, 78.6846],
      [10.7937, 78.686],
      [10.7929, 78.686],
      [10.7929, 78.6846]
    ]
  },
  {
    id: 'thillai-nagar-block-1',
    name: 'Thillai Nagar Main Commercial Plaza',
    type: 'commercial',
    height: 20,
    color: '#f1f5f9',
    roofColor: '#334155',
    footprint: [
      [10.8202, 78.6798],
      [10.8202, 78.681],
      [10.8192, 78.681],
      [10.8192, 78.6798]
    ]
  }
];

export function generateCorridor3DBuildings(routeGeometry?: [number, number][]): Building3D[] {
  if (!routeGeometry || routeGeometry.length < 2) {
    return STATIC_3D_BUILDINGS;
  }
  const result: Building3D[] = [...STATIC_3D_BUILDINGS];
  const step = Math.max(2, Math.floor(routeGeometry.length / 25));

  for (let r = 1; r < routeGeometry.length - 1; r += step) {
    const curr = routeGeometry[r];
    const next = routeGeometry[r + 1] || curr;
    const dy = next[0] - curr[0];
    const dx = next[1] - curr[1];
    const len = Math.sqrt(dy * dy + dx * dx) || 0.001;
    const normalY = -dx / len;
    const normalX = dy / len;

    [-1, 1].forEach((side, i) => {
      const offsetDist = 0.00035 + (i === 0 ? 0.00005 : 0.0001);
      const centerY = curr[0] + normalY * offsetDist * side;
      const centerX = curr[1] + normalX * offsetDist * side;
      const halfSize = 0.00022;
      const bHeight = 12 + ((r * 7 + i * 11) % 18);
      const wallColors = ['#f1f5f9', '#fef3c7', '#e2e8f0', '#fee2e2'];
      const roofColors = ['#1e3a8a', '#be123c', '#d97706', '#059669'];
      const colorIndex = (r + i) % wallColors.length;

      result.push({
        id: `corridor-bldg-${r}-${side}`,
        height: bHeight,
        color: wallColors[colorIndex],
        roofColor: roofColors[colorIndex],
        footprint: [
          [centerY - halfSize, centerX - halfSize],
          [centerY - halfSize, centerX + halfSize],
          [centerY + halfSize, centerX + halfSize],
          [centerY + halfSize, centerX - halfSize]
        ]
      });
    });
  }

  return result;
}
