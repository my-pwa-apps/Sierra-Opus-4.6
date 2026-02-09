/* ============================================
   King's Quest: The Enchanted Isle
   World - Scenes, Dialogs, Items, Puzzles
   ============================================ */

(function() {
  const C = GFX.C;

  // ═══════════════════════════════════
  //  SCENE DEFINITIONS
  // ═══════════════════════════════════

  // ── 1. THRONE ROOM ──
  const throneRoom = {
    id: 'throneRoom',
    name: 'Throne Room',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Floor
      GFX.drawStoneFloor(ctx, 0, 100, w, h - 100);
      // Back wall
      GFX.drawStoneWall(ctx, 0, 0, w, 100);
      // Perspective side walls & floor grid
      GFX.drawPerspectiveSideWalls(ctx, w, h, 100, C.DKSTONE);
      GFX.drawPerspectiveFloorGrid(ctx, w, h, 100);
      // Red carpet
      GFX.rect(ctx, 140, 100, 40, 70, C.DKRED);
      GFX.rect(ctx, 142, 100, 36, 70, C.RED);
      // Carpet pattern
      for (let cy = 105; cy < 170; cy += 10) {
        GFX.rect(ctx, 158, cy, 2, 4, C.GOLD);
      }
      // Windows
      GFX.drawWindow(ctx, 40, 20, 18, 30);
      GFX.drawWindow(ctx, 262, 20, 18, 30);
      // Torches
      GFX.drawTorch(ctx, 80, 30, eng.waterPhase);
      GFX.drawTorch(ctx, 230, 30, eng.waterPhase + 1);
      // King's Throne (left)
      GFX.drawThrone(ctx, 134, 55);
      // Queen's Throne (right)
      GFX.drawThrone(ctx, 162, 55);
      // Tapestries
      GFX.rect(ctx, 110, 15, 16, 40, C.DKRED);
      GFX.rect(ctx, 112, 17, 12, 36, C.RED);
      GFX.rect(ctx, 115, 22, 6, 6, C.GOLD); // crown emblem
      GFX.rect(ctx, 194, 15, 16, 40, C.DKBLUE);
      GFX.rect(ctx, 196, 17, 12, 36, C.BLUE);
      GFX.rect(ctx, 199, 22, 6, 6, C.GOLD);
      // Chest
      if (!eng.getFlag('chest_opened')) {
        GFX.drawChest(ctx, 245, 95, false);
      } else {
        GFX.drawChest(ctx, 245, 95, true);
      }
      // Door (south exit)
      GFX.drawDoor(ctx, 150, 130, 20, 40);
      // Mirror on wall
      GFX.rect(ctx, 28, 25, 2, 24, C.GOLD);
      GFX.rect(ctx, 10, 25, 20, 2, C.GOLD);
      GFX.rect(ctx, 10, 47, 20, 2, C.GOLD);
      GFX.rect(ctx, 10, 25, 2, 24, C.GOLD);
      GFX.rect(ctx, 12, 27, 16, 18, '#5577AA');
      // Graham's reflection (simple)
      GFX.rect(ctx, 18, 32, 4, 8, C.RED);
      GFX.rect(ctx, 19, 30, 2, 2, C.SKIN);
    },

    walkable: [
      { x: 20, y: 110, w: 280, h: 55 }
    ],

    exits: [
      { x: 145, y: 145, w: 30, h: 25, target: 'courtyard', entryX: 160, entryY: 80,
        walkX: 160, walkY: 155 }
    ],

    hotspots: [
      {
        name: 'King\'s throne', x: 134, y: 55, w: 24, h: 40,
        onLook(eng) { eng.showMessage('King Graham\'s throne, the seat of Daventry\'s ruler. Slightly worn from years of heroic sitting. Has a faint scratch from when Graham tried to polish it with his sword.'); },
        onTake(eng) { eng.showMessage('You\'re already the king! You can\'t exactly take your own throne with you.'); },
        onUse(eng) {
          const sits = eng.getFlag('throne_sit_count') || 0;
          eng.setFlag('throne_sit_count', sits + 1);
          const responses = [
            'You sit on your throne briefly. Ah, the responsibilities of kinghood. No time for sitting — there\'s chaos to fix!',
            'You sit again. The throne is comfortable. Too comfortable. Valanice clears her throat pointedly. Right, the kingdom.',
            'You plop down on the throne AGAIN. The moat is still pudding, Graham. PUDDING. Get moving!',
            'Another royal sit-down. At this rate, the Crystal of Order will reassemble itself out of sheer frustration with you.',
            'You\'re sitting on the throne AGAIN?! Sierra would have docked you points for this. Oh wait — we CAN dock points. ...We won\'t, but we COULD.',
            'Graham settles into his throne with a contented sigh. Somewhere, a magical crisis goes unsolved. The butterscotch pudding moat thickens.',
            'The throne creaks under the weight of your procrastination. Kings who sit too much get replaced by more adventurous kings, you know.',
          ];
          eng.showMessage(responses[Math.min(sits, responses.length - 1)]);
        },
        onTalk(eng) { eng.showMessage('You whisper to your throne: "I\'ll be back." The throne does not respond, but appreciates the sentiment.'); },
        onWalk(eng) {
          const sits = eng.getFlag('throne_sit_count') || 0;
          eng.setFlag('throne_sit_count', sits + 1);
          eng.showMessage(sits > 2 ? 'You walk to your throne and sit down. AGAIN. The kingdom isn\'t going to save itself!' : 'You walk to your throne. It\'s tempting to sit, but duty calls.');
        }
      },
      {
        name: 'Queen\'s throne', x: 162, y: 55, w: 24, h: 40,
        onLook(eng) { eng.showMessage('Queen Valanice\'s throne. Equally magnificent, with a slightly more comfortable cushion. The Queen has good taste.'); },
        onTake(eng) { eng.showMessage('That\'s Valanice\'s throne! She would NOT appreciate you hauling it off.'); },
        onUse(eng) { eng.showMessage('You sit in Valanice\'s throne. It IS more comfortable! She gives you a withering look. You stand up quickly, pretending nothing happened.'); },
        onTalk(eng) { eng.showMessage('You address the Queen\'s throne. It has no opinion on the current crisis, being a chair.'); }
      },
      {
        name: 'treasure chest', x: 242, y: 85, w: 20, h: 15,
        onLook(eng) {
          if (eng.getFlag('chest_opened')) {
            eng.showMessage('An old treasure chest. You already took the ship key from it.');
          } else {
            eng.showMessage('An ornate treasure chest. It appears to be unlocked. Something glints inside.');
          }
        },
        onTake(eng) {
          if (!eng.getFlag('chest_opened')) {
            eng.setFlag('chest_opened');
            eng.addItem('ship_key', 'Ship Key', '🗝️', 'An old brass key. It has a tiny anchor etched on it.');
            eng.addScore(5, 'Found ship key');
          } else {
            eng.showMessage('The chest is empty.');
          }
        },
        onUse(eng) { eng.showMessage('You rummage around in the chest.'); }
      },
      {
        name: 'mirror', x: 10, y: 25, w: 20, h: 24,
        onLook(eng) { eng.showMessage('"Mirror, mirror on the wall..." The mirror responds: "Wrong fairy tale, Your Majesty." Typical Sierra sass.'); },
        onTalk(eng) {
          const chats = eng.getFlag('mirror_chat_count') || 0;
          eng.setFlag('mirror_chat_count', chats + 1);
          const responses = [
            'The mirror sighs. "I\'m a mirror, not an oracle. Try the mushroom lady."',
            'The mirror groans. "You again? I reflect appearances, not solutions to your kingdom\'s problems."',
            'The mirror: "Look, Your Majesty, I can see you have a LOT going on. Pudding moat, upside-down flowers, Latin-speaking cat. Maybe GO FIX THOSE instead of talking to furniture?"',
            'The mirror just shows your reflection looking increasingly guilty about not saving the kingdom.',
          ];
          eng.showMessage(responses[Math.min(chats, responses.length - 1)]);
        },
        onUse(eng) { eng.showMessage('You polish the mirror with your sleeve. Your reflection polishes back. At least SOMEONE in this castle is being productive.'); },
        onTake(eng) { eng.showMessage('The mirror is bolted to the wall. Besides, seven years of bad luck seems unwise when you already have a pudding moat situation.'); }
      },
      {
        name: 'tapestry', x: 110, y: 15, w: 16, h: 40,
        onLook(eng) { eng.showMessage('A tapestry depicting the Kingdom of Daventry in better times. Before the pudding-moat incident.'); },
        onUse(eng) { eng.showMessage('You peek behind the tapestry hoping for a secret passage. There\'s just a wall. And a spider. The spider waves.'); },
        onTake(eng) { eng.showMessage('The tapestry is sewn firmly to the wall. It depicts your coronation. You looked younger then. And less worried about pudding.'); },
        onTalk(eng) { eng.showMessage('You narrate to the tapestry about the current crisis. The woven figures look unimpressed. Typical historical figures.'); }
      },
      {
        name: 'window', x: 40, y: 20, w: 18, h: 30,
        onLook(eng) { eng.showMessage('Through the window, you can see the courtyard. The garden appears to be growing... downwards? That\'s new.'); },
        onUse(eng) { eng.showMessage('You open the window. A breeze carries the scent of butterscotch pudding. You close the window.'); },
        onTalk(eng) { eng.showMessage('You yell out the window: "EVERYTHING IS FINE!" It is not fine.'); }
      }
    ],

    npcs: [
      {
        name: 'Queen Valanice', x: 174, y: 92, w: 16, h: 30, hidden: false,
        draw(ctx, eng) { GFX.drawValanice(ctx, 174, 92, eng.waterPhase); },
        onLook(eng) { eng.showMessage('Your beloved wife, Queen Valanice. She looks worried about the state of the kingdom.'); },
        onTalk(eng) {
          if (!eng.getFlag('talked_valanice')) {
            eng.setFlag('talked_valanice');
            eng.showDialog('Queen Valanice',
              '"Oh Graham! The kingdom is in chaos! The moat has turned to butterscotch pudding, ' +
              'the garden grows upside-down, and the royal cat started conjugating Latin verbs this morning!"',
              [
                { text: '"Fear not, my dear! I shall investigate!"', action(eng) {
                  eng.showDialog('Queen Valanice',
                    '"A mysterious island appeared offshore yesterday. The fisherman Barnaby might know something. ' +
                    'He\'s down at the docks. Oh, and check the old treasure chest - I think the ship key is in there."',
                    null, () => { eng.addScore(5, 'Talked to Valanice'); });
                }},
                { text: '"Has the cat tried Ancient Greek yet?"', action(eng) {
                  eng.showDialog('Queen Valanice',
                    '"This is serious, Graham! A strange island appeared yesterday. See Barnaby at the docks. ' +
                    'And NO, the cat hasn\'t tried Greek. Let\'s not give him ideas."',
                    null, () => { eng.addScore(5, 'Talked to Valanice'); });
                }}
              ]);
          } else {
            eng.showDialog('Queen Valanice',
              '"Hurry Graham! Check the treasure chest for the ship key, get supplies from the kitchen, ' +
              'and find Barnaby at the docks. The kingdom is counting on you!"');
          }
        }
      }
    ]
  };

  // ── 2. CASTLE COURTYARD ──
  const courtyard = {
    id: 'courtyard',
    name: 'Castle Courtyard',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Sky
      GFX.drawSky(ctx, w, 50, '#4488CC', '#88BBEE');
      // Clouds
      GFX.drawCloud(ctx, 30, 10, 5);
      GFX.drawCloud(ctx, 200, 18, 4);
      // Castle wall (background)
      GFX.drawCastleWall(ctx, 0, 30, w, 30);
      // Ground
      GFX.drawGrass(ctx, 0, 60, w, h - 60, C.GRASSGREEN, C.GREEN);
      GFX.drawPerspectiveGroundOverlay(ctx, 0, 60, w, h - 60);
      // Path
      GFX.drawDirt(ctx, 130, 60, 60, h - 60);
      // Garden (growing upside-down!)
      GFX.rect(ctx, 20, 70, 50, 30, C.DKGREEN);
      // Upside-down flowers
      for (let fx = 25; fx < 65; fx += 8) {
        GFX.rect(ctx, fx, 90, 2, 10, C.GREEN); // stems going up-down
        ctx.fillStyle = ['#FF5555','#FFAA55','#FF55FF','#FFFF55','#55AAFF'][(fx/8|0)%5];
        ctx.fillRect(fx - 1, 97, 4, 4); // flowers at bottom (upside-down!)
      }
      GFX.rect(ctx, 20, 68, 50, 3, C.BROWN); // garden border
      // Moat (pudding!)
      GFX.rect(ctx, 0, 55, w, 8, C.PUDDING);
      for (let px = 5; px < w; px += 15) {
        GFX.rect(ctx, px, 57, 8, 3, '#CC8833');
      }
      // Castle door (back to throne room)
      GFX.drawDoor(ctx, 148, 30, 24, 30, C.DKBROWN);
      // Well
      GFX.rect(ctx, 240, 80, 20, 15, C.STONE);
      GFX.rect(ctx, 242, 82, 16, 11, C.DKBLUE);
      GFX.rect(ctx, 238, 78, 24, 3, C.STONE);
      GFX.rect(ctx, 248, 68, 2, 10, C.BROWN);
      GFX.rect(ctx, 244, 66, 12, 2, C.BROWN);
      // Kitchen door (left)
      GFX.drawDoor(ctx, 80, 35, 16, 25);
      // Gate (south to docks)
      GFX.rect(ctx, 145, h - 10, 30, 10, C.DKBROWN);
      GFX.rect(ctx, 147, h - 8, 26, 6, C.BROWN);
    },

    walkable: [
      { x: 20, y: 65, w: 280, h: 100 }
    ],

    exits: [
      { x: 145, y: 30, w: 30, h: 30, target: 'throneRoom', entryX: 160, entryY: 145, walkX: 160, walkY: 65 },
      { x: 75, y: 35, w: 24, h: 25, target: 'kitchen', entryX: 250, entryY: 130, walkX: 88, walkY: 65 },
      { x: 145, y: 155, w: 30, h: 20, target: 'docks', entryX: 160, entryY: 70, walkX: 160, walkY: 160 }
    ],

    hotspots: [
      {
        name: 'upside-down garden', x: 20, y: 68, w: 50, h: 35,
        onLook(eng) { eng.showMessage('The royal garden. The flowers are growing downward into the earth. The roses are particularly offended by this arrangement.'); },
        onTalk(eng) { eng.showMessage('You address the garden: "Grow properly!" The flowers remain stubbornly inverted.'); },
        onUse(eng) { eng.showMessage('You try to replant a flower right-side up. It flips itself upside-down with an audible "hmph." Even the gardening is rebellious.'); },
        onTake(eng) { eng.showMessage('You pull up a flower. It replants itself upside-down in your hand. You give up and put it back.'); }
      },
      {
        name: 'pudding moat', x: 0, y: 55, w: 320, h: 8,
        onLook(eng) { eng.showMessage('The castle moat has been transformed into butterscotch pudding. It actually smells delicious.'); },
        onTake(eng) {
          const scoops = eng.getFlag('pudding_scoops') || 0;
          eng.setFlag('pudding_scoops', scoops + 1);
          const msgs = [
            'You scoop some pudding. It\'s butterscotch! You eat it. Delicious, but not useful.',
            'You scoop MORE pudding. Still butterscotch. Still delicious. Still not helping the kingdom.',
            'You are eating pudding from a moat. This is what your reign has come to.',
            'The pudding is starting to judge you. Kings shouldn\'t eat moat pudding, Graham.',
          ];
          eng.showMessage(msgs[Math.min(scoops, msgs.length - 1)]);
        },
        onUse(eng) { eng.showMessage('You dip a finger in the pudding. Yep, still butterscotch. The quality is actually quite good for a magical accident.'); },
        onTalk(eng) { eng.showMessage('"Hello, pudding." The pudding bubbles. Was that a response, or just pudding being pudding? You\'ll never know.'); },
        onWalk(eng) { eng.die('You wade into the pudding moat and immediately sink. Butterscotch pudding is surprisingly deep. And sticky. Very sticky. Game Over.'); }
      },
      {
        name: 'old well', x: 238, y: 66, w: 24, h: 30,
        onLook(eng) { eng.showMessage('An old stone well. The water inside has turned a suspicious shade of purple. Best not to drink it.'); },
        onUse(eng) { eng.showMessage('You lower the bucket. It comes back up filled with what appears to be grape juice. The magic is thorough, you\'ll give it that.'); },
        onTalk(eng) { eng.showMessage('You shout down the well: "Hello!" A tiny voice echoes back: "Fix the Crystal, you time-waster!" Rude.'); },
        onUseItem(eng, itemId) {
          if (itemId === 'bucket') {
            eng.showMessage('You lower the bucket into the well. The purple water looks magical, but it\'s not the enchanted pond water you need.');
            return true;
          }
          return false;
        }
      }
    ],

    npcs: []
  };

  // ── 3. KITCHEN ──
  const kitchen = {
    id: 'kitchen',
    name: 'Castle Kitchen',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Floor
      GFX.drawStoneFloor(ctx, 0, 100, w, h - 100);
      // Walls
      GFX.drawStoneWall(ctx, 0, 0, w, 100);
      // Perspective side walls & floor grid
      GFX.drawPerspectiveSideWalls(ctx, w, h, 100, C.DKSTONE);
      GFX.drawPerspectiveFloorGrid(ctx, w, h, 100);
      // Fireplace
      GFX.drawFireplace(ctx, 20, 40, 40, 35, true, eng.waterPhase);
      // Table
      GFX.rect(ctx, 120, 85, 60, 4, C.BROWN);
      GFX.rect(ctx, 125, 89, 4, 15, C.BROWN);
      GFX.rect(ctx, 171, 89, 4, 15, C.BROWN);
      // Bread on table
      if (!eng.getFlag('took_bread')) {
        GFX.rect(ctx, 140, 80, 12, 5, C.TAN);
        GFX.rect(ctx, 141, 78, 10, 3, C.LTBROWN);
      }
      // Pot on fireplace
      GFX.drawCauldron(ctx, 40, 72, eng.waterPhase);
      // Shelves
      GFX.drawBookshelf(ctx, 200, 20, 50, 60);
      // On the shelf (spice jars)
      for (let j = 0; j < 4; j++) {
        GFX.rect(ctx, 210 + j*10, 30, 6, 8, ['#DD5555','#55AA55','#5555DD','#DDAA55'][j]);
      }
      // Tar bucket
      if (!eng.getFlag('took_tar')) {
        GFX.rect(ctx, 270, 95, 14, 14, C.DKGRAY);
        GFX.rect(ctx, 272, 97, 10, 10, '#222');
        GFX.rect(ctx, 268, 93, 18, 3, C.DKGRAY);
      }
      // Door
      GFX.drawDoor(ctx, 250, 100, 20, 40);
      // Window
      GFX.drawWindow(ctx, 100, 25, 18, 25);
    },

    walkable: [
      { x: 20, y: 100, w: 270, h: 65 }
    ],

    exits: [
      { x: 248, y: 100, w: 24, h: 40, target: 'courtyard', entryX: 92, entryY: 70, walkX: 260, walkY: 130 }
    ],

    hotspots: [
      {
        name: 'bread loaf', x: 138, y: 77, w: 16, h: 10,
        onLook(eng) {
          if (eng.getFlag('took_bread')) { eng.showMessage('The table is bare. The cook looks mildly annoyed.'); }
          else { eng.showMessage('A fresh loaf of bread on the table. It smells wonderful.'); }
        },
        onTake(eng) {
          if (!eng.getFlag('took_bread')) {
            eng.setFlag('took_bread');
            eng.addItem('bread', 'Bread', '🍞', 'A delicious fresh loaf of bread. Smells amazing.');
            eng.addScore(5, 'Got bread');
          } else { eng.showMessage('You already took the bread.'); }
        }
      },
      {
        name: 'tar bucket', x: 266, y: 91, w: 18, h: 18,
        onLook(eng) {
          if (eng.getFlag('took_tar')) { eng.showMessage('The tar bucket is gone.'); }
          else { eng.showMessage('A bucket of thick, black tar. Used for sealing and waterproofing.'); }
        },
        onTake(eng) {
          if (!eng.getFlag('took_tar')) {
            eng.setFlag('took_tar');
            eng.addItem('tar', 'Tar Bucket', '🪣', 'A bucket of sticky black tar. Good for sealing things.');
            eng.addScore(5, 'Got tar');
          } else { eng.showMessage('You already have the tar.'); }
        }
      },
      {
        name: 'cooking pot', x: 30, y: 62, w: 20, h: 15,
        onLook(eng) { eng.showMessage('A bubbling cauldron of soup. The chef insists it\'s "rustic bouillabaisse" but it looks like regular turnip soup to you.'); },
        onTake(eng) { eng.showMessage('"HEY! Don\'t touch ze soup!" shouts the cook. Fair enough.'); },
        onUse(eng) { eng.showMessage('You stir the soup. It stirs back. That\'s... probably the magic.'); },
        onTalk(eng) { eng.showMessage('You compliment the soup. It bubbles appreciatively. Or threateningly. Hard to tell with enchanted bouillabaisse.'); }
      },
      {
        name: 'fireplace', x: 20, y: 40, w: 40, h: 35,
        onLook(eng) { eng.showMessage('A roaring fireplace. The flames dance merrily, seemingly unaffected by the magical chaos.'); },
        onTalk(eng) { eng.showMessage('"Nice fire," you say. The fire crackles warmly. It\'s the most functional thing in the castle right now.'); },
        onUse(eng) { eng.showMessage('You warm your hands by the fire. Cozy! But the kingdom isn\'t going to un-pudding itself, sire.'); },
        onWalk(eng) { eng.die('You walk directly into the fireplace. This was not your brightest idea. Even for an adventure game protagonist. Game Over.'); }
      },
      {
        name: 'spice jars', x: 200, y: 20, w: 50, h: 60,
        onLook(eng) { eng.showMessage('Shelves full of exotic spices: Dragon Pepper, Unicorn Salt, Troll Spice, and "Definitely Not Poison."'); },
        onTake(eng) { eng.showMessage('The cook gives you a warning look. Better leave the spices alone.'); },
        onUse(eng) { eng.showMessage('You sniff the "Definitely Not Poison" jar. It smells like poison. Definitely.'); },
        onTalk(eng) { eng.showMessage('"Any of you spices know how to fix a shattered Crystal of Order?" The spices remain unhelpfully aromatic.'); }
      }
    ],

    npcs: [
      {
        name: 'Chef Pierre', x: 80, y: 130, w: 16, h: 30,
        draw(ctx, eng) { GFX.drawCook(ctx, 80, 130, eng.waterPhase); },
        onLook(eng) { eng.showMessage('Chef Pierre, the royal cook. He\'s been with the castle for 30 years and takes his soup VERY seriously.'); },
        onTalk(eng) {
          if (!eng.getFlag('talked_chef')) {
            eng.setFlag('talked_chef');
            eng.showDialog('Chef Pierre',
              '"Sacré bleu! Ze soup, she is now cooking herself backwards! Ze bread rises DOWN! ' +
              'Take what you need from ze kitchen, Your Majesty, but please - fix zis chaos before my soufflé collapses... again!"',
              [
                { text: '"Your soup smells wonderful, Pierre."', action(e) {
                  e.showDialog('Chef Pierre', '"Merci! It iz ze only thing still working correctly. Even ze magical chaos knows not to mess with Chef Pierre\'s soup."');
                }},
                { text: '"I\'ll fix everything, don\'t worry!"', action(e) {
                  e.showDialog('Chef Pierre', '"Bonne chance, Your Majesty! Take ze bread and anything else you need. Just... not ze soup."');
                }}
              ]);
          } else {
            eng.showDialog('Chef Pierre', '"Hurry, Your Majesty! My croissants are now shaped like question marks!"');
          }
        }
      }
    ]
  };

  // ── 4. THE DOCKS ──
  const docks = {
    id: 'docks',
    name: 'The Royal Docks',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Sky
      GFX.drawSky(ctx, w, 70, '#4488CC', '#99CCEE');
      GFX.drawCloud(ctx, 50, 15, 6);
      GFX.drawCloud(ctx, 220, 8, 4);
      // Sea
      GFX.drawWater(ctx, 0, 70, w, 50, eng.waterPhase);
      // Seagulls
      GFX.drawSeagull(ctx, 90 + Math.sin(eng.waterPhase * 0.7) * 20, 25 + Math.sin(eng.waterPhase) * 5, eng.waterPhase);
      GFX.drawSeagull(ctx, 250 + Math.sin(eng.waterPhase * 0.5) * 15, 35 + Math.cos(eng.waterPhase) * 3, eng.waterPhase + 1);
      // Distant island (The Enchanted Isle!)
      GFX.drawMountain(ctx, 220, 55, 60, 20, '#446644', C.WHITE);
      // Dock platforms
      GFX.rect(ctx, 0, 118, w, 6, C.DKBROWN);
      GFX.rect(ctx, 0, 118, w, 3, C.BROWN);
      GFX.drawDirt(ctx, 0, 124, w, h - 124);
      GFX.drawPerspectiveGroundOverlay(ctx, 0, 118, w, h - 118);
      // Dock posts
      for (let px = 20; px < w; px += 40) {
        GFX.rect(ctx, px, 108, 4, 16, C.DKBROWN);
      }
      // Rope on post
      if (!eng.getFlag('took_rope')) {
        GFX.rect(ctx, 58, 110, 8, 3, C.TAN);
        GFX.rect(ctx, 56, 112, 12, 2, C.TAN);
      }
      // Barnaby's boat
      const boatFixed = eng.getFlag('boat_fixed');
      GFX.drawBoat(ctx, 130, 95, true, boatFixed);
      // Other boats (smaller, in background)
      GFX.rect(ctx, 40, 85, 25, 8, C.BROWN);
      GFX.rect(ctx, 44, 72, 2, 13, C.DKBROWN);
      GFX.rect(ctx, 260, 88, 20, 6, C.DKBROWN);
      // Path back
      GFX.drawDirt(ctx, 140, 124, 40, h - 124);
    },

    walkable: [
      { x: 20, y: 124, w: 280, h: 42 }
    ],

    exits: [
      { x: 140, y: 155, w: 40, h: 15, target: 'courtyard', entryX: 160, entryY: 145, walkX: 160, walkY: 158 }
    ],

    hotspots: [
      {
        name: 'Barnaby\'s boat', x: 125, y: 85, w: 50, h: 25,
        onLook(eng) {
          if (eng.getFlag('boat_fixed')) {
            eng.showMessage('Barnaby\'s boat. You patched the hole with tar - it\'s seaworthy now!');
          } else {
            eng.showMessage('A small sailing boat with a conspicuous hole in its hull. Water dribbles out pathetically.');
          }
        },
        onUseItem(eng, itemId) {
          if (itemId === 'tar' && !eng.getFlag('boat_fixed')) {
            eng.setFlag('boat_fixed');
            eng.removeItem('tar');
            eng.addItem('bucket', 'Empty Bucket', '🪣', 'An empty bucket. Could hold liquids.');
            eng.addScore(10, 'Fixed the boat');
            eng.showMessage('You slather tar over the hole in the boat. It\'s not pretty, but it\'ll float! You keep the empty bucket.');
            return true;
          }
          return false;
        },
        onUse(eng) {
          if (eng.getFlag('boat_fixed')) {
            if (!eng.getFlag('talked_barnaby_sail')) {
              eng.showMessage('Talk to Barnaby first - he\'ll need to sail you to the island.');
            } else {
              eng.showMessage('Talk to Barnaby to set sail!');
            }
          } else {
            eng.showMessage('The boat has a hole in it. You need something to patch it with.');
          }
        }
      },
      {
        name: 'rope', x: 54, y: 108, w: 14, h: 8,
        onLook(eng) {
          if (eng.getFlag('took_rope')) { eng.showMessage('The rope is gone.'); }
          else { eng.showMessage('A sturdy coil of rope tied to a dock post.'); }
        },
        onTake(eng) {
          if (!eng.getFlag('took_rope')) {
            eng.setFlag('took_rope');
            eng.addItem('rope', 'Rope', '🪢', 'A length of sturdy rope. Always handy in an adventure.');
            eng.addScore(5, 'Got rope');
          } else { eng.showMessage('You already have the rope.'); }
        }
      },
      {
        name: 'the Enchanted Isle', x: 220, y: 50, w: 60, h: 25,
        onLook(eng) { eng.showMessage('A mysterious island on the horizon. It wasn\'t there last week. It\'s surrounded by a faint purple glow.'); },
        onTalk(eng) { eng.showMessage('You shout toward the island: "I\'M COMING FOR YOU!" A seagull squawks back. Close enough.'); },
        onUse(eng) { eng.showMessage('The island is too far away to interact with from here. You\'ll need a boat.'); }
      },
      {
        name: 'other boats', x: 35, y: 78, w: 35, h: 18,
        onLook(eng) { eng.showMessage('Some fishing boats. They\'re all chained up. Apparently nobody wants to sail toward the mysteriously glowing island. Go figure.'); },
        onUse(eng) { eng.showMessage('These boats are locked up tight. You\'ll need to use Barnaby\'s boat.'); },
        onTake(eng) { eng.showMessage('You\'re a king, not a boat thief. Although technically, as king, it\'s "commandeering." Still, Barnaby\'s boat is the way to go.'); },
        onTalk(eng) { eng.showMessage('You address the boats: "Any volunteers?" They bob silently. Typical boats. No initiative.'); }
      }
    ],

    npcs: [
      {
        name: 'Old Barnaby', x: 230, y: 140, w: 16, h: 30,
        draw(ctx, eng) { GFX.drawBarnaby(ctx, 230, 140, eng.waterPhase); },
        onLook(eng) { eng.showMessage('Old Barnaby, the royal fisherman. His sea-weathered face has more wrinkles than a Shar-Pei in a sauna.'); },
        onTalk(eng) {
          if (!eng.getFlag('boat_fixed')) {
            eng.setFlag('talked_barnaby');
            eng.showDialog('Old Barnaby',
              '"Ahoy, Yer Majesty! Ye want to sail to that cursed island, do ye? ' +
              'I\'d take ye meself, but some barnacle-brained sea serpent bit a hole in me boat! ' +
              'If ye could patch it up with some tar, we\'d be shipshape!"');
          } else if (!eng.getFlag('talked_barnaby_sail')) {
            eng.setFlag('talked_barnaby_sail');
            eng.showDialog('Old Barnaby',
              '"Well blow me down, ye fixed \'er up! Ready to set sail to the Enchanted Isle, Yer Majesty?"',
              [
                { text: '"Set sail, Barnaby!"', action(eng) {
                  eng.addScore(10, 'Sailed to the island');
                  eng.startCutscene([
                    { message: 'Barnaby unfurls the sail and the boat heads toward the mysterious island...', duration: 3000 },
                    { message: 'The sea is rough, and the purple glow grows brighter as you approach...', duration: 3000 },
                    { message: 'After a harrowing voyage, you arrive at the Enchanted Isle!', duration: 2500 },
                    { action(eng) { eng.changeScene('beach', 160, 145); } }
                  ]);
                }},
                { text: '"Not just yet, let me prepare more."', action(eng) {
                  eng.showDialog('Old Barnaby', '"Take yer time, Yer Majesty. The island ain\'t goin\' nowhere... probably."');
                }}
              ]);
          } else {
            eng.showDialog('Old Barnaby',
              '"Ready to sail, Yer Majesty?"',
              [
                { text: '"Set sail!"', action(eng) {
                  eng.startCutscene([
                    { message: 'You set sail once more toward the Enchanted Isle...', duration: 2000 },
                    { action(eng) { eng.changeScene('beach', 160, 145); } }
                  ]);
                }},
                { text: '"Not yet."', action() {} }
              ]);
          }
        }
      }
    ]
  };

  // ── 5. BEACH ──
  const beach = {
    id: 'beach',
    name: 'Enchanted Beach',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Sky
      GFX.drawSky(ctx, w, 60, '#3377BB', '#88CCEE');
      GFX.drawCloud(ctx, 80, 12, 5);
      GFX.drawCloud(ctx, 240, 20, 3);
      // Ocean
      GFX.drawWater(ctx, 0, 60, w, 30, eng.waterPhase);
      // Sand
      GFX.rect(ctx, 0, 88, w, h - 88, C.SAND);
      for (let i = 0; i < 100; i++) {
        const sx = GFX.seededRandom(i*7) * w;
        const sy = 88 + GFX.seededRandom(i*13) * (h - 98);
        GFX.pixel(ctx, sx, sy, C.TAN);
      }
      GFX.drawPerspectiveGroundOverlay(ctx, 0, 88, w, h - 88);
      // Surf line
      const surf = Math.sin(eng.waterPhase * 2) * 3;
      GFX.rect(ctx, 0, 86 + surf, w, 4, C.WHITE);
      // Palm trees
      GFX.drawPalmTree(ctx, 50, 140, 45);
      GFX.drawPalmTree(ctx, 280, 125, 35);
      // Driftwood
      if (!eng.getFlag('took_stick')) {
        GFX.rect(ctx, 180, 120, 20, 3, C.LTBROWN);
        GFX.rect(ctx, 185, 118, 3, 7, C.LTBROWN);
      }
      // Seashells
      GFX.rect(ctx, 100, 130, 4, 3, C.PINK);
      GFX.rect(ctx, 220, 140, 3, 3, C.WHITE);
      GFX.rect(ctx, 150, 145, 4, 2, C.PINK);
      // Footprints leading north
      for (let fy = 135; fy > 95; fy -= 10) {
        GFX.rect(ctx, 158, fy, 3, 2, C.TAN);
        GFX.rect(ctx, 162, fy - 5, 3, 2, C.TAN);
      }
      // Path north
      GFX.drawDirt(ctx, 150, 88, 20, 5);
      // Boat (Barnaby's, beached)
      GFX.rect(ctx, 15, 95, 25, 8, C.BROWN);
      GFX.rect(ctx, 25, 82, 2, 13, C.DKBROWN);
      // Seagull
      GFX.drawSeagull(ctx, 130 + Math.sin(eng.waterPhase) * 30, 30, eng.waterPhase);
    },

    walkable: [
      { x: 10, y: 95, w: 300, h: 70 }
    ],

    exits: [
      { x: 145, y: 88, w: 30, h: 10, target: 'forestPath', entryX: 160, entryY: 155, walkX: 160, walkY: 95 }
    ],

    hotspots: [
      {
        name: 'driftwood', x: 178, y: 116, w: 24, h: 8,
        onLook(eng) {
          if (eng.getFlag('took_stick')) eng.showMessage('Just sand where the driftwood was.');
          else eng.showMessage('A sturdy piece of driftwood. Could be useful as a walking stick... or poking stick.');
        },
        onTake(eng) {
          if (!eng.getFlag('took_stick')) {
            eng.setFlag('took_stick');
            eng.addItem('stick', 'Stick', '🪵', 'A sturdy piece of driftwood. Pointy on one end.');
            eng.addScore(5, 'Got stick');
          } else { eng.showMessage('You already have the stick.'); }
        }
      },
      {
        name: 'seashells', x: 98, y: 128, w: 8, h: 6,
        onLook(eng) { eng.showMessage('Pretty pink seashells. They whisper secrets of the deep... actually, no, that\'s just the ocean. You were hoping for game hints, weren\'t you?'); },
        onTake(eng) { eng.showMessage('You pick up a shell and hold it to your ear. It says "Buy more Sierra games." You put it back.'); },
        onUse(eng) { eng.showMessage('You arrange the shells into a little smiley face. The beach is now slightly more cheerful. The kingdom is still in chaos.'); },
        onTalk(eng) { eng.showMessage('You whisper to a shell: "How do I fix everything?" The shell whispers back: "...have you tried talking to the mushroom lady?" Even shells know more than you.'); }
      },
      {
        name: 'footprints', x: 156, y: 95, w: 12, h: 40,
        onLook(eng) { eng.showMessage('Strange footprints in the sand, leading north into the forest. They\'re large, clawed, and smell vaguely of mushrooms.'); },
        onTalk(eng) { eng.showMessage('You ask the footprints where they lead. They are footprints. They lead north. That\'s all they do.'); }
      },
      {
        name: 'ocean', x: 0, y: 60, w: 320, h: 28,
        onLook(eng) { eng.showMessage('The ocean stretches endlessly. You can see Daventry in the far distance. The water here has a faint purple shimmer.'); },
        onTalk(eng) { eng.showMessage('"Oh great ocean, grant me wisdom!" you proclaim. A wave splashes your boots. The ocean has spoken. You are no wiser.'); },
        onUse(eng) { eng.showMessage('You splash some water on your face. It\'s refreshing, if slightly purple. You glow faintly for a moment. Neat.'); },
        onWalk(eng) { eng.die('You wade into the enchanted ocean. A magical current pulls you under. Swimming was never covered in King School. Game Over.'); }
      },
      {
        name: 'Barnaby\'s boat', x: 10, y: 82, w: 30, h: 22,
        onLook(eng) { eng.showMessage('Barnaby\'s boat, beached on the shore. Old Barnaby is nearby, whittling a tiny anchor from driftwood. He can sail you back to Daventry.'); },
        onTalk(eng) {
          eng.showDialog('Old Barnaby',
            '"Want to head back to Daventry, Yer Majesty? Or still explorin\' the island?"',
            [
              { text: '"Take me back to the docks."', action(eng) {
                eng.startCutscene([
                  { message: 'You sail back across the enchanted waters to Daventry...', duration: 2000 },
                  { action(eng) { eng.changeScene('docks', 160, 135); } }
                ]);
              }},
              { text: '"Not yet, I\'m still exploring."', action() {} }
            ]);
        },
        onUse(eng) {
          eng.showDialog('Old Barnaby',
            '"Ready to head back to Daventry, Yer Majesty?"',
            [
              { text: '"Yes, set sail!"', action(eng) {
                eng.startCutscene([
                  { message: 'You sail back across the enchanted waters to Daventry...', duration: 2000 },
                  { action(eng) { eng.changeScene('docks', 160, 135); } }
                ]);
              }},
              { text: '"Not yet."', action() {} }
            ]);
        }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('beach_intro')) {
        eng.setFlag('beach_intro');
        eng.showMessage('You\'ve arrived at the Enchanted Isle! A dense forest lies to the north. Strange magical energy fills the air.');
      }
    }
  };

  // ── 6. FOREST PATH ──
  const forestPath = {
    id: 'forestPath',
    name: 'Whispering Woods',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Dark sky through canopy
      GFX.drawSky(ctx, w, 40, '#224422', '#446644');
      // Dense trees (background)
      for (let tx = -10; tx < w + 10; tx += 25) {
        GFX.drawPineTree(ctx, tx + GFX.seededRandom(tx)*10, 90, 50 + GFX.seededRandom(tx+1)*20);
      }
      // Ground
      GFX.drawGrass(ctx, 0, 90, w, h - 90, C.DKGREEN, '#2A5A2A');
      GFX.drawPerspectiveGroundOverlay(ctx, 0, 90, w, h - 90);
      // Dirt path
      GFX.drawDirt(ctx, 130, 90, 60, h - 90);
      // Foreground trees
      GFX.drawDeciduousTree(ctx, 30, 140, 50);
      GFX.drawDeciduousTree(ctx, 290, 135, 45);
      GFX.drawPineTree(ctx, 95, 150, 40);
      // Mushrooms
      GFX.drawMushroom(ctx, 70, 130, 5, C.RED);
      GFX.drawMushroom(ctx, 85, 135, 3, C.ORANGE);
      if (!eng.getFlag('took_mushroom')) {
        GFX.drawMushroom(ctx, 250, 125, 6, '#8855DD'); // Purple mushroom (useful!)
      }
      GFX.drawMushroom(ctx, 260, 130, 4, C.RED);
      // Bird
      GFX.pixel(ctx, 200, 45, C.BROWN);
      GFX.pixel(ctx, 201, 44, C.BROWN);
      GFX.pixel(ctx, 199, 44, C.BROWN);
      // Strange stone
      GFX.rect(ctx, 190, 115, 12, 10, C.STONE);
      GFX.rect(ctx, 192, 113, 8, 3, C.STONE);
      // Rune on stone
      GFX.pixel(ctx, 195, 118, C.GOLD);
      GFX.pixel(ctx, 194, 119, C.GOLD);
      GFX.pixel(ctx, 196, 119, C.GOLD);
      GFX.pixel(ctx, 195, 120, C.GOLD);
      // Magical sparkles
      GFX.drawSparkle(ctx, 110, 100, eng.sparklePhase, '#55FF55');
      GFX.drawSparkle(ctx, 230, 105, eng.sparklePhase + 2, '#55FF55');
      GFX.drawSparkle(ctx, 170, 95, eng.sparklePhase + 4, '#88FFAA');
      // Path signs
      // South to beach
      GFX.drawDirt(ctx, 140, h - 5, 40, 5);
      // East to bridge
      GFX.drawDirt(ctx, w - 10, 120, 10, 30);
      // West to mushroom glade
      GFX.drawDirt(ctx, 0, 115, 10, 30);
    },

    walkable: [
      { x: 10, y: 100, w: 300, h: 65 }
    ],

    exits: [
      { x: 140, y: 158, w: 40, h: 12, target: 'beach', entryX: 160, entryY: 100, walkX: 160, walkY: 158 },
      { x: 300, y: 115, w: 20, h: 35, target: 'trollBridge', entryX: 30, entryY: 130, walkX: 305, walkY: 130 },
      { x: 0, y: 110, w: 15, h: 35, target: 'mushroomGlade', entryX: 290, entryY: 130, walkX: 10, walkY: 125 }
    ],

    hotspots: [
      {
        name: 'purple mushroom', x: 246, y: 118, w: 12, h: 12,
        onLook(eng) {
          if (eng.getFlag('took_mushroom')) eng.showMessage('The purple mushroom is gone.');
          else eng.showMessage('A peculiar purple mushroom with golden speckles. It emanates a faint warmth and smells like cinnamon.');
        },
        onTake(eng) {
          if (!eng.getFlag('took_mushroom')) {
            eng.setFlag('took_mushroom');
            eng.addItem('mushroom', 'Purple Mushroom', '🍄', 'A magical purple mushroom. Smells like cinnamon and tingles when you hold it.');
            eng.addScore(5, 'Got mushroom');
          } else { eng.showMessage('You already picked that mushroom.'); }
        }
      },
      {
        name: 'red mushrooms', x: 65, y: 124, w: 30, h: 12,
        onLook(eng) { eng.showMessage('Common red-capped mushrooms. Pretty, but probably poisonous. The classic "eat me and die" variety.'); },
        onTake(eng) { eng.showMessage('You reach for a red mushroom, but a tiny voice squeaks: "Touch me and you\'ll regret it, pal!" You reconsider.'); },
        onTalk(eng) { eng.showMessage('The red mushroom says: "I\'m toxic and proud. Now buzz off before I release my spores." Mushrooms are rude on this island.'); },
        onUse(eng) { eng.die('You eat the red mushroom. Bad idea. Really bad idea. The tiny mushroom voice was RIGHT. Game Over.'); }
      },
      {
        name: 'rune stone', x: 188, y: 112, w: 16, h: 14,
        onLook(eng) { eng.showMessage('An ancient stone covered in glowing runes. It reads: "BEWARE THE TROLL. SHE BITES." Helpful, if alarming.'); },
        onTalk(eng) { eng.showMessage('You speak to the stone. It hums briefly and then displays new text: "WRONG AUDIENCE. TRY AGAIN." Stones these days.'); },
        onUse(eng) { eng.showMessage('You rub the rune stone hoping for magic. The runes flicker and display: "THIS IS NOT A WISHING STONE. TRY THE FAIRY RING." At least it\'s helpful-ish.'); },
        onTake(eng) { eng.showMessage('You try to lift the rune stone. It\'s absurdly heavy. The runes flash: "NICE TRY, TINY KING." Now it\'s just mocking you.'); }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('forest_intro')) {
        eng.setFlag('forest_intro');
        eng.showMessage('The Whispering Woods. The trees literally whisper here, mostly gossip about squirrels. Paths lead east, west, and south.');
      }
    }
  };

  // ── 7. TROLL BRIDGE ──
  const trollBridge = {
    id: 'trollBridge',
    name: 'Troll Bridge',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Sky
      GFX.drawSky(ctx, w, 60, '#556677', '#889999');
      // Chasm
      GFX.rect(ctx, 80, 100, 160, h - 100, C.BLACK);
      GFX.rect(ctx, 82, 102, 156, h - 104, '#111122');
      // Far side
      GFX.drawGrass(ctx, 240, 100, 80, h - 100, C.DKGREEN, '#2A5A2A');
      GFX.drawPineTree(ctx, 260, 140, 40);
      GFX.drawPineTree(ctx, 290, 145, 35);
      // Near side
      GFX.drawGrass(ctx, 0, 100, 80, h - 100, C.DKGREEN, '#2A5A2A');
      GFX.drawPineTree(ctx, 20, 135, 35);
      // Bridge
      GFX.drawBridge(ctx, 80, 115, 160);
      // Dirt paths
      GFX.drawDirt(ctx, 0, 120, 80, 20);
      GFX.drawDirt(ctx, 240, 120, 80, 20);
      // Mist from chasm
      const mist = Math.sin(eng.waterPhase) * 0.3 + 0.2;
      ctx.fillStyle = `rgba(200,200,220,${mist})`;
      ctx.fillRect(90, 140, 140, 20);
    },

    walkable: [
      { x: 10, y: 118, w: 70, h: 40 },
      { x: 80, y: 118, w: 160, h: 20 },  // bridge
      { x: 240, y: 118, w: 70, h: 40 }
    ],

    exits: [
      { x: 0, y: 115, w: 12, h: 40, target: 'forestPath', entryX: 300, entryY: 130, walkX: 10, walkY: 130 },
      { x: 305, y: 115, w: 15, h: 40, target: 'towerExterior', entryX: 30, entryY: 130, walkX: 305, walkY: 130 }
    ],

    hotspots: [
      {
        name: 'the chasm', x: 80, y: 135, w: 160, h: 35,
        onLook(eng) { eng.showMessage('A bottomless chasm. Well, it probably has a bottom somewhere, but you\'d rather not find out personally.'); },
        onTalk(eng) { eng.showMessage('You shout into the chasm: "HELLO!" After a long pause, an echo returns: "...YOU\'RE WASTING TIME, GRAHAM!" Even the void judges you.'); },
        onUse(eng) { eng.showMessage('You drop a pebble into the chasm. You never hear it land. That\'s... concerning.'); },
        onWalk(eng) { eng.die('You step off the bridge and plummet into the chasm. On the bright side, you discover it is NOT actually bottomless. The bottom is very hard. Game Over.'); }
      },
      {
        name: 'bridge railing', x: 80, y: 106, w: 160, h: 10,
        onLook(eng) { eng.showMessage('Wooden railings. They look somewhat sturdy. "Somewhat" being the operative word.'); },
        onUse(eng) { eng.showMessage('You lean on the railing. It creaks ominously. You stop leaning on the railing. Good decision.'); },
        onTalk(eng) { eng.showMessage('"Please hold," you say to the railing. It does. For now.'); }
      }
    ],

    npcs: [
      {
        name: 'Greta the Troll', x: 160, y: 132, w: 18, h: 32,
        get hidden() { return Engine.getFlag('troll_passed'); },
        draw(ctx, eng) {
          if (!eng.getFlag('troll_passed')) {
            GFX.drawTroll(ctx, 160, 132, eng.waterPhase);
          }
        },
        onLook(eng) { eng.showMessage('Greta the Troll. She\'s big, green, warty, and blocking the bridge with the confidence of someone who knows they\'re the biggest thing around.'); },
        onTalk(eng) {
          if (eng.getFlag('troll_passed')) return;
          eng.showDialog('Greta the Troll',
            '"HALT! Nobody crosses Greta\'s bridge without paying the toll! ' +
            'The toll is... hmm..." *stomach growls loudly* "...actually, I\'m STARVING. ' +
            'Bring me something tasty and I\'ll let you pass!"',
            [
              { text: '"What kind of food do you like?"', action(eng) {
                eng.showDialog('Greta the Troll',
                  '"Anything! I haven\'t eaten since last Tuesday. A troll-sized hunger requires troll-sized portions... ' +
                  'or at least some nice fresh bread. Hint hint."');
              }},
              { text: '"How about I just walk around you?"', action(eng) {
                eng.showDialog('Greta the Troll',
                  '"HA! Nobody \'walks around\' Greta! There IS no around! There\'s only THROUGH, and through goes through ME!" ' +
                  '*flexes impressively*');
              }}
            ]);
        },
        onUseItem(eng, itemId) {
          if (itemId === 'bread') {
            eng.removeItem('bread');
            eng.setFlag('troll_passed');
            eng.addScore(10, 'Crossed troll bridge');
            eng.showDialog('Greta the Troll',
              '"BREAD! FRESH BREAD! Oh, you beautiful little human king! ' +
              '*gobbles entire loaf in one bite* Mmmmm! You may pass! ' +
              'In fact, take this as thanks..." *Greta steps aside*',
              null, () => {
                eng.showMessage('Greta lumbers off the bridge, happily munching. The way east is clear!');
              });
            return true;
          }
          if (itemId === 'stick') {
            eng.showDialog('Greta the Troll',
              '"A STICK?! Are you trying to fight me with a STICK? That\'s either very brave or very stupid. Probably both."');
            return true;
          }
          return false;
        }
      }
    ],

    onEnter(eng) {
      if (!eng.getFlag('bridge_intro') && !eng.getFlag('troll_passed')) {
        eng.setFlag('bridge_intro');
        eng.showMessage('A rickety bridge spans a deep chasm. A large, hungry-looking troll blocks the way.');
      }
    }
  };

  // ── 8. MUSHROOM GLADE ──
  const mushroomGlade = {
    id: 'mushroomGlade',
    name: 'Mushroom Glade',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Magical sky
      GFX.drawSky(ctx, w, 50, '#221144', '#554488');
      // Stars (magical, daytime stars)
      for (let i = 0; i < 20; i++) {
        GFX.drawSparkle(ctx, GFX.seededRandom(i*5)*w, GFX.seededRandom(i*11)*50,
          eng.sparklePhase + i, '#DD88FF');
      }
      // Ground - magical grass
      GFX.drawGrass(ctx, 0, 80, w, h - 80, '#336644', '#448855');
      GFX.drawPerspectiveGroundOverlay(ctx, 0, 80, w, h - 80);
      // Giant mushrooms!
      GFX.drawMushroom(ctx, 60, 110, 25, '#CC44AA');
      GFX.drawMushroom(ctx, 250, 105, 20, '#AA33CC');
      GFX.drawMushroom(ctx, 150, 95, 15, '#DD55BB');
      // Small mushrooms
      for (let m = 0; m < 8; m++) {
        const mx = 20 + GFX.seededRandom(m*7) * (w-40);
        const my = 110 + GFX.seededRandom(m*13) * 40;
        GFX.drawMushroom(ctx, mx, my, 3 + GFX.seededRandom(m)*3,
          ['#CC44AA','#AA33CC','#DD55BB','#9922AA'][m%4]);
      }
      // Fairy ring (circle of tiny mushrooms)
      const fairyBlessed = eng.getFlag('fairy_ring_visited');
      if (fairyBlessed) {
        // Soft golden glow under the ring after blessing
        GFX.withAlpha(ctx, 0.15 + Math.sin(eng.sparklePhase * 0.8) * 0.08, () => {
          ctx.fillStyle = '#FFEEAA';
          ctx.beginPath();
          ctx.ellipse(200, 137, 30, 14, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      for (let a = 0; a < 8; a++) {
        const angle = (a / 8) * Math.PI * 2;
        const fx = 200 + Math.cos(angle) * 25;
        const fy = 135 + Math.sin(angle) * 12;
        GFX.drawMushroom(ctx, fx, fy, 3, fairyBlessed ? '#FFFFCC' : C.WHITE);
      }
      // Sparkly fairy ring center
      GFX.drawSparkle(ctx, 200, 132, eng.sparklePhase, fairyBlessed ? '#FFE488' : '#FFDDFF');
      GFX.drawSparkle(ctx, 195, 128, eng.sparklePhase + 1, fairyBlessed ? '#FFD455' : '#FFBBFF');
      GFX.drawSparkle(ctx, 205, 130, eng.sparklePhase + 2, fairyBlessed ? '#FFE488' : '#FFDDFF');
      // Fairy protection indicator — tiny fairy wings shimmer
      if (eng.getFlag('fairy_blessing')) {
        const fBob = Math.sin(eng.sparklePhase * 1.5) * 2;
        // Tiny fairy body
        GFX.rect(ctx, 200, 124 + fBob, 1, 3, '#FFE4B5');
        // Wings
        GFX.withAlpha(ctx, 0.5 + Math.sin(eng.sparklePhase * 2) * 0.3, () => {
          GFX.rect(ctx, 197, 123 + fBob, 3, 2, '#FFFFEE');
          GFX.rect(ctx, 201, 123 + fBob, 3, 2, '#FFFFEE');
        });
        // Fairy glow
        GFX.drawSparkle(ctx, 200, 123 + fBob, eng.sparklePhase * 2, '#FFFF88');
      }
      // Sparkling pond
      GFX.rect(ctx, 30, 140, 35, 18, '#6644AA');
      GFX.rect(ctx, 32, 142, 31, 14, '#7755BB');
      // Pond sparkles
      GFX.drawSparkle(ctx, 40, 148, eng.sparklePhase, '#FFFFFF');
      GFX.drawSparkle(ctx, 52, 145, eng.sparklePhase + 1.5, '#DDDDFF');
      // Path east
      GFX.drawDirt(ctx, w - 10, 118, 10, 25);
    },

    walkable: [
      { x: 10, y: 100, w: 300, h: 65 }
    ],

    exits: [
      { x: 305, y: 115, w: 15, h: 30, target: 'forestPath', entryX: 20, entryY: 125, walkX: 305, walkY: 130 }
    ],

    hotspots: [
      {
        name: 'sparkling pond', x: 24, y: 130, w: 50, h: 35,
        onLook(eng) { eng.showMessage('A small pond filled with glowing purple water. It sparkles with magical energy. The water seems to pulse with life.'); },
        onTake(eng) {
          if (!eng.getFlag('got_magic_water')) {
            if (eng.hasItem('bucket')) {
              eng.removeItem('bucket');
              eng.setFlag('got_magic_water');
              eng.addItem('magic_water', 'Magic Water', '💧', 'Glowing purple water from the enchanted pond. It pulses with magical energy.');
              eng.showMessage('You dip the bucket into the glowing pond and fill it with shimmering purple water!');
              eng.addScore(10, 'Got magic water');
            } else {
              eng.showMessage('You try to scoop the magic water with your hands, but it slips through your fingers. You need some kind of container.');
            }
          } else {
            eng.showMessage('The pond\'s magical water has dimmed after you collected some.');
          }
        },
        onUse(eng) {
          if (eng.getFlag('got_magic_water')) {
            eng.showMessage('The pond\'s magical water has dimmed after you collected some.');
          } else if (eng.hasItem('bucket')) {
            eng.showMessage('Try selecting the bucket from your inventory first, then click on the pond.');
          } else {
            eng.showMessage('You need some kind of container to collect the magic water.');
          }
        },
        onUseItem(eng, itemId) {
          if (itemId === 'bucket') {
            if (!eng.getFlag('got_magic_water')) {
              eng.removeItem('bucket');
              eng.setFlag('got_magic_water');
              eng.addItem('magic_water', 'Magic Water', '💧', 'Glowing purple water from the enchanted pond. It pulses with magical energy.');
              eng.showMessage('You dip the bucket into the glowing pond and fill it with shimmering purple water!');
              eng.addScore(10, 'Got magic water');
            } else {
              eng.showMessage('You already collected the magic water.');
            }
            return true;
          }
          eng.showMessage('That won\'t work for collecting the magic water. You need an empty container like a bucket.');
          return true;
        }
      },
      {
        name: 'fairy ring', x: 172, y: 120, w: 55, h: 30,
        onLook(eng) {
          if (eng.getFlag('fairy_blessing')) {
            eng.showMessage('The fairy ring glows softly. You can still feel the warmth of the fairy\'s blessing protecting you.');
          } else if (eng.getFlag('fairy_ring_visited')) {
            eng.showMessage('The fairy ring\'s mushrooms have dulled. The fairy has departed, but her magic lingers faintly.');
          } else {
            eng.showMessage('A fairy ring made of tiny white mushrooms. They circle a spot of shimmering, inviting air. You feel drawn to step inside...');
          }
        },
        walkTarget: { x: 200, y: 135 },
        onArrive(eng) {
          if (!eng.getFlag('fairy_ring_visited')) {
            eng.setFlag('fairy_ring_visited');
            eng.setFlag('fairy_blessing');
            eng.addScore(10, 'Received fairy blessing');
            eng.showMessage('You step into the fairy ring and the world shimmers! A tiny fairy appears in a burst of light. "Brave traveler! I grant thee my protection. One time shall I save thee from doom!" She vanishes, but warmth lingers around you.');
            eng.playNote(523, 0.15);
            eng.playNote(659, 0.15, 0.15);
            eng.playNote(784, 0.2, 0.3);
          }
        }
      },
      {
        name: 'giant mushrooms', x: 45, y: 80, w: 30, h: 35,
        onLook(eng) { eng.showMessage('Enormous mushrooms tower over you. Their caps pulse with bioluminescent light. Somebody\'s been using magical fertilizer.'); },
        onTalk(eng) { eng.showMessage('You address the giant mushroom. It doesn\'t respond. It\'s just a regular giant magical mushroom. Not the talking kind.'); },
        onUse(eng) { eng.showMessage('You pat the giant mushroom. It vibrates gently, like a very large, very damp purring cat. Oddly soothing.'); },
        onTake(eng) { eng.showMessage('You try to pick one. It\'s taller than you and firmly rooted. You\'d need a team of lumberjacks. Lumberjacks who specialize in fungi.'); }
      }
    ],

    npcs: [
      {
        name: 'Madame Mushroom', x: 160, y: 118, w: 20, h: 28,
        draw(ctx, eng) { GFX.drawMadameMushroom(ctx, 160, 118, eng.waterPhase); },
        onLook(eng) { eng.showMessage('Madame Mushroom - a sentient mushroom with a purple cap and tiny face. She radiates an aura of mystical wisdom... and slight dampness.'); },
        onTalk(eng) {
          if (!eng.getFlag('talked_mushroom')) {
            eng.setFlag('talked_mushroom');
            eng.addScore(5, 'Talked to Madame Mushroom');
            eng.showDialog('Madame Mushroom',
              '"Ahhhh, King Graham of Daventry! I\'ve been expecting you. The spores told me you\'d come. ' +
              'You seek the source of the magical chaos, yes?"',
              [
                { text: '"Yes! Where is it?"', action(eng) {
                  eng.showDialog('Madame Mushroom',
                    '"The wizard Fumblemore lives in the tower east of the bridge. He accidentally shattered the Crystal of Order! ' +
                    'Without it, all magic in the region has gone... creative. Three things you must know: ' +
                    'One - the troll bridge guardian is always hungry. Two - Sir Cumference guards the tower and has terrible stomach pains. ' +
                    'Three - the Crystal\'s shards lie in the cavern beneath the tower."');
                }},
                { text: '"Spores told you? Really?"', action(eng) {
                  eng.showDialog('Madame Mushroom',
                    '"Don\'t judge our communication methods, Your Majesty. At least spores don\'t have read receipts. ' +
                    'Now then - seek the wizard Fumblemore in the eastern tower. He broke the Crystal of Order and needs help fixing it. ' +
                    'The troll guarding the bridge likes bread, and Sir Cumference at the tower has been complaining of stomach pains."');
                }}
              ]);
          } else {
            eng.showDialog('Madame Mushroom',
              '"Remember: feed the troll, heal the knight, find the wizard, restore the crystal. ' +
              'Also, the magic water in my pond has restorative properties. Take some if you haven\'t! ' +
              'You\'ll need a container though - your royal hands are lovely but not watertight."');
          }
        }
      }
    ],

    onEnter(eng) {
      if (!eng.getFlag('glade_intro')) {
        eng.setFlag('glade_intro');
        eng.showMessage('You enter a magical glade filled with enormous glowing mushrooms. The air tingles with enchantment.');
      }
    }
  };

  // ── 9. TOWER EXTERIOR ──
  const towerExterior = {
    id: 'towerExterior',
    name: 'Fumblemore\'s Tower',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Sky
      GFX.drawSky(ctx, w, 40, '#334455', '#667788');
      // Stars
      for (let i = 0; i < 15; i++) {
        GFX.drawSparkle(ctx, GFX.seededRandom(i*3)*w, GFX.seededRandom(i*9)*40,
          eng.sparklePhase + i, '#AAAAFF');
      }
      // Tower
      GFX.rect(ctx, 140, 5, 40, 130, C.DKSTONE);
      GFX.rect(ctx, 142, 7, 36, 126, C.STONE);
      // Tower top (cone)
      ctx.fillStyle = C.DKPURPLE;
      ctx.beginPath();
      ctx.moveTo(135, 10);
      ctx.lineTo(160, -20);
      ctx.lineTo(185, 10);
      ctx.closePath();
      ctx.fill();
      // Flag
      GFX.rect(ctx, 159, -20, 2, 8, C.BROWN);
      GFX.rect(ctx, 161, -20, 8, 5, C.PURPLE);
      GFX.pixel(ctx, 164, -18, C.YELLOW); // star on flag
      // Windows
      GFX.drawWindow(ctx, 150, 20, 12, 16);
      GFX.drawWindow(ctx, 150, 50, 12, 16);
      GFX.drawWindow(ctx, 150, 80, 12, 16);
      // Door at base
      GFX.drawDoor(ctx, 150, 105, 20, 30);
      // Ground
      GFX.drawGrass(ctx, 0, 100, w, h - 100, C.DKGREEN, '#335533');
      GFX.drawPerspectiveGroundOverlay(ctx, 0, 100, w, h - 100);
      GFX.drawDirt(ctx, 130, 100, 60, h - 100);
      // Garden gnome
      GFX.rect(ctx, 105, 123, 6, 10, C.RED); // hat
      GFX.rect(ctx, 106, 130, 4, 6, C.BLUE); // body
      GFX.rect(ctx, 107, 128, 2, 2, C.SKIN); // face
      GFX.pixel(ctx, 107, 129, C.BLACK);
      // Crooked sign
      ctx.save();
      ctx.translate(220, 120);
      ctx.rotate(0.15);
      GFX.rect(ctx, 0, 0, 2, 20, C.BROWN);
      GFX.rect(ctx, -15, 0, 32, 12, C.LTBROWN);
      ctx.restore();
      // Path west
      GFX.drawDirt(ctx, 0, 120, 130, 25);
      // Path also east (to tower door)
      GFX.drawPineTree(ctx, 40, 145, 35);
      GFX.drawPineTree(ctx, 270, 140, 30);
      GFX.drawDeciduousTree(ctx, 300, 150, 40);
      // Magical aura around tower
      for (let i = 0; i < 8; i++) {
        const angle = eng.waterPhase + i * 0.8;
        const sx = 160 + Math.cos(angle) * 30;
        const sy = 60 + Math.sin(angle) * 40;
        GFX.drawSparkle(ctx, sx, sy, eng.sparklePhase + i, '#8866FF');
      }
    },

    walkable: [
      { x: 10, y: 110, w: 300, h: 55 }
    ],

    exits: [
      { x: 0, y: 115, w: 12, h: 30, target: 'trollBridge', entryX: 290, entryY: 130, walkX: 10, walkY: 130 }
    ],

    hotspots: [
      {
        name: 'tower door', x: 148, y: 105, w: 24, h: 30,
        onLook(eng) { eng.showMessage('A heavy wooden door at the base of Fumblemore\'s tower. It has a sign that reads: "WIZRD AT WORK - DO NOT DISTERB" ...spelling was never Fumblemore\'s strong suit.'); },
        onUse(eng) {
          if (eng.getFlag('knight_passed')) {
            eng.changeScene('towerInterior', 160, 150);
          } else {
            eng.showMessage('Sir Cumference blocks your way to the door!');
          }
        },
        walkTarget: { x: 160, y: 133 },
        onArrive(eng) {
          if (eng.getFlag('knight_passed')) {
            eng.changeScene('towerInterior', 160, 150);
          }
        }
      },
      {
        name: 'garden gnome', x: 103, y: 121, w: 10, h: 15,
        onLook(eng) { eng.showMessage('A ceramic garden gnome. It has a cheeky grin and a tiny sign that reads "I\'m not a real gnome, obviously. Or am I?" Unsettling.'); },
        onTalk(eng) { eng.showMessage('The gnome winks at you. Wait, did it? No, it\'s ceramic. ...Right?'); },
        onTake(eng) { eng.showMessage('The gnome is firmly rooted in place. Also, it might be watching you. Best leave it alone.'); },
        onUse(eng) { eng.showMessage('You spin the gnome around. When you look back, it\'s facing you again. You did NOT spin it back. You walk away quickly.'); }
      },
      {
        name: 'crooked sign', x: 205, y: 118, w: 35, h: 15,
        onLook(eng) { eng.showMessage('A crooked wooden sign reads: "Fumblemore\'s Tower of Magnificent Magics and Minor Disasters. Open Thursdays." Today is not Thursday.'); },
        onTalk(eng) { eng.showMessage('You read the sign aloud. Nothing happens. Signs work best when you just look at them.'); },
        onUse(eng) { eng.showMessage('You try to straighten the sign. It immediately tilts back to its crooked angle. It appears to WANT to be crooked. Magic.'); },
        onTake(eng) { eng.showMessage('You tug at the sign. New text appears: "HANDS OFF, ROYAL BOY." Apparently, it\'s an enchanted sign.'); }
      }
    ],

    npcs: [
      {
        name: 'Sir Cumference', x: 160, y: 140, w: 24, h: 38,
        get hidden() { return Engine.getFlag('knight_passed'); },
        draw(ctx, eng) {
          if (!eng.getFlag('knight_passed')) {
            GFX.drawSirCumference(ctx, 155, 143, eng.waterPhase);
          }
        },
        onLook(eng) { eng.showMessage('Sir Cumference, a knight of perfectly round proportions. He guards the tower with the dedication of someone who has nowhere better to be.'); },
        onTalk(eng) {
          if (eng.getFlag('knight_passed')) return;
          eng.showDialog('Sir Cumference',
            '"Halt! *urrp* I am Sir Cumference, *groan* guardian of this tower! ' +
            'None shall pass without— *stomach growl* —oh, my aching belly! ' +
            'I ate some bad mushrooms from the forest and I feel TERRIBLE!"',
            [
              { text: '"Can I help with your stomach?"', action(eng) {
                eng.showDialog('Sir Cumference',
                  '"Oh, would you? I\'ve heard that the purple mushrooms from these woods have healing properties. ' +
                  'If you could find one, I\'d be eternally grateful... and I\'d let you into the tower! ' +
                  'It\'s not like I can stop you anyway in this condition. *urrrp*"');
              }},
              { text: '"Why are you round, exactly?"', action(eng) {
                eng.showDialog('Sir Cumference',
                  '"It\'s a family name, not a SHAPE! ...although, yes, the armor doesn\'t help. ' +
                  'Look, can we focus on my stomach? I need a healing mushroom or I\'m going to— *hurk* —never mind."');
              }}
            ]);
        },
        onUseItem(eng, itemId) {
          if (itemId === 'mushroom') {
            eng.removeItem('mushroom');
            eng.setFlag('knight_passed');
            eng.addScore(10, 'Helped Sir Cumference');
            eng.showDialog('Sir Cumference',
              '"A PURPLE MUSHROOM! Oh, bless you, Your Majesty!" ' +
              '*devours mushroom* *loud stomach rumble* *huge sigh of relief* ' +
              '"Ahhh! Much better! The tower is yours to enter, sire! ' +
              'I\'ll just... go sit down somewhere for a bit." *waddles away*',
              null, () => {
                eng.showMessage('Sir Cumference waddles off to rest. The tower door is unguarded!');
              });
            return true;
          }
          if (itemId === 'bread') {
            eng.showDialog('Sir Cumference',
              '"Bread?! My stomach can barely handle AIR right now! I need a HEALING mushroom, not MORE food!"');
            return true;
          }
          return false;
        }
      }
    ],

    onEnter(eng) {
      if (!eng.getFlag('tower_intro')) {
        eng.setFlag('tower_intro');
        eng.showMessage('Before you stands Fumblemore\'s tower, a crooked spire crackling with wayward magic.');
      }
    }
  };

  // ── 10. TOWER INTERIOR ──
  const towerInterior = {
    id: 'towerInterior',
    name: 'Wizard\'s Study',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Walls
      GFX.drawStoneWall(ctx, 0, 0, w, 100);
      // Floor
      GFX.drawStoneFloor(ctx, 0, 100, w, h-100);
      // Perspective side walls & floor grid
      GFX.drawPerspectiveSideWalls(ctx, w, h, 100, C.DKSTONE);
      GFX.drawPerspectiveFloorGrid(ctx, w, h, 100);
      // Circular room feel
      GFX.withAlpha(ctx, 0.13, () => {
        ctx.fillStyle = '#4444CC';
        ctx.beginPath();
        ctx.arc(w/2, h/2, 80, 0, Math.PI*2);
        ctx.fill();
      });
      // Bookshelves
      GFX.drawBookshelf(ctx, 10, 20, 45, 55);
      GFX.drawBookshelf(ctx, 265, 20, 45, 55);
      // Crystal ball on table
      GFX.rect(ctx, 60, 85, 25, 4, C.BROWN); // table
      GFX.rect(ctx, 65, 78, 2, 7, C.DKBROWN); // stand
      ctx.fillStyle = '#88AAFF';
      ctx.beginPath();
      ctx.arc(72, 73, 6, 0, Math.PI*2);
      ctx.fill();
      GFX.withAlpha(ctx, 0.27, () => {
        ctx.fillStyle = '#AACCFF';
        ctx.beginPath();
        ctx.arc(70, 71, 2, 0, Math.PI*2);
        ctx.fill();
      });
      // Potion shelf
      GFX.rect(ctx, 230, 85, 30, 3, C.BROWN);
      // Potions
      const potionColors = ['#FF3333', '#33FF33', '#3333FF', '#FFFF33'];
      for (let p = 0; p < 4; p++) {
        GFX.rect(ctx, 233 + p*7, 78, 4, 7, potionColors[p]);
        GFX.rect(ctx, 234 + p*7, 76, 2, 3, C.DKGRAY);
      }
      // Telescope
      GFX.rect(ctx, 120, 30, 3, 30, C.DKGRAY);
      GFX.rect(ctx, 112, 25, 18, 6, C.GRAY);
      // Window
      GFX.drawWindow(ctx, 130, 15, 16, 25);
      // Door (south - exit)
      GFX.drawDoor(ctx, 145, 120, 22, 40);
      // Staircase down (to cavern)
      if (eng.getFlag('learned_crystal')) {
        GFX.rect(ctx, 20, 120, 20, 15, C.BLACK);
        GFX.rect(ctx, 22, 122, 16, 11, '#222233');
        // Arrow pointing down
        GFX.rect(ctx, 28, 125, 4, 5, C.GOLD);
        GFX.rect(ctx, 26, 129, 8, 2, C.GOLD);
      }
      // Scroll on floor
      GFX.rect(ctx, 200, 115, 12, 6, C.TAN);
      // Torch
      GFX.drawTorch(ctx, 100, 40, eng.waterPhase);
      GFX.drawTorch(ctx, 210, 40, eng.waterPhase + 2);
      // Sparkles (magical atmosphere)
      GFX.drawSparkle(ctx, 80, 50, eng.sparklePhase, '#8866FF');
      GFX.drawSparkle(ctx, 200, 60, eng.sparklePhase + 1, '#AA88FF');
      GFX.drawSparkle(ctx, 150, 45, eng.sparklePhase + 3, '#6644DD');
    },

    walkable: [
      { x: 10, y: 105, w: 300, h: 55 }
    ],

    exits: [
      { x: 142, y: 130, w: 28, h: 35, target: 'towerExterior', entryX: 160, entryY: 135, walkX: 158, walkY: 155 },
      { x: 18, y: 118, w: 24, h: 18, target: 'crystalCavern', entryX: 280, entryY: 110, walkX: 30, walkY: 130,
        condition(eng) { return eng.getFlag('learned_crystal'); } }
    ],

    hotspots: [
      {
        name: 'crystal ball', x: 58, y: 68, w: 30, h: 22,
        onLook(eng) {
          eng.showMessage('A crystal ball shows swirling images: a broken crystal, a dark cavern, and what appears to be a troll eating a sandwich. Useful? Maybe.');
        },
        onUse(eng) {
          const peeks = eng.getFlag('crystal_ball_peeks') || 0;
          eng.setFlag('crystal_ball_peeks', peeks + 1);
          const visions = [
            'You peer into the crystal ball. It shows you... yourself, peering into a crystal ball. How very meta.',
            'The crystal ball shows Chef Pierre\'s soup achieving sentience. That\'s probably fine.',
            'You see a vision of the royal cat conjugating Latin verbs. "Amo, amas, amat..." It\'s quite fluent.',
            'The ball shows a possible future where you\'re STILL sitting on your throne instead of adventuring. The ball is judging you.',
            'The crystal ball flickers and displays: "NO SIGNAL." Even magical artifacts have technical difficulties.',
          ];
          eng.showMessage(visions[Math.min(peeks, visions.length - 1)]);
        },
        onTalk(eng) { eng.showMessage('"Show me the way forward!" The ball shows you a door. THE door. Right behind you. Subtle.'); },
        onTake(eng) { eng.showMessage('Fumblemore\'s crystal ball. Best not to steal from a wizard. Even an incompetent one.'); }
      },
      {
        name: 'potions', x: 228, y: 74, w: 35, h: 15,
        onLook(eng) {
          eng.showMessage('Four potions labeled: "Strength," "Wisdom," "Invisibility," and "Do Not Drink Under Any Circumstances." Naturally, the last one is half-empty.');
        },
        onTake(eng) { eng.showMessage('Better not take potions from a wizard who couldn\'t even keep a crystal intact.'); },
        onUse(eng) { eng.die('You drink the "Do Not Drink Under Any Circumstances" potion. There were CIRCUMSTANCES under which you should not have drunk it. These were those circumstances. Game Over.'); }
      },
      {
        name: 'bookshelves', x: 8, y: 18, w: 50, h: 60,
        onLook(eng) {
          const titles = [
            '"Advanced Fumbling for Beginners"',
            '"101 Crystals and How to Break Them"',
            '"Oops: A Wizard\'s Memoir"',
            '"The Complete Idiot\'s Guide to Not Destroying Reality"',
            '"So You\'ve Accidentally Broken an Ancient Artifact"',
          ];
          const t = titles[Math.floor(Math.random() * titles.length)];
          eng.showMessage(`You read a book title: ${t}. Fumblemore's reading list is... concerning.`);
        }
      },
      {
        name: 'telescope', x: 110, y: 20, w: 22, h: 40,
        onLook(eng) { eng.showMessage('An enormous telescope pointed at the sky. Through it, you can see the constellation "Ursa Confused" - formerly "Ursa Major" before the Crystal broke.'); },
        onUse(eng) { eng.showMessage('You look through the telescope. The stars spell out: "HELP US, WE\'RE REARRANGING." The Crystal\'s chaos affects even the cosmos.'); }
      },
      {
        name: 'staircase', x: 18, y: 118, w: 24, h: 18,
        get hidden() { return Engine.getFlag('learned_crystal'); },
        onLook(eng) {
          eng.showMessage('The floor here seems hollow... strange.');
        }
      },
      {
        name: 'scroll', x: 198, y: 113, w: 14, h: 8,
        onLook(eng) { eng.showMessage('A scroll reads: "Note to self: DO NOT tap the Crystal of Order with your staff. Again. P.S. - Why do I never listen to me?"'); },
        onTake(eng) { eng.showMessage('You take the scroll. It crumbles to dust. "Self-destructing notes," mutters Fumblemore. "Very dramatic."'); }
      }
    ],

    npcs: [
      {
        name: 'Fumblemore', x: 100, y: 130, w: 16, h: 40,
        draw(ctx, eng) { GFX.drawFumblemore(ctx, 100, 133, eng.waterPhase); },
        onLook(eng) { eng.showMessage('Fumblemore the wizard. He\'s ancient, purple-robed, and radiates the energy of someone who has apologized to a LOT of villages.'); },
        onTalk(eng) {
          if (!eng.getFlag('talked_fumblemore')) {
            eng.setFlag('talked_fumblemore');
            eng.showDialog('Fumblemore',
              '"Oh! Oh my! King Graham! I am SO sorry about all the chaos! ' +
              'I was practicing my Crystal Polishing Spell and I sneezed and... well... ' +
              'I accidentally shattered the Crystal of Order into three pieces!"',
              [
                { text: '"How do we fix it?"', action(eng) {
                  eng.showDialog('Fumblemore',
                    '"The three crystal shards scattered into the cavern below this tower. ' +
                    'Collect all three shards and bring them to the Crystal Pedestal in the cavern. ' +
                    'Then pour Magic Water over them - the kind from the enchanted pond in the mushroom glade. ' +
                    'That should reassemble the Crystal! I\'d do it myself but... *gestures at general mess* ' +
                    '...I\'m not allowed near crystals anymore."',
                    null, () => {
                      eng.setFlag('learned_crystal');
                      eng.addScore(10, 'Learned from Fumblemore');
                      eng.showMessage('A trapdoor opens in the floor, revealing stairs down to the Crystal Cavern!');
                    });
                }},
                { text: '"You SNEEZED on an ancient artifact?!"', action(eng) {
                  eng.showDialog('Fumblemore',
                    '"In my defense, it was a VERY powerful sneeze! And the crystal was already a bit temperamental. ' +
                    'Look, the point is: three shards, in the cavern below, reassemble on the pedestal with magic water. ' +
                    'Can you fix it? Please? I can\'t show my face at the Wizard\'s Guild until this is sorted."',
                    null, () => {
                      eng.setFlag('learned_crystal');
                      eng.addScore(10, 'Learned from Fumblemore');
                      eng.showMessage('A trapdoor opens in the floor, revealing stairs down to the Crystal Cavern!');
                    });
                }}
              ]);
          } else {
            eng.showDialog('Fumblemore',
              '"Have you found the three crystal shards yet? They\'re in the cavern below! ' +
              'And remember - Magic Water on the pedestal to reassemble the Crystal of Order! ' +
              'I believe in you! ...mostly because I broke it and can\'t fix it myself."');
          }
        }
      }
    ],

    onEnter(eng) {
      if (!eng.getFlag('tower_interior_intro')) {
        eng.setFlag('tower_interior_intro');
        eng.showMessage('The wizard\'s study is cluttered with books, potions, and the general debris of magical mishaps.');
      }
    }
  };

  // ── 11. CRYSTAL CAVERN ──
  const crystalCavern = {
    id: 'crystalCavern',
    name: 'Crystal Cavern',

    draw(ctx, eng) {
      const w = eng.VW, h = eng.VH;
      // Cavern walls
      GFX.rect(ctx, 0, 0, w, h, '#0a0a15');
      // Rocky ceiling
      for (let rx = 0; rx < w; rx += 6) {
        const rh = 15 + GFX.seededRandom(rx) * 25;
        GFX.rect(ctx, rx, 0, 5, rh, '#1a1a2a');
        // Stalactites
        if (GFX.seededRandom(rx + 50) > 0.6) {
          const sh = 10 + GFX.seededRandom(rx + 100) * 15;
          ctx.fillStyle = '#2a2a3a';
          ctx.beginPath();
          ctx.moveTo(rx, rh);
          ctx.lineTo(rx + 3, rh + sh);
          ctx.lineTo(rx + 5, rh);
          ctx.closePath();
          ctx.fill();
        }
      }
      // Floor
      GFX.rect(ctx, 0, 100, w, h - 100, '#15152a');
      GFX.rect(ctx, 0, 100, w, 3, '#1a1a30');
      // Perspective side walls & floor grid
      GFX.drawPerspectiveSideWalls(ctx, w, h, 100, '#1a1a2a');
      GFX.drawPerspectiveFloorGrid(ctx, w, h, 100, 'rgba(100,100,200,0.06)');
      // Glowing crystals (decoration)
      GFX.withAlpha(ctx, 0.33, () => {
        GFX.drawCrystal(ctx, 30, 100, 20, '#5555FF');
        GFX.drawCrystal(ctx, 70, 95, 15, '#FF5555');
        GFX.drawCrystal(ctx, 280, 98, 18, '#55FF55');
        GFX.drawCrystal(ctx, 250, 102, 12, '#FFFF55');
        GFX.drawCrystal(ctx, 15, 105, 10, '#FF55FF');
      });
      // Underground pool
      GFX.rect(ctx, 60, 140, 50, 20, '#112244');
      GFX.rect(ctx, 62, 142, 46, 16, '#1a3355');
      GFX.drawSparkle(ctx, 75, 148, eng.sparklePhase, '#4466AA');
      GFX.drawSparkle(ctx, 90, 145, eng.sparklePhase + 1, '#3355AA');
      // Crystal shard locations
      if (!eng.getFlag('shard_1')) {
        GFX.drawCrystal(ctx, 45, 130, 10, '#AADDFF');
        GFX.drawSparkle(ctx, 45, 118, eng.sparklePhase, '#FFFFFF');
      }
      if (!eng.getFlag('shard_2')) {
        GFX.drawCrystal(ctx, 200, 125, 10, '#AADDFF');
        GFX.drawSparkle(ctx, 200, 113, eng.sparklePhase + 2, '#FFFFFF');
      }
      if (!eng.getFlag('shard_3')) {
        GFX.drawCrystal(ctx, 270, 145, 10, '#AADDFF');
        GFX.drawSparkle(ctx, 270, 133, eng.sparklePhase + 4, '#FFFFFF');
      }
      // Pedestal (center)
      GFX.drawPedestal(ctx, 160, 130);
      // Crystal on pedestal (if restored)
      if (eng.getFlag('crystal_restored')) {
        GFX.drawCrystal(ctx, 160, 110, 20, '#88DDFF');
        // Glowing aura
        ctx.fillStyle = `rgba(136,221,255,${Math.sin(eng.sparklePhase)*0.2 + 0.3})`;
        ctx.beginPath();
        ctx.arc(160, 100, 25, 0, Math.PI*2);
        ctx.fill();
        // Sparkle burst
        for (let i = 0; i < 12; i++) {
          const a = eng.sparklePhase * 0.5 + i * 0.52;
          const sr = 30 + Math.sin(eng.sparklePhase + i) * 10;
          GFX.drawSparkle(ctx, 160 + Math.cos(a)*sr, 100 + Math.sin(a)*sr*0.6, eng.sparklePhase + i, '#FFFFFF');
        }
      }
      // Cavern sparkles (ambient)
      for (let i = 0; i < 10; i++) {
        GFX.drawSparkle(ctx, GFX.seededRandom(i*7)*w, 20 + GFX.seededRandom(i*11)*80,
          eng.sparklePhase + i * 0.7, ['#5555FF','#FF5555','#55FF55','#FFFF55'][i%4]);
      }
      // Stairs (east - back to tower)
      GFX.rect(ctx, w - 20, 100, 20, 15, '#1a1a30');
      const stairColors = '#2a2a3a';
      for (let s = 0; s < 4; s++) {
        GFX.rect(ctx, w - 18 + s*4, 100 + s*3, 16 - s*4, 3, stairColors);
      }
    },

    walkable: [
      { x: 15, y: 105, w: 290, h: 60 }
    ],

    exits: [
      { x: 298, y: 100, w: 22, h: 20, target: 'towerInterior', entryX: 35, entryY: 130, walkX: 300, walkY: 115 }
    ],

    hotspots: [
      {
        name: 'crystal shard', x: 38, y: 118, w: 16, h: 16,
        get hidden() { return Engine.getFlag('shard_1'); },
        onLook(eng) { eng.showMessage('A glowing crystal shard. It pulses with magical energy - this must be part of the shattered Crystal of Order!'); },
        onTake(eng) {
          if (!eng.getFlag('shard_1')) {
            eng.setFlag('shard_1');
            eng.addItem('shard_1', 'Crystal Shard', '💎', 'A glowing shard of the Crystal of Order. One of three.');
            eng.addScore(5, 'Found shard 1');
          }
        }
      },
      {
        name: 'crystal shard', x: 193, y: 113, w: 16, h: 16,
        get hidden() { return Engine.getFlag('shard_2'); },
        onLook(eng) { eng.showMessage('Another crystal shard! It hums when you get close to it.'); },
        onTake(eng) {
          if (!eng.getFlag('shard_2')) {
            eng.setFlag('shard_2');
            eng.addItem('shard_2', 'Crystal Shard', '💎', 'A glowing shard of the Crystal of Order. One of three.');
            eng.addScore(5, 'Found shard 2');
          }
        }
      },
      {
        name: 'crystal shard', x: 263, y: 133, w: 16, h: 16,
        get hidden() { return Engine.getFlag('shard_3'); },
        onLook(eng) { eng.showMessage('The third crystal shard! It sparkles invitingly.'); },
        onTake(eng) {
          if (!eng.getFlag('shard_3')) {
            eng.setFlag('shard_3');
            eng.addItem('shard_3', 'Crystal Shard', '💎', 'A glowing shard of the Crystal of Order. One of three.');
            eng.addScore(5, 'Found shard 3');
          }
        }
      },
      {
        name: 'Crystal Pedestal', x: 150, y: 108, w: 20, h: 25,
        onLook(eng) {
          if (eng.getFlag('crystal_restored')) {
            eng.showMessage('The Crystal of Order, fully restored and glowing magnificently on its pedestal! Order has been restored!');
          } else {
            eng.showMessage('An ornate stone pedestal. Three empty grooves on top suggest something crystalline belongs here.');
          }
        },
        onUse(eng) {
          if (eng.getFlag('crystal_restored')) {
            eng.showMessage('The Crystal is already restored!');
            return;
          }
          const hasShards = eng.hasItem('shard_1') && eng.hasItem('shard_2') && eng.hasItem('shard_3');
          const hasWater = eng.hasItem('magic_water');
          if (hasShards && hasWater) {
            eng.removeItem('shard_1');
            eng.removeItem('shard_2');
            eng.removeItem('shard_3');
            eng.removeItem('magic_water');
            eng.setFlag('crystal_restored');
            eng.addScore(20, 'Restored the Crystal');
            eng.startCutscene([
              { message: 'You place the three crystal shards on the pedestal...', duration: 2500 },
              { message: 'You pour the Magic Water over the shards...', duration: 2500 },
              { message: 'The shards begin to glow, then FLASH with brilliant light!', duration: 2500 },
              { message: 'The three pieces meld together, reforming the Crystal of Order!', duration: 3000 },
              { message: 'A wave of magical energy ripples outward across the land...', duration: 3000 },
              { message: 'The chaos subsides! The pudding moat turns back to water! The garden grows right-side up!', duration: 3500 },
              { message: 'Even the royal cat has gone back to just being a regular, non-Latin-speaking cat!', duration: 3000 },
              { action(eng) { eng.win(); } }
            ]);
          } else if (hasShards && !hasWater) {
            eng.showMessage('You place the shards on the pedestal, but nothing happens. Fumblemore said you need Magic Water to reassemble them!');
          } else if (!hasShards && hasWater) {
            const count = [eng.hasItem('shard_1'), eng.hasItem('shard_2'), eng.hasItem('shard_3')].filter(Boolean).length;
            eng.showMessage(`You have ${count} of 3 crystal shards. Find them all before using the pedestal.`);
          } else {
            eng.showMessage('The pedestal is empty. You need the three crystal shards and Magic Water.');
          }
        },
        onUseItem(eng, itemId) {
          if (itemId === 'shard_1' || itemId === 'shard_2' || itemId === 'shard_3' || itemId === 'magic_water') {
            // Redirect to the main use handler
            this.onUse(eng);
            return true;
          }
          return false;
        }
      },
      {
        name: 'underground pool', x: 58, y: 138, w: 55, h: 22,
        onLook(eng) { eng.showMessage('A dark underground pool. Strange lights flicker in its depths. You can\'t tell how deep it is.'); },
        onTalk(eng) { eng.showMessage('You address the pool. Something blinks under the surface. You decide to stop addressing the pool.'); },
        onUse(eng) { eng.showMessage('You dip a toe in. It\'s FREEZING. Your toe glows briefly blue. You withdraw it immediately. Nope.'); },
        onTake(eng) { eng.showMessage('You cup some water. It seeps through your fingers and hisses on the ground. This water does NOT want to be taken.'); },
        onWalk(eng) { eng.die('You wade into the underground pool. It\'s impossibly deep, and something cold grabs your ankle. You shouldn\'t have gone for a swim in a magic cavern. Game Over.'); }
      }
    ],

    npcs: [],

    onEnter(eng) {
      if (!eng.getFlag('cavern_intro')) {
        eng.setFlag('cavern_intro');
        eng.showMessage('The Crystal Cavern! Glowing crystals of every color illuminate the underground chamber. Three shards of the Crystal of Order are scattered about.');
      }
    }
  };

  // ═══════════════════════════════════
  //  SCENE LOOK DESCRIPTIONS
  // ═══════════════════════════════════
  const sceneDescriptions = {
    throneRoom: 'The grand throne room of Castle Daventry. Stone walls adorned with tapestries, torches flickering warmly. Two magnificent thrones — one for the King, one for the Queen — dominate the far wall, and a treasure chest sits in the corner.',
    courtyard: 'The castle courtyard — in magical disarray. The moat has turned to butterscotch pudding, flowers grow upside-down, and the air smells strangely of cinnamon. Doors lead to the castle and kitchen, and a gate opens south to the docks.',
    kitchen: 'Chef Pierre\'s domain. A roaring fireplace heats the room, shelves of exotic spices line the walls, and something bubbles suspiciously in the cauldron. The aroma is excellent, magic or no magic.',
    docks: 'The Royal Docks of Daventry. Seagulls wheel overhead while the sea stretches to the horizon. A mysterious island shimmers with purple light in the distance. Boats bob along the wooden pier.',
    beach: 'The beach of the Enchanted Isle. White sand dotted with seashells, swaying palm trees, and the faint purple shimmer of enchanted waters. Barnaby\'s boat is beached nearby. A dense forest lies to the north.',
    forestPath: 'The Whispering Woods — ancient trees tower overhead, their leaves rustling with actual whispered gossip. Mushrooms of every variety dot the forest floor. Paths branch east toward a bridge, west to a glade, and south to the beach.',
    trollBridge: 'A rickety wooden bridge spanning a pitch-black chasm of unknown depth. The bridge looks passably sturdy. Dark forests crowd both sides of the gorge.',
    mushroomGlade: 'An enchanted glade filled with enormous glowing mushrooms in every shade of purple. A sparkling pond shimmers with magical energy, and a fairy ring of white mushrooms marks the center. The air tingles with enchantment.',
    towerExterior: 'Fumblemore\'s crooked tower stretches impossibly high, crackling with wayward magical energy. A purple-roofed spire crowns the stone structure. The entrance is at the base, and the path leads west.',
    towerInterior: 'The wizard\'s cluttered study. Bookshelves groan under the weight of questionable magical tomes, potions of dubious purpose line the shelves, and a crystal ball sits on a small table. The general ambiance suggests "brilliant but dangerously disorganized."',
    crystalCavern: 'A vast underground cavern aglow with crystals of every color. Stalactites hang from the ceiling like stone daggers. An ornate pedestal stands at the center, the rightful home of the Crystal of Order.',
  };

  // Apply scene look descriptions
  Object.entries(sceneDescriptions).forEach(([id, desc]) => {
    const scenes = { throneRoom, courtyard, kitchen, docks, beach, forestPath, trollBridge, mushroomGlade, towerExterior, towerInterior, crystalCavern };
    if (scenes[id]) scenes[id].onLookScene = function(eng) { eng.showMessage(desc); };
  });

  // ═══════════════════════════════════
  //  NPC ITEM INTERACTION HANDLERS
  // ═══════════════════════════════════

  // Queen Valanice
  throneRoom.npcs[0].onUseItem = function(eng, itemId) {
    eng.showMessage('"That\'s sweet dear, but I don\'t think that will help right now. Please, go fix the kingdom!"');
    return true;
  };

  // Chef Pierre
  kitchen.npcs[0].onUseItem = function(eng, itemId) {
    if (itemId === 'bread') {
      eng.showDialog('Chef Pierre', '"You\'re giving BACK ze bread? Non! Take it! You need it more zan I do, Your Majesty."');
    } else {
      eng.showDialog('Chef Pierre', '"Non non non! Keep zat away from my kitchen! I have enough magical chaos already!"');
    }
    return true;
  };

  // Old Barnaby
  docks.npcs[0].onUseItem = function(eng, itemId) {
    if (itemId === 'ship_key') {
      eng.showDialog('Old Barnaby', '"Aye, that\'s the old ship key! But we don\'t need it for me boat. Hold onto it, might be worth somethin\'."');
    } else if (itemId === 'rope') {
      eng.showDialog('Old Barnaby', '"Good rope, that! But me boat needs TAR to fix the hole, not lashings. Try the castle kitchen."');
    } else {
      eng.showDialog('Old Barnaby', '"What am I supposed to do with that, Yer Majesty? Fix me boat first — I need some tar for the hole!"');
    }
    return true;
  };

  // Madame Mushroom
  mushroomGlade.npcs[0].onUseItem = function(eng, itemId) {
    if (itemId === 'mushroom') {
      eng.showDialog('Madame Mushroom', '"Ah, one of my cousins! Lovely specimen. But I don\'t need it — perhaps someone with a terrible stomach ache could use its healing properties?"');
    } else if (itemId === 'magic_water') {
      eng.showDialog('Madame Mushroom', '"That\'s MY pond water, dear. You\'ll need it for the Crystal of Order. Don\'t waste it on a mushroom!"');
    } else {
      eng.showDialog('Madame Mushroom', '"I appreciate the gesture, Your Majesty, but mushrooms have no use for such things. The spores and I are quite self-sufficient."');
    }
    return true;
  };

  // Fumblemore
  towerInterior.npcs[0].onUseItem = function(eng, itemId) {
    if (itemId === 'magic_water') {
      eng.showDialog('Fumblemore', '"No no, don\'t give that to ME! Pour it on the crystal shards on the pedestal in the cavern below! I\'m not to be trusted with magical liquids. Or solids. Or gases, frankly."');
    } else if (itemId === 'shard_1' || itemId === 'shard_2' || itemId === 'shard_3') {
      eng.showDialog('Fumblemore', '"A crystal shard! Excellent! But don\'t give it to me — I\'ll just break it again. Place all three on the pedestal in the cavern below and add Magic Water!"');
    } else {
      eng.showDialog('Fumblemore', '"Hmm? Oh, I\'m not very good with physical objects. I tend to break them. Case in point: *gestures at the general state of reality*"');
    }
    return true;
  };

  // ═══════════════════════════════════
  //  REGISTER ALL SCENES
  // ═══════════════════════════════════

  const kqScenes = {
    throneRoom,
    courtyard,
    kitchen,
    docks,
    beach,
    forestPath,
    trollBridge,
    mushroomGlade,
    towerExterior,
    towerInterior,
    crystalCavern
  };

  // Register King's Quest in the multi-game registry
  window.GameWorlds = window.GameWorlds || {};
  window.GameWorlds.kq = kqScenes;

})();
