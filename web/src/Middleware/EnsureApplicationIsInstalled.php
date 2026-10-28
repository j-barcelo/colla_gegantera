<?php

namespace Web\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Web\Services\InstallerService;

class EnsureApplicationIsInstalled {
    public function __construct(
        public InstallerService $installer,
    ) {}

    /**
     * Redirect unconfigured installations to the installer and prevent re-installation.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response {
        $isInstalled = $this->installer->isInstalled();
        $isInstallRoute = $request->routeIs('install.*') || $request->is('install', 'install/*');

        if (!$isInstalled && config('session.driver') === 'database') {
            config(['session.driver' => 'file']);
        }

        $redirectRoute = match ($isInstalled) {
            false => $isInstallRoute ? null : 'install.index',
            true => $isInstallRoute ? 'home' : null,
        };

        return $redirectRoute ? redirect()->route($redirectRoute) : $next($request);
    }
}
