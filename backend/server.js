const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'pujiang-fruit-platform-secret-key';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../dist')));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ============ 数据模型（内存存储） ============
const users = [
  { _id: '1', username: 'admin', password: 'admin123', email: 'admin@pujiang.com', role: 'admin', companyName: '平台管理中心' },
  { _id: '2', username: 'seller', password: 'seller123', email: 'seller@pujiang.com', role: 'seller', companyName: '蒲江果品合作社' },
  { _id: '3', username: 'buyer', password: 'buyer123', email: 'buyer@example.com', role: 'buyer', companyName: '' }
];

// 平台公告存储
const announcements = [
  {
    _id: '1',
    title: '平台正式上线公告',
    type: 'success',
    content: '成都万果数字交易平台正式上线，欢迎各位果农和采购商入驻！平台由政府指导、市场运作，致力于打造安全、规范、高效的农产品数字化交易市场。',
    level: 'important',
    createdAt: new Date().toISOString(),
    pinned: true
  },
  {
    _id: '2',
    title: '严选商品审核规则说明',
    type: 'info',
    content: '严选商品需经过平台审核后方可上架销售，请各位商家严格按照品质标准提交申请。审核结果将在1-2个工作日内通知。',
    level: 'normal',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    pinned: false
  },
  {
    _id: '3',
    title: '关于规范交易行为的通告',
    type: 'warning',
    content: '请所有入驻商家严格遵守平台交易规范，禁止虚假宣传、哄抬价格等行为。一经发现，平台有权采取下架商品、冻结账户等措施。',
    level: 'normal',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    pinned: false
  }
];

// 水果分类管理（管理员可增删）
const categories = [
  { _id: '1', name: '柑橘类', description: '柑橘类水果', createdAt: new Date().toISOString() },
  { _id: '2', name: '奇异果', description: '猕猴桃等', createdAt: new Date().toISOString() },
  { _id: '3', name: '樱桃', description: '樱桃类水果', createdAt: new Date().toISOString() },
  { _id: '4', name: '李子', description: '李子类水果', createdAt: new Date().toISOString() }
];

