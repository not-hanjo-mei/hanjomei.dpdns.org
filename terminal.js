// terminal.js - Fake terminal Easter egg

class Terminal {
  constructor(element) {
    this.element = element;
    this.history = [];
    this.currentDir = '~';
    this.commandHistory = [];
    this.historyIndex = -1;
    this.fileSystem = {
      '~': {
        type: 'dir',
        content: {
          'about.txt': { type: 'file', content: 'Name: Hanjo Mei\nOccupation: Creator\nStatus: Keep breathing\nLanguages: en_us=true, zh_cn=真, ja_jp=否, ru_ru=нет\nHobbies: Gaming, Streaming, Creating content\nFavorite Game: Earth_Online' },
          'config.cfg': { type: 'file', content: 'gender=armed_helikopter\nen_us=true\nzh_cn=真\nja_jp=否\nru_ru=нет\ngames=Earth_Online\nstatus=keep_breathing\n#世界是你們的，也是我們的，但是歸根結底是你們的。你們青年人朝氣蓬勃，正在興旺時期，好像早晨八九點鐘的太陽。希望寄託在你們身上。\n#這是最後的鬥爭，團結起來到明天，英特納雄耐爾就一定要實現！' },
          'projects': {
            type: 'dir',
            content: {
              'yah_mei.txt': { type: 'file', content: 'YAH Mei - A friendly REALITY chatbot designed to interact with users in a natural way.' },
              'inochi2d.txt': { type: 'file', content: 'Inochi 2D model for live streaming - A custom avatar for virtual presence.' },
              'visual_novel.txt': { type: 'file', content: 'Visual Novel - An attempt at writing my own story and bringing it to life.' }
            }
          },
          'contact': {
            type: 'dir',
            content: {
              'social.txt': { type: 'file', content: 'Discord: not_hanjo_mei\nInstagram: @not_hanjo_mei\nYouTube: @hanjo_mei_reality\nREALITY: profile/be1378b4' },
              'email.txt': { type: 'file', content: 'hanjomei@hanjomei.dpdns.org' }
            }
          },
          'secret.txt': { type: 'file', content: '世界是你們的，也是我們的，但是歸根結底是你們的。你們青年人朝氣蓬勃，正在興旺時期，好像早晨八九點鐘的太陽。希望寄託在你們身上。' }
        }
      }
    };
    this.init();
  }

  init() {
    this.createTerminalHTML();
    this.bindEvents();
    this.print('Welcome to Soviet Leninux 13 "Tripoloski"!');
    this.print('login as Мэй');
    this.print('Type "help" for available commands.');
    this.prompt();
  }

  createTerminalHTML() {
    // Clear existing content
    this.element.innerHTML = '';
    
    // Create terminal container
    this.terminalContainer = document.createElement('div');
    this.terminalContainer.className = 'terminal-container';
    
    // Add Soviet Leninux styling
    this.terminalContainer.style.backgroundColor = '#2b2b2b';
    this.terminalContainer.style.color = '#e0e0e0';
    this.terminalContainer.style.fontFamily = '"Courier New", monospace';
    this.terminalContainer.style.padding = '10px';
    this.terminalContainer.style.borderRadius = '5px';
    this.terminalContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    this.terminalContainer.style.maxHeight = '500px';
    this.terminalContainer.style.overflow = 'auto';
    
    // Create output display
    this.outputElement = document.createElement('div');
    this.outputElement.className = 'terminal-output';
    
    // Create input line
    this.inputLine = document.createElement('div');
    this.inputLine.className = 'terminal-input-line';
    
    // Create prompt
    this.promptElement = document.createElement('span');
    this.promptElement.className = 'terminal-prompt';
    this.promptElement.style.color = '#cc0000'; // Soviet red color
    
    // Create input
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'text';
    this.inputElement.className = 'terminal-input';
    this.inputElement.autofocus = true;
    this.inputElement.style.backgroundColor = 'transparent';
    this.inputElement.style.color = '#e0e0e0';
    this.inputElement.style.border = 'none';
    this.inputElement.style.outline = 'none';
    this.inputElement.style.fontFamily = '"Courier New", monospace';
    this.inputElement.style.width = 'calc(100% - 100px)';
    
    // Assemble the terminal
    this.inputLine.appendChild(this.promptElement);
    this.inputLine.appendChild(this.inputElement);
    this.terminalContainer.appendChild(this.outputElement);
    this.terminalContainer.appendChild(this.inputLine);
    this.element.appendChild(this.terminalContainer);
  }

