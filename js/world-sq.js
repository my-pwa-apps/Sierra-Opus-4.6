/* ============================================
   Space Quest: Debris of Destiny
   World - Scenes, Dialogs, Items, Puzzles
   An Original Sierra-style Adventure
   ============================================ */

(function() {
  const C = GFX.C;

  // ── 1. JANITOR CLOSET (Start) ──
  const janitorCloset = {
    id: 'janitorCloset',
    name: 'Janitor Closet',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Metal floor
      GFX.rect(ctx, 0, 100, w, h - 100, '#334455');
      for (let fy = 100; fy < h; fy += 6) {
        GFX.rect(ctx, 0, fy, w, 1, '#2a3a4a');
      }
      // Metal walls
      GFX.rect(ctx, 0, 0, w, 100, '#445566');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 100, '#3a4a5a');
      // Shelf with cleaning supplies
      GFX.rect(ctx, 20, 40, 60, 4, '#556677');
      GFX.rect(ctx, 25, 25, 8, 15, C.YELLOW); // spray bottle
      GFX.rect(ctx, 38, 28, 6, 12, C.BLUE); // cleaner
      GFX.rect(ctx, 50, 20, 8, 20, '#AA8855'); // mop handle
      // Mop and bucket
      if (!eng.hasItem('mop')) {
        GFX.rect(ctx, 55, 60, 3, 40, '#AA8855');
        GFX.rect(ctx, 52, 58, 9, 4, '#888');
      }
      GFX.rect(ctx, 70, 85, 14, 12, C.GRAY);
      GFX.rect(ctx, 72, 83, 10, 4, C.LTBLUE);
      // Poster ("Employee of the Month: NOT YOU")
      GFX.rect(ctx, 200, 30, 30, 25, C.WHITE);
      GFX.rect(ctx, 202, 32, 26, 12, C.RED);
      GFX.rect(ctx, 205, 47, 20, 6, '#333');
      // Locker
      GFX.rect(ctx, 140, 30, 20, 55, '#556677');
      GFX.rect(ctx, 142, 32, 16, 51, '#667788');
      GFX.rect(ctx, 156, 55, 3, 4, C.DKGRAY);
      // Door
      GFX.drawAirlock(ctx, 250, 60, 24, 40);
      // Flickering light
      const flicker = Math.sin(eng.waterPhase * 8) > -0.2 ? 1 : 0.3;
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = flicker * prevAlpha;
      GFX.rect(ctx, 140, 8, 40, 4, C.WHITE);
      ctx.globalAlpha = prevAlpha;
    },

    walkable: [{ x: 15, y: 105, w: 280, h: 55 }],

    exits: [
      { x: 245, y: 60, w: 35, h: 45, target: 'corridor', entryX: 30, entryY: 130,
        walkX: 262, walkY: 110 }
    ],

    hotspots: [
      {
        name: 'mop', x: 48, y: 55, w: 18, h: 45,
        onLook(eng) { eng.showMessage('Your trusty mop. It\'s been through seven decks and two alien invasions with you. Mostly the decks part.'); },
        onTake(eng) {
          if (eng.hasItem('mop')) { eng.showMessage('You already have the mop. One is enough. You\'re a janitor, not a gladiator.'); return; }
          eng.addItem('mop', 'Trusty Mop', '🧹');
          eng.showMessage('You grab your mop. It\'s not much of a weapon, but it\'s YOUR not-much-of-a-weapon. (+5 points)');
          eng.addScore(5, 'sq_took_mop');
        }
      },
      {
        name: 'bucket', x: 66, y: 82, w: 20, h: 18,
        onLook(eng) { eng.showMessage('A bucket of soapy water. You\'ve been meaning to mop Deck 3 all week. Somehow "alien invasion" seems like a worse excuse than usual.'); },
        onTake(eng) { eng.showMessage('The bucket is too heavy and sloshy to carry around. Besides, you have standards. Low standards, but standards.'); },
        onUse(eng) { eng.showMessage('You dip your hands in the bucket. Clean hands won\'t save the ship, but at least you\'ll leave a good-looking corpse.'); }
      },
      {
        name: 'locker', x: 135, y: 25, w: 28, h: 62,
        onLook(eng) { eng.showMessage('Your locker. It has a picture of a tropical planet taped inside and smells vaguely of gym socks.'); },
        onUse(eng) {
          if (!eng.getFlag('locker_opened')) {
            eng.setFlag('locker_opened');
            eng.addItem('keycard', 'Access Keycard', '🪪');
            eng.showMessage('You open the locker. Inside: a spare uniform, old sandwich (don\'t ask), and your crew access keycard! (+5 points)');
            eng.addScore(5, 'sq_opened_locker');
          } else {
            eng.showMessage('The locker is empty now. Just the lingering smell of that sandwich. It\'s been there since Tuesday. Tuesday of WHICH week is unclear.');
          }
        }
      },
      {
        name: 'employee poster', x: 195, y: 25, w: 40, h: 35,
        onLook(eng) { eng.showMessage('"Employee of the Month" — the photo spot is empty with a sticky note reading "Position Unfilled Since Launch." Ouch.'); },
        onTalk(eng) { eng.showMessage('"I COULD have been Employee of the Month," you mutter. "If they had a category for \'Most Naps.\'"; '); },
        onUse(eng) { eng.showMessage('You paste your face into the frame using a piece of gum. It doesn\'t stick. Story of your career.'); }
      },
      {
        name: 'cleaning supplies', x: 15, y: 20, w: 65, h: 20,
        onLook(eng) { eng.showMessage('An array of cleaning products: Space-Brite&trade;, Nebula-Clean&trade;, and something simply labeled "DON\'T DRINK."'); },
        onTake(eng) { eng.showMessage('You already have a mop. How much more prepared can one janitor be?'); }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('closet_intro')) {
        eng.setFlag('closet_intro');
        eng.showMessage('You wake up in the janitor closet. Alarms are blaring. Red lights flash. This is either an alien invasion or someone microwaved aluminum foil again.');
      }
    }
  };

  // ── 2. CORRIDOR ──
  const corridor = {
    id: 'corridor',
    name: 'Main Corridor',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Metal floor
      GFX.rect(ctx, 0, 95, w, h - 95, '#3a4a5a');
      for (let fx = 0; fx < w; fx += 20) {
        GFX.rect(ctx, fx, 95, 1, h - 95, '#334455');
      }
      // Walls and ceiling
      GFX.rect(ctx, 0, 0, w, 95, '#445566');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 95, '#3a4a5a');
      // Red alert lights
      const alertBlink = Math.sin(eng.waterPhase * 4) > 0;
      if (alertBlink) {
        const prevAlpha = ctx.globalAlpha;
        ctx.globalAlpha = 0.2 * prevAlpha;
        GFX.rect(ctx, 0, 0, w, h, '#FF0000');
        ctx.globalAlpha = prevAlpha;
      }
      GFX.rect(ctx, 50, 10, 6, 4, alertBlink ? C.RED : '#330000');
      GFX.rect(ctx, 160, 10, 6, 4, alertBlink ? C.RED : '#330000');
      GFX.rect(ctx, 270, 10, 6, 4, alertBlink ? C.RED : '#330000');
      // Doors along corridor
      GFX.drawAirlock(ctx, 15, 50, 22, 40); // Janitor closet
      GFX.drawAirlock(ctx, 90, 50, 22, 40); // Bridge
      GFX.drawAirlock(ctx, 190, 50, 22, 40); // Engine room
      GFX.drawAirlock(ctx, 275, 50, 22, 40); // Cargo bay
      // Signs above doors
      GFX.rect(ctx, 18, 42, 16, 6, '#333');
      GFX.rect(ctx, 93, 42, 16, 6, '#333');
      GFX.rect(ctx, 193, 42, 16, 6, '#333');
      GFX.rect(ctx, 278, 42, 16, 6, '#333');
      // Escape pod sign (south)
      GFX.drawAirlock(ctx, 140, 125, 22, 38);
      GFX.rect(ctx, 143, 120, 16, 5, C.YELLOW);
      // Scorch marks
      GFX.rect(ctx, 120, 70, 8, 15, '#222');
      GFX.rect(ctx, 240, 55, 5, 20, '#222');
    },

    walkable: [{ x: 15, y: 100, w: 290, h: 55 }],

    exits: [
      { x: 10, y: 48, w: 30, h: 45, target: 'janitorCloset', entryX: 262, entryY: 110,
        walkX: 26, walkY: 105 },
      { x: 85, y: 48, w: 30, h: 45, target: 'bridge', entryX: 160, entryY: 140,
        walkX: 101, walkY: 105,
        condition(eng) { return eng.hasItem('keycard'); } },
      { x: 185, y: 48, w: 30, h: 45, target: 'engineRoom', entryX: 160, entryY: 140,
        walkX: 201, walkY: 105 },
      { x: 270, y: 48, w: 30, h: 45, target: 'cargoBay', entryX: 160, entryY: 140,
        walkX: 286, walkY: 105 },
      { x: 135, y: 120, w: 30, h: 42, target: 'escapePod', entryX: 160, entryY: 100,
        walkX: 151, walkY: 150 }
    ],

    hotspots: [
      {
        name: 'bridge door', x: 85, y: 42, w: 30, h: 50,
        onLook(eng) { eng.showMessage('The bridge access door. The sign reads "AUTHORIZED PERSONNEL ONLY." Your keycard says "FLOOR STAFF" but it should work.'); },
        onTalk(eng) {
          if (!eng.hasItem('keycard')) {
            eng.showMessage('The door panel beeps disapprovingly. "ACCESS DENIED - Insufficient Clearance." You need your keycard.');
          }
        }
      },
      {
        name: 'scorch marks', x: 115, y: 65, w: 15, h: 25,
        onLook(eng) { eng.showMessage('Blaster scorch marks on the wall. The aliens weren\'t exactly gentle when they boarded. Your colleagues put up a fight. You were napping.'); },
        onTalk(eng) { eng.showMessage('You apologize to the wall for sleeping through the invasion. The wall doesn\'t respond. Walls rarely do.'); }
      },
      {
        name: 'escape pod sign', x: 138, y: 115, w: 28, h: 10,
        onLook(eng) { eng.showMessage('"ESCAPE PODS - Emergency Use Only." Well, this certainly qualifies as an emergency.'); }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('corridor_intro')) {
        eng.setFlag('corridor_intro');
        eng.showMessage('The main corridor of the SS Titanium. Emergency lights flash red. Scorch marks line the walls. Everyone\'s gone — captured by the Sludge Pirates.');
      }
    }
  };

  // ── 3. BRIDGE ──
  const bridge = {
    id: 'bridge',
    name: 'Ship Bridge',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Floor
      GFX.rect(ctx, 0, 90, w, h - 90, '#2a3a4a');
      // Walls
      GFX.rect(ctx, 0, 0, w, 90, '#334455');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 90, '#2a3a4a');
      // Main viewscreen
      GFX.drawViewscreen(ctx, 60, 10, 200, 55, eng.waterPhase);
      // Planet visible through viewscreen
      ctx.save();
      ctx.beginPath();
      ctx.rect(60, 10, 200, 55);
      ctx.clip();
      ctx.fillStyle = '#225533';
      ctx.beginPath();
      ctx.arc(160, 80, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#336644';
      ctx.beginPath();
      ctx.arc(155, 75, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Captain's chair (empty)
      GFX.rect(ctx, 145, 75, 30, 20, '#556677');
      GFX.rect(ctx, 148, 65, 24, 12, '#445566');
      // Console stations
      GFX.drawConsolePanel(ctx, 20, 70, 50, 20, eng.waterPhase);
      GFX.drawConsolePanel(ctx, 250, 70, 50, 20, eng.waterPhase + 1);
      // Helm console
      GFX.drawConsolePanel(ctx, 100, 80, 120, 15, eng.waterPhase + 2);
      // Distress beacon
      if (!eng.getFlag('beacon_sent')) {
        const beaconBlink = Math.sin(eng.waterPhase * 5) > 0;
        GFX.rect(ctx, 35, 72, 8, 5, beaconBlink ? C.RED : '#330000');
      }
      // Exit
      GFX.drawAirlock(ctx, 148, 130, 22, 35);
      // Scattered PADDs
      GFX.rect(ctx, 120, 92, 6, 4, C.LTGRAY);
      GFX.rect(ctx, 200, 88, 6, 4, C.LTGRAY);
    },

    walkable: [{ x: 20, y: 95, w: 280, h: 55 }],

    exits: [
      { x: 143, y: 128, w: 30, h: 38, target: 'corridor', entryX: 101, entryY: 105,
        walkX: 158, walkY: 155 }
    ],

    hotspots: [
      {
        name: 'viewscreen', x: 55, y: 5, w: 210, h: 65,
        onLook(eng) { eng.showMessage('The main viewscreen shows a green planet below. Planet Xenon-7. The Sludge Pirates must have taken the crew there.'); },
        onUse(eng) { eng.showMessage('You poke the viewscreen. It zooms in on the planet\'s surface, revealing a large alien base. That must be where they\'re holding the crew!'); }
      },
      {
        name: 'captain chair', x: 140, y: 62, w: 40, h: 35,
        onLook(eng) { eng.showMessage('The captain\'s chair. Empty now. Captain Willis was probably the first one they grabbed. She would have gone down fighting.'); },
        onUse(eng) {
          if (!eng.getFlag('sat_captain_chair')) {
            eng.setFlag('sat_captain_chair');
            eng.showMessage('You sit in the captain\'s chair. "Captain\'s log: We\'re in deep trouble and the only hope is the janitor." This log will be classified. (+5 points)');
            eng.addScore(5, 'sq_sat_captain_chair');
          } else {
            eng.showMessage('You sit in the chair again. "Supplemental: Still the janitor. Still doomed."');
          }
        },
        onTalk(eng) { eng.showMessage('"Computer, status report." Silence. "Computer?" The ship\'s AI was probably captured too. Or turned off because nobody paid the electric bill.'); }
      },
      {
        name: 'distress beacon', x: 30, y: 68, w: 20, h: 12,
        onLook(eng) { eng.showMessage('The distress beacon control. A blinking red light indicates it\'s ready to fire.'); },
        onUse(eng) {
          if (!eng.getFlag('beacon_sent')) {
            eng.setFlag('beacon_sent');
            eng.showMessage('You activate the distress beacon! It fires off into space. Help could arrive in... 6 to 47 weeks. You\'ll need to rescue the crew yourself. (+10 points)');
            eng.addScore(10, 'sq_sent_distress_beacon');
          } else {
            eng.showMessage('The beacon has already been sent. Now it\'s just you, a mop, and a bad feeling about all of this.');
          }
        }
      },
      {
        name: 'helm console', x: 95, y: 78, w: 130, h: 18,
        onLook(eng) { eng.showMessage('The helm console. Navigation, weapons, shields — all offline. The Sludge Pirates disabled everything before taking the crew.'); },
        onUse(eng) {
          if (!eng.getFlag('helm_accessed')) {
            eng.setFlag('helm_accessed');
            eng.addItem('translator', 'Universal Translator', '📡');
            eng.showMessage('You manage to activate one system: the universal translator module! It ejects from the console. Might be useful planetside. (+10 points)');
            eng.addScore(10, 'sq_got_translator');
          } else {
            eng.showMessage('The console sparks and displays "NICE TRY, JANITOR." Even the computer is roasting you.');
          }
        }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('bridge_intro')) {
        eng.setFlag('bridge_intro');
        eng.showMessage('The bridge of the SS Titanium. All stations are abandoned. Emergency power is barely keeping the lights on. A planet looms large on the viewscreen.');
      }
    }
  };

  // ── 4. ENGINE ROOM ──
  const engineRoom = {
    id: 'engineRoom',
    name: 'Engine Room',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Metal grating floor
      GFX.rect(ctx, 0, 95, w, h - 95, '#2a2a35');
      for (let fy = 95; fy < h; fy += 4) {
        for (let fx = 0; fx < w; fx += 4) {
          GFX.pixel(ctx, fx, fy, '#222230');
        }
      }
      // Walls
      GFX.rect(ctx, 0, 0, w, 95, '#333345');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 95, '#2a2a3a');
      // Main engine core
      GFX.rect(ctx, 130, 20, 60, 75, '#223344');
      GFX.rect(ctx, 135, 25, 50, 65, '#112233');
      // Engine glow
      const engineGlow = Math.sin(eng.waterPhase * 2) * 0.2 + 0.6;
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = engineGlow * prevAlpha;
      GFX.rect(ctx, 140, 30, 40, 55, '#0066FF');
      ctx.globalAlpha = prevAlpha;
      // Pipes
      GFX.rect(ctx, 20, 30, 110, 4, '#556677');
      GFX.rect(ctx, 190, 30, 110, 4, '#556677');
      GFX.rect(ctx, 20, 60, 110, 4, '#556677');
      GFX.rect(ctx, 190, 60, 110, 4, '#556677');
      // Fuse box
      GFX.rect(ctx, 30, 45, 25, 20, '#445566');
      GFX.rect(ctx, 32, 47, 21, 16, '#334455');
      if (!eng.getFlag('fuse_replaced')) {
        // Empty fuse slot (blinking warning)
        const warn = Math.sin(eng.waterPhase * 3) > 0;
        GFX.rect(ctx, 38, 52, 8, 6, warn ? C.RED : '#330000');
      } else {
        GFX.rect(ctx, 38, 52, 8, 6, C.GREEN);
      }
      // Spare fuse
      if (!eng.hasItem('fuse') && !eng.getFlag('fuse_replaced')) {
        GFX.rect(ctx, 265, 68, 6, 10, C.YELLOW);
        GFX.rect(ctx, 266, 70, 4, 6, C.ORANGE);
      }
      // Control panels
      GFX.drawConsolePanel(ctx, 250, 40, 40, 20, eng.waterPhase);
      // Warning signs
      GFX.rect(ctx, 80, 20, 20, 12, C.YELLOW);
      GFX.rect(ctx, 84, 22, 12, 8, C.BLACK);
      // Exit
      GFX.drawAirlock(ctx, 148, 126, 22, 38);
    },

    walkable: [{ x: 15, y: 100, w: 285, h: 55 }],

    exits: [
      { x: 143, y: 124, w: 30, h: 40, target: 'corridor', entryX: 201, entryY: 105,
        walkX: 159, walkY: 155 }
    ],

    hotspots: [
      {
        name: 'engine core', x: 125, y: 15, w: 70, h: 85,
        onLook(eng) { eng.showMessage('The main engine core. It\'s running on emergency power — a dim blue glow instead of its usual blindingly-bright blue glow.'); },
        onUse(eng) { eng.showMessage('You touch the engine core. It\'s warm. You feel a tingle. That\'s either residual energy or the onset of radiation poisoning.'); },
        onTalk(eng) { eng.showMessage('"Come on, baby, you can do it," you whisper to the engine. It flickers. Was that a response or a death rattle?'); }
      },
      {
        name: 'fuse box', x: 25, y: 40, w: 35, h: 30,
        onLook(eng) {
          if (eng.getFlag('fuse_replaced')) {
            eng.showMessage('The fuse box is operational. The green light indicates the secondary systems are back online.');
          } else {
            eng.showMessage('The fuse box has a blown fuse — the secondary power coupling. There should be a spare fuse somewhere in here.');
          }
        },
        onUse(eng) {
          if (eng.getFlag('fuse_replaced')) {
            eng.showMessage('The fuse is already replaced. Systems nominal. Well, as nominal as they get on this bucket.');
            return;
          }
          if (eng.hasItem('fuse')) {
            eng.removeItem('fuse');
            eng.setFlag('fuse_replaced');
            eng.showMessage('You slot the spare fuse into the box. CLICK. Secondary systems come online! The escape pod bay should be powered now! (+15 points)');
            eng.addScore(15, 'sq_replaced_fuse');
          } else {
            eng.showMessage('The fuse box needs a replacement fuse. There might be a spare one around here somewhere.');
          }
        }
      },
      {
        name: 'spare fuse', x: 260, y: 63, w: 16, h: 18,
        onLook(eng) { eng.showMessage('A spare engine fuse, tucked behind the auxiliary console. Standard issue, compatible with the blown one in the fuse box.'); },
        onTake(eng) {
          if (eng.hasItem('fuse') || eng.getFlag('fuse_replaced')) { eng.showMessage('You don\'t need another fuse.'); return; }
          eng.addItem('fuse', 'Engine Fuse', '🔌');
          eng.showMessage('You pocket the spare fuse. This could restore secondary power! (+5 points)');
          eng.addScore(5, 'sq_took_fuse');
        }
      },
      {
        name: 'warning sign', x: 75, y: 15, w: 30, h: 18,
        onLook(eng) { eng.showMessage('"CAUTION: Do not touch engine core without protective gear." You\'re wearing a janitor uniform. Close enough.'); }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('engine_intro')) {
        eng.setFlag('engine_intro');
        eng.showMessage('The engine room. The main core pulses with a faint blue glow. Something\'s wrong — a blown fuse has knocked out secondary power.');
      }
    }
  };

  // ── 5. CARGO BAY ──
  const cargoBay = {
    id: 'cargoBay',
    name: 'Cargo Bay',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Metal floor
      GFX.rect(ctx, 0, 90, w, h - 90, '#2a3040');
      // Walls
      GFX.rect(ctx, 0, 0, w, 90, '#3a4050');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 90, '#2a3040');
      // Crates
      GFX.rect(ctx, 20, 65, 30, 25, '#6a5530');
      GFX.rect(ctx, 21, 66, 28, 5, '#7a6540');
      GFX.rect(ctx, 55, 55, 25, 35, '#5a4520');
      GFX.rect(ctx, 56, 56, 23, 5, '#6a5530');
      GFX.rect(ctx, 35, 50, 22, 15, '#6a5530');
      // More crates right
      GFX.rect(ctx, 240, 60, 35, 30, '#5a4520');
      GFX.rect(ctx, 280, 70, 25, 20, '#6a5530');
      // Space suit rack
      if (!eng.hasItem('space_suit')) {
        GFX.rect(ctx, 150, 30, 20, 50, '#667788');
        GFX.rect(ctx, 152, 32, 16, 20, C.WHITE);
        GFX.rect(ctx, 155, 52, 10, 8, '#AABB00');
        GFX.rect(ctx, 156, 60, 8, 18, C.WHITE);
      } else {
        GFX.rect(ctx, 150, 30, 20, 50, '#667788');
      }
      // Alien slime trail
      const slimeAlpha = 0.4 + Math.sin(eng.waterPhase) * 0.1;
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = slimeAlpha * prevAlpha;
      for (let sx = 100; sx < 250; sx += 15) {
        GFX.rect(ctx, sx, 92 + Math.sin(sx * 0.1) * 3, 8, 3, '#44FF44');
      }
      ctx.globalAlpha = prevAlpha;
      // Exit
      GFX.drawAirlock(ctx, 148, 126, 22, 38);
    },

    walkable: [{ x: 15, y: 95, w: 285, h: 55 }],

    exits: [
      { x: 143, y: 124, w: 30, h: 40, target: 'corridor', entryX: 286, entryY: 105,
        walkX: 159, walkY: 155 }
    ],

    hotspots: [
      {
        name: 'crates', x: 15, y: 45, w: 70, h: 50,
        onLook(eng) { eng.showMessage('Supply crates. Most are labeled "FOOD RATIONS" or "CLEANING PRODUCTS." One says "DO NOT OPEN - DEFINITELY NOT WEAPONS" in handwriting.'); },
        onUse(eng) {
          if (!eng.getFlag('crate_opened')) {
            eng.setFlag('crate_opened');
            eng.addItem('laser_gun', 'Laser Gun', '🔫');
            eng.showMessage('You open the suspicious crate. Inside: a laser gun! It was labeled as "cleaning supplies" on the manifest. Convenient! (+10 points)');
            eng.addScore(10, 'sq_found_laser_gun');
          } else {
            eng.showMessage('The other crates contain actual food rations and cleaning supplies. Boring.');
          }
        },
        onTalk(eng) { eng.showMessage('"Any of you crates have a \'Save The Ship\' kit?" They do not respond. Crates are like that.'); }
      },
      {
        name: 'space suit', x: 145, y: 25, w: 30, h: 60,
        onLook(eng) { eng.showMessage('An EVA space suit on a rack. Helmet, boots, life support — the works. You\'d need this to survive on an alien planet.'); },
        onTake(eng) {
          if (eng.hasItem('space_suit')) { eng.showMessage('You\'re already wearing the space suit. One is plenty.'); return; }
          eng.addItem('space_suit', 'Space Suit', '🧑‍🚀');
          eng.showMessage('You grab the space suit and struggle into it. It\'s two sizes too big. You look like a marshmallow. A brave marshmallow. (+5 points)');
          eng.addScore(5, 'sq_took_space_suit');
        }
      },
      {
        name: 'alien slime', x: 95, y: 88, w: 160, h: 12,
        onLook(eng) { eng.showMessage('Green alien slime, still wet. The Sludge Pirates came through here. The trail leads from the airlock. Gross.'); },
        onUse(eng) { eng.showMessage('You poke the slime with your mop. It sizzles. The mop is fine. Your dignity is not.'); },
        onTalk(eng) { eng.showMessage('"Disgusting," you mutter at the slime. Then you feel bad. It\'s not the slime\'s fault.'); }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('cargo_intro')) {
        eng.setFlag('cargo_intro');
        eng.showMessage('The cargo bay. Crates are scattered everywhere. An alien slime trail crosses the floor. A space suit hangs on a rack near the back wall.');
      }
    }
  };

  // ── 6. ESCAPE POD BAY ──
  const escapePod = {
    id: 'escapePod',
    name: 'Escape Pod Bay',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Floor
      GFX.rect(ctx, 0, 90, w, h - 90, '#2a353a');
      // Walls
      GFX.rect(ctx, 0, 0, w, 90, '#354550');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 90, '#2a353a');
      // Pod bays
      for (let i = 0; i < 3; i++) {
        const px = 40 + i * 100;
        GFX.rect(ctx, px, 25, 40, 55, '#445566');
        GFX.rect(ctx, px + 2, 27, 36, 51, '#223344');
        if (i < 2) {
          // Empty pods (jettisoned)
          GFX.rect(ctx, px + 5, 35, 30, 35, '#111');
          GFX.rect(ctx, px + 10, 45, 20, 6, C.RED);
        } else {
          // Working pod
          if (!eng.getFlag('fuse_replaced')) {
            // No power
            GFX.rect(ctx, px + 5, 35, 30, 35, '#333');
            GFX.rect(ctx, px + 10, 50, 20, 6, C.DKGRAY);
          } else {
            GFX.rect(ctx, px + 5, 35, 30, 35, '#334466');
            const ready = Math.sin(eng.waterPhase * 2) > 0;
            GFX.rect(ctx, px + 10, 50, 20, 6, ready ? C.GREEN : '#003300');
            // Interior visible
            GFX.rect(ctx, px + 10, 38, 20, 10, '#445577');
          }
        }
      }
      // Labels
      GFX.rect(ctx, 48, 82, 24, 5, C.RED);   // "EMPTY"
      GFX.rect(ctx, 148, 82, 24, 5, C.RED);  // "EMPTY"
      GFX.rect(ctx, 248, 82, 24, 5, eng.getFlag('fuse_replaced') ? C.GREEN : C.DKGRAY);
      // Exit
      GFX.drawAirlock(ctx, 148, 126, 22, 38);
    },

    walkable: [{ x: 15, y: 95, w: 285, h: 55 }],

    exits: [
      { x: 143, y: 124, w: 30, h: 40, target: 'corridor', entryX: 151, entryY: 140,
        walkX: 159, walkY: 155 }
    ],

    hotspots: [
      {
        name: 'pod 1', x: 35, y: 20, w: 50, h: 70,
        onLook(eng) { eng.showMessage('Pod Bay 1 — EMPTY. Jettisoned during the attack. Someone was smarter than you and got out early.'); },
        onUse(eng) { eng.showMessage('The pod is gone. Just an empty bay and the cold void of space beyond. Don\'t jump in.'); }
      },
      {
        name: 'pod 2', x: 135, y: 20, w: 50, h: 70,
        onLook(eng) { eng.showMessage('Pod Bay 2 — also EMPTY. The second pod was jettisoned too. You really overslept this invasion.'); }
      },
      {
        name: 'pod 3', x: 235, y: 20, w: 50, h: 70,
        onLook(eng) { eng.showMessage(eng.getFlag('fuse_replaced') ?
          'Pod Bay 3 — OPERATIONAL! Green light. This pod can take you to the planet surface!' :
          'Pod Bay 3 — NO POWER. The secondary systems are offline. You need to fix the engine room fuse to power this pod.'); },
        onUse(eng) {
          if (!eng.getFlag('fuse_replaced')) {
            eng.showMessage('The pod has no power. The fuse box in the engine room needs a replacement fuse to restore secondary systems.');
            return;
          }
          if (!eng.hasItem('space_suit')) {
            eng.showMessage('You can\'t go to an alien planet without a space suit! Check the cargo bay.');
            return;
          }
          eng.showMessage('You climb into the escape pod, strap in, and hit the launch button. WHOOOOSH! Next stop: Planet Xenon-7! (+10 points)');
          eng.addScore(10, 'sq_launched_escape_pod');
          setTimeout(() => eng.changeScene('alienPlanet', 160, 130), 2500);
        },
        onTalk(eng) { eng.showMessage('"Ready to launch?" you ask the pod. It hums in response. You choose to interpret that as "yes."'); }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('pod_intro')) {
        eng.setFlag('pod_intro');
        eng.showMessage('The Escape Pod Bay. Two of three pods are gone. The last one sits in Bay 3, waiting for power.');
      }
    }
  };

  // ── 7. ALIEN PLANET ──
  const alienPlanet = {
    id: 'alienPlanet',
    name: 'Planet Xenon-7',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Alien sky
      GFX.drawSky(ctx, w, h * 0.4, '#220044', '#443366');
      // Two moons
      ctx.fillStyle = '#AAAACC';
      ctx.beginPath();
      ctx.arc(80, 30, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#CC8844';
      ctx.beginPath();
      ctx.arc(250, 20, 8, 0, Math.PI * 2);
      ctx.fill();
      // Alien terrain
      GFX.rect(ctx, 0, 70, w, h - 70, '#334422');
      GFX.rect(ctx, 0, 70, w, 5, '#445533');
      // Weird alien plants
      GFX.drawAlienPlant(ctx, 40, 90, 25, '#44CC88');
      GFX.drawAlienPlant(ctx, 270, 85, 30, '#88CC44');
      GFX.drawAlienPlant(ctx, 180, 75, 20, '#CC44CC');
      // Alien crystals
      GFX.drawCrystal(ctx, 100, 80, 12, '#FF44FF');
      GFX.drawCrystal(ctx, 220, 78, 8, '#44FFFF');
      // Rocky outcrops
      GFX.rect(ctx, 0, 72, 30, 15, '#554433');
      GFX.rect(ctx, 290, 68, 30, 20, '#554433');
      // Crashed escape pod
      GFX.rect(ctx, 130, 85, 30, 15, '#556677');
      GFX.rect(ctx, 132, 80, 26, 8, '#445566');
      GFX.rect(ctx, 125, 95, 40, 5, '#333');
      // Path to alien base (north)
      GFX.rect(ctx, 140, 70, 40, 30, '#3a4a2a');
      // Path to spaceBar (east)
      GFX.rect(ctx, 280, 100, 40, 20, '#3a4a2a');
    },

    walkable: [{ x: 15, y: 95, w: 290, h: 55 }],

    exits: [
      { x: 135, y: 70, w: 50, h: 10, target: 'alienBase', entryX: 160, entryY: 145,
        walkX: 160, walkY: 98,
        condition(eng) { return eng.hasItem('laser_gun'); } },
      { x: 295, y: 95, w: 25, h: 30, target: 'spaceBar', entryX: 30, entryY: 130,
        walkX: 300, walkY: 115 }
    ],

    hotspots: [
      {
        name: 'crashed pod', x: 120, y: 78, w: 45, h: 22,
        onLook(eng) { eng.showMessage('Your escape pod. The landing was... rough. The pod is half-buried in alien soil. It won\'t be flying again anytime soon.'); },
        onUse(eng) { eng.showMessage('You try to radio the ship. Static. The pod\'s communications were fried on entry. You\'re on your own.'); },
        onTalk(eng) { eng.showMessage('"Thanks for the lift," you tell the pod. It creaks ominously. "Please don\'t explode."'); }
      },
      {
        name: 'alien plants', x: 165, y: 55, w: 30, h: 30,
        onLook(eng) { eng.showMessage('Strange alien plants with bulbous, glowing pods. They pulse gently, as if breathing. Creepy and beautiful.'); },
        onUse(eng) { eng.showMessage('You poke a plant pod. It squirts purple juice on your suit. The suit\'s AI says: "Contamination detected. Have a nice day."'); },
        onTalk(eng) { eng.showMessage('"Take me to your leader," you say to the plant. It sways in the wind. A diplomatic breakthrough this is not.'); }
      },
      {
        name: 'alien crystals', x: 95, y: 68, w: 15, h: 15,
        onLook(eng) { eng.showMessage('Pink and cyan crystals jut from the alien soil. They hum at a frequency that makes your teeth itch.'); },
        onTake(eng) { eng.showMessage('You try to pull a crystal. It\'s rooted deep. The ground vibrates disapprovingly. Leave the shiny rocks alone.'); }
      },
      {
        name: 'path to base', x: 135, y: 68, w: 50, h: 15,
        onLook(eng) {
          if (!eng.hasItem('laser_gun')) {
            eng.showMessage('A path leads north to the alien base. You can see guard towers in the distance. Going unarmed would be suicide.');
          } else {
            eng.showMessage('A path leads north to the alien base. You\'re armed with a laser gun. Time to be a hero. Or at least try.');
          }
        }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('planet_intro')) {
        eng.setFlag('planet_intro');
        eng.showMessage('Planet Xenon-7. Purple sky, twin moons, and alien vegetation. Your escape pod is wrecked. The alien base lies to the north. A cantina sign glows to the east.');
      }
    }
  };

  // ── 8. SPACE BAR ──
  const spaceBar = {
    id: 'spaceBar',
    name: "Ulnar's Cantina",

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Floor
      GFX.rect(ctx, 0, 90, w, h - 90, '#2a2020');
      // Walls
      GFX.rect(ctx, 0, 0, w, 90, '#3a3030');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 90, '#2a2020');
      // Bar counter
      GFX.drawBarCounter(ctx, 100, 60, 130);
      // Bottles (alien colors)
      GFX.rect(ctx, 105, 30, 120, 25, '#2a2020');
      const bottleColors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF4400', '#44FF44', '#4444FF'];
      for (let bx = 110; bx < 220; bx += 18) {
        const bc = bottleColors[Math.floor((bx - 110) / 18) % bottleColors.length];
        GFX.rect(ctx, bx, 32, 5, 18, bc);
        GFX.rect(ctx, bx + 1, 28, 3, 4, bc);
      }
      // Alien decorations
      GFX.rect(ctx, 20, 20, 25, 25, '#333');
      GFX.rect(ctx, 22, 22, 21, 21, '#440044'); // alien art
      GFX.rect(ctx, 270, 25, 20, 20, '#333');
      GFX.rect(ctx, 272, 27, 16, 16, '#004444');
      // Tables
      GFX.rect(ctx, 30, 95, 18, 10, '#554433');
      GFX.rect(ctx, 260, 100, 18, 10, '#554433');
      // Neon alien signs
      GFX.drawNeonSign(ctx, 50, 10, 30, 6, '#FF00FF', eng.waterPhase);
      GFX.drawNeonSign(ctx, 230, 10, 30, 6, '#00FFFF', eng.waterPhase + 0.5);
      // Exit
      GFX.drawAirlock(ctx, 2, 100, 14, 35);
    },

    walkable: [{ x: 15, y: 100, w: 290, h: 50 }],

    exits: [
      { x: 0, y: 98, w: 18, h: 40, target: 'alienPlanet', entryX: 290, entryY: 115,
        walkX: 10, walkY: 120 }
    ],

    hotspots: [
      {
        name: 'alien bar', x: 100, y: 55, w: 130, h: 30,
        onLook(eng) { eng.showMessage('The bar serves alien drinks with names like "Gravimetric Grog" and "Quantum Quaff." The prices are listed in currencies you don\'t recognize.'); },
        onUse(eng) {
          if (!eng.getFlag('alien_drink')) {
            eng.setFlag('alien_drink');
            eng.showMessage('You order something blue and fizzy. It tastes like licking a battery dipped in mint. Your vision goes purple for a moment. Refreshing!');
          } else {
            eng.showMessage('You order another alien drink. This one is green and solid. You have to chew it. 2/10 experience.');
          }
        }
      },
      {
        name: 'alien art', x: 15, y: 15, w: 35, h: 35,
        onLook(eng) { eng.showMessage('Alien artwork on the wall. It either depicts a beautiful sunset or a horrific battle. Hard to tell with alien aesthetics.'); },
        onTalk(eng) { eng.showMessage('"Beautiful," you say about the art. Your translator renders this as "YOUR MOTHER IS A SPACE SLUG" in alien. Awkward.'); }
      }
    ],

    npcs: [
      {
        name: 'Ulnar', x: 170, y: 95, w: 20, h: 30,
        draw(ctx, eng) { GFX.drawAlien(ctx, 170, 95, eng.waterPhase); },
        onLook(eng) { eng.showMessage('Ulnar, the bartender. Green skin, three eyes, antennae. Seems friendly enough, in a "might eat you later" kind of way.'); },
        onTalk(eng) {
          if (eng.hasItem('translator')) {
            eng.showDialog('Ulnar', '"Greetings, tiny mammal! The Sludge Pirates are in the base north of here. Their security code is 42-42-42. They\'re not creative."', ['Thanks for the info!', 'How do you know that?'], (choice) => {
              if (choice === 0) {
                if (!eng.getFlag('got_security_code')) {
                  eng.setFlag('got_security_code');
                  eng.showMessage('Now you know the security code! The alien base awaits. (+10 points)');
                  eng.addScore(10, 'sq_learned_security_code');
                }
              } else {
                eng.showMessage('"I hear things," Ulnar says, all three eyes shifting. "The walls have ears. Literally. Alien architecture is weird."');
              }
            });
          } else {
            eng.showMessage('Ulnar speaks in clicks and whistles. Without a translator, you just smile and nod. Ulnar seems confused by your mammalian face movements.');
          }
        },
        onUse(eng) { eng.showMessage('You try to shake hands with Ulnar. He has seven fingers. It\'s awkward but culturally enriching.'); }
      }
    ],

    onEnter(eng) {
      if (!eng.getFlag('bar_sq_intro')) {
        eng.setFlag('bar_sq_intro');
        eng.showMessage('Ulnar\'s Cantina — an alien bar on the edge of civilization. Strange music plays. Strange drinks are served. Strange patrons lurk in the shadows.');
      }
    }
  };

  // ── 9. ALIEN BASE ──
  const alienBase = {
    id: 'alienBase',
    name: 'Sludge Pirate Base',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Metal floor
      GFX.rect(ctx, 0, 90, w, h - 90, '#333322');
      // Alien walls — more organic/slimy
      GFX.rect(ctx, 0, 0, w, 90, '#3a3a22');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 90, '#2a2a18');
      // Slime on walls
      for (let sx = 0; sx < w; sx += 30) {
        const drip = 30 + Math.sin(sx * 0.5) * 15;
        const prevAlpha = ctx.globalAlpha;
        ctx.globalAlpha = 0.3 * prevAlpha;
        GFX.rect(ctx, sx, 0, 8, drip, '#44FF44');
        ctx.globalAlpha = prevAlpha;
      }
      // Prison cells
      for (let i = 0; i < 3; i++) {
        const cx = 40 + i * 90;
        GFX.rect(ctx, cx, 35, 50, 50, '#222');
        GFX.rect(ctx, cx + 2, 37, 46, 46, '#1a1a11');
        // Bars
        for (let bx = cx + 6; bx < cx + 48; bx += 8) {
          GFX.rect(ctx, bx, 35, 2, 50, '#667744');
        }
        // Crew silhouettes inside
        if (!eng.getFlag('crew_rescued')) {
          GFX.rect(ctx, cx + 15, 55, 6, 15, '#556');
          GFX.rect(ctx, cx + 25, 55, 6, 15, '#556');
        }
      }
      // Control panel (lock mechanism)
      GFX.drawConsolePanel(ctx, 135, 65, 50, 20, eng.waterPhase);
      if (!eng.getFlag('crew_rescued')) {
        const lockLight = Math.sin(eng.waterPhase * 3) > 0;
        GFX.rect(ctx, 155, 68, 10, 6, lockLight ? C.RED : '#330000');
      } else {
        GFX.rect(ctx, 155, 68, 10, 6, C.GREEN);
      }
      // Exit
      GFX.drawAirlock(ctx, 148, 126, 22, 38);
      // Alien guard (defeated)
      if (eng.getFlag('guard_defeated')) {
        GFX.rect(ctx, 280, 105, 20, 8, '#33AA55');
        GFX.rect(ctx, 283, 100, 8, 5, '#33AA55');
      }
    },

    walkable: [{ x: 15, y: 95, w: 285, h: 55 }],

    exits: [
      { x: 143, y: 124, w: 30, h: 40, target: 'alienPlanet', entryX: 160, entryY: 100,
        walkX: 159, walkY: 155 }
    ],

    hotspots: [
      {
        name: 'prison cells', x: 30, y: 30, w: 260, h: 60,
        onLook(eng) {
          if (eng.getFlag('crew_rescued')) {
            eng.showMessage('The cells are empty now. The crew is free! Time to get everyone back to the ship.');
          } else {
            eng.showMessage('Three prison cells, each containing members of the SS Titanium crew. They look scared but alive. The cells are locked by a central control panel.');
          }
        },
        onTalk(eng) {
          if (eng.getFlag('crew_rescued')) { eng.showMessage('The crew has already been freed!'); return; }
          eng.showMessage('"Hang on, everyone! I\'m here to rescue you!" The crew exchanges worried glances. "The JANITOR is our rescuer?"');
        }
      },
      {
        name: 'lock control', x: 130, y: 60, w: 60, h: 30,
        onLook(eng) { eng.showMessage('The cell lock control panel. It requires a security code to release the prisoners.'); },
        onUse(eng) {
          if (eng.getFlag('crew_rescued')) { eng.showMessage('The cells are already open.'); return; }
          if (eng.getFlag('got_security_code')) {
            eng.setFlag('crew_rescued');
            eng.showMessage('You enter code 42-42-42. CLICK! All cells open! The crew rushes out in disbelief. "THE JANITOR SAVED US?!" Captain Willis shakes your hand! (+25 points)');
            eng.addScore(25, 'sq_rescued_crew');
            setTimeout(() => {
              eng.win('Against all odds, the janitor of the SS Titanium has saved the entire crew! Captain Willis personally recommends you for "Employee of the Month" — for the first time in the ship\'s history. You also get a raise. And a new mop. The galaxy is safe, thanks to the most unlikely hero since... well, ever.');
            }, 3000);
          } else {
            eng.showMessage('The panel demands a security code. You try 1234. Access denied. You try 0000. Access denied. Maybe someone on this planet knows the code?');
          }
        }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('base_intro')) {
        eng.setFlag('base_intro');
        // Auto-defeat guard if armed
        if (eng.hasItem('laser_gun') && !eng.getFlag('guard_defeated')) {
          eng.setFlag('guard_defeated');
          eng.showMessage('You sneak into the Sludge Pirate Base! A guard spots you, but you zap it with your laser gun! The guard drops like a sack of alien potatoes.');
        } else {
          eng.showMessage('The Sludge Pirate Base. Slimy walls, dim lighting, and three prison cells holding the crew of the SS Titanium.');
        }
      }
    }
  };

  // ═══════════════════════════════════
  //  SCENE LOOK DESCRIPTIONS
  // ═══════════════════════════════════
  const sceneDescriptions = {
    janitorCloset: 'Your janitor closet — home sweet home. Cleaning supplies on a shelf, your locker, a bucket, and the lingering scent of industrial cleaner. The one place on the ship the aliens didn\'t bother searching.',
    corridor: 'The main corridor of the SS Titanium. Emergency lighting casts everything in red. Scorch marks from blaster fire scar the walls. Doors lead to the bridge, engine room, cargo bay, and escape pods.',
    bridge: 'The ship\'s bridge — normally bustling with crew, now eerily empty. The viewscreen shows Planet Xenon-7 below. Banks of dead consoles surround the captain\'s chair.',
    engineRoom: 'The engine room. The main drive core pulses weakly with blue light. Pipes run along the ceiling. A blown fuse has disabled secondary systems.',
    cargoBay: 'The cargo bay, cluttered with supply crates. An alien slime trail crosses the floor. A space suit hangs on a rack against the far wall.',
    escapePod: 'The escape pod bay. Three pod berths line the wall. Pods 1 and 2 are gone. Pod 3 remains, waiting for power.',
    alienPlanet: 'The surface of Planet Xenon-7. Twin moons hang in a purple sky. Alien plants glow in eerie colors. Your crashed escape pod sits amid strange crystals.',
    spaceBar: 'Ulnar\'s Cantina — a seedy alien bar lit by neon signs in colors that probably don\'t exist on Earth. Exotic bottles line the shelves.',
    alienBase: 'The Sludge Pirate Base — an organic-looking structure with slimy walls. Prison cells hold the captured crew. A central control panel manages the cell locks.',
  };

  const allScenes = { janitorCloset, corridor, bridge, engineRoom, cargoBay, escapePod, alienPlanet, spaceBar, alienBase };
  Object.entries(sceneDescriptions).forEach(([id, desc]) => {
    if (allScenes[id]) allScenes[id].onLookScene = function(eng) { eng.showMessage(desc); };
  });

  // ═══════════════════════════════════
  //  REGISTER SCENES
  // ═══════════════════════════════════
  window.GameWorlds = window.GameWorlds || {};
  window.GameWorlds.sq = allScenes;

})();
