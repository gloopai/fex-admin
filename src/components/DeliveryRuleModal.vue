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

// 触发类型配置
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

// 时间周期选项
const timePeriodOptions = [
  { value: DELIVERY_RULE_TIME_PERIOD.REAL_TIME, label: "实时" },
  { value: DELIVERY_RULE_TIME_PERIOD.LAST_1H, label: "最近1小时" },
  { value: DELIVERY_RULE_TIME_PERIOD.LAST_4H, label: "最近4小时" },
  { value: DELIVERY_RULE_TIME_PERIOD.LAST_24H, label: "最近24小时" },
  { value: DELIVERY_RULE_TIME_PERIOD.TODAY, label: "今日" },
  { value: DELIVERY_RULE_TIME_PERIOD.LAST_7D, label: "最近7天" },
];

// 执行动作配置
const actionTypeOptions = [
  {
    value: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
    label: "盈亏控制",
    icon: "🎚️",
    description: "精确调整用户的交易盈亏金额（线控）",
    color: "blue",
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

// 优先级选项
const priorityOptions = [
  { value: DELIVERY_RULE_PRIORITY.HIGH, label: "高优先级", icon: "🔴" },
  { value: DELIVERY_RULE_PRIORITY.MEDIUM, label: "中优先级", icon: "🟡" },
  { value: DELIVERY_RULE_PRIORITY.LOW, label: "低优先级", icon: "⚪" },
];

// 状态选项
const statusOptions = [
  { value: DELIVERY_RULE_STATUS.ENABLED, label: "运行中" },
  { value: DELIVERY_RULE_STATUS.PAUSED, label: "已暂停" },
  { value: DELIVERY_RULE_STATUS.DISABLED, label: "已禁用" },
];

// 盈亏控制策略选项
const profitControlStrategyOptions = [
  { value: PROFIT_CONTROL_STRATEGY.NONE, label: "无策略", description: "完全按照参数执行" },
  { value: PROFIT_CONTROL_STRATEGY.TIME_WINDOW, label: "时间窗口", description: "秒级价格波动选择" },
  { value: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE, label: "结算价格", description: "多数据源最优选择" },
  { value: PROFIT_CONTROL_STRATEGY.SLIPPAGE, label: "滑点控制", description: "通过滑点影响盈亏" },
];

// 计算属性
const isEditMode = computed(() => props.mode === "edit");
const isDuplicateMode = computed(() => props.mode === "duplicate");
const modalTitle = computed(() => {
  if (isEditMode.value) return "编辑规则";
  if (isDuplicateMode.value) return "复制规则";
  return "新增规则";
});

const currentTriggerConfig = computed(() => triggerTypeOptions.find((opt) => opt.value === form.trigger.type));
const needsTimePeriod = computed(() => currentTriggerConfig.value?.needsPeriod);

// 计算期望值
const calculatedExpectedValue = computed(() => {
  if (form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL) {
    const { winProbability, avgWinAmount, avgLossAmount } = form.action.params.profitControl;
    const prob = Number(winProbability) || 0;
    const win = Number(avgWinAmount) || 0;
    const loss = Number(avgLossAmount) || 0;
    return win * prob + loss * (1 - prob);
  }
  return 0;
});

// 方法
const close = () => {
  emit("close");
};

const save = () => {
  if (!form.name.trim()) { alert("请输入规则名称"); return; }
  if (!form.description.trim()) { alert("请输入规则描述"); return; }
  if (!form.trigger.threshold || form.trigger.threshold <= 0) { alert("请设置有效的触发阈值"); return; }

  emit("save", { ...form });
  close();
};

// 监听触发类型变化
watch(() => form.trigger.type, (newType) => {
  const config = triggerTypeOptions.find((opt) => opt.value === newType);
  if (config) form.trigger.threshold = config.defaultThreshold;
});

// 监听打开状态，初始化表单
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.rule && (props.mode === "edit" || props.mode === "duplicate")) {
      Object.assign(form, JSON.parse(JSON.stringify(props.rule)));
      if (props.mode === "duplicate") form.name = `${form.name} (副本)`;
    } else {
      // 重置为默认值
      Object.assign(form, {
        name: "",
        description: "",
        status: DELIVERY_RULE_STATUS.ENABLED,
        priority: DELIVERY_RULE_PRIORITY.MEDIUM,
        trigger: {
          type: DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT,
          period: DELIVERY_RULE_TIME_PERIOD.LAST_1H,
          threshold: 20,
        },
        action: {
          type: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
          params: {
            profitControl: {
              winProbability: 0.3,
              avgWinAmount: 20,
              avgLossAmount: -15,
              strategy: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE,
              winFluctuationPercent: 2,
              lossFluctuationPercent: 2,
            },
            applyToNewPositions: true,
            duration: 0,
            nextPositionCount: 1,
            lossPercent: 0.3,
            profitPercent: 0.2,
            lossFluctuationPercent: 2,
            winFluctuationPercent: 2,
          },
        },
      });
    }
  }
});
</script>

