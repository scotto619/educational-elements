// components/curriculum/literacy/ReadersTheatre.js
// READERS THEATRE - Scripts for students to perform with character roles
import React, { useState, useEffect } from 'react';

// ===============================================
// READERS THEATRE SCRIPTS DATA
// ===============================================
const THEATRE_SCRIPTS = [
  {
    id: 'gaming-championship',
    title: 'The Gaming Championship',
    description: 'A competition between friends turns into a lesson about sportsmanship',
    characters: ['Alex', 'Jordan', 'Casey', 'Morgan', 'Narrator'],
    estimatedTime: '8-10 minutes',
    difficulty: 'Easy',
    theme: 'Friendship & Competition',
    script: `**NARRATOR:** It was the final day of the school gaming tournament. Five friends had made it to the championship round.

**ALEX:** (excitedly) I can't believe we all made it this far! This is going to be epic!

**JORDAN:** (confidently) Well, I've been practicing for months. I think I've got this in the bag.

**CASEY:** (nervously) I'm just happy to be here. I never thought I'd make it past the first round.

**MORGAN:** (supportively) Casey, you're better than you think! Remember how you beat that level everyone said was impossible?

**NARRATOR:** The tournament began. Each player chose their character and prepared for battle.

**ALEX:** Good luck everyone! May the best gamer win!

**JORDAN:** (smugly) Oh, I will. Don't worry about that.

**NARRATOR:** As the game progressed, Jordan took an early lead. But Casey surprised everyone by climbing to second place.

**CASEY:** (surprised) Wait... I'm actually doing really well!

**MORGAN:** Go Casey! You've got this!

**NARRATOR:** Jordan started getting frustrated as Casey caught up.

**JORDAN:** (angrily) This is ridiculous! Casey's just getting lucky!

**ALEX:** Jordan, chill out. We're all doing our best.

**NARRATOR:** In the final moments, Casey made an incredible comeback and won the tournament!

**CASEY:** (shocked) I... I actually won? I can't believe it!

**MORGAN:** Casey! That was amazing! You totally deserved that win!

**ALEX:** (clapping) That was the best gaming I've ever seen! Congratulations!

**JORDAN:** (reluctantly) I guess... congratulations, Casey. You played well.

**CASEY:** Thanks, Jordan. You pushed me to play better. We all did great!

**NARRATOR:** And so the friends learned that the real victory was supporting each other, win or lose.

**ALL:** (together) Friends first, competitors second!`
  },
  {
    id: 'social-media-mystery',
    title: 'The Social Media Mystery',
    description: 'Students solve the case of the mysterious viral post',
    characters: ['Detective Sam', 'Riley', 'Taylor', 'Jamie', 'Principal', 'Narrator'],
    estimatedTime: '10-12 minutes',
    difficulty: 'Medium',
    theme: 'Digital Citizenship',
    script: `**NARRATOR:** Roosevelt Middle School was buzzing with excitement. A mysterious post had gone viral overnight, and no one knew who posted it.

**PRINCIPAL:** (concerned) Students, someone has posted a video of our lunch lady doing an amazing dance routine. While it's wonderful, we need to find out who posted it without permission.

**DETECTIVE SAM:** (dramatically) This sounds like a case for Detective Sam! Riley, Taylor, Jamie - we need to investigate!

**RILEY:** (pulling out phone) The post already has 50,000 views! It's everywhere!

**TAYLOR:** (worried) But what if Mrs. Henderson doesn't want to be famous? We should have asked first.

**JAMIE:** (defensively) Maybe whoever posted it thought they were being nice!

**DETECTIVE SAM:** Let's look at the clues. The video was posted at 12:30 PM yesterday. Who was in the cafeteria then?

**RILEY:** That's right after lunch. Lots of kids were there.

**NARRATOR:** The friends split up to interview witnesses.

**TAYLOR:** (returning) I talked to the lunch servers. They said Mrs. Henderson was just having fun during her break.

**JAMIE:** (guilty) And I found out something else... the video was posted from the account "LunchLover123."

**DETECTIVE SAM:** (suspiciously) Jamie, you seem to know a lot about this account...

**JAMIE:** (sighing) Okay, okay! It was me! I posted it! But I thought I was being nice!

**RILEY:** Jamie! You can't just post videos of people without asking!

**JAMIE:** (realizing mistake) I know that now. I was just so excited about her amazing dance moves. I didn't think about how she might feel.

**NARRATOR:** Just then, Mrs. Henderson appeared.

**PRINCIPAL:** Mrs. Henderson, we found who posted the video. Jamie has something to say to you.

**JAMIE:** (apologetically) Mrs. Henderson, I'm so sorry. I posted your video without asking. I thought it was cool, but I should have gotten your permission first.

**MRS. HENDERSON:** (kindly) Thank you for apologizing, Jamie. Actually, I'm not upset about the video - I love dancing! But you're right, you should have asked first.

**DETECTIVE SAM:** So what happens now?

**MRS. HENDERSON:** Well, since it's already out there, maybe we can use this to teach others about asking permission before posting about people.

**TAYLOR:** That's a great idea! We could make a video about digital citizenship!

**RILEY:** And maybe Mrs. Henderson could teach us some of those dance moves!

**NARRATOR:** And so the mystery was solved, and everyone learned an important lesson about respecting others online.

**ALL:** (together) Always ask before you post!`
  },
  {
    id: 'time-travel-classroom',
    title: 'The Time-Traveling Classroom',
    description: 'Students accidentally travel through different time periods in history',
    characters: ['Ms. Garcia', 'Emma', 'Zack', 'Aria', 'Time Guardian', 'Narrator'],
    estimatedTime: '12-15 minutes',
    difficulty: 'Hard',
    theme: 'History & Adventure',
    script: `**NARRATOR:** It was just another Tuesday in Ms. Garcia's history class, until she pulled out a mysterious old clock from her desk drawer.

**MS. GARCIA:** (excitedly) Class, this antique clock belonged to my great-grandmother. Legend says it has magical properties, but of course, that's just a story.

**EMMA:** (curiously) Ms. Garcia, why are the hands spinning backwards?

**ZACK:** (jokingly) Maybe it's broken! Or maybe we're about to travel through time!

**ARIA:** (rolling eyes) Zack, don't be ridiculous. Time travel isn't real.

**NARRATOR:** Suddenly, the clock began to glow and chime loudly. The room started spinning!

**MS. GARCIA:** (panicking) Everyone hold hands! Something's happening!

**NARRATOR:** When the spinning stopped, they found themselves in ancient Egypt!

**TIME GUARDIAN:** (appearing majestically) Welcome, travelers! I am the Guardian of Time. You have activated the Chronos Clock!

**EMMA:** (amazed) Are we really in ancient Egypt? Look at those pyramids!

**ZACK:** (excited) This is the coolest field trip ever!

**ARIA:** (scientific) But this defies all laws of physics!

**TIME GUARDIAN:** You will journey through three important periods of history. Learn from each, and the clock will return you home.

**NARRATOR:** First, they met Egyptian scribes and learned about hieroglyphics.

**MS. GARCIA:** (teaching) Students, notice how they're recording important information. This is early writing!

**NARRATOR:** The clock chimed again, and they found themselves in medieval times.

**ZACK:** (nervously) Uh, why is everyone wearing armor and carrying swords?

**EMMA:** We're in the Middle Ages! Look at that castle!

**ARIA:** (fascinated) The engineering of these structures is remarkable for the time period!

**NARRATOR:** They learned about knights, castles, and how people lived without modern technology.

**MS. GARCIA:** See how communities worked together for survival? Very different from today!

**NARRATOR:** The final chime brought them to the Industrial Revolution.

**TIME GUARDIAN:** (reappearing) Your final lesson awaits. See how innovation changes the world.

**EMMA:** Look at all these factories and machines!

**ZACK:** It's so smoky and loud! I prefer our time.

**ARIA:** But think about it - these inventions led to the technology we use today!

**MS. GARCIA:** Every time period builds on the previous one. That's the beauty of history!

**TIME GUARDIAN:** You have learned well. The past shapes the present, and the present shapes the future.

**NARRATOR:** The clock glowed one final time, and they found themselves back in their classroom.

**EMMA:** (breathless) Did that really happen?

**ZACK:** That was better than any video game!

**ARIA:** (thoughtfully) I have a new appreciation for how far we've come as humans.

**MS. GARCIA:** (smiling) Sometimes the best lessons come from the most unexpected places.

**NARRATOR:** And from that day forward, history class was never boring again!

**ALL:** (together) The past is alive in all of us!`
  },
  {
    id: 'science-fair-disaster',
    title: 'The Science Fair Disaster',
    description: 'When experiments go wrong, teamwork saves the day',
    characters: ['Dr. Kim', 'Maya', 'Ben', 'Sofia', 'Judge Peterson', 'Narrator'],
    estimatedTime: '8-10 minutes',
    difficulty: 'Easy',
    theme: 'Science & Teamwork',
    script: `**NARRATOR:** It was the day of the annual science fair at Lincoln Elementary. Students had worked for weeks preparing their experiments.

**DR. KIM:** (encouragingly) Remember everyone, science is about learning from both successes AND failures!

**MAYA:** (confidently) My volcano is going to be perfect! I've practiced this eruption fifty times!

**BEN:** (nervously) I hope my robot works. I stayed up until midnight programming it.

**SOFIA:** (worriedly) What if my plant growth experiment doesn't show any results?

**NARRATOR:** The judging began. Everything was going smoothly until...

**MAYA:** (panicking) Oh no! My volcano is erupting everywhere! It's not supposed to do that!

**BEN:** (frantically) And my robot is going crazy! It's knocking over other projects!

**SOFIA:** (upset) This is a disaster! The whole science fair is ruined!

**JUDGE PETERSON:** (calmly) Let's not panic, everyone. These things happen in real science too.

**NARRATOR:** Instead of giving up, the three friends decided to work together.

**MAYA:** Wait! Ben, can you program your robot to help clean up my volcano mess?

**BEN:** (brightening) That's brilliant! And Sofia, your plants could show how things grow even in unexpected conditions!

**SOFIA:** (excited) We could create a presentation about how real scientists handle unexpected problems!

**DR. KIM:** (proudly) Now you're thinking like true scientists! Problems become opportunities!

**NARRATOR:** Working together, they turned their disasters into a demonstration about scientific problem-solving.

**MAYA:** (presenting) Our volcano taught us about chemical reactions and safety procedures!

**BEN:** My robot showed us how to adapt technology when things don't go as planned!

**SOFIA:** And my plants proved that growth can happen even in chaos!

**JUDGE PETERSON:** (impressed) This is the most creative problem-solving I've seen all day!

**NARRATOR:** In the end, they won first place - not for perfect experiments, but for perfect teamwork.

**DR. KIM:** Science isn't about everything going perfectly. It's about curiosity, collaboration, and learning from mistakes.

**MAYA:** We learned more from our disasters than we would have from perfect projects!

**BEN:** Plus, working together was way more fun than working alone!

**SOFIA:** Now I'm excited to try even more experiments!

**NARRATOR:** And so the science fair disaster became the science fair success story!

**ALL:** (together) Science is better when we work together!`
  },
  {
    id: 'cafeteria-chronicles',
    title: 'The Cafeteria Chronicles',
    description: 'A humorous look at the daily drama of school lunch time',
    characters: ['Narrator', 'Lunch Lady Linda', 'Pizza Lover Pete', 'Healthy Hannah', 'Picky Parker', 'New Kid Nadia'],
    estimatedTime: '6-8 minutes',
    difficulty: 'Easy',
    theme: 'School Life & Friendship',
    script: `**NARRATOR:** Welcome to Jefferson Middle School's cafeteria, where drama unfolds daily over mac and cheese!

**LUNCH LADY LINDA:** (cheerfully) Good morning, students! Today we have pizza, salad, and... mystery meat!

**PIZZA LOVER PETE:** (excitedly) Pizza day! This is the best day of my entire life!

**HEALTHY HANNAH:** (critically) Pete, you say that every pizza day. Don't you want some vegetables too?

**PIZZA LOVER PETE:** (horrified) Vegetables? On pizza day? Hannah, you're speaking madness!

**NARRATOR:** Meanwhile, Parker approaches the line with his usual cautious demeanor.

**PICKY PARKER:** (suspiciously) Lunch Lady Linda, what exactly IS mystery meat?

**LUNCH LADY LINDA:** (mysteriously) Well Parker, if I told you, it wouldn't be a mystery, would it?

**PICKY PARKER:** (worried) That doesn't make me feel better about eating it.

**NARRATOR:** Just then, Nadia, the new student, joins the lunch line looking confused.

**NEW KID NADIA:** (nervously) Um, excuse me, how does this whole lunch thing work here?

**HEALTHY HANNAH:** (helpfully) Oh, you just grab a tray and choose what you want! I'm Hannah, and I always recommend the salad!

**PIZZA LOVER PETE:** (interrupting) Don't listen to her! Pizza is the only logical choice!

**PICKY PARKER:** (cautioning) Actually, I'd suggest bringing lunch from home. It's much safer.

**NEW KID NADIA:** (overwhelmed) Wow, you all have very strong opinions about food!

**LUNCH LADY LINDA:** (wisely) Honey, in thirty years of cafeteria work, I've learned everyone has different tastes. Try a little of everything!

**NARRATOR:** Nadia decides to be adventurous and gets pizza, salad, AND mystery meat.

**NEW KID NADIA:** (bravely) You know what? I'm going to try it all! When in Rome...

**PIZZA LOVER PETE:** (impressed) Wow, you're braver than I am!

**HEALTHY HANNAH:** (admiringly) That's a very balanced approach!

**PICKY PARKER:** (amazed) You're actually going to eat the mystery meat? You're my hero!

**NARRATOR:** As they sit down together, Nadia takes her first bite of the mystery meat.

**NEW KID NADIA:** (surprised) Hey, this mystery meat actually tastes like... chicken!

**LUNCH LADY LINDA:** (calling from behind the counter) That's because it IS chicken! The mystery was just the seasoning!

**PICKY PARKER:** (relieved) Oh! Well, why didn't you just say that?

**LUNCH LADY LINDA:** (laughing) Where's the fun in that?

**NARRATOR:** And so, over shared laughs and lunch trays, a new friendship was born.

**PIZZA LOVER PETE:** You know, maybe I will try some salad tomorrow.

**HEALTHY HANNAH:** And maybe I'll try pizza next week!

**PICKY PARKER:** (boldly) And maybe I'll even try the mystery meat... I mean, chicken!

**NEW KID NADIA:** (happily) I love this school already!

**NARRATOR:** Because sometimes the best part of lunch isn't the food - it's the friends you share it with!

**ALL:** (together) Cafeteria friends are the best friends!`
  }
];

