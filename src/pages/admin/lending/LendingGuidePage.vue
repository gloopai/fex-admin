<script setup>
import { ref } from 'vue'

const activeTab = ref('introduction')

const tabs = [
  { id: 'introduction', label: '产品介绍', icon: '📖' },
  { id: 'terminology', label: '名词解释', icon: '📚' },
  { id: 'admin-guide', label: '管理操作', icon: '⚙️' },
  { id: 'user-guide', label: '用户操作', icon: '👤' },
  { id: 'examples', label: '操作示例', icon: '💡' },
  { id: 'faq', label: '常见问题', icon: '❓' },
  { id: 'risk', label: '风险提示', icon: '⚠️' }
]

const expandedFaqs = ref([])

const toggleFaq = (index) => {
  const pos = expandedFaqs.value.indexOf(index)
  if (pos > -1) {
    expandedFaqs.value.splice(pos, 1)
  } else {
    expandedFaqs.value.push(index)
  }
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-3xl font-semibold text-slate-900">规则说明</h1>
      <p class="mt-1 text-sm text-slate-500">详细了解加密货币抵押借贷的规则、使用方式与风险控制</p>
    </header>

    <!-- 导航栏 -->
    <article class="rounded-xl border border-slate-200 bg-white p-4">
      <nav class="flex flex-wrap gap-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['px-4 py-2 text-sm font-medium rounded-lg transition',
            activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200']"
        >
          <span class="mr-1">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </nav>
    </article>

    <!-- 内容区域 -->

    <!-- 产品介绍 -->
    <article v-if="activeTab === 'introduction'" class="space-y-4">
      <div class="rounded-xl border border-slate-200 bg-white p-6">
        <h2 class="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-2xl">🔐</span>
          什么是加密货币抵押借贷？
        </h2>
        <p class="mt-3 text-sm leading-relaxed text-slate-700">
          加密货币抵押借贷是平台提供的<strong class="text-blue-600">数字资产金融服务</strong>，用户可以通过抵押账户内的加密货币资产来借入稳定币或其他数字货币，无需出售原有资产即可获得流动性。平台作为资金提供方和风险管理方，为用户提供安全便捷的借贷服务。
        </p>

        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h3 class="font-semibold text-emerald-900 flex items-center gap-2">
              <span>✅</span> 核心优势
            </h3>
            <ul class="mt-2 space-y-1 text-sm text-emerald-800">
              <li>• <strong>无需出售资产：</strong>保留加密货币的升值潜力</li>
              <li>• <strong>快速审批：</strong>系统自动审核，实时放款到账户</li>
              <li>• <strong>灵活还款：</strong>支持部分还款、利息先还等多种方式</li>
              <li>• <strong>平台托管：</strong>平台专业风控，资产安全有保障</li>
              <li>• <strong>费率透明：</strong>所有利率和费用公开透明，无隐藏成本</li>
            </ul>
          </div>
          
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 class="font-semibold text-blue-900 flex items-center gap-2">
              <span>📦</span> 产品类型
            </h3>
            <ul class="mt-2 space-y-1 text-sm text-blue-800">
              <li>• <strong>固定利率产品：</strong>利率恒定，成本可预测，适合风险厌恶型用户</li>
              <li>• <strong>浮动利率产品：</strong>跟随市场利率波动，可能获得更优惠的成本</li>
              <li>• <strong>阶梯利率产品：</strong>按借款金额分档，大额享受优惠利率</li>
              <li>• <strong>超短期借贷：</strong>7天内短期资金需求，日息计算</li>
              <li>• <strong>大额专享：</strong>针对高净值用户，更高LTV和更低利率</li>
              <li>• <strong>稳定币借贷：</strong>稳定币对稳定币，低风险低利率</li>
            </ul>
          </div>
        </div>
      </div>
    </article>

    <!-- 名词解释 -->
    <article v-if="activeTab === 'terminology'" class="space-y-3">
      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h3 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-xl">📊</span>
          LTV (Loan-to-Value Ratio)
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-700">
          贷款价值比，表示借款金额与抵押品价值的比率。例如：抵押10万美元的BTC，借出7万USDT，LTV为70%。
        </p>
        <div class="mt-2 rounded-lg bg-slate-50 p-3">
          <p class="text-xs text-slate-600"><strong>示例：</strong>如果您抵押价值100,000 USDT的BTC，在LTV为70%的产品中，最多可借出70,000 USDT。</p>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h3 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-xl">⚡</span>
          清算阈值 (Liquidation Threshold)
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-700">
          触发强制清算的LTV临界值。当抵押品价值下降导致LTV超过此阈值时，系统将自动清算部分或全部抵押品。
        </p>
        <div class="mt-2 rounded-lg bg-slate-50 p-3">
          <p class="text-xs text-slate-600"><strong>示例：</strong>清算阈值为85%时，如果BTC价格下跌导致LTV达到85%，系统将启动清算程序。</p>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h3 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-xl">💰</span>
          年化利率 (APR)
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-700">
          按年计算的借款利息率，不包括复利效果。实际利息按日计算。平台支持三种利率模式：
        </p>
        <div class="mt-2 space-y-2">
          <div class="rounded-lg bg-emerald-50 p-3 border border-emerald-200">
            <p class="text-xs font-semibold text-emerald-900">🔒 固定利率</p>
            <p class="text-xs text-emerald-800 mt-1">利率在整个借款期间保持不变，适合需要确定性成本的用户。</p>
            <p class="text-xs text-emerald-700 mt-1"><strong>示例：</strong>年化8.5%，借10,000 USDT 30天，利息 = 10,000 × 8.5% × 30/365 = 69.86 USDT</p>
          </div>
          <div class="rounded-lg bg-blue-50 p-3 border border-blue-200">
            <p class="text-xs font-semibold text-blue-900">📈 浮动利率</p>
            <p class="text-xs text-blue-800 mt-1">根据市场基准利率自动调整，计算公式：实际利率 = (基准利率 × 浮动系数) + 利差。有最低和最高利率限制。</p>
            <p class="text-xs text-blue-700 mt-1"><strong>示例：</strong>基准8% × 系数1.2 + 利差2% = 11.6%（会在5%-15%范围内浮动）</p>
          </div>
          <div class="rounded-lg bg-purple-50 p-3 border border-purple-200">
            <p class="text-xs font-semibold text-purple-900">📊 阶梯利率</p>
            <p class="text-xs text-purple-800 mt-1">根据借款金额自动匹配不同档位的利率，金额越大利率越优惠。</p>
            <p class="text-xs text-purple-700 mt-1"><strong>示例：</strong>0-1万:10%，1-5万:8.5%，5万+:7%。借2.5万自动适用8.5%利率</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h3 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-xl">🔄</span>
          利差 (Spread)
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-700">
          浮动利率产品中，在基准利率基础上额外增加的固定百分点，用于覆盖平台运营成本和风险溢价。
        </p>
        <div class="mt-2 rounded-lg bg-slate-50 p-3">
          <p class="text-xs text-slate-600"><strong>示例：</strong>基准利率为8%，利差为2%，浮动系数为1.0，则实际借款利率为 8% + 2% = 10%</p>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h3 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-xl">⚙️</span>
          浮动系数 (Floating Factor)
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-700">
          浮动利率产品中，应用于基准利率的倍数。系数大于1表示平台利率高于基准，小于1表示低于基准。
        </p>
        <div class="mt-2 rounded-lg bg-slate-50 p-3">
          <p class="text-xs text-slate-600"><strong>示例：</strong>基准利率8%，系数1.2，利差2%，则实际利率 = 8% × 1.2 + 2% = 11.6%</p>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h3 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-xl">⚠️</span>
          清算罚金
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-700">
          清算时收取的额外费用，作为风险补偿。通常为清算金额的5-10%。
        </p>
        <div class="mt-2 rounded-lg bg-slate-50 p-3">
          <p class="text-xs text-slate-600"><strong>示例：</strong>清算罚金5%时，清算10,000 USDT的债务，需额外支付500 USDT罚金。</p>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h3 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-xl">💚</span>
          健康度 (Health Factor)
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-700">
          衡量借贷头寸安全性的指标，计算公式：(抵押品价值 × 清算阈值) / 总债务。健康度低于1时将被清算。
        </p>
        <div class="mt-2 rounded-lg bg-slate-50 p-3">
          <p class="text-xs text-slate-600"><strong>示例：</strong>抵押10万USDT，借5万，清算阈值85%，健康度 = (100,000 × 85%) / 50,000 = 1.7</p>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h3 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-xl">⭐</span>
          信用评分
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-700">
          基于历史借还记录、逾期情况、清算次数等因素计算的用户信用评级，影响可借额度和利率。
        </p>
        <div class="mt-2 rounded-lg bg-slate-50 p-3">
          <p class="text-xs text-slate-600"><strong>示例：</strong>信用评分850分的用户可享受更低利率和更高贷款额度。</p>
        </div>
      </div>
    </article>


    <!-- 管理操作 -->
    <article v-if="activeTab === 'admin-guide'" class="space-y-4">
      <!-- 产品配置指引（管理员） -->
      <div class="rounded-xl border border-purple-200 bg-purple-50 p-6">
        <h2 class="text-xl font-semibold text-purple-900 flex items-center gap-2">
          <span class="text-2xl">⚙️</span>
          产品配置指南（管理员）
        </h2>
        <p class="mt-2 text-sm text-purple-800">完整的借贷产品配置流程，支持固定利率、浮动利率和阶梯利率三种模式</p>
        
        <div class="mt-4 space-y-4">
          <!-- Tab导航说明 -->
          <div class="rounded-lg border border-purple-300 bg-white p-4">
            <h3 class="font-semibold text-purple-900 flex items-center gap-2">
              📑 配置界面分组
            </h3>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h4 class="text-sm font-semibold text-slate-900">📋 基本配置</h4>
                <ul class="mt-1 space-y-1 text-xs text-slate-700">
                  <li>• 产品名称、抵押币种、借出币种</li>
                  <li>• 借款额度范围（最小/最大）</li>
                  <li>• 借款期限范围（最短/最长天数）</li>
                  <li>• 产品状态（活跃/停用/暂停）</li>
                </ul>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h4 class="text-sm font-semibold text-slate-900">💰 利率设置</h4>
                <ul class="mt-1 space-y-1 text-xs text-slate-700">
                  <li>• 固定利率：直接设置年化利率</li>
                  <li>• 浮动利率：基准+系数+利差模式</li>
                  <li>• 阶梯利率：按借款金额分档</li>
                </ul>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h4 class="text-sm font-semibold text-slate-900">🛡️ 风控设置</h4>
                <ul class="mt-1 space-y-1 text-xs text-slate-700">
                  <li>• LTV比率（建议50-75%）</li>
                  <li>• 清算阈值（必须大于LTV）</li>
                  <li>• 可用流动性资金池</li>
                </ul>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h4 class="text-sm font-semibold text-slate-900">📝 其他信息</h4>
                <ul class="mt-1 space-y-1 text-xs text-slate-700">
                  <li>• 产品描述和适用场景</li>
                  <li>• 实时预览所有配置</li>
                  <li>• 风险参数智能提示</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 利率类型详解 -->
          <div class="rounded-lg border border-purple-300 bg-white p-4">
            <h3 class="font-semibold text-purple-900 flex items-center gap-2 mb-3">
              📊 三种利率模式详解
            </h3>

            <!-- 固定利率 -->
            <div class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <h4 class="text-sm font-semibold text-emerald-900 flex items-center gap-1">
                <span>🔒</span> 固定利率
              </h4>
              <p class="mt-2 text-xs text-emerald-800">
                <strong>适用场景：</strong>市场稳定时期，用户需要确定性成本
              </p>
              <div class="mt-2 space-y-1 text-xs text-emerald-700">
                <p><strong>配置项：</strong></p>
                <ul class="ml-4 list-disc">
                  <li>年化利率（%）：直接输入固定值，如 8.5%</li>
                </ul>
                <p class="mt-2"><strong>示例：</strong>用户借款10,000 USDT，年化8.5%，30天利息 = 10,000 × 8.5% × 30/365 = 69.86 USDT</p>
              </div>
            </div>

            <!-- 浮动利率 -->
            <div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <h4 class="text-sm font-semibold text-blue-900 flex items-center gap-1">
                <span>📈</span> 浮动利率（专业模式）
              </h4>
              <p class="mt-2 text-xs text-blue-800">
                <strong>适用场景：</strong>需要根据市场利率自动调整，降低平台成本风险
              </p>
              <div class="mt-2 space-y-2 text-xs text-blue-700">
                <div class="rounded border border-blue-300 bg-white p-2">
                  <p class="font-semibold mb-1">📌 基准设置：</p>
                  <ul class="ml-4 list-disc space-y-0.5">
                    <li><strong>参考利率：</strong>内部基准/LIBOR/SOFR/联邦基金利率</li>
                    <li><strong>基准利率：</strong>当前参考利率的数值（如8.0%）</li>
                  </ul>
                </div>
                <div class="rounded border border-blue-300 bg-white p-2">
                  <p class="font-semibold mb-1">📌 利率计算：</p>
                  <ul class="ml-4 list-disc space-y-0.5">
                    <li><strong>浮动系数：</strong>应用于基准利率的倍数（如1.2x）</li>
                    <li><strong>利差：</strong>固定附加点数（如+2.0%）</li>
                    <li><strong>计算公式：</strong>实际利率 = (基准利率 × 浮动系数) + 利差</li>
                  </ul>
                  <p class="mt-1 text-blue-800"><strong>示例：</strong>基准8% × 系数1.2 + 利差2% = 11.6%</p>
                </div>
                <div class="rounded border border-blue-300 bg-white p-2">
                  <p class="font-semibold mb-1">📌 利率限制：</p>
                  <ul class="ml-4 list-disc space-y-0.5">
                    <li><strong>最低利率：</strong>保护借款人的利率下限（如5%）</li>
                    <li><strong>最高利率：</strong>保护平台的利率上限（如15%）</li>
                  </ul>
                </div>
                <div class="rounded border border-blue-300 bg-white p-2">
                  <p class="font-semibold mb-1">📌 调整规则：</p>
                  <ul class="ml-4 list-disc space-y-0.5">
                    <li><strong>调整周期：</strong>每日/每周/每月自动重新计算</li>
                    <li><strong>调整阈值：</strong>触发调整的最小变化幅度（如0.5%）</li>
                    <li><strong>自动调整：</strong>启用后市场变化超过阈值自动调整</li>
                  </ul>
                </div>
              </div>
              <div class="mt-2 rounded border border-blue-300 bg-blue-100 p-2">
                <p class="text-xs text-blue-900">
                  <strong>💡 实时预览：</strong>右侧预览区会显示当前配置的实际利率，以及所有参数的即时计算结果
                </p>
              </div>
            </div>

            <!-- 阶梯利率 -->
            <div class="rounded-lg border border-purple-200 bg-purple-50 p-3">
              <h4 class="text-sm font-semibold text-purple-900 flex items-center gap-1">
                <span>📊</span> 阶梯利率
              </h4>
              <p class="mt-2 text-xs text-purple-800">
                <strong>适用场景：</strong>鼓励大额借贷，借款金额越大利率越低
              </p>
              <div class="mt-2 space-y-1 text-xs text-purple-700">
                <p><strong>配置方式：</strong></p>
                <ul class="ml-4 list-disc">
                  <li>可添加多个金额档位</li>
                  <li>每个档位设置：最小金额、最大金额、对应利率</li>
                  <li>系统自动根据借款金额匹配对应档位</li>
                </ul>
                <div class="mt-2 rounded border border-purple-300 bg-white p-2">
                  <p class="font-semibold">示例配置：</p>
                  <ul class="mt-1 space-y-0.5 text-xs">
                    <li>• 档位1: 0 - 10,000 USDT → 10.0%（小额高息）</li>
                    <li>• 档位2: 10,000 - 50,000 USDT → 8.5%（中等）</li>
                    <li>• 档位3: 50,000+ USDT → 7.0%（大额优惠）</li>
                  </ul>
                </div>
                <p class="mt-1"><strong>自动匹配：</strong>用户借款25,000 USDT自动适用8.5%利率</p>
              </div>
            </div>
          </div>

          <!-- 实时预览功能 -->
          <div class="rounded-lg border border-purple-300 bg-white p-4">
            <h3 class="font-semibold text-purple-900 flex items-center gap-2">
              👁️ 实时预览功能
            </h3>
            <ul class="mt-2 space-y-1 text-sm text-purple-800">
              <li>✓ 右侧40%区域实时显示产品卡片预览</li>
              <li>✓ 所有参数修改即时反映在预览中</li>
              <li>✓ 智能风险提示：
                <ul class="ml-6 mt-1 space-y-0.5 text-xs">
                  <li>• 🔴 LTV ≥ 清算阈值：显示错误提示</li>
                  <li>• 🟡 安全边际 < 5%：显示风险警告</li>
                  <li>• 🟢 参数合理：显示确认信息</li>
                </ul>
              </li>
              <li>✓ 浮动利率自动计算并显示实际利率</li>
              <li>✓ 阶梯利率显示所有档位配置</li>
            </ul>
          </div>

          <!-- 配置建议 -->
          <div class="rounded-lg border border-purple-300 bg-white p-4">
            <h3 class="font-semibold text-purple-900 flex items-center gap-2">
              💡 配置最佳实践
            </h3>
            <div class="mt-3 space-y-2 text-sm text-purple-800">
              <div class="rounded bg-purple-50 p-2">
                <p class="font-semibold">🎯 LTV设置：</p>
                <ul class="mt-1 ml-4 text-xs list-disc">
                  <li>保守型：50-60%（适合高波动资产）</li>
                  <li>标准型：60-70%（适合主流币种）</li>
                  <li>激进型：70-75%（仅限稳定币）</li>
                </ul>
              </div>
              <div class="rounded bg-purple-50 p-2">
                <p class="font-semibold">🛡️ 清算阈值：</p>
                <ul class="mt-1 ml-4 text-xs list-disc">
                  <li>建议比LTV高出10-15个百分点</li>
                  <li>留出足够的预警和处置时间</li>
                  <li>考虑资产的历史波动率</li>
                </ul>
              </div>
              <div class="rounded bg-purple-50 p-2">
                <p class="font-semibold">📊 利率模式选择：</p>
                <ul class="mt-1 ml-4 text-xs list-disc">
                  <li>新手用户：推荐固定利率，简单易懂</li>
                  <li>市场跟踪：推荐浮动利率，自动调节</li>
                  <li>大户激励：推荐阶梯利率，梯度优惠</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

    </article>

    <!-- 用户操作 -->
    <article v-if="activeTab === 'user-guide'" class="space-y-4">
      <!-- 用户操作流程 -->
      <div class="rounded-xl border border-slate-200 bg-white p-6">
        <h2 class="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-2xl">🚀</span>
          用户借贷流程
        </h2>
        <div class="mt-4 space-y-3">
          <div class="flex gap-4">
            <div class="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              1
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-slate-900">📋 申请借贷</h3>
              <ul class="mt-2 space-y-1 text-sm text-slate-600">
                <li>• 从现货账户选择可用的抵押资产</li>
                <li>• 系统根据资产价值自动计算可借额度</li>
                <li>• 输入抵押数量和借款金额</li>
                <li>• 选择借款期限和产品类型</li>
                <li>• 查看利率、LTV和清算价格</li>
                <li>• 提交申请，抵押资产自动从现货账户转入并冻结</li>
                <li>• 系统实时审核，借款立即到账借贷账户</li>
              </ul>
              <div class="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p class="text-xs text-blue-800">💡 <strong>提示：</strong>建议LTV保持在60%以下，预留足够的安全空间。首次借贷建议选择较低LTV产品。</p>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              2
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-slate-900">👀 监控头寸</h3>
              <ul class="mt-2 space-y-1 text-sm text-slate-600">
                <li>• 在“订单管理”页面查看所有借贷订单</li>
                <li>• 实时关注当前LTV、清算价格和风险等级</li>
                <li>• 开启价格预警通知（站内信/短信/邮件）</li>
                <li>• 平台会在市场波动时主动推送风险提示</li>
                <li>• 定期检查抵押品价格和账户健康度</li>
              </ul>
              <div class="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p class="text-xs text-amber-800">⚠️ <strong>警告：</strong>当LTV超过70%时系统发送黄色预警，超过80%时发送红色警报，请及时处理。</p>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              3
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-slate-900">💰 还款操作</h3>
              <div class="mt-2 space-y-2">
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <h4 class="text-sm font-semibold text-slate-900">还款方式：</h4>
                  <ul class="mt-1 space-y-1 text-sm text-slate-700">
                    <li>• <strong>仅还利息：</strong>保持本金不变，延长借款期限</li>
                    <li>• <strong>部分还款：</strong>降低债务和LTV，按比例解锁抵押品</li>
                    <li>• <strong>全额还款：</strong>清偿所有债务，全部抵押品返回现货账户</li>
                    <li>• <strong>自动还款：</strong>设置到期自动从账户扣款，避免逾期</li>
                  </ul>
                </div>
                <div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p class="text-xs text-blue-800">💡 <strong>提示：</strong>提前还款无违约金。还款后抵押品立即解锁至现货账户，可随时提币或交易。</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              4
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-slate-900">➕ 追加抵押</h3>
              <p class="mt-2 text-sm text-slate-600">当抵押品价格下跌时，可从现货账户追加抵押降低LTV：</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-600">
                <li>• 进入借贷订单详情页</li>
                <li>• 查看当前LTV和风险等级</li>
                <li>• 点击“追加抵押”按钮</li>
                <li>• 选择从现货账户追加的币种和数量</li>
                <li>• 确认后资产立即从现货账户转入并冻结</li>
                <li>• LTV实时更新，风险等级下降</li>
              </ul>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              5
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-slate-900">⚡ 清算处理</h3>
              <p class="mt-2 text-sm text-slate-600">当LTV达到清算阈值时：</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-600">
                <li>• 平台风控系统发出预警通知（站内信/短信/邮件）</li>
                <li>• 若未及时处理，达到清算线后系统启动清算</li>
                <li>• 平台按当前市价处置抵押资产</li>
                <li>• 优先偿还债务本金、利息和清算罚金</li>
                <li>• 剩余抵押品（如有）返回现货账户</li>
                <li>• 清算记录将影响账户信用评分</li>
              </ul>
              <div class="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
                <p class="text-xs text-rose-800">⚠️ <strong>重要提醒：</strong>清算会产生额外费用并降低信用评分，影响后续借贷条件。建议密切关注市场波动，及时追加抵押或还款以避免清算。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>


    <!-- 操作示例 -->
    <article v-if="activeTab === 'examples'" class="space-y-4">
      <div class="rounded-xl border border-slate-200 bg-white p-6">
        <h2 class="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-2xl">💡</span>
          实际操作案例
        </h2>
        
        <div class="mt-4 space-y-4">
          <!-- 示例1 -->
          <div class="rounded-lg border border-slate-200 p-4">
            <h3 class="font-semibold text-slate-900 flex items-center gap-2">
              <span>📌</span> 案例1：BTC标准借贷
            </h3>
            <div class="mt-3 rounded-lg bg-slate-50 p-3">
              <p class="text-sm text-slate-700"><strong>场景：</strong>用户持有2个BTC（当前价格50,000 USDT/BTC），需要70,000 USDT的流动性</p>
            </div>
            <div class="mt-3 space-y-2 text-sm text-slate-700">
              <p><strong>操作步骤：</strong></p>
              <ol class="ml-4 space-y-1 list-decimal">
                <li>选择"BTC标准借贷"产品（LTV 70%，清算阈值85%，年化利率8.5%）</li>
                <li>抵押2个BTC，价值100,000 USDT</li>
                <li>可借金额：100,000 × 70% = 70,000 USDT</li>
                <li>选择借款期限90天</li>
                <li>预计利息：70,000 × 8.5% × 90/365 = 1,465 USDT</li>
                <li>清算价格：70,000 / (2 × 0.85) = 41,176 USDT/BTC</li>
              </ol>
            </div>
            <div class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p class="text-sm text-emerald-800"><strong>结果：</strong>立即获得70,000 USDT，保留BTC升值潜力，BTC价格跌破41,176时触发清算。</p>
            </div>
          </div>

          <!-- 示例2 -->
          <div class="rounded-lg border border-slate-200 p-4">
            <h3 class="font-semibold text-slate-900 flex items-center gap-2">
              <span>📌</span> 案例2：市场下跌应对策略
            </h3>
            <div class="mt-3 rounded-lg bg-slate-50 p-3">
              <p class="text-sm text-slate-700"><strong>场景：</strong>BTC价格从50,000跌至45,000，LTV从70%升至77.8%</p>
            </div>
            <div class="mt-3 space-y-2 text-sm text-slate-700">
              <p><strong>操作步骤：</strong></p>
              <ol class="ml-4 space-y-1 list-decimal">
                <li>原始状态：抵押2 BTC (100,000 USDT)，借款70,000 USDT，LTV 70%</li>
                <li>BTC跌至45,000：抵押品价值90,000 USDT，LTV = 70,000/90,000 = 77.8%</li>
                <li>距离清算阈值85%还有7.2%的空间</li>
                <li><strong>策略1：</strong>追加0.35 BTC抵押，LTV降至70%</li>
                <li><strong>策略2：</strong>部分还款10,000 USDT，LTV降至66.7%</li>
                <li><strong>策略3：</strong>不操作，继续监控市场</li>
              </ol>
            </div>
            <div class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p class="text-sm text-emerald-800"><strong>结果：</strong>选择策略后，安全空间增大，避免清算风险。</p>
            </div>
          </div>

          <!-- 示例3 -->
          <div class="rounded-lg border border-slate-200 p-4">
            <h3 class="font-semibold text-slate-900 flex items-center gap-2">
              <span>📌</span> 案例3：还款策略优化
            </h3>
            <div class="mt-3 rounded-lg bg-slate-50 p-3">
              <p class="text-sm text-slate-700"><strong>场景：</strong>已借款30天，累计利息465 USDT，考虑还款方案</p>
            </div>
            <div class="mt-3 space-y-2 text-sm text-slate-700">
              <p><strong>操作步骤：</strong></p>
              <div class="ml-4 space-y-2">
                <div class="rounded-lg border border-slate-200 bg-white p-3">
                  <p><strong>当前债务：</strong>70,000 + 465 = 70,465 USDT</p>
                  <p class="mt-2"><strong>方案对比：</strong></p>
                  <ul class="mt-1 space-y-1 text-xs">
                    <li>• 方案1：仅还利息465 USDT，保持借款本金</li>
                    <li>• 方案2：还款20,465 USDT（利息+部分本金），降低LTV至55.6%</li>
                    <li>• 方案3：全额还款70,465 USDT，取回全部BTC</li>
                    <li>• 方案4：设置自动还款，每月支付利息</li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p class="text-sm text-emerald-800"><strong>结果：</strong>根据市场预期和资金状况选择最优方案。</p>
            </div>
          </div>
        </div>
      </div>
    </article>


    <!-- 常见问题 -->
    <article v-if="activeTab === 'faq'" class="space-y-3">
      <div v-for="(faq, idx) in [
        { q: '如何选择合适的利率模式？', a: '固定利率：适合风险厌恶型用户，成本确定；浮动利率：适合愿意承受市场波动的用户，可能获得更优惠的利率，但需关注市场变化；阶梯利率：适合大额借款用户，金额越大优惠越多。建议首次使用选择固定利率产品。' },
        { q: '浮动利率会如何调整？什么时候调整？', a: '浮动利率根据设定的参考指标（如LIBOR、SOFR或内部基准利率）自动计算。调整周期可选每日、每周或每月。计算公式：实际利率 = (基准利率 × 浮动系数) + 利差。同时受最低和最高利率限制保护。启用自动调整后，当基准利率变化超过设定阈值时会触发调整。' },
        { q: '阶梯利率的档位如何匹配？', a: '系统根据您的实际借款金额自动匹配对应的利率档位。例如：0-1万为10%，1-5万为8.5%，5万以上为7%。如果您借款2.5万，自动适用8.5%。注意：部分还款可能导致借款金额降至较低档位，利率会相应调整。' },
        { q: '借款需要多长时间到账？', a: '审核和放款过程完全自动化，系统会立即从您的现货账户扣除抵押资产并冻结，借款资金实时到账至您的借贷账户，整个过程通常在1分钟内完成。' },
        { q: '可以提前还款吗？有违约金吗？', a: '支持随时提前还款，没有任何违约金或提前还款费用。还款后多余的抵押品会立即解锁并返回到您的现货账户。' },
        { q: '清算是如何进行的？', a: '当LTV达到清算阈值时，平台风控系统会自动触发清算预警，若继续恶化则启动清算程序。平台会按市价处置部分抵押品，用于偿还债务、利息和清算罚金。剩余抵押品会退回到您的账户。' },
        { q: '如何避免被清算？', a: '1) 保持较低的LTV（建议60%以下）；2) 开启价格预警通知；3) 市场波动时及时从现货账户追加抵押；4) 部分还款降低债务；5) 选择清算阈值更高的产品。' },
        { q: '利息是如何计算的？', a: '固定利率：利息 = 借款金额 × 年化利率 × 天数 / 365。浮动利率：利率会根据周期调整，每期利息分别计算。阶梯利率：根据当前借款金额对应的档位计算。利息按小时计算并每日结算，每日自动从借贷账户扣除，也可以手动还款。' },
        { q: '抵押的资产安全吗？', a: '所有抵押资产由平台统一托管，存储在多重签名的冷热钱包中，并有专业的风控团队7×24小时监控。平台设有风险准备金机制，为用户资产提供额外保障。' },
        { q: '信用评分如何影响借贷？', a: '信用评分高的用户可以享受：1) 更低的借款利率折扣；2) 更高的贷款额度上限；3) 更高的LTV比率；4) 优先客服支持。平台根据历史还款记录、持仓情况等综合评估信用。' },
        { q: '可以同时有多个借贷订单吗？', a: '可以。您可以针对不同的抵押资产创建多个借贷订单，但平台会综合评估您的总体风险敞口，确保所有订单的总LTV在安全范围内。' },
        { q: '如果逾期未还款会怎样？', a: '逾期后会产生额外的逾期罚息（通常为日利率的1.5倍），持续逾期可能导致平台强制清算，并降低信用评分，影响后续借贷条件。' }
      ]" :key="idx" class="rounded-xl border border-slate-200 bg-white p-5">
        <h3 class="font-semibold text-slate-900">Q{{ idx + 1 }}：{{ faq.q }}</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-700">{{ faq.a }}</p>
      </div>
    </article>

    <!-- 风险提示 -->
    <article v-if="activeTab === 'risk'" class="space-y-4">
      <div class="rounded-xl border border-slate-200 bg-white p-6">
        <h2 class="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-2xl">⚠️</span>
          风险提示
        </h2>
        
        <div class="mt-4 space-y-3">
          <div class="rounded-lg border border-rose-200 bg-rose-50 p-4">
            <h3 class="font-semibold text-rose-900 flex items-center gap-2">
              <span>📉</span> 市场风险
            </h3>
            <p class="mt-2 text-sm text-rose-800">
              加密货币价格波动剧烈，可能在短时间内大幅下跌，导致LTV快速上升触发清算。
            </p>
          </div>

          <div class="rounded-lg border border-rose-200 bg-rose-50 p-4">
            <h3 class="font-semibold text-rose-900 flex items-center gap-2">
              <span>⚡</span> 清算风险
            </h3>
            <p class="mt-2 text-sm text-rose-800">
              当抵押品价值不足以覆盖债务时，系统会自动清算，您可能损失部分或全部抵押品。
            </p>
          </div>

          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 class="font-semibold text-amber-900 flex items-center gap-2">
              <span>📊</span> 利率风险
            </h3>
            <p class="mt-2 text-sm text-amber-800">
              <strong>固定利率：</strong>利率锁定，无利率波动风险，但可能错过市场利率下降的机会。<br/>
              <strong>浮动利率：</strong>借款成本可能随市场变化而增加，但设有最高利率上限保护。建议关注调整周期和历史波动。<br/>
              <strong>阶梯利率：</strong>利率与借款金额挂钩，借款金额变化（如部分还款）可能导致利率档位变动。
            </p>
          </div>

          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 class="font-semibold text-amber-900 flex items-center gap-2">
              <span>🔒</span> 平台信用风险
            </h3>
            <p class="mt-2 text-sm text-amber-800">
              虽然平台有完善的风控和托管机制，但极端情况下仍可能存在平台运营风险。
            </p>
          </div>

          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 class="font-semibold text-amber-900 flex items-center gap-2">
              <span>💧</span> 流动性风险
            </h3>
            <p class="mt-2 text-sm text-amber-800">
              极端市场条件下，清算可能无法以理想价格执行。
            </p>
          </div>
        </div>

        <div class="mt-6 rounded-lg border-2 border-rose-300 bg-rose-50 p-5">
          <h3 class="font-semibold text-rose-900 flex items-center gap-2 text-lg">
            <span>⚠️</span> 免责声明
          </h3>
          <p class="mt-3 text-sm leading-relaxed text-rose-800">
            请充分了解产品风险后谨慎投资，不要借入超过您承受能力的金额。数字资产市场波动较大，过去的收益不代表未来表现。请务必在充分理解产品机制和风险的基础上做出投资决策，并合理控制借贷比例。
          </p>
        </div>
      </div>
    </article>
  </section>
</template>
