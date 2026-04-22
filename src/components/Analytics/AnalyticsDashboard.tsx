import React, { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  Users,
  MapPin,
  Tag,
  Calendar,
  Download,
  RefreshCw,
  Target,
  Sparkles,
  FileText,
  Folder,
  Activity,
} from 'lucide-react';

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  color: string;
}> = ({ title, value, subtitle, icon: Icon, trend, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`mt-3 flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
        <span>{trend >= 0 ? '+' : ''}{trend.toFixed(1)}%</span>
        <span className="text-gray-400">vs 上期</span>
      </div>
    )}
  </div>
);

const SimpleBarChart: React.FC<{
  data: Record<string, number>;
  maxBars?: number;
}> = ({ data, maxBars = 7 }) => {
  const entries = Object.entries(data).slice(0, maxBars);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  
  return (
    <div className="flex items-end gap-2 h-32">
      {entries.map(([key, value]) => (
        <div key={key} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
            style={{ height: `${(value / max) * 100}%` }}
          />
          <span className="text-xs text-gray-500">{key}</span>
        </div>
      ))}
    </div>
  );
};

const TagCloud: React.FC<{
  tags: Record<string, number>;
}> = ({ tags }) => {
  const max = Math.max(...Object.values(tags), 1);
  
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(tags).map(([tag, count]) => {
        const size = 0.8 + (count / max) * 0.5;
        const opacity = 0.5 + (count / max) * 0.5;
        return (
          <span
            key={tag}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full transition-all hover:bg-blue-200"
            style={{ fontSize: `${size}rem`, opacity }}
          >
            {tag} ({count})
          </span>
        );
      })}
    </div>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  const analytics = useAnalyticsStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    analytics.calculateMetrics();
  }, [selectedPeriod]);

  const { metrics } = analytics;

  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    const content = analytics.exportReport(format);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyforge-analytics.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
              <p className="text-gray-500">洞察您的创作习惯和效率</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="90d">最近90天</option>
              <option value="1y">最近1年</option>
            </select>
            <button
              onClick={() => analytics.calculateMetrics()}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="刷新数据"
            >
              <RefreshCw className={`w-5 h-5 ${analytics.isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative group">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                导出报告
              </button>
              <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg py-2 hidden group-hover:block z-10 min-w-[120px]">
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="总镜头数"
            value={metrics.totalShots}
            subtitle={`${metrics.avgShotsPerProject.toFixed(1)} 镜头/项目`}
            icon={Target}
            trend={15.3}
            color="bg-blue-500"
          />
          <MetricCard
            title="总字数"
            value={metrics.totalWords.toLocaleString()}
            subtitle={`${metrics.avgWordsPerShot.toFixed(0)} 字/镜头`}
            icon={FileText}
            trend={22.1}
            color="bg-green-500"
          />
          <MetricCard
            title="完成率"
            value={`${metrics.completionRate.toFixed(1)}%`}
            subtitle={`${metrics.aiGeneratedShots} AI 生成`}
            icon={Activity}
            trend={5.2}
            color="bg-purple-500"
          />
          <MetricCard
            title="AI 生成占比"
            value={`${((metrics.aiGeneratedWords / Math.max(metrics.totalWords, 1)) * 100).toFixed(1)}%`}
            subtitle={`${metrics.generationSuccessRate}% 成功率`}
            icon={Sparkles}
            trend={35.0}
            color="bg-orange-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity by Day */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                创作活跃度（按星期）
              </h3>
              <span className="text-sm text-gray-500">最活跃: {metrics.mostActiveDay}</span>
            </div>
            <SimpleBarChart data={metrics.shotsByDay} />
          </div>

          {/* Activity by Hour */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                创作时段分布
              </h3>
              <span className="text-sm text-gray-500">高峰: {metrics.mostActiveHour}:00</span>
            </div>
            <SimpleBarChart 
              data={Object.fromEntries(
                Object.entries(metrics.shotsByHour).slice(8, 18)
              )} 
            />
          </div>
        </div>

        {/* Tags and Top Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tags Cloud */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-500" />
              标签分布
            </h3>
            <TagCloud tags={metrics.tagsDistribution} />
          </div>

          {/* Top Characters & Locations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  热门角色
                </h3>
                <div className="space-y-2">
                  {metrics.topCharacters.map((char, i) => (
                    <div key={char.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{i + 1}. {char.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${(char.count / metrics.totalShots) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{char.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-500" />
                  常用场景
                </h3>
                <div className="space-y-2">
                  {metrics.topLocations.map((loc, i) => (
                    <div key={loc.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{i + 1}. {loc.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${(loc.count / metrics.totalShots) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{loc.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            AI 生成性能
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">{metrics.generationSuccessRate}%</p>
              <p className="text-sm text-gray-500">成功率</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">{metrics.avgGenerationTime}s</p>
              <p className="text-sm text-gray-500">平均生成时间</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">{metrics.aiGeneratedWords.toLocaleString()}</p>
              <p className="text-sm text-gray-500">AI 生成字数</p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-center text-sm text-gray-400 mt-8">
          最后更新: {new Date(analytics.lastCalculated).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
