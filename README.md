pc-voice-interface
==================

This is a node-webkit app to control your pc via voice commands.
For voice recognition and lemmas extraction it uses Yandex SpeechKit HTTP API.

Right now it can execute any file or open any folder on your pc. 
If there are multiple files matching user's request, it asks user, which one to execute. 
The app can also learn which file it should assotiate with the concrete request (useful for latin filenames, like 'photoshop', 'diablo', etc.)
The work is in progress, so it will learn more things very soon.

Anyway, even now it is very cool, 'cause you don't need to remember where your files and programmes are. Just command it to open something (or turn on, or find, etc.) and the app will find and open the file for you.

<img src="http://i.gyazo.com/4491ddc6bd7d04a2f8d846219ac347fa.png">

To use it, you need to replace the variable 'yourAPIkey' in index.html with your Yandex SpeechKit API key. You can get it here: https://developer.tech.yandex.ru
Then build an nw app by following this instructions: https://github.com/rogerwang/node-webkit
