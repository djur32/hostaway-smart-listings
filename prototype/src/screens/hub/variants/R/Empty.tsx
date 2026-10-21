/* Knowledge Hub iteration R · the no-knowledge-base state (refs kh-next/01–02, REAL·PRODUCT, "keep it as is").
 * Four seeds start at kb:'none' (Charlottenburg, Moabit, Treptow, Potsdam); clicking Generate runs the six real steps
 * with a growing list (most recent on top, exactly as the product shows it) before landing on the normal Overview.
 * R drives the timing itself (R-BRIEF.md): ~0.8–1.2s a step, then `setKb('ready')`. */
import { useEffect, useState } from 'react'
import { Button } from '../../../../ds'
import { RGenerateIcon, RProgressBar, RStepList } from '../../../../ds/kh-r'
import { KB_GENERATION_STEPS } from '../../../../data/property-seeds'
import { useStore } from '../../../../store/store'
import { useKbState } from '../../../../store/selectors'

const STEP_MS = 950

export function KbEmpty({ propertyName }: { propertyName: string }) {
  const kb = useKbState()
  const setKb = useStore((s) => s.setKb)
  const generating = kb === 'generating'
  const [step, setStep] = useState(0)

  // reset to the first step whenever a fresh run starts (including a reload mid-run: simplest, re-runs the animation once)
  useEffect(() => { if (generating) setStep(0) }, [generating])
  useEffect(() => {
    if (!generating) return
    if (step >= KB_GENERATION_STEPS.length - 1) { const t = setTimeout(() => setKb('ready'), STEP_MS); return () => clearTimeout(t) }
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS)
    return () => clearTimeout(t)
  }, [generating, step, setKb])

  const pct = generating ? ((step + 1) / KB_GENERATION_STEPS.length) * 100 : 0
  return (
    <div className="h-khr__body">
      <div className="h-khr__stack">
        <p className="h-khr__lead" style={{ margin: 0 }}>
          Information in the Knowledge Hub makes your AI smarter. You can enhance it further by importing a guidebook
          with additional information, such as: rules and policies, operating instructions, local area and restaurant
          recommendations, and safety and emergency notes.
        </p>
        <div className="h-khr-empty">
          <RGenerateIcon />
          <h2 className="h-khr-empty__title">Knowledge Hub for {propertyName}</h2>
          <p className="h-khr-empty__lead">Generate your Knowledge Hub to get the most out of AI.</p>
          <p className="h-khr-empty__body">
            By compiling all your property’s details, as well as all past conversations with guests, the AI will be able
            to respond to guests more effectively. You may further enhance the Knowledge Hub by updating generated
            topics, and importing additional information from a guidebook.
          </p>
          {generating ? (
            <>
              <RProgressBar pct={pct} />
              <RStepList steps={KB_GENERATION_STEPS} at={step} />
            </>
          ) : (
            <Button kind="primary" onClick={() => setKb('generating')}>Generate</Button>
          )}
        </div>
      </div>
    </div>
  )
}
