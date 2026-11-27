/**
 * HERITAGE REFERENCE REGISTRY
 * ---------------------------------------------------------------------------
 * Single source of truth for the cultural provenance of every decorative
 * motif rendered by this invitation. Every ornament component declares the
 * motif ID(s) it draws, and `npm run check:heritage` fails if a component
 * references an ID that is not documented here.
 *
 * Rules applied when compiling this registry:
 *  - Only facts quoted from the cited pages are recorded as characteristics.
 *    The quotes were checked against the live pages on 2026-11-21.
 *  - Khmer names are recorded only when a cited source gives them. Where a
 *    source gives only a romanisation, that is stated rather than guessed.
 *  - Anything the code does that the source does not describe is listed
 *    under `adaptationNotes`, so a reviewer can see where interpretation begins.
 *
 * Keep this file free of TypeScript-only runtime syntax (enums, etc.):
 * scripts/build-registry-doc.ts runs it directly under Node's type stripping.
 */

export type VerificationStatus = 'verified' | 'partially-verified';

export interface HeritageReference {
  label: string;
  url: string;
  /** Verbatim excerpt from the page, used as evidence. */
  quote?: string;
}

export interface HeritageMotif {
  id: string;
  khmerName: string | null;
  khmerNameNote?: string;
  englishName: string;
  heritageSource: string;
  templeOrArtifact: string;
  period: string | null;
  references: HeritageReference[];
  /** Visual characteristics of the original, as documented by the sources. */
  characteristics: string[];
  /** Files that render this motif. */
  implementation: string[];
  /** Where and why the digital rendering departs from the original. */
  adaptationNotes: string[];
  status: VerificationStatus;
}

const NMC_SRALAO_LINTEL = 'https://nmc.gov.kh/index.php/post-formats/stone/97-lintel';
const WIKI_KHMER_ARCH = 'https://en.wikipedia.org/wiki/Khmer_architecture';
const WIKI_ANGKOR_WAT = 'https://en.wikipedia.org/wiki/Angkor_Wat';
const WIKI_KBACH = 'https://en.wikipedia.org/wiki/Kbach';
const WIKI_BANTEAY_SREI = 'https://en.wikipedia.org/wiki/Banteay_Srei';
const WIKI_BAYON = 'https://en.wikipedia.org/wiki/Bayon';
const WIKI_ANGKOR_THOM = 'https://en.wikipedia.org/wiki/Angkor_Thom';
/** Maurice Glaize, The Monuments of the Angkor Group (1944; English translation, 4th ed.), hosted by theangkorguide.com. */
const GLAIZE_BANTEAY_SREI = 'https://www.theangkorguide.com/text/part-two/outer-monuments/banteaysrei.htm';
const GLAIZE_ORNAMENT = 'https://www.theangkorguide.com/text/part-one/chapter_8.htm';
const GLAIZE_BAYON = 'https://www.theangkorguide.com/text/part-two/angkorthom/bayon.htm';
const WIKI_RUMDUOL = 'https://en.wikipedia.org/wiki/Sphaerocoryne_lefevrei';
const WIKI_NATIONAL_SYMBOLS = 'https://en.wikipedia.org/wiki/National_symbols_of_Cambodia';

