import { describe, it, expect } from 'vitest'
import { compressPrompt, JIMENG_LIMITS } from '../utils/promptCompression'

describe('promptCompression', () => {
  it('should return prompt if under max length', () => {
    const shortPrompt = '这是一个短提示词'
    const result = compressPrompt(shortPrompt)
    expect(result).toBe(shortPrompt)
  })

  it('should compress prompt exceeding max length', () => {
    const longPrompt = 'a'.repeat(250)
    const result = compressPrompt(longPrompt)
    expect(result.length).toBeLessThanOrEqual(JIMENG_LIMITS.MAX_CHARS)
  })

  it('should preserve keywords when compressing', () => {
    const prompt = '这是一个包含特写、逆光、电影感的长提示词，需要保留这些关键词'
    const longPrompt = prompt + 'a'.repeat(300)
    const result = compressPrompt(longPrompt)
    
    // 检查关键词是否被保留
    expect(result).toContain('特写')
    expect(result).toContain('逆光')
    expect(result).toContain('电影感')
  })

  it('should remove punctuation when compressing', () => {
    const prompt = '这是一个，包含，很多，标点符号。的提示词！需要压缩。'
    const longPrompt = prompt + 'a'.repeat(300)
    const result = compressPrompt(longPrompt)
    
    // 压缩后应该减少标点
    const originalPunctuation = (prompt.match(/[，。！]/g) || []).length
    const resultPunctuation = (result.match(/[，。！]/g) || []).length
    expect(resultPunctuation).toBeLessThanOrEqual(originalPunctuation)
  })
})
