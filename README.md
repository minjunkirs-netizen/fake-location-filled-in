# 智能地址填充助手

<div align="center">

**一个强大的Chrome浏览器扩展，使用真实API生成并自动填充地址信息**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome)](https://www.google.com/chrome/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#许可证)

</div>

---

## ✨ 功能特点

- 🌍 **20个国家支持** - 覆盖亚洲、欧洲、美洲、大洋洲主要国家
- 🎯 **100%真实地址** - 基于OpenStreetMap和RandomUser.me API生成
- 🤖 **智能表单识别** - 自动识别并填充各种类型的表单字段
- 👤 **姓名智能分离** - 支持firstName/lastName分开填充
- 📧 **Email独立识别** - 高优先级防止误填到地址字段
- 📞 **完整电话信息** - 包含国家代码、区号等多种格式
- 📋 **下拉框填充** - 智能匹配国家、省份、电话区号下拉选择
- 💾 **历史记录** - 保存最多20条生成的地址，随时重用
- 🎨 **视觉反馈** - 填充时高亮显示已填充字段
- 📋 **一键复制** - 快速复制生成的完整地址信息

## 🌍 支持的国家/地区

| 地区 | 国家 |
|------|------|
| **亚洲** | 🇨🇳 中国 · 🇯🇵 日本 · 🇰🇷 韩国 · 🇮🇳 印度 · 🇸🇬 新加坡 · 🇹🇭 泰国 |
| **欧洲** | 🇬🇧 英国 · 🇩🇪 德国 · 🇫🇷 法国 · 🇮🇹 意大利 · 🇪🇸 西班牙 · 🇳🇱 荷兰 · 🇸🇪 瑞典 · 🇨🇭 瑞士 · 🇷🇺 俄罗斯 |
| **美洲** | 🇺🇸 美国 · 🇨🇦 加拿大 · 🇧🇷 巴西 · 🇲🇽 墨西哥 |
| **大洋洲** | 🇦🇺 澳大利亚 |

每个国家包含4-6个主要城市的真实地址数据。

## 📦 安装方法

### 方式一：从源码安装（开发者模式）

1. **克隆或下载本仓库**
   ```bash
   git clone https://github.com/yourusername/smart-address-autofill.git
   ```

2. **打开Chrome扩展管理页面**
   - 访问 `chrome://extensions/`
   - 或者：菜单 → 更多工具 → 扩展程序

3. **启用开发者模式**
   - 在右上角打开「开发者模式」开关

4. **加载扩展**
   - 点击「加载已解压的扩展程序」
   - 选择项目根目录（包含`manifest.json`的文件夹）

5. **完成！**
   - 扩展图标会出现在浏览器工具栏
   - 点击图标即可开始使用

### 方式二：图标准备（可选）

为了更好的视觉效果，建议在 `icons/` 目录下添加以下图标：
- `icon16.png` (16x16像素)
- `icon48.png` (48x48像素)
- `icon128.png` (128x128像素)

可以使用 `generate-icon.html` 文件生成图标，或使用任何地图、位置相关的图标。

## 🚀 使用指南

### 基本使用流程

1. **选择国家**
   - 点击浏览器工具栏的扩展图标
   - 从下拉菜单选择目标国家（20个国家可选）

2. **生成地址**
   - 点击「生成随机地址」按钮
   - 等待2-5秒，系统会调用API生成真实地址
   - 查看生成的完整信息（姓名、Email、电话、地址等）

3. **填充表单**
   - 打开包含地址表单的网页（如电商网站、注册页面）
   - 点击扩展图标
   - 点击「填充到当前页面」按钮
   - 扩展会自动识别并填充所有相关字段

4. **管理历史记录**
   - 点击「保存到历史」保存当前地址
   - 点击「历史记录」查看已保存的地址
   - 选择历史地址可快速重用

### 支持的表单字段类型

扩展使用智能优先级系统识别以下字段：

```
✅ firstName / lastName / fullName (姓名 - 支持分离)
✅ email (邮箱 - 高优先级独立识别)
✅ phone / mobile / tel (电话号码)
✅ countryCode / phoneCode (国家代码/区号)
✅ postal / zipCode / zip (邮政编码)
✅ state / province / region (省/州)
✅ city / town (城市)
✅ address / street / address1 (详细地址)
✅ address2 (地址第2行)
✅ country (国家)
```

**智能识别特性：**
- 支持中文、英文、法文、德文、西班牙文等多语言字段名
- 通过 name、id、class、placeholder、aria-label、label 等属性综合识别
- 优先级排序防止误填充（Email > 姓名 > 电话 > 地址）

## 🎯 智能填充特性

### 1. 姓名分离填充
```html
<!-- 自动识别并分别填充 -->
<input name="firstName" />    <!-- 填入：John -->
<input name="lastName" />     <!-- 填入：Smith -->
<input name="fullName" />     <!-- 填入：John Smith -->
```

### 2. Email独立识别
```html
<!-- 高优先级识别，避免误填 -->
<input name="email" />        <!-- 填入：john.smith@example.com -->
<input name="address" />      <!-- 不会被email误填 -->
```

### 3. 电话号码多格式
```html
<input name="phone" />           <!-- +86 13812345678 -->
<select name="countryCode">      <!-- +86 -->
<select name="phoneCode">        <!-- 86 -->
```

### 4. 下拉框智能匹配
```html
<!-- 国家下拉框 -->
<select name="country">
  <option value="CN">China</option>     <!-- 自动选中 -->
  <option value="US">United States</option>
</select>

<!-- 电话区号下拉框 -->
<select name="phone-code">
  <option value="+86">+86 (China)</option>   <!-- 自动选中 -->
  <option value="+1">+1 (USA)</option>
</select>

<!-- 省份下拉框 -->
<select name="state">
  <option value="BJ">北京</option>          <!-- 自动选中 -->
  <option value="SH">上海</option>
</select>
```

## 🔧 技术实现

### 核心技术栈

- **Chrome Extension Manifest V3** - 最新扩展标准
- **OpenStreetMap Nominatim API** - 真实地址反向地理编码
- **RandomUser.me API** - 真实用户信息生成
- **Chrome Storage API** - 本地数据持久化
- **Content Scripts** - 网页表单智能识别与填充

### 项目结构

```
smart-address-autofill/
├── manifest.json              # Chrome扩展配置文件
├── popup.html                 # 弹出窗口界面
├── popup.css                  # 弹出窗口样式
├── popup.js                   # 弹出窗口逻辑 (11KB)
├── apiAddressGenerator.js     # 地址生成核心 (19KB)
├── content.js                 # 表单填充引擎 (20KB)
├── test-form.html            # 测试表单页面
├── generate-icon.html         # 图标生成工具
├── icons/                     # 图标目录
│   └── README.md             # 图标说明
├── CHANGELOG_v3.0.md         # 版本更新日志
└── README.md                 # 项目说明文档
```

### API使用说明

**OpenStreetMap Nominatim API**
- 用途：根据坐标获取真实地址
- 速率限制：1次/秒
- 实现：自动延迟控制，最多5次重试
- 文档：https://nominatim.org/release-docs/latest/

**RandomUser.me API**
- 用途：生成真实姓名和Email
- 速率限制：无严格限制
- 实现：按国籍获取对应国家的真实姓名
- 文档：https://randomuser.me/documentation

## 🛡️ 兼容性

### 支持的前端框架

✅ 原生HTML表单
✅ React / Next.js
✅ Vue.js / Nuxt.js
✅ Angular
✅ jQuery
✅ Svelte
✅ 其他现代框架

**事件触发机制：**
- 模拟真实用户输入
- 触发 `input`、`change`、`blur` 事件
- 支持 `InputEvent` (React等框架需要)
- 兼容受控组件

### 浏览器支持

- Chrome 88+
- Edge 88+ (Chromium版本)
- 其他基于Chromium的浏览器

## ⚙️ 配置与自定义

### Chrome Storage数据结构

```javascript
{
  "currentAddress": {          // 当前生成的地址
    "firstName": "John",
    "lastName": "Smith",
    "fullName": "John Smith",
    "email": "john.smith@example.com",
    "phone": "13812345678",
    "phoneWithCountryCode": "+86 13812345678",
    "countryCode": "+86",
    "callingCode": "86",
    "postal": "100000",
    "state": "北京",
    "city": "北京",
    "address": "朝阳区建国路88号",
    "address2": "",
    "country": "CN",
    "countryName": "China"
  },
  "addressHistory": [...],     // 历史记录数组（最多20条）
  "selectedCountry": "CN"      // 用户上次选择的国家
}
```

## 🐛 故障排除

### 常见问题

**Q: 填充没有生效怎么办？**

A: 可能的原因和解决方案：
- 部分网站使用Shadow DOM或iframe，需要刷新页面后重试
- 使用了自定义表单组件，尝试「复制地址」手动粘贴
- 检查浏览器控制台是否有错误信息

**Q: API请求失败怎么办？**

A:
- 检查网络连接是否正常
- OpenStreetMap有速率限制（1次/秒），等待几秒后重试
- 切换到其他国家或城市重新生成

**Q: 生成的地址是真实的吗？**

A:
- 是的！所有地址都来自OpenStreetMap的真实地理坐标
- 地址在地图上可以验证
- 姓名和Email来自RandomUser.me的真实数据库

**Q: 为什么有些字段没有填充？**

A:
- 检查字段的name/id属性是否标准
- 某些自定义字段可能未被识别，可以手动填充
- 使用test-form.html测试基本功能是否正常

**Q: 支持哪些网站？**

A:
- 理论上支持所有使用标准HTML表单的网站
- 已测试：淘宝、京东、亚马逊、eBay等主流电商
- 已测试：各类用户注册、账户设置页面

## 🔒 隐私与安全

- ✅ **无数据收集**：不收集任何用户信息
- ✅ **本地存储**：所有历史记录仅保存在本地Chrome Storage
- ✅ **仅HTTPS API**：所有API调用使用安全连接
- ✅ **用户主动触发**：仅在用户点击时才填充表单
- ✅ **开源代码**：所有代码公开可审计
- ⚠️ **API调用**：需要向OpenStreetMap和RandomUser.me发送请求

## 📝 版本历史

查看完整的版本历史和更新日志：[CHANGELOG_v3.0.md](./CHANGELOG_v3.0.md)

**当前版本：v3.0** (2024-11-06)
- 纯API模式，删除离线生成
- 支持20个国家（从8个扩展）
- 智能姓名分离填充
- Email独立高优先级识别
- 完整电话号码格式
- 下拉框智能匹配
- 全面重写字段识别引擎

## 🤝 贡献指南

欢迎贡献！以下是参与方式：

1. **Fork本仓库**
2. **创建功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **开启Pull Request**

**贡献类型：**
- 🐛 Bug修复
- ✨ 新功能
- 📝 文档改进
- 🌍 添加新国家/城市
- 🎨 UI/UX改进
- 🔧 代码重构

## 🙏 致谢

- [OpenStreetMap](https://www.openstreetmap.org/) - 真实地址地理数据
- [RandomUser.me](https://randomuser.me/) - 真实用户信息API
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/) - 官方文档
- 所有贡献者和用户的反馈

## 📄 许可证

本项目采用 MIT 许可证

**免责声明：** 本扩展仅供学习、测试和开发目的使用。请遵守各网站的服务条款，不要用于非法目的。

## 📧 联系方式

- 问题反馈：GitHub Issues
- 功能建议：GitHub Discussions

---

<div align="center">

**如果觉得有帮助，请给个Star ⭐**

Made with ❤️ by the Community

</div>
