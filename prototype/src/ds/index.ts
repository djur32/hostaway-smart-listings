/* prototype/src/ds, React ports of the Hostaway DS replica (../../ds). Shared by every screen owner.
 * Change a component here only with a note in plan/SESSION-LOG.md (ownership map, prototype/README.md). */
export * from './primitives'
export * from './record'
export * from './ai'
export * from './shell'
export * from './backlink' // BackLink: the one "‹" for page-head leads; pops history when the previous entry is the target (H-09)
export * from './mobile' // ≤ 767px (ds/mobile.md): useIsMobile, MobileTabBar, MobileDrawer, MobilePageHead, ScrollTabs, MobileActionBar, useMobileActions, BottomSheet, TopToast
export * from './studio' // S11: Cite, ReorderList, Band, AutonomyControl (ds/components.css §10d, D-148)
export * from './s12' // S12: Guide, Term, InheritChip, ReturnChip, Strength, Early, LineChart, AvailCell, Confidence (§10e, D-150…D-159)
export * from './sl3' // Smart Listing v3 (V3-SPEC §2): ChannelNav, PageHead, SettingRow, TipsPanel, TipCard, WizardStep, OptionTile…
export * from './v3-ch'
export * from './smartify' // Smartify (yellow AI-refine, user-initiated): SmartifyTrigger, distinct from Tips (purple, ./sl3)
export * from './v3-cv'
export * from './v3-sl'
export * from './charts' // WS-SL: StackedColumns, BandChart, GroupedColumns, BarMultiple, ChartLegend, ChartTable (ds/v3/sl.css › charts)
export * from './v3-kh'
export * from './photos' // Photos (Hostaway replica): PhotosRow, PhotoTile, CoverPill, PhotosFilter, Banner, CheckCard, SheetModal
export * from './sortable' // Drag to reorder (Hostaway replica, 3 Oct): useSortable, DragGhost, arrayMove (.h-drag-grip, .h-drop-placeholder)
export * from './fieldscope' // ChannelBadge, ValueHover, Dropdown
export * from './overview' // Property › Overview real replica: Chip, Tip, OvSection, StatusSelect, ListingRow, Opportunities (WS-SL)
export * from './kh-a'
export * from './kh-b'
export * from './kh-c'
export * from './kh-d'
export * from './kh-e'
export * from './avail' // Channels › Availability: Weekdays (HS-38 weekday picker)
export * from './details' // Listing details (source of truth): SourceOfTruthBadge, SourceOfTruthBanner, DetailsDrawer, DetailsDialog, ChipGroup, FiltersButton, AmenityLine, AmenityPick, StepProgress, RadioCards, NumberStepper, CheckList
export * from './kh-r'
export * from './kh-q' // Knowledge Hub, reframed (KH-REFRAME, 4 Oct): KqQuestionRow, KqCounts, KqFactRef, KqConversation, KqHold, KqReceipt, KqInsight, KqWhere (ds/v3/kh-q.css)
export * from './panels' // PanelStack, PanelLink: drill-downs that slide in, the origin compressed to a spine (D-927, M-19)
export * from './toast' // Toast: the one toast, bottom-centre of the content column, fades after 5 s (3 Oct)
export * from './unsaved' // UnsavedBar, useUnsavedChanges: the shared "nothing shows until dirty" save bar + nav guard (M-20)
export * from './wizard' // Full-screen wizard (Hostaway Add-property replica, 3 Oct): Wizard, WizardQuestion, WizardFoot, WizardChoices, WizardChoice, WizardIntro, WizardVoiceField, WizardLocked, WizardConfig, WizardConfigItem, WizardSummary, WizardSummaryGrid, WizardGenerating
export * from './strategy' // Smart Listings › Strategy rows + channel detail: StrategyRows, StrategyRow, DefList, EmptyStrategy
export * from './perf' // Smart Listings › Performance: PerfToolbar, PerfField, PerfKpis, PerfKpi, PerfSwatch, PerfCard, PerfSettings, PerfChart (ds/v3/perf.css)
export { TooltipLayer } from './tooltipLayer' // every .h-tooltip-anchor tooltip, floated above its anchor (3 Oct)
export * from './account' // S12 follow-up: AccountAvatar, AccountMenu (§10f, D-160)
