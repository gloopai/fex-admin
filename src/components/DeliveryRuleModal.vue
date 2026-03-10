<script setup>
import { computed, reactive, ref, watch } from "vue";
import {
  DELIVERY_RULE_TRIGGER_TYPE,
  DELIVERY_RULE_ACTION,
  DELIVERY_RULE_STATUS,
  DELIVERY_RULE_PRIORITY,
  DELIVERY_RULE_TIME_PERIOD,
  USER_RISK_LEVEL,
  PROFIT_CONTROL_STRATEGY,
} from "../constants/deliveryControl";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  rule: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: "create", // 'create' | 'edit' | 'duplicate'
  },
});

const emit = defineEmits(["close", "save"]);

// 帮助面板状态
const showTriggerHelp = ref(false);
const showActionHelp = ref(false);

// 表单数据
const form = reactive({
  // 基本信息
  name: "",
  description: "",
  status: DELIVERY_RULE_STATUS.ENABLED,
  priority: DELIVERY_RULE_PRIORITY.MEDIUM,

  // 触发条件
  trigger: {
    type: DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT,
    period: DELIVERY_RULE_TIME_PERIOD.LAST_1H,
    threshold: 20,
    conditions: {
      totalProfit: { enabled: false, operator: ">", value: 1000 },
      dailyProfit: { enabled: false, operator: ">", value: 1000 },
      positionValue: { enabled: false, operator: ">", value: 5000 },
      riskLevel: { enabled: false, values: [] },
    },
  },

  // 执行动作
  action: {
    type: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
    params: {
      // 盈亏控制（线控）- 百分比模式
      profitControl: {
        winFluctuationPercent: 2, // 盈利波动范围，单位%（±2%）
        lossFluctuationPercent: 2, // 亏损波动范围，单位%（±2%）
        winProbability: 0.3, // 盈利概率30%
        avgWinAmount: 20, // 赢时金额百分比 20%
        avgLossAmount: -15, // 输时金额百分比 -15%
        strategy: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE, // 技术策略
      },
      applyToNewPositions: true,
      duration: 0,

      // 强制盈利/亏损
      nextPositionCount: 1,
      lossPercent: 0.3,
      lossFluctuationPercent: 2, // 亏损波动范围，单位%（±2%）
      profitPercent: 0.2,
      winFluctuationPercent: 2, // 盈利波动范围，单位%（±2%）

      // 价格调整
      settlePriceMode: "unfavorable", // 'favorable' | 'unfavorable' | 'market'
      offsetPercent: 0.5,

      // 订单拒绝
      lockNewPosition: true,
      existingProfitTarget: -100,
      notifyUser: false,
      notifyMessage: "",

      // 仓位限制
      maxPositionValue: 1000,
      maxLeverage: 20,
    },
  },

  // 高级选项
  advanced: {
    enabled: true,
    schedule: {
      enabled: false,
      startTime: "09:00",
      endTime: "23:00",
      weekdays: [1, 2, 3, 4, 5, 6, 7], // 1-7 代表周一到周日
    },
    userFilter: {
      enabled: false,
      vipLevels: [],
      minDeposit: 0,
      maxDeposit: 0,
      registrationDays: { min: 0, max: 0 },
      excludeUserIds: "",
    },
    limits: {
      maxHitsPerDay: 0,
      maxHitsPerUser: 0,
      cooldownMinutes: 0,
    },
    notification: {
      enabled: false,
      webhookUrl: "",
      emailList: "",
    },
  },
});

// 触发类型配置（精简后只保留核心必须的4种）
const triggerTypeOptions = [
  {
    value: DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT,
    label: "交易次数",
    icon: "📊",
    description: "监测用户在指定时间内的交易次数",
    unit: "次",
    needsPeriod: true,
    defaultThreshold: 20,
  },
  {
    value: DELIVERY_RULE_TRIGGER_TYPE.PROFIT_LOSS,
    label: "累计盈亏",
    icon: "📈",
    description: "监测用户在指定时间内的累计盈亏金额",
    unit: "USDT",
    needsPeriod: true,
    defaultThreshold: 1000,
  },
  {
    value: DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_WINS,
    label: "连续盈利",
    icon: "🎯",
    description: "监测用户连续盈利的次数",
    unit: "次",
    needsPeriod: true,
    defaultThreshold: 5,
  },
  {
    value: DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_LOSS,
    label: "连续亏损",
    icon: "📉",
    description: "监测用户连续亏损的次数",
    unit: "次",
    needsPeriod: true,
    defaultThreshold: 5,
  },
];

