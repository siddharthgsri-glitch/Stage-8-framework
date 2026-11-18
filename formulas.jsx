/* Formula sheets per chapter + interactive calculators */
(() => {
const c = (n, e, vars, solve, ex) => ({ n, e, vars, solve, ex });
const r = (n, e, ex) => ({ n, e, ex, rule: true });
const V = (k, l, u = '') => [k, l, u];
const sp = c('Speed', 'speed = distance ÷ time', [V('s', 'speed', 'm/s'), V('d', 'distance', 'm'), V('t', 'time', 's')], { s: v => v.d / v.t, d: v => v.s * v.t, t: v => v.d / v.s }, '120 m in 20 s → 6 m/s');
const pr = c('Pressure', 'pressure = force ÷ area', [V('p', 'pressure', 'Pa'), V('F', 'force', 'N'), V('A', 'area', 'm²')], { p: v => v.F / v.A, F: v => v.p * v.A, A: v => v.F / v.p }, '600 N on 3 m² → 200 Pa');
const pur = c('% purity', '% purity = mass of chemical ÷ total mass × 100', [V('P', '% purity', '%'), V('m', 'mass of chemical', 'g'), V('M', 'total mass', 'g')], { P: v => v.m / v.M * 100, m: v => v.P * v.M / 100, M: v => v.m * 100 / v.P }, '45 g salt in 50 g → 90%');
const mean = c('Mean', 'mean = total of values ÷ number of values', [V('x', 'mean'), V('T', 'total'), V('n', 'number of values')], { x: v => v.T / v.n, T: v => v.x * v.n, n: v => v.T / v.x }, 'Total 40 from 5 values → 8');
const range = c('Range', 'range = largest − smallest', [V('R', 'range'), V('L', 'largest'), V('S', 'smallest')], { R: v => v.L - v.S, L: v => v.R + v.S, S: v => v.L - v.R }, '14 − 3 → 11');
window.FORMULAS = {
  m1: [
    r('Multiplying: same signs', '+ × + = +\n− × − = +', '(+4) × (+3) = +12  ·  (−4) × (−3) = +12'),
    r('Multiplying: different signs', '+ × − = −\n− × + = −', '(+4) × (−3) = −12  ·  (−4) × (+3) = −12'),
    r('Dividing: same signs', '+ ÷ + = +\n− ÷ − = +', '(+12) ÷ (+3) = +4  ·  (−12) ÷ (−3) = +4'),
    r('Dividing: different signs', '+ ÷ − = −\n− ÷ + = −', '(+12) ÷ (−3) = −4  ·  (−12) ÷ (+3) = −4'),
    r('Several negatives', 'even number of − signs → answer is +\nodd number of − signs → answer is −', '(−2) × (−3) × (−1) = −6  (three − signs)'),
    r('Squares', 'a² = a × a\n(+a)² = +a²\n(−a)² = +a²', '(−5)² = (−5) × (−5) = +25'),
    r('Cubes', 'a³ = a × a × a\n(+a)³ = +a³\n(−a)³ = −a³', '(−2)³ = (−2) × (−2) × (−2) = −8'),
    r('Square roots', '√(a²) = +a or −a\na positive number has two square roots\na negative number has no square root', '√49 = +7 or −7, since 7² = 49 and (−7)² = 49'),
    r('Cube roots', '∛(a³) = a\n∛(positive) = positive\n∛(negative) = negative', '∛(−27) = −3, since (−3)³ = −27'),
    r('Multiplication law', 'aᵐ × aⁿ = aᵐ⁺ⁿ', '5³ × 5⁴ = 5³⁺⁴ = 5⁷'),
    r('Division law', 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ', '2⁹ ÷ 2⁶ = 2⁹⁻⁶ = 2³'),
    r('Power of a power', '(aᵐ)ⁿ = aᵐˣⁿ', '(3²)⁴ = 3²ˣ⁴ = 3⁸'),
    r('Zero index', 'a⁰ = 1   (a ≠ 0)', '7⁰ = 1  ·  (−4)⁰ = 1'),
    r('Index of one', 'a¹ = a', '9¹ = 9'),
    r('Power of a product', '(a × b)ⁿ = aⁿ × bⁿ', '(2 × 5)³ = 2³ × 5³ = 8 × 125 = 1000'),
    r('Power of a quotient', '(a ÷ b)ⁿ = aⁿ ÷ bⁿ', '(6 ÷ 3)² = 6² ÷ 3² = 36 ÷ 9 = 4'),
    r('Negative index', 'a⁻ⁿ = 1 ÷ aⁿ = 1/aⁿ', '2⁻³ = 1/2³ = 1/8'),
    r('Fractional index (going further)', 'a^(1/2) = √a\na^(1/3) = ∛a', '25^(1/2) = √25 = 5  ·  8^(1/3) = ∛8 = 2'),
    r('Index laws with letters', 'multiply the numbers, add the indices of the same letter', '3x² × 4x⁵ = 12x⁷  ·  10y⁶ ÷ 2y² = 5y⁴'),
  ],
  m2: [c('Circumference (diameter)', 'C = π × d', [V('C', 'circumference', 'cm'), V('d', 'diameter', 'cm')], { C: v => Math.PI * v.d, d: v => v.C / Math.PI }, 'd = 10 cm → C ≈ 31.4 cm'), c('Circumference (radius)', 'C = 2 × π × r', [V('C', 'circumference', 'cm'), V('r', 'radius', 'cm')], { C: v => 2 * Math.PI * v.r, r: v => v.C / (2 * Math.PI) }, 'r = 5 cm → C ≈ 31.4 cm'), c("Euler's formula", 'V + F − E = 2', [V('E', 'edges'), V('V', 'vertices'), V('F', 'faces')], { E: v => v.V + v.F - 2, V: v => v.E - v.F + 2, F: v => v.E - v.V + 2 }, 'Cube: 8 + 6 − 12 = 2')],
  m4: [c('HCF and LCM', 'HCF × LCM = first number × second number', [V('L', 'LCM'), V('H', 'HCF'), V('a', 'first number'), V('b', 'second number')], { L: v => v.a * v.b / v.H, H: v => v.a * v.b / v.L }, '12 and 18: 6 × 36 = 216')],
  m5: [r('Distributive law (expanding)', 'a(b + c) = ab + ac', '3(2x + 4) = 6x + 12'), r('Factorising', 'ab + ac = a(b + c)', '6x + 12 = 6(x + 2)')],
  m6: [c('Angles in a triangle', 'a + b + c = 180°', [V('c', 'third angle', '°'), V('a', 'angle a', '°'), V('b', 'angle b', '°')], { c: v => 180 - v.a - v.b }, '50° + 60° → 70°'), c('Exterior angle of a triangle', 'exterior angle = sum of the two interior opposite angles', [V('e', 'exterior angle', '°'), V('a', 'interior opposite 1', '°'), V('b', 'interior opposite 2', '°')], { e: v => v.a + v.b, a: v => v.e - v.b }, '48° + 67° → 115°'), r('Angles on a line / around a point', 'on a straight line = 180°   around a point = 360°', '70° + 110° = 180°'), r('Parallel lines', 'corresponding = equal   alternate = equal   co-interior add to 180°', '115° and 65° are co-interior'), c('Back bearing', 'back bearing = bearing ± 180°', [V('B', 'back bearing', '°'), V('b', 'bearing', '°')], { B: v => (v.b + 180) % 360 }, '060° → 240°')],
  m7: [r('Multiplying by 0.1 and 0.01', '× 0.1 = ÷ 10   × 0.01 = ÷ 100', '45 × 0.01 = 0.45'), r('Dividing by 0.1 and 0.01', '÷ 0.1 = × 10   ÷ 0.01 = × 100', '3.6 ÷ 0.1 = 36')],
  m8: [mean, range],
  m9: [c('Example formula: taxi fare', 'C = 3 + 2d', [V('C', 'cost', '$'), V('d', 'distance', 'km')], { C: v => 3 + 2 * v.d, d: v => (v.C - 3) / 2 }, 'd = 12 → C = 27'), r('Changing the subject', 'undo each operation in reverse order, doing the same to both sides', 'y = 3x + 5 → x = (y − 5) ÷ 3')],
  m10: [r('Dividing by a fraction', 'a ÷ (p/q) = a × (q/p)', '5 ÷ ⅓ = 15'), r('Integer × mixed number', 'n × w p/q = n × w + n × p/q', '4 × 1⅔ = 4 + 8/3 = 6⅔')],
  m11: [c('Miles to kilometres', 'km = miles × 8 ÷ 5', [V('k', 'kilometres', 'km'), V('m', 'miles', 'mi')], { k: v => v.m * 8 / 5, m: v => v.k * 5 / 8 }, '40 miles → 64 km'), c('Area of a parallelogram', 'A = b × h', [V('A', 'area', 'cm²'), V('b', 'base', 'cm'), V('h', 'perpendicular height', 'cm')], { A: v => v.b * v.h, b: v => v.A / v.h, h: v => v.A / v.b }, 'b = 9, h = 4 → 36 cm²'), c('Area of a triangle', 'A = ½ × b × h', [V('A', 'area', 'cm²'), V('b', 'base', 'cm'), V('h', 'height', 'cm')], { A: v => v.b * v.h / 2, b: v => 2 * v.A / v.h, h: v => 2 * v.A / v.b }, 'b = 6, h = 4 → 12 cm²'), c('Area of a trapezium', 'A = ½ × (a + b) × h', [V('A', 'area', 'cm²'), V('a', 'parallel side a', 'cm'), V('b', 'parallel side b', 'cm'), V('h', 'height', 'cm')], { A: v => (v.a + v.b) / 2 * v.h, h: v => 2 * v.A / (v.a + v.b) }, '5, 9, h = 6 → 42 cm²'), c('Volume of a triangular prism', 'V = ½ × b × h × l', [V('V', 'volume', 'cm³'), V('b', 'triangle base', 'cm'), V('h', 'triangle height', 'cm'), V('l', 'length', 'cm')], { V: v => v.b * v.h / 2 * v.l, l: v => 2 * v.V / (v.b * v.h) }, '6, 4, 10 → 120 cm³'), c('Surface area of a cuboid', 'SA = 2(lw + lh + wh)', [V('S', 'surface area', 'cm²'), V('l', 'length', 'cm'), V('w', 'width', 'cm'), V('h', 'height', 'cm')], { S: v => 2 * (v.l * v.w + v.l * v.h + v.w * v.h) }, '5 × 2 × 1 → 34 cm²')],
  m12: [c('Complementary events', 'P(not A) = 1 − P(A)', [V('Q', 'P(not A)'), V('P', 'P(A)')], { Q: v => 1 - v.P, P: v => 1 - v.Q }, 'P(rain) = 0.35 → P(no rain) = 0.65'), c('Relative frequency', 'relative frequency = number of successes ÷ number of trials', [V('R', 'relative frequency'), V('s', 'successes'), V('n', 'trials')], { R: v => v.s / v.n, s: v => v.R * v.n, n: v => v.s / v.R }, '36 ÷ 120 → 0.3')],
  m13: [r('Order of operations', 'Brackets → Indices → ÷ × → + −', '5 + 3 × 2² = 17'), r('Distributive shortcut', 'a × b + a × c = a × (b + c)', '3.2 × 7 + 6.8 × 7 = 10 × 7')],
  m14: [r('Solving equations', 'do the same to both sides; undo in reverse order', '3(x + 4) = 27 → x = 5'), r('Inequality symbols', '< less than   ≤ less than or equal   > greater than   ≥ greater than or equal', '−1 < x ≤ 2 → 0, 1, 2')],
  m15: [c('Midpoint (x)', 'x = (x₁ + x₂) ÷ 2', [V('x', 'midpoint x'), V('a', 'x₁'), V('b', 'x₂')], { x: v => (v.a + v.b) / 2, b: v => 2 * v.x - v.a }, '(2 + 8) ÷ 2 = 5'), c('Midpoint (y)', 'y = (y₁ + y₂) ÷ 2', [V('y', 'midpoint y'), V('a', 'y₁'), V('b', 'y₂')], { y: v => (v.a + v.b) / 2, b: v => 2 * v.y - v.a }, '(7 + 3) ÷ 2 = 5')],
  m16: [c('Fraction to percentage', 'percentage = top ÷ bottom × 100', [V('P', 'percentage', '%'), V('a', 'numerator'), V('b', 'denominator')], { P: v => v.a / v.b * 100, a: v => v.P * v.b / 100 }, '13/20 → 65%')],
  m17: [c('Pie chart sector angle', 'angle = frequency ÷ total × 360°', [V('A', 'angle', '°'), V('f', 'frequency'), V('T', 'total')], { A: v => v.f / v.T * 360, f: v => v.A * v.T / 360 }, '10 of 40 → 90°')],
  m19: [c('Percentage increase', 'new amount = original × (1 + p ÷ 100)', [V('N', 'new amount'), V('O', 'original'), V('p', '% increase', '%')], { N: v => v.O * (1 + v.p / 100), O: v => v.N / (1 + v.p / 100) }, '$60 + 15% → $69'), c('Percentage decrease', 'new amount = original × (1 − p ÷ 100)', [V('N', 'new amount'), V('O', 'original'), V('p', '% decrease', '%')], { N: v => v.O * (1 - v.p / 100), O: v => v.N / (1 - v.p / 100) }, '250 − 12% → 220'), c('Percentage change', '% change = change ÷ original × 100', [V('P', '% change', '%'), V('c', 'change'), V('O', 'original')], { P: v => v.c / v.O * 100, c: v => v.P * v.O / 100 }, '$40 → $46: 15%')],
  m20: [c('nth term', 'nth term = a × n + b', [V('T', 'term'), V('a', 'difference a'), V('n', 'position n'), V('b', 'b')], { T: v => v.a * v.n + v.b, n: v => (v.T - v.b) / v.a }, '5n − 2, n = 20 → 98')],
  m21: [c('Independent events', 'P(A and B) = P(A) × P(B)', [V('P', 'P(A and B)'), V('a', 'P(A)'), V('b', 'P(B)')], { P: v => v.a * v.b, b: v => v.P / v.a }, '0.5 × 0.4 = 0.2'), c('Equally likely outcomes', 'P = favourable outcomes ÷ total outcomes', [V('P', 'probability'), V('f', 'favourable'), V('t', 'total')], { P: v => v.f / v.t }, 'Two dice, sum 7: 6 ÷ 36')],
  m22: [c('Sharing in a ratio', 'one part = amount ÷ total number of parts', [V('o', 'one part'), V('T', 'amount'), V('n', 'total parts')], { o: v => v.T / v.n, T: v => v.o * v.n }, '$45 in 2 : 3 → one part = 9'), r('Direct proportion', 'find the value of 1 unit, then multiply', '4 pens = $6 → 1 pen = $1.50 → 10 pens = $15')],
  m23: [r('Equation of a straight line', 'y = mx + c   (m = gradient, c = y-intercept)', 'y = 2x + 5 crosses at (0, 5)'), c('Gradient', 'm = (y₂ − y₁) ÷ (x₂ − x₁)', [V('m', 'gradient'), V('a', 'y₂'), V('b', 'y₁'), V('c', 'x₂'), V('d', 'x₁')], { m: v => (v.a - v.b) / (v.c - v.d) }, '(1, 4) and (3, 10) → 3'), c('Using y = mx + c', 'y = m × x + c', [V('y', 'y'), V('m', 'gradient m'), V('x', 'x'), V('c', 'intercept c')], { y: v => v.m * v.x + v.c, x: v => (v.y - v.c) / v.m }, 'y = 3x + 2, x = 4 → 14')],
  m24: [mean, range, r('Median', 'put the data in order; the middle value (position (n + 1) ÷ 2)', '15 values → the 8th')],
  s1: [r('Aerobic respiration', 'glucose + oxygen → carbon dioxide + water (+ energy)', 'Happens in the mitochondria')],
  s2: [c('Energy balance', 'energy stored = energy in (food) − energy used', [V('S', 'energy stored', 'kJ'), V('I', 'energy in', 'kJ'), V('U', 'energy used', 'kJ')], { S: v => v.I - v.U, I: v => v.S + v.U }, '10 000 − 9 500 → 500 kJ stored')],
  s4: [c('Rf value', 'Rf = distance moved by spot ÷ distance moved by solvent', [V('R', 'Rf'), V('s', 'spot distance', 'cm'), V('f', 'solvent distance', 'cm')], { R: v => v.s / v.f, s: v => v.R * v.f }, '3.6 ÷ 8.0 → 0.45')],
  s5: [c('Concentration', 'concentration = mass of solute ÷ volume of solution', [V('C', 'concentration', 'g/cm³'), V('m', 'mass of solute', 'g'), V('v', 'volume', 'cm³')], { C: v => v.m / v.v, m: v => v.C * v.v, v: v => v.m / v.C }, '20 g in 100 cm³ → 0.2 g/cm³'), c('Mass that crystallises', 'crystals = mass dissolved − solubility at the lower temperature', [V('X', 'crystals', 'g'), V('D', 'mass dissolved', 'g'), V('S', 'solubility when cool', 'g')], { X: v => v.D - v.S }, '110 − 32 → 78 g')],
  s6: [c('Temperature change', 'change = final temperature − initial temperature', [V('c', 'change', '°C'), V('f', 'final', '°C'), V('i', 'initial', '°C')], { c: v => v.f - v.i, f: v => v.c + v.i }, '27 − 19.5 → +7.5 °C (exothermic)'), r('Metal + acid', 'metal + acid → salt + hydrogen', 'zinc + hydrochloric acid → zinc chloride + hydrogen'), r('Neutralisation', 'acid + alkali → salt + water', 'hydrochloric acid + sodium hydroxide → sodium chloride + water'), r('Metal + oxygen', 'metal + oxygen → metal oxide', 'magnesium + oxygen → magnesium oxide'), r('Displacement', 'more reactive metal + compound of less reactive metal → swap', 'zinc + copper sulfate → zinc sulfate + copper')],
  sL: [pr, c('Force from pressure (hydraulics)', 'force = pressure × area', [V('F', 'force', 'N'), V('p', 'pressure', 'N/cm²'), V('A', 'area', 'cm²')], { F: v => v.p * v.A, A: v => v.F / v.p }, '25 N/cm² × 80 cm² → 2000 N'), pur],
  sG: [pr, c('Force of a gas on a surface', 'force = pressure × area', [V('F', 'force', 'N'), V('p', 'pressure', 'Pa'), V('A', 'area', 'm²')], { F: v => v.p * v.A, A: v => v.F / v.p }, '2000 Pa × 0.05 m² → 100 N')],
  s7: [sp, c('Average speed', 'average speed = total distance ÷ total time', [V('s', 'average speed', 'm/s'), V('D', 'total distance', 'm'), V('T', 'total time', 's')], { s: v => v.D / v.T, D: v => v.s * v.T, T: v => v.D / v.s }, '200 m in 40 s → 5 m/s'), r('Distance–time graph', 'gradient = speed; flat line = stopped', '30 m in 6 s → 5 m/s')],
  s8: [c('Moment (turning effect)', 'moment = force × distance from pivot', [V('M', 'moment', 'Nm'), V('F', 'force', 'N'), V('d', 'distance', 'm')], { M: v => v.F * v.d, F: v => v.M / v.d, d: v => v.M / v.F }, '40 N × 0.5 m → 20 Nm'), c('Principle of moments', 'F₁ × d₁ = F₂ × d₂ (when balanced)', [V('d', 'd₂', 'm'), V('a', 'F₁', 'N'), V('b', 'd₁', 'm'), V('c', 'F₂', 'N')], { d: v => v.a * v.b / v.c, c: v => v.a * v.b / v.d }, '60 × 2 = 40 × 3'), pr, r('Resultant force', 'resultant = bigger force − smaller force (opposite directions)', '500 N − 350 N = 150 N forwards')],
  s9: [r('Law of reflection', 'angle of incidence = angle of reflection (measured from the normal)', 'i = 35° → r = 35°'), r('Refraction', 'into a denser material: slows down, bends towards the normal', 'air → glass: 40° → 25°'), r('Adding coloured light', 'red + green = yellow   red + blue = magenta   green + blue = cyan   all three = white', 'Stage lighting')],
  s12: [c('Light travel time', 'time (minutes) ≈ distance in AU × 8.3', [V('t', 'time', 'min'), V('d', 'distance', 'AU')], { t: v => v.d * 8.3, d: v => v.t / 8.3 }, 'Mars 1.52 AU → about 13 min')],
  c3: [c('Values from bits', 'number of values = 2 ^ number of bits', [V('N', 'values'), V('b', 'bits')], { N: v => Math.pow(2, v.b), b: v => Math.log2(v.N) }, '8 bits → 256 values'), r('Binary place values', '128 · 64 · 32 · 16 · 8 · 4 · 2 · 1', '00100101 = 32 + 4 + 1 = 37'), r('Logic gates', 'AND: 1 only if both 1   OR: 1 if either 1   NOT: opposite', 'AND(1, 0) = 0')],
  c5: [r('Spreadsheet: multiply', '=B1*B2', 'price × quantity'), r('Spreadsheet: add a range', '=SUM(A1:A5)', 'total of five cells'), r('Spreadsheet: average', '=AVERAGE(A1:A5)', 'mean of five cells')],
  c2: [r('ASCII codes', 'A = 65, B = 66 … Z = 90   a = 97 … z = 122', "'C' = 67")],
};
})();


/* extra topic formulas */
(() => {
  const F = window.FORMULAS;
  const c = (n, e, vars, solve, ex) => ({ n, e, vars, solve, ex });
  const V = (k, l, u = '') => [k, l, u];
  F.m1.push(c('Square and square root', 'n² = n × n   √(n²) = ±n', [V('s', 'square'), V('n', 'number n')], { s: v => v.n * v.n, n: v => Math.sqrt(v.s) }, '(−5)² = 25, √25 = ±5'), c('Cube and cube root', 'n³ = n × n × n   ∛(n³) = n', [V('c', 'cube'), V('n', 'number n')], { c: v => v.n * v.n * v.n, n: v => Math.cbrt(v.c) }, '(−3)³ = −27, ∛(−27) = −3'));
  F.m2.push(c('Regular polygon symmetry', 'lines of symmetry = order of rotation = n;  turn = 360° ÷ n', [V('t', 'turn angle', '°'), V('n', 'number of sides')], { t: v => 360 / v.n, n: v => 360 / v.t }, 'Pentagon: 360 ÷ 5 = 72°'));
  F.m3 = [c('Stratified sample size', 'from a group = group size ÷ population × sample size', [V('g', 'number to sample from group'), V('G', 'group size'), V('N', 'population'), V('S', 'sample size')], { g: v => v.G / v.N * v.S }, '300 girls of 500, sample 50 → 30')];
  F.m7.push({ n: 'Significant figures', e: 'count from the first non-zero digit; look at the next digit: 5 or more rounds up', ex: '0.003482 → 0.0035 (2 s.f.)', rule: true });
  F.s3 = [c('Bioaccumulation', 'concentration = starting concentration × factor ^ number of steps up the chain', [V('C', 'concentration at top', 'ppm'), V('c', 'starting concentration', 'ppm'), V('f', 'factor per level'), V('k', 'levels up')], { C: v => v.c * Math.pow(v.f, v.k) }, '0.02 × 10⁴ = 200 ppm')];
  F.s10 = [{ n: 'Electromagnet strength', e: 'stronger with: more turns · more current · an iron core', ex: '20 turns → 40 turns doubles the strength', rule: true }, { n: 'Magnetic poles', e: 'like poles repel · unlike poles attract', ex: 'N facing N → push apart', rule: true }];
  F.s11 = [{ n: 'Greenhouse effect', e: 'more CO₂ in the atmosphere → more heat trapped → higher average temperature', ex: '280 ppm (1800) → 420+ ppm today', rule: true }, { n: 'Climate vs weather', e: 'climate = average weather over 30+ years', ex: 'One cold week ≠ a change in climate', rule: true }];
})();

/* which formulas belong to which topic: chapter → { topic: [formula indexes] } */
window.FSEC = {
  m1: { '1.1': [0, 1, 2, 3, 4], '1.2': [5, 6, 7, 8], '1.3': [9, 10, 11, 12, 13, 14, 15, 16, 17, 18] }, m2: { '2.2': [3], '2.3': [2], '2.4': [0, 1] }, m3: { '3.2': [0] }, m4: { '4.1': [0] }, m5: { '5.3': [0, 1] },
  m6: { '6.1': [2, 3], '6.2': [0, 1], '6.3': [4] }, m7: { '7.1': [0, 1], '7.2': [2] }, m8: { '8.1': [0, 1], '8.3': [0, 1] }, m9: { '9.2': [0], '9.3': [1] }, m10: { '10.2': [0, 1] },
  m11: { '11.1': [0], '11.2': [1, 2, 3], '11.3': [4], '11.4': [5] }, m12: { '12.1': [0], '12.2': [1] }, m13: { '13.1': [0], '13.2': [1] }, m14: { '14.1': [0], '14.2': [0], '14.3': [0], '14.4': [1] },
  m15: { '15.1': [0, 1] }, m16: { '16.3': [0] }, m17: { '17.1': [0] }, m19: { '19.1': [0, 1, 2] }, m20: { '20.2': [0] }, m21: { '21.1': [0], '21.2': [1] }, m22: { '22.1': [1], '22.3': [0] },
  m23: { '23.1': [2], '23.2': [0, 1], '23.3': [2] }, m24: { '24.2': [0, 1, 2] },
  s1: { '1.2': [0] }, s2: { '2.2': [0] }, s3: { '3.2': [0] }, s4: { '4.2': [0] }, s5: { '5.1': [0], '5.2': [1] }, s6: { '6.1': [1, 2, 3, 4], '6.3': [0], '6.4': [0], '6.5': [4] },
  sL: { 'L.2': [0, 1], 'L.3': [2] }, sG: { 'G.1': [0], 'G.3': [0, 1] }, s7: { '7.2': [0, 1], '7.3': [2] }, s8: { '8.1': [3], '8.2': [0, 1], '8.3': [2], '8.4': [2] },
  s9: { '9.1': [0], '9.2': [1], '9.3': [2] }, s10: { '10.1': [1], '10.2': [0] }, s11: { '11.2': [0], '11.1': [1] }, s12: { '12.1': [0] },
  c2: { '2.2': [0] }, c3: { '3.3': [0, 1], '3.5': [2] }, c5: { '5.3': [0, 1, 2] },
};
window.secFormulas = (ch, n) => { const m = (window.FSEC[ch.id] || {})[n] || []; const all = window.FORMULAS[ch.id] || []; return m.map(i => all[i]).filter(Boolean); };

/* English & French writing formulas (frames & rules) */
(() => {
  const F = window.FORMULAS; const r = (n, e, ex) => ({ n, e, ex, rule: true });
  Object.assign(F, {
    e1: [r('Word building', 'prefix + root + suffix = new word', 'trans + port + ation = transportation'), r('Suffix rule: drop the e', 'word ending in e + vowel suffix → drop the e', 'hope + ing = hoping'), r('Suffix rule: double', 'short vowel + 1 consonant + vowel suffix → double it', 'run + ing = running'), r('Suffix rule: y → i', 'consonant + y + suffix → change y to i (not before -ing)', 'happy + ness = happiness'), r('Context clues', 'clue words around the word + signal words (but, because) = meaning', '"timid, but audacious" → bold')],
    e2: [r('Compound sentence', 'main clause + , + FANBOYS (for, and, nor, but, or, yet, so) + main clause', 'It rained, so we stayed in.'), r('Complex sentence', 'subordinate clause (when / because / although…) + , + main clause', 'When the bell rang, we ran outside.'), r('Semicolon', 'main clause ; related main clause', 'It was late; we went home.'), r('Apostrophe of possession', "one owner: 's   ·   plural owners ending in s: s'", "the dog's bone · the dogs' bones")],
    e3: [r('Inference', 'clue in the text + what I know = inference', 'slammed the door + people slam doors when cross = angry'), r('Fact vs opinion', 'fact = can be proved   ·   opinion = a belief or feeling', 'Paris is in France (fact) · Paris is beautiful (opinion)'), r('PEE for reading answers', 'Point + Evidence (quotation) + Explain', 'Maya is angry. "She slammed the door." This shows…')],
    e4: [r('Analysis sentence', 'The writer uses [technique], "[quotation]", to [effect on the reader].', 'The writer uses a simile, "as cold as ice", to show how unfriendly she is.'), r('Simile vs metaphor', 'simile = like / as   ·   metaphor = IS', 'as brave as a lion · He is a lion'), r('Effect verbs', 'suggests · emphasises · creates · implies · makes the reader feel', 'This emphasises the danger.')],
    e5: [r('PEE paragraph', 'Point + Evidence + Explain', 'School should start later. Teens need 9 hours of sleep. This shows…'), r('News lead paragraph', 'Who + What + Where + When + Why', 'On Saturday, Year 8 pupils at Oak School raised £500 for charity.'), r('Connective frame', 'Firstly, … Furthermore, … However, … Therefore, … Finally, …', 'Use one connective type per job')],
    e6: [r('AFOREST', 'Alliteration · Facts · Opinion · Rhetorical question · Emotive language · Statistics · Triples', 'Do we really want our beaches buried in rubbish?'), r('Formal letter', 'Dear Mr X → Yours sincerely   ·   Dear Sir/Madam → Yours faithfully', 'I am writing to…'), r('Counter-argument', 'Some people argue that… However, …', 'Some say it is too costly. However, …')],
    e7: [r('Story arc', 'Opening → Build-up → Climax → Resolution → Ending', 'Hook · problem · peak · fix · reflect'), r("Show, don't tell", 'feeling → action + senses + body language', 'scared → her hands shook and her breath came in gasps'), r('Proofreading: CUPS', 'Capitals · Usage (grammar) · Punctuation · Spelling', "their / there / they're")],
    e8: [r('Speech delivery', 'Pace + Pause + Emphasis + Tone + Eye contact', 'Slow down… and pause… for key points'), r('Constructive feedback', 'What went well (WWW) + Even better if (EBI)', 'WWW: clear voice. EBI: more eye contact.')],
    f1: [r('My: possessives', 'mon (masc.) · ma (fem.) · mes (plural)', 'mon père · ma mère · mes parents'), r('Être (to be)', 'je suis · tu es · il est · nous sommes · vous êtes · ils sont', 'Je suis grand.'), r('Avoir (to have)', "j'ai · tu as · il a · nous avons · vous avez · ils ont", "J'ai un frère."), r('Age', "J'ai + number + ans", "J'ai douze ans.")],
    f2: [r('Reflexive verbs', 'subject + me / te / se / nous / vous / se + verb', 'je me lève · il se couche'), r('Telling the time', 'Il est + number + heure(s) (+ et quart / et demie / moins le quart)', 'Il est sept heures et demie.')],
    f3: [r('Opinion formula', "opinion + subject + parce que c'est + (très) + adjective", "J'adore les sciences parce que c'est très intéressant."), r('Comparative', 'plus / moins / aussi + adjective + que', "Les maths sont plus difficiles que l'art."), r('Superlative', 'le / la / les + plus + adjective', 'la matière la plus intéressante')],
    f4: [r('-er verb endings', 'stem + e, es, e, ons, ez, ent', 'parler → je parle, nous parlons'), r('-ir verb endings', 'stem + is, is, it, issons, issez, issent', 'finir → je finis, nous finissons'), r('-re verb endings', 'stem + s, s, –, ons, ez, ent', 'vendre → je vends, il vend'), r('Modal + infinitive', 'subject + pouvoir / vouloir / devoir + infinitive', 'Je peux nager. Je ne veux pas danser.'), r('Sports & instruments', 'jouer au + sport · jouer de la / du + instrument', 'jouer au foot · jouer de la guitare')],
    f5: [r('à + article', "à + le = au · à + la = à la · à + l' = à l' · à + les = aux", 'Je vais au parc.'), r('de + article', "de + le = du · de + la = de la · de + l' = de l' · de + les = des", 'Je reviens du marché.'), r('Polite ordering', "Je voudrais + item + s'il vous plaît", "Je voudrais un café, s'il vous plaît.")],
    f6: [r('Passé composé', 'subject + avoir / être (present) + past participle', "J'ai joué. Je suis allé(e)."), r('Past participles', '-er → é · -ir → i · -re → u', 'manger → mangé · finir → fini · vendre → vendu'), r('Futur proche', 'subject + aller (present) + infinitive', 'Je vais jouer.'), r('Weather', 'Il fait + adjective · Il pleut / Il neige · Il y a + du / des…', 'Il fait chaud.')],
    f7: [r('Partitive (some)', "du (m.) · de la (f.) · de l' (vowel) · des (pl.) → de after a negative", 'du pain · pas de pain'), r('Adjective agreement', 'feminine + e · plural + s · feminine plural + es', 'petit → petite → petits → petites'), r('Adjective position: BAGS', 'Beauty, Age, Goodness, Size → before the noun; others after', 'une petite maison rouge')],
    f8: [r('Countries', 'en + feminine (en France) · au + masculine (au Canada) · aux + plural (aux États-Unis)', "J'habite en Belgique."), r('Super-sentence', 'opinion + parce que + reason + mais + contrast + donc + result', "J'aime le foot parce que c'est amusant, mais…")],
  });
  Object.assign(window.FSEC, {
    e1: { '1.1': [0], '1.2': [4], '1.3': [1, 2, 3] }, e2: { '2.2': [0, 1], '2.3': [2, 3] }, e3: { '3.1': [0, 2], '3.2': [1] }, e4: { '4.1': [1], '4.2': [0, 2] },
    e5: { '5.1': [1], '5.2': [2], '5.3': [0] }, e6: { '6.1': [0, 2], '6.2': [1] }, e7: { '7.1': [0], '7.2': [1], '7.3': [2] }, e8: { '8.1': [0], '8.2': [1] },
    f1: { '1.1': [0], '1.2': [1, 2, 3] }, f2: { '2.1': [0], '2.2': [1] }, f3: { '3.2': [0], '3.3': [1, 2] }, f4: { '4.1': [4], '4.2': [0, 1, 2], '4.3': [3] },
    f5: { '5.2': [0, 1], '5.3': [2] }, f6: { '6.1': [3], '6.2': [0, 1, 2] }, f7: { '7.1': [0], '7.2': [1, 2] }, f8: { '8.1': [0], '8.2': [1] },
  });
})();

/* compact strip of formulas for a topic */
function FormulaStrip({ fs, onOpen, light }) {
  if (!fs || !fs.length) return null;
  return <div className={'fm-strip' + (light ? ' light' : '')}><span className="fm-strip-h"> Formula{fs.length > 1 ? 's' : ''}</span>{fs.map((x, i) => <button key={i} className="fm-pill" onClick={onOpen} title={x.n}><b>{x.n}</b><span>{x.e}</span></button>)}</div>;
}
function TopicFormulas({ ch, sec, onNext }) {
  const fs = secFormulas(ch, sec.n);
  return (
    <div className="fm-topic">
      <div className="fm-sheet">
        <div className="fm-sheet-h"><span className="fm-big"></span><div><h3>Formulas for {sec.n} {sec.t}</h3><span className="g-sub">Read each formula, check the example, then try the calculator. You'll need these in the quiz!</span></div></div>
        <div className="fm-grid">{fs.map((x, i) => <FormulaCard key={i} f={x} i={i} />)}</div>
      </div>
      <div className="g-row" style={{ justifyContent: 'flex-end', margin: '16px 0 60px' }}><button className="btn g-btn big" onClick={() => { GAME.award(5, 2, ' Formulas learned'); onNext(); }}>Got them! Explore the models </button></div>
    </div>
  );
}
Object.assign(window, { FormulaStrip, TopicFormulas });

function FormulaCard({ f, i }) {
  const keys = f.rule ? [] : Object.keys(f.solve);
  const [target, setTarget] = React.useState(keys[0]);
  const [vals, setVals] = React.useState({});
  const [open, setOpen] = React.useState(false);
  const inputs = f.rule ? [] : f.vars.filter(v => v[0] !== target);
  const ready = inputs.every(v => vals[v[0]] !== undefined && vals[v[0]] !== '' && !isNaN(+vals[v[0]]));
  let res = null; if (ready && !f.rule) { const nv = {}; inputs.forEach(v => nv[v[0]] = +vals[v[0]]); const x = f.solve[target](nv); res = isFinite(x) ? x : null; }
  const tv = f.vars && f.vars.find(v => v[0] === target);
  return (
    <div className={'fm-card fc' + (i % 5)}>
      <div className="fm-top"><span className="fm-ic"></span><b>{f.n}</b></div>
      <div className="fm-eq">{f.e}</div>
      {f.vars && <div className="fm-vars">{f.vars.map(v => <span key={v[0]}><i>{v[1]}</i>{v[2] ? ' (' + v[2] + ')' : ''}</span>)}</div>}
      <div className="fm-ex"> {f.ex}</div>
      {!f.rule && (open ? (
        <div className="fm-calc">
          <div className="fm-row"><span className="mono">Find</span><div className="chips">{keys.map(k => { const v = f.vars.find(x => x[0] === k); return <button key={k} className={'chip' + (k === target ? ' on' : '')} onClick={() => { setTarget(k); }}>{v[1]}</button>; })}</div></div>
          {inputs.map(v => <label key={v[0]} className="fm-in"><span>{v[1]}</span><input type="number" value={vals[v[0]] ?? ''} onChange={e => setVals({ ...vals, [v[0]]: e.target.value })} placeholder="?" /><em>{v[2]}</em></label>)}
          <div className="fm-res">{tv[1]} = <b>{res == null ? '…' : wxFmt(res, 3)}</b> {res != null && tv[2]}</div>
        </div>
      ) : <button className="g-pill" onClick={() => setOpen(true)}> Use the calculator</button>)}
    </div>
  );
}

function FormulaSheet({ ch, compact }) {
  const fs = (window.FORMULAS || {})[ch.id];
  if (!fs) return null;
  return (
    <div className="fm-sheet">
      <div className="fm-sheet-h"><span className="fm-big"></span><div><h3>Formula sheet</h3><span className="g-sub">{fs.length} formula{fs.length > 1 ? 's' : ''} and rules for this chapter.{fs.some(x => !x.rule) ? ' Tap a calculator to try one.' : ' Use them as writing frames.'}</span></div></div>
      <div className="fm-grid">{fs.map((f, i) => <FormulaCard key={i} f={f} i={i} />)}</div>
    </div>
  );
}

function FormulaBook({ go }) {
  const [subj, setSubj] = React.useState('maths');
  const list = BOOK.filter(c => c.subj === subj && FORMULAS[c.id]);
  return (
    <div className="wrap g-page" data-screen-label="Formula book">
      <div className="g-welcome" style={{ background: 'linear-gradient(135deg, #4facfe, #a78bfa)', marginBottom: 20 }}><div style={{ fontSize: 56 }}></div><h1>Formula book</h1><p>Every formula, writing frame and grammar rule you need, chapter by chapter.</p></div>
      <div className="g-tabs">{[['maths', ' Maths'], ['science', ' Science'], ['computing', ' Computing'], ['english', ' English'], ['french', ' French']].map(([k, l]) => <button key={k} className={subj === k ? 'on' : ''} onClick={() => setSubj(k)}>{l}</button>)}</div>
      {list.map(c => (
        <div key={c.id} className={bookCls(c)} style={{ marginBottom: 26 }}>
          <div className="g-strand-h"><span className="dot" /><h2 style={{ fontSize: 22 }}>{c.subj === 'computing' ? 'Unit' : 'Chapter'} {c.n}: {c.title}</h2><button className="g-pill" style={{ marginLeft: 'auto' }} onClick={() => go('book:' + c.id)}>Open chapter →</button></div>
          <div className="fm-grid">{FORMULAS[c.id].map((f, i) => <FormulaCard key={i} f={f} i={i} />)}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { FormulaCard, FormulaSheet, FormulaBook });
