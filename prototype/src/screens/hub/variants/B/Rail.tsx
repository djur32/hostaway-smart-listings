/* KH-B · "Test your AI": the right drawer that replaces today's Ask the AI accordion (HS-L08).
 * "Guest booked on" swaps in that channel's own values (the property's channels; no picker when it has one); suggested
 * questions are ranked by how often guests asked (Neukölln) or are the standard guest questions (any other property);
 * every sentence cites the facts it used, and the cited facts are tinted on the page. */
import { useState } from 'react'
import { Dropdown, Icon, KhbAddLink, KhbAnswer, KhbAskInput, KhbBubble, KhbCite, KhbFactsUsed, KhbQuestionChips, KhbRail, KhbSentence, KhbThinking, KhbUsedRow, cx } from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import type { KhSectionId } from '../../../../data/v3-kh'
import { useIsScenario, useListingChannels } from '../../perProperty'
import { questionText, questionsFor, type Answer } from './answers'
import { NAME, sectionLabel } from './model'

export interface UsedFact { key: string; n: number; where: string; what: string; source?: string }

export function TestAIRail({ ask, ch, answer, used, thinking, onAsk, onChannel, onClose, onCite, onFix, onAddFact }: {
  ask: string | null; ch: ListingChannel; answer: Answer | null; used: UsedFact[]; thinking: boolean
  onAsk: (q: string) => void; onChannel: (c: ListingChannel) => void; onClose: () => void
  onCite: (key: string) => void; onFix: () => void; onAddFact: (s: KhSectionId, prefill?: string) => void
}) {
  const CHS = useListingChannels()
  const scenario = useIsScenario()
  const [text, setText] = useState('')
  const [rating, setRating] = useState<Record<string, 'up' | 'down'>>({})
  const rate = ask ? rating[`${ask}|${ch}`] : undefined
  const setRate = (r: 'up' | 'down') => {
    if (!ask) return
    const n = { ...rating }
    if (rate === r) delete n[`${ask}|${ch}`]; else n[`${ask}|${ch}`] = r
    setRating(n)
  }
  const chips = questionsFor(scenario).filter((q) => q.id !== ask).sort((a, b) => (b.asked ?? 0) - (a.asked ?? 0)).slice(0, 4)
  const num = (k: string) => used.find((u) => u.key === k)?.n
  const head = (
    <>
      <p className="khb-rail__desc">Ask what a guest would ask. The answer uses only this Knowledge Hub, and shows the facts it used.</p>
      <div className="khb-rail__as">
        <span>Guest booked on</span>
        {CHS.length > 1
          ? <div className="khb-rail__dd"><Dropdown label="Guest booked on" value={NAME(ch)} options={CHS.map(NAME)} onChange={(l) => onChannel(CHS.find((c) => NAME(c) === l)!)} /></div>
          : <b className="khb-rail__one">{NAME(ch)}</b>}
      </div>
      <div className="khb-rail__often">
        <p className="khb-rail__label">{scenario ? 'Guests often ask' : 'Questions guests usually ask'}</p>
        <KhbQuestionChips items={chips} onPick={onAsk} />
      </div>
    </>
  )
  return (
    <KhbRail onClose={onClose} head={head} input={<KhbAskInput value={text} onChange={setText} onAsk={() => { onAsk(text.trim()); setText('') }} />}>
      {!ask && <p className="khb-rail__empty">Pick a question, or type one below. You’ll see the reply as the guest would get it, and the facts behind every sentence.</p>}
      {ask && <KhbBubble>{questionText(ask, scenario)}</KhbBubble>}
      {ask && thinking && <KhbThinking />}
      {ask && !thinking && answer && (answer.covered ? (
        <KhbAnswer channel={NAME(ch)} covered
          facts={used.length > 0 && (
            <KhbFactsUsed count={used.length}>
              {used.map((u) => <KhbUsedRow key={u.key} n={u.n} where={u.where} what={u.what} title={u.source} onClick={() => onCite(u.key)} />)}
            </KhbFactsUsed>
          )}
          foot={<>
            <span className="khb-answer__ask">Is this right?</span>
            <button type="button" className={cx('h-btn-icon', 'khb-thumb', rate === 'up' && 'is-on')} aria-label="Yes, this is right" aria-pressed={rate === 'up'} onClick={() => setRate('up')}><Icon name="thumb-up" /></button>
            <button type="button" className={cx('h-btn-icon', 'khb-thumb', rate === 'down' && 'is-on')} aria-label="No, something is wrong" aria-pressed={rate === 'down'} onClick={() => setRate('down')}><Icon name="thumb-down" /></button>
            {used.length > 0 && <button type="button" className="h-textlink" onClick={onFix}>Fix a fact</button>}
          </>}>
          {answer.sentences.map((s, i) => (
            <KhbSentence key={i} cites={s.cites.length ? s.cites.map((k) => { const n = num(k); return n ? <KhbCite key={k} n={n} size="sm" onClick={() => onCite(k)} label={`Show fact ${n} on the page`} /> : null }) : undefined}>{s.text}</KhbSentence>
          ))}
        </KhbAnswer>
      ) : (
        <KhbAnswer channel={NAME(ch)} covered={false}>
          <KhbSentence>I don’t have this yet. Instead of guessing, I’d pass the question to you.</KhbSentence>
          <p className="khb-answer__hint">Add it once and every reply can use it.</p>
          <KhbAddLink onClick={() => onAddFact(answer.section ?? 'custom', answer.prefill)}>{answer.section === 'amenities' ? 'Add an amenity' : `Add a fact to ${sectionLabel(answer.section ?? 'custom')}`}</KhbAddLink>
        </KhbAnswer>
      ))}
    </KhbRail>
  )
}
