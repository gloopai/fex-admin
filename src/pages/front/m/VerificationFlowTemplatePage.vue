<script setup>
import { computed, ref } from 'vue'
import { verificationConfig } from '../../../admin/mock/verification'
import { VERIFICATION_DOC_TYPE, VERIFICATION_DOC_TYPE_OPTIONS, VERIFICATION_LEVEL } from '../../../constants/verification'

const basicStatus = ref('unsubmitted')
const advancedStatus = ref('idle')

const showDevTools = ref(false)
const showPayload = ref(false)
/** 初级已通过后默认收起，避免高级区块被挤到屏幕外 */
const expandBasicPrimary = ref(false)

const form = ref({
  country: '',
  city: '',
  name: '',
  idNumber: '',
  email: '',
  files: {}
})

const requiredDocs = verificationConfig[VERIFICATION_LEVEL.ADVANCED].requireDocuments
const singleImageDocs = [
  { key: 'id_card_front', label: '身份证正面' },
  { key: 'id_card_back', label: '身份证反面' },
  { key: VERIFICATION_DOC_TYPE.ID_CARD_HOLD, label: '手持身份证' }
]
const singleImageDocKeys = singleImageDocs.map((it) => it.key)
const multiFileDocs = requiredDocs.filter((t) => ![VERIFICATION_DOC_TYPE.ID_CARD, VERIFICATION_DOC_TYPE.ID_CARD_HOLD].includes(t))
const canEnterAdvanced = computed(() => basicStatus.value === 'approved')
const showBasicForm = computed(() => basicStatus.value === 'unsubmitted' || basicStatus.value === 'rejected')
/** 仅待提交、被驳回时可上传；审核中/已通过只读展示，避免误解 */
const showAdvancedUpload = computed(() => advancedStatus.value === 'idle' || advancedStatus.value === 'rejected')

const flowHeadline = computed(() => {
  if (advancedStatus.value === 'approved') return '认证已完成'
  if (advancedStatus.value === 'reviewing') return '高级认证审核中'
  if (canEnterAdvanced.value && advancedStatus.value === 'idle') return '请提交高级资料'
  if (basicStatus.value === 'reviewing') return '初级认证审核中'
  if (basicStatus.value === 'rejected') return '初级认证被驳回'
  if (basicStatus.value === 'approved') return '初级认证已通过'
  return '请提交初级资料'
})

const steps = computed(() => {
  const s1Done = basicStatus.value !== 'unsubmitted'
  const s2Done = basicStatus.value === 'approved' || basicStatus.value === 'rejected'
  const s3Done = advancedStatus.value !== 'idle'
  const s4Done = advancedStatus.value === 'approved' || advancedStatus.value === 'rejected'

  return [
    { title: '提交初级', desc: '填写并提交', state: s1Done ? 'done' : 'active' },
    { title: '初级审核', desc: '平台审核', state: s2Done ? 'done' : s1Done && basicStatus.value === 'reviewing' ? 'active' : 'upcoming' },
    { title: '提交高级', desc: '上传资料', state: s3Done ? 'done' : basicStatus.value === 'approved' && advancedStatus.value === 'idle' ? 'active' : 'upcoming' },
    { title: '高级审核', desc: '平台审核', state: s4Done ? 'done' : advancedStatus.value === 'reviewing' ? 'active' : 'upcoming' }
  ]
})

const stepDotClass = (state) => {
  if (state === 'done') return 'bg-emerald-400 text-black'
  if (state === 'active') return 'bg-lime-300 text-black'
  return 'bg-white/10 text-white/45'
}

const requiredUploadCount = computed(() => singleImageDocKeys.length + multiFileDocs.length)
const uploadedAdvancedCount = computed(() => {
  const singleDone = singleImageDocKeys.filter((k) => Boolean(form.value.files[k])).length
  const multiDone = multiFileDocs.filter((t) => (form.value.files[t] || []).length > 0).length
  return singleDone + multiDone
})
const allAdvancedReady = computed(() => uploadedAdvancedCount.value >= requiredUploadCount.value)

