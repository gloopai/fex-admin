<script setup>
import { computed, ref } from 'vue'
import { verificationConfig } from '../../../admin/mock/verification'
import { VERIFICATION_DOC_TYPE, VERIFICATION_DOC_TYPE_OPTIONS, VERIFICATION_LEVEL } from '../../../constants/verification'

const basicStatus = ref('unsubmitted') // unsubmitted | reviewing | approved | rejected
const advancedStatus = ref('idle') // idle | reviewing | approved | rejected

const showDevTools = ref(false)
const showPayload = ref(false)
/** 初级已通过后默认收起，避免高级区块被挤到视口外 */
const expandBasicPrimary = ref(false)

const BASIC_DOC_TYPE_OPTIONS = [
  { value: 'national_id', label: 'National ID / 身份证' },
  { value: 'passport', label: 'Passport / 护照' },
  { value: 'driver_license', label: "Driver's License / 驾驶证" },
  { value: 'residence_permit', label: 'Residence Permit / 居留许可' }
]

const basicForm = ref({
  country: '',
  city: '',
  name: '',
  docType: BASIC_DOC_TYPE_OPTIONS[0].value,
  docNumber: '',
  email: ''
})

const advancedRequiredDocs = verificationConfig[VERIFICATION_LEVEL.ADVANCED].requireDocuments
const singleImageDocs = [
  { key: 'id_card_front', label: '身份证正面' },
  { key: 'id_card_back', label: '身份证反面' },
  { key: VERIFICATION_DOC_TYPE.ID_CARD_HOLD, label: '手持身份证' }
]
const singleImageDocKeys = singleImageDocs.map((it) => it.key)
const multiFileDocs = advancedRequiredDocs.filter((t) => ![VERIFICATION_DOC_TYPE.ID_CARD, VERIFICATION_DOC_TYPE.ID_CARD_HOLD].includes(t))

const advancedForm = ref({
  singleFiles: Object.fromEntries(singleImageDocKeys.map((k) => [k, null])),
  files: Object.fromEntries(multiFileDocs.map((t) => [t, []]))
})

const canEnterAdvanced = computed(() => basicStatus.value === 'approved')
const showBasicForm = computed(() => basicStatus.value === 'unsubmitted' || basicStatus.value === 'rejected')
const showAdvancedUpload = computed(() => advancedStatus.value === 'idle' || advancedStatus.value === 'rejected')

const flowHeadline = computed(() => {
  if (advancedStatus.value === 'approved') return '认证已完成'
  if (advancedStatus.value === 'reviewing') return '高级认证审核中'
  if (canEnterAdvanced.value && advancedStatus.value === 'idle') return '请提交高级认证资料'
  if (basicStatus.value === 'approved') return '初级认证已通过'
  if (basicStatus.value === 'reviewing') return '初级认证审核中'
  if (basicStatus.value === 'rejected') return '初级认证被驳回'
  return '请提交初级认证资料'
})

const steps = computed(() => {
  const s1Done = basicStatus.value !== 'unsubmitted'
  const s2Done = basicStatus.value === 'approved' || basicStatus.value === 'rejected' // 初审结束
  const s3Done = advancedStatus.value !== 'idle'
  const s4Done = advancedStatus.value === 'approved' || advancedStatus.value === 'rejected'

  const s1Active = !s1Done
  const s2Active = s1Done && basicStatus.value === 'reviewing'
  const s3Active = basicStatus.value === 'approved' && advancedStatus.value === 'idle'
  const s4Active = advancedStatus.value === 'reviewing'

  return [
    {
      key: 'submit-basic',
      title: '提交初级资料',
      desc: '填写基础信息并提交',
      state: s1Done ? 'done' : s1Active ? 'active' : 'upcoming'
    },
    {
      key: 'review-basic',
      title: '初级审核',
      desc: '平台审核初级认证',
      state: s2Done ? 'done' : s2Active ? 'active' : 'upcoming'
    },
    {
      key: 'submit-advanced',
      title: '提交高级资料',
      desc: '按清单上传证件材料',
      state: s3Done ? 'done' : s3Active ? 'active' : 'upcoming'
    },
    {
      key: 'review-advanced',
      title: '高级审核',
      desc: '平台审核高级认证',
      state: s4Done ? 'done' : s4Active ? 'active' : 'upcoming'
    }
  ]
})

