import React, { useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------------ *
 *  REPS. Phase-1 pilot app (working prototype), EN / NL.
 *  Advisory AI-literacy practice. Personal life first. Live Claude coach.
 *  Working name "Reps" is a placeholder. The Ninth Tee.
 * ------------------------------------------------------------------ */

const C = {
  paper: "#F3F2EF", card: "#FBFAF7", ink: "#17241E", inkSoft: "#3A4A42",
  sage: "#6B7A72", line: "#E4E1D9", emerald: "#127A56", emeraldDk: "#0E6146",
  emeraldSoft: "#E4F0EA", amber: "#C9871A", amberSoft: "#F6EBD2", white: "#FFFFFF",
};
const SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif';
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const LEVELS = { en: ["Aware", "Explorer", "Integrator", "Creator"], nl: ["Bewust", "Verkenner", "Integrator", "Maker"] };

/* ----------------------------- content ---------------------------- */
const DOMAINS = [
  { id: "D1", name: { en: "Foundations", nl: "Fundamenten" }, blurb: { en: "Knowing when AI is confidently wrong.", nl: "Weten wanneer AI zelfverzekerd de fout in gaat." } },
  { id: "D2", name: { en: "Prompting", nl: "Prompten" }, blurb: { en: "Getting good answers out of AI.", nl: "Goede antwoorden uit AI halen." } },
  { id: "D3", name: { en: "Tools", nl: "Tools" }, blurb: { en: "Choosing tools you can trust.", nl: "Tools kiezen die je kunt vertrouwen." } },
  { id: "D6", name: { en: "Responsible use", nl: "Verantwoord gebruik" }, blurb: { en: "Protecting your data, staying in charge.", nl: "Je data beschermen en zelf de baas blijven." } },
];
const domById = (id) => DOMAINS.find((d) => d.id === id);

const SCAN = {
  D1: {
    claims: {
      en: ["I can name the AI in tools I already use", "I can explain what an AI 'hallucination' is", "I can say why a chatbot and a forecast behave differently", "I can choose the right type of AI for a problem"],
      nl: ["Ik kan de AI benoemen in tools die ik al gebruik", "Ik kan uitleggen wat een AI-'hallucinatie' is", "Ik kan uitleggen waarom een chatbot en een voorspelmodel anders werken", "Ik kan het juiste soort AI kiezen om een probleem op te lossen"] },
    proofs: [
      { correct: 1, q: { en: "Which of these is most likely powered by AI?", nl: "Welke van deze toepassingen werkt het meest waarschijnlijk met AI?" },
        opts: { en: ["A basic calculator", "Your phone suggesting 'people' and 'places' photo albums", "A paper map", "A light switch"],
          nl: ["Een simpele rekenmachine", "Je telefoon die 'personen', 'plaatsen' en 'albums' aanbeveelt", "Een papieren kaart", "Een standaard lichtschakelaar"] } },
      { correct: 2, q: { en: "An AI gives you a confident, specific answer with a named source. You can't find that source anywhere. What do you do?", nl: "Een AI geeft je een zelfverzekerd, specifiek antwoord met een bron erbij. Echter kun je deze bron nergens terug vinden op het internet. Wat doe je?" },
        opts: { en: ["Trust it, the detail shows it did its research", "Use it, but note that it's unverified", "Treat it as unconfirmed and verify independently before relying on it", "Never trust AI answers at all"],
          nl: ["Vertrouw het, de details laten zien dat de informatie juist is", "Gebruik het, maar noteer dat het niet geverifieerd is", "Behandel het als onbevestigd en check het zelf voordat je de informatie vertrouwt", "AI-antwoorden nooit vertrouwen"] } },
      { correct: 1, q: { en: "You need to predict next month's sales from three years of monthly figures. Which fits best?", nl: "Je wilt de omzet van de volgende maand voorspellen op basis van de maandelijkse cijfers van de afgelopen 3 jaar. Wat past het beste?" },
        opts: { en: ["Describe the data to a chatbot and ask it to guess the number", "A predictive model trained on the numbers", "An image generator", "It doesn't matter, all AI is the same"],
          nl: ["Beschrijf de data aan een chatbot en vraag het om een voorspelling van de omzet.", "Gebruik een voorspelmodel getraind op de cijfers", "Gebruik een beeldgenerator", "Maakt niet uit, alle AI is hetzelfde"] } },
      { correct: 1, q: { en: "A colleague wants to automatically flag unusual transactions in real time. Which approach fits?", nl: "Een collega wilt ongebruikelijke transacties automatisch en in realtime signaleren. Welke aanpak past het beste?" },
        opts: { en: ["Prompt a chatbot for each transaction", "An anomaly-detection model on transaction patterns", "A text summariser", "A photo generator"],
          nl: ["Prompt een chatbot voor elke transactie", "Gebruik maken van een anomaliedetectiemodel op transactiepatronen", "Gebruik maken van een tekstsamenvatter", "Gebruik maken van een fotogenerator"] } },
    ] },
  D2: {
    claims: {
      en: ["I can ask a clear question", "I add context and a goal to my prompts", "I use role + context + example + format, and iterate", "I build reusable prompt templates for others"],
      nl: ["Ik kan een duidelijke vraag stellen", "Ik voeg context en een doel toe aan mijn prompts", "Ik gebruik rol + context + voorbeeld + format, en blijf de prompt bijwerken", "Ik maak herbruikbare prompt-templates voor anderen"] },
    proofs: [
      { correct: 1, q: { en: "Which of these is the clearest prompt?", nl: "Welke van de onderstaande prompts is de duidelijkste prompt?" },
        opts: { en: ["\"help\"", "\"Write a polite 3-sentence reply declining this meeting\"", "\"email\"", "\"do the thing\""],
          nl: ["\"help\"", "Stel een beleefd antwoord op van drie zinnen waarin je een afspraak netjes afwijst.", "\"e-mail\"", "\"doe het even\""] } },
      { correct: 1, q: { en: "Your prompt 'write a summary' gives a vague result. What most improves it?", nl: "Je prompt 'schrijf een samenvatting' geeft een vaag resultaat. Wat doe je om het resultaat te verbeteren?" },
        opts: { en: ["Type it again, louder", "Add what it's for, who it's for, and how long it should be", "Ask a different AI the same thing", "Give up"],
          nl: ["Type het nog eens in hoofdletters 'SCHRIJF EEN SAMENVATTING'", "Voeg toe waarvoor het is, voor wie, en hoe lang het antwoord mag zijn", "Vraag hetzelfde aan een andere AI", "Geef op"] } },
      { correct: 2, q: { en: "Which prompt is most likely to give a reliably good, reusable result?", nl: "Welke prompt geeft het meest waarschijnlijk een betrouwbaar goed, herbruikbaar resultaat?" },
        opts: { en: ["\"Summarise this\"", "\"Summarise this\" plus the topic", "A prompt with a role, the context, an example of good output, and the exact format", "Just paste the text with no instruction"],
          nl: ["\"Vat dit samen\"", "\"Vat dit samen plus het onderwerp\"", "Een prompt met een rol, de context, een voorbeeld van een goed resultaat, en het exacte format", "Gewoon de tekst plakken zonder instructie"] } },
      { correct: 1, q: { en: "You want your team to get consistent output every time. Best move?", nl: "Je wilt dat je team elke keer een consistent resultaat krijgt. Wat is de beste manier?" },
        opts: { en: ["Tell everyone to just ask nicely", "Write a reusable template with placeholders, an example and the required format", "Let everyone freestyle", "Do it all yourself"],
          nl: ["Zeg tegen iedereen dat ze het netjes moeten vragen", "Maak een herbruikbare template met invulvelden, een voorbeeld en het vereiste format", "Laat iedereen vrij improviseren", "Doe alles zelf"] } },
    ] },
  D3: {
    claims: {
      en: ["I know which AI tools I can trust", "I use one for real tasks", "AI is woven across my day", "I choose and set up tools for others"],
      nl: ["Ik weet welke AI-tools ik kan vertrouwen", "Ik gebruik AI voor echte taken", "AI is verweven in mijn dagelijkse routine", "Ik kies en richt AI-tools in voor anderen"] },
    proofs: [
      { correct: 1, q: { en: "Before trusting a new AI app with personal info, the safest first check is:", nl: "Voordat je een nieuwe AI-app je persoonlijke info toevertrouwt, is de veiligste eerste check:" },
        opts: { en: ["Whether it's free", "Who made it and what it does with your data", "Whether it's popular", "Whether it looks nice"],
          nl: ["Of het gratis is", "Wie het gemaakt heeft en wat het met je data doet", "Of het populair is", "Of het er mooi uitziet"] } },
      { correct: 1, q: { en: "You want an AI assistant to help draft an email. Best approach?", nl: "Je wilt dat een AI-assistent helpt een e-mail op te stellen. Wat is de beste aanpak?" },
        opts: { en: ["Paste in everything, including private details, into any free tool", "Use a reputable tool and leave out sensitive details", "Don't bother", "Only if a colleague tells you to"],
          nl: ["Plak alles erin, inclusief privégegevens, in een willekeurige gratis tool", "Gebruik een betrouwbare tool en laat gevoelige details weg", "Doe geen moeite", "Alleen als een collega het je vraagt"] } },
      { correct: 1, q: { en: "Which shows AI genuinely woven into a workflow, not just occasional use?", nl: "Wat laat zien dat AI daadwerkelijk in een workflow verweven zit en niet alleen af en toe wordt gebruikt?" },
        opts: { en: ["Asking a chatbot a random question once a week", "Using AI as a standard step to draft, check and refine your regular reports", "Having read about AI", "Having the app installed"],
          nl: ["Eens per week een willekeurige vraag aan een chatbot stellen", "AI als vaste stap gebruiken om je rapporten op te stellen, te checken en bij te werken", "Je hebt veel over AI gelezen", "Je hebt een AI-app geïnstalleerd"] } },
      { correct: 1, q: { en: "You're choosing an AI tool for your whole team. What matters most?", nl: "Je kiest een AI-tool voor je hele team. Wat is het belangrijkst?" },
        opts: { en: ["Whatever you personally like", "Fit for the team's tasks, data safety, and ease of adoption", "The cheapest one", "The newest one"],
          nl: ["Wat jij persoonlijk het leukst vindt", "Geschikt voor de taken van het team, dataveiligheid, en makkelijk in gebruik", "De goedkoopste", "De nieuwste"] } },
    ] },
  D6: {
    claims: {
      en: ["I know not to paste sensitive data into public tools", "I protect my own and others' data, and verify before acting", "I judge impact before I rely on AI", "I set my own guardrails and check risk"],
      nl: ["Ik weet dat je geen gevoelige data in publieke tools mag plakken", "Ik bescherm mijn eigen data en die van anderen, en check voordat ik iets doe", "Ik weeg de impact af voordat ik op AI vertrouw", "Ik stel mijn eigen grenzen en check risico's"] },
    proofs: [
      { correct: 2, q: { en: "Which is safe to put into a free public chatbot?", nl: "Wat is veilig om in een gratis publieke chatbot te zetten?" },
        opts: { en: ["A customer's bank details", "A colleague's medical note", "A general question about how to word a polite email", "Your password"],
          nl: ["De bankgegevens van een klant", "Een medische notitie van een collega", "Een algemene vraag over hoe je een beleefde e-mail formuleert", "Je wachtwoord"] } },
      { correct: 2, q: { en: "A friend pastes someone else's full name, address and bank details into a free public chatbot to draft a complaint. Best response?", nl: "Een vriend plakt de volledige naam, het adres en de bankgegevens van iemand anders in een gratis publieke chatbot om een klacht op te stellen. Wat is de beste reactie?" },
        opts: { en: ["Nothing. It saved time", "Do the same yourself; it's handy", "Point out that someone else's private details shouldn't go into a public tool. Suggest stripping them out, or using a tool they trust", "Refuse to ever help them again"],
          nl: ["Niets. Het scheelde tijd", "Doe het zelf ook; het is handig", "Wijs erop dat privégegevens van iemand anders niet in een publieke tool horen. Stel voor de gegevens eruit te halen, of een tool te gebruiken waarbij je beide zeker bent hoe data wordt verwerkt en veilig opgeslagen wordt", "Weiger ze ooit nog eens te helpen"] } },
      { correct: 1, q: { en: "Before letting AI help with a decision, which matters most to weigh?", nl: "Voordat je AI laat helpen bij een beslissing, wat weeg je het zwaarst mee?" },
        opts: { en: ["How fast it answers", "Whether the decision affects people and how much is at stake", "Whether it sounds confident", "Whether it's free"],
          nl: ["Hoe snel het antwoordt", "Of de beslissing mensen raakt en hoeveel impact het heeft", "Of het zelfverzekerd klinkt", "Of het gratis is"] } },
      { correct: 1, q: { en: "You're setting up an AI step that will affect other people. The responsible setup is:", nl: "Je implementeert een AI‑stap die impact heeft op anderen. De verantwoordelijke inrichting is:" },
        opts: { en: ["Fully automate it with no oversight", "Add a human check, note what could go wrong, and a way to override", "Hope for the best", "Keep it quiet"],
          nl: ["Volledig automatiseren zonder toezicht", "Zorg voor een menselijke check, benoem wat er mis kan gaan en leg vast hoe je het proces bijstuurt.", "Hopen op het beste", "Stilhouden"] } },
    ] },
};

const PROOF_KIND = { D1: "task", D2: "task", D3: "sj", D6: "sj" };
const TASKS = {
  D1: {
    prompt: { en: "Below is a short AI answer. One detail is made up. Say which detail it is, and how you'd check it.",
      nl: "Hieronder staat een kort AI-antwoord. Eén detail is verzonnen. Zeg welk detail dat is, en hoe je het zou checken." },
    sample: { en: "Green tea has about 25 mg of caffeine per cup, less than coffee. A 2021 Cambridge Wellbeing Study found it also improved memory scores by 18% when drunk before 10am.",
      nl: "Groene thee bevat ongeveer 25 mg cafeïne per kop, minder dan koffie. Een Cambridge-welzijnsstudie uit 2021 vond dat het geheugenscores met 18% verbeterde als je het voor 10 uur 's ochtends drinkt." },
    en: "Spot the fabricated detail in a short AI answer and say how to check it. (Sample: a green-tea claim citing a made-up '2021 Cambridge Wellbeing Study' with an 18% memory boost.)",
    criteria: "Identifies the '2021 Cambridge Wellbeing Study / 18% memory' as the fabricated, unverifiable claim, AND proposes a plausible check (search whether that study exists, ask for the source).",
    anchors: "Aware = trusts it or only vaguely doubts, no check. Explorer = spots the fabricated study/stat and names a way to verify it. Integrator = also explains why a specific-but-unsourced claim is a red flag." },
  D2: {
    prompt: { en: "Write a prompt that reliably turns a jumble of notes or ideas (from your life or work) into a clear, ordered to-do list with priorities. You don't need real notes, just write the prompt.",
      nl: "Schrijf een prompt die een verzameling notities of ideeën (uit je leven of werk) betrouwbaar omzet in een heldere, geordende takenlijst met prioriteiten. Je hebt geen echte notities nodig, schrijf gewoon de prompt." },
    en: "Write a reusable prompt that turns messy notes into a clear, prioritised to-do list.",
    criteria: "A strong prompt states the goal AND an explicit output format (e.g. an ordered list with priorities). Integrator level also gives role/context and says how to handle missing details.",
    anchors: "Aware = a bare 'summarise these notes' with no format. Explorer = states the goal and an explicit output format. Integrator = adds role/context and handles missing info." },
};

const LOOPS = [
  { id: 1, domain: "D1",
    title: { en: "Catch it being confidently wrong", nl: "Betrap het op een zelfverzekerde fout" },
    learn: { en: "AI writes fluently even when it's wrong. It can invent facts, figures, even sources, and say all of it with total confidence. The skill isn't avoiding AI. It's checking the things that actually matter before you rely on them.",
      nl: "AI schrijft overtuigend, zelfs wanneer de inhoud onjuist is. Het kan feiten, cijfers en bronnen fabriceren en die met zelfvertrouwen presenteren. Verantwoord gebruik draait niet om AI te vermijden, maar om het verifiëren van cruciale informatie." },
    doTask: { en: "Use AI for a real task in your life today. Planning a trip, checking a fact, comparing two products, drafting a tricky message. Before you use the result, find one claim worth checking, and check it. Tell us the task, the claim you checked, and what you found.",
      nl: "Gebruik AI vandaag voor een concrete taak in je leven: een reis plannen, een feit controleren, twee producten vergelijken of een lastig bericht formuleren. Kijk daarna kritisch naar het resultaat: kies één bewering die controle waard is, en check die. Vertel ons welke taak je deed, welke bewering je controleerde, en wat je ontdekte." },
    reflect: { en: "Did the check change anything? Would you have caught it without looking?", nl: "Veranderde de check iets? Had je het zonder te controleren doorgehad?" },
    coachFocus: "Did they pick a claim that actually matters (not a trivial one), and did they really verify it? Nudge toward checking the details that would cost them if wrong." },
  { id: 2, domain: "D6",
    title: { en: "What never goes in", nl: "Gebruik dit niet!" },
    learn: { en: "Never paste sensitive information into a public AI tool, whether it's yours or someone else's. Bank details, passwords, ID numbers, health info, private things about other people. Once it's in, you've lost control of where it goes.",
      nl: "Plak nooit gevoelige informatie in een publieke AI-tool, of het nu van jou of van iemand anders is. Bankgegevens, wachtwoorden, BSN, gezondheidsinfo, privézaken van anderen. Zodra het erin staat, heb je geen controle meer over waar het wordt opgeslagen en wie er toegang heeft tot de data." },
    doTask: { en: "Think of a task where you'd be tempted to paste something sensitive. A letter about money or health, a message with someone's personal details. Do it safely instead. Take the identifying details out first, or use a tool you trust. Tell us what the risk was and how you handled it. (Don't send us the sensitive info.)",
      nl: "Denk aan een taak waarbij je geneigd zou zijn om iets gevoeligs te plakken: een brief over geld of gezondheid, een bericht met iemands persoonlijke gegevens. Doe het in plaats daarvan veilig. Haal eerst de identificeerbare details eruit, of gebruik een hulpmiddel dat je vertrouwt. Vertel ons wat het risico was en hoe je het hebt aangepakt. (Stuur ons de gevoelige informatie niet mee.)" },
    reflect: { en: "How easy is it to slip up here? What's your rule of thumb now?", nl: "Hoe makkelijk ga je hier de mist in? Wat is nu je vuistregel?" },
    coachFocus: "Did they correctly spot sensitive data AND a safe alternative? Reinforce data-minimisation as a reflex. Praise them for not sharing the sensitive data." },
  { id: 3, domain: "D2",
    title: { en: "Ask better: context, goal, format", nl: "Vraag beter: context, doel, format" },
    learn: { en: "A weak prompt gets a weak answer. A strong one gives the AI three things: context (what this is about), a clear goal (what you want), and the format (how you want it back). Same effort, far better output.",
      nl: "Een zwakke prompt levert een zwak antwoord op. Een sterke prompt geeft AI drie dingen: context (waar het over gaat), een duidelijk doel (wat je wilt) en de vorm (hoe je het terug wilt krijgen). Zelfde moeite, veel beter resultaat." },
    doTask: { en: "Pick something you do often. A weekly meal plan, a message you always struggle to word, a workout, a budget. Write one prompt that gives the AI context, a goal and a format, and run it on a real example. Send us your prompt and the result.",
      nl: "Selecteer een taak die je vaak uitvoert. Stel een prompt op met context, doel en gewenste vorm, test deze op een concreet voorbeeld en stuur zowel de prompt als de uitkomst." },
    template: { en: "You are helping me [context]. I need to [goal]. Here's the input: [paste]. Give it back as [format, for example a 7-day list with a shopping list grouped by aisle].",
      nl: "Je helpt me met [context]. Ik wil [doel]. Hier is de input: [plak]. Geef het terug als [format, bijvoorbeeld een lijst voor 7 dagen met een boodschappenlijst per produkt]." },
    reflect: { en: "How much better was it than a one-line ask? What's still missing?", nl: "Hoeveel beter was het dan een vraag van één zin? Wat mist er nog?" },
    coachFocus: "Does the prompt name context, goal AND an explicit format? Push from 'question' to 'structured, reusable prompt'." },
  { id: 4, domain: "D3",
    title: { en: "The right tool, used safely", nl: "Gebruik de juiste tool voor een veilig gebruik" },
    learn: { en: "Before you use an AI tool for anything real, ask two questions. Can I trust it, meaning who made it and are they reputable? And what does it do with what I put in? A random free app and a well-known assistant are not the same thing, especially for anything personal.",
      nl: "Voordat je een AI‑tool voor iets echts gebruikt, stel je twee vragen. Kan ik het vertrouwen, met andere woorden: wie heeft het gemaakt en is die partij betrouwbaar? En wat doet het met wat ik invoer? Een willekeurige gratis app en een bekende assistent zijn niet hetzelfde, zeker niet bij persoonlijke informatie." },
    doTask: { en: "For a real task, choose a trustworthy AI tool that fits it, and check in one line what it does with your data. Use it. Tell us: the task, the tool, and why it was a safe, sensible choice.",
      nl: "Kies voor een echte taak een betrouwbare AI‑tool die erbij past, en controleer in één zin wat die met jouw gegevens doet. Gebruik de tool. Vertel ons: de taak, de tool, en waarom het een veilige en verstandige keuze was." },
    reflect: { en: "Did you actually know whether to trust it? What does it do with your data?", nl: "Wist je eigenlijk of je het kon vertrouwen? Wat doet het met je data?" },
    coachFocus: "Did they weigh trust + data handling, not just 'free and easy'? Nudge anyone who grabbed a random tool to check who's behind it." },
  { id: 5, domain: "D2",
    title: { en: "Iterate, don't accept", nl: "Blijf bijschaven. Neem het eerste AI‑antwoord nooit meteen voor waar." },
    learn: { en: "The first answer is a draft, not the final word. People who get the most from AI push back: 'make it shorter', 'more specific', 'in my voice', 'you missed X'. Two or three rounds beats one, every time.",
      nl: "Het eerste antwoord van AI is slechts een concept. Wie AI goed gebruikt, reageert erop: ‘korter’, ‘specifieker’, ‘meer in mijn stijl’, ‘je mist nog iets’. Bijschaven en herhalen in twee of drie rondes geven altijd een beter resultaat dan één." },
    doTask: { en: "Take a real AI output that was 'okay but not quite' and improve it across at least two rounds of feedback. Send us what you asked for in each round, and the final result.",
      nl: "Neem een echt AI‑antwoord dat “oké maar het net niet” was, en verbeter het in minstens twee rondes feedback. Stuur ons wat je in elke ronde vroeg, en het uiteindelijke resultaat." },
    reflect: { en: "What kind of instruction moved it the most?", nl: "Welke soort instructie hielp het meest?" },
    coachFocus: "Are their iteration instructions specific (not just 'try again')? Did the output measurably improve?" },
  { id: 6, domain: "D6",
    title: { en: "Keep yourself in charge", nl: "Blijf zelf in de 'lead'" },
    learn: { en: "AI can help you think. But for anything that matters, like your health, your money, a big decision, or something that affects other people, you decide, not the AI. It can be biased, or just plain wrong, so don't hand it your judgement on things that count.",
      nl: "AI kan je helpen nadenken. Maar bij alles wat ertoe doet, je gezondheid, je geld, een grote beslissing, of iets dat anderen raakt, ben jij degene die beslist, niet de AI. Het kan bevooroordeeld zijn of gewoon fout zitten, dus draag je oordeel niet over aan een systeem bij zaken die echt tellen." },
    doTask: { en: "Find one place where you might lean on AI for an important decision. A health symptom, a money choice, a big purchase, advice about someone else. Let AI inform it, then name the check you'd keep. A professional, a second source, your own gut. Tell us the decision and your check.",
      nl: "Vind één situatie waarin je geneigd bent AI te gebruiken voor een belangrijke beslissing: een gezondheidsklacht, een geldkeuze, een grote aankoop, of advies over iemand anders. Laat AI je informeren, maar benoem daarna de controle die je zelf houdt: een professional, een tweede bron, je eigen gevoel. Vertel ons de beslissing en jouw check." },
    reflect: { en: "Where's your line between 'AI helps me' and 'AI decides for me'?", nl: "Waar ligt jouw grens tussen 'AI helpt me' en 'AI beslist voor me'?" },
    coachFocus: "Did they pick a genuinely consequential decision AND a real human check? Move anyone who'd 'just follow it' toward 'AI informs, I decide'." },
];

/* ----------------------------- UI strings ------------------------- */
const UI = {
  en: {
    loading: "Loading your practice…",
    tagline: "Get good at AI, a few minutes a day.",
    intro: "Reps gives you one small, real task at a time, plus a coach that helps you get better at it. Think of it as a mirror for where you are and where to grow. It isn't a test, and nothing rides on it.",
    nameLabel: "What should we call you?", namePh: "First name",
    practiceLabel: "You'll practise mostly on…",
    lifeT: "Everyday life", lifeSub: "No work data needed", workT: "Work tasks", workSub: "If you'd rather",
    startBtn: "Start with a quick insight scan", startSub: "Takes about 3 minutes · your answers stay yours",
    tickHighest: "Tick the highest that feels true:",
    pickHint: "Pick the one that fits, then we'll check it with a quick exercise.",
    youSaid: "You said you can:", showIt: "Now show it. What would you do here?", showItReal: "Now show it for real.", taskLabel: "AI answer to check", taskPh: "Type your answer…", scoringMsg: "Reading your answers…",
    next: "Next", seeInsight: "See my insight",
    scanFoot: "Your answer decides the picture, not the claim. No grades here.",
    yourInsight: "Your insight", insightHead: (n) => `Here's where you are, ${n}.`,
    insightBody: "This is a starting picture, not a label. A few strengths to build on, and plenty of room to grow. Your first few reps will sharpen it.",
    gapNote: "A good spot to grow. The practice will help here.", startPractising: "Start practising",
    welcome: "Welcome back", dayStreak: "day streak", repsDone: "reps done",
    todaysRep: "Today's rep", realTaskSub: (d) => `${d} · a real task, in your own life`, start: "Start →",
    allDone: "All reps done. Nice work.", allDoneSub: "Come back tomorrow, or revisit any rep below.",
    viewInsight: "View your insight →", allReps: "All reps",
    back: "Back", learn: "Learn", doL: "Do", promptStart: "Prompt to start from",
    whatYouDid: "What you did", whatYouDidPh: "Paste your prompt / describe the real task and what happened…",
    reflectionLabel: "One-line reflection",
    getCoach: "Get coach feedback", coachReading: "Your coach is reading…", askAgain: "Ask the coach again",
    coachErr: "The coach couldn't be reached just now. Your work is saved, so try again, or mark the rep done and come back later.",
    coachHdr: "Coach", markDone: "Mark this rep done", saved: "Saved, back to reps",
    footDone: "The streak is for doing a real task, not for opening the app.",
    footEmpty: "Tell us what you did up top first. The streak is only for real tasks.",
    settings: "Settings", language: "Language", resetLabel: "Reset (start over)",
    resetConfirm: "This clears your progress on this device. Start over?", cancel: "Cancel", reset: "Reset", close: "Close",
  },
  nl: {
    loading: "Je oefening wordt geladen…",
    tagline: "Bouw AI‑vaardigheid op met kleine dagelijkse momenten. Een paar minuten per dag maken al verschil.",
    intro: "De oefeningen bieden je steeds één concrete taak en een AI-coach die je vaardigheid aanscherpt. Het werkt als een spiegel voor je huidige niveau en je groeikansen. Het is geen toets, en er staat niets op het spel.",
    nameLabel: "Hoe mogen we je noemen?", namePh: "Voornaam",
    practiceLabel: "Je oefent vooral op…",
    lifeT: "Het dagelijks leven", lifeSub: "Geen werkdata nodig", workT: "Werktaken", workSub: "Als je dat liever hebt",
    startBtn: "Begin met een korte inzichtscan", startSub: "Duurt ongeveer 3 minuten · je antwoorden blijven van jou",
    tickHighest: "Kies de optie die bij jou het beste past",
    pickHint: "Kies wat past, dan checken we het met een korte oefening.",
    youSaid: "Je zei dat je kunt:", showIt: "Laat het nu zien. Wat zou je hier doen?", showItReal: "Laat het nu echt zien.", taskLabel: "AI-antwoord om te checken", taskPh: "Typ je antwoord…", scoringMsg: "Je antwoorden worden gelezen…",
    next: "Verder", seeInsight: "Bekijk mijn inzicht",
    scanFoot: "Je antwoord bepaalt het beeld, niet wat je aanvinkte. Geen cijfers hier.",
    yourInsight: "Jouw inzicht", insightHead: (n) => `Zo sta je ervoor, ${n}.`,
    insightBody: "Dit is een startpunt, geen oordeel. Je ziet een paar sterke fundamenten en volop groeiruimte. De eerste oefeningen maken het meteen scherper.",
    gapNote: "Een mooie plek om te groeien. Het oefenen helpt hier.", startPractising: "Begin met oefenen",
    welcome: "Welkom terug", dayStreak: "dagen op rij", repsDone: "Oefeningen gedaan",
    todaysRep: "Oefening van vandaag", realTaskSub: (d) => `${d} · een echte taak, uit je eigen leven`, start: "Start →",
    allDone: "Alle oefeningen klaar? Goed gedaan!", allDoneSub: "Kom morgen terug, of doe een oefening opnieuw.",
    viewInsight: "Bekijk je inzicht →", allReps: "Alle oefeningen",
    back: "Terug", learn: "Leer", doL: "Doe", promptStart: "Prompt om mee te starten",
    whatYouDid: "Wat je deed", whatYouDidPh: "Plak je prompt / beschrijf de echte taak en wat er gebeurde…",
    reflectionLabel: "Reflectie in één regel",
    getCoach: "Vraag feedback van de coach", coachReading: "Je coach leest mee…", askAgain: "Vraag de coach opnieuw",
    coachErr: "De coach was even niet bereikbaar. Je werk is opgeslagen, dus probeer het opnieuw, of markeer de oefening als gedaan en kom later terug.",
    coachHdr: "Coach", markDone: "Markeer deze oefening als gedaan", saved: "Opgeslagen, terug naar oefeningen",
    footDone: "De streak is voor het doen van een echte taak, niet voor het openen van de app.",
    footEmpty: "Vertel eerst hierboven wat je deed. De streak is alleen voor echte taken.",
    settings: "Instellingen", language: "Taal", resetLabel: "Reset (opnieuw beginnen)",
    resetConfirm: "Dit wist je voortgang op dit apparaat. Opnieuw beginnen?", cancel: "Annuleer", reset: "Reset", close: "Sluit",
  },
};

/* --------------------------- persistence -------------------------- */
const KEY = "reps_state_v2";
const emptyState = (lang = "en") => ({ lang, profile: null, scan: null, loops: {}, reps: 0, streak: 0, lastDay: null, badges: [] });
async function loadState() {
  try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : emptyState(); }
  catch { return emptyState(); }
}
async function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
async function clearState() { try { localStorage.removeItem(KEY); } catch {} }

