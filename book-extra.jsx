/* Extra figures for every section + stage reviews */
(() => {
const X = {
  /* ---------- SCIENCE ---------- */
  's1:1.1': [['labeldiag', { d: 'bloodcells' }, 'Blood cells under the microscope'], ['match', { h: ['Component', 'Function'], pairs: [['Red blood cell', 'Carries oxygen (haemoglobin)'], ['White blood cell', 'Fights pathogens'], ['Platelet', 'Helps blood clot'], ['Plasma', 'Transports nutrients, CO₂ and cells']] }, 'Match each part to its job']],
  's1:1.2': [['labeldiag', { d: 'resp' }, 'Respiratory system diagram'], ['belljar', {}, 'Bell jar model of breathing'], ['mito', {}, 'Aerobic respiration in mitochondria'], ['sort', { bins: ['Breathing', 'Respiration'], items: [['Moves air in and out of lungs', 0], ['Chemical reaction in cells', 1], ['Uses the diaphragm', 0], ['Releases energy from glucose', 1], ['Happens in mitochondria', 1], ['Physical process', 0]] }, 'Breathing vs respiration']],
  's1:1.3': [['labeldiag', { d: 'skeleton' }, 'The human skeleton'], ['sort', { bins: ['Hinge joint', 'Ball-and-socket joint'], items: [['Elbow', 0], ['Knee', 0], ['Shoulder', 1], ['Hip', 1], ['Finger joints', 0]] }, 'Classify the joints']],
  's2:2.1': [['plate', {}, 'Balanced diet plate'], ['labeldiag', { d: 'nutribody' }, 'What each nutrient does in the body'], ['foodtest', {}, 'Food tests lab'], ['match', { h: ['Deficiency', 'Disease'], pairs: [['Vitamin C', 'Scurvy (bleeding gums)'], ['Vitamin D / calcium', 'Rickets (weak bones)'], ['Iron', 'Anaemia (tiredness)'], ['Vitamin A', 'Night blindness'], ['Protein', 'Poor growth (kwashiorkor)']] }, 'Deficiency diseases']],
  's2:2.2': [['lifestyle', {}, 'Lifestyle & health dashboard'], ['energybal', {}, 'Energy balance: in vs used'], ['smoking', {}, 'Effects of smoking on the body']],
  's3:3.1': [['labeldiag', { d: 'pond' }, 'Pond ecosystem: habitats'], ['foodweb', {}, 'Food web: what if one species goes?'], ['sort', { bins: ['Biotic (living)', 'Abiotic (non-living)'], items: [['Predators', 0], ['Temperature', 1], ['Plants', 0], ['Sunlight', 1], ['Disease', 0], ['Water pH', 1], ['Soil minerals', 1]] }, 'Biotic & abiotic factors']],
  's3:3.2': [['order', { rounds: [{ p: 'Order the food chain from producer to top predator', items: ['Phytoplankton (producer)', 'Zooplankton', 'Small fish', 'Large fish', 'Osprey (top predator)'] }] }, 'Build the food chain'], ['foodweb', {}, 'Food web connections']],
  's3:3.3': [['match', { h: ['Invasive species', 'Problem caused'], pairs: [['Cane toad (Australia)', 'Poisons predators that eat it'], ['Grey squirrel (UK)', 'Out-competes red squirrels'], ['Water hyacinth (Africa)', 'Blocks light, kills fish'], ['Rats (islands)', 'Eat seabird eggs']] }, 'Real invasive species'], ['foodweb', {}, 'Ripple effects in a web']],
  's4:4.1': [['atomhist', {}, 'How the atomic model developed'], ['match', { h: ['Particle', 'Charge & position'], pairs: [['Proton', '+1, in the nucleus'], ['Neutron', '0, in the nucleus'], ['Electron', '−1, in shells around the nucleus']] }, 'Sub-atomic particles']],
  's4:4.2': [['rf', {}, 'Calculate Rf values'], ['labeldiag', { d: 'particles' }, 'Elements, compounds & mixtures']],
  's5:5.1': [['sort', { bins: ['More concentrated', 'More dilute'], items: [['Add more solute', 0], ['Add more water', 1], ['Evaporate some water', 0], ['Pour into a bigger volume of water', 1]] }, 'Concentrate or dilute?']],
  's5:5.2': [['crystal', {}, 'Crystallisation on cooling'], ['sort', { bins: ['Soluble', 'Insoluble'], items: [['Salt', 0], ['Sugar', 0], ['Sand', 1], ['Copper sulfate', 0], ['Chalk', 1], ['Oil', 1]] }, 'Soluble or insoluble in water?']],
  's6:6.1': [['reaction', {}, 'Particles rearranging in a reaction']],
  's6:6.2': [['labeldiag', { d: 'particles' }, 'Particle diagrams'], ['heatcurve', {}, 'Heating curve: pure vs mixture']],
  's6:6.3': [['tempgraph', {}, 'Temperature–time graph']],
  's6:6.4': [['energylevel', {}, 'Energy level diagrams'], ['sort', { bins: ['Exothermic', 'Endothermic'], items: [['Combustion', 0], ['Hand warmer', 0], ['Cold pack', 1], ['Neutralisation', 0], ['Photosynthesis', 1], ['Thermal decomposition', 1]] }, 'Classify the processes']],
  's6:6.5': [['displace', {}, 'Displacement reactions'], ['order', { rounds: [{ p: 'Order from most to least reactive', items: ['Potassium', 'Sodium', 'Calcium', 'Magnesium', 'Zinc', 'Iron', 'Copper', 'Silver', 'Gold'] }] }, 'Build the reactivity series']],
  's7:7.1': [['ruler', {}, 'Read the ruler (avoid parallax)']],
  's7:7.2': [['triangle3', {}, 'Speed formula triangle']],
  's7:7.3': [['walker', {}, 'Make a journey, see the graph']],
  's8:8.1': [['freebody', {}, 'Free-body force diagrams']],
  's8:8.2': [['lever', {}, 'Levers as force multipliers']],
  's8:8.3': [['pblock', {}, 'Same block, different faces'], ['triangle3', { f: { top: ['F', 'force', 'N'], l: ['p', 'pressure', 'Pa'], r: ['A', 'area', 'm²'], vals: { F: 600, p: 200, A: 3 } } }, 'Pressure formula triangle']],
  's8:8.4': [['liquidp', {}, 'Liquid pressure and depth']],
  's9:9.1': [['mirrorimg', {}, 'Image in a plane mirror']],
  's9:9.2': [['glassblock', {}, 'Light through a glass block']],
  's9:9.3': [['sort', { bins: ['Looks red', 'Looks black'], items: [['Red shirt in white light', 0], ['Red shirt in red light', 0], ['Red shirt in blue light', 1], ['White shirt in red light', 0], ['Green leaf in red light', 1]] }, 'What colour will it look?']],
  's10:10.1': [['magtest', {}, 'Test for magnetic materials']],
  's10:10.2': [['labeldiag', { d: 'bell' }, 'How an electric bell works'], ['match', { h: ['Use', 'Why an electromagnet'], pairs: [['Scrapyard crane', 'Switch off to drop metal'], ['Electric bell', 'Rapidly on and off'], ['Door lock', 'Locks when current flows'], ['MRI scanner', 'Very strong field']] }, 'Uses of electromagnets']],
  's11:11.1': [['climgraph', {}, 'Climate graphs: three places']],
  's11:11.2': [['labeldiag', { d: 'carbon' }, 'The carbon cycle']],
  's11:11.3': [['earthmag', {}, "Earth's magnetic field"], ['sort', { bins: ['Renewable', 'Non-renewable'], items: [['Wind', 0], ['Coal', 1], ['Solar', 0], ['Natural gas', 1], ['Tidal', 0], ['Oil', 1], ['Bioplastics', 0], ['Hydroelectric', 0]] }, 'Sort the resources']],
  's12:12.1': [['solarsys', {}, 'The solar system & asteroid belt']],
  's12:12.2': [['labeldiag', { d: 'galaxies' }, 'Types of galaxy']],
  /* ---------- MATHS ---------- */
  'm1:1.1': [['signgrid', {}, 'Multiplication sign pattern']],
  'm2:2.4': [['triangle3', { f: { top: ['C', 'circumference', 'cm'], l: ['π', 'pi', ''], r: ['d', 'diameter', 'cm'], vals: { C: 31.4, 'π': 3.14, d: 10 } } }, 'Circumference formula triangle']],
  'm3:3.1': [['tally', {}, 'Tally & frequency sheet']],
  'm4:4.1': [['hcf', {}, 'HCF & LCM Venn diagram']],
  'm4:4.2': [['numsets', {}, 'Number sets diagram']],
  'm5:5.3': [['algtiles', {}, 'Algebra tiles: like terms']],
  'm6:6.1': [['anglept', {}, 'Angles on a line & round a point']],
  'm11:11.1': [['triangle3', { f: { top: ['km', 'kilometres', ''], l: ['1.6', 'factor', ''], r: ['mi', 'miles', ''], vals: { km: 80, '1.6': 1.6, mi: 50 } } }, 'Conversion triangle']],
  'm12:12.1': [['probscale', {}, 'Probability scale']],
  'm13:13.1': [['exprtree', {}, 'Expression tree']],
  'm14:14.1': [['balance', { eqs: [[3, 6, 0, 21], [2, -2, 0, 14]] }, 'Balance model']],
  'm14:14.3': [['balance', { eqs: [[4, 7, 0, 31]] }, 'Solve your equation']],
  'm19:19.1': [['pctbar', {}, 'Compare using percentages']],
  'm22:22.3': [['ratiosimp', {}, 'Simplify the shares']],
  'm23:23.2': [['twolines', {}, 'Compare gradients']],
  'm24:24.2': [['stemleaf', {}, 'Ordered data']],
};
BOOK.forEach(ch => ch.secs.forEach(s => { const e = X[ch.id + ':' + s.n]; if (e) s.extra = e; }));

/* stage reviews for science */
const sci = BOOK.filter(c => c.subj === 'science');
const mkReview = (id, n, from, to, title) => {
  const chs = sci.filter(c => c.n >= from && c.n <= to);
  return { id, subj: 'science', n, title, strand: 'Review', review: true, codes: chs.flatMap(c => c.codes).slice(0, 4), secs: [],
    practice: chs.flatMap(c => c.practice.slice(0, 2)), challenge: chs.flatMap(c => c.challenge),
    recap: { points: chs.flatMap(c => c.recap.points.slice(0, 2)), terms: chs.flatMap(c => c.recap.terms.slice(0, 1)) } };
};
const reviews = [[3, mkReview('sr1', 'R1', 1, 3, 'End of stage review: Biology')], [6, mkReview('sr2', 'R2', 4, 6, 'End of stage review: Chemistry')], [10, mkReview('sr3', 'R3', 7, 10, 'End of stage review: Physics')], [12, mkReview('sr4', 'R4', 11, 12, 'End of stage review: Earth and space')]];
reviews.reverse().forEach(([after, r]) => { const i = BOOK.findIndex(c => c.subj === 'science' && c.n === after); BOOK.splice(i + 1, 0, r); });
})();
