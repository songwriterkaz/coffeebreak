(function () {
  "use strict";

  var PROGRESS_KEY = "cb-parenting-progress-v1";
  var FEED_KEY = "cb-parenting-feed-v1";

  var COURSE = [
    {
      id: "1",
      title: "Calm and connected",
      focus: "Co-regulation",
      blurb: "Your steadier body helps a child settle. Connection comes before the correction.",
      lessons: [
        {
          id: "1-1",
          title: "Your calm is the first lesson",
          paras: [
            "When a child is loud, clingy or spinning, their body is looking for a steadier one nearby. That is co-regulation. You do not have to feel peaceful. You only have to be a little steadier than the moment.",
            "Put both feet on the floor. Drop your shoulders. Breathe out for longer than you breathe in, and speak more slowly than you want to. A child can borrow that pace. A useful sentence is: “I am here. We can slow this down.”",
            "If you are too flooded to do this beside them, step to the doorway where you can still see them and take thirty seconds. Say, “I am going to get steady, then I will come back.” Coming back is the lesson. Sending them off to calm down alone, while you are still stormy, usually makes a bigger storm."
          ]
        },
        {
          id: "1-2",
          title: "A short reset beside your child",
          paras: [
            "Come down to their height. Offer a hand, a hug, or space, and let them choose. Some children want touch and some need you close but not holding them. “Hand, hug, or space?” is a complete question.",
            "Name one thing you can see, without a verdict. “Your fists are tight.” “Your voice got very loud.” “You came to find me.” Naming is not fixing. It tells them the feeling can be seen and you are still there.",
            "Then offer one small thing the body can do in a minute: a drink of water, a walk to the letterbox, pushing hands against a wall, a song they already know. When the body comes down a notch, words start to work. Lectures before that mostly bounce off."
          ]
        },
        {
          id: "1-3",
          title: "Coming back after you lose it",
          paras: [
            "Parents snap. A “stop it” comes out louder than you meant. The repair matters more than a spotless record. As soon as you can, get close and own your part. “I yelled. You did not deserve that volume. I was overwhelmed, and that is on me. I am sorry.”",
            "Leave off the “but you made me”. That ending takes the apology back. If a limit still stands, say it second, in a quieter voice. “I am sorry I shouted. The hitting still stops. We can find another way.”",
            "Children learn repair by watching you do it the same day. A family that can come back after a mess is safer than a family that pretends nobody ever loses it."
          ]
        },
        {
          id: "1-4",
          title: "Connection before correction",
          paras: [
            "A limit lands better when a child can feel you are on their side. Connection is not giving in. It is a moment of warmth before the boundary. “You really wanted that biscuit. The answer is still not now. I will sit with you while you are cross.”",
            "Get nearby first, then use one sentence for the limit, then stay. A no shouted from another room is only a no. Warmth that disappears the moment they protest feels like a trick. Do both: a kind face, a clear line, and you remain in the room while they feel it.",
            "You can be firm and still be a safe person. The aim is a child who knows the rule and also knows you will not vanish when they dislike it."
          ]
        }
      ],
      worksheet: {
        title: "Co-regulation card",
        intro: "Fill this in on a calm day. Stick it inside a cupboard. Print it if a paper copy helps.",
        prompts: [
          "Signs in my body that I am getting flooded",
          "A sentence I can say before I step away",
          "What my child usually prefers: hand, hug, space, words, or quiet",
          "Three one-minute resets that work in our house",
          "The repair sentence I want to remember",
          "Who can take five minutes with them if I am past my limit"
        ]
      },
      quiz: [
        { q: "What is co-regulation, in this course?", choices: ["Making a child calm themselves before you will talk", "Your steadier body helping their body settle", "A chart of rewards on the fridge", "Ignoring a feeling until it passes"], a: 1 },
        { q: "When you are too flooded to help, a useful move is to:", choices: ["Lock yourself away with no word", "Say you are getting steady and that you will come back", "Match their volume so they hear you", "Give a long lecture immediately"], a: 1 },
        { q: "A repair after you snap should:", choices: ["Include “but you made me” so they learn", "Own your volume, apologise, and keep any real limit separate", "Wait a month so everyone forgets", "Be skipped if you were right about the rule"], a: 1 },
        { q: "Connection before correction means:", choices: ["Dropping the rule if they get upset", "Warmth first, then a clear limit, and you stay nearby", "Never saying no", "Only connecting when behaviour is perfect"], a: 1 },
        { q: "A good one-minute reset beside a child is:", choices: ["A debate about who started it", "Water, a short walk, wall pushes, or a known song", "Sending them to their room with no plan to return", "Asking them to explain their feelings in detail at the peak"], a: 1 }
      ]
    },
    {
      id: "2",
      title: "Talking so kids listen",
      focus: "Communication and repair",
      blurb: "Get close, say the thing once, and fix the tone when you miss.",
      lessons: [
        {
          id: "2-1",
          title: "Get close before you talk",
          paras: [
            "Instructions shouted down a hallway get lost. Walk over. Use their name. If they like a hand on the shoulder, use it. If not, wait until they glance up. “I need your ears for a moment” and a short pause is enough. You do not need a perfect freeze.",
            "Match the length of the talk to the child in front of you. A young child can hold one short sentence. An older child can hold two. If you need more, say “two things” and count them on your fingers so they know when you are done.",
            "Getting close is also how you notice they were already midway through something. A ten-second warning — “after this block” — respects that, and you get more cooperation than a sudden order."
          ]
        },
        {
          id: "2-2",
          title: "Say the thing once, clearly",
          paras: [
            "“Shoes on, then we go to the car” is a plan. “How many times, we are late, nobody helps me, where are your shoes” is a storm. The child hears the mood and misses the job.",
            "Say the action, say when, then wait. Count slowly to ten in your head while you stay nearby. A lot of children need that gap to shift their body. If you repeat it four times, the first three become background noise.",
            "If they are stuck, help them start rather than restating the whole lecture. Put one shoe in their hand. Point at the toothbrush. Starting is often the hard part, not the knowing. Praise the start in a plain voice: “You got the first shoe. Next one.”"
          ]
        },
        {
          id: "2-3",
          title: "Repair after a sharp word",
          paras: [
            "You will speak in a way you wish you had not. Repair the same day if you can. Keep it short. “I spoke to you as if you were a problem. You are my child, not a problem. I was tired and I was unkind. I am sorry.”",
            "Then ask, “Do you want to tell me how that felt, or shall we leave it and try the talk again?” Let them answer. Do not argue with the answer. If they say “you were mean”, you can say “I was. I am working on a kinder voice.”",
            "If the original issue still matters — the hitting, the homework, the street safety — return to it later, in the calm, not inside the apology. An apology that smuggles the lecture back in does not feel like one."
          ]
        },
        {
          id: "2-4",
          title: "Listening when they finally talk",
          paras: [
            "When a child talks, the first job is to show you caught a piece of it. “You felt left out at lunch.” Then stop. The pause is where they add the real part. Advice in the first ten seconds usually closes the door.",
            "A question that helps an older child is, “Do you want me to listen, or help you think?” Younger children mostly need the listening and a cuddle or a snack. You can still hold a limit afterwards. “I hear that you hate this rule. The rule stays, and I am glad you told me.”",
            "Gossip about other children does not belong in this listening. If they start naming classmates in a mean way, bring it back to their feeling. “The story about who is awful can stop. I do want to hear that you felt left out.” You are teaching them that feelings can be told without putting another child on display."
          ]
        }
      ],
      worksheet: {
        title: "Repair and request card",
        intro: "Write the short versions you want in your mouth on a hard afternoon.",
        prompts: [
          "One instruction I repeat too many times",
          "The short version I will use instead",
          "My repair sentence",
          "A question I can ask before I jump in with a fix",
          "A time of day I will practise getting close before I speak"
        ]
      },
      quiz: [
        { q: "Kids are more likely to hear an instruction when you:", choices: ["Shout it from another room", "Get close, use their name, and wait for a little attention", "Repeat it five times, louder each time", "Write it only in a group chat"], a: 1 },
        { q: "A clear instruction sounds like:", choices: ["“Shoes on, then the car.”", "A history of every late morning this month", "“You always do this.”", "Three different jobs in one breath"], a: 0 },
        { q: "After a sharp word, repair means:", choices: ["Pretending it did not happen", "A short apology that owns your tone, without a “but”", "Making the child apologise first", "Buying something so they forget"], a: 1 },
        { q: "When a child finally talks, the first move is to:", choices: ["Correct the facts immediately", "Show you caught what they feel, then pause", "Phone another parent to compare", "Tell them other children have it worse"], a: 1 },
        { q: "A limit and kindness can:", choices: ["Never sit in the same sentence", "Both be true: you hear them, and the rule stays", "Only work if you raise your voice", "Only be used with teenagers"], a: 1 }
      ]
    },
    {
      id: "3",
      title: "Routines that work",
      focus: "Sleep, meals, screens, mornings",
      blurb: "Short, repeatable patterns the whole house can keep on an ordinary day.",
      lessons: [
        {
          id: "3-1",
          title: "Sleep the whole house can live with",
          paras: [
            "Pick a short order and keep it on most nights: wash, pyjamas, one story or one song, lights down, and a phrase you always say. The sameness is the soothing part. A long, different routine every night becomes another job nobody can finish.",
            "If they get up, walk them back with a boring, kind voice. “It is sleep time. I will walk you back.” One drink of water is reasonable. A second full conversation about the day is how midnight starts. You can say, “We will talk about that at breakfast. I am in the house.”",
            "You need a finish too. Choose a time you leave the room even if they are not asleep yet. If sleep is painful night after night, or you are worried about breathing or safety, talk with a GP. This lesson is a household pattern, not a medical plan."
          ]
        },
        {
          id: "3-2",
          title: "Meals without a battle",
          paras: [
            "You decide what is offered, where, and roughly when. They decide whether to eat and how much. Put one familiar food on the plate beside anything new, then stop discussing the plate. “This is dinner” is calmer than a speech about vegetables.",
            "You do not have to run a restaurant of separate negotiated meals every night. If they leave the food, the kitchen can close until the next meal or a simple snack you already named. No punishment lecture, and no prize for every bite. Just the next time food comes.",
            "Eat with them when you can, even for ten minutes, with phones off the table including yours. Children copy the person who sits down more than the person who hovers and comments."
          ]
        },
        {
          id: "3-3",
          title: "Screens with a finish line",
          paras: [
            "Agree the ending before the screen goes on. “Two episodes, then we feed the dog.” A timer they can see helps more than a sudden grab of the device. When it ends, move toward them and join the landing. Shouting “off!” from the kitchen starts the fight.",
            "Have the next thing ready: a snack, outside, a bath, a game on the floor. A lot of the tears are the drop from the screen into nothing. Five minutes of you on the floor changes the landing.",
            "This is a family agreement, not a secret watch on their device. Watch with them sometimes so the screen is not a separate country. Put your own phone in another room at meals and for the first ten minutes after school. The rule is easier to trust when it includes you."
          ]
        },
        {
          id: "3-4",
          title: "Mornings that start kinder",
          paras: [
            "Do the thinking at night. Clothes out, bags by the door, lunch box started. In the morning the jobs are small and already known. Give the first five minutes to a person, not a list: a hug, a silly sentence, a look at their face. Then one job. “Teeth, then breakfast.”",
            "If you open with five corrections, the morning is already lost. Build a little spare time so one lost shoe is annoying and not a crisis. If you are late, name the fact without attacking their character. “We are late. Shoes now. We can talk in the car.”",
            "On a hard morning, shorten the routine rather than scrap the idea of one. Teeth and a piece of toast still count. A kind morning is a short morning with the sharp words taken out."
          ]
        }
      ],
      worksheet: {
        title: "One week that fits",
        intro: "Plan a week you could actually repeat. Leave a line for the hard day, when you will do less on purpose.",
        prompts: [
          "Bedtime order, four steps at most",
          "What I will say when they get up again",
          "Dinner plan for three ordinary nights",
          "The screen finish line we will try",
          "What I will move to the night before",
          "The one part we will drop on a hard day"
        ]
      },
      quiz: [
        { q: "A workable bedtime is:", choices: ["A new long routine every night", "The same short order on most nights", "No warning and lights out mid-game", "A debate until they agree they are tired"], a: 1 },
        { q: "At meals, a calmer split is:", choices: ["You offer the food; they decide how much", "They must finish the plate to leave the table", "A different cooked meal for every person, argued at the table", "Comments on every bite"], a: 0 },
        { q: "Screens go better when:", choices: ["The ending is a surprise", "The finish is agreed before it starts, with something to land on", "You monitor them in secret and never talk about it", "Only the child has a limit and the adult phone stays at dinner"], a: 1 },
        { q: "Mornings ease when:", choices: ["Bags and clothes are sorted the night before", "Everyone is corrected before hello", "There is no spare minute at all", "The list is delivered as one long speech"], a: 0 },
        { q: "If a routine fails on a hard day, this course suggests you:", choices: ["Throw the whole pattern away", "Shorten it and keep one or two pieces", "Add extra steps so they learn", "Pretend the day did not happen"], a: 1 }
      ]
    },
    {
      id: "4",
      title: "Big feelings",
      focus: "Anxiety, anger, grief",
      blurb: "Stay with the feeling. You do not have to take it away to be a good parent.",
      lessons: [
        {
          id: "4-1",
          title: "Anxiety shows up in the body",
          paras: [
            "Worry often arrives as a tummy ache, a refusal at the gate, a hundred questions, or a child who will not leave your side. Start with the body, not a court case about whether the fear is reasonable. “Your tummy is tight. I believe you.”",
            "Shrink the next step until it is doable. Not “you must enjoy the party”. More like “we will walk to the door together and stay for five minutes, and I will be where I said.” Practise the hard bit when it is quiet: the school gate on a Sunday, the words for saying hello.",
            "Do not promise that nothing bad will ever happen. You cannot keep that promise. You can promise you will listen and do the next small step with them. If anxiety is stopping school, sleep or eating, a GP is a sensible person to talk to. You do not have to wait until it is enormous."
          ]
        },
        {
          id: "4-2",
          title: "Anger is information",
          paras: [
            "Anger is often the top layer. Under it can be hunger, shame, tiredness, unfairness, or a limit they hate. You can hold the line and still be curious. “You are furious that we are leaving. The leaving still happens. I want to understand the furious part.”",
            "If anyone is being hit, or things are being thrown toward people, safety comes first. “I will not let you hurt me, and I will not hurt you. I am moving the cup. I am staying.” A loud child needs a quieter adult, not a matching volume.",
            "Talk after the peak, when the body is softer. “What was the worst bit?” Keep any consequence small and connected to what happened. If they broke something, they help mend or tidy. A long speech after they have already crashed mostly restarts the shame."
          ]
        },
        {
          id: "4-3",
          title: "Grief in a family",
          paras: [
            "Children grieve in pieces. They can cry, ask for a snack, then play. That swing is ordinary. They may ask the same question many times. Answer it simply, again. Use clear words. “Died” is kinder than “gone to sleep”, which can make bedtime frightening.",
            "You do not need a perfect explanation. “I don’t know, and we can keep talking about them” is allowed. Keep one or two small routines the same: the same breakfast, the same story. Offer a way to remember that they can choose — a drawing, a photo in a box, a walk — and do not force a feeling. Sad, angry, silly and quiet can all belong in one week.",
            "If you are drowning in the grief as well, ask another adult to sit with your child for an hour so you can be a person and not only a parent. If you need someone on the phone, the Need help now page lists Australian lines, including Lifeline on 13 11 14."
          ]
        }
      ],
      worksheet: {
        title: "Feeling map",
        intro: "Write what you actually see in your house, so the next hard hour is less of a surprise.",
        prompts: [
          "What anxiety looks like in my child",
          "The smallest next step I can offer",
          "What anger looks like before it peaks",
          "My safety sentence if hitting starts",
          "A clear sentence I could use about a loss",
          "One routine I will protect in a hard week"
        ]
      },
      quiz: [
        { q: "A helpful first response to a worried tummy is:", choices: ["“You’re fine, stop it.”", "“Your tummy is tight. I believe you.”", "A list of reasons the fear is silly", "Sending them in alone to toughen up"], a: 1 },
        { q: "When anger is high and someone might get hurt, you:", choices: ["Match their shouting", "Keep people safe, stay, and talk after the peak", "Leave the house with no word", "Demand a full apology at the hottest moment"], a: 1 },
        { q: "Children’s grief often:", choices: ["Looks like one long cry and then it is finished", "Comes in pieces: questions, play, sadness, ordinary snacks", "Means you should avoid the word died", "Should be stopped so they stay cheerful"], a: 1 },
        { q: "You are a good parent in a big feeling when you:", choices: ["Remove the feeling immediately", "Stay with them, even if you cannot take the feeling away", "Tell them other kids do not act like this", "Hide your own sorrow at all costs"], a: 1 },
        { q: "If worry is stopping school, sleep or eating, this course suggests:", choices: ["Waiting a year to see", "Talking with a GP as well as doing the small steps", "Only using a sticker chart", "Keeping it a secret from every adult"], a: 1 }
      ]
    },
    {
      id: "5",
      title: "Parenting under pressure",
      focus: "Money stress, illness, burnout, asking for help",
      blurb: "Shrink the load, tell the truth in a size children can hold, and ask for a specific thing.",
      lessons: [
        {
          id: "5-1",
          title: "Money stress without handing it to them",
          paras: [
            "Children notice a tight voice and a pile of envelopes. They do not need the adult numbers. They need to know there is food, a bed, and that you are still the parent. “Money is tight this month. That is an adult worry. You are not in trouble. We will still have dinner.”",
            "Do not ask a child to carry a money secret, and do not make them the person you pour the whole debt out to. Talk the figures through with an adult: a trusted friend, a family member who can hear it, or a free financial counsellor. In Australia, a community centre or community legal centre can point you toward financial counselling. Take one bill to that conversation, not the whole pile at once.",
            "In front of the children, keep the week ordinary. Name what is for dinner and what is free: the park, the library, a walk. Shame grows in secrecy and in long frightened speeches. A plain sentence shrinks it."
          ]
        },
        {
          id: "5-2",
          title: "When someone is ill",
          paras: [
            "Illness shrinks a family to the next necessary thing. Let the standard drop on purpose. Meals can be simple. The house can be messy. Screens can run longer. Name it so children do not invent a worse story. “I am unwell. It is not because of anything you did. Today is rest and toast.”",
            "Tell school or carers the practical piece they need: who is doing pickup, what the child already knows, and what would help. You do not owe every person the full medical story.",
            "If you are caring for someone and parenting at the same time, write two lines for the children: who they go to if you are at an appointment, and what stays the same. A predictable pickup matters more than a perfect afternoon. Medical decisions belong with your doctor. This lesson is only about how the family talks and copes around the illness."
          ]
        },
        {
          id: "5-3",
          title: "Burnout is a signal",
          paras: [
            "Burnout feels like a short fuse, a flat voice, and a wish to be anywhere else. It is information about the load. It is not proof that you do not love your child. Parents who care a great deal often keep going until the kind part of them goes offline.",
            "Put one thing down this week, not everything. One extra activity, one housework standard, one yes you turn into a not-now. Protect one recovery that is real: a shower with the door shut, a walk around the block, an earlier night, twenty minutes when another adult has the children.",
            "If you are having thoughts of hurting yourself, or of not wanting to be here, that is a moment for a person and not a worksheet. Call Lifeline on 13 11 14, or 000 if you are in danger. Tell one adult near you. The Need help now page is there for this."
          ]
        },
        {
          id: "5-4",
          title: "Asking for help in one sentence",
          paras: [
            "Hope that someone will notice does not fill a week. Use a sentence with a job, a time, and an ending. “Could you do school pickup on Thursday and have them until five?” “Can you sit with Dad on Tuesday morning so I can sleep?” “Could you bring a plain meal on Friday so I do not have to cook?”",
            "Ask a person who has been reliable, not only the person you wish were reliable. Ask before you are sobbing if you can. A no is information, not a verdict on you. Ask the next person. Keep the list on the worksheet so you are not inventing it on the worst day.",
            "Receiving help is a skill. Say what you need, say thank you, and try not to apologise for the entire time they are doing it. You can return a favour later in a size that fits you."
          ]
        }
      ],
      worksheet: {
        title: "Pressure plan",
        intro: "Write this before the next hard week, in ordinary language a tired person can read.",
        prompts: [
          "Two sentences the children actually need to hear",
          "One bill or task I will deal with first",
          "What I will drop this week",
          "My one-sentence ask",
          "Three people I could ask, and the job that fits each",
          "The line I will call if I am at the end of my rope"
        ]
      },
      quiz: [
        { q: "Children need to hear which money message?", choices: ["Every dollar you owe, in detail", "That money worry is adult work, they are not in trouble, and dinner still happens", "That they must keep a secret from the other parent", "Nothing at all, even if the house is frightened"], a: 1 },
        { q: "During illness, a useful family move is to:", choices: ["Keep every normal standard to prove you are coping", "Drop the standard on purpose and explain the day in plain words", "Hide that anyone is sick", "Ask the child to manage the adults"], a: 1 },
        { q: "Burnout, in this course, is:", choices: ["Proof you are a bad parent", "A signal to reduce load and get a real break", "Something to push through with no change", "Fixed by a new chart on the wall alone"], a: 1 },
        { q: "A helpful request for support includes:", choices: ["“You know what I need.”", "A job, a time, and when it ends", "An apology in every sentence and no actual ask", "A demand that someone fix your whole life"], a: 1 },
        { q: "If you are in danger or thinking of hurting yourself, this course says:", choices: ["Finish the worksheet first", "Call 000 if you are in danger, or Lifeline on 13 11 14", "Keep it off the help page", "Wait until a module is complete"], a: 1 }
      ]
    },
    {
      id: "6",
      title: "Your rights and your voice",
      focus: "Schools, services, advocating, records",
      blurb: "Walk into meetings with one aim, plain questions, and notes you can read back.",
      lessons: [
        {
          id: "6-1",
          title: "Walking into a school meeting",
          paras: [
            "Before you go, write one sentence: what you want to be different for your child. “I want a plan for the noisy classroom so he can stay in class.” Take that sentence with you. Take a support person if you want one, and tell the school. “I am bringing my sister.” Another adult in your corner is reasonable.",
            "At the start, ask how long you have and who is in the room. Write the names down. Then say your sentence. You do not have to tell your whole life for the meeting to count. If you get upset, “I need a minute” and a drink of water are allowed. So is staying while you cry.",
            "You know your child in a way the school does not. They know their system. A useful meeting is where those two kinds of knowledge sit on the same table. You are allowed to take up space there."
          ]
        },
        {
          id: "6-2",
          title: "Questions that keep you in the room",
          paras: [
            "Practical questions do more than a speech. “What have you already tried?” “What does my child say is happening?” “What is the next step, who is doing it, and by when?” “Which policy are you using, and can I have a copy?” “How will we know if this helped?”",
            "Write the answers in the room, then read them back. “I am writing that support starts Monday and that you will email me by Friday. Is that right?” If you disagree, one line is enough. “I see it differently. I want that noted.” You can be firm without insulting anyone. An insult makes the meeting about the insult.",
            "This course is not legal advice. If the matter is serious, a community legal centre or an advocacy service in your state can look at papers with you. If a child is in immediate danger, stop the meeting question and call 000."
          ]
        },
        {
          id: "6-3",
          title: "A simple record",
          paras: [
            "A notebook is enough. Each entry: the date, who was there, what you asked, what they said, what was agreed, and the next date. Keep emails in one folder. After a phone call, send a short note. “Thanks for today. My understanding is that we agreed on this. Please correct me if I have it wrong.” That gives everyone the same memory.",
            "Ask for copies of plans and letters about your child. You are gathering a clear story so you can advocate, not building a file of nicknames and gossip. Stick to what was said and done. Leave out other children. Your notes should be as careful as the day-feed rules in this app: do not name other people’s children.",
            "Share the notes with people who are part of helping your child, not with a wide group chat. A record helps you on a tired day. It is not a weapon to wave at the school gate."
          ]
        },
        {
          id: "6-4",
          title: "A voice that can come back tomorrow",
          paras: [
            "Advocacy is often a long conversation. The person across the table may be someone you need again. You can be clear and still leave the bridge standing. “I am unhappy with how this term has gone. I want to keep working with you. Here is the one change I am asking for.”",
            "If you are not being heard, ask who else you can speak with. A year coordinator, a principal, a contact the school can name. Go up one step with your notes and the same one-sentence aim. Do not threaten things you will not do. Ask for agreements in writing.",
            "You do not have to perform calm you do not feel. You do have to be specific. One change, a date, and a way to check whether it happened: that is a voice a service can answer."
          ]
        }
      ],
      worksheet: {
        title: "Meeting notes",
        intro: "Use one page per meeting. Print a blank copy before you go.",
        prompts: [
          "My one-sentence aim",
          "Who I will take with me",
          "Three questions I will ask",
          "Date, names in the room, and what was agreed",
          "A follow-up note I can send the same day",
          "Who I contact if I am not heard"
        ]
      },
      quiz: [
        { q: "A useful aim for a school meeting is:", choices: ["Your entire family history", "One sentence about what you want to be different", "A list of staff nicknames", "No aim, so you can see what happens"], a: 1 },
        { q: "Which question belongs in the room?", choices: ["“What is the next step, who does it, and by when?”", "“Don’t you care at all?”", "“What is wrong with your other students?”", "“Will you promise nothing hard will ever happen?”"], a: 0 },
        { q: "A simple record includes:", choices: ["Gossip about other children", "Date, who was there, what was said, what was agreed, and the next date", "A secret recording made without telling anyone", "Only your feelings, with no facts"], a: 1 },
        { q: "This course describes advocating as:", choices: ["Burning the relationship on the first day", "Being specific, keeping notes, and leaving a bridge where you can", "Letting the service decide everything without you", "A substitute for calling 000 when a child is in danger"], a: 1 },
        { q: "If a child is in immediate danger, you:", choices: ["Wait to write perfect notes", "Call 000", "Post about it on the day feed", "Finish the quiz first"], a: 1 }
      ]
    },
    {
      id: "7",
      title: "Building your village",
      focus: "Support people, respite, community",
      blurb: "A village can be two reliable people. Ask for a real hour, and offer a real hour.",
      lessons: [
        {
          id: "7-1",
          title: "Name the people you already have",
          paras: [
            "A village is not a hundred friends. It is the short list of people who pick up. Write the names. A grandparent, a neighbour, another parent at the gate, a friend, someone from your community, a support worker you trust. Next to each name, write the help that actually fits them. One person listens well. One can do pickup. One would be glad to have your child for an hour and is waiting to be asked.",
            "If the list is almost empty, that is a fact to work with, not a mark against you. The rest of this module is about adding one person and one place, not about becoming popular.",
            "Tell those people what you are trying to do in ordinary words. “I am building a small list of adults the kids know, so I am not doing every hard hour alone.” Most people understand that sentence."
          ]
        },
        {
          id: "7-2",
          title: "Respite without the guilt speech",
          paras: [
            "Time away from your child can make you a safer parent. An hour to sleep, to sit quietly, or to see a friend is part of caring for the family. Tell the child the plain version. “You are at Aunty’s this afternoon. I am having a rest. I will be back before tea.” Then come back when you said.",
            "Choose a person the child knows when you can. Leave practical notes: food, fears, the bedtime phrase, your phone number. You do not have to leave a perfect house. If the only break available is twenty minutes in another room with the door shut, take it.",
            "If you never get a break and you are fraying, say that out loud to a GP or call Parentline NSW on 1300 1300 52. Asking what respite exists near you is a reasonable sentence. Needing a rest is not a failure."
          ]
        },
        {
          id: "7-3",
          title: "Community that fits your family",
          paras: [
            "One regular place is better than five that exhaust you. A library story time, a park on Saturdays, a sports club, a playgroup, a cultural group, a faith community, a community garden. Pick the one your child can tolerate and you can get to. Going often enough to recognise a face is how a place becomes part of a village.",
            "You can leave early. You can sit on the edge. You do not have to explain your whole family. “We are new. We are going to try Thursdays” is enough.",
            "Skip the activity that looks good and wrecks the evening. A village you can actually attend will do more than a perfect program you cancel."
          ]
        },
        {
          id: "7-4",
          title: "Be a small village for someone else",
          paras: [
            "The offer that helps is specific. “I walk past your street at three. I can bring them home with us on Wednesdays.” “I made extra soup. I will leave it on the step.” “I can listen for fifteen minutes tonight, and I will not try to fix it.”",
            "Do not offer what you cannot carry. A reliable small offer builds more trust than a grand one you cancel. When someone helps you, tell them the true effect. “That hour meant I slept. Thank you.” People stay when they can see they mattered.",
            "If you are starting from none of this, use the Need help now page if you are in crisis, and pick one local place to try this month. One call. One visit. That is the whole assignment. Natter about the ordinary day is welcome in How was your day? — about your day, without naming other people or children."
          ]
        }
      ],
      worksheet: {
        title: "Village map",
        intro: "Names, jobs, and one offer. Small enough to do this month.",
        prompts: [
          "People already in our corner, and the help that fits each",
          "The respite I will actually ask for this month",
          "What I will tell my child about that break",
          "One community place we will try twice",
          "A specific offer I can make to another parent",
          "The number I will use if I am alone with this"
        ]
      },
      quiz: [
        { q: "A village, in this course, can be:", choices: ["Only a large friendship group", "Two reliable people who pick up", "Something you must not need", "A public list of other people’s children"], a: 1 },
        { q: "Respite is:", choices: ["Proof you have failed", "Part of caring, with a clear return time", "Only allowed if the house is perfect first", "Something to hide from your child"], a: 1 },
        { q: "The better community plan is:", choices: ["Five activities that wipe the week out", "One place you can get to often enough to see a familiar face", "Never leaving the house", "Joining everything so you look busy"], a: 1 },
        { q: "A useful offer to another parent is:", choices: ["“Shout if you need anything.”", "A specific job, time, and size you can keep", "Taking over their whole life", "Advice they did not ask for"], a: 1 },
        { q: "If you are fraying and have no break, a next step named here is:", choices: ["Keep it to yourself", "Tell a GP, or call Parentline NSW on 1300 1300 52", "Wait until the certificate is printed", "Post another child’s name on the day feed"], a: 1 }
      ]
    }
  ];

  var PROMPTS = [
    "The morning was messy and we still got out the door.",
    "I repaired a sharp word today.",
    "I asked someone for a specific kind of help.",
    "A small good thing happened and I want to remember it."
  ];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var data = JSON.parse(raw);
      return data && typeof data === "object" ? data : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); return true; }
    catch (e) { return false; }
  }

  var progress = load(PROGRESS_KEY, { certificateName: "", lessons: {}, quizzes: {}, notes: {}, completedAt: "" });
  var feed = load(FEED_KEY, { nick: "", posts: [], showHidden: false });
  if (!progress.lessons) progress.lessons = {};
  if (!progress.quizzes) progress.quizzes = {};
  if (!progress.notes) progress.notes = {};
  if (!feed.posts) feed.posts = [];

  function moduleById(id) {
    for (var i = 0; i < COURSE.length; i++) if (COURSE[i].id === id) return COURSE[i];
    return null;
  }

  function lessonCount() {
    var n = 0, done = 0;
    COURSE.forEach(function (m) {
      m.lessons.forEach(function (l) {
        n++;
        if (progress.lessons[l.id]) done++;
      });
    });
    return { n: n, done: done };
  }

  function quizzesPassed() {
    return COURSE.filter(function (m) {
      return progress.quizzes[m.id] && progress.quizzes[m.id].passed;
    }).length;
  }

  function courseComplete() {
    var L = lessonCount();
    return L.done === L.n && quizzesPassed() === COURSE.length;
  }

  function stampComplete() {
    if (courseComplete() && !progress.completedAt) {
      progress.completedAt = new Date().toISOString();
      save(PROGRESS_KEY, progress);
    }
  }

  function rid(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function when(ts) {
    try {
      return new Date(ts).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  }

  function route() {
    var h = (location.hash || "#/").replace(/^#/, "");
    if (h.charAt(0) !== "/") h = "/" + h;
    var p = h.split("/").filter(Boolean);
    var app = document.getElementById("app");
    var html = "";
    if (!p.length) html = viewHome();
    else if (p[0] === "m" && p[1] && !p[2]) html = viewModule(p[1]);
    else if (p[0] === "m" && p[2] === "l") html = viewLesson(p[1], p[3]);
    else if (p[0] === "m" && p[2] === "w") html = viewSheet(p[1]);
    else if (p[0] === "m" && p[2] === "q") html = viewQuiz(p[1]);
    else if (p[0] === "certificate") html = viewCert();
    else if (p[0] === "day") html = viewDay();
    else if (p[0] === "help") html = viewHelp();
    else html = viewHome();
    app.innerHTML = html;
    app.focus();
    var cur = p[0] === "day" ? "day" : p[0] === "certificate" ? "certificate" : p[0] === "help" ? "help" : "course";
    document.querySelectorAll(".tabs a").forEach(function (a) {
      var on = (a.getAttribute("href") === "#/" && cur === "course") ||
        (a.getAttribute("href") === "#/day" && cur === "day") ||
        (a.getAttribute("href") === "#/certificate" && cur === "certificate") ||
        (a.getAttribute("href") === "#/help" && cur === "help");
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function viewHome() {
    var L = lessonCount();
    var pct = L.n ? Math.round(100 * L.done / L.n) : 0;
    var mods = COURSE.map(function (m) {
      var read = m.lessons.filter(function (l) { return progress.lessons[l.id]; }).length;
      var q = progress.quizzes[m.id];
      var bits = read + " of " + m.lessons.length + " lessons";
      if (q && q.passed) bits += " · quiz passed";
      else if (q) bits += " · quiz " + q.score + "/" + q.total;
      return '<a class="mod" href="#/m/' + m.id + '"><strong>' + m.id + '. ' + esc(m.title) + '</strong><span class="soft">' + esc(m.focus) + ' · ' + bits + '</span></a>';
    }).join("");
    return '<section class="card"><h2>A course for strengthening your family</h2>' +
      '<p>Seven short modules. Each one has a few practical lessons, a worksheet you can print, and a five-question quiz. There is no judgement here and nothing to buy. The point is a calmer house, clearer talk, and more people in your corner.</p>' +
      '<p class="soft">This is general support from Karen O\'Brien, written for parents and carers. It is not therapy, a diagnosis, legal advice, or a reporting tool. If someone is unsafe, open Need help now.</p>' +
      '<div class="meter" aria-hidden="true"><span style="width:' + pct + '%"></span></div>' +
      '<p class="ui">' + L.done + ' of ' + L.n + ' lessons marked read · ' + quizzesPassed() + ' of ' + COURSE.length + ' quizzes passed. Your progress stays in this browser.</p>' +
      (courseComplete() ? '<p class="ok">You have finished the course. <a href="#/certificate">Open your certificate</a>.</p>' : '<p class="ui"><a href="#/certificate">Certificate</a> unlocks when every lesson is read and every quiz is passed (4 out of 5 or better).</p>') +
      '</section><div class="mods">' + mods + '</div>';
  }

  function viewModule(id) {
    var m = moduleById(id);
    if (!m) return missing();
    var lessons = m.lessons.map(function (l) {
      var mark = progress.lessons[l.id] ? "Read" : "Not yet";
      return '<li><a href="#/m/' + m.id + '/l/' + esc(l.id) + '">' + esc(l.title) + '</a> <span class="soft">· ' + mark + '</span></li>';
    }).join("");
    var q = progress.quizzes[m.id];
    var qline = q ? (q.passed ? "Passed " + q.score + "/" + q.total : "Last try " + q.score + "/" + q.total + ". You need 4 out of 5.") : "Not tried yet. You need 4 out of 5 to pass.";
    return '<p class="ui"><a href="#/">All modules</a></p><article class="card"><h2>' + esc(m.title) + '</h2><p class="soft">' + esc(m.focus) + '</p><p>' + esc(m.blurb) + '</p>' +
      '<h3>Lessons</h3><ol>' + lessons + '</ol>' +
      '<p class="row"><a class="btn quiet" href="#/m/' + m.id + '/w">Worksheet</a> <a class="btn" href="#/m/' + m.id + '/q">Quiz</a></p>' +
      '<p class="ui">' + esc(qline) + '</p></article>';
  }

  function viewLesson(mid, lid) {
    var m = moduleById(mid);
    if (!m) return missing();
    var idx = -1;
    for (var i = 0; i < m.lessons.length; i++) if (m.lessons[i].id === lid) idx = i;
    if (idx < 0) return missing();
    var l = m.lessons[idx];
    var body = l.paras.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    var done = !!progress.lessons[l.id];
    var prev = idx > 0 ? '<a class="btn quiet" href="#/m/' + m.id + '/l/' + m.lessons[idx - 1].id + '">Previous</a>' : "";
    var next = idx < m.lessons.length - 1
      ? '<a class="btn" href="#/m/' + m.id + '/l/' + m.lessons[idx + 1].id + '">Next lesson</a>'
      : '<a class="btn" href="#/m/' + m.id + '/w">Worksheet</a>';
    return '<p class="ui"><a href="#/m/' + m.id + '">' + esc(m.title) + '</a></p><article class="lesson"><h2>' + esc(l.title) + '</h2>' + body +
      '<p class="row"><button type="button" class="btn good" data-act="done-lesson" data-id="' + esc(l.id) + '">' + (done ? "Read again — still marked" : "Mark as read") + '</button> ' + prev + " " + next + '</p></article>';
  }

  function viewSheet(id) {
    var m = moduleById(id);
    if (!m) return missing();
    var notes = progress.notes[m.id] || "";
    var prompts = m.worksheet.prompts.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    return '<p class="ui"><a href="#/m/' + m.id + '">' + esc(m.title) + '</a></p>' +
      '<article class="sheet" id="print-sheet"><h2>' + esc(m.worksheet.title) + '</h2><p>' + esc(m.worksheet.intro) + '</p><ol class="prompts">' + prompts + '</ol>' +
      '<div class="note"><strong>Your notes</strong><p style="white-space:pre-wrap">' + (notes ? esc(notes) : "<span class=\"soft\">Nothing written yet.</span>") + "</p></div>" +
      '<p class="soft">Coffeebreak Parenting by Karen O\'Brien · free course · for your family, not for filing about anyone else.</p></article>' +
      '<label class="no-print">Write or edit your notes<textarea id="sheet-notes" maxlength="4000">' + esc(notes) + '</textarea></label>' +
      '<p class="row no-print"><button type="button" class="btn" data-act="save-note" data-id="' + m.id + '">Save notes on this device</button> <button type="button" class="btn quiet" data-act="print" data-target="print-sheet">Print worksheet</button> <a class="btn quiet" href="#/m/' + m.id + '/q">Go to the quiz</a></p>';
  }

  function viewQuiz(id) {
    var m = moduleById(id);
    if (!m) return missing();
    var prev = progress.quizzes[m.id];
    var items = m.quiz.map(function (item, i) {
      var choices = item.choices.map(function (c, n) {
        return '<li><label><input type="radio" name="q' + i + '" value="' + n + '"> ' + esc(c) + "</label></li>";
      }).join("");
      return '<fieldset><legend>' + (i + 1) + ". " + esc(item.q) + '</legend><ul class="choices">' + choices + "</ul></fieldset>";
    }).join("");
    var last = prev ? '<p class="ui">Last score: ' + prev.score + "/" + prev.total + (prev.passed ? " · passed" : " · not yet passed") + ".</p>" : "";
    return '<p class="ui"><a href="#/m/' + m.id + '">' + esc(m.title) + '</a></p><article class="card"><h2>Quiz · ' + esc(m.title) + '</h2>' +
      '<p>Five questions. Pass with 4 or more. You can try again. The point is to keep the idea, not to catch you out.</p>' + last +
      '<form id="quiz-form" data-module="' + m.id + '">' + items +
      '<p id="quiz-msg" class="ui" role="status"></p><button class="btn" type="submit">Check answers</button></form></article>';
  }

  function viewCert() {
    stampComplete();
    var ready = courseComplete();
    var name = progress.certificateName || "";
    var date = progress.completedAt ? new Date(progress.completedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "";
    var list = COURSE.map(function (m) { return "<li>" + esc(m.title) + "</li>"; }).join("");
    var cert = '<article class="cert" id="print-cert"><img src="../cb-logo.png" alt="Coffeebreak cup logo" width="72" height="72"><p class="ui">Coffeebreak</p><h2>Parenting</h2><p>This certificate says that</p><p><strong id="cert-name">' + (name ? esc(name) : "________________") + '</strong></p>' +
      '<p>has worked through Coffeebreak Parenting by Karen O\'Brien: calm and connection, talking so kids listen, routines, big feelings, parenting under pressure, your rights and your voice, and building a village.</p>' +
      '<ul style="text-align:left;display:inline-block">' + list + "</ul>" +
      (date ? "<p>Completed " + esc(date) + "</p>" : "") +
      '<p class="soft">A personal learning record. Not a professional qualification, licence, or clinical certificate.</p></article>';
    return '<section class="card no-print"><h2>Completion certificate</h2>' +
      (ready ? '<p class="ok">Every lesson is read and every quiz is passed. Type the name you want printed. It stays on this device.</p>' : '<p>Finish every lesson and pass every quiz (4 out of 5) to unlock printing. You can type the name now so it is ready.</p>') +
      '<label>Name on the certificate<input id="cert-input" type="text" maxlength="80" autocomplete="name" value="' + esc(name) + '"></label>' +
      '<p class="row"><button type="button" class="btn" data-act="save-cert-name">Save name</button> <button type="button" class="btn quiet" data-act="print" data-target="print-cert"' + (ready ? "" : " disabled") + ">Print certificate</button></p></section>" + cert;
  }

  function viewHelp() {
    return '<article class="help-card"><h2>Need help now?</h2>' +
      '<p>If you or a child are in danger, call emergency services first. These are Australian lines. If you are outside Australia, use the emergency number where you are.</p>' +
      '<ul class="help-list">' +
      '<li><a href="tel:000">000</a><br>Emergency. Police, ambulance or fire. Call if someone is in danger.</li>' +
      '<li><a href="tel:131114">Lifeline 13 11 14</a><br>24-hour crisis support and suicide prevention.</li>' +
      '<li><a href="tel:1800551800">Kids Helpline 1800 55 1800</a><br>For children and young people, any time.</li>' +
      '<li><a href="tel:1300130052">Parentline NSW 1300 1300 52</a><br>Counselling and support for parents and carers in New South Wales.</li>' +
      "</ul>" +
      '<p class="soft">Coffeebreak Parenting is a free course. It is not a crisis service, and it does not watch your family. Nothing you type in the lessons is sent to Coffeebreak.</p></article>';
  }

  function viewDay() {
    var posts = feed.posts.filter(function (p) { return feed.showHidden || !p.hidden; });
    var hiddenN = feed.posts.filter(function (p) { return p.hidden; }).length;
    var list = posts.map(renderPost).join("");
    if (!posts.length) list = '<p class="card">No posts on this device yet. When you write one, it stays in this browser.</p>';
    var chips = PROMPTS.map(function (t) {
      return '<button type="button" class="btn quiet" data-act="prompt" data-text="' + esc(t) + '">' + esc(t) + "</button>";
    }).join(" ");
    return '<section class="rules"><h2>How was your day?</h2>' +
      '<p><strong>On this device for now.</strong> This is a friendly natter saved in this browser only. It is not a shared feed. Other parents cannot see it, and Coffeebreak does not receive it.</p>' +
      "<ul><li>Use a first name or a nickname only.</li><li>Do not name other people or children.</li><li>Be kind. Warm chat about your own day is welcome. Pile-ons and insults are not.</li></ul>" +
      "<p>Report and Hide work on this device. A report is not sent anywhere, because nothing here is shared. Hide puts a post or comment out of the way until you choose to show hidden ones.</p></section>" +
      '<form id="day-form" class="card"><label>First name or nickname<input id="day-nick" type="text" maxlength="24" autocomplete="nickname" value="' + esc(feed.nick || "") + '"></label>' +
      '<label>Your day<textarea id="day-text" maxlength="500" placeholder="The funny bit, the messy bit, the small win"></textarea></label>' +
      '<label class="check"><input id="day-ok" type="checkbox"> I am using a first name or nickname, and I have not named other people or children.</label>' +
      '<p class="row">' + chips + "</p>" +
      '<p id="day-msg" class="ui" role="status"></p><button class="btn" type="submit">Post on this device</button></form>' +
      '<p class="row ui"><button type="button" class="btn quiet" data-act="toggle-hidden">' + (feed.showHidden ? "Hide the hidden ones" : "Show hidden") + "</button>" +
      (hiddenN ? '<span class="soft">' + hiddenN + " hidden on this device</span>" : "") + "</p>" + list;
  }

  function renderPost(p) {
    var reacts = ["heard", "same", "tea"].map(function (key) {
      var label = key === "heard" ? "Heard you" : key === "same" ? "Same here" : "Cup of tea";
      var on = p.react && p.react[key];
      return '<button type="button" class="btn quiet react" data-act="react" data-id="' + esc(p.id) + '" data-key="' + key + '" aria-pressed="' + (on ? "true" : "false") + '">' + label + (on ? " · yes" : "") + "</button>";
    }).join(" ");
    var comments = (p.comments || []).filter(function (c) { return feed.showHidden || !c.hidden; }).map(function (c) {
      return '<div class="comment"><p class="meta">' + esc(c.name) + " · " + esc(when(c.at)) + (c.reported ? " · reported on this device" : "") + "</p><p>" + esc(c.text) + "</p>" +
        '<p class="row"><button type="button" class="btn warn" data-act="report-comment" data-post="' + esc(p.id) + '" data-id="' + esc(c.id) + '">Report</button>' +
        '<button type="button" class="btn quiet" data-act="hide-comment" data-post="' + esc(p.id) + '" data-id="' + esc(c.id) + '">' + (c.hidden ? "Hidden" : "Hide") + "</button>" +
        (c.hidden ? '<button type="button" class="btn quiet" data-act="unhide-comment" data-post="' + esc(p.id) + '" data-id="' + esc(c.id) + '">Unhide</button>' : "") +
        "</p></div>";
    }).join("");
    return '<article class="post"><p class="meta">' + esc(p.name) + " · " + esc(when(p.at)) + (p.reported ? " · reported on this device" : "") + (p.hidden ? " · hidden" : "") + "</p>" +
      "<p>" + esc(p.text) + "</p><p class=\"row\">" + reacts +
      '<button type="button" class="btn warn" data-act="report-post" data-id="' + esc(p.id) + '">Report</button>' +
      '<button type="button" class="btn quiet" data-act="hide-post" data-id="' + esc(p.id) + '">' + (p.hidden ? "Hidden" : "Hide") + "</button>" +
      (p.hidden ? '<button type="button" class="btn quiet" data-act="unhide-post" data-id="' + esc(p.id) + '">Unhide</button>' : "") +
      '</p><form class="comment-form" data-post="' + esc(p.id) + '"><label>Comment as<textarea maxlength="280" name="text" placeholder="A kind reply"></textarea></label>' +
      '<button class="btn quiet" type="submit">Comment on this device</button></form>' + comments + "</article>";
  }

  function missing() {
    return '<p class="card">That page is not in the course. <a href="#/">Back to the start</a>.</p>';
  }

  function findPost(id) {
    for (var i = 0; i < feed.posts.length; i++) if (feed.posts[i].id === id) return feed.posts[i];
    return null;
  }

  function toast(msg) {
    var el = document.getElementById("day-msg") || document.getElementById("quiz-msg");
    if (el) el.textContent = msg;
  }

  document.body.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act]");
    if (!t) return;
    var act = t.getAttribute("data-act");
    if (act === "done-lesson") {
      progress.lessons[t.getAttribute("data-id")] = true;
      save(PROGRESS_KEY, progress);
      stampComplete();
      route();
    } else if (act === "save-note") {
      var box = document.getElementById("sheet-notes");
      progress.notes[t.getAttribute("data-id")] = box ? box.value.slice(0, 4000) : "";
      save(PROGRESS_KEY, progress);
      route();
    } else if (act === "save-cert-name") {
      var input = document.getElementById("cert-input");
      progress.certificateName = input ? input.value.trim().slice(0, 80) : "";
      save(PROGRESS_KEY, progress);
      route();
    } else if (act === "print") {
      if (t.disabled) return;
      var target = document.getElementById(t.getAttribute("data-target"));
      if (!target) return;
      target.classList.add("print-target");
      document.body.classList.add("print-mode");
      window.print();
    } else if (act === "prompt") {
      var area = document.getElementById("day-text");
      if (area) area.value = t.getAttribute("data-text") || "";
    } else if (act === "toggle-hidden") {
      feed.showHidden = !feed.showHidden;
      save(FEED_KEY, feed);
      route();
    } else if (act === "react") {
      var post = findPost(t.getAttribute("data-id"));
      if (!post) return;
      post.react = post.react || {};
      var key = t.getAttribute("data-key");
      post.react[key] = !post.react[key];
      save(FEED_KEY, feed);
      route();
    } else if (act === "hide-post" || act === "unhide-post" || act === "report-post") {
      var post2 = findPost(t.getAttribute("data-id"));
      if (!post2) return;
      if (act === "report-post") {
        post2.reported = true;
        post2.hidden = true;
      } else post2.hidden = act === "hide-post";
      save(FEED_KEY, feed);
      route();
    } else if (act === "hide-comment" || act === "unhide-comment" || act === "report-comment") {
      var post3 = findPost(t.getAttribute("data-post"));
      if (!post3) return;
      var comments = post3.comments || [];
      for (var i = 0; i < comments.length; i++) {
        if (comments[i].id === t.getAttribute("data-id")) {
          if (act === "report-comment") { comments[i].reported = true; comments[i].hidden = true; }
          else comments[i].hidden = act === "hide-comment";
        }
      }
      save(FEED_KEY, feed);
      route();
    }
  });

  window.addEventListener("afterprint", function () {
    document.body.classList.remove("print-mode");
    document.querySelectorAll(".print-target").forEach(function (el) { el.classList.remove("print-target"); });
  });

  document.body.addEventListener("submit", function (e) {
    var form = e.target;
    if (form.id === "quiz-form") {
      e.preventDefault();
      var m = moduleById(form.getAttribute("data-module"));
      if (!m) return;
      var score = 0;
      var unanswered = false;
      var misses = [];
      m.quiz.forEach(function (item, i) {
        var picked = form.querySelector('input[name="q' + i + '"]:checked');
        if (!picked) unanswered = true;
        else if (+picked.value === item.a) score++;
        else misses.push(item.choices[item.a]);
      });
      var msg = document.getElementById("quiz-msg");
      if (unanswered) {
        if (msg) msg.textContent = "Answer all five, then check.";
        return;
      }
      var passed = score >= 4;
      var prev = progress.quizzes[m.id];
      if (passed) {
        progress.quizzes[m.id] = { score: prev && prev.score > score ? prev.score : score, total: 5, passed: true, at: Date.now() };
      } else if (!(prev && prev.passed)) {
        progress.quizzes[m.id] = { score: score, total: 5, passed: false, at: Date.now() };
      }
      save(PROGRESS_KEY, progress);
      stampComplete();
      if (msg) {
        msg.textContent = passed
          ? "You passed with " + score + " out of 5. The idea is yours to keep."
          : "You scored " + score + " out of 5. Four is a pass. A steadier answer: " + misses.join(" ");
      }
      if (passed) route();
    } else if (form.id === "day-form") {
      e.preventDefault();
      var nick = document.getElementById("day-nick").value.trim().slice(0, 24);
      var text = document.getElementById("day-text").value.trim().slice(0, 500);
      var ok = document.getElementById("day-ok").checked;
      var msg2 = document.getElementById("day-msg");
      if (!nick || !text) { if (msg2) msg2.textContent = "Add a first name or nickname, and a few words about your day."; return; }
      if (!ok) { if (msg2) msg2.textContent = "Tick the box to confirm: nickname only, and no other people or children named."; return; }
      feed.nick = nick;
      feed.posts.unshift({ id: rid("p"), name: nick, text: text, at: Date.now(), react: {}, comments: [], hidden: false, reported: false });
      if (feed.posts.length > 100) feed.posts.length = 100;
      save(FEED_KEY, feed);
      route();
    } else if (form.classList.contains("comment-form")) {
      e.preventDefault();
      var post = findPost(form.getAttribute("data-post"));
      var field = form.querySelector("textarea");
      var text2 = field ? field.value.trim().slice(0, 280) : "";
      if (!post || !text2) return;
      var name = (feed.nick || "Me").slice(0, 24);
      post.comments = post.comments || [];
      post.comments.push({ id: rid("c"), name: name, text: text2, at: Date.now(), hidden: false, reported: false });
      save(FEED_KEY, feed);
      route();
    }
  });

  window.addEventListener("hashchange", route);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", route);
  else route();
})();
