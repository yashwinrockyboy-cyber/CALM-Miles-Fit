export type MobilityMode = 'cycle' | 'walk';

export interface Landmark {
  name: string;
  displayName?: string;
  lat: number;
  lon: number;
  category: string;
  description?: string;
  colorTheme?: string;
}

export interface CrimeZone {
  name: string;
  reason: string;
  lat: number;
  lon: number;
  radiusMeters: number;
}

export interface Building3D {
  id: string;
  name?: string;
  type?: string;
  height: number;
  color: string;
  roofColor: string;
  footprint: [number, number][];
}

export interface SafeHub {
  id: string;
  name: string;
  type: 'school_safe_zone' | 'police' | 'hospital' | 'lit_corridor';
  lat: number;
  lon: number;
  address: string;
  description: string;
  phone?: string;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  type: string;
  modifier?: string;
  name: string;
  lat?: number;
  lon?: number;
}

export interface SafetyProfile {
  safetyScore: number;
  litStreetsPercent: number;
  crimeRiskLevel: 'Very Low' | 'Low' | 'Moderate' | 'High';
  hasCCTVCoverage: boolean;
  policePatrolCount: number;
  safetyHighlights: string[];
  trafficExposure: string;
}

export interface RouteOption {
  id: string;
  distanceMeters: number;
  durationSeconds: number;
  distanceKm: number;
  durationMinutes: number;
  geometry: [number, number][];
  steps: RouteStep[];
  summary: string;
  isShortest: boolean;
  isSafest: boolean;
  safetyProfile: SafetyProfile;
  co2SavedKg: number;
  caloriesBurned: number;
}

export interface VehicleComparison {
  vehicle: MobilityMode;
  label: string;
  distanceKm: number;
  durationMinutes: number;
  speedKmH: number;
  co2SavedKg: number;
  caloriesBurned: number;
  safetyRating: string;
  note: string;
  isLiveUpdated?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'safety' | 'leaderboard' | 'cycle' | 'walk';
  unlocked: boolean;
  progress: number;
  goal: number;
  metric: string;
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  schoolOrOrg: string;
  avatarSeed: string;
  isLoggedIn: boolean;
  totalKmWalked: number;
  totalKmCycled: number;
  co2SavedKg: number;
  caloriesBurned: number;
  tripsCompleted: number;
  safetyStreakDays: number;
  badges: Badge[];
  password?: string;
  authProvider?: 'password' | 'google' | 'guest';
}

export interface RecentRoute {
  id: string;
  from: Landmark;
  to: Landmark;
  vehicle: MobilityMode;
  timestamp: number;
  distanceKm: number;
  durationMinutes: number;
  safetyScore: number;
}

export interface CustomRoutePlan {
  targetCalories: number;
  targetDistanceKm: number;
  vehicle: MobilityMode;
  startPoint: Landmark;
  endPoint: Landmark;
  waypoints: {
    name: string;
    description: string;
    lat: number;
    lon: number;
  }[];
  routeOption: RouteOption;
  narrativeText: string;
  spokenNarrative: string;
  loopType: 'loop' | 'point_to_point';
}

export interface LiveLocation {
  lat: number;
  lon: number;
  accuracy?: number;
}

export interface NavProgress {
  remainingKm: number;
  remainingMinutes: number;
  distanceTraveledKm: number;
  currentPos: [number, number];
}