const fruits = [
  { _id: '1', name: '蒲江丑柑', category: '柑橘类', price: 8.5, unit: '元/斤', origin: '四川蒲江', quality: '严选', description: '皮薄汁多，酸甜可口，果肉细腻，是蒲江的特色水果', stock: 990, sold: 248, rating: 4.9, seller: '2', status: 'approved', emoji: '🍊', bgColor: 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop' },
  { _id: '2', name: '蒲江猕猴桃', category: '奇异果', price: 12.0, unit: '元/斤', origin: '四川蒲江', quality: '严选', description: '果肉翠绿，香甜多汁，营养价值极高', stock: 880, sold: 456, rating: 4.8, seller: '2', status: 'approved', emoji: '🥝', bgColor: 'linear-gradient(135deg, #C5E1A5 0%, #81C784 100%)', image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400&h=300&fit=crop' },
  { _id: '3', name: '蒲江樱桃', category: '樱桃', price: 25.0, unit: '元/斤', origin: '四川蒲江', quality: '优选', description: '鲜红透亮，甜酸适中，新鲜采摘', stock: 200, sold: 156, rating: 4.7, seller: '2', status: 'approved', emoji: '🍒', bgColor: 'linear-gradient(135deg, #F8BBD9 0%, #F48FB1 100%)', image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop' },
  { _id: '4', name: '青见柑橘', category: '柑橘类', price: 6.8, unit: '元/斤', origin: '四川蒲江', quality: '优选', description: '果肉饱满，入口即化，香甜可口', stock: 500, sold: 120, rating: 4.6, seller: '2', status: 'approved', emoji: '🍊', bgColor: 'linear-gradient(135deg, #FFE0B2 0%, #FFB74D 100%)', image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400&h=300&fit=crop' },
  { _id: '5', name: '春见耙耙柑', category: '柑橘类', price: 9.8, unit: '元/斤', origin: '四川蒲江', quality: '严选', description: '果皮薄而软，汁水充盈，甜度高', stock: 650, sold: 380, rating: 4.8, seller: '2', status: 'approved', emoji: '🍊', bgColor: 'linear-gradient(135deg, #FFE0B2 0%, #FFA726 100%)', image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&h=300&fit=crop' },
  { _id: '6', name: '不知火柑橘', category: '柑橘类', price: 11.5, unit: '元/斤', origin: '四川蒲江', quality: '严选', description: '丑而甜，肉质脆嫩化渣，风味浓郁', stock: 420, sold: 285, rating: 4.9, seller: '2', status: 'approved', emoji: '🍊', bgColor: 'linear-gradient(135deg, #FFCC80 0%, #FF8A65 100%)', image: 'https://images.unsplash.com/photo-1597633465703-070e26de5f0f?w=400&h=300&fit=crop' },
  { _id: '7', name: '爱媛果冻橙', category: '柑橘类', price: 15.0, unit: '元/斤', origin: '四川蒲江', quality: '严选', description: '入口即化，像果冻一样的口感', stock: 300, sold: 200, rating: 4.9, seller: '2', status: 'approved', emoji: '🍊', bgColor: 'linear-gradient(135deg, #FFE0B2 0%, #FF7043 100%)', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop' },
  { _id: '8', name: '蒲江李子', category: '李子', price: 7.5, unit: '元/斤', origin: '四川蒲江', quality: '普通', description: '清脆爽口，酸甜适中', stock: 350, sold: 80, rating: 4.5, seller: '2', status: 'approved', emoji: '🟣', bgColor: 'linear-gradient(135deg, #D1C4E9 0%, #9575CD 100%)', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop' }
];

let orders = [
  {
    _id: '1001',
    orderNo: 'OG2500001AB12',
    buyer: '3',
    seller: '2',
    items: [{ fruit: '1', name: '蒲江丑柑', price: 8.5, quantity: 3, total: 25.5 }],
    totalAmount: 25.5,
    status: 'paid',
    shippingAddress: '测试买家 | 13800138000 | 四川省成都市锦江区东大街1号',
    createdAt: '2026-06-10T03:30:00.000Z'
  },
  {
    _id: '1002',
    orderNo: 'OG2500002CD34',
    buyer: '3',
    seller: '2',
    items: [{ fruit: '2', name: '蒲江猕猴桃', price: 12.0, quantity: 2, total: 24.0 }],
    totalAmount: 24.0,
    status: 'shipped',
    shippingAddress: '测试买家 | 13800138000 | 四川省成都市锦江区东大街1号',
    createdAt: '2026-06-12T10:20:00.000Z'
  },
  {
    _id: '1003',
    orderNo: 'OG2500003EF56',
    buyer: '3',
    seller: '2',
    items: [{ fruit: '5', name: '春见耙耙柑', price: 9.8, quantity: 5, total: 49.0 }],
    totalAmount: 49.0,
    status: 'delivered',
    shippingAddress: '测试买家 | 13800138000 | 四川省成都市锦江区东大街1号',
    createdAt: '2026-06-13T15:00:00.000Z'
  }
];

const marketData = [
  { date: '2026-06-01', 柑橘类: 8.2, 奇异果: 11.5, 樱桃: 24.0, 李子: 7.0 },
  { date: '2026-06-02', 柑橘类: 8.3, 奇异果: 11.8, 樱桃: 24.5, 李子: 7.1 },
  { date: '2026-06-03', 柑橘类: 8.5, 奇异果: 12.0, 樱桃: 25.0, 李子: 7.3 },
  { date: '2026-06-04', 柑橘类: 8.4, 奇异果: 11.9, 樱桃: 25.2, 李子: 7.4 },
  { date: '2026-06-05', 柑橘类: 8.5, 奇异果: 12.0, 樱桃: 25.0, 李子: 7.5 },
  { date: '2026-06-06', 柑橘类: 8.6, 奇异果: 12.1, 樱桃: 25.3, 李子: 7.5 },
  { date: '2026-06-07', 柑橘类: 8.5, 奇异果: 12.0, 樱桃: 25.0, 李子: 7.5 }
];

// ============ 工具函数 ============
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: '未提供访问令牌' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: '令牌无效或已过期' });
  }
};

// 可选认证：有 token 则解析，没有也允许访问（用于公开数据接口）
const maybeAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (e) { /* token 无效但不报错 */ }
  }
  next();
};

const enrichUser = (u) => ({
  _id: u._id,
  username: u.username,
  email: u.email,
  role: u.role,
  companyName: u.companyName
});

const enrichOrder = (o) => {
  const buyerUser = users.find(u => u._id === String(o.buyer));
  const sellerUser = users.find(u => u._id === String(o.seller));
  return {
    ...o,
    buyerInfo: buyerUser ? enrichUser(buyerUser) : null,
    sellerInfo: sellerUser ? enrichUser(sellerUser) : null
  };
};

const generateOrderNo = () => {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return 'OG' + Date.now().toString().slice(-8) + rand;
};

// ============ 路由：用户 ============
app.post('/api/users/register', (req, res) => {
  const { username, password, email, role, companyName } = req.body;
  if (!username || !password) return res.status(400).json({ message: '用户名和密码必填' });
  if (users.find(u => u.username === username)) return res.status(409).json({ message: '用户名已存在' });

  // 严格禁止注册管理员账号
  if (role === 'admin') {
    return res.status(403).json({ message: '管理员账号不支持自主注册，请联系平台主管部门申请。' });
  }
  // 普通注册只能是买家或卖家
  const validRole = role === 'seller' ? 'seller' : 'buyer';
  const newUser = {
    _id: String(Date.now()),
    username, password, email,
    role: validRole,
    companyName: companyName || ''
  };
  users.push(newUser);
  const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: '注册成功', token, user: enrichUser(newUser) });
});