const stepDotClass = (state) => {
  if (state === 'done') return 'bg-emerald-400 text-black ring-emerald-300/40'
  if (state === 'active') return 'bg-lime-300 text-black ring-lime-200/40'
  return 'bg-white/10 text-white/40 ring-white/10'
}

const stepLineClass = (state) => {
  if (state === 'done') return 'bg-emerald-400/70'
  if (state === 'active') return 'bg-lime-300/40'
  return 'bg-white/10'
}

const getDocLabel = (docType) => {
  const single = singleImageDocs.find((it) => it.key === docType)
  if (single) return single.label
  const found = VERIFICATION_DOC_TYPE_OPTIONS.find((it) => it.value === docType)
  return found ? found.label : docType
}

const getBasicDocTypeLabel = (docType) => {
  const found = BASIC_DOC_TYPE_OPTIONS.find((it) => it.value === docType)
  return found ? found.label : docType
}

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const isImageFile = (file) => Boolean(file && file.type?.startsWith('image/'))

const previewUrl = (file) => {
  if (!file) return ''
  try {
    return URL.createObjectURL(file)
  } catch {
    return ''
  }
}

const requiredUploadCount = computed(() => singleImageDocKeys.length + multiFileDocs.length)
const uploadedAdvancedCount = computed(() => {
  const groupedDone = singleImageDocKeys.filter((k) => Boolean(advancedForm.value.singleFiles[k])).length
  const multiDone = multiFileDocs.filter((t) => (advancedForm.value.files[t] || []).length > 0).length
  return groupedDone + multiDone
})
const allAdvancedReady = computed(() => uploadedAdvancedCount.value >= requiredUploadCount.value)

const backendPayloadPreview = computed(() => ({
  applyLevel: VERIFICATION_LEVEL.ADVANCED,
  currentLevel: VERIFICATION_LEVEL.BASIC,
  basicInfo: {
    realName: basicForm.value.name || '待填写',
    idNumber: basicForm.value.docNumber || '待填写',
    nationality: basicForm.value.country || '待填写',
    address: basicForm.value.city || '待填写'
  },
  documents: [
    ...singleImageDocKeys.map((type) => {
      const file = advancedForm.value.singleFiles[type]
      return {
        type,
        fileName: file?.name || null,
        fileSize: file?.size ?? null,
        mimeType: file?.type || null
      }
    }),
    ...multiFileDocs.map((type) => ({
      type,
      fileNames: (advancedForm.value.files[type] || []).map((f) => f.name),
      fileCount: (advancedForm.value.files[type] || []).length
    }))
  ],
  extra: {
    email: basicForm.value.email || '待填写'
  }
}))

const onPickSingleFile = (docType, event) => {
  const file = event.target.files?.[0] || null
  advancedForm.value.singleFiles = { ...advancedForm.value.singleFiles, [docType]: file }
}

const onPickFile = (docType, event) => {
  const files = Array.from(event.target.files || [])
  if (!files.length) return
  advancedForm.value.files = {
    ...advancedForm.value.files,
    [docType]: [...(advancedForm.value.files[docType] || []), ...files]
  }
  event.target.value = ''
}

const clearSingleFile = (docType) => {
  advancedForm.value.singleFiles = { ...advancedForm.value.singleFiles, [docType]: null }
}

const clearFile = (docType, index) => {
  const next = { ...advancedForm.value.files }
  const items = [...(next[docType] || [])]
  items.splice(index, 1)
  next[docType] = items
  advancedForm.value.files = next
}

const submitBasic = () => {
  basicStatus.value = 'reviewing'
  advancedStatus.value = 'idle'
}

const submitAdvanced = () => {
  advancedStatus.value = 'reviewing'
}

