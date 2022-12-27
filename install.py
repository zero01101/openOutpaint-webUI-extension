import sys
print("debug - sys.argv[0]: " + sys.argv[0])
import os
from launch import run
from modules import scripts

git = os.environ.get('GIT', "git")
usefulDirs = sys.argv[0].split(os.sep)[-3:]
print("preinit openOutpaint")
installDir = scripts.basedir() + os.sep + usefulDirs[0] + os.sep + usefulDirs[1]
print(run(f'"{git}" -C "' + installDir + '" submodule update --init --recursive --remote'))
