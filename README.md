<h1 align="center">Schoolingo Angular</h1>

## O projektu
- Jedná se o projekt zaměřený na komunikaci mezi školou, studenty a rodiči studentů.
- V systému můžeme najít `rozvrh`, `třídní knihu`, `absenci` a `přehled předmětů`.
- Celý web běží na socket.io. Dále využité balíčky jsou `angularx-qrcode` pro zobrazování QR kódu, `diacritics` (je to jednoduchý, proto bylo přímo implementováno do kódu) pro lepší a snadnější vyhledávání.

## Funkce
- Web automaticky rozezná tému nastavenou v systému a nastaví ji v webu (aktuální podpora pro dark a light)
- Rychlé přihlášení pomocí QR kódu. QR kód naskenujeme v mobilní aplikaci.

## Build
### Požadavky
- [Node](https://nodejs.org/en/) - K nainstalování potřebných balíčků
- [Git](https://git-scm.com/) - Ke stažení zdrojového kódu (nepotřebné),zdrojový kód lze přímo stáhnout z Githubu.

1. Stažení zdrojového kódu 
with GIT:
```sh
git clone https://github.com/MasT3r1k/Todo.git
```
nebo můžeme přímo stáhnout z Githubu

2. Nainstalujeme balíčky
```sh
npm install
```

3. Buildneme projekt 
```sh
npm run build
```

## Přihlašovací stránka
- Přihlašovací stránka podporuje 2 způsoby přihlášení: Klasické přihlášení pomocí uživatelského jména a hesla nebo se můžete přihlásit naskenováním qrcode v mobilní aplikaci.
![Loginpage](/readme/LoginPage.png)

## Příklad rozvrhu
- Rozvrh můžete vytisknout
- Můžete si vybrat libovolný týden, který chcete zobrazit
- Dnešní den je zvýrazněn
- Každá hodina má svého učitele, předmět a místnost
![Timetable](/readme/Timetable.png)

## Seznam předmětů
- Zde je základní tabulka předmětů, které máte jako student k dispozici.
![Subjectlist](/readme/SubjectList.png)

## Třídní kniha
- Jako učitel máte přístup k třídní knize
- Jsou zde základní informace o hodině
![Classbook](/readme/writeLesson.png)
- A také nepřítomnost
- Je zde seznam studentů a maximální počet hodin, které student může mít, aby bylo možné zapsat všechny hodiny.
![Absence](/readme/setAbsence.png)
