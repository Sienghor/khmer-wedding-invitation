# Heritage Reference Registry

> Generated from `src/heritage/registry.ts` by `npm run registry`. Do not edit by hand.
> Every ornament rendered by the invitation carries a `data-motif` attribute naming one or more of these IDs.
> `npm run check:heritage` fails the build if an ornament references an unregistered ID.
> The live, rendered version of this registry is at `/?heritage`.

## Summary

| ID | Motif | Source | Period / style | Status |
|---|---|---|---|---|
| KH-LIN-01 | Banteay Srei-style lintel: symmetrical naga-bodied branches with descending vegetal loops | Lintel from Sralao Temple (central sanctuary), Siem Reap | 3rd quarter of the 10th century. Banteay Srei style (967–1000) | verified |
| KH-LOT-01 | Upward lotus-petal moulding band | Mouldings of Khmer temples; Sralao lintel (NMC), lotus row at base of frieze | Angkorian (the source describes this as a convention, not a single period) | verified |
| KH-LOT-02 | Lotus rosette (frontal lotus) | Angkor Wat | Angkor Wat style (1080–1175); Angkor Wat constructed 1113–1150 CE under Suryavarman II | verified |
| KH-NAG-01 | Multi-headed naga fan (three heads) | Sralao Temple lintel (NMC); general Khmer temple sculpture | Three-headed form documented on the Banteay Srei-style Sralao lintel (3rd quarter of the 10th century) | verified |
| KH-NAG-02 | Naga balustrade (causeway) | Angkor Wat, causeway between the western gopura and the temple proper | Angkor Wat (constructed 1113–1150 CE). The source notes the causeway may be a later addition | verified |
| KH-COL-01 | Octagonal ringed colonnette | Khmer temple doorways; colonnettes noted among Banteay Srei’s noteworthy motifs | Octagonal colonnettes appear from the Kulen style (825–875); also noted for the Khleang style (968–1010) | verified |
| KH-TWR-01 | Lotus-bud tower (prasat) in quincunx | Angkor Wat | Angkor Wat style (1080–1175); constructed 1113–1150 CE | verified |
| KH-KB-01 | Ficus religiosa (Bodhi) leaf figure | Khmer ornament repertoire (kbach) | Not established by the cited sources | partially-verified |
| KH-KB-02 | Spiral snail-shell figure | Khmer ornament repertoire (kbach angkor) | Not established by the cited sources | partially-verified |
| KH-PED-01 | Banteay Srei triangular fronton (superposed pediment) with large terminal volutes | Banteay Srei: east gopura porticoes ("superb superposed triangular frontons") and the sanctuary and library frontons | Banteay Srei style (967–1000); temple consecrated 22 April 967 CE | verified |
| KH-VIN-01 | Foliated scroll (rinceau): running bands and pilaster repeats | Banteay Srei wall, pilaster and fronton decoration; Khmer pilasters flanking doorways | Banteay Srei style (967–1000) for the bands cited; the pilaster convention spans the classic period | partially-verified |
| KH-WAL-01 | Wall tapestry: squares with foliate motifs | Banteay Srei wall surfaces | Banteay Srei style (967–1000) | partially-verified |
| KH-BAY-01 | Bayon face tower | Bayon, Angkor Thom (state temple of Jayavarman VII); also the gate towers of Angkor Thom | Bayon style (1181–1243); built late 12th or early 13th century | verified |
| KH-ROM-01 | Romduol (rumduol) flower, the national flower of Cambodia | None | Not established by the cited sources | partially-verified |

---

## KH-LIN-01: Banteay Srei-style lintel: symmetrical naga-bodied branches with descending vegetal loops

| Field | Value |
|---|---|
| Khmer name | *Not recorded.* The cited sources do not give a Khmer-script name for this lintel composition. |
| English name | Banteay Srei-style lintel: symmetrical naga-bodied branches with descending vegetal loops |
| Heritage source | National Museum of Cambodia, Stone collection |
| Temple / artifact | Lintel from Sralao Temple (central sanctuary), Siem Reap. Pink sandstone, H 82 cm × L 186 cm. Inv. C.346 / C.30.32 / Ka.1819 |
| Period / style | 3rd quarter of the 10th century. Banteay Srei style (967–1000) |
| Verification | verified |
| Implementation | `src/ornaments/geometry/lintel.ts`<br>`src/ornaments/Lintel.tsx`<br>`src/three/doorwayScene.ts`<br>`src/three/SceneHost.tsx` |

**Evidence (quoted from source)**