app.post('/api/users/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || user.password !== password) return res.status(401).json({ message: '用户名或密码错误' });
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: '登录成功', token, user: enrichUser(user) });
});

app.get('/api/users/profile', auth, (req, res) => {
  const user = users.find(u => u._id === String(req.user.id));
  if (!user) return res.status(404).json({ message: '用户不存在' });
  res.json(enrichUser(user));
});

app.put('/api/users/profile', auth, (req, res) => {
  const user = users.find(u => u._id === String(req.user.id));
  if (!user) return res.status(404).json({ message: '用户不存在' });
  const { email, companyName } = req.body;
  if (email) user.email = email;
  if (companyName) user.companyName = companyName;
  res.json({ message: '资料更新成功', user: enrichUser(user) });
});

app.get('/api/users', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: '权限不足' });
  res.json({ users: users.map(enrichUser), total: users.length });
});

// ============ 路由：商品 ============
app.get('/api/fruits', maybeAuth, (req, res) => {
  let result = fruits;
  const { category, keyword, limit, seller, status, includePending } = req.query;

  // 权限过滤
  if (req.user && req.user.role === 'admin' && includePending === 'true') {
    // 管理员请求包含待审核商品
  } else if (req.user && req.user.role === 'seller' && String(seller) === String(req.user.id)) {
    // 卖家可以看到自己的所有商品（包括待审核的）
  } else {
    // 普通查询只返回已审核通过的商品
    result = result.filter(f => !f.status || f.status === 'approved');
  }

  if (category) result = result.filter(f => f.category === category);
  if (seller) result = result.filter(f => String(f.seller) === String(seller));
  if (status) result = result.filter(f => f.status === status);
  if (keyword) result = result.filter(f =>
    f.name.includes(keyword) || f.origin.includes(keyword) || f.description.includes(keyword)
  );
  if (limit) result = result.slice(0, parseInt(limit));
  const enriched = result.map(f => {
    const sellerUser = users.find(x => x._id === String(f.seller));
    return {
      ...f,
      sellerId: f.seller,  // 保持字符串id，便于前端过滤
      seller: sellerUser ? enrichUser(sellerUser) : f.seller
    };
  });
  res.json({ fruits: enriched, total: enriched.length });
});

// 管理员审核严选商品
app.put('/api/fruits/:id/approve', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: '仅管理员可审核商品' });
  const f = fruits.find(x => x._id === req.params.id);
  if (!f) return res.status(404).json({ message: '商品不存在' });
  if (f.quality !== '严选') return res.status(400).json({ message: '只有严选商品需要审核' });
  
  const { approved } = req.body;
  if (approved) {
    f.status = 'approved';
    res.json({ message: '严选商品已审核通过', fruit: f });
  } else {
    f.status = 'rejected';
    res.json({ message: '严选商品已驳回', fruit: f });
  }
});

// 获取待审核的严选商品（管理员专用）
app.get('/api/fruits/pending', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: '仅管理员可查看待审核商品' });
  const pending = fruits.filter(f => f.quality === '严选' && f.status === 'pending');
  const enriched = pending.map(f => {
    const sellerUser = users.find(u => u._id === String(f.seller));
    return {
      ...f,
      sellerId: f.seller,
      seller: sellerUser ? enrichUser(sellerUser) : f.seller
    };
  });
  res.json({ fruits: enriched, total: enriched.length });
});

// 商品分类列表（必须在 /:id 之前定义，否则会被当作 id 匹配）
app.get('/api/fruits/categories', (req, res) => {
  const activeProductCategories = [...new Set(
    fruits
      .filter(f => !f.status || f.status === 'approved')
      .map(f => f.category)
  )];
  const activeCategories = categories.filter(c => activeProductCategories.includes(c.name));
  const names = activeCategories.map(c => c.name);
  res.json({ categories: names, fullList: activeCategories, total: names.length });
});

