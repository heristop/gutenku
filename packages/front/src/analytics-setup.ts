const token = import.meta.env.VITE_BEAM_TOKEN;

if (token) {
    const script = document.createElement('script');
    script.src = 'https://beamanalytics.b-cdn.net/beam.min.js';
    script.setAttribute('data-token', token);
    script.async = true;

    document.head.appendChild(script);
}
