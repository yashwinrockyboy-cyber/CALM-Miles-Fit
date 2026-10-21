import { Badge, UserProfile } from '../types';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first-step',
    title: 'First Safe Step',
    description: 'Completed your first verified safe walk or cycle route in Trichy.',
    icon: '🌱',
    category: 'safety',
    unlocked: false,
    progress: 0,
    goal: 1,
    metric: 'trip'
  },
  {
    id: 'city-guardian',
    title: 'City Safe Guardian',
    description: 'Travelled safely along verified illuminated corridors in Trichy.',
    icon: '🛡️',
    category: 'safety',
    unlocked: false,
    progress: 0,
    goal: 1,
    metric: 'trip'
  },
  {
    id: 'leaderboard-winner',
    title: 'Leaderboard Champion #1',
    description: 'Ranked #1 on the Trichy Sustainable Leaderboard!',
    icon: '🏆',
    category: 'leaderboard',
    unlocked: false,
    progress: 0,
    goal: 1,
    metric: 'rank #1'
  },
  {
    id: 'green-5km',
    title: '5km Green Commuter',
    description: 'Logged 5 kilometers of zero-emission active mobility.',
    icon: '🌍',
    category: 'walk',
    unlocked: false,
    progress: 0,
    goal: 5,
    metric: 'km'
  },
  {
    id: 'carbon-hero',
    title: 'Clean Air Hero',
    description: 'Prevented over 1.0 kg of toxic CO₂ emissions from Trichy skies.',
    icon: '🍃',
    category: 'safety',
    unlocked: false,
    progress: 0,
    goal: 1,
    metric: 'kg CO₂'
  },
  {
    id: 'cycle-master',
    title: 'Trichy Cyclist Ace',
    description: 'Completed 10 kilometers of pedaling through safe, quiet streets.',
    icon: '🚲',
    category: 'cycle',
    unlocked: false,
    progress: 0,
    goal: 10,
    metric: 'km'
  },
  {
    id: 'walker-pro',
    title: 'Active Walker Pro',
    description: 'Completed 5 kilometers of walking along well-lit pedestrian corridors.',
    icon: '👟',
    category: 'walk',
    unlocked: false,
    progress: 0,
    goal: 5,
    metric: 'km'
  },
  {
    id: 'crime-shield',
    title: 'Zero-Risk Navigator',
    description: 'Completed 3 consecutive trips with 90%+ Safety Rating avoiding crime hotspots.',
    icon: '🛡️',
    category: 'safety',
    unlocked: false,
    progress: 0,
    goal: 3,
    metric: 'safe trips'
  }
];

export const DEFAULT_USER: UserProfile = {
  id: 'user-yashwin',
  name: 'Yashwin (Trichy)',
  email: 'yashwinrockyboy@gmail.com',
  schoolOrOrg: 'Trichy Safe Commuters',
  avatarSeed: 'yashwin',
  isLoggedIn: true,
  totalKmWalked: 0,
  totalKmCycled: 0,
  co2SavedKg: 0,
  caloriesBurned: 0,
  tripsCompleted: 0,
  safetyStreakDays: 1,
  badges: INITIAL_BADGES
};