app.get('/api/fruits/:id', (req, res) => {
  const f = fruits.find(x => x._id === req.params.id);
  if (!f) return res.status(404).json({ message: '商品不存在' });
  const sellerUser = users.find(u => u._id === String(f.seller));
  const enriched = {
    ...f,
    sellerId: f.seller,
    seller: sellerUser ? enrichUser(sellerUser) : f.seller
  };
  res.json(enriched);
});

app.post('/api/fruits', auth, (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ message: '仅卖家可发布商品' });
  const { name, category, price, unit, origin, quality, description, stock } = req.body;
  if (!name || !price) return res.status(400).json({ message: '商品名和价格必填' });
  
  // 根据商品名/分类自动分配 emoji 和背景色
  const autoEmoji = (name.includes('猕猴桃') || name.includes('奇异果')) ? '🥝' :
                    (name.includes('樱桃')) ? '🍒' :
                    (name.includes('李子')) ? '🟣' : '🍊';
  const autoBg = (name.includes('猕猴桃') || name.includes('奇异果')) ? 'linear-gradient(135deg, #C5E1A5 0%, #81C784 100%)' :
                  (name.includes('樱桃')) ? 'linear-gradient(135deg, #F8BBD9 0%, #F48FB1 100%)' :
                  (name.includes('李子')) ? 'linear-gradient(135deg, #D1C4E9 0%, #9575CD 100%)' :
                  'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)';
  
  // 严选商品需要管理员审核，优选和普通商品可直接上架
  const isStrict = quality === '严选';
  const newFruit = {
    _id: String(Date.now()),
    name, category: category || '其他',
    price: parseFloat(price), unit: unit || '元/斤',
    origin: origin || '四川蒲江', quality: quality || '普通',
    description: description || '',
    stock: parseInt(stock) || 0, sold: 0,
    rating: 4.5,
    seller: req.user.id,
    status: isStrict ? 'pending' : 'approved', // 严选待审核，优选/普通直接上架
    emoji: autoEmoji,
    bgColor: autoBg,
    createdAt: new Date().toISOString()
  };
  fruits.push(newFruit);
  
  if (isStrict) {
    res.json({ message: '严选商品已提交，请等待管理员审核', fruit: newFruit });
  } else {
    res.json({ message: '商品已发布', fruit: newFruit });
  }
});

app.put('/api/fruits/:id', auth, (req, res) => {
  const f = fruits.find(x => x._id === req.params.id);
  if (!f) return res.status(404).json({ message: '商品不存在' });
  const fSeller = String(f.seller);
  const userId = String(req.user.id);
  if (fSeller !== userId && req.user.role !== 'admin') return res.status(403).json({ message: '无权限编辑' });
  Object.assign(f, req.body);
  res.json({ message: '商品已更新', fruit: f });
});

app.delete('/api/fruits/:id', auth, (req, res) => {
  const idx = fruits.findIndex(x => x._id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: '商品不存在' });
  const fruit = fruits[idx];
  // 确保 seller 和 req.user.id 都是字符串类型进行比较
  const sellerId = String(fruit.seller);
  const userId = String(req.user.id);
  if (sellerId !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: '无权限删除' });
  }
  fruits.splice(idx, 1);
  res.json({ message: '商品已删除' });
});

// ============ 路由：分类管理（仅管理员） ============
app.get('/api/categories', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: '仅管理员可管理分类' });
  res.json({ categories });
});

app.post('/api/categories', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: '仅管理员可管理分类' });
  const { name, description } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: '分类名称不能为空' });
  if (categories.find(c => c.name === name.trim())) return res.status(400).json({ message: '该分类已存在' });
  const newCat = { _id: String(Date.now()), name: name.trim(), description: description || '', createdAt: new Date().toISOString() };
  categories.push(newCat);
  res.json({ message: '分类添加成功', category: newCat });
});

app.delete('/api/categories/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: '仅管理员可管理分类' });
  const idx = categories.findIndex(c => c._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: '分类不存在' });
  categories.splice(idx, 1);
  res.json({ message: '分类已删除' });
});

// ============ 路由：订单 ============
app.get('/api/orders', auth, (req, res) => {
  const { status, limit } = req.query;
  let filtered = orders;
  // 统一使用 String() 确保类型比较一致
  const uid = String(req.user.id);
  if (req.user.role === 'buyer') filtered = filtered.filter(o => String(o.buyer) === uid);
  else if (req.user.role === 'seller') filtered = filtered.filter(o => String(o.seller) === uid);
  if (status) filtered = filtered.filter(o => o.status === status);
  filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (limit) filtered = filtered.slice(0, parseInt(limit));
  const enriched = filtered.map(enrichOrder);
  res.json({ orders: enriched, total: enriched.length });
});

