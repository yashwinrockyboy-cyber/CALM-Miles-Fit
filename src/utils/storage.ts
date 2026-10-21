import { Badge, MobilityMode, RecentRoute, UserProfile } from '../types';
import { DEFAULT_USER, INITIAL_BADGES } from '../data/badges';

export const STORAGE_USER_KEY = 'knms_safe_user_v3';
export const STORAGE_ALL_USERS_KEY = 'knms_safe_all_users_v3';
export const STORAGE_RECENT_ROUTES_KEY = 'knms_safe_routes_recent_v3';
export const STORAGE_DARK_MODE_KEY = 'knms_safe_dark_mode';
export const STORAGE_IS_LOGGED_IN_KEY = 'knms_is_logged_in';

function mergeBadges(storedBadges: Badge[]): Badge[] {
  return INITIAL_BADGES.map((initBadge) => {
    const existing = storedBadges.find((b) => b.id === initBadge.id);
    return existing ? { ...initBadge, ...existing } : { ...initBadge };
  });
}

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (raw) {
      const parsed: UserProfile = JSON.parse(raw);
      if (!parsed.badges || !Array.isArray(parsed.badges) || parsed.badges.length < INITIAL_BADGES.length) {
        parsed.badges = mergeBadges(parsed.badges || []);
      }
      return parsed;
    }
  } catch (err) {
    console.warn('Error reading user profile from localStorage:', err);
  }
  return DEFAULT_USER;
}

export function isUserSessionActive(): boolean {
  try {
    const flag = localStorage.getItem(STORAGE_IS_LOGGED_IN_KEY);
    if (flag === 'true') {
      const u = getUserProfile();
      return !!u && u.isLoggedIn;
    }
  } catch (err) {
    console.warn(err);
  }
  return false;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
    if (profile.isLoggedIn) {
      localStorage.setItem(STORAGE_IS_LOGGED_IN_KEY, 'true');
    }
    upsertRegisteredUser(profile);
  } catch (err) {
    console.warn('Error saving user profile:', err);
  }
}

export function getAllRegisteredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_ALL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading all users:', err);
  }
  return [getUserProfile()];
}

export function upsertRegisteredUser(user: UserProfile): void {
  try {
    const all = getAllRegisteredUsers();
    const idx = all.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx === -1) {
      all.push(user);
    } else {
      all[idx] = { ...all[idx], ...user };
    }
    localStorage.setItem(STORAGE_ALL_USERS_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('Error updating registered user list:', err);
  }
}

export function signUpUserWithPassword(params: {
  name: string;
  email: string;
  password: string;
  schoolOrOrg?: string;
}): { success: boolean; user?: UserProfile; error?: string } {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanPassword = params.password.trim();
  const cleanName = params.name.trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters long.' };
  }
  if (!cleanName) {
    return { success: false, error: 'Please enter your name.' };
  }

  const all = getAllRegisteredUsers();
  const existing = all.find((u) => u.email.toLowerCase() === cleanEmail);

  if (existing && existing.password) {
    return {
      success: false,
      error: 'An account with this email already exists. Please Sign In instead.'
    };
  }

  const newUser: UserProfile = {
    id: existing ? existing.id : `user-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    authProvider: 'password',
    schoolOrOrg: params.schoolOrOrg?.trim() || 'Trichy Resident / Commuter',
    avatarSeed: cleanEmail.split('@')[0],
    isLoggedIn: true,
    totalKmWalked: existing ? existing.totalKmWalked : 0,
    totalKmCycled: existing ? existing.totalKmCycled : 0,
    co2SavedKg: existing ? existing.co2SavedKg : 0,
    caloriesBurned: existing ? existing.caloriesBurned : 0,
    tripsCompleted: existing ? existing.tripsCompleted : 0,
    safetyStreakDays: 1,
    badges: existing && existing.badges ? existing.badges : INITIAL_BADGES
  };

  saveUserProfile(newUser);
  localStorage.setItem(STORAGE_IS_LOGGED_IN_KEY, 'true');
  return { success: true, user: newUser };
}

export function signInUserWithPassword(
  email: string,
  password: string
): { success: boolean; user?: UserProfile; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!cleanPassword) {
    return { success: false, error: 'Please enter your password.' };
  }

  const all = getAllRegisteredUsers();
  const existing = all.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!existing) {
    return {
      success: false,
      error: 'No account found with this email. Please Create an Account first.'
    };
  }

  if (existing.password && existing.password !== cleanPassword) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  const loggedIn: UserProfile = {
    ...existing,
    password: existing.password || cleanPassword,
    authProvider: 'password',
    isLoggedIn: true
  };

  saveUserProfile(loggedIn);
  localStorage.setItem(STORAGE_IS_LOGGED_IN_KEY, 'true');
  return { success: true, user: loggedIn };
}

export function signInWithGoogleAccount(
  email?: string,
  name?: string
): UserProfile {
  const cleanEmail = (email || 'yashwinrockyboy@gmail.com').trim().toLowerCase();
  const cleanName = name?.trim() || cleanEmail.split('@')[0];
  const all = getAllRegisteredUsers();
  const existing = all.find((u) => u.email.toLowerCase() === cleanEmail);

  let profile: UserProfile;
  if (existing) {
    profile = {
      ...existing,
      name: cleanName || existing.name,
      isLoggedIn: true,
      authProvider: 'google'
    };
  } else {
    profile = {
      id: `user-google-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      authProvider: 'google',
      schoolOrOrg: 'Trichy Commuter / Resident',
      avatarSeed: cleanEmail.split('@')[0],
      isLoggedIn: true,
      totalKmWalked: 0,
      totalKmCycled: 0,
      co2SavedKg: 0,
      caloriesBurned: 0,
      tripsCompleted: 0,
      safetyStreakDays: 1,
      badges: INITIAL_BADGES
    };
  }

  saveUserProfile(profile);
  localStorage.setItem(STORAGE_IS_LOGGED_IN_KEY, 'true');
  return profile;
}

