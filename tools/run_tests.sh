#!/bin/sh
# Lance tous les tests fonctionnels (hors simulations d'équilibrage, lentes).
cd "$(dirname "$0")/.." || exit 1
fail=0
for t in full skills gacha equipment modes settings portraits qol transfer v10 battle_anim exped traits summon_fx skill_fx story evolution music layout auto bestiary attack_fx enemy_skills menu_scenes codex; do
  printf '%-14s' "$t"
  if python3 tests/test_$t.py >/tmp/test_$t.log 2>&1; then echo OK; else echo ECHEC; tail -5 /tmp/test_$t.log; fail=1; fi
done
exit $fail
