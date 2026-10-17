/* Barbearia VIP Mercês: menu, links de WhatsApp, visor de fotos, galeria e lightbox. */
const WA = "5541987433333"; // confirme o número do WhatsApp da unidade
const msg = s => s ? `Olá! Gostaria de agendar: ${s}.` : "Olá! Gostaria de agendar um horário na Barbearia VIP Mercês.";
document.querySelectorAll("[data-wa]").forEach(a => {
    a.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg(a.dataset.wa))}`;
    a.target = "_blank";
    a.rel = "noopener";
    a.addEventListener("click", () => {
        try { // rastreamento: dispara se Meta Pixel / Google tag estiverem instalados
            window.fbq && fbq("track", "Contact");
            window.gtag && gtag("event", "whatsapp_click", {
                item: a.dataset.wa || "geral"
            });
        } catch (e) {}
    });
});
const nav = document.getElementById("nav"),
    mb = document.getElementById("mb");
mb.onclick = () => mb.setAttribute("aria-expanded", nav.classList.toggle("open"));
nav.onclick = e => {
    if (e.target.tagName === "A") {
        nav.classList.remove("open");
        mb.setAttribute("aria-expanded", "false")
    }
};
document.getElementById("y").textContent = new Date().getFullYear();

const vw = document.getElementById("vw"),
    its = [...document.querySelectorAll(".it")];

function show(it) {
    its.forEach(x => {
        x.classList.toggle("open", x === it);
        x.querySelector("button").setAttribute("aria-expanded", x === it)
    });
    const f = document.getElementById(it.querySelector("button").dataset.img);
    vw.classList.add("sw");
    setTimeout(() => {
        vw.src = f.src;
        vw.alt = f.alt;
        vw.classList.remove("sw")
    }, 200);
}
its.forEach(it => it.querySelector("button").onclick = () => show(it));
show(its[0]);
// galeria: filtro + lightbox
const chips = document.querySelectorAll(".chips button"),
    ph = [...document.querySelectorAll(".ph")];
chips.forEach(c => c.onclick = () => {
    chips.forEach(x => x.classList.toggle("on", x === c));
    ph.forEach(p => p.hidden = c.dataset.f !== "all" && p.dataset.c !== c.dataset.f)
});
const lb = document.getElementById("lb"),
    li = lb.querySelector("img"),
    lc = lb.querySelector(".cap");
let cur = 0;
const vis = () => ph.filter(p => !p.hidden);

function openLb(i) {
    const v = vis();
    cur = (i + v.length) % v.length;
    const im = v[cur].firstElementChild;
    li.src = im.src;
    li.alt = im.alt;
    lc.textContent = im.alt;
    if (!lb.open) lb.showModal()
}
ph.forEach(p => p.onclick = () => openLb(vis().indexOf(p)));
lb.querySelector(".pv").onclick = () => openLb(cur - 1);
lb.querySelector(".nx").onclick = () => openLb(cur + 1);
lb.querySelector(".x").onclick = () => lb.close();
lb.addEventListener("click", e => {
    if (e.target === lb) lb.close()
});
lb.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") openLb(cur - 1);
    if (e.key === "ArrowRight") openLb(cur + 1)
});
// "Aberto agora": horários da unidade (0 = domingo, sem expediente). Ajuste aqui se mudar.
const HORARIO = {1:[9,20],2:[9,20],3:[9,20],4:[9,20],5:[9,20],6:[9,19]};
const DIAS = ["domingo","segunda","terça","quarta","quinta","sexta","sábado"];
(function(){
  const n=new Date(new Date().toLocaleString("en-US",{timeZone:"America/Sao_Paulo"})),d=n.getDay(),h=n.getHours()+n.getMinutes()/60,t=HORARIO[d],el=document.getElementById("st");
  if(!el)return;
  if(t&&h>=t[0]&&h<t[1]){el.textContent="Aberto agora, fecha às "+t[1]+"h"}
  else{
    for(let i=(t&&h<t[0])?0:1;i<8;i++){const k=(d+i)%7;if(HORARIO[k]){el.textContent="Fechado agora, abre "+(i===0?"hoje":i===1?"amanhã":DIAS[k])+" às "+HORARIO[k][0]+"h";break}}
    el.classList.add("off");
  }
  el.hidden=false;
})();

// vídeo do topo: não carrega com economia de dados nem com animações reduzidas
const hv = document.querySelector(".hv");
const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches || (navigator.connection && navigator.connection.saveData);
if (hv && calmo) hv.remove();
// "Veja por dentro": tocam sem som ao aparecer na tela; ao tocar, abrem ampliados
const vcs = [...document.querySelectorAll(".vc")], vd = document.getElementById("vd"), vdv = vd.querySelector("video");
if (!calmo && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target.querySelector("video");
    if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
  }), {threshold: .7});
  vcs.forEach(c => io.observe(c));
}
vcs.forEach(c => c.onclick = () => { vdv.src = c.querySelector("source").src; vdv.play().catch(() => {}); vd.showModal(); });
vd.querySelector(".x").onclick = () => vd.close();
vd.addEventListener("click", e => { if (e.target === vd) vd.close(); });
vd.addEventListener("close", () => { vdv.pause(); vdv.removeAttribute("src"); vdv.load(); });

// ao trocar o filtro da galeria, volta para a primeira foto
chips.forEach(c => c.addEventListener("click", () => { document.querySelector(".gl").scrollLeft = 0; }));