export function signOutActiveUser(): void {
  const current = getUserProfile();
  const loggedOut: UserProfile = {
    ...current,
    isLoggedIn: false
  };
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedOut));
  localStorage.removeItem(STORAGE_IS_LOGGED_IN_KEY);
  upsertRegisteredUser(loggedOut);
}

export function evaluateBadges(
  profile: UserProfile,
  isRankOneWinner: boolean = false
): { updatedProfile: UserProfile; newlyUnlocked: Badge[] } {
  const newlyUnlocked: Badge[] = [];
  const updatedBadges = profile.badges.map((b) => {
    let progress = b.progress;
    let unlocked = b.unlocked;

    switch (b.id) {
      case 'first-step':
        progress = profile.tripsCompleted;
        if (profile.tripsCompleted >= 1) unlocked = true;
        break;
      case 'city-guardian':
      case 'knms-guardian':
        progress = profile.tripsCompleted >= 1 ? 1 : 0;
        if (profile.tripsCompleted >= 1) unlocked = true;
        break;
      case 'leaderboard-winner':
        progress = isRankOneWinner ? 1 : 0;
        if (isRankOneWinner) unlocked = true;
        break;
      case 'green-5km':
        progress = Math.round((profile.totalKmWalked + profile.totalKmCycled) * 10) / 10;
        if (progress >= 5) unlocked = true;
        break;
      case 'carbon-hero':
        progress = profile.co2SavedKg;
        if (profile.co2SavedKg >= 1) unlocked = true;
        break;
      case 'cycle-master':
        progress = profile.totalKmCycled;
        if (profile.totalKmCycled >= 10) unlocked = true;
        break;
      case 'walker-pro':
        progress = profile.totalKmWalked;
        if (profile.totalKmWalked >= 5) unlocked = true;
        break;
      case 'crime-shield':
        progress = Math.min(3, profile.tripsCompleted);
        if (profile.tripsCompleted >= 3) unlocked = true;
        break;
    }

    if (!b.unlocked && unlocked) {
      const nowStr = new Date().toISOString().split('T')[0];
      const newly: Badge = {
        ...b,
        unlocked: true,
        unlockedAt: nowStr,
        progress: Math.min(b.goal, progress)
      };
      newlyUnlocked.push(newly);
      return newly;
    }

    return {
      ...b,
      progress: Math.min(b.goal, progress)
    };
  });

  const updatedProfile: UserProfile = {
    ...profile,
    badges: updatedBadges
  };

  saveUserProfile(updatedProfile);
  return { updatedProfile, newlyUnlocked };
}

