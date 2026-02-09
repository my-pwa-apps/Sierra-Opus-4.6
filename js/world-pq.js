/* ============================================
   Police Quest: Code Blue
   World - Scenes, Dialogs, Items, Puzzles
   An Original Sierra-style Adventure
   ============================================ */

(function() {
  const C = GFX.C;

  // ── 1. BRIEFING ROOM (Start) ──
  const briefingRoom = {
    id: 'briefingRoom',
    name: 'Briefing Room',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Floor
      GFX.rect(ctx, 0, 100, w, h - 100, '#3a3a3a');
      // Walls
      GFX.rect(ctx, 0, 0, w, 100, '#556655');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 100, '#445544');
      // Whiteboard
      GFX.rect(ctx, 60, 15, 130, 55, '#CCCCBB');
      GFX.rect(ctx, 58, 13, 134, 3, '#887755');
      GFX.rect(ctx, 58, 70, 134, 3, '#887755');
      // Marker writing on board (squiggles)
      for (let mx = 70; mx < 180; mx += 12) {
        GFX.rect(ctx, mx, 25 + Math.sin(mx * 0.3) * 3, 8, 2, C.BLUE);
        GFX.rect(ctx, mx, 38 + Math.sin(mx * 0.4) * 2, 8, 2, C.RED);
        GFX.rect(ctx, mx, 50 + Math.sin(mx * 0.2) * 2, 8, 2, C.BLACK);
      }
      // Podium
      GFX.rect(ctx, 130, 78, 30, 22, '#665533');
      GFX.rect(ctx, 128, 76, 34, 4, '#776644');
      // Badge on podium
      GFX.rect(ctx, 140, 82, 10, 10, C.YELLOW);
      // Chairs (rows)
      for (let cy = 110; cy < h; cy += 15) {
        for (let cx = 40; cx < 280; cx += 35) {
          GFX.rect(ctx, cx, cy, 12, 8, '#664422');
          GFX.rect(ctx, cx + 1, cy - 6, 10, 6, '#775533');
        }
      }
      // American flag
      GFX.rect(ctx, 20, 20, 25, 15, C.RED);
      GFX.rect(ctx, 20, 22, 25, 2, C.WHITE);
      GFX.rect(ctx, 20, 26, 25, 2, C.WHITE);
      GFX.rect(ctx, 20, 30, 25, 2, C.WHITE);
      GFX.rect(ctx, 20, 20, 10, 8, C.BLUE);
      // City flag
      GFX.rect(ctx, 265, 20, 25, 15, C.BLUE);
      GFX.rect(ctx, 270, 24, 15, 7, C.YELLOW);
      // Door
      GFX.rect(ctx, 250, 60, 20, 38, '#886644');
      GFX.rect(ctx, 266, 78, 3, 4, C.YELLOW);
    },

    walkable: [{ x: 25, y: 105, w: 275, h: 50 }],

    exits: [
      { x: 246, y: 58, w: 28, h: 42, target: 'office', entryX: 30, entryY: 130,
        walkX: 260, walkY: 110 }
    ],

    hotspots: [
      {
        name: 'whiteboard', x: 55, y: 10, w: 140, h: 65,
        onLook(eng) { eng.showMessage('The briefing whiteboard. Today\'s topic: "Serial Burglaries — 4 hits this week." Red pins mark locations on a map sketch. Blue notes list evidence.'); },
        onUse(eng) { eng.showMessage('You add a small doodle of a suspect in the corner. It looks like a potato with a ski mask. You quickly erase it.'); },
        onTalk(eng) { eng.showMessage('"Four burglaries, same M.O., no witnesses," you mutter, studying the board. "Someone knows something."'); }
      },
      {
        name: 'podium badge', x: 125, y: 74, w: 40, h: 28,
        onLook(eng) { eng.showMessage('The briefing podium. A badge sits on top — your badge. Freshly polished, freshly issued, and not yet dented by the realities of police work.'); },
        onTake(eng) {
          if (eng.hasItem('badge')) { eng.showMessage('You already have your badge. It\'s pinned to your chest. Very shiny.'); return; }
          eng.addItem('badge', '⭐', 'Police Badge');
          eng.showMessage('You pin the badge to your uniform. Officer Jack Stone, Lytton Springs PD. You feel a swell of pride. And a little bit of terror. (+5 points)');
          eng.addScore(5);
        }
      },
      {
        name: 'flags', x: 15, y: 15, w: 35, h: 25,
        onLook(eng) { eng.showMessage('The American flag and the City of Lytton Springs flag. They hang with solemn dignity in an otherwise chaotic room.'); },
        onTalk(eng) { eng.showMessage('You pledge to serve and protect. The flags don\'t respond, but they seem approving.'); }
      },
      {
        name: 'chairs', x: 30, y: 105, w: 260, h: 50,
        onLook(eng) { eng.showMessage('Folding chairs for officers during briefings. Most have coffee rings on the armrests. One has "SGT. MORRIS WAS HERE" carved into it.'); },
        onUse(eng) { eng.showMessage('You sit in a chair. It squeaks loudly. Every other officer in the building probably heard that.'); }
      }
    ],

    npcs: [
      {
        name: 'Sergeant Morris', x: 140, y: 100, w: 20, h: 30,
        draw(ctx, eng) { GFX.drawSergeant(ctx, 140, 100, eng.waterPhase); },
        onLook(eng) { eng.showMessage('Sergeant Morris. 25 years on the force, grizzled mustache, coffee permanently attached to his hand. He\'s seen it all and is tired of most of it.'); },
        onTalk(eng) {
          eng.showDialog('Sgt. Morris', '"Stone, you\'re assigned to the burglary case. Start with the crime scene downtown. Check the evidence board in the office first."', ['Yes, sir!', 'Any leads?'], (choice) => {
            if (choice === 0) {
              if (!eng.getFlag('got_assignment')) {
                eng.setFlag('got_assignment');
                eng.showMessage('Sergeant Morris nods. "Don\'t screw it up, rookie. And for God\'s sake, write everything in your notepad." (+5 points)');
                eng.addScore(5);
              }
            } else {
              eng.showMessage('"We\'ve got witness reports of a blue van near each scene. License plate partial: starts with \'XK.\' That\'s all we\'ve got."');
              eng.setFlag('knows_van');
            }
          });
        },
        onUse(eng) { eng.showMessage('You salute Sergeant Morris. He sighs. "Just get me results, Stone. I don\'t need salutes, I need arrests."'); }
      }
    ],

    onEnter(eng) {
      if (!eng.getFlag('briefing_intro')) {
        eng.setFlag('briefing_intro');
        eng.showMessage('The briefing room at Lytton Springs PD. Your first real case: a string of burglaries hitting the downtown area. Time to prove yourself, rookie.');
      }
    }
  };

  // ── 2. POLICE STATION OFFICE ──
  const office = {
    id: 'office',
    name: 'Detectives Office',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Floor
      GFX.rect(ctx, 0, 95, w, h - 95, '#8a7a60');
      // Walls
      GFX.rect(ctx, 0, 0, w, 95, '#AABB99');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 95, '#99AA88');
      // Your desk
      GFX.drawDesk(ctx, 30, 60, 70, 35);
      // Computer on desk
      GFX.rect(ctx, 40, 45, 18, 14, '#333');
      GFX.rect(ctx, 41, 46, 16, 11, '#1144AA');
      GFX.rect(ctx, 45, 59, 10, 3, '#444');
      // Coffee mug
      GFX.rect(ctx, 72, 63, 6, 8, C.WHITE);
      GFX.rect(ctx, 71, 67, 3, 4, C.WHITE);
      // Evidence board
      GFX.drawEvidenceBoard(ctx, 180, 15, 100, 65, eng.waterPhase);
      // Filing cabinets
      GFX.rect(ctx, 10, 30, 18, 55, '#556644');
      GFX.rect(ctx, 12, 32, 14, 14, '#667755');
      GFX.rect(ctx, 12, 48, 14, 14, '#667755');
      GFX.rect(ctx, 12, 64, 14, 14, '#667755');
      GFX.rect(ctx, 17, 38, 4, 2, C.YELLOW);
      GFX.rect(ctx, 17, 54, 4, 2, C.YELLOW);
      GFX.rect(ctx, 17, 70, 4, 2, C.YELLOW);
      // Door to briefing
      GFX.rect(ctx, 2, 60, 8, 35, '#886644');
      // Door to downtown
      GFX.rect(ctx, 148, 60, 20, 35, '#886644');
      GFX.rect(ctx, 164, 78, 3, 4, C.YELLOW);
      // Notepad on desk
      if (!eng.hasItem('notepad')) {
        GFX.rect(ctx, 60, 65, 8, 10, C.YELLOW);
        GFX.rect(ctx, 61, 66, 6, 1, '#333');
        GFX.rect(ctx, 61, 68, 6, 1, '#333');
      }
    },

    walkable: [{ x: 5, y: 100, w: 305, h: 55 }],

    exits: [
      { x: 0, y: 58, w: 12, h: 40, target: 'briefingRoom', entryX: 255, entryY: 115,
        walkX: 6, walkY: 105 },
      { x: 143, y: 58, w: 28, h: 40, target: 'downtown', entryX: 30, entryY: 135,
        walkX: 158, walkY: 105 }
    ],

    hotspots: [
      {
        name: 'evidence board', x: 175, y: 10, w: 110, h: 75,
        onLook(eng) {
          eng.showMessage('The evidence board for the burglary case. Photos of 4 crime scenes. Red string connects them. A note reads: "All electronics stolen. No forced entry. Alarm systems bypassed."');
          if (!eng.getFlag('studied_evidence')) {
            eng.setFlag('studied_evidence');
            eng.addScore(5);
            eng.showMessage('You study the board carefully. Pattern: all victims had "SmartHome" brand security. The burglar knows how to disable them. (+5 points)');
          }
        },
        onUse(eng) { eng.showMessage('You add a sticky note: "Check SmartHome installer records." Good detective work!'); },
        onTalk(eng) { eng.showMessage('"These break-ins are connected. Same M.O., same brand of security system..." You trail off, lost in thought.'); }
      },
      {
        name: 'notepad', x: 55, y: 60, w: 16, h: 16,
        onLook(eng) { eng.showMessage('A police-issue notepad. Essential for any investigation. You\'d better take it.'); },
        onTake(eng) {
          if (eng.hasItem('notepad')) { eng.showMessage('You already have your notepad. Old school, but reliable.'); return; }
          eng.addItem('notepad', '📝', 'Notepad');
          eng.showMessage('You grab the notepad and a pen. Ready to document everything. Sergeant Morris would be proud. (+5 points)');
          eng.addScore(5);
        }
      },
      {
        name: 'computer', x: 35, y: 40, w: 28, h: 22,
        onLook(eng) { eng.showMessage('Your desk computer. It\'s running the LSPD database — slow as molasses but contains every case file in the city.'); },
        onUse(eng) {
          if (eng.getFlag('searched_database')) {
            eng.showMessage('You already searched the database. The key info: SmartHome Installations, 724 Main St. Employee list shows a Vince Krawley — 3 prior thefts.');
          } else if (eng.hasItem('notepad')) {
            eng.setFlag('searched_database');
            eng.showMessage('You search the database for SmartHome installation records. One name pops up: Vince Krawley — fired employee, 3 prior theft charges! Address: Warehouse District. (+10 points)');
            eng.addScore(10);
          } else {
            eng.showMessage('You should grab your notepad first. Can\'t investigate without writing things down!');
          }
        }
      },
      {
        name: 'coffee mug', x: 68, y: 60, w: 14, h: 14,
        onLook(eng) { eng.showMessage('Your coffee mug. It says "WORLD\'S OKAYEST COP." A gift from your academy classmates.'); },
        onUse(eng) { eng.showMessage('You take a sip. It\'s cold and has been sitting there since Tuesday. You drink it anyway. Cops are built different.'); },
        onTalk(eng) { eng.showMessage('"You\'re the only one who understands me," you whisper to the mug. It\'s been a long week.'); }
      },
      {
        name: 'filing cabinets', x: 5, y: 25, w: 28, h: 65,
        onLook(eng) { eng.showMessage('Filing cabinets full of old case files. Decades of Lytton Springs crime, organized by year and crime type. Mostly jaywalking.'); },
        onUse(eng) { eng.showMessage('You pull open a drawer. A moth flies out. The "Cold Cases" drawer hasn\'t been opened since 1987.'); }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('office_intro')) {
        eng.setFlag('office_intro');
        eng.showMessage('The detectives\' office. Your desk is in the corner — small but functional. The evidence board dominates the far wall. Time to do some research.');
      }
    }
  };

  // ── 3. DOWNTOWN ──
  const downtown = {
    id: 'downtown',
    name: 'Downtown Lytton Springs',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Sky
      GFX.drawSky(ctx, w, h * 0.35, '#6688AA', '#AACCEE');
      // Buildings
      GFX.drawCityBuilding(ctx, 0, 15, 40, 55, '#887766');
      GFX.drawCityBuilding(ctx, 45, 25, 35, 45, '#776655');
      GFX.drawCityBuilding(ctx, 90, 10, 30, 60, '#998877');
      GFX.drawCityBuilding(ctx, 200, 20, 45, 50, '#887766');
      GFX.drawCityBuilding(ctx, 250, 5, 35, 65, '#776655');
      GFX.drawCityBuilding(ctx, 290, 30, 30, 40, '#665544');
      // Street
      GFX.rect(ctx, 0, h * 0.5, w, h * 0.5, '#555555');
      GFX.rect(ctx, 0, h * 0.5, w, 2, '#888');
      // Lane markings
      for (let lx = 0; lx < w; lx += 25) {
        GFX.rect(ctx, lx, h * 0.65, 12, 2, C.YELLOW);
      }
      // Sidewalk
      GFX.rect(ctx, 0, 70, w, 15, '#999');
      GFX.rect(ctx, 0, 70, w, 2, '#AAA');
      // Traffic light
      GFX.drawTrafficLight(ctx, 130, 35, eng.waterPhase);
      // Police car
      GFX.drawPoliceCar(ctx, 30, 115, eng.waterPhase);
      // Store fronts
      GFX.rect(ctx, 145, 50, 45, 22, '#AA9988');
      GFX.rect(ctx, 148, 52, 12, 18, '#5599CC'); // window
      GFX.rect(ctx, 170, 58, 8, 12, '#553311'); // door
      GFX.rect(ctx, 148, 46, 38, 5, '#AA3333');
      // Crosswalk
      for (let cx = 115; cx < 145; cx += 5) {
        GFX.rect(ctx, cx, 95, 3, 15, C.WHITE);
      }
    },

    walkable: [{ x: 10, y: 105, w: 300, h: 50 }],

    exits: [
      { x: 0, y: 100, w: 15, h: 55, target: 'office', entryX: 150, entryY: 110,
        walkX: 10, walkY: 130 },
      { x: 145, y: 48, w: 50, h: 25, target: 'crimeScene', entryX: 160, entryY: 140,
        walkX: 170, walkY: 108 },
      { x: 300, y: 100, w: 20, h: 55, target: 'park', entryX: 30, entryY: 130,
        walkX: 305, walkY: 130 }
    ],

    hotspots: [
      {
        name: 'police car', x: 20, y: 110, w: 60, h: 30,
        onLook(eng) { eng.showMessage('Your patrol car. Unit 42. It smells of stale coffee and air freshener. The radio crackles occasionally with dispatch chatter.'); },
        onUse(eng) {
          eng.showMessage('You radio dispatch: "Unit 42, 10-8, investigating burglary series." Dispatch responds: "10-4, Unit 42. Be safe out there, Stone."');
        },
        onTalk(eng) { eng.showMessage('"Come on, baby, don\'t break down on me," you say to the car. It\'s only got 180,000 miles on it. What could go wrong?'); }
      },
      {
        name: 'traffic light', x: 125, y: 30, w: 15, h: 45,
        onLook(eng) { eng.showMessage('A traffic light at the main intersection. Currently green. Pedestrians cross cautiously. Lytton Springs has a jaywalking problem.'); },
        onUse(eng) { eng.showMessage('You resist the urge to direct traffic. You have bigger fish to fry. Like actual crime.'); }
      },
      {
        name: 'storefront', x: 140, y: 42, w: 55, h: 32,
        onLook(eng) { eng.showMessage('"Ye Olde Electronics Shoppe" — one of the burglarized businesses. The sign above reads "CLOSED — Under Investigation."'); }
      },
      {
        name: 'crosswalk', x: 110, y: 92, w: 40, h: 20,
        onLook(eng) { eng.showMessage('A crosswalk. As a police officer, you should set a good example and use it. Or jaywalking. Your choice. (Narrator suggests the crosswalk.)'); }
      }
    ],

    npcs: [
      {
        name: 'Mrs. Henderson', x: 220, y: 108, w: 15, h: 28,
        draw(ctx) {
          // Elderly woman witness
          GFX.rect(ctx, 224, 108, 8, 10, '#CC88AA'); // dress
          GFX.rect(ctx, 225, 103, 6, 6, '#FFDDBB'); // head
          GFX.rect(ctx, 224, 101, 8, 3, '#AAAACC'); // hat
        },
        onLook(eng) { eng.showMessage('Mrs. Henderson, local resident. She\'s been living on this block for 40 years and sees everything. Including things that aren\'t there.'); },
        onTalk(eng) {
          eng.showDialog('Mrs. Henderson', '"Oh, Officer! I saw a blue van — \'XK\' something on the plate — parked here Tuesday night! The driver was wearing a SmartHome uniform!"', ['That\'s very helpful!', 'Anything else?'], (choice) => {
            if (choice === 0) {
              if (!eng.getFlag('witness_statement')) {
                eng.setFlag('witness_statement');
                eng.showMessage('You write down Mrs. Henderson\'s statement in your notepad. Blue van + SmartHome uniform = inside job! (+10 points)');
                eng.addScore(10);
              }
            } else {
              eng.showMessage('"He was about yea tall," she gestures vaguely, "and he had a... face. Definitely had a face. I\'m quite sure of that."');
            }
          });
        }
      }
    ],

    onEnter(eng) {
      if (!eng.getFlag('downtown_intro')) {
        eng.setFlag('downtown_intro');
        eng.showMessage('Downtown Lytton Springs. The main street is busy with traffic. Several storefronts have been hit by the burglar. Your patrol car is parked nearby.');
      }
    }
  };

  // ── 4. CRIME SCENE ──
  const crimeScene = {
    id: 'crimeScene',
    name: 'Electronics Store (Crime Scene)',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Floor
      GFX.rect(ctx, 0, 90, w, h - 90, '#CCBBAA');
      // Tile pattern
      for (let ty = 90; ty < h; ty += 10) {
        for (let tx = 0; tx < w; tx += 10) {
          GFX.rect(ctx, tx, ty, 1, 10, '#BBAA99');
        }
      }
      // Walls
      GFX.rect(ctx, 0, 0, w, 90, '#DDCCBB');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 90, '#CCBBAA');
      // Empty shelves (stolen goods)
      GFX.rect(ctx, 20, 30, 70, 5, '#887766');
      GFX.rect(ctx, 20, 50, 70, 5, '#887766');
      GFX.rect(ctx, 20, 70, 70, 5, '#887766');
      GFX.rect(ctx, 18, 30, 4, 45, '#887766');
      GFX.rect(ctx, 88, 30, 4, 45, '#887766');
      // Crime scene tape
      GFX.drawCrimeSceneTape(ctx, 10, 85, 120, eng.waterPhase);
      // Evidence markers
      GFX.rect(ctx, 150, 105, 8, 8, C.YELLOW);
      GFX.rect(ctx, 151, 106, 6, 4, C.BLACK); // "1"
      GFX.rect(ctx, 220, 115, 8, 8, C.YELLOW);
      GFX.rect(ctx, 221, 116, 6, 4, C.BLACK); // "2"
      GFX.rect(ctx, 80, 110, 8, 8, C.YELLOW);
      GFX.rect(ctx, 81, 111, 6, 4, C.BLACK); // "3"
      // Alarm panel (tampered)
      GFX.rect(ctx, 260, 40, 20, 30, '#445544');
      GFX.rect(ctx, 262, 42, 16, 26, '#112211');
      GFX.rect(ctx, 268, 48, 4, 4, C.RED); // blinking
      // Dirty footprint
      if (!eng.getFlag('collected_footprint')) {
        GFX.rect(ctx, 148, 113, 10, 4, '#554433');
        GFX.rect(ctx, 151, 109, 4, 4, '#554433');
      }
      // Backdoor (jimmied)
      GFX.rect(ctx, 200, 35, 22, 50, '#886644');
      GFX.rect(ctx, 203, 38, 16, 44, '#775533');
      GFX.rect(ctx, 200, 55, 4, 8, '#333'); // damage marks
      // Exit
      GFX.rect(ctx, 148, 60, 22, 30, '#775533');
      GFX.rect(ctx, 166, 72, 3, 4, C.YELLOW);
    },

    walkable: [{ x: 10, y: 95, w: 300, h: 55 }],

    exits: [
      { x: 143, y: 58, w: 28, h: 35, target: 'downtown', entryX: 170, entryY: 110,
        walkX: 159, walkY: 100 }
    ],

    hotspots: [
      {
        name: 'empty shelves', x: 15, y: 25, w: 80, h: 55,
        onLook(eng) { eng.showMessage('Empty display shelves. According to the report, $50,000 in electronics were stolen — laptops, tablets, high-end phones. Cleaned out professionally.'); }
      },
      {
        name: 'evidence marker 1', x: 145, y: 100, w: 16, h: 18,
        onLook(eng) { eng.showMessage('Evidence marker #1. A muddy boot print. Size 11. Could be the burglar\'s.'); },
        onUse(eng) {
          if (!eng.hasItem('evidence_bag')) { eng.showMessage('You need an evidence bag to collect this properly.'); return; }
          if (eng.getFlag('collected_footprint')) { eng.showMessage('You already collected the footprint evidence.'); return; }
          eng.setFlag('collected_footprint');
          eng.showMessage('You carefully photograph and cast the footprint. Size 11 work boot, same brand issued to SmartHome technicians! (+10 points)');
          eng.addScore(10);
        },
        onTake(eng) { eng.showMessage('You can\'t just scoop up a footprint! You need proper evidence collection procedures. Use an evidence bag.'); }
      },
      {
        name: 'alarm panel', x: 255, y: 35, w: 30, h: 40,
        onLook(eng) { eng.showMessage('The SmartHome alarm panel. It\'s been expertly bypassed — whoever did this knew the system\'s master override code. Definitely an inside job.'); },
        onUse(eng) {
          if (!eng.getFlag('checked_alarm')) {
            eng.setFlag('checked_alarm');
            eng.showMessage('Serial number: SH-4422. You note it in your pad. This can be cross-referenced with SmartHome installation records. (+5 points)');
            eng.addScore(5);
          } else {
            eng.showMessage('You already noted the serial number.');
          }
        }
      },
      {
        name: 'backdoor', x: 195, y: 30, w: 30, h: 58,
        onLook(eng) { eng.showMessage('The back door. Tool marks around the lock — but the lock wasn\'t actually forced. Someone had a key, then tried to make it LOOK like a break-in. Sloppy.'); },
        onUse(eng) { eng.showMessage('You examine the tool marks closely. They\'re superficial — cosmetic damage only. The real entry was through the SmartHome system.'); }
      },
      {
        name: 'crime scene tape', x: 5, y: 80, w: 130, h: 10,
        onLook(eng) { eng.showMessage('"POLICE LINE — DO NOT CROSS." You love that tape. It makes you feel official.'); },
        onTalk(eng) { eng.showMessage('You proudly tell a passersby, "I put that tape up myself." They don\'t seem impressed.'); }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('crime_intro')) {
        eng.setFlag('crime_intro');
        eng.showMessage('The burglarized electronics store. Crime scene tape marks the perimeter. Evidence markers dot the floor. The SmartHome alarm panel hangs open on the wall.');
        if (!eng.hasItem('evidence_bag')) {
          eng.addItem('evidence_bag', '🔍', 'Evidence Bag');
          eng.showMessage('You grab an evidence collection kit from the scene supplies.');
        }
      }
    }
  };

  // ── 5. PARK ──
  const park = {
    id: 'park',
    name: 'Memorial Park',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Sky
      GFX.drawSky(ctx, w, h * 0.35, '#8899BB', '#BBCCEE');
      // Trees
      GFX.drawTree(ctx, 30, 82, 35);
      GFX.drawTree(ctx, 100, 75, 40);
      GFX.drawTree(ctx, 250, 80, 35);
      // Grass
      GFX.rect(ctx, 0, 80, w, h - 80, C.GREEN);
      GFX.rect(ctx, 0, 80, w, 3, '#55AA55');
      // Path
      GFX.rect(ctx, 0, 110, w, 12, '#BBAA88');
      GFX.rect(ctx, 0, 110, w, 2, '#CCBB99');
      // Bench
      GFX.rect(ctx, 170, 100, 30, 5, '#664422');
      GFX.rect(ctx, 172, 93, 4, 7, '#553311');
      GFX.rect(ctx, 194, 93, 4, 7, '#553311');
      GFX.rect(ctx, 170, 92, 30, 2, '#664422');
      // Fountain (center)
      GFX.rect(ctx, 125, 85, 30, 5, C.GRAY);
      GFX.rect(ctx, 130, 75, 20, 12, C.LTGRAY);
      GFX.rect(ctx, 137, 68, 6, 7, C.GRAY);
      // Water
      const water = Math.sin(eng.waterPhase * 3) * 2;
      GFX.rect(ctx, 132 + water, 73, 3, 3, C.LTBLUE);
      GFX.rect(ctx, 145 - water, 73, 3, 3, C.LTBLUE);
      GFX.rect(ctx, 128, 87, 24, 3, C.LTBLUE);
      // Memorial plaque
      GFX.rect(ctx, 130, 89, 20, 5, C.YELLOW);
      // Exit east (warehouse)
      GFX.rect(ctx, 300, 105, 20, 25, '#555');
    },

    walkable: [{ x: 10, y: 105, w: 305, h: 50 }],

    exits: [
      { x: 0, y: 100, w: 15, h: 55, target: 'downtown', entryX: 295, entryY: 130,
        walkX: 10, walkY: 130 },
      { x: 300, y: 100, w: 20, h: 55, target: 'warehouse', entryX: 30, entryY: 130,
        walkX: 305, walkY: 130,
        condition(eng) { return eng.getFlag('searched_database') && eng.getFlag('witness_statement'); } }
    ],

    hotspots: [
      {
        name: 'fountain', x: 120, y: 65, w: 40, h: 30,
        onLook(eng) { eng.showMessage('The memorial fountain. A plaque reads: "In memory of the officers of Lytton Springs PD who gave their all." Water trickles peacefully.'); },
        onUse(eng) { eng.showMessage('You toss a coin in the fountain and make a wish. "I wish I could solve this case." The fountain doesn\'t grant wishes, but it\'s the thought that counts.'); },
        onTalk(eng) { eng.showMessage('You salute the memorial. Sometimes the job is bigger than you. But you do it anyway.'); }
      },
      {
        name: 'bench', x: 165, y: 88, w: 38, h: 20,
        onLook(eng) { eng.showMessage('A park bench. Someone carved "J+M" in a heart on the armrest. Romantic and also technically vandalism.'); },
        onUse(eng) { eng.showMessage('You sit down for a moment to collect your thoughts. The birds sing. The fountain babbles. Your radio crackles. Back to work.'); }
      },
      {
        name: 'warehouse direction', x: 295, y: 100, w: 25, h: 55,
        onLook(eng) {
          if (eng.getFlag('searched_database') && eng.getFlag('witness_statement')) {
            eng.showMessage('A path leads to the warehouse district. According to your research, that\'s where Vince Krawley operates.');
          } else {
            eng.showMessage('The warehouse district is east. You need more evidence before heading there — check the database and talk to witnesses first.');
          }
        }
      }
    ],

    npcs: [
      {
        name: 'Suspicious Man', x: 70, y: 108, w: 15, h: 28,
        draw(ctx, eng) {
          if (!eng.getFlag('informant_talked')) {
            GFX.rect(ctx, 74, 108, 8, 12, '#333');
            GFX.rect(ctx, 75, 103, 6, 6, '#DDBB99');
            GFX.rect(ctx, 73, 101, 10, 3, '#333');
          }
        },
        onLook(eng) {
          if (eng.getFlag('informant_talked')) return;
          eng.showMessage('A nervous-looking man in a dark jacket, glancing around. He looks like he wants to talk but is afraid of being seen.');
        },
        onTalk(eng) {
          if (eng.getFlag('informant_talked')) { eng.showMessage('The informant has disappeared. He said what he needed to say.'); return; }
          if (!eng.hasItem('badge')) { eng.showMessage('"Get lost," the man mutters. You should show him your badge first.'); return; }
          eng.setFlag('informant_talked');
          eng.showDialog('Informant', '"Officer, you didn\'t hear this from me. Krawley\'s warehouse — the stolen goods are stashed there. He moves them Thursday nights. You\'ve got till then."', ['How do you know this?', 'I\'ll check it out.'], (choice) => {
            if (choice === 0) {
              eng.showMessage('"Let\'s just say I owe some people some favors. And I don\'t like burglars in MY neighborhood." He walks away quickly. (+5 points)');
              eng.addScore(5);
            } else {
              eng.showMessage('The man nods and walks away briskly, disappearing around a corner. Time to check out that warehouse. (+5 points)');
              eng.addScore(5);
            }
          });
        }
      }
    ],

    onEnter(eng) {
      if (!eng.getFlag('park_intro')) {
        eng.setFlag('park_intro');
        eng.showMessage('Memorial Park. A peaceful oasis in the city. Tall trees shade a walking path. A fountain gurgles near the center. The warehouse district lies to the east.');
      }
    }
  };

  // ── 6. WAREHOUSE ──
  const warehouse = {
    id: 'warehouse',
    name: 'Krawley\'s Warehouse',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Concrete floor
      GFX.rect(ctx, 0, 85, w, h - 85, '#555544');
      // Walls
      GFX.rect(ctx, 0, 0, w, 85, '#444433');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 85, '#333322');
      // Support beams
      GFX.rect(ctx, 50, 0, 6, 85, '#555544');
      GFX.rect(ctx, 200, 0, 6, 85, '#555544');
      // Stolen goods - crates and electronics boxes
      GFX.rect(ctx, 20, 50, 25, 30, '#665533');
      GFX.rect(ctx, 22, 52, 21, 5, '#776644');
      GFX.rect(ctx, 50, 55, 30, 25, '#333');
      GFX.rect(ctx, 52, 57, 26, 8, '#2266AA'); // electronics box
      GFX.rect(ctx, 60, 40, 25, 15, '#333');
      GFX.rect(ctx, 62, 42, 21, 6, '#22AA66');
      // More boxes right
      GFX.rect(ctx, 240, 50, 35, 30, '#665533');
      GFX.rect(ctx, 242, 52, 31, 5, '#776644');
      GFX.rect(ctx, 280, 55, 25, 25, '#333');
      // Blue van (partially visible)
      GFX.rect(ctx, 210, 95, 50, 30, '#3355AA');
      GFX.rect(ctx, 215, 85, 40, 12, '#3355AA');
      GFX.rect(ctx, 220, 87, 15, 8, '#88BBEE'); // windshield
      GFX.rect(ctx, 215, 120, 10, 8, '#222'); // wheel
      GFX.rect(ctx, 245, 120, 10, 8, '#222');
      // License plate "XK-4221"
      GFX.rect(ctx, 225, 118, 16, 4, C.WHITE);
      GFX.rect(ctx, 226, 119, 14, 2, '#222');
      // Work bench
      GFX.rect(ctx, 120, 50, 55, 5, '#887766');
      GFX.rect(ctx, 125, 55, 4, 30, '#776655');
      GFX.rect(ctx, 167, 55, 4, 30, '#776655');
      // Handcuffs (if you don't have them)
      if (!eng.hasItem('handcuffs')) {
        GFX.rect(ctx, 135, 46, 8, 4, C.LTGRAY);
      }
      // Entrance
      GFX.rect(ctx, 2, 50, 15, 35, '#665533');
    },

    walkable: [{ x: 10, y: 90, w: 300, h: 60 }],

    exits: [
      { x: 0, y: 48, w: 20, h: 40, target: 'park', entryX: 295, entryY: 130,
        walkX: 10, walkY: 100 }
    ],

    hotspots: [
      {
        name: 'stolen goods', x: 15, y: 35, w: 80, h: 50,
        onLook(eng) { eng.showMessage('Boxes of stolen electronics. Laptops, tablets, phones — all matching the inventory lists from the burglarized stores. This is the evidence you need!'); },
        onUse(eng) {
          if (!eng.getFlag('photographed_evidence')) {
            eng.setFlag('photographed_evidence');
            eng.showMessage('You photograph the stolen goods with serial numbers visible. This will match the stolen items report perfectly! (+10 points)');
            eng.addScore(10);
          } else {
            eng.showMessage('You already documented the evidence. Now you need to deal with Krawley.');
          }
        }
      },
      {
        name: 'blue van', x: 205, y: 82, w: 60, h: 50,
        onLook(eng) { eng.showMessage('A blue van. License plate: XK-4221. Matches the witness description! This is Krawley\'s getaway vehicle. Case closed — almost.'); },
        onUse(eng) {
          if (!eng.getFlag('checked_van')) {
            eng.setFlag('checked_van');
            eng.showMessage('You check the van. SmartHome uniform in the front seat, lockpick set in the glovebox. Krawley wasn\'t even trying to hide it. (+5 points)');
            eng.addScore(5);
          } else {
            eng.showMessage('You already searched the van.');
          }
        }
      },
      {
        name: 'handcuffs', x: 130, y: 42, w: 16, h: 10,
        onLook(eng) { eng.showMessage('A pair of handcuffs on the workbench. Standard issue. You should grab these — you might need them.'); },
        onTake(eng) {
          if (eng.hasItem('handcuffs')) { eng.showMessage('You already have handcuffs.'); return; }
          eng.addItem('handcuffs', '⛓️', 'Handcuffs');
          eng.showMessage('You grab the handcuffs. Time to make an arrest. (+5 points)');
          eng.addScore(5);
        }
      },
      {
        name: 'workbench', x: 115, y: 45, w: 65, h: 40,
        onLook(eng) { eng.showMessage('A workbench with tools, packing materials, and shipping labels. Krawley was preparing to move the stolen goods out of state.'); }
      }
    ],

    npcs: [
      {
        name: 'Vince Krawley', x: 140, y: 95, w: 18, h: 30,
        draw(ctx, eng) {
          if (!eng.getFlag('krawley_arrested')) {
            GFX.drawDetective(ctx, 140, 95, eng.waterPhase);
          } else {
            // Krawley on the ground, handcuffed
            GFX.rect(ctx, 140, 120, 18, 6, '#334');
            GFX.rect(ctx, 148, 117, 6, 4, '#DDBB99');
          }
        },
        onLook(eng) {
          if (eng.getFlag('krawley_arrested')) { eng.showMessage('Vince Krawley, handcuffed and on the floor. Justice served!'); return; }
          eng.showMessage('Vince Krawley. Late 30s, stocky build, wearing a SmartHome company jacket. He hasn\'t noticed you yet.');
        },
        onTalk(eng) {
          if (eng.getFlag('krawley_arrested')) { eng.showMessage('"I want a lawyer!" Krawley shouts from the floor. "You\'ll get one," you reply calmly.'); return; }
          eng.showDialog('Krawley', '"Who the — a COP?! You got nothing on me!"', ['You\'re under arrest, Krawley!', 'Want to explain all this stolen merchandise?'], (choice) => {
            if (choice === 0) {
              if (eng.hasItem('handcuffs')) {
                eng.setFlag('krawley_arrested');
                eng.showMessage('"Vince Krawley, you\'re under arrest for burglary, theft, and being really bad at hiding evidence." You slap on the cuffs. (+25 points)');
                eng.addScore(25);
                setTimeout(() => {
                  eng.win('Officer Jack Stone has cracked the burglary ring! Vince Krawley is in custody, the stolen goods recovered, and all four stores will get their merchandise back. Sergeant Morris personally congratulates you: "Not bad, rookie. Not bad at all." You were promoted to Detective within the month. The "WORLD\'S OKAYEST COP" mug was retired. Your new one says "WORLD\'S OKAYEST DETECTIVE."');
                }, 3000);
              } else {
                eng.showMessage('You need handcuffs to make the arrest! There should be a pair on the workbench.');
              }
            } else {
              eng.showMessage('"I — that\'s — those are — uh — I\'m holding them for a friend?" Krawley stammers. Real smooth, Vince.');
            }
          });
        },
        onUse(eng) {
          if (!eng.getFlag('krawley_arrested') && eng.hasItem('handcuffs')) {
            eng.setFlag('krawley_arrested');
            eng.showMessage('You tackle Krawley and slap the cuffs on. "You have the right to remain silent!" Krawley exercises that right by swearing loudly. (+25 points)');
            eng.addScore(25);
            setTimeout(() => {
              eng.win('Officer Jack Stone has cracked the burglary ring! Vince Krawley is in custody, the stolen goods recovered, and downtown Lytton Springs is safe once more. Sergeant Morris buys you a coffee: "Told you not to screw it up, Stone. And you didn\'t." High praise indeed.');
            }, 3000);
          } else if (eng.getFlag('krawley_arrested')) {
            eng.showMessage('He\'s already arrested. Due process from here, Officer.');
          } else {
            eng.showMessage('You need handcuffs to restrain the suspect properly. Check the workbench.');
          }
        }
      }
    ],

    onEnter(eng) {
      if (!eng.getFlag('warehouse_intro')) {
        eng.setFlag('warehouse_intro');
        eng.showMessage('Krawley\'s Warehouse. The blue van is parked inside. Boxes of stolen electronics are stacked everywhere. And there he is — Vince Krawley himself.');
      }
    }
  };

  // ═══════════════════════════════════
  //  SCENE LOOK DESCRIPTIONS
  // ═══════════════════════════════════
  const sceneDescriptions = {
    briefingRoom: 'The LSPD briefing room. Folding chairs face a podium and whiteboard covered in case notes. The American flag and city flag stand on either side. It smells of coffee and determination.',
    office: 'The detectives\' office at Lytton Springs PD. Desks, filing cabinets, and a large evidence board dominate the room. Your desk has a computer, coffee mug, and notepad.',
    downtown: 'Downtown Lytton Springs. The main commercial strip with shops, a traffic light, and your patrol car. Mrs. Henderson watches from across the street.',
    crimeScene: 'The burglarized electronics store. Empty shelves where merchandise used to be. Crime scene tape, evidence markers, and a tampered SmartHome alarm panel tell the story.',
    park: 'Memorial Park. A shady oasis with a memorial fountain, park bench, and walking path. The warehouse district lies to the east.',
    warehouse: 'Krawley\'s Warehouse in the industrial district. Stolen electronics, a blue van with plates matching witness descriptions, and the suspect himself.',
  };

  const allScenes = { briefingRoom, office, downtown, crimeScene, park, warehouse };
  Object.entries(sceneDescriptions).forEach(([id, desc]) => {
    if (allScenes[id]) allScenes[id].onLookScene = function(eng) { eng.showMessage(desc); };
  });

  // ═══════════════════════════════════
  //  REGISTER SCENES
  // ═══════════════════════════════════
  window.GameWorlds = window.GameWorlds || {};
  window.GameWorlds.pq = allScenes;

})();