/* ----------------------------- coach ------------------------------ */
async function getCoachFeedback(loop, artefact, reflection, lang) {
  const langLine = lang === "nl" ? "Write your entire reply in natural, human Dutch (Nederlands)." : "Write your reply in natural, human English.";
  const content =
`You are the practice coach inside an AI-literacy app called Reps, made by The Ninth Tee. You help adults get better at using AI in their real life.
Character: warm, encouraging, concrete, honest. You're a coach, not an examiner, so always explain why. Never grade, score, or say pass/fail. Model responsible AI: never invent facts, and if a learner shared sensitive data, gently flag it and don't repeat it back. Keep the human in charge. ${langLine} Write like a real person talking: short, plain sentences. Do not use dashes as punctuation; use commas and full stops.

A learner just completed a practice task. Give them coaching feedback.
TASK: ${loop.title.en}. ${loop.doTask.en}
WHAT GOOD LOOKS LIKE: ${loop.coachFocus}
WHAT THEY SUBMITTED: ${artefact || "(nothing written)"}
THEIR REFLECTION: ${reflection || "(none)"}

Reply directly to the learner in three short parts, no headings:
1) one genuine, specific thing they did well,
2) the single most useful thing to improve and why it matters in real life,
3) one concrete next step they could try.
Under 120 words, and never grade them.`;
  const res = await fetch("/.netlify/functions/anthropic", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ max_tokens: 1000, messages: [{ role: "user", content }] }),
  });
  if (!res.ok) throw new Error("coach_unavailable");
  const data = await res.json();
  return data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}

