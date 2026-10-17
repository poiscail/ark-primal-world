#!/bin/sh
# Lance tous les tests fonctionnels (hors simulations d'équilibrage, lentes).
cd "$(dirname "$0")/.." || exit 1
fail=0
for t in order full skills gacha equipment modes settings portraits qol transfer v10 battle_anim exped traits summon_fx skill_fx story evolution polish nav chain content music layout auto bestiary attack_fx enemy_skills menu_scenes codex summon_buttons juice tactics maze nightmare trials species2 far nest player combat2 combat3 combat4 mastery skills3 bosses foes2 hunts camp world regions modes2 modes3 collect collect2 progress progress2 nest2 far2 gear2 gacha2 events3 anim2 gfx2 ui2 sound2 access share app2 events4 quests2 retours perf visual; do
  printf '%-16s' "$t"
  if python3 tests/test_$t.py >/tmp/test_$t.log 2>&1; then echo OK; else echo ECHEC; tail -5 /tmp/test_$t.log; fail=1; fi
done
exit $fail
