import { useCallback } from 'react';

interface PromptCompressionOptions {
  maxLength?: number;
  preserveKeywords?: boolean;
  removePunctuation?: boolean;
}

// 即梦字数限制常量
export const JIMENG_LIMITS = {
  MAX_CHARS: 200,      // 即梦最大字符数
  RECOMMENDED: 150,    // 推荐字符数
  SAFE_LIMIT: 180,     // 安全上限
};

// 压缩提示词 - 智能精简以适应即梦字数限制
export function compressPrompt(
  prompt: string,
  options: PromptCompressionOptions = {}
): string {
  const { maxLength = JIMENG_LIMITS.MAX_CHARS, preserveKeywords = true } = options;
  
  if (!prompt || prompt.length <= maxLength) {
    return prompt;
  }

  let compressed = prompt;

  // 步骤 1: 移除多余的空格
  compressed = compressed.replace(/\s+/g, ' ').trim();
  
  // 步骤 2: 移除常见的冗余词汇
  const redundantWords = [
    '非常', '特别', '十分', '极其', '相当',
    '可以', '能够', '应该', '需要',
    '一个', '一种', '一些',
    '看起来', '看上去', '显得',
    '完美的', '绝佳的', '极好的',
  ];
  
  for (const word of redundantWords) {
    compressed = compressed.replace(new RegExp(word, 'g'), '');
  }

  // 步骤 3: 简化常见描述
  const simplifications: Record<string, string> = {
    '高质量': '高质',
    '高清晰度': '高清',
    '电影级': '电影',
    '专业级': '专业',
    '逼真的': '逼真',
    '精细的': '精细',
    '复杂的': '复杂',
    '详细的': '详细',
    '柔和的': '柔和',
    '强烈的': '强烈',
    '明亮的': '明亮',
    '暗淡的': '暗淡',
    '温暖的': '暖',
    '冷色调': '冷',
  };

  for (const [original, simplified] of Object.entries(simplifications)) {
    compressed = compressed.replace(new RegExp(original, 'g'), simplified);
  }

  // 步骤 4: 移除重复标点
  compressed = compressed.replace(/([，。！？；：])\1+/g, '$1');
  compressed = compressed.replace(/,\s*,+/g, ',');

  // 步骤 5: 如果还超长，截断并添加省略号
  if (compressed.length > maxLength) {
    // 尝试在句子边界截断
    const truncated = compressed.slice(0, maxLength);
    const lastPunctuation = Math.max(
      truncated.lastIndexOf('，'),
      truncated.lastIndexOf('。'),
      truncated.lastIndexOf(','),
      truncated.lastIndexOf('.')
    );
    
    if (lastPunctuation > maxLength * 0.7) {
      compressed = truncated.slice(0, lastPunctuation + 1);
    } else {
      compressed = truncated;
    }
  }

  return compressed.trim();
}

// 检查提示词是否适合即梦
export function checkJimengCompatibility(prompt: string): {
  isCompatible: boolean;
  charCount: number;
  message: string;
  needsCompression: boolean;
} {
  const charCount = prompt.length;
  
  if (charCount <= JIMENG_LIMITS.RECOMMENDED) {
    return {
      isCompatible: true,
      charCount,
      message: `✅ 适合即梦 (${charCount}/${JIMENG_LIMITS.RECOMMENDED} 字符)`,
      needsCompression: false,
    };
  } else if (charCount <= JIMENG_LIMITS.MAX_CHARS) {
    return {
      isCompatible: true,
      charCount,
      message: `⚠️ 可运行但建议精简 (${charCount}/${JIMENG_LIMITS.MAX_CHARS} 字符)`,
      needsCompression: charCount > JIMENG_LIMITS.SAFE_LIMIT,
    };
  } else {
    return {
      isCompatible: false,
      charCount,
      message: `❌ 超出即梦限制 (${charCount}/${JIMENG_LIMITS.MAX_CHARS} 字符)`,
      needsCompression: true,
    };
  }
}

// 智能分段 - 将超长提示词分成多个适合即梦的片段
export function splitForJimeng(prompt: string): string[] {
  if (prompt.length <= JIMENG_LIMITS.MAX_CHARS) {
    return [prompt];
  }

  const segments: string[] = [];
  const sentences = prompt.split(/([，。！？；：,\.\!\?;])/);
  
  let currentSegment = '';
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    if ((currentSegment + sentence).length > JIMENG_LIMITS.SAFE_LIMIT) {
      if (currentSegment) {
        segments.push(currentSegment.trim());
        currentSegment = sentence;
      } else {
        // 单句就超长，强制截断
        segments.push(sentence.slice(0, JIMENG_LIMITS.MAX_CHARS));
        currentSegment = sentence.slice(JIMENG_LIMITS.MAX_CHARS);
      }
    } else {
      currentSegment += sentence;
    }
  }
  
  if (currentSegment) {
    segments.push(currentSegment.trim());
  }

  return segments;
}

// React Hook
export function usePromptCompression() {
  const compress = useCallback((prompt: string, maxLength?: number) => {
    return compressPrompt(prompt, { maxLength });
  }, []);

  const check = useCallback((prompt: string) => {
    return checkJimengCompatibility(prompt);
  }, []);

  const split = useCallback((prompt: string) => {
    return splitForJimeng(prompt);
  }, []);

  return {
    compress,
    check,
    split,
    limits: JIMENG_LIMITS,
  };
}
