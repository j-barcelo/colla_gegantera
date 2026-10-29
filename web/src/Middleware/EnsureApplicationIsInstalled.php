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

        if (!$isInstalled) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => 'L\'aplicació encara no està instal·lada.', 'installed' => false], 503);
            }

            if (config('session.driver') === 'database') config(['session.driver' => 'file']);

            return $isInstallRoute ? $next($request) : redirect()->route('install.index');
        }

        return $isInstallRoute ? redirect()->route('home') : $next($request);
    }
}
