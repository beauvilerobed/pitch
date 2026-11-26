// Opens the traffic demand calculator in a popup instead of a new page.
// Any link to calculator.html on the page opens it; the full page still works on its own.
(function () {
    var links = document.querySelectorAll('a[href="calculator.html"], a[href^="calculator.html?"]');
    if (!links.length || !window.HTMLDialogElement) { return; }

    var style = document.createElement('style');
    style.textContent = [
        '.calc-pop { margin: auto; padding: 0; border: 1px solid #ccd5df; background: #fff; color: #0f1a2b;',
        '  width: min(880px, calc(100vw - 32px)); height: min(820px, calc(100vh - 32px)); height: min(820px, calc(100dvh - 32px));',
        '  max-width: none; max-height: none;',
        '  overflow: hidden; font-family: Inter, Helvetica, Arial, sans-serif; }',
        '.calc-pop[open] { display: flex; flex-direction: column; animation: calc-pop-in 0.28s cubic-bezier(0.2, 0.8, 0.2, 1); }',
        '.calc-pop.closing { animation: calc-pop-out 0.2s ease forwards; }',
        '.calc-pop::backdrop { background: rgba(15, 26, 43, 0.6); }',
        '.calc-pop[open]::backdrop { animation: calc-fade-in 0.28s ease; }',
        '.calc-pop.closing::backdrop { animation: calc-fade-out 0.2s ease forwards; }',
        '.calc-pop-head { flex: none; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 18px 24px; border-bottom: 1px solid #e2e8f0; }',
        '.calc-pop-head h2 { font-size: 1.15rem; font-weight: 700; line-height: 1.3; letter-spacing: -0.01em; margin: 0; }',
        '.calc-pop-head p { margin: 2px 0 0; font-size: 0.88rem; line-height: 1.5; color: #475569; }',
        '.calc-pop-close { flex: none; background: none; border: 0; padding: 0 2px; font-size: 1.6rem; line-height: 1; color: #64748b; cursor: pointer; transition: color 0.2s ease; }',
        '.calc-pop-close:hover { color: #0f1a2b; }',
        '.calc-pop iframe { flex: 1 1 auto; display: block; width: 100%; border: 0; background: #fff; }',
        '@keyframes calc-pop-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }',
        '@keyframes calc-pop-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(8px); } }',
        '@keyframes calc-fade-in { from { opacity: 0; } to { opacity: 1; } }',
        '@keyframes calc-fade-out { from { opacity: 1; } to { opacity: 0; } }',
        '@media (max-width: 640px) { .calc-pop { width: 100vw; height: 100vh; height: 100dvh; border: 0; } .calc-pop-head { padding: 14px 16px; } }',
        '@media (prefers-reduced-motion: reduce) { .calc-pop[open], .calc-pop.closing, .calc-pop[open]::backdrop, .calc-pop.closing::backdrop { animation: none; } }'
    ].join('\n');
    document.head.appendChild(style);

    var dlg = document.createElement('dialog');
    dlg.className = 'calc-pop';
    dlg.setAttribute('aria-labelledby', 'calc-pop-title');
    dlg.innerHTML = '<div class="calc-pop-head"><div><h2 id="calc-pop-title">Estimate Traffic Demand</h2>'
        + '<p>The calculator is complimentary. Enter an address and get a daily car count with a likely range (25th-75th percentile).</p></div>'
        + '<button type="button" class="calc-pop-close" aria-label="Close">&times;</button></div>';
    document.body.appendChild(dlg);

    var frame = null, root = document.documentElement, overflow = '';
    function open() {
        if (!frame) {   // load the app on first open, then keep it so progress survives closing
            var ref = new URLSearchParams(location.search).get('ref');
            frame = document.createElement('iframe');
            frame.title = 'Traffic demand calculator';
            frame.src = 'calculator.html?embed=1' + (ref ? '&ref=' + encodeURIComponent(ref) : '');
            dlg.appendChild(frame);
        }
        overflow = root.style.overflow; root.style.overflow = 'hidden';
        dlg.classList.remove('closing');
        dlg.showModal();
    }
    function close() {
        if (!dlg.open || dlg.classList.contains('closing')) { return; }
        var done = function () { dlg.classList.remove('closing'); dlg.close(); root.style.overflow = overflow; };
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return done(); }
        dlg.classList.add('closing');
        dlg.addEventListener('animationend', done, { once: true });
    }

    links.forEach(function (a) {
        a.addEventListener('click', function (e) {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }   // new tab still opens the page
            e.preventDefault();
            open();
        });
    });
    dlg.querySelector('.calc-pop-close').addEventListener('click', close);
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) { close(); } });   // click on the backdrop
    window.addEventListener('message', function (e) {
        if (frame && e.source === frame.contentWindow && e.data === 'calc-close') { close(); }
    });
})();