const getDocLabel = (docType) => {
  const single = singleImageDocs.find((it) => it.key === docType)
  if (single) return single.label
  const found = VERIFICATION_DOC_TYPE_OPTIONS.find((it) => it.value === docType)
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

const payloadPreview = computed(() => ({
  applyLevel: VERIFICATION_LEVEL.ADVANCED,
  currentLevel: VERIFICATION_LEVEL.BASIC,
  basicInfo: {
    realName: form.value.name || '待填写',
    idNumber: form.value.idNumber || '待填写',
    nationality: form.value.country || '待填写',
    address: form.value.city || '待填写'
  },
  documents: [
    ...singleImageDocKeys.map((type) => {
      const file = form.value.files[type]
      return {
        type,
        fileName: file?.name || null,
        fileSize: file?.size ?? null,
        mimeType: file?.type || null
      }
    }),
    ...multiFileDocs.map((type) => ({
      type,
      fileNames: (form.value.files[type] || []).map((f) => f.name),
      fileCount: (form.value.files[type] || []).length
    }))
  ],
  extra: { email: form.value.email || '待填写' }
}))

const onPickFile = (docType, event) => {
  if (singleImageDocKeys.includes(docType)) {
    const file = event.target.files?.[0] || null
    form.value.files = {
      ...form.value.files,
      [docType]: file
    }
    return
  }
  const files = Array.from(event.target.files || [])
  if (!files.length) return
  form.value.files = {
    ...form.value.files,
    [docType]: [...(form.value.files[docType] || []), ...files]
  }
  event.target.value = ''
}

const clearFile = (docType, index) => {
  if (singleImageDocKeys.includes(docType)) {
    form.value.files = {
      ...form.value.files,
      [docType]: null
    }
    return
  }
  const next = { ...form.value.files }
  const items = [...(next[docType] || [])]
  items.splice(index, 1)
  next[docType] = items
  form.value.files = next
}

const submitBasic = () => {
  basicStatus.value = 'reviewing'
  advancedStatus.value = 'idle'
}

const submitAdvanced = () => {
  advancedStatus.value = 'reviewing'
}

const resetAll = () => {
  basicStatus.value = 'unsubmitted'
  advancedStatus.value = 'idle'
  form.value.country = ''
  form.value.city = ''
  form.value.name = ''
  form.value.idNumber = ''
  form.value.email = ''
  form.value.files = Object.fromEntries([
    ...singleImageDocKeys.map((k) => [k, null]),
    ...multiFileDocs.map((t) => [t, []])
  ])
  showPayload.value = false
  expandBasicPrimary.value = false
}

form.value.files = Object.fromEntries([
  ...singleImageDocKeys.map((k) => [k, null]),
  ...multiFileDocs.map((t) => [t, []])
])
</script>

<template>
  <div class="mx-auto min-h-screen w-full max-w-md px-4 py-4 text-white">
    <header class="mb-4 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="text-2xl text-white/80">&lt;</span>
        <div>
          <div class="text-xs text-white/55">身份认证</div>
          <h1 class="text-2xl font-semibold">审批流程</h1>
        </div>
      </div>
      <div class="max-w-[160px] text-right text-xs text-white/60">{{ flowHeadline }}</div>
    </header>

    <!-- Progress strip -->
    <section class="mb-4 rounded-3xl border border-white/10 bg-white/[0.06] p-4">
      <div class="flex items-center justify-between text-xs text-white/55">
        <span>流程</span>
        <span>高级资料 {{ uploadedAdvancedCount }}/{{ requiredUploadCount }}</span>
      </div>
      <div class="mt-3 grid grid-cols-4 gap-2">
        <div v-for="(s, idx) in steps" :key="idx" class="text-center">
          <div class="mx-auto grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold" :class="stepDotClass(s.state)">
            {{ idx + 1 }}
          </div>
          <div class="mt-2 text-[11px] font-semibold leading-tight text-white/85">{{ s.title }}</div>
          <div class="mt-1 text-[10px] text-white/45">{{ s.desc }}</div>
        </div>
      </div>
    </section>

    <button
      type="button"
      class="mb-4 w-full rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-left"
      @click="showDevTools = !showDevTools"
    >
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-semibold">联调工具（模拟审批）</div>
          <div class="mt-1 text-xs text-white/55">演示审批流，不影响真实接口</div>
        </div>
        <span class="text-white/60">{{ showDevTools ? '收起' : '展开' }}</span>
      </div>
      <div v-if="showDevTools" class="mt-3 space-y-2 text-xs">
        <button class="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-left" @click="resetAll">重置流程</button>
        <button
          v-if="basicStatus === 'reviewing'"
          class="w-full rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-left text-emerald-100"
          @click="basicStatus = 'approved'"
        >
          模拟：初级审核通过
        </button>
        <button
          v-if="basicStatus === 'reviewing'"
          class="w-full rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-left text-rose-100"
          @click="basicStatus = 'rejected'"
        >
          模拟：初级审核驳回
        </button>
        <button
          v-if="advancedStatus === 'reviewing'"
          class="w-full rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-left text-emerald-100"
          @click="advancedStatus = 'approved'"
        >
          模拟：高级审核通过
        </button>
        <button
          v-if="advancedStatus === 'reviewing'"
          class="w-full rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-left text-rose-100"
          @click="advancedStatus = 'rejected'"
        >
          模拟：高级审核驳回
        </button>
      </div>
    </button>

    <!-- Step 1 -->
    <section class="rounded-3xl bg-white/[0.08] p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-xs text-white/55">步骤 1 / 2</div>
          <h2 class="mt-1 text-xl font-semibold">初级认证</h2>
        </div>
        <div
          class="rounded-full border px-3 py-1 text-[11px]"
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

      <div v-if="basicStatus === 'reviewing'" class="mt-3 rounded-2xl border border-amber-300/40 bg-amber-300/10 p-3 text-sm text-amber-100">
        已提交：等待初级审核结果。
      </div>
      <div v-if="basicStatus === 'rejected'" class="mt-3 rounded-2xl border border-rose-300/40 bg-rose-300/10 p-3 text-sm text-rose-100">
        审核未通过：请修改后重新提交。
      </div>
      <div v-if="basicStatus === 'approved' && expandBasicPrimary" class="mt-3 rounded-2xl border border-emerald-300/40 bg-emerald-300/10 p-3 text-sm text-emerald-100">
        初级已通过：下方可继续完成高级认证。初级资料默认已收起，避免占用屏幕。
      </div>

      <div v-if="showBasicForm" class="mt-4 space-y-3">
        <input v-model="form.country" class="w-full rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-3 text-base" placeholder="国家" />
        <input v-model="form.city" class="w-full rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-3 text-base" placeholder="所在城市" />
        <input v-model="form.name" class="w-full rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-3 text-base" placeholder="姓名" />
        <input v-model="form.idNumber" class="w-full rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-3 text-base" placeholder="证件号码" />
        <input v-model="form.email" class="w-full rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-3 text-base" placeholder="邮箱" />
      </div>

      <div v-else-if="basicStatus === 'reviewing'" class="mt-4 space-y-3">
        <input v-model="form.country" class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white/45" disabled />
        <input v-model="form.city" class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white/45" disabled />
        <input v-model="form.name" class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white/45" disabled />
        <input v-model="form.idNumber" class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white/45" disabled />
        <input v-model="form.email" class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white/45" disabled />
      </div>

      <div
        v-else-if="basicStatus === 'approved' && !expandBasicPrimary"
        class="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
      >
        <div class="min-w-0">
          <div class="font-semibold text-white/90">初级认证已通过</div>
          <div class="mt-1 truncate text-xs text-white/55">
            {{ form.name || '—' }}
            <span v-if="form.idNumber" class="text-white/45"> · 证件尾号 {{ form.idNumber.slice(-4) }}</span>
          </div>
        </div>
        <button type="button" class="shrink-0 text-xs font-semibold text-lime-300" @click="expandBasicPrimary = true">查看详情</button>
      </div>

      <div v-else-if="basicStatus === 'approved' && expandBasicPrimary" class="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
        <div class="mb-3 flex items-center justify-between gap-2">
          <span class="text-xs text-white/55">初级资料（只读）</span>
          <button type="button" class="text-xs font-semibold text-white/60" @click="expandBasicPrimary = false">收起</button>
        </div>
        <div class="flex justify-between gap-3 border-b border-white/10 py-2">
          <span class="text-white/55">国家</span><span class="text-white/90">{{ form.country || '-' }}</span>
        </div>
        <div class="flex justify-between gap-3 border-b border-white/10 py-2">
          <span class="text-white/55">城市</span><span class="text-white/90">{{ form.city || '-' }}</span>
        </div>
        <div class="flex justify-between gap-3 border-b border-white/10 py-2">
          <span class="text-white/55">姓名</span><span class="text-white/90">{{ form.name || '-' }}</span>
        </div>
        <div class="flex justify-between gap-3 border-b border-white/10 py-2">
          <span class="text-white/55">证件号</span><span class="text-white/90">{{ form.idNumber || '-' }}</span>
        </div>
        <div class="flex justify-between gap-3 py-2">
          <span class="text-white/55">邮箱</span><span class="text-white/90">{{ form.email || '-' }}</span>
        </div>
        <p class="mt-2 text-xs text-white/55">初级已完成：信息以提交内容为准。</p>
      </div>

      <button v-if="showBasicForm" class="mt-5 w-full rounded-full bg-lime-400 py-3 text-lg font-semibold text-black" @click="submitBasic">
        提交初级认证
      </button>
    </section>

    <!-- Step 2 -->
    <section v-if="canEnterAdvanced" class="mt-4 rounded-3xl bg-white/[0.08] p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-xs text-white/55">步骤 2 / 2</div>
          <h2 class="mt-1 text-lg font-semibold">高级认证</h2>
        </div>
        <div
          class="rounded-full border px-3 py-1 text-[11px]"
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

      <p v-if="showAdvancedUpload" class="mt-2 text-xs text-white/65">请按清单逐项上传，全部完成后再提交审核。</p>

      <div v-if="advancedStatus === 'reviewing'" class="mt-3 rounded-2xl border border-sky-300/40 bg-sky-300/10 p-3 text-sm text-sky-100">
        已提交：等待高级审核结果。下方为已提交材料只读列表，不可再次上传。
      </div>
      <div v-if="advancedStatus === 'approved'" class="mt-3 rounded-2xl border border-emerald-300/40 bg-emerald-300/10 p-3 text-sm text-emerald-100">
        高级认证已通过。下方为归档材料只读列表。
      </div>
      <div v-if="advancedStatus === 'rejected'" class="mt-3 rounded-2xl border border-rose-300/40 bg-rose-300/10 p-3 text-sm text-rose-100">
        高级审核未通过：请补充材料后重新提交。
      </div>

      <div v-if="showAdvancedUpload" class="mt-4 space-y-4">
        <div class="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div class="mb-3 text-sm font-semibold text-white/85">身份证件</div>
          <div class="space-y-3">
            <div v-for="docType in singleImageDocKeys" :key="`single-${docType}`" class="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-base font-semibold">{{ getDocLabel(docType) }}</div>
                  <div class="mt-1 text-xs text-white/55">仅需上传 1 张图片</div>
                </div>
                <span class="inline-flex items-center whitespace-nowrap rounded-md border border-lime-300/40 bg-lime-300/10 px-2.5 py-0.5 text-[11px] leading-none text-lime-200">必传</span>
              </div>

              <label
                v-if="!form.files[docType]"
                class="mt-3 block h-[152px] cursor-pointer rounded-2xl border border-dashed border-white/25 bg-white/[0.04] p-5"
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
                    <div class="mt-1 text-xs text-white/55">仅支持图片（JPG / PNG）</div>
                  </div>
                  <div class="rounded-full bg-lime-400 px-4 py-2 text-xs font-semibold text-black">选择图片</div>
                </div>
                <input type="file" accept="image/*" class="hidden" @change="onPickFile(docType, $event)" />
              </label>

              <div v-else class="mt-3 flex h-[152px] flex-col rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="truncate text-sm text-emerald-50">{{ form.files[docType].name }}</div>
                    <div class="mt-1 text-xs text-emerald-100/80">已上传 · {{ formatBytes(form.files[docType].size) }}</div>
                  </div>
                  <button type="button" class="text-xs text-emerald-100/80" @click="clearFile(docType)">重传</button>
                </div>
                <div class="mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  <img :src="previewUrl(form.files[docType])" alt="preview" class="h-full w-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div class="mb-3 text-sm font-semibold text-white/85">证明材料</div>
          <div class="space-y-3">
            <div v-for="docType in multiFileDocs" :key="docType" class="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-h-[42px]">
                  <div class="text-base font-semibold">{{ getDocLabel(docType) }}</div>
                  <div class="mt-1 text-xs text-white/55">支持 JPG/PNG/PDF，可上传多个文件</div>
                </div>
                <span class="inline-flex items-center whitespace-nowrap rounded-md border border-lime-300/40 bg-lime-300/10 px-2.5 py-0.5 text-[11px] leading-none text-lime-200">必传</span>
              </div>

              <label
                v-if="!(form.files[docType] || []).length"
                class="mt-3 block h-[152px] cursor-pointer rounded-2xl border border-dashed border-white/25 bg-white/[0.04] p-5"
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

              <div v-else class="mt-3 flex h-[152px] gap-2">
                <label class="w-[110px] shrink-0 cursor-pointer rounded-xl border border-dashed border-white/25 bg-white/[0.04] p-2">
                  <div class="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <div class="text-[11px] text-white/70">继续上传</div>
                    <div class="rounded-full bg-lime-400 px-3 py-1 text-[11px] font-semibold text-black">选择</div>
                  </div>
                  <input type="file" multiple accept="image/*,application/pdf" class="hidden" @change="onPickFile(docType, $event)" />
                </label>

                <div class="min-w-0 flex-1 space-y-2 overflow-y-auto pr-1 h-[152px]">
                  <div
                    v-for="(f, index) in form.files[docType]"
                    :key="`${docType}-${index}-${f.name}`"
                    class="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                  >
                    <div class="min-w-0">
                      <div class="truncate text-xs">{{ f.name }}</div>
                      <div class="text-[11px] text-white/55">{{ formatBytes(f.size) }}</div>
                    </div>
                    <button type="button" class="shrink-0 text-xs text-white/60" @click="clearFile(docType, index)">删除</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="mt-4 space-y-3">
        <div class="text-xs text-white/55">已提交材料（只读）</div>
        <div class="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div class="mb-3 text-sm font-semibold text-white/85">身份证件</div>
          <div class="space-y-3">
            <div v-for="docType in singleImageDocKeys" :key="`ro-single-${docType}`" class="rounded-2xl border border-white/10 bg-black/25 p-3">
              <div class="text-sm font-semibold text-white/90">{{ getDocLabel(docType) }}</div>
              <template v-if="form.files[docType]">
                <div class="mt-2 flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="truncate text-sm">{{ form.files[docType].name }}</div>
                    <div class="mt-1 text-xs text-white/55">{{ formatBytes(form.files[docType].size) }}</div>
                  </div>
                </div>
                <div v-if="isImageFile(form.files[docType])" class="mt-3 overflow-hidden rounded-xl border border-white/10">
                  <img :src="previewUrl(form.files[docType])" alt="preview" class="h-36 w-full object-cover" />
                </div>
              </template>
              <div v-else class="mt-2 text-xs text-white/45">未上传</div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div class="mb-3 text-sm font-semibold text-white/85">证明材料</div>
          <div class="space-y-3">
            <div v-for="docType in multiFileDocs" :key="`ro-${docType}`" class="rounded-2xl border border-white/10 bg-black/25 p-3">
              <div class="text-sm font-semibold text-white/90">{{ getDocLabel(docType) }}</div>
              <template v-if="(form.files[docType] || []).length">
                <div v-for="(f, index) in form.files[docType]" :key="`ro-${docType}-${index}-${f.name}`" class="mt-2 rounded-xl border border-white/10 bg-black/20 p-3">
                  <div class="min-w-0">
                    <div class="truncate text-sm">{{ f.name }}</div>
                    <div class="mt-1 text-xs text-white/55">{{ formatBytes(f.size) }}</div>
                  </div>
                  <div v-if="isImageFile(f)" class="mt-3 overflow-hidden rounded-xl border border-white/10">
                    <img :src="previewUrl(f)" alt="preview" class="h-40 w-full object-cover" />
                  </div>
                  <div v-else class="mt-3 text-xs text-white/55">PDF 文件</div>
                </div>
              </template>
              <div v-else class="mt-2 text-xs text-white/45">未上传</div>
            </div>
          </div>
        </div>
      </div>

      <button
        v-if="showAdvancedUpload"
        class="mt-4 w-full rounded-full bg-[#246BFD] py-3 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
        :disabled="!allAdvancedReady"
        @click="submitAdvanced"
      >
        提交高级认证资料
      </button>

      <div class="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
        <button type="button" class="flex w-full items-center justify-between text-left" @click="showPayload = !showPayload">
          <div>
            <div class="text-sm font-semibold text-white/90">联调：数据结构预览</div>
            <div class="mt-1 text-xs text-white/55">默认折叠</div>
          </div>
          <span class="text-white/60">{{ showPayload ? '收起' : '展开' }}</span>
        </button>
        <pre v-if="showPayload" class="mt-3 overflow-auto text-[11px] text-white/65">{{ JSON.stringify(payloadPreview, null, 2) }}</pre>
      </div>
    </section>

  </div>
</template>

