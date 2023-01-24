import argparse

def preload(parser: argparse.ArgumentParser):
        parser.add_argument("--lock-oo-submodule", action='store_true',
                        help="(openOutpaint-webUI-extension) Prevent checking for main openOutpaint submodule updates.")
        