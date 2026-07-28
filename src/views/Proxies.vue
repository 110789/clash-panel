<template>
  <div class="proxies">
    <p v-if="loading">加载中...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-for="group in groups" :key="group.name" class="group">
      <div class="group-header">
        <span class="group-name">{{ group.name }}</span>
        <span class="group-type">{{ group.type }}</span>
      </div>
      <div class="nodes">
        <button
          v-for="node in group.all"
          :key="node"
          class="node"
          :class="{ active: node === group.now }"
          @click="select(group.name, node)"
        >
          {{ node }}
          <span v-if="delays[node] !== undefined" class="delay" :class="delayClass(delays[node])">
            {{ delays[node] === -1 ? 'x' : delays[node] + 'ms' }}
          </span>
        </button>
      </div>
      <button class="test-btn" @click="testGroup(group)">测速本组</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { clashApi } from '../api/clash'

const groups = ref([])
const delays = ref({})
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  try {
    const data = await clashApi.getProxies()
    // 只展示 selector / urltest 类型的分组,过滤掉底层节点条目
    groups.value = Object.values(data.proxies).filter((p) =>
      ['Selector', 'URLTest', 'Fallback'].includes(p.type)
    )
  } catch (e) {
    error.value = `加载失败: ${e.message}`
  } finally {
    loading.value = false
  }
}

async function select(group, node) {
  try {
    await clashApi.selectProxy(group, node)
    const g = groups.value.find((g) => g.name === group)
    if (g) g.now = node
  } catch (e) {
    error.value = `切换失败: ${e.message}`
  }
}

async function testGroup(group) {
  for (const node of group.all) {
    try {
      const r = await clashApi.testProxyDelay(node)
      delays.value[node] = r.delay ?? -1
    } catch {
      delays.value[node] = -1
    }
  }
}

function delayClass(d) {
  if (d === -1) return 'bad'
  if (d < 200) return 'good'
  if (d < 500) return 'mid'
  return 'bad'
}

onMounted(load)
</script>

<style scoped>
.proxies { padding: 16px; }
.error { color: #ff453a; }
.group { margin-bottom: 20px; }
.group-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.group-name { font-weight: 600; }
.group-type { color: #8e8e93; font-size: 12px; }
.nodes { display: flex; flex-wrap: wrap; gap: 8px; }
.node {
  padding: 8px 12px; border-radius: 8px; border: none;
  background: #2c2c2e; color: #fff; font-size: 13px;
  display: flex; align-items: center; gap: 6px;
}
.node.active { background: #0a84ff; }
.delay { font-size: 11px; }
.delay.good { color: #32d74b; }
.delay.mid { color: #ffd60a; }
.delay.bad { color: #ff453a; }
.test-btn {
  margin-top: 8px; padding: 6px 12px; border-radius: 8px; border: none;
  background: transparent; color: #0a84ff; font-size: 13px;
}
</style>
