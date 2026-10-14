(function () {
  // Clés publiques client de télémétrie (Clarity & PostHog)
  // Strictement limitées à l'envoi d'événements sans aucun droit d'administration
  const cfg = {
    CLARITY_PROJECT_ID: 'ys3jwzqq4h',
    POSTHOG_API_KEY: 'phc_up5r2TeCUma3Fmq6LHyieLHeJ7GV9MkJY5gCrDi4MfEb',
    POSTHOG_HOST: 'https://eu.i.posthog.com',
    GA4_MEASUREMENT_ID: '',
    EXTERNAL_WEBHOOK_URL: '',
    ALLOW_ANGLE_SWITCHER_IN_PROD: false,
  };

  // ============================================================================
  // 1. DÉTECTION DES PARAMÈTRES URL (ANGLE MARKETING + UTM + REFERRAL)
  // ============================================================================
  const urlParams = new URLSearchParams(window.location.search);
  const state = {
    angle: urlParams.get('angle') || 'guilt',
    utmSource: urlParams.get('utm_source') || 'direct',
    utmMedium: urlParams.get('utm_medium') || 'organic',
    utmCampaign: urlParams.get('utm_campaign') || 'prelaunch',
    referrerCode: urlParams.get('ref') || '',
    selectedGoal: 'semi',
    selectedScenario: 'late_work_30m',
    hasInteractedWithSim: false,
    submittedEmail: '',
    founderOfferClaimed: false,
  };

  // ============================================================================
  // 2. INITIALISATION DES OUTILS ANALYTICS EXTERNES (CLARITY / POSTHOG / GA4)
  // ============================================================================
  function initExternalAnalytics() {
    // A. Microsoft Clarity (Heatmaps & Session Replay)
    if (cfg.CLARITY_PROJECT_ID) {
      (function (c, l, a, r, i, t, y) {
        c[a] =
          c[a] ||
          function () {
            (c[a].q = c[a].q || []).push(arguments);
          };
        t = l.createElement(r);
        t.async = 1;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', cfg.CLARITY_PROJECT_ID);
    }

    // B. PostHog (Product Analytics & Funnel)
    if (cfg.POSTHOG_API_KEY) {
      !(function (t, e) {
        var o, n, p, r;
        e.__SV ||
          ((window.posthog = e),
          (e._i = []),
          (e.init = function (i, s, a) {
            function g(t, e) {
              var o = e.split('.');
              (2 == o.length && ((t = t[o[0]]), (e = o[1])),
                (t[e] = function () {
                  t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
                }));
            }
            (((p = t.createElement('script')).type = 'text/javascript'),
              (p.crossOrigin = 'anonymous'),
              (p.async = !0),
              (p.src =
                s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js'),
              (r = t.getElementsByTagName('script')[0]).parentNode.insertBefore(p, r));
            var u = e;
            for (
              void 0 !== a ? (u = e[a] = []) : (a = 'posthog'),
                u.people = u.people || [],
                u.toString = function (t) {
                  var e = 'posthog';
                  return ('posthog' !== a && (e += '.' + a), t || (e += ' (stub)'), e);
                },
                u.people.toString = function () {
                  return u.toString(1) + '.people (stub)';
                },
                o =
                  'init capture register register_once unregister identify set_config reset'.split(
                    ' ',
                  ),
                n = 0;
              n < o.length;
              n++
            )
              g(u, o[n]);
            e._i.push([i, s, a]);
          }),
          (e.__SV = 1));
      })(document, window.posthog || []);
      window.posthog.init(cfg.POSTHOG_API_KEY, {
        api_host: cfg.POSTHOG_HOST || 'https://eu.i.posthog.com',
        person_profiles: 'identified_only',
      });
    }

    // C. Google Analytics 4
    if (cfg.GA4_MEASUREMENT_ID) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + cfg.GA4_MEASUREMENT_ID;
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', cfg.GA4_MEASUREMENT_ID);
    }
  }

  function trackEvent(eventName, extraProps) {
    const payload = Object.assign(
      {
        angle: state.angle,
        utm_source: state.utmSource,
        utm_medium: state.utmMedium,
        utm_campaign: state.utmCampaign,
        goal: state.selectedGoal,
        scenario: state.selectedScenario,
        timestamp: new Date().toISOString(),
      },
      extraProps || {},
    );

    // Debug console pour vérifier les clics en local
    console.info('[Riles Track]', eventName, payload);

    if (window.posthog && typeof window.posthog.capture === 'function') {
      window.posthog.capture(eventName, payload);
    }
    if (window.gtag && typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }
    if (window.clarity && typeof window.clarity === 'function') {
      window.clarity('set', 'angle', state.angle);
      window.clarity('event', eventName);
    }
  }

  // ============================================================================
  // 3. LES 3 ANGLES MARKETING POUR A/B TESTER L'ACCROCHE
  // ============================================================================
  const MARKETING_ANGLES = {
    guilt: {
      eyebrow: 'ZÉRO CROIX ROUGE • ZÉRO CULPABILITÉ',
      titleHtml:
        'Le premier plan running qui s\'adapte à <span class="highlight">ta vraie vie</span> en 10 secondes.',
      subtitle:
        "Boulot tard, nuit de 5h ou imprévu jeudi soir ? Arrête d'abandonner ton plan ou d'empiler les séances ratées. Parle au coach IA : il rééquilibre le reste de ta semaine sans te griller.",
    },
    injury: {
      eyebrow: 'PRÉVENTION SURCHARGE & MODÈLE PHYSIOLOGIQUE',
      titleHtml:
        '78 % des blessures arrivent en forçant une séance <span class="highlight">quand ton corps dit stop</span>.',
      subtitle:
        "Riles croise tes 6 derniers mois Strava/Garmin, ta fatigue nerveuse et tes imprévus quotidiens pour ajuster tes allures de seuil et préserver tes mollets jusqu'au jour J.",
    },
    garmin: {
      eyebrow: 'COMPATIBLE GARMIN • STRAVA • COROS • APPLE',
      titleHtml:
        'Ta montre te dit quoi courir. Riles est le premier coach <span class="highlight">avec qui tu peux négocier</span>.',
      subtitle:
        'Ta montre ne sait pas que tu sors de réunion à 19h30 ou que tu ne peux jamais courir le jeudi. Dis-le en une phrase : ton plan recalcule instantanément la séance et le week-end.',
    },
  };

  function applyMarketingAngle(angleKey, isManualSwitch) {
    const validKey = MARKETING_ANGLES[angleKey] ? angleKey : 'guilt';
    state.angle = validKey;
    const data = MARKETING_ANGLES[validKey];

    const eyebrowEl = document.getElementById('hero-eyebrow-text');
    const titleEl = document.getElementById('hero-title');
    const subEl = document.getElementById('hero-subtitle');

    if (eyebrowEl) eyebrowEl.textContent = data.eyebrow;
    if (titleEl) titleEl.innerHTML = data.titleHtml;
    if (subEl) subEl.textContent = data.subtitle;

    document.querySelectorAll('[data-angle-switch]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-angle-switch') === validKey);
    });

    if (isManualSwitch) {
      trackEvent('marketing_angle_previewed', { angle: validKey });
    }
  }

  // ============================================================================
  // 4. DONNÉES DU SIMULATEUR INTERACTIF (OBJECTIFS x IMPRÉVUS)
  // ============================================================================
  const SIMULATOR_DATA = {
    '10k': {
      label: 'Objectif 10 km (45 min)',
      scenarios: {
        initial: {
          readiness: '88% • Semaine nominale',
          coachNote:
            'Semaine calibrée sur tes 6 derniers mois Strava (Allure Seuil : 4:30/km). Clique sur un imprévu à gauche pour voir comment Riles rééquilibre ta semaine.',
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Footing Z2', meta: '45m • 5:25/km', status: 'done' },
            { d: 'Mer', title: 'VMA 10×400m', meta: '1h05 • Z5', status: 'normal' },
            { d: 'Jeu', title: 'Footing doux', meta: '40m • Z2', status: 'normal' },
            { d: 'Ven', title: 'Repos', meta: 'Mobilité', status: 'normal' },
            { d: 'Sam', title: 'Seuil 3×8m', meta: '55m • 4:30/km', status: 'normal' },
            { d: 'Dim', title: 'Sortie Longue', meta: '1h15 • 13,5 km', status: 'normal' },
          ],
        },
        late_work_30m: {
          readiness: '91% • Stimulus préservé en 30 min',
          coachNote:
            "Pas de souci pour le boulot ! Au lieu d'1h05 de piste, je te passe sur un Fartlek court de 30 min (6×1 min dynamique) en bas de chez toi. J'ajoute 10 min de rappel d'allure samedi pour ne rien perdre.",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Footing Z2', meta: '45m • 5:25/km', status: 'done' },
            {
              d: 'Mer',
              title: 'Fartlek Express',
              meta: '30m • 6×1m',
              status: 'adapted',
              badge: 'Adapté 30m',
            },
            { d: 'Jeu', title: 'Footing doux', meta: '40m • Z2', status: 'normal' },
            { d: 'Ven', title: 'Repos', meta: 'Mobilité', status: 'normal' },
            {
              d: 'Sam',
              title: 'Seuil + Rappel',
              meta: '1h00 • 4:30/km',
              status: 'rebalanced',
              badge: 'Rééquilibré',
            },
            { d: 'Dim', title: 'Sortie Longue', meta: '1h15 • 13,5 km', status: 'normal' },
          ],
        },
        bad_sleep: {
          readiness: '72% • Protection nerveuse activée',
          coachNote:
            "Forcer de la VMA après une nuit de 5h multiplie par 3 le risque de blessure sans gain cardio. On remplace aujourd'hui par 35 min d'aérobie très souple (Z1/Z2) et on décale la qualité à samedi.",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Footing Z2', meta: '45m • 5:25/km', status: 'done' },
            {
              d: 'Mer',
              title: 'Aérobie Doux',
              meta: '35m • Z1/Z2',
              status: 'adapted',
              badge: 'Allégé IA',
            },
            {
              d: 'Jeu',
              title: 'Repos complet',
              meta: 'Sommeil +1h',
              status: 'rebalanced',
              badge: 'Récup',
            },
            {
              d: 'Ven',
              title: 'Footing 40m',
              meta: '40m • Z2',
              status: 'rebalanced',
              badge: 'Décalé',
            },
            {
              d: 'Sam',
              title: 'VMA 8×400m',
              meta: '50m • Z5',
              status: 'rebalanced',
              badge: 'Qualité',
            },
            { d: 'Dim', title: 'Sortie Longue', meta: '1h10 • Z2', status: 'normal' },
          ],
        },
        sore_calf: {
          readiness: '79% • Décharge biomécanique mollet',
          coachNote:
            "On protège immédiatement ton mollet : zéro travail de vitesse ou de côte sur les 72 prochaines heures. On remplace par du plat souple ou vélo, et j'allège le seuil de samedi.",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Footing Z2', meta: '45m • 5:25/km', status: 'done' },
            {
              d: 'Mer',
              title: 'Repos / Vélo Z1',
              meta: '30m sans choc',
              status: 'adapted',
              badge: 'Zéro choc',
            },
            {
              d: 'Jeu',
              title: 'Test Plat Z2',
              meta: '30m • 5:40/km',
              status: 'rebalanced',
              badge: 'Prudence',
            },
            { d: 'Ven', title: 'Repos', meta: 'Étirements doux', status: 'normal' },
            {
              d: 'Sam',
              title: 'Tempo contrôlé',
              meta: '45m • Z3',
              status: 'rebalanced',
              badge: 'Sans VMA',
            },
            { d: 'Dim', title: 'Sortie Longue', meta: '1h10 • Plat', status: 'normal' },
          ],
        },
        no_thursday: {
          readiness: '90% • Règle de vie enregistrée',
          coachNote:
            "C'est noté dans tes Règles de Vie permanentes : ton jeudi soir est désormais sanctuarisé à 100%. J'ai déplacé ton footing d'assimilation sur vendredi sans toucher à ta sortie longue.",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Footing Z2', meta: '45m • 5:25/km', status: 'done' },
            { d: 'Mer', title: 'VMA 10×400m', meta: '1h05 • Z5', status: 'normal' },
            {
              d: 'Jeu',
              title: 'Bloqué Perso',
              meta: '0 km • Sanctuarisé',
              status: 'adapted',
              badge: 'Règle IA',
            },
            {
              d: 'Ven',
              title: 'Footing doux',
              meta: '40m • Z2',
              status: 'rebalanced',
              badge: 'Déplacé',
            },
            { d: 'Sam', title: 'Seuil 3×8m', meta: '55m • 4:30/km', status: 'normal' },
            { d: 'Dim', title: 'Sortie Longue', meta: '1h15 • 13,5 km', status: 'normal' },
          ],
        },
      },
    },
    semi: {
      label: 'Objectif Semi-Marathon (1h45)',
      scenarios: {
        initial: {
          readiness: '88% • Charge optimale (CTL 52)',
          coachNote:
            'Semaine clé à J-6 semaines du Semi-Marathon. Clique sur un imprévu pour voir comment Riles adapte la séance de Mercredi (1h15 Seuil) et rééquilibre le reste de la semaine.',
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Endurance Z2', meta: '50m • 9 km', status: 'done' },
            { d: 'Mer', title: 'Seuil 3×8 min', meta: '1h15 • 14 km', status: 'normal' },
            { d: 'Jeu', title: 'Assimilation', meta: '45m • Z2', status: 'normal' },
            { d: 'Ven', title: 'Repos', meta: 'Mobilité', status: 'normal' },
            { d: 'Sam', title: 'Footing + LD', meta: '50m • 6 lignes', status: 'normal' },
            { d: 'Dim', title: 'Sortie Longue', meta: '1h40 • 18,5 km', status: 'normal' },
          ],
        },
        late_work_30m: {
          readiness: '92% • Stimulus Seuil sauvé en 30 min',
          coachNote:
            "Tu n'as que 30 min ce soir au lieu d'1h15 : on fait 10 min d'échauffement + 15 min de Tempo continu à 4:50/km + 5 min retour au calme. J'intègre le volume manquant sous forme d'un bloc de 15 min à allure Semi dimanche !",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Endurance Z2', meta: '50m • 9 km', status: 'done' },
            {
              d: 'Mer',
              title: 'Tempo Express',
              meta: '30m • 15m Seuil',
              status: 'adapted',
              badge: 'Adapté 30m',
            },
            { d: 'Jeu', title: 'Assimilation', meta: '45m • Z2', status: 'normal' },
            { d: 'Ven', title: 'Repos', meta: 'Mobilité', status: 'normal' },
            { d: 'Sam', title: 'Footing + LD', meta: '50m • 6 lignes', status: 'normal' },
            {
              d: 'Dim',
              title: 'SL + Bloc Semi',
              meta: '1h45 • dont 15m AS21',
              status: 'rebalanced',
              badge: 'Rééquilibré',
            },
          ],
        },
        bad_sleep: {
          readiness: '74% • Surcharge évitée',
          coachNote:
            "Nuit courte détectée : faire 14 km au seuil ce soir ferait exploser ta fatigue aiguë (ATL). Je remplace par un footing régénération de 35 min sans regarder l'allure, et je décale le travail d'allure Semi à samedi.",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Endurance Z2', meta: '50m • 9 km', status: 'done' },
            {
              d: 'Mer',
              title: 'Footing Régén.',
              meta: '35m • < 140 bpm',
              status: 'adapted',
              badge: 'Allégé IA',
            },
            {
              d: 'Jeu',
              title: 'Repos complet',
              meta: 'Récup nerveuse',
              status: 'rebalanced',
              badge: 'Repos',
            },
            {
              d: 'Ven',
              title: 'Footing Z2',
              meta: '45m • 8 km',
              status: 'rebalanced',
              badge: 'Décalé',
            },
            {
              d: 'Sam',
              title: 'Seuil 2×10 min',
              meta: '1h00 • 4:50/km',
              status: 'rebalanced',
              badge: 'Qualité',
            },
            { d: 'Dim', title: 'Sortie Longue', meta: '1h35 • Z2 souple', status: 'normal' },
          ],
        },
        sore_calf: {
          readiness: '80% • Protection tendineuse & musculaire',
          coachNote:
            "Comme dans ton check-in RPE : j'annule les 3×8 min de seuil aujourd'hui pour préserver tes mollets. Repos ou vélo doux ce soir, footing test sur terrain plat vendredi, et allure contrôlée ce week-end.",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Endurance Z2', meta: '50m • 9 km', status: 'done' },
            {
              d: 'Mer',
              title: 'Repos / Vélo',
              meta: 'Zéro impact',
              status: 'adapted',
              badge: 'Mollet protégé',
            },
            { d: 'Jeu', title: 'Repos', meta: 'Auto-massage', status: 'rebalanced', badge: 'Soin' },
            {
              d: 'Ven',
              title: 'Test Z2 Plat',
              meta: '35m • 5:35/km',
              status: 'rebalanced',
              badge: 'Test doux',
            },
            {
              d: 'Sam',
              title: 'Endurance Z2',
              meta: '50m • Sans lignes',
              status: 'rebalanced',
              badge: 'Adapté',
            },
            { d: 'Dim', title: 'Sortie Longue', meta: '1h30 • Z2 plat', status: 'normal' },
          ],
        },
        no_thursday: {
          readiness: '90% • Règle du jeudi enregistrée',
          coachNote:
            "Nouvelle Règle de Vie ajoutée : « Pas de sortie le jeudi ». Ton footing d'assimilation bascule automatiquement au vendredi matin et ta sortie de samedi est ajustée pour garder 48h de fraîcheur avant la sortie longue.",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Endurance Z2', meta: '50m • 9 km', status: 'done' },
            { d: 'Mer', title: 'Seuil 3×8 min', meta: '1h15 • 14 km', status: 'normal' },
            {
              d: 'Jeu',
              title: 'Jeudi Sanctuarisé',
              meta: 'Repos garanti',
              status: 'adapted',
              badge: 'Règle IA',
            },
            {
              d: 'Ven',
              title: 'Assimilation',
              meta: '45m • Z2',
              status: 'rebalanced',
              badge: 'Déplacé',
            },
            {
              d: 'Sam',
              title: 'Footing souple',
              meta: '40m • Z2',
              status: 'rebalanced',
              badge: 'Ajusté',
            },
            { d: 'Dim', title: 'Sortie Longue', meta: '1h40 • 18,5 km', status: 'normal' },
          ],
        },
      },
    },
    marathon: {
      label: 'Objectif Marathon (3h45)',
      scenarios: {
        initial: {
          readiness: '86% • Semaine de charge (56 km)',
          coachNote:
            'Semaine marathon à 4 sorties. Sélectionne un imprévu à gauche pour voir comment Riles protège ton volume sans jamais te faire rattraper sauvagement une séance.',
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Endurance', meta: '1h00 • 11 km', status: 'done' },
            { d: 'Mer', title: 'Allure Marathon', meta: '1h20 • 2×20m AM', status: 'normal' },
            { d: 'Jeu', title: 'Récup Z2', meta: '50m • 8,5 km', status: 'normal' },
            { d: 'Ven', title: 'Repos', meta: 'Hydratation', status: 'normal' },
            { d: 'Sam', title: 'Pré-fatigue', meta: '1h00 • 11 km', status: 'normal' },
            { d: 'Dim', title: 'Sortie Longue', meta: '2h15 • 25 km', status: 'normal' },
          ],
        },
        late_work_30m: {
          readiness: '90% • Bloc Allure Marathon reporté intelligemment',
          coachNote:
            "Seulement 30 min ce soir : fais un simple décrassage de 30 min pour évacuer le stress du boulot. Je déplace ton bloc d'Allure Marathon directement au cœur de ta sortie longue de dimanche (3×15 min à 5:18/km) !",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Endurance', meta: '1h00 • 11 km', status: 'done' },
            {
              d: 'Mer',
              title: 'Décrassage 30m',
              meta: '30m • 5,5 km',
              status: 'adapted',
              badge: 'Express 30m',
            },
            {
              d: 'Jeu',
              title: 'Endurance + AM',
              meta: '1h00 • 11 km',
              status: 'rebalanced',
              badge: '+10 min',
            },
            { d: 'Ven', title: 'Repos', meta: 'Hydratation', status: 'normal' },
            {
              d: 'Sam',
              title: 'Pré-fatigue',
              meta: '50m • 9 km',
              status: 'rebalanced',
              badge: 'Allégé',
            },
            {
              d: 'Dim',
              title: 'SL 25km + AM',
              meta: '2h15 • 3×15m AM',
              status: 'rebalanced',
              badge: 'Bloc AM intégré',
            },
          ],
        },
        bad_sleep: {
          readiness: '75% • Assimilation prioritaire',
          coachNote:
            "En prépa marathon, le sommeil est ton premier entraînement. Dormir 1h de plus ce soir te fera progresser 3 fois plus qu'une séance bâclée. On coupe aujourd'hui et on lisse le volume sur jeudi et samedi.",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Endurance', meta: '1h00 • 11 km', status: 'done' },
            {
              d: 'Mer',
              title: 'Repos Compens.',
              meta: 'Sommeil prioritaire',
              status: 'adapted',
              badge: 'Repos IA',
            },
            {
              d: 'Jeu',
              title: 'Allure Marathon',
              meta: '1h15 • 2×18m AM',
              status: 'rebalanced',
              badge: 'Décalé',
            },
            { d: 'Ven', title: 'Repos', meta: 'Récup', status: 'normal' },
            {
              d: 'Sam',
              title: 'Footing Z2',
              meta: '50m • 9 km',
              status: 'rebalanced',
              badge: 'Allégé',
            },
            { d: 'Dim', title: 'Sortie Longue', meta: '2h10 • 24 km', status: 'normal' },
          ],
        },
        sore_calf: {
          readiness: '78% • Prévention périostite / tendinite',
          coachNote:
            "Alerte mollet en prépa marathon = prudence absolue. On neutralise l'impact mécanique pendant 48h et on réduit la sortie longue de dimanche de 25 à 20 km sur sol souple sans allure imposée.",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Endurance', meta: '1h00 • 11 km', status: 'done' },
            {
              d: 'Mer',
              title: 'Vélo / Natation',
              meta: '45m • Zéro choc',
              status: 'adapted',
              badge: 'Croisé IA',
            },
            {
              d: 'Jeu',
              title: 'Repos',
              meta: 'Glace & Mobilité',
              status: 'rebalanced',
              badge: 'Soin',
            },
            {
              d: 'Ven',
              title: 'Test Footing',
              meta: '35m • Sol souple',
              status: 'rebalanced',
              badge: 'Test',
            },
            {
              d: 'Sam',
              title: 'Repos',
              meta: 'Assimilation',
              status: 'rebalanced',
              badge: 'Sécurité',
            },
            {
              d: 'Dim',
              title: 'SL Adaptée',
              meta: '1h50 • 20 km Z2',
              status: 'rebalanced',
              badge: 'Volume sécurisé',
            },
          ],
        },
        no_thursday: {
          readiness: '89% • Semaine 4 séances recalibrée',
          coachNote:
            "Ton jeudi est bloqué : Riles réorganise tes 4 séances sur Mardi, Mercredi, Vendredi et Dimanche pour éviter d'enchaîner 3 jours d'affilée le week-end.",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup', status: 'done' },
            { d: 'Mar', title: 'Endurance', meta: '1h00 • 11 km', status: 'done' },
            { d: 'Mer', title: 'Allure Marathon', meta: '1h20 • 2×20m AM', status: 'normal' },
            {
              d: 'Jeu',
              title: 'Indisponible',
              meta: '0 km • Règle IA',
              status: 'adapted',
              badge: 'Règle IA',
            },
            {
              d: 'Ven',
              title: 'Footing Z2',
              meta: '55m • 10 km',
              status: 'rebalanced',
              badge: 'Déplacé',
            },
            {
              d: 'Sam',
              title: 'Repos pré-SL',
              meta: 'Fraîcheur',
              status: 'rebalanced',
              badge: 'Repos',
            },
            { d: 'Dim', title: 'Sortie Longue', meta: '2h15 • 25 km', status: 'normal' },
          ],
        },
      },
    },
    trail: {
      label: 'Objectif Trail (35 km • 1 500m D+)',
      scenarios: {
        initial: {
          readiness: '87% • Bloc D+ nominal',
          coachNote:
            'Semaine orientée dénivelé et renforcement musculaire excentrique. Clique sur un imprévu pour voir comment Riles réajuste la séance de côtes et préserve tes jambes pour le week-end.',
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup passive', status: 'done' },
            { d: 'Mar', title: 'Footing D+', meta: '50m • 8 km • 350m D+', status: 'done' },
            {
              d: 'Mer',
              title: 'Répétitions Côtes',
              meta: '1h10 • 10×1m D+ raide',
              status: 'normal',
            },
            { d: 'Jeu', title: 'Footing plat Z2', meta: '45m • Zéro D+', status: 'normal' },
            { d: 'Ven', title: 'Repos', meta: 'Mobilité & gainage', status: 'normal' },
            { d: 'Sam', title: 'Pré-fatigue', meta: '1h00 • 10 km • 400m D+', status: 'normal' },
            {
              d: 'Dim',
              title: 'Sortie Longue Trail',
              meta: '2h45 • 22 km • 1 100m D+',
              status: 'normal',
            },
          ],
        },
        late_work_30m: {
          readiness: '92% • Renforcement excentrique express sauvé',
          coachNote:
            "Tu n'as que 30 min ce soir : au lieu d'1h10, on fait 30 min d'escaliers ou de côte raide en bas de chez toi (8 montées dynamiques + descente souple) pour garder la puissance. J'ajoute 200m de D+ sur ta sortie trail de dimanche !",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup passive', status: 'done' },
            { d: 'Mar', title: 'Footing D+', meta: '50m • 8 km • 350m D+', status: 'done' },
            {
              d: 'Mer',
              title: 'Escaliers / Côte',
              meta: '30m • 8 montées',
              status: 'adapted',
              badge: 'Express 30m',
            },
            { d: 'Jeu', title: 'Footing plat Z2', meta: '45m • Zéro D+', status: 'normal' },
            { d: 'Ven', title: 'Repos', meta: 'Mobilité', status: 'normal' },
            { d: 'Sam', title: 'Pré-fatigue', meta: '1h00 • 10 km • 400m D+', status: 'normal' },
            {
              d: 'Dim',
              title: 'SL Trail + D+',
              meta: '3h00 • 24 km • 1 300m D+',
              status: 'rebalanced',
              badge: '+200m D+ compensé',
            },
          ],
        },
        bad_sleep: {
          readiness: '73% • Fibres musculaires protégées',
          coachNote:
            'Enchaîner des côtes et descentes raides sur une nuit de 5h détruit les fibres musculaires sans surcompensation. On remplace par 35 min de footing plat très souple, et on reporte le travail de dénivelé à samedi.',
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup passive', status: 'done' },
            { d: 'Mar', title: 'Footing D+', meta: '50m • 8 km • 350m D+', status: 'done' },
            {
              d: 'Mer',
              title: 'Footing Plat Doux',
              meta: '35m • Plat strict',
              status: 'adapted',
              badge: 'Allégé IA',
            },
            {
              d: 'Jeu',
              title: 'Repos complet',
              meta: 'Sommeil prioritaire',
              status: 'rebalanced',
              badge: 'Repos',
            },
            {
              d: 'Ven',
              title: 'Footing régén.',
              meta: '40m • Z2',
              status: 'rebalanced',
              badge: 'Décalé',
            },
            {
              d: 'Sam',
              title: 'Côtes 8×1m',
              meta: '1h05 • 600m D+',
              status: 'rebalanced',
              badge: 'Qualité D+',
            },
            {
              d: 'Dim',
              title: 'Sortie Longue Trail',
              meta: '2h30 • 20 km • 900m D+',
              status: 'normal',
            },
          ],
        },
        sore_calf: {
          readiness: '77% • Triceps sural & tendons déchargés',
          coachNote:
            "Alerte mollet en trail = zéro montée sur la pointe des pieds et zéro descente brusque pendant 72h. On bascule ce soir sur du vélo ou marche active, et on réduit le dénivelé négatif de la sortie longue de dimanche pour sécuriser le tendon d'Achille.",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup passive', status: 'done' },
            { d: 'Mar', title: 'Footing D+', meta: '50m • 8 km • 350m D+', status: 'done' },
            {
              d: 'Mer',
              title: 'Vélo / Marche Z1',
              meta: '45m • Zéro choc',
              status: 'adapted',
              badge: 'Zéro impact',
            },
            {
              d: 'Jeu',
              title: 'Repos & Glace',
              meta: 'Mobilité cheville',
              status: 'rebalanced',
              badge: 'Soin',
            },
            {
              d: 'Ven',
              title: 'Test Plat Herbe',
              meta: '30m • Terrain souple',
              status: 'rebalanced',
              badge: 'Test doux',
            },
            {
              d: 'Sam',
              title: 'Repos pré-trail',
              meta: 'Assimilation',
              status: 'rebalanced',
              badge: 'Repos',
            },
            {
              d: 'Dim',
              title: 'Trail D+ modéré',
              meta: '2h15 • 18 km • 600m D+',
              status: 'rebalanced',
              badge: 'D- allégé',
            },
          ],
        },
        no_thursday: {
          readiness: '89% • Semaine trail adaptée',
          coachNote:
            "Jeudi soir bloqué : Riles décale ton footing d'assimilation sur le vendredi midi, permettant de garder les jambes légères avant d'attaquer le bloc du week-end.",
          days: [
            { d: 'Lun', title: 'Repos', meta: 'Récup passive', status: 'done' },
            { d: 'Mar', title: 'Footing D+', meta: '50m • 8 km • 350m D+', status: 'done' },
            {
              d: 'Mer',
              title: 'Répétitions Côtes',
              meta: '1h10 • 10×1m D+ raide',
              status: 'normal',
            },
            {
              d: 'Jeu',
              title: 'Jeudi Sanctuarisé',
              meta: '0 km • Repos',
              status: 'adapted',
              badge: 'Règle IA',
            },
            {
              d: 'Ven',
              title: 'Footing plat',
              meta: '45m • Z2',
              status: 'rebalanced',
              badge: 'Déplacé',
            },
            {
              d: 'Sam',
              title: 'Pré-fatigue',
              meta: '55m • 9 km • 350m D+',
              status: 'rebalanced',
              badge: 'Ajusté',
            },
            {
              d: 'Dim',
              title: 'Sortie Longue Trail',
              meta: '2h45 • 22 km • 1 100m D+',
              status: 'normal',
            },
          ],
        },
      },
    },
  };

  function renderSimulator() {
    const goalObj = SIMULATOR_DATA[state.selectedGoal] || SIMULATOR_DATA.semi;
    const scenarioObj = goalObj.scenarios[state.selectedScenario] || goalObj.scenarios.initial;

    // Boutons d'objectif
    document.querySelectorAll('[data-sim-goal]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-sim-goal') === state.selectedGoal);
    });

    // Boutons de scénario
    document.querySelectorAll('[data-sim-scenario]').forEach(function (btn) {
      btn.classList.toggle(
        'active',
        btn.getAttribute('data-sim-scenario') === state.selectedScenario,
      );
    });

    // En-tête de sortie
    const goalLabelEl = document.getElementById('sim-output-goal-label');
    const readinessEl = document.getElementById('sim-readiness-pill');
    const coachTextEl = document.getElementById('sim-coach-text');
    const calendarGridEl = document.getElementById('sim-calendar-grid');

    if (goalLabelEl) goalLabelEl.textContent = goalObj.label;
    if (readinessEl) readinessEl.textContent = '⚡ ' + scenarioObj.readiness;
    if (coachTextEl) coachTextEl.textContent = scenarioObj.coachNote;

    if (calendarGridEl) {
      calendarGridEl.innerHTML = scenarioObj.days
        .map(function (day) {
          const badgeHtml = day.badge
            ? '<span class="day-badge ' + day.status + '">' + day.badge + '</span>'
            : day.status === 'done'
              ? '<span class="day-badge done">✓ Fait</span>'
              : '';
          return (
            '<div class="day-card ' +
            day.status +
            '">' +
            '<div class="day-name">' +
            day.d +
            '</div>' +
            '<div class="day-session">' +
            day.title +
            '</div>' +
            '<div class="day-meta">' +
            day.meta +
            '</div>' +
            badgeHtml +
            '</div>'
          );
        })
        .join('');
    }
  }

  // ============================================================================
  // 5. MODAL INTERACTIF MULTI-ÉTAPES (QUIZ CARTES + ACCÈS BÊTA + DOSSARD VIP)
  // ============================================================================
  const GOAL_LABELS = {
    semi: 'Semi-Marathon (21,1 km)',
    marathon: 'Marathon (42,195 km)',
    '10k': '10 km / 5 km',
    trail: 'Trail & Nature (D+)',
    reprise: 'Reprise / Plaisir',
  };

  const APP_LABELS = {
    campus: 'Campus Coach',
    runna: 'Runna',
    runmotion: 'RunMotion Coach',
    kiprun: 'Kiprun Pacer',
    garmin_coach: 'Garmin Coach',
    pdf_excel: 'Plan PDF / Excel',
    club_coach: 'Coach de Club / Nolio',
    feeling: 'Au feeling',
    autre: 'Autre application',
  };

  const WATCH_LABELS = {
    garmin: 'Montre Garmin',
    apple_watch: 'Apple Watch',
    coros: 'Montre COROS',
    polar: 'Montre Polar',
    suunto: 'Montre Suunto',
    phone_only: 'Téléphone seul (Strava / Nike)',
  };

  state.selectedApp = 'campus';
  state.selectedWatch = 'garmin';

  function syncModalCardsUI() {
    // 1. Cartes d'objectif
    document.querySelectorAll('[data-choice-goal]').forEach(function (card) {
      card.classList.toggle('active', card.getAttribute('data-choice-goal') === state.selectedGoal);
    });
    const hiddenGoal = document.getElementById('form-hidden-goal');
    if (hiddenGoal) hiddenGoal.value = state.selectedGoal;

    // 2. Liste déroulante application actuelle
    const appSelect = document.getElementById('form-current-app');
    if (appSelect && appSelect.value !== state.selectedApp) {
      appSelect.value = state.selectedApp;
    }
    const hiddenApp = document.getElementById('form-hidden-app');
    if (hiddenApp) hiddenApp.value = state.selectedApp;

    // 3. Liste déroulante montre / GPS
    const watchSelect = document.getElementById('form-watch');
    if (watchSelect && watchSelect.value !== state.selectedWatch) {
      watchSelect.value = state.selectedWatch;
    }
    const hiddenWatch = document.getElementById('form-hidden-watch');
    if (hiddenWatch) hiddenWatch.value = state.selectedWatch;
  }

  function goToModalStep(stepNumber) {
    const s1 = document.getElementById('modal-step-1');
    const s2 = document.getElementById('modal-step-2');
    const s3 = document.getElementById('modal-step-3');
    const seg1 = document.getElementById('prog-seg-1');
    const seg2 = document.getElementById('prog-seg-2');
    const counter = document.getElementById('modal-step-counter');

    if (stepNumber === 1) {
      if (s1) s1.style.display = 'block';
      if (s2) s2.style.display = 'none';
      if (s3) s3.style.display = 'none';
      if (seg1) seg1.classList.add('active');
      if (seg2) seg2.classList.remove('active');
      if (counter) counter.textContent = 'Étape 1 / 2';
    } else if (stepNumber === 2) {
      if (s1) s1.style.display = 'none';
      if (s2) s2.style.display = 'block';
      if (s3) s3.style.display = 'none';
      if (seg1) seg1.classList.add('active');
      if (seg2) seg2.classList.add('active');
      if (counter) counter.textContent = 'Étape 2 / 2';

      // Mise à jour de la synthèse personnalisée
      const summaryText = document.getElementById('summary-pill-text');
      if (summaryText) {
        const goalTxt = GOAL_LABELS[state.selectedGoal] || 'Semi-Marathon';
        const otherInput = document.getElementById('form-other-app-text');
        const customTxt = otherInput ? otherInput.value.trim() : '';
        const appTxt =
          state.selectedApp === 'autre' && customTxt
            ? customTxt
            : APP_LABELS[state.selectedApp] || 'Campus Coach';
        const watchTxt = WATCH_LABELS[state.selectedWatch] || 'Montre Garmin';
        summaryText.textContent = 'Objectif ' + goalTxt + ' • ' + appTxt + ' • ' + watchTxt;
      }

      // Focus automatique sur l'email
      setTimeout(function () {
        const emailInput = document.getElementById('form-email');
        if (emailInput) emailInput.focus();
      }, 100);
    } else if (stepNumber === 3) {
      if (s1) s1.style.display = 'none';
      if (s2) s2.style.display = 'none';
      if (s3) s3.style.display = 'block';
      if (seg1) seg1.classList.add('active');
      if (seg2) seg2.classList.add('active');
      if (counter) counter.textContent = 'Dossard Officiel ✓';
    }
  }

  function openWaitlistModal(triggerSource) {
    trackEvent('fake_door_clicked', { trigger_source: triggerSource });

    const modal = document.getElementById('waitlist-modal');
    if (!modal) return;

    // Pré-remplir les champs cachés Netlify
    const angleInput = document.getElementById('form-hidden-angle');
    const utmInput = document.getElementById('form-hidden-utm');
    const scenarioInput = document.getElementById('form-hidden-scenario');

    if (angleInput) angleInput.value = state.angle;
    if (utmInput) utmInput.value = state.utmSource + ' / ' + state.utmCampaign;
    if (scenarioInput) scenarioInput.value = state.selectedScenario;

    syncModalCardsUI();
    goToModalStep(1);
    modal.classList.add('open');
  }

  function closeWaitlistModal() {
    const modal = document.getElementById('waitlist-modal');
    if (modal) modal.classList.remove('open');
  }

  async function handleWaitlistSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const emailInput = document.getElementById('form-email');
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email) return;

    state.submittedEmail = email;

    let reportedApp = state.selectedApp || 'campus';
    if (state.selectedApp === 'autre') {
      const otherInput = document.getElementById('form-other-app-text');
      const customVal = otherInput ? otherInput.value.trim() : '';
      if (customVal) {
        reportedApp = 'autre: ' + customVal;
      }
    }
    const hiddenApp = document.getElementById('form-hidden-app');
    if (hiddenApp) hiddenApp.value = reportedApp;

    trackEvent('waitlist_lead_submitted', {
      goal: state.selectedGoal,
      current_app: reportedApp,
      watch_brand: state.selectedWatch,
    });

    if (window.posthog && typeof window.posthog.identify === 'function') {
      window.posthog.identify(email, {
        email: email,
        goal: state.selectedGoal,
        current_app: reportedApp,
        watch_brand: state.selectedWatch,
        angle: state.angle,
        utm_source: state.utmSource,
      });
    }

    // 1. Envoi natif à Netlify Forms
    const formData = new FormData(form);
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });
    } catch (err) {
      console.info('[Netlify Forms] Mode local détecté :', err.message);
    }

    // 2. Envoi optionnel vers un Webhook externe
    if (cfg.EXTERNAL_WEBHOOK_URL) {
      try {
        await fetch(cfg.EXTERNAL_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            goal: state.selectedGoal,
            currentApp: state.selectedApp,
            watchBrand: state.selectedWatch,
            angle: state.angle,
            utmSource: state.utmSource,
            utmCampaign: state.utmCampaign,
            simulatedScenario: state.selectedScenario,
            createdAt: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.warn('[Webhook externe] Erreur :', err.message);
      }
    }

    // 3. Bascule sur l'étape 3 : Le Dossard Digital Bêta officiel
    goToModalStep(3);

    // Personnalisation du dossard
    const bibCat = document.getElementById('bib-category-text');
    const bibAth = document.getElementById('bib-athlete-text');
    if (bibCat) {
      bibCat.textContent =
        'CATÉGORIE : ' + (GOAL_LABELS[state.selectedGoal] || 'SEMI-MARATHON').toUpperCase();
    }
    if (bibAth) {
      bibAth.textContent = 'ATHLÈTE : ' + email;
    }

    // Génération du lien de parrainage unique
    const refCode = btoa(email)
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 8);
    const shareUrl =
      window.location.origin +
      window.location.pathname +
      '?ref=' +
      refCode +
      '&angle=' +
      state.angle;
    const refInput = document.getElementById('referral-link-input');
    if (refInput) refInput.value = shareUrl;

    // Bouton de partage WhatsApp pré-rempli
    const waBtn = document.getElementById('whatsapp-share-btn');
    if (waBtn) {
      const waText = encodeURIComponent(
        "Regarde ce coach running IA : tu lui dis que t'as que 30 min ou mal aux jambes et il recalcule toute ta semaine sans culpabilité ! Teste le simulateur ici : " +
          shareUrl,
      );
      waBtn.href = 'https://api.whatsapp.com/send?text=' + waText;
    }
  }

  async function handleFounderOfferClaim() {
    if (state.founderOfferClaimed) return;
    state.founderOfferClaimed = true;

    trackEvent('founder_offer_50_claimed', {
      email: state.submittedEmail,
      price_tested: '49_eur_year',
    });

    // Envoi de l'intention d'achat à Netlify Forms
    try {
      const params = new URLSearchParams({
        'form-name': 'riles-founder-intent',
        email: state.submittedEmail,
        angle: state.angle,
        utm_source: state.utmSource,
        founder_offer: 'YES_49_EUR_YEAR',
      });
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
    } catch (e) {
      // ignore en local
    }

    const btn = document.getElementById('claim-founder-btn');
    if (btn) {
      btn.textContent = '✓ Tarif Membre Fondateur (-50%) verrouillé pour toi !';
      btn.style.background = '#059669';
      btn.disabled = true;
    }
  }

  // ============================================================================
  // 6. INITIALISATION AU CHARGEMENT DU DOM
  // ============================================================================
  document.addEventListener('DOMContentLoaded', function () {
    initExternalAnalytics();

    // Affiche la barre de switch d'angle en local ou si ?preview=1
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'file:' ||
      urlParams.get('preview') === '1' ||
      cfg.ALLOW_ANGLE_SWITCHER_IN_PROD;

    const switcherBar = document.getElementById('angle-switcher-bar');
    if (switcherBar && isLocal) {
      switcherBar.style.display = 'block';
    }

    applyMarketingAngle(state.angle, false);
    renderSimulator();

    trackEvent('landing_page_viewed', {
      referrer: document.referrer || 'none',
    });

    // Écouteurs barre d'angles
    document.querySelectorAll('[data-angle-switch]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyMarketingAngle(btn.getAttribute('data-angle-switch'), true);
      });
    });

    // Écouteurs objectifs du simulateur
    document.querySelectorAll('[data-sim-goal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.selectedGoal = btn.getAttribute('data-sim-goal');
        state.hasInteractedWithSim = true;
        renderSimulator();
        syncModalCardsUI();
        trackEvent('simulator_goal_changed', { goal: state.selectedGoal });
      });
    });

    // Écouteurs scénarios d'imprévus du simulateur
    document.querySelectorAll('[data-sim-scenario]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.selectedScenario = btn.getAttribute('data-sim-scenario');
        state.hasInteractedWithSim = true;
        renderSimulator();
        trackEvent('simulator_scenario_tested', {
          scenario: state.selectedScenario,
          goal: state.selectedGoal,
        });
      });
    });

    // Écouteurs de choix dans le Modal Onboarding :
    // A. Cartes d'objectif
    document.querySelectorAll('[data-choice-goal]').forEach(function (card) {
      card.addEventListener('click', function () {
        state.selectedGoal = card.getAttribute('data-choice-goal');
        syncModalCardsUI();
        trackEvent('modal_goal_selected', { goal: state.selectedGoal });
      });
    });

    // B. Liste déroulante application actuelle
    const appSelect = document.getElementById('form-current-app');
    if (appSelect) {
      appSelect.addEventListener('change', function () {
        state.selectedApp = appSelect.value;
        const hiddenApp = document.getElementById('form-hidden-app');
        if (hiddenApp) hiddenApp.value = state.selectedApp;

        // Afficher/masquer le champ texte libre si "autre" est choisi
        const otherWrap = document.getElementById('form-other-app-wrapper');
        const otherInput = document.getElementById('form-other-app-text');
        if (otherWrap) {
          otherWrap.style.display = appSelect.value === 'autre' ? 'block' : 'none';
          if (appSelect.value === 'autre' && otherInput) {
            otherInput.focus();
          }
        }

        trackEvent('modal_app_selected', { app: state.selectedApp });
      });
    }

    // C. Liste déroulante montre / GPS
    const watchSelect = document.getElementById('form-watch');
    if (watchSelect) {
      watchSelect.addEventListener('change', function () {
        state.selectedWatch = watchSelect.value;
        const hiddenWatch = document.getElementById('form-hidden-watch');
        if (hiddenWatch) hiddenWatch.value = state.selectedWatch;
        trackEvent('modal_watch_selected', { watch: state.selectedWatch });
      });
    }

    // D. Bouton Étape Suivante (Étape 1 -> Étape 2)
    const nextBtn = document.getElementById('btn-next-step');
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        trackEvent('modal_step1_validated', {
          goal: state.selectedGoal,
          app: state.selectedApp,
          watch: state.selectedWatch,
        });
        goToModalStep(2);
      });
    }

    // E. Bouton Retour Étape (Étape 2 -> Étape 1)
    const backBtn = document.getElementById('btn-back-step');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        goToModalStep(1);
      });
    }

    // Tous les boutons qui ouvrent le Fake Door / Waitlist
    document.querySelectorAll('[data-open-waitlist]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openWaitlistModal(btn.getAttribute('data-open-waitlist'));
      });
    });

    // Fermeture modal
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeWaitlistModal);

    const modalBackdrop = document.getElementById('waitlist-modal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', function (e) {
        if (e.target === modalBackdrop) closeWaitlistModal();
      });
    }

    // Soumission formulaire Waitlist
    const waitlistForm = document.getElementById('waitlist-form');
    if (waitlistForm) {
      waitlistForm.addEventListener('submit', handleWaitlistSubmit);
    }

    // Bouton d'intention d'achat Membre Fondateur -50%
    const founderBtn = document.getElementById('claim-founder-btn');
    if (founderBtn) {
      founderBtn.addEventListener('click', handleFounderOfferClaim);
    }

    // Copie du lien de parrainage
    const copyRefBtn = document.getElementById('copy-referral-btn');
    if (copyRefBtn) {
      copyRefBtn.addEventListener('click', function () {
        const input = document.getElementById('referral-link-input');
        if (input && navigator.clipboard) {
          navigator.clipboard.writeText(input.value);
          copyRefBtn.textContent = 'Copié ✓';
          trackEvent('referral_link_copied');
          setTimeout(function () {
            copyRefBtn.textContent = 'Copier';
          }, 2000);
        }
      });
    }
  });
})();
