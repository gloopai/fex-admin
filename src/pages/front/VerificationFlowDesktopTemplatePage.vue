<script setup>
import { computed, ref } from 'vue'
import { verificationConfig } from '../../mock/verification'
import { VERIFICATION_DOC_TYPE_OPTIONS, VERIFICATION_LEVEL } from '../../constants/verification'

const basicStatus = ref('unsubmitted') // unsubmitted | reviewing | approved | rejected
const advancedStatus = ref('idle') // idle | reviewing | approved | rejected

const basicForm = ref({
  country: '',
  city: '',
  name: '',
  docType: '身份证',
  docNumber: '',
  email: ''
})

const advancedRequiredDocs = verificationConfig[VERIFICATION_LEVEL.ADVANCED].requireDocuments

const advancedForm = ref({
  files: Object.fromEntries(advancedRequiredDocs.map((t) => [t, null]))
})

const statusClass = computed(() => {
  if (basicStatus.value !== 'approved') return 'bg-slate-300/10 text-slate-200'
  if (advancedStatus.value === 'reviewing') return 'bg-sky-300/10 text-sky-200'
  if (advancedStatus.value === 'approved') return 'bg-emerald-300/10 text-emerald-200'
  return 'bg-amber-300/10 text-amber-200'
})

const canEnterAdvanced = computed(() => basicStatus.value === 'approved')

const showBasicForm = computed(() => basicStatus.value === 'unsubmitted' || basicStatus.value === 'rejected')

const getDocLabel = (docType) => {
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

const backendPayloadPreview = computed(() => ({
  applyLevel: VERIFICATION_LEVEL.ADVANCED,
  currentLevel: VERIFICATION_LEVEL.BASIC,
  basicInfo: {
    realName: basicForm.value.name || '待填写',
    idNumber: basicForm.value.docNumber || '待填写',
    nationality: basicForm.value.country || '待填写',
    address: basicForm.value.city || '待填写'
  },
  documents: advancedRequiredDocs.map((type) => {
    const file = advancedForm.value.files[type]
    return {
      type,
      fileName: file?.name || null,
      fileSize: file?.size ?? null,
      mimeType: file?.type || null
    }
  }),
  extra: {
    email: basicForm.value.email || '待填写'
  }
}))

const setAdvancedFile = (docType, file) => {
  advancedForm.value.files = { ...advancedForm.value.files, [docType]: file }
}

const onPickFile = (docType, event) => {
  const file = event.target.files?.[0] || null
  if (!file) {
    const next = { ...advancedForm.value.files }
    delete next[docType]
    advancedForm.value.files = next
    return
  }
  setAdvancedFile(docType, file)
}

const clearFile = (docType) => {
  const next = { ...advancedForm.value.files }
  delete next[docType]
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
    files: Object.fromEntries(advancedRequiredDocs.map((t) => [t, null]))
  }
}
</script>

