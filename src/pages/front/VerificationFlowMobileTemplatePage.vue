<script setup>
import { computed, ref } from 'vue'
import { verificationConfig } from '../../mock/verification'
import { VERIFICATION_DOC_TYPE_OPTIONS, VERIFICATION_LEVEL } from '../../constants/verification'

const basicStatus = ref('unsubmitted')
const advancedStatus = ref('idle')

const form = ref({
  country: '',
  city: '',
  name: '',
  idNumber: '',
  email: '',
  files: Object.fromEntries(verificationConfig[VERIFICATION_LEVEL.ADVANCED].requireDocuments.map((t) => [t, null]))
})

const requiredDocs = verificationConfig[VERIFICATION_LEVEL.ADVANCED].requireDocuments
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

const payloadPreview = computed(() => ({
  applyLevel: VERIFICATION_LEVEL.ADVANCED,
  currentLevel: VERIFICATION_LEVEL.BASIC,
  basicInfo: {
    realName: form.value.name || '待填写',
    idNumber: form.value.idNumber || '待填写',
    nationality: form.value.country || '待填写',
    address: form.value.city || '待填写'
  },
  documents: requiredDocs.map((type) => {
    const file = form.value.files[type]
    return {
      type,
      fileName: file?.name || null,
      fileSize: file?.size ?? null,
      mimeType: file?.type || null
    }
  }),
  extra: { email: form.value.email || '待填写' }
}))

const onPickFile = (docType, event) => {
  const file = event.target.files?.[0] || null
  if (!file) {
    const next = { ...form.value.files }
    delete next[docType]
    form.value.files = next
    return
  }
  form.value.files = { ...form.value.files, [docType]: file }
}

const clearFile = (docType) => {
  const next = { ...form.value.files }
  delete next[docType]
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
  form.value.files = Object.fromEntries(requiredDocs.map((t) => [t, null]))
}
</script>

<template>
  <div class="mx-auto min-h-screen w-full max-w-md px-4 py-4 text-white">
    <header class="mb-3 flex items-center gap-3">
      <span class="text-2xl">&lt;</span>
      <h1 class="text-2xl font-semibold">身份认证</h1>
    </header>

    <div class="mb-4 flex flex-wrap gap-1.5 text-xs">
      <button class="rounded border border-white/20 px-2 py-1" @click="resetAll">重置</button>
      <button v-if="basicStatus === 'reviewing'" class="rounded border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-emerald-200" @click="basicStatus = 'approved'">
        后台通过初级
      </button>
      <button v-if="advancedStatus === 'reviewing'" class="rounded border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-emerald-200" @click="advancedStatus = 'approved'">
        后台通过高级
      </button>
    </div>

    <section class="rounded-3xl bg-white/[0.08] p-4">
      <h2 class="mb-3 text-xl font-semibold">初级认证</h2>
      <div v-if="basicStatus === 'reviewing'" class="mb-3 rounded-xl border border-amber-300/50 bg-amber-300/10 p-3 text-sm text-amber-100">初级认证审核中...</div>
      <div v-if="basicStatus === 'approved'" class="mb-3 rounded-xl border border-emerald-300/50 bg-emerald-300/10 p-3 text-sm text-emerald-100">初级认证已通过，可进入高级认证上传资料。</div>

      <div v-if="showBasicForm" class="space-y-3">
        <input v-model="form.country" class="w-full rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-3 text-base" placeholder="国家" />
        <input v-model="form.city" class="w-full rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-3 text-base" placeholder="所在城市" />
        <input v-model="form.name" class="w-full rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-3 text-base" placeholder="姓名" />
        <input v-model="form.idNumber" class="w-full rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-3 text-base" placeholder="证件号码" />
        <input v-model="form.email" class="w-full rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-3 text-base" placeholder="邮箱" />
      </div>

      <div v-else-if="basicStatus === 'reviewing'" class="space-y-3">
        <input v-model="form.country" class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white/45" placeholder="国家" disabled />
        <input v-model="form.city" class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white/45" placeholder="所在城市" disabled />
        <input v-model="form.name" class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white/45" placeholder="姓名" disabled />
        <input v-model="form.idNumber" class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white/45" placeholder="证件号码" disabled />
        <input v-model="form.email" class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white/45" placeholder="邮箱" disabled />
      </div>

      <div v-else class="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
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
        <p class="mt-2 text-xs text-white/55">初级认证已完成，信息以提交内容为准。</p>
      </div>

      <button v-if="showBasicForm" class="mt-5 w-full rounded-full bg-lime-400 py-3 text-lg font-semibold text-black" @click="submitBasic">提交初级认证</button>
    </section>

    <section v-if="canEnterAdvanced" class="mt-4 rounded-3xl bg-white/[0.08] p-4">
      <h2 class="text-lg font-semibold">高级认证</h2>
      <p class="mt-1 text-xs text-white/65">以下为需要上传的资料（来自后台配置）。</p>

      <div v-if="advancedStatus === 'reviewing'" class="mt-3 rounded-xl border border-sky-300/50 bg-sky-300/10 p-3 text-sm text-sky-100">高级认证资料已提交，审核中...</div>
      <div v-if="advancedStatus === 'approved'" class="mt-3 rounded-xl border border-emerald-300/50 bg-emerald-300/10 p-3 text-sm text-emerald-100">高级认证审核通过</div>

      <div class="mt-4 space-y-3">
        <div v-for="docType in requiredDocs" :key="docType" class="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-base font-semibold">{{ getDocLabel(docType) }}</div>
              <div class="mt-1 text-xs text-white/55">支持 JPG/PNG/PDF</div>
            </div>
            <span class="rounded-md border border-lime-300/40 bg-lime-300/10 px-2 py-0.5 text-[11px] text-lime-200">必传</span>
          </div>

          <label class="mt-3 block cursor-pointer rounded-2xl border border-dashed border-white/25 bg-white/[0.04] p-5">
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

          <div v-if="form.files[docType]" class="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="truncate text-sm">{{ form.files[docType].name }}</div>
                <div class="mt-1 text-xs text-white/55">{{ formatBytes(form.files[docType].size) }}</div>
              </div>
              <button type="button" class="text-xs text-white/60" @click="clearFile(docType)">移除</button>
            </div>

            <div v-if="isImageFile(form.files[docType])" class="mt-3 overflow-hidden rounded-xl border border-white/10">
              <img :src="previewUrl(form.files[docType])" alt="preview" class="h-44 w-full object-cover" />
            </div>
            <div v-else class="mt-3 text-xs text-white/55">PDF 已选择</div>
          </div>
        </div>
      </div>

      <button class="mt-4 w-full rounded-full bg-[#246BFD] py-3 text-lg font-semibold text-white" @click="submitAdvanced">提交高级认证资料</button>

      <div class="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <p class="mb-2 text-xs text-white/70">提交给后台的数据预览</p>
        <pre class="overflow-auto text-[11px] text-white/65">{{ JSON.stringify(payloadPreview, null, 2) }}</pre>
      </div>
    </section>
  </div>
</template>