app.get('/api/orders/:id', auth, (req, res) => {
  const o = orders.find(x => x._id === req.params.id);
  if (!o) return res.status(404).json({ message: '订单不存在' });
  const oBuyer = String(o.buyer);
  const oSeller = String(o.seller);
  const uid = String(req.user.id);
  if (req.user.role === 'buyer' && oBuyer !== uid) return res.status(403).json({ message: '无权查看' });
  if (req.user.role === 'seller' && oSeller !== uid) return res.status(403).json({ message: '无权查看' });
  res.json(enrichOrder(o));
});

app.post('/api/orders', auth, (req, res) => {
  if (req.user.role === 'admin') return res.status(403).json({ message: '管理员身份不支持下单，请切换至买家账号' });
  const { items, shippingAddress } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ message: '请选择商品' });
  if (!shippingAddress) return res.status(400).json({ message: '请填写收货地址' });

  let totalAmount = 0;
  const enrichedItems = [];
  const sellerId = items[0].seller;
  const sellerUser = users.find(u => u._id === String(sellerId));

  for (const item of items) {
    const f = fruits.find(x => x._id === String(item.fruit));
    if (!f) return res.status(400).json({ message: `商品 ${item.fruit} 不存在` });
    if (f.stock < item.quantity) return res.status(400).json({ message: `库存不足：${f.name}` });
    const total = f.price * item.quantity;
    totalAmount += total;
    enrichedItems.push({
      fruit: f._id, name: f.name, price: f.price, origin: f.origin,
      quality: f.quality, quantity: item.quantity, total
    });
    f.stock -= item.quantity;
    f.sold += item.quantity;
  }

  // 确定卖家发货仓库地址（优先读取卖家 profile 中的仓库地址）
  const sellerWarehouse = sellerUser
    ? (sellerUser.warehouse || sellerUser.companyName || sellerUser.origin || '四川蒲江·果园直接发货')
    : '四川蒲江·果园直接发货';

  const newOrder = {
    _id: String(Date.now()),
    orderNo: generateOrderNo(),
    buyer: req.user.id,
    seller: sellerId,
    items: enrichedItems,
    totalAmount: Math.round(totalAmount * 100) / 100,
    status: 'pending',
    shippingAddress,
    sellerWarehouse,
    logistics: null, // 卖家发货时填写：{company, trackingNo, note}
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  res.json({ message: '下单成功', order: enrichOrder(newOrder) });
});

app.put('/api/orders/:id/status', auth, (req, res) => {
  const o = orders.find(x => x._id === req.params.id);
  if (!o) return res.status(404).json({ message: '订单不存在' });
  // 确保 buyer/seller 和 req.user.id 都是字符串类型进行比较
  const orderBuyerId = String(o.buyer);
  const orderSellerId = String(o.seller);
  const userId = String(req.user.id);
  if (req.user.role === 'buyer' && orderBuyerId !== userId) return res.status(403).json({ message: '无权操作' });
  if (req.user.role === 'seller' && orderSellerId !== userId) return res.status(403).json({ message: '无权操作' });

  const { status, logistics } = req.body;
  const valid = ['pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ message: '无效的状态' });

  // 严格的角色 + 状态流转校验，杜绝越权操作
  // 买家的合法流转: pending → paid, pending → cancelled, shipped → delivered, delivered → completed
  // 卖家的合法流转: paid → shipped（必须填写物流信息）
  const buyerFromTo = {
    pending: ['paid', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['completed']
  };
  const sellerFromTo = { paid: ['shipped'] };

  if (req.user.role === 'buyer') {
    const allowed = buyerFromTo[o.status] || [];
    if (!allowed.includes(status)) {
      return res.status(403).json({ message: `当前订单状态不支持该操作（买家无法修改为"${status}"）` });
    }
  } else if (req.user.role === 'seller') {
    const allowed = sellerFromTo[o.status] || [];
    if (!allowed.includes(status)) {
      return res.status(403).json({ message: `当前订单状态不支持该操作（卖家无法修改为"${status}"）` });
    }
  } else if (req.user.role === 'admin') {
    // 管理员也不能随意操作订单状态
    return res.status(403).json({ message: '管理员无权修改订单状态，应由买卖双方自行处理' });
  }

  // 卖家发货时必须记录物流信息
  if (req.user.role === 'seller' && status === 'shipped') {
    if (!logistics || !logistics.trackingNo) {
      return res.status(400).json({ message: '发货必须填写物流单号' });
    }
  }

  // 卖家发货时记录物流信息
  if (status === 'shipped' && logistics) {
    o.logistics = {
      company: logistics.company || '顺丰快递',
      trackingNo: logistics.trackingNo || '',
      note: logistics.note || '',
      shippedAt: new Date().toISOString()
    };
  }

  o.status = status;
  res.json({ message: '订单状态已更新', order: enrichOrder(o) });
});

app.delete('/api/orders/:id', auth, (req, res) => {
  const idx = orders.findIndex(x => x._id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: '订单不存在' });
  const o = orders[idx];
  // 确保 buyer 和 req.user.id 都是字符串类型进行比较
  const buyerId = String(o.buyer);
  const userId = String(req.user.id);
  if (buyerId !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: '无权取消此订单' });
  }
  orders.splice(idx, 1);
  res.json({ message: '订单已取消' });
});

