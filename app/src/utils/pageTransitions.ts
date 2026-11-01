import type { Animation } from '@ionic/vue';
import { createAnimation } from '@ionic/vue';

const getIonPage = (el: HTMLElement): HTMLElement => {
  if (el.classList.contains('ion-page')) {
    return el;
  }
  return (el.querySelector(':scope > .ion-page, .ion-page') as HTMLElement) || el;
};

/**
 * Transició de lliscament des de l'esquerra:
 * - En entrar ('forward'): La pàgina entrant llisca d'esquerra (-100%) al centre (0%),
 *   mentre que la pàgina sortint s'empeny cap a la dreta (0% -> 100%).
 * - En sortir ('back'): La pàgina sortint torna a lliscar cap a l'esquerra (0% -> -100%),
 *   mentre que la pàgina recuperada entra des de la dreta (100% -> 0%).
 */
export const slideFromLeftTransition = (
  _baseEl: HTMLElement,
  opts?: {
    direction?: 'forward' | 'back';
    duration?: number;
    enteringEl?: HTMLElement;
    leavingEl?: HTMLElement;
  },
): Animation => {
  const isBack = opts?.direction === 'back';
  const root = createAnimation();
  const duration = (opts?.duration ?? 0) || 320;
  const easing = 'cubic-bezier(0.25, 1, 0.5, 1)';

  root.duration(duration).easing(easing);

  if (opts?.enteringEl) {
    const enteringEl = getIonPage(opts.enteringEl);
    const enteringAnimation = createAnimation()
      .addElement(enteringEl)
      .fill('both')
      .beforeRemoveClass('ion-page-invisible');

    if (isBack) {
      enteringAnimation.fromTo('transform', 'translateX(100%)', 'translateX(0%)').fromTo('opacity', 0.9, 1);
    } else {
      enteringAnimation.fromTo('transform', 'translateX(-100%)', 'translateX(0%)').fromTo('opacity', 0.9, 1);
    }

    root.addAnimation(enteringAnimation);
  }

  if (opts?.leavingEl) {
    const leavingEl = getIonPage(opts.leavingEl);
    const leavingAnimation = createAnimation().addElement(leavingEl).fill('both');

    if (isBack) {
      leavingAnimation.fromTo('transform', 'translateX(0%)', 'translateX(-100%)').fromTo('opacity', 1, 0.9);
    } else {
      leavingAnimation.fromTo('transform', 'translateX(0%)', 'translateX(100%)').fromTo('opacity', 1, 0.9);
    }

    root.addAnimation(leavingAnimation);
  }

  return root;
};
