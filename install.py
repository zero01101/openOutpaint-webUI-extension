import sys
import os
from modules import scripts

git = os.environ.get('GIT', "git")
usefulDirs = sys.argv[0].split(os.sep)[-3:]

installDir = os.path.join(scripts.basedir(), usefulDirs[0], usefulDirs[1])

# Attempt to use launch module from webui
command = f'"{git}" -C "' + installDir +\
    '" submodule update --init --recursive --remote'
try:
    from launch import run
    stdout = run(command)
    if len(stdout) > 0:
        print(run(command))
except ImportError:
    print("[openoutpaint-extension] We failed to import the 'launch' module. Using 'os'")
    os.system(command)
