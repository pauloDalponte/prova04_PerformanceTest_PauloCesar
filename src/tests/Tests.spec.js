import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export const getContactsDuration = new Trend('get_contacts', true);
export const contentOK = new Rate('content_OK');

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<5700'],
    http_req_failed: ['rate<0.12'],
  },
  stages: [
    { duration: '60s', target: 10 },
    { duration: '60s', target: 50 },
    { duration: '60s', target: 100 },
    { duration: '60s', target: 150 },
    { duration: '60s', target: 300 },
  ],
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, {
      indent: ' ',
      enableColors: true,
    }),
  };
}

export default function () {
  const url = 'https://fakestoreapi.com/products';

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.get(url, params);

  getContactsDuration.add(response.timings.duration);

  contentOK.add(response.status === 200);

  check(response, {
    'GET Products - Status 200': (r) => r.status === 200,
  });

  // Log para depuração
  if (response.status !== 200) {
    console.log(`Status retornado: ${response.status}`);
    console.log(`Resposta: ${response.body}`);
  }
}