# Clash Panel

给 sing-box / mihomo 的 `clash_api` 做的原生 Android 控制面板,Vue3 + Capacitor,GitHub Actions 自动编译 APK。

## 用法

1. 把这个目录 push 到你的 GitHub 仓库(比如 `110789/clash-panel`)
2. 仓库 Settings → Actions → 允许 workflow 运行
3. push 到 `main` 分支(或去 Actions 页手动 `Run workflow`),等 `Build APK` 跑完
4. 在 Actions 运行详情里下载 `clash-panel-debug` artifact,里面是 `app-debug.apk`
5. 传到手机装上,打开 App → "设置" 页填:
   - Host: `127.0.0.1`(和手机上跑的 sing-box/mihomo 同一台设备就填这个)
   - Port: 对应你配置里的 `external_controller` 端口,比如你现在的 `9090`
   - Secret: 对应你配置里的 `clash_api.secret`
6. 保存后如果显示"连接成功"就能用了

## 已实现

- 总览:实时上下行速率、运行模式切换(rule/global/direct)、重载配置
- 节点:按分组展示 Selector/URLTest/Fallback,点击切换节点,支持测速
- 连接:实时连接列表,单条/全部断开
- 设置:host/port/secret 配置与连通性测试

## 本地开发(可选,如果想在电脑上先调好界面)

```bash
npm install
npm run dev   # 浏览器里跑,注意 clash_api 要开放 CORS(你的配置已经是 allow_origin: ["*"])
```

## 待办 / 可扩展方向

- 日志流页面(`clashApi.streamLogs` 已经封装好,还没接 UI)
- 规则列表查看
- 流量历史图表(目前只有瞬时速率数字,可以接 Chart.js 画曲线)
- 深色/浅色主题切换
- 应用图标 / 启动图(目前用 Capacitor 默认的)
