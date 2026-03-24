const nowTs = () => Math.floor(Date.now() / 1000)

const pad = (n) => String(n).padStart(2, '0')

const formatTs = (ts) => {
  if (!ts) return '-'
  const d = new Date(ts * 1000)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export const errorCodeList = [
  {
    id: 1,
    error_code_id: 100001,
    error_code_name: '参数错误',
    language: 'zh-CN',
    created_at: 1740000000,
    updated_at: 1740000000,
    deleted_at: 0
  },
  {
    id: 2,
    error_code_id: 100001,
    error_code_name: 'Invalid parameters',
    language: 'en-US',
    created_at: 1740000000,
    updated_at: 1740000000,
    deleted_at: 0
  },
  {
    id: 3,
    error_code_id: 100002,
    error_code_name: '权限不足',
    language: 'zh-CN',
    created_at: 1740000100,
    updated_at: 1740000100,
    deleted_at: 0
  },
  {
    id: 4,
    error_code_id: 100002,
    error_code_name: 'Permission denied',
    language: 'en-US',
    created_at: 1740000100,
    updated_at: 1740000100,
    deleted_at: 0
  }
]

let nextId = Math.max(...errorCodeList.map((x) => x.id)) + 1

const normalizeLanguage = (lang) => (lang || '').trim()

const findByUnique = (errorCodeId, language) => {
  const id = Number(errorCodeId)
  const lang = normalizeLanguage(language)
  return errorCodeList.find((x) => Number(x.error_code_id) === id && x.language === lang) || null
}

export const getErrorCodeLanguages = () => {
  const langs = Array.from(new Set(errorCodeList.map((x) => x.language))).filter(Boolean).sort()
  return Promise.resolve(langs)
}

export const getErrorCodes = (params) => {
  const {
    page = 1,
    pageSize = 10,
    keyword = '',
    errorCodeId = '',
    language = '',
    includeDeleted = false
  } = params || {}

  let list = [...errorCodeList]

  if (!includeDeleted) {
    list = list.filter((x) => !x.deleted_at)
  }

  if (errorCodeId !== '' && errorCodeId !== null && errorCodeId !== undefined) {
    const id = Number(errorCodeId)
    if (!Number.isNaN(id)) {
      list = list.filter((x) => Number(x.error_code_id) === id)
    }
  }

  if (language && String(language).trim()) {
    const lang = normalizeLanguage(language)
    list = list.filter((x) => x.language === lang)
  }

  if (keyword && String(keyword).trim()) {
    const kw = String(keyword).trim().toLowerCase()
    list = list.filter((x) => {
      const hay = `${x.error_code_id} ${x.language} ${x.error_code_name}`.toLowerCase()
      return hay.includes(kw)
    })
  }

  list.sort((a, b) => {
    if (a.deleted_at !== b.deleted_at) return a.deleted_at ? 1 : -1
    if (a.error_code_id !== b.error_code_id) return a.error_code_id - b.error_code_id
    return String(a.language).localeCompare(String(b.language))
  })

  const total = list.length
  const start = (Number(page) - 1) * Number(pageSize)
  const end = start + Number(pageSize)
  const paged = list.slice(start, end).map((x) => ({
    ...x,
    created_at_text: formatTs(x.created_at),
    updated_at_text: formatTs(x.updated_at),
    deleted_at_text: formatTs(x.deleted_at)
  }))

  return new Promise((resolve) => {
    setTimeout(() => resolve({ list: paged, total }), 250)
  })
}

export const createErrorCode = (payload) => {
  const errorCodeId = Number(payload?.error_code_id)
  const language = normalizeLanguage(payload?.language)
  const errorCodeName = String(payload?.error_code_name || '').trim()

  if (!Number.isFinite(errorCodeId) || errorCodeId <= 0) {
    return Promise.reject(new Error('error_code_id 必须为正整数'))
  }
  if (!language) {
    return Promise.reject(new Error('language 不能为空'))
  }
  if (!errorCodeName) {
    return Promise.reject(new Error('error_code_name 不能为空'))
  }

  const existed = findByUnique(errorCodeId, language)
  if (existed) {
    if (existed.deleted_at) {
      return Promise.reject(new Error('该错误码已存在（处于已删除状态），请先恢复后再编辑'))
    }
    return Promise.reject(new Error('该错误码已存在（error_code_id + language 唯一）'))
  }

  const ts = nowTs()
  const record = {
    id: nextId++,
    error_code_id: errorCodeId,
    error_code_name: errorCodeName,
    language,
    created_at: ts,
    updated_at: ts,
    deleted_at: 0
  }
  errorCodeList.unshift(record)

  return new Promise((resolve) => {
    setTimeout(() => resolve({ record }), 250)
  })
}

export const updateErrorCode = (id, payload) => {
  const rid = Number(id)
  const idx = errorCodeList.findIndex((x) => x.id === rid)
  if (idx < 0) return Promise.reject(new Error('记录不存在'))

  const old = errorCodeList[idx]
  const errorCodeId = payload?.error_code_id !== undefined ? Number(payload?.error_code_id) : old.error_code_id
  const language = payload?.language !== undefined ? normalizeLanguage(payload?.language) : old.language
  const errorCodeName = payload?.error_code_name !== undefined ? String(payload?.error_code_name || '').trim() : old.error_code_name

  if (!Number.isFinite(errorCodeId) || errorCodeId <= 0) {
    return Promise.reject(new Error('error_code_id 必须为正整数'))
  }
  if (!language) {
    return Promise.reject(new Error('language 不能为空'))
  }
  if (!errorCodeName) {
    return Promise.reject(new Error('error_code_name 不能为空'))
  }

  const existed = findByUnique(errorCodeId, language)
  if (existed && existed.id !== old.id) {
    return Promise.reject(new Error('该错误码已存在（error_code_id + language 唯一）'))
  }

  const ts = nowTs()
  errorCodeList[idx] = {
    ...old,
    error_code_id: errorCodeId,
    language,
    error_code_name: errorCodeName,
    updated_at: ts
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve({ record: errorCodeList[idx] }), 250)
  })
}

export const deleteErrorCode = (id) => {
  const rid = Number(id)
  const idx = errorCodeList.findIndex((x) => x.id === rid)
  if (idx < 0) return Promise.reject(new Error('记录不存在'))

  const ts = nowTs()
  errorCodeList[idx] = {
    ...errorCodeList[idx],
    updated_at: ts,
    deleted_at: ts
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve({ ok: true }), 250)
  })
}

export const restoreErrorCode = (id) => {
  const rid = Number(id)
  const idx = errorCodeList.findIndex((x) => x.id === rid)
  if (idx < 0) return Promise.reject(new Error('记录不存在'))

  const record = errorCodeList[idx]
  if (!record.deleted_at) return Promise.resolve({ ok: true })

  const existed = findByUnique(record.error_code_id, record.language)
  if (existed && existed.id !== record.id && !existed.deleted_at) {
    return Promise.reject(new Error('无法恢复：已存在相同 error_code_id + language 的生效记录'))
  }

  const ts = nowTs()
  errorCodeList[idx] = {
    ...record,
    updated_at: ts,
    deleted_at: 0
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve({ ok: true }), 250)
  })
}
