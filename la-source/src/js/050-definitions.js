/* ---------- définitions ---------- */
const GRID = 9, SRC = { x: 4, y: 4 };
const TW = 92, TH = 46;

const BT = {
  extracteur: {
    nm: "Extracteur de matériaux", ic: "⛏", col: "#4ef2e0", base: 15, conso: 5, mAt: 3,
    ds: "Fore la croûte de la planète mère.",
    game: "Regex Invaders",
  },
  centrale: {
    nm: "Centrale énergétique", ic: "⚡", col: "#ffc857", base: 40, conso: 0, mAt: 7,
    ds: "Alimente l'infrastructure.",
    game: null,
  },
  entrepot: {
    nm: "Entrepôt de matériaux", ic: "🗄", col: "#ff7a1a", base: 30, conso: 4, mAt: 6,
    ds: "Stocke les matériaux.",
    game: null,
  },
  serveur: {
    nm: "Serveur", ic: "🖥", col: "#38a9ff", base: 60, conso: 8, mAt: 13,
    ds: "Calcule les données (Eo) : la première machine de la colonie.",
    game: "Admin Rush",
  },
  ferme: {
    /* VERROUILLÉE POUR LE MOMENT (décision du propriétaire, 15/08) : le Serveur
       prend TOUTE sa place dans le jeu. La définition reste — le parc de
       serveurs a vocation à revenir quand une seule machine ne suffira plus —
       mais `mAt: 999` la met hors d'atteinte : aucune mission n'allant si loin,
       elle ne s'affiche jamais dans la palette. Pour la rouvrir un jour, il
       suffira de lui redonner un rang de mission atteignable. */
    nm: "Ferme de serveurs", ic: "🖥", col: "#38a9ff", base: 260, conso: 22, mAt: 999,
    ds: "Un parc entier de serveurs : bien plus de Données qu'une machine.",
    game: "Admin Rush",
  },
  datacenter: {
    nm: "Datacenter", ic: "💾", col: "#a06bff", base: 50, conso: 6, mAt: 15,
    ds: "Conserve les données.",
    game: null,
  },
  reseau: {
    nm: "Baie réseau", ic: "📡", col: "#57e389", base: 90, eo: 15, conso: 5, tech: "dns", mAt: 19,
    ds: "Contrats de matériaux du réseau galactique.",
    game: "The Flux",
  },
  forge: {
    nm: "Forge d'assemblage", ic: "🔧", col: "#ff9a4d", base: 100, conso: 6, mAt: 22,
    ds: "Assemble les unités.",
    game: null,
  },
  console: {
    nm: "Console de commandement", ic: "🖲", col: "#e6eef5", base: 120, eo: 10, conso: 5, mAt: 21,
    ds: "PowerShell : +4 % de production par niveau.",
    game: "PowerShell Hero",
  },
  coffret: {
    nm: "Hub réseau", ic: "🧰", col: "#e8a24d", base: 10, conso: 1, mAt: 1,
    ds: "HUB-01 : 4 ports pour câbler la colonie naissante.",
    game: null,
  },
  switchhub: {
    nm: "Switch réseau", ic: "🔀", col: "#57e389", base: 30, conso: 2, mAt: 10,
    ds: "Commute les trames : 8 ports pour relier tes machines.",
    game: null,
  },
  // — chapitre 🛡 Colonie avancée : tout le roster du propriétaire, ouvert
  //   une fois la chaîne de missions terminée (aucun impact sur le tutoriel) —
  miniere: {
    nm: "Foreuse profonde", ic: "⛏", col: "#ffc857", base: 300, conso: 10, mAt: 26,
    ds: "Fore la roche-mère : bien plus de matériaux qu'un Extracteur.",
    game: null,
  },
  coffrefort: {
    nm: "Coffre blindé", ic: "🗄", col: "#ff7a1a", base: 260, conso: 6, mAt: 26,
    ds: "Réserve scellée : une grosse capacité de matériaux.",
    game: null,
  },
  chantier: {
    nm: "Chantier spatial", ic: "🚀", col: "#4ef2e0", base: 400, eo: 20, conso: 12, mAt: 26,
    ds: "Assemble les vaisseaux de la colonie.",
    game: null,
  },
  hangar: {
    nm: "Hangar de chasse", ic: "🛩", col: "#38a9ff", base: 320, eo: 10, conso: 8, mAt: 26,
    ds: "Abrite les chasseurs qui défendent la colonie.",
    game: null,
  },
  transport: {
    nm: "Aire de transport", ic: "🚚", col: "#e8a24d", base: 280, conso: 6, mAt: 26,
    ds: "Fait circuler les cargaisons entre les colonies.",
    game: null,
  },
  tour: {
    nm: "Tour de guet", ic: "📡", col: "#57e389", base: 240, conso: 5, mAt: 26,
    ds: "Voit venir les parasites de loin.",
    game: null,
  },
  tourelle: {
    nm: "Tourelle", ic: "🔫", col: "#ff4d8a", base: 220, conso: 6, mAt: 26,
    ds: "Tire sur les parasites qui approchent.",
    game: null,
  },
  missiles: {
    nm: "Batterie de missiles", ic: "🚀", col: "#ff4d8a", base: 360, eo: 10, conso: 9, mAt: 26,
    ds: "Frappe lourde contre les intrusions.",
    game: null,
  },
  bouclier: {
    nm: "Dôme de bouclier", ic: "🛡", col: "#38a9ff", base: 420, eo: 20, conso: 14, mAt: 26,
    ds: "Un champ de force au-dessus de la colonie.",
    game: null,
  },
  citadelle: {
    nm: "Citadelle", ic: "🏰", col: "#e6eef5", base: 500, eo: 25, conso: 15, mAt: 26,
    ds: "Le cœur fortifié : la colonie tient debout.",
    game: null,
  },
  bastion: {
    nm: "Bastion", ic: "🛡", col: "#a06bff", base: 550, eo: 30, conso: 16, mAt: 26,
    ds: "Poste avancé blindé, pensé pour encaisser.",
    game: null,
  },
  sentinelle: {
    nm: "Sentinelle", ic: "👁", col: "#57e389", base: 300, eo: 15, conso: 8, mAt: 26,
    ds: "Surveille le réseau et signale les anomalies.",
    game: null,
  },
  revocation: {
    nm: "Station de révocation", ic: "🔑", col: "#a06bff", base: 480, eo: 30, conso: 12, mAt: 26,
    ds: "Révoque les accès compromis — la sécurité, en vrai.",
    game: null,
  },
  dhcpsrv: {
    nm: "Serveur DHCP", ic: "🪪", col: "#38a9ff", base: 40, eo: 5, conso: 3, mAt: 16,
    ds: "Attribue une adresse IP à chaque machine raccordée.",
    game: null,
  },
};
const UT = {
  recolteur: { nm: "Drone ouvrier", ic: "🛸", cost: 80, ceo: 0,
    ds: "Récolte un champ de cristaux (+36 💠/min)." },
  chasseur: { nm: "Chasseur", ic: "🚀", cost: 120, ceo: 5,
    ds: "Élimine les parasites (tape-les)." },
};
/* pictos SVG (style charte : trait fin, couleur du bâtiment) */
const svgIc = (paths, col) =>
  "<svg class='pic' viewBox='0 0 24 24' fill='none' stroke='" + col + "' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'>" + paths + "</svg>";
