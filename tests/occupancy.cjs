const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const mod = new Module('occupancy');
mod._compile(ts.transpileModule(fs.readFileSync('utils/occupancy.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, 'occupancy.js');
const { calculateOccupancy, annualOccupancy } = mod.exports;
function day(weekday, movements) {
  return { weekday, slots: Array.from({ length: 48 }, (_, i) => ({ minute: i * 30, entries: movements[i * 30]?.[0] || 0, exits: movements[i * 30]?.[1] || 0 })) };
}
const open = day(1, { 600: [100, 0], 1080: [0, 20] });
const baseline = calculateOccupancy({ open }, 'bayonne', 'evening');
assert.equal(baseline[0].rate, 90 / 196 * 100);
assert.deepEqual(calculateOccupancy({ open, closed: day(2, {}), thursday: day(4, {1080: [200, 0]}) }, 'bayonne', 'evening'), baseline);
assert.equal(baseline[1].days, 1); // no movements is not a closed hour
assert.equal(baseline[1].rate, 80 / 196 * 100);
const saturday = day(6, { 570: [40, 0], 750: [0, 40] });
const pau = calculateOccupancy({ saturday }, 'pau', 'saturday');
assert.equal(pau[0].label, '09:30–10:00');
assert.equal(pau.at(-1).label, '16:00–16:30');
assert.equal(pau.find(p => p.label === '13:00–13:30').rate, null);
assert.equal(calculateOccupancy({ saturday }, 'bayonne', 'saturday').at(-1).label, '12:30–13:00');
assert.equal(calculateOccupancy({ small: day(6, { 570: [5, 0] }) }, 'pau', 'saturday')[0].rate, null);
const missing = day(1, {1080: [10, 0]});
missing.slots = missing.slots.filter(slot => slot.minute !== 1110);
assert.equal(calculateOccupancy({ missing }, 'pau', 'evening')[1].rate, null);
assert.equal(baseline.length, 8);
assert.equal(pau.length, 14);
assert.equal(baseline[0].label, '18:00–18:30');
assert.ok(Math.abs(annualOccupancy(baseline) - 81.25 / 196 * 100) < 1e-10);
assert.equal(annualOccupancy([]), null);
assert.equal(annualOccupancy([{ rate: 1, days: 1 }, { rate: 4, days: 2 }, { rate: null, days: 0 }]), 3);
const low = calculateOccupancy({ low: day(1, {1080: [1, 0]}) }, 'pau', 'evening');
assert.ok(low[0].rate > 0 && low[0].rate < 1);
console.log('Occupancy checks passed');