// 触发类型详细帮助文档
const triggerTypeHelpDocs = {
  [DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT]: {
    title: "交易次数触发",
    definition: "当用户在指定时间周期内完成的交易笔数达到设定阈值时触发规则。",
    explanation:
      "系统会实时统计用户在选定时间窗口内的交易次数（包括已平仓和当前持仓）。每当完成一笔交易后，系统会重新计算该时间段内的总交易次数，如果达到或超过设定的阈值，则立即触发规则执行相应动作。",
    useCases: [
      {
        scenario: "高频交易控盈",
        config: "时间周期：最近1小时 | 阈值：20次",
        purpose:
          "限制在1小时内交易超过20次的高频用户的盈利表现，防止通过快速交易获取超额收益",
      },
      {
        scenario: "日交易量限制",
        config: "时间周期：今日 | 阈值：50次",
        purpose: "对当天交易频繁的用户进行风控干预，避免日内过度交易带来的风险",
      },
      {
        scenario: "短期频繁操作监测",
        config: "时间周期：最近4小时 | 阈值：30次",
        purpose: "识别短时间内频繁交易的用户，可能的套利行为或异常交易模式",
      },
    ],
    notes: [
      "交易次数统计包括所有已结算的订单",
      "未结算的持仓不计入交易次数",
      "时间窗口为滑动窗口，会实时更新",
    ],
  },
  [DELIVERY_RULE_TRIGGER_TYPE.PROFIT_LOSS]: {
    title: "累计盈亏触发",
    definition: "当用户在一段时间内赚了/亏了多少钱后，自动触发对应的规则。",
    explanation:
      '简单理解：系统会一直算账，看用户赚了还是亏了。比如设置"最近4小时赚了2000块"，用户一到2000就触发；设置"今天亏了5000块"，亏到5000也会触发。正数代表赚钱（盈利），负数代表亏钱（亏损）。',
    useCases: [
      {
        scenario: "赚太多了要控一控",
        config: "时间周期：最近4小时 | 阈值：+2000 USDT",
        purpose: "用户4小时赚了2000块，说明运气太好，接下来让他稍微难赚点",
      },
      {
        scenario: "亏太多了要补一补",
        config: "时间周期：今日 | 阈值：-5000 USDT",
        purpose: "用户今天已经亏了5000块，要挽留他，接下来让他容易赚点",
      },
      {
        scenario: "突然暴赚要注意",
        config: "时间周期：最近1小时 | 阈值：+1000 USDT",
        purpose: "1小时就赚1000块，可能碰到行情异常或在套利，需要关注一下",
      },
    ],
    notes: [
      "会把这段时间所有交易的盈亏全加起来算总账",
      "赚钱填正数（比如+2000），亏钱填负数（比如-5000）",
      '时间是滑动的，比如"最近1小时"会实时往前推1小时',
      '如果想实现"今天赚了多少"的功能，选"今日"时间周期就行',
    ],
  },
  [DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_WINS]: {
    title: "连续盈利触发",
    definition: "当用户在指定时间周期内连续盈利的次数达到设定阈值时触发规则。",
    explanation:
      "系统追踪用户连续平仓盈利的订单数量。只要有一笔订单亏损，计数器重置为0。当连续盈利次数达到阈值时触发规则，通常用于打断用户的连胜状态。",
    useCases: [
      {
        scenario: "连胜阻断",
        config: "时间周期：最近1小时 | 阈值：5次",
        purpose:
          "当用户连续5次盈利后，强制下一单亏损，避免持续盈利影响平台收益",
      },
      {
        scenario: "适度控盈",
        config: "时间周期：最近4小时 | 阈值：8次",
        purpose: "连续盈利8次后启动盈亏控制，降低期望值但不强制亏损",
      },
      {
        scenario: "异常盈利监测",
        config: "时间周期：今日 | 阈值：10次",
        purpose: "识别当日连续盈利超过10次的异常用户，可能存在策略漏洞",
      },
    ],
    notes: [
      "只统计连续盈利，中间有亏损则重置计数",
      "盈利判断标准：结算金额 > 开仓成本",
      "时间窗口限制统计范围",
    ],
  },
  [DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_LOSS]: {
    title: "连续亏损触发",
    definition: "当用户在指定时间周期内连续亏损的次数达到设定阈值时触发规则。",
    explanation:
      "系统追踪用户连续平仓亏损的订单数量。只要有一笔订单盈利，计数器重置为0。当连续亏损次数达到阈值时触发规则，通常用于用户保护或挽留策略。",
    useCases: [
      {
        scenario: "用户保护",
        config: "时间周期：最近1小时 | 阈值：5次",
        purpose: "当用户连续亏损5次后，强制下一单盈利或提升盈利概率，避免流失",
      },
      {
        scenario: "挽留机制",
        config: "时间周期：今日 | 阈值：8次",
        purpose: "识别当日连续亏损8次的用户，给予补偿性盈利机会",
      },
      {
        scenario: "新手保护",
        config: "时间周期：最近24小时 | 阈值：3次",
        purpose: "对新用户放宽标准，连续3次亏损即触发保护，提升留存率",
      },
    ],
    notes: [
      "只统计连续亏损，中间有盈利则重置计数",
      "亏损判断标准：结算金额 < 开仓成本",
      "通常用于用户体验优化和留存提升",
    ],
  },
};

// 时间周期选项
const timePeriodOptions = [
  {
    value: DELIVERY_RULE_TIME_PERIOD.REAL_TIME,
    label: "实时",
    description: "立即触发",
  },
  {
    value: DELIVERY_RULE_TIME_PERIOD.LAST_1H,
    label: "最近1小时",
    description: "统计最近1小时数据",
  },
  {
    value: DELIVERY_RULE_TIME_PERIOD.LAST_4H,
    label: "最近4小时",
    description: "统计最近4小时数据",
  },
  {
    value: DELIVERY_RULE_TIME_PERIOD.LAST_24H,
    label: "最近24小时",
    description: "统计最近24小时数据",
  },
  {
    value: DELIVERY_RULE_TIME_PERIOD.TODAY,
    label: "今日",
    description: "统计当日数据",
  },
  {
    value: DELIVERY_RULE_TIME_PERIOD.LAST_7D,
    label: "最近7天",
    description: "统计最近7天数据",
  },
];

// 执行动作配置（精简版 - 只保留核心功能）
const actionTypeOptions = [
  {
    value: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
    label: "盈亏控制",
    icon: "🎚️",
    description: "精确调整用户的交易盈亏金额（线控）",
    color: "blue",
    recommended: true,
  },
  {
    value: DELIVERY_RULE_ACTION.FORCE_WIN,
    label: "强制盈利",
    icon: "✅",
    description: "强制下N单结算为盈利",
    color: "emerald",
  },
  {
    value: DELIVERY_RULE_ACTION.FORCE_LOSS,
    label: "强制亏损",
    icon: "❌",
    description: "强制下N单结算为亏损",
    color: "rose",
  },
];