<template>
  <div class="mx-auto max-w-[1280px] px-6 py-6 text-white">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">身份认证（PC）</h1>
      <span class="rounded-md px-3 py-1 text-sm" :class="statusClass">
        当前:
        {{
          basicStatus === 'approved'
            ? advancedStatus === 'approved'
              ? '高级认证已通过'
              : '可进行高级认证'
            : '初级认证流程中'
        }}
      </span>
    </div>

    <section class="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p class="text-sm text-white/70">规则：只有初级认证审核通过后，才出现高级认证上传资料界面。</p>
      <div class="mt-3 flex flex-wrap gap-2 text-xs">
        <button class="rounded border border-white/20 px-3 py-1" @click="resetFlow">重置流程</button>
        <button
          v-if="basicStatus === 'reviewing'"
          class="rounded border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-200"
          @click="basicStatus = 'approved'"
        >
          模拟后台通过初级审核
        </button>
        <button
          v-if="basicStatus === 'reviewing'"
          class="rounded border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-rose-200"
          @click="basicStatus = 'rejected'"
        >
          模拟后台拒绝初级审核
        </button>
        <button
          v-if="advancedStatus === 'reviewing'"
          class="rounded border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-200"
          @click="advancedStatus = 'approved'"
        >
          模拟后台通过高级审核
        </button>
        <button
          v-if="advancedStatus === 'reviewing'"
          class="rounded border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-rose-200"
          @click="advancedStatus = 'rejected'"
        >
          模拟后台拒绝高级审核
        </button>
      </div>
    </section>

    <section class="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <h2 class="mb-4 text-xl font-semibold">初级认证</h2>
      <div v-if="basicStatus === 'reviewing'" class="mb-4 rounded-lg border border-amber-300/50 bg-amber-300/10 p-3 text-sm text-amber-100">
        初级认证已提交，审核中...
      </div>
      <div v-if="basicStatus === 'rejected'" class="mb-4 rounded-lg border border-rose-300/50 bg-rose-300/10 p-3 text-sm text-rose-100">
        初级认证被驳回，请修改后重新提交。
      </div>
      <div v-if="basicStatus === 'approved'" class="mb-4 rounded-lg border border-emerald-300/50 bg-emerald-300/10 p-3 text-sm text-emerald-100">
        初级认证已通过，已解锁高级认证入口。
      </div>

      <div v-if="showBasicForm" class="grid grid-cols-2 gap-4">
        <input v-model="basicForm.country" class="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm" placeholder="国家" />
        <input v-model="basicForm.city" class="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm" placeholder="所在城市" />
        <input v-model="basicForm.name" class="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm" placeholder="姓名" />
        <input v-model="basicForm.docType" class="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm" placeholder="证件类型" />
        <input v-model="basicForm.docNumber" class="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm" placeholder="证件号码" />
        <input v-model="basicForm.email" class="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm" placeholder="邮箱" />
      </div>

      <div v-else-if="basicStatus === 'reviewing'" class="grid grid-cols-2 gap-4">
        <input v-model="basicForm.country" class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45" placeholder="国家" disabled />
        <input v-model="basicForm.city" class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45" placeholder="所在城市" disabled />
        <input v-model="basicForm.name" class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45" placeholder="姓名" disabled />
        <input v-model="basicForm.docType" class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45" placeholder="证件类型" disabled />
        <input v-model="basicForm.docNumber" class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45" placeholder="证件号码" disabled />
        <input v-model="basicForm.email" class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45" placeholder="邮箱" disabled />
      </div>

      <div v-else class="rounded-xl border border-white/10 bg-black/20 p-4">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="text-white/55">国家</div>
          <div class="text-white/90">{{ basicForm.country || '-' }}</div>
          <div class="text-white/55">城市</div>
          <div class="text-white/90">{{ basicForm.city || '-' }}</div>
          <div class="text-white/55">姓名</div>
          <div class="text-white/90">{{ basicForm.name || '-' }}</div>
          <div class="text-white/55">证件类型</div>
          <div class="text-white/90">{{ basicForm.docType || '-' }}</div>
          <div class="text-white/55">证件号码</div>
          <div class="text-white/90">{{ basicForm.docNumber || '-' }}</div>
          <div class="text-white/55">邮箱</div>
          <div class="text-white/90">{{ basicForm.email || '-' }}</div>
        </div>
        <p class="mt-3 text-xs text-white/55">初级认证已完成，信息以提交内容为准。如需修改请联系客服或等待驳回后重新提交。</p>
      </div>

      <button v-if="showBasicForm" class="mt-5 w-full rounded-lg bg-lime-400 py-3 font-semibold text-black" @click="submitBasic">提交初级认证</button>
    </section>

    <section v-if="canEnterAdvanced" class="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">高级认证</h2>
        <p class="mt-1 text-sm text-white/65">
          以下上传项来自后台高级认证配置（`verificationConfig.advanced.requireDocuments`）。
        </p>
      </div>

      <div v-if="advancedStatus === 'reviewing'" class="mb-4 rounded-lg border border-sky-300/50 bg-sky-300/10 p-3 text-sm text-sky-100">
        高级认证资料已提交，后台审核中...
      </div>
      <div v-if="advancedStatus === 'approved'" class="mb-4 rounded-lg border border-emerald-300/50 bg-emerald-300/10 p-3 text-sm text-emerald-100">
        高级认证审核通过。
      </div>
      <div v-if="advancedStatus === 'rejected'" class="mb-4 rounded-lg border border-rose-300/50 bg-rose-300/10 p-3 text-sm text-rose-100">
        高级认证审核拒绝，请按提示补充材料后重新上传提交。
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div v-for="docType in advancedRequiredDocs" :key="docType" class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-white">{{ getDocLabel(docType) }}</p>
              <p class="mt-1 text-xs text-white/55">支持 JPG/PNG/PDF，建议单文件不超过 10MB</p>
            </div>
            <span class="rounded-md border border-lime-300/40 bg-lime-300/10 px-2 py-0.5 text-xs text-lime-200">必传</span>
          </div>

          <label class="mt-4 block cursor-pointer rounded-2xl border border-dashed border-white/25 bg-black/20 p-6 hover:bg-black/30">
            <div class="flex flex-col items-center justify-center gap-3 text-center">
              <div class="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                <svg viewBox="0 0 24 24" class="h-6 w-6 text-white/85" fill="none">
                  <path
                    d="M12 16V4M12 12l4-4m-4 4L8 8"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M4 13.5V18a2 2 0 002 2h12a2 2 0 002-2v-4.5"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div>
                <div class="text-sm font-semibold text-white">上传{{ getDocLabel(docType) }}</div>
                <div class="mt-1 text-xs text-white/55">点击选择文件，支持 JPG / PNG / PDF</div>
              </div>
              <div class="rounded-full bg-lime-400 px-4 py-2 text-xs font-semibold text-black">选择文件</div>
            </div>
            <input type="file" accept="image/*,application/pdf" class="hidden" @change="onPickFile(docType, $event)" />
          </label>

          <div v-if="advancedForm.files[docType]" class="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="truncate text-sm text-white/90">{{ advancedForm.files[docType].name }}</div>
                <div class="mt-1 text-xs text-white/55">{{ formatBytes(advancedForm.files[docType].size) }}</div>
              </div>
              <button type="button" class="text-xs text-white/60 hover:text-white" @click="clearFile(docType)">移除</button>
            </div>

            <div v-if="isImageFile(advancedForm.files[docType])" class="mt-3 overflow-hidden rounded-lg border border-white/10">
              <img :src="previewUrl(advancedForm.files[docType])" alt="preview" class="h-40 w-full object-cover" />
            </div>
            <div v-else class="mt-3 text-xs text-white/55">PDF 文件已选择（真实系统可在线预览）</div>
          </div>
        </div>
      </div>

      <button class="mt-6 w-full rounded-lg bg-[#246BFD] py-3 font-semibold text-white" @click="submitAdvanced">提交高级认证资料</button>

      <div class="mt-5 rounded-lg border border-white/10 bg-black/20 p-4">
        <p class="mb-2 text-sm text-white/80">提交给后台的数据结构预览（联调时通常用 FormData 上传文件 + JSON 元数据）</p>
        <pre class="overflow-auto text-xs text-white/70">{{ JSON.stringify(backendPayloadPreview, null, 2) }}</pre>
      </div>
    </section>
  </div>
</template>
