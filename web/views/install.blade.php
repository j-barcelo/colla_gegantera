<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? 'Instal·lació inicial — Colla Gegantera' }}</title>
    @vite(['css/app.scss', 'js/app.ts'])
</head>
<body>
    <main class="c-install">
        <h1 id="install-heading" class="u-visually-hidden">Instal·lació inicial</h1>
        <div
            id="install-app"
            data-action="{{ route('install.store') }}"
            data-csrf="{{ csrf_token() }}"
            data-old="{{ json_encode(session()->getOldInput(), JSON_HEX_APOS | JSON_HEX_QUOT) }}"
            data-errors="{{ json_encode($errors->toArray(), JSON_HEX_APOS | JSON_HEX_QUOT) }}"
        ></div>
    </main>
</body>
</html>