// 执行动作类型详细帮助文档
const actionTypeHelpDocs = {
  [DELIVERY_RULE_ACTION.PROFIT_CONTROL]: {
    title: "盈亏控制（线控）",
    definition: "根据设定的盈利概率和盈亏金额，动态调整用户交易的盈亏比例。",
    explanation:
      '<div class="space-y-3"><div><div class="text-xs font-semibold text-slate-800 mb-1.5">🎯 控制的是什么？</div><div class="text-xs text-slate-600 leading-relaxed">控制的是用户平仓时的结算价格。用户看到的K线是真实的，但平仓时我们可以在合理范围内选择一个对用户有利或不利的价格来结算。</div></div><div><div class="text-xs font-semibold text-slate-800 mb-1.5">⏰ 什么时候控制？</div><div class="text-xs text-slate-600 leading-relaxed">当用户点击平仓（或者到期自动平仓）的那一刻，系统会根据你配置的参数（盈利概率、盈利金额、亏损金额），决定这一单让他赚还是亏，然后选择对应的结算价格。</div></div><div><div class="text-xs font-semibold text-slate-800 mb-1.5">⚙️ 控制原理：</div><ol class="text-xs text-slate-600 leading-relaxed space-y-1 pl-4"><li>你设置三个参数：期望值（平均每单赚/亏多少）、盈利金额、亏损金额</li><li>系统根据期望值自动算出让他赚和让他亏的概率</li><li>每次平仓时，系统"抛硬币"决定这单是盈利还是亏损</li><li>如果是盈利，就挑个高点的价格给他结算；如果是亏损，就挑个低点的价格</li><li>长期下来，用户的平均盈亏就会接近你设置的期望值</li></ol></div><div><div class="text-xs font-semibold text-slate-800 mb-1.5">举个例子：</div><div class="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded p-2 space-y-1"><div>期望值设置 <strong class="text-slate-800">-5%</strong>，盈利 <strong class="text-green-600">+20%</strong>，亏损 <strong class="text-red-600">-15%</strong></div><div>→ 系统计算：盈利概率 <strong class="text-slate-800">约29%</strong>，亏损概率 <strong class="text-slate-800">约71%</strong></div><div>→ 对于 1000 USDT 的单：29%概率盈利200，71%概率亏损150，期望值-50（-5%）</div><div>→ 对于 100 USDT 的单：29%概率盈利20，71%概率亏损15，期望值-5（-5%）</div><div class="mt-2 pt-2 border-t border-slate-200 text-slate-500">计算公式：期望值 = 盈利金额 × 盈利概率 + 亏损金额 × 亏损概率</div></div></div><div><div class="text-xs font-semibold text-slate-800 mb-1.5">👤 规则执行维度：</div><div class="text-xs text-slate-600 leading-relaxed">虽然这是全局规则，但实际执行时是<strong class="text-slate-800">按单个用户维度</strong>来处理的。比如设置"连续亏损5次"触发，系统会单独追踪每个用户的亏损情况，当某个用户达到5次时，就对这个用户执行控制动作。</div></div></div>',
    useCases: [
      {
        scenario: "低盈利概率设置",
        config: "盈利概率：29% | 盈利：+20% | 亏损：-15%",
        purpose: "用户长期平均每单亏损约5%，适用于常规风控策略",
      },
      {
        scenario: "高盈利概率设置",
        config: "盈利概率：65% | 盈利：+18% | 亏损：-8%",
        purpose: "用户长期平均每单盈利约9%，适用于特定用户分组",
      },
      {
        scenario: "平衡概率设置",
        config: "盈利概率：50% | 盈利：+20% | 亏损：-20%",
        purpose: "用户长期盈亏平衡（期望值0%），适用于高价值用户组",
      },
    ],
    notes: [
      "规则是全局配置，但按单个用户维度触发和执行（不是全平台统计）",
      "💡 使用百分比模式，对不同规模的订单都按相同比例计算",
      "期望值由系统自动计算：正数=长期盈利，负数=长期亏损，0=长期打平",
      "盈利概率越高，期望值越大（对用户越有利）",
      "通过选择合理范围内的价格来实现，在正常市场波动范围内",
    ],
  },
  [DELIVERY_RULE_ACTION.FORCE_WIN]: {
    title: "强制盈利",
    definition: "强制指定用户接下来N单交易结算为盈利。",
    explanation:
      "当规则触发后，系统会标记该用户，接下来的N笔订单在结算时会强制选择对用户有利的价格，确保订单盈利。盈利幅度由设定的百分比决定。适用于连续亏损后的补偿等场景。",
    useCases: [
      {
        scenario: "连续亏损补偿",
        config: "触发：连续亏损5次 | 强制盈利：1单，20%",
        purpose: "用户连续亏损5次后，下一单强制盈利20%",
      },
      {
        scenario: "累计亏损达阈值",
        config: "触发：累计亏损>5000 USDT | 强制盈利：2单，15%",
        purpose: "用户累计亏损超过5000 USDT后，接下来2单强制盈利15%",
      },
      {
        scenario: "特定条件触发",
        config: "触发：自定义条件 | 强制盈利：3单，10%",
        purpose: "满足特定条件后，接下来3单强制盈利10%",
      },
    ],
    notes: [
      "仅影响结算价格，不改变订单方向",
      "盈利百分比基于订单本金计算",
      "强制盈利完成后标记自动清除",
      "适用于连续亏损或特定触发条件后的补偿",
    ],
  },
  [DELIVERY_RULE_ACTION.FORCE_LOSS]: {
    title: "强制亏损",
    definition: "强制指定用户接下来N单交易结算为亏损。",
    explanation:
      "当规则触发后，系统会标记该用户，接下来的N笔订单在结算时会强制选择对用户不利的价格，确保订单亏损。亏损幅度由设定的百分比决定。适用于连续盈利或异常高盈利的风控场景。",
    useCases: [
      {
        scenario: "连续盈利风控",
        config: "触发：连续盈利5次 | 强制亏损：1单，30%",
        purpose: "用户连续盈利5次后，下一单强制亏损30%",
      },
      {
        scenario: "短期高盈利风控",
        config: "触发：1小时盈利>3000 | 强制亏损：2单，25%",
        purpose: "用户短时间内高盈利后，接下来2单强制亏损25%",
      },
      {
        scenario: "高频交易风控",
        config: "触发：1小时交易>30次 | 强制亏损：3单，20%",
        purpose: "用户高频交易后，接下来3单强制亏损20%",
      },
    ],
    notes: [
      "仅影响结算价格，不改变订单方向",
      "亏损百分比基于订单本金计算",
      "强制亏损完成后标记自动清除",
      "适用于连续盈利或异常高盈利的风控场景",
    ],
  },
};

// 优先级选项
const priorityOptions = [
  {
    value: DELIVERY_RULE_PRIORITY.HIGH,
    label: "高优先级",
    color: "rose",
    icon: "🔴",
  },
  {
    value: DELIVERY_RULE_PRIORITY.MEDIUM,
    label: "中优先级",
    color: "amber",
    icon: "🟡",
  },
  {
    value: DELIVERY_RULE_PRIORITY.LOW,
    label: "低优先级",
    color: "slate",
    icon: "⚪",
  },
];

// 状态选项
const statusOptions = [
  { value: DELIVERY_RULE_STATUS.ENABLED, label: "运行中", color: "emerald" },
  { value: DELIVERY_RULE_STATUS.PAUSED, label: "已暂停", color: "amber" },
  { value: DELIVERY_RULE_STATUS.DISABLED, label: "已禁用", color: "slate" },
];

// 风险等级选项
const riskLevelOptions = [
  { value: USER_RISK_LEVEL.VERY_HIGH, label: "极高风险", color: "rose" },
  { value: USER_RISK_LEVEL.HIGH, label: "高风险", color: "orange" },
  { value: USER_RISK_LEVEL.MEDIUM, label: "中风险", color: "amber" },
  { value: USER_RISK_LEVEL.LOW, label: "低风险", color: "blue" },
  { value: USER_RISK_LEVEL.SAFE, label: "安全", color: "emerald" },
];

// 盈亏控制策略选项（价格修正）
const profitControlStrategyOptions = [
  {
    value: PROFIT_CONTROL_STRATEGY.NONE,
    label: "无策略",
    description: "不使用任何盈亏控制策略,完全按照参数配置执行，用户体验较差",
  },
  {
    value: PROFIT_CONTROL_STRATEGY.TIME_WINDOW,
    label: "时间窗口选择",
    description: "根据合约时间范围内秒级价格波动选择有利结算时间点",
  },
  {
    value: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE,
    label: "结算价格选择",
    description: "在多个数据源市场价格范围内选择有利价格",
  },
  
  {
    value: PROFIT_CONTROL_STRATEGY.SLIPPAGE,
    label: "滑点控制",
    description: "通过开仓和平仓滑点(保滑点边界)影响盈亏",
  },
];

