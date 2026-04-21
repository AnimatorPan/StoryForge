import { describe, it, expect, bench } from 'vitest'
import { compressPrompt } from '../utils/promptCompression'
import { useProjectStore } from '../stores/projectStore'

describe('Performance Benchmarks', () => {
  describe('promptCompression', () => {
    const shortPrompt = '这是一个短提示词'
    const mediumPrompt = '这是一个中等长度的提示词，包含一些描述性的内容，用于测试压缩性能。'
    const longPrompt = 'a'.repeat(500)

    bench('compress short prompt', () => {
      compressPrompt(shortPrompt)
    })

    bench('compress medium prompt', () => {
      compressPrompt(mediumPrompt)
    })

    bench('compress long prompt', () => {
      compressPrompt(longPrompt)
    })
  })

  describe('projectStore operations', () => {
    const store = useProjectStore.getState()

    bench('add 100 shots', () => {
      store.resetProject()
      for (let i = 0; i < 100; i++) {
        store.addShot({
          description: `测试内容 ${i}`,
          shotType: '特写',
        })
      }
    })

    bench('update 100 shots', () => {
      const shots = useProjectStore.getState().shots
      for (let i = 0; i < shots.length; i++) {
        store.updateShot(shots[i].id, { description: `更新后的内容 ${i}` })
      }
    })

    bench('delete 100 shots', () => {
      const shots = useProjectStore.getState().shots
      for (let i = 0; i < shots.length; i++) {
        store.deleteShot(shots[i].id)
      }
    })
  })
})
