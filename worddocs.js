/* Real .docx Word documents (open on iPhone, Android, Windows, Mac):
   question paper, answer key / mark scheme, and report card. Loads the docx library on demand. */
(function () {
  var libP = null;
  function lib() {
    if (window.docx && window.docx.Packer) return Promise.resolve(window.docx);
    if (libP) return libP;
    libP = new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = 'vendor/docx.iife.js?v=1';
      s.onload = function () { window.docx && window.docx.Packer ? ok(window.docx) : no(new Error('docx missing')); };
      s.onerror = function () { libP = null; no(new Error('Could not load Word library')); };
      document.head.appendChild(s);
    });
    return libP;
  }
  var SN = { maths: 'Maths', science: 'Science', computing: 'Computing', english: 'English', french: 'French' };
  function build(D, rec, which) {
    var P = D.Paragraph, T = D.TextRun, F = 'Calibri', INK = '2B2140';
    var r = function (t, o) { o = o || {}; return new T({ text: String(t == null ? '' : t), font: F, size: o.size || 22, bold: o.bold, italics: o.it, color: o.color || '1D1830' }); };
    var p = function (kids, o) { o = o || {}; return new P({ children: Array.isArray(kids) ? kids : [r(kids, o)], spacing: { after: o.after == null ? 120 : o.after, before: o.before || 0 }, alignment: o.align, keepNext: o.keepNext, indent: o.indent }); };
    var h = function (t, size, color) { return new P({ children: [new T({ text: t, font: F, size: size || 36, bold: true, color: color || INK })], spacing: { before: 120, after: 160 } }); };
    var br = function () { return new P({ children: [new D.PageBreak()] }); };
    var bd = { style: D.BorderStyle.SINGLE, size: 4, color: 'BBB4CC' };
    var cell = function (t, o) { o = o || {}; return new D.TableCell({ children: String(t == null ? '' : t).split('\n').map(function (x) { return p([r(x, { bold: o.bold, size: 20, color: o.color })], { after: 40 }); }), width: { size: o.w, type: D.WidthType.DXA }, shading: o.fill ? { type: D.ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined, margins: { top: 60, bottom: 60, left: 100, right: 100 }, borders: { top: bd, bottom: bd, left: bd, right: bd } }); };
    var table = function (head, rows, w) { return new D.Table({ width: { size: w.reduce(function (a, b) { return a + b; }, 0), type: D.WidthType.DXA }, columnWidths: w, rows: [new D.TableRow({ tableHeader: true, children: head.map(function (x, i) { return cell(x, { w: w[i], bold: true, color: 'FFFFFF', fill: INK }); }) })].concat(rows.map(function (row, ri) { return new D.TableRow({ children: row.map(function (x, i) { return cell(x, { w: w[i], fill: ri % 2 ? 'F6F3FB' : undefined }); }) }); })) }); };
    var subj = SN[rec.subj] || '';
    var top = p([r('Cambridge Lower Secondary · Stage 8 · ' + subj, { size: 18, color: '776F8A', bold: true })]);
    var out = [];
    var paper = function () {
      out.push(top, h(rec.unitName + ': Question paper'));
      out.push(p([r('Name: ______________________________     Class: __________     Date: ______________', { size: 22 })], { after: 160 }));
      out.push(p([r('Answer ALL questions. Write your answers in the spaces provided. Total: ' + rec.tot + ' marks. Time: ' + Math.round(rec.rows.length * 1.5) + ' minutes.', { it: true, size: 20, color: '5B5170' })], { after: 240 }));
      rec.rows.forEach(function (q) {
        out.push(p([r(q.n + '.  ', { bold: true }), r(q.q), r('     [' + q.marks + (q.marks > 1 ? ' marks]' : ' mark]'), { bold: true, color: '5B5170', size: 20 })], { keepNext: true, after: 80 }));
        if (q.type === 'mc' && q.opts) q.opts.forEach(function (o, k) { out.push(p([r('   ' + 'ABCD'[k] + ')  ' + o)], { after: 40, indent: { left: 360 } })); });
        else if (q.type === 'order' && q.items) { out.push(p([r('Put these in the correct order:', { it: true, size: 20 })], { after: 40, indent: { left: 360 } })); q.items.forEach(function (o) { out.push(p([r('   •  ' + o)], { after: 30, indent: { left: 360 } })); }); out.push(p('Answer: ____________________________________________', { indent: { left: 360 } })); }
        else out.push(p('Answer: ____________________________________________', { indent: { left: 360 } }));
        out.push(p('', { after: 120 }));
      });
    };
    var key = function (nb) {
      if (nb) out.push(br());
      out.push(top, h(rec.unitName + ': Answer key and mark scheme', 34, 'E2457A'));
      out.push(table(['Q', 'Correct answer', 'Working / explanation', 'Marks'], rec.rows.map(function (q) { return [String(q.n), (q.type === 'mc' && q.opts ? 'ABCD'[q.opts.indexOf(q.correct)] + ')  ' : '') + q.correct, (q.why || '') + (q.marks > 1 ? '\nAward 1 mark for a correct method or partly correct answer.' : ''), String(q.marks)]; }), [700, 2900, 4860, 900]));
      out.push(p([r('Total: ' + rec.tot + ' marks', { bold: true })], { before: 160 }));
    };
    var report = function (nb) {
      if (!rec.rows[0] || rec.rows[0].given == null) return;
      var ai = rec.ai || {};
      if (nb) out.push(br());
      out.push(top, h('Report card: ' + rec.unitName, 34));
      out.push(p([r('Student: ', { bold: true }), r(rec.student || ''), r(rec.cls ? '     Class: ' : '', { bold: true }), r(rec.cls || ''), r('     Date: ', { bold: true }), r(new Date(rec.date).toLocaleDateString())]));
      out.push(table(['Marks', 'Score', 'Grade', 'Effort'], [[rec.got + ' / ' + rec.tot, rec.pct + '%', rec.grade || '', ai.effort || '-']], [2340, 2340, 2340, 2340]));
      out.push(p([r("Examiner's comment", { bold: true, size: 24 })], { before: 200 }), p(ai.summary || ''));
      out.push(p([r('Strengths', { bold: true, size: 24 })], { before: 120 })); (ai.strengths || []).forEach(function (x) { out.push(p('•  ' + x, { indent: { left: 240 }, after: 40 })); });
      out.push(p([r('Next steps', { bold: true, size: 24 })], { before: 120 })); (ai.targets || []).forEach(function (x) { out.push(p('•  ' + x, { indent: { left: 240 }, after: 40 })); });
      out.push(p([r('Your answers', { bold: true, size: 24 })], { before: 200 }));
      out.push(table(['Q', 'Your answer', 'Correct answer', 'Feedback', 'Marks'], rec.rows.map(function (q) { return [String(q.n), String(q.given), String(q.correct), ((ai.perQuestion || {})[q.n]) || (q.got === q.marks ? 'Correct.' : (q.why || '')), q.got + '/' + q.marks]; }), [600, 2000, 2000, 3860, 900]));
      out.push(p('Teacher signature: ____________________          Parent signature: ____________________', { before: 360 }));
    };
    if (which === 'paper') paper();
    else if (which === 'key') key(false);
    else if (which === 'report') report(false);
    else if (which === 'blank') { paper(); key(true); }
    else { paper(); key(true); report(true); }
    return new D.Document({ creator: 'Stage 8 framework', title: rec.unitName, styles: { default: { document: { run: { font: F, size: 22 } } } }, sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } }, footers: { default: new D.Footer({ children: [new P({ alignment: D.AlignmentType.CENTER, children: [new T({ children: ['Page ', D.PageNumber.CURRENT, ' of ', D.PageNumber.TOTAL_PAGES], font: F, size: 16, color: '9A92AD' })] })] }) }, children: out }] });
  }
  function save(blob, name) {
    var file = null; try { file = new File([blob], name, { type: blob.type }); } catch (e) {}
    var isTouch = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isTouch && file && navigator.canShare && navigator.canShare({ files: [file] })) { return navigator.share({ files: [file], title: name }).catch(function () { dl(); }); }
    dl();
    function dl() { var u = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = u; a.download = name; a.rel = 'noopener'; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); URL.revokeObjectURL(u); }, 4000); }
  }
  var NAMES = { paper: 'question-paper', key: 'answer-key', report: 'report-card', blank: 'question-paper-and-answer-key', all: 'paper-answer-key-and-report' };
  async function wordDoc(rec, which) {
    var toast = window.GAME && GAME.toast; toast && toast('Preparing your Word document…');
    try {
      var D = await lib();
      var blob = await D.Packer.toBlob(build(D, rec, which));
      var name = String(rec.unitName).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') + '-' + (NAMES[which] || 'paper') + '.docx';
      save(blob, name); toast && toast('Word document ready: ' + name);
    } catch (e) { console.error(e); alert('Sorry, the Word document could not be created: ' + e.message + '. Please check your internet connection and try again.'); }
  }
  window.wordDoc = wordDoc;
})();
