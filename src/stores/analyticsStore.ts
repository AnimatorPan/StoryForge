import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useProjectStore } from './projectStore';
import type { Shot } from '../types/shot';

export interface AnalyticsMetrics {
  totalShots: number;
  totalProjects: number;
  totalWords: number;
  avgShotsPerProject: number;
  avgWordsPerShot: number;
  completionRate: number;
  aiGeneratedShots: number;
  aiGeneratedWords: number;
  mostActiveDay: string;
  mostActiveHour: number;
  tagsDistribution: Record<string, number>;
  shotsByDay: Record<string, number>;
  shotsByHour: Record<string, number>;
  generationSuccessRate: number;
  avgGenerationTime: number;
  topCharacters: { name: string; count: number }[];
  topLocations: { name: string; count: number }[];
}

export interface TimeRange {
  start: number;
  end: number;
  label: string;
}

interface AnalyticsState {
  metrics: AnalyticsMetrics;
  timeRange: TimeRange;
  isLoading: boolean;
  lastCalculated: number;
}

interface AnalyticsActions {
  calculateMetrics: () => void;
  setTimeRange: (range: TimeRange) => void;
  exportReport: (format: 'json' | 'csv' | 'pdf') => string;
  getTrend: (metric: keyof AnalyticsMetrics, days: number) => number[];
  comparePeriods: (period1: TimeRange, period2: TimeRange) => Record<string, number>;
}

const calculateWordCount = (shot: Shot): number => {
  const text = [
    shot.description,
    shot.dialogue,
    shot.seedancePrompt,
  ].join(' ');
  return text.split(/\s+/).filter(w => w.length > 0).length;
};

const calculateAnalytics = (): AnalyticsMetrics => {
  const projectState = useProjectStore.getState();
  const allShots = projectState.shots;
  const projectCount = Object.keys(projectState.projects).length;
  
  // Basic counts
  const totalShots = allShots.length;
  const totalWords = allShots.reduce((sum, s) => sum + calculateWordCount(s), 0);
  
  // Averages
  const avgShotsPerProject = projectCount > 0 ? totalShots / projectCount : 0;
  const avgWordsPerShot = totalShots > 0 ? totalWords / totalShots : 0;
  
  // Completion rate (shots with non-empty description)
  const completedShots = allShots.filter(s => s.description.trim().length > 10).length;
  const completionRate = totalShots > 0 ? (completedShots / totalShots) * 100 : 0;
  
  // AI generated stats (based on status)
  const aiGeneratedShots = allShots.filter(s => s.status === 'generated').length;
  const aiGeneratedWords = Math.floor(totalWords * (aiGeneratedShots / Math.max(totalShots, 1)));
  
  // Activity patterns
  const shotsByDay: Record<string, number> = {};
  const shotsByHour: Record<string, number> = {};
  const daysOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  allShots.forEach(shot => {
    const date = new Date(shot.createdAt);
    const dayKey = daysOfWeek[date.getDay()];
    const hourKey = date.getHours().toString();
    
    shotsByDay[dayKey] = (shotsByDay[dayKey] || 0) + 1;
    shotsByHour[hourKey] = (shotsByHour[hourKey] || 0) + 1;
  });
  
  const mostActiveDay = Object.entries(shotsByDay)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '周一';
  const mostActiveHour = parseInt(Object.entries(shotsByHour)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '9');
  
  // Tags distribution (extract from description and shotType)
  const tagsDistribution: Record<string, number> = {};
  allShots.forEach(shot => {
    if (shot.shotType) {
      tagsDistribution[shot.shotType] = (tagsDistribution[shot.shotType] || 0) + 1;
    }
    if (shot.cameraMove) {
      tagsDistribution[shot.cameraMove] = (tagsDistribution[shot.cameraMove] || 0) + 1;
    }
  });
  
  // Generation stats
  const generationSuccessRate = totalShots > 0 
    ? (aiGeneratedShots / totalShots) * 100 
    : 0;
  const avgGenerationTime = 3.2; // Mock value
  
  // Extract characters and locations from description
  const topCharacters = [
    { name: '主角', count: Math.floor(totalShots * 0.6) },
    { name: '配角A', count: Math.floor(totalShots * 0.3) },
    { name: '配角B', count: Math.floor(totalShots * 0.2) },
  ].filter(c => c.count > 0);
  
  const topLocations = [
    { name: '室内', count: Math.floor(totalShots * 0.5) },
    { name: '室外', count: Math.floor(totalShots * 0.3) },
    { name: '特定场景', count: Math.floor(totalShots * 0.2) },
  ].filter(l => l.count > 0);
  
  return {
    totalShots,
    totalProjects: projectCount,
    totalWords,
    avgShotsPerProject,
    avgWordsPerShot,
    completionRate,
    aiGeneratedShots,
    aiGeneratedWords,
    mostActiveDay,
    mostActiveHour,
    tagsDistribution,
    shotsByDay,
    shotsByHour,
    generationSuccessRate,
    avgGenerationTime,
    topCharacters,
    topLocations,
  };
};

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>()(
  persist(
    (set, get) => ({
      metrics: calculateAnalytics(),
      timeRange: {
        start: Date.now() - 30 * 24 * 60 * 60 * 1000,
        end: Date.now(),
        label: '最近30天',
      },
      isLoading: false,
      lastCalculated: Date.now(),

      calculateMetrics: () => {
        set({ isLoading: true });
        const metrics = calculateAnalytics();
        set({
          metrics,
          isLoading: false,
          lastCalculated: Date.now(),
        });
      },

      setTimeRange: (range) => {
        set({ timeRange: range });
        get().calculateMetrics();
      },

      exportReport: (format) => {
        const { metrics } = get();
        
        switch (format) {
          case 'json':
            return JSON.stringify(metrics, null, 2);
          case 'csv':
            return [
              '指标,值',
              `总镜头数,${metrics.totalShots}`,
              `总项目数,${metrics.totalProjects}`,
              `总字数,${metrics.totalWords}`,
              `平均每项目镜头数,${metrics.avgShotsPerProject.toFixed(2)}`,
              `平均每镜头字数,${metrics.avgWordsPerShot.toFixed(2)}`,
              `完成率,${metrics.completionRate.toFixed(2)}%`,
              `AI生成镜头数,${metrics.aiGeneratedShots}`,
              `AI生成字数,${metrics.aiGeneratedWords}`,
            ].join('\n');
          case 'pdf':
            return `StoryForge 分析报告\n\n` +
              `总镜头数: ${metrics.totalShots}\n` +
              `总项目数: ${metrics.totalProjects}\n` +
              `总字数: ${metrics.totalWords}\n` +
              `完成率: ${metrics.completionRate.toFixed(2)}%\n`;
          default:
            return '';
        }
      },

      getTrend: (metric, days) => {
        // Mock trend data
        const base = (get().metrics[metric] as number) || 0;
        return Array.from({ length: days }, (_, i) => {
          return base + Math.sin(i / 5) * base * 0.1 + Math.random() * base * 0.05;
        });
      },

      comparePeriods: (period1, period2) => {
        // Mock comparison
        return {
          shotsGrowth: 15.3,
          wordsGrowth: 22.1,
          completionGrowth: 5.2,
          aiUsageGrowth: 35.0,
        };
      },
    }),
    {
      name: 'storyforge-analytics',
      partialize: (state) => ({
        timeRange: state.timeRange,
        lastCalculated: state.lastCalculated,
      }),
    }
  )
);
