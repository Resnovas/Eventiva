import crypto from 'crypto';
import { filter } from './reports';

export interface postData {
    rptId: number;
    rptFilters: rptFilters;
  }

export interface rptFilters {
      filter: filter;
      operator: string;
      values: string;
    }[]

export class SendAPI {
  private func = 'GetReportData';


  public callAPI(url: string, postdata: postData, api_user: string, api_user_pw: string) {
    const timestamp = new Date().toUTCString();

    const form = new FormData();
    form.append('func', this.func);
    form.append('username', api_user);
    form.append('reqData', JSON.stringify(postdata));
    form.append('timestamp', timestamp);
    form.append(
      'hash',
      this.getHash(
        {
          url: url,
          username: api_user,
          func: this.func,
          reqData: postdata,
          timestamp,
        },
        api_user_pw
      )
    );
  }

  // use array to generate hash
  private getHash(
    parts: { url: any; username: any; func: any; reqData: any; timestamp: any },
    passcode: string
  ): string {
    const hash = crypto.createHmac('sha256', passcode);
    hash.update(
      parts.url + parts.username + parts.func + parts.reqData + parts.timestamp
    );
    return hash.digest('base64');
  }
}