export function logCompletedTrip(
  distanceKm: number,
  vehicle: MobilityMode
): { updatedProfile: UserProfile; newlyUnlocked: Badge[]; isWinner?: boolean } {
  const current = getUserProfile();
  const isCycle = vehicle === 'cycle';
  const co2 = Math.round(distanceKm * 0.16 * 10) / 10;
  const cal = Math.round(distanceKm * (isCycle ? 40 : 65));

  const totalCycled = isCycle
    ? Math.round((current.totalKmCycled + distanceKm) * 10) / 10
    : current.totalKmCycled;
  const totalWalked = isCycle
    ? current.totalKmWalked
    : Math.round((current.totalKmWalked + distanceKm) * 10) / 10;

  const updated: UserProfile = {
    ...current,
    totalKmCycled: totalCycled,
    totalKmWalked: totalWalked,
    co2SavedKg: Math.round((current.co2SavedKg + co2) * 10) / 10,
    caloriesBurned: current.caloriesBurned + cal,
    tripsCompleted: current.tripsCompleted + 1,
    safetyStreakDays: current.safetyStreakDays + 1
  };

  saveUserProfile(updated);

  // Update monthly stats for active month
  recordMonthlyTrip(distanceKm, vehicle, co2, cal);

  const activeMonthStandings = getMonthlyLeaderboardStandings(vehicle, '2026-10');
  const isWinner = activeMonthStandings.length > 0 && activeMonthStandings[0].isCurrentUser;

  const result = evaluateBadges(updated, isWinner);
  return {
    ...result,
    isWinner
  };
}

export interface MonthConfig {
  key: string;
  name: string;
  shortName: string;
  isActive: boolean;
  daysRemaining: number;
}

export const MONTH_CONFIGS: MonthConfig[] = [
  {
    key: '2026-10',
    name: 'October 2026',
    shortName: 'Oct 2026',
    isActive: true,
    daysRemaining: 10
  },
  {
    key: '2026-09',
    name: 'September 2026',
    shortName: 'Sep 2026',
    isActive: false,
    daysRemaining: 0
  },
  {
    key: '2026-08',
    name: 'August 2026',
    shortName: 'Aug 2026',
    isActive: false,
    daysRemaining: 0
  }
];

export interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  schoolOrOrg: string;
  avatarSeed: string;
  distanceKm: number;
  co2SavedKg: number;
  caloriesBurned: number;
  tripsCount: number;
  isCurrentUser: boolean;
  rank: number;
  monthKey?: string;
}

const STORAGE_MONTHLY_KEY_PREFIX = 'calm_monthly_standings_';

