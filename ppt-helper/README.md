# PowerPointObserver

This application is based on [PowerPointToOBSSceneSwitcher](https://github.com/shanselman/PowerPointToOBSSceneSwitcher). Originally this was an interface to connect PowerPoint
and OBS, but this has been adapted to observe PowerPoint slide changes and
send them to the ShowOfHands API endpoints to sync slides and snippets on screen

Note this won't build with "dotnet build," instead open a Visual Studio 2019 Developer Command Prompt and build with "msbuild"

This video explains how the original app works:

[![Watch the video](https://i.imgur.com/v369AtP.png)](https://www.youtube.com/watch?v=ciNcxi2bPwM)

## Usage
* Set the application server
```<language>
#SOH server: {URL to show-of-hands instance}
```

* Show a snippet
```<language>
#SOH snippet: {snippet-tag}
#SOH snippet
```

If you use `snippet:` you can pass any tag name (without the "#") to reveal
that snippet. If you just use `snippet`, the application will search the slide 
text for a hashtag ("#") and will assume that is the snippet name.

* Open a poll
```<language>
#SOH poll: {poll-tag}
#SOH poll
```

If you use `poll:` you can pass any tag name (without the "#") to reveal
that poll. If you just use `poll`, the application will search the slide 
text for a hashtag ("#") and will assume that is the snippet name.


* Open a poll
```<language>
#SOH autosnippet: {type}
```
Rather than having to annotate every slide with poll/snippet, you can set
autosnippet to "poll" or "snippet" and that will assume that when the 
application finds a hashtag in the slide text, it will assume the tag 
is for the given type

Example:
```<language>
#SOH autosnippet: snippet  # assume all tags are snippets
#SOH autosnippet: poll     # assume all tags are polls
#SOH autosnippet:          # don't autodetect tags
```