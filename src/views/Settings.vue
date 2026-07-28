<template>
  <div class="settings">
    <label>Host</label>
    <input v-model="host" placeholder="127.0.0.1" />
    <label>Port</label>
    <input v-model="port" placeholder="9090" />
    <label>Secret</label>
    <input v-model="secret" type="password" placeholder="clash_api secret" />
    <button @click="save">保存并测试连接</button>
    <p v-if="msg" :class="ok ? 'ok' : 'err'">{{ msg }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { clashApi } from '../api/clash'

const host = ref('')
const port = ref('')
const secret = ref('')
const msg = ref('')
const ok = ref(false)

onMounted(() => {
  const cfg = clashApi.getConfig()
  host.value = cfg.host
  port.value = cfg.port
  secret.value = cfg.secret
})

async function save() {
  clashApi.setConfig({ host: host.value, port: port.value, secret: secret.value })
  try {
    const v = await clashApi.version()
    ok.value = true
    msg.value = `连接成功,核心版本 ${v.version}`
  } catch (e) {
    ok.value = false
    msg.value = `连接失败: ${e.message}`
  }
}
</script>

<style scoped>
.settings { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
label { color: #8e8e93; font-size: 13px; margin-top: 8px; }
input {
  background: #1c1c1e; border: none; border-radius: 8px; padding: 10px;
  color: #fff; font-size: 14px;
}
button {
  margin-top: 16px; padding: 12px; border-radius: 8px; border: none;
  background: #0a84ff; color: #fff; font-weight: 600;
}
.ok { color: #32d74b; }
.err { color: #ff453a; }
</style>
