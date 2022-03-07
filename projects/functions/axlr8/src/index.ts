import { SendAPI } from './util/helpers';

const sender = new SendAPI();
const resp = sender.callAPI({
  rptId: 179,
  rptFilters: [
    {
      filter: 'ES_SESSION_START_DATE_ONLY',
      operator: 'between',
      values: '28/08/2021',
    },
    {
      filter: 'ES_SESSION_START_DATE_ONLY',
      operator: '>=',
      values: '28/08/2021',
    },
  ],
});

console.log(resp);
