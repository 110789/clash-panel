<template>
  <div class="app">
    <div class="content">
      <Dashboard v-if="tab === 'dashboard'" />
      <Proxies v-if="tab === 'proxies'" />
      <Connections v-if="tab === 'connections'" />
      <Settings v-if="tab === 'settings'" />
    </div>
    <nav class="tabbar">
      <button :class="{ active: tab === 'dashboard' }" @click="tab = 'dashboard'">总览</button>
      <button :class="{ active: tab === 'proxies' }" @click="tab = 'proxies'">节点</button>
      <button :class="{ active: tab === 'connections' }" @click="tab = 'connections'">连接</button>
      <button :class="{ active: tab === 'settings' }" @click="tab = 'settings'">设置</button>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Dashboard from './views/Dashboard.vue'
import Proxies from './views/Proxies.vue'
import Connections from './views/Connections.vue'
import Settings from './views/Settings.vue'

const tab = ref('dashboard')
</script>

<style>
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body { margin: 0; background: #000; color: #fff; font-family: -apple-system, system-ui, sans-serif; }
.app { display: flex; flex-direction: column; height: 100vh; }
.content { flex: 1; overflow-y: auto; padding-bottom: env(safe-area-inset-bottom); }
.tabbar {
  display: flex; border-top: 1px solid #2c2c2e;
  padding-bottom: env(safe-area-inset-bottom);
}
.tabbar button {
  flex: 1; padding: 12px 0; background: none; border: none;
  color: #8e8e93; font-size: 13px;
}
.tabbar button.active { color: #0a84ff; }
</style>
