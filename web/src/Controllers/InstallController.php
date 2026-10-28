<?php

namespace Web\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Throwable;
use Web\Requests\InstallRequest;
use Web\Services\InstallerService;

class InstallController {
    public function __construct(
        public InstallerService $installer,
    ) {}

    /**
     * Display the initial installation wizard.
     */
    public function index(): View {
        return view('install', ['title' => 'Instal·lació inicial — Colla Gegantera']);
    }

    /**
     * Process the initial installation and create the administrator account.
     */
    public function store(InstallRequest $request): RedirectResponse {
        try {
            $this->installer->install($request->validated());
        } catch (Throwable $exception) {
            return back()
                ->withErrors(['db_connection' => 'No s\'ha pogut configurar la base de dades: ' . $exception->getMessage()])
                ->withInput($request->except(['db_password', 'admin_password', 'admin_password_confirmation']));
        }

        return redirect()->route('home')->with('status', 'Instal·lació completada correctament.');
    }
}
