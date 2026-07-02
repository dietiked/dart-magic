<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Dart Magic — Context per sessioni future

App per la gestione di tornei di freccette (eliminazione diretta) usata in ufficio.
L'interfaccia è **in tedesco**. Tutto il copy, le label, i messaggi di errore: tedesco.

## Stack

- **Next.js 16** App Router (Server Components + Client Components + Server Actions + Route Handlers)
- **TypeScript**
- **Tailwind CSS v4** con `@theme inline` — usa hex diretti, non classi custom
- **shadcn/ui** — installato via CLI (`npx shadcn@latest add`), NON manualmente
- **Supabase** — PostgreSQL, RLS, magic link OTP auth (`signInWithOtp`)
- **Vercel** — deploy target (non ancora deployato, da fare)
- **Resend** — email transazionali, sender `dart@dartmagic.ch`, dominio `dartmagic.ch` (Infomaniak)

## Struttura DB (Supabase)

| Tabella | Scopo |
|---|---|
| `profiles` | Utenti registrati. Campi: `id`, `nickname`, `first_name`, `last_name`, `is_admin`, `email`, `active_until` (nullable: vuoto/futuro = attivo, passato = inattivo) |
| `tournaments` | Tornei. Campi: `id`, `name`, `rules`, `sets_to_win` (= legs target), `status` (open/closed/finished) |
| `tournament_players` | N:M tra tornei e giocatori. `draw_position` per il sorteggio |
| `matches` | Partite del tabellone. `round`, `position`, `player1_id`, `player2_id`, `winner_id`, `is_bye` |
| `sets` | Risultati di ogni leg. `set_number`, `score_p1`, `score_p2` |
| `signup_tokens` | Token UUID per link di iscrizione hash-based. `token` (UUID), `is_active` |
| `pending_signups` | Dati del form di iscrizione in attesa di conferma magic link. Eliminati dopo il callback |

**Nota DB:** il campo si chiama `sets_to_win` nel DB ma rappresenta i **legs** (non i set). Non rinominare — cambiare richiederebbe una migration.

## Terminologia dell'interfaccia (tedesco)

- **Legs** — non "Sätze"
- **Turnierbaum** — non "Tabelle"
- **Teilnehmende** — non "Teilnehmer"
- **Dart-Name** — non "Spitzname"
- **Linguaggio inclusivo** — `Spieler*in` (singolare) / `Spieler*innen` (plurale), non "Spieler"

## Pattern architetturali da rispettare

### Server vs Client Components
- Le **pagine** (`page.tsx`) sono Server Components — mai aggiungere `"use client"` alle pagine che importano `AppShell`
- I **form** e le parti interattive sono Client Components separati (es. `signup-form.tsx`, `invite-form.tsx`)
- Le **mutazioni** vanno in Server Actions (`src/app/actions/*.ts`)

### Auth
- Magic link OTP via Supabase (`signInWithOtp`)
- Il callback auth è in `src/app/auth/callback/route.ts` — lì vengono applicati i dati del `pending_signups` al profilo dopo la conferma
- Route pubbliche (no auth): `/login`, `/auth/*`, `/signup/*`
- Tutto il resto è protetto dal middleware (`src/middleware.ts`)

### Iscrizione hash-based
- L'admin genera un token UUID salvato in `signup_tokens`
- Il link è `/signup/[token]` — solo chi ha il link può iscriversi
- Il form salva i dati in `pending_signups`, poi manda magic link
- Il callback auth recupera i dati da `pending_signups` e aggiorna `profiles`

### RLS (Row Level Security)
- Tutte le tabelle hanno RLS attivo
- Esistono policy specifiche per admin (`is_admin = true`) e per self-service (es. giocatori che si iscrivono a un torneo)
- Le funzioni DB critiche usano `SECURITY DEFINER`
- La policy self-service `profiles_update` permette a un utente di aggiornare qualsiasi colonna della propria riga: il trigger `protect_admin_only_profile_fields` (`before update on profiles`) blocca a livello DB le modifiche a `is_admin` e `active_until` da parte di chi non è admin, indipendentemente dal client usato