// ============ 路由：统计 ============
app.get('/api/stats/summary', auth, (req, res) => {
  let myOrders = orders;
  const uid = String(req.user.id);
  if (req.user.role === 'buyer') myOrders = orders.filter(o => String(o.buyer) === uid);
  else if (req.user.role === 'seller') myOrders = orders.filter(o => String(o.seller) === uid);

  const totalAmount = myOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const completed = myOrders.filter(o => o.status === 'completed');
  const paid = myOrders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered');
  const pending = myOrders.filter(o => o.status === 'pending');

  // 按商品聚合（卖家视角：最畅销商品；买家视角：最常购买）
  const itemMap = {};
  for (const o of myOrders) for (const it of o.items) {
    if (!itemMap[it.fruit]) itemMap[it.fruit] = { name: it.name, qty: 0, amount: 0 };
    itemMap[it.fruit].qty += it.quantity;
    itemMap[it.fruit].amount += it.total;
  }
  const topItems = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

  res.json({
    totalOrders: myOrders.length,
    totalAmount: Math.round(totalAmount * 100) / 100,
    completedCount: completed.length,
    paidCount: paid.length,
    pendingCount: pending.length,
    topItems
  });
});

// ============ 路由：行情 ============
app.get('/api/market/trends', (req, res) => {
  res.json({ data: marketData });
});

app.get('/api/market/price-index', (req, res) => {
  const categories = [...new Set(fruits.map(f => f.category))];
  const index = categories.map(cat => {
    const list = fruits.filter(f => f.category === cat);
    const avg = list.reduce((s, f) => s + f.price, 0) / list.length;
    return { category: cat, avgPrice: Math.round(avg * 100) / 100, count: list.length };
  });
  res.json({ index });
});

app.post('/api/market/data', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: '权限不足' });
  marketData.push(req.body);
  res.json({ message: '行情已录入' });
});

// ============ 路由：平台公告 ============
// 获取公告列表（公开，所有人可见）
app.get('/api/announcements', (req, res) => {
  // 按置顶优先、发布时间倒序排列
  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  res.json({ announcements: sorted, total: sorted.length });
});

// 发布公告（仅管理员）
app.post('/api/announcements', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: '仅管理员可发布公告' });
  const { title, content, type, level, pinned } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ message: '公告标题不能为空' });
  if (!content || !content.trim()) return res.status(400).json({ message: '公告内容不能为空' });

  const newAnnounce = {
    _id: String(Date.now()),
    title: title.trim(),
    content: content.trim(),
    type: type || 'info',
    level: level || 'normal',
    pinned: pinned || false,
    createdAt: new Date().toISOString()
  };
  announcements.unshift(newAnnounce);
  res.json({ message: '公告发布成功', announcement: newAnnounce });
});

// 删除公告（仅管理员）
app.delete('/api/announcements/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: '仅管理员可删除公告' });
  const idx = announcements.findIndex(a => a._id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: '公告不存在' });
  announcements.splice(idx, 1);
  res.json({ message: '公告已删除' });
});

