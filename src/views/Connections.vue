<template>
  <div class="connections">
    <div class="header">
      <span>{{ list.length }} 条连接</span>
      <button @click="closeAll">全部断开</button>
    </div>
    <div v-for="c in list" :key="c.id" class="conn">
      <div class="row1">
        <span class="host">{{ c.metadata.host || c.metadata.destinationIP }}</span>
        <button class="close" @click="close(c.id)">×</button>
      </div>
      <div class="row2">
        <span>{{ c.chains && c.chains[0] }}</span>
        <span>↓{{ formatBytes(c.download) }} ↑{{ formatBytes(c.upload) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { clashApi } from '../api/clash'

const list = ref([])
let ws = null

function formatBytes(b) {
  if (b < 1024) return `${b}B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)}KB`
  return `${(b / 1024 / 1024).toFixed(1)}MB`
}

async function close(id) {
  await clashApi.closeConnection(id)
}

async function closeAll() {
  await clashApi.closeAllConnections()
}

onMounted(() => {
  ws = clashApi.streamConnections((data) => {
    list.value = (data.connections || []).sort((a, b) => b.download - a.download)
  })
})

onBeforeUnmount(() => ws && ws.close())
</script>

<style scoped>
.connections { padding: 16px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: #8e8e93; }
.header button { background: none; border: none; color: #ff453a; font-size: 13px; }
.conn { background: #1c1c1e; border-radius: 10px; padding: 10px 12px; margin-bottom: 8px; }
.row1 { display: flex; justify-content: space-between; }
.host { font-size: 14px; word-break: break-all; }
.close { background: none; border: none; color: #8e8e93; font-size: 18px; line-height: 1; }
.row2 { display: flex; justify-content: space-between; color: #8e8e93; font-size: 12px; margin-top: 4px; }
</style>