const resetFlow = () => {
  basicStatus.value = 'unsubmitted'
  advancedStatus.value = 'idle'
  advancedForm.value = {
    singleFiles: Object.fromEntries(singleImageDocKeys.map((k) => [k, null])),
    files: Object.fromEntries(multiFileDocs.map((t) => [t, []]))
  }
  showPayload.value = false
  expandBasicPrimary.value = false
}
</script>

<template>
  <div class="mx-auto max-w-[1280px] px-6 py-6 text-white">
    <div class="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <div class="text-xs text-white/55">身份认证 / 审批流程</div>
        <h1 class="mt-1 text-2xl font-semibold">身份认证</h1>
        <p class="mt-2 max-w-[720px] text-sm text-white/65">
          先完成初级认证并通过审核，再按清单上传高级认证材料。
        </p>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80">
        <div class="text-xs text-white/55">当前进度</div>
        <div class="mt-1 font-semibold text-white">{{ flowHeadline }}</div>
      </div>
    </div>

    <!-- Progress -->
    <section class="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="text-sm font-semibold">流程进度</div>
        <div class="text-xs text-white/55">已完成 {{ uploadedAdvancedCount }}/{{ requiredUploadCount }} 项高级资料上传（未进入高级阶段不计）</div>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div v-for="(step, idx) in steps" :key="step.key" class="relative">
          <div class="flex items-start gap-3">
            <div
              class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ring-2"
              :class="stepDotClass(step.state)"
            >
              {{ idx + 1 }}
            </div>
            <div class="min-w-0">
              <div class="truncate text-sm font-semibold">{{ step.title }}</div>
              <div class="mt-1 text-xs text-white/55">{{ step.desc }}</div>
            </div>
          </div>
          <div
            v-if="idx < steps.length - 1"
            class="pointer-events-none absolute left-[17px] top-10 hidden h-[calc(100%-2.25rem)] w-px md:block"
            :class="stepLineClass(step.state)"
          ></div>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <!-- Left rail -->
      <aside class="space-y-4">
        <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div class="text-sm font-semibold">你需要做什么</div>
          <ol class="mt-3 space-y-2 text-sm text-white/70">
            <li class="flex gap-2"><span class="text-white/40">1.</span>提交初级资料并等待审核</li>
            <li class="flex gap-2"><span class="text-white/40">2.</span>初级通过后，上传高级资料清单</li>
            <li class="flex gap-2"><span class="text-white/40">3.</span>等待高级审核结果</li>
          </ol>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <button type="button" class="flex w-full items-center justify-between text-left" @click="showDevTools = !showDevTools">
            <div>
              <div class="text-sm font-semibold">联调工具（模拟审批）</div>
              <div class="mt-1 text-xs text-white/55">用于演示审批流，不影响真实接口</div>
            </div>
            <span class="text-white/60">{{ showDevTools ? '收起' : '展开' }}</span>
          </button>

          <div v-if="showDevTools" class="mt-4 space-y-2 text-xs">
            <button class="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-left hover:bg-white/[0.07]" @click="resetFlow">
              重置流程
            </button>
            <button
              v-if="basicStatus === 'reviewing'"
              class="w-full rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-left text-emerald-100 hover:bg-emerald-400/15"
              @click="basicStatus = 'approved'"
            >
              模拟：初级审核通过
            </button>
            <button
              v-if="basicStatus === 'reviewing'"
              class="w-full rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-left text-rose-100 hover:bg-rose-400/15"
              @click="basicStatus = 'rejected'"
            >
              模拟：初级审核驳回
            </button>
            <button
              v-if="advancedStatus === 'reviewing'"
              class="w-full rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-left text-emerald-100 hover:bg-emerald-400/15"
              @click="advancedStatus = 'approved'"
            >
              模拟：高级审核通过
            </button>
            <button
              v-if="advancedStatus === 'reviewing'"
              class="w-full rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-left text-rose-100 hover:bg-rose-400/15"
              @click="advancedStatus = 'rejected'"
            >
              模拟：高级审核驳回
            </button>
          </div>
        </div>
      </aside>

      <!-- Main -->
      <div class="space-y-6">
        <section class="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-xs text-white/55">步骤 1 / 2</div>
              <h2 class="mt-1 text-xl font-semibold">初级认证</h2>
              <p v-if="!(basicStatus === 'approved' && !expandBasicPrimary)" class="mt-2 text-sm text-white/65">提交后进入审核，通过后解锁高级认证资料上传。</p>
            </div>
            <div
              class="rounded-full border px-3 py-1 text-xs"
              :class="
                basicStatus === 'approved'
                  ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
                  : basicStatus === 'reviewing'
                    ? 'border-amber-400/40 bg-amber-400/10 text-amber-100'
                    : basicStatus === 'rejected'
                      ? 'border-rose-400/40 bg-rose-400/10 text-rose-100'
                      : 'border-white/15 bg-white/[0.04] text-white/70'
              "
            >
              {{
                basicStatus === 'unsubmitted'
                  ? '待提交'
                  : basicStatus === 'reviewing'
                    ? '审核中'
                    : basicStatus === 'approved'
                      ? '已通过'
                      : '已驳回'
              }}
            </div>
          </div>

          <div v-if="basicStatus === 'reviewing'" class="mt-4 rounded-xl border border-amber-300/40 bg-amber-300/10 p-4 text-sm text-amber-100">
            已提交初级资料，平台审核中。你可以继续留在页面等待结果（演示环境可用左侧“联调工具”模拟通过）。
          </div>
          <div v-if="basicStatus === 'rejected'" class="mt-4 rounded-xl border border-rose-300/40 bg-rose-300/10 p-4 text-sm text-rose-100">
            初级审核未通过：请根据提示修改资料后重新提交。
          </div>
          <div v-if="basicStatus === 'approved' && expandBasicPrimary" class="mt-4 rounded-xl border border-emerald-300/40 bg-emerald-300/10 p-4 text-sm text-emerald-100">
            初级审核已通过：请继续完成高级资料上传与提交。初级资料区域默认收起，避免遮挡高级区块。
          </div>

          <div v-if="showBasicForm" class="mt-5 grid grid-cols-2 gap-4">
            <input v-model="basicForm.country" class="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm" placeholder="国家" />
            <input v-model="basicForm.city" class="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm" placeholder="所在城市" />
            <input v-model="basicForm.name" class="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm" placeholder="姓名" />
            <select v-model="basicForm.docType" class="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm">
              <option v-for="option in BASIC_DOC_TYPE_OPTIONS" :key="option.value" :value="option.value" class="bg-[#111]">
                {{ option.label }}
              </option>
            </select>
            <input v-model="basicForm.docNumber" class="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm" placeholder="证件号码" />
            <input v-model="basicForm.email" class="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm" placeholder="邮箱" />
          </div>

          <div v-else-if="basicStatus === 'reviewing'" class="mt-5 grid grid-cols-2 gap-4">
            <input v-model="basicForm.country" class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45" disabled />
            <input v-model="basicForm.city" class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45" disabled />
            <input v-model="basicForm.name" class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45" disabled />
            <select v-model="basicForm.docType" class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45" disabled>
              <option v-for="option in BASIC_DOC_TYPE_OPTIONS" :key="option.value" :value="option.value" class="bg-[#111]">
                {{ option.label }}
              </option>
            </select>
            <input v-model="basicForm.docNumber" class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45" disabled />
            <input v-model="basicForm.email" class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45" disabled />
          </div>

          <div
            v-else-if="basicStatus === 'approved' && !expandBasicPrimary"
            class="mt-5 flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="min-w-0">
              <div class="text-sm font-semibold text-white/90">初级认证已通过</div>
              <div class="mt-1 text-sm text-white/55">
                {{ basicForm.name || '—' }}
                <span v-if="basicForm.docNumber" class="text-white/45"> · 证件尾号 {{ basicForm.docNumber.slice(-4) }}</span>
              </div>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/[0.09]"
              @click="expandBasicPrimary = true"
            >
              查看详情
            </button>
          </div>

          <div v-else-if="basicStatus === 'approved' && expandBasicPrimary" class="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div class="text-xs text-white/55">初级资料（只读）</div>
              <button type="button" class="text-xs font-semibold text-white/60 hover:text-white/80" @click="expandBasicPrimary = false">收起</button>
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="text-white/55">国家</div>
              <div class="text-white/90">{{ basicForm.country || '-' }}</div>
              <div class="text-white/55">城市</div>
              <div class="text-white/90">{{ basicForm.city || '-' }}</div>
              <div class="text-white/55">姓名</div>
              <div class="text-white/90">{{ basicForm.name || '-' }}</div>
              <div class="text-white/55">证件类型</div>
              <div class="text-white/90">{{ getBasicDocTypeLabel(basicForm.docType) || '-' }}</div>
              <div class="text-white/55">证件号码</div>
              <div class="text-white/90">{{ basicForm.docNumber || '-' }}</div>
              <div class="text-white/55">邮箱</div>
              <div class="text-white/90">{{ basicForm.email || '-' }}</div>
            </div>
            <p class="mt-3 text-xs text-white/55">初级认证已完成：信息以提交内容为准。若需修改，请等待驳回后重新提交或联系客服。</p>
          </div>

          <div v-if="showBasicForm" class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-xs text-white/55">提交后进入审核队列（演示）</div>
            <button
              class="w-full rounded-lg bg-lime-400 px-5 py-3 text-sm font-semibold text-black sm:w-auto"
              @click="submitBasic"
            >
              提交初级认证
            </button>
          </div>
        </section>

        <section v-if="canEnterAdvanced" class="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-xs text-white/55">步骤 2 / 2</div>
              <h2 class="mt-1 text-xl font-semibold">高级认证</h2>
              <p v-if="showAdvancedUpload" class="mt-2 text-sm text-white/65">请按清单逐项上传。全部上传完成后再提交进入审核。</p>
            </div>
            <div
              class="rounded-full border px-3 py-1 text-xs"
              :class="
                advancedStatus === 'approved'
                  ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
                  : advancedStatus === 'reviewing'
                    ? 'border-sky-400/40 bg-sky-400/10 text-sky-100'
                    : advancedStatus === 'rejected'
                      ? 'border-rose-400/40 bg-rose-400/10 text-rose-100'
                      : 'border-white/15 bg-white/[0.04] text-white/70'
              "
            >
              {{
                advancedStatus === 'idle'
                  ? '待提交'
                  : advancedStatus === 'reviewing'
                    ? '审核中'
                    : advancedStatus === 'approved'
                      ? '已通过'
                      : '已驳回'
              }}
            </div>
          </div>

          <div v-if="advancedStatus === 'reviewing'" class="mt-4 rounded-xl border border-sky-300/40 bg-sky-300/10 p-4 text-sm text-sky-100">
            高级资料已提交：平台审核中。下方为已提交材料只读列表，不可再次上传。
          </div>
          <div v-if="advancedStatus === 'approved'" class="mt-4 rounded-xl border border-emerald-300/40 bg-emerald-300/10 p-4 text-sm text-emerald-100">
            高级认证已通过：认证流程结束。下方为归档材料只读列表。
          </div>
          <div v-if="advancedStatus === 'rejected'" class="mt-4 rounded-xl border border-rose-300/40 bg-rose-300/10 p-4 text-sm text-rose-100">
            高级审核未通过：请按提示补充/替换材料后重新提交。
          </div>

          <div v-if="showAdvancedUpload" class="mt-5 space-y-4">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div class="mb-3 text-sm font-semibold text-white/85">身份证件</div>
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div v-for="docType in singleImageDocKeys" :key="`single-${docType}`" class="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-white">{{ getDocLabel(docType) }}</p>
                      <p class="mt-1 text-xs text-white/55">仅需上传 1 张图片</p>
                    </div>
                    <span class="inline-flex items-center whitespace-nowrap rounded-md border border-lime-300/40 bg-lime-300/10 px-2.5 py-0.5 text-xs leading-none text-lime-200">必传</span>
                  </div>

                  <label v-if="!advancedForm.singleFiles[docType]" class="mt-4 block h-[168px] cursor-pointer rounded-2xl border border-dashed border-white/25 bg-black/20 p-6 hover:bg-black/30">
                    <div class="flex flex-col items-center justify-center gap-3 text-center">
                      <!-- <div class="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                        <svg viewBox="0 0 24 24" class="h-6 w-6 text-white/85" fill="none">
                          <path d="M12 16V4M12 12l4-4m-4 4L8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M4 13.5V18a2 2 0 002 2h12a2 2 0 002-2v-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                        </svg>
                      </div> -->
                      <div>
                        <div class="text-sm font-semibold text-white">上传{{ getDocLabel(docType) }}</div>
                        <div class="mt-1 text-xs text-white/55">仅支持图片（JPG / PNG）</div>
                      </div>
                      <div class="rounded-full bg-lime-400 px-4 py-2 text-xs font-semibold text-black">选择图片</div>
                    </div>
                    <input type="file" accept="image/*" class="hidden" @change="onPickSingleFile(docType, $event)" />
                  </label>

                  <div v-else class="mt-4 flex h-[168px] flex-col rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="truncate text-sm text-emerald-50">{{ advancedForm.singleFiles[docType].name }}</div>
                        <div class="mt-1 text-xs text-emerald-100/80">已上传 · {{ formatBytes(advancedForm.singleFiles[docType].size) }}</div>
                      </div>
                      <button type="button" class="text-xs text-emerald-100/80 hover:text-white" @click="clearSingleFile(docType)">重传</button>
                    </div>
                    <div class="mt-3 min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                      <img :src="previewUrl(advancedForm.singleFiles[docType])" alt="preview" class="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div class="mb-3 text-sm font-semibold text-white/85">证明材料</div>
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div v-for="docType in multiFileDocs" :key="docType" class="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-h-[46px]">
                      <p class="text-sm font-semibold text-white">{{ getDocLabel(docType) }}</p>
                      <p class="mt-1 text-xs text-white/55">支持 JPG/PNG/PDF，可上传多个文件，建议单文件不超过 10MB</p>
                    </div>
                    <span class="inline-flex items-center whitespace-nowrap rounded-md border border-lime-300/40 bg-lime-300/10 px-2.5 py-0.5 text-xs leading-none text-lime-200">必传</span>
                  </div>

                  <label
                    v-if="!(advancedForm.files[docType] || []).length"
                    class="mt-4 block h-[168px] cursor-pointer rounded-2xl border border-dashed border-white/25 bg-black/20 p-6 hover:bg-black/30"
                  >
                    <div class="flex flex-col items-center justify-center gap-3 text-center">
                      <!-- <div class="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                        <svg viewBox="0 0 24 24" class="h-6 w-6 text-white/85" fill="none">
                          <path d="M12 16V4M12 12l4-4m-4 4L8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M4 13.5V18a2 2 0 002 2h12a2 2 0 002-2v-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                        </svg>
                      </div> -->
                      <div>
                        <div class="text-sm font-semibold text-white">上传{{ getDocLabel(docType) }}</div>
                        <div class="mt-1 text-xs text-white/55">点击选择文件，支持 JPG / PNG / PDF</div>
                      </div>
                      <div class="rounded-full bg-lime-400 px-4 py-2 text-xs font-semibold text-black">选择文件</div>
                    </div>
                    <input type="file" multiple accept="image/*,application/pdf" class="hidden" @change="onPickFile(docType, $event)" />
                  </label>

                  <div v-else class="mt-4 flex h-[168px] gap-3">
                    <label class="w-[132px] shrink-0 cursor-pointer rounded-xl border border-dashed border-white/25 bg-black/20 p-3 hover:bg-black/30">
                      <div class="flex h-full flex-col items-center justify-center gap-2 text-center">
                        <div class="text-xs text-white/70">继续上传</div>
                        <div class="rounded-full bg-lime-400 px-3 py-1 text-xs font-semibold text-black">选择文件</div>
                      </div>
                      <input type="file" multiple accept="image/*,application/pdf" class="hidden" @change="onPickFile(docType, $event)" />
                    </label>

                    <div class="min-w-0 flex-1 space-y-2 overflow-y-auto pr-1 h-[168px]">
                      <div
                        v-for="(f, index) in advancedForm.files[docType]"
                        :key="`${docType}-${index}-${f.name}`"
                        class="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2"
                      >
                        <div class="min-w-0">
                          <div class="truncate text-sm text-white/90">{{ f.name }}</div>
                          <div class="text-xs text-white/55">{{ formatBytes(f.size) }}</div>
                        </div>
                        <button type="button" class="shrink-0 text-xs text-white/60 hover:text-white" @click="clearFile(docType, index)">删除</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="mt-5 space-y-4">
            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div class="mb-3 text-sm font-semibold text-white/85">身份证件</div>
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div v-for="docType in singleImageDocKeys" :key="`ro-single-${docType}`" class="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-white">{{ getDocLabel(docType) }}</p>
                      <p class="mt-1 text-xs text-white/55">已提交材料（只读）</p>
                    </div>
                  </div>
                  <template v-if="advancedForm.singleFiles[docType]">
                    <div class="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
                      <div class="min-w-0">
                        <div class="truncate text-sm text-white/90">{{ advancedForm.singleFiles[docType].name }}</div>
                        <div class="mt-1 text-xs text-white/55">{{ formatBytes(advancedForm.singleFiles[docType].size) }}</div>
                      </div>
                      <div v-if="isImageFile(advancedForm.singleFiles[docType])" class="mt-3 overflow-hidden rounded-lg border border-white/10">
                        <img :src="previewUrl(advancedForm.singleFiles[docType])" alt="preview" class="h-32 w-full object-cover" />
                      </div>
                    </div>
                  </template>
                  <div v-else class="mt-3 text-xs text-white/45">未上传</div>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div class="mb-3 text-sm font-semibold text-white/85">证明材料</div>
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div v-for="docType in multiFileDocs" :key="`ro-${docType}`" class="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-white">{{ getDocLabel(docType) }}</p>
                      <p class="mt-1 text-xs text-white/55">已提交材料（只读）</p>
                    </div>
                  </div>
                  <template v-if="(advancedForm.files[docType] || []).length">
                    <div v-for="(f, index) in advancedForm.files[docType]" :key="`ro-${docType}-${index}-${f.name}`" class="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
                      <div class="min-w-0">
                        <div class="truncate text-sm text-white/90">{{ f.name }}</div>
                        <div class="mt-1 text-xs text-white/55">{{ formatBytes(f.size) }}</div>
                      </div>
                      <div v-if="isImageFile(f)" class="mt-3 overflow-hidden rounded-lg border border-white/10">
                        <img :src="previewUrl(f)" alt="preview" class="h-40 w-full object-cover" />
                      </div>
                      <div v-else class="mt-3 text-xs text-white/55">PDF 文件（真实系统可在线预览）</div>
                    </div>
                  </template>
                  <div v-else class="mt-3 text-xs text-white/45">未上传</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="showAdvancedUpload" class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-xs text-white/55">
              已上传 {{ uploadedAdvancedCount }}/{{ requiredUploadCount }} 项
            </div>
            <button
              class="w-full rounded-lg bg-[#246BFD] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
              :disabled="!allAdvancedReady"
              @click="submitAdvanced"
            >
              提交高级认证资料
            </button>
          </div>

          <!-- <div class="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
            <button type="button" class="flex w-full items-center justify-between text-left" @click="showPayload = !showPayload">
              <div>
                <div class="text-sm font-semibold text-white/90">联调：提交数据结构预览</div>
                <div class="mt-1 text-xs text-white/55">默认折叠，避免干扰真实用户路径</div>
              </div>
              <span class="text-white/60">{{ showPayload ? '收起' : '展开' }}</span>
            </button>
            <pre v-if="showPayload" class="mt-3 overflow-auto text-xs text-white/70">{{ JSON.stringify(backendPayloadPreview, null, 2) }}</pre>
          </div> -->
        </section>
      </div>
    </div>
  </div>
</template>
