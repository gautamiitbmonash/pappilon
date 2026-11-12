# Pappilon (app)

**Map how your commute feels.** Pappilon is a free, public-domain research web app that lets women commuters record how public-transport journeys feel: the stops, streets, platforms and compartments they pass through. Participants add places on a map, look at a picture of each one, and pin what they notice, with a score, tags and a short note. Researchers study these observations across many places to understand what makes them feel safe or unsafe.

> Participation is voluntary and uses informed consent. Pappilon is **not** an emergency service. In an emergency, call 112.

**This repository holds the app's source code.** The project website, searchable wiki and illustrated user guide are in a separate repository: [SITE-REPO](https://github.com/USER/SITE-REPO).

[Open the app](https://USER.github.io/APP-REPO/) · [Project website](https://USER.github.io/SITE-REPO/) · [Wiki](https://USER.github.io/SITE-REPO/wiki.html) · [User guide (PDF)](https://USER.github.io/SITE-REPO/user-guide.pdf)

---

## Contents

- [What it does](#what-it-does)
- [Setting up your own copy](#setting-up-your-own-copy)
- [Repository layout](#repository-layout)
- [Built with](#built-with)
- [Privacy, ethics and safety](#privacy-ethics-and-safety)
- [Contributing](#contributing)
- [Licence](#licence)
- [Citing this project](#citing-this-project)
- [Team and acknowledgements](#team-and-acknowledgements)
- [Contact](#contact)

## What it does

Every outing moves through five stages:

1. **Add** places on the map, by tapping it or pressing REPORT where you stand.
2. **Look** at a picture of each place: Street View, a standard Mumbai bus, metro or local-train interior, or your own image.
3. **Pin** what you notice, using icons from three lenses (harassment and unwanted attention, street conditions, human behaviour and social response), with a 1 to 5 score, tags and a note.
4. **Settle** the place with a "gut check" rating of how safe the whole place feels.
5. **Send off** your work as a zip of annotated pictures and CSV lists.

Other features:

- Works on a phone in Chrome and can be installed as an app (PWA), with offline support.
- Optional daily reminders for people who have not recorded that day.
- An informed-consent flow shown once after account creation, stored as a signed record.
- Levels and Insights to encourage participants.
- No real names: sign-in uses a project-issued User ID.

If you are a participant, you do not need this repository. Open the app link above and follow the [wiki](https://USER.github.io/SITE-REPO/wiki.html).

## Setting up your own copy

Pappilon is a static web app (HTML, CSS and JavaScript) backed by [Supabase](https://supabase.com). You can host the files on GitHub Pages or any static host over HTTPS. There is no build step.

### 1. Create a Supabase project

1. Create a free project at supabase.com.
2. In **Authentication**, enable email sign-in and turn off email confirmation. The app creates accounts as `<user-id>@sheloiterlens.app`, a fixed internal domain that is kept for database compatibility. Do not change it.
3. In the **SQL editor**, run the main setup SQL (the app's setup screen shows it), then run `supabase_consent_setup.sql` from this repository. This creates the tables `sll_points`, `sll_annotations`, `sll_reviews` and `sll_consents`, the private storage buckets `exports` and `consents`, and the row-level security policies.

### 2. Point the app at your project

Open `index.html` and set your project URL and anon (public) key in the configuration block near the top of the script. The anon key is designed to be public, and row-level security protects the data. **Never** put the `service_role` key in the app.

If you use Google Street View, restrict your API key to your site's address (HTTP referrers) and add every address the app is served from.

### 3. Publish

1. Push the repository to GitHub.
2. In **Settings → Pages**, choose the branch and folder to serve.
3. Open the published address in Chrome on a phone. Confirm that sign-up, consent and a test recording work, then test **Install app** and a reminder.

### 4. Collect the data

- Participants export a zip (annotated images, a pins CSV and a points CSV) and share it with you, or you read the records from Supabase.
- Signed consent forms are stored in the private `consents` bucket with a SHA-256 hash. Download them from the Supabase dashboard (**Storage → consents**) or use the `sll_consents` table.

### Local testing

Service workers and installation need `https` or `localhost`, so test with a local server instead of double-clicking the file:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

### Standard interior images

The app has buttons for standard bus, metro and local-train interiors. Place your images in the folder the app expects and check the file names in `index.html`. Images may be 360-degree panoramas or flat images. Make sure you have the right to use and publish any image you add.

### Moving the app to a new address

The manifest, service worker and icons use relative paths, so the whole folder can move. A new address counts as a new installed app: participants must reinstall, and pictures or reminder settings stored on their phone do not carry over. Accounts and data in Supabase are not affected. Update any API-key referrer restrictions before moving.

## Repository layout

```
index.html                   the Pappilon web app
manifest.webmanifest         install settings (PWA)
sw.js                        offline cache and reminders
icons/                       app icons
supabase_consent_setup.sql   database and storage setup for consent
LICENSE                      CC0 1.0 Universal legal text
NOTICE.md                    third-party credits
README.md                    this file
```

Adjust this list to match your actual folders.

## Built with

- [Leaflet](https://leafletjs.com) for the map
- [Photo Sphere Viewer](https://photo-sphere-viewer.js.org) for 360-degree and flat pictures
- [PapaParse](https://www.papaparse.com) for CSV
- [JSZip](https://stuk.github.io/jszip/) for exports
- [Supabase](https://supabase.com) for accounts and storage
- Map tiles by CARTO, map data from OpenStreetMap contributors

See [NOTICE.md](NOTICE.md) for licences.

## Privacy, ethics and safety

- Taking part is voluntary and participants can stop at any time without consequences.
- Informed consent is collected once, before any data is recorded. The text of the consent form is versioned.
- Participants are asked not to record places within 500 metres of their home or workplace, and not to record names, phone numbers, number plates or faces.
- Data is stored in a private Supabase project under row-level security. Do not make buckets or tables public.
- If you deploy Pappilon for your own study, get approval from your own ethics board and adapt the consent text, contacts and helplines to your context.

## Contributing

Issues and pull requests are welcome.

1. Open an issue describing the bug or idea first.
2. Fork the repository, create a branch, and make your change.
3. Keep the app a plain static site with no build step unless discussed.
4. By contributing, you agree to dedicate your contribution to the public domain under CC0 1.0, the same as the project.

Please do not post real participant data, screenshots with identifying details, keys or passwords in issues.

## Licence

[![CC0](https://licensebuttons.net/p/zero/1.0/88x31.png)](https://creativecommons.org/publicdomain/zero/1.0/)

To the extent possible under law, COPYRIGHT HOLDER has waived all copyright and related rights to Pappilon (the software and its documentation). This work is published from INSTITUTION / COUNTRY under the **Creative Commons Zero 1.0 Universal** public domain dedication (SPDX: `CC0-1.0`). See the [LICENSE](LICENSE) file or <https://creativecommons.org/publicdomain/zero/1.0/>.

In plain words: you may copy, modify, distribute and use Pappilon, including for commercial purposes, without asking permission and without giving credit. Attribution is appreciated but not required.

Things CC0 does not do:

- It does not license any **patents** or **trademarks**. The Pappilon name and any logos are not covered.
- It gives **no warranty**. The software is provided as is.
- It does not cover **participants' data**, which is governed by the study's consent form.
- It does not change the licences of **third-party software** that Pappilon uses. Those keep their own terms and notices, listed in [NOTICE.md](NOTICE.md).
- It does not cover **logos, photographs or standard interior images**, which belong to their owners.

## Citing this project

If you use Pappilon in research, please cite it:

```
SURNAME, Given name (YEAR). Pappilon: a web app for recording women commuters' experiences of public transport (Version 1.0) [Software]. URL
```

Consider adding a `CITATION.cff` file so GitHub shows a "Cite this repository" button.

## Team and acknowledgements

- Student investigator: NAME, INSTITUTION
- Main supervisors: NAME, NAME
- Co-supervisors: NAME, NAME
- Funding and support: NAMES

We thank all participants and partner organisations.

## Contact

Questions about the study: CONTACT EMAIL
Ethics board: IRB EMAIL
Software issues: please use the GitHub Issues tab.