// 计算属性
const isEditMode = computed(() => props.mode === "edit");
const isDuplicateMode = computed(() => props.mode === "duplicate");
const modalTitle = computed(() => {
  if (isEditMode.value) return "编辑规则";
  if (isDuplicateMode.value) return "复制规则";
  return "新增规则";
});

const currentTriggerConfig = computed(() => {
  return triggerTypeOptions.find((opt) => opt.value === form.trigger.type);
});

const currentActionConfig = computed(() => {
  return actionTypeOptions.find((opt) => opt.value === form.action.type);
});

const needsTimePeriod = computed(() => {
  return currentTriggerConfig.value?.needsPeriod;
});

const currentTriggerHelp = computed(() => {
  return triggerTypeHelpDocs[form.trigger.type] || null;
});

const currentActionHelp = computed(() => {
  return actionTypeHelpDocs[form.action.type] || null;
});

// 计算期望值（根据盈利概率、盈利金额、亏损金额自动计算）
const calculatedExpectedValue = computed(() => {
  if (form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL) {
    const { winProbability, avgWinAmount, avgLossAmount } =
      form.action.params.profitControl;
    // 安全检查，确保所有值都是有效数字
    const prob = Number(winProbability) || 0;
    const win = Number(avgWinAmount) || 0;
    const loss = Number(avgLossAmount) || 0;
    // 期望值 = 盈利金额 × 盈利概率 + 亏损金额 × (1 - 盈利概率)
    const expectedValue = win * prob + loss * (1 - prob);
    return isNaN(expectedValue) ? 0 : expectedValue;
  }
  return 0;
});

// 计算最大波动（取盈利/亏损波动范围较大者）
const maxFluctuation = computed(() => {
  if (form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL) {
    const { winFluctuationPercent = 0, lossFluctuationPercent = 0 } =
      form.action.params.profitControl;
    return Math.max(
      Number(winFluctuationPercent) || 0,
      Number(lossFluctuationPercent) || 0,
    );
  }
  return 0;
});

// 计算平均每单收益区间（分别考虑盈利和亏损波动）
const expectedValueRange = computed(() => {
  if (form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL) {
    try {
      if (
        form.action &&
        form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL &&
        form.action.params &&
        form.action.params.profitControl
      ) {
        const pc = form.action.params.profitControl;
        const win = Number(pc.avgWinAmount) || 0;
        const loss = Number(pc.avgLossAmount) || 0;
        const winFluct = Number(pc.winFluctuationPercent) || 0;
        const lossFluct = Number(pc.lossFluctuationPercent) || 0;
        const winMax = win + winFluct;
        const winMin = win - winFluct;
        const lossMax = loss + lossFluct;
        const lossMin = loss - lossFluct;
        const min = Math.min(winMin, winMax, lossMin, lossMax);
        const max = Math.max(winMin, winMax, lossMin, lossMax);
        return { min, max };
      }
    } catch (e) {
      console.error(e);
    }
    return { min: 0, max: 0 };
  }
  return { min: 0, max: 0 };
});

const formattedThreshold = computed(() => {
  const config = currentTriggerConfig.value;
  if (!config) return "";

  const value = currentTriggerConfig.value.isPercentage
    ? form.trigger.threshold
    : form.trigger.threshold;

  return `${value}${config.unit || ""}`;
});

// 方法
const close = () => {
  emit("close");
};

const save = () => {
  // 基础验证
  if (!form.name.trim()) {
    alert("请输入规则名称");
    return;
  }
  if (!form.description.trim()) {
    alert("请输入规则描述");
    return;
  }
  if (!form.trigger.threshold || form.trigger.threshold <= 0) {
    alert("请设置有效的触发阈值");
    return;
  }

  emit("save", { ...form });
  close();
};

// 监听触发类型变化，自动调整默认值
watch(
  () => form.trigger.type,
  (newType) => {
    const config = triggerTypeOptions.find((opt) => opt.value === newType);
    if (config) {
      form.trigger.threshold = config.defaultThreshold;
    }
  },
);

// 监听打开状态，初始化表单
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.rule && (props.mode === "edit" || props.mode === "duplicate")) {
        // 编辑或复制模式，加载现有数据
        Object.assign(form, JSON.parse(JSON.stringify(props.rule)));

        // 确保新字段存在默认值（数据迁移）
        if (form.action.params.profitControl) {
          // 确保 enableRiskLimits 字段存在
          form.action.params.profitControl.enableRiskLimits =
            form.action.params.profitControl.enableRiskLimits ?? false;

          // 如果是旧数据结构（使用 targetExpectedValue），迁移到新结构（使用 winProbability）
          if (
            form.action.params.profitControl.targetExpectedValue !==
              undefined &&
            form.action.params.profitControl.winProbability === undefined
          ) {
            // 从期望值反推盈利概率：p = (EV - lossAmount) / (winAmount - lossAmount)
            const ev =
              Number(form.action.params.profitControl.targetExpectedValue) ||
              -5;
            const win =
              Number(form.action.params.profitControl.avgWinAmount) || 20;
            const loss =
              Number(form.action.params.profitControl.avgLossAmount) || -15;
            const calculatedProb = (ev - loss) / (win - loss);
            form.action.params.profitControl.winProbability = isNaN(
              calculatedProb,
            )
              ? 0.3
              : Math.max(0, Math.min(1, calculatedProb));
            // 删除旧字段
            delete form.action.params.profitControl.targetExpectedValue;
          }

          // 确保所有数值字段都存在且是有效数字
          form.action.params.profitControl.winProbability =
            Number(form.action.params.profitControl.winProbability) || 0.3;
          form.action.params.profitControl.avgWinAmount =
            Number(form.action.params.profitControl.avgWinAmount) || 20;
          form.action.params.profitControl.avgLossAmount =
            Number(form.action.params.profitControl.avgLossAmount) || -15;
          form.action.params.profitControl.maxProfit =
            Number(form.action.params.profitControl.maxProfit) || 10000;
          form.action.params.profitControl.maxLossRatio =
            Number(form.action.params.profitControl.maxLossRatio) || 0.3;
        }

        // 确保持续时间字段存在默认值
        form.action.params.duration = Number(form.action.params.duration) || 0;

        // 复制模式，修改名称
        if (props.mode === "duplicate") {
          form.name = `${form.name} (副本)`;
        }
      } else {
        // 创建模式，重置表单
        Object.assign(form, {
          name: "",
          description: "",
          status: DELIVERY_RULE_STATUS.ENABLED,
          priority: DELIVERY_RULE_PRIORITY.MEDIUM,
          trigger: {
            type: DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT,
            period: DELIVERY_RULE_TIME_PERIOD.LAST_1H,
            threshold: 20,
            conditions: {
              profitLoss: { enabled: false, operator: ">", value: 1000 },
              dailyProfit: { enabled: false, operator: ">", value: 1000 },
              positionValue: { enabled: false, operator: ">", value: 5000 },
              riskLevel: { enabled: false, values: [] },
            },
          },
          action: {
            type: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
            params: {
              profitControl: {
                winProbability: 0.3,
                avgWinAmount: 20,
                avgLossAmount: -15,
                strategy: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE,
                // 已移除风控相关参数
              },
              applyToNewPositions: true,
              duration: 0,
              nextPositionCount: 1,
              lossPercent: 0.3,
              profitPercent: 0.2,
              settlePriceMode: "unfavorable",
              offsetPercent: 0.5,
              lockNewPosition: true,
              existingProfitTarget: -100,
              notifyUser: false,
              notifyMessage: "",
              maxPositionValue: 1000,
              maxLeverage: 20,
            },
          },
          advanced: {
            enabled: true,
            schedule: {
              enabled: false,
              startTime: "09:00",
              endTime: "23:00",
              weekdays: [1, 2, 3, 4, 5, 6, 7],
            },
            userFilter: {
              enabled: false,
              vipLevels: [],
              minDeposit: 0,
              maxDeposit: 0,
              registrationDays: { min: 0, max: 0 },
              excludeUserIds: "",
            },
            limits: {
              maxHitsPerDay: 0,
              maxHitsPerUser: 0,
              cooldownMinutes: 0,
            },
            notification: {
              enabled: false,
              webhookUrl: "",
              emailList: "",
            },
          },
        });
      }
    }
  },
  { flush: "post" },
);
</script>

