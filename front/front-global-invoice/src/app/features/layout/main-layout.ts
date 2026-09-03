import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '@core/auth/auth.service';

@Component({
    selector: 'app-main-layout',
    imports: [
                RouterOutlet,
                RouterLink,
                RouterLinkActive,
                MatToolbarModule,
                MatButtonModule,
                MatIconModule
            ],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayout {
    private readonly auth = inject(AuthService);

    readonly user = this.auth.user;
    readonly canSeeDashboard = computed(() => this.auth.role() === 'AUDITOR');

    logout(): void {
        this.auth.logout();
    }
}