async function getCoords() {
  const kecamatans = ['Keruak', 'Jerowaru', 'Sakra', 'Sakra Barat', 'Sakra Timur', 'Terara', 'Montong Gading', 'Sikur', 'Masbagik', 'Pringgasela', 'Sukamulia', 'Suralaga', 'Selong', 'Labuhan Haji', 'Pringgabaya', 'Suela', 'Aikmel', 'Wanasaba', 'Sembalun', 'Sambelia', 'Lenek'];
  const results = {};
  for (const k of kecamatans) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(k + ' Lombok Timur')}&format=json`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Koramil-App/1.0 (admin@example.com)' } });
      const data = await res.json();
      if (data && data.length > 0) {
        results[k] = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      } else {
        results[k] = null;
      }
    } catch(e) {
      results[k] = e.message;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(JSON.stringify(results, null, 2));
}
getCoords();
