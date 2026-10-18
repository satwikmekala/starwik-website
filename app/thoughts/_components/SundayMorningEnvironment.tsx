import type { ReactNode } from 'react'
import styles from './sundayEnvironment.module.css'

/** Each slot can accept an illustration or transparent cutout without changing
 * scene detection, reading layout, or light choreography. Full art can replace
 * the entire component through SceneExperience's sceneVisuals map. */
export interface SundayMorningAssets {
  architecture?: ReactNode
  rug?: ReactNode
  furniture?: ReactNode
  breakfast?: ReactNode
  light?: ReactNode
  exterior?: ReactNode
  man?: ReactNode
  interiorMan?: ReactNode
  disruption?: ReactNode
}

export function SundayMorningEnvironment({ assets = {} }: { assets?: SundayMorningAssets }) {
  return <div className={styles.environment} data-sunday-environment aria-hidden="true">
    <div className={styles.canvas}>
      <div className={styles.architecture} data-asset-slot="architecture">{assets.architecture ?? <>
        <div className={styles.wall} />
        <div className={styles.floor} />
        <div className={styles.door}><i /></div>
        <div className={styles.board}><i /><i /><i /><i /><i /></div>
        <div className={styles.interiorManSlot} data-asset-slot="interior-man">{assets.interiorMan ??
          <div className={styles.interiorMan} data-interior-man><span /><b /><i /><i /><em /></div>
        }</div>
        <div className={styles.window}>
          <div className={styles.exterior} data-asset-slot="exterior">{assets.exterior ?? <>
            <i className={styles.neighbor} />
            <div className={styles.oldBuilding}>
              {Array.from({ length: 9 }, (_, index) => <span key={index} data-old-window={index === 1 || undefined} />)}
              <b className={styles.bank} />
            </div>
            <i className={styles.neighbor} />
            <div className={styles.street} />
            <div className={styles.manSlot} data-asset-slot="man">{assets.man ?? <div className={styles.man} data-outside-man><span /><b /><i /><i /></div>}</div>
            <div className={styles.onlookers}><span /><span /></div>
          </>}</div>
          <div className={styles.glass} /><div className={styles.mullion} />
        </div>
        <div className={styles.curtain} />
      </>}</div>
      <div className={styles.rugSlot} data-asset-slot="rug">{assets.rug ?? <div className={styles.rug}><i /></div>}</div>
      <div className={styles.furniture} data-asset-slot="furniture">{assets.furniture ?? <>
        <div className={styles.sofa}><i /><i /><b /></div>
        <div className={styles.plant}><i /><i /><i /><i /><i /><b /></div>
        <div className={styles.table}><i /><i /><b /></div>
      </>}</div>
      <div className={styles.breakfast} data-asset-slot="breakfast">{assets.breakfast ?? <>
        <div className={styles.napkin} />
        <div className={styles.plate}><i /><b /></div>
        <div className={styles.bowl}><i /><i /><i /><i /><i /></div>
        <div className={styles.coffee} />
      </>}</div>
      <div className={styles.disruption} data-asset-slot="disruption">{assets.disruption ?? <>
        <div className={styles.spill} /><div className={styles.fallenMug} />
      </>}</div>
      <div className={styles.illumination} data-asset-slot="light">{assets.light ?? <><div className={styles.sunlight} /><div className={styles.windowShadow} /></>}</div>
      <div className={styles.texture} />
      <div className={styles.foreground} />
    </div>
  </div>
}