<template>
  <Transition name="modal">
    <div v-show="open" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <section class="flex h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-2xl border border-black/[0.06]">
        <!-- 左侧配置区域 -->
        <div class="flex w-3/5 flex-col border-r border-black/[0.06]">
          <header class="flex items-center justify-between border-b border-black/[0.06] bg-white px-6 py-4">
            <div>
              <h2 class="text-lg font-semibold text-black/85">{{ modalTitle }}</h2>
              <p class="mt-1 text-xs text-black/45">配置自动化规则的触发条件和执行动作</p>
            </div>
            <button type="button" class="text-black/45 hover:text-black/85 transition-colors text-2xl leading-none" @click="close">×</button>
          </header>

          <div class="flex-1 space-y-6 overflow-y-auto px-6 py-6 bg-[#f0f2f5]">
            <!-- 基本信息 -->
            <section class="space-y-4 rounded-lg border border-black/[0.06] bg-white p-6 shadow-sm">
              <div class="flex items-center gap-3 mb-2">
                <div class="flex h-8 w-8 items-center justify-center rounded bg-black/5">
                  <svg class="h-4 w-4 text-black/45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <h3 class="text-sm font-semibold text-black/85">基本信息</h3>
              </div>

              <div class="space-y-4">
                <div class="space-y-1.5">
                  <label class="text-sm text-black/85 font-medium">规则名称 <span class="text-rose-500">*</span></label>
                  <input v-model="form.name" type="text" placeholder="请输入规则名称" class="ant-input" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-sm text-black/85 font-medium">规则描述</label>
                  <textarea v-model="form.description" rows="2" placeholder="请输入规则描述" class="ant-input"></textarea>
                </div>
                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-1.5">
                    <label class="text-sm text-black/85 font-medium">状态</label>
                    <select v-model="form.status" class="ant-select">
                      <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-sm text-black/85 font-medium">优先级</label>
                    <select v-model="form.priority" class="ant-select">
                      <option v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">{{ opt.icon }} {{ opt.label }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <!-- 触发条件 -->
            <section class="space-y-4 rounded-lg border border-black/[0.06] bg-white p-6 shadow-sm">
              <div class="flex items-center gap-3 mb-2">
                <div class="flex h-8 w-8 items-center justify-center rounded bg-antd-primary/10">
                  <svg class="h-4 w-4 text-antd-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h3 class="text-sm font-semibold text-black/85">触发条件</h3>
              </div>

              <div class="space-y-4">
                <div class="space-y-1.5">
                  <label class="text-sm text-black/85 font-medium">触发类型</label>
                  <select v-model="form.trigger.type" class="ant-select">
                    <option v-for="opt in triggerTypeOptions" :key="opt.value" :value="opt.value">{{ opt.icon }} {{ opt.label }}</option>
                  </select>
                </div>
                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-1.5">
                    <label class="text-sm text-black/85 font-medium">触发阈值 <span class="text-rose-500">*</span></label>
                    <div class="flex items-center gap-2">
                      <input v-model.number="form.trigger.threshold" type="number" class="ant-input" />
                      <span class="text-sm text-black/45">{{ currentTriggerConfig?.unit }}</span>
                    </div>
                  </div>
                  <div v-if="needsTimePeriod" class="space-y-1.5">
                    <label class="text-sm text-black/85 font-medium">时间周期</label>
                    <select v-model="form.trigger.period" class="ant-select">
                      <option v-for="opt in timePeriodOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <!-- 执行动作 -->
            <section class="space-y-4 rounded-lg border border-black/[0.06] bg-white p-6 shadow-sm">
              <div class="flex items-center gap-3 mb-2">
                <div class="flex h-8 w-8 items-center justify-center rounded bg-violet-100">
                  <svg class="h-4 w-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                </div>
                <h3 class="text-sm font-semibold text-black/85">执行动作</h3>
              </div>

              <div class="space-y-4">
                <div class="space-y-1.5">
                  <label class="text-sm text-black/85 font-medium">动作类型</label>
                  <select v-model="form.action.type" class="ant-select">
                    <option v-for="opt in actionTypeOptions" :key="opt.value" :value="opt.value">{{ opt.icon }} {{ opt.label }}</option>
                  </select>
                </div>

                <!-- 盈亏控制参数 -->
                <div v-if="form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL" class="space-y-4 p-4 rounded-lg bg-black/[0.02] border border-black/[0.05]">
                  <div class="grid gap-4 sm:grid-cols-2">
                    <div class="space-y-1.5">
                      <label class="text-xs text-black/45">盈利概率 ({{ (form.action.params.profitControl.winProbability * 100).toFixed(0) }}%)</label>
                      <input v-model.number="form.action.params.profitControl.winProbability" type="range" min="0" max="1" step="0.01" class="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-antd-primary" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs text-black/45">预期盈亏值 (EV)</label>
                      <div class="text-sm font-mono font-medium" :class="calculatedExpectedValue >= 0 ? 'text-emerald-500' : 'text-rose-500'">{{ calculatedExpectedValue.toFixed(2) }}%</div>
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs text-black/45">单笔盈利 %</label>
                      <input v-model.number="form.action.params.profitControl.avgWinAmount" type="number" class="ant-input !py-1" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs text-black/45">单笔亏损 %</label>
                      <input v-model.number="form.action.params.profitControl.avgLossAmount" type="number" class="ant-input !py-1" />
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-xs text-black/45">价格修正策略</label>
                    <div class="grid grid-cols-2 gap-2">
                      <button v-for="opt in profitControlStrategyOptions" :key="opt.value" type="button" @click="form.action.params.profitControl.strategy = opt.value" :class="form.action.params.profitControl.strategy === opt.value ? 'border-antd-primary bg-antd-primary/5 text-antd-primary' : 'border-black/10 bg-white text-black/45'" class="text-xs py-2 px-3 border rounded-md transition-all">{{ opt.label }}</button>
                    </div>
                  </div>
                </div>

                <!-- 强制盈亏参数 -->
                <div v-if="form.action.type === DELIVERY_RULE_ACTION.FORCE_WIN || form.action.type === DELIVERY_RULE_ACTION.FORCE_LOSS" class="space-y-4 p-4 rounded-lg bg-black/[0.02] border border-black/[0.05]">
                  <div class="grid gap-4 sm:grid-cols-2">
                    <div class="space-y-1.5">
                      <label class="text-xs text-black/45">影响订单数</label>
                      <input v-model.number="form.action.params.nextPositionCount" type="number" class="ant-input !py-1" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs text-black/45">{{ form.action.type === DELIVERY_RULE_ACTION.FORCE_WIN ? '盈利' : '亏损' }}比例 %</label>
                      <input v-if="form.action.type === DELIVERY_RULE_ACTION.FORCE_WIN" v-model.number="form.action.params.profitPercent" type="number" class="ant-input !py-1" />
                      <input v-else v-model.number="form.action.params.lossPercent" type="number" class="ant-input !py-1" />
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-4 pt-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input v-model="form.action.params.applyToNewPositions" type="checkbox" class="rounded border-black/15 text-antd-primary focus:ring-antd-primary/20" />
                    <span class="text-xs text-black/45">仅应用于新开仓位</span>
                  </label>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-black/45">持续时长</span>
                    <input v-model.number="form.action.params.duration" type="number" class="ant-input !py-0.5 !px-2 !w-16 !text-xs" />
                    <span class="text-xs text-black/45">分钟</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <footer class="flex justify-end gap-3 border-t border-black/[0.06] bg-white px-6 py-4">
            <button type="button" class="ant-btn" @click="close">取消</button>
            <button type="button" class="ant-btn ant-btn-primary" @click="save">保存规则</button>
          </footer>
        </div>

        <!-- 右侧帮助区域 -->
        <div class="flex w-2/5 flex-col bg-black/[0.01]">
          <header class="border-b border-black/[0.06] px-6 py-4">
            <h3 class="text-base font-semibold text-black/85">配置说明</h3>
            <p class="mt-1 text-xs text-black/45">帮助您更好地理解规则配置项</p>
          </header>
          <div class="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div class="space-y-2">
              <h4 class="text-sm font-medium text-black/85 flex items-center gap-2">
                <span class="h-1.5 w-1.5 rounded-full bg-antd-primary"></span>
                触发机制
              </h4>
              <p class="text-xs text-black/45 leading-relaxed">系统会实时监控用户的交易行为，当满足设定的阈值条件时，规则将立即生效并执行相应的动作。</p>
            </div>
            
            <div class="space-y-2">
              <h4 class="text-sm font-medium text-black/85 flex items-center gap-2">
                <span class="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                盈亏控制 (线控)
              </h4>
              <p class="text-xs text-black/45 leading-relaxed">通过算法在合理范围内选择结算价格。长期来看，用户的实际盈亏将趋近于您设定的期望值。这是一种隐蔽且有效的风控手段。</p>
            </div>

            <div class="p-4 rounded-lg bg-black/[0.02] border border-black/[0.05] space-y-3">
              <h4 class="text-xs font-semibold text-black/65">常用配置示例</h4>
              <div class="space-y-2">
                <div class="text-[11px] p-2 bg-white rounded border border-black/[0.05]">
                  <div class="font-medium text-black/85 mb-1">连胜风控</div>
                  <div class="text-black/45">触发：连续盈利 5 次</div>
                  <div class="text-black/45">动作：盈亏控制 (盈利概率 20%)</div>
                </div>
                <div class="text-[11px] p-2 bg-white rounded border border-black/[0.05]">
                  <div class="font-medium text-black/85 mb-1">异常大额盈利</div>
                  <div class="text-black/45">触发：累计盈亏 > 5000 USDT</div>
                  <div class="text-black/45">动作：强制亏损 1 单 (30%)</div>
                </div>
              </div>
            </div>

            <div class="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <div class="flex items-center gap-2 text-amber-800 mb-2">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span class="text-xs font-semibold">注意事项</span>
              </div>
              <ul class="text-[11px] text-amber-700 space-y-1.5 list-disc pl-4">
                <li>高优先级规则会优先于低优先级规则执行。</li>
                <li>“持续时间”设置为 0 时，规则触发后仅对当前的一笔订单生效。</li>
                <li>强制盈亏比例是相对于订单本金计算的。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.ant-input {
  @apply w-full rounded border border-black/15 bg-white px-3 py-2 text-sm text-black/85 transition-all outline-none;
}
.ant-input:focus {
  @apply border-antd-primary ring-2 ring-antd-primary/10;
}
.ant-input::placeholder {
  @apply text-black/25;
}

.ant-select {
  @apply w-full rounded border border-black/15 bg-white px-3 py-2 text-sm text-black/85 transition-all outline-none appearance-none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23bfbfbf'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 14px;
}
.ant-select:focus {
  @apply border-antd-primary ring-2 ring-antd-primary/10;
}

.ant-btn {
  @apply inline-flex items-center justify-center rounded border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/65 transition-all hover:border-antd-primary hover:text-antd-primary active:bg-black/[0.02];
}
.ant-btn-primary {
  @apply border-antd-primary bg-antd-primary text-white hover:bg-antd-primary/90 hover:border-antd-primary/90 hover:text-white active:bg-antd-primary;
  box-shadow: 0 2px 0 rgba(5, 145, 255, 0.1);
}
</style>
