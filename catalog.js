/* Approved card photography and use cases. Original equipment photos stay on detail pages. */
window.energyCatalog = {
  'sunwoda-atrix-max-plus': {apps:['residential','commercial'], image:'catalog/sunwoda-atrix-max-plus.webp'},
  'kstar-blue-s-bluepulse': {apps:['residential','commercial','industrial'], image:'catalog/kstar-blue-s-bluepulse.webp'},
  'tcl-blueark-x1': {apps:['residential','commercial'], image:'catalog/tcl-blueark-x1.webp'},
  'leapton-n-type-topcon-bifacial': {apps:['residential','commercial','industrial'], image:'catalog/leapton-n-type-topcon-bifacial.webp'},
  'solaredge-home-hub-optimizer': {apps:['residential','commercial'], image:'catalog/solaredge-home-hub-optimizer.webp'},
  'solplanet-asw-ht-series': {apps:['commercial','industrial'], image:'catalog/solplanet-asw-ht-series.webp'},
};
window.energyCMS = async (table, query) => {
  const url = 'https://cocmcinqcywqrqdxwdof.supabase.co';
  const key = 'sb_publishable_oEeXvdWPNAt0wmUDuvACfg_tDlTxkhu';
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {headers:{apikey:key},signal:AbortSignal.timeout(12000)});
  if(!response.ok) throw new Error(`${table}: HTTP ${response.status}`);
  return response.json();
};
