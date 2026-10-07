<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? 'Colla Gegantera' }}</title>
    @vite(['css/app.scss', 'js/app.ts'])
</head>
<body>
    <main class="o-container u-text-center">
        <img id="colla-logo" class="c-colla-img" src="{{ Vite::asset('../shared/assets/images/gegants.webp') }}" alt="Gegants de la Colla" width="220" height="220">
        <h1>Colla Gegantera</h1>
        <p>Web pública (Laravel 13 Blade SSR + Vite)</p>

        <section class="c-api-status">
            <strong>Connexió API Backend</strong>
            <p id="api-status">Connectant amb l'API...</p>
            <small id="api-timestamp"></small>
        </section>
    </main>
</body>
</html>