  bindEvents() {
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const command = this.inputElement.value.trim();
        this.handleCommand(command);
        this.inputElement.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory(1);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autoComplete();
      }
    });

    // Focus input when clicking anywhere in the terminal
    this.terminalContainer.addEventListener('click', () => {
      this.inputElement.focus();
    });
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;
    
    this.historyIndex += direction;
    
    if (this.historyIndex < 0) {
      this.historyIndex = 0;
    } else if (this.historyIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length - 1;
    }
    
    this.inputElement.value = this.commandHistory[this.historyIndex];
  }

  autoComplete() {
    const input = this.inputElement.value.trim();
    const args = input.split(' ');
    
    // Only autocomplete if we have a command and possibly a partial path
    if (args.length <= 2) {
      const command = args[0];
      const partial = args.length > 1 ? args[1] : '';
      
      if (command === 'cd' || command === 'ls' || command === 'cat' || command === 'rm') {
        const currentDirObj = this.getCurrentDirObject();
        if (!currentDirObj) return;
        
        const matches = [];
        for (const item in currentDirObj.content) {
          if (item.startsWith(partial)) {
            matches.push(item);
          }
        }
        
        if (matches.length === 1) {
          this.inputElement.value = `${command} ${matches[0]}`;
        } else if (matches.length > 1) {
          this.print(matches.join('  '));
          this.prompt();
        }
      }
    }
  }

  handleCommand(command) {
    if (!command) {
      this.prompt();
      return;
    }
    
    // Add to history
    this.commandHistory.unshift(command);
    if (this.commandHistory.length > 50) {
      this.commandHistory.pop();
    }
    this.historyIndex = -1;
    
    // Print command
    this.print(`${this.currentDir} $ ${command}`);
    
    // Parse command
    const args = command.split(' ');
    const cmd = args[0].toLowerCase();
    
    // Execute command
    switch (cmd) {
      case 'help':
        this.cmdHelp();
        break;
      case 'ls':
        this.cmdLs(args[1]);
        break;
      case 'cd':
        this.cmdCd(args[1]);
        break;
      case 'cat':
        this.cmdCat(args[1]);
        break;
      case 'pwd':
        this.cmdPwd();
        break;
      case 'clear':
        this.cmdClear();
        break;
      case 'echo':
        this.cmdEcho(args.slice(1).join(' '));
        break;
      case 'whoami':
        this.cmdWhoami();
        break;
      case 'date':
        this.cmdDate();
        break;
      case 'sudo':
        this.cmdSudo(args.slice(1).join(' '));
        break;
      case 'exit':
        this.cmdExit();
        break;
      case 'uname':
        this.cmdUname();
        break;
      case 'neofetch':
        this.cmdNeofetch();
        break;
      case 'rm':
        this.cmdRm(args.slice(1).join(' '));
        break;
      default:
        this.print(`Command not found: ${cmd}. Type 'help' for available commands.`);
        break;
    }
    
    if (cmd !== 'clear') {
      this.prompt();
    }
  }

  prompt() {
    this.promptElement.textContent = `${this.currentDir} $ `;
  }

  print(text) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.style.whiteSpace = 'pre';
    line.textContent = text;
    this.outputElement.appendChild(line);
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  }

  getCurrentDirObject() {
    const path = this.currentDir.split('/');
    let current = this.fileSystem['~'];
    
    if (this.currentDir === '~') {
      return current;
    }
    
    for (let i = 1; i < path.length; i++) {
      if (path[i] && current.content[path[i]]) {
        current = current.content[path[i]];
      } else {
        return null;
      }
    }
    
    return current;
  }

  // Command implementations
  cmdHelp() {
    this.print('Soviet Leninux 13 "Tripoloski" - Help Manual');
    this.print('Usage: command [options] [arguments]');
    this.print('\nSystem Commands:');
    this.print('  help      Display this help manual');
    this.print('  clear     Clear terminal screen');
    this.print('  exit      Terminate current session');
    this.print('  sudo      Execute command with superuser privileges');
    this.print('\nFile Operations:');
    this.print('  ls        List files and directories');
    this.print('  cd        Change current directory');
    this.print('  pwd       Print current working directory path');
    this.print('  cat       Concatenate and display file contents');
    this.print('  rm        Remove files (restricted)');
    this.print('\nSystem Information:');
    this.print('  whoami    Display effective user name');
    this.print('  date      Show system date and time (MSK)');
    this.print('  uname     Display system information');
    this.print('  neofetch  Show system information and ASCII art');
    this.print('\nText Processing:');
    this.print('  echo      Display text message on screen');
    this.print('\nFor detailed information about specific commands,');
    this.print('please consult the KGB documentation department.');
  }

  cmdLs(path) {
    let dirToList;
    
    if (!path) {
      dirToList = this.getCurrentDirObject();
    } else {
      // Handle relative paths
      const targetPath = this.resolvePath(path);
      const dirObj = this.getObjectAtPath(targetPath);
      
      if (!dirObj) {
        this.print(`ls: cannot access '${path}': No such file or directory`);
        return;
      }
      
      if (dirObj.type !== 'dir') {
        this.print(path);
        return;
      }
      
      dirToList = dirObj;
    }
    
    if (!dirToList) {
      this.print(`ls: cannot access '${path}': No such file or directory`);
      return;
    }
    
    const items = Object.keys(dirToList.content);
    if (items.length === 0) {
      return; // Empty directory
    }
    
    // Format output with colors (blue for directories)
    const formattedItems = items.map(item => {
      if (dirToList.content[item].type === 'dir') {
        return `<span style="color: #4285F4;">${item}/</span>`;
      }
      return item;
    });
    
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = formattedItems.join('  ');
    this.outputElement.appendChild(line);
  }

  cmdCd(path) {
    if (!path || path === '~') {
      this.currentDir = '~';
      return;
    }
    
    if (path === '..') {
      if (this.currentDir === '~') {
        return; // Already at root
      }
      
      const parts = this.currentDir.split('/');
      parts.pop();
      this.currentDir = parts.join('/') || '~';
      return;
    }
    
    const targetPath = this.resolvePath(path);
    const targetObj = this.getObjectAtPath(targetPath);
    
    if (!targetObj) {
      this.print(`cd: no such directory: ${path}`);
      return;
    }
    
    if (targetObj.type !== 'dir') {
      this.print(`cd: not a directory: ${path}`);
      return;
    }
    
    this.currentDir = targetPath;
  }

  cmdCat(path) {
    if (!path) {
      this.print('cat: missing file operand');
      return;
    }
    
    const targetPath = this.resolvePath(path);
    const fileObj = this.getObjectAtPath(targetPath);
    
    if (!fileObj) {
      this.print(`cat: ${path}: No such file or directory`);
      return;
    }
    
    if (fileObj.type !== 'file') {
      this.print(`cat: ${path}: Is a directory`);
      return;
    }
    
    this.print(fileObj.content);
  }

  cmdPwd() {
    this.print(this.currentDir);
  }

  cmdClear() {
    this.outputElement.innerHTML = '';
    this.prompt();
  }

  cmdEcho(text) {
    this.print(text || '');
  }

  cmdWhoami() {
    this.print('Мэй');
  }

  cmdDate() {
    // Get current date and time in Moscow
    const moscowTime = new Date().toLocaleString('en-US', {
      timeZone: 'Europe/Moscow',
      hour12: false,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    this.print(`Moscow Time: ${moscowTime}`);
  }

  cmdSudo(command) {
    if (!command) {
      this.print('sudo: missing command operand');
      return;
    }
    if (command.startsWith('rm -rf /')) {
      this.print('Permission denied: Nice try, but I like this system!');
      this.print('This incident will be reported to the KGB.');
    } else {
      this.print('Permission denied: You are not in the sudoers file. This incident will be reported.');
    }
  }

  cmdExit() {
    this.print('Goodbye! Closing terminal...');
    setTimeout(() => {
      this.element.innerHTML = '<p>Terminal session ended. Refresh the page to restart.</p>';
    }, 1000);
  }

  cmdUname() {
    // Generate a uname -a style output
    const kernelVersion = '5.4.2000-soviet-dirty'; // From neofetch
    const hostname = 'MayPC'; // From neofetch
    const buildInfo = '#1 SMP Dec 26 19:91:00 MSK 1991'; // Fictional build info referencing October Revolution
    const arch = 'e2k'; // Elbrus 2000 architecture
    const osType = 'GNU/Leninux'; // Themed OS type
    
    this.print(`Soviet Leninux ${hostname} ${kernelVersion} ${buildInfo} ${arch} ${osType}`);
  }

  cmdNeofetch() {
    const asciiArt = [
      '    ☭☭☭☭☭☭☭☭☭☭☭    ',
      '  ☭   _     _     ☭  ',
      ' ☭   /.\\___/.\\     ☭ ',
      ' ☭   \\_     _/     ☭ ',
      ' ☭    / o o \\      ☭ ',
      ' ☭    \\_ v _/      ☭ ',
      '  ☭    /   \\      ☭  ',
      '   ☭   |   |     ☭   ',
      '    ☭☭☭☭☭☭☭☭☭☭☭    '
    ];
    
    const info = [
      'OS: Soviet Leninux 13 "Tripoloski"',
      'Host: MayPC',
      'Kernel: 5.4.2000-soviet-dirty',
      'Uptime: 1917 days, 10 hours, 5 mins',
      'Packages: 1991 (apt)',
      'Shell: bash 5.1.0',
      'Resolution: 3840x1080',
      'DE: KGBDE',
      'Terminal: SibirTerm',
      'CPU: Elbrus-8C @ 16.0GHz',
      'GPU: Videotonika KGB-9000',
      'Memory: 1337MB / 65536MB'
    ];

    // Print ASCII art and system info side by side
    for (let i = 0; i < Math.max(asciiArt.length, info.length); i++) {
      let line = '';
      if (i < asciiArt.length) {
        line += asciiArt[i];
      } else {
        line += ' '.repeat(22); // Width of ASCII art
      }
      
      if (i < info.length) {
        line += '  ' + info[i];
      }
      
      this.print(line);
    }
  }

  resolvePath(path) {
    if (path.startsWith('~')) {
      return path;
    } else if (path.startsWith('/')) {
      return '~' + path;
    } else {
      if (this.currentDir === '~') {
        return this.currentDir + '/' + path;
      } else {
        return this.currentDir + '/' + path;
      }
    }
  }

  getObjectAtPath(path) {
    if (path === '~') {
      return this.fileSystem['~'];
    }
    
    const parts = path.split('/');
    let current = this.fileSystem['~'];
    
    for (let i = 1; i < parts.length; i++) {
      if (parts[i] && current.content && current.content[parts[i]]) {
        current = current.content[parts[i]];
      } else {
        return null;
      }
    }
    
    return current;
  }

  cmdRm(args) {
    if (args.trim() === '-rf /') {
      this.print('System destroyed. Goodbye, comrade! ☭');
      this.print('Just kidding. I will not let you do that.');
      this.print('This incident will be reported to the KGB.');
    } else {
      this.print('Permission denied: rm command is restricted.');
    }
  }
}

// Initialize terminal when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  const terminalElement = document.getElementById('terminal');
  if (terminalElement) {
    new Terminal(terminalElement);
  }
});