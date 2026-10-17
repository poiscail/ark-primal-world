#!/bin/bash
# Prépare une session cloud de Claude Code pour ce dépôt (0.43) : Playwright 1.56.0 (correspond au Chromium
# préinstallé dans /opt/pw-browsers) et Pillow (test_visual), pour que tools/run_tests.sh marche tout de suite.
# Rapide et sans effet si tout est déjà là. Ne fait rien hors des sessions cloud.
set -euo pipefail
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then exit 0; fi
need=""
python3 -c "import importlib.metadata as m,sys;sys.exit(0 if m.version('playwright')=='1.56.0' else 1)" 2>/dev/null || need="$need playwright==1.56.0"
python3 -c "import PIL" 2>/dev/null || need="$need pillow"
if [ -n "$need" ]; then pip install --quiet $need || pip install --quiet --break-system-packages $need; fi
[ -d /opt/pw-browsers ] && echo 'export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers' >> "${CLAUDE_ENV_FILE:-/dev/null}"
echo "session-start : playwright $(python3 -c "import importlib.metadata as m;print(m.version('playwright'))"), node $(node --version 2>/dev/null || echo absent)"