export const HERITAGE_MOTIFS: HeritageMotif[] = [
  {
    id: 'KH-LIN-01',
    khmerName: null,
    khmerNameNote: 'The cited sources do not give a Khmer-script name for this lintel composition.',
    englishName: 'Banteay Srei-style lintel: symmetrical naga-bodied branches with descending vegetal loops',
    heritageSource: 'National Museum of Cambodia, Stone collection',
    templeOrArtifact:
      'Lintel from Sralao Temple (central sanctuary), Siem Reap. Pink sandstone, H 82 cm × L 186 cm. Inv. C.346 / C.30.32 / Ka.1819',
    period: '3rd quarter of the 10th century. Banteay Srei style (967–1000)',
    references: [
      {
        label: 'National Museum of Cambodia: Lintel',
        url: NMC_SRALAO_LINTEL,
        quote: 'This lintel is a masterpiece dated to the Banteay Srei style.',
      },
      {
        label: 'National Museum of Cambodia: Lintel (branch description)',
        url: NMC_SRALAO_LINTEL,
        quote:
          'composed of two symmetrical naga bodies … a Garuda carrying in his mouth a large three- headed naga head … The tendrils make up the pseudo-tympanum.',
      },
      {
        label: 'Wikipedia: Khmer architecture (lintel styles)',
        url: WIKI_KHMER_ARCH,
        quote:
          'Preah Ko: Kala in center, issuing garland on either side. Distinct loops of vegetation curl down from garland. … Banteay Srei: increase in complexity and detail. Garland sometimes makes pronounced loop on either side',
      },
      {
        label: 'Wikipedia: Banteay Srei',
        url: WIKI_BANTEAY_SREI,
        quote: 'The lintels at Banteay Srei are beautifully carved, rivalling those of the 9th century Preah Ko style in quality.',
      },
    ],
    characteristics: [
      'Strict bilateral symmetry around a central motif (NMC: Visnu mounted on Garuda).',
      'Foliage branch formed by two symmetrical naga bodies decorated with small three-headed naga heads.',
      'Each branch terminates in a large three-headed naga head (carried by Garuda on the Sralao lintel).',
      'Tendrils hanging below the branch form a pseudo-tympanum; the lintel-style literature describes loops of vegetation curling down from the garland.',
      'A row of stylised lotus motifs runs along the base of the upper frieze.',
    ],
    implementation: ['src/ornaments/geometry/lintel.ts', 'src/ornaments/Lintel.tsx', 'src/three/doorwayScene.ts', 'src/three/SceneHost.tsx'],
    adaptationNotes: [
      'The central deity (Visnu on Garuda) and the Garuda figures at the branch ends are NOT reproduced. Out of respect, the invitation does not render deities as decoration, and code-drawn figures could not keep their iconography accurate. The centre holds the Angkor Wat lotus rosette (KH-LOT-02) instead.',
      'The upper frieze of dancing figures is omitted for the same reason.',
      'The "Lum ang chhouk" floral row named by the NMC is omitted. The source names it but does not describe its form, so drawing it would be guesswork.',
      'The naga body is drawn as an undulating double-line band with scale dots. Loops are rendered as descending tendrils ending in snail spirals (KH-KB-02).',
      'Proportions are parametric. The default 186:82 aspect is taken from the NMC dimensions; responsive layouts compress the height.',
      '3D (opening and hero): the relief is extruded from the same 2D layout and set on a sandstone block. In the hero it turns toward the pointer or with scroll so light rakes across the carving.',
    ],
    status: 'verified',
  },
  {
    id: 'KH-LOT-01',
    khmerName: null,
    khmerNameNote:
      'Wikipedia (Kbach) gives the romanisation "kbach trabak chuk (lotus petals)" without Khmer script, so no Khmer-script name is recorded here.',
    englishName: 'Upward lotus-petal moulding band',
    heritageSource: 'Khmer architectural moulding (kbach angkor repertoire); Sralao lintel base row',
    templeOrArtifact: 'Mouldings of Khmer temples; Sralao lintel (NMC), lotus row at base of frieze',
    period: 'Angkorian (the source describes this as a convention, not a single period)',
    references: [
      {
        label: 'Wikipedia: Kbach',
        url: WIKI_KBACH,
        quote: 'moldings adorned with bands of lotus petals which are always adorned upwards',
      },
      {
        label: 'Wikipedia: Kbach (kbach angkor elements)',
        url: WIKI_KBACH,
        quote: 'kbach trabak chuk (lotus petals)',
      },
      {
        label: 'National Museum of Cambodia: Lintel',
        url: NMC_SRALAO_LINTEL,
        quote: 'a row of stylized lotus motifs',
      },
    ],
    characteristics: [
      'Continuous horizontal band of lotus petals.',
      'Petals always point upward.',
      'Used on mouldings and as a base row beneath figurative friezes.',
    ],
    implementation: ['src/ornaments/geometry/lotus.ts', 'src/ornaments/LotusPetalBand.tsx', 'src/three/doorwayScene.ts'],
    adaptationNotes: [
      'Petals are drawn as pointed ogival forms with an inner outline and midrib so they read as carved relief at small sizes.',
      'A second, offset row of petal tips behind the front row adds depth. This is a rendering choice, not a claim about a specific moulding.',
      'Petal orientation is fixed upward in code. The component exposes no "flip" option, so the documented convention cannot be broken.',
    ],
    status: 'verified',
  },
  {
    id: 'KH-LOT-02',
    khmerName: null,
    englishName: 'Lotus rosette (frontal lotus)',
    heritageSource: 'Angkor Wat, outer enclosure gallery ceilings; Bizot leafy-figure typology',
    templeOrArtifact: 'Angkor Wat',
    period: 'Angkor Wat style (1080–1175); Angkor Wat constructed 1113–1150 CE under Suryavarman II',
    references: [
      {
        label: 'Wikipedia: Angkor Wat (Outer enclosure)',
        url: WIKI_ANGKOR_WAT,
        quote: 'The ceiling between the pillars is decorated with lotus rosettes.',
      },
      {
        label: 'Wikipedia: Kbach (leafy figure shapes)',
        url: WIKI_KBACH,
        quote: 'The frontal lotus petal shape.',
      },
    ],
    characteristics: [
      'Lotus viewed frontally, with petals radiating from a centre.',
      'Used as a repeating ceiling ornament between pillars at Angkor Wat.',
    ],
    implementation: ['src/ornaments/geometry/lotus.ts', 'src/ornaments/LotusRosette.tsx', 'src/three/doorwayScene.ts'],
    adaptationNotes: [
      'Petal counts (8 outer, 8 inner offset, 16 small) and the seed-pod centre are design choices for legibility at icon sizes. The sources do not specify counts.',
      'Used as the centre of the lintel in place of the deity figure (see KH-LIN-01), and as the loader, countdown and section medallions.',
    ],
    status: 'verified',
  },
  {
    id: 'KH-NAG-01',
    khmerName: null,
    englishName: 'Multi-headed naga fan (three heads)',
    heritageSource: 'Khmer naga iconography; Sralao lintel branch terminals',
    templeOrArtifact: 'Sralao Temple lintel (NMC); general Khmer temple sculpture',
    period: 'Three-headed form documented on the Banteay Srei-style Sralao lintel (3rd quarter of the 10th century)',
    references: [
      {
        label: 'Wikipedia: Khmer architecture (Naga)',
        url: WIKI_KHMER_ARCH,
        quote:
          'They are frequently depicted as having multiple heads, always uneven in number, arranged in a fan. Each head has a flared hood, in the manner of a cobra.',
      },
      {
        label: 'National Museum of Cambodia: Lintel',
        url: NMC_SRALAO_LINTEL,
        quote: 'a large three- headed naga head',
      },
    ],
    characteristics: [
      'Multiple heads, always an odd number.',
      'Heads arranged in a fan.',
      'Each head has a flared, cobra-like hood.',
    ],
    implementation: ['src/ornaments/geometry/naga.ts', 'src/ornaments/NagaFan.tsx', 'src/three/doorwayScene.ts'],
    adaptationNotes: [
      'The geometry function throws on an even head count, so the documented odd-number rule is enforced in code.',
      'Default head count is three, matching the Sralao lintel. Faces are simplified to hood, eye and crest lines.',
      'The halo or crest that joins the heads on some sculptures is NOT drawn; it is not described in the cited sources.',
      'Each head is two layers: the flared hood behind and a smaller frontal head with eyes and snout ridge in front. Mouths are deliberately not drawn, to keep the figure dignified.',
      '3D: hood and head are extruded as two relief layers. Eyes are omitted in 3D because dark spheres on flat gilt read as cartoon faces.',
    ],
    status: 'verified',
  },
  {
    id: 'KH-NAG-02',
    khmerName: null,
    englishName: 'Naga balustrade (causeway)',
    heritageSource: 'Angkor Wat western causeway; Khmer naga bridges',
    templeOrArtifact: 'Angkor Wat, causeway between the western gopura and the temple proper',
    period: 'Angkor Wat (constructed 1113–1150 CE). The source notes the causeway may be a later addition',
    references: [
      {
        label: 'Wikipedia: Angkor Wat (Outer enclosure)',
        url: WIKI_ANGKOR_WAT,
        quote:
          'A 350 m causeway connects the western gopura to the temple proper, with naga shaped balustrades and six sets of steps leading down to the outside on either side.',
      },
      {
        label: 'Wikipedia: Khmer architecture (Naga bridges)',
        url: WIKI_KHMER_ARCH,
        quote: 'Nāga bridges are causeways or true bridges lined by stone balustrades shaped as nāgas.',
      },
    ],
    characteristics: [
      'A naga body forms the balustrade, carried along a causeway.',
      'The balustrade ends in a raised fan of naga heads (see KH-NAG-01).',
    ],
    implementation: ['src/ornaments/geometry/naga.ts', 'src/ornaments/NagaBalustrade.tsx', 'src/three/templeScene.ts'],
    adaptationNotes: [
      'The sources do not give the Angkor Wat head count, so the terminal reuses the three-headed fan from KH-NAG-01.',
      'Garuda reliefs, which sometimes appear against naga fans, are not drawn.',
      '3D: the body is a tube along the causeway on a low plinth, rising at the entrance into an extruded three-headed fan that faces the approaching guest.',
    ],
    status: 'verified',
  },
  {
    id: 'KH-COL-01',
    khmerName: null,
    englishName: 'Octagonal ringed colonnette',
    heritageSource: 'Khmer sanctuary doorways',
    templeOrArtifact: 'Khmer temple doorways; colonnettes noted among Banteay Srei’s noteworthy motifs',
    period: 'Octagonal colonnettes appear from the Kulen style (825–875); also noted for the Khleang style (968–1010)',
    references: [
      {
        label: 'Wikipedia: Khmer architecture (Colonnette)',
        url: WIKI_KHMER_ARCH,
        quote:
          'Depending on the period, they were round, rectangular, or octagonal in shape. Colonnettes were often circled with molded rings and decorated with carved leaves.',
      },
      {
        label: 'Wikipedia: Khmer architecture (Kulen style)',
        url: WIKI_KHMER_ARCH,
        quote: 'square and octagonal colonettes begin to appear.',
      },
      {
        label: 'Wikipedia: Banteay Srei',
        url: WIKI_BANTEAY_SREI,
        quote: 'Noteworthy decorative motifs include Kala … the false door, and the colonette.',
      },
    ],
    characteristics: [
      'Octagonal cross-section (one of the documented forms).',
      'Shaft circled with moulded rings.',
      'Decorated with carved leaves.',
    ],
    implementation: ['src/ornaments/geometry/colonnette.ts', 'src/ornaments/Colonnette.tsx', 'src/three/doorwayScene.ts'],
    adaptationNotes: [
      '3D: lathe geometry with exactly 8 radial segments and flat shading, so the octagonal facets are real geometry, not a texture.',
      '2D: the octagonal facets are shown by hard-stop gradient bands across the shaft.',
      'Leaf decoration on the rings is rendered as small upward lotus-petal collars (KH-LOT-01). The sources say "carved leaves" without naming a species.',
      'Ring spacing and count are parametric design choices.',
      '3D: the moulded rings are lathe profile steps plus a thin octagonal gilt torus. The carved-leaf collars are drawn in the 2D elevation only.',
    ],
    status: 'verified',
  },
  {
    id: 'KH-TWR-01',
    khmerName: null,
    englishName: 'Lotus-bud tower (prasat) in quincunx',
    heritageSource: 'Angkor Wat central towers',
    templeOrArtifact: 'Angkor Wat',
    period: 'Angkor Wat style (1080–1175); constructed 1113–1150 CE',
    references: [
      {
        label: 'Wikipedia: Angkor Wat (Style)',
        url: WIKI_ANGKOR_WAT,
        quote: 'the ogival, redented towers shaped like lotus buds',
      },
      {
        label: 'Wikipedia: Angkor Wat (lead)',
        url: WIKI_ANGKOR_WAT,
        quote: 'three progressively elevated galleries rise toward a central quincunx of towers.',
      },
    ],
    characteristics: [
      'Ogival (pointed, bud-like) tower silhouette.',
      'Redented: the profile steps in and out in tiers.',
      'Five towers in a quincunx above progressively elevated galleries.',
    ],
    implementation: ['src/ornaments/geometry/tower.ts', 'src/ornaments/TowerQuincunx.tsx', 'src/three/templeScene.ts'],
    adaptationNotes: [
      'Rendered as a flat elevation silhouette for the closing composition, not a measured drawing.',
      'An elevation shows the quincunx as five towers (centre tallest, two flanking pairs) on stepped terraces that stand in for the three elevated galleries.',
      '3D: each tower tier is an extrusion of a redented (stepped-corner) square plan, scaled along the same ogival envelope as the 2D towers. The finial is a lotus petal profile (KH-LOT-01 geometry) spun on a lathe. Four corner towers and a raised central tower stand on three stepped terraces.',
      '3D massing is a simplified evocation for an invitation, not a measured model. Galleries, porches, bas-reliefs and antefixes are not modelled.',
    ],
    status: 'verified',
  },
  {
    id: 'KH-KB-01',
    khmerName: null,
    englishName: 'Ficus religiosa (Bodhi) leaf figure',
    heritageSource: 'Kbach leafy-figure typology (François Bizot, as summarised by Wikipedia: Kbach)',
    templeOrArtifact: 'Khmer ornament repertoire (kbach)',
    period: null,
    references: [
      {
        label: 'Wikipedia: Kbach (leafy figure shapes)',
        url: WIKI_KBACH,
        quote: 'The Ficus religiosa leaf shape.',
      },
      {
        label: 'Wikipedia: Kbach (definition)',
        url: WIKI_KBACH,
        quote: 'Kbach (Khmer: ក្បាច់) or Khmer ornamentation is made of traditional decorative elements of Cambodian architecture.',
      },
    ],
    characteristics: [
      'Heart-shaped leaf with an elongated drip tip (the Ficus religiosa leaf form).',
      'One of the named leafy-figure shapes of kbach.',
    ],
    implementation: ['src/ornaments/geometry/kbach.ts', 'src/ornaments/KbachLeaf.tsx', 'src/ornaments/OrnamentDivider.tsx'],
    adaptationNotes: [
      'The inner midrib and paired snail spirals (KH-KB-02) combine two documented kbach shapes into one figure.',
      'Used as divider terminals and frame corners.',
    ],
    status: 'partially-verified',
  },
  {
    id: 'KH-KB-02',
    khmerName: null,
    khmerNameNote:
      'Wikipedia (Kbach) gives the romanisation "kbach hien (snails)" without Khmer script, so no Khmer-script name is recorded here.',
    englishName: 'Spiral snail-shell figure',
    heritageSource: 'Kbach angkor repertoire',
    templeOrArtifact: 'Khmer ornament repertoire (kbach angkor)',
    period: null,
    references: [
      {
        label: 'Wikipedia: Kbach (kbach angkor)',
        url: WIKI_KBACH,
        quote: 'kbach hien (snails)',
      },
      {
        label: 'Wikipedia: Kbach (leafy figure shapes)',
        url: WIKI_KBACH,
        quote: 'The spiral snail shell shape.',
      },
    ],
    characteristics: ['A tightening spiral, as in a snail shell.', 'An element of the Angkorian (kbach angkor) style.'],
    implementation: ['src/ornaments/geometry/kbach.ts', 'src/ornaments/geometry/lintel.ts'],
    adaptationNotes: [
      'Generated as a logarithmic spiral, then smoothed with Catmull-Rom splines.',
      'Used to terminate the descending lintel tendrils and inside the Bodhi-leaf figure.',
    ],
    status: 'partially-verified',
  },
  {
    id: 'KH-PED-01',
    khmerName: null,
    khmerNameNote: 'The cited sources do not give a Khmer-script term for the pediment, so none is recorded.',
    englishName: 'Banteay Srei triangular fronton (superposed pediment) with large terminal volutes',
    heritageSource: 'Maurice Glaize, The Monuments of the Angkor Group (Banteay Srei; Ornamentation); Wikipedia: Banteay Srei',
    templeOrArtifact: 'Banteay Srei: east gopura porticoes ("superb superposed triangular frontons") and the sanctuary and library frontons',
    period: 'Banteay Srei style (967–1000); temple consecrated 22 April 967 CE',
    references: [
      {
        label: 'Glaize: Banteay Srei (east gopura)',
        url: GLAIZE_BANTEAY_SREI,
        quote:
          'has each of its double-pillared porticoes set with superb superposed triangular frontons which follow the slope of the roof, recalling architecture in timber. Their bordered frames in large terminal volutes are crowned with deeply cut motifs of a refined elegance which, like their tympanums, are purely ornamental in decoration.',
      },
      {
        label: 'Glaize: Banteay Srei (innovations of the style)',
        url: GLAIZE_BANTEAY_SREI,
        quote: 'the stacking of superimposed frontons and the variety of the terminal motifs of their framing curves',
      },
      {
        label: 'Glaize: Ornamentation (triangular frontons)',
        url: GLAIZE_ORNAMENT,
        quote:
          'One must not forget to mention, from the 10th - 11th centuries, (Koh Ker, Banteay Srei, Prah Vihear) some remarkable triangular frontons. These recall wooden architecture, conditioned by the double slope of the tiled roofs that preceded the appearance of the vault. The two diverging lines scroll at the extremities into large volutes.',
      },
      {
        label: 'Glaize: Ornamentation (tympanum and frame)',
        url: GLAIZE_ORNAMENT,
        quote:
          'the tympanum becoming covered in a vegetal decoration with large volutes forming a single composition … With no sterility of line, it is enveloped by the supple, undulating poly-lobed arch of the stylised naga, whose body is indented with flaming leaves',
      },
      {
        label: 'Wikipedia: Banteay Srei (Materials and style)',
        url: WIKI_BANTEAY_SREI,
        quote: 'At Banteay Srei, pediments are relatively large in comparison to the openings below, and take a sweeping gabled shape.',
      },
    ],
    characteristics: [
      'Triangular fronton following the double slope of a (timber) roof; a sweeping gabled shape.',
      'Frontons stacked one above another (superposed), the rear one rising higher.',
      'The two diverging frame lines scroll at their lower extremities into large volutes.',
      'Frames crowned with deeply cut motifs; the classic frame is indented with flaming leaves.',
      'Tympanum either carries a scene or, as on the east gopura, is purely ornamental: vegetal decoration with large volutes forming a single composition.',
      'Pediments are large relative to the opening below.',
    ],
    implementation: ['src/ornaments/geometry/pediment.ts', 'src/ornaments/Pediment.tsx', 'src/three/doorwayScene.ts'],
    adaptationNotes: [
      'The tympanum follows the documented purely ornamental option (east gopura): volutes of foliage (KH-VIN-01) around a lotus rosette (KH-LOT-02). Narrative scenes with deities are not drawn (same reasoning as KH-LIN-01).',
      'The frame crest uses flame-shaped leaves ("indented with flaming leaves"). That phrase describes the classic naga-arch frame; at Banteay Srei the source says only "deeply cut motifs", so the leaf crest is an interpretation.',
      'The apex finial is the Bodhi-leaf kbach (KH-KB-01). The sources do not specify an apex motif.',
      'The slope curve, volute size, stacking offset (30% of height) and two-tier default are design parameters, not measurements.',
      'Naga or makara heads are not drawn at the frame ends: for the Banteay Srei triangular frontons the source describes volutes.',
      '3D (opening doorway): the frame is a tube swept along the same centreline, with extruded tympanum plate, leaves and volutes, set above the lintel.',
    ],
    status: 'verified',
  },
  {
    id: 'KH-VIN-01',
    khmerName: null,
    englishName: 'Foliated scroll (rinceau): running bands and pilaster repeats',
    heritageSource: 'Maurice Glaize, The Monuments of the Angkor Group (Ornamentation; Banteay Srei); Wikipedia: Banteay Srei, Khmer architecture',
    templeOrArtifact: 'Banteay Srei wall, pilaster and fronton decoration; Khmer pilasters flanking doorways',
    period: 'Banteay Srei style (967–1000) for the bands cited; the pilaster convention spans the classic period',
    references: [
      {
        label: 'Glaize: Ornamentation (coiling vegetation)',
        url: GLAIZE_ORNAMENT,
        quote:
          'A whole range of coiling vegetation is then derived from the acanthus leaf, stretching in flames and rolling in volutes, forming vertical bands or a succession of foliated scrolls - so close to our Renaissance - scattered with figurines or animals.',
      },
      {
        label: 'Glaize: Ornamentation (pilasters)',
        url: GLAIZE_ORNAMENT,
        quote:
          'Flanking each door in order to support the fronton, the pilasters formed long vertical bands, designed in all evidence for the vertical repetition of identical motifs.',
      },
      {
        label: 'Glaize: Banteay Srei',
        url: GLAIZE_BANTEAY_SREI,
        quote: 'Besides the moulding of the profiles, the false doors, the frames of the frontons and the bands of foliated scrolls',
      },
      {
        label: 'Wikipedia: Banteay Srei (Materials and style)',
        url: WIKI_BANTEAY_SREI,
        quote: 'Indeed, decorative carvings seem to cover almost every available surface.',
      },
      {
        label: 'Wikipedia: Khmer architecture (Nāga)',
        url: WIKI_KHMER_ARCH,
        quote: 'These swirling elements may take shape as either vinelike vegetation or as the bodies of nāgas.',
      },
    ],
    characteristics: [
      'Coiling vegetation stretching in flames and rolling in volutes.',
      'Laid out either as vertical bands or as a running succession of foliated scrolls.',
      'Pilasters flanking doors are long vertical bands repeating one identical motif.',
      'At Banteay Srei these bands, with the fronton frames and false doors, carry the decoration that covers almost every surface.',
    ],
    implementation: ['src/ornaments/geometry/vine.ts', 'src/ornaments/VineBand.tsx', 'src/ornaments/Pediment.tsx'],
    adaptationNotes: [
      'The acanthus-derived leaf is drawn as a generic flame leaf whose tip bends over. The sources do not give a leaf profile.',
      'The "figurines or animals" scattered through the scrolls are omitted (figurative; see Researched, not used).',
      'Volutes are logarithmic spirals smoothed with Catmull-Rom splines; the running scroll alternates volutes above and below a sine-wave stem.',
      'The pilaster repeat is a symmetric pair of volutes on a central stem; the bilateral symmetry is a design choice consistent with Khmer ornament, not a measured motif.',
    ],
    status: 'partially-verified',
  },
  {
    id: 'KH-WAL-01',
    khmerName: null,
    englishName: 'Wall tapestry: squares with foliate motifs',
    heritageSource: 'Maurice Glaize, The Monuments of the Angkor Group (Banteay Srei; Ornamentation)',
    templeOrArtifact: 'Banteay Srei wall surfaces',
    period: 'Banteay Srei style (967–1000)',
    references: [
      {
        label: 'Glaize: Banteay Srei (innovations of the style)',
        url: GLAIZE_BANTEAY_SREI,
        quote: 'the wall tapestry with squares and motifs with foliated scrolls',
      },
      {
        label: 'Glaize: Ornamentation (wall panels)',
        url: GLAIZE_ORNAMENT,
        quote: 'When a panel of wall is completely covered it can be either with a regular coating of geometric motifs or with pure ornamentation as at Banteay Srei.',
      },
      {
        label: 'Glaize: Banteay Srei (material)',
        url: GLAIZE_BANTEAY_SREI,
        quote: 'whose bare walls have disappeared under a dense overall decoration',
      },
    ],
    characteristics: ['A regular grid of squares covering a wall panel.', 'Each square holds a foliate motif.'],
    implementation: ['src/ornaments/WallTapestry.tsx'],
    adaptationNotes: [
      'Each square holds a four-petal frontal lotus (KH-LOT-02 petal geometry) with four snail-spiral volutes (KH-KB-02) toward the corners. The source does not describe the motif inside each square, so this content is an assembly of registered motifs.',
      'Rendered at very low contrast as a background so text stays readable; the source walls are fully carved.',
    ],
    status: 'partially-verified',
  },
  {
    id: 'KH-BAY-01',
    khmerName: null,
    englishName: 'Bayon face tower',
    heritageSource: 'Maurice Glaize, The Monuments of the Angkor Group (Bayon); Wikipedia: Bayon, Angkor Thom',
    templeOrArtifact: 'Bayon, Angkor Thom (state temple of Jayavarman VII); also the gate towers of Angkor Thom',
    period: 'Bayon style (1181–1243); built late 12th or early 13th century',
    references: [
      {
        label: 'Glaize: Bayon (tower form)',
        url: GLAIZE_BAYON,
        quote:
          'simply a variation on the theme of the square "prasat", with four upper tiers and a crowning lotus, - but sculpted on each axis with human faces, varying from 1m.75 to 2m.40 in height, within the rising of the first two tiers.',
      },
      {
        label: 'Glaize: Bayon (meaning)',
        url: GLAIZE_BAYON,
        quote: 'with the four faces of each tower looking to the four cardinal points signifying the omnipresence of the bodhisattva Lokesvara',
      },
      {
        label: 'Wikipedia: Bayon (lead)',
        url: WIKI_BAYON,
        quote:
          'The temple is best known for its many towers adorned with serene, smiling stone faces carved on all sides, which are commonly interpreted as representations of King Jayavarman VII and symbolize compassion and royal authority.',
      },
      {
        label: 'Wikipedia: Angkor Thom (Style)',
        url: WIKI_ANGKOR_THOM,
        quote: 'in the face-towers at each of the entrances to the city',
      },
    ],
    characteristics: [
      'Square prasat with four upper tiers and a crowning lotus.',
      'A face on each axis, carved within the first two tiers.',
      'Serene, smiling expression; four faces look to the four cardinal points.',
    ],
    implementation: ['src/ornaments/geometry/bayon.ts', 'src/ornaments/BayonTower.tsx'],
    adaptationNotes: [
      'Drawn once, in elevation, as low relief in line: brow, lowered eyelids, nose, lips with upturned corners, long ear lobes. Only the front face is shown; the side faces appear as the tower edges.',
      'The face is deliberately reduced to a few incised lines to keep it dignified and avoid caricature. It is not a portrait of any specific face.',
      'Upper tiers are crowned with upward lotus petals (KH-LOT-01) and the crowning lotus is a lotus bud; the tier proportions are design choices.',
      'Used as the closing blessing: the faces "symbolize compassion", which suits thanks to guests. Families who prefer no sacred imagery can remove it from Closing.tsx.',
    ],
    status: 'verified',
  },
  {
    id: 'KH-ROM-01',
    khmerName: 'រំដួល',
    khmerNameNote: 'Khmer script as given by both cited Wikipedia pages; romanised there as rumduol / Rumduŏl.',
    englishName: 'Romduol (rumduol) flower, the national flower of Cambodia',
    heritageSource: 'National symbol (botanical), not a temple carving: designated by royal decree in 2005',
    templeOrArtifact: 'None. A living flower (Sphaerocoryne lefevrei; the decree uses the name Mitrella mesnyi), drawn from its botanical description',
    period: null,
    references: [
      {
        label: 'Wikipedia: Sphaerocoryne lefevrei (lead; Rumduol redirects here)',
        url: WIKI_RUMDUOL,
        quote: 'The rumduol was declared the national flower of Cambodia in 2005.',
      },
      {
        label: 'Wikipedia: Sphaerocoryne lefevrei (flower)',
        url: WIKI_RUMDUOL,
        quote: 'cream-coloured, yellow or yellow-brown flowers with three outer and three inner petals',
      },
      {
        label: 'Wikipedia: Sphaerocoryne lefevrei (inner petals)',
        url: WIKI_RUMDUOL,
        quote: 'the latter of which close in over the centre of the flower',
      },
      {
        label: 'Wikipedia: Sphaerocoryne lefevrei (cultural significance)',
        url: WIKI_RUMDUOL,
        quote: "have long been used as a metaphor for women's beauty in Khmer and Thai literature.",
      },
      {
        label: 'Wikipedia: National symbols of Cambodia',
        url: WIKI_NATIONAL_SYMBOLS,
        quote: 'In 2005, the Kingdom of Cambodia designated seven flora and fauna as national symbols',
      },
    ],
    characteristics: [
      'Three outer and three inner petals.',
      'The inner petals close in over the centre of the flower.',
      'Cream-coloured, yellow or yellow-brown.',
      "A metaphor for women's beauty in Khmer literature; Cambodia's national flower since 2005.",
    ],
    implementation: ['src/ornaments/geometry/romdoul.ts', 'src/ornaments/RomdoulFlower.tsx'],
    adaptationNotes: [
      'Unlike every other motif here, this is not copied from a carving: it is drawn from the botanical description, then gilded and incised so it sits in the same family as the temple ornament.',
      'Seen from the front: outer petals at 120° intervals, inner petals offset by 60° with their tips meeting at the centre as a closed dome. Petal proportions, the midribs and the gilt colouring are design choices; the source gives cream to yellow-brown.',
      'Used only for the couple\'s own moments (between their names, the save-the-date seal, the knot of the blessing thread). The lotus rosette (KH-LOT-02) is kept wherever the ornament quotes temple carving or marks the rites.',
      'Taxonomy is unsettled in the sources (some treat it as S. affinis); the decree\'s Mitrella mesnyi is reported as an illegitimate synonym. Only the common and Khmer names are shown to guests.',
    ],
    status: 'partially-verified',
  },
];