function getMonthlyUserData(monthKey: string): { distanceCycle: number; distanceWalk: number; co2: number; cal: number; trips: number } {
  try {
    const raw = localStorage.getItem(`${STORAGE_MONTHLY_KEY_PREFIX}${monthKey}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { distanceCycle: 0, distanceWalk: 0, co2: 0, cal: 0, trips: 0 };
}

function recordMonthlyTrip(distKm: number, vehicle: MobilityMode, co2: number, cal: number) {
  const current = getMonthlyUserData('2026-10');
  const updated = {
    distanceCycle: vehicle === 'cycle' ? Math.round((current.distanceCycle + distKm) * 10) / 10 : current.distanceCycle,
    distanceWalk: vehicle === 'walk' ? Math.round((current.distanceWalk + distKm) * 10) / 10 : current.distanceWalk,
    co2: Math.round((current.co2 + co2) * 10) / 10,
    cal: current.cal + cal,
    trips: current.trips + 1
  };
  try {
    localStorage.setItem(`${STORAGE_MONTHLY_KEY_PREFIX}2026-10`, JSON.stringify(updated));
  } catch {}
}

export function boostUserMonthlyStats(distKm: number, vehicle: MobilityMode): void {
  const co2 = Math.round(distKm * 0.16 * 10) / 10;
  const cal = Math.round(distKm * (vehicle === 'cycle' ? 40 : 65));
  recordMonthlyTrip(distKm, vehicle, co2, cal);

  const u = getUserProfile();
  const updated: UserProfile = {
    ...u,
    totalKmCycled: vehicle === 'cycle' ? Math.round((u.totalKmCycled + distKm) * 10) / 10 : u.totalKmCycled,
    totalKmWalked: vehicle === 'walk' ? Math.round((u.totalKmWalked + distKm) * 10) / 10 : u.totalKmWalked,
    co2SavedKg: Math.round((u.co2SavedKg + co2) * 10) / 10,
    caloriesBurned: u.caloriesBurned + cal,
    tripsCompleted: u.tripsCompleted + 1
  };
  saveUserProfile(updated);
}

export function getMonthlyLeaderboardStandings(
  vehicle: MobilityMode,
  monthKey: string = '2026-10'
): LeaderboardEntry[] {
  const currentUser = getUserProfile();
  const isCycle = vehicle === 'cycle';

  if (monthKey === '2026-10') {
    // Current Active Month
    const userMonth = getMonthlyUserData('2026-10');
    const userDist = isCycle
      ? Math.max(userMonth.distanceCycle, currentUser.totalKmCycled > 0 ? currentUser.totalKmCycled : 0)
      : Math.max(userMonth.distanceWalk, currentUser.totalKmWalked > 0 ? currentUser.totalKmWalked : 0);

    const userCo2 = Math.max(userMonth.co2, currentUser.co2SavedKg);
    const userCal = Math.max(userMonth.cal, currentUser.caloriesBurned);
    const userTrips = Math.max(userMonth.trips, currentUser.tripsCompleted);

    const entries: LeaderboardEntry[] = [
      {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        schoolOrOrg: currentUser.schoolOrOrg || 'Trichy Commuter',
        avatarSeed: currentUser.avatarSeed,
        distanceKm: userDist,
        co2SavedKg: userCo2,
        caloriesBurned: userCal,
        tripsCount: userTrips,
        isCurrentUser: true,
        rank: 1,
        monthKey: '2026-10'
      },
      {
        id: 'user-priya-oct',
        name: 'Priya Sundaram',
        email: 'priya.s@trichycommute.org',
        schoolOrOrg: 'Cantonment Cyclists',
        avatarSeed: 'priya',
        distanceKm: isCycle ? 28.4 : 14.2,
        co2SavedKg: isCycle ? 4.5 : 2.2,
        caloriesBurned: isCycle ? 1130 : 920,
        tripsCount: 9,
        isCurrentUser: false,
        rank: 2,
        monthKey: '2026-10'
      },
      {
        id: 'user-arun-oct',
        name: 'Arun Kumar',
        email: 'arunkumar@thillainagar.in',
        schoolOrOrg: 'Thillai Nagar Pedestrians',
        avatarSeed: 'arun',
        distanceKm: isCycle ? 22.0 : 12.5,
        co2SavedKg: isCycle ? 3.5 : 2.0,
        caloriesBurned: isCycle ? 880 : 810,
        tripsCount: 7,
        isCurrentUser: false,
        rank: 3,
        monthKey: '2026-10'
      },
      {
        id: 'user-kavitha-oct',
        name: 'Kavitha Raj',
        email: 'kavitha.raj@srirangam.edu',
        schoolOrOrg: 'Srirangam Green Walkers',
        avatarSeed: 'kavitha',
        distanceKm: isCycle ? 17.5 : 9.8,
        co2SavedKg: isCycle ? 2.8 : 1.5,
        caloriesBurned: isCycle ? 700 : 640,
        tripsCount: 5,
        isCurrentUser: false,
        rank: 4,
        monthKey: '2026-10'
      },
      {
        id: 'user-karthik-oct',
        name: 'Karthik Raja',
        email: 'karthik.r@tpj-commute.com',
        schoolOrOrg: 'Junction Commuter Club',
        avatarSeed: 'karthik',
        distanceKm: isCycle ? 12.2 : 7.0,
        co2SavedKg: isCycle ? 1.9 : 1.1,
        caloriesBurned: isCycle ? 490 : 455,
        tripsCount: 4,
        isCurrentUser: false,
        rank: 5,
        monthKey: '2026-10'
      }
    ];

    entries.sort((a, b) => b.distanceKm - a.distanceKm || b.tripsCount - a.tripsCount);
    return entries.map((e, idx) => ({ ...e, rank: idx + 1 }));
  }

  if (monthKey === '2026-09') {
    // September 2026 Archived Season
    const entries: LeaderboardEntry[] = [
      {
        id: 'sep-winner',
        name: currentUser.name || 'Yashwin (Trichy)',
        email: currentUser.email,
        schoolOrOrg: currentUser.schoolOrOrg || 'Trichy Safe Commuters',
        avatarSeed: currentUser.avatarSeed,
        distanceKm: isCycle ? 48.6 : 26.4,
        co2SavedKg: isCycle ? 7.8 : 4.2,
        caloriesBurned: isCycle ? 1940 : 1716,
        tripsCount: 16,
        isCurrentUser: true,
        rank: 1,
        monthKey: '2026-09'
      },
      {
        id: 'sep-2',
        name: 'Priya Sundaram',
        email: 'priya.s@trichycommute.org',
        schoolOrOrg: 'Cantonment Cyclists',
        avatarSeed: 'priya',
        distanceKm: isCycle ? 44.2 : 23.0,
        co2SavedKg: isCycle ? 7.0 : 3.7,
        caloriesBurned: isCycle ? 1768 : 1495,
        tripsCount: 14,
        isCurrentUser: false,
        rank: 2,
        monthKey: '2026-09'
      },
      {
        id: 'sep-3',
        name: 'Selvan Natarajan',
        email: 'selvan@trichy.gov.in',
        schoolOrOrg: 'City Hall Runners',
        avatarSeed: 'selvan',
        distanceKm: isCycle ? 38.0 : 19.5,
        co2SavedKg: isCycle ? 6.1 : 3.1,
        caloriesBurned: isCycle ? 1520 : 1267,
        tripsCount: 12,
        isCurrentUser: false,
        rank: 3,
        monthKey: '2026-09'
      },
      {
        id: 'sep-4',
        name: 'Deepika Mohan',
        email: 'deepika@srirangam.org',
        schoolOrOrg: 'Srirangam Island Striders',
        avatarSeed: 'deepika',
        distanceKm: isCycle ? 31.5 : 16.0,
        co2SavedKg: isCycle ? 5.0 : 2.5,
        caloriesBurned: isCycle ? 1260 : 1040,
        tripsCount: 10,
        isCurrentUser: false,
        rank: 4,
        monthKey: '2026-09'
      }
    ];

    entries.sort((a, b) => b.distanceKm - a.distanceKm);
    return entries.map((e, idx) => ({ ...e, rank: idx + 1 }));
  }

  // August 2026 Archived Season
  const entries: LeaderboardEntry[] = [
    {
      id: 'aug-1',
      name: 'Dr. Ramesh Babu',
      email: 'ramesh.gh@trichy.org',
      schoolOrOrg: 'GH Medical Commuters',
      avatarSeed: 'ramesh',
      distanceKm: isCycle ? 52.0 : 28.0,
      co2SavedKg: isCycle ? 8.3 : 4.5,
      caloriesBurned: isCycle ? 2080 : 1820,
      tripsCount: 18,
      isCurrentUser: false,
      rank: 1,
      monthKey: '2026-08'
    },
    {
      id: 'aug-2',
      name: currentUser.name || 'Yashwin (Trichy)',
      email: currentUser.email,
      schoolOrOrg: currentUser.schoolOrOrg || 'Trichy Safe Commuters',
      avatarSeed: currentUser.avatarSeed,
      distanceKm: isCycle ? 46.5 : 24.2,
      co2SavedKg: isCycle ? 7.4 : 3.9,
      caloriesBurned: isCycle ? 1860 : 1573,
      tripsCount: 15,
      isCurrentUser: true,
      rank: 2,
      monthKey: '2026-08'
    },
    {
      id: 'aug-3',
      name: 'Ananya Krishnan',
      email: 'ananya@cantonment.org',
      schoolOrOrg: 'Cantonment Riders',
      avatarSeed: 'ananya',
      distanceKm: isCycle ? 39.0 : 20.1,
      co2SavedKg: isCycle ? 6.2 : 3.2,
      caloriesBurned: isCycle ? 1560 : 1306,
      tripsCount: 13,
      isCurrentUser: false,
      rank: 3,
      monthKey: '2026-08'
    }
  ];

  entries.sort((a, b) => b.distanceKm - a.distanceKm);
  return entries.map((e, idx) => ({ ...e, rank: idx + 1 }));
}

export function getLeaderboardStandings(vehicle: MobilityMode): LeaderboardEntry[] {
  return getMonthlyLeaderboardStandings(vehicle, '2026-10');
}

export function getRecentRoutes(): RecentRoute[] {
  try {
    const raw = localStorage.getItem(STORAGE_RECENT_ROUTES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, 5);
    }
  } catch (err) {
    console.warn('Error reading recent routes:', err);
  }
  return [];
}

export function saveRecentRoute(route: RecentRoute): RecentRoute[] {
  const current = getRecentRoutes().filter(
    (r) => r.from.name !== route.from.name || r.to.name !== route.to.name || r.vehicle !== route.vehicle
  );
  const updated = [route, ...current].slice(0, 5);
  try {
    localStorage.setItem(STORAGE_RECENT_ROUTES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save recent route:', err);
  }
  return updated;
}

export function clearRecentRoutes(): void {
  try {
    localStorage.removeItem(STORAGE_RECENT_ROUTES_KEY);
  } catch (err) {
    console.warn('Error clearing recent routes:', err);
  }
}
