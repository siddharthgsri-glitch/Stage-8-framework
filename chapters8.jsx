/* Stage 8 interactive chapters. topicId links to curriculum8.js */

const CHAPTERS8 = [
  {
    id: 'ymxc', stage: 8, subject: 'maths', num: 'M · Algebra', live: true, topicId: 'maths-algebra-sequences-functions-and-graphs',
    title: 'Straight-line graphs: y = mx + c',
    desc: 'Change the gradient and intercept and watch the line move.',
    codes: ['8As.05', '8As.06'],
    play: {
      kind: 'linear',
      heading: 'Steer the line',
      intro: 'Use the controls to change m and c. The dot shows where the line crosses the y-axis. The small triangle shows how far the line goes up for every 1 step to the right.',
      tasks: [
        { t: 'Make the line slope downwards', test: s => s.m < 0 },
        { t: 'Make a flat, horizontal line', test: s => s.m === 0 },
        { t: 'Make the line cross the y-axis at 3', test: s => s.c === 3 && s.m !== 0 },
        { t: 'Draw y = 2x − 1', test: s => s.m === 2 && s.c === -1 },
      ],
    },
    notice: {
      Figure: () => (
        <div className="mini3">
          {[[{ m: 2, c: 1 }, 'm = 2, steep'], [{ m: 0.5, c: 1 }, 'm = ½, gentle'], [{ m: -1, c: 1 }, 'm = −1, downhill']].map(([f, cap], i) => (
            <div key={i}><LinearGraph fixed={f} compact /><div className="cap">{cap}</div></div>
          ))}
        </div>
      ),
      heading: 'What you just found',
      lines: [
        <><b>m is the gradient</b>: how far the line rises for every 1 step to the right. If m is negative, the line slopes down.</>,
        <><b>c is the y-intercept</b>: the point where the line crosses the y-axis, at (0, c).</>,
        <>Lines with <b>the same gradient are parallel</b>. Changing c slides the line up or down without turning it.</>,
      ],
    },
    check: [
      { type: 'mc', q: 'What is the gradient of y = 4x − 3?', opts: ['−3', '4', '3', '1'], a: 1, why: 'In y = mx + c, m is the number multiplying x. Here m = 4.' },
      { type: 'mc', q: 'Where does y = 2x + 5 cross the y-axis?', opts: ['(5, 0)', '(0, 2)', '(0, 5)', '(2, 5)'], a: 2, why: 'On the y-axis x = 0, so y = 2(0) + 5 = 5. The point is (0, 5).' },
      { type: 'mc', q: 'Which line is parallel to y = 3x + 1?', opts: ['y = x + 3', 'y = 3x − 4', 'y = −3x + 1', 'y = 1x + 3'], a: 1, why: 'Parallel lines have the same gradient. Only y = 3x − 4 also has m = 3.' },
    ],
    practice: [
      { type: 'input', q: 'For y = 3x + 2, find y when x = 4.', accept: ['14'], why: 'y = 3 × 4 + 2 = 12 + 2 = 14.' },
      { type: 'input', q: 'What is the y-intercept of y = −2x + 7?', accept: ['7', '(0,7)'], why: 'c = 7, so the line crosses the y-axis at (0, 7).' },
      { type: 'mc', q: 'Which line slopes downwards from left to right?', opts: ['y = 2x', 'y = x + 5', 'y = −x + 2', 'y = 4'], a: 2, why: 'A negative gradient means the line goes down. Only y = −x + 2 has m < 0.' },
      { type: 'mc', q: 'A line passes through (0, 1) and (2, 5). What is its equation?', opts: ['y = 2x + 1', 'y = 4x + 1', 'y = x + 2', 'y = 2x + 5'], a: 0, why: 'The intercept is 1. y goes up 4 while x goes up 2, so m = 4 ÷ 2 = 2.' },
      { type: 'input', q: 'The point (k, 11) lies on y = 2x + 3. Find k.', accept: ['4'], why: '11 = 2k + 3 → 2k = 8 → k = 4.' },
    ],
    challenge: [
      { type: 'mc', marks: 1, q: 'A taxi charges a fixed fee plus a cost per km. The graph of cost (y) against distance (x) is y = 1.5x + 4. What does the 4 represent?', opts: ['Cost per km', 'The fixed fee', 'Distance travelled', 'Total cost'], a: 1, why: 'At x = 0 km the cost is 4, which is the fixed charge before any distance. The 1.5 is the cost per km.' },
      { type: 'input', marks: 1, q: 'Lines y = 2x + 1 and y = −x + 7 intersect. Find the x-coordinate of the intersection.', accept: ['2'], why: 'Set 2x + 1 = −x + 7 → 3x = 6 → x = 2.' },
      { type: 'mc', marks: 1, q: 'Leo says "y = 5 − 2x has a gradient of 5." Is he right?', opts: ['Yes', 'No, the gradient is −2', 'No, the gradient is 2', 'No, the gradient is −5'], a: 1, why: 'Rewrite it as y = −2x + 5. The gradient is the coefficient of x, which is −2.' },
    ],
    recap: {
      points: ['y = mx + c is the equation of a straight line.', 'm is the gradient: rise for each 1 step to the right. Negative m slopes down.', 'c is the y-intercept, the point (0, c).', 'Parallel lines have equal gradients.'],
      terms: [['Gradient', 'Steepness of a line: change in y ÷ change in x.'], ['y-intercept', 'Where a graph crosses the y-axis.'], ['Linear function', 'A function whose graph is a straight line.']],
    },
  },
  {
    id: 'moments', stage: 8, subject: 'science', num: 'S · Physics', live: true, topicId: 'science-physics-forces-and-energy',
    title: 'Turning forces: moments',
    desc: 'Balance a see-saw using weights and distances.',
    codes: ['8Pf.04'],
    play: {
      kind: 'moments',
      heading: 'Balance the beam',
      intro: 'Change each weight and how far it sits from the pivot. Watch which way the beam tips, and compare the two moments underneath.',
      tasks: [
        { t: 'Make the beam tip to the right (clockwise)', test: s => !!s.L && s.mR > s.mL },
        { t: 'Balance it with equal weights', test: s => !!s.L && s.mL === s.mR && s.L.F === s.R.F },
        { t: 'Balance it with different weights', test: s => !!s.L && s.mL === s.mR && s.L.F !== s.R.F },
        { t: 'Balance 60 N on one side using a smaller weight', test: s => !!s.L && s.mL === s.mR && ((s.L.F === 60 && s.R.F < 60) || (s.R.F === 60 && s.L.F < 60)) },
      ],
    },
    notice: {
      Figure: () => (
        <div style={{ display: 'grid', gap: 10 }}>
          <MomentsBeam fixed={{ L: { F: 40, d: 1 }, R: { F: 20, d: 2 } }} compact />
          <div className="cap" style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>40 N × 1 m = 20 N × 2 m, so the beam balances</div>
        </div>
      ),
      heading: 'What you just found',
      lines: [
        <>A <b>moment</b> is the turning effect of a force: <b>moment = force × distance</b> from the pivot, measured in Nm.</>,
        <>A beam balances when <b>clockwise moments = anticlockwise moments</b>. This is the principle of moments.</>,
        <>A <b>small force far from the pivot</b> can balance a big force close to it. That is how spanners and levers work.</>,
      ],
    },
    check: [
      { type: 'mc', q: 'A 10 N force acts 3 m from a pivot. What is the moment?', opts: ['13 Nm', '30 Nm', '3.3 Nm', '7 Nm'], a: 1, why: 'Moment = force × distance = 10 × 3 = 30 Nm.' },
      { type: 'mc', q: 'Why is it easier to open a door by pushing far from the hinge?', opts: ['The door is lighter there', 'A larger distance gives a bigger moment for the same force', 'Friction is lower there', 'The hinge pushes back less'], a: 1, why: 'Moment = F × d. A bigger d means you need less force to get the same turning effect.' },
      { type: 'mc', q: 'What is the unit of a moment?', opts: ['N', 'N/m', 'Nm', 'm/s'], a: 2, why: 'Force (N) × distance (m) gives newton-metres, Nm.' },
    ],
    practice: [
      { type: 'input', q: 'A 25 N weight sits 4 m from a pivot. Calculate its moment.', suffix: 'Nm', accept: ['100'], why: '25 × 4 = 100 Nm.' },
      { type: 'input', q: 'A 60 N child sits 2 m from the pivot of a see-saw. How far from the pivot must a 40 N child sit to balance?', suffix: 'm', accept: ['3'], why: '60 × 2 = 120 Nm. 120 ÷ 40 = 3 m.' },
      { type: 'mc', q: 'Clockwise moment = 50 Nm, anticlockwise = 35 Nm. What happens?', opts: ['Balances', 'Turns clockwise', 'Turns anticlockwise', 'Nothing can be said'], a: 1, why: 'The larger moment wins, so it turns clockwise.' },
      { type: 'input', q: 'A spanner 0.2 m long needs a moment of 8 Nm to undo a nut. What force is needed?', suffix: 'N', accept: ['40'], why: 'F = moment ÷ distance = 8 ÷ 0.2 = 40 N.' },
      { type: 'mc', q: 'Which change would make the same nut easier to undo?', opts: ['A shorter spanner', 'A longer spanner', 'Pushing nearer the nut', 'A heavier nut'], a: 1, why: 'A longer spanner increases d, so less force is needed for the same moment.' },
    ],
    challenge: [
      { type: 'input', marks: 1, q: 'A uniform plank balances on a pivot. 30 N is placed 2 m left of the pivot and 20 N is placed x m right of it. Find x.', suffix: 'm', accept: ['3'], why: '30 × 2 = 60 Nm. 20 × x = 60, so x = 3 m.' },
      { type: 'mc', marks: 1, q: 'Wheelbarrows place the load close to the wheel. Using moments, explain why.', opts: ['It makes the load lighter', 'The load\'s moment about the wheel is small, so less lifting force is needed at the handles', 'It increases friction', 'The wheel carries all the weight'], a: 1, why: 'The wheel is the pivot. A small distance gives a small moment from the load, so the moment needed at the handles is small too.' },
      { type: 'mc', marks: 1, q: 'Two students push on opposite sides of a door with 20 N each. Ana is 0.8 m from the hinge, Ben is 0.5 m. Which way does the door turn?', opts: ['Towards Ben\'s side (Ana wins)', 'Towards Ana\'s side (Ben wins)', 'It does not move', 'It depends on the door\'s mass'], a: 0, why: 'Ana: 20 × 0.8 = 16 Nm. Ben: 20 × 0.5 = 10 Nm. Ana\'s moment is bigger.' },
    ],
    recap: {
      points: ['Moment = force × perpendicular distance from the pivot (Nm).', 'Balanced when total clockwise moment = total anticlockwise moment.', 'Increasing distance increases the moment, so less force is needed.', 'Levers, spanners, see-saws and doors all use moments.'],
      terms: [['Pivot', 'The point something turns about.'], ['Moment', 'Turning effect of a force.'], ['Principle of moments', 'In balance, clockwise = anticlockwise moments.']],
    },
  },
  {
    id: 'sentences', stage: 8, subject: 'english', num: 'E · Writing', live: true, topicId: 'english-writing-grammar-and-punctuation',
    title: 'Sentence types for effect',
    desc: 'Build simple, compound, complex and compound-complex sentences.',
    codes: ['8Wg.02', '8Rg.02'],
    play: {
      kind: 'sentences',
      heading: 'Build the sentence',
      intro: 'Start with one main clause. Add clauses with connectives, move them around, and watch how the sentence type changes.',
      tasks: [
        { t: 'Make a compound sentence', test: s => s.type === 'Compound' },
        { t: 'Make a complex sentence', test: s => s.type === 'Complex' },
        { t: 'Put the subordinate clause at the front', test: s => s.front },
        { t: 'Make a compound-complex sentence', test: s => s.type === 'Compound-complex' },
      ],
    },
    notice: {
      Figure: () => <SentenceBuilder fixed={{ co: 'so', su: 'when', front: true }} />,
      heading: 'What you just found',
      lines: [
        <><b>Compound</b>: two main clauses joined by <i>and, but, so, or</i>. Each clause could stand alone.</>,
        <><b>Complex</b>: a main clause plus a <b>subordinate clause</b> (<i>when, because, although…</i>) that cannot stand alone.</>,
        <>Moving the subordinate clause <b>to the front</b> delays the main idea and builds tension. Use a comma after it.</>,
      ],
    },
    check: [
      { type: 'mc', q: 'What type is: "The bell rang and everyone left."?', opts: ['Simple', 'Compound', 'Complex', 'Compound-complex'], a: 1, why: 'Two main clauses joined by "and" make a compound sentence.' },
      { type: 'mc', q: 'Which is the subordinate clause in "Although it was late, we kept walking."?', opts: ['we kept walking', 'Although it was late', 'it was late, we', 'kept walking'], a: 1, why: '"Although it was late" cannot stand alone, so it is subordinate.' },
      { type: 'mc', q: 'Why might a writer use a very short simple sentence after several long ones?', opts: ['To save space', 'To create sudden impact or tension', 'Because it is more formal', 'To list items'], a: 1, why: 'A sudden short sentence breaks the rhythm and draws attention, which suits a dramatic moment.' },
    ],
    practice: [
      { type: 'mc', q: '"When the lights went out, Sam screamed and Mia laughed." What type is this?', opts: ['Simple', 'Compound', 'Complex', 'Compound-complex'], a: 3, why: 'It has two main clauses (Sam screamed / Mia laughed) and one subordinate clause (When the lights went out).' },
      { type: 'mc', q: 'Which word starts a subordinate clause?', opts: ['and', 'but', 'because', 'so'], a: 2, why: '"Because" is a subordinating conjunction. The others join main clauses.' },
      { type: 'mc', q: 'Where should the comma go? "If you finish early you can read quietly."', opts: ['After "If"', 'After "early"', 'After "can"', 'No comma needed'], a: 1, why: 'When a subordinate clause comes first, put a comma after it: "If you finish early, …"' },
      { type: 'mc', q: 'Which sentence is simple?', opts: ['The fox ran because it was scared.', 'The tired old fox ran across the frozen field.', 'The fox ran and the dog chased.', 'Although tired, the fox ran.'], a: 1, why: 'It has only one clause (one verb, "ran"), even though it is long.' },
      { type: 'input', q: 'Type the coordinating conjunction in: "I wanted to go, but it was raining."', accept: ['but'], why: '"But" joins two main clauses and shows contrast.' },
    ],
    challenge: [
      { type: 'mc', marks: 1, quote: 'He waited. The footsteps came closer, slower, heavier. Then silence.', q: 'How does the writer use sentence length for effect?', opts: ['Long sentences to explain the setting', 'Short and minor sentences build tension and suspense', 'Compound sentences to add detail', 'Questions to involve the reader'], a: 1, why: 'Very short sentences and the minor sentence "Then silence." slow the pace and build suspense.' },
      { type: 'mc', marks: 1, q: 'Which rewrite moves the subordinate clause to the front correctly?', quote: 'The crowd cheered as the runner crossed the line.', opts: ['As the runner crossed the line the crowd cheered.', 'As the runner crossed the line, the crowd cheered.', 'The crowd, as the runner crossed the line cheered.', 'The crowd cheered, as, the runner crossed the line.'], a: 1, why: 'A fronted subordinate clause is followed by a comma.' },
      { type: 'mc', marks: 1, q: 'Why might a report writer use complex sentences?', opts: ['To make the text shorter', 'To show cause and effect clearly, e.g. "because", "which means"', 'To sound informal', 'To avoid punctuation'], a: 1, why: 'Subordinate clauses show how ideas link, such as reasons, conditions and results, which suits formal explanation.' },
    ],
    recap: {
      points: ['Simple: one main clause. Compound: two main clauses joined by a coordinating conjunction.', 'Complex: main clause + subordinate clause. Compound-complex: two main + at least one subordinate.', 'Fronting a subordinate clause changes emphasis. Follow it with a comma.', 'Vary sentence length and type to control pace and effect.'],
      terms: [['Main clause', 'Makes sense on its own.'], ['Subordinate clause', 'Adds information; cannot stand alone.'], ['Connective', 'A word that links ideas: and, because, however…']],
    },
  },
];
window.CHAPTERS8 = CHAPTERS8;
