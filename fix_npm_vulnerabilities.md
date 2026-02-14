# NPM依赖漏洞修复指南

**生成时间：** 2026-02-14 16:48  
**当前漏洞：** 36个（22高危 + 14中危）

## ⚠️ 重要提示

- 依赖更新可能导致breaking changes
- 建议在修复后进行完整测试
- 修复前已备份当前package.json

---

## 修复方案（按优先级）

### 方案1: 安全修复（推荐）

只修复安全漏洞，保持兼容性：

```bash
cd F:/unia
npm audit fix
```

### 方案2: 强制修复（可能有breaking changes）

修复所有漏洞，包括major版本升级：

```bash
cd F:/unia
npm audit fix --force
```

**警告：** 可能导致UniApp框架不兼容，需要测试！

### 方案3: 手动更新关键依赖

逐个更新有漏洞的依赖：

```bash
cd F:/unia

# 1. 更新Vite（中危漏洞）
npm update vite

# 2. 更新vue-tsc（中危漏洞）
npm update vue-tsc

# 3. 检查剩余漏洞
npm audit
```

---

## 关键漏洞详情

### 🔴 高危漏洞（22个）

1. **jpeg-js** - 无限循环DoS攻击
   - CVE: GHSA-xvf7-4v9q-58w6
   - 影响：可能导致应用崩溃
   - 修复：间接依赖，等待@dcloudio/uni-mp-weixin更新

2. **@intlify/core-base** - 原型污染
   - CVE: GHSA-p2ph-7g93-hw3m
   - 影响：可能被注入恶意代码
   - 修复：间接依赖，等待@dcloudio/uni-cli-shared更新

3. **@intlify/core-base** - XSS漏洞
   - CVE: GHSA-x8qp-wqqm-57ph
   - 影响：跨站脚本攻击
   - 修复：间接依赖，等待@dcloudio/uni-cli-shared更新

### ⚠️ 中危漏洞（14个）

1. **esbuild** - SSRF攻击
   - CVE: GHSA-67mh-4wv8-2f99
   - 影响：开发环境可能被攻击
   - 修复：更新到0.24.3+

2. **vue-template-compiler** - XSS漏洞
   - CVE: GHSA-g3ch-rx76-35fx
   - 影响：模板编译时的XSS风险
   - 修复：升级vue-tsc到3.x

---

## 执行修复（分步骤）

### 步骤1: 备份当前状态

```bash
cd F:/unia
copy package.json package.json.backup
copy package-lock.json package-lock.json.backup
```

### 步骤2: 执行修复

```bash
# 方案1（安全）
npm audit fix

# 或方案3（手动）
npm update vite vue-tsc
```

### 步骤3: 验证修复

```bash
# 检查剩余漏洞
npm audit

# 检查是否有breaking changes
npm run dev:h5
```

### 步骤4: 测试应用

- [ ] H5端编译成功
- [ ] 蓝牙连接功能正常
- [ ] 数据显示正常
- [ ] 页面导航正常

### 步骤5: 回滚（如果失败）

```bash
copy package.json.backup package.json
copy package-lock.json.backup package-lock.json
npm install
```

---

## UniApp框架依赖说明

以下依赖是UniApp框架核心，不建议强制升级：

- `@dcloudio/uni-app`
- `@dcloudio/uni-app-plus`
- `@dcloudio/uni-h5`
- `@dcloudio/uni-mp-weixin`
- `@dcloudio/uni-cli-shared`
- `@dcloudio/vite-plugin-uni`

**建议：** 等待官方更新，或访问 https://uniapp.dcloud.net.cn/ 查看最新版本

---

## 预期结果

**方案1（安全修复）：**
- 预计修复：5-10个漏洞
- 剩余：26-31个漏洞（主要是UniApp框架依赖）
- 风险：低

**方案2（强制修复）：**
- 预计修复：20-30个漏洞
- 剩余：6-16个漏洞
- 风险：高（可能不兼容）

**方案3（手动更新）：**
- 预计修复：2-3个漏洞
- 剩余：33-34个漏洞
- 风险：低

---

## 建议

1. **立即执行：** 方案1（安全修复）
2. **测试后执行：** 方案3（手动更新vite和vue-tsc）
3. **暂不执行：** 方案2（等待UniApp官方更新）

---

**下一步：** 请选择修复方案，我可以帮你执行命令并验证结果。
