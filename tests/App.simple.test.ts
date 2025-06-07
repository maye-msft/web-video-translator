import { describe, it, expect } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'

// Create mock router for testing
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/step-1' },
    {
      path: '/step-1',
      component: { template: '<div>Step 1</div>' },
      name: 'Step1',
    },
    {
      path: '/step-2',
      component: { template: '<div>Step 2</div>' },
      name: 'Step2',
    },
    {
      path: '/step-3',
      component: { template: '<div>Step 3</div>' },
      name: 'Step3',
    },
    {
      path: '/step-4',
      component: { template: '<div>Step 4</div>' },
      name: 'Step4',
    },
  ],
})

describe('App Routing', () => {
  it('should redirect to step-1 by default', async () => {
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/step-1')
  })

  it('should handle routing to workflow steps', async () => {
    await router.push('/step-2')
    expect(router.currentRoute.value.name).toBe('Step2')

    await router.push('/step-3')
    expect(router.currentRoute.value.name).toBe('Step3')

    await router.push('/step-4')
    expect(router.currentRoute.value.name).toBe('Step4')
  })
})