<template>
  <Transition name="modal">
    <div
      v-show="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
    >
      <section
        class="flex h-[88vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <!-- 左侧配置区域 -->
        <div class="flex w-3/5 flex-col border-r border-slate-200">
          <header
            class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-50 to-violet-50 px-6 py-4"
          >
            <div>
              <h2 class="text-xl font-semibold text-slate-900">
                {{ modalTitle }}
              </h2>
              <p class="mt-0.5 text-xs text-slate-500">
                配置自动化规则的触发条件和执行动作
              </p>
            </div>
            <button
              type="button"
              class="text-2xl text-slate-400 hover:text-slate-600 transition-colors"
              @click="close"
            >
              ×
            </button>
          </header>

          <div class="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <!-- 基本信息 -->
            <section
              class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div class="flex items-center gap-2">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-600"
                >
                  <svg
                    class="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-base font-semibold text-slate-900">
                    基本信息
                  </h3>
                  <p class="text-xs text-slate-600">规则的基础配置</p>
                </div>
              </div>

              <div class="space-y-3.5">
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700"
                    >规则名称 <span class="text-rose-500">*</span></span
                  >
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="如：高频交易风控规则"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700"
                    >规则描述</span
                  >
                  <textarea
                    v-model="form.description"
                    rows="2"
                    placeholder="描述规则的用途和适用场景"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  ></textarea>
                </label>

                <div class="grid gap-3.5 sm:grid-cols-2">
                  <label class="block space-y-2">
                    <span class="text-sm font-medium text-slate-700">状态</span>
                    <select
                      v-model="form.status"
                      class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option
                        v-for="status in statusOptions"
                        :key="status.value"
                        :value="status.value"
                      >
                        {{ status.label }}
                      </option>
                    </select>
                  </label>

                  <label class="block space-y-2">
                    <span class="text-sm font-medium text-slate-700"
                      >优先级</span
                    >
                    <select
                      v-model="form.priority"
                      class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option
                        v-for="priority in priorityOptions"
                        :key="priority.value"
                        :value="priority.value"
                      >
                        {{ priority.icon }} {{ priority.label }}
                      </option>
                    </select>
                  </label>
                </div>
              </div>
            </section>

            <!-- 触发条件 -->
            <section
              class="space-y-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-sm"
            >
              <div class="flex items-center gap-2">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600"
                >
                  <svg
                    class="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 class="flex-1 text-base font-semibold text-slate-900">
                  触发条件
                </h3>
                <!-- 帮助按钮已移除 -->
              </div>

              <div class="space-y-3.5">
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700"
                    >触发类型</span
                  >
                  <select
                    v-model="form.trigger.type"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option
                      v-for="option in triggerTypeOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.icon }} {{ option.label }}
                    </option>
                  </select>
                </label>

                <div class="grid gap-3.5 sm:grid-cols-2">
                  <label class="block space-y-2">
                    <span class="text-sm font-medium text-slate-700"
                      >{{ currentTriggerConfig?.thresholdLabel || "阈值" }}
                      <span class="text-rose-500">*</span></span
                    >
                    <input
                      v-model.number="form.trigger.threshold"
                      type="number"
                      min="0"
                      class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>

                  <label v-if="needsTimePeriod" class="block space-y-2">
                    <span class="text-sm font-medium text-slate-700"
                      >时间周期</span
                    >
                    <select
                      v-model="form.trigger.period"
                      class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option
                        v-for="period in timePeriodOptions"
                        :key="period.value"
                        :value="period.value"
                      >
                        {{ period.label }}
                      </option>
                    </select>
                  </label>
                </div>
              </div>

              <!-- 帮助面板已移除 -->
            </section>

            <!-- 执行动作 -->
            <section
              class="space-y-4 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 shadow-sm"
            >
              <div class="flex items-center gap-2">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600"
                >
                  <svg
                    class="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 class="flex-1 text-base font-semibold text-slate-900">
                  执行动作
                </h3>
                <!-- 帮助按钮已移除 -->
              </div>

              <div class="space-y-3.5">
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700"
                    >动作类型</span
                  >
                  <select
                    v-model="form.action.type"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  >
                    <option
                      v-for="action in actionTypeOptions"
                      :key="action.value"
                      :value="action.value"
                    >
                      {{ action.icon }} {{ action.label }}
                    </option>
                  </select>
                </label>

                <!-- 盈亏控制参数 -->
                <div
                  v-if="
                    form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL
                  "
                  class="space-y-4 rounded-lg border border-blue-200 bg-white p-4"
                >
                  <div
                    class="flex items-center gap-2 pb-3 border-b border-blue-100"
                  >
                    <span class="text-2xl">🎚️</span>
                    <div class="flex-1">
                      <h4 class="text-sm font-semibold text-blue-900">
                        盈亏参数配置
                      </h4>
                      <p class="text-xs text-blue-600">
                        设置盈利概率和单笔盈亏幅度，系统自动计算期望值（EV）
                      </p>
                    </div>
                  </div>

                  <!-- 核心参数 -->
                  <div class="space-y-4">
                    <div class="space-y-1">
                      <h5
                        class="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                      >
                        <span
                          class="inline-block w-1 h-4 bg-blue-500 rounded"
                        ></span>
                        核心参数
                      </h5>
                      <p class="text-xs text-slate-500">
                        按盈利概率随机决定输赢，赢时按固定的单笔盈利<span
                          class="text-green-600"
                          >%</span
                        >结算，输时按固定的单笔亏损<span class="text-red-600"
                          >%</span
                        >结算
                      </p>
                    </div>

                    <!-- 盈利概率 -->
                    <div
                      class="rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <label class="block space-y-2">
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="text-sm font-medium text-slate-700">
                              盈利概率
                            </div>
                            <div class="text-xs text-slate-500 mt-0.5">
                              用户赚钱的几率，值越大用户越容易赚
                            </div>
                          </div>
                          <span class="text-xl font-bold text-green-600"
                            >{{
                              (
                                (form.action.params.profitControl
                                  .winProbability || 0) * 100
                              ).toFixed(0)
                            }}%</span
                          >
                        </div>
                        <div class="flex items-center gap-2">
                          <input
                            v-model.number="
                              form.action.params.profitControl.winProbability
                            "
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            class="flex-1 accent-blue-600"
                          />
                          <input
                            v-model.number="
                              form.action.params.profitControl.winProbability
                            "
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            class="w-16 rounded border border-slate-300 px-2 py-1 text-sm text-center focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </label>
                    </div>

                    <!-- 盈亏波动范围 -->

                    <!-- 盈亏幅度 -->
                    <div class="grid gap-3 sm:grid-cols-2">
                      <div
                        class="rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <label class="block space-y-2">
                          <div class="flex items-center gap-1">
                            <span class="text-sm text-slate-700">单笔盈利</span>
                            <span class="text-lg font-bold text-green-600"
                              >+{{
                                form.action.params.profitControl.avgWinAmount ||
                                0
                              }}%</span
                            >
                          </div>
                          <div class="flex items-center gap-1">
                            <input
                              v-model.number="
                                form.action.params.profitControl.avgWinAmount
                              "
                              type="number"
                              min="1"
                              max="200"
                              step="1"
                              class="flex-1 rounded border border-slate-300 px-2.5 py-1.5 text-sm focus:border-green-500 focus:outline-none"
                            />
                            <span class="text-sm text-slate-500">%</span>
                          </div>
                          <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs text-slate-500"
                              >盈利波动范围：</span
                            >
                            <input
                              v-model.number="
                                form.action.params.profitControl
                                  .winFluctuationPercent
                              "
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              class="w-14 rounded border border-slate-300 px-2 py-1 text-xs text-center focus:border-green-500 focus:outline-none"
                            />
                            <span class="text-xs text-green-600"
                              >±{{
                                form.action.params.profitControl
                                  .winFluctuationPercent || 0
                              }}%</span
                            >
                          </div>
                          <p class="text-xs text-slate-500">
                            盈利时的收益比例，值越大用户赚得越多。每单盈利将在此基础上随机波动±{{
                              form.action.params.profitControl
                                .winFluctuationPercent || 0
                            }}%。
                          </p>
                        </label>
                      </div>

                      <div
                        class="rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <label class="block space-y-2">
                          <div class="flex items-center gap-1">
                            <span class="text-sm text-slate-700">单笔亏损</span>
                            <span class="text-lg font-bold text-red-600"
                              >{{
                                form.action.params.profitControl
                                  .avgLossAmount || 0
                              }}%</span
                            >
                          </div>
                          <div class="flex items-center gap-1">
                            <input
                              v-model.number="
                                form.action.params.profitControl.avgLossAmount
                              "
                              type="number"
                              min="-200"
                              max="-1"
                              step="1"
                              class="flex-1 rounded border border-slate-300 px-2.5 py-1.5 text-sm focus:border-red-500 focus:outline-none"
                            />
                            <span class="text-sm text-slate-500">%</span>
                          </div>
                          <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs text-slate-500"
                              >亏损波动范围：</span
                            >
                            <input
                              v-model.number="
                                form.action.params.profitControl
                                  .lossFluctuationPercent
                              "
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              class="w-14 rounded border border-slate-300 px-2 py-1 text-xs text-center focus:border-red-500 focus:outline-none"
                            />
                            <span class="text-xs text-red-600"
                              >±{{
                                form.action.params.profitControl
                                  .lossFluctuationPercent || 0
                              }}%</span
                            >
                          </div>
                          <p class="text-xs text-slate-500">
                            亏损时的亏损比例，值越小用户亏得越少。每单亏损将在此基础上随机波动±{{
                              form.action.params.profitControl
                                .lossFluctuationPercent || 0
                            }}%。
                          </p>
                        </label>
                      </div>
                    </div>

                    <!-- 价格修正 -->
                    <div class="space-y-3 pt-4 border-t border-slate-200">
                      <div class="flex items-center justify-start">
                        <h5
                          class="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                        >
                          <span
                            class="inline-block w-1 h-4 bg-slate-400 rounded"
                          ></span>
                          价格修正
                        </h5>
                        <p class="text-xs text-slate-500">
                          根据修正策略，对概率算法产生的价格进行修正，改善用户体验，提升规则隐蔽性  
                      </p>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <button
                          v-for="strategy in profitControlStrategyOptions"
                          :key="strategy.value"
                          type="button"
                          @click="
                            form.action.params.profitControl.strategy =
                              strategy.value
                          "
                          :class="[
                            'relative rounded-lg border-2 p-3 text-left transition-all',
                            form.action.params.profitControl.strategy ===
                            strategy.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 bg-white hover:border-slate-300',
                          ]"
                        >
                          <div class="flex items-start gap-2">
                            <div
                              :class="[
                                'mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center',
                                form.action.params.profitControl.strategy ===
                                strategy.value
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-slate-300',
                              ]"
                            >
                              <div
                                v-if="
                                  form.action.params.profitControl.strategy ===
                                  strategy.value
                                "
                                class="h-1.5 w-1.5 rounded-full bg-white"
                              ></div>
                            </div>
                            <div class="flex-1">
                              <div class="text-sm font-medium text-slate-900">
                                {{ strategy.label }}
                              </div>
                              <div class="mt-0.5 text-xs text-slate-500">
                                {{ strategy.description }}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                      <div
                        class="rounded bg-slate-50 p-3 mb-2 border border-blue-100"
                      >
                        <div class="text-xs text-blue-900 mb-1 font-semibold">
                          价格修正逻辑说明
                        </div>
                        <ol
                          class="text-xs text-slate-600 pl-4 list-decimal space-y-1"
                        >
                          <li>
                            系统先根据设定的“盈利概率”决定本单盈亏（概率偏移）。
                          </li>
                          <li>
                            再根据所选“价格修正”，在市场允许范围内修正最终成交价格。
                          </li>
                          <li>
                            长期来看，用户的平均盈亏将趋近于你设定的期望值（EV）。
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <!-- 通用选项 -->
                  <div class="space-y-3 pt-4 border-t border-slate-200">
                    <label class="flex items-center gap-2">
                      <input
                        v-model="form.action.params.applyToNewPositions"
                        type="checkbox"
                        class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span class="text-sm text-slate-700"
                        >仅应用于新开仓位</span
                      >
                    </label>
                    <label class="block space-y-2">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-slate-700"
                          >持续时间</span
                        >
                        <span class="text-xs text-slate-500"
                          >（0 表示只触发一次）</span
                        >
                      </div>
                      <div class="flex items-center gap-2">
                        <input
                          v-model.number="form.action.params.duration"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        <span class="text-sm text-slate-600">分钟</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- 强制亏损参数 -->
                <div
                  v-if="form.action.type === DELIVERY_RULE_ACTION.FORCE_LOSS"
                  class="space-y-4 rounded-lg border border-rose-200 bg-white p-4"
                >
                  <div
                    class="flex items-center gap-2 pb-3 border-b border-rose-100"
                  >
                    <span class="text-2xl">❌</span>
                    <div class="flex-1">
                      <h4 class="text-sm font-semibold text-rose-900">
                        强制亏损
                      </h4>
                      <p class="text-xs text-rose-600">
                        让用户的下N单强制亏损指定比例
                      </p>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div class="grid gap-4 sm:grid-cols-2">
                      <label class="block space-y-2">
                        <span class="text-sm font-medium text-slate-700"
                          >影响订单数</span
                        >
                        <input
                          v-model.number="form.action.params.nextPositionCount"
                          type="number"
                          min="1"
                          max="10"
                          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                        />
                        <p class="text-xs text-slate-500">
                          接下来的
                          {{
                            form.action.params.nextPositionCount
                          }}
                          笔订单将执行此策略
                        </p>
                      </label>

                      <label class="block space-y-2">
                        <span class="text-sm font-medium text-slate-700"
                          >亏损比例</span
                        >
                        <div class="flex items-center gap-2">
                          <input
                            v-model.number="form.action.params.lossPercent"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            class="w-20 rounded-md border border-rose-300 px-2 py-2 text-sm focus:border-rose-500 focus:outline-none"
                          />
                          <span class="text-sm font-bold text-rose-700"
                            >{{
                              (form.action.params.lossPercent ||0 * 100).toFixed(0)
                            }}%</span
                          >
                          <input
                            v-model.number="form.action.params.lossPercent"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            class="flex-1 accent-rose-600"
                          />
                        </div>
                      </label>
                    </div>

                    <!-- 亏损波动范围 -->
                    <div class="rounded-lg border border-slate-200 bg-white p-3">
                      <label class="block space-y-2">
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="text-sm font-medium text-slate-700">
                              亏损波动范围
                            </div>
                            <div class="text-xs text-slate-500 mt-0.5">
                              实际亏损将在基准比例上下随机波动
                            </div>
                          </div>
                          <span class="text-lg font-bold text-red-600"
                            >±{{
                              form.action.params.lossFluctuationPercent || 0
                            }}%</span
                          >
                        </div>
                        <div class="flex items-center gap-2">
                          <input
                            v-model.number="form.action.params.lossFluctuationPercent"
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            class="flex-1 accent-rose-600"
                          />
                          <input
                            v-model.number="form.action.params.lossFluctuationPercent"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            class="w-20 rounded border border-slate-300 px-2 py-1 text-sm text-center focus:border-rose-500 focus:outline-none"
                          />
                          <span class="text-sm text-slate-500">%</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-1">
                          每单亏损将在 {{ (form.action.params.lossPercent ||0* 100).toFixed(0)}}% 基础上随机波动 ±{{ form.action.params.lossFluctuationPercent || 0 }}%
                        </p>
                      </label>
                    </div>

                    <div
                      class="rounded-md bg-rose-50 border border-rose-200 px-3 py-2.5"
                    >
                      <p class="text-xs font-medium text-rose-900">
                        ✓ 用户接下来
                        {{
                          form.action.params.nextPositionCount
                        }}
                        笔订单将强制亏损
                        <strong class="text-base"
                          >{{
                            (form.action.params.lossPercent * 100).toFixed(0)
                          }}% ±{{ form.action.params.lossFluctuationPercent || 0 }}%</strong
                        >
                      </p>
                      <p class="text-xs text-rose-600 mt-1">
                        实际亏损范围：{{ ((form.action.params.lossPercent - form.action.params.lossFluctuationPercent / 100) * 100).toFixed(1) }}% ~ {{ ((form.action.params.lossPercent + form.action.params.lossFluctuationPercent / 100) * 100).toFixed(1) }}%
                      </p>
                    </div>
                  </div>
                </div>

                <!-- 强制盈利参数 -->
                <div
                  v-if="form.action.type === DELIVERY_RULE_ACTION.FORCE_WIN"
                  class="space-y-4 rounded-lg border border-emerald-200 bg-white p-4"
                >
                  <div
                    class="flex items-center gap-2 pb-3 border-b border-emerald-100"
                  >
                    <span class="text-2xl">✅</span>
                    <div class="flex-1">
                      <h4 class="text-sm font-semibold text-emerald-900">
                        强制盈利
                      </h4>
                      <p class="text-xs text-emerald-600">
                        让用户的下N单强制盈利指定比例
                      </p>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div class="grid gap-4 sm:grid-cols-2">
                      <label class="block space-y-2">
                        <span class="text-sm font-medium text-slate-700"
                          >影响订单数</span
                        >
                        <input
                          v-model.number="form.action.params.nextPositionCount"
                          type="number"
                          min="1"
                          max="10"
                          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        />
                        <p class="text-xs text-slate-500">
                          接下来的
                          {{
                            form.action.params.nextPositionCount
                          }}
                          笔订单将执行此策略
                        </p>
                      </label>

                      <label class="block space-y-2">
                        <span class="text-sm font-medium text-slate-700"
                          >盈利比例</span
                        >
                        <div class="flex items-center gap-2">
                          <input
                            v-model.number="form.action.params.profitPercent"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            class="w-20 rounded-md border border-emerald-300 px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                          />
                          <span class="text-sm font-bold text-emerald-700"
                            >{{
                              (form.action.params.profitPercent ||0 * 100).toFixed(
                                0,
                              )
                            }}%</span
                          >
                          <input
                            v-model.number="form.action.params.profitPercent"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            class="flex-1 accent-emerald-600"
                          />
                        </div>
                      </label>
                    </div>

                    <!-- 盈利波动范围 -->
                    <div class="rounded-lg border border-slate-200 bg-white p-3">
                      <label class="block space-y-2">
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="text-sm font-medium text-slate-700">
                              盈利波动范围
                            </div>
                            <div class="text-xs text-slate-500 mt-0.5">
                              实际盈利将在基准比例上下随机波动
                            </div>
                          </div>
                          <span class="text-lg font-bold text-green-600"
                            >±{{
                              form.action.params.winFluctuationPercent || 0
                            }}%</span
                          >
                        </div>
                        <div class="flex items-center gap-2">
                          <input
                            v-model.number="form.action.params.winFluctuationPercent"
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            class="flex-1 accent-emerald-600"
                          />
                          <input
                            v-model.number="form.action.params.winFluctuationPercent"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            class="w-20 rounded border border-slate-300 px-2 py-1 text-sm text-center focus:border-emerald-500 focus:outline-none"
                          />
                          <span class="text-sm text-slate-500">%</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-1">
                          每单盈利将在 {{ (form.action.params.profitPercent ||0* 100).toFixed(0) }}% 基础上随机波动 ±{{ form.action.params.winFluctuationPercent || 0 }}%
                        </p>
                      </label>
                    </div>

                    <div
                      class="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2.5"
                    >
                      <p class="text-xs font-medium text-emerald-900">
                        ✓ 用户接下来
                        {{
                          form.action.params.nextPositionCount
                        }}
                        笔订单将强制盈利
                        <strong class="text-base"
                          >{{
                            (form.action.params.profitPercent * 100).toFixed(0)
                          }}% ±{{ form.action.params.winFluctuationPercent || 0 }}%</strong
                        >
                      </p>
                      <p class="text-xs text-emerald-600 mt-1">
                        实际盈利范围：{{ ((form.action.params.profitPercent - form.action.params.winFluctuationPercent / 100) * 100).toFixed(1) }}% ~ {{ ((form.action.params.profitPercent + form.action.params.winFluctuationPercent / 100) * 100).toFixed(1) }}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 帮助面板已移除 -->
            </section>
          </div>

          <footer
            class="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4"
          >
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white hover:shadow-sm"
              @click="close"
            >
              取消
            </button>
            <button
              type="button"
              class="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition shadow-sm"
              :class="
                form.name.trim() && Number(form.trigger.threshold) > 0
                  ? 'bg-violet-600 hover:bg-violet-700 hover:shadow-md'
                  : 'bg-violet-300 cursor-not-allowed'
              "
              :disabled="
                !form.name.trim() || Number(form.trigger.threshold) <= 0
              "
              @click="save"
            >
              <span class="flex items-center gap-2">
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                保存规则
              </span>
            </button>
          </footer>
        </div>

        <!-- 右侧帮助区域 -->
        <div
          class="flex w-2/5 flex-col bg-gradient-to-br from-slate-50 to-slate-100"
        >
          <header class="border-b border-slate-200 px-5 py-4">
            <h3 class="text-lg font-semibold text-slate-900">使用说明</h3>
            <p class="mt-0.5 text-xs text-slate-500">
              本区域用于帮助说明，已关闭实时预览和计算
            </p>
          </header>
          <div class="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            <!-- 触发类型帮助 -->
            <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 class="text-sm font-semibold text-blue-900 mb-2">触发类型说明</h4>
              <ul class="list-disc pl-5 text-xs text-slate-700 space-y-1">
                <li>
                  <strong>交易次数触发：</strong> 当用户在指定时间周期内完成的交易笔数达到设定阈值时触发规则。典型用例：高频交易控盈、日交易量限制、短期频繁操作监测。注意：统计包括所有已结算订单，时间窗口为滑动实时更新。
                </li>
                <li>
                  <strong>累计盈亏触发：</strong> 用户在一段时间内赚/亏到一定金额后自动触发。典型用例：赚太多控盈、亏太多补偿、暴赚监测。注意：正数为盈利，负数为亏损，时间为滑动窗口。
                </li>
                <li>
                  <strong>连续盈利/亏损触发：</strong> 用户连续盈利/亏损达到设定次数时触发。典型用例：连胜阻断、用户保护、异常盈利/亏损监测。注意：只统计连续结果，中间断开则重置。
                </li>
              </ul>
            </div>

            <!-- 执行动作帮助 -->
            <div class="rounded-lg border border-violet-200 bg-violet-50 p-4">
              <h4 class="text-sm font-semibold text-violet-900 mb-2">执行动作说明</h4>
              <ul class="list-disc pl-5 text-xs text-slate-700 space-y-1">
                <li>
                  <strong>盈亏控制（线控）：</strong> 按设定概率和盈亏幅度动态调整用户结算价格，实现长期期望值控制。典型用例：低/高盈利概率设置、平衡概率设置。注意：规则全局配置，按用户维度执行，期望值由系统自动计算。
                </li>
                <li>
                  <strong>强制盈利/亏损：</strong> 触发后，用户接下来N单强制结算为盈利/亏损，幅度按百分比设定。典型用例：连续亏损补偿、连续盈利风控等。注意：仅影响结算价格，完成后自动清除标记。
                </li>
              </ul>
            </div>

            <!-- 参数配置建议 -->
            <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 class="text-sm font-semibold text-amber-900 mb-2">参数配置建议</h4>
              <ul class="list-disc pl-5 text-xs text-slate-700 space-y-1">
                <li>盈利概率、单笔盈利/亏损、波动范围等参数可灵活调整，系统自动计算期望值。</li>
                <li>价格修正策略可选：时间窗口、结算价格、滑点控制。</li>
                <li>可设置仅应用于新仓、持续时间、影响订单数等通用选项。</li>
              </ul>
            </div>

            <!-- 典型场景与注意事项 -->
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h4 class="text-sm font-semibold text-slate-900 mb-2">典型场景与注意事项</h4>
              <ul class="list-disc pl-5 text-xs text-slate-700 space-y-1">
                <li>规则可用于风控、补偿、异常监测等多种场景。</li>
                <li>建议结合实际业务需求合理配置参数，避免过度干预影响用户体验。</li>
                <li>详细计算公式和原理可联系管理员或查阅开发文档。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 600px;
  opacity: 1;
  transform: translateY(0);
}
</style>
