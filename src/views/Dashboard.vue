<template>
  <div class="dashboard">
    <div class="speed-cards">
      <div class="card">
        <div class="label">↓ 下载</div>
        <div class="value">{{ formatSpeed(down) }}</div>
      </div>
      <div class="card">
        <div class="label">↑ 上传</div>
        <div class="value">{{ formatSpeed(up) }}</div>
      </div>
    </div>

    <div class="mode-switch">
      <div class="label">运行模式</div>
      <div class="btns">
        <button
          v-for="m in ['rule', 'global', 'direct']"
          :key="m"
          :class="{ active: mode === m }"
          @click="switchMode(m)"
        >
          {{ m }}
        </button>
      </div>
    </div>

    <button class="reload" @click="reload">重载配置</button>
    <p v-if="status" class="status">{{ status }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { clashApi } from '../api/clash'

const down = ref(0)
const up = ref(0)
const mode = ref('')
const status = ref('')
let ws = null

function formatSpeed(bytes) {
  if (bytes < 1024) return `${bytes} B/s`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB/s`
}

async function loadMode() {
  try {
    const cfg = await clashApi.getConfigs()
    mode.value = cfg.mode
  } catch (e) {
    status.value = `连接失败: ${e.message}`
  }
}

async function switchMode(m) {
  await clashApi.setMode(m)
  mode.value = m
}

async function reload() {
  status.value = '重载中...'
  try {
    await clashApi.reloadConfig()
    status.value = '重载成功'
  } catch (e) {
    status.value = `重载失败: ${e.message}`
  }
}

onMounted(() => {
  loadMode()
  ws = clashApi.streamTraffic(
    (data) => {
      down.value = data.down
      up.value = data.up
    },
    () => (status.value = 'WebSocket 连接失败,检查地址/端口/密钥')
  )
})

onBeforeUnmount(() => ws && ws.close())
</script>

<style scoped>
.dashboard { padding: 16px; }
.speed-cards { display: flex; gap: 12px; margin-bottom: 20px; }
.card { flex: 1; background: #1c1c1e; border-radius: 12px; padding: 16px; }
.card .label { color: #8e8e93; font-size: 13px; }
.card .value { font-size: 22px; font-weight: 600; margin-top: 4px; }
.mode-switch { margin-bottom: 20px; }
.mode-switch .label { color: #8e8e93; font-size: 13px; margin-bottom: 8px; }
.btns { display: flex; gap: 8px; }
.btns button {
  flex: 1; padding: 10px; border-radius: 8px; border: none;
  background: #2c2c2e; color: #fff; text-transform: capitalize;
}
.btns button.active { background: #0a84ff; }
.reload {
  width: 100%; padding: 12px; border-radius: 8px; border: none;
  background: #2c2c2e; color: #fff; margin-bottom: 12px;
}
.status { color: #8e8e93; font-size: 13px; }
</style>
