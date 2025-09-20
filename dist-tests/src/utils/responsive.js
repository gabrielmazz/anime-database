// Small utility that mirrors the visual breakpoints and sizing
// rules used by SelectionScreen. It lets us validate behavior
// with simple unit tests without pulling a test framework.
/**
 * Returns the layout configuration used by SelectionScreen for a given viewport.
 * The values are aligned with Tailwind utilities set in the component:
 * - grid-cols-1 md:grid-cols-2
 * - min-h-[160px] sm:min-h-[200px] md:min-h-[240px]
 * - Title: text-[clamp(22px,3.6vw,42px)]
 * - Card title: clamp(16px,2.6vw,28px)
 */
export function getSelectionLayoutFor(width, _height) {
    const columns = width < 768 ? 1 : 2; // md breakpoint ~768px
    let cardMinHeight = 240;
    if (width < 480)
        cardMinHeight = 160; // mobile pequeno
    else if (width < 768)
        cardMinHeight = 200; // mobile grande / tablet vertical
    return {
        columns,
        cardMinHeight,
        titleFontSize: 'clamp(22px,3.6vw,42px)',
        cardTitleFontSize: 'clamp(16px,2.6vw,28px)'
    };
}