- “This lintel is a masterpiece dated to the Banteay Srei style.”, [National Museum of Cambodia: Lintel](https://nmc.gov.kh/index.php/post-formats/stone/97-lintel)
- “composed of two symmetrical naga bodies … a Garuda carrying in his mouth a large three- headed naga head … The tendrils make up the pseudo-tympanum.”, [National Museum of Cambodia: Lintel (branch description)](https://nmc.gov.kh/index.php/post-formats/stone/97-lintel)
- “Preah Ko: Kala in center, issuing garland on either side. Distinct loops of vegetation curl down from garland. … Banteay Srei: increase in complexity and detail. Garland sometimes makes pronounced loop on either side”, [Wikipedia: Khmer architecture (lintel styles)](https://en.wikipedia.org/wiki/Khmer_architecture)
- “The lintels at Banteay Srei are beautifully carved, rivalling those of the 9th century Preah Ko style in quality.”, [Wikipedia: Banteay Srei](https://en.wikipedia.org/wiki/Banteay_Srei)

**Documented visual characteristics**

- Strict bilateral symmetry around a central motif (NMC: Visnu mounted on Garuda).
- Foliage branch formed by two symmetrical naga bodies decorated with small three-headed naga heads.
- Each branch terminates in a large three-headed naga head (carried by Garuda on the Sralao lintel).
- Tendrils hanging below the branch form a pseudo-tympanum; the lintel-style literature describes loops of vegetation curling down from the garland.
- A row of stylised lotus motifs runs along the base of the upper frieze.

**Adaptation notes**

- The central deity (Visnu on Garuda) and the Garuda figures at the branch ends are NOT reproduced. Out of respect, the invitation does not render deities as decoration, and code-drawn figures could not keep their iconography accurate. The centre holds the Angkor Wat lotus rosette (KH-LOT-02) instead.
- The upper frieze of dancing figures is omitted for the same reason.
- The "Lum ang chhouk" floral row named by the NMC is omitted. The source names it but does not describe its form, so drawing it would be guesswork.
- The naga body is drawn as an undulating double-line band with scale dots. Loops are rendered as descending tendrils ending in snail spirals (KH-KB-02).
- Proportions are parametric. The default 186:82 aspect is taken from the NMC dimensions; responsive layouts compress the height.
- 3D (opening and hero): the relief is extruded from the same 2D layout and set on a sandstone block. In the hero it turns toward the pointer or with scroll so light rakes across the carving.

---

## KH-LOT-01: Upward lotus-petal moulding band

| Field | Value |
|---|---|
| Khmer name | *Not recorded.* Wikipedia (Kbach) gives the romanisation "kbach trabak chuk (lotus petals)" without Khmer script, so no Khmer-script name is recorded here. |
| English name | Upward lotus-petal moulding band |
| Heritage source | Khmer architectural moulding (kbach angkor repertoire); Sralao lintel base row |
| Temple / artifact | Mouldings of Khmer temples; Sralao lintel (NMC), lotus row at base of frieze |
| Period / style | Angkorian (the source describes this as a convention, not a single period) |
| Verification | verified |
| Implementation | `src/ornaments/geometry/lotus.ts`<br>`src/ornaments/LotusPetalBand.tsx`<br>`src/three/doorwayScene.ts` |

**Evidence (quoted from source)**

- “moldings adorned with bands of lotus petals which are always adorned upwards”, [Wikipedia: Kbach](https://en.wikipedia.org/wiki/Kbach)
- “kbach trabak chuk (lotus petals)”, [Wikipedia: Kbach (kbach angkor elements)](https://en.wikipedia.org/wiki/Kbach)
- “a row of stylized lotus motifs”, [National Museum of Cambodia: Lintel](https://nmc.gov.kh/index.php/post-formats/stone/97-lintel)

**Documented visual characteristics**

- Continuous horizontal band of lotus petals.
- Petals always point upward.
- Used on mouldings and as a base row beneath figurative friezes.

**Adaptation notes**

- Petals are drawn as pointed ogival forms with an inner outline and midrib so they read as carved relief at small sizes.
- A second, offset row of petal tips behind the front row adds depth. This is a rendering choice, not a claim about a specific moulding.
- Petal orientation is fixed upward in code. The component exposes no "flip" option, so the documented convention cannot be broken.

---

## KH-LOT-02: Lotus rosette (frontal lotus)

| Field | Value |
|---|---|
| Khmer name | *Not recorded.*  |
| English name | Lotus rosette (frontal lotus) |
| Heritage source | Angkor Wat, outer enclosure gallery ceilings; Bizot leafy-figure typology |
| Temple / artifact | Angkor Wat |
| Period / style | Angkor Wat style (1080–1175); Angkor Wat constructed 1113–1150 CE under Suryavarman II |
| Verification | verified |
| Implementation | `src/ornaments/geometry/lotus.ts`<br>`src/ornaments/LotusRosette.tsx`<br>`src/three/doorwayScene.ts` |

**Evidence (quoted from source)**

- “The ceiling between the pillars is decorated with lotus rosettes.”, [Wikipedia: Angkor Wat (Outer enclosure)](https://en.wikipedia.org/wiki/Angkor_Wat)
- “The frontal lotus petal shape.”, [Wikipedia: Kbach (leafy figure shapes)](https://en.wikipedia.org/wiki/Kbach)

**Documented visual characteristics**

- Lotus viewed frontally, with petals radiating from a centre.
- Used as a repeating ceiling ornament between pillars at Angkor Wat.

**Adaptation notes**

- Petal counts (8 outer, 8 inner offset, 16 small) and the seed-pod centre are design choices for legibility at icon sizes. The sources do not specify counts.
- Used as the centre of the lintel in place of the deity figure (see KH-LIN-01), and as the loader, countdown and section medallions.

---

## KH-NAG-01: Multi-headed naga fan (three heads)

| Field | Value |
|---|---|
| Khmer name | *Not recorded.*  |
| English name | Multi-headed naga fan (three heads) |
| Heritage source | Khmer naga iconography; Sralao lintel branch terminals |
| Temple / artifact | Sralao Temple lintel (NMC); general Khmer temple sculpture |
| Period / style | Three-headed form documented on the Banteay Srei-style Sralao lintel (3rd quarter of the 10th century) |
| Verification | verified |
| Implementation | `src/ornaments/geometry/naga.ts`<br>`src/ornaments/NagaFan.tsx`<br>`src/three/doorwayScene.ts` |

**Evidence (quoted from source)**

- “They are frequently depicted as having multiple heads, always uneven in number, arranged in a fan. Each head has a flared hood, in the manner of a cobra.”, [Wikipedia: Khmer architecture (Naga)](https://en.wikipedia.org/wiki/Khmer_architecture)
- “a large three- headed naga head”, [National Museum of Cambodia: Lintel](https://nmc.gov.kh/index.php/post-formats/stone/97-lintel)

**Documented visual characteristics**

- Multiple heads, always an odd number.
- Heads arranged in a fan.
- Each head has a flared, cobra-like hood.

**Adaptation notes**

- The geometry function throws on an even head count, so the documented odd-number rule is enforced in code.
- Default head count is three, matching the Sralao lintel. Faces are simplified to hood, eye and crest lines.
- The halo or crest that joins the heads on some sculptures is NOT drawn; it is not described in the cited sources.
- Each head is two layers: the flared hood behind and a smaller frontal head with eyes and snout ridge in front. Mouths are deliberately not drawn, to keep the figure dignified.
- 3D: hood and head are extruded as two relief layers. Eyes are omitted in 3D because dark spheres on flat gilt read as cartoon faces.

---

## KH-NAG-02: Naga balustrade (causeway)

| Field | Value |
|---|---|
| Khmer name | *Not recorded.*  |
| English name | Naga balustrade (causeway) |
| Heritage source | Angkor Wat western causeway; Khmer naga bridges |
| Temple / artifact | Angkor Wat, causeway between the western gopura and the temple proper |
| Period / style | Angkor Wat (constructed 1113–1150 CE). The source notes the causeway may be a later addition |
| Verification | verified |
| Implementation | `src/ornaments/geometry/naga.ts`<br>`src/ornaments/NagaBalustrade.tsx`<br>`src/three/templeScene.ts` |

**Evidence (quoted from source)**

- “A 350 m causeway connects the western gopura to the temple proper, with naga shaped balustrades and six sets of steps leading down to the outside on either side.”, [Wikipedia: Angkor Wat (Outer enclosure)](https://en.wikipedia.org/wiki/Angkor_Wat)
- “Nāga bridges are causeways or true bridges lined by stone balustrades shaped as nāgas.”, [Wikipedia: Khmer architecture (Naga bridges)](https://en.wikipedia.org/wiki/Khmer_architecture)

**Documented visual characteristics**

- A naga body forms the balustrade, carried along a causeway.
- The balustrade ends in a raised fan of naga heads (see KH-NAG-01).

**Adaptation notes**

- The sources do not give the Angkor Wat head count, so the terminal reuses the three-headed fan from KH-NAG-01.
- Garuda reliefs, which sometimes appear against naga fans, are not drawn.
- 3D: the body is a tube along the causeway on a low plinth, rising at the entrance into an extruded three-headed fan that faces the approaching guest.

---

## KH-COL-01: Octagonal ringed colonnette

| Field | Value |
|---|---|
| Khmer name | *Not recorded.*  |
| English name | Octagonal ringed colonnette |
| Heritage source | Khmer sanctuary doorways |
| Temple / artifact | Khmer temple doorways; colonnettes noted among Banteay Srei’s noteworthy motifs |
| Period / style | Octagonal colonnettes appear from the Kulen style (825–875); also noted for the Khleang style (968–1010) |
| Verification | verified |
| Implementation | `src/ornaments/geometry/colonnette.ts`<br>`src/ornaments/Colonnette.tsx`<br>`src/three/doorwayScene.ts` |

**Evidence (quoted from source)**

- “Depending on the period, they were round, rectangular, or octagonal in shape. Colonnettes were often circled with molded rings and decorated with carved leaves.”, [Wikipedia: Khmer architecture (Colonnette)](https://en.wikipedia.org/wiki/Khmer_architecture)
- “square and octagonal colonettes begin to appear.”, [Wikipedia: Khmer architecture (Kulen style)](https://en.wikipedia.org/wiki/Khmer_architecture)
- “Noteworthy decorative motifs include Kala … the false door, and the colonette.”, [Wikipedia: Banteay Srei](https://en.wikipedia.org/wiki/Banteay_Srei)

**Documented visual characteristics**

- Octagonal cross-section (one of the documented forms).
- Shaft circled with moulded rings.
- Decorated with carved leaves.

**Adaptation notes**

- 3D: lathe geometry with exactly 8 radial segments and flat shading, so the octagonal facets are real geometry, not a texture.
- 2D: the octagonal facets are shown by hard-stop gradient bands across the shaft.
- Leaf decoration on the rings is rendered as small upward lotus-petal collars (KH-LOT-01). The sources say "carved leaves" without naming a species.
- Ring spacing and count are parametric design choices.
- 3D: the moulded rings are lathe profile steps plus a thin octagonal gilt torus. The carved-leaf collars are drawn in the 2D elevation only.

---

## KH-TWR-01: Lotus-bud tower (prasat) in quincunx

| Field | Value |
|---|---|
| Khmer name | *Not recorded.*  |
| English name | Lotus-bud tower (prasat) in quincunx |
| Heritage source | Angkor Wat central towers |
| Temple / artifact | Angkor Wat |
| Period / style | Angkor Wat style (1080–1175); constructed 1113–1150 CE |
| Verification | verified |
| Implementation | `src/ornaments/geometry/tower.ts`<br>`src/ornaments/TowerQuincunx.tsx`<br>`src/three/templeScene.ts` |

**Evidence (quoted from source)**

- “the ogival, redented towers shaped like lotus buds”, [Wikipedia: Angkor Wat (Style)](https://en.wikipedia.org/wiki/Angkor_Wat)
- “three progressively elevated galleries rise toward a central quincunx of towers.”, [Wikipedia: Angkor Wat (lead)](https://en.wikipedia.org/wiki/Angkor_Wat)

**Documented visual characteristics**

- Ogival (pointed, bud-like) tower silhouette.
- Redented: the profile steps in and out in tiers.
- Five towers in a quincunx above progressively elevated galleries.

**Adaptation notes**

- Rendered as a flat elevation silhouette for the closing composition, not a measured drawing.
- An elevation shows the quincunx as five towers (centre tallest, two flanking pairs) on stepped terraces that stand in for the three elevated galleries.
- 3D: each tower tier is an extrusion of a redented (stepped-corner) square plan, scaled along the same ogival envelope as the 2D towers. The finial is a lotus petal profile (KH-LOT-01 geometry) spun on a lathe. Four corner towers and a raised central tower stand on three stepped terraces.
- 3D massing is a simplified evocation for an invitation, not a measured model. Galleries, porches, bas-reliefs and antefixes are not modelled.

---

## KH-KB-01: Ficus religiosa (Bodhi) leaf figure

| Field | Value |
|---|---|
| Khmer name | *Not recorded.*  |
| English name | Ficus religiosa (Bodhi) leaf figure |
| Heritage source | Kbach leafy-figure typology (François Bizot, as summarised by Wikipedia: Kbach) |
| Temple / artifact | Khmer ornament repertoire (kbach) |
| Period / style | Not established by the cited sources |
| Verification | partially-verified |
| Implementation | `src/ornaments/geometry/kbach.ts`<br>`src/ornaments/KbachLeaf.tsx`<br>`src/ornaments/OrnamentDivider.tsx` |

**Evidence (quoted from source)**

- “The Ficus religiosa leaf shape.”, [Wikipedia: Kbach (leafy figure shapes)](https://en.wikipedia.org/wiki/Kbach)
- “Kbach (Khmer: ក្បាច់) or Khmer ornamentation is made of traditional decorative elements of Cambodian architecture.”, [Wikipedia: Kbach (definition)](https://en.wikipedia.org/wiki/Kbach)

**Documented visual characteristics**

- Heart-shaped leaf with an elongated drip tip (the Ficus religiosa leaf form).
- One of the named leafy-figure shapes of kbach.

**Adaptation notes**

- The inner midrib and paired snail spirals (KH-KB-02) combine two documented kbach shapes into one figure.
- Used as divider terminals and frame corners.

---

## KH-KB-02: Spiral snail-shell figure

| Field | Value |
|---|---|
| Khmer name | *Not recorded.* Wikipedia (Kbach) gives the romanisation "kbach hien (snails)" without Khmer script, so no Khmer-script name is recorded here. |
| English name | Spiral snail-shell figure |
| Heritage source | Kbach angkor repertoire |
| Temple / artifact | Khmer ornament repertoire (kbach angkor) |
| Period / style | Not established by the cited sources |
| Verification | partially-verified |
| Implementation | `src/ornaments/geometry/kbach.ts`<br>`src/ornaments/geometry/lintel.ts` |

**Evidence (quoted from source)**

- “kbach hien (snails)”, [Wikipedia: Kbach (kbach angkor)](https://en.wikipedia.org/wiki/Kbach)
- “The spiral snail shell shape.”, [Wikipedia: Kbach (leafy figure shapes)](https://en.wikipedia.org/wiki/Kbach)

**Documented visual characteristics**

- A tightening spiral, as in a snail shell.
- An element of the Angkorian (kbach angkor) style.

**Adaptation notes**

- Generated as a logarithmic spiral, then smoothed with Catmull-Rom splines.
- Used to terminate the descending lintel tendrils and inside the Bodhi-leaf figure.

---

## KH-PED-01: Banteay Srei triangular fronton (superposed pediment) with large terminal volutes

| Field | Value |
|---|---|
| Khmer name | *Not recorded.* The cited sources do not give a Khmer-script term for the pediment, so none is recorded. |
| English name | Banteay Srei triangular fronton (superposed pediment) with large terminal volutes |
| Heritage source | Maurice Glaize, The Monuments of the Angkor Group (Banteay Srei; Ornamentation); Wikipedia: Banteay Srei |
| Temple / artifact | Banteay Srei: east gopura porticoes ("superb superposed triangular frontons") and the sanctuary and library frontons |
| Period / style | Banteay Srei style (967–1000); temple consecrated 22 April 967 CE |
| Verification | verified |
| Implementation | `src/ornaments/geometry/pediment.ts`<br>`src/ornaments/Pediment.tsx`<br>`src/three/doorwayScene.ts` |

**Evidence (quoted from source)**

- “has each of its double-pillared porticoes set with superb superposed triangular frontons which follow the slope of the roof, recalling architecture in timber. Their bordered frames in large terminal volutes are crowned with deeply cut motifs of a refined elegance which, like their tympanums, are purely ornamental in decoration.”, [Glaize: Banteay Srei (east gopura)](https://www.theangkorguide.com/text/part-two/outer-monuments/banteaysrei.htm)
- “the stacking of superimposed frontons and the variety of the terminal motifs of their framing curves”, [Glaize: Banteay Srei (innovations of the style)](https://www.theangkorguide.com/text/part-two/outer-monuments/banteaysrei.htm)
- “One must not forget to mention, from the 10th - 11th centuries, (Koh Ker, Banteay Srei, Prah Vihear) some remarkable triangular frontons. These recall wooden architecture, conditioned by the double slope of the tiled roofs that preceded the appearance of the vault. The two diverging lines scroll at the extremities into large volutes.”, [Glaize: Ornamentation (triangular frontons)](https://www.theangkorguide.com/text/part-one/chapter_8.htm)
- “the tympanum becoming covered in a vegetal decoration with large volutes forming a single composition … With no sterility of line, it is enveloped by the supple, undulating poly-lobed arch of the stylised naga, whose body is indented with flaming leaves”, [Glaize: Ornamentation (tympanum and frame)](https://www.theangkorguide.com/text/part-one/chapter_8.htm)
- “At Banteay Srei, pediments are relatively large in comparison to the openings below, and take a sweeping gabled shape.”, [Wikipedia: Banteay Srei (Materials and style)](https://en.wikipedia.org/wiki/Banteay_Srei)

**Documented visual characteristics**

- Triangular fronton following the double slope of a (timber) roof; a sweeping gabled shape.
- Frontons stacked one above another (superposed), the rear one rising higher.
- The two diverging frame lines scroll at their lower extremities into large volutes.
- Frames crowned with deeply cut motifs; the classic frame is indented with flaming leaves.
- Tympanum either carries a scene or, as on the east gopura, is purely ornamental: vegetal decoration with large volutes forming a single composition.
- Pediments are large relative to the opening below.

**Adaptation notes**

- The tympanum follows the documented purely ornamental option (east gopura): volutes of foliage (KH-VIN-01) around a lotus rosette (KH-LOT-02). Narrative scenes with deities are not drawn (same reasoning as KH-LIN-01).
- The frame crest uses flame-shaped leaves ("indented with flaming leaves"). That phrase describes the classic naga-arch frame; at Banteay Srei the source says only "deeply cut motifs", so the leaf crest is an interpretation.
- The apex finial is the Bodhi-leaf kbach (KH-KB-01). The sources do not specify an apex motif.
- The slope curve, volute size, stacking offset (30% of height) and two-tier default are design parameters, not measurements.
- Naga or makara heads are not drawn at the frame ends: for the Banteay Srei triangular frontons the source describes volutes.
- 3D (opening doorway): the frame is a tube swept along the same centreline, with extruded tympanum plate, leaves and volutes, set above the lintel.

---

## KH-VIN-01: Foliated scroll (rinceau): running bands and pilaster repeats

| Field | Value |
|---|---|
| Khmer name | *Not recorded.*  |
| English name | Foliated scroll (rinceau): running bands and pilaster repeats |
| Heritage source | Maurice Glaize, The Monuments of the Angkor Group (Ornamentation; Banteay Srei); Wikipedia: Banteay Srei, Khmer architecture |
| Temple / artifact | Banteay Srei wall, pilaster and fronton decoration; Khmer pilasters flanking doorways |
| Period / style | Banteay Srei style (967–1000) for the bands cited; the pilaster convention spans the classic period |
| Verification | partially-verified |
| Implementation | `src/ornaments/geometry/vine.ts`<br>`src/ornaments/VineBand.tsx`<br>`src/ornaments/Pediment.tsx` |

**Evidence (quoted from source)**

- “A whole range of coiling vegetation is then derived from the acanthus leaf, stretching in flames and rolling in volutes, forming vertical bands or a succession of foliated scrolls - so close to our Renaissance - scattered with figurines or animals.”, [Glaize: Ornamentation (coiling vegetation)](https://www.theangkorguide.com/text/part-one/chapter_8.htm)
- “Flanking each door in order to support the fronton, the pilasters formed long vertical bands, designed in all evidence for the vertical repetition of identical motifs.”, [Glaize: Ornamentation (pilasters)](https://www.theangkorguide.com/text/part-one/chapter_8.htm)
- “Besides the moulding of the profiles, the false doors, the frames of the frontons and the bands of foliated scrolls”, [Glaize: Banteay Srei](https://www.theangkorguide.com/text/part-two/outer-monuments/banteaysrei.htm)
- “Indeed, decorative carvings seem to cover almost every available surface.”, [Wikipedia: Banteay Srei (Materials and style)](https://en.wikipedia.org/wiki/Banteay_Srei)
- “These swirling elements may take shape as either vinelike vegetation or as the bodies of nāgas.”, [Wikipedia: Khmer architecture (Nāga)](https://en.wikipedia.org/wiki/Khmer_architecture)

**Documented visual characteristics**

- Coiling vegetation stretching in flames and rolling in volutes.
- Laid out either as vertical bands or as a running succession of foliated scrolls.
- Pilasters flanking doors are long vertical bands repeating one identical motif.
- At Banteay Srei these bands, with the fronton frames and false doors, carry the decoration that covers almost every surface.

**Adaptation notes**

- The acanthus-derived leaf is drawn as a generic flame leaf whose tip bends over. The sources do not give a leaf profile.
- The "figurines or animals" scattered through the scrolls are omitted (figurative; see Researched, not used).
- Volutes are logarithmic spirals smoothed with Catmull-Rom splines; the running scroll alternates volutes above and below a sine-wave stem.
- The pilaster repeat is a symmetric pair of volutes on a central stem; the bilateral symmetry is a design choice consistent with Khmer ornament, not a measured motif.

---

## KH-WAL-01: Wall tapestry: squares with foliate motifs

| Field | Value |
|---|---|
| Khmer name | *Not recorded.*  |
| English name | Wall tapestry: squares with foliate motifs |
| Heritage source | Maurice Glaize, The Monuments of the Angkor Group (Banteay Srei; Ornamentation) |
| Temple / artifact | Banteay Srei wall surfaces |
| Period / style | Banteay Srei style (967–1000) |
| Verification | partially-verified |
| Implementation | `src/ornaments/WallTapestry.tsx` |

**Evidence (quoted from source)**

- “the wall tapestry with squares and motifs with foliated scrolls”, [Glaize: Banteay Srei (innovations of the style)](https://www.theangkorguide.com/text/part-two/outer-monuments/banteaysrei.htm)
- “When a panel of wall is completely covered it can be either with a regular coating of geometric motifs or with pure ornamentation as at Banteay Srei.”, [Glaize: Ornamentation (wall panels)](https://www.theangkorguide.com/text/part-one/chapter_8.htm)
- “whose bare walls have disappeared under a dense overall decoration”, [Glaize: Banteay Srei (material)](https://www.theangkorguide.com/text/part-two/outer-monuments/banteaysrei.htm)

**Documented visual characteristics**

- A regular grid of squares covering a wall panel.
- Each square holds a foliate motif.

**Adaptation notes**

- Each square holds a four-petal frontal lotus (KH-LOT-02 petal geometry) with four snail-spiral volutes (KH-KB-02) toward the corners. The source does not describe the motif inside each square, so this content is an assembly of registered motifs.
- Rendered at very low contrast as a background so text stays readable; the source walls are fully carved.

---

## KH-BAY-01: Bayon face tower

| Field | Value |
|---|---|
| Khmer name | *Not recorded.*  |
| English name | Bayon face tower |
| Heritage source | Maurice Glaize, The Monuments of the Angkor Group (Bayon); Wikipedia: Bayon, Angkor Thom |
| Temple / artifact | Bayon, Angkor Thom (state temple of Jayavarman VII); also the gate towers of Angkor Thom |
| Period / style | Bayon style (1181–1243); built late 12th or early 13th century |
| Verification | verified |
| Implementation | `src/ornaments/geometry/bayon.ts`<br>`src/ornaments/BayonTower.tsx` |

**Evidence (quoted from source)**

- “simply a variation on the theme of the square "prasat", with four upper tiers and a crowning lotus, - but sculpted on each axis with human faces, varying from 1m.75 to 2m.40 in height, within the rising of the first two tiers.”, [Glaize: Bayon (tower form)](https://www.theangkorguide.com/text/part-two/angkorthom/bayon.htm)
- “with the four faces of each tower looking to the four cardinal points signifying the omnipresence of the bodhisattva Lokesvara”, [Glaize: Bayon (meaning)](https://www.theangkorguide.com/text/part-two/angkorthom/bayon.htm)
- “The temple is best known for its many towers adorned with serene, smiling stone faces carved on all sides, which are commonly interpreted as representations of King Jayavarman VII and symbolize compassion and royal authority.”, [Wikipedia: Bayon (lead)](https://en.wikipedia.org/wiki/Bayon)
- “in the face-towers at each of the entrances to the city”, [Wikipedia: Angkor Thom (Style)](https://en.wikipedia.org/wiki/Angkor_Thom)

**Documented visual characteristics**

- Square prasat with four upper tiers and a crowning lotus.
- A face on each axis, carved within the first two tiers.
- Serene, smiling expression; four faces look to the four cardinal points.

**Adaptation notes**

- Drawn once, in elevation, as low relief in line: brow, lowered eyelids, nose, lips with upturned corners, long ear lobes. Only the front face is shown; the side faces appear as the tower edges.
- The face is deliberately reduced to a few incised lines to keep it dignified and avoid caricature. It is not a portrait of any specific face.
- Upper tiers are crowned with upward lotus petals (KH-LOT-01) and the crowning lotus is a lotus bud; the tier proportions are design choices.
- Used as the closing blessing: the faces "symbolize compassion", which suits thanks to guests. Families who prefer no sacred imagery can remove it from Closing.tsx.

---

## KH-ROM-01: Romduol (rumduol) flower, the national flower of Cambodia

| Field | Value |
|---|---|
| Khmer name | រំដួល |
| English name | Romduol (rumduol) flower, the national flower of Cambodia |
| Heritage source | National symbol (botanical), not a temple carving: designated by royal decree in 2005 |
| Temple / artifact | None. A living flower (Sphaerocoryne lefevrei; the decree uses the name Mitrella mesnyi), drawn from its botanical description |
| Period / style | Not established by the cited sources |
| Verification | partially-verified |
| Implementation | `src/ornaments/geometry/romdoul.ts`<br>`src/ornaments/RomdoulFlower.tsx` |

**Evidence (quoted from source)**

- “The rumduol was declared the national flower of Cambodia in 2005.”, [Wikipedia: Sphaerocoryne lefevrei (lead; Rumduol redirects here)](https://en.wikipedia.org/wiki/Sphaerocoryne_lefevrei)
- “cream-coloured, yellow or yellow-brown flowers with three outer and three inner petals”, [Wikipedia: Sphaerocoryne lefevrei (flower)](https://en.wikipedia.org/wiki/Sphaerocoryne_lefevrei)
- “the latter of which close in over the centre of the flower”, [Wikipedia: Sphaerocoryne lefevrei (inner petals)](https://en.wikipedia.org/wiki/Sphaerocoryne_lefevrei)
- “have long been used as a metaphor for women's beauty in Khmer and Thai literature.”, [Wikipedia: Sphaerocoryne lefevrei (cultural significance)](https://en.wikipedia.org/wiki/Sphaerocoryne_lefevrei)
- “In 2005, the Kingdom of Cambodia designated seven flora and fauna as national symbols”, [Wikipedia: National symbols of Cambodia](https://en.wikipedia.org/wiki/National_symbols_of_Cambodia)

**Documented visual characteristics**

- Three outer and three inner petals.
- The inner petals close in over the centre of the flower.
- Cream-coloured, yellow or yellow-brown.
- A metaphor for women's beauty in Khmer literature; Cambodia's national flower since 2005.

**Adaptation notes**

- Unlike every other motif here, this is not copied from a carving: it is drawn from the botanical description, then gilded and incised so it sits in the same family as the temple ornament.
- Seen from the front: outer petals at 120° intervals, inner petals offset by 60° with their tips meeting at the centre as a closed dome. Petal proportions, the midribs and the gilt colouring are design choices; the source gives cream to yellow-brown.
- Used only for the couple's own moments (between their names, the save-the-date seal, the knot of the blessing thread). The lotus rosette (KH-LOT-02) is kept wherever the ornament quotes temple carving or marks the rites.
- Taxonomy is unsettled in the sources (some treat it as S. affinis); the decree's Mitrella mesnyi is reported as an illegitimate synonym. Only the common and Khmer names are shown to guests.

---

## Researched, not used

- **Devatas in niches and the figurines in foliated scrolls (Banteay Srei); apsaras (Angkor Wat, Bayon, Preah Khan Hall of Dancers)** ([source](https://en.wikipedia.org/wiki/Khmer_architecture)): Figurative sacred imagery. Code-drawn figures could not keep the costume, posture and iconography faithful, and treating them as decoration risks disrespect. Deliberately excluded.
- **Kala, makara and Sambor Prei Kuk medallion lintels** ([source](https://en.wikipedia.org/wiki/Khmer_architecture)): Documented in outline only ("inward-facing makaras with tapering bodies. Four arches joined by three medallions"). Not enough geometric detail to render without invention. Excluded.
- **Sambor Prei Kuk (UNESCO 1532, inscribed 2017)** ([source](https://en.wikipedia.org/wiki/Sambor_Prei_Kuk)): The accessible text documents "octagonal towers" but no ornament detail. The UNESCO page (whc.unesco.org/en/list/1532) returned HTTP 403 to automated access. Not used.
- **Princess Norodom Rasmi Sobbhana, "Motifs décoratifs khmèrs à l’usage de la broderie" (Buddhist Institute, undated; c.1935 per Angkor Database)** ([source](https://angkordatabase.asia/books/motifs-decoratifs-khmers-a-lusage-de-la-broderie-khmer-embroidery-patterns)): Catalogue record verified (66 kbach motifs in cross-stitch and tulle sections). The plates were not inspected, so no motif is derived from them yet. This is a good next source for embroidery-scale borders once the plates can be checked.
