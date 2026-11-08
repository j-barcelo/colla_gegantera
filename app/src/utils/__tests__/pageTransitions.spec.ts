import { describe, expect, it, vi } from 'vitest';
import { slideFromLeftTransition } from '../pageTransitions';

interface MockAnimation {
  duration: ReturnType<typeof vi.fn>;
  easing: ReturnType<typeof vi.fn>;
  addElement: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  beforeRemoveClass: ReturnType<typeof vi.fn>;
  fromTo: ReturnType<typeof vi.fn>;
  addAnimation: ReturnType<typeof vi.fn>;
}

vi.mock('@ionic/vue', () => {
  const createAnim = () => {
    const anim: MockAnimation = {
      duration: vi.fn().mockReturnThis(),
      easing: vi.fn().mockReturnThis(),
      addElement: vi.fn().mockReturnThis(),
      fill: vi.fn().mockReturnThis(),
      beforeRemoveClass: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
      addAnimation: vi.fn().mockReturnThis(),
    };
    return anim;
  };

  return {
    createAnimation: createAnim,
  };
});

describe('pageTransitions.ts', () => {
  it('creates animation with forward direction', () => {
    const baseEl = document.createElement('div');
    const enteringEl = document.createElement('div');
    enteringEl.classList.add('ion-page');
    const leavingEl = document.createElement('div');
    leavingEl.classList.add('ion-page');

    const anim = slideFromLeftTransition(baseEl, {
      direction: 'forward',
      duration: 300,
      enteringEl,
      leavingEl,
    });

    expect(anim).toBeDefined();
    expect(anim.duration).toHaveBeenCalledWith(300);
  });

  it('creates animation with back direction and default duration', () => {
    const baseEl = document.createElement('div');
    const enteringEl = document.createElement('div');
    const childEntering = document.createElement('div');
    childEntering.classList.add('ion-page');
    enteringEl.appendChild(childEntering);

    const leavingEl = document.createElement('div');

    const anim = slideFromLeftTransition(baseEl, {
      direction: 'back',
      enteringEl,
      leavingEl,
    });

    expect(anim).toBeDefined();
    expect(anim.duration).toHaveBeenCalledWith(320);
  });
});
