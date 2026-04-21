# AI-Game-Animation-Prompt-Tool / 灵境

AI 游戏动画提示词生成工具 - React 版本

## ✨ 功能特性

- 🎬 **分镜管理**: 创建、编辑、排序分镜脚本
- 🤖 **AI 文本生成**: 支持 8+ 家 AI 提供商
- 🖼️ **图片生成**: 集成 T8Star、火山引擎、Gemini 等
- 🎨 **导演风格**: 15 种预设视觉风格
- 📊 **导入导出**: Excel、TXT 格式支持
- 💾 **数据持久化**: LocalStorage 自动保存

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

## 📁 项目结构

```
src/
├── components/     # UI 组件
├── hooks/          # 自定义 Hooks
├── stores/         # Zustand 状态管理
├── types/          # TypeScript 类型
├── utils/          # 工具函数
├── constants/      # 常量配置
├── App.tsx
└── main.tsx
```

## 🔧 支持的 AI 提供商

### 文本生成
- 通义千问 (阿里云)
- 豆包 (火山引擎)
- DeepSeek
- Gemini (Google)
- OpenAI
- Kimi (月之暗面)
- 智谱 AI
- 自定义 OpenAI 兼容接口

### 图片生成
- T8Star
- 火山引擎
- Gemini
- 豆包

## 📝 使用说明

1. 在"AI 设置"中配置 API Key
2. 在"分镜脚本"中添加分镜
3. 填写画面描述、光影氛围等信息
4. 点击生成 SEEDANCE 提示词
5. 在"图片生成"中生成参考图

## 📄 许可证

MIT

---

作者: 无声铃鹿
版本: 7.0.0
