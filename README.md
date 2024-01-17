<h1 align="center">Schoolingo Angular</h1>

## About project
- It is a modern school system designed for communication between the school, students and parents of the students.
- In the system you can already find the `timetable`, `classbook`, `absence` and `lessons overview`.
- The whole system runs on socket.io. Further packages used are `angularx-qrcode` for displaying QR codes, `diacritics` (it is a simple code, so it was directly implemented in the code) for better and easier search.

## Features
- The web automatically detects the selected theme in the system and sets the web to that theme
- Fastlogin (Login with QRCode) by scanning qrcode in mobile app

## Build
### Requirements
- [Node](https://nodejs.org/en/) - To install packages
- [Git](https://git-scm.com/) - To download source code (optional), you can also download on github

1. Download Source code 
with GIT:
```sh
git clone https://github.com/MasT3r1k/Todo.git
```
or you can download it on github

2. Install packages
```sh
npm install
```

3. Build application
```sh
npm run build
```

## Login page
- Login page supports 2 methods to login: Classic login with username and password or you can login by scan qrcode on mobile app
![Loginpage](/readme/LoginPage.png)

## Example of Timetable
- You can print timetable
- You can pick any week you want to see
- Today's date is highlighted
- Each lesson has his teacher, subject and room
![Timetable](/readme/Timetable.png)

## Subject list
- Here is basic table of subjects you as student have
![Subjectlist](/readme/SubjectList.png)

## Classbook
- As teacher you have access to classbook
- There is basic information about lesson
![Classbook](/readme/writeLesson.png)
- And also have absence
- There is list of students and maximum lessons they have to be able to fill up all lessons
![Absence](/readme/setAbsence.png)
