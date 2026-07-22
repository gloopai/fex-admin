# 流动性产品品种字段设计

## 目标

在 `/admin/liquidity/locked/products` 的创建/编辑弹窗“基础信息”区域增加“产品品种”字段。

## 设计

- 字段使用 Select，选项与“计价币种”一致，复用 `SUPPORTED_CURRENCIES`。
- 表单字段名为 `productCurrency`，新建时默认 `USDT`。
- 编辑演示数据时优先读取 `product.productCurrency`；旧数据没有该字段时回退到 `product.currency`。
- 保存产品时将选中值写入 `productCurrency`。
- 不修改产品列表、前台页面、筛选器或现有 mock 数据，保持演示项目改动最小。

## 验证

- 自动检查表单默认值、编辑回填、保存载荷和 Select 绑定。
- 运行现有测试与生产构建，确认没有回归。
