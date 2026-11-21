/* 新托福练习题库。
 * 每套题由若干 section 组成，type 决定题型：
 *   vocab      词汇卡（不计分）
 *   cw         Complete the Words，{{前半|后半}} 表示后半需要补全，可用 / 写多个可接受答案
 *   read       阅读（daily = 日常阅读，academic = 学术短文）
 *   lcr        Listen and Choose a Response
 *   listen     对话 / 广播 / 学术讲座，lines 为朗读内容
 *   bas        Build a Sentence，chunks 按正确顺序书写，页面会自动打乱
 *   email / discussion   写作
 *   repeat     Listen and Repeat
 *   interview  Take an Interview
 * 选择题 answer 为正确选项的下标（从 0 开始）。
 */
window.TOEFL_SETS = {
  placement: {
    id: "placement",
    title: "摸底测试",
    minutes: 30,
    sections: [
      { type: "cw", title: "补全单词", text: "Many animals migrate long distances each year. Birds, for {{exa|mple}}, can {{tra|vel}} thousands of {{kilom|eters/etres}} to find {{fo|od}} and warm {{wea|ther}}. Scientists {{bel|ieve}} that they use the sun, the stars, and even the Earth's {{mag|netic}} field to find {{th|eir}} way. Some {{spe|cies}} return to the {{exa|ct}} same nest every year." },
      { type: "read", kind: "daily", title: "日常阅读", passage: "Library Notice\n\nStarting Monday, March 3, the Main Library will close at 8 p.m. instead of 11 p.m. due to renovation work on the second floor. Group study rooms on the second floor will be unavailable until April 15. Students who need late-night study space may use the Science Building lounge, which is open 24 hours with a valid student ID.", questions: [
        { q: "Why is the library changing its hours?", options: ["A staff shortage", "Renovation work", "Exam season", "Budget cuts"], answer: 1 },
        { q: "What can a student do at 10 p.m. on March 5?", options: ["Book a group study room", "Study in the Main Library", "Study in the Science Building lounge with a student ID", "Return books on the second floor"], answer: 2 }
      ] },
      { type: "read", kind: "academic", title: "学术短文", passage: "For centuries, people believed that plants simply competed with one another for sunlight and nutrients. Recent research, however, suggests that many trees are connected underground by networks of fungi. These fungi attach to tree roots and exchange nutrients with them: the fungi receive sugars that trees produce through photosynthesis, and in return they supply the trees with water and minerals from the soil. Some scientists argue that these networks also allow trees to transfer resources to one another, so that a large, healthy tree may help support younger trees growing in its shade. Others remain cautious, noting that most of the evidence comes from small, controlled studies and may not reflect what happens in natural forests.", questions: [
        { q: "What is the main idea of the passage?", options: ["Fungi harm trees", "Trees may be linked by fungal networks, but how much they share is debated", "How photosynthesis works", "Young trees grow faster in shade"], answer: 1 },
        { q: "What do the fungi give the trees?", options: ["Sugars", "Sunlight", "Water and minerals", "Shade"], answer: 2 },
        { q: "Why are some scientists cautious?", options: ["The fungi are rare", "Most evidence comes from small, controlled studies", "Trees cannot photosynthesize", "The networks are too large to study"], answer: 1 }
      ] },
      { type: "lcr", title: "听句选回应", items: [
        { audio: "Do you know if the bookstore is still open?", options: ["Yes, I bought two books.", "I think it closes at six.", "The store is on Main Street.", "No, I don't like reading."], answer: 1 },
        { audio: "Would you mind if I borrowed your notes from Monday's lecture?", options: ["Not at all. I'll bring them tomorrow.", "Yes, the lecture was on Monday.", "I didn't mind the lecture.", "My notes are very long."], answer: 0 },
        { audio: "I can't believe the deadline got moved up again.", options: ["Yes, it's on the second floor.", "I know. Now we only have three days.", "I moved last year.", "The deadline is a long word."], answer: 1 },
        { audio: "Why don't we grab lunch after the seminar?", options: ["Because I was hungry.", "The seminar was about history.", "Sounds good. How about the café downstairs?", "I didn't grab it."], answer: 2 }
      ] },
      { type: "listen", kind: "conversation", title: "听对话", lines: [
        { who: "Student", v: 0, text: "Hi, Professor Lin. I wanted to ask about the research assistant position you posted." },
        { who: "Professor", v: 1, text: "Of course. Are you interested in applying?" },
        { who: "Student", v: 0, text: "Yes, but I'm worried about the schedule. I have classes every morning." },
        { who: "Professor", v: 1, text: "That's actually fine. Most of the lab work happens in the afternoon. The bigger requirement is that you've taken Statistics 201." },
        { who: "Student", v: 0, text: "I'm taking it right now. Is that enough?" },
        { who: "Professor", v: 1, text: "As long as you finish it this semester, yes. Send me your resume by Friday, and we'll set up an interview next week." }
      ], questions: [
        { q: "Why does the student go to see the professor?", options: ["To ask about a research assistant job", "To complain about a class", "To change her schedule", "To ask about a grade"], answer: 0 },
        { q: "What must the student do by Friday?", options: ["Finish the statistics course", "Send a resume", "Attend an interview", "Move her morning classes"], answer: 1 }
      ] },
      { type: "bas", title: "连词成句", items: [
        { context: "Do you know where the meeting is?", chunks: ["I am", "not sure", "where", "the meeting", "is"], end: "." },
        { context: "I need to visit the library this afternoon.", chunks: ["Could you", "tell me", "when", "the library", "opens"], end: "?" },
        { context: "Did you finish the book I lent you?", chunks: ["Yes,", "the book", "that", "you", "recommended", "was", "really helpful"], end: "." }
      ] },
      { type: "email", title: "写邮件", minutes: 7, prompt: "You bought a desk lamp online, but it arrived broken. Write an email to the store.", points: ["Describe the problem.", "Explain what you want the store to do.", "Ask a question about the return process."] },
      { type: "repeat", title: "听句跟读", items: [
        "The library opens at nine on weekends.",
        "Please submit your lab report before the end of the week.",
        "Students who want to join the field trip should sign up at the front desk by Thursday."
      ] },
      { type: "interview", title: "模拟面试", seconds: 45, items: [
        "Tell me about a skill you would like to learn and why.",
        "Some people prefer to study alone, while others prefer to study in groups. Which do you prefer, and why?"
      ] }
    ]
  },

  days: [
    { id: "day1", title: "第 1 天", sections: [
      { type: "vocab", title: "今日词汇", items: [["allocate","分配"],["approximately","大约"],["consequence","后果"],["deadline","截止日期"],["enroll","注册；选课"],["evidence","证据"],["maintain","维持；保养"],["require","要求；需要"],["significant","显著的；重要的"],["survey","调查"]] },
      { type: "cw", title: "补全单词", text: "Coffee is one of the most popular drinks in the world. It {{ori|ginally}} came from Ethiopia, where, {{acc|ording}} to legend, a goat herder noticed that his {{ani|mals}} became very {{act|ive}} after eating certain berries. Over time, the {{dri|nk}} spread to the Middle East and {{Eur|ope}}. Today, millions of {{peo|ple}} start their {{mor|ning}} with a cup." },
      { type: "read", kind: "daily", title: "日常阅读", passage: "Subject: Change to Saturday's Volunteer Event\n\nHi everyone,\n\nBecause of the heavy rain forecast for Saturday, the park clean-up has been moved to Sunday, October 12, at the same time (9 a.m.). We will still meet at the north entrance. Gloves and bags will be provided, but please bring your own water bottle. If you can no longer attend on Sunday, reply to this email by Friday so we can plan the number of supplies.\n\nThanks,\nMaria, Student Volunteer Office", questions: [
        { q: "Why was the event moved?", options: ["Not enough volunteers signed up", "Rain is expected on Saturday", "The park is closed", "Maria is busy"], answer: 1 },
        { q: "What should volunteers bring?", options: ["Gloves", "Trash bags", "Their own water bottle", "Lunch"], answer: 2 },
        { q: "What should a student do if they cannot come on Sunday?", options: ["Come on Saturday instead", "Reply to the email by Friday", "Call the park office", "Bring extra supplies"], answer: 1 }
      ] },
      { type: "lcr", title: "听句选回应", items: [
        { audio: "Have you seen my blue notebook anywhere?", options: ["I think you left it in the lab.", "Yes, blue is my favorite color.", "The notebook costs five dollars.", "I'll see you later."], answer: 0 },
        { audio: "Is it okay if I turn in the assignment a day late?", options: ["It was a long assignment.", "Only if you email the professor first.", "I turned left at the corner.", "Yesterday was fine."], answer: 1 },
        { audio: "This printer keeps jamming.", options: ["Try the one on the third floor.", "I like strawberry jam.", "It printed twenty pages.", "Keep it for yourself."], answer: 0 },
        { audio: "How long does it take to walk to the station?", options: ["It's a long story.", "About fifteen minutes.", "I usually take the train.", "Since last year."], answer: 1 }
      ] },
      { type: "listen", kind: "announcement", title: "听广播", lines: [
        { who: "Announcer", v: 1, text: "Attention, all students. The campus shuttle schedule will change starting next Monday. Because of road construction near the main gate, buses will now run every fifteen minutes instead of every ten minutes during the day. However, evening service will be extended until midnight on weekdays. You can find the full schedule on the transportation office website." }
      ], questions: [
        { q: "What is the announcement mainly about?", options: ["A new bus route", "Changes to the shuttle schedule", "Rules for road construction", "A new parking lot"], answer: 1 },
        { q: "What will be better than before?", options: ["Buses will run more often during the day", "Evening service will run later", "The main gate will open earlier", "Tickets will be cheaper"], answer: 1 }
      ] },
      { type: "bas", title: "连词成句", items: [
        { context: "What did you think of the movie?", chunks: ["It was", "much better", "than", "I", "expected"], end: "." },
        { context: "Where should we meet tomorrow?", chunks: ["How about", "in front of", "the library", "at", "ten"], end: "?" },
        { context: "Why are you late?", chunks: ["The bus", "didn't", "come", "on time", "this morning"], end: "." }
      ] },
      { type: "email", title: "写邮件", minutes: 7, prompt: "Your professor, Dr. Chen, has asked students to choose a topic for the final project by Friday. You are interested in two topics and cannot decide. Write an email to Dr. Chen.", points: ["Tell her which two topics you are considering.", "Explain why you are interested in them.", "Ask for her advice."] },
      { type: "repeat", title: "听句跟读", items: [
        "Welcome to the campus tour.",
        "The dining hall is next to the student center.",
        "Please remember to bring your student ID to every exam.",
        "If you have any questions about housing, you can visit the office on the first floor."
      ] },
      { type: "interview", title: "模拟面试", seconds: 45, items: [
        "What do you usually do to relax after a busy day?",
        "Do you think students should have part-time jobs while they are studying? Why or why not?"
      ] }
    ] },

    { id: "day2", title: "第 2 天", sections: [
      { type: "vocab", title: "今日词汇", items: [["abandon","放弃；抛弃"],["adapt","适应；改编"],["benefit","好处；受益"],["contribute","贡献；促成"],["decline","下降；拒绝"],["efficient","高效的"],["habitat","栖息地"],["interpret","解释；口译"],["relevant","相关的"],["sufficient","足够的"]] },
      { type: "cw", title: "补全单词", text: "Sleep plays an important role in learning. When we sleep, the brain {{orga|nizes/nises}} information from the day and {{sto|res}} it as long-term {{mem|ory}}. Studies {{sh|ow}} that students who get {{eno|ugh}} sleep before an exam often {{perf|orm}} better than those who stay up {{la|te}} studying. In {{sh|ort}}, sleep is not wasted time." },
      { type: "read", kind: "academic", title: "学术短文", passage: "Honeybees communicate the location of food through a behavior known as the \"waggle dance.\" When a worker bee finds a good source of flowers, it returns to the hive and moves in a figure-eight pattern. The direction of the straight middle part of the dance shows the direction of the food relative to the sun, while the length of time the bee \"waggles\" indicates how far away the food is. Other bees follow the dancer closely, learn the information, and then fly directly to the flowers. Researchers were surprised to find that bees can even adjust the dance as the sun moves across the sky during the day.", questions: [
        { q: "What is the passage mainly about?", options: ["How bees make honey", "How bees share where food is", "Why bees dance for fun", "How the sun affects flowers"], answer: 1 },
        { q: "What does the length of the waggle show?", options: ["The direction of the food", "The type of flower", "The distance to the food", "The number of bees needed"], answer: 2 },
        { q: "What surprised researchers?", options: ["Bees dance in circles", "Bees adjust the dance as the sun moves", "Bees cannot see the sun", "Bees follow the queen"], answer: 1 }
      ] },
      { type: "lcr", title: "听句选回应", items: [
        { audio: "Do you want to study together for the chemistry test?", options: ["Sure, how about Thursday evening?", "Chemistry is a science.", "I tested it yesterday.", "Together they are heavy."], answer: 0 },
        { audio: "I heard the concert was canceled.", options: ["Really? I just bought tickets.", "The concert hall is big.", "I can hear you.", "I prefer classical music."], answer: 0 },
        { audio: "Could you lend me a pen?", options: ["I lent it last week.", "Sure, here you go.", "The pen is on sale.", "No, I don't write."], answer: 1 },
        { audio: "Why is the cafeteria so crowded today?", options: ["Because I'm hungry.", "They're giving out free pizza.", "It opens at eight.", "It's on the left."], answer: 1 }
      ] },
      { type: "listen", kind: "conversation", title: "听对话", lines: [
        { who: "Student", v: 0, text: "Excuse me, I'm looking for a book for my history class, but the catalog says it's checked out." },
        { who: "Librarian", v: 1, text: "Let me check. Yes, it's due back next Tuesday. You can place a hold on it, and we'll email you when it's returned." },
        { who: "Student", v: 0, text: "Next Tuesday is too late. My paper is due on Monday." },
        { who: "Librarian", v: 1, text: "In that case, we have an electronic copy. You can read it online with your student account." },
        { who: "Student", v: 0, text: "Great, that works. Can I print a few pages?" },
        { who: "Librarian", v: 1, text: "Yes, up to fifty pages for free." }
      ], questions: [
        { q: "What is the student's problem?", options: ["He lost his student ID", "The book he needs is checked out", "He has to pay a late fee", "The printer is broken"], answer: 1 },
        { q: "What does the librarian suggest in the end?", options: ["Waiting until Tuesday", "Reading an electronic copy", "Asking the professor for more time", "Buying the book"], answer: 1 }
      ] },
      { type: "bas", title: "连词成句", items: [
        { context: "Have you decided on your major?", chunks: ["I'm", "still", "thinking about", "whether", "to study", "biology"], end: "." },
        { context: "Can you help me move this weekend?", chunks: ["I'd", "love to,", "but", "I have", "to work", "on Saturday"], end: "." },
        { context: "Who gave the talk yesterday?", chunks: ["The speaker", "was", "a scientist", "who", "studies", "climate change"], end: "." }
      ] },
      { type: "discussion", title: "学术讨论", minutes: 10, professor: "This week we're discussing technology in education. Some people believe online classes are just as effective as in-person classes. Others disagree. What do you think, and why?", posts: [
        { name: "Kelly", text: "I think online classes can be just as good. Students can watch lectures again and study at their own pace, which helps them understand difficult topics." },
        { name: "Paul", text: "I disagree. In a classroom, students can ask questions right away and discuss ideas with classmates. That kind of interaction is hard to get online." }
      ] },
      { type: "repeat", title: "听句跟读", items: [
        "The museum is closed on Mondays.",
        "Our study group meets in the small room upstairs.",
        "You can borrow several books at a time from the main library.",
        "Students who want to change their class schedule must talk to an advisor first."
      ] },
      { type: "interview", title: "模拟面试", seconds: 45, items: [
        "Tell me about a teacher who influenced you.",
        "Some people say social media brings people closer, while others think it makes people lonelier. What is your opinion?"
      ] }
    ] },

    { id: "day3", title: "第 3 天", sections: [
      { type: "vocab", title: "今日词汇", items: [["accurate","准确的"],["alternative","替代的；替代方案"],["assume","假定；承担"],["component","组成部分"],["distinct","不同的；明显的"],["emerge","出现"],["factor","因素"],["generate","产生"],["potential","潜在的；潜力"],["transform","改变；转变"]] },
      { type: "cw", title: "补全单词", text: "Many cities are {{bui|lding}} more bike lanes. Supporters {{ar|gue}} that cycling reduces traffic and {{imp|roves}} public health. {{How|ever}}, some drivers {{comp|lain}} that the lanes make roads {{narr|ower}}. City planners must {{bal|ance}} the needs of {{diff|erent}} groups." },
      { type: "read", kind: "daily", title: "日常阅读", passage: "Riverside Café: New Hours and Deals\n\nStarting this month, the café opens at 7:00 a.m. on weekdays, one hour earlier than before. Students who show a valid ID receive 10% off all drinks. Every Wednesday, buy one sandwich and get a second one at half price.\n\nPlease note: the café no longer accepts cash. Only cards and mobile payments are accepted.", questions: [
        { q: "What changed about the café's hours?", options: ["It opens earlier on weekdays", "It closes later at night", "It is now closed on Wednesdays", "It is now open on weekends"], answer: 0 },
        { q: "How can a student get a discount on drinks?", options: ["Pay with cash", "Come on Wednesday", "Show a valid student ID", "Buy a sandwich"], answer: 2 },
        { q: "Which customer would have a problem at the café?", options: ["Someone paying with a phone", "Someone who only has cash", "Someone buying two sandwiches", "Someone arriving at 7:30 a.m."], answer: 1 }
      ] },
      { type: "lcr", title: "听句选回应", items: [
        { audio: "Did you remember to call the dentist?", options: ["Oh no, I'll do it right now.", "The dentist is very nice.", "I remember that song.", "My teeth are white."], answer: 0 },
        { audio: "Which bus goes to the airport?", options: ["The airport is huge.", "Take number twelve from the corner.", "I flew there last summer.", "It's too expensive to buy a bus."], answer: 1 },
        { audio: "I'm thinking of dropping my economics class.", options: ["Be careful not to drop it.", "Economics is about money.", "Why? I thought you liked it.", "The class is in room three."], answer: 2 },
        { audio: "Would you like some help with those boxes?", options: ["Thanks, that would be great.", "They are brown boxes.", "I'd like some tea.", "I helped yesterday."], answer: 0 }
      ] },
      { type: "listen", kind: "talk", title: "听学术讲座", lines: [
        { who: "Professor", v: 1, text: "Today, let's look at why some deserts are expanding, a process called desertification. One major cause is overgrazing. When too many animals eat the plants in an area, the soil loses its protective cover. Without plant roots to hold it in place, wind can blow the soil away. Another cause is poor farming practice, such as planting the same crop year after year, which uses up the nutrients in the soil. The good news is that planting trees and rotating crops can slow this process." }
      ], questions: [
        { q: "What is the talk mainly about?", options: ["Causes of desertification and ways to slow it", "How deserts formed millions of years ago", "Animals that live in deserts", "Weather patterns in deserts"], answer: 0 },
        { q: "Why does overgrazing harm the land?", options: ["Animals drink too much water", "The soil loses its plant cover and blows away", "Animals dig holes in the ground", "It causes too much rain"], answer: 1 },
        { q: "What does the professor say can help?", options: ["Raising more animals", "Planting the same crop every year", "Planting trees and rotating crops", "Building walls around farms"], answer: 2 }
      ] },
      { type: "bas", title: "连词成句", items: [
        { context: "Is the new gym open yet?", chunks: ["It", "won't", "open", "until", "next month"], end: "." },
        { context: "What did the advisor say?", chunks: ["She said", "that", "I", "should", "take", "statistics first"], end: "." },
        { context: "Do you know who won the contest?", chunks: ["I", "have no idea", "who", "the winner", "is"], end: "." }
      ] },
      { type: "email", title: "写邮件", minutes: 7, prompt: "You are a member of a student club. The club leader wants to hold the next meeting on Friday evening, but many members, including you, have other plans. Write an email to the club leader.", points: ["Explain the problem with Friday evening.", "Suggest another time.", "Give a reason why your suggestion is better."] },
      { type: "repeat", title: "听句跟读", items: [
        "The bookstore is across the street.",
        "Lunch will be served in the main hall today.",
        "Please turn off your phone before the lecture begins.",
        "The professor asked us to read the first two chapters before our next meeting."
      ] },
      { type: "interview", title: "模拟面试", seconds: 45, items: [
        "Describe a place in your city that you like to visit.",
        "Do you prefer learning new things from books or from videos? Why?"
      ] }
    ] },

    { id: "day4", title: "第 4 天", sections: [
      { type: "vocab", title: "今日词汇", items: [["acquire","获得；习得"],["approach","方法；接近"],["consist","由……组成"],["establish","建立"],["indicate","表明"],["obtain","获得"],["previous","以前的"],["region","地区"],["specific","具体的；特定的"],["valid","有效的"]] },
      { type: "cw", title: "补全单词", text: "The Great Wall of China is not a {{sin|gle}} wall. It is {{act|ually}} a series of walls {{bu|ilt}} over many centuries by {{diff|erent}} dynasties. Its main {{pur|pose}} was to protect the {{cou|ntry}} from invasions. Today, it is one of the most {{fam|ous}} tourist {{attr|actions}} in the world." },
      { type: "read", kind: "academic", title: "学术短文", passage: "Why do some animals hibernate? Hibernation is a state in which an animal's body temperature, heart rate, and breathing slow down dramatically, allowing it to survive long periods when food is scarce. Before hibernating, animals such as bears and ground squirrels eat large amounts of food and store energy as fat. During hibernation, their bodies slowly use this fat. Interestingly, not all hibernating animals sleep continuously. Many wake up every few weeks, raising their body temperature for a short time before returning to hibernation. Scientists are still not certain why these brief awakenings occur, since they use a large share of the animal's stored energy.", questions: [
        { q: "What is the passage mainly about?", options: ["Animals that sleep in summer", "What hibernation is and how animals survive it", "How bears hunt", "Why squirrels are small"], answer: 1 },
        { q: "Why do animals eat a lot before hibernating?", options: ["To grow taller", "To store energy as fat", "To attract mates", "To keep cool"], answer: 1 },
        { q: "What is still unknown, according to the passage?", options: ["Why animals wake up briefly during hibernation", "What fat is made of", "How bears find food", "Whether bears hibernate"], answer: 0 }
      ] },
      { type: "lcr", title: "听句选回应", items: [
        { audio: "Are you going to the career fair tomorrow?", options: ["I already have a car.", "Yes, I want to talk to a few companies.", "It was fair weather.", "Tomorrow is Tuesday."], answer: 1 },
        { audio: "Excuse me, is this seat taken?", options: ["No, go ahead.", "I took it yesterday.", "It's a nice seat.", "I'm sitting."], answer: 0 },
        { audio: "I can't figure out this math problem.", options: ["I solved it last year.", "Let me take a look.", "It's on page ten.", "Problems are everywhere."], answer: 1 },
        { audio: "When is the application due?", options: ["It's due at the end of the month.", "I applied some cream.", "It's in the drawer.", "Due to the rain."], answer: 0 }
      ] },
      { type: "listen", kind: "conversation", title: "听对话", lines: [
        { who: "Woman", v: 1, text: "Hey, Sam. Are you ready for the group presentation next week?" },
        { who: "Sam", v: 0, text: "Not really. I haven't started my part yet. I've been so busy with my lab reports." },
        { who: "Woman", v: 1, text: "I see. Should we meet this weekend to practice?" },
        { who: "Sam", v: 0, text: "Saturday is better for me. On Sunday I work at the bookstore." },
        { who: "Woman", v: 1, text: "Okay, let's meet on Saturday afternoon in the library. I'll book a study room." },
        { who: "Sam", v: 0, text: "Perfect. I'll finish my slides by Friday night." }
      ], questions: [
        { q: "Why hasn't Sam started his part?", options: ["He was sick", "He has been busy with lab reports", "He forgot about it", "He lost the file"], answer: 1 },
        { q: "What will the woman do?", options: ["Work at the bookstore", "Book a study room", "Finish the slides", "Talk to the professor"], answer: 1 }
      ] },
      { type: "bas", title: "连词成句", items: [
        { context: "How was your trip to Beijing?", chunks: ["It", "was", "the best trip", "I've", "ever", "taken"], end: "." },
        { context: "Why didn't you come to class?", chunks: ["I", "had", "a doctor's appointment", "that", "I", "couldn't miss"], end: "." },
        { context: "Could you tell me about the course?", chunks: ["What", "would you like", "to know", "about", "it"], end: "?" }
      ] },
      { type: "discussion", title: "学术讨论", minutes: 10, professor: "Many universities now require students to complete community service before they graduate. Do you think this is a good requirement? Why or why not?", posts: [
        { name: "Lena", text: "I think it's a great idea. Volunteering teaches students responsibility and helps them understand problems in their community." },
        { name: "Omar", text: "I'm not sure. Students are already very busy with classes and jobs. Making service required might turn it into just another task they want to finish quickly." }
      ] },
      { type: "repeat", title: "听句跟读", items: [
        "The lab is on the second floor.",
        "Please wait here until your name is called.",
        "Remember to sign the attendance sheet before you leave.",
        "Students who are interested in studying abroad should attend the information session this afternoon."
      ] },
      { type: "interview", title: "模拟面试", seconds: 45, items: [
        "What is a skill you learned recently, and how did you learn it?",
        "Some people think it is better to work for a large company, while others prefer a small company. Which would you choose, and why?"
      ] }
    ] },

    { id: "day5", title: "第 5 天", sections: [
      { type: "vocab", title: "今日词汇", items: [["analyze","分析"],["conclude","得出结论；结束"],["consume","消耗；消费"],["define","定义"],["estimate","估计"],["expand","扩大"],["impact","影响"],["occur","发生"],["principle","原则；原理"],["structure","结构"]] },
      { type: "cw", title: "补全单词", text: "Recycling helps {{red|uce}} the amount of waste that ends up in {{lan|dfills}}. When we recycle paper, {{fe|wer}} trees need to be cut down. {{Simi|larly}}, recycling metal {{sa|ves}} energy because it takes {{l|ess}} power to reuse old metal than to {{pro|duce}} new metal from raw {{mate|rials}}." },
      { type: "read", kind: "daily", title: "日常阅读", passage: "Dorm Notice: Water Shut-Off\n\nOn Thursday, from 10 a.m. to 2 p.m., water will be turned off in Building C so that workers can repair a pipe. Residents of Buildings A and B will not be affected. During the repair, Building C residents may use the showers in the gym, which will open early at 6 a.m. that day. We apologize for any inconvenience.\n\nHousing Office", questions: [
        { q: "Why will the water be turned off?", options: ["To clean the building", "To repair a pipe", "To save water", "For a fire drill"], answer: 1 },
        { q: "Who is affected by the shut-off?", options: ["All students on campus", "Residents of Building C", "Residents of Buildings A and B", "Gym staff"], answer: 1 },
        { q: "What is true about the gym on Thursday?", options: ["It will be closed", "It will open earlier than usual", "Its showers will be broken", "Only staff can use it"], answer: 1 }
      ] },
      { type: "lcr", title: "听句选回应", items: [
        { audio: "The professor extended the deadline for the essay.", options: ["Great, now I have time to revise it.", "She is a tall professor.", "The essay is long.", "I extended my hand."], answer: 0 },
        { audio: "Do you happen to know what time it is?", options: ["It happens a lot.", "It's almost three thirty.", "I know the way.", "Time flies."], answer: 1 },
        { audio: "Where did you get that jacket?", options: ["I got it on sale at the mall.", "It's very warm today.", "I'll get it tomorrow.", "Yes, it's mine."], answer: 0 },
        { audio: "Why don't you join us for dinner tonight?", options: ["Because I didn't eat.", "I'd love to. What time?", "Dinner was delicious.", "Join the club."], answer: 1 }
      ] },
      { type: "listen", kind: "talk", title: "听学术讲座", lines: [
        { who: "Professor", v: 1, text: "Let's talk about how the printing press changed Europe. Before the fifteenth century, books were copied by hand, which was slow and expensive. Only rich people and religious institutions could own them. When Johannes Gutenberg introduced a printing press with movable metal type around 1450, books could be produced much faster and at a lower cost. As a result, more people learned to read, and new ideas spread quickly across the continent. Some historians argue that without the printing press, the scientific revolution would have happened much later." }
      ], questions: [
        { q: "What is the talk mainly about?", options: ["Gutenberg's childhood", "The impact of the printing press", "How to copy books by hand", "Religious institutions in Europe"], answer: 1 },
        { q: "Why were books rare before printing?", options: ["They were forbidden", "They were copied by hand, which was slow and expensive", "There was no paper", "Nobody could read"], answer: 1 },
        { q: "What do some historians argue?", options: ["Printing slowed down science", "Without printing, the scientific revolution would have come later", "Gutenberg was a scientist", "Books became more expensive"], answer: 1 }
      ] },
      { type: "bas", title: "连词成句", items: [
        { context: "Is it going to rain today?", chunks: ["According to", "the forecast,", "it", "might", "rain", "this evening"], end: "." },
        { context: "What are you working on?", chunks: ["I'm", "writing", "a paper", "about", "how", "plants grow"], end: "." },
        { context: "Did you like the restaurant?", chunks: ["The food", "was", "good,", "but", "the service", "was slow"], end: "." }
      ] },
      { type: "email", title: "写邮件", minutes: 7, prompt: "You recently stayed at a hotel during a school trip, and you left your jacket in your room. Write an email to the hotel.", points: ["Explain when you stayed and which room you were in.", "Describe the jacket.", "Ask how you can get it back."] },
      { type: "repeat", title: "听句跟读", items: [
        "The library will close early today.",
        "You need a password to use the computers.",
        "Please put your bags under your seat during the exam.",
        "If you miss more than three classes, you should speak with your professor."
      ] },
      { type: "interview", title: "模拟面试", seconds: 45, items: [
        "What kind of music do you enjoy, and why?",
        "Do you think it is important for young people to learn about history? Explain your answer."
      ] }
    ] },

    { id: "day6", title: "第 6 天", sections: [
      { type: "vocab", title: "今日词汇", items: [["aspect","方面"],["capacity","能力；容量"],["decade","十年"],["evolve","进化；发展"],["implement","实施"],["mechanism","机制"],["phenomenon","现象"],["pursue","追求；从事"],["reveal","揭示"],["ultimately","最终"]] },
      { type: "cw", title: "补全单词", text: "Volcanoes form when melted rock, {{cal|led}} magma, rises from deep {{ins|ide}} the Earth. When pressure {{bui|lds}} up, the magma can {{bu|rst}} through the surface. {{Alth|ough}} eruptions can be {{dang|erous}}, volcanic soil is often very {{fer|tile}}, so many {{far|mers}} live near volcanoes." },
      { type: "read", kind: "academic", title: "学术短文", passage: "In many languages, the words people use for colors are surprisingly different. Some languages have only a few basic color terms, while English has eleven, including \"red,\" \"blue,\" and \"purple.\" In the 1960s, researchers proposed that languages tend to add color words in a predictable order: first black and white, then red, then green or yellow, and later blue. Later studies supported this pattern in general but also found many exceptions. For example, Russian speakers use two separate basic words for light blue and dark blue, and experiments show they can tell these shades apart slightly faster than English speakers can.", questions: [
        { q: "What is the passage mainly about?", options: ["Why English has so many words", "How color words differ across languages and develop", "Russian art", "The history of the color blue"], answer: 1 },
        { q: "According to the passage, which color word usually appears right after red?", options: ["Blue", "Green or yellow", "Purple", "White"], answer: 1 },
        { q: "What do the experiments with Russian speakers show?", options: ["They cannot see blue", "They tell light and dark blue apart slightly faster", "They use eleven color words", "They prefer red"], answer: 1 }
      ] },
      { type: "lcr", title: "听句选回应", items: [
        { audio: "Have you finished the reading for tomorrow?", options: ["Almost. Just a few more pages.", "I'm reading a newspaper.", "Tomorrow will be sunny.", "It finished at nine."], answer: 0 },
        { audio: "The line at the post office is so long.", options: ["Let's come back later, then.", "The line is very straight.", "I posted a photo.", "It's a long office."], answer: 0 },
        { audio: "Who's in charge of the event?", options: ["It's free of charge.", "Professor Davis is organizing it.", "The event is on Friday.", "I'm in the room."], answer: 1 },
        { audio: "Can I get you anything from the store?", options: ["The store is closed on Sunday.", "Could you pick up some milk?", "I got it from the store.", "I store food in the fridge."], answer: 1 }
      ] },
      { type: "listen", kind: "conversation", title: "听对话", lines: [
        { who: "Student", v: 0, text: "Professor Kim, do you have a minute? I got my essay back, and I'm not sure why I lost points on the conclusion." },
        { who: "Professor", v: 1, text: "Sure. Your argument was strong, but your conclusion just repeated the introduction word for word." },
        { who: "Student", v: 0, text: "Oh, I thought a conclusion was supposed to summarize the main points." },
        { who: "Professor", v: 1, text: "It should, but in a new way. Try to explain why your argument matters, or suggest a question for future research." },
        { who: "Student", v: 0, text: "That makes sense. Can I revise it?" },
        { who: "Professor", v: 1, text: "Yes. If you send me a new conclusion by next Wednesday, I'll regrade it." }
      ], questions: [
        { q: "Why did the student lose points?", options: ["The essay was late", "The conclusion repeated the introduction", "The argument was weak", "The essay was too short"], answer: 1 },
        { q: "What does the professor offer?", options: ["An extra class", "To regrade the essay if the student revises it by Wednesday", "A new essay topic", "A meeting on Friday"], answer: 1 }
      ] },
      { type: "bas", title: "连词成句", items: [
        { context: "Why are you studying English?", chunks: ["I", "want to", "apply to", "a university", "in", "Canada"], end: "." },
        { context: "Is the professor's office nearby?", chunks: ["It's", "just", "around the corner", "from", "the cafeteria"], end: "." },
        { context: "Did you know the exam was moved?", chunks: ["No,", "nobody", "told me", "that", "it had", "been changed"], end: "." }
      ] },
      { type: "discussion", title: "学术讨论", minutes: 10, professor: "Cities around the world are trying to reduce traffic. One idea is to make public transportation completely free. Do you think free public transportation is a good idea? Why or why not?", posts: [
        { name: "Mia", text: "Yes. If buses and trains were free, more people would leave their cars at home, which would reduce traffic and pollution." },
        { name: "Leo", text: "I'm not convinced. The government would have to pay for it with higher taxes, and the money might be better spent on improving the service itself." }
      ] },
      { type: "repeat", title: "听句跟读", items: [
        "The gym opens early in the morning.",
        "Please check your email for the updated schedule.",
        "Our professor will hold extra office hours before the final exam.",
        "Anyone who wants to join the photography club should come to the meeting on Friday afternoon."
      ] },
      { type: "interview", title: "模拟面试", seconds: 45, items: [
        "Tell me about a goal you have for the next year.",
        "Some people prefer to plan everything in advance, while others like to be spontaneous. Which describes you better?"
      ] }
    ] },

    { id: "day7", title: "第 7 天", sections: [
      { type: "vocab", title: "今日词汇", items: [["comprehensive","全面的"],["controversy","争议"],["criteria","标准（复数）"],["inevitable","不可避免的"],["justify","证明……合理"],["perspective","视角；观点"],["preliminary","初步的"],["sustainable","可持续的"],["undergo","经历"],["widespread","广泛的"]] },
      { type: "cw", title: "补全单词", text: "Artificial intelligence is {{chan|ging}} the way people work. Some {{ex|perts}} believe it will {{cre|ate}} new jobs, while {{oth|ers}} worry that many {{tradi|tional}} jobs may {{disa|ppear}}. What seems {{cl|ear}} is that workers will need to keep {{lea|rning}} new skills throughout their careers." },
      { type: "read", kind: "daily", title: "日常阅读", passage: "Campus Job Opening: Student Tour Guide\n\nThe Admissions Office is hiring student tour guides for the spring semester. Guides lead groups of visitors around campus and answer questions about student life.\n\nRequirements: You must be a full-time student who has completed at least one year at the university, and you must be available on Saturday mornings. Guides are paid $15 per hour. Training is required and will take place on January 20.\n\nTo apply, submit a short video introducing yourself by January 10.", questions: [
        { q: "What do tour guides do?", options: ["Teach classes", "Lead visitors around campus and answer questions", "Work in the library", "Drive the campus bus"], answer: 1 },
        { q: "Which student cannot apply?", options: ["A full-time second-year student", "A student in their first semester", "A student who is free on Saturday mornings", "A student who can attend training on January 20"], answer: 1 },
        { q: "What must applicants send?", options: ["A transcript", "A short video", "A letter from a professor", "A photo"], answer: 1 }
      ] },
      { type: "lcr", title: "听句选回应", items: [
        { audio: "I'm not sure whether to take the morning or the evening section.", options: ["Which one fits your schedule better?", "The morning was sunny.", "I'll take a section of the orange.", "Both sections are full of books."], answer: 0 },
        { audio: "You look exhausted.", options: ["I stayed up late finishing my project.", "I'm looking at the board.", "It's an exhausting book.", "Thanks, I bought it yesterday."], answer: 0 },
        { audio: "Didn't you say you were going home this weekend?", options: ["Home is where the heart is.", "I was, but my flight got canceled.", "I'll say it again.", "The weekend was long."], answer: 1 },
        { audio: "Do you think I should apply for the scholarship?", options: ["Definitely. You have great grades.", "The ship is very large.", "I applied it to the wall.", "I think so too. It's cold."], answer: 0 }
      ] },
      { type: "listen", kind: "talk", title: "听学术讲座", lines: [
        { who: "Professor", v: 1, text: "Today we'll discuss the urban heat island effect. Cities are often several degrees warmer than the countryside around them. Why? First, materials like concrete and asphalt absorb heat during the day and release it slowly at night. Second, cities have fewer trees and plants, which normally cool the air by releasing water. Third, cars, air conditioners, and factories produce heat directly. To reduce this effect, some cities are painting roofs white to reflect sunlight, while others are building green roofs covered with plants." }
      ], questions: [
        { q: "What is the talk mainly about?", options: ["Why cities are warmer than the countryside, and possible solutions", "How to build roofs", "Weather in the countryside", "How air conditioners work"], answer: 0 },
        { q: "Which of the following is NOT mentioned as a cause?", options: ["Concrete absorbs heat", "Cities have fewer trees", "Cars produce heat", "Rivers flow through cities"], answer: 3 },
        { q: "Why do some cities paint roofs white?", options: ["To make buildings look modern", "To reflect sunlight", "To help plants grow", "To save money on paint"], answer: 1 }
      ] },
      { type: "bas", title: "连词成句", items: [
        { context: "What did you do over the break?", chunks: ["I", "spent", "most of my time", "visiting", "my grandparents"], end: "." },
        { context: "Have you ever been to a concert?", chunks: ["Yes,", "the first one", "I went to", "was", "in high school"], end: "." },
        { context: "What do you want to ask the professor?", chunks: ["I", "want to know", "if", "she", "will accept", "late papers"], end: "." }
      ] },
      { type: "email", title: "写邮件", minutes: 7, prompt: "Your friend from another country is planning to visit your city next month and has asked you for advice. Write an email to your friend.", points: ["Suggest two places to visit.", "Explain why they are worth visiting.", "Give one practical tip, for example about transportation or weather."] },
      { type: "repeat", title: "听句跟读", items: [
        "The concert starts at eight tonight.",
        "Please return your books to the front desk.",
        "The cafeteria offers vegetarian options every day of the week.",
        "Students who need extra help with writing can make an appointment at the writing center online."
      ] },
      { type: "interview", title: "模拟面试", seconds: 45, items: [
        "What is the most useful app on your phone, and why?",
        "Many people believe that working from home is better than working in an office. Do you agree? Why or why not?"
      ] }
    ] }
  ]
};
