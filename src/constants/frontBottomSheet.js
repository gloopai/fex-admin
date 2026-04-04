/**
 * 前台移动端底部抽屉统一视觉：与页面底 #050505、青柠强调、FrontPopup / 个人中心一致。
 */

/** 遮罩（置于 flex justify-end 容器内，配合 absolute 铺满） */
export const frontSheetBackdropClass =
  'absolute inset-0 bg-black/55 backdrop-blur-[1px]'

/** 与抽屉分 Teleport 时的全屏遮罩（自管 fixed inset-0；z-index 由页面加） */
export const frontSheetFixedBackdropBase =
  'fixed inset-0 bg-black/55 backdrop-blur-[1px]'

/** 仅遮罩颜色+模糊（配合页面自带的 fixed inset-0 z-*） */
export const frontSheetBackdropPaintOnly = 'bg-black/55 backdrop-blur-[1px]'

/** 面板：边线、表面色、顶内侧高光（不含圆角与外侧主投影） */
export const frontSheetPanelSurfaceClass =
  'border border-white/[0.1] bg-[#121212] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'

/** 底部抽屉专用：向上扩散的投影 */
export const frontSheetPanelBottomLiftShadowClass =
  'shadow-[0_-16px_52px_-18px_rgba(0,0,0,0.72)]'

/** 底部抽屉完整外壳（圆角顶 + 表面 + 上抬阴影） */
export const frontSheetPanelShellClass = [
  'rounded-t-2xl',
  frontSheetPanelSurfaceClass,
  frontSheetPanelBottomLiftShadowClass
].join(' ')

/**
 * FrontAdaptiveSelect（nativeDesktop: false）：窄屏同底部抽屉上抬阴影；
 * lg 居中时用整圆角 + 向下投影。
 */
export const frontSheetAdaptiveHybridPanelShellClass =
  'rounded-t-2xl lg:rounded-2xl border border-white/[0.1] bg-[#121212] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] max-lg:shadow-[0_-16px_52px_-18px_rgba(0,0,0,0.72)] lg:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-12px_rgba(0,0,0,0.65)]'

/** 顶部拖拽条 */
export const frontSheetDragHandleClass =
  'mx-auto h-1 w-10 shrink-0 rounded-full bg-white/[0.18]'

/** 底部次要按钮（取消等） */
export const frontSheetCancelBtnClass =
  'mx-3 mt-2 w-[calc(100%-1.5rem)] shrink-0 rounded-xl border border-white/[0.1] bg-white/[0.04] py-3 text-sm font-medium text-white/72 transition [-webkit-tap-highlight-color:transparent] hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white/88'

/** 简单列表行按钮 */
export const frontSheetListRowBtnClass =
  'flex w-full items-center justify-between px-4 py-3.5 text-left text-base text-white/90 transition [-webkit-tap-highlight-color:transparent] hover:bg-white/[0.05] active:bg-white/[0.07]'

export const frontSheetListItemBorderClass =
  'border-b border-white/[0.06] last:border-0'

export const frontSheetCheckIconClass = 'h-5 w-5 shrink-0 text-lime-400'