/* --------------------------- UI helpers --------------------------- */
const Pill = ({ children, bg, fg }) => (
  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: bg, color: fg, fontFamily: SANS }}>{children}</span>
);
const Btn = ({ children, onClick, disabled, variant = "solid", full }) => {
  const base = { fontFamily: SANS, borderRadius: 12 };
  const styles = variant === "solid" ? { ...base, background: disabled ? C.sage : C.emerald, color: C.white }
    : variant === "ghost" ? { ...base, background: "transparent", color: C.emerald, border: `1.5px solid ${C.emerald}` }
    : { ...base, background: C.white, color: C.ink, border: `1.5px solid ${C.line}` };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-5 py-3 text-sm font-semibold active:scale-[.99] ${full ? "w-full" : ""} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      style={styles}>{children}</button>
  );
};
function LangToggle({ lang, onChange }) {
  return (
    <div className="inline-flex" style={{ border: `1.5px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
      {["en", "nl"].map((l) => (
        <button key={l} onClick={() => onChange(l)} className="px-3 py-1.5 text-xs font-bold"
          style={{ background: lang === l ? C.emerald : C.white, color: lang === l ? C.white : C.sage, fontFamily: SANS }}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ App ------------------------------- */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [S, setS] = useState(emptyState());
  const [view, setView] = useState("home");
  const [activeLoop, setActiveLoop] = useState(null);
  const lang = S.lang || "en";
  const t = UI[lang];

  useEffect(() => { (async () => {
    const s = await loadState(); setS(s);
    setView(!s.profile ? "onboard" : !s.scan ? "scan" : "home");
    setLoading(false);
  })(); }, []);
  const commit = (next) => { setS(next); saveState(next); };
  const setLang = (l) => commit({ ...S, lang: l });
  const doReset = () => { const e = emptyState(lang); setS(e); saveState(e); setActiveLoop(null); setView("onboard"); };

  if (loading) return (
    <div style={{ background: C.paper, minHeight: "100vh", fontFamily: SANS, color: C.sage }} className="flex items-center justify-center">{t.loading}</div>
  );
  return (
    <div style={{ background: C.paper, minHeight: "100vh", fontFamily: SANS, color: C.ink }}>
      <div className="mx-auto w-full" style={{ maxWidth: 460 }}>
        {view === "onboard" && <Onboard t={t} lang={lang} setLang={setLang} onDone={(profile) => { commit({ ...S, profile }); setView("scan"); }} />}
        {view === "scan" && <Scan t={t} lang={lang} onDone={(scan) => { commit({ ...S, scan }); setView("insight"); }} />}
        {view === "insight" && <Insight t={t} lang={lang} S={S} onContinue={() => setView("home")} />}
        {view === "home" && <Home t={t} lang={lang} S={S} openLoop={(l) => { setActiveLoop(l); setView("loop"); }} goInsight={() => setView("insight")} setLang={setLang} doReset={doReset} />}
        {view === "loop" && <LoopView t={t} lang={lang} loop={activeLoop} S={S} commit={commit} back={() => setView("home")} />}
      </div>
    </div>
  );
}

/* --------------------------- Onboarding --------------------------- */
function Onboard({ t, lang, setLang, onDone }) {
  const [name, setName] = useState("");
  const [ctx, setCtx] = useState("personal");
  return (
    <div className="px-6 pt-10 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div style={{ fontFamily: SANS, color: C.emerald, letterSpacing: 2 }} className="text-xs font-bold uppercase">Reps</div>
        <LangToggle lang={lang} onChange={setLang} />
      </div>
      <h1 style={{ fontFamily: SERIF, color: C.ink, lineHeight: 1.1 }} className="text-4xl mb-4">{t.tagline}</h1>
      <p style={{ color: C.inkSoft }} className="text-base mb-2 leading-relaxed">{t.intro}</p>
      <div className="mt-8">
        <label style={{ color: C.sage }} className="text-xs font-semibold uppercase tracking-wide">{t.nameLabel}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePh}
          className="w-full mt-2 px-4 py-3 text-base outline-none" style={{ background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 12, fontFamily: SANS, color: C.ink }} />
      </div>
      <div className="mt-6">
        <label style={{ color: C.sage }} className="text-xs font-semibold uppercase tracking-wide">{t.practiceLabel}</label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[["personal", t.lifeT, t.lifeSub], ["work", t.workT, t.workSub]].map(([v, ti, sub]) => (
            <button key={v} onClick={() => setCtx(v)} className="text-left px-4 py-3 active:scale-[.99]"
              style={{ borderRadius: 12, background: ctx === v ? C.emeraldSoft : C.white, border: `1.5px solid ${ctx === v ? C.emerald : C.line}` }}>
              <div style={{ color: C.ink, fontFamily: SANS }} className="text-sm font-semibold">{ti}</div>
              <div style={{ color: C.sage }} className="text-xs mt-0.5">{sub}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-9">
        <Btn full onClick={() => onDone({ name: name.trim() || (lang === "nl" ? "daar" : "there"), ctx })}>{t.startBtn}</Btn>
        <p style={{ color: C.sage }} className="text-xs mt-3 text-center">{t.startSub}</p>
      </div>
    </div>
  );
}

/* ------------------------------ Scan ------------------------------ */
async function scoreTask(task, answer) {
  const content = `You are scoring one answer from an advisory AI-literacy insight scan, for internal placement only. Be fair, consistent and evidence-based.
TASK SHOWN TO LEARNER: ${task.en}
WHAT A PASSING ANSWER MUST CONTAIN: ${task.criteria}
LEVEL ANCHORS: ${task.anchors}
LEARNER'S ANSWER: ${answer || "(blank)"}
Return ONLY this JSON and nothing else: {"level_supported": "Aware|Explorer|Integrator", "result": "Pass|Partial|Fail"}`;
  const res = await fetch("/.netlify/functions/anthropic", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ max_tokens: 300, messages: [{ role: "user", content }] }),
  });
  if (!res.ok) throw new Error("score_failed");
  const data = await res.json();
  const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const j = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
  const idx = ["Aware", "Explorer", "Integrator", "Creator"].indexOf(j.level_supported);
  return idx < 0 ? 1 : idx;
}

function Scan({ t, lang, onDone }) {
  const [step, setStep] = useState(0);
  const [claim, setClaim] = useState({});
  const [sj, setSj] = useState({});
  const [taskAns, setTaskAns] = useState({});
  const [scoring, setScoring] = useState(false);
  const d = DOMAINS[step];
  const item = SCAN[d.id];
  const kind = PROOF_KIND[d.id];
  const cur = { claim: claim[d.id], sj: sj[d.id], task: taskAns[d.id] };
  const proof = kind === "sj" && cur.claim !== undefined ? item.proofs[cur.claim] : null;
  const ready = cur.claim !== undefined && (kind === "sj" ? cur.sj !== undefined : !!(cur.task && cur.task.trim()));

  const finish = async () => {
    setScoring(true);
    const results = {};
    for (const dm of DOMAINS) {
      const ci = claim[dm.id] ?? 0;
      if (PROOF_KIND[dm.id] === "sj") {
        const correct = sj[dm.id] === SCAN[dm.id].proofs[ci].correct;
        results[dm.id] = { level: correct ? ci : Math.max(0, ci - 1), claimed: ci, proven: correct, gap: !correct && ci > 0 };
      } else {
        let lvl;
        try { lvl = await scoreTask(TASKS[dm.id], taskAns[dm.id]); } catch { lvl = ci; }
        results[dm.id] = { level: lvl, claimed: ci, proven: lvl >= ci, gap: lvl < ci };
      }
    }
    onDone({ results, date: Date.now() });
  };

  if (scoring) return (
    <div className="px-6 flex flex-col items-center justify-center text-center" style={{ minHeight: "80vh" }}>
      <div style={{ fontFamily: SERIF, color: C.ink }} className="text-2xl mb-2">{t.scoringMsg}</div>
      <div style={{ color: C.sage }} className="text-sm">{t.scanFoot}</div>
    </div>
  );

  return (
    <div className="px-6 pt-12 pb-10">
      <div className="flex items-center gap-1.5 mb-8">
        {DOMAINS.map((_, i) => (<div key={i} style={{ height: 4, borderRadius: 2, flex: 1, background: i <= step ? C.emerald : C.line }} />))}
      </div>
      <Pill bg={C.emeraldSoft} fg={C.emeraldDk}>{d.name[lang]}</Pill>
      <p style={{ color: C.sage }} className="text-sm mt-3 mb-6">{d.blurb[lang]}</p>

      <div style={{ color: C.ink }} className="text-sm font-semibold mb-2">{t.tickHighest}</div>
      <div className="space-y-2 mb-6">
        {item.claims[lang].map((c, i) => (
          <button key={i} onClick={() => { setClaim({ ...claim, [d.id]: i }); setSj((p) => ({ ...p, [d.id]: undefined })); }} className="w-full text-left px-4 py-3 active:scale-[.995]"
            style={{ borderRadius: 12, background: cur.claim === i ? C.emeraldSoft : C.white, border: `1.5px solid ${cur.claim === i ? C.emerald : C.line}`, color: C.ink }}>
            <span className="text-sm">{c}</span>
          </button>
        ))}
      </div>

      {cur.claim === undefined ? (
        <div style={{ background: C.card, border: `1px dashed ${C.line}`, borderRadius: 12, color: C.sage }} className="px-4 py-4 text-sm mb-8">{t.pickHint}</div>
      ) : kind === "sj" ? (
        <div style={{ borderTop: `1.5px solid ${C.line}` }} className="pt-6">
          <div style={{ color: C.emeraldDk }} className="text-xs font-semibold mb-1">{t.youSaid} "{item.claims[lang][cur.claim]}"</div>
          <div style={{ color: C.ink }} className="text-sm font-semibold mb-3">{t.showIt}</div>
          <p style={{ color: C.inkSoft }} className="text-sm mb-3">{proof.q[lang]}</p>
          <div className="space-y-2 mb-8">
            {proof.opts[lang].map((o, i) => (
              <button key={i} onClick={() => setSj({ ...sj, [d.id]: i })} className="w-full text-left px-4 py-3 flex gap-3 active:scale-[.995]"
                style={{ borderRadius: 12, background: cur.sj === i ? C.emeraldSoft : C.white, border: `1.5px solid ${cur.sj === i ? C.emerald : C.line}`, color: C.ink }}>
                <span style={{ color: cur.sj === i ? C.emerald : C.sage }} className="text-sm font-bold">{"ABCD"[i]}</span>
                <span className="text-sm">{o}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ borderTop: `1.5px solid ${C.line}` }} className="pt-6">
          <div style={{ color: C.emeraldDk }} className="text-xs font-semibold mb-1">{t.youSaid} "{item.claims[lang][cur.claim]}"</div>
          <div style={{ color: C.ink }} className="text-sm font-semibold mb-3">{t.showItReal}</div>
          <p style={{ color: C.inkSoft }} className="text-sm mb-3">{TASKS[d.id].prompt[lang]}</p>
          {TASKS[d.id].sample && (
            <div style={{ background: C.paper, border: `1px dashed ${C.line}`, borderRadius: 10 }} className="mb-3 px-3 py-2.5">
              <div style={{ color: C.sage }} className="text-[10px] font-bold uppercase mb-1">{t.taskLabel}</div>
              <div style={{ color: C.inkSoft }} className="text-[13px] leading-snug">{TASKS[d.id].sample[lang]}</div>
            </div>
          )}
          <textarea value={cur.task || ""} onChange={(e) => setTaskAns({ ...taskAns, [d.id]: e.target.value })} rows={4} placeholder={t.taskPh}
            className="w-full mb-8 px-4 py-3 text-[15px] outline-none resize-none" style={{ background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 12, color: C.ink, fontFamily: SANS }} />
        </div>
      )}

      <Btn full disabled={!ready} onClick={() => (step < 3 ? setStep(step + 1) : finish())}>{step < 3 ? t.next : t.seeInsight}</Btn>
      <p style={{ color: C.sage }} className="text-xs mt-3 text-center">{t.scanFoot}</p>
    </div>
  );
}

/* ----------------------------- Insight ---------------------------- */
function Insight({ t, lang, S, onContinue }) {
  const r = S.scan.results;
  return (
    <div className="px-6 pt-14 pb-10">
      <div style={{ color: C.emerald, letterSpacing: 2 }} className="text-xs font-bold uppercase mb-2">{t.yourInsight}</div>
      <h2 style={{ fontFamily: SERIF, color: C.ink }} className="text-3xl mb-2">{t.insightHead(S.profile.name)}</h2>
      <p style={{ color: C.inkSoft }} className="text-sm mb-8 leading-relaxed">{t.insightBody}</p>
      <div className="space-y-4">
        {DOMAINS.map((d) => {
          const lvl = r[d.id].level;
          return (
            <div key={d.id}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span style={{ color: C.ink }} className="text-sm font-semibold">{d.name[lang]}</span>
                <span style={{ color: C.emeraldDk }} className="text-xs font-bold">{LEVELS[lang][lvl]}</span>
              </div>
              <div style={{ background: C.line, height: 8, borderRadius: 6 }} className="w-full overflow-hidden">
                <div style={{ width: `${((lvl + 1) / 4) * 100}%`, height: "100%", background: C.emerald, borderRadius: 6 }} />
              </div>
              {r[d.id].gap && <div style={{ color: C.amber }} className="text-xs mt-1">{t.gapNote}</div>}
            </div>
          );
        })}
      </div>
      <div className="mt-9"><Btn full onClick={onContinue}>{t.startPractising}</Btn></div>
    </div>
  );
}

/* ------------------------------ Home ------------------------------ */
function Home({ t, lang, S, openLoop, goInsight, setLang, doReset }) {
  const [menu, setMenu] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const done = (id) => S.loops[id]?.done;
  const nextLoop = LOOPS.find((l) => !done(l.id));
  return (
    <div className="px-6 pt-10 pb-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div style={{ color: C.sage }} className="text-xs">{t.welcome}</div>
          <div style={{ fontFamily: SERIF, color: C.ink }} className="text-2xl">{S.profile.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ background: C.amberSoft, borderRadius: 12 }} className="px-3 py-2 text-center">
            <div style={{ color: C.amber, fontFamily: SANS }} className="text-lg font-extrabold leading-none">{S.streak}</div>
            <div style={{ color: C.amber }} className="text-[10px] font-semibold uppercase">{t.dayStreak}</div>
          </div>
          <div style={{ background: C.emeraldSoft, borderRadius: 12 }} className="px-3 py-2 text-center">
            <div style={{ color: C.emeraldDk, fontFamily: SANS }} className="text-lg font-extrabold leading-none">{S.reps}</div>
            <div style={{ color: C.emeraldDk }} className="text-[10px] font-semibold uppercase">{t.repsDone}</div>
          </div>
          <button onClick={() => setMenu(true)} style={{ color: C.sage, border: `1.5px solid ${C.line}`, borderRadius: 10, width: 38, height: 38, background: C.white }} className="text-lg leading-none">⚙</button>
        </div>
      </div>

      {menu && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(23,36,30,.35)", zIndex: 40 }} className="flex items-end justify-center" onClick={() => setMenu(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.paper, borderRadius: "18px 18px 0 0", width: "100%", maxWidth: 460 }} className="px-6 pt-6 pb-8">
            <div className="flex items-center justify-between mb-5">
              <div style={{ fontFamily: SERIF, color: C.ink }} className="text-xl">{t.settings}</div>
              <button onClick={() => setMenu(false)} style={{ color: C.sage }} className="text-sm font-semibold">{t.close}</button>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span style={{ color: C.ink }} className="text-sm font-semibold">{t.language}</span>
              <LangToggle lang={lang} onChange={setLang} />
            </div>
            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)}
                className="w-full text-left px-4 py-3" style={{ background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 12, color: C.amber, fontFamily: SANS }}>
                <span className="text-sm font-semibold">{t.resetLabel}</span>
              </button>
            ) : (
              <div style={{ background: C.amberSoft, borderRadius: 12 }} className="px-4 py-3">
                <div style={{ color: C.ink }} className="text-sm mb-3">{t.resetConfirm}</div>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmReset(false)} className="flex-1 px-4 py-2 text-sm font-semibold"
                    style={{ background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 10, color: C.ink, fontFamily: SANS }}>{t.cancel}</button>
                  <button onClick={() => { setConfirmReset(false); setMenu(false); doReset(); }} className="flex-1 px-4 py-2 text-sm font-semibold"
                    style={{ background: C.amber, borderRadius: 10, color: C.white, fontFamily: SANS, border: "none" }}>{t.reset}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {nextLoop ? (
        <button onClick={() => openLoop(nextLoop)} className="w-full text-left active:scale-[.99]" style={{ background: C.ink, borderRadius: 18, padding: 22 }}>
          <div style={{ color: C.amber, letterSpacing: 1.5 }} className="text-xs font-bold uppercase mb-2">{t.todaysRep}</div>
          <div style={{ fontFamily: SERIF, color: C.white }} className="text-2xl leading-tight mb-2">{nextLoop.title[lang]}</div>
          <div style={{ color: "#B9C6BF" }} className="text-sm mb-4">{t.realTaskSub(domById(nextLoop.domain).name[lang])}</div>
          <span style={{ background: C.emerald, color: C.white, borderRadius: 10 }} className="inline-block px-4 py-2 text-sm font-semibold">{t.start}</span>
        </button>
      ) : (
        <div style={{ background: C.emeraldSoft, borderRadius: 18, padding: 22 }}>
          <div style={{ fontFamily: SERIF, color: C.emeraldDk }} className="text-xl">{t.allDone}</div>
          <div style={{ color: C.emeraldDk }} className="text-sm mt-1">{t.allDoneSub}</div>
        </div>
      )}

      <button onClick={goInsight} style={{ color: C.emerald }} className="text-sm font-semibold mt-5 mb-7">{t.viewInsight}</button>

      <div style={{ color: C.sage }} className="text-xs font-bold uppercase tracking-wide mb-3">{t.allReps}</div>
      <div className="space-y-2.5">
        {LOOPS.map((l) => (
          <button key={l.id} onClick={() => openLoop(l)} className="w-full flex items-center gap-3 px-4 py-3 text-left active:scale-[.995]"
            style={{ background: C.card, borderRadius: 14, border: `1.5px solid ${C.line}` }}>
            <div style={{ background: done(l.id) ? C.emerald : C.paper, border: `1.5px solid ${done(l.id) ? C.emerald : C.line}`, borderRadius: 999, width: 26, height: 26, color: C.white }} className="flex items-center justify-center text-sm flex-shrink-0">{done(l.id) ? "✓" : ""}</div>
            <div className="flex-1 min-w-0">
              <div style={{ color: C.ink }} className="text-sm font-semibold truncate">{l.title[lang]}</div>
              <div style={{ color: C.sage }} className="text-xs">{domById(l.domain).name[lang]}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- Loop view --------------------------- */
function LoopView({ t, lang, loop, S, commit, back }) {
  const saved = S.loops[loop.id] || {};
  const [artefact, setArtefact] = useState(saved.artefact || "");
  const [reflection, setReflection] = useState(saved.reflection || "");
  const [feedback, setFeedback] = useState(saved.feedback || "");
  const [status, setStatus] = useState("idle");
  const scrollRef = useRef(null);

  const runCoach = async () => {
    if (!artefact.trim()) return;
    setStatus("loading"); setFeedback("");
    try {
      const fb = await getCoachFeedback(loop, artefact, reflection, lang);
      setFeedback(fb); setStatus("idle");
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch { setStatus("error"); }
  };
  const markDone = () => {
    const already = S.loops[loop.id]?.done;
    const today = new Date().toDateString();
    let streak = S.streak, reps = S.reps, lastDay = S.lastDay;
    if (!already) {
      reps += 1;
      if (lastDay !== today) { const y = new Date(Date.now() - 864e5).toDateString(); streak = lastDay === y ? streak + 1 : 1; lastDay = today; }
    }
    const next = { ...S, reps, streak, lastDay, loops: { ...S.loops, [loop.id]: { done: true, artefact, reflection, feedback } } };
    commit(next); back();
  };

  return (
    <div className="px-6 pt-12 pb-16">
      <button onClick={back} style={{ color: C.sage }} className="text-sm mb-6">← {t.back}</button>
      <Pill bg={C.emeraldSoft} fg={C.emeraldDk}>{domById(loop.domain).name[lang]}</Pill>
      <h2 style={{ fontFamily: SERIF, color: C.ink }} className="text-3xl mt-3 mb-5 leading-tight">{loop.title[lang]}</h2>

      <Section label={t.learn}><p style={{ color: C.inkSoft }} className="text-[15px] leading-relaxed">{loop.learn[lang]}</p></Section>

      <Section label={t.doL}>
        <p style={{ color: C.ink }} className="text-[15px] leading-relaxed">{loop.doTask[lang]}</p>
        {loop.template && (
          <div style={{ background: C.paper, border: `1px dashed ${C.line}`, borderRadius: 10 }} className="mt-3 px-3 py-2.5">
            <div style={{ color: C.sage }} className="text-[10px] font-bold uppercase mb-1">{t.promptStart}</div>
            <div style={{ color: C.inkSoft, fontFamily: SANS }} className="text-[13px] leading-snug">{loop.template[lang]}</div>
          </div>
        )}
      </Section>

      <div className="mt-6">
        <label style={{ color: C.sage }} className="text-xs font-bold uppercase tracking-wide">{t.whatYouDid}</label>
        <textarea value={artefact} onChange={(e) => setArtefact(e.target.value)} rows={5} placeholder={t.whatYouDidPh}
          className="w-full mt-2 px-4 py-3 text-[15px] outline-none resize-none" style={{ background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 12, color: C.ink, fontFamily: SANS }} />
      </div>
      <div className="mt-4">
        <label style={{ color: C.sage }} className="text-xs font-bold uppercase tracking-wide">{t.reflectionLabel}</label>
        <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={2} placeholder={loop.reflect[lang]}
          className="w-full mt-2 px-4 py-3 text-[15px] outline-none resize-none" style={{ background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 12, color: C.ink, fontFamily: SANS }} />
      </div>

      <div className="mt-5">
        <Btn full variant="ghost" disabled={!artefact.trim() || status === "loading"} onClick={runCoach}>
          {status === "loading" ? t.coachReading : feedback ? t.askAgain : t.getCoach}
        </Btn>
      </div>

      {status === "error" && (
        <div style={{ background: C.amberSoft, borderRadius: 12, color: C.amber }} className="mt-4 px-4 py-3 text-sm">{t.coachErr}</div>
      )}
      {feedback && (
        <div ref={scrollRef} style={{ background: C.ink, borderRadius: 16 }} className="mt-5 px-5 py-5">
          <div style={{ color: C.amber, letterSpacing: 1.5 }} className="text-xs font-bold uppercase mb-2">{t.coachHdr}</div>
          <p style={{ color: "#EAF0ED", whiteSpace: "pre-wrap" }} className="text-[15px] leading-relaxed">{feedback}</p>
        </div>
      )}

      <div className="mt-7">
        <Btn full disabled={!artefact.trim()} onClick={markDone}>{saved.done ? t.saved : t.markDone}</Btn>
        <p style={{ color: artefact.trim() ? C.sage : C.amber }} className="text-xs mt-3 text-center">{artefact.trim() ? t.footDone : t.footEmpty}</p>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="mt-5">
      <div style={{ color: C.emerald, letterSpacing: 1.5 }} className="text-[11px] font-bold uppercase mb-2">{label}</div>
      {children}
    </div>
  );
}
