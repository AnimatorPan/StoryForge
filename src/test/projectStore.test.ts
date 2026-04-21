import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from '../stores/projectStore'

describe('projectStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    const store = useProjectStore.getState()
    store.resetProject()
  })

  it('should initialize with default values', () => {
    const state = useProjectStore.getState()
    expect(state.currentProjectId).toBe('default')
    expect(state.shots).toEqual([])
    expect(state.projects.default.name).toBe('默认项目')
  })

  it('should add a shot', () => {
    const store = useProjectStore.getState()
    
    store.addShot({
      description: '测试内容',
      shotType: '特写',
    })
    
    expect(useProjectStore.getState().shots).toHaveLength(1)
    expect(useProjectStore.getState().shots[0].description).toBe('测试内容')
  })

  it('should update a shot', () => {
    const store = useProjectStore.getState()
    
    store.addShot({ description: '原始内容' })
    const shotId = useProjectStore.getState().shots[0].id
    
    store.updateShot(shotId, { description: '更新后的内容' })
    
    expect(useProjectStore.getState().shots[0].description).toBe('更新后的内容')
  })

  it('should delete a shot', () => {
    const store = useProjectStore.getState()
    
    store.addShot({ description: '测试内容' })
    expect(useProjectStore.getState().shots).toHaveLength(1)
    
    const shotId = useProjectStore.getState().shots[0].id
    store.deleteShot(shotId)
    
    expect(useProjectStore.getState().shots).toHaveLength(0)
  })

  it('should create project', () => {
    const store = useProjectStore.getState()
    const projectId = store.createProject('测试项目')
    
    expect(useProjectStore.getState().projects[projectId].name).toBe('测试项目')
  })
})
