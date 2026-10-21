/* Entry (S12 follow-up, D-161): `?as=<account>` swaps the saved state BEFORE any store loads, then reloads; otherwise
 * the app boots as before (main.tsx). */
import { applyAsParam } from './app/account'

if (!applyAsParam()) void import('./main')
