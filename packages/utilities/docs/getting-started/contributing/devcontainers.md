# Developer Container

Awesome, you found me!

In this document, we are going to show you how to get your development platform up and running quickly, easily and cleanly. It will require a few key products and applications to be downloaded, but once finished will work on any device, or using the NEW github [codespaces](https://github.com/codespaces)!

This method is the best way for every developer to be running the exact same workspace, therefore removing the problems of `it doesnt work for me` or simular. We **REQUIRE** you to use this system for development to reduce the onboarding time for new developers.

## What you need

For us to continue, you are going to need a couple of tools:

- Preconfigured SSH Keys (follow the git tutorial [here](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent))
- Preconfigured GPG Keys (follow our tutorial [here](./gpgkey.md))
- Git Credentials on the local machine

  ```shell
  git config --global user.name "Your Name"
  git config --global user.email "your.email@address"
  ```

### Windows

(Docker Toolbox is not supported. Windows container images are not supported.)

- [Docker Desktop](https://www.docker.com/products/docker-desktop) 2.0+ on Windows 10 Pro/Enterprise.
- Windows 10 Home (2004+) requires Docker Desktop 2.3+
- [WSL 2 back-end](https://aka.ms/vscode-remote/containers/docker-wsl2).

### macOS

- [Docker Desktop](https://www.docker.com/products/docker-desktop) 2.0+.

### Linux

(The Ubuntu snap package is not supported.)

- [Docker CE/EE](https://docs.docker.com/install/#supported-platforms) 18.06+
- [Docker Compose](https://docs.docker.com/compose/install) 1.21+.

## Installation

To get started, follow these steps:

1. Install and configure [Docker](https://www.docker.com/get-started) for your operating system.

   **Windows / macOS:**

   1. Install [Docker Desktop for Windows/Mac](https://www.docker.com/products/docker-desktop).
   2. Right-click on the Docker task bar item, select Settings / Preferences and update Resources > File Sharing with any locations your source code is kept. See [tips and tricks](https://code.visualstudio.com/docs/remote/troubleshooting#_container-tips) for troubleshooting.
   3. If you are using WSL 2 on Windows, to enable the [Windows WSL 2 back-end](https://aka.ms/vscode-remote/containers/docker-wsl2): Right-click on the Docker taskbar item and select Settings. Check Use the WSL 2 based engine and verify your distribution is enabled under Resources > WSL Integration.

   **Linux:**

   1. Follow the [official install instructions for Docker CE/EE for your distribution](https://docs.docker.com/install/#supported-platforms). If you are using Docker Compose, follow the [Docker Compose directions](https://docs.docker.com/compose/install/) as well.
   2. Add your user to the `docker` group by using a terminal to run: `sudo usermod -aG docker $USER`
   3. Sign out and back in again so your changes take effect.

2. Install [Visual Studio Code](https://code.visualstudio.com/) or [Visual Studio Code Insiders](https://code.visualstudio.com/insiders/).
3. Install the [Remote Development extension pack](https://aka.ms/vscode-remote/download/extension).
4. Setup your SSH Keys to be accessable via containers

   **macOS:**

   Run this command (replace `keyName` with your key file name)

   ```shell
   ssh-add $HOME/.ssh/keyName
   ```

   **Windows:**

   Start a **local Administrator PowerShell** and run the following commands: (replace `keyName` with your key file name)

   ```shell
   # Make sure you're running as an Administrator
   Set-Service ssh-agent -StartupType Automatic
   Start-Service ssh-agent
   Get-Service ssh-agent
   ssh-add $HOME/.ssh/keyName
   ```

   **Linux:**

   First, start the SSH Agent in the background by running the following in a terminal:

   ```shell
   eval "$(ssh-agent -s)"
   ```

   Then add these lines to your `~/.bash_profile` or `~/.zprofile` (for Zsh) so it starts on login:

   ```shell
   if [ -z "$SSH_AUTH_SOCK" ]; then
      # Check for a currently running instance of the agent
      RUNNING_AGENT="`ps -ax | grep 'ssh-agent -s' | grep -v grep | wc -l | tr -d '[:space:]'`"
      if [ "$RUNNING_AGENT" = "0" ]; then
         # Launch a new instance of the agent
         ssh-agent -s &> .ssh/ssh-agent
      fi
      eval `cat .ssh/ssh-agent`
   fi
   ```

   Finally run (replace `keyName` with your key file name)

   ```shell
   ssh-add $HOME/.ssh/keyName
   ```

## Start the developer container

1. Clone this repository to your computer
2. Start VS Code
3. Either run the `Remote-Containers: Open Folder in Container` from the command pallet (`f1`) or `Open folder` from the file menu and click the popup which states `Reopen in container`
4. Clone all repositories to within this directory (Automatically done normally)
   You can do this super quickly by doing `chmod 755 gitclone.sh && ./gitclone.sh` in your terminal
5. (Optional) `Open workspace` from the file menu and select `.code-workspace`

## Contributing to our projects

We have included the documentation folder within this repository. You can find the following information which will guide you through how to contribute to our projects

- [Contributing Guidelines](./contributing.md#why-the-guidelines)
- [Responsiblities](./contributing.md#responsibilities)
- [External Contributions Workflow](./contributing.md#external-contributions-workflow)
- [Internal Contributions Workflow](./contributing.md#internal-contributions-workflow)
- [Contribution Types](./contributing.md#contribution-types)
- [Creating a merge request](./contributing.md#creating-a-merge-request)
- [Understanding Labels](./contributing.md#understanding-labels)

## Adding a new project

If you are lucky enough to have the power to add new projects to this developer space, here is the steps you need to take.

1. Create your repository
2. Ensure your repository has a `.devcontainer` setup
3. Add your repository to the `gitclone.sh` file
4. Add your repository to the `.code-workspace` file
5. Commit and push this repository
