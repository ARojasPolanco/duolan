import { ChangeDetectionStrategy, Component } from '@angular/core';

export const RIOT_DISCLAIMER =
  "Duo LAN isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.";

@Component({
  selector: 'app-riot-disclaimer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="text-[11px] leading-relaxed text-muted">{{ disclaimer }}</p>`,
})
export class RiotDisclaimerComponent {
  protected readonly disclaimer = RIOT_DISCLAIMER;
}