// ============ 竞价中心 ============
let auctions = [
  {
    _id: 'A001',
    name: '特级蒲江丑柑（1000斤起拍）',
    description: '精选特级蒲江丑柑，皮薄汁多，酸甜可口，产自蒲江核心产区。1000斤起拍，整车发货。',
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=400&fit=crop',
    category: '柑橘类',
    seller: '2',
    startPrice: 6.0,
    currentPrice: 7.2,
    bidIncrement: 0.2,
    totalQuantity: 1000,
    unit: '元/斤',
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    bids: [
      { _id: 'b1', bidder: '3', bidderName: '采购商张总', amount: 6.0, time: new Date(Date.now() - 3600000).toISOString() },
      { _id: 'b2', bidder: '3', bidderName: '采购商李总', amount: 6.5, time: new Date(Date.now() - 1800000).toISOString() },
      { _id: 'b3', bidder: '3', bidderName: '采购商王总', amount: 7.2, time: new Date(Date.now() - 600000).toISOString() }
    ],
    bidCount: 3,
    winner: null,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    _id: 'A002',
    name: '有机猕猴桃（500斤）',
    description: '有机种植蒲江猕猴桃，无农药残留，果肉翠绿，香甜多汁。500斤起拍，顺丰冷链配送。',
    image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=600&h=400&fit=crop',
    category: '奇异果',
    seller: '2',
    startPrice: 10.0,
    currentPrice: 11.5,
    bidIncrement: 0.5,
    totalQuantity: 500,
    unit: '元/斤',
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    bids: [
      { _id: 'b1', bidder: '3', bidderName: '生鲜超市', amount: 10.0, time: new Date(Date.now() - 7200000).toISOString() },
      { _id: 'b2', bidder: '3', bidderName: '水果连锁店', amount: 11.5, time: new Date(Date.now() - 3600000).toISOString() }
    ],
    bidCount: 2,
    winner: null,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
  },
  {
    _id: 'A003',
    name: '极品樱桃（200斤）',
    description: '刚采摘的新鲜蒲江樱桃，果大饱满，甜度极高，限量200斤。',
    image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600&h=400&fit=crop',
    category: '樱桃',
    seller: '2',
    startPrice: 20.0,
    currentPrice: 23.0,
    bidIncrement: 1.0,
    totalQuantity: 200,
    unit: '元/斤',
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    bids: [
      { _id: 'b1', bidder: '3', bidderName: '高端水果店', amount: 20.0, time: new Date(Date.now() - 10800000).toISOString() },
      { _id: 'b2', bidder: '3', bidderName: '星级酒店采购', amount: 23.0, time: new Date(Date.now() - 5400000).toISOString() }
    ],
    bidCount: 2,
    winner: null,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    _id: 'A004',
    name: '春见耙耙柑（2000斤）',
    description: '已结束竞价的示例商品，最终成交价8.5元/斤。',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&h=400&fit=crop',
    category: '柑橘类',
    seller: '2',
    startPrice: 5.0,
    currentPrice: 8.5,
    bidIncrement: 0.3,
    totalQuantity: 2000,
    unit: '元/斤',
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ended',
    bids: [
      { _id: 'b1', bidder: '3', bidderName: '采购商A', amount: 5.0, time: new Date(Date.now() - 3 * 24 * 3600000).toISOString() },
      { _id: 'b2', bidder: '3', bidderName: '采购商B', amount: 6.0, time: new Date(Date.now() - 2.5 * 24 * 3600000).toISOString() },
      { _id: 'b3', bidder: '3', bidderName: '采购商C', amount: 7.5, time: new Date(Date.now() - 2 * 24 * 3600000).toISOString() },
      { _id: 'b4', bidder: '3', bidderName: '采购商A', amount: 8.5, time: new Date(Date.now() - 1.5 * 24 * 3600000).toISOString() }
    ],
    bidCount: 4,
    winner: '3',
    winnerName: '采购商A',
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString()
  }
];

// 检查并更新已结束的竞价
const checkAuctionStatus = () => {
  const now = new Date();
  auctions.forEach(a => {
    if (a.status === 'active' && new Date(a.endTime) <= now) {
      a.status = 'ended';
      if (a.bids.length > 0) {
        const highestBid = a.bids[a.bids.length - 1];
        a.winner = highestBid.bidder;
        a.winnerName = highestBid.bidderName;
      }
    }
  });
};

const enrichAuction = (a) => {
  const sellerUser = users.find(u => u._id === String(a.seller));
  checkAuctionStatus();
  return {
    ...a,
    sellerInfo: sellerUser ? enrichUser(sellerUser) : null
  };
};

// 获取竞价列表（公开）
app.get('/api/auctions', (req, res) => {
  checkAuctionStatus();
  const { status, category, page = 1, pageSize = 10 } = req.query;
  let filtered = [...auctions];
  if (status) filtered = filtered.filter(a => a.status === status);
  if (category) filtered = filtered.filter(a => a.category === category);
  filtered.sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    if (a.status === 'active') {
      return new Date(a.endTime) - new Date(b.endTime);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + parseInt(pageSize));
  const result = paginated.map(a => ({
    ...enrichAuction(a),
    bids: undefined
  }));
  res.json({ auctions: result, total: filtered.length, page: parseInt(page), pageSize: parseInt(pageSize) });
});

// 获取竞价详情（公开）
app.get('/api/auctions/:id', (req, res) => {
  checkAuctionStatus();
  const auction = auctions.find(a => a._id === req.params.id);
  if (!auction) return res.status(404).json({ message: '竞价不存在' });
  res.json({ auction: enrichAuction(auction) });
});

