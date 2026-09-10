# Two poems — Craig Smith

A standalone reading edition of **Never A Different Tomorrow (on ‘Into The Dark’)** and **The Full-Sized Edition (on ‘Garden of Forking Paths’)**.

The poems scroll continuously beside changing ASCII geographies. Streets become a web and a room; a board becomes a hotel containing wheat, a raceway and an oversized coal ship. The second poem offers a return to an earlier passage with the drawing enlarged.

## Reading

- Select either poem at the top or follow the next-poem link at the end.
- Stanza numbers link directly to that passage.
- **Plain text** removes the drawings and reduces stanza spacing. It includes a print control.
- **Motion** controls drawing transitions. The initial setting honours the reader’s reduced-motion preference.
- Without JavaScript, both poems are available as pre-rendered text.
- Original source text is available beneath each poem. Both files are byte-for-byte copies of the supplied manuscripts.

## Source and publication

`app/poems.ts` contains the reading text; `public/poems/` contains the unchanged originals. `app/scenes.ts` defines the original ASCII accompaniments. These drawings are imagined geographies, not survey maps or reproductions of the exhibition artworks. The imagery is an accompaniment, not an alteration of the poems.

`app/reader.tsx` owns reading behaviour. `app/globals.css` owns presentation. The build pre-renders the same React component that is hydrated in the browser. Relative asset URLs make the output portable between a domain root and GitHub project Pages.

```sh
npm install
npm run dev
npm run build
npm run lint
npm run verify
npx tsc --noEmit
```

Development and production both use Vite and React, with React deduplicated across component imports. The production build pre-renders the reader and produces a self-contained static edition in `dist/client/`. This avoids the generated starter’s base-path export and development React-instance limitations. No server, database, accounts or external runtime services are required. The font is served locally.

GitHub Pages serves the checked-in `docs/` directory from `main`. To update it after a successful build, copy the contents of `dist/client/` to `docs/`, retaining `.nojekyll`, and commit the source and output together.

## Validation

The release checks include TypeScript, lint of authored code, all 45 scene definitions and transition endpoints, the disappearance of the two figures in the final room, the enlarged return, pre-rendered line-by-line text preservation, original-file byte equality and static asset references. Live GitHub output is compared with the local release files after publication.

## Rights

Poems © Craig Smith. Publication of this repository does not grant a licence to reproduce the poems. IBM Plex Mono is distributed under the SIL Open Font License; see `public/FONT-LICENSE.txt`.
