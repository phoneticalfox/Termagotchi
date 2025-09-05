window.onload = () => {
  const term = document.getElementById("terminal");
  const input = document.getElementById("input");
  const sendBtn = document.getElementById("send");
  const saveBtn = document.getElementById("save");
  const loadBtn = document.getElementById("load");
  const loadFile = document.getElementById("loadFile");

  // Termagotchi state
  let pet = { hunger: 5, happiness: 5 };

  // Default FS with pet status
  let fs = {
    "/": {
      "home": {
        "readme.txt": "Welcome to Termagotchi!\nTry commands: ls, cd, cat, feed, play, help."
      },
      "pet": {
        "status.txt": ""
      }
    }
  };

  let cwd = ["/"];

  // --- FS HELPERS ---
  function getDir(pathArr) {
    return pathArr.reduce((dir, key) => dir[key], fs);
  }

  function updatePetStatus() {
    // Boundaries
    pet.hunger = Math.min(10, Math.max(0, pet.hunger));
    pet.happiness = Math.min(10, Math.max(0, pet.happiness));

    // Mood descriptions
    let hungerMood = pet.hunger <= 3 ? "Satisfied"
                  : pet.hunger <= 7 ? "Peckish"
                  : "Hungry";

    let happyMood = pet.happiness <= 3 ? "Lonely"
                  : pet.happiness <= 7 ? "Content"
                  : "Joyful";

    // Sometimes, Termagotchi talks back
    let flavor = "";
    if (pet.happiness >= 8) flavor = "\nTermagotchi looks joyful today!";
    else if (pet.hunger >= 8) flavor = "\nTermagotchi is waiting for food…";
    else if (pet.happiness <= 2) flavor = "\nTermagotchi seems lonely.";
    else if (pet.hunger <= 2) flavor = "\nTermagotchi is happily full.";

    fs["/"]["pet"]["status.txt"] =
      `Hunger: ${pet.hunger}/10 (${hungerMood})\n` +
      `Happiness: ${pet.happiness}/10 (${happyMood})` +
      flavor;
  }

  // --- OUTPUT ---
  function printOutput(text) {
    term.innerHTML += `<div>${text}</div>`;
    term.scrollTop = term.scrollHeight;
  }

  // --- COMMANDS ---
  function runCommand(line) {
    const [cmd, ...args] = line.split(" ");
    const dir = getDir(cwd);

    // Every command makes Termagotchi a little hungrier
    pet.hunger = Math.min(10, pet.hunger + 1);
    updatePetStatus();

    switch (cmd) {
      case "ls":
        printOutput(Object.keys(dir).join("  "));
        break;

      case "cd":
        if (args[0] === "..") {
          if (cwd.length > 1) cwd.pop();
        } else if (dir[args[0]] && typeof dir[args[0]] === "object") {
          cwd.push(args[0]);
        } else {
          printOutput("No such directory");
        }
        break;

      case "pwd":
        printOutput(cwd.join("/").replace("//","/"));
        break;

      case "cat":
        if (dir[args[0]] && typeof dir[args[0]] === "string") {
          printOutput(dir[args[0]]);
        } else {
          printOutput("No such file");
        }
        break;

      case "echo":
        printOutput(args.join(" "));
        pet.happiness = Math.min(10, pet.happiness + 1);
        updatePetStatus();
        break;

      case "feed":
        pet.hunger = Math.max(0, pet.hunger - 3);
        printOutput("You fed your Termagotchi.");
        updatePetStatus();
        break;

      case "play":
        pet.happiness = Math.min(10, pet.happiness + 3);
        printOutput("You played with your Termagotchi!");
        updatePetStatus();
        break;

      case "help":
        printOutput("Commands: ls, cd, pwd, cat, echo, feed, play, help, clear");
        break;

      case "clear":
        term.innerHTML = "";
        break;

      default:
        if (cmd.trim() !== "") printOutput(`${cmd}: command not found`);
    }
  }

  // --- INPUT HANDLER ---
  function handleInput() {
    const line = input.value.trim();
    if (!line) return;
    printOutput(`$ ${line}`);
    runCommand(line);
    input.value = "";
  }

  sendBtn.addEventListener("click", handleInput);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleInput();
  });

  // --- SAVE FS ---
  saveBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(fs, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fs.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // --- LOAD FS ---
  loadBtn.addEventListener("click", () => {
    loadFile.click();
  });

  loadFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      fs = JSON.parse(evt.target.result);
      cwd = ["/"];
      printOutput("Filesystem loaded.");
    };
    reader.readAsText(file);
  });

  // --- PASSIVE DECAY ---
  setInterval(() => {
    pet.hunger = Math.min(10, pet.hunger + 1); // gets hungrier
    pet.happiness = Math.max(0, pet.happiness - 1); // gets lonelier
    updatePetStatus();
  }, 60000); // every minute

  // Boot
  updatePetStatus();
  printOutput("🐚 Termagotchi v0.3");
  printOutput("Type 'help' for a list of commands.");

  function adjustHeight() {
  const term = document.getElementById("terminal");
  const controls = document.getElementById("controls");

  // Always fill what's left under controls
  const available = window.innerHeight - controls.offsetHeight;
  term.style.height = available + "px";
}

// Run on load + when resized (keyboard up/down)
window.addEventListener("resize", adjustHeight);
window.addEventListener("load", adjustHeight);
};
