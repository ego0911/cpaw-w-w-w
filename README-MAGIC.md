# CPAMC Usage Page(魔改说明)

基于 [router-for-me/Cli-Proxy-API-Management-Center](https://github.com/router-for-me/Cli-Proxy-API-Management-Center) main 分支(2026-10-05)的魔改:
在「观测」组(配额管理/日志查看之间)新增原生「使用统计」页,内容为 iframe 内嵌 [CPA Usage Keeper](https://github.com/Willxup/cpa-usage-keeper)(embed=cpamc 模式)。

## 改动清单
- `src/pages/UsagePage.tsx` + `UsagePage.module.scss`(新增):内嵌页,地址逻辑=8317 直连入口→`hostname:8081`,其他→同源 `/keeper/?embed=cpamc`;监听 keeper ready 握手,15s 超时失败提示+重载
- `src/router/MainRoutes.tsx`:加 `/usage` 路由
- `src/components/layout/MainLayout.tsx`:观测组 nav 插 usage_statistics(quota 与 logs 之间)
- `src/i18n/locales/*.json` ×4:nav.usage_statistics 四语言
- `dist/index.html`:构建成品(vite build,单文件)——可直接覆盖 CPA 的 `static/management.html`

## 构建
```bash
npm install && npx tsc && npx vite build   # 产物 dist/index.html
```

## 部署
覆盖 CPA 容器挂载的 `static/management.html`,并建议在 CPA config 关闭面板自动更新:
`management.disable_auto_update_panel: true`

## Keeper 侧(38.59 实际部署)
- `APP_BASE_PATH=/keeper` + caddy `handle /keeper/* → reverse_proxy keeper:8080`
- 8081 直连入口保留