/**
 * Sources researched for this project but not used for any motif, with the reason.
 * Kept so reviewers can see what was considered and why it was excluded.
 */
export const RESEARCHED_NOT_USED: { source: string; url: string; reason: string }[] = [
  {
    source: 'Devatas in niches and the figurines in foliated scrolls (Banteay Srei); apsaras (Angkor Wat, Bayon, Preah Khan Hall of Dancers)',
    url: WIKI_KHMER_ARCH,
    reason:
      'Figurative sacred imagery. Code-drawn figures could not keep the costume, posture and iconography faithful, and treating them as decoration risks disrespect. Deliberately excluded.',
  },
  {
    source: 'Kala, makara and Sambor Prei Kuk medallion lintels',
    url: WIKI_KHMER_ARCH,
    reason:
      'Documented in outline only ("inward-facing makaras with tapering bodies. Four arches joined by three medallions"). Not enough geometric detail to render without invention. Excluded.',
  },
  {
    source: 'Sambor Prei Kuk (UNESCO 1532, inscribed 2017)',
    url: 'https://en.wikipedia.org/wiki/Sambor_Prei_Kuk',
    reason:
      'The accessible text documents "octagonal towers" but no ornament detail. The UNESCO page (whc.unesco.org/en/list/1532) returned HTTP 403 to automated access. Not used.',
  },
  {
    source: 'Princess Norodom Rasmi Sobbhana, "Motifs décoratifs khmèrs à l’usage de la broderie" (Buddhist Institute, undated; c.1935 per Angkor Database)',
    url: 'https://angkordatabase.asia/books/motifs-decoratifs-khmers-a-lusage-de-la-broderie-khmer-embroidery-patterns',
    reason:
      'Catalogue record verified (66 kbach motifs in cross-stitch and tulle sections). The plates were not inspected, so no motif is derived from them yet. This is a good next source for embroidery-scale borders once the plates can be checked.',
  },
];

export const MOTIF_IDS = HERITAGE_MOTIFS.map((m) => m.id);
export type MotifId = (typeof HERITAGE_MOTIFS)[number]['id'];

export function getMotif(id: string): HeritageMotif | undefined {
  return HERITAGE_MOTIFS.find((m) => m.id === id);
}
