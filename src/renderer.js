// Existing login page functionality
if (document.getElementById('login-btn')) {
  const loginBtn = document.getElementById('login-btn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const togglePasswordIcon = document.getElementById('toggle-password');

  // Toggle password visibility
  togglePasswordIcon.addEventListener('click', () => {
    const isPasswordVisible = passwordInput.type === 'text';
    passwordInput.type = isPasswordVisible ? 'password' : 'text';
    togglePasswordIcon.textContent = isPasswordVisible ? 'visibility_off' : 'visibility';
  });

  // Handle login
  loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      alert('Please fill in both fields');
      return;
    }

    window.electron.checkUser(username, password)
      .then(result => {
        if (result.success) {
          alert('Login successful');
          window.location.href = './index.html'; // Redirect to main page
        } else {
          alert(result.message);
        }
      })
      .catch(error => {
        alert('Error: ' + error);
      });
  });
}

// Existing register page functionality
if (document.getElementById('register-btn')) {
  const registerBtn = document.getElementById('register-btn');
  const usernameInput = document.getElementById('reg-username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordIcon = document.getElementById('toggle-password'); // Ensure this ID is correct

  // Toggle password visibility for registration
  togglePasswordIcon.addEventListener('click', () => {
    const isPasswordVisible = passwordInput.type === 'text';
    passwordInput.type = isPasswordVisible ? 'password' : 'text';
    togglePasswordIcon.textContent = isPasswordVisible ? 'visibility_off' : 'visibility';
  });

  // Handle registration
  registerBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !email || !password) {
      alert('Please fill in all fields');
      return;
    }

    window.electron.registerUser(username, email, password)
      .then(result => {
        if (result.success) {
          alert(result.message);
          window.location.href = 'login.html'; // Redirect to login page
        } else {
          alert(result.message);
        }
      })
      .catch(error => {
        alert('Error: ' + error);
      });
  });
}

// Network Scan functionality
if (document.getElementById('network-scan-btn')) {
  const networkScanBtn = document.getElementById('network-scan-btn');
  const devicesList = document.getElementById('devices-list');

  networkScanBtn.addEventListener('click', () => {
    // Send IPC message to main process to start network scan
    window.electron.startNetworkScan();
  });

  // Listen for the network scan results
  window.electron.on('network-scan-results', (event, devices) => {
    devicesList.innerHTML = ''; // Clear previous results
    if (devices.length === 0) {
      devicesList.innerHTML = '<li>No devices found on the network</li>';
    } else {
      devices.forEach(device => {
        const listItem = document.createElement('li');
        listItem.textContent = `IP: ${device.ip}, Host: ${device.host}`;
        devicesList.appendChild(listItem);
      });
    }
  });
}

// PowerShell command functionality
if (document.getElementById('run-powershell-btn')) {
  const runPowerShellBtn = document.getElementById('run-powershell-btn');
  const powershellCommandInput = document.getElementById('powershell-command');
  const outputLog = document.getElementById('output-log');

  runPowerShellBtn.addEventListener('click', () => {
    const command = powershellCommandInput.value.trim();

    if (!command) {
      alert('Please enter a command');
      return;
    }

    // Send IPC message to run PowerShell command
    window.electron.runPowerShellCommand(command);
  });

  // Listen for PowerShell output
  window.electron.on('powershell-output', (event, output) => {
    outputLog.textContent = output; // Display the PowerShell output
  });
}


window.electron.getSystemInfo()
  .then(info => {
    console.log(info);
    // Display the system info in your HTML, e.g.:
    document.getElementById('cpu-info').textContent = `CPU: ${info.cpu.manufacturer} ${info.cpu.family} ${info.cpu.speed}GHz`;
    document.getElementById('ram-info').textContent = `RAM: ${info.memory.total / 1073741824} GB`;
    document.getElementById('os-info').textContent = `OS: ${info.os.distro}`;
  })
  .catch(error => {
    console.error("Error:", error);
  });


  const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');

terminalInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const command = terminalInput.value.trim();
    terminalInput.value = ''; // Clear input

    if (command === 'ping 192.168.1.1') {
      terminalOutput.innerHTML += "<div>Pinging 192.168.1.1... Success!</div>";
    } else if (command === 'traceroute google.com') {
      terminalOutput.innerHTML += "<div>Tracing route to google.com... Success!</div>";
    } else if (command === 'sysinfo') {
      // Use IPC to fetch system information
      window.electron.getSystemInfo()
        .then(info => {
          terminalOutput.innerHTML += `<div>CPU: ${info.cpu.manufacturer} ${info.cpu.family} ${info.cpu.speed}GHz</div>`;
          terminalOutput.innerHTML += `<div>RAM: ${info.memory.total / 1073741824} GB</div>`;
          terminalOutput.innerHTML += `<div>OS: ${info.os.distro}</div>`;
        });
    } else {
      terminalOutput.innerHTML += `<div>${command}: Command not recognized</div>`;
    }
  }
});
