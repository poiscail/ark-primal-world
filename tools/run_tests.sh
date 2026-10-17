#!/bin/sh
# Lance tous les tests fonctionnels (hors simulations d'équilibrage, lentes).
# 0.43 : en parallèle (JOBS tests à la fois ; par défaut le nombre de processeurs moins 1, entre 1 et 4).
# « perf » et « visual » passent à la fin, seuls, car ils mesurent des temps et comparent des images.
# Un test qui échoue est relancé une fois, seul : s'il passe, il est marqué INSTABLE (à corriger, mais pas un échec) ;
# s'il échoue encore, c'est un ECHEC. Journaux : /tmp/test_<nom>.log.
#   tools/run_tests.sh              tous les tests
#   tools/run_tests.sh nest far     seulement ceux-là
#   JOBS=1 tools/run_tests.sh       un par un (comme avant 0.43)
cd "$(dirname "$0")/.." || exit 1
ALL="order full skills gacha equipment modes settings portraits qol transfer v10 battle_anim exped traits summon_fx skill_fx story evolution polish nav chain content music layout auto bestiary attack_fx enemy_skills menu_scenes codex summon_buttons juice tactics maze nightmare trials species2 far nest player combat2 combat3 combat4 mastery skills3 bosses foes2 hunts camp world regions modes2 modes3 collect collect2 progress progress2 nest2 far2 gear2 gacha2 events3 anim2 gfx2 ui2 sound2 access share app2 events4 quests2 retours hud perf visual"
SOLO="perf visual"
LIST=${*:-$ALL}
if [ -z "$JOBS" ]; then JOBS=$(( $(nproc 2>/dev/null || echo 2) - 1 )); [ "$JOBS" -lt 1 ] && JOBS=1; [ "$JOBS" -gt 4 ] && JOBS=4; fi
RES=$(mktemp -d)
one(){ if python3 "tests/test_$1.py" >"/tmp/test_$1.log" 2>&1; then echo OK >"$RES/$1"; else echo ECHEC >"$RES/$1"; fi; }
PAR="";SER=""
for t in $LIST; do case " $SOLO " in *" $t "*) SER="$SER $t";; *) PAR="$PAR $t";; esac; done
start=$(date +%s)
# parallèle : xargs lance « sh -c » avec la fonction recopiée (les fonctions ne passent pas à xargs)
export RES
echo $PAR | tr ' ' '\n' | grep -v '^$' | xargs -P "$JOBS" -I{} sh -c 'if python3 "tests/test_{}.py" >"/tmp/test_{}.log" 2>&1; then echo OK >"$RES/{}"; else echo ECHEC >"$RES/{}"; fi; printf "."'
echo
for t in $SER; do one "$t"; done
# nouvel essai, seul, de ce qui a échoué
for t in $LIST; do if [ "$(cat "$RES/$t" 2>/dev/null)" != OK ]; then cp "/tmp/test_$t.log" "/tmp/test_$t.1.log" 2>/dev/null; one "$t"; [ "$(cat "$RES/$t")" = OK ] && echo INSTABLE >"$RES/$t"; fi; done
fail=0;nok=0;nin=0;nko=0
for t in $LIST; do r=$(cat "$RES/$t" 2>/dev/null || echo ECHEC); printf '%-16s%s\n' "$t" "$r"
  case $r in OK) nok=$((nok+1));; INSTABLE) nin=$((nin+1)); echo "   (1er essai : /tmp/test_$t.1.log)";; *) nko=$((nko+1)); fail=1; tail -5 "/tmp/test_$t.log";; esac; done
echo "Bilan : $nok OK, $nin instable(s), $nko échec(s) en $(( $(date +%s) - start )) s avec $JOBS tests à la fois."
rm -rf "$RES"
exit $fail
