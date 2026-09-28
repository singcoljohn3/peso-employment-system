@php
    $fontStack = match ($design['font_family']) {
        'serif' => "Georgia, 'Times New Roman', serif",
        'mono' => "'Courier New', Courier, monospace",
        default => "'DejaVu Sans', Arial, Helvetica, sans-serif",
    };

    $scale = \App\Services\ResumeBuilderService::FONT_SCALE[$design['font_size']] ?? '1em';
    $lineHeight = \App\Services\ResumeBuilderService::LINE_SPACINGS[$design['line_spacing']] ?? '1.5';
    $accent = $design['accent_color'];
@endphp

/* ---- Base typography + spacing (applies to every template) ---- */
body {
    font-family: {{ $fontStack }} !important;
    font-size: calc(10pt * {{ $scale }}) !important;
    line-height: {{ $lineHeight }} !important;
}
.header, .sidebar, .main-content, .body, .main, .page {
    line-height: {{ $lineHeight }} !important;
}

/* ---- Accent colour ----
   Targets the shared template vocabulary (.section-title, .skill-item,
   .item-title, .cert-item:before, ...) so one rule set themes all 10 templates. */
.section-title {
    color: {{ $accent }} !important;
    border-bottom-color: {{ $accent }} !important;
}
.item-title {
    color: {{ $accent }} !important;
}
.cert-item:before, .training-item:before {
    color: {{ $accent }} !important;
}
.skill-item {
    background: {{ $accent }}1a !important;
    color: {{ $accent }} !important;
    border: 1px solid {{ $accent }}40 !important;
}

/* ---- Hidden sections ---- */
[data-section][data-hidden="true"] {
    display: none !important;
}
