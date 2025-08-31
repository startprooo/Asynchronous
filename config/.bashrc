# Security settings
umask 027
TMOUT=900

# Environment variables
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export EDITOR=vim
export VISUAL=vim
export HISTCONTROL=ignoreboth
export HISTTIMEFORMAT="%F %T "
export HISTSIZE=10000
export HISTFILESIZE=20000

# Aliases for better security
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'
alias ln='ln -i'

# Development aliases
alias py='python3'
alias pip='pip3'
alias npmls='npm list --depth=0'
alias gitlog='git log --oneline --graph --decorate'

# Enhanced command replacements
if command -v bat &> /dev/null; then
    alias cat='bat --style=plain'
fi

if command -v exa &> /dev/null; then
    alias ls='exa'
    alias ll='exa -l'
    alias la='exa -la'
fi

# Directory navigation
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# Development functions
function mkcd() {
    mkdir -p "$1" && cd "$1"
}

function pyenv() {
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
}

# Security functions
function secure_permissions() {
    find . -type f -exec chmod 640 {} \;
    find . -type d -exec chmod 750 {} \;
}

function check_ports() {
    sudo netstat -tulpn
}

# Prompt configuration
if [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
fi

PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '

# Load local configuration if it exists
if [ -f ~/.bashrc.local ]; then
    . ~/.bashrc.local
fi