// 发布竞价（卖家）
app.post('/api/auctions', auth, (req, res) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ message: '仅卖家可发布竞价' });
  }
  const { name, description, image, category, startPrice, bidIncrement, totalQuantity, unit, durationHours } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: '商品名称必填' });
  if (!startPrice || startPrice <= 0) return res.status(400).json({ message: '起拍价必须大于0' });
  if (!bidIncrement || bidIncrement <= 0) return res.status(400).json({ message: '加价幅度必须大于0' });
  if (!totalQuantity || totalQuantity <= 0) return res.status(400).json({ message: '总数量必须大于0' });
  if (!durationHours || durationHours < 1) return res.status(400).json({ message: '竞价时长至少1小时' });

  const newAuction = {
    _id: 'A' + Date.now().toString().slice(-6),
    name: name.trim(),
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=400&fit=crop',
    category: category || '柑橘类',
    seller: req.user.id,
    startPrice: parseFloat(startPrice),
    currentPrice: parseFloat(startPrice),
    bidIncrement: parseFloat(bidIncrement),
    totalQuantity: parseInt(totalQuantity),
    unit: unit || '元/斤',
    endTime: new Date(Date.now() + parseInt(durationHours) * 60 * 60 * 1000).toISOString(),
    status: 'active',
    bids: [],
    bidCount: 0,
    winner: null,
    createdAt: new Date().toISOString()
  };
  auctions.unshift(newAuction);
  res.json({ message: '竞价发布成功', auction: enrichAuction(newAuction) });
});

// 出价（买家）
app.post('/api/auctions/:id/bid', auth, (req, res) => {
  if (req.user.role !== 'buyer' && req.user.role !== 'admin') {
    return res.status(403).json({ message: '仅买家可参与竞价' });
  }
  checkAuctionStatus();
  const auction = auctions.find(a => a._id === req.params.id);
  if (!auction) return res.status(404).json({ message: '竞价不存在' });
  if (auction.status !== 'active') return res.status(400).json({ message: '该竞价已结束，无法出价' });

  const { amount } = req.body;
  const bidAmount = parseFloat(amount);
  if (!bidAmount || bidAmount <= 0) return res.status(400).json({ message: '出价金额无效' });

  const minBid = auction.currentPrice + auction.bidIncrement;
  if (bidAmount < minBid) {
    return res.status(400).json({ message: `出价必须不低于 ${minBid.toFixed(2)} 元` });
  }

  const user = users.find(u => u._id === String(req.user.id));
  const newBid = {
    _id: 'b' + Date.now(),
    bidder: req.user.id,
    bidderName: user?.username || '匿名买家',
    amount: bidAmount,
    time: new Date().toISOString()
  };
  auction.bids.push(newBid);
  auction.currentPrice = bidAmount;
  auction.bidCount = auction.bids.length;
  res.json({ message: '出价成功', auction: enrichAuction(auction), bid: newBid });
});

// 卖家取消竞价
app.delete('/api/auctions/:id', auth, (req, res) => {
  const auction = auctions.find(a => a._id === req.params.id);
  if (!auction) return res.status(404).json({ message: '竞价不存在' });
  if (auction.seller !== String(req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: '无权限操作此竞价' });
  }
  if (auction.bids.length > 0 && req.user.role !== 'admin') {
    return res.status(400).json({ message: '已有出价的竞价不能取消，请联系管理员' });
  }
  auction.status = 'cancelled';
  res.json({ message: '竞价已取消' });
});

// 获取我的竞价列表（买家：我参与的；卖家：我发布的）
app.get('/api/auctions/my/list', auth, (req, res) => {
  checkAuctionStatus();
  let myAuctions = [];
  if (req.user.role === 'seller' || req.user.role === 'admin') {
    myAuctions = auctions.filter(a => a.seller === String(req.user.id));
  }
  if (req.user.role === 'buyer' || req.user.role === 'admin') {
    const bidAuctions = auctions.filter(a => a.bids.some(b => b.bidder === String(req.user.id)));
    const ids = new Set(myAuctions.map(a => a._id));
    bidAuctions.forEach(a => { if (!ids.has(a._id)) myAuctions.push(a); });
  }
  myAuctions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const result = myAuctions.map(a => ({ ...enrichAuction(a), bids: undefined }));
  res.json({ auctions: result, total: result.length });
});

// ============ 根路径 ============
app.get('/', (req, res) => {
  res.json({ message: '成都万果数字交易平台 API 服务运行中', time: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🍊 成都万果数字交易平台后端已启动: http://localhost:${PORT}`);
  console.log(`👤 测试账号: admin/admin123 | seller/seller123 | buyer/buyer123`);
});