### Bracket (Turnierbaum)
- Eliminazione diretta con gestione dei bye
- `BracketView` è un Client Component (`src/components/bracket/bracket-view.tsx`)
- Il contenitore principale ha `id="bracket-container"` per l'export PDF
- La logica del risultato è in una DB function `submit_match_result`: vince chi raggiunge `legs_to_win` legs

### Export PDF
- Client-side con `jsPDF` + `html2canvas`
- **Problema noto**: Tailwind v4 usa `oklch()`/`lab()` che html2canvas non sa parsare. Fix in `pdf-export-button.tsx`: patch temporanea di `window.getComputedStyle` che converte i colori non supportati in `rgb()` via canvas 1×1

## Verifica delle modifiche

- **Niente test visuali/browser** — non avviare preview server, non fare screenshot, non provare a loggarti nell'app (il login è magic-link via email, non simulabile). Usa solo verifiche statiche: `tsc --noEmit`, `eslint`, `next build` se utile.
- Dopo le modifiche, elenca esplicitamente cosa l'utente deve testare manualmente e attendi la sua risposta prima di considerare il lavoro concluso.

## Struttura cartelle rilevante

```
src/
  app/
    actions/          # Server Actions
    admin/            # Pagina admin (gestione giocatori, link iscrizione, inviti)
    auth/callback/    # Route handler post-magic-link
    account/          # Profilo utente + storico partite
    dashboard/        # Home dopo login
    login/            # Pagina login (magic link)
    players/          # Lista giocatori + pagina profilo singolo
    signup/[token]/   # Form di iscrizione pubblica (hash-based)
    tournaments/
      [id]/
        bracket/      # Visualizzazione e gestione Turnierbaum
      new/            # Creazione nuovo torneo
  components/
    bracket/          # BracketView, MatchCard, PdfExportButton
    layout/           # AppShell, Navbar, LogoutButton
    ui/               # shadcn/ui components (Button, Badge, Input, ecc.)
  lib/supabase/       # client.ts (browser) e server.ts (SSR)
  middleware.ts       # Protezione route
  types/database.ts   # Tipi TypeScript per il DB — GENERATO dallo schema live via Supabase MCP
                       # (generate_typescript_types), non va scritto/editato a mano: una versione
                       # a mano aveva causato query intere tipizzate `never` (join/select annidate
                       # senza `Relationships`). Rigenerare dopo ogni migration.
```

## Stato attuale (luglio 2026)

- ✅ Auth (magic link + iscrizione hash-based)
- ✅ Gestione tornei (crea, apri/chiudi/termina, iscrizioni)
- ✅ Generazione tabellone con bye
- ✅ Inserimento risultati (legs)
- ✅ Pagine giocatori + statistiche
- ✅ Profilo utente
- ✅ Admin panel (gestione ruoli, link iscrizione, inviti)
- ✅ Export PDF Turnierbaum (con workaround per oklch Tailwind v4)
- ✅ Giocatore attivo/inattivo (`active_until` in `/admin`, badge + filtro Aktiv/Inaktiv/Alle in `/players`, trigger DB anti self-escalation)
- ✅ Tabella `/players` ordinabile per colonna
- ✅ Linguaggio inclusivo (`Spieler*in`/`Spieler*innen`) in tutta l'interfaccia
- ✅ Enforcement giocatore inattivo — un giocatore inattivo (`active_until`) è filtrato dalla selezione in fase di creazione/iscrizione torneo

## Da fare

- ⬜ **Deploy su Vercel** — commit su GitHub + deploy (prossimo passo immediato)
- ⬜ **Code audit + security review** — verificare RLS policies, Server Actions, gestione errori, input validation; controllare che nessun dato sensibile sia esposto client-side
- ⬜ **Code clean-up** — ottimizzare query Supabase, migliorare gestione errori consistente (dead code e tipi TypeScript già consolidati)
- ⬜ **Charts statistiche giocatore** — aggiungere grafici sulla pagina `/players/[id]`: es. win rate nel tempo, legs vinti/persi per torneo (usare Recharts, già disponibile in shadcn/ui)
- ⬜ **Head-to-head** — nuova funzione per confrontare due giocatori: storico scontri diretti, wins/losses reciproci, legs totali
