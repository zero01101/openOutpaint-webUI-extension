import sys
import os
from modules import scripts

git = os.environ.get('GIT', "git")
usefulDirs = sys.argv[0].split(os.sep)[-3:]

installDir = os.path.join(scripts.basedir(), usefulDirs[0], usefulDirs[1])

# Attempt to use launch module from webui
command = f'"{git}" -C "' + installDir +\
    '" submodule update --init --recursive --remote'
if not os.path.isfile(os.path.join(installDir, "app", "index.html")): 
    try:
        from launch import run    
        stdout = run(command)
        if stdout is not None:
            print(stdout)
    except ImportError:
        print("[openoutpaint-extension] We failed to import the 'launch' module. Using 'os'")
        os.system(command)