// ===============================================
// MAIN READERS THEATRE COMPONENT
// ===============================================
const ReadersTheatre = ({ 
  showToast = () => {}, 
  students = [], 
  saveData = () => {}, 
  loadedData = {} 
}) => {
  const [groups, setGroups] = useState(loadedData?.theatreGroups || []);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showScriptBrowser, setShowScriptBrowser] = useState(false);
  const [viewingScript, setViewingScript] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showStudentAssignment, setShowStudentAssignment] = useState(false);
  const [displayingScript, setDisplayingScript] = useState(null);

  // Initialize groups if empty
  useEffect(() => {
    if (loadedData?.theatreGroups && loadedData.theatreGroups.length > 0) {
      setGroups(loadedData.theatreGroups);
      setHasUnsavedChanges(false);
      console.log('Theatre groups loaded from Firebase:', loadedData.theatreGroups);
    } else if (loadedData !== undefined && groups.length === 0) {
      const defaultGroups = [
        { id: 1, name: "Drama Group 1", color: "bg-purple-600", students: [], assignedScript: null, characterAssignments: {} },
        { id: 2, name: "Drama Group 2", color: "bg-pink-600", students: [], assignedScript: null, characterAssignments: {} },
        { id: 3, name: "Drama Group 3", color: "bg-indigo-600", students: [], assignedScript: null, characterAssignments: {} }
      ];
      setGroups(defaultGroups);
      setHasUnsavedChanges(true);
      console.log('Created default theatre groups');
    }
  }, [loadedData]);

  // Update groups when loadedData changes
  useEffect(() => {
    if (loadedData?.theatreGroups && 
        Array.isArray(loadedData.theatreGroups) && 
        loadedData.theatreGroups.length > 0 &&
        JSON.stringify(loadedData.theatreGroups) !== JSON.stringify(groups)) {
      setGroups(loadedData.theatreGroups);
      setHasUnsavedChanges(false);
      console.log('Updated theatre groups from Firebase data change');
    }
  }, [loadedData?.theatreGroups]);

  // Clean up groups when students change
  useEffect(() => {
    if (groups.length > 0 && students.length > 0) {
      const studentIds = students.map(s => s.id);
      let hasChanges = false;
      
      const cleanedGroups = groups.map(group => {
        const validStudents = group.students.filter(student => studentIds.includes(student.id));
        if (validStudents.length !== group.students.length) {
          hasChanges = true;
          return { ...group, students: validStudents };
        }
        return group;
      });
      
      if (hasChanges) {
        console.log('Cleaned up removed students from theatre groups');
        setGroups(cleanedGroups);
        setHasUnsavedChanges(true);
      }
    }
  }, [students]);

  // Save function
  const saveGroups = () => {
    try {
      if (!saveData || typeof saveData !== 'function') {
        console.error('saveData function not available');
        return;
      }

      if (!groups || groups.length === 0) {
        console.error('No groups to save');
        return;
      }
      
      const existingToolkitData = loadedData || {};
      const updatedToolkitData = {
        ...existingToolkitData,
        theatreGroups: groups,
        lastSaved: new Date().toISOString()
      };
      
      saveData({ toolkitData: updatedToolkitData });
      setHasUnsavedChanges(false);
      console.log('Theatre groups saved to Firebase successfully:', groups);
      
    } catch (error) {
      console.error('Error saving theatre groups:', error);
    }
  };

  // Update groups locally
  const updateGroups = (updatedGroups) => {
    if (!Array.isArray(updatedGroups)) {
      console.error('Invalid groups data - must be array');
      return;
    }
    setGroups(updatedGroups);
    setHasUnsavedChanges(true);
    console.log('Groups updated locally, unsaved changes flagged');
  };

  const addGroup = () => {
    if (groups.length >= 5) return;
    
    const colors = ["bg-purple-600", "bg-pink-600", "bg-indigo-600", "bg-red-600", "bg-blue-600"];
    const newGroup = {
      id: Date.now(),
      name: `Drama Group ${groups.length + 1}`,
      color: colors[groups.length % colors.length],
      students: [],
      assignedScript: null,
      characterAssignments: {}
    };
    updateGroups([...groups, newGroup]);
  };

  const removeGroup = (groupId) => {
    updateGroups(groups.filter(g => g.id !== groupId));
  };

  const updateGroupName = (groupId, newName) => {
    updateGroups(groups.map(g => 
      g.id === groupId ? { ...g, name: newName } : g
    ));
  };

  const assignStudentToGroup = (studentId, groupId) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      students: group.id === groupId 
        ? [...group.students.filter(s => s.id !== studentId), students.find(s => s.id === studentId)]
        : group.students.filter(s => s.id !== studentId)
    }));
    updateGroups(updatedGroups);
  };

  const assignScriptToGroup = (groupId, scriptId) => {
    updateGroups(groups.map(g => 
      g.id === groupId ? { ...g, assignedScript: scriptId, characterAssignments: {} } : g
    ));
  };

  const assignCharacterToStudent = (groupId, studentId, character) => {
    updateGroups(groups.map(group => {
      if (group.id === groupId) {
        const newAssignments = { ...group.characterAssignments };
        // Remove student from any existing character
        Object.keys(newAssignments).forEach(char => {
          if (newAssignments[char] === studentId) {
            delete newAssignments[char];
          }
        });
        // Assign new character
        if (character) {
          newAssignments[character] = studentId;
        }
        return { ...group, characterAssignments: newAssignments };
      }
      return group;
    }));
  };

  // Print script with character assignments
  const printScript = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !group.assignedScript) return;
    
    const script = THEATRE_SCRIPTS.find(s => s.id === group.assignedScript);
    if (!script) return;
    
    const printWindow = window.open('', 'PrintScript', 'height=800,width=600');
    
    const characterList = script.characters.map(character => {
      const studentId = group.characterAssignments[character];
      const student = group.students.find(s => s.id === studentId);
      const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unassigned';
      return `<div class="character-assignment"><strong>${character}:</strong> ${studentName}</div>`;
    }).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${script.title} - ${group.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 28px; font-weight: bold; color: #6366f1; margin-bottom: 10px; }
            .info { font-size: 14px; color: #666; margin-bottom: 5px; }
            .cast { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 15px; margin-bottom: 30px; }
            .cast h3 { color: #374151; margin-bottom: 15px; }
            .character-assignment { margin-bottom: 8px; padding: 5px; background: white; border-radius: 5px; }
            .script-content { font-size: 14px; }
            .stage-direction { color: #6b7280; font-style: italic; margin: 10px 0; }
            .character-name { font-weight: bold; color: #1f2937; }
            .dialogue { margin-left: 20px; margin-bottom: 10px; }
            @media print {
              body { margin: 15px; font-size: 12px; }
              .header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${script.title}</div>
            <div class="info">Group: ${group.name}</div>
            <div class="info">Estimated Time: ${script.estimatedTime}</div>
            <div class="info">Theme: ${script.theme}</div>
          </div>
          
          <div class="cast">
            <h3>Cast Assignments</h3>
            ${characterList}
          </div>
          
          <div class="script-content">
            ${script.script.split('\n').map(line => {
              line = line.trim();
              if (line.startsWith('**') && line.endsWith('**')) {
                const parts = line.substring(2, line.length - 2).split(':** (');
                if (parts.length === 2) {
                  return `<div class="dialogue"><span class="character-name">${parts[0]}:</span> <span class="stage-direction">(${parts[1]}</span> ${line.split(') ')[1] || ''}</div>`;
                } else {
                  const parts2 = line.substring(2, line.length - 2).split(':** ');
                  if (parts2.length === 2) {
                    return `<div class="dialogue"><span class="character-name">${parts2[0]}:</span> ${parts2[1]}</div>`;
                  }
                }
              }
              return `<div class="stage-direction">${line}</div>`;
            }).join('')}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const getAssignedStudents = () => {
    return groups.reduce((assigned, group) => [...assigned, ...group.students], []);
  };

  const unassignedStudents = students.filter(student => 
    !getAssignedStudents().some(assigned => assigned?.id === student.id)
  );

  // Get script for display
  const getDisplayScript = () => {
    if (!displayingScript) return null;
    return THEATRE_SCRIPTS.find(s => s.id === displayingScript);
  };

  const displayScript = getDisplayScript();

  if (isPresentationMode) {
    const activeGroups = groups.filter(g => g.assignedScript);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Theatre Time!</h1>
          <button
            onClick={() => setIsPresentationMode(false)}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl text-xl font-bold hover:bg-gray-700"
          >
            Exit Presentation
          </button>
        </div>

        <div className="grid gap-6">
          {activeGroups.map(group => {
            const script = THEATRE_SCRIPTS.find(s => s.id === group.assignedScript);
            if (!script) return null;

            return (
              <div key={group.id} className="bg-white rounded-2xl shadow-2xl p-8">
                <div className={`${group.color} text-white text-center py-6 rounded-xl mb-6`}>
                  <h2 className="text-4xl font-bold">{group.name}</h2>
                  <p className="text-2xl opacity-90">Performing: {script.title}</p>
                  <p className="text-lg opacity-80">{script.estimatedTime} • {script.characters.length} characters</p>
                </div>

                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-center mb-4">Cast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {script.characters.map(character => {
                      const studentId = group.characterAssignments[character];
                      const student = group.students.find(s => s.id === studentId);
                      return (
                        <div key={character} className="bg-white border border-gray-300 rounded-lg p-3 text-center">
                          <div className="font-bold text-purple-800">{character}</div>
                          <div className="text-sm text-gray-600">
                            {student ? `${student.firstName} ${student.lastName}` : 'Unassigned'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <span className="mr-3">Theatre</span>
              Readers Theatre
            </h1>
            <p className="text-lg opacity-90">Drama scripts with character roles for student performances</p>
            <p className="text-sm opacity-75 mt-1">{THEATRE_SCRIPTS.length} scripts available • Multiple difficulty levels</p>
            {loadedData?.theatreGroups && loadedData.theatreGroups.length > 0 && !hasUnsavedChanges && (
              <p className="text-sm opacity-75 mt-1">Groups loaded from your saved data</p>
            )}
            {hasUnsavedChanges && (
              <p className="text-sm opacity-75 mt-1">You have unsaved changes</p>
            )}
          </div>
          <div className="flex gap-3">
            {hasUnsavedChanges && (
              <button
                onClick={saveGroups}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold flex items-center gap-2 animate-pulse"
              >
                Save Changes
              </button>
            )}
            <button
              onClick={() => setShowStudentAssignment(true)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              Assign Students
            </button>
            <button
              onClick={() => setShowScriptBrowser(!showScriptBrowser)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              Browse Scripts
            </button>
            <button
              onClick={() => setIsPresentationMode(true)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              Presentation Mode
            </button>
          </div>
        </div>
      </div>

      {/* Script Display Modal */}
      {displayScript && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{displayScript.title}</h2>
                  <p className="text-xl opacity-90">{displayScript.theme} • {displayScript.estimatedTime}</p>
                  <p className="text-lg opacity-80">{displayScript.characters.join(', ')}</p>
                </div>
                <button
                  onClick={() => setDisplayingScript(null)}
                  className="text-white hover:text-red-200 text-4xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8">
                <div className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap font-serif">
                  {displayScript.script.split('\n').map((line, index) => {
                    line = line.trim();
                    if (line.startsWith('**') && line.endsWith('**')) {
                      const content = line.substring(2, line.length - 2);
                      if (content.includes(':** (')) {
                        const [character, rest] = content.split(':** (');
                        return (
                          <div key={index} className="mb-3">
                            <span className="font-bold text-purple-800">{character}:</span>
                            <span className="text-gray-600 italic"> ({rest}</span>
                          </div>
                        );
                      } else if (content.includes(':** ')) {
                        const [character, dialogue] = content.split(':** ');
                        return (
                          <div key={index} className="mb-3">
                            <span className="font-bold text-purple-800">{character}:</span>
                            <span className="ml-2">{dialogue}</span>
                          </div>
                        );
                      }
                    }
                    return (
                      <div key={index} className="mb-2 text-gray-600 italic">
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-xl text-center">
              <button
                onClick={() => setDisplayingScript(null)}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700"
              >
                Close Display
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Script Browser Modal */}
      {showScriptBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Browse Theatre Scripts</h2>
                <button
                  onClick={() => {
                    setShowScriptBrowser(false);
                    setViewingScript(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {viewingScript ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{viewingScript.title}</h3>
                      <p className="text-purple-600 italic">{viewingScript.description}</p>
                      <div className="flex gap-4 text-sm text-gray-600 mt-2">
                        <span>Time: {viewingScript.estimatedTime}</span>
                        <span>Difficulty: {viewingScript.difficulty}</span>
                        <span>Characters: {viewingScript.characters.length}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDisplayingScript(viewingScript.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                      >
                        Display to Class
                      </button>
                      <button
                        onClick={() => setViewingScript(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                      >
                        ← Back
                      </button>
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <h4 className="font-bold text-purple-800 mb-2">Characters ({viewingScript.characters.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingScript.characters.map(character => (
                        <span key={character} className="bg-purple-200 text-purple-800 px-3 py-1 rounded text-sm font-semibold">
                          {character}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4">Script Preview</h4>
                    <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {viewingScript.script.substring(0, 800)}...
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {THEATRE_SCRIPTS.map(script => (
                    <button
                      key={script.id}
                      onClick={() => setViewingScript(script)}
                      className="p-6 rounded-lg border-2 border-gray-200 hover:border-purple-300 text-left transition-all hover:scale-105 bg-white shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-lg">{script.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          script.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          script.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {script.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{script.description}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Theme: {script.theme}</div>
                        <div>Time: {script.estimatedTime}</div>
                        <div>Characters: {script.characters.length} ({script.characters.slice(0, 3).join(', ')}{script.characters.length > 3 ? '...' : ''})</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rest of component continues with groups display, student assignment, etc... */}
      
      {/* Unassigned Students */}
      {unassignedStudents.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-bold text-yellow-800 mb-3">Unassigned Students ({unassignedStudents.length})</h3>
          <p className="text-sm text-yellow-700 mb-3">Click "Assign Students" above to assign students to drama groups</p>
          <div className="flex flex-wrap gap-2">
            {unassignedStudents.slice(0, 5).map(student => (
              <div key={student.id} className="bg-white border border-yellow-300 rounded-lg p-2">
                <span className="text-sm font-medium">{student.firstName} {student.lastName}</span>
              </div>
            ))}
            {unassignedStudents.length > 5 && (
              <div className="bg-white border border-yellow-300 rounded-lg p-2">
                <span className="text-sm text-gray-500">+{unassignedStudents.length - 5} more</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Groups Display */}
      <div className={`grid gap-4 ${
        groups.length === 1 ? 'grid-cols-1' :
        groups.length === 2 ? 'grid-cols-2' :
        groups.length === 3 ? 'grid-cols-3' :
        'grid-cols-2'
      }`}>
        {groups.map(group => {
          const script = group.assignedScript ? THEATRE_SCRIPTS.find(s => s.id === group.assignedScript) : null;
          
          return (
            <div key={group.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
              <div className={`${group.color} text-white p-4 rounded-t-xl`}>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) => updateGroupName(group.id, e.target.value)}
                    className="bg-transparent text-white font-bold border-none outline-none text-lg"
                  />
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="text-white hover:text-red-200 text-lg"
                  >
                    ×
                  </button>
                </div>
                <p className="opacity-90 text-sm">{group.students.length} students</p>
              </div>

              <div className="p-4">
                {/* Script Assignment */}
                <div className="mb-4">
                  <h4 className="font-bold text-gray-700 mb-2">Assigned Script:</h4>
                  {script ? (
                    <div className="bg-purple-50 border border-purple-200 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-purple-800">{script.title}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => printScript(group.id)}
                            className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                          >
                            Print
                          </button>
                          <button
                            onClick={() => setDisplayingScript(script.id)}
                            className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
                          >
                            View
                          </button>
                          <button
                            onClick={() => assignScriptToGroup(group.id, null)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-purple-600">
                        {script.characters.length} characters • {script.estimatedTime}
                      </div>
                    </div>
                  ) : (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          assignScriptToGroup(group.id, e.target.value);
                        }
                        e.target.value = '';
                      }}
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      defaultValue=""
                    >
                      <option value="">Choose a script...</option>
                      {THEATRE_SCRIPTS.map(script => (
                        <option key={script.id} value={script.id}>
                          {script.title} ({script.characters.length} characters)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Character Assignments */}
                {script && (
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-700 mb-2">Character Assignments:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {script.characters.map(character => {
                        const assignedStudentId = group.characterAssignments[character];
                        return (
                          <div key={character} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm font-medium text-purple-800">{character}:</span>
                            <select
                              value={assignedStudentId || ''}
                              onChange={(e) => assignCharacterToStudent(group.id, e.target.value, character)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="">Unassigned</option>
                              {group.students.map(student => (
                                <option key={student.id} value={student.id}>
                                  {student.firstName} {student.lastName}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Students */}
                <div className="mb-3">
                  <h4 className="font-bold text-gray-700 mb-2">Students:</h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {group.students.map(student => (
                      <div key={student.id} className="flex items-center justify-between bg-gray-50 p-1 rounded">
                        <span className="text-sm">{student.firstName} {student.lastName}</span>
                        <button
                          onClick={() => assignStudentToGroup(student.id, null)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {group.students.length === 0 && (
                      <p className="text-gray-500 italic text-sm">No students assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Group Button */}
        {groups.length < 5 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center min-h-[300px]">
            <button
              onClick={addGroup}
              className="text-gray-600 hover:text-gray-800 text-center"
            >
              <div className="text-4xl mb-2">+</div>
              <div className="font-bold">Add Drama Group</div>
            </button>
          </div>
        )}
      </div>

      {/* Student Assignment Modal */}
      {showStudentAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Assign Students to Drama Groups</h2>
                <button
                  onClick={() => setShowStudentAssignment(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-4">Available Students</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {unassignedStudents.map(student => (
                      <div key={student.id} className="bg-gray-50 border rounded-lg p-3">
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {groups.map(group => (
                            <button
                              key={group.id}
                              onClick={() => assignStudentToGroup(student.id, group.id)}
                              className={`${group.color} text-white text-xs px-3 py-1 rounded hover:opacity-80`}
                            >
                              → {group.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {unassignedStudents.length === 0 && (
                      <p className="text-gray-500 italic">All students are assigned to groups!</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">Drama Groups</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {groups.map(group => (
                      <div key={group.id} className="border rounded-lg">
                        <div className={`${group.color} text-white p-2 rounded-t-lg`}>
                          <h4 className="font-bold">{group.name} ({group.students.length})</h4>
                        </div>
                        <div className="p-2 space-y-1">
                          {group.students.map(student => (
                            <div key={student.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{student.firstName} {student.lastName}</span>
                              <button
                                onClick={() => assignStudentToGroup(student.id, null)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          {group.students.length === 0 && (
                            <p className="text-gray-400 text-sm italic">No students assigned</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadersTheatre;