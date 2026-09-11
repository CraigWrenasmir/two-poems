# Two poems — Craig Smith

A standalone reading edition of **Never A Different Tomorrow (on ‘Into The Dark’)** and **The Full-Sized Edition (on ‘Garden of Forking Paths’)**.

The poems scroll continuously beside changing ASCII geographies. Streets become a web and a room; a board becomes a hotel containing wheat, a raceway and an oversized coal ship. The second poem offers a return to an earlier passage with the drawing enlarged.

## Reading

- Select either poem at the top or follow the next-poem link at the end.
- **Listen to the poem** beneath each title opens its YouTube recitation in a new tab, keeping the reading page available. The links appear in both the native and standalone editions.
- Stanza numbers link directly to that passage.
- **Plain text** removes the drawings and reduces stanza spacing. It includes a print control.
- **Motion** controls drawing transitions. The initial setting honours the reader’s reduced-motion preference.
- Without JavaScript, both poems are available as pre-rendered text.
- Plain-text copies of the current poems, including the author’s revisions, are available beneath each poem.

## Source and publication

`app/poems.ts` contains the reading text; `public/poems/` contains the current authorised poem text. The initially supplied versions remain in Git history. `app/scenes.ts` defines the original ASCII accompaniments. These drawings are imagined geographies, not survey maps or reproductions of the exhibition artworks. The imagery is an accompaniment, not an alteration of the poems.

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

## Native Squarespace edition

`app/native-entry.tsx` registers `<wrenasmir-poems>`. A self-contained classic script is built to `native/reader.js`, using the same Reader, poems and ASCII scenes. It renders inside a shadow root on the host page, with normal document scrolling and no iframe. The sample surrounding page at `native-preview/` is a demonstration, not a copy of or an edit to the live Squarespace site.

The native reader has a white background to match Wrenasmir. It omits the edition masthead, numbered author bylines, motion switch and “not to scale” label. Animated transitions follow the visitor's reduced-motion preference automatically. The standalone edition retains its own presentation and controls.

Paste `public/squarespace-snippet.txt` into one Squarespace **HTML** Code Block with **Display Source off**. It includes both poems. JavaScript must be permitted by the Squarespace plan. The fallback link remains available if JavaScript cannot run. First try a duplicate of the existing page, keeping the exhibition introduction and replacing the two plain-text poem blocks and their separate headings with the component.

The native stylesheet is derived from `app/globals.css`, but its breakpoints follow the component width. Styles do not leak out into Squarespace. Native navigation does not change the host URL, and mounting does not scroll the host page. Poem downloads use absolute URLs derived from the loader script. The native plain-text toolbar only offers a return to illustrated reading. The native view uses h2 headings under the host page's title and does not introduce a second main landmark. Removing a block releases its React root and scrolling listeners; reinserting it mounts again. Loading the script twice does not register the component twice.

For a site with a fixed top header, set `style="--native-sticky-top:80px"` on the custom element, adjusting the pixel value to the header height. The inspected Wrenasmir page uses a fixed side navigation instead. Its Code Blocks use the classic layout. Fluid Engine grids or other templates may need their own block-height and overflow adjustments. No global Squarespace layout rules are injected.

Native verification checks text parity with the standalone edition, local stanza selection when surrounding content changes, style isolation, absolute download references, and executable classic-script syntax. It does **not** establish browser compatibility or successful installation on a saved Squarespace page. After pasting, check the published page as a visitor: scroll both poems, use the return-to-earlier-turn link, toggle motion/plain text, and check phone width. Squarespace may suppress scripts in the editor; use Preview in Safe Mode or the signed-out page. If entry through the site's AJAX navigation suppresses the loader, place that same script once in site footer Code Injection, leaving only the custom element in the page block.

Squarespace guidance: https://support.squarespace.com/hc/en-us/articles/206543167-Code-blocks

The 11 September 2026 browser check found and corrected a development-JSX/production-React mismatch in the native bundle. The build now resets the environment after prerendering, and the native fallback stays visible until the reader mounts. The corrected preview was exercised in the in-app browser: both poems render, scrolling updates the light ASCII scene, poem selection preserves the host URL, plain-text and motion controls work, and the enlarged return reaches stanza 20 and returns to stanza 23. The standalone edition was also checked for hydration. This does not constitute installation on a saved Squarespace page.

## Rights

Poems © Craig Smith. Publication of this repository does not grant a licence to reproduce the poems. IBM Plex Mono is distributed under the SIL Open Font License; see `public/FONT-LICENSE.txt`.
