# 🍊 成都万果数字交易平台 - 在线演示版

> 一套完整的水果交易+竞价系统，可直接部署到 Render 等免费平台

---

## ✨ 功能特性

- 🛒 **万果集市** - 商品浏览、下单购买
- 🔨 **竞价中心** - 发布竞价、实时出价、倒计时、最高价者得
- 📦 **订单管理** - 下单、状态流转、删除
- 👤 **多角色系统** - 买家、卖家、管理员
- 🖼️ **真实图片** - Unsplash 高清水果图片

---

## 🚀 一键部署到 Render

### 步骤 1：Fork 或 Clone 本仓库到你的 GitHub

### 步骤 2：登录 Render
1. 打开 https://render.com/
2. 点击 "Get Started" 用 GitHub 账号登录

### 步骤 3：创建 Web Service
1. 点击 "New +" → "Web Service"
2. 选择这个仓库
3. 填写配置：

| 配置项 | 值 |
|---|---|
| Name | `fruit-auction` (随便填) |
| Region | Singapore |
| Runtime | Node |
| Build Command | `cd backend && npm install` |
| Start Command | `cd backend && node server.js` |

4. 点击 "Create Web Service"

### 步骤 4：等待部署完成
约 2-5 分钟后，你会得到一个网址如：
```
https://fruit-auction.onrender.com
```

打开这个网址即可测试！

---

## 👤 测试账号

| 角色 | 用户名 | 密码 | 功能 |
|---|---|---|---|
| 👑 管理员 | `admin` | `admin123` | 后台管理、删除公告/分类 |
| 🏪 卖家 | `seller` | `seller123` | 发布商品、发布竞价、删除商品 |
| 🛒 买家 | `buyer` | `buyer123` | 浏览下单、参与竞价、删除订单 |

---

## 📁 项目结构

```
fruit-auction-github/
├── backend/           # 后端服务 (Node.js + Express)
│   ├── server.js      # 主程序 (含所有API)
│   └── package.json   # 依赖清单
├── dist/              # 前端页面 (Vue3构建产物)
│   ├── index.html
│   └── assets/
└── README.md          # 本文件
```

---

## 🔧 本地运行

```bash
# 1. Clone 仓库
git clone https://github.com/你的用户名/fruit-auction.git
cd fruit-auction

# 2. 安装依赖
cd backend && npm install

# 3. 启动服务
node server.js

# 4. 打开浏览器
http://localhost:3000
```

---

## ⚠️ 注意事项

- 这是**演示版**，数据存储在内存中，重启后数据重置
- 商品图片来自 Unsplash CDN，需联网加载
- Render 免费版有冷启动（首次访问约等30秒）

---

## 📜 License

MIT License - 可自由使用、修改、部署