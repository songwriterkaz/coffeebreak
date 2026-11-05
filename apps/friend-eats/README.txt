Coffeebreak Two Plates
======================
A free browser app with one rule: you order food for yourself AND a friend.
Both are required. The app will not continue with only one person.

WHAT IT DOES
- Step 1: consent. You only order for yourself and for a friend who agrees to
  receive food. No strangers, no random people.
- Step 2: your nickname, street address and suburb.
- Step 3: your friend, either with you (they type their own details on the
  same device) or on their own phone (invite link, see below).
- Step 4: restaurant or cuisine preference and notes. No addresses here.
- Step 5: one big button per person, "Open Uber Eats for [nickname]", plus a
  checklist: self order started, friend order started, both marked done.
  The checklist is an honour system. The app cannot see Uber.

UBER EATS (HONEST NOTE)
This app does not connect to Uber and does not use any Uber API. It cannot place
an order. The button opens https://www.ubereats.com/feed?diningMode=DELIVERY in
a new tab (the /au/ version if the device language or time zone is Australian).
Each person sets their own delivery address inside Uber Eats, adds the same meal
and checks out there. Placement happens in Uber's own site or app.

PRIVACY MODEL
- There is no server. The app makes no network requests at all (except when you
  press the Uber Eats button, which just opens Uber Eats in a new tab).
- Details are saved with localStorage in the browser on the device where they
  were typed. They are never sent anywhere, never put in a URL or query string,
  and no sample addresses are included in the files.
- After saving, the screen only shows a nickname and suburb, for example
  "Friend address saved on their device (Hamilton)". The street address is not
  displayed again. The owner of an address can press "Copy my address" to paste
  it into Uber Eats. The friend's address has no copy button on the host's view.
- "Erase everything saved on this device" at the bottom wipes it all.
- Caveat: if the friend types their details on the host's device, the data sits
  in that same browser storage. For real separation use the invite link so the
  friend's address stays on the friend's own phone.

HOW THE FRIEND INVITE CODE WORKS
1. When you choose "Friend uses own phone" and add their nickname, the app shows
   a random 6 character code and a link, such as
   https://your-page/index.html#join=AB3CD4
2. The link contains only that code. No address and no names. It sits after the
   # sign, so browsers do not even send it to a web server.
3. Your friend opens the link on their phone. They tick that they agree, type
   their own nickname, street address and suburb, and press save. It stays on
   their phone. They get their own "Open Uber Eats for [nickname]" button.
4. Because there is no server, the two phones cannot talk to each other. The
   code is a label, not a live connection. Your friend tells you they have
   saved their address, and you tick two boxes (they agreed, they saved it).
   Only then can you continue.

BRANDING AND RIGHTS
Coffeebreak logo (logo.png). Coffeebreak keeps all rights to its products,
designs, apps, name and logo. Fans may not copy this app or make their own
versions of it. Uber Eats is a trademark of its owner and is not affiliated with
Coffeebreak. More from Coffeebreak: https://coffeebreaks.itch.io

FILES
index.html   the whole app (plain HTML, CSS and JS, works offline)
logo.png     Coffeebreak logo

For itch.io: upload the zip as an HTML project, played in the browser. Keep the
itch description free of any address.
