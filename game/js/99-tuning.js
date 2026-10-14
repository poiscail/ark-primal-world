/* Réglage d'équilibrage v0.11 : compense le boost d'orbes (mesuré par simulation, voir tests/test_balance*.py) */
const TUNE={h:1.3,a:1.15};
const _Ht=H,_At=A;H=n=>Math.round(_Ht(n)*TUNE.h);A=n=>_At(n)*TUNE.a;
