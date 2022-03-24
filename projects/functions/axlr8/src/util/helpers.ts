import crypto from 'crypto';
// import { filter } from './reports';
import axios from 'axios';

export interface reportResult {
  result: boolean,
  success: { [x: string]: string|number }[] | false,
  error: null | string,
  debug: postDataString
}
export interface postDataString {
    rptId: number;
    rptFilters: {
      filter: string;
      operator: string;
      values: string;
    }[];
  }

export interface postData {
    rptId: number;
    rptFilters: rptFilters[];
  }

export interface rptFilters {
      filter: string;
      operator: string;
      values: string;
    }

export class SendAPI {
  private func = 'GetReportData';

  public async callAPI(url: string, postdata: postData, api_user: string, api_user_pw: string): Promise<reportResult> {
    const timestamp = new Date().getTime().toString();

    const form  = new URLSearchParams();
    form.append('func', this.func);
    form.append('reqData', JSON.stringify(postdata));
    form.append('username', api_user);
    form.append('timestamp', timestamp);
    form.append(
      'hash',
      this.getHash(
        [
          url,
          api_user,
          this.func,
          JSON.stringify(postdata),
          timestamp,
        ],
      api_user_pw
      )
    )
    const result = await axios.post(url, form, {
      "timeout": 100000,
      "headers": {
        'Accept': '*.*',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).catch(err => {
      console.log(err)
      throw err
    })
    // console.log(result.status)
    return result.data as reportResult
  }

  // use array to generate hash
  private getHash(
    parts: any[],
    passcode: string
  ): string {
    return crypto.createHmac('sha256', Buffer.from(passcode, 'utf-8')).update(parts.join("")).digest().toString('base64')
  }
}
