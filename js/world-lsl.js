/* ============================================
   Leisure Suit Larry: Byte Club
   World - Scenes, Dialogs, Items, Puzzles
   An Original Sierra-style Adventure
   ============================================ */

(function() {
  const C = GFX.C;

  // ── 1. LEFTY'S BAR ──
  const bar = {
    id: 'bar',
    name: "Lefty's Bar",

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Floor
      GFX.rect(ctx, 0, 90, w, h - 90, '#3a2010');
      // Checkered floor
      for (let fy = 90; fy < h; fy += 8) {
        for (let fx = 0; fx < w; fx += 8) {
          if ((fx + fy) % 16 === 0) GFX.rect(ctx, fx, fy, 8, 8, '#4a3020');
        }
      }
      // Walls
      GFX.rect(ctx, 0, 0, w, 90, '#442211');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 90, '#3a1a08');
      // Bar counter
      GFX.drawBarCounter(ctx, 150, 60, 160);
      // Bottles on shelf
      GFX.rect(ctx, 155, 30, 150, 25, '#331100');
      const bottleColors = [C.RED, C.GREEN, '#FFAA00', C.BLUE, '#CC44CC', C.YELLOW, '#FF6633', C.LTBLUE];
      for (let bx = 160; bx < 300; bx += 18) {
        const bc = bottleColors[Math.floor((bx - 160) / 18) % bottleColors.length];
        GFX.rect(ctx, bx, 32, 5, 18, bc);
        GFX.rect(ctx, bx + 1, 28, 3, 4, bc);
      }
      // Jukebox (left)
      GFX.drawJukebox(ctx, 20, 50, eng.waterPhase);
      // Neon sign
      GFX.drawNeonSign(ctx, 100, 10, 40, 10, '#FF1493', eng.waterPhase);
      // Pool table
      GFX.rect(ctx, 30, 100, 50, 30, C.DKGREEN);
      GFX.rect(ctx, 31, 101, 48, 28, C.GREEN);
      // Door
      GFX.drawDoor(ctx, 155, 130, 18, 38);
      // Neon "LEFTY'S" text approximation
      GFX.rect(ctx, 105, 12, 30, 6, '#FF69B4');
    },

    walkable: [{ x: 15, y: 100, w: 290, h: 60 }],

    exits: [
      { x: 148, y: 140, w: 30, h: 28, target: 'street', entryX: 80, entryY: 130,
        walkX: 163, walkY: 155 }
    ],

    hotspots: [
      {
        name: 'bar counter', x: 150, y: 60, w: 160, h: 25,
        onLook(eng) { eng.showMessage('A long wooden bar, sticky with decades of spilled drinks and broken dreams. Just the way Larry likes it.'); },
        onUse(eng) { eng.showMessage('You lean on the bar trying to look cool. Your elbow slips. Smooth.'); },
        onTalk(eng) { eng.showMessage('You tap the bar impatiently. The bartender shoots you a look that could curdle milk.'); }
      },
      {
        name: 'jukebox', x: 12, y: 50, w: 24, h: 30,
        onLook(eng) { eng.showMessage('A vintage jukebox. The selection seems to be exclusively "songs that were cool 20 years ago."'); },
        onUse(eng) {
          if (!eng.getFlag('jukebox_played')) {
            eng.setFlag('jukebox_played');
            eng.showMessage('You put a quarter in. "Stayin\' Alive" starts playing. You begin to dance. Everyone pretends not to notice. (+5 points for courage)');
            eng.addScore(5);
          } else {
            eng.showMessage('The jukebox is still playing your last selection. The bartender mouths "please stop."');
          }
        },
        onTalk(eng) { eng.showMessage('"Hey jukebox, play something romantic." The jukebox does not respond. It\'s a jukebox.'); }
      },
      {
        name: 'pool table', x: 30, y: 100, w: 50, h: 30,
        onLook(eng) { eng.showMessage('A pool table. The felt has seen better days. And better players.'); },
        onUse(eng) { eng.showMessage('You attempt a trick shot. The cue ball flies off the table and rolls under the bar. Classic Larry.'); },
        onTalk(eng) { eng.showMessage('"Anyone up for a game?" The pool table stares back silently. You may be talking to furniture.'); }
      },
      {
        name: 'bottles', x: 155, y: 28, w: 150, h: 25,
        onLook(eng) { eng.showMessage('An impressive collection of bottles. Most of them are probably older than you.'); },
        onTake(eng) { eng.showMessage('The bartender\'s hand clamps down on yours before you even get close. "Nice try, buddy."'); },
        onUse(eng) { eng.showMessage('You reach for a bottle. The bartender produces a baseball bat from nowhere and sets it gently on the counter.'); }
      },
      {
        name: 'neon sign', x: 95, y: 5, w: 50, h: 18,
        onLook(eng) { eng.showMessage('"LEFTY\'S" - the neon sign flickers uncertainly, as if even it is ashamed to advertise this place.'); },
        onTake(eng) { eng.showMessage('It\'s bolted to the wall and probably worth less than the electricity it wastes.'); }
      }
    ],

    npcs: [
      {
        name: 'Bartender', x: 230, y: 95, w: 20, h: 30,
        draw(ctx, eng) { GFX.drawBartender(ctx, 230, 95, eng.waterPhase); },
        onLook(eng) { eng.showMessage('The bartender is a grizzled veteran of nocturnal social disasters. He\'s seen it all. Especially Larry.'); },
        onTalk(eng) {
          const count = eng.getFlag('bartender_talk') || 0;
          eng.setFlag('bartender_talk', count + 1);
          const responses = [
            ['"What\'ll it be?" he asks, already looking bored.', ['A drink, bartender!', 'Got any dating advice?', 'Nothing, just looking']],
            ['"You again? Same thing?" The bartender sighs professionally.', ['Hit me with your best shot', 'Where\'s the action in this town?', 'Still looking']],
            ['"Look buddy, either order something or stop scaring away my regulars."', ['Your most expensive drink!', 'I\'ll have water', 'Bye']]
          ];
          const r = responses[Math.min(count, responses.length - 1)];
          eng.showDialog('Bartender', r[0], r[1], (choice) => {
            if (choice === 0) {
              if (!eng.hasItem('breath_spray') && !eng.getFlag('got_drink')) {
                eng.setFlag('got_drink');
                eng.showMessage('The bartender slides you something brown and suspicious. You drink it. It tastes like regret. (+5 points)');
                eng.addScore(5);
              } else {
                eng.showMessage('The bartender pours you another. "You\'re gonna need it," he says, eyeing your leisure suit.');
              }
            } else if (choice === 1) {
              eng.showMessage('The bartender looks you up and down. "Honestly? Start by losing the suit." Harsh but fair.');
            } else {
              eng.showMessage('"Suit yourself. Pun intended."');
            }
          });
        },
        onUse(eng) { eng.showMessage('You try to high-five the bartender. He does not reciprocate.'); },
        onTake(eng) { eng.showMessage('"Touch me again and I\'m calling the bouncer." He doesn\'t have a bouncer. But still.'); }
      }
    ],

    onEnter(eng) {
      if (!eng.getFlag('bar_intro')) {
        eng.setFlag('bar_intro');
        eng.showMessage('You push through the door of Lefty\'s Bar. The smell of cheap cologne and cheaper drinks hits you immediately. You feel right at home.');
      }
    }
  };

  // ── 2. CITY STREET ──
  const street = {
    id: 'street',
    name: 'Main Street',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Sky
      GFX.drawSky(ctx, w, h * 0.3, '#110022', '#221144');
      // Stars
      for (let i = 0; i < 15; i++) {
        const sx = GFX.seededRandom(i * 7) * w;
        const sy = GFX.seededRandom(i * 13) * h * 0.25;
        GFX.pixel(ctx, sx, sy, C.WHITE);
      }
      // Buildings background
      GFX.drawCityBuilding(ctx, 0, 10, 60, 80, '#222233');
      GFX.drawCityBuilding(ctx, 55, 20, 50, 70, '#1a1a2a');
      GFX.drawCityBuilding(ctx, 100, 5, 70, 85, '#222233');
      GFX.drawCityBuilding(ctx, 190, 15, 55, 75, '#1a1a2a');
      GFX.drawCityBuilding(ctx, 240, 8, 80, 82, '#222233');
      // Sidewalk
      GFX.rect(ctx, 0, 90, w, 15, '#555');
      GFX.rect(ctx, 0, 90, w, 2, '#666');
      // Road
      GFX.rect(ctx, 0, 105, w, h - 105, '#333');
      // Lane markings
      for (let lx = 0; lx < w; lx += 20) {
        GFX.rect(ctx, lx, 130, 10, 2, '#CCAA00');
      }
      // Street lamps
      GFX.drawStreetLamp(ctx, 50, 55);
      GFX.drawStreetLamp(ctx, 200, 55);
      // Bar entrance (left)
      GFX.drawDoor(ctx, 72, 60, 16, 30, '#553322');
      GFX.drawNeonSign(ctx, 65, 50, 28, 8, '#FF1493', eng.waterPhase);
      // Convenience store (center)
      GFX.rect(ctx, 125, 55, 45, 35, '#335533');
      GFX.rect(ctx, 130, 58, 35, 20, '#88BBAA');
      GFX.drawDoor(ctx, 140, 70, 14, 20);
      // Disco entrance (right)
      GFX.drawDoor(ctx, 255, 60, 16, 30, '#440044');
      GFX.drawNeonSign(ctx, 248, 48, 30, 8, '#00FFFF', eng.waterPhase + 1);
      // Taxi
      if (!eng.getFlag('took_taxi')) {
        GFX.rect(ctx, 270, 118, 40, 12, C.YELLOW);
        GFX.rect(ctx, 278, 110, 24, 10, C.YELLOW);
        GFX.rect(ctx, 281, 112, 8, 6, '#AADDFF');
        GFX.rect(ctx, 293, 112, 8, 6, '#AADDFF');
      }
    },

    walkable: [{ x: 15, y: 92, w: 290, h: 20 }],

    exits: [
      { x: 65, y: 60, w: 28, h: 35, target: 'bar', entryX: 163, entryY: 140,
        walkX: 80, walkY: 95 },
      { x: 125, y: 58, w: 45, h: 35, target: 'store', entryX: 160, entryY: 140,
        walkX: 148, walkY: 95 },
      { x: 248, y: 48, w: 30, h: 45, target: 'disco', entryX: 160, entryY: 145,
        walkX: 263, walkY: 95,
        condition(eng) { return eng.hasItem('disco_pass'); } },
    ],

    hotspots: [
      {
        name: 'taxi', x: 268, y: 108, w: 45, h: 25,
        onLook(eng) { eng.showMessage('A taxi sits at the curb, engine running. The meter is already at $47.50 and it hasn\'t moved.'); },
        onUse(eng) {
          if (eng.getFlag('took_taxi')) { eng.showMessage('The taxi has left. Probably for the best — you can\'t afford a second ride.'); return; }
          if (eng.hasItem('cash')) {
            eng.setFlag('took_taxi');
            eng.removeItem('cash');
            eng.showMessage('You hop in the taxi. "$50 to the casino," you say. The driver charges you $49.99. What a deal! (+10 points)');
            eng.addScore(10);
            setTimeout(() => eng.changeScene('casino', 160, 140), 2500);
          } else {
            eng.showMessage('"No cash, no ride, pal." The taxi driver isn\'t negotiating.');
          }
        },
        onTalk(eng) { eng.showMessage('"Where to, mac?" says the cabbie. You\'d need cash for a ride.'); }
      },
      {
        name: 'disco entrance', x: 248, y: 48, w: 30, h: 45,
        onLook(eng) { eng.showMessage('Club Fabulous. The neon sign promises a night you\'ll never forget. The bouncer promises you\'ll never get in without a VIP pass.'); },
        onTalk(eng) {
          if (!eng.hasItem('disco_pass')) {
            eng.showMessage('"No pass, no entry." The invisible bouncer is very firm about this.');
          } else {
            eng.showMessage('The bouncer nods approvingly at your VIP pass. "Welcome to Club Fabulous, Mr... Laffer."');
          }
        }
      },
      {
        name: 'neon signs', x: 60, y: 45, w: 35, h: 15,
        onLook(eng) { eng.showMessage('Neon signs illuminate the street in pinks and blues. The city\'s nightlife scene is... something.'); }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('street_intro')) {
        eng.setFlag('street_intro');
        eng.showMessage('Main Street — the heart of Lost Wages nightlife. Neon lights flicker invitingly. A bar, a store, a disco, and a taxi await.');
      }
    }
  };

  // ── 3. CONVENIENCE STORE ──
  const store = {
    id: 'store',
    name: 'QuikStop',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Floor
      GFX.rect(ctx, 0, 80, w, h - 80, '#CCCCAA');
      for (let fy = 80; fy < h; fy += 10) {
        GFX.rect(ctx, 0, fy, w, 1, '#BBBB99');
      }
      // Walls
      GFX.rect(ctx, 0, 0, w, 80, '#DDDDCC');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 80, '#CCCCBB');
      // Shelves (left)
      GFX.drawBookshelf(ctx, 10, 30, 40, 45);
      // Shelves (right)
      GFX.drawBookshelf(ctx, 260, 30, 45, 45);
      // Counter
      GFX.rect(ctx, 120, 65, 80, 12, C.BROWN);
      GFX.rect(ctx, 121, 66, 78, 4, C.LTBROWN);
      // Cash register
      GFX.rect(ctx, 155, 55, 15, 12, C.DKGRAY);
      GFX.rect(ctx, 157, 57, 11, 5, '#33AA33');
      // Store clerk behind counter
      GFX.rect(ctx, 138, 38, 8, 10, '#559955'); // green vest
      GFX.rect(ctx, 139, 39, 6, 4, '#668866'); // vest highlight
      GFX.rect(ctx, 139, 32, 6, 6, C.SKIN);    // head
      GFX.rect(ctx, 139, 30, 6, 2, C.DKBROWN); // hair
      GFX.rect(ctx, 140, 34, 1, 1, C.BLACK);   // eye
      GFX.rect(ctx, 143, 34, 1, 1, C.BLACK);   // eye
      // Phone in hand
      GFX.rect(ctx, 146, 42, 3, 5, C.DKGRAY);
      GFX.rect(ctx, 146, 43, 3, 3, '#4488FF');
      // Magazine rack
      GFX.rect(ctx, 70, 40, 30, 35, '#AA8855');
      const magColors = [C.RED, C.BLUE, C.PINK, C.YELLOW, C.GREEN];
      for (let mi = 0; mi < 5; mi++) {
        GFX.rect(ctx, 72 + mi * 5, 42, 4, 15, magColors[mi]);
      }
      // Breath spray display
      if (!eng.hasItem('breath_spray')) {
        GFX.rect(ctx, 230, 60, 20, 12, '#88CCFF');
        GFX.rect(ctx, 234, 62, 4, 8, '#44AAFF');
        GFX.rect(ctx, 240, 62, 4, 8, '#44AAFF');
      }
      // Door
      GFX.drawDoor(ctx, 152, 120, 16, 40);
      // Fluorescent lights
      GFX.rect(ctx, 60, 8, 80, 3, C.WHITE);
      GFX.rect(ctx, 180, 8, 80, 3, C.WHITE);
    },

    walkable: [{ x: 15, y: 90, w: 290, h: 60 }],

    exits: [
      { x: 145, y: 135, w: 30, h: 28, target: 'street', entryX: 148, entryY: 95,
        walkX: 160, walkY: 155 }
    ],

    hotspots: [
      {
        name: 'breath spray display', x: 225, y: 55, w: 30, h: 20,
        onLook(eng) { eng.showMessage('"MintyFresh 3000 — Breath Spray for Winners!" The packaging shows a confident man surrounded by admirers. False advertising at its finest.'); },
        onTake(eng) {
          if (eng.hasItem('breath_spray')) { eng.showMessage('You already have breath spray. One bottle is enough. Probably.'); return; }
          if (eng.getFlag('store_paid')) {
            eng.addItem('breath_spray', '🧴', 'Breath Spray');
            eng.showMessage('You grab a bottle of MintyFresh 3000. Armed and dangerous! (+10 points)');
            eng.addScore(10);
          } else {
            eng.showMessage('You should probably pay for that first. This isn\'t a self-service breath spray bar.');
          }
        },
        onUse(eng) { eng.showMessage('You can\'t use it here — buy it first!'); }
      },
      {
        name: 'cash register', x: 150, y: 52, w: 20, h: 15,
        onLook(eng) { eng.showMessage('The cash register. It looks like it was manufactured during the Cold War.'); },
        onUse(eng) {
          if (eng.getFlag('store_paid')) {
            eng.showMessage('You\'ve already paid. Don\'t push your luck.');
          } else {
            eng.setFlag('store_paid');
            eng.showMessage('You put some money on the counter. The clerk nods without looking up from their phone. Transaction complete.');
          }
        }
      },
      {
        name: 'magazine rack', x: 65, y: 35, w: 40, h: 42,
        onLook(eng) { eng.showMessage('Magazines about fishing, cars, cooking, and "How to Be Cool in 12 Easy Steps." That last one is dog-eared.'); },
        onTake(eng) { eng.showMessage('You flip through "How to Be Cool." Step 1: "Don\'t wear a leisure suit." You put it back.'); },
        onUse(eng) { eng.showMessage('You browse the magazines looking for dating tips. You find an article titled "Giving Up: A Beginner\'s Guide."'); }
      },
      {
        name: 'shelves', x: 5, y: 25, w: 50, h: 50,
        onLook(eng) { eng.showMessage('Shelves stocked with snacks, sundries, and an alarming number of air fresheners.'); },
        onTake(eng) { eng.showMessage('Nothing here that would improve your love life. And you checked thoroughly.'); }
      }
    ],

    npcs: [
      {
        name: 'Store Clerk', x: 142, y: 80, w: 16, h: 35,
        onLook(eng) { eng.showMessage('A bored teenager in a green vest. They\'re scrolling through their phone with the intensity of a brain surgeon. Their name tag reads "TYLER."'); },
        onTalk(eng) {
          const count = eng.getFlag('clerk_talk') || 0;
          eng.setFlag('clerk_talk', count + 1);
          const responses = [
            ['Tyler glances up from their phone for exactly 0.3 seconds. "Welcome to QuikStop. We\'re delighted you\'re here," they say in a monotone.', ['I need some supplies', 'Nice customer service', 'Carry on']],
            ['"Oh, you\'re still here." Tyler doesn\'t look up this time.', ['What do you recommend?', 'Do you have condoms?', 'Never mind']],
            ['"Look dude, buy something or let me get back to my feed. This kitten video isn\'t going to watch itself."', ['Fine, I\'ll buy something', 'You\'re very rude', 'Bye']]
          ];
          const r = responses[Math.min(count, responses.length - 1)];
          eng.showDialog('Tyler', r[0], r[1], (choice) => {
            if (count === 0 && choice === 1) {
              eng.showMessage('Tyler\'s expression doesn\'t change. "Thank you for your feedback. It has been noted and will be ignored."');
            } else if (count === 1 && choice === 1) {
              eng.showMessage('Tyler finally looks up. "Aisle... actually, we don\'t have those. This is a QuikStop, not a... look, try the pharmacy." They return to their phone, ears red.');
            } else if (choice === 0) {
              eng.showMessage('Tyler waves vaguely at the store. "Everything\'s right there. Self-service. It\'s in the name. QuikStop. Quick. Stop. Done."');
            } else {
              eng.showMessage('Tyler is already back on their phone before you finish speaking.');
            }
          });
        },
        onUse(eng) { eng.showMessage('You try to get Tyler\'s attention by waving. They look through you like you\'re made of glass.'); },
        onTake(eng) { eng.showMessage('Tyler is not for sale. Though given their work ethic, they might as well not be here at all.'); }
      }
    ],

    onEnter(eng) {
      if (!eng.getFlag('store_intro')) {
        eng.setFlag('store_intro');
        eng.showMessage('The QuikStop convenience store. Fluorescent lights hum overhead. It smells like coffee and broken dreams.');
      }
    }
  };

  // ── 4. CLUB FABULOUS (DISCO) ──
  const disco = {
    id: 'disco',
    name: 'Club Fabulous',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Dark floor with dance squares
      GFX.rect(ctx, 0, 85, w, h - 85, '#111');
      // Dance floor (colorful tiles)
      const colors = ['#FF0044', '#FF8800', '#FFFF00', '#00FF44', '#0088FF', '#8800FF'];
      for (let fy = 95; fy < 160; fy += 12) {
        for (let fx = 80; fx < 240; fx += 12) {
          const ci = Math.floor(Math.sin(eng.waterPhase * 3 + fx * 0.1 + fy * 0.1) * 3 + 3) % colors.length;
          const prevAlpha = ctx.globalAlpha;
          ctx.globalAlpha = 0.3 * prevAlpha;
          GFX.rect(ctx, fx, fy, 11, 11, colors[ci]);
          ctx.globalAlpha = prevAlpha;
        }
      }
      // Walls
      GFX.rect(ctx, 0, 0, w, 85, '#1a0020');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 85, '#110018');
      // Mirror ball
      GFX.drawMirrorBall(ctx, 160, 20, eng.waterPhase);
      // DJ booth
      GFX.rect(ctx, 240, 55, 60, 30, '#222');
      GFX.drawConsolePanel(ctx, 245, 58, 50, 24, eng.waterPhase);
      // Bar (small)
      GFX.drawBarCounter(ctx, 10, 60, 55);
      // Speakers
      GFX.rect(ctx, 10, 15, 18, 25, '#111');
      GFX.rect(ctx, 12, 17, 14, 10, '#333');
      GFX.rect(ctx, 292, 15, 18, 25, '#111');
      GFX.rect(ctx, 294, 17, 14, 10, '#333');
      // Door
      GFX.drawDoor(ctx, 152, 130, 16, 38, '#440044');
      // Neon accents
      GFX.drawNeonSign(ctx, 80, 10, 60, 5, '#FF00FF', eng.waterPhase);
      GFX.drawNeonSign(ctx, 180, 10, 60, 5, '#00FFFF', eng.waterPhase + 1);
    },

    walkable: [{ x: 15, y: 95, w: 285, h: 55 }],

    exits: [
      { x: 145, y: 138, w: 30, h: 28, target: 'street', entryX: 263, entryY: 95,
        walkX: 160, walkY: 155 }
    ],

    hotspots: [
      {
        name: 'dance floor', x: 80, y: 95, w: 160, h: 55,
        onLook(eng) { eng.showMessage('The dance floor pulses with colored lights. Several people are dancing. They look like they\'re having more fun than you.'); },
        onUse(eng) {
          const count = eng.getFlag('dance_count') || 0;
          eng.setFlag('dance_count', count + 1);
          const responses = [
            'You bust out your signature move: The Sprinkler. People clear a wide area around you. (+5 points)',
            'You try The Robot. It\'s more like The Malfunctioning Toaster.',
            'You attempt The Worm. You just kind of flop on the ground. The DJ turns the music down to watch.',
            'You do finger guns while shuffling. Someone calls an ambulance, assuming you\'re having a medical event.',
          ];
          if (count === 0) eng.addScore(5);
          eng.showMessage(responses[Math.min(count, responses.length - 1)]);
        }
      },
      {
        name: 'mirror ball', x: 152, y: 12, w: 16, h: 16,
        onLook(eng) { eng.showMessage('A glorious mirror ball scatters light across the room. For a moment, even Larry looks glamorous. The moment passes.'); },
        onTake(eng) { eng.showMessage('Even if you could reach it, what would you do with a mirror ball? Actually, don\'t answer that.'); }
      },
      {
        name: 'DJ booth', x: 235, y: 50, w: 70, h: 35,
        onLook(eng) { eng.showMessage('The DJ booth is a fortress of blinking lights and questionable music taste.'); }
      }
    ],

    npcs: [
      {
        name: 'DJ Spinz', x: 270, y: 90, w: 20, h: 30,
        draw(ctx, eng) { GFX.drawDJ(ctx, 270, 90, eng.waterPhase); },
        onLook(eng) { eng.showMessage('DJ Spinz. He has more hair product than talent, but the crowd doesn\'t seem to mind.'); },
        onTalk(eng) {
          eng.showDialog('DJ Spinz', '"Yo yo yo! Welcome to Club Fab! What\'s your vibe tonight?"', ['Play something smooth!', 'Got a VIP pass?', 'Your music is... loud'], (choice) => {
            if (choice === 0) {
              eng.showMessage('DJ Spinz plays a slow jam. The lights dim. Nobody asks Larry to dance. As expected.');
            } else if (choice === 1) {
              if (!eng.hasItem('disco_pass') && !eng.getFlag('got_pass_from_dj')) {
                eng.setFlag('got_pass_from_dj');
                eng.addItem('disco_pass', '🎫', 'VIP Pass');
                eng.showMessage('"Sure man, here\'s a spare VIP pass. Tell \'em Spinz sent ya!" This might come in handy. (+10 points)');
                eng.addScore(10);
              } else {
                eng.showMessage('"I already gave you one, bro. Don\'t lose it!"');
              }
            } else {
              eng.showMessage('"WHAT? CAN\'T HEAR YOU! MUSIC\'S TOO LOUD!" He turns it up. Your fillings vibrate.');
            }
          });
        }
      }
    ],

    onEnter(eng) {
      if (!eng.getFlag('disco_intro')) {
        eng.setFlag('disco_intro');
        eng.showMessage('Club Fabulous! The bass hits you like a wall. Lights flash. People dance. Larry adjusts his collar and tries to look natural.');
      }
    }
  };

  // ── 5. CASINO ──
  const casino = {
    id: 'casino',
    name: 'Lucky Star Casino',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Carpet (gaudy pattern)
      GFX.rect(ctx, 0, 80, w, h - 80, '#660022');
      for (let fy = 80; fy < h; fy += 10) {
        for (let fx = 0; fx < w; fx += 10) {
          if ((fx + fy) % 20 === 0) GFX.rect(ctx, fx, fy, 5, 5, '#880033');
        }
      }
      // Ceiling
      GFX.rect(ctx, 0, 0, w, 80, '#330011');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 80, '#440015');
      // Chandeliers
      GFX.rect(ctx, 80, 10, 2, 15, C.GOLD);
      GFX.rect(ctx, 74, 25, 14, 8, C.GOLD);
      GFX.drawSparkle(ctx, 81, 30, eng.sparklePhase, C.YELLOW);
      GFX.rect(ctx, 220, 10, 2, 15, C.GOLD);
      GFX.rect(ctx, 214, 25, 14, 8, C.GOLD);
      GFX.drawSparkle(ctx, 221, 30, eng.sparklePhase + 1, C.YELLOW);
      // Slot machines (left)
      GFX.drawSlotMachine(ctx, 20, 60);
      GFX.drawSlotMachine(ctx, 45, 60);
      GFX.drawSlotMachine(ctx, 70, 60);
      // Card table (center)
      GFX.rect(ctx, 130, 85, 60, 35, '#006633');
      GFX.rect(ctx, 131, 86, 58, 33, '#008844');
      // Roulette (right)
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(265, 100, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#006633';
      ctx.beginPath();
      ctx.arc(265, 100, 16, 0, Math.PI * 2);
      ctx.fill();
      // Door to hotel
      GFX.drawDoor(ctx, 152, 55, 16, 24, C.GOLD);
      // Exit
      GFX.drawDoor(ctx, 5, 120, 12, 30, '#440015');
    },

    walkable: [{ x: 15, y: 90, w: 290, h: 60 }],

    exits: [
      { x: 0, y: 115, w: 20, h: 40, target: 'street', entryX: 200, entryY: 95,
        walkX: 10, walkY: 135 },
      { x: 145, y: 55, w: 24, h: 30, target: 'hotel', entryX: 160, entryY: 140,
        walkX: 157, walkY: 95,
        condition(eng) { return eng.hasItem('hotel_key'); } }
    ],

    hotspots: [
      {
        name: 'slot machines', x: 15, y: 55, w: 80, h: 35,
        onLook(eng) { eng.showMessage('A row of slot machines, each promising life-changing jackpots. The only thing they\'ve changed is your wallet balance.'); },
        onUse(eng) {
          const tries = eng.getFlag('slot_tries') || 0;
          eng.setFlag('slot_tries', tries + 1);
          if (tries === 2) {
            eng.showMessage('🎰 JACKPOT! Three cherries! You win $200 and a complimentary hotel room key! Tonight\'s looking up! (+15 points)');
            eng.addScore(15);
            eng.addItem('cash', '💵', 'Cash');
            eng.addItem('hotel_key', '🔑', 'Hotel Key');
          } else if (tries < 2) {
            eng.showMessage('You pull the lever. Lemon, cherry, banana. Nothing. The machine makes a sad trombone sound.');
          } else {
            eng.showMessage('You already won the jackpot. Quit while you\'re ahead — a concept Larry has never understood.');
          }
        },
        onTalk(eng) { eng.showMessage('"Come on baby, daddy needs a new leisure suit!" The machine does not care about your fashion needs.'); }
      },
      {
        name: 'card table', x: 125, y: 80, w: 70, h: 40,
        onLook(eng) { eng.showMessage('A blackjack table. The dealer looks like he could smell a bad bluff from orbit.'); },
        onUse(eng) { eng.showMessage('You sit down at blackjack. You\'re dealt a 2 and a 3. You hit. Another 2. You hit again. 10. You hit ONE MORE TIME. Bust. Classic.'); },
        onTalk(eng) { eng.showMessage('"Hit me!" you shout at the card table. A nearby security guard looks concerned.'); }
      },
      {
        name: 'roulette wheel', x: 242, y: 78, w: 45, h: 45,
        onLook(eng) { eng.showMessage('The roulette wheel spins hypnotically. "Always bet on red" is Larry\'s philosophy. Also his fashion philosophy.'); },
        onUse(eng) { eng.showMessage('You bet everything on 7. The ball lands on 8. "So close!" says nobody.'); },
        onTalk(eng) { eng.showMessage('"Red 7! Red 7!" you chant. The other gamblers edge away from the weird chanting guy.'); }
      },
      {
        name: 'hotel door', x: 145, y: 50, w: 24, h: 30,
        onLook(eng) { eng.showMessage('A golden door leads to the hotel suites. Very exclusive. You\'d need a room key.'); },
        onTalk(eng) {
          if (!eng.hasItem('hotel_key')) {
            eng.showMessage('"The hotel suites are for registered guests only," says the sign. Win a jackpot, maybe?');
          }
        }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('casino_intro')) {
        eng.setFlag('casino_intro');
        eng.showMessage('The Lucky Star Casino! Gaudy carpets, jangling slot machines, and the faint scent of desperation. Larry feels right at home.');
      }
    }
  };

  // ── 6. HOTEL LOBBY & PENTHOUSE ──
  const hotel = {
    id: 'hotel',
    name: 'Hotel Paradiso',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Marble floor
      GFX.rect(ctx, 0, 85, w, h - 85, '#DDCCBB');
      for (let fy = 85; fy < h; fy += 8) {
        for (let fx = 0; fx < w; fx += 8) {
          if ((fx + fy) % 16 === 0) GFX.rect(ctx, fx, fy, 8, 8, '#CCBBAA');
        }
      }
      // Walls
      GFX.rect(ctx, 0, 0, w, 85, '#EEDDCC');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 85, '#DDCCBB');
      // Grand staircase
      for (let s = 0; s < 6; s++) {
        GFX.rect(ctx, 120 + s * 3, 55 + s * 5, 80 - s * 6, 6, '#AA8866');
        GFX.rect(ctx, 121 + s * 3, 56 + s * 5, 78 - s * 6, 2, '#BB9977');
      }
      // Reception desk
      GFX.rect(ctx, 20, 70, 70, 15, C.DKBROWN);
      GFX.rect(ctx, 21, 71, 68, 6, C.BROWN);
      // Chandelier
      GFX.rect(ctx, 158, 5, 4, 15, C.GOLD);
      GFX.rect(ctx, 150, 20, 20, 10, C.GOLD);
      GFX.drawSparkle(ctx, 157, 25, eng.sparklePhase, C.YELLOW);
      GFX.drawSparkle(ctx, 163, 25, eng.sparklePhase + 1, C.YELLOW);
      // Elevator
      GFX.rect(ctx, 260, 40, 30, 45, C.DKGRAY);
      GFX.rect(ctx, 262, 42, 26, 41, C.GRAY);
      GFX.rect(ctx, 274, 42, 2, 41, C.DKGRAY);
      // Plants
      GFX.rect(ctx, 105, 70, 8, 15, C.DKBROWN);
      GFX.rect(ctx, 102, 58, 14, 14, C.GREEN);
      GFX.rect(ctx, 210, 70, 8, 15, C.DKBROWN);
      GFX.rect(ctx, 207, 58, 14, 14, C.GREEN);
      // Exit
      GFX.drawDoor(ctx, 152, 120, 16, 38, C.GOLD);
      // Flowers
      if (!eng.hasItem('flowers')) {
        GFX.rect(ctx, 52, 65, 6, 8, C.GREEN);
        GFX.rect(ctx, 53, 60, 4, 5, C.RED);
        GFX.pixel(ctx, 54, 59, C.PINK);
      }
      // Chocolates
      if (!eng.hasItem('chocolates')) {
        GFX.rect(ctx, 38, 68, 8, 4, '#663322');
        GFX.rect(ctx, 39, 67, 6, 1, C.GOLD);
      }
    },

    walkable: [{ x: 15, y: 90, w: 280, h: 60 }],

    exits: [
      { x: 145, y: 135, w: 30, h: 28, target: 'casino', entryX: 157, entryY: 95,
        walkX: 160, walkY: 155 },
      { x: 255, y: 40, w: 40, h: 48, target: 'penthouse', entryX: 160, entryY: 140,
        walkX: 275, walkY: 95 }
    ],

    hotspots: [
      {
        name: 'flowers', x: 48, y: 55, w: 15, h: 25,
        onLook(eng) { eng.showMessage('A vase of beautiful red roses on the reception desk. Very romantic. Very stealable.'); },
        onTake(eng) {
          if (eng.hasItem('flowers')) { eng.showMessage('You already have flowers.'); return; }
          eng.addItem('flowers', '💐', 'Flowers');
          eng.showMessage('You swipe the flowers when nobody\'s looking. Smooth criminal. (+5 points)');
          eng.addScore(5);
        }
      },
      {
        name: 'chocolates', x: 35, y: 65, w: 15, h: 10,
        onLook(eng) { eng.showMessage('A box of fine chocolates, probably left by a previous guest. Finders keepers!'); },
        onTake(eng) {
          if (eng.hasItem('chocolates')) { eng.showMessage('You already snagged the chocolates.'); return; }
          eng.addItem('chocolates', '🍫', 'Chocolates');
          eng.showMessage('You pocket the chocolates. A gentleman always comes prepared. (+5 points)');
          eng.addScore(5);
        }
      },
      {
        name: 'reception desk', x: 15, y: 65, w: 80, h: 20,
        onLook(eng) { eng.showMessage('The reception desk is unmanned. A bell sits temptingly in the center.'); },
        onUse(eng) { eng.showMessage('*DING DING DING* You ring the bell enthusiastically. Nobody comes. You ring it twelve more times. Still nobody.'); }
      },
      {
        name: 'elevator', x: 255, y: 38, w: 38, h: 50,
        onLook(eng) { eng.showMessage('A fancy elevator with gilded doors. It goes to the penthouse suite.'); },
        onUse(eng) {
          if (!eng.hasItem('hotel_key')) {
            eng.showMessage('The elevator requires a room key. The button just makes a sad beep.');
          }
        }
      },
      {
        name: 'staircase', x: 115, y: 50, w: 90, h: 40,
        onLook(eng) { eng.showMessage('A grand marble staircase sweeps upward. Very fancy. Very intimidating for a guy in a leisure suit.'); },
        onUse(eng) { eng.showMessage('You try to walk up the stairs dramatically. You trip on the second step.'); }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('hotel_intro')) {
        eng.setFlag('hotel_intro');
        eng.showMessage('Hotel Paradiso! Marble floors, crystal chandeliers, and a reception desk staffed by absolutely nobody.');
      }
    }
  };

  // ── 7. PENTHOUSE ──
  const penthouse = {
    id: 'penthouse',
    name: 'Penthouse Suite',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Plush carpet
      GFX.rect(ctx, 0, 80, w, h - 80, '#663355');
      // Walls
      GFX.rect(ctx, 0, 0, w, 80, '#442244');
      GFX.drawPerspectiveSideWalls(ctx, w, h, 80, '#331133');
      // City view window
      GFX.rect(ctx, 80, 10, 160, 55, '#112');
      // City lights through window
      for (let i = 0; i < 30; i++) {
        const lx = 85 + GFX.seededRandom(i * 7) * 148;
        const ly = 20 + GFX.seededRandom(i * 13) * 35;
        GFX.pixel(ctx, lx, ly, '#FFCC44');
      }
      // Window frame
      GFX.rect(ctx, 78, 8, 164, 2, C.GOLD);
      GFX.rect(ctx, 78, 65, 164, 2, C.GOLD);
      GFX.rect(ctx, 78, 8, 2, 59, C.GOLD);
      GFX.rect(ctx, 240, 8, 2, 59, C.GOLD);
      // Bed
      GFX.rect(ctx, 30, 75, 60, 30, '#CC3366');
      GFX.rect(ctx, 25, 70, 70, 8, C.WHITE);
      GFX.rect(ctx, 25, 68, 10, 10, '#FFDDDD');
      GFX.rect(ctx, 80, 68, 10, 10, '#FFDDDD');
      // Jacuzzi
      GFX.rect(ctx, 220, 85, 50, 30, '#4488AA');
      GFX.rect(ctx, 222, 87, 46, 26, '#66BBDD');
      // TV
      GFX.rect(ctx, 145, 50, 30, 22, C.BLACK);
      GFX.rect(ctx, 147, 52, 26, 18, '#334466');
      // Mini bar
      GFX.rect(ctx, 270, 55, 25, 20, C.BROWN);
      GFX.rect(ctx, 272, 57, 21, 8, '#445566');
      // Elevator
      GFX.drawDoor(ctx, 5, 60, 14, 25, C.DKGRAY);
    },

    walkable: [{ x: 15, y: 95, w: 285, h: 55 }],

    exits: [
      { x: 0, y: 58, w: 22, h: 30, target: 'hotel', entryX: 275, entryY: 95,
        walkX: 12, walkY: 100 }
    ],

    hotspots: [
      {
        name: 'jacuzzi', x: 215, y: 80, w: 60, h: 35,
        onLook(eng) { eng.showMessage('A luxurious jacuzzi. Bubbles and everything. This is the fanciest thing Larry has ever been within ten feet of.'); },
        onUse(eng) {
          if (!eng.getFlag('jacuzzi_used')) {
            eng.setFlag('jacuzzi_used');
            eng.showMessage('You hop in the jacuzzi in your leisure suit. It\'s the happiest moment of your life. (+5 points)');
            eng.addScore(5);
          } else {
            eng.showMessage('You soak in the jacuzzi again. Your suit will never be the same. Worth it.');
          }
        }
      },
      {
        name: 'bed', x: 20, y: 65, w: 75, h: 40,
        onLook(eng) { eng.showMessage('A heart-shaped bed with satin sheets. Larry has only seen these in movies. Classy movies, he insists.'); },
        onUse(eng) { eng.showMessage('You flop onto the bed. It\'s incredibly comfortable. You could just... take a nap... NO! You came here for LOVE!'); }
      },
      {
        name: 'city view', x: 80, y: 8, w: 162, h: 60,
        onLook(eng) { eng.showMessage('The city of Lost Wages spreads out below, glittering with a million lights. For a moment, anything seems possible. Even for Larry.'); },
        onUse(eng) { eng.showMessage('You open the window and shout "I\'M LARRY LAFFER AND I\'M LOOKING FOR LOVE!" Security is called.'); }
      },
      {
        name: 'mini bar', x: 265, y: 50, w: 35, h: 25,
        onLook(eng) { eng.showMessage('The mini bar. Everything costs $47 per item. A single peanut is $12.'); },
        onUse(eng) {
          if (!eng.getFlag('minibar_used')) {
            eng.setFlag('minibar_used');
            eng.showMessage('You open the mini bar and eat everything. Three bags of nuts, two chocolate bars, and something Swedish. No ragrets.');
          } else {
            eng.showMessage('The mini bar is empty. You ate everything. The bill will be astronomical.');
          }
        }
      },
      {
        name: 'TV', x: 140, y: 48, w: 38, h: 28,
        onLook(eng) { eng.showMessage('A flat screen TV mounted on the wall. It\'s currently showing an infomercial for "Love Guru Larry\'s Dating Secrets." Wait...'); },
        onUse(eng) {
          if (!eng.getFlag('tv_watched')) {
            eng.setFlag('tv_watched');
            eng.showMessage('You watch TV for a while. A dating show comes on. All the wrong answers are exactly what Larry would have said. Enlightening.');
          } else {
            eng.showMessage('The TV is showing reruns. Of your life, apparently.');
          }
        }
      }
    ],

    npcs: [
      {
        name: 'Eve', x: 200, y: 110, w: 20, h: 30, hidden: true,
        draw(ctx, eng) {
          // Simple female NPC
          GFX.rect(ctx, 197, 88, 6, 10, '#FF3366');
          GFX.rect(ctx, 198, 82, 4, 6, C.SKIN);
          GFX.rect(ctx, 197, 78, 6, 4, '#FFD700');
          GFX.rect(ctx, 197, 98, 3, 6, '#FF3366');
          GFX.rect(ctx, 200, 98, 3, 6, '#FF3366');
        },
        onLook(eng) { eng.showMessage('Eve. She\'s smart, funny, and way out of Larry\'s league. But she doesn\'t seem to mind his company.'); },
        onTalk(eng) {
          if (eng.hasItem('flowers') && eng.hasItem('chocolates') && eng.hasItem('breath_spray')) {
            eng.showDialog('Eve', '"Larry! You brought flowers AND chocolates? And you smell... actually pleasant! I\'m impressed!"', ['Will you be my date?', 'These are for you!'], (choice) => {
              eng.removeItem('flowers');
              eng.removeItem('chocolates');
              eng.removeItem('breath_spray');
              eng.showMessage('Eve takes the gifts and laughs at your terrible jokes. Against all odds, Larry Laffer has found love! (+25 points)');
              eng.addScore(25);
              setTimeout(() => {
                eng.win('Against all conceivable odds, Larry Laffer has found love in the city of Lost Wages! Eve laughs at his jokes, tolerates his suit, and genuinely enjoys his company. The narrator is genuinely shocked. Congratulations, you hopeless romantic!');
              }, 3000);
            });
          } else {
            eng.showDialog('Eve', '"Hey, you seem... interesting. I like a man who makes an effort though."', ['What do you mean?', 'I AM making an effort!'], (choice) => {
              eng.showMessage('Eve hints that she appreciates romantic gestures — flowers, chocolates... and decent breath. Take the hint, Larry.');
            });
          }
        },
        onUse(eng) { eng.showMessage('Larry tries his signature move: the finger-gun wink combo. Eve laughs. That\'s... actually a good sign?'); }
      }
    ],

    onEnter(eng) {
      // Reveal Eve after first visit
      if (!eng.getFlag('penthouse_intro')) {
        eng.setFlag('penthouse_intro');
        const eve = penthouse.npcs.find(n => n.name === 'Eve');
        if (eve) eve.hidden = false;
        eng.showMessage('The Penthouse Suite! Satin sheets, city views, and a jacuzzi. And there\'s someone here — a woman named Eve!');
      }
    }
  };

  // ═══════════════════════════════════
  //  SCENE LOOK DESCRIPTIONS
  // ═══════════════════════════════════
  const sceneDescriptions = {
    bar: 'Lefty\'s Bar — a dimly lit dive that smells of stale beer and desperation. The jukebox plays hits from two decades ago. A bartender polishes glasses with a skeptical expression. Pool table in the corner, bottles behind the bar. The door leads to Main Street.',
    street: 'Main Street of Lost Wages. Neon signs flicker against the night sky. Buildings tower overhead. A bar entrance on the left, a convenience store in the center, a disco on the right. A taxi idles at the curb.',
    store: 'The QuikStop — fluorescent-lit paradise of snacks, magazines, and personal hygiene products. The breath spray display catches your eye. A bored clerk guards the register.',
    disco: 'Club Fabulous — the hottest nightspot in Lost Wages! A spinning mirror ball cascades light across a pulsing dance floor. DJ Spinz rules the booth. Speakers thump. The air is electric.',
    casino: 'The Lucky Star Casino! Rows of slot machines, a blackjack table, and a roulette wheel. Gaudy carpet, chandeliers, and the constant soundtrack of coins and crushed hopes. A golden door leads to the hotel.',
    hotel: 'Hotel Paradiso — marble floors, a crystal chandelier, and a sweeping staircase. The reception desk is unmanned (typical). An elevator goes up to the penthouse suites.',
    penthouse: 'The Penthouse Suite at Hotel Paradiso. Heart-shaped bed, jacuzzi, mini bar, and a stunning view of the city. This is the fanciest place Larry has ever set foot in.',
  };

  const allScenes = { bar, street, store, disco, casino, hotel, penthouse };
  Object.entries(sceneDescriptions).forEach(([id, desc]) => {
    if (allScenes[id]) allScenes[id].onLookScene = function(eng) { eng.showMessage(desc); };
  });

  // ═══════════════════════════════════
  //  REGISTER SCENES
  // ═══════════════════════════════════
  window.GameWorlds = window.GameWorlds || {};
  window.GameWorlds.lsl = allScenes;

})();
