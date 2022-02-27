/**
 * Project: @eventiva/siacheck
 * File: errors.ts
 * Path: \src\util\errors.ts
 * Created Date: Saturday, February 26th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Sat Feb 26 2022
 * Modified By: Jonathan Stevens
 * Current Version: 2.0.0
 * -----
 * Copyright (c) 2022 Resnovas - All Rights Reserved
 * -----
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 *
 * This program has been provided under confidence of the copyright holder and is
 * licensed for copying, distribution and modification under the terms of
 * the GNU General Public License v3.0 or later (GPL-3.0+) published as the License,
 * or (at your option) any later version of this license.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License v3.0 or later for more details.
 *
 * You should have received a copy of the GNU General Public License v3.0 or later
 * along with this program. If not, please write to: jonathan@resnovas.com ,
 * or see http://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

export type ErrorDetails = {
  [x: string]: { type: ErrorType; message: string; [x: string]: any };
};

export class ServerError extends Error {
  constructor(
    public status: ErrorCode,
    public message: string,
    public details: ErrorDetails
  ) {
    super(message);
  }
}

export enum ErrorType {
  VALIDATION = 'Validation Failed',
  STORAGE_EXIST = 'Storage Existance',
  SIA_CONTENT = 'SIA Search Page Unavailable',
  PICTURE_SAVE = 'Saving Picture to storage failed',
}

export enum ErrorCode {
  'Continue' = 100,
  'Switching Protocol' = 101,
  'OK' = 200,
  'Created' = 201,
  'Accepted' = 202,
  'Non-Authoritative Information' = 203,
  'No Content' = 204,
  'Reset Content' = 205,
  'Partial Content' = 206,
  'Multi-Status' = 207,
  'Already Reported' = 208,
  'IM Used' = 226,
  'Multiple Choices' = 300,
  'Moved Permanently' = 301,
  'Found' = 302,
  'See Other' = 303,
  'Not Modified' = 304,
  'Use Proxy' = 305,
  'Temporary Redirect' = 307,
  'Permanent Redirect' = 308,
  'Validation Failed' = 400,
  'Bad Request' = 400,
  'Unauthorized' = 401,
  'Payment Required' = 402,
  'Forbidden' = 403,
  'Not Found' = 404,
  'Method Not Allowed' = 405,
  'Not Acceptable' = 406,
  'Proxy Authentication Required' = 407,
  'Request Timeout' = 408,
  'Confict' = 409,
  'Gone' = 410,
  'Length Required' = 411,
  'Precondition Failed' = 412,
  'Request Entity Too Large' = 413,
  'Request-URI Too Long' = 414,
  'Unsupported Media Type' = 415,
  'Requested Range Not Satisfiable' = 416,
  'Expectation Failed' = 417,
  "I'm a teapot" = 418,
  'Unprocessable Entity' = 422,
  'Locked' = 423,
  'Failed Dependency' = 424,
  'Upgrade Required' = 426,
  'Precondition Required' = 428,
  'Too Many Requests' = 429,
  'Request header fields too large' = 431,
  'Internal Server Error' = 500,
  'Not Implemented' = 501,
  'Bad Gateway' = 502,
  'Service Unavailable' = 503,
  'Gateway Timeout' = 504,
  'HTTP Version Not Supported' = 505,
  'Variant Also Negotiates' = 506,
  'Insufficient Storage' = 507,
  'Loop Detected' = 508,
  'Not Extended' = 510,
  'Network Authentication Required' = 511,
}

export const ErrorMessages: { [x: number]: string } = {
  100: 'Continue',
  101: 'Switching Protocol',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  208: 'Already Reported',
  226: 'IM Used',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Confict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request header fields too large',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};
