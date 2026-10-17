# YouTube Notes

Take notes alongside YouTube videos in Obsidian, with playback controls, clickable timestamps, and saved playback positions. Requires **Obsidian 1.13.0 or newer** on desktop.

YouTube Notes is an updated fork of [Media Notes](https://github.com/jemstelos/obsidian-media-notes), created by [jemstelos](https://github.com/jemstelos). The original concept and implementation are theirs. This fork updates that work for current Obsidian versions; it is not a new implementation or an official Obsidian or YouTube product.

## Features

- Keep an embedded video beside or above your notes in editing view.
- Play, pause, rewind, fast-forward, and change playback speed without leaving the editor.
- Insert timestamp links and click them to seek within the note's video.
- Resume videos from saved playback positions.
- Create notes from the browser using a bookmarklet or an Obsidian Web Clipper template.
- Find all 11 preferences through Obsidian's built-in settings search.

![Original Media Notes demonstration, courtesy of jemstelos](images/media-notes.gif)

## Installation

This fork is distributed through [BRAT](https://github.com/TfTHacker/obsidian42-brat) and [GitHub releases](https://github.com/nathancashion/obsidian-media-notes/releases). It is **not currently listed in the community plugin directory**.

### BRAT

1. Install and enable BRAT in Obsidian.
2. Use BRAT's command to add a beta plugin and enter `https://github.com/nathancashion/obsidian-media-notes`.
3. Enable **YouTube Notes** in Community plugins.

The plugin ID is `youtube-notes`. The repository URL remains unchanged.

### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/nathancashion/obsidian-media-notes/releases/latest).
2. Create a `youtube-notes` folder inside your vault's plugin directory (normally `.obsidian/plugins/`).
3. Copy those three files into it, reload Obsidian, and enable **YouTube Notes**.

## Create a note

### Add a media property manually

Add a `media_link` property containing a YouTube video URL, then open the note in editing view. For example:

```markdown
---
media_link: https://www.youtube.com/watch?v=MFXWY8TqSWw
---

## Notes

[02:01]() - A useful insight.
```

The player supports standard watch URLs, `youtu.be` links, Shorts URLs, and embed URLs. Playback depends on YouTube allowing the video to be embedded. Reading mode and non-YouTube media providers are not currently supported.

### Bookmarklet: capture the current playback position

1. Create a browser bookmark named **YouTube Notes**.
2. Copy the entire line below into the bookmark's URL/location field, including `javascript:`. You can also copy it from [`bookmarklet.js`](bookmarklet.js) using GitHub's **Raw** view.
3. Open a YouTube video and click the bookmark. Allow the browser to open Obsidian and confirm the new-note action if prompted.

<!-- bookmarklet:start -->
```javascript
javascript:(function()%7Bfunction%20u(n%3Dwindow%2Cs%3Ddocument)%7Bconst%20e%3Dnew%20URL(n.location.href)%2Cl%3De.hostname%3D%3D%3D%22youtube.com%22%7C%7Ce.hostname.endsWith(%22.youtube.com%22)%2Cc%3D%5B%22youtu.be%22%2C%22www.youtu.be%22%5D.includes(e.hostname)%3Bif(!%5B%22https%3A%22%2C%22http%3A%22%5D.includes(e.protocol)%7C%7C!l%26%26!c)return%3Bconst%20a%3De.pathname.split(%22%2F%22).filter(Boolean)%2Cr%3Dc%3Fa%5B0%5D%3Ae.searchParams.get(%22v%22)%7C%7C(%5B%22shorts%22%2C%22embed%22%2C%22live%22%5D.includes(a%5B0%5D)%3Fa%5B1%5D%3Anull)%3Bif(!r)return%3Bconst%20o%3Dnew%20URL(%22https%3A%2F%2Fwww.youtube.com%2Fwatch%22)%3Bo.searchParams.set(%22v%22%2Cr)%3Bconst%20t%3Ds.querySelector(%22video%22)%2Ci%3Dt%3D%3Dnull%3Fvoid%200%3At.currentTime%3BNumber.isFinite(i)%26%26i%3E%3D0%3Fo.searchParams.set(%22t%22%2CString(Math.floor(i)))%3A%2F%5E%5Cd%2B%24%2F.test(e.searchParams.get(%22t%22)%7C%7C%22%22)%26%26o.searchParams.set(%22t%22%2Ce.searchParams.get(%22t%22))%2Ct%26%26!t.paused%26%26t.pause()%3Bconst%20d%3Dm(s.title.replace(%2F%20-%20YouTube%24%2F%2C%22%22))%2Ch%3D%60---%0Amedia_link%3A%20%60%2BJSON.stringify(o.toString())%2B%60%0A---%0A%23Video%20%23YouTube%0A%0A%23%23%20Notes%0A%0A%60%3Bn.open(%22obsidian%3A%2F%2Fnew%3Fname%3D%22%2BencodeURIComponent(d%2B%22.md%22)%2B%22%26content%3D%22%2BencodeURIComponent(h))%7Dconst%20m%3Dn%3D%3E%22Video.%20%22%2B(n.replace(%2F%5B%3A%2F%5C%5C%5E%7C%23%5B%5C%5D*%3F%22%3C%3E%5D%2Fg%2C%22.%22).replace(%2F%5Cs%2B%2Fg%2C%22%20%22).trim().replace(%2F%5B.%20%5D%2B%24%2F%2C%22%22)%7C%7C%22YouTube%20video%22)%3Bu()%7D)()%3B
```
<!-- bookmarklet:end -->

The bookmarklet pauses a playing video, captures its current time when a video element is available, and creates a note with a `media_link` property, tags, and a Notes section. It converts supported video pages to a standard watch URL and removes unrelated query parameters. Filenames start with `Video. ` and replace characters that cannot be used in note names.

Without a video element, it can still create the note and retain an existing numeric `t` URL parameter. For videos you have already watched in Obsidian, an existing saved playback position takes precedence over the timestamp in the URL.

For a draggable bookmark, download this repository and open [`dist/index.html`](dist/index.html) in your browser. The [original bookmarklet page](https://obsidian-media-notes.netlify.app/) belongs to jemstelos; this fork does not update that site.

### Obsidian Web Clipper: capture page content

1. Install [Obsidian Web Clipper](https://obsidian.md/clipper).
2. Download [`YT-notes-webclipper.json`](YT-notes-webclipper.json) using GitHub's **Download raw file** button, or use the attached file in the latest release.
3. Open Web Clipper settings, select a template, and click **Import**, or drag the JSON file into the template area. See the [official import instructions](https://help.obsidian.md/web-clipper/templates).
4. Select **YouTube Notes**, choose your destination vault, and adjust the default `YouTube` folder if needed.
5. Open a YouTube video page and save the note. If another template takes precedence, select **YouTube Notes** manually.

The template uses the page title as the note name. It saves the page URL in `media_link` and `source`, adds a title property and an empty optional `published` date, and includes space for notes and clipped page content under a Description heading.

**Unlike the bookmarklet, Web Clipper does not pause the video or capture its current playback position.** It saves the page URL as-is, including a timestamp only if one is already in that URL. Its URL triggers select the template; they do not convert URLs or guarantee that a particular page contains an embeddable video.

The template matches the contribution submitted in [upstream PR #50](https://github.com/jemstelos/obsidian-media-notes/pull/50), except that this fork uses the display name YouTube Notes.

## Controls and timestamps

Assign hotkeys under **Settings → Hotkeys** by searching for **YouTube Notes**. No hotkeys are assigned by default.

Available commands are Insert Timestamp, Play/Pause, Rewind, Fast Forward, Speed up, Slow down, and Toggle horizontal/vertical split. Keep a media note's editor active when using them.

Suggested macOS bindings are Control-J for rewind, Control-K for play/pause, Control-L for fast-forward, and Control-I for inserting a timestamp. Choose alternatives if these conflict with your other shortcuts.

Timestamp links such as `[02:01]()` or `[1:02:01]()` seek the current note's player when clicked in editing view. The default insertion template is `[{ts}]({link})` followed by a newline:

- `{ts}` inserts the formatted timestamp.
- `{link}` inserts a timestamped YouTube URL.
- Literal `\n` and actual line breaks are supported in the template.

## Settings

Search for a preference such as **timestamp**, **progress bar**, or **split view** in Obsidian's settings search, or open **Settings → YouTube Notes**.

Configure the default split orientation, player height/width, rewind/fast-forward interval, timestamp offset and template, background color, progress-bar visibility and color, timestamp visibility, and whether insertion pauses playback. Existing notes remain ordinary Markdown files with a `media_link` property.

## Network use and privacy

Playback requires an internet connection. The plugin embeds the YouTube player and loads YouTube's iframe API; YouTube and its Google services receive the requests required for playback and may use cookies or collect data under [Google's privacy policy](https://policies.google.com/privacy). Embedding and sign-in restrictions imposed by YouTube still apply.

The plugin itself adds no telemetry, requires no API key, and provides no AI functionality. Notes stay in your vault. Preferences, video URLs, and saved playback positions are stored in the plugin's local `data.json` file and may be synced if you sync plugin data. The bookmarklet sends the captured title and URL directly to Obsidian through an `obsidian://new` URI.

## Credits and project status

- **Original creator:** [jemstelos](https://github.com/jemstelos).
- **Original project:** [Media Notes](https://github.com/jemstelos/obsidian-media-notes), including the concept, initial plugin, demonstration above, and [bookmarklet workflow](https://obsidian-media-notes.netlify.app/).
- **Fork maintenance:** [Nathan Cashion](https://github.com/nathancashion), updating the original work for Obsidian 1.13.0+. Maintenance changes were made with AI-agent assistance and checked with tests and builds.
- **License:** [MIT](LICENSE); original copyright and license notices are retained.

Maintenance work has also been offered upstream in [PR #49 (runtime compatibility)](https://github.com/jemstelos/obsidian-media-notes/pull/49), [PR #50 (Web Clipper)](https://github.com/jemstelos/obsidian-media-notes/pull/50), and [PR #51 (searchable settings)](https://github.com/jemstelos/obsidian-media-notes/pull/51).

Any separate community-directory submission remains pending fulfillment of Obsidian's [fork-policy requirements](https://docs.obsidian.md/community-directory/developer-policies). Renaming this fork does not imply approval from the original author.

Report issues with this fork in [its issue tracker](https://github.com/nathancashion/obsidian-media-notes/issues). To support the original creator, visit [jemstelos's support page](https://www.buymeacoffee.com/jemstelos).
