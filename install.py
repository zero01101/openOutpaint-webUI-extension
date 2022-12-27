import sys
print("debug - sys.argv[0]: " + sys.argv[0])
import os
from modules import scripts

git = os.environ.get('GIT', "git")
usefulDirs = sys.argv[0].split(os.sep)[-3:]
print("preinit openOutpaint")

installDir = scripts.basedir() + os.sep + \
    usefulDirs[0] + os.sep + usefulDirs[1]

# Attempt to use launch module from webui
command = f'"{git}" -C "' + installDir +\
    '" submodule update --init --recursive --remote'
try:
    from launch import run

    print(run(command))
except ImportError:
    print("[openoutpaint-extension] We failed to import the 'launch' module. Using 'os'")
    os.system(command)