const IC_PATHS = {
  extracteur: "<path d='M12 3v8'/><path d='M8.5 8L12 11.5 15.5 8'/><path d='M4 20h16'/><path d='M8 14.5L6 20M16 14.5l2 5.5'/><path d='M9.5 14.5h5'/>",
  centrale: "<circle cx='12' cy='12' r='8.5'/><path d='M13.2 6.5l-4.4 6.5h3l-1 4.5 4.4-6.5h-3z'/>",
  entrepot: "<path d='M4 9.5L12 4l8 5.5V20H4z'/><path d='M9 20v-6.5h6V20'/>",
  ferme: "<rect x='5.5' y='4' width='13' height='16' rx='2'/><path d='M9 8.5h4M9 12h6M9 15.5h5'/><circle cx='15.6' cy='8.5' r='.8'/>",
  datacenter: "<ellipse cx='12' cy='6.5' rx='6.5' ry='2.8'/><path d='M5.5 6.5V17.5c0 1.55 2.9 2.8 6.5 2.8s6.5-1.25 6.5-2.8V6.5'/><path d='M5.5 12c0 1.55 2.9 2.8 6.5 2.8s6.5-1.25 6.5-2.8'/>",
  reseau: "<circle cx='12' cy='17.5' r='1.6'/><path d='M8.6 14.2a4.8 4.8 0 0 1 6.8 0'/><path d='M5.8 11.2a8.8 8.8 0 0 1 12.4 0'/>",
  console: "<rect x='3.5' y='5' width='17' height='14' rx='2'/><path d='M7 10l3 2.3L7 14.8'/><path d='M12.5 15h4.5'/>",
  forge: "<circle cx='12' cy='12' r='3.2'/><path d='M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.7 6.7l1.4 1.4M15.9 15.9l1.4 1.4M6.7 17.3l1.4-1.4M15.9 8.1l1.4-1.4'/>",
  coffret: "<rect x='4' y='7' width='16' height='11' rx='2'/><path d='M4 11.5h16'/><path d='M7.5 15h.01M10.5 15h.01M13.5 15h.01'/><path d='M9 7V5.2h6V7'/>",
  switchhub: "<rect x='3.5' y='8' width='17' height='8' rx='2'/><path d='M6.8 12h.01M9.8 12h.01M12.8 12h.01'/><path d='M16.4 10.4l2 1.6-2 1.6'/>",
  dhcpsrv: "<rect x='4' y='6' width='16' height='12' rx='2'/><path d='M7.5 10.5h4.5M7.5 14h6.5'/><circle cx='16.3' cy='10.5' r='1.3'/>",
};
for (const k in IC_PATHS) if (BT[k]) BT[k].ic = svgIc(IC_PATHS[k], BT[k].col);
UT.recolteur.ic = svgIc("<circle cx='12' cy='13.5' r='3'/><path d='M4.5 7.5h5M14.5 7.5h5M7 7.5l3.2 3.6M17 7.5l-3.2 3.6'/>", "#4ef2e0");
UT.chasseur.ic = svgIc("<path d='M12 3.5l3.6 8.2-3.6 2.8-3.6-2.8z'/><path d='M8.4 15.5L7 20M15.6 15.5L17 20M12 15v5'/>", "#ff9a4d");
const SRC_IC = svgIc("<circle cx='12' cy='12' r='3'/><path d='M12 3v4M12 17v4M3 12h4M17 12h4'/><circle cx='12' cy='12' r='8' stroke-dasharray='2.5 4'/>", "#38a9ff");
const TECHS = {
  dns: { nm: "DNS", col: "#4ef2e0", eo: 40, ds: "Débloque la Carte et la Baie réseau." },
  firewall: { nm: "FIREWALL", col: "#ff5c5c", eo: 90, needs: "dns", ds: "−15 % de consommation ⚡." },
  backup: { nm: "BACKUP", col: "#a06bff", eo: 60, ds: "Hors-ligne compté sur 24 h." },
};
const MISSIONS = [
  // — chapitre 💠 Matériaux —
  { t: "✨ Tape un gisement de cristaux : un drone ouvrier de la soute part l'extraire", rm: 20, k: "drone1", c: () => S.units.some((u) => u.t === "recolteur") },
  { t: "🧰 Pose ton hub réseau (menu Construire)", rm: 25, k: "build_coffret", c: () => bcount("coffret") >= 1 },
  { t: "✨ Récolte des éclats pour alimenter HUB-01 (tape-les)", rm: 25, k: "hubboot", c: () => S.hubBoot },
  { t: "🔌 Câble HUB-01 à la Source", rm: 25, k: "link_hub", c: () => S.links.length >= 1 },
  { t: "Pose ton premier extracteur de matériaux", rm: 25, k: "build_extracteur", c: () => bcount("extracteur") >= 1 },
  { t: "Améliore ton extracteur", rm: 30, k: "upgrade", c: () => S.buildings.some((b) => b.l >= 2) },
  { t: "Regarde-le forer : atteins 250 💠 (le stock plafonne à 300)", rm: 30, k: "mat250", c: () => S.mat >= 250 },
  { t: "Le stock est trop petit — pose un entrepôt de matériaux", rm: 40, k: "build_entrepot", c: () => bcount("entrepot") >= 1 },
  // — chapitre ⚡ Énergie —
  { t: "⚡ La réserve de la soute a des limites — pose une centrale", rm: 50, k: "build_centrale", c: () => bcount("centrale") >= 1 },
  { t: "Améliore ta centrale (NIV 2)", rm: 50, k: "centrale2", c: () => S.buildings.some((b) => b.t === "centrale" && b.l >= 2) },
  // — chapitre 🔌 Le réseau de la colonie —
  { t: "🔌 Câble ton extracteur à la Source", rm: 40, k: "link1", c: () => S.links.length >= 1 },
  { t: "La Source n'a que 3 prises : pose un switch (menu Construire)", rm: 50, k: "build_switchhub", c: () => bcount("switchhub") >= 1 },
  { t: "Raccorde tous tes bâtiments au réseau (via le switch !)", rm: 50, k: "linkall", c: allLinked },
  { t: "Suis ta première trame (onglet RÉSEAU → SIMULATION)", re: 5, k: "sim1" },
  // — chapitre 💾 Données —
  { t: "Pose un serveur : il calcule des données 💾", re: 5, k: "build_serveur", c: () => bcount("serveur") >= 1 },
  // « Regarde-LE » : c'est un serveur qu'on pose désormais, plus une ferme
  { t: "Regarde-le calculer : accumule 12 Eo 💾", re: 5, k: "eo12", c: () => S.eo >= 12 },
  { t: "20 Eo max, c'est peu — pose un datacenter", rm: 60, k: "build_datacenter", c: () => bcount("datacenter") >= 1 },
  // — chapitre 🌐 Services & technologies —
  { t: "Pose un serveur DHCP et câble-le : des adresses pour tous", rm: 60, k: "build_dhcpsrv" },
  { t: "Recherche DNS", rm: 80, k: "tech_dns", c: () => S.techs.includes("dns") },
  { t: "Ouvre la carte du secteur", rm: 100, k: "map", c: () => S.ext >= 1 },
  { t: "Pose une baie réseau", rm: 100, k: "build_reseau", c: () => bcount("reseau") >= 1 },
  { t: "Réussis une surcharge ⚡ (tape un bâtiment)", rm: 120, k: "turbo", c: () => S.ext >= 1 },
  // — chapitre 🔧 Commandement & unités —
  { t: "Pose une console de commandement", rm: 150, k: "build_console", c: () => bcount("console") >= 1 },
  { t: "Pose une forge d'assemblage", rm: 150, k: "build_forge", c: () => bcount("forge") >= 1 },
  { t: "Assemble un drone ouvrier à la forge, pose-le sur des cristaux", rm: 150, k: "unit_recolteur", c: () => (S.fr || 0) >= 1 },
  { t: "Parasite en vue ! Assemble un chasseur, puis tape le parasite", rm: 200, k: "mob_kill", c: () => S.ext >= 1 },
  { t: "Étends le territoire (tape la Source)", rm: 200, k: "extend", c: () => S.ext >= 1 },
];
// une mission dont la condition est DÉJÀ remplie au moment où elle devient
// courante est considérée acquise : passée en silence (récompense créditée).
function skipSatisfied() {
  while (S.mi < MISSIONS.length) {
    const m2 = MISSIONS[S.mi];
    if (!m2.c || !m2.c()) break;
    // récompenses retirées pour le moment (système EXP à venir — retour 16/08)
    S.mi++;
  }
}

