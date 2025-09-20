import { getSelectionLayoutFor } from '../src/utils/responsive.js';
const cases = [
    {
        name: 'mobile 375x667',
        width: 375,
        expected: { columns: 1, cardMinHeight: 160, cardTitleFontSize: 'clamp(16px,2.6vw,28px)' },
    },
    {
        name: 'tablet 834x1112',
        width: 834,
        expected: { columns: 2, cardMinHeight: 240 }, // md and above
    },
    {
        name: 'desktop 1440x900',
        width: 1440,
        expected: { columns: 2, cardMinHeight: 240, titleFontSize: 'clamp(22px,3.6vw,42px)' },
    },
];
let failures = 0;
function assertEqual(label, actual, expected) {
    const pass = Object.is(actual, expected);
    if (!pass) {
        failures += 1;
        console.error(`FAIL ${label}: expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
    else {
        console.log(`PASS ${label}`);
    }
}
for (const c of cases) {
    const cfg = getSelectionLayoutFor(c.width, 800);
    for (const [k, v] of Object.entries(c.expected)) {
        // dynamic index on the plain object
        assertEqual(`${c.name} -> ${k}`, cfg[k], v);
    }
}
if (failures > 0) {
    console.error(`\n${failures} failing assertion(s)`);
    // Non-zero exit code for CI or local runs
    process.exitCode = 1;
}
